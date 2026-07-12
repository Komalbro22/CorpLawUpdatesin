import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

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
  // Verify real admin session (checks signature + expiry, not just cookie presence)
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const results: UnifiedSearchResult[] = []

  // Search articles
  if (type === 'all' || type === 'articles') {
    let query = supabase
      .from('updates')
      .select(
        'id, title, slug, summary, category, ' +
        'published_at, impact_level, key_change'
      )

    if (category) {
      query = query.eq('category', category)
    }
    if (impact) {
      query = query.eq('impact_level', impact)
    }

    // Try Full-Text Search first
    const { data: ftsArticles, error } = await query
      .textSearch('search_vector', q, { config: 'english', type: 'websearch' })
      .order('published_at', { ascending: false })
      .limit(10) as { data: UpdateRecord[] | null, error: any }

    let articles = ftsArticles

    // Fallback if migration is not run / column doesn't exist yet
    if (error || !articles) {
      const escapedQ = q.replace(/[%_\\]/g, '\\$&')
      let fallbackQuery = supabase
        .from('updates')
        .select(
          'id, title, slug, summary, category, ' +
          'published_at, impact_level, key_change'
        )
        .or(`title.ilike.%${escapedQ}%,summary.ilike.%${escapedQ}%,key_change.ilike.%${escapedQ}%`)

      if (category) {
        fallbackQuery = fallbackQuery.eq('category', category)
      }
      if (impact) {
        fallbackQuery = fallbackQuery.eq('impact_level', impact)
      }

      const { data: fallbackData } = await fallbackQuery
        .order('published_at', { ascending: false })
        .limit(10) as { data: UpdateRecord[] | null }
      
      articles = fallbackData
    }

    results.push(...(articles || []).map((a: UpdateRecord) => ({
      type: 'article' as const,
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      category: a.category,
      date: a.published_at,
      impact: a.impact_level,
      url: `/admin/articles/${a.id}/edit`,
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

    if (category) {
      calQuery = calQuery.eq('regulator', category)
    }

    // Try Full-Text Search first
    const { data: ftsCalEntries, error: calError } = await calQuery
      .textSearch('search_vector', q, { config: 'english', type: 'websearch' })
      .limit(5) as { data: CalendarRecord[] | null, error: any }

    let calEntries = ftsCalEntries

    // Fallback if migration is not run / column doesn't exist yet
    if (calError || !calEntries) {
      const escapedQ = q.replace(/[%_\\]/g, '\\$&')
      let fallbackCalQuery = supabase
        .from('compliance_entries')
        .select(
          'id, form_name, compliance_title, ' +
          'regulator, due_date, applicable_to, penalty'
        )
        .or(`form_name.ilike.%${escapedQ}%,compliance_title.ilike.%${escapedQ}%,applicable_to.ilike.%${escapedQ}%`)

      if (category) {
        fallbackCalQuery = fallbackCalQuery.eq('regulator', category)
      }

      const { data: fallbackCalData } = await fallbackCalQuery.limit(5) as { data: CalendarRecord[] | null }
      calEntries = fallbackCalData
    }

    results.push(...(calEntries || []).map((e: CalendarRecord) => ({
      type: 'calendar' as const,
      id: e.id,
      title: `${e.form_name} — ${e.compliance_title}`,
      category: e.regulator,
      due_date: e.due_date,
      applicable_to: e.applicable_to,
      url: `/admin/compliance?highlight=${e.id}`,
    })))
  }

  // Search glossary terms
  if (type === 'all' || type === 'glossary') {
    let glossQuery = supabase
      .from('glossary')
      .select('id, term, slug, definition, category')

    if (category) {
      glossQuery = glossQuery.eq('category', category)
    }

    // Try Full-Text Search first
    const { data: ftsGlossary, error: glossError } = await glossQuery
      .textSearch('search_vector', q, { config: 'english', type: 'websearch' })
      .limit(5) as { data: GlossaryRecord[] | null, error: any }

    let glossary = ftsGlossary

    // Fallback if migration is not run / column doesn't exist yet
    if (glossError || !glossary) {
      const escapedQ = q.replace(/[%_\\]/g, '\\$&')
      let fallbackGlossQuery = supabase
        .from('glossary')
        .select('id, term, slug, definition, category')
        .or(`term.ilike.%${escapedQ}%,definition.ilike.%${escapedQ}%`)

      if (category) {
        fallbackGlossQuery = fallbackGlossQuery.eq('category', category)
      }

      const { data: fallbackGlossData } = await fallbackGlossQuery.limit(5) as { data: GlossaryRecord[] | null }
      glossary = fallbackGlossData
    }

    results.push(...(glossary || []).map((g: GlossaryRecord) => ({
      type: 'glossary' as const,
      id: g.id,
      title: g.term,
      slug: g.slug,
      summary: g.definition,
      category: g.category || 'GENERAL',
      url: `/admin/glossary/${g.id}/edit`,
    })))
  }

  return NextResponse.json({
    results,
    total: results.length,
    query: q,
  })
}
