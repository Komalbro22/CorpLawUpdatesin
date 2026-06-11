# CorpLawUpdates.in - Future Audit & Maintenance TODOs
Created on: 11 June 2026

The following items are Medium and Low priority issues discovered during the Full Codebase Audit. They should be addressed in upcoming sprints.

## 🟡 MEDIUM PRIORITY
1. **Performance (Images)**:
   - **File:** `app/documents/[slug]/page.tsx`
   - **Issue:** Uses raw HTML `<img>` tags extensively for document previews/letterheads. 
   - **Fix:** If these images do not absolutely need to be raw for copy-pasting to MS Word, migrate them to `next/image` to reduce bandwidth and enable lazy loading.

2. **UI/UX (Editor Warnings)**:
   - **Files:** `app/admin/articles/[id]/edit/page.tsx`, `app/admin/articles/new/page.tsx`
   - **Issue:** There is hardcoded SEO logic checking for `ibb.co` image URLs. 
   - **Fix:** While helpful, ensure all admin staff are trained to upload images directly to the Vercel/Supabase /public folder or the new designated CDN so third-party image hosts aren't used.

3. **Security (HTML Injection)**:
   - **File:** `components/MarkdownRenderer.tsx`
   - **Issue:** Uses `dangerouslySetInnerHTML`. 
   - **Fix:** It currently utilizes `sanitizeHtml`, which is good. Do a routine check to ensure the allowed tags configuration does not permit script injection (e.g., ensure `<iframe>` or `onload` handlers are strictly stripped).

## 🟢 LOW PRIORITY / QOL
1. **Responsive Design Padding**:
   - **File:** `app/category/[category]/page.tsx`
   - **Issue:** Mobile margins and padding might be slightly cramped depending on device sizes. A quick visual audit of mobile devices is recommended.

2. **SEO Metadata Structure**:
   - **Files:** `app/updates/[slug]/page.tsx`, `app/glossary/[slug]/page.tsx`, `app/calendar/page.tsx`
   - **Issue:** Schema (`application/ld+json`) is injected using raw `<script dangerouslySetInnerHTML={{...}}>`. 
   - **Fix:** Next.js 14 App Router natively supports exporting `JSON-LD` via the metadata API or via React components returning script tags. Refactoring this is cleaner but doesn't affect functionality or SEO rankings.
