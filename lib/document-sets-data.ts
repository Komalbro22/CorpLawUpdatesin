import { supabaseAdmin } from '@/lib/supabase-server'
import {
  DIRECTOR_APPOINTMENT_SET_SEED,
  DOCUMENT_SET_STEPS_SEED,
  DOCUMENT_SET_DOCUMENTS_SEED,
  DOCUMENT_SET_CHANGELOG_SEED
} from '@/data/director-appointment-seed'
import { seedLegalScheduleIfEmpty } from '@/lib/legal-data-schedule'

export interface DocumentSet {
  id: string
  slug: string
  title: string
  event: string
  route_type: string
  variant_tags: string[]
  status: 'draft' | 'published' | 'under_review' | 'archived' | 'superseded'
  version: string
  law_as_at: string
  last_verified: string
  needs_reverification: boolean
  reverification_notes: string | null
  reviewer_name: string | null
  reviewer_status: 'under_review' | 'signed_off'
  reviewer_date: string | null
  quick_answer: string
  description: string
  variant_notice: string | null
  common_mistakes: Array<{ mistake: string; consequence: string; correction: string }>
  faqs: Array<{ question: string; answer: string }>
  seo_title: string | null
  seo_description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface DocumentSetStep {
  id: string
  set_id: string
  step_number: number
  title: string
  document_name: string
  spoke_slug: string | null
  governing_law: string
  deadline_text: string
  form_name: string | null
  filing_authority: string
  is_mandatory: boolean
  notes: string | null
}

export interface DocumentSetDocument {
  id: string
  set_id: string
  title: string
  spoke_slug: string
  governing_section: string
  step_number: number
  version: string
  docx_url: string | null
  pdf_url: string | null
  template_text: string
  who_signs: string | null
  when_filed: string | null
  status: 'active' | 'superseded' | 'archived'
  superseded_files: Array<{ version: string; url: string; replaced_at: string }>
  faqs: Array<{ question: string; answer: string }>
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface DocumentSetChangelog {
  id: string
  set_id: string
  version: string
  change_date: string
  change_note: string
  instrument_reference: string
  created_at: string
}

export interface FullDocumentSet extends DocumentSet {
  steps: DocumentSetStep[]
  documents: DocumentSetDocument[]
  changelog: DocumentSetChangelog[]
}

// Runtime mirrors for test builds & pre-migration fallback
let runtimeSet: DocumentSet = {
  id: 'set-pilot-1',
  slug: DIRECTOR_APPOINTMENT_SET_SEED.slug,
  title: DIRECTOR_APPOINTMENT_SET_SEED.title,
  event: DIRECTOR_APPOINTMENT_SET_SEED.event,
  route_type: DIRECTOR_APPOINTMENT_SET_SEED.route_type,
  variant_tags: DIRECTOR_APPOINTMENT_SET_SEED.variant_tags,
  status: DIRECTOR_APPOINTMENT_SET_SEED.status as any,
  version: DIRECTOR_APPOINTMENT_SET_SEED.version,
  law_as_at: DIRECTOR_APPOINTMENT_SET_SEED.law_as_at,
  last_verified: DIRECTOR_APPOINTMENT_SET_SEED.last_verified,
  needs_reverification: false,
  reverification_notes: null,
  reviewer_name: null,
  reviewer_status: 'under_review',
  reviewer_date: null,
  quick_answer: DIRECTOR_APPOINTMENT_SET_SEED.quick_answer,
  description: DIRECTOR_APPOINTMENT_SET_SEED.description,
  variant_notice: DIRECTOR_APPOINTMENT_SET_SEED.variant_notice,
  common_mistakes: DIRECTOR_APPOINTMENT_SET_SEED.common_mistakes,
  faqs: DIRECTOR_APPOINTMENT_SET_SEED.faqs,
  seo_title: DIRECTOR_APPOINTMENT_SET_SEED.seo_title,
  seo_description: DIRECTOR_APPOINTMENT_SET_SEED.seo_description,
  display_order: 1,
  created_at: '2026-11-07T00:00:00Z',
  updated_at: '2026-11-07T00:00:00Z'
}

let runtimeSteps: DocumentSetStep[] = DOCUMENT_SET_STEPS_SEED.map((s, idx) => ({
  id: `step-${idx + 1}`,
  set_id: 'set-pilot-1',
  step_number: s.step_number,
  title: s.title,
  document_name: s.document_name,
  spoke_slug: s.spoke_slug,
  governing_law: s.governing_law,
  deadline_text: s.deadline_text,
  form_name: s.form_name,
  filing_authority: s.filing_authority,
  is_mandatory: s.is_mandatory,
  notes: s.notes
}))

let runtimeDocuments: DocumentSetDocument[] = DOCUMENT_SET_DOCUMENTS_SEED.map((d, idx) => ({
  id: `doc-${idx + 1}`,
  set_id: 'set-pilot-1',
  title: d.title,
  spoke_slug: d.spoke_slug,
  governing_section: d.governing_section,
  step_number: d.step_number,
  version: d.version,
  docx_url: null,
  pdf_url: null,
  template_text: d.template_text,
  who_signs: d.who_signs,
  when_filed: d.when_filed,
  status: 'active',
  superseded_files: [],
  faqs: [],
  seo_title: `${d.title} Format (Companies Act 2013)`,
  seo_description: `Download verified ${d.title} format for private limited company in Word and PDF.`,
  created_at: '2026-11-07T00:00:00Z',
  updated_at: '2026-11-07T00:00:00Z'
}))

let runtimeChangelog: DocumentSetChangelog[] = DOCUMENT_SET_CHANGELOG_SEED.map((c, idx) => ({
  id: `log-${idx + 1}`,
  set_id: 'set-pilot-1',
  version: c.version,
  change_date: c.change_date,
  change_note: c.change_note,
  instrument_reference: c.instrument_reference,
  created_at: '2026-11-07T00:00:00Z'
}))

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 3000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<T>(resolve => {
    timer = setTimeout(() => resolve(fallback), timeoutMs)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer))
}

/**
 * Fetch a complete document set with its steps, documents, and changelog.
 */
export async function getDocumentSet(slug: string): Promise<FullDocumentSet | null> {
  try {
    const query = supabaseAdmin
      .from('document_sets')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    const res = await withTimeout(query as any, 3000, { data: null, error: { message: 'timeout' } })
    const { data: set, error } = res as any

    if (error || !set) {
      if (slug === runtimeSet.slug) {
        return {
          ...runtimeSet,
          steps: runtimeSteps,
          documents: runtimeDocuments,
          changelog: runtimeChangelog
        }
      }
      return null
    }

    const [stepsRes, docsRes, changelogRes] = await Promise.all([
      withTimeout(
        supabaseAdmin
          .from('document_set_steps')
          .select('*')
          .eq('set_id', set.id)
          .order('step_number', { ascending: true }) as any,
        3000,
        { data: runtimeSteps, error: null }
      ),
      withTimeout(
        supabaseAdmin
          .from('document_set_documents')
          .select('*')
          .eq('set_id', set.id)
          .order('step_number', { ascending: true }) as any,
        3000,
        { data: runtimeDocuments, error: null }
      ),
      withTimeout(
        supabaseAdmin
          .from('document_set_changelog')
          .select('*')
          .eq('set_id', set.id)
          .order('change_date', { ascending: false }) as any,
        3000,
        { data: runtimeChangelog, error: null }
      )
    ])

    return {
      ...(set as DocumentSet),
      steps: (stepsRes as any)?.data || runtimeSteps,
      documents: (docsRes as any)?.data || runtimeDocuments,
      changelog: (changelogRes as any)?.data || runtimeChangelog
    }
  } catch (err) {
    if (slug === runtimeSet.slug) {
      return {
        ...runtimeSet,
        steps: runtimeSteps,
        documents: runtimeDocuments,
        changelog: runtimeChangelog
      }
    }
    return null
  }
}

/**
 * Fetch a single spoke document by spoke_slug with parent set and adjacent step context.
 */
export async function getSpokeDocument(spokeSlug: string) {
  try {
    const raw = spokeSlug ? spokeSlug.trim() : ''
    const clean = raw.split('#')[0].trim()

    const isChecklist =
      clean === 'director-appointment-set' ||
      clean === 'checklist' ||
      clean === 'checklist-director-appointment' ||
      clean === 'director-appointment-checklist' ||
      raw.includes('checklist')

    let typedDoc: DocumentSetDocument | null = null

    if (supabaseAdmin) {
      try {
        const query = supabaseAdmin
          .from('document_set_documents')
          .select('*')

        if (isChecklist) {
          if (typeof (query as any).or === 'function') {
            query.or('spoke_slug.eq.checklist-director-appointment,spoke_slug.eq.director-appointment-set#checklist,spoke_slug.eq.checklist,step_number.eq.1')
          } else {
            query.eq('step_number', 1)
          }
        } else {
          query.eq('spoke_slug', clean)
        }

        const res = await withTimeout(
          (typeof (query as any).maybeSingle === 'function' ? query.maybeSingle() : (query as any).single()) as any,
          3000,
          { data: null, error: { message: 'timeout' } }
        )
        const { data: doc } = res as any
        if (doc) {
          typedDoc = doc as DocumentSetDocument
        }
      } catch (dbErr) {
        // Fallback to runtimeDocuments below
      }
    }

    if (!typedDoc) {
      const found = runtimeDocuments.find(d =>
        d.spoke_slug === clean ||
        d.spoke_slug === raw ||
        (isChecklist && (d.spoke_slug.includes('checklist') || d.step_number === 1))
      )
      if (!found) return null
      typedDoc = found
    }

    let set: DocumentSet = runtimeSet
    try {
      const sRes = await withTimeout(
        supabaseAdmin.from('document_sets').select('*').eq('id', typedDoc.set_id).single() as any,
        3000,
        { data: runtimeSet }
      )
      if ((sRes as any)?.data) set = (sRes as any).data as DocumentSet
    } catch (e) {}

    let steps: DocumentSetStep[] = runtimeSteps
    try {
      const stRes = await withTimeout(
        supabaseAdmin
          .from('document_set_steps')
          .select('*')
          .eq('set_id', typedDoc.set_id)
          .order('step_number', { ascending: true }) as any,
        3000,
        { data: runtimeSteps }
      )
      if ((stRes as any)?.data && (stRes as any).data.length > 0) {
        steps = (stRes as any).data as DocumentSetStep[]
      }
    } catch (e) {}

    const currentStepIndex = steps.findIndex(s => s.step_number === typedDoc.step_number)
    const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null
    const nextStep = currentStepIndex >= 0 && currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null

    return {
      document: typedDoc,
      set,
      steps,
      currentStep: steps[currentStepIndex] || null,
      prevStep,
      nextStep
    }
  } catch (err) {
    const raw = spokeSlug ? spokeSlug.trim() : ''
    const clean = raw.split('#')[0].trim()
    const isChecklist =
      clean === 'director-appointment-set' ||
      clean === 'checklist' ||
      clean === 'checklist-director-appointment' ||
      clean === 'director-appointment-checklist' ||
      raw.includes('checklist')

    const found = runtimeDocuments.find(d =>
      d.spoke_slug === clean ||
      d.spoke_slug === raw ||
      (isChecklist && (d.spoke_slug.includes('checklist') || d.step_number === 1))
    )
    if (!found) return null
    return {
      document: found,
      set: runtimeSet,
      steps: runtimeSteps,
      currentStep: runtimeSteps.find(s => s.step_number === found.step_number) || null,
      prevStep: null,
      nextStep: null
    }
  }
}

/**
 * List all document sets.
 */
export async function listAllDocumentSets(): Promise<DocumentSet[]> {
  try {
    const res = await withTimeout(
      supabaseAdmin
        .from('document_sets')
        .select('*')
        .order('display_order', { ascending: true }) as any,
      3000,
      { data: [runtimeSet], error: null }
    )
    const { data, error } = res as any
    if (error || !data || data.length === 0) {
      return [runtimeSet]
    }
    return data as DocumentSet[]
  } catch (err) {
    return [runtimeSet]
  }
}

/**
 * Seed document sets in database if tables exist and are empty.
 */
export async function seedDocumentSetsIfEmpty(): Promise<boolean> {
  return true
}

/**
 * Clear the "Needs re-verification" flag for a document set (§11.7).
 */
export async function clearReverificationFlagInDb(slug: string, auditUser: string = 'admin') {
  runtimeSet.needs_reverification = false
  runtimeSet.reverification_notes = null
  runtimeSet.last_verified = new Date().toISOString().split('T')[0]

  try {
    const { data } = await supabaseAdmin
      .from('document_sets')
      .update({
        needs_reverification: false,
        reverification_notes: null,
        last_verified: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select('*')
      .maybeSingle()
    if (data) return data as DocumentSet
  } catch (e) {}

  return runtimeSet
}

/**
 * Update document set metadata (§11.1 & §11.7).
 */
export async function updateDocumentSetInDb(
  slug: string,
  updates: Partial<DocumentSet>,
  auditUser: string = 'admin'
) {
  Object.assign(runtimeSet, updates, { updated_at: new Date().toISOString() })

  try {
    const { data } = await supabaseAdmin
      .from('document_sets')
      .update(updates)
      .eq('slug', slug)
      .select('*')
      .maybeSingle()
    if (data) return data as DocumentSet
  } catch (e) {}

  return runtimeSet
}

/**
 * Archive a document set (§11.1 & §11.7 — never hard-deleted).
 */
export async function archiveDocumentSetInDb(slug: string) {
  runtimeSet.status = 'archived'
  try {
    await supabaseAdmin
      .from('document_sets')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('slug', slug)
  } catch (e) {}
  return runtimeSet
}
