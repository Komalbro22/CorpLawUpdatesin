import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRole } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createApiKey, ALL_API_SCOPES, type ApiKeyScope } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/api-keys
 * Strictly restricted to Super Admin session. API keys CANNOT list or manage API keys.
 */
export async function GET() {
  if (!(await verifyAdminRole(['admin']))) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Only Super Admin sessions can view or manage API keys.' } },
      { status: 403 }
    )
  }

  try {
    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, prefix, scopes, created_at, last_used_at, status, revoked_at, created_by')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      keys: keys || [],
      available_scopes: ALL_API_SCOPES,
    })
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to list API keys' } }, { status: 500 })
  }
}

/**
 * POST /api/admin/api-keys
 * Create a new API key. Returns raw key exactly once.
 * Strictly restricted to Super Admin session.
 */
export async function POST(request: NextRequest) {
  if (!(await verifyAdminRole(['admin']))) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Only Super Admin sessions can create API keys.' } },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { name, scopes } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'A descriptive key name is required.' } },
        { status: 400 }
      )
    }

    if (!Array.isArray(scopes) || scopes.length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'At least one valid scope must be selected.' } },
        { status: 400 }
      )
    }

    const validScopeStrings = new Set(ALL_API_SCOPES.map(s => s.scope))
    for (const s of scopes) {
      if (!validScopeStrings.has(s as ApiKeyScope)) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: `Invalid scope requested: "${s}".` } },
          { status: 400 }
        )
      }
    }

    const { rawKey, keyRecord } = await createApiKey(name.trim(), scopes as ApiKeyScope[], 'admin')

    return NextResponse.json(
      {
        message: 'API key created successfully. Save this key now; it will never be displayed again.',
        raw_key: rawKey,
        key: keyRecord,
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to create API key' } }, { status: 500 })
  }
}
