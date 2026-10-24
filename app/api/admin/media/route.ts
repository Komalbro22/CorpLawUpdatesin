import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/media
 * List uploaded files in article-images bucket
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'media:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))
    const search = searchParams.get('search') || ''

    const { data: files, error } = await supabaseAdmin.storage
      .from('article-images')
      .list('', {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
        search: search || undefined,
      })

    if (error) {
      return NextResponse.json({ error: { code: 'STORAGE_ERROR', message: error.message } }, { status: 500 })
    }

    const items = (files || []).map((file) => {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('article-images')
        .getPublicUrl(file.name)

      return {
        name: file.name,
        path: file.name,
        id: file.id,
        url: publicUrl,
        size: file.metadata?.size || null,
        created_at: file.created_at,
        updated_at: file.updated_at,
        mimetype: file.metadata?.mimetype || null,
      }
    })

    return NextResponse.json({
      items,
      total: items.length,
      limit,
      offset,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to list media' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/media
 * Delete media by path provided in query parameter ?path= or request body
 */
export async function DELETE(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'media:delete')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)
  const { searchParams } = new URL(request.url)
  let filePath = searchParams.get('path')

  if (!filePath) {
    try {
      const body = await request.json()
      filePath = body?.path
    } catch {
      // ignore
    }
  }

  if (!filePath) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'File path is required to delete media.' } },
      { status: 400 }
    )
  }

  try {
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
