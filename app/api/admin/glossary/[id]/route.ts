import { NextRequest, NextResponse } from 'next/server'
import { revalidateGlossaryMutation } from '@/lib/content-revalidation'
import { glossarySchema } from '@/lib/admin-schemas'
import { verifyAdminRole } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { evaluateGlossaryIndexQuality } from '@/lib/content-quality'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminOrKey(request, 'glossary:read')
    if (!authCheck.success) {
      return authCheck.response
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
    const authCheck = await verifyAdminOrKey(request, 'glossary:write')
    if (!authCheck.success) {
      return authCheck.response
    }

    const clientIp = getClientIp(request)
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
    const metaFields = ['seo_title', 'seo_description', 'tldr', 'full_form', 'key_numbers', 'hide_definition', 'noindex']
    const anyMetaDirty = metaFields.some(f => isDirty(f))
    const isBodyDirty = isDirty('body') || isDirty('cleanContent')

    if (isDirty('extended_note')) {
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
        if (rawBody.hide_definition) {
          mergedMeta.hide_definition = true
        } else {
          delete mergedMeta.hide_definition
        }
      }

      if (isDirty('noindex')) {
        mergedMeta.noindex = !!rawBody.noindex
      }

      let targetBody = existingCleanBody
      if (isDirty('body')) {
        targetBody = rawBody.body || ''
      } else if (isDirty('cleanContent')) {
        targetBody = rawBody.cleanContent || ''
      }

      // Auto 800-Word Quality Gate
      const quality = evaluateGlossaryIndexQuality({
        definition: isDirty('definition') ? rawBody.definition : oldTerm.definition,
        extended_note: targetBody,
        faqs: isDirty('faqs') ? rawBody.faqs : oldTerm.faqs,
      }, typeof mergedMeta.noindex === 'boolean' ? mergedMeta.noindex : undefined)

      mergedMeta.noindex = quality.noindex
      mergedMeta.word_count = quality.wordCount

      const finalNote = `<!-- METADATA\n${JSON.stringify(mergedMeta, null, 2)}\nMETADATA -->\n\n${(targetBody || '').trim()}`

      dbUpdates.extended_note = finalNote
    }

    // 5. Update top-level fields only if dirty
    if (isDirty('term')) dbUpdates.term = (rawBody.term || '').trim()
    if (isDirty('slug')) {
      const nextSlug = (rawBody.slug || '').trim()
      if (nextSlug !== oldTerm.slug) {
        // Validate slug uniqueness
        const { data: collision } = await supabaseAdmin
          .from('glossary')
          .select('id')
          .eq('slug', nextSlug)
          .neq('id', id)
          .maybeSingle()

        if (collision) {
          return NextResponse.json(
            { error: { code: 'SLUG_CONFLICT', message: `A glossary term with slug "${nextSlug}" already exists.` } },
            { status: 409 }
          )
        }
        dbUpdates.slug = nextSlug
      }
    }
    if (isDirty('definition')) dbUpdates.definition = rawBody.definition || ''
    if (isDirty('category')) dbUpdates.category = (rawBody.category || 'MCA').trim().toUpperCase()
    if (isDirty('keywords')) dbUpdates.keywords = rawBody.keywords || []
    if (isDirty('synonyms')) dbUpdates.synonyms = rawBody.synonyms || []
    if (isDirty('is_verified')) dbUpdates.is_verified = Boolean(rawBody.is_verified)
    if (isDirty('related_terms')) dbUpdates.related_terms = rawBody.related_terms || []
    if (isDirty('faqs')) dbUpdates.faqs = rawBody.faqs || []

    // 6. Check if anything actually changed
    if (Object.keys(dbUpdates).length === 0) {
      return NextResponse.json({ term: oldTerm, message: 'No fields were modified' })
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
    revalidateGlossaryMutation(updated.slug, oldTerm.slug)

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'glossary:update',
        entityType: 'glossary',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { slug: updated.slug, modified_fields: Object.keys(dbUpdates) },
      })
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminOrKey(request, 'glossary:delete')
    if (!authCheck.success) {
      return authCheck.response
    }

    const clientIp = getClientIp(request)

    if (authCheck.auth.type === 'session') {
      if (!(await verifyAdminRole(['admin']))) {
        return NextResponse.json({ error: 'Forbidden: Editors are not permitted to delete glossary entries' }, { status: 403 })
      }
    }

    const { id } = await params
    const { data: term, error: fetchError } = await supabaseAdmin
      .from('glossary')
      .select('id, slug, is_verified, term')
      .eq('id', id)
      .single()

    if (fetchError || !term) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    // SAFETY RULE 1.6: API keys can never delete a verified/published glossary term
    if (authCheck.auth.type === 'api_key' && term.is_verified) {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'glossary:delete_rejected',
        entityType: 'glossary',
        entityId: id,
        ip: clientIp,
        status: 'failure',
        details: { reason: 'Refused delete of verified/published glossary term' },
      })

      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'API keys cannot delete verified/published glossary terms.',
          },
        },
        { status: 403 }
      )
    }

    const { error } = await supabaseAdmin
      .from('glossary')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateGlossaryMutation(term.slug)

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'glossary:delete',
        entityType: 'glossary',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { slug: term.slug },
      })
    }

    return NextResponse.json({ success: true, message: 'Glossary term deleted' })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
