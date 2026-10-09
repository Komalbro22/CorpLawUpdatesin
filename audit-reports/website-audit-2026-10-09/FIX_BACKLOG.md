# Remediation Fix Backlog & Implementation Roadmap
**Target Website:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Audit Execution Date:** 09 October 2026  
**Implementation Methodology:** Controlled batch delivery with strict testing, re-audit verification, and zero direct unreviewed pushes to `main`.

---

## 1. Prioritization & Phased Delivery Strategy

To protect production uptime, prevent regressions, and methodically resolve identified defects, all fixes are organized into **four structured implementation batches**:

```
Batch 1: Critical Security & Edge Caching (P0)
   └── Day 1 Deployment (Immediate Protection)
Batch 2: Accessibility & AdSense Compliance (P1)
   └── Sprint 1 (Days 2–3)
Batch 3: Structured Data, Forms & CMS Hygiene (P2)
   └── Sprint 2 (Week 2)
Batch 4: Performance Optimization & Dependencies (P3)
   └── Sprint 3 (Week 3)
```

---

## 2. Complete Fix Backlog Table

| Item ID | Finding Ref | Title | Priority | Dependencies | Est. Effort | Regression Risk | Human Decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FIX-01** | `SEC-001` | Restrict API Caching in `next.config.js` | **P0 (Critical)** | None | 0.5 hours | Low | No |
| **FIX-02** | `SEC-002` | Sanitize & Encode Contact Form HTML Email | **P0 (Critical)** | None | 0.5 hours | None | No |
| **FIX-03** | `SEC-003` | Harden PostgreSQL RPC `increment_views` | **P0 (Critical)** | Supabase Access | 1.0 hours | Low | No |
| **FIX-04** | `A11Y-001` | Deduplicate `GlobalSearch` Dialog Mounting | **P1 (High)** | None | 1.0 hours | Low | No |
| **FIX-05** | `A11Y-002` | Fix Orphan ARIA Attribute on Categories Button | **P1 (High)** | None | 0.5 hours | Low | No |
| **FIX-06** | `A11Y-003` | Align WCAG 2.5.3 Button Names in `FontSizeToggle` | **P1 (High)** | None | 0.5 hours | None | No |
| **FIX-07** | `ADS-001` | Activate AdSense Native TCF v2.2 CMP for EEA/UK | **P1 (High)** | AdSense Console | 0.5 hours | None | Yes (Console) |
| **FIX-08** | `SEO-001` | Resolve Dangling Schema Node on Document Pages | **P2 (Medium)** | None | 0.5 hours | Low | No |
| **FIX-09** | `SEO-002` | Enforce Uniform Schema `@id`s Across Entities | **P2 (Medium)** | None | 1.5 hours | Low | No |
| **FIX-10** | `SEO-003` | Harmonize Logo URL on `/rbi/repo-rate` Schema | **P2 (Medium)** | None | 0.5 hours | None | No |
| **FIX-11** | `A11Y-004` | Add Labels & ARIA Names to CIN & ROC Tools | **P2 (Medium)** | None | 1.5 hours | Low | No |
| **FIX-12** | `SEO-004` | Assign Missing Category Slugs in Database | **P2 (Medium)** | Supabase Access | 0.5 hours | None | Yes (Category choice) |
| **FIX-13** | `PERF-002` | Remove Lazy Loading on Above-Fold Hero Images | **P3 (Low)** | None | 1.0 hours | None | No |
| **FIX-14** | `PERF-001` | Decouple Markdown Editor CSS to Reduce Bundle | **P3 (Low)** | None | 2.5 hours | Medium | No |
| **FIX-15** | `SEC-004` | Upgrade Vulnerable npm Dependencies | **P3 (Low)** | Jest test suite | 2.0 hours | Medium | Yes (Version review) |

---

## 3. Batch Specifications & Testing Requirements

### Batch 1: Immediate Security & Data Protection (P0)

#### FIX-01: Restrict API Caching in `next.config.js`
- **Files Modified:** `next.config.js`
- **Action:** Replace lines 91–98 with a default `no-store` policy for API endpoints:
  ```javascript
  {
    source: '/api/:path*',
    headers: [
      { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
      { key: 'Pragma', value: 'no-cache' },
    ],
  }
  ```
- **Testing Requirement:** Run `curl -i -X POST https://.../api/subscribe` and confirm `Cache-Control: no-store` is returned. Verify public static assets (`/images/*`, `/fonts/*`) remain cached.

#### FIX-02: Sanitize & Encode Contact Form HTML Email
- **Files Modified:** `app/api/contact/route.ts`
- **Action:** Escape HTML entities for `${safeName}`, `${email}`, `${safeSubject}`, and `${safeMessage}` before generating the email template body.
- **Testing Requirement:** Send a test payload containing `<b>bold</b>` and `<script>` tags; confirm plain text escapes appear in administrative inbox.

