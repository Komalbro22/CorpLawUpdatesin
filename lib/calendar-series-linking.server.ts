import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidateComplianceMutation } from '@/lib/content-revalidation'
import {
  normalizeFormName,
  candidateDateMatchesRule,
  type LinkingResult,
  type LinkingMatch,
} from '@/lib/compliance-series-rules'

export type { LinkingResult, LinkingMatch }

/**
 * Server-only execution for series linking pass.
 * Identifies unlinked active compliance entries (parent_entry_id IS NULL and recurrence_rule IS NULL)
 * that belong to an existing active series root by regulator + form_name + rule cadence,
 * and sets their parent_entry_id = root.id.
 */
export async function runSeriesLinkingPass(supabaseClient?: any): Promise<LinkingResult> {
  const client = supabaseClient || supabaseAdmin

  // 1. Fetch active series roots
  const { data: roots, error: rootsErr } = await client
    .from('compliance_entries')
    .select('id, regulator, form_name, recurrence_rule')
    .not('recurrence_rule', 'is', null)
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (rootsErr || !roots) {
    throw new Error(`Failed to fetch series roots: ${rootsErr?.message || 'unknown error'}`)
  }

  // 2. Fetch unlinked candidate child rows
  const { data: candidates, error: candErr } = await client
    .from('compliance_entries')
    .select('id, regulator, form_name, due_date, recurrence_rule, parent_entry_id')
    .is('parent_entry_id', null)
    .is('recurrence_rule', null)
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (candErr || !candidates) {
    throw new Error(`Failed to fetch unlinked candidates: ${candErr?.message || 'unknown error'}`)
  }

  const matches: LinkingMatch[] = []

  // Pre-index roots by regulator and normalized form name
  const rootIndex = new Map<string, any>()
  for (const root of roots) {
    const key = `${root.regulator}:${normalizeFormName(root.form_name)}`
    rootIndex.set(key, root)
    const exactKey = `${root.regulator}:${root.form_name.trim().toLowerCase()}`
    rootIndex.set(exactKey, root)
  }

  for (const cand of candidates) {
    const candNorm = normalizeFormName(cand.form_name)
    const candExact = cand.form_name.trim().toLowerCase()
    const matchingRoot = rootIndex.get(`${cand.regulator}:${candNorm}`) || rootIndex.get(`${cand.regulator}:${candExact}`)

    if (matchingRoot && matchingRoot.recurrence_rule) {
      // Check date cadence
      const fitsRule = candidateDateMatchesRule(matchingRoot.recurrence_rule, cand.due_date)
      if (fitsRule) {
        matches.push({
          candidateId: cand.id,
          candidateForm: cand.form_name,
          candidateDueDate: cand.due_date,
          candidateRegulator: cand.regulator,
          rootId: matchingRoot.id,
          rootForm: matchingRoot.form_name,
          rootTemplate: matchingRoot.recurrence_rule.template,
        })
      }
    }
  }

  // Execute linking updates
  let linkedCount = 0
  for (const match of matches) {
    const { error: updateErr } = await client
      .from('compliance_entries')
      .update({
        parent_entry_id: match.rootId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', match.candidateId)

    if (!updateErr) {
      linkedCount++
    }
  }

  if (linkedCount > 0) {
    await revalidateComplianceMutation()
  }

  return {
    totalCandidates: candidates.length,
    linkedCount,
    matches,
  }
}
