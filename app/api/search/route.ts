import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

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

interface UnifiedSearchResult {
  type: 'article' | 'calendar'
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
        `title.ilike.%${q}%,` +
        `summary.ilike.%${q}%,` +
        `key_change.ilike.%${q}%`
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
        `form_name.ilike.%${q}%,` +
        `compliance_title.ilike.%${q}%,` +
        `applicable_to.ilike.%${q}%`
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
      url: '/calendar',
    })))
  }

  return NextResponse.json({
    results,
    total: results.length,
    query: q,
  })
}
