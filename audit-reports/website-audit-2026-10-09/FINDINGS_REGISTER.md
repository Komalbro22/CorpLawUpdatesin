# Comprehensive Findings Register
**Target Website:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Audit Execution Date:** 09 October 2026  
**Standards Applied:** OWASP Top 10, WCAG 2.2 AA, WAI-ARIA 1.2, Google Search Essentials, Schema.org, Google Publisher Policies  

---

## Index of Findings

| Finding ID | Category | Severity | Confidence | Title |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Security / Caching | **CRITICAL** | Confirmed | Unsafe Global API Public Caching Leaking POST & Private Data |
| **SEC-002** | Security / Injection | **HIGH** | Confirmed | HTML Injection / Email XSS in Contact Form Submission |
| **SEC-003** | Security / Database | **HIGH** | Confirmed | PostgreSQL RPC `increment_views` Lacks `search_path` & Range Bounds |
| **SEC-004** | Security / Dependencies | **HIGH** | Confirmed | 31 npm Package Vulnerabilities (1 Critical, 7 High) |
| **A11Y-001** | Accessibility / UX | **HIGH** | Confirmed | Duplicate `GlobalSearch` Mounts Causing Conflicting Focus Traps |
| **A11Y-002** | Accessibility / ARIA | **MEDIUM** | Confirmed | W3C ARIA Orphan Reference on Collapsed Categories Menu (`aria-controls`) |
| **A11Y-003** | Accessibility / WCAG | **MEDIUM** | Confirmed | WCAG 2.5.3 (Label in Name) Failure in Article Font Size Controls |
| **A11Y-004** | Accessibility / Forms | **MEDIUM** | Confirmed | Unlabeled Form Inputs & Checkboxes in Interactive Compliance Tools |
| **A11Y-005** | Accessibility / HTML | **LOW** | Confirmed | Malformed List Nesting (`<ol>` / `<ul>`) on Statutory Update Pages |
| **ADS-001** | AdSense / Compliance | **HIGH** | Confirmed | Absence of IAB TCF v2.2 Certified CMP for EEA/UK Ad Serving |
| **SEO-001** | Technical SEO / Schema | **HIGH** | Confirmed | Dangling Schema.org Reference (`isPartOf: #website`) |
| **SEO-002** | Technical SEO / Schema | **MEDIUM** | Confirmed | Anonymous Multi-Page Organization & Person Entities Lacking `@id` |
| **SEO-003** | Technical SEO / Schema | **MEDIUM** | Confirmed | Schema Entity Property Conflict (`logo` discrepancy on `/rbi/repo-rate`) |
| **SEO-004** | Content / Database | **MEDIUM** | Confirmed | NULL Category Metadata on Specific Regulatory Updates |
| **PERF-001** | Performance / CSS | **MEDIUM** | Confirmed | Oversized CSS Chunk (~454 KB Uncompressed) |
| **PERF-002** | Performance / Core Web Vitals | **MEDIUM** | Confirmed | Above-Fold Hero Images Configured with `loading="lazy"` |
| **PERF-003** | Performance / Caching | **LOW** | Confirmed | Missing ETag / Last-Modified Validators on HTML Pages (98/100) |

---

## Detailed Findings

### SEC-001: Unsafe Global API Public Caching Leaking POST & Private Data
- **Category:** Application Security & Infrastructure / Caching
- **Severity:** **CRITICAL**
- **Confidence:** Confirmed
- **Evidence:**
  - Source Code: `next.config.js` lines 91–98:
    ```javascript
    {
      source: '/api/((?!admin).*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
        },
      ],
    }
    ```
  - Empirical Live Test: `curl -i -X POST https://www.corplawupdates.in/api/subscribe -H "Content-Type: application/json" -d "{}"`
    Returned:
    ```http
    HTTP/1.1 400 Bad Request
    Cache-Control: public, max-age=300, s-maxage=1800, stale-while-revalidate=86400
    ```
