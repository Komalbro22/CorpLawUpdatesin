# Application Security & Infrastructure Audit Report
**Target Application:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Audit Date:** 09 October 2026  
**Auditor:** Application Security & Infrastructure Engineering Reviewer  
**Scope:** Complete repository codebase, production CDN/serverless headers, public API endpoints, database stored procedures, and package dependency tree.

---

## 1. Executive Security Summary

The application exhibits a solid defensive foundation in several critical areas:
- **Authentication & Sessions:** Admin session management uses cryptographic hashing and constant-time token comparison (`lib/auth.ts`, `lib/cron-auth.ts`).
- **Cron Job Protection:** Previous vulnerabilities where cron endpoints failed open have been remediated; routes fail closed (`401 Unauthorized`) when `CRON_SECRET` is missing.
- **Admin Endpoints:** Admin search and settings APIs strictly enforce `verifyAdminSession()`.
- **Database Access:** Supabase RLS policies are enabled across tables, and client reads are restricted via selective columns.

However, the audit identified **four critical and high-severity security vulnerabilities** that require immediate remediation:
1. **Critical:** Global Edge Caching header rule in `next.config.js` injecting `Cache-Control: public, s-maxage=1800` into all non-admin API routes (including `POST /api/subscribe`, `POST /api/contact`, etc.).
2. **High:** Unsanitized user inputs in `app/api/contact/route.ts` interpolated directly into HTML email notifications, causing HTML injection and Email XSS.
3. **High:** PostgreSQL stored procedure `increment_views` declared as `SECURITY DEFINER` without setting an explicit `search_path`, callable by public anonymous users without input range validation.
4. **High:** 31 package vulnerabilities in npm dependencies, including a Critical vulnerability in `handlebars` (prototype pollution / code execution) and 7 High-severity vulnerabilities.

---

## 2. Attack Surface Inventory

| Component / Layer | Count | Description & Exposure |
| :--- | :--- | :--- |
| **API Endpoints (`route.ts`)** | 114 routes | Public inquiry endpoints, newsletter subscription, web-push subscriptions, view tracking, administrative CRUD APIs. |
| **Public Page Routes (`page.tsx`)** | 81 routes | Server-rendered and client-hydrated pages receiving query parameters (e.g., search, filters, pagination). |
| **Stored Procedures (PostgreSQL RPC)** | 2 RPCs | `increment_views(article_slug, increment_by)`, `get_total_views()`. Exposed via PostgREST `/rpc/*`. |
| **Authentication Boundaries** | 2 boundaries | Admin session cookies (`/admin/*`) and bearer token cron authentication (`Authorization: Bearer <CRON_SECRET>`). |
| **Edge CDN & Reverse Proxy** | Cloudflare / Vercel | Cloudflare Anycast edge reverse-proxying Vercel serverless functions in Singapore (`sin1`). |

---

## 3. Vulnerability Findings & Proof-of-Concept

### 3.1. [CRITICAL] SEC-001: Unsafe Global API Public Caching Policy
- **Vulnerability Type:** CWE-524: Use of Cache-Containing Sensitive Information / Security Misconfiguration (OWASP A05)
- **Source Code Location:** `next.config.js` (lines 91–98):
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
- **Empirical Proof-of-Concept:**
  Executing an HTTP POST against the public newsletter subscription route:
  ```bash
  curl.exe -i -X POST https://www.corplawupdates.in/api/subscribe \
    -H "Content-Type: application/json" \
    -d "{}"
  ```
  **Live Production Response:**
  ```http
  HTTP/1.1 400 Bad Request
  Date: Fri, 09 Oct 2026 06:53:03 GMT
  Content-Type: application/json
  Cache-Control: public, max-age=300, s-maxage=1800, stale-while-revalidate=86400
  Server: cloudflare
  cf-cache-status: DYNAMIC

  {"error":"Email is required"}
  ```
- **Exploitation & Impact Analysis:**
  - **Proven Defect:** Next.js applies `headers()` in `next.config.js` across all HTTP verbs matching the regex. Any non-admin route not explicitly overriding cache headers receives `public, s-maxage=1800` (proven live on `POST /api/subscribe` returning `s-maxage=1800`).
  - **Potential Impact:** If an intermediary proxy, CDN edge, or shared corporate cache obeys this instruction on non-idempotent or error responses, responses could be cached across clients.
  - **Observed Evidence:** Live testing showed `cf-cache-status: DYNAMIC` on Cloudflare for POST requests; no actual leakage of private database records was observed. Caching mutating endpoints remains a severe security misconfiguration that must be eliminated.
- **Remediation:**
  Remove the global wildcard rule. Configure `Cache-Control: no-store, no-cache, must-revalidate, private` as the default for all `/api/:path*` routes, and explicitly set public caching headers solely on read-only, non-sensitive GET endpoints (e.g. `/api/og`, `/api/settings/whatsapp`).

