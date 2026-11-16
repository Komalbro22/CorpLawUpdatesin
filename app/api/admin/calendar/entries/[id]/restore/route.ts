import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { normalizeCalendarEntry } from '@/lib/compliance-calendar'
import { revalidateComplianceMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/calendar/entries/[id]/restore
 * Restore a soft-deleted entry.
 * Requires: calendar:write
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const clientIp = getClientIp(request)
  const keyName = authCheck.auth.type === 'api_key' ? authCheck.auth.key.name : 'admin-session'
  const keyId = authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : null

  try {
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('compliance_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const { data: restored, error: restoreErr } = await supabaseAdmin
      .from('compliance_entries')
      .update({
        is_deleted: false,
        is_active: true,
        is_live: true,
        deleted_at: null,
        deletion_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (restoreErr) throw restoreErr

    const normalized = normalizeCalendarEntry(restored)

    await logApiAudit({
      keyId,
      keyName,
      action: 'calendar:entry_restore',
      entityType: 'calendar_entry',
      entityId: id,
      ip: clientIp,
      status: 'success',
      details: {
        restored_entry: normalized,
      },
    })

    await revalidateComplianceMutation()

    return NextResponse.json({
      success: true,
      message: 'Entry restored successfully to live calendar.',
      entry: normalized,
    })
  } catch (err: any) {
    console.error('[API Error /calendar/entries/[id]/restore POST]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
