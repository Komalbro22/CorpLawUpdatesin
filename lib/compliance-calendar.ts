import { supabaseAdmin } from '@/lib/supabase-server'

export interface ComplianceCategoryRecord {
  id: string
  name: string
  slug: string
  colour: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  entry_count?: number
}

export interface ComplianceEntryRecord {
  id: string
  category_id?: string | null
  category_slug?: string | null
  regulator: string
  form_name: string
  compliance_title: string
  title?: string
  due_date: string
  applicable_to: string
  applies_to?: string
  description?: string | null
  statutory_ref?: string | null
  regulation_reference?: string | null
  penalty_text?: string | null
  penalty?: string | null
  recurrence: string
  frequency?: string
  recurrence_rule?: any
  parent_entry_id?: string | null
  source_url?: string | null
  official_link?: string | null
  official_source_url?: string | null
  last_verified_at?: string | null
  original_date?: string | null
  is_extended?: boolean
  extension_ref?: string | null
  extension_note?: string | null
  is_active: boolean
  is_live?: boolean
  ever_live?: boolean
  is_deleted?: boolean
  deleted_at?: string | null
  deletion_reason?: string | null
  display_order?: number
  created_by?: string | null
  created_at?: string
  updated_at?: string
  // Computed verification flags
  is_unverified_90_days?: boolean
  is_due_in_7_days?: boolean
  has_no_source?: boolean
}

/**
 * Standardize output format so API consumers can access both modern field names
 * (title, applies_to, statutory_ref, penalty_text, recurrence, source_url)
 * and legacy database column names.
 */
export function normalizeCalendarEntry(row: any): ComplianceEntryRecord {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Parse due date for 7-day upcoming flag
  let isDueIn7Days = false
  try {
    const rawDue = (row.due_date || '').trim()
    const d = new Date(rawDue)
    let parsedDate: Date | null = isNaN(d.getTime()) ? null : d
    if (!parsedDate) {
      const match = rawDue.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/)
      if (match) {
        const p = new Date(`${match[2]} ${match[1]}, ${match[3]}`)
        if (!isNaN(p.getTime())) parsedDate = p
      }
    }
    if (parsedDate) {
      const diffMs = parsedDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays >= 0 && diffDays <= 7) {
        isDueIn7Days = true
      }
    }
  } catch {
    // Non-blocking
  }

  // 90 days verification check
  let isUnverified90Days = false
  const hasNoSource = !row.official_source_url && !row.official_link
  if (row.last_verified_at) {
    const lastVer = new Date(row.last_verified_at).getTime()
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000
    if (now.getTime() - lastVer > ninetyDaysMs) {
      isUnverified90Days = true
    }
  } else {
    isUnverified90Days = true
  }

  const effectiveSource = row.official_source_url || row.official_link || null
  const effectivePenalty = row.penalty_text || row.penalty || null
  const effectiveStatutory = row.statutory_ref || row.regulation_reference || null
  const effectiveTitle = row.compliance_title || row.title || ''
  const effectiveAppliesTo = row.applicable_to || row.applies_to || ''
  const effectiveRecurrence = row.recurrence || row.frequency || 'monthly'

  return {
    ...row,
    title: effectiveTitle,
    compliance_title: effectiveTitle,
    applies_to: effectiveAppliesTo,
    applicable_to: effectiveAppliesTo,
    statutory_ref: effectiveStatutory,
    regulation_reference: effectiveStatutory,
    penalty_text: effectivePenalty,
    penalty: effectivePenalty,
    recurrence: effectiveRecurrence,
    frequency: effectiveRecurrence,
    source_url: effectiveSource,
    official_source_url: effectiveSource,
    official_link: effectiveSource,
    is_live: row.is_live ?? row.is_active ?? true,
    is_active: row.is_active ?? row.is_live ?? true,
    ever_live: row.ever_live ?? true,
    is_deleted: row.is_deleted ?? false,
    is_extended: Boolean(row.is_extended),
    is_unverified_90_days: isUnverified90Days,
    is_due_in_7_days: isDueIn7Days,
    has_no_source: hasNoSource,
  }
}

/**
 * Compute key-value differences between two records for audit logging.
 */
