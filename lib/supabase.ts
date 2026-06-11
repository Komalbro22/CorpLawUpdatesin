// EGRESS BUDGET (updated: 2026-06-10)
// Homepage (featured×3 + latest×9):  ~12 KB/req, revalidate 30min  → ~0.6 GB/mo @ 1k req/day
// /updates list (10 cards):         ~8 KB/req,  revalidate 1hr    → ~0.6 GB/mo @ 1k req/day
// /updates/[slug] detail:           ~80 KB/req, ISR 1hr            → ~2.4 GB/mo @ 1k req/day
// /category/[cat] (12 cards):       ~10 KB/req, revalidate 1hr     → ~0.3 GB/mo @ 300 req/day
// /glossary index (~200 terms):     ~120 KB/req, revalidate 1hr    → ~0.9 GB/mo @ 100 req/day
// /glossary/[slug]:               ~25 KB/req,  revalidate 24hr    → ~0.2 GB/mo @ 100 req/day
// /calendar (~50 entries):          ~15 KB/req, revalidate 30min   → ~0.2 GB/mo @ 200 req/day
// Footer settings:                  ~0.5 KB/req, revalidate 1hr    → negligible (cached)
// View counter / search / subscribe: write-path only via service role — not counted in read egress
// Article images (Supabase Storage): served from CDN — monitor separately in Storage dashboard
// Total estimated read egress:        ~5.2 GB/mo (target: <4 GB — monitor after deploy)
//
// Key optimizations applied:
// - UPDATE_LIST_COLUMNS excludes `content` on all list/index pages
// - Category pages use DB-level pagination (no full-table fetch)
// - Glossary term pages cache 24h; hub caches 1h
// - No real-time subscriptions on public pages

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase public environment variables (NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
