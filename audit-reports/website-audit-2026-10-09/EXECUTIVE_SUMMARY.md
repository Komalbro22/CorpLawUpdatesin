# Executive Summary: Full-Stack Website & Repository Audit
**Target Website:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Audit Head Date:** 09 October 2026  
**Audit Scope:** Production Web Application, Complete Codebase Repository, 477 URLs, Database Records, and Infrastructure  
**Auditor:** Specialized Multidisciplinary Quality, Security, and Compliance Audit Team  

---

## 1. Overall Assessment & Health Scorecard

CorpLawUpdates.in is an exceptionally substantive, high-value corporate law and regulatory intelligence portal. It features **213 in-depth statutory updates**, **184 legal glossary terms**, and **23 interactive tools and calculators** (such as the CIN Decoder, ROC Deadline Tracker, and MCA Late Fee Calculator). Its factual regulatory accuracy across MCA, SEBI, RBI, IBBI, and EPFO circulars was verified at 100% within the 15-claim sampled review against primary government gazettes and press releases (note: this strong sample accuracy does not establish 100% factual accuracy across all 213 regulatory updates without exhaustive human legal review of each record).

The repository displays mature engineering discipline in several areas:
- **Build & Typing:** TypeScript type-checking (`npx tsc --noEmit`) passes with **0 errors**.
- **Automated Testing:** 38/38 test suites pass cleanly with **711/711 unit tests passing** (14.8s).
- **Core Crawlability:** All 477 URLs in the production XML sitemap index return valid `HTTP 200 OK` status codes with self-referential canonical tags (100 URLs directly crawled via automated DOM crawler; 377 verified via route/template logic and HTTP status).
- **Content Authority:** Extensive E-E-A-T signals, verified practitioner credentials (`/author/komalpreet-singh`), and transparent editorial policies (`/editorial-policy`).

However, the audit uncovered **critical architectural defects and compliance gaps** that require immediate, phased remediation prior to expanding production traffic or scaling monetization:

| Audit Dimension | Evaluation Rating | Key Findings Summary |
| :--- | :--- | :--- |
| **Application Security** | **Requires Immediate Action** | **1 Critical**, **3 High** findings. Wildcard edge caching on API routes injects shared public cache headers into POST endpoints; unsanitized HTML in contact forms allows Email XSS; Postgres RPC lacks `search_path`. |
| **Google AdSense & Monetization** | **Action Required** | Core content passes "Low Value Content" with flying colors, but **site lacks an IAB TCF v2.3 compliant certified CMP** for European/UK traffic. |
| **Web Accessibility (WCAG 2.2 AA)** | **Needs Improvement** | **1 High**, **3 Medium** findings. Duplicate `<GlobalSearch />` dialogs fight for focus; ARIA orphan attribute on categories button; WCAG 2.5.3 label mismatch on font toggles; unlabeled tool checkboxes. |
| **Technical SEO & Schema.org** | **Good (Minor Gaps)** | High-quality schema graphs, but carries a dangling entity reference on document templates, multi-page anonymous entities lacking persistent `@id`s, and a logo URL conflict on `/rbi/repo-rate`. |
| **Web Performance & Core Web Vitals**| **Moderate** | Edge TTFB is excellent (~42ms on cache hit), but LCP is delayed by lazy loading on hero images, and CSS bundle weight is inflated (~454 KB uncompressed). |
| **Regulatory & Legal Content** | **Exceptional (100% in Sample)**| Sampled statutory claims across RBI, SEBI, MCA, and IBBI verified accurate against primary government sources (15-claim sample). |

---

## 2. Confirmed Critical & High-Severity Risks

### 1. [CRITICAL] SEC-001: Unsafe Global API Public Caching on Mutating Endpoints
- **File:** `next.config.js` (lines 91–98)
- **Defect:** A global wildcard rule `source: '/api/((?!admin).*)'` injects `Cache-Control: public, max-age=300, s-maxage=1800` into all non-admin API routes.
- **Empirical Proof:** Verified live on production: `POST https://www.corplawupdates.in/api/subscribe` returns `HTTP 400 Bad Request` with `Cache-Control: public, max-age=300, s-maxage=1800`.
- **Impact Analysis:** Proven defect is the emission of shared public cache instructions on mutating routes. Potential impact is that intermediate shared caches or proxies could cache and serve error states or responses across distinct clients (though no production leak of private database records was observed).

### 2. [HIGH] SEC-002: HTML Injection / Email XSS in Contact Route
- **File:** `app/api/contact/route.ts` (lines 80–99)
- **Defect:** Contact form inputs (`name`, `subject`, `message`) are interpolated directly into the HTML email template body without HTML entity encoding or sanitization.
- **Impact:** Attackers can submit arbitrary HTML/phishing markup that renders directly in the administrator's email client.

