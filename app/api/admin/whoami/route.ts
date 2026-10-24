import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { hashApiKey, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // 1. Check session cookie
  const session = await getAdminSession()
  if (session) {
    return NextResponse.json({
      type: 'session',
      role: session.role,
      server_time: new Date().toISOString(),
    })
  }

  // 2. Check Bearer key
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawKey = authHeader.substring(7).trim()
    if (!rawKey) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Empty Bearer token' } }, { status: 401 })
    }

    const keyHash = hashApiKey(rawKey)
    const { data: keyRecord, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, prefix, scopes, status')
      .eq('key_hash', keyHash)
      .single()

    if (error || !keyRecord || keyRecord.status !== 'active') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or revoked API key' } }, { status: 401 })
    }

    return NextResponse.json({
      type: 'api_key',
      key_name: keyRecord.name,
      prefix: keyRecord.prefix,
      scopes: keyRecord.scopes || [],
      server_time: new Date().toISOString(),
    })
  }

  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Authentication required via session cookie or Bearer API key.' } },
    { status: 401 }
  )
}
