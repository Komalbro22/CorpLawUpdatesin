<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guidelines & Versioning Rules for AI Agents

### 🏷️ Semantic Versioning Rules (`package.json`)
Whenever making major architectural updates, adding new features, or releasing bug patches, bump the `"version"` field in `package.json` according to SemVer principles:

- **`npm version patch`** (e.g. `2.2.0` → `2.2.1`): For bug fixes, UI polish, scraper patches, and performance optimizations.
- **`npm version minor`** (e.g. `2.2.0` → `2.3.0`): For new feature additions (e.g. new calculators, new regulator portals, new admin workflows).
- **`npm version major`** (e.g. `2.2.0` → `3.0.0`): For major redesigns, breaking framework migrations, or large version overhauls.

### 🛡️ Production & Performance Safeguards
1. **Regulator Radar & External Scrapers**: All government scrapers must have an aggressive 6s per-task timeout and 8.5s API budget to prevent Vercel 504 serverless timeouts.
2. **Edge CDN & ISR Caching**: Maintain `revalidate` on public pages and immutable cache headers on static assets to keep Fast Origin Transfer < 10 GB on Vercel.
3. **Database Efficiency**: Keep Postgres queries lean with explicit column selections to preserve Supabase free tier limits.
