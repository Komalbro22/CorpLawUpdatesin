import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'analytics:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  let analyticsDataClient: BetaAnalyticsDataClient | null = null
  const propertyId = process.env.GA_PROPERTY_ID

  try {
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      analyticsDataClient = new BetaAnalyticsDataClient({
        fallback: true,
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      })
    }
  } catch (e) {
    console.error('Failed to initialize GA client', e)
  }

  // 1. Fetch Supabase Data
  const { data, error } = await supabaseAdmin
    .from('updates')
    .select('id, title, slug, category, views, created_at, published_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const articles = data || []

  // 2. Fetch GA Data
  const gaArticleViews: Record<string, number> = {}
  if (analyticsDataClient && propertyId) {
    try {
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
      })

      const REDIRECTED_SLUG_MAP: Record<string, string> = {
        'rbi-operational-risk-second-amendment-directions-2026': 'rbi-operational-risk-second-amendment-directions-2026-2',
        'rbi-leverage-ratio-eleventh-amendment-final-directions-2026': 'rbi-leverage-ratio-eleventh-amendment-final-directions-2026-2',
        'sebi-research-analyst-call-recording-relaxation-institutional-clients-2026': 'sebi-research-analyst-call-recording-relaxation-institutional-clients-2026-2',
      }
      if (articlesReport.rows) {
        articlesReport.rows.forEach(row => {
          const path = row.dimensionValues?.[0]?.value || ''
          const slug = path.replace('/updates/', '').split('?')[0].replace(/\/$/, '')
          const views = parseInt(row.metricValues?.[0]?.value || '0', 10)
          if (slug && views > 0) {
            gaArticleViews[slug] = (gaArticleViews[slug] || 0) + views
            const targetSlug = REDIRECTED_SLUG_MAP[slug]
            if (targetSlug) {
              gaArticleViews[targetSlug] = (gaArticleViews[targetSlug] || 0) + views
            }
          }
        })
      }
    } catch (err) {
      console.error('GA4 Fetch Error:', err)
    }
  }

  // 3. Merge Views
  const enrichedArticles = articles.map(article => {
    const finalViews = gaArticleViews[article.slug] || article.views || 0
    return {
      ...article,
      views: finalViews,
      status: article.published_at ? 'published' : 'draft',
    }
  })

  // Support pagination and sort params
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') || 'views_desc'
  const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit') || '50', 10) : undefined
  const offset = searchParams.has('offset') ? parseInt(searchParams.get('offset') || '0', 10) : 0

  if (sort === 'views_asc') {
    enrichedArticles.sort((a, b) => a.views - b.views)
  } else if (sort === 'date_desc') {
    enrichedArticles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else {
    // Default views_desc
    enrichedArticles.sort((a, b) => b.views - a.views)
  }

  const paginatedArticles = limit !== undefined
    ? enrichedArticles.slice(offset, offset + limit)
    : enrichedArticles

  return NextResponse.json({
    articles: paginatedArticles,
    items: paginatedArticles,
    total: enrichedArticles.length,
    source: Object.keys(gaArticleViews).length > 0 ? 'Google Analytics' : 'Database',
  })
}
