import { NextRequest, NextResponse } from 'next/server'
import { revalidateGlossaryMutation } from '@/lib/content-revalidation'
import { glossarySchema } from '@/lib/admin-schemas'
import { supabaseAdmin } from '@/lib/supabase-server'
import { slugify } from '@/lib/utils'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdminOrKey(request, 'glossary:read')
    if (!authCheck.success) {
      return authCheck.response
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit') || '50', 10) : undefined
    const offset = searchParams.has('offset') ? parseInt(searchParams.get('offset') || '0', 10) : undefined

    let query = supabaseAdmin
      .from('glossary')
      .select('id, term, slug, definition, category, keywords, synonyms, is_verified, related_terms, extended_note, faqs, created_at', { count: 'exact' })

    if (search) {
      query = query.or(`term.ilike.%${search}%,definition.ilike.%${search}%`)
    }
    if (category) {
      query = query.eq('category', category)
    }

    query = query.order('term', { ascending: true })

    if (limit !== undefined && offset !== undefined) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      terms: data ?? [],
      items: data ?? [],
      total: count ?? (data?.length || 0),
    })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminOrKey(request, 'glossary:write')
    if (!authCheck.success) {
      return authCheck.response
    }

    const clientIp = getClientIp(request)
    const rawBody = await request.json()
    const parsed = glossarySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }

    const term = (rawBody.term || '').trim()
    if (!term) {
      return NextResponse.json({ error: 'Term name is required' }, { status: 400 })
    }

    const slug = (rawBody.slug || slugify(term)).trim()
    if (!slug) {
      return NextResponse.json({ error: 'A valid slug is required' }, { status: 400 })
    }

    // Check slug uniqueness
    const { data: existingSlug } = await supabaseAdmin
      .from('glossary')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingSlug) {
      return NextResponse.json({ error: `A glossary term with slug "${slug}" already exists.` }, { status: 400 })
    }

    // Build structured metadata block if provided
    const metaObj: Record<string, any> = {}
    if (rawBody.seo_title && String(rawBody.seo_title).trim()) {
      metaObj.seo_title = String(rawBody.seo_title).trim()
    }
    if (rawBody.seo_description && String(rawBody.seo_description).trim()) {
      metaObj.seo_description = String(rawBody.seo_description).trim()
    }
    if (Array.isArray(rawBody.tldr) && rawBody.tldr.filter(Boolean).length > 0) {
      metaObj.tldr = rawBody.tldr.filter(Boolean)
    }
    if (rawBody.full_form && String(rawBody.full_form).trim()) {
      metaObj.full_form = String(rawBody.full_form).trim()
    }
    if (Array.isArray(rawBody.key_numbers) && rawBody.key_numbers.length > 0) {
      metaObj.key_numbers = rawBody.key_numbers
    }
    if (rawBody.hide_definition) {
      metaObj.hide_definition = true
    }

    const bodyContent = rawBody.body !== undefined
      ? rawBody.body
      : (rawBody.cleanContent !== undefined ? rawBody.cleanContent : (rawBody.extended_note || ''))

    const hasMeta = Object.keys(metaObj).length > 0
    const finalExtendedNote = hasMeta
      ? `<!-- METADATA\n${JSON.stringify(metaObj, null, 2)}\nMETADATA -->\n\n${(bodyContent || '').trim()}`
      : (bodyContent || '')

    const insertPayload = {
      term,
      slug,
      definition: rawBody.definition || '',
      category: (rawBody.category || 'GENERAL').trim(),
      keywords: rawBody.keywords || [],
      synonyms: rawBody.synonyms || [],
      is_verified: rawBody.is_verified || false,
      related_terms: rawBody.related_terms || [],
      extended_note: finalExtendedNote,
      faqs: rawBody.faqs || [],
    }

    const { data, error } = await supabaseAdmin
      .from('glossary')
      .insert([insertPayload])
      .select()
      .single()

    if (error) {
      console.error('[Glossary API] Insert Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateGlossaryMutation({
      slug: data.slug,
      category: data.category,
    })

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'glossary:create',
        entityType: 'glossary',
        entityId: data.id,
        ip: clientIp,
        status: 'success',
        details: { slug: data.slug, term: data.term },
      })
    }

    return NextResponse.json({ term: data }, { status: 201 })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
