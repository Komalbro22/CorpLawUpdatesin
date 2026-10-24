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

export const dynamic = 'force-dynamic'

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
    const parsed = articleSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
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
        error: updateError?.message || 'Failed to update article in database',
        details: updateError,
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
