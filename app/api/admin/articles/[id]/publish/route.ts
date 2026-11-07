import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { submitArticleToIndexNow } from '@/lib/indexnow'
import { submitArticleToGoogleIndexing } from '@/lib/google-indexing'
import { revalidateArticleMutation } from '@/lib/content-revalidation'
import { warmUpPublishedArticle } from '@/lib/cache-warmup'
import {
  verifyAdminOrKey,
  getIdempotentResponse,
  storeIdempotentResponse,
  logApiAudit,
  getClientIp,
} from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'articles:publish')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const idempotencyKey = request.headers.get('idempotency-key')
  const clientIp = getClientIp(request)

  if (idempotencyKey) {
    const cached = await getIdempotentResponse(idempotencyKey, `/api/admin/articles/${id}/publish`)
    if (cached.exists) {
      return NextResponse.json(cached.responseBody, { status: cached.statusCode || 200 })
    }
  }

  try {
    const publishedAt = new Date().toISOString()
    const { data: updatedArticle, error } = await supabaseAdmin
      .from('updates')
      .update({ published_at: publishedAt, updated_at: publishedAt })
      .eq('id', id)
      .select()
      .single()

    if (error || !updatedArticle) {
      return NextResponse.json({ error: 'Article not found or publish failed' }, { status: 404 })
    }

    if (updatedArticle?.slug && !updatedArticle.noindex) {
      try {
        await Promise.allSettled([
          submitArticleToIndexNow(updatedArticle.slug),
          submitArticleToGoogleIndexing(updatedArticle.slug),
        ])
      } catch (indexErr) {
        console.error('[Article Publish] Indexing error:', indexErr)
      }
    }

    revalidateArticleMutation({
      slug: updatedArticle?.slug,
      category: updatedArticle?.category,
    })

    if (updatedArticle?.slug) {
      try {
        await warmUpPublishedArticle(updatedArticle.slug)
      } catch (warmupErr) {
        console.error('[Article Publish] Cache warmup error:', warmupErr)
      }
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'article:publish',
        entityType: 'article',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { slug: updatedArticle.slug, published_at: publishedAt },
      })
    }

    const responsePayload = {
      success: true,
      message: 'Article published successfully',
      article: updatedArticle,
    }

    if (idempotencyKey) {
      await storeIdempotentResponse(idempotencyKey, `/api/admin/articles/${id}/publish`, 200, responsePayload)
    }

    return NextResponse.json(responsePayload)
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
