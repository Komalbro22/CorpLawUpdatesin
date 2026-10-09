# Web Performance & Core Web Vitals Audit Report
**Target Website:** `https://corplawupdates.in` / `https://www.corplawupdates.in`  
**Execution Date:** 09 October 2026  
**Auditor:** Next.js & React Performance Engineer  
**Infrastructure Stack:** Next.js 16.4.0 (App Router), React 19.3.0, Tailwind CSS 4.3.3, Cloudflare Edge CDN, Vercel Serverless (Singapore `sin1`).

---

## 1. Hosting Architecture & Delivery Topology

CorpLawUpdates.in utilizes a dual-tier CDN and serverless architecture:
1. **Edge Tier:** Cloudflare Anycast CDN providing global TLS termination, Brotli compression, and distributed caching.
2. **Compute Tier:** Vercel Serverless runtime located in the Singapore (`sin1`) region.
3. **Caching Strategy:** Incremental Static Regeneration (ISR) with cache lifetimes configured between 1,800s (30m) and 43,200s (12h) across content hubs and detail pages.

---

## 2. Lab & Field Measurements Summary

### 2.1. Network & Delivery Latency (Lab Probes)

| Route Archetype | Sample URL | TTFB (CDN Hit) | TTFB (Origin Revalidate) | Status Header |
| :--- | :--- | :--- | :--- | :--- |
| **Homepage** | `https://www.corplawupdates.in/` | ~42 ms | ~480 ms | `cf-cache-status: HIT` |
| **Article Detail** | `/updates/rbi-repo-rate-hike-5-50-percent-october-2026` | ~58 ms | ~520 ms | `cf-cache-status: HIT` |
| **Category Hub** | `/category/mca` | ~45 ms | ~410 ms | `cf-cache-status: HIT` |
| **Tool (Dynamic)** | `/tools/roc-tracker` | ~75 ms | ~390 ms | `cf-cache-status: DYNAMIC` |

### 2.2. Core Web Vitals Health Profile

| Core Web Vital | Metric Target | Observed Baseline | Rating | Primary Bottleneck |
| :--- | :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | ≤ 2.5 s | ~2.1 s – 2.8 s | **Needs Improvement** | Hero image lazy-loading (`loading="lazy"`) delays discovery. |
| **INP (Interaction to Next Paint)** | ≤ 200 ms | ~45 ms – 95 ms | **Good** | Client hydration overhead is low; islands are well-scoped. |
| **CLS (Cumulative Layout Shift)** | ≤ 0.1 | ~0.02 – 0.06 | **Good** | Stable layouts; fixed dimensions on cards. |
| **FCP (First Contentful Paint)** | ≤ 1.8 s | ~1.4 s – 1.9 s | **Needs Improvement** | Render-blocking CSS bundle (~454 KB uncompressed). |

---

## 3. Confirmed Performance Bottlenecks

### 3.1. [MEDIUM] PERF-001: Oversized CSS Bundle (~454 KB Uncompressed)
- **Evidence:** SquirrelScan finding `perf/css-file-size` flagged static CSS chunk `/_next/static/chunks/3a8dflhddbejk.css` measuring **464,851 bytes (454.0 KB)** uncompressed.
- **Root Cause:**
  - `globals.css` and Next.js compilation include complete Tailwind v4 typography defaults, full markdown table formatting, and styling classes intended for the CMS markdown editor (`@uiw/react-md-editor`).
- **User Impact:** Browsers must download, parse, and evaluate 454 KB of stylesheet data before First Contentful Paint can render the first pixel.
- **Recommended Fix:**
  - Isolate CMS markdown editor styles to `app/admin/*` routes only.
  - Review `postcss.config.mjs` and Tailwind 4 purge configurations to eliminate unused typography and prose utility permutations.

---

### 3.2. [MEDIUM] PERF-002: Lazy Loading Configured on Above-Fold LCP Images
- **Evidence:** SquirrelScan finding `perf/lazy-above-fold` identified that hero card images on the homepage (`/`) and author profile page (`/author/komalpreet-singh`) are rendered with `loading="lazy"`:
  - `https://i.ibb.co/Cspr3x01/RBI-Rate-Hike-October-2026.jpg` (via `/api/image-proxy`)
  - `https://i.ibb.co/HLzBdGXJ/rbi-master-direction-note-sorting-machines-2026.jpg`
- **Root Cause:** Reusable component `UpdateCard.tsx` or `FeaturedArticle.tsx` unconditionally applies `loading="lazy"` to all image elements, including the first element visible in the viewport upon initial load.
- **User Impact:** Browser rendering engines defer network requests for lazy-loaded images until the layout phase determines their viewport intersection, needlessly inflating Largest Contentful Paint (LCP) by 300–800 ms.
- **Recommended Fix:**
  - Pass a `priority={true}` or `loading={isPriority ? "eager" : "lazy"}` prop to the first featured card on list and home pages.
  - Add `fetchpriority="high"` to hero images.

---

### 3.3. [LOW] PERF-003: Missing HTTP Cache Validators (ETag / Last-Modified)
- **Evidence:** SquirrelScan finding `perf/bad-caching` recorded that 98 out of 100 crawled pages do not expose `ETag` or `Last-Modified` validation headers.
- **User Impact:** Returning visitors or intermediate caches cannot send conditional `If-None-Match` or `If-Modified-Since` requests, forcing full HTML payload re-transmissions even when content has not changed.
- **Recommended Fix:**
  - Ensure Next.js `generateEtags: true` is active in `next.config.js`.

---

## 4. Prioritized Optimization Roadmap

1. **Immediate (Sprint 1):** Add `priority` / `fetchpriority="high"` to hero cards on `/`, `/updates`, and `/author/*` to resolve LCP inflation.
2. **Short-Term (Sprint 2):** Decouple admin editor CSS from the public user bundle to reduce the primary CSS chunk from ~454 KB down to <150 KB.
3. **Medium-Term (Sprint 3):** Standardize ETag generation across edge-rendered routes.
