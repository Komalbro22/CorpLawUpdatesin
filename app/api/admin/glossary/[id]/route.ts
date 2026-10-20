import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { glossarySchema } from '@/lib/admin-schemas'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('glossary')
      .select('id, term, slug, definition, category, keywords, synonyms, is_verified, related_terms, extended_note, faqs, created_at')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    return NextResponse.json({ term: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleGlossaryUpdate(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const rawBody = await request.json()
    const parsed = glossarySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }

    // 1. Fetch current database record to guarantee untouched fields are preserved byte-for-byte
    const { data: oldTerm, error: fetchError } = await supabaseAdmin
      .from('glossary')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !oldTerm) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    // 2. Parse existing extended_note & metadata block
    const rawExtendedNote = oldTerm.extended_note || ''
    const match = rawExtendedNote.match(/^\s*<!--\s*METADATA\s*([\s\S]*?)\s*METADATA\s*-->/)
    let existingMeta: Record<string, any> = {}
    let existingCleanBody = rawExtendedNote

    if (match) {
      try {
        existingMeta = JSON.parse(match[1])
        existingCleanBody = rawExtendedNote.substring(match[0].length).trim()
      } catch (e) {
        console.error('[Glossary API] Error parsing existing metadata:', e)
      }
    }

    // 3. Determine dirty fields
    const dirtyFieldsList = Array.isArray(rawBody.dirtyFields) ? rawBody.dirtyFields : null
    const isDirty = (field: string) => {
      if (dirtyFieldsList) return dirtyFieldsList.includes(field)
      return Object.prototype.hasOwnProperty.call(rawBody, field) && rawBody[field] !== undefined
    }

    const dbUpdates: Record<string, any> = {}

    // 4. Handle extended_note and structured metadata
    const metaFields = ['seo_title', 'seo_description', 'tldr', 'full_form', 'key_numbers', 'hide_definition']
    const anyMetaDirty = metaFields.some(f => isDirty(f))
    const isBodyDirty = isDirty('body') || isDirty('cleanContent')

    if (isDirty('extended_note')) {
      // Direct raw override if extended_note was explicitly provided
      dbUpdates.extended_note = rawBody.extended_note
    } else if (anyMetaDirty || isBodyDirty) {
      const mergedMeta = { ...existingMeta }

      if (isDirty('seo_title')) {
        if (rawBody.seo_title && String(rawBody.seo_title).trim()) {
          mergedMeta.seo_title = String(rawBody.seo_title).trim()
        } else {
          delete mergedMeta.seo_title
        }
      }

      if (isDirty('seo_description')) {
        if (rawBody.seo_description && String(rawBody.seo_description).trim()) {
          mergedMeta.seo_description = String(rawBody.seo_description).trim()
        } else {
          delete mergedMeta.seo_description
        }
      }

      if (isDirty('tldr')) {
        if (Array.isArray(rawBody.tldr) && rawBody.tldr.filter(Boolean).length > 0) {
          mergedMeta.tldr = rawBody.tldr.filter(Boolean)
        } else {
          delete mergedMeta.tldr
        }
      }

      if (isDirty('full_form')) {
        if (rawBody.full_form && String(rawBody.full_form).trim()) {
          mergedMeta.full_form = String(rawBody.full_form).trim()
        } else {
          delete mergedMeta.full_form
        }
      }

      if (isDirty('key_numbers')) {
        if (Array.isArray(rawBody.key_numbers) && rawBody.key_numbers.length > 0) {
          mergedMeta.key_numbers = rawBody.key_numbers
        } else {
          delete mergedMeta.key_numbers
        }
      }

      if (isDirty('hide_definition')) {
        mergedMeta.hide_definition = !!rawBody.hide_definition
      }

      const finalBody = isBodyDirty
        ? (rawBody.body !== undefined ? rawBody.body : rawBody.cleanContent)
        : existingCleanBody

      const hasMeta = Object.keys(mergedMeta).length > 0
      dbUpdates.extended_note = hasMeta
        ? `<!-- METADATA\n${JSON.stringify(mergedMeta, null, 2)}\nMETADATA -->\n\n${(finalBody || '').trim()}`
        : (finalBody || '')
    }

    // 5. Handle standard database columns with strict partial-save
    if (isDirty('term') && rawBody.term !== undefined) {
      dbUpdates.term = String(rawBody.term).trim()
    }
    if (isDirty('slug') && rawBody.slug !== undefined) {
      dbUpdates.slug = String(rawBody.slug).trim()
    }
    if (isDirty('category') && rawBody.category !== undefined) {
      dbUpdates.category = String(rawBody.category).trim()
    }
    if (isDirty('definition') && rawBody.definition !== undefined) {
      dbUpdates.definition = rawBody.definition
    }
    if (isDirty('is_verified') && rawBody.is_verified !== undefined) {
      dbUpdates.is_verified = !!rawBody.is_verified
    }
    if (isDirty('keywords') && rawBody.keywords !== undefined) {
      dbUpdates.keywords = Array.isArray(rawBody.keywords) ? rawBody.keywords : []
    }
    if (isDirty('synonyms') && rawBody.synonyms !== undefined) {
      dbUpdates.synonyms = Array.isArray(rawBody.synonyms) ? rawBody.synonyms : []
    }
    if (isDirty('related_terms') && rawBody.related_terms !== undefined) {
      dbUpdates.related_terms = Array.isArray(rawBody.related_terms) ? rawBody.related_terms : []
    }
    if (isDirty('faqs') && rawBody.faqs !== undefined) {
      dbUpdates.faqs = Array.isArray(rawBody.faqs)
        ? rawBody.faqs
            .map((f: any) => ({
              q: (f.q || f.question || '').trim(),
              a: (f.a || f.answer || '').trim()
            }))
            .filter((f: any) => f.q && f.a)
        : []
    }

    // 6. No-op check: if nothing was modified, return oldTerm directly without write
    if (Object.keys(dbUpdates).length === 0) {
      return NextResponse.json({ term: oldTerm, message: 'No changes detected' })
    }

    // 7. Execute update
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('glossary')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || 'Update failed' }, { status: 500 })
    }

    // 8. Revalidate ISR caches
    revalidatePath('/glossary', 'layout')
    revalidatePath('/sitemap.xml')
    revalidatePath(`/glossary/${oldTerm.slug}`, 'page')
    if (updated.slug && updated.slug !== oldTerm.slug) {
      revalidatePath(`/glossary/${updated.slug}`, 'page')
    }

    return NextResponse.json({ term: updated })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleGlossaryUpdate(request, params)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleGlossaryUpdate(request, params)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { data: term } = await supabaseAdmin
      .from('glossary')
      .select('slug')
      .eq('id', id)
      .single()

    const { error } = await supabaseAdmin
      .from('glossary')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/glossary', 'layout')
    revalidatePath('/sitemap.xml')
    if (term?.slug) {
      revalidatePath(`/glossary/${term.slug}`, 'page')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
