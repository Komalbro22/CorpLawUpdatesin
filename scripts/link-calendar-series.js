#!/usr/bin/env node
/**
 * scripts/link-calendar-series.js
 * CLI runner for the compliance calendar series linking pass.
 * Scans active, non-deleted entries with parent_entry_id: null and recurrence_rule: null,
 * matches them against active series roots by regulator + form_name + cadence,
 * and sets parent_entry_id = root.id.
 *
 * Usage:
 *   node scripts/link-calendar-series.js
 *   npm run calendar:link
 */

const fs = require('fs')
const path = require('path')

// Load .env.local if present
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=')
      const k = trimmed.slice(0, idx).trim()
      const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[k]) process.env[k] = v
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function normalizeFormName(formName) {
  if (!formName) return ''
  return formName
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function parseEntryDate(dateStr) {
  if (!dateStr) return null
  const match = dateStr.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december']
  const mLower = match[2].toLowerCase()
  const monthIdx = monthNames.findIndex(m => m.startsWith(mLower.slice(0, 3)))
  if (monthIdx === -1) return null
  const year = parseInt(match[3], 10)
  const d = new Date(year, monthIdx, day)
  return isNaN(d.getTime()) ? null : d
}

function candidateDateMatchesRule(rule, candidateDateStr) {
  const parsed = parseEntryDate(candidateDateStr)
  if (!parsed) return false
  const day = parsed.getDate()
  const month = parsed.getMonth() + 1

  switch (rule.template) {
    case 'day_of_month_next': {
      if (rule.day === day) return true
      if (rule.month_overrides) {
        return Object.values(rule.month_overrides).some(o => o.day === day)
      }
      return false
    }
    case 'day_after_period_end':
      return rule.day === day
    case 'quarter_map': {
      return Object.values(rule.map).some(([m, d]) => m === month && d === day)
    }
    case 'instalment_map': {
      return rule.map.some(inst => inst.month === month && inst.day === day)
    }
    case 'fixed_annual':
      return rule.month === month && rule.day === day
    case 'half_year_fixed':
      return (rule.h1[0] === month && rule.h1[1] === day) || (rule.h2[0] === month && rule.h2[1] === day)
    case 'triennial_fixed':
      return rule.month === month && rule.day === day
    case 'month_end_plus_days':
    case 'period_end_plus_days':
      return true
    default:
      return true
  }
}

async function main() {
  console.log('--- Compliance Calendar Series Linking Pass ---')

  // 1. Fetch active series roots
  const { data: roots, error: rootsErr } = await supabase
    .from('compliance_entries')
    .select('id, regulator, form_name, recurrence_rule')
    .not('recurrence_rule', 'is', null)
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (rootsErr) {
    console.error('Error fetching series roots:', rootsErr)
    process.exit(1)
  }
  console.log(`Loaded ${roots.length} active series roots.`)

  // 2. Fetch unlinked candidate rows
  const { data: candidates, error: candErr } = await supabase
    .from('compliance_entries')
    .select('id, regulator, form_name, due_date, recurrence_rule, parent_entry_id')
    .is('parent_entry_id', null)
    .is('recurrence_rule', null)
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (candErr) {
    console.error('Error fetching candidates:', candErr)
    process.exit(1)
  }
  console.log(`Found ${candidates.length} unlinked candidate rows.`)

  const rootIndex = new Map()
  for (const root of roots) {
    rootIndex.set(`${root.regulator}:${normalizeFormName(root.form_name)}`, root)
    rootIndex.set(`${root.regulator}:${root.form_name.trim().toLowerCase()}`, root)
  }

  const matches = []
  for (const cand of candidates) {
    const candNorm = normalizeFormName(cand.form_name)
    const candExact = cand.form_name.trim().toLowerCase()
    const matchingRoot = rootIndex.get(`${cand.regulator}:${candNorm}`) || rootIndex.get(`${cand.regulator}:${candExact}`)

    if (matchingRoot && matchingRoot.recurrence_rule) {
      if (candidateDateMatchesRule(matchingRoot.recurrence_rule, cand.due_date)) {
        matches.push({
          candidateId: cand.id,
          formName: cand.form_name,
          dueDate: cand.due_date,
          rootId: matchingRoot.id,
          rootForm: matchingRoot.form_name,
        })
      }
    }
  }

  console.log(`Matched ${matches.length} candidate rows to existing series roots.`)

  let linkedCount = 0
  for (const match of matches) {
    const { error: updateErr } = await supabase
      .from('compliance_entries')
      .update({
        parent_entry_id: match.rootId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', match.candidateId)

    if (updateErr) {
      console.error(`Failed to link entry ${match.candidateId}:`, updateErr)
    } else {
      console.log(`✓ Linked "${match.formName}" (${match.dueDate}) -> Root "${match.rootForm}" (${match.rootId})`)
      linkedCount++
    }
  }

  console.log(`\nLinking pass complete: ${linkedCount} rows linked successfully.`)
}

main().catch(err => {
  console.error('Fatal error in linking pass:', err)
  process.exit(1)
})
