import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

import { BetaAnalyticsDataClient } from '@google-analytics/data'

let analyticsDataClient: BetaAnalyticsDataClient | null = null
try {
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    })
  }
} catch (e) {
  console.error('Failed to initialize GA client', e)
}

const propertyId = process.env.GA_PROPERTY_ID

export async function GET() {
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Fetch Google Analytics Data (if configured)
  let gaTotalViews = 0
  let gaActiveUsers = 0
  const gaArticleViews: Record<string, number> = {}

  if (analyticsDataClient && propertyId) {
    try {
      const [overviewReport] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '2023-01-01', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      })
      
      if (overviewReport.rows && overviewReport.rows.length > 0) {
        gaTotalViews = parseInt(overviewReport.rows[0].metricValues?.[0]?.value || '0', 10)
        gaActiveUsers = parseInt(overviewReport.rows[0].metricValues?.[1]?.value || '0', 10)
      }

      const [articlesReport] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '2023-01-01', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'BEGINS_WITH',
              value: '/updates/',
            },
          },
        },
        limit: 1000,
      })

      if (articlesReport.rows) {
        articlesReport.rows.forEach(row => {
          const path = row.dimensionValues?.[0]?.value || ''
          const slug = path.replace('/updates/', '').split('?')[0].replace(/\/$/, '')
          const views = parseInt(row.metricValues?.[0]?.value || '0', 10)
          if (slug && views > 0) {
            gaArticleViews[slug] = (gaArticleViews[slug] || 0) + views
          }
        })
      }
    } catch (err) {
      console.error('GA4 Fetch Error:', err)
    }
  }

  // 2. Fetch Supabase Data
  const [
    articlesResult,
    subscribersResult,
    recentSubscribersResult,
    weekArticlesResult,
  ] = await Promise.all([
    // All published articles
    supabaseAdmin
      .from('updates')
      .select('title, slug, views, category, published_at')
      .not('published_at', 'is', null),

    // Total active subscribers
    supabaseAdmin
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),

    // Recent 5 active subscribers
    supabaseAdmin
      .from('subscribers')
      .select('email, subscribed_at')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })
      .limit(5),

    // Articles published in last 7 days
    supabaseAdmin
      .from('updates')
      .select('*', { count: 'exact', head: true })
      .not('published_at', 'is', null)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const publishedArticles = articlesResult.data || []

  // Calculate category breakdown
  const categoryCount: Record<string, number> = {}
  publishedArticles.forEach((row) => {
    categoryCount[row.category] = (categoryCount[row.category] || 0) + 1
  })

  // Merge Views and Calculate Top Articles
  let totalDbViews = 0
  const articlesWithMergedViews = publishedArticles.map(article => {
    totalDbViews += (article.views || 0)
    // Use GA views if available, otherwise fallback to DB views
    const finalViews = gaArticleViews[article.slug] || article.views || 0
    return { ...article, views: finalViews }
  })

  // Sort by final views descending and take top 5
  const topArticles = articlesWithMergedViews
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  // Use GA total views if available, otherwise DB total views
  const finalTotalViews = gaTotalViews > 0 ? gaTotalViews : totalDbViews

  return NextResponse.json({
    overview: {
      totalArticles: publishedArticles.length,
      totalSubscribers: subscribersResult.count || 0,
      totalViews: finalTotalViews,
      articlesThisWeek: weekArticlesResult.count || 0,
      activeUsers: gaActiveUsers, // new field
      source: gaTotalViews > 0 ? 'Google Analytics' : 'Database',
    },
    topArticles,
    categoryBreakdown: categoryCount,
    recentSubscribers: recentSubscribersResult.data || [],
  })
}
