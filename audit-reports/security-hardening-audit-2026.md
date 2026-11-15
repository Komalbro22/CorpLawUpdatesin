# Security & Hardening Audit Report: CorpLawUpdates

**Date:** November 15, 2026  
**Auditor:** Security Agent (`@security`)  
**Scope:** Full repository audit across API routes, Supabase queries & RLS, Edge proxy & security headers, secrets handling, and OWASP Top 10 vulnerability assessment.  
**Repository:** `CorpLawUpdates` (Next.js 16.4.4, React 19, Supabase, Cloudflare Workers / Vercel Edge)

---

## Executive Summary

A comprehensive source-code security audit of the `CorpLawUpdates` platform was conducted. While core administrative flows demonstrate mature defense patterns (such as HMAC-SHA256 timing-safe cookie verification, atomic token generation, and parameterized database queries), multiple **Critical** and **High** vulnerabilities were discovered in unauthenticated public endpoints, edge CSRF enforcement, HTML sanitizer configurations, server-side HTTP fetches (SSRF), and AI rate-limiting logic.

### Findings Breakdown by Severity

| Severity | Count | Summary of Key Issues |
|---|:---:|---|
| **Critical** | 4 | SSRF via unauthenticated URL download, SSRF/host poisoning in `/api/documents/edit`, IDOR document modification in `/api/documents/edit`, Complete rate-limit bypass on Gemini document generation via IP spoofing & whitelist default |
| **High** | 6 | Image proxy SSRF & raw SVG XSS, Edge CSRF check bypass on missing headers & `.vercel.app` wildcards, Unauthenticated arbitrary file upload to public Supabase bucket, Insecure `sanitizeHtml` allowing `iframe` and `data:`, Wildcard `https:` in CSP `script-src`, Admin link checker DNS-rebinding SSRF |
| **Medium** | 7 | PostgREST filter injection in push notifications, Timing attack in cron auth string equality, In-memory rate limiting flaw on serverless, Redis non-atomic `INCR`+`EXPIRE` race conditions, Centroid classifier rate-limit keying DoS, Secondary Supabase client routing misconfiguration, Tracked `.env.production` file |
| **Low / Best Practice** | 4 | Missing `SET search_path` on PostgreSQL `SECURITY DEFINER` functions, Free public proxy dependency in RBI cron job, Inconsistent Zod validation across routes, Missing prompt injection sanitization in document generation |

---

## 1. Vulnerability Findings & Technical Breakdown

---

### [CRIT-01] Server-Side Request Forgery (SSRF) in Document Download API
- **Severity:** `Critical`
- **OWASP Category:** A10:2021 – Server-Side Request Forgery (SSRF)
- **Location:** `app/api/documents/download/route.ts` (Lines 289-303)
- **Vulnerability Mechanics:**
  The `POST /api/documents/download` endpoint is public and unauthenticated. It accepts a `letterhead_url` parameter and directly executes an HTTP fetch:
  ```typescript
  if (letterhead_url) {
    try {
      const imgRes = await fetch(letterhead_url)
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer()
        if (isLetterheadPdf) {
          letterheadPdfDoc = await PDFDocument.load(arrayBuffer)
        } else {
          letterheadBuffer = Buffer.from(arrayBuffer)
        }
      }
    } catch (err) {
      console.error('Failed to fetch/process letterhead:', err)
    }
  }
  ```
  There is **zero** protocol validation, **zero** domain allowlisting, and **zero** private/loopback IP address filtering.
- **Impact:**
  An unauthenticated remote attacker can supply internal URLs (e.g. `http://169.254.169.254/latest/meta-data/` on cloud providers, or `http://127.0.0.1:3000/api/admin/...`, or internal databases/microservices) to conduct internal port scanning, query metadata credentials, or exfiltrate sensitive internal service responses.
