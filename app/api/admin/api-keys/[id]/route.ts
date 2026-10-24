import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRole } from '@/lib/admin-auth'
import { revokeApiKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/api-keys/[id]
 * Revokes the key immediately. Strictly Super Admin session only.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRole(['admin']))) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Only Super Admin sessions can revoke API keys.' } },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const success = await revokeApiKey(id)

    if (!success) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'API key not found' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'API key revoked immediately' })
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to revoke key' } }, { status: 500 })
  }
}