export function computeFieldDiff(oldRecord: Record<string, any>, newRecord: Record<string, any>): Record<string, { old: any; new: any }> {
  const diff: Record<string, { old: any; new: any }> = {}
  const ignoredKeys = new Set(['updated_at', 'created_at', 'search_vector'])

  const allKeys = Array.from(new Set([...Object.keys(oldRecord || {}), ...Object.keys(newRecord || {})]))
  for (const key of allKeys) {
    if (ignoredKeys.has(key)) continue
    const vOld = oldRecord?.[key] ?? null
    const vNew = newRecord?.[key] ?? null
    if (JSON.stringify(vOld) !== JSON.stringify(vNew)) {
      diff[key] = { old: vOld, new: vNew }
    }
  }
  return diff
}

/**
 * Check if a duplicate entry exists with same form_name and due_date.
 */
export async function checkDuplicateCalendarEntry(
  formName: string,
  dueDate: string,
  excludeId?: string
): Promise<{ isDuplicate: boolean; existingEntry?: any }> {
  const trimmedForm = (formName || '').trim().toLowerCase()
  const trimmedDue = (dueDate || '').trim().toLowerCase()

  if (!trimmedForm || !trimmedDue) {
    return { isDuplicate: false }
  }

  let query = supabaseAdmin
    .from('compliance_entries')
    .select('id, form_name, compliance_title, due_date, regulator, is_active, is_deleted')
    .eq('is_deleted', false)
    .ilike('form_name', trimmedForm)
    .eq('due_date', dueDate)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query.limit(1)
  if (data && data.length > 0) {
    return { isDuplicate: true, existingEntry: data[0] }
  }

  return { isDuplicate: false }
}

export const ALLOWED_RECURRENCES = [
  'one-off',
  'monthly',
  'quarterly',
  'half-yearly',
  'annual',
] as const

export type RecurrenceType = (typeof ALLOWED_RECURRENCES)[number]

/**
 * Normalizes user-supplied recurrence strings to canonical values.
 * Returns { valid: true, recurrence } or { valid: false, raw }.
 */
export function normalizeRecurrence(val: any): { valid: true; recurrence: RecurrenceType } | { valid: false; raw: string } {
  if (val === undefined || val === null || val === '') {
    return { valid: true, recurrence: 'monthly' }
  }
  const s = String(val).trim().toLowerCase().replace(/[\s_]+/g, '-')

  if (s === 'one-off' || s === 'oneoff' || s === 'one-time' || s === 'onetime' || s === 'once' || s === 'event-based') {
    return { valid: true, recurrence: 'one-off' }
  }
  if (s === 'monthly' || s === 'month') {
    return { valid: true, recurrence: 'monthly' }
  }
  if (s === 'quarterly' || s === 'quarter') {
    return { valid: true, recurrence: 'quarterly' }
  }
  if (s === 'half-yearly' || s === 'halfyearly' || s === 'semi-annual' || s === 'semiannual' || s === 'half-year') {
    return { valid: true, recurrence: 'half-yearly' }
  }
  if (s === 'annual' || s === 'annually' || s === 'yearly' || s === 'year' || s === 'every-2-years' || s === 'every-3-years' || s === 'every-5-years') {
    return { valid: true, recurrence: 'annual' }
  }

  return { valid: false, raw: String(val) }
}

/**
 * Canonical fields accepted by calendar entry APIs.
 */
export const CANONICAL_ENTRY_FIELDS = [
  'title',
  'form_name',
  'category',
  'due_date',
  'applies_to',
  'description',
  'statutory_ref',
  'penalty_text',
  'recurrence',
  'source_url',
  'last_verified_at',
  'original_date',
  'is_extended',
  'extension_ref',
  'extension_note',
  'display_order',
  'is_live',
  'recurrence_rule',
  'parent_entry_id',
  'ignore_duplicate',
  'force',
] as const

/**
 * Mapping of legacy or alternative aliases to canonical field names.
 */
export const ACCEPTED_FIELD_ALIASES: Record<string, string> = {
  compliance_title: 'title',
  regulator: 'category',
  category_slug: 'category',
  category_id: 'category',
  date: 'due_date',
  applicable_to: 'applies_to',
  act_rule_reference: 'statutory_ref',
  regulation_reference: 'statutory_ref',
  penalty_details: 'penalty_text',
  penalty: 'penalty_text',
  frequency: 'recurrence',
  official_source_url: 'source_url',
  official_link: 'source_url',
  last_verified: 'last_verified_at',
  is_active: 'is_live',
}

