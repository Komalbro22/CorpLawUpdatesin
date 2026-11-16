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
