import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'feedback:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { id } = await params

    // Try reader_feedback
    const { data: item, error } = await supabaseAdmin
      .from('reader_feedback')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (item) {
      return NextResponse.json({ item })
    }

    // Fallback: check compliance_suggestions
    const { data: fbItem } = await supabaseAdmin
      .from('compliance_suggestions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fbItem) {
      return NextResponse.json({ item: fbItem })
    }

    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Feedback item not found' } }, { status: 404 })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch feedback' } },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'feedback:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { id } = await params
    const body = await request.json()
    const { status, note } = body

    if (!status) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Status parameter is required.' } },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, any> = { status }
    if (note !== undefined) {
      updatePayload.internal_note = note
    }

    const { data: updatedItem, error } = await supabaseAdmin
      .from('reader_feedback')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (!error && updatedItem) {
      if (authCheck.auth.type === 'api_key') {
        await logApiAudit({
          keyId: authCheck.auth.key.id,
          keyName: authCheck.auth.key.name,
          action: 'feedback:update',
          entityType: 'feedback',
          entityId: id,
          ip: clientIp,
          status: 'success',
          details: { status, note },
        })
      }
      return NextResponse.json({ success: true, item: updatedItem })
    }

    // Fallback
    const { data: fbUpdated, error: fbErr } = await supabaseAdmin
      .from('compliance_suggestions')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (fbErr || !fbUpdated) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Feedback item not found' } }, { status: 404 })
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'feedback:update',
        entityType: 'feedback',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { status },
      })
    }

    return NextResponse.json({ success: true, item: fbUpdated })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to update feedback' } },
      { status: 500 }
    )
  }
}
