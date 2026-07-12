# CorpLawUpdates Full-Stack Audit — 2 July 2026

## Executive summary

The product has a strong feature base and unusually good technical SEO coverage, but it currently carries one confirmed production data-flow defect and two high-risk authorization patterns. The view counter is not fundamentally broken at the click-tracking stage: when Redis is enabled, views are buffered but never automatically flushed because `/api/cron/sync-views` is absent from `vercel.json`. This leaves database totals, homepage cards and DB-backed analytics stale.

Automated status: TypeScript passes; 133/133 Jest tests pass. The production build compiles and type-checks, but static generation could not complete in the restricted audit environment because approximately 350 routes perform network-backed page generation. Existing tests cover only the fee calculator.

## Priority findings

### P0 — fix before adding features

1. **View batches are never scheduled for synchronization.** `POST /api/views/[slug]` increments `view_batch:{slug}` in Redis, while persistent counts are updated only by `syncViewsAction`. `vercel.json` does not schedule `/api/cron/sync-views`. Add a cron (for example every 5–15 minutes), then verify the RPC migration is deployed. Prefer an idempotent queue/drain operation so a crash between database increment and Redis decrement cannot double-count.

2. **Cron endpoints fail open when `CRON_SECRET` is missing.** The view-sync, scheduled-newsletter and weekly-digest routes authorize all callers when the environment variable is absent. The local environment key list does not include `CRON_SECRET`. Fail closed: if the secret is missing, return 503/401. The weekly route also accepts `?force=true` and arbitrary `?testEmail=`, which becomes a public email-sending primitive in this state.

3. **The cron path deliberately bypasses admin authentication.** `syncViewsAction(true)` is callable only from server code today, but the corresponding GET route is public when the secret is absent. Separate the internal sync function from the authenticated server action, and authenticate the route unconditionally before calling it.

### P1 — correctness, security and reliability

4. **View counting has two competing client implementations.** `ViewsTracker` deduplicates forever with local storage but is unused; `ViewCounter` is used and records once per component mount with no durable deduplication. Choose one policy (recommended: one view per anonymous visitor/article per 24 hours using a signed first-party visitor ID plus server-side TTL), document it, and test it.

5. **Unknown slugs return success.** The view API increments Redis before checking that an article exists. Bots can create unlimited `view_batch:*` keys and popular-set entries for arbitrary slugs. Validate slug format, confirm a published article exists (cached), cap length, and return 404 for unknown slugs.

6. **IP extraction is spoofable and can collapse users.** Raw `x-forwarded-for` may contain a list; in non-proxy environments it is caller-controlled. Parse the trusted first proxy value and combine it with a privacy-safe visitor token. Five requests per minute also counts refreshes rather than unique views.

7. **View draining is not atomic.** The sync process reads a key, increments Postgres, then decrements Redis. A failure after the database update can replay views; concurrent syncs can overlap. Use a Lua/Redis transaction to rename or `GETDEL` a batch before persistence, with a retry/dead-letter strategy.

8. **Admin global search checks cookie presence, not signature/expiry.** Middleware protects normal `/admin/*` pages, but `/api/admin/search` is outside that matcher and accepts any `admin_session` cookie value. Replace the presence check with `verifyAdminSession()`.

9. **Global API caching policy is unsafe.** `next.config.js` assigns public five-minute caching to every non-admin API route, including POST-capable and personalized/dynamic endpoints. Route-level headers may override this inconsistently. Default APIs to `private, no-store`; opt in only read-only public endpoints with explicit cache keys.

10. **RPCs use `SECURITY DEFINER` without explicit hardening.** Set a fixed `search_path`, revoke public execute, then grant only required roles. `increment_views` should validate positive bounded increments and ideally return whether a row was updated.

11. **Admin session signing is home-grown and tied to the password.** It works, but password rotation invalidates every session and SHA-256 concatenation is less maintainable than HMAC. Use HMAC-SHA-256 with a dedicated high-entropy session secret, versioned payload, issued-at time, secure/httpOnly/sameSite cookies, and CSRF protection for mutations.

12. **Build-time data fetching is too broad and failure-noisy.** Roughly 350 static routes fetch external/database data during build. Network failure produced repeated `fetch failed` logs and prevented a clean audit build. Reduce `generateStaticParams`, make fetch failures explicit and bounded, and move long-tail pages to ISR/on-demand generation.

13. **Coverage gives false confidence.** Add integration tests for view POST/GET/sync, unknown slugs, Redis absent/present, cron auth missing/wrong/correct, admin API auth, subscription idempotency, document generation limits and SEO metadata/schema.

### P2 — UI, accessibility and quality of life

14. **The public homepage is content-rich but visually dense.** Popular articles, regulator tiles, latest updates, tools, newsletter and a second SEO prose section compete in one long flow. Shorten summaries on cards, strengthen section rhythm, and move the repetitive SEO prose into a compact “Why CorpLawUpdates” block.

15. **Counts lack context.** A bare number beside time is ambiguous. Use an eye icon or `aria-label`, consistently render “views”, and show “New” instead of `0 views` during the first few hours if that better fits product intent.

16. **Mobile navigation duplicates search UI in the DOM.** The live text extraction shows Search twice. Confirm hidden variants are actually removed from the accessibility tree and that only one `Ctrl+K` handler/dialog exists.

