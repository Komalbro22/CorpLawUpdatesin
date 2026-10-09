# Full-Stack Audit Methodology & Scope Definition
**Target Website:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Repository Branch:** `main` (commit head)  
**Execution Date:** 09 October 2026  
**Auditor:** Specialized Multidisciplinary Quality, Security, and Compliance Audit Team  

---

## 1. Executive Mission & Scope Boundary

This audit was conducted as a strict, read-only, evidence-grounded assessment spanning the live production deployment and the full source code repository. The objective is to identify every discoverable defect, architectural vulnerability, compliance gap, and user-facing defect across twelve distinct technical and legal disciplines.

### Strict Operational Constraints
- **Read-Only Investigation:** No code edits, Git commits, branch merges, pull requests, or deployments were performed on production or staging environments.
- **Data Integrity:** No write operations or modifications were made to the primary Supabase production database or secondary document repositories.
- **Non-Destructive Testing:** Security and endpoint probes were non-destructive, strictly bounded, and compliant with responsible disclosure practices.

---

## 2. Environment, Tools & Runtime Versions

| Tool / Technology | Version / Specification | Role in Audit |
| :--- | :--- | :--- |
| **Node.js** | `v22.21.1` (x64) | Audit execution engine and runtime environment |
| **npm** | `10.9.4` | Package manager and vulnerability auditing (`npm audit`) |
| **Next.js** | `16.4.0` (App Router) | Target framework (utilizes `proxy.ts` architecture) |
| **React** | `19.3.0` | Frontend UI runtime |
| **Tailwind CSS** | `4.3.3` | Utility styling engine |
| **Supabase JS** | `2.117.3` | Database and client integration SDK |
| **SquirrelScan** | `v0.0.107` | Automated multi-page surface audit (`--passive --offline --coverage surface`) |
| **TypeScript** | `v7.0.2` (`npm:typescript@^7.0.2`) | Static type validation (`npx tsc --noEmit`) |
| **ESLint** | `10.12.0` / Next.js Config `16.4.0` | Code quality and syntax rule validation |
| **Jest** | `30.5.2` / `ts-jest@29.4.14` | Unit and regression test execution (38 test suites, 711 unit tests) |
| **Network & HTTP** | `curl.exe` 8.x, PowerShell 5.1, Node native `fetch` | Live CDN and HTTP response header verification |

---

## 3. Discovered Inventory & Route Sources

### A. Route Inventory (Codebase)
- **App Router Page Routes (`page.tsx`):** 81 routes
- **App Router API Route Handlers (`route.ts`):** 114 endpoints
- **Root Proxy Convention:** `proxy.ts` (Next.js 16 Edge / Node proxy routing)

### B. Production Sitemap Inventory (`https://www.corplawupdates.in/sitemap.xml`)
- **Total Unique In-Scope URLs:** 477 URLs
- **Breakdown by Archetype:**
  - **Homepage:** 1 URL (`https://www.corplawupdates.in`)
  - **Regulatory Updates / Articles:** 213 URLs (`/updates/*`)
  - **Legal Glossary:** 184 URLs (`/glossary/*`)
  - **Drafting Documents & Templates:** 35 URLs (`/documents/*`)
  - **Calculators & Compliance Tools:** 23 URLs (`/tools/*`)
  - **Regulatory Category Hubs:** 10 URLs (`/category/*`)
  - **Static / Legal / Editorial Pages:** 11 URLs (`/about`, `/author/komalpreet-singh`, `/calendar`, `/contact`, `/disclaimer`, `/editorial-policy`, `/newsletter`, `/partners`, `/privacy-policy`, `/rbi/repo-rate`, `/terms`)

### C. Database Entity Inventory (Supabase Production)
- **Updates (`updates` table):** 213 records verified
- **Glossary (`glossary` table):** 183 records verified

---

## 4. Evaluated Standards & Official Baselines

1. **Web Accessibility & Usability:**
   - **W3C WCAG 2.1 & 2.2 Level AA:** Focusing on Success Criterion 1.3.1 (Info and Relationships), 2.1.1 (Keyboard Navigation), 2.4.4 (Link Purpose), 2.5.3 (Label in Name), 3.3.2 (Labels or Instructions), and 4.1.2 (Name, Role, Value).
   - **WAI-ARIA 1.2 Specification:** Structural compliance for `aria-controls`, `aria-expanded`, and roving tabindexes.
2. **Search Engine & Agentic Optimization (SEO / GEO):**
   - **Google Search Essentials:** Crawlability, indexability, canonicalization, mobile-first indexing, and Core Web Vitals (LCP, INP, CLS).
   - **Schema.org Vocabulary:** JSON-LD `@graph` entity structure, BreadcrumbList, Article, WebSite, Organization, Person, and FAQPage.
3. **Google AdSense & Publisher Compliance:**
   - **Google AdSense Program Policies:** Prohibition of "Low Value Content", misleading ad placements, unnavigable interfaces, and scraped content.
   - **EEA / UK Consent Requirements:** Mandatory integration with an IAB Europe TCF v2.2 certified Consent Management Platform (CMP).
4. **Application Security & Hardening:**
   - **OWASP Top 10 (2021/2026):** Injection (A03), Broken Access Control (A01), Security Misconfiguration (A05), Vulnerable and Outdated Components (A06).
   - **PostgreSQL / PostgREST Security:** `SECURITY DEFINER` function hardening and `search_path` encapsulation.
5. **Corporate Law & Regulatory Accuracy:**
   - Primary source verification against official gazette notifications and circulars issued by:
     - Ministry of Corporate Affairs (MCA)
     - Securities and Exchange Board of India (SEBI)
     - Reserve Bank of India (RBI)
     - Insolvency and Bankruptcy Board of India (IBBI)
     - Employees' Provident Fund Organisation (EPFO)
     - International Financial Services Centres Authority (IFSCA)

---

## 5. Viewports, Devices & Network Testing

- **Desktop Viewport:** 1440 × 900 px and 1920 × 1080 px (Chrome / Blink rendering engine)
- **Mobile Viewport:** 375 × 812 px (iPhone SE / X) and 390 × 844 px (iPhone 14 / 15 standard)
- **Tablet Viewport:** 768 × 1024 px (iPad Portrait)
- **Network Profiling:** Cloudflare Edge CDN (Anycast Singapore node `sin1` and Hong Kong node `hkg1`) proxying to Vercel Serverless runtimes.

---

## 6. Definition of Verdicts & Severity Model

### Severity Definitions
- **Critical (P0):** Immediate exploitation risk, private data exposure, systemic data corruption, or immediate production breakage.
- **High (P1):** Major compliance violation, significant security exposure, major accessibility blocker, or substantial indexation loss.
- **Medium (P2):** Material performance degradation, partial accessibility non-conformance, minor SEO/schema discrepancies, or non-blocking logic defects.
- **Low (P3):** Visual polish, micro-typography, non-critical markup warnings, or isolated usability enhancements.
- **Informational:** Architectural observation or strategic enhancement without an active defect.

### Verification Statuses
- **Confirmed:** Reproducible via direct code inspection and live production testing with empirical HTTP/DOM/CLI evidence.
- **Strong Evidence:** Supported by comprehensive code trace and automated multi-page crawler findings.
- **Probable:** Highly likely based on static code analysis, subject to specific production environment variables.
- **Unverified:** Hypothesized condition where testing would violate read-only constraints or require external account credentials.
