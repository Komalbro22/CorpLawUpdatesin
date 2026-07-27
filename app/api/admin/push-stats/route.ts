import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'


export async function GET() {
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [{ count, error: countErr }, { data: logs, error: logsErr }] = await Promise.all([
      supabaseAdmin.from('push_subscriptions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('push_notification_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ])

    if (countErr) {
      console.error('[Push Stats API] Supabase count error:', countErr)
    }

    if (logsErr) {
      console.error('[Push Stats API] Push logs error:', logsErr)
    }

    return NextResponse.json({
      totalSubscribers: count || 0,
      recentLogs: logs || [],
    })
  } catch (err: any) {
    return NextResponse.json({ totalSubscribers: 0, recentLogs: [], error: err.message })
  }

}
