import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRole } from '@/lib/admin-auth'
import { regenerateApiKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/api-keys/[id]/regenerate
 * Revokes old key and creates a fresh key with identical scopes.
 * Returns raw key once. Strictly Super Admin session only.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRole(['admin']))) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Only Super Admin sessions can regenerate API keys.' } },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const result = await regenerateApiKey(id)

    if (!result) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'API key not found' } }, { status: 404 })
    }

    return NextResponse.json({
      message: 'API key regenerated successfully. Save this key now; it will never be displayed again.',
      raw_key: result.rawKey,
      key: result.keyRecord,
    })
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to regenerate key' } }, { status: 500 })
  }
}
