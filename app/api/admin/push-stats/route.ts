import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { count, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('[Push Stats API] Supabase count error:', error)
      return NextResponse.json({ totalSubscribers: 0 })
    }

    return NextResponse.json({ totalSubscribers: count || 0 })
  } catch (err: any) {
    return NextResponse.json({ totalSubscribers: 0, error: err.message })
  }
}
