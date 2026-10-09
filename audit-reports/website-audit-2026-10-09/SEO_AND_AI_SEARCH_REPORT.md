# Technical SEO, Schema & AI Search (GEO) Audit Report
**Target Website:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Execution Date:** 09 October 2026  
**Auditor:** Technical SEO & Generative Engine Optimization Specialist  
**Evaluated Scope:** 477 In-Scope URLs, XML Sitemap index, Robots.txt, JSON-LD Schema Graphs, and AI Crawler Readiness.

---

## 1. Technical SEO & Indexability Baseline

### 1.1. Sitemap & Crawl Architecture
- **Sitemap Index:** `https://www.corplawupdates.in/sitemap.xml` dynamically aggregates all active routes:
  - 1 Homepage
  - 213 Regulatory Updates (`/updates/*`)
  - 184 Glossary Definitions (`/glossary/*`)
  - 35 Drafting Documents & Templates (`/documents/*`)
  - 23 Calculators & Interactive Compliance Tools (`/tools/*`)
  - 10 Regulatory Categories (`/category/*`)
  - 11 Static Hub & Legal Pages
- **HTTP Status & Canonicalization:** All 477 URLs return HTTP 200 OK and declare matching self-referential `<link rel="canonical" href="...">` tags.
- **IndexNow Integration:** The application includes IndexNow protocol support (`INDEXNOW_KEY` in environment variables) for instant search engine notification on content updates.
- **Redirects:** Legacy Blogger/WordPress URLs and legacy category labels are cleanly mapped to 301/308 permanent redirects in `next.config.js`.

---

## 2. Structured Data (Schema.org) Evaluation

The site implements extensive Schema.org JSON-LD markup across its page archetypes, including `NewsArticle`, `Article`, `BreadcrumbList`, `FAQPage`, `SoftwareApplication`, and `WebSite`. However, automated graph validation identified **three specific architectural defects**:

### 2.1. [HIGH] SEO-001: Dangling Entity Reference (`isPartOf: #website`)
- **Finding:** On document template pages such as `https://www.corplawupdates.in/documents/board-resolution-for-dividend-declaration`, the schema graph references:
  ```json
  "isPartOf": {
    "@id": "https://www.corplawupdates.in/#website"
  }
  ```
  However, the `WebSite` entity (`@id: "https://www.corplawupdates.in/#website"`) is **not declared** in the page's JSON-LD `@graph`.
- **Impact:** Search engine graph crawlers encounter a dangling reference pointing to an undefined node, degrading the entity graph.
- **Correction:** Always include the root `WebSite` entity definition in the graph array whenever referencing it.

### 2.2. [MEDIUM] SEO-002: Anonymous Multi-Page Entities Lacking Persistent `@id`s
- **Finding:** Across 100 crawled pages, the publisher organization (`CorpLawUpdates.in`), regulatory desks (`CorpLaw MCA & Corporate Compliance Desk`, `CorpLaw Banking Desk`), and primary author (`Komalpreet Singh`) are declared anonymously without persistent URI `@id` attributes.
- **Impact:** Search engines treat each occurrence as a separate anonymous instance rather than resolving them into a single coherent Knowledge Graph entity.
- **Correction:** Standardize persistent URI `@id`s across all JSON-LD generators:
  - Organization: `https://www.corplawupdates.in/#organization`
  - Author: `https://www.corplawupdates.in/author/komalpreet-singh#author`
  - WebSite: `https://www.corplawupdates.in/#website`

### 2.3. [MEDIUM] SEO-003: Entity Property Conflict on `/rbi/repo-rate`
- **Finding:** The JSON-LD schema on `https://www.corplawupdates.in/rbi/repo-rate` declares the organization logo as `https://www.corplawupdates.in/icon-512.png`, whereas the rest of the site uniformly declares `https://www.corplawupdates.in/icon.png`.
- **Impact:** Generates property disagreement warnings in Google and Bing entity reconciliation pipelines.
- **Correction:** Harmonize the logo property to use the canonical URL across 100% of pages.

---

## 3. Generative Engine Optimization (GEO) & AI Search Readiness

The website was audited against search models used by Google AI Overviews, Perplexity AI, ChatGPT Search, and Claude 3.5:

### 3.1. AI Crawler Accessibility
- **Robots.txt Inspection:** The live `robots.txt` does not block major AI web crawlers:
  - `GPTBot` (OpenAI): Allowed
  - `ClaudeBot` (Anthropic): Allowed
  - `PerplexityBot` (Perplexity): Allowed
  - `Google-Extended`: Allowed
- **Token Weight Efficiency:** SquirrelScan evaluated `ax/token-weight` and confirmed that core article text is presented cleanly in semantic HTML without bloated JavaScript client-state wrappers, ensuring high token-efficiency for LLM context windows.

### 3.2. GEO Summary & Practitioner Overview Boxes
- **Positive Pattern:** Interactive tools (such as `/tools/cin-decoder` and `/tools/roc-tracker`) and major regulatory updates feature an **AI Summary & Practitioner Overview** block:
  - Clear, direct, high-density factual answers (e.g., exact interest rate numbers, compliance deadlines, statutory penalty formulas).
  - Explicit citations to primary government notifications (PIB, RBI PR, MCA General Circulars).
- **Recommendation:** Maintain this high-density layout. AI engines favor pages where direct factual answers are isolated in clear thematic summary blocks before comprehensive legal analysis.

---

## 4. Unsupported SEO Practices & Over-Optimization Risks

SquirrelScan identified minor content warnings relating to keyword density:
- **`content/keyword-stuffing`:** Several older circular updates contain comma-separated keyword blocks in meta descriptions and tag footers (e.g., `ibbi circulars, ibc updates 2026, cirp regulations 2026, insolvency news...`).
- **Guidance:** Replace repetitive comma-separated keyword clouds with natural, human-readable editorial sentences. Modern search engines and AI engines rely on semantic vector embeddings rather than raw keyword repetition.

---

## 5. Priority Technical SEO Action Plan

1. **Standardize Schema `@graph`:** Update `lib/schema.ts` to enforce uniform `@id` URIs for Author, Publisher, and WebSite entities site-wide.
2. **Fix Dangling Node:** Add the `WebSite` entity to the JSON-LD `@graph` of all document template pages.
3. **Database Category Hygiene:** Correct the two updates with `category = null` (`how-to-file-a-trademark-in-india...` and `cabinet-approves-10000-crore-sme-growth-fund-2026`) so they integrate into category hubs and breadcrumb lists.
4. **Harmonize Logo URI:** Align `/rbi/repo-rate` logo to match canonical site branding.
