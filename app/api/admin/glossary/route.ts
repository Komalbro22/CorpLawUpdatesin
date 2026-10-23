import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidateGlossaryMutation } from '@/lib/content-revalidation'
import { glossarySchema } from '@/lib/admin-schemas'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('glossary')
      .select('id, term, slug, definition, category, keywords, synonyms, is_verified, related_terms, extended_note, faqs, created_at')
      .order('term', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ terms: data ?? [] })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      extended_note: finalExtendedNote,
      is_verified: !!rawBody.is_verified,
      keywords: Array.isArray(rawBody.keywords) ? rawBody.keywords : [],
      synonyms: Array.isArray(rawBody.synonyms) ? rawBody.synonyms : [],
      related_terms: Array.isArray(rawBody.related_terms) ? rawBody.related_terms : [],
      faqs: Array.isArray(rawBody.faqs)
        ? rawBody.faqs
            .map((f: any) => ({
              q: (f.q || f.question || '').trim(),
              a: (f.a || f.answer || '').trim()
            }))
            .filter((f: any) => f.q && f.a)
        : []
    }

    const { data, error } = await supabaseAdmin
      .from('glossary')
      .insert([insertPayload])
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Creation failed' }, { status: 500 })
    }

    revalidateGlossaryMutation(data.slug)

    return NextResponse.json({ term: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