- **Affected URLs:** All API endpoints excluding `/api/admin/*` (including `/api/subscribe`, `/api/contact`, `/api/newsletter/*`, `/api/cron/*`, `/api/roc/*`, `/api/web-push/*`).
- **Affected Source Files:** `next.config.js` (lines 91–98)
- **Reproduction Steps:** Execute a `POST` request to any non-admin API endpoint and inspect the `Cache-Control` header on the response.
- **Why It Matters:** Under Next.js static headers, route headers match irrespective of HTTP method. Injecting `public, s-maxage=1800` causes Cloudflare and intermediate forward proxies to cache responses, potentially caching and serving POST results, subscriber error states, or private user responses across distinct clients.
- **Recommended Correction:** Narrow the header match strictly to idempotent read-only GET routes, or set `no-store, private` at the top level and explicitly declare caching in individual `GET` route handlers:
  ```javascript
  {
    source: '/api/:path*',
    headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' }]
  }
  ```
- **Regression Risk:** Low. Only cacheable public GET endpoints will need explicit response header configuration.
- **Verification Method:** Curl POST and GET requests against all API endpoints and verify that mutating routes return `no-store`.
- **Human Decision Required:** No.

---

### SEC-002: HTML Injection / Email XSS in Contact Form Submission
- **Category:** Application Security / Injection (OWASP A03)
- **Severity:** **HIGH**
- **Confidence:** Confirmed
- **Evidence:**
  - Source Code: `app/api/contact/route.ts` lines 80–99:
    ```typescript
    const safeName = String(name).trim().slice(0, 200)
    const safeSubject = String(subject).trim().slice(0, 200)
    const safeMessage = String(message).trim().slice(0, 5000)

    const sendRes = await sendEmail({
      ...
      html: `<div style="font-family:sans-serif;line-height:1.6;color:#333;">
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;">${safeMessage}</p>
      </div>`,
    })
    ```
- **Affected URLs:** `https://www.corplawupdates.in/contact`, `https://www.corplawupdates.in/api/contact`
- **Affected Source Files:** `app/api/contact/route.ts`
- **Reproduction Steps:** Submit a contact inquiry containing HTML tags such as `<img src="https://attacker.com/log" />` or `<b>bold</b>`. The payload is directly rendered as HTML in the email received by administrators.
- **Why It Matters:** Enables an attacker to send phishing payloads, bypass email filters, execute CSS/HTML injection, or exfiltrate client information when the administrator views the message in an HTML-capable email client.
- **Recommended Correction:** HTML-entity-encode all user inputs before interpolating into HTML, or use `sanitize-html` (already present in `package.json`):
  ```typescript
  import sanitizeHtml from 'sanitize-html'
  const escapeHtml = (str: string) => str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c))
  ```
- **Regression Risk:** None.
- **Verification Method:** Submit `<script>` and `<h1>` payloads and verify they render as literal plain text in email logs.
- **Human Decision Required:** No.

---

