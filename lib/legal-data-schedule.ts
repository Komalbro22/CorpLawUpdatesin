import { supabaseAdmin } from '@/lib/supabase-server'
import { LEGAL_SCHEDULE_SEED, LegalScheduleSeedItem } from '@/data/director-appointment-seed'

export interface LegalScheduleItem {
  id: string
  code: string
  category: 'fee' | 'deadline' | 'statutory_rule' | 'notice_period'
  label: string
  data_value: Record<string, any>
  governing_section: string
  source_reference: string
  last_verified: string
  created_at?: string
  updated_at?: string
}

// In-memory runtime mirror for zero-drift reads and test environments / pre-migration states
let runtimeScheduleStore: LegalScheduleItem[] = LEGAL_SCHEDULE_SEED.map((s, idx) => ({
  id: `sched-seed-${idx + 1}`,
  code: s.code,
  category: s.category,
  label: s.label,
  data_value: JSON.parse(JSON.stringify(s.data_value)),
  governing_section: s.governing_section,
  source_reference: s.source_reference,
  last_verified: '2026-11-07',
  created_at: '2026-11-07T00:00:00Z',
  updated_at: '2026-11-07T00:00:00Z'
}))

/**
 * Fast timeout wrapper to prevent slow network hanging during Next.js SSG build prerender.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 3500, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<T>(resolve => {
    timer = setTimeout(() => resolve(fallback), timeoutMs)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer))
}

/**
 * Single source of truth query helper for legal_data_schedule.
 * Hub, spokes, file generators, and admin checkers read from here.
 */
export async function getAllLegalScheduleItems(): Promise<LegalScheduleItem[]> {
  try {
    const fetchPromise = supabaseAdmin
      .from('legal_data_schedule')
      .select('*')
      .order('code', { ascending: true })

    const res = await withTimeout(fetchPromise as any, 3000, { data: null, error: { message: 'timeout' } })
    const { data, error } = res as any

    if (error || !data || data.length === 0) {
      return runtimeScheduleStore
    }

    runtimeScheduleStore = data as LegalScheduleItem[]
    return runtimeScheduleStore
  } catch (err) {
    return runtimeScheduleStore
  }
}

/**
 * Retrieve a single schedule record by code directly.
 */
export async function getLegalScheduleItem(code: string): Promise<LegalScheduleItem | null> {
  const all = await getAllLegalScheduleItems()
  return all.find(item => item.code === code) || null
}

/**
 * Returns DIR-12 normal fee slabs and late fee multipliers formatted for tables and generators.
 */
export async function getDIR12FeeSchedule() {
  const all = await getAllLegalScheduleItems()

  const feeSlabs = all
    .filter(i => i.code.startsWith('FEE_DIR12_SLAB_'))
    .sort((a, b) => (a.data_value.min_capital || 0) - (b.data_value.min_capital || 0))
    .map(i => ({
      code: i.code,
      label: i.label,
      minCapital: i.data_value.min_capital,
      maxCapital: i.data_value.max_capital,
      amount: i.data_value.amount,
      currency: i.data_value.currency || 'INR',
      description: i.data_value.description,
      governingSection: i.governing_section,
      sourceReference: i.source_reference
    }))

  const lateFeeBands = all
    .filter(i => i.code.startsWith('LATE_FEE_DIR12_BAND_'))
    .sort((a, b) => (a.data_value.min_delay_days || 0) - (b.data_value.min_delay_days || 0))
    .map(i => ({
      code: i.code,
      label: i.label,
      minDelayDays: i.data_value.min_delay_days,
      maxDelayDays: i.data_value.max_delay_days,
      multiplier: i.data_value.multiplier,
      displayText: i.data_value.display_text,
      governingSection: i.governing_section,
      sourceReference: i.source_reference
    }))

  return { feeSlabs, lateFeeBands }
}

/**
 * Returns key statutory deadlines and notice periods for filing workflows.
 */
export async function getStatutoryDeadlinesMap(): Promise<Record<string, LegalScheduleItem>> {
  const all = await getAllLegalScheduleItems()
  const map: Record<string, LegalScheduleItem> = {}
  for (const item of all) {
    map[item.code] = item
  }
  return map
}

