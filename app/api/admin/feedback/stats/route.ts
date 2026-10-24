import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'feedback:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const [
      { count: totalCount },
      { count: posCount },
      { count: negCount },
      { count: pendCount },
    ] = await Promise.all([
      supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }).eq('sentiment', 'positive'),
      supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }).eq('sentiment', 'negative'),
      supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }).in('status', ['pending', 'unprocessed']),
    ])

    const total = totalCount || 0
    const positive = posCount || 0
    const negative = negCount || 0
    const unprocessed = pendCount || 0
    const helpfulPercentage = total > 0 ? Math.round((positive / total) * 100) : 0

    return NextResponse.json({
      total,
      positive,
      negative,
      unprocessed,
      pending: unprocessed,
      helpful_percentage: helpfulPercentage,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch feedback stats' } },
      { status: 500 }
    )
  }
}
