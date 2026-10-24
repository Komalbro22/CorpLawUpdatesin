import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { slugify, calculateReadingTime, extractFirstImage } from '@/lib/utils'
import { submitToIndexNow } from '@/lib/indexnow'
import { submitUrlsToGoogleIndexing } from '@/lib/google-indexing'
import { articleSchema } from '@/lib/admin-schemas'
import { revalidateArticleMutation } from '@/lib/content-revalidation'
import {
  verifyAdminOrKey,
  getIdempotentResponse,
  storeIdempotentResponse,
  logApiAudit,
  getClientIp,
} from '@/lib/api-key-auth'
import { evaluateArticleIndexQuality } from '@/lib/content-quality'

export const dynamic = 'force-dynamic'

const MAX_ARTICLES_BATCH_SIZE = 50
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'

const ALLOWED_ARTICLE_FIELDS = new Set([
  'title', 'slug', 'summary', 'content', 'category', 'is_sponsored', 'sponsor_name',
  'contributor_name', 'hold_external_links', 'hide_from_listings', 'noindex',
  'published_at', 'is_featured', 'effective_date', 'featured_image_url', 'impact_level',
  'source_name', 'source_url', 'sources', 'key_change', 'key_changes', 'tags',
  'views', 'seo_title', 'seo_description', 'quick_answer', 'regulation_ref',
  'last_verified', 'last_amended', 'key_takeaways', 'has_steps', 'steps_json',
  'reading_time',
  // Aliases
  'key_change_pill', 'tldr', 'last_verified_date',
])

interface BulkArticleResult {
  index: number
  id?: string
  title?: string
  slug?: string
  status: 'created' | 'updated' | 'skipped' | 'error'
  word_count?: number
  noindex?: boolean
  is_indexed?: boolean
  error?: string
  message?: string
}