---

### 3.2. [HIGH] SEC-002: HTML Injection / Email XSS in Contact Route
- **Vulnerability Type:** CWE-79: Improper Neutralization of Input During Web Page Generation (OWASP A03)
- **Source Code Location:** `app/api/contact/route.ts` (lines 80–99):
  ```typescript
  const safeName = String(name).trim().slice(0, 200)
  const safeSubject = String(subject).trim().slice(0, 200)
  const safeMessage = String(message).trim().slice(0, 5000)

  const sendRes = await sendEmail({
    from: fromEmail,
    fromName,
    to: toEmail,
    replyTo: email,
    subject: `[Contact] ${safeSubject}`,
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
- **Exploitation & Impact:**
  The contact route trims and slices user strings, but performs zero HTML entity encoding or sanitization before embedding them into `html:`. An attacker submitting an inquiry with payloads like:
  ```html
  <a href="https://phishing-portal.com" style="display:block;padding:20px;background:red;color:white;">CLICK TO VERIFY MCA ACCOUNT</a>
  ```
  or malicious tracker `<img>` tags will have unescaped HTML rendered directly inside the email client of the site administrator (`mail@corplawupdates.in`).
- **Remediation:**
  Use an HTML escape helper function or `sanitize-html` to encode special characters (`<`, `>`, `&`, `"`, `'`) before building the HTML email string.

---

### 3.3. [HIGH] SEC-003: Database RPC Function `increment_views` Hardening
- **Vulnerability Type:** CWE-250: Execution with Unnecessary Privileges / Postgres Search Path Manipulation (OWASP A01 / A05)
- **Source Code Location:** `supabase/migrations/20260701000000_add_views_rpc.sql`:
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
- **Exploitation & Impact:**
  1. `SECURITY DEFINER` executes the function with the privileges of the database owner (`postgres`). In PostgreSQL, omitting `SET search_path = public, pg_temp;` allows potential schema spoofing attacks.
  2. The function is executable by `PUBLIC` (including the anonymous Supabase client role `anon`). Because `increment_by` is unconstrained, any caller on the web can invoke `POST /rest/v1/rpc/increment_views` with `increment_by: -1000000` to set view counts negative or arbitrarily inflate them.
- **Remediation:**
  Apply `SET search_path = public, pg_temp;`, enforce `IF increment_by <= 0 OR increment_by > 500 THEN RAISE EXCEPTION ...`, and revoke execution permissions from `PUBLIC` and `anon`.

---

### 3.4. [HIGH] SEC-004: Dependency Vulnerabilities Inventory
- **Vulnerability Type:** CWE-1104: Use of Unmaintained / Vulnerable Third-Party Components (OWASP A06)
- **Audit Findings:**
  - Total npm audit findings: 31 vulnerabilities.
  - Critical Severity (1): `handlebars` (4.0.0 - 4.7.9) — Prototype Pollution and Remote Code Execution risk.
  - High Severity (7): `brace-expansion`, `braces`, `browserslist`.
  - Moderate Severity (23): `postcss-selector-parser`, `sprintf-js`, `js-yaml`.
  - Production runtime dependencies (`npm audit --omit=dev`): 3 moderate vulnerabilities in `sprintf-js` (via `mammoth` Word document parser).
- **Remediation:**
  Execute `npm update` and configure `overrides` in `package.json` for patched sub-dependency versions.

---

## 4. HTTP Security Headers & Content Security Policy (CSP)

A live inspection of production headers returned by Cloudflare / Vercel:
```http
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com https://va.vercel-scripts.com https://*.clarity.ms https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://tpc.googlesyndication.com https://news.google.com https://*.google.com https://*.adtrafficquality.google; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' blob: data: https: wss://*.supabase.co https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.adtrafficquality.google; frame-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://news.google.com https://*.google.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests;
```

### Analysis of Security Headers
- **HSTS:** Strong (`max-age=31536000; includeSubDomains; preload`).
- **MIME Sniffing:** Properly blocked (`nosniff`).
- **Clickjacking:** `frame-ancestors 'self'` and `x-frame-options: SAMEORIGIN` prevent unauthorized embedding.
- **CSP Structure:** Good policy baseline with strict `object-src 'none'` and restrictive `base-uri`. However, `'unsafe-inline'` is currently required for scripts and styles to accommodate Next.js hydration and third-party tracking tags. Implementing cryptographic nonces (`nonce-{random}`) is recommended for future hardening.

---

## 5. Security Testing Boundaries & Responsible Limitations

1. **Passive Testing Only:** In compliance with audit instructions, all tests were non-destructive. No SQL injections were executed against production databases, and no denial-of-service simulations were performed.
2. **Read-Only Scope:** Stored procedures and configuration files were reviewed through source analysis and non-destructive header verification.
