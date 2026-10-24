import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'media:delete')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { path: pathSegments } = await params
    const filePath = pathSegments.join('/')

    if (!filePath) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File path is required' } },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.storage
      .from('article-images')
      .remove([filePath])

    if (error) {
      return NextResponse.json({ error: { code: 'STORAGE_ERROR', message: error.message } }, { status: 500 })
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'media:delete',
        entityType: 'media',
        entityId: filePath,
        ip: clientIp,
        status: 'success',
        details: { path: filePath },
      })
    }

    return NextResponse.json({ success: true, message: `Media "${filePath}" deleted successfully` })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to delete media' } },
      { status: 500 }
    )
  }
}