/**
 * Validate input fields against canonical fields + accepted aliases.
 * Rejects unknown fields with HTTP 400.
 */
export function validateEntryFields(
  body: Record<string, any>,
  options: { isPatch?: boolean } = {}
): {
  valid: boolean
  unknownFields: string[]
  canonical: Record<string, any>
} {
  const allowedKeys = new Set<string>([
    ...CANONICAL_ENTRY_FIELDS,
    ...Object.keys(ACCEPTED_FIELD_ALIASES),
    ...(options.isPatch ? ['reason', 'deletion_reason'] : []),
  ])

  const unknownFields = Object.keys(body || {}).filter(k => !allowedKeys.has(k))
  if (unknownFields.length > 0) {
    return { valid: false, unknownFields, canonical: {} }
  }

  const canonical: Record<string, any> = {}

  // Resolve values
  if (body.title !== undefined || body.compliance_title !== undefined) {
    canonical.title = String(body.title ?? body.compliance_title).trim()
  }
  if (body.form_name !== undefined) {
    canonical.form_name = String(body.form_name).trim()
  }
  if (body.due_date !== undefined || body.date !== undefined) {
    canonical.due_date = String(body.due_date ?? body.date).trim()
  }
  if (body.applies_to !== undefined || body.applicable_to !== undefined) {
    canonical.applies_to = String(body.applies_to ?? body.applicable_to).trim()
  }
  if (body.category !== undefined || body.regulator !== undefined || body.category_slug !== undefined || body.category_id !== undefined) {
    canonical.category = String(body.category ?? body.regulator ?? body.category_slug ?? body.category_id).trim().toLowerCase()
    if (body.category_id !== undefined) canonical.category_id = body.category_id
  }
  if (body.description !== undefined) {
    canonical.description = body.description ? String(body.description).trim() : null
  }
  if (body.statutory_ref !== undefined || body.act_rule_reference !== undefined || body.regulation_reference !== undefined) {
    const val = body.statutory_ref ?? body.act_rule_reference ?? body.regulation_reference
    canonical.statutory_ref = val ? String(val).trim() : null
  }
  if (body.penalty_text !== undefined || body.penalty_details !== undefined || body.penalty !== undefined) {
    const val = body.penalty_text ?? body.penalty_details ?? body.penalty
    canonical.penalty_text = val ? String(val).trim() : null
  }
  if (body.recurrence !== undefined || body.frequency !== undefined) {
    canonical.recurrence = body.recurrence ?? body.frequency
  }
  if (body.source_url !== undefined || body.official_source_url !== undefined || body.official_link !== undefined) {
    const val = body.source_url ?? body.official_source_url ?? body.official_link
    canonical.source_url = val ? String(val).trim() : null
  }
  if (body.last_verified_at !== undefined || body.last_verified !== undefined) {
    canonical.last_verified_at = body.last_verified_at ?? body.last_verified
  }
  if (body.original_date !== undefined) {
    canonical.original_date = body.original_date ? String(body.original_date).trim() : null
  }
  if (body.is_extended !== undefined) {
    canonical.is_extended = Boolean(body.is_extended)
  }
  if (body.extension_ref !== undefined) {
    canonical.extension_ref = body.extension_ref ? String(body.extension_ref).trim() : null
  }
  if (body.extension_note !== undefined) {
    canonical.extension_note = body.extension_note ? String(body.extension_note).trim() : null
  }
  if (body.display_order !== undefined) {
    canonical.display_order = Number(body.display_order)
  }
  if (body.is_live !== undefined || body.is_active !== undefined) {
    canonical.is_live = Boolean(body.is_live ?? body.is_active)
  }
  if (body.recurrence_rule !== undefined) {
    canonical.recurrence_rule = body.recurrence_rule
  }
  if (body.parent_entry_id !== undefined) {
    canonical.parent_entry_id = body.parent_entry_id
  }
  if (body.ignore_duplicate !== undefined || body.force !== undefined) {
    canonical.ignore_duplicate = Boolean(body.ignore_duplicate ?? body.force)
  }
  if (options.isPatch && (body.reason !== undefined || body.deletion_reason !== undefined)) {
    canonical.reason = body.reason ?? body.deletion_reason
  }

  return { valid: true, unknownFields: [], canonical }
}
