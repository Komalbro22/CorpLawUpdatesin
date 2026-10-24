/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRole } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { submitArticleToIndexNow } from '@/lib/indexnow'
import { submitArticleToGoogleIndexing } from '@/lib/google-indexing'
import { calculateReadingTime, extractFirstImage } from '@/lib/utils'
import { articleSchema } from '@/lib/admin-schemas'
import { revalidateArticleMutation } from '@/lib/content-revalidation'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { evaluateArticleIndexQuality } from '@/lib/content-quality'

export const dynamic = 'force-dynamic'

const ALLOWED_ARTICLE_FIELDS = new Set([
  'title', 'slug', 'summary', 'content', 'category', 'is_sponsored', 'sponsor_name',
  'contributor_name', 'hold_external_links', 'hide_from_listings', 'noindex',
  'published_at', 'is_featured', 'effective_date', 'featured_image_url', 'impact_level',
  'source_name', 'source_url', 'sources', 'key_change', 'key_changes', 'tags',
  'views', 'seo_title', 'seo_description', 'quick_answer', 'regulation_ref',
  'last_verified', 'last_amended', 'key_takeaways', 'has_steps', 'steps_json',
  'reading_time',
  // Aliases
  'key_change_pill', 'tldr', 'last_verified_date'
])

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await verifyAdminOrKey(request, 'articles:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { id } = await params
    const { data: article, error } = await supabaseAdmin
      .from('updates')
      .select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description, quick_answer, regulation_ref, last_verified, last_amended, key_takeaways, has_steps, steps_json, is_sponsored, sponsor_name, contributor_name, hold_external_links, hide_from_listings, noindex')
      .eq('id', id)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleArticleUpdate(request: NextRequest, params: Promise<{ id: string }>) {
  const authCheck = await verifyAdminOrKey(request, 'articles:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { id } = await params
    const rawBody = await request.json()

    // 1. Reject unknown / unrecognized fields
    const unrecognized = Object.keys(rawBody).filter(k => !ALLOWED_ARTICLE_FIELDS.has(k))
    if (unrecognized.length > 0) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Unrecognized field(s): ${unrecognized.map(f => `"${f}"`).join(', ')}. Please refer to the API reference for supported article fields.`
        }
      }, { status: 400 })
    }

    // 2. Map aliases
    if (rawBody.key_change_pill !== undefined && rawBody.key_change === undefined) {
      rawBody.key_change = rawBody.key_change_pill
    }
    if (rawBody.tldr !== undefined && rawBody.key_changes === undefined) {
      rawBody.key_changes = Array.isArray(rawBody.tldr) ? rawBody.tldr : (typeof rawBody.tldr === 'string' ? [rawBody.tldr] : rawBody.tldr)
    }
    if (rawBody.last_verified_date !== undefined && rawBody.last_verified === undefined) {
      rawBody.last_verified = rawBody.last_verified_date
    }

    const parsed = articleSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid article data',
          details: parsed.error.format()
        }
      }, { status: 400 })
    }
    const body = parsed.data

    const { data: oldArticle, error: fetchError } = await supabaseAdmin
      .from('updates')
      .select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description, quick_answer, regulation_ref, last_verified, last_amended, key_takeaways, has_steps, steps_json, is_sponsored, sponsor_name, contributor_name, hold_external_links, hide_from_listings, noindex')
      .eq('id', id)
      .single()

    if (fetchError || !oldArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Slug collision check: if slug is modified, ensure new slug is not already taken
    if (body.slug && body.slug !== oldArticle.slug) {
      const { data: collision } = await supabaseAdmin
        .from('updates')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .maybeSingle()

      if (collision) {
        return NextResponse.json(
          {
            error: {
              code: 'SLUG_CONFLICT',
              message: `Slug "${body.slug}" is already in use by another article.`,
            },
          },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, any> = { ...body }

    // Strip alias keys from updateData so they aren't sent to SQL
    delete updateData.key_change_pill
    delete updateData.tldr
    delete updateData.last_verified_date

    if (body.key_change_pill !== undefined && body.key_change === undefined) {
      updateData.key_change = body.key_change_pill
    }
    if (body.tldr !== undefined && body.key_changes === undefined) {
      updateData.key_changes = Array.isArray(body.tldr) ? body.tldr : (typeof body.tldr === 'string' ? [body.tldr] : body.tldr)
    }
    if (body.last_verified_date !== undefined && body.last_verified === undefined) {
      updateData.last_verified = body.last_verified_date
    }

    if (body.category !== undefined) {
      updateData.category = body.category?.trim() || null
    }
    if (body.is_sponsored === false) {
      updateData.sponsor_name = null
      updateData.contributor_name = null
      updateData.hold_external_links = false
    } else {
      if (body.sponsor_name !== undefined) updateData.sponsor_name = body.sponsor_name?.trim() || null
      if (body.hold_external_links !== undefined && body.is_sponsored === undefined) {
        updateData.hold_external_links = body.hold_external_links
      }
    }
    if (body.content !== undefined) {
      updateData.reading_time = calculateReadingTime(body.content || '')
      if (!body.featured_image_url && !oldArticle.featured_image_url) {
        updateData.featured_image_url = extractFirstImage(body.content || '') || null
      }
      if (body.noindex === undefined) {
        const quality = evaluateArticleIndexQuality(body.content, oldArticle.noindex)
        updateData.noindex = quality.noindex
      }
    }

    // Normalize tags if present
    if (body.tags !== undefined) {
      if (Array.isArray(body.tags)) {
        updateData.tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean)
      } else if (typeof body.tags === 'string') {
        updateData.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      } else {
        updateData.tags = []
      }
    }

    // Normalize sources if present
    if (body.sources !== undefined) {
      if (Array.isArray(body.sources)) {
        const sArr = body.sources.map((s: any) => {
          if (typeof s === 'string') return { name: s, url: s }
          return { name: s?.name || s?.url || '', url: s?.url || '' }
        }).filter((s: any) => s.url)
        updateData.sources = sArr.length > 0 ? sArr : null
      } else if (typeof body.sources === 'string' && body.sources.trim()) {
        updateData.sources = [{ name: body.source_name || body.sources.trim(), url: body.sources.trim() }]
      } else {
        updateData.sources = null
      }
    }

    // Normalize key_changes if present
    if (body.key_changes !== undefined) {
      if (Array.isArray(body.key_changes)) {
        const kcArr = body.key_changes.map((k: any) => typeof k === 'string' ? k.trim() : JSON.stringify(k)).filter(Boolean)
        updateData.key_changes = kcArr.length > 0 ? kcArr : null
      } else if (typeof body.key_changes === 'string' && body.key_changes.trim()) {
        updateData.key_changes = [body.key_changes.trim()]
      } else {
        updateData.key_changes = null
      }
    }

    // Normalize key_takeaways if present
    if (body.key_takeaways !== undefined) {
      if (Array.isArray(body.key_takeaways)) {
        const ktArr = body.key_takeaways.map((k: any) => typeof k === 'string' ? k.trim() : JSON.stringify(k)).filter(Boolean)
        updateData.key_takeaways = ktArr.length > 0 ? ktArr : null
      } else if (typeof body.key_takeaways === 'string' && body.key_takeaways.trim()) {
        updateData.key_takeaways = [body.key_takeaways.trim()]
      } else {
        updateData.key_takeaways = null
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data: updatedArticle, error: updateError } = await supabaseAdmin
      .from('updates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updatedArticle) {
      console.error('[Admin Articles PUT/PATCH] Update failed:', updateError)
      return NextResponse.json({
        error: {
          code: 'DATABASE_ERROR',
          message: updateError?.message || 'Failed to update article in database',
          details: updateError,
        }
      }, { status: 400 })
    }

    if (body.published_at && updatedArticle?.slug && !updatedArticle.noindex) {
      submitArticleToIndexNow(updatedArticle.slug).catch(
        err => console.error('IndexNow error:', err)
      )
      submitArticleToGoogleIndexing(updatedArticle.slug).catch(
        err => console.error('Google Indexing error:', err)
      )
    }

    revalidateArticleMutation({
      slug: updatedArticle?.slug || oldArticle.slug,
      category: updatedArticle?.category || oldArticle.category,
      oldSlug: oldArticle.slug,
      oldCategory: oldArticle.category,
    })

    // Audit log if key auth
    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'article:update',
        entityType: 'article',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { slug: updatedArticle.slug, updated_fields: Object.keys(body) },
      })
    }

    return NextResponse.json(updatedArticle)
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleArticleUpdate(request, context.params)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleArticleUpdate(request, context.params)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await verifyAdminOrKey(request, 'articles:delete')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  // Session role check: editors cannot delete
  if (authCheck.auth.type === 'session') {
    if (!(await verifyAdminRole(['admin']))) {
      return NextResponse.json({ error: 'Forbidden: Editors are not permitted to delete articles' }, { status: 403 })
    }
  }

  try {
    const { id } = await params

    // Fetch existing article first to inspect publish status
    const { data: existingArticle, error: fetchErr } = await supabaseAdmin
      .from('updates')
      .select('id, slug, category, published_at')
      .eq('id', id)
      .single()

    if (fetchErr || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // SAFETY RULE 1.6: API keys can NEVER delete a published article. Drafts/unpublished only!
    if (authCheck.auth.type === 'api_key' && existingArticle.published_at !== null) {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'article:delete_rejected',
        entityType: 'article',
        entityId: id,
        ip: clientIp,
        status: 'failure',
        details: { reason: 'Refused delete of published article' },
      })

      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'API keys cannot delete published articles. Unpublish the article first.',
          },
        },
        { status: 403 }
      )
    }

    const { data: deletedArticle, error } = await supabaseAdmin
      .from('updates')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error || !deletedArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (deletedArticle?.slug) {
      submitArticleToGoogleIndexing(deletedArticle.slug, 'URL_DELETED').catch(
        err => console.error('Google Indexing delete error:', err)
      )
    }

    revalidateArticleMutation({
      slug: deletedArticle?.slug,
      category: deletedArticle?.category,
    })

    // Audit log if key auth
    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'article:delete',
        entityType: 'article',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { slug: deletedArticle.slug },
      })
    }

    return NextResponse.json({ success: true, message: 'Article deleted' })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