#### FIX-03: Harden PostgreSQL RPC `increment_views`
- **Files Modified:** `supabase/migrations/20260701000000_add_views_rpc.sql` (and execute on DB)
- **Action:** Add `SET search_path = public, pg_temp;`, enforce integer bounds (`increment_by BETWEEN 1 AND 500`), and revoke public execution privileges.
- **Testing Requirement:** Call RPC with negative values via PostgREST; verify rejection with an exception.

---

### Batch 2: Accessibility & Compliance Fixes (P1)

#### FIX-04: Deduplicate `GlobalSearch` Dialog Mounting
- **Files Modified:** `components/Navbar.tsx`, `components/GlobalSearch.tsx`, `app/layout.tsx`
- **Action:** Separate the modal dialog DOM from trigger buttons. Render the search modal exactly once in `app/layout.tsx` controlled by a lightweight shared state hook.
- **Testing Requirement:** Press `Ctrl+K`; verify exactly one `#global-search-dialog` is created. Test Tab navigation and focus trapping.

#### FIX-05: Fix Orphan ARIA Attribute on Categories Button
- **Files Modified:** `components/Navbar.tsx`
- **Action:** Set `aria-controls={categoriesOpen ? "category-dropdown-menu" : undefined}` or keep the element in the DOM with `hidden={!categoriesOpen}`.
- **Testing Requirement:** Inspect DOM on page load; confirm no orphan ID references exist in the accessibility tree.

#### FIX-06: Align WCAG 2.5.3 Button Names in `FontSizeToggle`
- **Files Modified:** `components/FontSizeToggle.tsx`
- **Action:** Update `buttonLabels` mapping to `"A- (Small font size)"`, `"A (Medium font size)"`, `"A+ (Large font size)"`.
- **Testing Requirement:** Re-run automated accessibility scanner; confirm zero label-in-name mismatch errors.

#### FIX-07: Activate AdSense Native TCF v2.2 CMP for EEA/UK
- **Files Modified:** None (Administrative Console Configuration)
- **Action:** Enable European regulations CMP inside Google AdSense Console under **Privacy & Messaging**.
- **Testing Requirement:** Access site from an EU proxy; verify Google's certified CMP dialog loads.

---

### Batch 3: Structured Data, Tool Accessibility & CMS Hygiene (P2)

#### FIX-08, FIX-09, FIX-10: Standardize Schema.org `@graph`
- **Files Modified:** `components/JsonLd.tsx`, `lib/schema.ts`, `app/documents/[slug]/page.tsx`, `app/rbi/repo-rate/page.tsx`
- **Action:** Ensure WebSite node is always present when referenced. Declare persistent `@id`s for Organization and Person entities. Harmonize logo URL to `icon.png`.
- **Testing Requirement:** Validate updated pages through Google Rich Results Test and Schema.org Validator.

#### FIX-11: Add Accessible Labels in Tools
- **Files Modified:** `app/tools/cin-decoder/page.tsx`, `app/tools/roc-tracker/page.tsx`
- **Action:** Add `<label>` elements and `aria-label` tags to the CIN input and 18 corporate checkboxes.
- **Testing Requirement:** Screen-reader walkthrough using NVDA or ChromeVox.

#### FIX-12: Assign Missing Category Slugs in Database
- **Files Modified:** Supabase `updates` table
- **Action:** Update `how-to-file-a-trademark-in-india...` to `category = 'ipr'` and `cabinet-approves-10000-crore...` to `category = 'msme'`.
- **Testing Requirement:** Confirm query `SELECT * FROM updates WHERE category IS NULL` returns 0 rows.

---

### Batch 4: Performance Polish & Dependency Maintenance (P3)

#### FIX-13: Remove Lazy Loading on Hero Images
- **Files Modified:** `components/UpdateCard.tsx`, `components/FeaturedArticle.tsx`, `app/page.tsx`
- **Action:** Add `priority` or `loading="eager"` with `fetchpriority="high"` on above-the-fold hero images.
- **Testing Requirement:** Chrome DevTools performance trace; verify image fetch begins before DOM layout completes.

#### FIX-14: Decouple Markdown Editor CSS
- **Files Modified:** `app/globals.css`, `app/admin/layout.tsx`
- **Action:** Move `@uiw/react-md-editor` stylesheet imports exclusively into the admin route layout.
- **Testing Requirement:** Verify public production CSS chunk drops below 150 KB and article formatting remains intact.

#### FIX-15: Upgrade Vulnerable Dependencies
- **Files Modified:** `package.json`, `package-lock.json`
- **Action:** Run `npm update` and configure package overrides for `handlebars` and `sprintf-js`.
- **Testing Requirement:** Run `npx tsc --noEmit` and `npm test` (all 711 unit tests must pass).
