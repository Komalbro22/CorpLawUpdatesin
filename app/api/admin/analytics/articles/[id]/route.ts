import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'analytics:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')

    const { data: article, error } = await supabaseAdmin
      .from('updates')
      .select('id, title, slug, category, views, created_at, published_at')
      .eq('id', id)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Article not found' } }, { status: 404 })
    }

    const canonicalAllTimeViews = article.views || 0

    // If days parameter is specified and not 'all', fetch period-filtered GA4 metrics
    if (daysParam && daysParam !== 'all') {
      const daysNum = parseInt(daysParam, 10)
      if (!isNaN(daysNum) && daysNum > 0) {
        let periodViews = 0
        const propertyId = process.env.GA_PROPERTY_ID

        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && propertyId) {
          try {
            const analyticsDataClient = new BetaAnalyticsDataClient({
              fallback: true,
              credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              },
            })

            const [report] = await analyticsDataClient.runReport({
              property: `properties/${propertyId}`,
              dateRanges: [{ startDate: `${daysNum}daysAgo`, endDate: 'today' }],
              dimensions: [{ name: 'pagePath' }],
              metrics: [{ name: 'screenPageViews' }],
              dimensionFilter: {
                filter: {
                  fieldName: 'pagePath',
                  stringFilter: {
                    matchType: 'EXACT',
                    value: `/updates/${article.slug}`,
                  },
                },
              },
            })

            if (report?.rows) {
              report.rows.forEach(row => {
                const viewsVal = parseInt(row.metricValues?.[0]?.value || '0', 10)
                periodViews += viewsVal
              })
            }
          } catch (gaErr) {
            console.error('Failed to fetch period GA4 stats:', gaErr)
          }
        }

        return NextResponse.json({
          article: {
            ...article,
            views: periodViews,
            all_time_views: canonicalAllTimeViews,
            period_views: periodViews,
            period_days: daysNum,
            status: article.published_at ? 'published' : 'draft',
          },
        })
      }
    }

    // Default: all-time view count
    return NextResponse.json({
      article: {
        ...article,
        views: canonicalAllTimeViews,
        all_time_views: canonicalAllTimeViews,
        status: article.published_at ? 'published' : 'draft',
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch article stats' } },
      { status: 500 }
    )
  }
}
