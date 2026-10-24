import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

function attachFeedbackNote(item: any) {
  if (!item) return item
  if (item.admin_note !== undefined) {
    return { ...item, note: item.admin_note }
  }
  const noteTag = (item.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('note:'))
  const note = noteTag ? noteTag.slice(5) : null
  return { ...item, note }
}

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
    const { data: item } = await supabaseAdmin
      .from('reader_feedback')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (item) {
      return NextResponse.json({ item: attachFeedbackNote(item) })
    }

    // Fallback: check compliance_suggestions
    const { data: fbItem } = await supabaseAdmin
      .from('compliance_suggestions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fbItem) {
      return NextResponse.json({ item: attachFeedbackNote(fbItem) })
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

    // 1. Try reader_feedback first
    const { data: rfItem } = await supabaseAdmin
      .from('reader_feedback')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (rfItem) {
      const currentTags: string[] = Array.isArray(rfItem.tags) ? rfItem.tags : []
      let updatedTags = currentTags
      if (note !== undefined) {
        updatedTags = currentTags.filter(t => typeof t !== 'string' || !t.startsWith('note:'))
        if (note && typeof note === 'string' && note.trim()) {
          updatedTags.push(`note:${note.trim()}`)
        }
      }

      const { data: updatedItem, error } = await supabaseAdmin
        .from('reader_feedback')
        .update({ status, tags: updatedTags })
        .eq('id', id)
        .select()
        .single()

      if (error || !updatedItem) {
        return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: error?.message || 'Update failed' } }, { status: 500 })
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
          details: { status, note },
        })
      }

      return NextResponse.json({ success: true, item: attachFeedbackNote(updatedItem) })
    }

    // 2. Try compliance_suggestions fallback
    const { data: csItem } = await supabaseAdmin
      .from('compliance_suggestions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (csItem) {
      const updatePayload: Record<string, any> = { status }
      if (note !== undefined) {
        updatePayload.admin_note = typeof note === 'string' ? note.trim() : null
      }

      const { data: fbUpdated, error: fbErr } = await supabaseAdmin
        .from('compliance_suggestions')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (fbErr || !fbUpdated) {
        return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: fbErr?.message || 'Update failed' } }, { status: 500 })
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
          details: { status, note },
        })
      }

      return NextResponse.json({ success: true, item: attachFeedbackNote(fbUpdated) })
    }

    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Feedback item not found' } }, { status: 404 })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to update feedback' } },
      { status: 500 }
    )
  }
}
