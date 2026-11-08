import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Accepts either document-sets:usage or document-sets:read
  const auth = await verifyAdminOrKey(req, 'document-sets:usage')
  if (!auth.success) {
    const authRead = await verifyAdminOrKey(req, 'document-sets:read')
    if (!authRead.success) return auth.response
  }

  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format')

    const todayStr = new Date().toISOString().split('T')[0]
    const d7Ago = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const d30Ago = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const { data: allUsage, error } = await supabaseAdmin
      .from('document_set_usage')
      .select('*')
      .order('event_date', { ascending: false })

    const rows = allUsage || []

    // If CSV export requested
    if (format === 'csv') {
      let csv = 'Set Slug,Document Slug,Event Type,Date,Count\n'
      for (const r of rows) {
        csv += `"${r.set_slug}","${r.document_slug}","${r.event_type}","${r.event_date}",${r.count}\n`
      }
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="document-sets-usage-${todayStr}.csv"`,
        },
      })
    }

    // Aggregate statistics
    let countToday = 0
    let count7Days = 0
    let count30Days = 0
    let countAllTime = 0

    const eventBreakdown: Record<string, number> = {}
    const docBreakdown: Record<string, number> = {}

    for (const r of rows) {
      const c = r.count || 1
      countAllTime += c
      if (r.event_date === todayStr) countToday += c
      if (r.event_date >= d7Ago) count7Days += c
      if (r.event_date >= d30Ago) count30Days += c

      eventBreakdown[r.event_type] = (eventBreakdown[r.event_type] || 0) + c
      if (r.document_slug) {
        docBreakdown[r.document_slug] = (docBreakdown[r.document_slug] || 0) + c
      }
    }

    const topDocuments = Object.entries(docBreakdown)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      summary: {
        today: countToday,
        last7Days: count7Days,
        last30Days: count30Days,
        allTime: countAllTime,
      },
      eventBreakdown,
      topDocuments,
      recentLogs: rows.slice(0, 50),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
