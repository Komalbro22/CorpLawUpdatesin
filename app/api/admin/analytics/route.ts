import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  // Run all queries in parallel
  const [
    articlesResult,
    subscribersResult,
    topArticlesResult,
    categoryResult,
    recentResult,
    viewsTotalResult,
  ] = await Promise.all([
    // Total articles
    supabaseAdmin
      .from('updates')
      .select('*', { count: 'exact', head: true }),

    // Total active subscribers
    supabaseAdmin
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),

    // Top 5 articles by views
    supabaseAdmin
      .from('updates')
      .select('title, slug, views, category, published_at')
      .not('published_at', 'is', null)
      .order('views', { ascending: false })
      .limit(5),

    // Articles by category
    supabaseAdmin
      .from('updates')
      .select('category')
      .not('published_at', 'is', null),

    // Recent 5 subscribers
    supabaseAdmin
      .from('subscribers')
      .select('email, subscribed_at')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })
      .limit(5),

    // Total views across all articles
    supabaseAdmin
      .from('updates')
      .select('views')
      .not('published_at', 'is', null),
  ])

  // Calculate category breakdown
  const categoryCount: Record<string, number> = {}
  categoryResult.data?.forEach((row) => {
    categoryCount[row.category] = 
      (categoryCount[row.category] || 0) + 1
  })

  // Calculate total views
  const totalViews = viewsTotalResult.data?.reduce(
    (sum, row) => sum + (row.views || 0), 0
  ) || 0

  // Articles published this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: weekData } = await supabaseAdmin
    .from('updates')
    .select('*', { count: 'exact', head: true })
    .not('published_at', 'is', null)
    .gte('published_at', oneWeekAgo.toISOString())

  return NextResponse.json({
    overview: {
      totalArticles: articlesResult.count || 0,
      totalSubscribers: subscribersResult.count || 0,
      totalViews,
      articlesThisWeek: weekData?.length || 0,
    },
    topArticles: topArticlesResult.data || [],
    categoryBreakdown: categoryCount,
    recentSubscribers: recentResult.data || [],
  })
}