/**
 * Seed initial legal data schedule if table is empty.
 */
export async function seedLegalScheduleIfEmpty(): Promise<LegalScheduleItem[]> {
  try {
    const { count, error: countErr } = await supabaseAdmin
      .from('legal_data_schedule')
      .select('id', { count: 'exact', head: true })

    if (countErr || (count && count > 0)) {
      return runtimeScheduleStore
    }

    const insertPayload = LEGAL_SCHEDULE_SEED.map(seed => ({
      code: seed.code,
      category: seed.category,
      label: seed.label,
      data_value: seed.data_value,
      governing_section: seed.governing_section,
      source_reference: seed.source_reference,
      last_verified: '2026-11-07',
    }))

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('legal_data_schedule')
      .insert(insertPayload)
      .select('*')

    if (insertErr || !inserted) {
      return runtimeScheduleStore
    }

    runtimeScheduleStore = inserted as LegalScheduleItem[]
    return runtimeScheduleStore
  } catch (err) {
    return runtimeScheduleStore
  }
}

/**
 * Updates a legal schedule item.
 * MANDATORY: source_reference must be non-empty string (§11.3 & §11.7).
 * Automatically marks affected document_sets as "Needs re-verification".
 */
export async function updateLegalScheduleItemInDb(
  idOrCode: string,
  updates: {
    data_value: Record<string, any>
    source_reference: string
    label?: string
    governing_section?: string
  },
  auditUser: string = 'admin'
) {
  if (!updates.source_reference || updates.source_reference.trim().length === 0) {
    throw new Error('Mandatory field missing: source_reference is required for every legal schedule modification.')
  }

  const storeIndex = runtimeScheduleStore.findIndex(
    i => i.id === idOrCode || i.code === idOrCode
  )
  const oldItem = storeIndex !== -1 ? runtimeScheduleStore[storeIndex] : null

  let dbUpdated: LegalScheduleItem | null = null
  try {
    const payload: Record<string, any> = {
      data_value: updates.data_value,
      source_reference: updates.source_reference.trim(),
      last_verified: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    }
    if (updates.label) payload.label = updates.label.trim()
    if (updates.governing_section) payload.governing_section = updates.governing_section.trim()

    const isUuid = idOrCode.includes('-') && idOrCode.length === 36
    const query = supabaseAdmin.from('legal_data_schedule').update(payload)
    const { data } = isUuid ? await query.eq('id', idOrCode).select('*').maybeSingle() : await query.eq('code', idOrCode).select('*').maybeSingle()

    if (data) {
      dbUpdated = data as LegalScheduleItem
    }
  } catch (e) {}

  const updatedItem: LegalScheduleItem = {
    id: dbUpdated?.id || oldItem?.id || idOrCode,
    code: dbUpdated?.code || oldItem?.code || idOrCode,
    category: dbUpdated?.category || oldItem?.category || 'fee',
    label: updates.label || dbUpdated?.label || oldItem?.label || idOrCode,
    data_value: updates.data_value,
    governing_section: updates.governing_section || dbUpdated?.governing_section || oldItem?.governing_section || '',
    source_reference: updates.source_reference.trim(),
    last_verified: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString()
  }

  if (storeIndex !== -1) {
    runtimeScheduleStore[storeIndex] = updatedItem
  } else {
    runtimeScheduleStore.push(updatedItem)
  }

  try {
    const noteText = `Schedule item ${updatedItem.code} ('${updatedItem.label}') updated on ${new Date().toISOString().split('T')[0]}. Old: ${JSON.stringify(oldItem?.data_value || {})} -> New: ${JSON.stringify(updates.data_value)}. Instrument: ${updates.source_reference}`

    await supabaseAdmin
      .from('document_sets')
      .update({
        needs_reverification: true,
        reverification_notes: noteText,
        updated_at: new Date().toISOString()
      })
      .neq('status', 'archived')
  } catch (e) {}

  return updatedItem
}
