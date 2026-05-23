import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis and Ratelimit only if env vars are present (supports Vercel KV or direct Upstash)
const redisUrl = process.env.KV_REST_API_URL || process.env.corplawupdates_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.corplawupdates_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const hasUpstashConfig = redisUrl && redisToken
const redis = hasUpstashConfig ? new Redis({ url: redisUrl, token: redisToken }) : null

// Create a new ratelimiter that allows up to 30 search requests per minute per IP address
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
    })
  : null

interface UpdateRecord {
  id: string
  title: string
  slug: string
  summary: string
  category: string
  published_at: string
  impact_level: string
  key_change: string
}

interface CalendarRecord {
  id: string
  form_name: string
  compliance_title: string
  regulator: string
  due_date: string
  applicable_to: string
  penalty: string
}

interface GlossaryRecord {
  id: string
  term: string
  slug: string
  definition: string
  category: string
}

interface UnifiedSearchResult {
  type: 'article' | 'calendar' | 'glossary'
  id: string
  title: string
  slug?: string
  summary?: string
  category: string
  date?: string
  impact?: string
  due_date?: string
  url: string
}

export async function GET(request: Request) {
  // Rate Limit check
  if (ratelimit) {
    const rawIp = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const ip = rawIp.split(',')[0].trim()
    const { success } = await ratelimit.limit(`search_${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many search requests. Please slow down.' }, { status: 429 })
    }
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const category = searchParams.get('category') || ''
  const type = searchParams.get('type') || 'all'
  const impact = searchParams.get('impact') || ''

  if (q.length < 2) {
    return NextResponse.json({ 
      results: [], 
      total: 0 
    })
  }

  // Escape special characters for PostgREST .or() / .ilike() filter to avoid syntax errors and wildcard injection
  const escapedQ = q
    .replace(/\\/g, '\\\\')  // Escape backslash
    .replace(/%/g, '\\%')    // Escape wildcard %
    .replace(/_/g, '\\_')    // Escape wildcard _
    .replace(/,/g, '\\,')    // Escape comma to prevent .or() syntax breaking

  const results: UnifiedSearchResult[] = []

  // Search articles
  if (type === 'all' || type === 'articles') {
    let query = supabase
      .from('updates')
      .select(
        'id, title, slug, summary, category, ' +
        'published_at, impact_level, key_change'
      )
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .or(
        `title.ilike.%${escapedQ}%,` +
        `summary.ilike.%${escapedQ}%,` +
        `key_change.ilike.%${escapedQ}%`
      )
      .order('published_at', { ascending: false })
      .limit(10)

    if (category) {
      query = query.eq('category', category)
    }
    if (impact) {
      query = query.eq('impact_level', impact)
    }

    const { data: articles } = (await query) as { data: UpdateRecord[] | null }

    results.push(...(articles || []).map((a: UpdateRecord) => ({
      type: 'article' as const,
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      category: a.category,
      date: a.published_at,
      impact: a.impact_level,
      url: `/updates/${a.slug}`,
    })))
  }

  // Search calendar entries
  if (type === 'all' || type === 'calendar') {
    let calQuery = supabase
      .from('compliance_entries')
      .select(
        'id, form_name, compliance_title, ' +
        'regulator, due_date, applicable_to, penalty'
      )
      .eq('is_active', true)
      .or(
        `form_name.ilike.%${escapedQ}%,` +
        `compliance_title.ilike.%${escapedQ}%,` +
        `applicable_to.ilike.%${escapedQ}%`
      )
      .limit(5)

    if (category) {
      calQuery = calQuery.eq('regulator', category)
    }

    const { data: calEntries } = (await calQuery) as { data: CalendarRecord[] | null }

    results.push(...(calEntries || []).map((e: CalendarRecord) => ({
      type: 'calendar' as const,
      id: e.id,
      title: `${e.form_name} — ${e.compliance_title}`,
      category: e.regulator,
      due_date: e.due_date,
      applicable_to: e.applicable_to,
      url: `/calendar?highlight=${e.id}`,
    })))
  }

  // Search glossary terms (matching term, definition, keywords, and synonyms)
  if (type === 'all' || type === 'glossary') {
    const lowercaseQ = escapedQ.toLowerCase()
    const uppercaseQ = escapedQ.toUpperCase()

    let glossQuery = supabase
      .from('glossary')
      .select('id, term, slug, definition, category')
      .eq('is_verified', true)
      .or(
        `term.ilike.%${escapedQ}%,` +
        `definition.ilike.%${escapedQ}%,` +
        `synonyms.cs.{"${lowercaseQ}"},` +
        `synonyms.cs.{"${uppercaseQ}"},` +
        `synonyms.cs.{"${escapedQ}"},` +
        `keywords.cs.{"${lowercaseQ}"},` +
        `keywords.cs.{"${uppercaseQ}"},` +
        `keywords.cs.{"${escapedQ}"}`
      )
      .limit(5)

    if (category) {
      glossQuery = glossQuery.eq('category', category)
    }

    const { data: glossary } = (await glossQuery) as { data: GlossaryRecord[] | null }

    results.push(...(glossary || []).map((g: GlossaryRecord) => ({
      type: 'glossary' as const,
      id: g.id,
      title: g.term,
      slug: g.slug,
      summary: g.definition,
      category: g.category || 'GENERAL',
      url: `/glossary/${g.slug}`,
    })))
  }

  return NextResponse.json({
    results,
    total: results.length,
    query: q,
  })
}