export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'articles:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  const clientIp = getClientIp(request)

  if (idempotencyKey) {
    const cached = await getIdempotentResponse(idempotencyKey, '/api/admin/articles/bulk')
    if (cached.exists) {
      return NextResponse.json(cached.responseBody, { status: cached.statusCode || 200 })
    }
  }

  try {
    const rawBody = await request.json()
    const rawArticles = rawBody.articles || rawBody.items

    if (!Array.isArray(rawArticles) || rawArticles.length === 0) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payload must include a non-empty "articles" array.',
        }
      }, { status: 400 })
    }

    if (rawArticles.length > MAX_ARTICLES_BATCH_SIZE) {
      return NextResponse.json({
        error: {
          code: 'BATCH_LIMIT_EXCEEDED',
          message: `Batch size (${rawArticles.length}) exceeds maximum limit of ${MAX_ARTICLES_BATCH_SIZE} articles per request.`,
        }
      }, { status: 400 })
    }

    const onConflict = (rawBody.on_conflict || 'skip').toLowerCase()
    const results: BulkArticleResult[] = []
    const toInsert: any[] = []
    const toUpdate: { id: string; payload: any; index: number }[] = []
    const affectedCategories = new Set<string>()
    const indexableUrlsToPing: string[] = []

    interface PreparedArticle {
      index: number
      title: string
      slug: string
      insertPayload: any
      wordCount: number
      noindex: boolean
      isIndexable: boolean
      category?: string | null
      qualityNote?: string
    }

    const preparedArticles: PreparedArticle[] = []
    const slugsToCheck: string[] = []

    for (let i = 0; i < rawArticles.length; i++) {
      const item = rawArticles[i]
      if (!item || typeof item !== 'object') {
        results.push({
          index: i,
          status: 'error',
          error: 'Item must be a valid article object.',
        })
        continue
      }

      // Check unrecognized fields
      const unrecognized = Object.keys(item).filter(k => !ALLOWED_ARTICLE_FIELDS.has(k))
      if (unrecognized.length > 0) {
        results.push({
          index: i,
          title: item.title,
          status: 'error',
          error: `Unrecognized field(s): ${unrecognized.map(f => `"${f}"`).join(', ')}.`,
        })
        continue
      }

      // Alias mapping
      const normalizedItem = { ...item }
      if (normalizedItem.key_change_pill !== undefined && normalizedItem.key_change === undefined) {
        normalizedItem.key_change = normalizedItem.key_change_pill
      }
      if (normalizedItem.tldr !== undefined && normalizedItem.key_changes === undefined) {
        normalizedItem.key_changes = Array.isArray(normalizedItem.tldr)
          ? normalizedItem.tldr
          : (typeof normalizedItem.tldr === 'string' ? [normalizedItem.tldr] : normalizedItem.tldr)
      }
      if (normalizedItem.last_verified_date !== undefined && normalizedItem.last_verified === undefined) {
        normalizedItem.last_verified = normalizedItem.last_verified_date
      }

      const parsed = articleSchema.safeParse(normalizedItem)
      if (!parsed.success) {
        results.push({
          index: i,
          title: item.title,
          slug: item.slug,
          status: 'error',
          error: `Validation error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
        })
        continue
      }

      const articleData = parsed.data
      const title = (articleData.title || '').trim()
      const summary = (articleData.summary || '').trim()

      if (!title || !summary) {
        results.push({
          index: i,
          status: 'error',
          error: 'Required fields "title" and "summary" are missing.',
        })
        continue
      }

      const slug = (articleData.slug || slugify(title)).trim()
      if (!slug) {
        results.push({
          index: i,
          title,
          status: 'error',
          error: 'A valid slug could not be determined.',
        })
        continue
      }

      // Normalize tags
      let finalTags: string[] = []
      if (Array.isArray(articleData.tags)) {
        finalTags = articleData.tags.map((t: any) => String(t).trim()).filter(Boolean)
      } else if (typeof articleData.tags === 'string') {
        finalTags = articleData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      }

      // Normalize sources
      let finalSources: any = null
      if (Array.isArray(articleData.sources)) {
        finalSources = articleData.sources.map((s: any) => {
          if (typeof s === 'string') return { name: s, url: s }
          return { name: s?.name || s?.url || '', url: s?.url || '' }
        }).filter((s: any) => s.url)
        if (finalSources.length === 0) finalSources = null
      } else if (typeof articleData.sources === 'string' && articleData.sources.trim()) {
        finalSources = [{ name: articleData.source_name || articleData.sources.trim(), url: articleData.sources.trim() }]
      }

      // Normalize key_changes
      let finalKeyChanges: string[] | null = null
      if (Array.isArray(articleData.key_changes)) {
        finalKeyChanges = articleData.key_changes.map((k: any) => typeof k === 'string' ? k.trim() : JSON.stringify(k)).filter(Boolean)
        if (finalKeyChanges.length === 0) finalKeyChanges = null
      } else if (typeof articleData.key_changes === 'string' && articleData.key_changes.trim()) {
        finalKeyChanges = [articleData.key_changes.trim()]
      }

      // Normalize key_takeaways
      let finalKeyTakeaways: string[] | null = null
      if (Array.isArray(articleData.key_takeaways)) {
        finalKeyTakeaways = articleData.key_takeaways.map((k: any) => typeof k === 'string' ? k.trim() : JSON.stringify(k)).filter(Boolean)
        if (finalKeyTakeaways.length === 0) finalKeyTakeaways = null
      } else if (typeof articleData.key_takeaways === 'string' && articleData.key_takeaways.trim()) {
        finalKeyTakeaways = [articleData.key_takeaways.trim()]
      }

      // 800-Word Quality Gate
      const quality = evaluateArticleIndexQuality(
        articleData.content,
        typeof articleData.noindex === 'boolean' ? articleData.noindex : undefined
      )

      const isPublished = Boolean(articleData.published_at)
      const isPastOrPresent = articleData.published_at
        ? new Date(articleData.published_at).getTime() <= Date.now() + 60000
        : false
      const isIndexable = isPublished && isPastOrPresent && !quality.noindex

      const payload = {
        title,
        slug,
        summary,
        content: articleData.content || '',
        category: articleData.category?.trim() || null,
        tags: finalTags,
        source_url: articleData.source_url || null,
        source_name: articleData.source_name || null,
        sources: finalSources,
        seo_title: articleData.seo_title || null,
        seo_description: articleData.seo_description || null,
        featured_image_url: articleData.featured_image_url || extractFirstImage(articleData.content || '') || null,
        published_at: articleData.published_at || null,
        is_featured: articleData.is_featured || false,
        is_sponsored: articleData.is_sponsored || false,
        sponsor_name: articleData.is_sponsored ? articleData.sponsor_name?.trim() || null : null,
        contributor_name: articleData.is_sponsored ? articleData.contributor_name?.trim() || null : null,
        hold_external_links: articleData.is_sponsored ? articleData.hold_external_links || false : false,
        hide_from_listings: articleData.hide_from_listings || false,
        noindex: quality.noindex,
        key_change: articleData.key_change || null,
        key_changes: finalKeyChanges,
        effective_date: articleData.effective_date || null,
        impact_level: articleData.impact_level || null,
        quick_answer: articleData.quick_answer || null,
        regulation_ref: articleData.regulation_ref || null,
        last_verified: articleData.last_verified || null,
        last_amended: articleData.last_amended || null,
        key_takeaways: finalKeyTakeaways,
        has_steps: articleData.has_steps || false,
        steps_json: articleData.steps_json || null,
        reading_time: calculateReadingTime(articleData.content || ''),
      }

      if (payload.category) {
        affectedCategories.add(payload.category)
      }

      preparedArticles.push({
        index: i,
        title,
        slug,
        insertPayload: payload,
        wordCount: quality.wordCount,
        noindex: quality.noindex,
        isIndexable,
        category: payload.category,
        qualityNote: quality.qualityNote,
      })
      slugsToCheck.push(slug)
    }

    // 2. Fetch existing slugs in batch
    const existingSlugsMap = new Map<string, { id: string; slug: string }>()
    if (slugsToCheck.length > 0) {
      const { data: existingRows } = await supabaseAdmin
        .from('updates')
        .select('id, slug')
        .in('slug', slugsToCheck)

      if (existingRows) {
        for (const row of existingRows) {
          existingSlugsMap.set(row.slug.toLowerCase(), row)
        }
      }
    }

    // 3. Separate into inserts, updates, and skips
    const pendingIndexResults = new Map<number, BulkArticleResult>()

    for (const prep of preparedArticles) {
      const existing = existingSlugsMap.get(prep.slug.toLowerCase())

      if (existing) {
        if (onConflict === 'update') {
          toUpdate.push({
            id: existing.id,
            payload: { ...prep.insertPayload, updated_at: new Date().toISOString() },
            index: prep.index,
          })
          pendingIndexResults.set(prep.index, {
            index: prep.index,
            id: existing.id,
            title: prep.title,
            slug: prep.slug,
            status: 'updated',
            word_count: prep.wordCount,
            noindex: prep.noindex,
            is_indexed: prep.isIndexable,
            message: prep.qualityNote,
          })
          if (prep.isIndexable) {
            indexableUrlsToPing.push(`${BASE_URL}/updates/${prep.slug}`)
          }
        } else {
          results.push({
            index: prep.index,
            id: existing.id,
            title: prep.title,
            slug: prep.slug,
            status: 'skipped',
            word_count: prep.wordCount,
            noindex: prep.noindex,
            is_indexed: false,
            message: `Article with slug "${prep.slug}" already exists and on_conflict is "${onConflict}".`,
          })
        }
      } else {
        toInsert.push({
          ...prep.insertPayload,
          _meta_index: prep.index,
          _meta_word_count: prep.wordCount,
          _meta_noindex: prep.noindex,
          _meta_indexable: prep.isIndexable,
          _meta_quality_note: prep.qualityNote,
        })
      }
    }

    // 4. Execute Batch Inserts
    if (toInsert.length > 0) {
      const cleanInserts = toInsert.map(({ _meta_index, _meta_word_count, _meta_noindex, _meta_indexable, _meta_quality_note, ...rest }) => rest)
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('updates')
        .insert(cleanInserts)
        .select('id, slug, title')

      if (insertError) {
        // Fallback: per-item insertion if batch rejected
        for (const item of toInsert) {
          const { _meta_index, _meta_word_count, _meta_noindex, _meta_indexable, _meta_quality_note, ...rest } = item
          const { data: singleInsert, error: singleError } = await supabaseAdmin
            .from('updates')
            .insert([rest])
            .select('id, slug, title')
            .single()

          if (singleError) {
            results.push({
              index: _meta_index,
              title: rest.title,
              slug: rest.slug,
              status: 'error',
              error: singleError.message,
            })
          } else {
            results.push({
              index: _meta_index,
              id: singleInsert.id,
              title: singleInsert.title,
              slug: singleInsert.slug,
              status: 'created',
              word_count: _meta_word_count,
              noindex: _meta_noindex,
              is_indexed: _meta_indexable,
              message: _meta_quality_note,
            })
            if (_meta_indexable) {
              indexableUrlsToPing.push(`${BASE_URL}/updates/${singleInsert.slug}`)
            }
          }
        }
      } else {
        for (let j = 0; j < toInsert.length; j++) {
          const meta = toInsert[j]
          const created = inserted?.[j]
          results.push({
            index: meta._meta_index,
            id: created?.id,
            title: created?.title || meta.title,
            slug: created?.slug || meta.slug,
            status: 'created',
            word_count: meta._meta_word_count,
            noindex: meta._meta_noindex,
            is_indexed: meta._meta_indexable,
            message: meta._meta_quality_note,
          })
          if (meta._meta_indexable && created?.slug) {
            indexableUrlsToPing.push(`${BASE_URL}/updates/${created.slug}`)
          }
        }
      }
    }

    // 5. Execute Updates
    for (const updateItem of toUpdate) {
      const { error: updErr } = await supabaseAdmin
        .from('updates')
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
      revalidateArticleMutation({
        slug: results.find(r => r.status === 'created' || r.status === 'updated')?.slug || '',
        category: Array.from(affectedCategories)[0] || undefined,
      })

      if (indexableUrlsToPing.length > 0) {
        submitToIndexNow(indexableUrlsToPing).catch(err =>
          console.error('[Articles Bulk] IndexNow submit failed:', err)
        )
        // Submit up to 10 URLs to Google Indexing API
        const googleBatch = indexableUrlsToPing.slice(0, 10)
        submitUrlsToGoogleIndexing(googleBatch).catch(err =>
          console.error('[Articles Bulk] Google Indexing submit failed:', err)
        )
      }
    }

    // 8. Audit Log
    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'article:bulk_create',
        entityType: 'article',
        ip: clientIp,
        status: failedCount === 0 ? 'success' : 'failure',
        details: {
          total: rawArticles.length,
          succeeded: succeededCount,
          skipped: skippedCount,
          failed: failedCount,
          on_conflict: onConflict,
        },
      })
    }

    const responsePayload = {
      success: failedCount === 0,
      total: rawArticles.length,
      succeeded: succeededCount,
      failed: failedCount,
      skipped: skippedCount,
      results,
    }

    if (idempotencyKey) {
      await storeIdempotentResponse(idempotencyKey, '/api/admin/articles/bulk', 200, responsePayload)
    }

    return NextResponse.json(responsePayload, { status: 200 })
  } catch (error: any) {
    console.error('[Articles Bulk API Error]', error)
    return NextResponse.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Internal server error',
      }
    }, { status: 500 })
  }
}
