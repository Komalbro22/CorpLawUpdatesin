import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/analytics/overview
 * Site totals tracked natively by the CMS (articles, views, subscribers, pending feedback, top articles)
 * Requires `analytics:read` scope.
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'analytics:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const [
      articlesResult,
      subscribersResult,
      weekArticlesResult,
      feedbackResult,
    ] = await Promise.all([
      supabaseAdmin
        .from('updates')
        .select('id, title, slug, views, category, published_at')
        .not('published_at', 'is', null)
        .order('views', { ascending: false }),

      supabaseAdmin
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),

      supabaseAdmin
        .from('updates')
        .select('*', { count: 'exact', head: true })
        .not('published_at', 'is', null)
        .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      supabaseAdmin
        .from('reader_feedback')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'unprocessed']),
    ])

    const articles = articlesResult.data || []
    let totalViews = 0
    articles.forEach(a => {
      totalViews += (a.views || 0)
    })

    const topArticles = articles.slice(0, 10).map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      views: a.views || 0,
      category: a.category,
      published_at: a.published_at,
    }))

    return NextResponse.json({
      total_articles: articles.length,
      total_views: totalViews,
      total_subscribers: subscribersResult.count || 0,
      articles_this_week: weekArticlesResult.count || 0,
      pending_feedback: feedbackResult.count || 0,
      top_articles: topArticles,
      server_time: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch analytics overview' } },
      { status: 500 }
    )
  }
}
