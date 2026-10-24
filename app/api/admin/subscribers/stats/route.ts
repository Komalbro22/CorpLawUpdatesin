import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'subscribers:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: totalActive },
      { count: totalInactive },
      { count: newThisWeek },
      { count: newThisMonth },
    ] = await Promise.all([
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', false),
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', sevenDaysAgo),
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', thirtyDaysAgo),
    ])

    return NextResponse.json({
      totalActive: totalActive || 0,
      totalInactive: totalInactive || 0,
      newThisWeek: newThisWeek || 0,
      newThisMonth: newThisMonth || 0,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch subscriber stats' } },
      { status: 500 }
    )
  }
}