17. **Admin information architecture is crowded.** The sidebar has many peer-level destinations. Add collapsible groups, badges for pending suggestions/rule-learning items, recent items, and a command palette that supports actions—not only navigation.

18. **Admin workflow safety needs stronger affordances.** Add autosave/draft status, unsaved-change protection, preview at target breakpoints, scheduled publish, revision history, duplicate article, source-link validation and a publish checklist.

19. **Several files disable ESLint broadly.** Replace file-wide disables with narrow exceptions and typed API response models. Article editor and newsletter code are the highest-value targets.

20. **Dark/admin visual systems diverge.** Public UI uses navy/gold editorial styling while admin combines slate/amber/glass effects. Consolidate shared tokens, standardize focus rings, radii and field heights, and reserve glow effects for status/attention rather than decoration.

## View-count repair plan

1. Deploy and verify `20260701000000_add_views_rpc.sql`.
2. Add `CRON_SECRET` in every deployed environment and make all cron routes fail closed.
3. Add `/api/cron/sync-views` to `vercel.json` (5–15 minute cadence).
4. Replace read/increment/decrement with atomic batch claiming; persist claimed batches and retry failures.
5. Validate published slugs before Redis writes.
6. Replace `ViewCounter`/`ViewsTracker` with one tracker and a written uniqueness window.
7. Revalidate article, updates, homepage and analytics caches after a successful drain.
8. Add end-to-end tests and monitoring: pending batch size, oldest batch age, sync count, sync failures and DB/Redis divergence.

## SEO and AI-search audit

### Already strong

- Canonical www-host redirect and consistent production base URL.
- Dynamic sitemap, Google News sitemap, RSS feed, robots file, manifest and IndexNow support.
- Article metadata, Open Graph/Twitter images, breadcrumbs and JSON-LD components.
- `llms.txt` and `llms-full.txt` provide machine-readable discovery.
- Content includes summaries, sources, effective dates, quick answers, key changes and regulator taxonomy—excellent raw material for answer engines.

### Improve next

1. **Entity and trust graph:** add one authoritative `Organization` node with logo, legal/contact details, `sameAs`, editorial policy, corrections policy and author/editor entities. Link every `Article` via stable `@id`, `publisher`, `author`, `reviewedBy`, `isPartOf` and `about` entities.
2. **Legal-content freshness:** show and structure “published”, “last updated”, “last verified”, “effective from” and “superseded” separately. Add visible change history and automatic stale-content flags.
3. **Citation quality:** make each material claim traceable to an official MCA/SEBI/RBI/IBBI/NCLT source, including document number, issue date, page/paragraph where possible and archived URL.
4. **Answer-engine formatting:** use a concise answer first, followed by who is affected, effective date, required action, deadline, penalty, exceptions and primary sources. Keep tables in semantic HTML.
5. **Sitemap truthfulness:** several evergreen pages use `new Date()` on every sitemap generation, falsely signaling constant modification. Use actual content/deployment timestamps. Split sitemaps by content type once volume grows.
6. **`llms.txt` maintenance:** generate it from current routes/content instead of manually maintaining two files; include canonical content/licensing/citation preferences and avoid duplicating entire articles unnecessarily.
7. **Schema validation:** add CI checks for JSON-LD syntax, canonical uniqueness, metadata length, missing OG images, broken source links and accidental `noindex`.
8. **Programmatic content safeguards:** do not create thin pages for every query/form combination. Keep indexable pages editorially reviewed and differentiated.

## High-leverage additions

1. **Personal compliance workspace:** users select entity type, regulator exposure and financial year; the site produces a personalized calendar, reminders and change alerts. This creates repeat use without putting core content behind login.
2. **Regulation change graph:** connect circular → affected Act/rule/form → prior version → effective date → impacted entities → required actions. This is valuable to users and highly legible to search/AI systems.
3. **Source-diff viewer:** upload/link the new official circular and show what changed from the previous version, with human-reviewed highlights.
4. **“What applies to me?” wizard:** a short guided questionnaire that routes users to relevant updates, forms, deadlines, fees and document templates.
5. **Trust center:** editorial methodology, author credentials, correction log, source policy, AI-use disclosure and update SLA. For legal information, this will likely outperform another generic content feature.
6. **Operations observability:** one admin health page for cron status, last successful sync, Redis backlog, email queue, broken links, stale articles, failed AI calls, database latency and sitemap/feed freshness.

## Recommended implementation order

- **Day 1:** cron secret fail-closed, schedule view sync, protect admin search, validate slug.
- **Week 1:** atomic view drain, unified uniqueness policy, tests/monitoring, API cache policy.
- **Weeks 2–3:** admin publishing QoL, accessibility pass, build/ISR reduction, schema/entity graph.
- **Next product cycle:** personalized compliance workspace + regulation change graph + trust center.

## Verification performed

- `npx tsc --noEmit`: passed.
- `npm test -- --runInBand`: 133/133 passed (fee calculator only).
- `next build`: compilation and type checks passed; static generation was interrupted by restricted outbound networking and timed out during generation of 350 routes.
- Production homepage inspected on 2 July 2026; current cards with zero views and older cards with nonzero views corroborate the Redis/DB synchronization diagnosis.

