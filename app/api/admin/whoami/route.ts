import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { hashApiKey, getClientIp, touchLastUsed, recordInvalidKeyAttempt } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Reject keys passed in query strings
  if (request.nextUrl.searchParams.has('key') || request.nextUrl.searchParams.has('api_key') || request.nextUrl.searchParams.has('token')) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_TRANSPORT',
          message: 'API keys must be passed exclusively via Authorization: Bearer header. Query string keys are forbidden for security.',
        },
      },
      { status: 400 }
    )
  }

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
    const clientIp = getClientIp(request)

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
      await recordInvalidKeyAttempt(clientIp)
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or revoked API key' } }, { status: 401 })
    }

    // Touch last used timestamp
    await touchLastUsed(keyRecord.id)

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
