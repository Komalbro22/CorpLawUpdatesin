/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { slugify, calculateReadingTime, extractFirstImage } from '@/lib/utils'
import { submitArticleToIndexNow } from '@/lib/indexnow'
import { submitArticleToGoogleIndexing } from '@/lib/google-indexing'
import { articleSchema } from '@/lib/admin-schemas'
import { revalidateArticleMutation } from '@/lib/content-revalidation'
import {
  verifyAdminOrKey,
  getIdempotentResponse,
  storeIdempotentResponse,
  logApiAudit,
  getClientIp,
} from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'articles:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = searchParams.has('offset')
      ? Math.max(0, parseInt(searchParams.get('offset') || '0'))
      : (page - 1) * limit
    const status = searchParams.get('status') || 'all'

    let query = supabaseAdmin
      .from('updates')
      .select('*', { count: 'exact' })

    if (category === 'Uncategorised') {
      query = query.is('category', null)
    } else if (category) {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    if (status === 'published') {
      query = query.not('published_at', 'is', null)
    } else if (status === 'draft') {
      query = query.is('published_at', null)
    }

    const from = offset
    const to = from + limit - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data: articles, count, error } = await query

    if (error) throw error

    const categories = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI', 'LABOUR', 'IFSCA', 'TAXATION']
    const categoryCounts: Record<string, number> = {}

    await Promise.all(
      categories.map(async (cat) => {
        const { count: catCount } = await supabaseAdmin
          .from('updates')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat)
        categoryCounts[cat] = catCount || 0
      })
    )
    const { count: uncategorisedCount } = await supabaseAdmin
      .from('updates')
      .select('*', { count: 'exact', head: true })
      .is('category', null)
    categoryCounts.Uncategorised = uncategorisedCount || 0

    const articlesWithCounts = articles?.map(a => {
      const wordCount = a.content ? a.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0
      const { content, ...rest } = a
      return { ...rest, word_count: wordCount }
    })

    return NextResponse.json({
      articles: articlesWithCounts || [],
      items: articlesWithCounts || [],
      total: count || 0,
      categoryCounts,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'articles:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  const clientIp = getClientIp(request)

  // 1. Check Idempotency Header
  if (idempotencyKey) {
    const cached = await getIdempotentResponse(idempotencyKey, '/api/admin/articles')
    if (cached.exists) {
      return NextResponse.json(cached.responseBody, { status: cached.statusCode || 200 })
    }
  }

  try {
    const rawBody = await request.json()
    const parsed = articleSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }
    const body = parsed.data
    const {
      title, slug, summary, content, category, tags,
      source_url, source_name, sources,
      seo_title, seo_description, featured_image_url,
      published_at, is_featured,
      key_change, key_changes, effective_date, impact_level,
      quick_answer, regulation_ref, last_verified, last_amended, key_takeaways, has_steps, steps_json,
      is_sponsored, sponsor_name, contributor_name, hold_external_links, hide_from_listings, noindex
    } = body

    if (!title || !summary) {
      return NextResponse.json({ error: 'Missing required fields: title and summary' }, { status: 400 })
    }

    let finalSlug = slug || slugify(title)
    let isUnique = false
    let attempt = 1

    while (!isUnique && attempt <= 10) {
      const { data } = await supabaseAdmin
        .from('updates')
        .select('slug')
        .eq('slug', finalSlug)
        .single()

      if (!data) {
        isUnique = true
      } else {
        attempt++
        finalSlug = `${slug || slugify(title)}-${attempt}`
      }
    }

    const { data: createdArticle, error } = await supabaseAdmin
      .from('updates')
      .insert({
        title,
        slug: finalSlug,
        summary,
        content: content || '',
        category: category?.trim() || null,
        tags: tags || [],
        source_url,
        source_name,
        sources: sources || null,
        seo_title: seo_title || null,
        seo_description: seo_description || null,
        featured_image_url: featured_image_url || extractFirstImage(content || '') || null,
        published_at,
        is_featured: is_featured || false,
        is_sponsored: is_sponsored || false,
        sponsor_name: is_sponsored ? sponsor_name?.trim() || null : null,
        contributor_name: is_sponsored ? contributor_name?.trim() || null : null,
        hold_external_links: is_sponsored ? hold_external_links || false : false,
        hide_from_listings: hide_from_listings || false,
        noindex: noindex || false,
        key_change: key_change || null,
        key_changes: key_changes || null,
        effective_date: effective_date || null,
        impact_level: impact_level || null,
        quick_answer: quick_answer || null,
        regulation_ref: regulation_ref || null,
        last_verified: last_verified || null,
        last_amended: last_amended || null,
        key_takeaways: key_takeaways || null,
        has_steps: has_steps || false,
        steps_json: steps_json || null,
        reading_time: calculateReadingTime(content || ''),
      })
      .select()
      .single()

    if (error || !createdArticle) {
      console.error('[Admin Articles POST] Insert failed:', error)
      return NextResponse.json({
        error: error?.message || 'Failed to create article in database',
        details: error,
      }, { status: 400 })
    }

    if (createdArticle?.slug && createdArticle?.published_at && !createdArticle.noindex) {
      submitArticleToIndexNow(createdArticle.slug).catch(
        err => console.error('IndexNow submit failed:', err)
      )
      submitArticleToGoogleIndexing(createdArticle.slug).catch(
        err => console.error('Google Indexing submit failed:', err)
      )
    }

    revalidateArticleMutation({
      slug: createdArticle?.slug,
      category: category?.trim() || createdArticle?.category,
    })

    // Audit log if key auth
    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'article:create',
        entityType: 'article',
        entityId: createdArticle.id,
        ip: clientIp,
        status: 'success',
        details: { slug: createdArticle.slug, title: createdArticle.title },
      })
    }

    // Store in idempotency cache if header present
    if (idempotencyKey) {
      await storeIdempotentResponse(idempotencyKey, '/api/admin/articles', 201, createdArticle)
    }

    return NextResponse.json(createdArticle, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