### SEC-003: PostgreSQL RPC Function `increment_views` Lacks `search_path` & Range Bounds
- **Category:** Database Security / Stored Procedures (OWASP A01 / A05)
- **Severity:** **HIGH**
- **Confidence:** Confirmed
- **Evidence:**
  - Source Code: `supabase/migrations/20260701000000_add_views_rpc.sql` lines 4–11:
    ```sql
    CREATE OR REPLACE FUNCTION increment_views(article_slug text, increment_by int DEFAULT 1)
    RETURNS void AS $$
    BEGIN
      UPDATE updates
      SET views = COALESCE(views, 0) + increment_by
      WHERE slug = article_slug;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
- **Affected URLs:** Supabase PostgREST API `/rest/v1/rpc/increment_views`
- **Affected Source Files:** `supabase/migrations/20260701000000_add_views_rpc.sql`
- **Reproduction Steps:** Execute a PostgREST RPC call with negative or arbitrarily large `increment_by` values.
- **Why It Matters:**
  1. `SECURITY DEFINER` functions that omit `SET search_path = public, pg_temp;` are vulnerable to search-path hijacking in PostgreSQL.
  2. Public `anon` callers can invoke this RPC directly with `increment_by = -10000` or `10000000` to corrupt article view counters.
- **Recommended Correction:** Re-create the function with an explicit `search_path`, strict input validation, and restricted permissions:
  ```sql
  CREATE OR REPLACE FUNCTION increment_views(article_slug text, increment_by int DEFAULT 1)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
  AS $$
  BEGIN
    IF increment_by <= 0 OR increment_by > 500 THEN
      RAISE EXCEPTION 'Invalid increment value';
    END IF;
    UPDATE updates
    SET views = COALESCE(views, 0) + increment_by
    WHERE slug = article_slug;
  END;
  $$;
  REVOKE EXECUTE ON FUNCTION increment_views FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION increment_views TO service_role;
  ```
- **Regression Risk:** Low, provided internal server calls use the service role or authenticated client.
- **Verification Method:** Test RPC invocation via PostgREST with negative numbers and verify HTTP 400/403 rejection.
- **Human Decision Required:** No.

---

### SEC-004: 31 npm Package Vulnerabilities (1 Critical, 7 High)
- **Category:** Dependency Security / Supply Chain (OWASP A06)
- **Severity:** **HIGH**
- **Confidence:** Confirmed
- **Evidence:**
  - `npm audit` report: 31 vulnerabilities detected in lockfile:
    - **1 Critical:** `handlebars` (4.0.0 - 4.7.9, Prototype Pollution / Arbitrary Code Execution)
    - **7 High:** `brace-expansion`, `braces`, `browserslist`
    - **23 Moderate:** `postcss-selector-parser`, `sprintf-js`, `js-yaml`
  - Production runtime (`npm audit --omit=dev`): 3 moderate vulnerabilities in `sprintf-js` (via `mammoth@1.13.0` dependency tree).
- **Affected URLs:** Site-wide build system and server routes handling Word document parsing (`app/api/admin/articles/upload-docx/route.ts`).
- **Affected Source Files:** `package.json`, `package-lock.json`
- **Reproduction Steps:** Run `npm audit`.
- **Why It Matters:** Outdated dependencies with known CVEs increase the risk of server compromise or build pipeline contamination.
- **Recommended Correction:** Run targeted package updates (`npm update`) and apply overrides for deeply nested sub-dependencies.
- **Regression Risk:** Medium (requires running Jest test suites after dependency upgrades).
- **Verification Method:** Run `npm audit` and confirm 0 critical and high vulnerabilities.
- **Human Decision Required:** Yes (selecting update strategies for legacy peer dependencies).

---

### A11Y-001: Duplicate `GlobalSearch` Mounts Causing Conflicting Focus Traps
- **Category:** Accessibility & Usability / Modal Dialogs
- **Severity:** **HIGH**
- **Confidence:** Confirmed
- **Evidence:**
  - Source Code: `components/Navbar.tsx` lines 245 & 253:
    ```tsx
    {/* Desktop header controls */}
    <div className="ml-2 flex items-center gap-2">
      <GlobalSearch />
      ...
    </div>
    {/* Mobile header controls */}
    <div className="flex items-center gap-2 md:hidden">
      <GlobalSearch />
      ...
    </div>
    ```
  - Both instances mount client-side and register global `document.addEventListener('keydown', ...)` listeners for `Ctrl+K`.
- **Affected URLs:** All public pages (100% of URLs rendering `Navbar`).
- **Affected Source Files:** `components/Navbar.tsx`, `components/GlobalSearch.tsx`
- **Reproduction Steps:** Load any page on desktop or mobile. Press `Ctrl+K`. Inspect the DOM: two identical search dialog overlays are opened simultaneously.
- **Why It Matters:** Users navigating via keyboard or screen readers experience conflicting focus traps, dual backdrop rendering, and broken tab ordering.
- **Recommended Correction:** Lift `<GlobalSearch />` dialog state to a single top-level context or render only trigger buttons in `Navbar`, with a single global dialog instance in `app/layout.tsx`.
- **Regression Risk:** Low.
- **Verification Method:** Press `Ctrl+K` and verify exactly one modal dialog exists in the DOM.
- **Human Decision Required:** No.

---

### A11Y-002: W3C ARIA Orphan Reference on Collapsed Categories Menu (`aria-controls`)
- **Category:** Accessibility / ARIA 1.2 Specifications
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - Source Code: `components/Navbar.tsx` lines 189 & 208:
    ```tsx
    <button
      aria-expanded={categoriesOpen}
      aria-controls="category-dropdown-menu"
      ...
    >
      Categories
    </button>
    {categoriesOpen && (
      <div id="category-dropdown-menu" role="menu"> ... </div>
    )}
    ```
  - SquirrelScan finding: `a11y/duplicate-id-aria` / orphan reference.
- **Affected URLs:** All public pages (100% of URLs rendering `Navbar`).
- **Affected Source Files:** `components/Navbar.tsx`
- **Reproduction Steps:** Load homepage and inspect `button[aria-controls="category-dropdown-menu"]`. Query `document.getElementById('category-dropdown-menu')` -> returns `null`.
- **Why It Matters:** Screen readers announce controls pointing to nonexistent document fragments, violating W3C WAI-ARIA 1.2.
- **Recommended Correction:** Only set `aria-controls` when the menu is open, or keep the dropdown container in the DOM with `hidden` / `display: none`.
- **Regression Risk:** Low.
- **Verification Method:** Inspect element in DevTools on page load; confirm no orphan ID references exist.
- **Human Decision Required:** No.

---

### A11Y-003: WCAG 2.5.3 (Label in Name) Failure in Article Font Size Controls
- **Category:** Accessibility / WCAG 2.5.3 Level A Conformance
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - Source Code: `components/FontSizeToggle.tsx` lines 54–81:
    - Visible text: `"A-"`, `"A"`, `"A+"`
    - `aria-label`: `"Small font size"`, `"Medium font size"`, `"Large font size"`
  - SquirrelScan finding: `a11y/label-content-name-mismatch` across all 70+ crawled article pages.
- **Affected URLs:** All 213 regulatory update pages (`/updates/*`).
- **Affected Source Files:** `components/FontSizeToggle.tsx`
- **Reproduction Steps:** Use speech input software (e.g., Dragon or Voice Control) and say "Click A plus". The command fails because the accessible name is "Large font size".
- **Why It Matters:** Direct violation of WCAG 2.1 / 2.2 Success Criterion 2.5.3 Level A (Label in Name).
- **Recommended Correction:** Include the visible label text at the beginning of the `aria-label`:
  ```typescript
  const buttonLabels: Record<FontSize, string> = {
    sm: 'A- (Small font size)',
    md: 'A (Medium font size)',
    lg: 'A+ (Large font size)',
  }
  ```
- **Regression Risk:** None.
- **Verification Method:** Run automated a11y scanner; confirm zero label-in-name mismatch errors.
- **Human Decision Required:** No.

---

### A11Y-004: Unlabeled Form Inputs & Checkboxes in Interactive Compliance Tools
- **Category:** Accessibility / Form Labeling (WCAG 1.3.1 / 3.3.2)
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - `app/tools/cin-decoder/page.tsx` line 170: CIN `<input>` has only `placeholder`, no `<label>`, `id`, or `aria-label`.
  - `app/tools/roc-tracker/page.tsx` lines 1071–1250: 18 toggle checkboxes rendered alongside `<p>` tags without `id`, `<label htmlFor>`, or `aria-label`.
  - SquirrelScan findings: `a11y/form-labels`, `a11y/aria-toggle-field-name`.
- **Affected URLs:** `https://www.corplawupdates.in/tools/cin-decoder`, `https://www.corplawupdates.in/tools/roc-tracker`, `https://www.corplawupdates.in/tools/fee-calculator`
- **Affected Source Files:** `app/tools/cin-decoder/page.tsx`, `app/tools/roc-tracker/page.tsx`
- **Reproduction Steps:** Navigate tools using a screen reader. Form inputs are announced as "unlabeled text field" and "unlabeled checkbox".
- **Why It Matters:** Users with visual impairments cannot determine what data each input requires.
- **Recommended Correction:** Wrap inputs with `<label>` elements or add explicit `id` + `htmlFor` pairings and `aria-label` attributes.
- **Regression Risk:** Low.
- **Verification Method:** Run accessibility tree inspection; verify every form control possesses an accessible name.
- **Human Decision Required:** No.

---

### A11Y-005: Malformed List Nesting (`<ol>` / `<ul>`) on Statutory Update Pages
- **Category:** Accessibility / HTML Semantics (WCAG 1.3.1)
- **Severity:** **LOW**
- **Confidence:** Confirmed
- **Evidence:**
  - SquirrelScan finding: `a11y/list-structure` on `https://www.corplawupdates.in/updates/epfo-wage-ceiling-rs-25000-cabinet-approval-2026`.
- **Affected URLs:** `updates/epfo-wage-ceiling-rs-25000-cabinet-approval-2026`
- **Affected Source Files:** Article markdown/HTML content in database.
- **Reproduction Steps:** Inspect HTML DOM of the article; `<ul>` or `<ol>` elements contain direct children other than `<li>`.
- **Why It Matters:** Screen readers fail to announce the proper item count and list hierarchy.
- **Recommended Correction:** Sanitize and format list markup in CMS editor to ensure valid `<ul><li>...</li></ul>` structure.
- **Regression Risk:** Low.
- **Verification Method:** Re-run validator on target URL.
- **Human Decision Required:** No.

---

### ADS-001: Absence of IAB TCF v2.3 Compliant Certified CMP for EEA/UK Ad Serving
- **Category:** Google AdSense Compliance / Privacy & Consent
- **Severity:** **HIGH**
- **Confidence:** Confirmed
- **Evidence:**
  - Source Code: `app/layout.tsx` injects Google AdSense script globally (`ca-pub-8404756575471756`).
  - Source Code: `components/CookieConsentBanner.tsx` uses custom localStorage logic and Google Consent Mode v2.
  - Requirement: Under Google's EU User Consent Policy and Google Publisher Partner Program requirements, publishers serving ads to users in the EEA and UK must integrate a Google-certified CMP implementing the current IAB Europe TCF v2.3 specification.
- **Affected URLs:** All public pages.
- **Affected Source Files:** `components/CookieConsentBanner.tsx`, `app/layout.tsx`
- **Reproduction Steps:** Access site with an EEA/UK IP address; verify the absence of `window.__tcfapi`.
- **Why It Matters:** AdSense will automatically withhold monetization or serve non-personalized ads to European/UK traffic, and generate policy warnings in Google AdSense Policy Center.
- **Recommended Correction:** Site owner should enable Google's native European regulations CMP in the AdSense Publisher Console under **Privacy & messaging -> European regulations** (linking `https://www.corplawupdates.in/privacy-policy`), or deploy an IAB TCF v2.3 certified commercial CMP.
- **Regression Risk:** Low.
- **Verification Method:** Inspect console in EEA viewport for active `__tcfapi` endpoint.
- **Human Decision Required:** Yes (site owner activating European regulations message in AdSense console).

---

### SEO-001: Dangling Schema.org Reference (`isPartOf: #website`)
- **Category:** Technical SEO / Structured Data
- **Severity:** **HIGH**
- **Confidence:** Confirmed
- **Evidence:**
  - SquirrelScan finding: `schema/entity-dangling` on `https://www.corplawupdates.in/documents/board-resolution-for-dividend-declaration`.
  - JSON-LD points to `@id: "https://www.corplawupdates.in/#website"`, but the page's graph does not declare that WebSite entity.
- **Affected URLs:** `https://www.corplawupdates.in/documents/board-resolution-for-dividend-declaration` (and other document templates sharing the layout).
- **Affected Source Files:** `app/documents/[slug]/page.tsx`
- **Reproduction Steps:** Inspect JSON-LD on target page using Google Rich Results Test; observer resolves an undefined entity node.
- **Why It Matters:** Search engine graph indexers encounter broken node pointers, degrading semantic authority and entity reconciliation.
- **Recommended Correction:** Ensure the `WebSite` node is defined in the same `@graph` array or emit a self-contained entity graph.
- **Regression Risk:** Low.
- **Verification Method:** Validate with Schema.org validator or Google Rich Results Test.
- **Human Decision Required:** No.

---

### SEO-002: Anonymous Multi-Page Organization & Person Entities Lacking `@id`
- **Category:** Technical SEO / Knowledge Graph
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - SquirrelScan finding: `schema/entity-identity` across 100 crawled pages.
  - Organization (`CorpLawUpdates.in`) and Person (`Komalpreet Singh`) entities are repeatedly emitted anonymously without persistent URI `@id`s.
- **Affected URLs:** 100% of crawled pages (100 surface crawl, 477 site-wide).
- **Affected Source Files:** `components/JsonLd.tsx`, `lib/schema.ts`
- **Reproduction Steps:** Inspect JSON-LD on any article; Organization has no `@id` field.
- **Why It Matters:** Search engines treat each occurrence as a separate instance rather than unifying it into an authoritative site-wide entity.
- **Recommended Correction:** Standardize persistent URIs:
  - Organization: `@id: "https://www.corplawupdates.in/#organization"`
  - Author: `@id: "https://www.corplawupdates.in/author/komalpreet-singh#author"`
  - WebSite: `@id: "https://www.corplawupdates.in/#website"`
- **Regression Risk:** Low.
- **Verification Method:** Run structured data extractor; verify all entity instances point to matching `@id`s.
- **Human Decision Required:** No.

---

### SEO-003: Schema Entity Property Conflict (`logo` discrepancy on `/rbi/repo-rate`)
- **Category:** Technical SEO / Structured Data
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - SquirrelScan finding: `schema/entity-conflicts`.
  - `/rbi/repo-rate` emits `logo: "https://www.corplawupdates.in/icon-512.png"`, whereas the remaining 100 pages emit `logo: "https://www.corplawupdates.in/icon.png"`.
- **Affected URLs:** `https://www.corplawupdates.in/rbi/repo-rate`
- **Affected Source Files:** `app/rbi/repo-rate/page.tsx`
- **Reproduction Steps:** Compare JSON-LD logo output between homepage and `/rbi/repo-rate`.
- **Why It Matters:** Conflicting metadata values across pages confuse search engine entity resolvers.
- **Recommended Correction:** Align `/rbi/repo-rate` to use the canonical `icon.png` (or standardize `icon-512.png` everywhere).
- **Regression Risk:** Low.
- **Verification Method:** Verify JSON-LD output consistency.
- **Human Decision Required:** No.

---

### SEO-004: NULL Category Metadata on Specific Regulatory Updates
- **Category:** Content Integrity / CMS Metadata
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - Direct Database Query: Two articles have `category: null` in the Supabase `updates` table:
    1. `how-to-file-a-trademark-in-india-a-practical-guide-for-startups` (also has typo double space in title: `"Practical  Guide"`)
    2. `cabinet-approves-10000-crore-sme-growth-fund-2026`
- **Affected URLs:**
  - `https://www.corplawupdates.in/updates/how-to-file-a-trademark-in-india-a-practical-guide-for-startups`
  - `https://www.corplawupdates.in/updates/cabinet-approves-10000-crore-sme-growth-fund-2026`
- **Affected Source Files:** Database `updates` table records.
- **Reproduction Steps:** Query `updates` table where `category IS NULL`.
- **Why It Matters:** Articles with null categories fail to appear in category filter listings, breadcrumbs display incomplete hierarchies, and dynamic OG image generator fallback may default to generic themes.
- **Recommended Correction:** Update database records: assign `category = 'ipr'` and `category = 'msme'`, and fix the title double-space.
- **Regression Risk:** None.
- **Verification Method:** Query DB and confirm 0 records with `category IS NULL`.
- **Human Decision Required:** Yes (confirming preferred category slugs).

---

### PERF-001: Oversized CSS Chunk (~454 KB Uncompressed)
- **Category:** Web Performance / Asset Delivery
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - SquirrelScan finding: `perf/css-file-size` (454.0 KB uncompressed CSS chunk `3a8dflhddbejk.css`).
  - Next.js build output includes complete Tailwind typography, react-md-editor styles, and custom animation classes in a single global stylesheet.
- **Affected URLs:** All public pages (100% of URLs).
- **Affected Source Files:** `app/globals.css`, `postcss.config.mjs`, `package.json`
- **Reproduction Steps:** Load homepage and inspect Network tab CSS file size.
- **Why It Matters:** Heavy CSS delays the First Contentful Paint (FCP) and contributes to render-blocking latency on mobile connections.
- **Recommended Correction:** Split CMS markdown editor CSS so it is only loaded on admin routes (`app/admin/*`), and ensure Tailwind 4 purge paths exclude unused packages.
- **Regression Risk:** Medium (requires visual regression testing of article typography).
- **Verification Method:** Inspect production CSS chunk size after build; target <150 KB.
- **Human Decision Required:** No.

---

### PERF-002: Above-Fold Hero Images Configured with `loading="lazy"`
- **Category:** Web Performance / Core Web Vitals (LCP)
- **Severity:** **MEDIUM**
- **Confidence:** Confirmed
- **Evidence:**
  - SquirrelScan finding: `perf/lazy-above-fold`.
  - Homepage and author page hero images served via `/api/image-proxy?...` include `loading="lazy"`.
- **Affected URLs:** `https://www.corplawupdates.in/`, `https://www.corplawupdates.in/author/komalpreet-singh`
- **Affected Source Files:** `components/FeaturedArticle.tsx`, `components/HeroBanner.tsx`, `app/page.tsx`
- **Reproduction Steps:** Inspect the hero article image DOM node on the homepage. Notice `loading="lazy"`.
- **Why It Matters:** Browsers delay downloading lazy-loaded images until layout is computed, inflating Largest Contentful Paint (LCP) by 200–800 ms.
- **Recommended Correction:** Remove `loading="lazy"`, add `priority` or `fetchpriority="high"` on hero images.
- **Regression Risk:** None.
- **Verification Method:** Run Lighthouse / Chrome DevTools performance trace; verify image is requested before layout calculation.
- **Human Decision Required:** No.

---

### PERF-003: Missing ETag / Last-Modified Validators on HTML Pages (98/100)
- **Category:** Web Performance / HTTP Caching
- **Severity:** **LOW**
- **Confidence:** Confirmed
- **Evidence:**
  - SquirrelScan finding: `perf/bad-caching` (98/100 crawled pages lack ETag or Last-Modified validators).
- **Affected URLs:** All ISR and static routes.
- **Affected Source Files:** `next.config.js`
- **Reproduction Steps:** Curl HTML pages and verify the absence of `ETag` or `Last-Modified` headers.
- **Why It Matters:** Repeat visits cannot perform lightweight 304 Not Modified conditional requests.
- **Recommended Correction:** Configure Next.js `generateEtags: true` (default in standard builds) or pass `Last-Modified` via Edge CDN cache rules.
- **Regression Risk:** Low.
- **Verification Method:** Send `If-None-Match` request; receive `304 Not Modified`.
- **Human Decision Required:** No.
