import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  normalizeCalendarEntry,
  computeFieldDiff,
  normalizeRecurrence,
  validateEntryFields,
  ALLOWED_RECURRENCES,
  CANONICAL_ENTRY_FIELDS,
  ACCEPTED_FIELD_ALIASES,
} from '@/lib/compliance-calendar'
import { validateRecurrenceRule } from '@/lib/compliance-series-rules'
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

    const rawBody = await request.json()

    // 1. Unknown fields validation
    const validation = validateEntryFields(rawBody, { isPatch: true })
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'UNKNOWN_FIELDS',
          message: `Payload contains unrecognized field(s): ${validation.unknownFields.join(', ')}. Please use documented canonical fields.`,
          unknown_fields: validation.unknownFields,
          allowed_fields: CANONICAL_ENTRY_FIELDS,
          accepted_aliases: ACCEPTED_FIELD_ALIASES,
        },
        { status: 400 }
      )
    }

    const { canonical } = validation
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // Title / compliance_title
    if (canonical.title !== undefined) {
      updates.compliance_title = canonical.title
    }

    // Form name
    if (canonical.form_name !== undefined) {
      updates.form_name = canonical.form_name
    }

    // Due date
    if (canonical.due_date !== undefined) {
      updates.due_date = canonical.due_date
    }

    // Applies to
    if (canonical.applies_to !== undefined) {
      updates.applicable_to = canonical.applies_to
    }

    // Description
    if (canonical.description !== undefined) {
      updates.description = canonical.description
    }

    // Statutory ref
    if (canonical.statutory_ref !== undefined) {
      updates.regulation_reference = canonical.statutory_ref
    }

    // Penalty text
    if (canonical.penalty_text !== undefined) {
      updates.penalty = canonical.penalty_text
    }

    // Recurrence / Frequency
    if (canonical.recurrence !== undefined) {
      const recCheck = normalizeRecurrence(canonical.recurrence)
      if (!recCheck.valid) {
        return NextResponse.json(
          {
            error: 'INVALID_RECURRENCE',
            message: `Invalid recurrence '${recCheck.raw}'. Allowed values are: ${ALLOWED_RECURRENCES.join(', ')} (aliases: one_off, one-time, yearly, half_yearly).`,
            allowed_values: ALLOWED_RECURRENCES,
          },
          { status: 400 }
        )
      }
      updates.recurrence = recCheck.recurrence
      updates.frequency = recCheck.recurrence
    }

    // Source URL
    if (canonical.source_url !== undefined) {
      updates.official_source_url = canonical.source_url
      updates.official_link = canonical.source_url
    }

    // Last verified date
    if (canonical.last_verified_at !== undefined) {
      updates.last_verified_at = canonical.last_verified_at ? new Date(canonical.last_verified_at).toISOString() : new Date().toISOString()
    }

    // Extension fields
    if (canonical.original_date !== undefined) {
      updates.original_date = canonical.original_date
    }
    if (canonical.is_extended !== undefined) {
      updates.is_extended = Boolean(canonical.is_extended)
    }
    if (canonical.extension_ref !== undefined) {
      updates.extension_ref = canonical.extension_ref
    }
    if (canonical.extension_note !== undefined) {
      updates.extension_note = canonical.extension_note
    }

    // Recurrence rule
    if (canonical.recurrence_rule !== undefined) {
      if (canonical.recurrence_rule === null) {
        updates.recurrence_rule = null
      } else {
        const ruleValidation = validateRecurrenceRule(canonical.recurrence_rule)
        if (!ruleValidation.valid) {
          return NextResponse.json(
            {
              error: 'INVALID_RECURRENCE_RULE',
              message: ruleValidation.error,
            },
            { status: 400 }
          )
        }
        updates.recurrence_rule = ruleValidation.normalizedRule
      }
    }

    // Display order
    if (canonical.display_order !== undefined) {
      updates.display_order = Number(canonical.display_order)
    }

    // Status: is_live / is_active
    if (canonical.is_live !== undefined) {
      const live = Boolean(canonical.is_live)
      updates.is_active = live
      updates.is_live = live
      if (live) {
        updates.ever_live = true
      }
    }

    // Move category if category_id or category specified
    const targetCategory = canonical.category_id || canonical.category
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
    let deletionReason = request.nextUrl.searchParams.get('deletion_reason') || request.nextUrl.searchParams.get('reason') || ''
    try {
      const body = await request.json().catch(() => ({}))
      if (body?.deletion_reason) {
        deletionReason = String(body.deletion_reason).trim()
      } else if (body?.reason) {
        deletionReason = String(body.reason).trim()
      }
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
