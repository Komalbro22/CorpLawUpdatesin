import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { normalizeCalendarEntry, computeFieldDiff } from '@/lib/compliance-calendar'
import { revalidateComplianceMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/calendar/entries/[id]
 * Fetch one calendar entry and its audit change history.
 * Requires: calendar:read
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params

  try {
    const { data: rawEntry, error } = await supabaseAdmin
      .from('compliance_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !rawEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const entry = normalizeCalendarEntry(rawEntry)

    // Fetch change history for this entry from api_audit_log
    const { data: history } = await supabaseAdmin
      .from('api_audit_log')
      .select('id, key_name, action, timestamp, details')
      .eq('entity_id', id)
      .order('timestamp', { ascending: false })
      .limit(50)

    return NextResponse.json({
      success: true,
      entry,
      history: history || [],
    })
  } catch (err: any) {
    console.error('[API Error /calendar/entries/[id] GET]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/calendar/entries/[id]
 * Update any field on a calendar entry (title, form_name, category/regulator, due_date, extensions, etc.)
 * Requires: calendar:write
 */
export async function PATCH(
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
    // 1. Fetch current entry
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('compliance_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const body = await request.json()
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // Title / compliance_title
    if (body.title !== undefined || body.compliance_title !== undefined) {
      const val = String(body.title ?? body.compliance_title).trim()
      updates.compliance_title = val
    }

    // Form name
    if (body.form_name !== undefined) {
      updates.form_name = String(body.form_name).trim()
    }

    // Due date
    if (body.due_date !== undefined || body.date !== undefined) {
      updates.due_date = String(body.due_date ?? body.date).trim()
    }

    // Applies to
    if (body.applies_to !== undefined || body.applicable_to !== undefined) {
      updates.applicable_to = String(body.applies_to ?? body.applicable_to).trim()
    }

    // Description
    if (body.description !== undefined) {
      updates.description = body.description ? String(body.description).trim() : null
    }

    // Statutory ref
    if (body.statutory_ref !== undefined || body.regulation_reference !== undefined) {
      const val = body.statutory_ref ?? body.regulation_reference
      updates.regulation_reference = val ? String(val).trim() : null
    }

    // Penalty text
    if (body.penalty_text !== undefined || body.penalty !== undefined) {
      const val = body.penalty_text ?? body.penalty
      updates.penalty = val ? String(val).trim() : null
    }

    // Recurrence / Frequency
    if (body.recurrence !== undefined || body.frequency !== undefined) {
      const val = String(body.recurrence ?? body.frequency).trim().toLowerCase()
      updates.recurrence = val
      updates.frequency = val
    }

    // Source URL
    if (body.source_url !== undefined || body.official_source_url !== undefined || body.official_link !== undefined) {
      const val = body.source_url ?? body.official_source_url ?? body.official_link
      updates.official_source_url = val ? String(val).trim() : null
      updates.official_link = val ? String(val).trim() : null
    }

    // Last verified date
    if (body.last_verified_at !== undefined || body.last_verified !== undefined) {
      const val = body.last_verified_at ?? body.last_verified
      updates.last_verified_at = val ? new Date(val).toISOString() : new Date().toISOString()
    }

    // Extension fields
    if (body.original_date !== undefined) {
      updates.original_date = body.original_date ? String(body.original_date).trim() : null
    }
    if (body.is_extended !== undefined) {
      updates.is_extended = Boolean(body.is_extended)
    }
    if (body.extension_ref !== undefined) {
      updates.extension_ref = body.extension_ref ? String(body.extension_ref).trim() : null
    }
    if (body.extension_note !== undefined) {
      updates.extension_note = body.extension_note ? String(body.extension_note).trim() : null
    }

    // Recurrence rule
    if (body.recurrence_rule !== undefined) {
      updates.recurrence_rule = body.recurrence_rule
    }

    // Display order
    if (body.display_order !== undefined) {
      updates.display_order = Number(body.display_order)
    }

    // Status: is_live / is_active
    if (body.is_live !== undefined || body.is_active !== undefined) {
      const live = Boolean(body.is_live ?? body.is_active)
      updates.is_active = live
      updates.is_live = live
      if (live) {
        updates.ever_live = true
      }
    }

    // Move category if category_id or regulator/category_slug specified
    const targetCategory = body.category_id || body.regulator || body.category_slug || body.category
    if (targetCategory) {
      const { data: cat } = await supabaseAdmin
        .from('compliance_categories')
        .select('id, slug')
        .or(`id.eq.${targetCategory},slug.eq.${targetCategory}`)
        .limit(1)
        .single()

      if (cat) {
        updates.category_id = cat.id
        updates.category_slug = cat.slug
        updates.regulator = cat.slug
      }
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('compliance_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) throw updateErr

    const normalized = normalizeCalendarEntry(updated)
    const diff = computeFieldDiff(existing, updated)

    await logApiAudit({
      keyId,
      keyName,
      action: 'calendar:entry_update',
      entityType: 'calendar_entry',
      entityId: id,
      ip: clientIp,
      status: 'success',
      details: {
        diff,
        entry: normalized,
      },
    })

    await revalidateComplianceMutation()

    return NextResponse.json({ success: true, entry: normalized, diff })
  } catch (err: any) {
    console.error('[API Error /calendar/entries/[id] PATCH]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/calendar/entries/[id]
 * Deletion Rules:
 * - If never published (ever_live === false): HARD delete from database.
 * - If ever live (ever_live === true): SOFT delete only (is_deleted = true, reason recorded).
 * Requires: calendar:write
 */
export async function DELETE(
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

    // Try reading deletion reason from request body or query param
    let deletionReason = request.nextUrl.searchParams.get('reason') || ''
    try {
      const body = await request.json().catch(() => ({}))
      if (body?.reason) deletionReason = body.reason
    } catch {
      // Non-blocking
    }
    if (!deletionReason) {
      deletionReason = `Deleted by ${keyName}`
    }

    // Check if never-live
    const isNeverLive = existing.ever_live === false

    if (isNeverLive) {
      // HARD DELETE
      const { error: deleteErr } = await supabaseAdmin
        .from('compliance_entries')
        .delete()
        .eq('id', id)

      if (deleteErr) throw deleteErr

      await logApiAudit({
        keyId,
        keyName,
        action: 'calendar:entry_hard_delete',
        entityType: 'calendar_entry',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: {
          mode: 'hard_delete',
          deleted_entry: existing,
          reason: deletionReason,
        },
      })

      await revalidateComplianceMutation()

      return NextResponse.json({
        success: true,
        mode: 'hard_delete',
        message: 'Draft entry permanently deleted from database.',
        id,
      })
    } else {
      // SOFT DELETE
      const { data: softDeleted, error: softErr } = await supabaseAdmin
        .from('compliance_entries')
        .update({
          is_deleted: true,
          is_active: false,
          is_live: false,
          deleted_at: new Date().toISOString(),
          deletion_reason: deletionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (softErr) throw softErr

      await logApiAudit({
        keyId,
        keyName,
        action: 'calendar:entry_soft_delete',
        entityType: 'calendar_entry',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: {
          mode: 'soft_delete',
          reason: deletionReason,
          entry: softDeleted,
        },
      })

      await revalidateComplianceMutation()

      return NextResponse.json({
        success: true,
        mode: 'soft_delete',
        message: 'Entry soft-deleted and hidden from public calendar. Record preserved for audit history.',
        id,
        deletion_reason: deletionReason,
      })
    }
  } catch (err: any) {
    console.error('[API Error /calendar/entries/[id] DELETE]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
