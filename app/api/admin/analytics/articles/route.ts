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

  // 1. Fetch Supabase Data
  const { data, error } = await supabaseAdmin
    .from('updates')
    .select('id, title, slug, category, views, status, created_at, published_at')

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

  // 3. Merge Views and Sort
  const mergedArticles = articles.map(article => {
    const finalViews = gaArticleViews[article.slug] || article.views || 0
    return { ...article, views: finalViews }
  })

  mergedArticles.sort((a, b) => b.views - a.views)

  return NextResponse.json({ articles: mergedArticles })
}