- **Actionable Remediation:**
  1. Validate `letterhead_url` using a strict URL allowlist parser (e.g. only allowing approved domains such as `fcosrsznbxedischtbwe.supabase.co`, `igglydprjtptmkzvfngg.supabase.co`).
  2. Reject all non-HTTPS schemes (`http:`, `file:`, `gopher:`).
  3. Validate resolved IP addresses against private and cloud metadata CIDR ranges (RFC 1918, RFC 3927 link-local `169.254.0.0/16`, `127.0.0.0/8`, IPv6 loopback/link-local).
  4. Set `redirect: 'error'` to avoid redirect-based SSRF.

---

### [CRIT-02] Server-Side Request Forgery & Host Poisoning in Document Edit API
- **Severity:** `Critical`
- **OWASP Category:** A10:2021 – Server-Side Request Forgery (SSRF)
- **Location:** `app/api/documents/edit/route.ts` (Lines 60-72)
- **Vulnerability Mechanics:**
  When classifying intent in `/api/documents/edit`, the server constructs an HTTP request to its own rule engine using untrusted client request headers:
  ```typescript
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const origin = request.headers.get('origin') || `${protocol}://${host}`;

  const classifyResponse = await fetch(`${origin}/api/rule-engine/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: edit_instruction,
      userId: 'anonymous',
      docType: document_type || 'GENERAL',
    }),
  });
  ```
- **Impact:**
  If an attacker sends `Origin: http://attacker-controlled-server.com` or `Host: internal-service`, the server dispatches a POST request containing the user's `edit_instruction` and internal parameters to that destination. This allows SSRF and data exfiltration.
- **Actionable Remediation:**
  Do not dispatch external network HTTP calls back to local route handlers. Instead, invoke the internal service function directly (e.g., import and call `classifyPrompt()` or `executeRule()`), or construct internal URLs using an authoritative environment variable `process.env.INTERNAL_API_URL || 'http://127.0.0.1:3000'`.

---

### [CRIT-03] Insecure Direct Object Reference (IDOR) on Generated Documents
- **Severity:** `Critical`
- **OWASP Category:** A01:2021 – Broken Access Control
- **Location:** `app/api/documents/edit/route.ts` (Lines 234-242)
- **Vulnerability Mechanics:**
  The edit endpoint updates the `generated_documents` table using `supabaseAdmin` without verifying document ownership:
  ```typescript
  if (document_id) {
    await supabaseAdmin
      .from('generated_documents')
      .update({ 
        edited_content: editedContent,
        status: 'draft'
      })
      .eq('id', document_id);
  }
  ```
- **Impact:**
  Any unauthenticated client can pass any `document_id` (a UUID belonging to another company's generated board resolution, employment agreement, or NDA) and mutate/overwrite its `edited_content`.
- **Actionable Remediation:**
  1. Tie `generated_documents` updates to an ownership session token or secret edit token issued at creation time (e.g. stored in an `httpOnly` cookie or verified edit secret).
  2. Verify that `session_id` or `edit_token` matches before executing updates:
     ```typescript
     .eq('id', document_id)
     .eq('session_id', verifiedSessionId)
     ```

---

### [CRIT-04] Complete Rate Limit Bypass on AI Document Generation via IP Spoofing & Whitelist Default
- **Severity:** `Critical`
- **OWASP Category:** A04:2021 – Insecure Design / Rate Limit Bypass
- **Location:** `app/api/documents/generate/route.ts` (Lines 209-226)
- **Vulnerability Mechanics:**
  Client IP extraction takes the first element of `X-Forwarded-For` without proxy trust verification:
  ```typescript
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? '127.0.0.1'
  ```
  Then, site settings default `whitelisted_ips` to `'127.0.0.1'`:
  ```typescript
  const whitelistedIpsStr = settingsData?.find(s => s.key === 'whitelisted_ips')?.value || '127.0.0.1'
  const whitelistedIps = whitelistedIpsStr.split(',').map((s: string) => s.trim()).filter(Boolean)
  const isWhitelisted = whitelistedIps.includes(ip)

  if (use_ai && !isWhitelisted) {
    // Rate limiting logic
  }
  ```
- **Impact:**
  If an attacker sends `X-Forwarded-For: 127.0.0.1`, or sends no header (causing fallback to `127.0.0.1`), `isWhitelisted` evaluates to `true`. The daily token limits (`maxRequests`, `maxTokens`) are completely bypassed. This enables unlimited free Gemini API consumption, resulting in quota exhaustion and financial denial of service.
- **Actionable Remediation:**
  1. Do not include `'127.0.0.1'` as a default whitelisted IP in production.
  2. In edge environments (Cloudflare / Vercel), read client IP strictly from trusted edge headers (`cf-connecting-ip` on Cloudflare or `x-real-ip` set by trusted edge reverse proxy, never client-controllable left-most `x-forwarded-for`).

---

### [HIGH-01] Reflected XSS & Open SSRF Vector in Image Proxy
- **Severity:** `High`
- **OWASP Category:** A03:2021 – Injection (Cross-Site Scripting) & A10:2021 – SSRF
- **Location:** `app/api/image-proxy/route.ts` (Lines 12-16 & 60-70)
- **Vulnerability Mechanics:**
  1. Host check allows any Supabase project:
     ```typescript
     if (hostname.endsWith('.supabase.co')) return true
     ```
     Any attacker can create a free Supabase project (`attacker.supabase.co`) and route files through the proxy.
  2. Protocol check allows `http:`.
  3. `fetch(targetUrl)` follows HTTP 30x redirects by default.
  4. SVGs are returned with `Content-Type: image/svg+xml` without sanitization or `Content-Disposition: attachment`:
     ```typescript
     if (rawContentType.includes('svg')) {
       return new Response(imageBuffer, {
         status: 200,
         headers: {
           'Content-Type': 'image/svg+xml',
           'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
           'X-Content-Type-Options': 'nosniff',
         },
       })
     }
     ```
- **Impact:**
  Opening `/api/image-proxy?url=https://attacker.supabase.co/storage/v1/object/public/test/xss.svg` in a browser executes any embedded JavaScript under the `corplawupdates.in` origin (Stored/Reflected XSS).
- **Actionable Remediation:**
  1. Restrict `ALLOWED_HOSTS` to an exact allowlist; remove open `endsWith('.supabase.co')`.
  2. Set `redirect: 'error'` on `fetch`.
  3. Enforce `https:` exclusively.
  4. When serving SVG files from `/api/image-proxy`, set `Content-Disposition: attachment; filename="image.svg"` or enforce a sandbox CSP header on the response:
     ```typescript
     'Content-Security-Policy': "default-src 'none'; sandbox",
     'Content-Disposition': 'inline; filename="image.svg"'
     ```

---

### [HIGH-02] Cross-Site Request Forgery (CSRF) Bypass in Edge Proxy
- **Severity:** `High`
- **OWASP Category:** A01:2021 – Broken Access Control (CSRF)
- **Location:** `proxy.ts` (Lines 56-79)
- **Vulnerability Mechanics:**
  1. The CSRF check only runs `if (originHeader)`:
     ```typescript
     const originHeader = request.headers.get('origin') || request.headers.get('referer')
     if (originHeader) {
       // validation
     }
     ```
     If an attacker issues a request without `Origin` and with `Referrer-Policy: no-referrer`, `originHeader` is null and the check is completely skipped.
  2. The host check allows any Vercel domain:
     ```typescript
     originHostname.endsWith('.vercel.app')
     ```
     Any attacker hosting an exploit on `https://attacker-project.vercel.app` passes this validation.
- **Impact:**
  An attacker can perform cross-origin state-changing actions (creating articles, deleting subscribers, updating rules) against authenticated admin sessions.
- **Actionable Remediation:**
  1. Fail closed: reject state-changing requests if both `Origin` and `Referer` are missing on browser session requests.
  2. Remove wildcard `originHostname.endsWith('.vercel.app')`. Restrict strictly to `corplawupdates.in`, `www.corplawupdates.in`, and explicit production preview URLs configured in environment variables.

---

### [HIGH-03] Unauthenticated Arbitrary File Upload to Public Supabase Bucket
- **Severity:** `High`
- **OWASP Category:** A04:2021 – Insecure Design / Unrestricted File Upload
- **Location:** `app/api/documents/letterhead/route.ts` (Lines 18-58)
- **Vulnerability Mechanics:**
  The `POST /api/documents/letterhead` endpoint is completely unauthenticated. It accepts files up to 5MB, relies solely on client-provided `file.name` extension and `file.type`, and uploads them directly to Supabase Storage:
  ```typescript
  await supabaseAdmin.storage.from('document-assets').upload(fileName, buffer, {
    contentType: contentType,
    upsert: true
  })
  ```
  It has no rate limiting, no magic byte checking, and creates the storage bucket as `public: true`.
- **Impact:**
  Attackers can upload arbitrary HTML/malware/phishing files, exhausting storage quota or hosting malicious content on the application's domain.
- **Actionable Remediation:**
  1. Restrict the endpoint with rate limiting or require user/guest session binding.
  2. Validate file magic bytes (PDF header `%PDF-`, DOCX ZIP header `PK\x03\x04`).
  3. Strip dangerous metadata or store files in a private bucket accessible only via signed temporary URLs.

---

### [HIGH-04] Insecure HTML Sanitizer Configuration
- **Severity:** `High`
- **OWASP Category:** A03:2021 – Injection (Cross-Site Scripting)
- **Location:** `lib/sanitize.ts` (Lines 12, 18, 103-106)
- **Vulnerability Mechanics:**
  The sanitizer options allow:
  - Tags: `'iframe'`, `'foreignobject'`, `'foreignObject'`
  - Schemes: `'data'`
  - Option: `allowVulnerableTags: true`
  - Style: `'background-image': [/^\s*[\s\S]+$/]`
- **Impact:**
  An attacker or compromised editor can insert:
  `<iframe src="data:text/html,<script>alert(document.cookie)</script>">`
  or SVG `<foreignObject>` tags containing HTML scripts. The sanitizer preserves them, leading to XSS execution when rendered via `MarkdownRenderer`.
- **Actionable Remediation:**
  1. Remove `iframe`, `foreignobject`, `foreignObject` from `ALLOWED_TAGS`.
  2. Remove `data` from `allowedSchemes` (or restrict it to image-only contexts like `allowedSchemesByTag: { img: ['data'] }`).
  3. Remove `allowVulnerableTags: true`.

---

### [HIGH-05] Content Security Policy (CSP) Neutralization
- **Severity:** `High`
- **OWASP Category:** A05:2021 – Security Misconfiguration
- **Location:** `next.config.js` (Line 48)
- **Vulnerability Mechanics:**
  The `script-src` directive in `Content-Security-Policy` contains the wildcard `https:` scheme:
  ```javascript
  const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-inline'${scriptSrcEval} https: https://us.i.posthog.com ...`
  ```
- **Impact:**
  Allowing `https:` in `script-src` permits script execution from *any* HTTPS domain worldwide (e.g. `https://evil.com/payload.js`). This undermines CSP defense-in-depth against XSS.
- **Actionable Remediation:**
  Remove `https:` from `script-src`. Explicitly enumerate allowed third-party script origins.

---

### [HIGH-06] SSRF via DNS Rebinding in Admin Link Checker
- **Severity:** `High`
- **OWASP Category:** A10:2021 – Server-Side Request Forgery
- **Location:** `app/api/admin/check-link/route.ts` (Lines 33-47 & 76-97)
- **Vulnerability Mechanics:**
  `isSafeUrl()` checks `hostname` strings against a regex for IP patterns. It does not resolve DNS records. A domain like `169.254.169.254.nip.io` or an attacker domain with low TTL pointing to `127.0.0.1` passes the string check. In addition, `fetch(url)` follows HTTP redirects (`redirect: 'follow'`), allowing any public server to redirect the fetch to internal loopback or cloud metadata IPs.
- **Actionable Remediation:**
  1. Resolve DNS records prior to fetching (or pin DNS).
  2. Pass `redirect: 'error'` to `fetch()`.

---

## 2. Medium Severity Findings

- **[MED-01] PostgREST Filter Injection in Push Notification Send:**  
  *Location:* `app/api/notifications/send/route.ts` (Line 53)  
  *Issue:* Direct interpolation of `targetCategory` into PostgREST syntax: `query.or(\`categories.cs.{"${targetCategory}"},categories.cs.{"all"}\`)`.  
  *Fix:* Validate `category` against an enum allowlist (`/^[a-z0-9_-]+$/i`) or use parameterized Supabase array filters (`.contains('categories', [targetCategory])`).

- **[MED-02] Timing Attack Risk in Cron Secret Comparisons:**  
  *Location:* `lib/cron-auth.ts` (Line 25) & `app/api/newsletter/send-weekly-digest/route.ts` (Line 23)  
  *Issue:* Plain string comparison `authHeader !== \`Bearer \${cronSecret}\`` short-circuits.  
  *Fix:* Replace with `safeCompare(authHeader, \`Bearer \${cronSecret}\`)` using `crypto.timingSafeEqual`.

- **[MED-03] In-Memory Rate Limiting Flaw on Serverless:**  
  *Location:* `lib/api-key-auth.ts` (Lines 75-78 & 294-313)  
  *Issue:* `inMemoryRequestCount` uses an in-memory `Map`. On serverless (Vercel lambdas), state is reset across cold starts and split across instances.  
  *Fix:* Route key rate limiting through Redis (`@upstash/ratelimit`).

- **[MED-04] Redis Atomicity Race Condition in Contact Form & Subscribe:**  
  *Location:* `app/api/contact/route.ts` (Lines 30-33) & `app/api/subscribe/route.ts` (Lines 48-51)  
  *Issue:* Separate `incr()` followed by `expire()`. Process interruption leaves keys without TTL.  
  *Fix:* Use `@upstash/ratelimit` sliding window or Redis `pipeline` with multi-command execution.

- **[MED-05] Insecure Rate Limit Keying in Rule Engine Classifier:**  
  *Location:* `app/api/rule-engine/classify/route.ts` (Lines 142-144)  
  *Issue:* `const rateLimitId = userId || 'anonymous'`. Attackers can cycle `userId` values, and all anonymous users exhaust a shared bucket of 20 requests.  
  *Fix:* Key rate limiting by verified client IP address.

- **[MED-06] Database Secondary Client Misconfiguration:**  
  *Location:* `lib/supabase-factory.ts` (Line 59)  
  *Issue:* `getSupabaseDocumentsClient()` reads `NEXT_PUBLIC_SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE2_URL`.  
  *Fix:* Update client initializer to use `NEXT_PUBLIC_SUPABASE2_URL` and `NEXT_PUBLIC_SUPABASE2_ANON_KEY`.

- **[MED-07] Git Tracking of `.env.production`:**  
  *Location:* `.env.production`  
  *Issue:* File is tracked in git index despite being in `.gitignore`.  
  *Fix:* Run `git rm --cached .env.production` and verify no private secrets are added.

---

## 3. Low Severity & Best Practice Recommendations

- **[LOW-01] Missing `SET search_path` on PostgreSQL Security Definer Functions:**  
  *Location:* `supabase/migrations/20260807000000_rls_security_hardening_v2.sql` (`get_table_size`), `20260615000001_category_counts_rpc.sql`  
  *Recommendation:* Always add `SET search_path = public, pg_temp;` and revoke `EXECUTE` permissions from `PUBLIC` and `anon`.

- **[LOW-02] Third-Party Free Proxy Dependency in RBI Cron Route:**  
  *Location:* `app/api/cron/update-rbi-rates/route.ts` (Line 45)  
  *Recommendation:* Replace `api.allorigins.win` with direct HTTPS fetch or internal scraper proxy to avoid third-party tampering.

- **[LOW-03] Input Boundary Schema Validation (Zod):**  
  *Location:* Across public endpoints (`/api/compliance/suggest`, `/api/documents/generate`, `/api/rule-engine/conflict-check`).  
  *Recommendation:* Standardize all `request.json()` ingestion through strict Zod schemas with string length caps.

- **[LOW-04] Prompt Injection Sanitization in Document Generation:**  
  *Location:* `app/api/documents/generate/route.ts` (Line 278)  
  *Recommendation:* Pass `customInstructions` through `sanitizeUserPrompt` before injecting into Gemini LLM prompt templates.
