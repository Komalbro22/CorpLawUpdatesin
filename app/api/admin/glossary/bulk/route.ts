import { NextRequest, NextResponse } from 'next/server'
import { revalidateGlossaryMutation } from '@/lib/content-revalidation'
import { glossarySchema } from '@/lib/admin-schemas'
import { supabaseAdmin } from '@/lib/supabase-server'
import { slugify } from '@/lib/utils'
import { submitToIndexNow } from '@/lib/indexnow'
import {
  verifyAdminOrKey,
  getIdempotentResponse,
  storeIdempotentResponse,
  logApiAudit,
  getClientIp,
} from '@/lib/api-key-auth'
import {
  evaluateGlossaryIndexQuality,
  parseGlossaryMetadata,
} from '@/lib/content-quality'

export const dynamic = 'force-dynamic'

const MAX_GLOSSARY_BATCH_SIZE = 100
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'

interface BulkGlossaryResult {
  index: number
  term?: string
  slug?: string
  status: 'created' | 'updated' | 'skipped' | 'error'
  word_count?: number
  is_indexed?: boolean
  error?: string
  message?: string
}

export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'glossary:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  const clientIp = getClientIp(request)

  if (idempotencyKey) {
    const cached = await getIdempotentResponse(idempotencyKey, '/api/admin/glossary/bulk')
    if (cached.exists) {
      return NextResponse.json(cached.responseBody, { status: cached.statusCode || 200 })
    }
  }

  try {
    const rawBody = await request.json()
    const rawTerms = rawBody.terms || rawBody.items

    if (!Array.isArray(rawTerms) || rawTerms.length === 0) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payload must include a non-empty "terms" array.',
        }
      }, { status: 400 })
    }

    if (rawTerms.length > MAX_GLOSSARY_BATCH_SIZE) {
      return NextResponse.json({
        error: {
          code: 'BATCH_LIMIT_EXCEEDED',
          message: `Batch size (${rawTerms.length}) exceeds maximum limit of ${MAX_GLOSSARY_BATCH_SIZE} items per request.`,
        }
      }, { status: 400 })
    }

    const onConflict = (rawBody.on_conflict || 'skip').toLowerCase()
    const results: BulkGlossaryResult[] = []
    const toInsert: any[] = []
    const toUpdate: { id: string; payload: any; index: number }[] = []
    const indexableUrlsToPing: string[] = []

    // 1. First pass: Pre-process each term and collect slugs
    interface PreparedTerm {
      index: number
      term: string
      slug: string
      insertPayload: any
      wordCount: number
      isIndexable: boolean
      qualityNote?: string
    }

    const preparedTerms: PreparedTerm[] = []
    const slugsToCheck: string[] = []

    for (let i = 0; i < rawTerms.length; i++) {
      const item = rawTerms[i]
      if (!item || typeof item !== 'object') {
        results.push({
          index: i,
          status: 'error',
          error: 'Item must be a valid glossary object.',
        })
        continue
      }

      const parsed = glossarySchema.safeParse(item)
      if (!parsed.success) {
        results.push({
          index: i,
          term: item.term,
          slug: item.slug,
          status: 'error',
          error: `Validation error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
        })
        continue
      }

      const termName = (item.term || '').trim()
      if (!termName) {
        results.push({
          index: i,
          status: 'error',
          error: 'Field "term" is required.',
        })
        continue
      }

      const slug = (item.slug || slugify(termName)).trim()
      if (!slug) {
        results.push({
          index: i,
          term: termName,
          status: 'error',
          error: 'A valid slug could not be determined for this term.',
        })
        continue
      }

      const bodyContent = item.body !== undefined
        ? item.body
        : (item.cleanContent !== undefined ? item.cleanContent : (item.extended_note || ''))

      const existingMeta = parseGlossaryMetadata(bodyContent)
      const metaObj: Record<string, any> = {}

      if (item.seo_title && String(item.seo_title).trim()) {
        metaObj.seo_title = String(item.seo_title).trim()
      } else if (existingMeta.seoTitle) {
        metaObj.seo_title = existingMeta.seoTitle
      }

      if (item.seo_description && String(item.seo_description).trim()) {
        metaObj.seo_description = String(item.seo_description).trim()
      } else if (existingMeta.seoDescription) {
        metaObj.seo_description = existingMeta.seoDescription
      }

      if (Array.isArray(item.tldr) && item.tldr.filter(Boolean).length > 0) {
        metaObj.tldr = item.tldr.filter(Boolean)
      } else if (existingMeta.tldr.length > 0) {
        metaObj.tldr = existingMeta.tldr
      }

      if (item.full_form && String(item.full_form).trim()) {
        metaObj.full_form = String(item.full_form).trim()
      } else if (existingMeta.fullForm) {
        metaObj.full_form = existingMeta.fullForm
      }

      if (Array.isArray(item.key_numbers) && item.key_numbers.length > 0) {
        metaObj.key_numbers = item.key_numbers
      } else if (existingMeta.keyNumbers.length > 0) {
        metaObj.key_numbers = existingMeta.keyNumbers
      }

      if (item.hide_definition !== undefined) {
        if (item.hide_definition) metaObj.hide_definition = true
      } else if (existingMeta.hideDefinition) {
        metaObj.hide_definition = true
      }

      // 800-Word Quality Gate
      const explicitNoindex = typeof item.noindex === 'boolean'
        ? item.noindex
        : (typeof existingMeta.noindex === 'boolean' ? existingMeta.noindex : undefined)

      const quality = evaluateGlossaryIndexQuality({
        definition: item.definition,
        extended_note: existingMeta.cleanContent || bodyContent,
        faqs: item.faqs,
      }, explicitNoindex)

      metaObj.noindex = quality.noindex
      metaObj.word_count = quality.wordCount

      const finalExtendedNote = `<!-- METADATA\n${JSON.stringify(metaObj, null, 2)}\nMETADATA -->\n\n${(existingMeta.cleanContent || bodyContent || '').trim()}`

      const payload = {
        term: termName,
        slug,
        definition: item.definition || '',
        category: (item.category || 'MCA').trim().toUpperCase(),
        keywords: item.keywords || [],
        synonyms: item.synonyms || [],
        is_verified: item.is_verified !== undefined ? !!item.is_verified : true,
        related_terms: item.related_terms || [],
        extended_note: finalExtendedNote,
        faqs: item.faqs || [],
      }

      preparedTerms.push({
        index: i,
        term: termName,
        slug,
        insertPayload: payload,
        wordCount: quality.wordCount,
        isIndexable: !quality.noindex && payload.is_verified,
        qualityNote: quality.qualityNote,
      })
      slugsToCheck.push(slug)
    }

    // 2. Fetch existing slugs in batch to avoid collision / handle conflict
    const existingSlugsMap = new Map<string, { id: string; slug: string }>()
    if (slugsToCheck.length > 0) {
      const { data: existingRows } = await supabaseAdmin
        .from('glossary')
        .select('id, slug')
        .in('slug', slugsToCheck)

      if (existingRows) {
        for (const row of existingRows) {
          existingSlugsMap.set(row.slug.toLowerCase(), row)
        }
      }
    }

    // 3. Separate into inserts, updates, and skips
    const pendingIndexResults = new Map<number, BulkGlossaryResult>()

    for (const prep of preparedTerms) {
      const existing = existingSlugsMap.get(prep.slug.toLowerCase())

      if (existing) {
        if (onConflict === 'update') {
          toUpdate.push({
            id: existing.id,
            payload: prep.insertPayload,
            index: prep.index,
          })
          pendingIndexResults.set(prep.index, {
            index: prep.index,
            term: prep.term,
            slug: prep.slug,
            status: 'updated',
            word_count: prep.wordCount,
            is_indexed: prep.isIndexable,
            message: prep.qualityNote,
          })
          if (prep.isIndexable) {
            indexableUrlsToPing.push(`${BASE_URL}/glossary/${prep.slug}`)
          }
        } else {
          results.push({
            index: prep.index,
            term: prep.term,
            slug: prep.slug,
            status: 'skipped',
            word_count: prep.wordCount,
            is_indexed: false,
            message: `Term with slug "${prep.slug}" already exists and on_conflict is "${onConflict}".`,
          })
        }
      } else {
        toInsert.push({
          ...prep.insertPayload,
          _meta_index: prep.index,
          _meta_word_count: prep.wordCount,
          _meta_indexable: prep.isIndexable,
          _meta_quality_note: prep.qualityNote,
        })
      }
    }

    // 4. Execute Batch Inserts
    if (toInsert.length > 0) {
      const cleanInserts = toInsert.map(({ _meta_index, _meta_word_count, _meta_indexable, _meta_quality_note, ...rest }) => rest)
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('glossary')
        .insert(cleanInserts)
        .select('id, slug, term')

      if (insertError) {
        // Fallback: per-item insertion if batch rejected
        for (const item of toInsert) {
          const { _meta_index, _meta_word_count, _meta_indexable, _meta_quality_note, ...rest } = item
          const { data: singleInsert, error: singleError } = await supabaseAdmin
            .from('glossary')
            .insert([rest])
            .select('id, slug, term')
            .single()

          if (singleError) {
            results.push({
              index: _meta_index,
              term: rest.term,
              slug: rest.slug,
              status: 'error',
              error: singleError.message,
            })
          } else {
            results.push({
              index: _meta_index,
              term: singleInsert.term,
              slug: singleInsert.slug,
              status: 'created',
              word_count: _meta_word_count,
              is_indexed: _meta_indexable,
              message: _meta_quality_note,
            })
            if (_meta_indexable) {
              indexableUrlsToPing.push(`${BASE_URL}/glossary/${singleInsert.slug}`)
            }
          }
        }
      } else {
        for (let j = 0; j < toInsert.length; j++) {
          const meta = toInsert[j]
          const created = inserted?.[j]
          results.push({
            index: meta._meta_index,
            term: created?.term || meta.term,
            slug: created?.slug || meta.slug,
            status: 'created',
            word_count: meta._meta_word_count,
            is_indexed: meta._meta_indexable,
            message: meta._meta_quality_note,
          })
          if (meta._meta_indexable && created?.slug) {
            indexableUrlsToPing.push(`${BASE_URL}/glossary/${created.slug}`)
          }
        }
      }
    }

    // 5. Execute Updates
    for (const updateItem of toUpdate) {
      const { error: updErr } = await supabaseAdmin
        .from('glossary')
        .update(updateItem.payload)
        .eq('id', updateItem.id)

      const res = pendingIndexResults.get(updateItem.index)!
      if (updErr) {
        res.status = 'error'
        res.error = updErr.message
      }
      results.push(res)
    }

    // 6. Sort results to maintain original index order
    results.sort((a, b) => a.index - b.index)

    const succeededCount = results.filter(r => r.status === 'created' || r.status === 'updated').length
    const skippedCount = results.filter(r => r.status === 'skipped').length
    const failedCount = results.filter(r => r.status === 'error').length

    // 7. Revalidation & Search Indexing
    if (succeededCount > 0) {
      revalidateGlossaryMutation()

      if (indexableUrlsToPing.length > 0) {
        submitToIndexNow(indexableUrlsToPing).catch(err =>
          console.error('[Glossary Bulk] IndexNow submit failed:', err)
        )
      }
    }

    // 8. Audit Log
    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'glossary:bulk_create',
        entityType: 'glossary',
        ip: clientIp,
        status: failedCount === 0 ? 'success' : 'failure',
        details: {
          total: rawTerms.length,
          succeeded: succeededCount,
          skipped: skippedCount,
          failed: failedCount,
          on_conflict: onConflict,
        },
      })
    }

    const responsePayload = {
      success: failedCount === 0,
      total: rawTerms.length,
      succeeded: succeededCount,
      failed: failedCount,
      skipped: skippedCount,
      results,
    }

    if (idempotencyKey) {
      await storeIdempotentResponse(idempotencyKey, '/api/admin/glossary/bulk', 200, responsePayload)
    }

    return NextResponse.json(responsePayload, { status: 200 })
  } catch (error: any) {
    console.error('[Glossary Bulk API Error]', error)
    return NextResponse.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Internal server error',
      }
    }, { status: 500 })
  }
}
