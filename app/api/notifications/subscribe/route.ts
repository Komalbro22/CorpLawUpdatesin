import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  const allowedHost = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : null

  // Allow same-origin or localhost dev requests
  if (!origin) return true
  try {
    const originHost = new URL(origin).host
    if (originHost === host) return true
    if (allowedHost && originHost === allowedHost) return true
    if (originHost.includes('localhost') || originHost.includes('127.0.0.1')) return true
  } catch {
    return false
  }
  return false
}

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden: Invalid request origin' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { endpoint, keys, categories } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Missing required push subscription fields (endpoint, keys.p256dh, keys.auth)' }, { status: 400 })
    }

    const categoriesArray = Array.isArray(categories) && categories.length > 0 ? categories : ['all']
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: userAgent,
          categories: categoriesArray,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      )
      .select('id')
      .single()

    if (error) {
      console.error('[Push Subscribe API] Supabase upsert error:', error)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error('[Push Subscribe API] Processing exception:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden: Invalid request origin' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    if (error) {
      console.error('[Push Unsubscribe API] Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
