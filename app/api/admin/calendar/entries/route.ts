import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  normalizeCalendarEntry,
  checkDuplicateCalendarEntry,
  normalizeRecurrence,
  validateEntryFields,
  ALLOWED_RECURRENCES,
  CANONICAL_ENTRY_FIELDS,
  ACCEPTED_FIELD_ALIASES,
} from '@/lib/compliance-calendar'
import { revalidateComplianceMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/calendar/entries
 * List calendar entries with full filtering and verification flags.
 * Requires: calendar:read
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { searchParams } = new URL(request.url)
  const categoryFilter = searchParams.get('category') || searchParams.get('regulator') || ''
  const monthFilter = searchParams.get('month') || ''
  const yearFilter = searchParams.get('year') || ''
  const statusFilter = searchParams.get('status') || 'active' // 'active' | 'draft' | 'deleted' | 'all'
  const dueInDays = parseInt(searchParams.get('due_in_days') || '0', 10)
  const verificationFilter = searchParams.get('verification') || '' // 'unverified' | 'missing_source'
  const search = (searchParams.get('search') || '').trim().toLowerCase()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)))
  const offset = (page - 1) * limit

  try {
    let query = supabaseAdmin
      .from('compliance_entries')
      .select('*', { count: 'exact' })

    // Status filter
    if (statusFilter === 'active') {
      query = query.eq('is_deleted', false).eq('is_active', true)
    } else if (statusFilter === 'draft') {
      query = query.eq('is_deleted', false).eq('is_active', false)
    } else if (statusFilter === 'deleted') {
      query = query.eq('is_deleted', true)
    } else {
      // 'all' includes non-deleted active and drafts by default
      query = query.eq('is_deleted', false)
    }

    // Category / Regulator filter
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.or(`category_slug.eq.${categoryFilter},regulator.eq.${categoryFilter},category_id.eq.${categoryFilter}`)
    }

    // Search query
    if (search) {
      query = query.or(`form_name.ilike.%${search}%,compliance_title.ilike.%${search}%,regulation_reference.ilike.%${search}%,penalty.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Ordering
    query = query.order('regulator', { ascending: true }).order('display_order', { ascending: true })

    const { data: rawRows, count, error } = await query

    if (error) throw error

    // Normalize and apply in-memory date / verification filters
    let entries = (rawRows || []).map(normalizeCalendarEntry)

    // Filter by month/year if provided
    if (monthFilter || yearFilter) {
      const targetMonth = monthFilter ? parseInt(monthFilter, 10) : null // 1-12
      const targetYear = yearFilter ? parseInt(yearFilter, 10) : null

      entries = entries.filter(e => {
        const raw = (e.due_date || '').trim()
        const d = new Date(raw)
        let parsed = isNaN(d.getTime()) ? null : d
        if (!parsed) {
          const m = raw.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/)
          if (m) {
            const p = new Date(`${m[2]} ${m[1]}, ${m[3]}`)
            if (!isNaN(p.getTime())) parsed = p
          }
        }
        if (!parsed) return true // Keep if date is text/rule based unless specifically month filtered
        const mMatches = targetMonth ? parsed.getMonth() + 1 === targetMonth : true
        const yMatches = targetYear ? parsed.getFullYear() === targetYear : true
        return mMatches && yMatches
      })
    }

    // Filter by due in N days (e.g. 7 days)
    if (dueInDays > 0) {
      entries = entries.filter(e => e.is_due_in_7_days)
    }

    // Verification filter
    if (verificationFilter === 'unverified') {
      entries = entries.filter(e => e.is_unverified_90_days || e.has_no_source)
    } else if (verificationFilter === 'missing_source') {
      entries = entries.filter(e => e.has_no_source)
    }

    // Calculate metadata flag counts
    const allNormalized = (rawRows || []).map(normalizeCalendarEntry)
    const flags = {
      total_count: count || allNormalized.length,
      filtered_count: entries.length,
      unverified_90_days: allNormalized.filter(e => e.is_unverified_90_days).length,
      missing_source: allNormalized.filter(e => e.has_no_source).length,
      due_in_7_days: allNormalized.filter(e => e.is_due_in_7_days).length,
    }

    // Paginate
    const paginated = entries.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      entries: paginated,
      total: entries.length,
      page,
      limit,
      total_pages: Math.ceil(entries.length / limit) || 1,
      flags,
    })
  } catch (err: any) {
    console.error('[API Error /calendar/entries GET]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/calendar/entries
 * Create a new calendar entry.
 * Includes Duplicate Guard: returns 409 if same form + date exists unless force: true.
 * Requires: calendar:write
 */
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)
  const keyName = authCheck.auth.type === 'api_key' ? authCheck.auth.key.name : 'admin-session'
  const keyId = authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : null

  try {
    const rawBody = await request.json()

    // 1. Unknown fields validation
    const validation = validateEntryFields(rawBody, { isPatch: false })
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

    // Required fields
    const formName = (canonical.form_name || '').trim()
    const title = (canonical.title || '').trim()
    const dueDate = (canonical.due_date || '').trim()
    const appliesTo = (canonical.applies_to || '').trim()
    const requestedCategory = (canonical.category || 'other').trim().toLowerCase()

    if (!formName || !title || !dueDate || !appliesTo) {
      return NextResponse.json(
        {
          error: 'MISSING_REQUIRED_FIELDS',
          message: 'form_name, title, due_date, and applies_to are required fields.',
          received: { form_name: formName, title, due_date: dueDate, applies_to: appliesTo },
        },
        { status: 400 }
      )
    }

    // 2. Recurrence validation (canonical: 'one-off' | 'monthly' | 'quarterly' | 'half-yearly' | 'annual')
    const recurrenceRes = normalizeRecurrence(canonical.recurrence)
    if (!recurrenceRes.valid) {
      return NextResponse.json(
        {
          error: 'INVALID_RECURRENCE',
          message: `Invalid recurrence '${recurrenceRes.raw}'. Allowed values are: ${ALLOWED_RECURRENCES.join(', ')} (aliases: one_off, one-time, yearly, half_yearly).`,
          allowed_values: ALLOWED_RECURRENCES,
        },
        { status: 400 }
      )
    }
    const recurrence = recurrenceRes.recurrence

    // 3. Duplicate Guard Check
    const ignoreDuplicate = Boolean(canonical.ignore_duplicate)
    if (!ignoreDuplicate) {
      const duplicateCheck = await checkDuplicateCalendarEntry(formName, dueDate)
      if (duplicateCheck.isDuplicate) {
        return NextResponse.json(
          {
            error: 'DUPLICATE_ENTRY',
            warning: 'DUPLICATE_ENTRY',
            message: `An entry for form "${formName}" with due date "${dueDate}" already exists. Pass ignore_duplicate: true or force: true to proceed anyway.`,
            existing_entry: duplicateCheck.existingEntry,
          },
          { status: 409 }
        )
      }
    }

    // 4. Resolve Category & Regulator
    let categoryId = canonical.category_id || null
    let categorySlug = requestedCategory
    let categoryName = requestedCategory

    if (categoryId) {
      const { data: cat } = await supabaseAdmin
        .from('compliance_categories')
        .select('id, slug, name')
        .eq('id', categoryId)
        .single()
      if (cat) {
        categorySlug = cat.slug
        categoryName = cat.name
      }
    } else {
      const { data: cat } = await supabaseAdmin
        .from('compliance_categories')
        .select('id, slug, name')
        .or(`slug.eq.${requestedCategory},name.ilike.%${requestedCategory}%`)
        .limit(1)
        .single()
      if (cat) {
        categoryId = cat.id
        categorySlug = cat.slug
        categoryName = cat.name
      } else {
        // Fallback to 'other' category
        const { data: otherCat } = await supabaseAdmin
          .from('compliance_categories')
          .select('id, slug, name')
          .eq('slug', 'other')
          .single()
        if (otherCat) {
          categoryId = otherCat.id
          categorySlug = otherCat.slug
          categoryName = otherCat.name
        }
      }
    }

    const description = canonical.description ? String(canonical.description).trim() : null
    const statutoryRef = canonical.statutory_ref ? String(canonical.statutory_ref).trim() : null
    const penaltyText = canonical.penalty_text ? String(canonical.penalty_text).trim() : null
    const sourceUrl = canonical.source_url ? String(canonical.source_url).trim() : null
    const lastVerifiedAt = canonical.last_verified_at || new Date().toISOString()
    const originalDate = canonical.original_date ? String(canonical.original_date).trim() : null
    const isExtended = Boolean(canonical.is_extended || originalDate)
    const extensionRef = canonical.extension_ref ? String(canonical.extension_ref).trim() : null
    const extensionNote = canonical.extension_note ? String(canonical.extension_note).trim() : null
    const recurrenceRule = canonical.recurrence_rule || null
    const displayOrder = typeof canonical.display_order === 'number' ? canonical.display_order : 100
    const isLive = canonical.is_live !== false

    const insertPayload = {
      form_name: formName,
      compliance_title: title,
      due_date: dueDate,
      applicable_to: appliesTo,
      category_id: categoryId,
      category_slug: categorySlug,
      regulator: categorySlug,
      description,
      regulation_reference: statutoryRef,
      penalty: penaltyText,
      frequency: recurrence,
      recurrence,
      official_link: sourceUrl,
      official_source_url: sourceUrl,
      last_verified_at: lastVerifiedAt,
      original_date: originalDate,
      is_extended: isExtended,
      extension_ref: extensionRef,
      extension_note: extensionNote,
      recurrence_rule: recurrenceRule,
      display_order: displayOrder,
      is_active: isLive,
      is_live: isLive,
      ever_live: isLive ? true : false,
      is_deleted: false,
      created_by: keyName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: entry, error: insertErr } = await supabaseAdmin
      .from('compliance_entries')
      .insert(insertPayload)
      .select()
      .single()

    if (insertErr) throw insertErr

    const normalized = normalizeCalendarEntry(entry)

    await logApiAudit({
      keyId,
      keyName,
      action: 'calendar:entry_create',
      entityType: 'calendar_entry',
      entityId: entry.id,
      ip: clientIp,
      status: 'success',
      details: {
        entry: normalized,
        category: categoryName,
      },
    })

    await revalidateComplianceMutation()

    return NextResponse.json({ success: true, entry: normalized }, { status: 201 })
  } catch (err: any) {
    console.error('[API Error /calendar/entries POST]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