### 3. [HIGH] SEC-003: Database RPC Function `increment_views` Lacks `search_path` & Range Constraints
- **File:** `supabase/migrations/20260701000000_add_views_rpc.sql`
- **Defect:** Stored procedure is declared as `SECURITY DEFINER` without setting an explicit `search_path`, and takes an unconstrained integer `increment_by` parameter executable by anonymous web users over PostgREST.
- **Impact:** Potential PostgreSQL schema spoofing and public tampering with view counters (e.g. passing negative numbers to corrupt statistics).

### 4. [HIGH] SEC-004: 31 npm Package Vulnerabilities in Dependency Tree
- **File:** `package.json`, `package-lock.json`
- **Defect:** `npm audit` identifies 31 vulnerabilities, including a **Critical** vulnerability in `handlebars` (4.0.0 - 4.7.9, Prototype Pollution / Remote Code Execution) and 7 High-severity vulnerabilities.

### 5. [HIGH] A11Y-001: Duplicate Mounting of `GlobalSearch` Dialog Component
- **File:** `components/Navbar.tsx` (lines 245 and 253)
- **Defect:** `<GlobalSearch />` is rendered twice simultaneously in `Navbar.tsx` (desktop header and mobile header controls).
- **Impact:** Pressing `Ctrl+K` mounts two identical modal dialogs simultaneously, triggering conflicting keyboard focus traps that break navigation for keyboard and screen-reader users.

### 6. [HIGH] ADS-001: Absence of IAB TCF v2.2 Certified CMP for EEA/UK Ad Serving
- **File:** `components/CookieConsentBanner.tsx`, `app/layout.tsx`
- **Defect:** Site injects Google AdSense (`ca-pub-8404756575471756`) globally but uses an in-house custom cookie banner that does not emit the IAB Europe TCF v2.2 API string (`window.__tcfapi`).
- **Impact:** Google AdSense withholds ad delivery and issues policy warnings for visitors originating from the EEA and the United Kingdom.

---

## 3. High-Priority Next Steps & Implementation Roadmap

Remediation must be conducted in four controlled, sequential batches to prevent regressions:

1. **Batch 1 (Day 1 — Immediate Security Hardening):**
   - Restrict API caching in `next.config.js` to `no-store, private` for all mutating endpoints.
   - Sanitize and escape HTML entities in `app/api/contact/route.ts`.
   - Re-deploy hardened `increment_views` RPC with `SET search_path = public, pg_temp;` and input validation.
2. **Batch 2 (Days 2–3 — Compliance & Core Accessibility):**
   - Lift `GlobalSearch` dialog to `app/layout.tsx` and leave lightweight trigger buttons in `Navbar.tsx`.
   - Fix orphan `aria-controls` attribute on collapsed categories button.
   - Align button visible text with `aria-label` in `FontSizeToggle.tsx` (WCAG 2.5.3).
   - Activate Google's native European regulations CMP in the AdSense Publisher Console.
3. **Batch 3 (Sprint 2 — Schema, Forms & CMS Hygiene):**
   - Add missing `WebSite` entity to document template schema `@graph`s.
   - Unify persistent schema `@id`s across Organization, Author, and WebSite entities.
   - Add accessible labels to CIN Decoder and ROC Tracker form controls.
   - Update database records with `category = null` to assign proper categories (`ipr`, `msme`).
4. **Batch 4 (Sprint 3 — Performance & Dependency Maintenance):**
   - Remove `loading="lazy"` on above-the-fold hero card images and add `fetchpriority="high"`.
   - Decouple CMS markdown editor CSS from the public stylesheet to reduce bundle size from 454 KB.
   - Update vulnerable transitive npm dependencies.

---

## 4. Final Deliverables Inventory

All thirteen complete audit artifacts have been generated and saved to:
`audit-reports/website-audit-2026-10-09/`

- `EXECUTIVE_SUMMARY.md`: High-level presentation of findings, scorecard, and roadmap.
- `AUDIT_METHODOLOGY.md`: Standards, tool versions, viewports, and audit boundaries.
- `URL_INVENTORY.csv`: All 477 unique sitemap URLs with archetype, canonical, and indexability.
- `PAGE_BY_PAGE_AUDIT.csv`: 1,176 granular check records across crawled pages.
- `CONTENT_FACT_CHECK.csv`: Primary source statutory verification of 15 material regulatory claims.
- `FINDINGS_REGISTER.md`: Complete register of all 17 findings with evidence, impact, and fixes.
- `SECURITY_REPORT.md`: Deep dive into application security, caching, stored procedures, and CSP.
- `SEO_AND_AI_SEARCH_REPORT.md`: Technical SEO, Schema.org entity graphs, and GEO readiness.
- `ADSENSE_AND_POLICY_REPORT.md`: Publisher policy audit, Low Value Content review, and TCF v2.2 gap.
- `PERFORMANCE_REPORT.md`: Core Web Vitals, Edge CDN latency, and asset bundle analysis.
- `ACCESSIBILITY_AND_MOBILE_REPORT.md`: WCAG 2.2 AA audit, keyboard traps, and responsive review.
- `FIX_BACKLOG.md`: Phased implementation backlog with effort sizing and testing specs.
- `COVERAGE_AND_GAPS.md`: Mandatory scope accounting across all 13 required disciplines.
