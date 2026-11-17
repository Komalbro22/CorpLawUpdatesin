/**
 * Compliance Calendar Series Rule Engine & Template Library
 * Strictly implements §1 of the Editor Brief (16 Nov 2026).
 *
 * All rules are purely declarative JSON data objects.
 * NO executable code, NO eval(), NO runtime code execution.
 */

export type RuleTemplateName =
  | 'day_of_month_next'
  | 'month_end_plus_days'
  | 'period_end_plus_days'
  | 'day_after_period_end'
  | 'quarter_map'
  | 'fixed_annual'
  | 'half_year_fixed'
  | 'triennial_fixed'
  | 'instalment_map'
  | 'event_offset'
  | 'rrule'

export interface DayOfMonthNextRule {
  template: 'day_of_month_next'
  day: number
  month_overrides?: Record<string, { day: number }>
  skip_months?: number[]
}

export interface MonthEndPlusDaysRule {
  template: 'month_end_plus_days'
  days: number
}

export interface PeriodEndPlusDaysRule {
  template: 'period_end_plus_days'
  period: 'quarter' | 'half_year'
  days: number
  skip_quarters?: number[]
}

export interface DayAfterPeriodEndRule {
  template: 'day_after_period_end'
  period: 'quarter'
  day: number
}

export interface QuarterMapRule {
  template: 'quarter_map'
  map: Record<string, [number, number]> // key: "1"|"2"|"3"|"4", val: [month (1-12), day]
}

export interface FixedAnnualRule {
  template: 'fixed_annual'
  month: number // 1-12
  day: number // 1-31
}

export interface HalfYearFixedRule {
  template: 'half_year_fixed'
  h1: [number, number] // [month, day] e.g. [10, 31]
  h2: [number, number] // [month, day] e.g. [4, 30]
}

export interface TriennialFixedRule {
  template: 'triennial_fixed'
  month: number // 1-12
  day: number // 1-31
  start_year: number // e.g. 2028
}

export interface InstalmentMapRule {
  template: 'instalment_map'
  map: Array<{
    month: number // 1-12
    day: number
    label: string
    pct: number
  }>
}

export interface EventOffsetRule {
  template: 'event_offset'
  event: string // e.g. "AGM"
  days: number
  counting: 'inclusive' | 'exclusive'
  assumed_anchor?: string // e.g. "30 September"
}

export interface RRuleRule {
  template: 'rrule'
  rrule: string
}

export type RecurrenceRule =
  | DayOfMonthNextRule
  | MonthEndPlusDaysRule
  | PeriodEndPlusDaysRule
  | DayAfterPeriodEndRule
  | QuarterMapRule
  | FixedAnnualRule
  | HalfYearFixedRule
  | TriennialFixedRule
  | InstalmentMapRule
  | EventOffsetRule
  | RRuleRule

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * Validates a declarative recurrence rule against the §1.2 allowlist.
 * Rejects unknown templates and invalid parameters with an informative error.
 */
export function validateRecurrenceRule(rule: any): {
  valid: boolean
  error?: string
  normalizedRule?: RecurrenceRule
} {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
    return { valid: false, error: 'Recurrence rule must be a valid JSON object.' }
  }

  const template = rule.template
  if (!template || typeof template !== 'string') {
    return { valid: false, error: 'Recurrence rule must specify a "template" property.' }
  }

  switch (template) {
    case 'day_of_month_next': {
      if (typeof rule.day !== 'number' || rule.day < 1 || rule.day > 31) {
        return { valid: false, error: 'day_of_month_next requires "day" between 1 and 31.' }
      }
      if (rule.month_overrides !== undefined) {
        if (typeof rule.month_overrides !== 'object' || Array.isArray(rule.month_overrides)) {
          return { valid: false, error: 'month_overrides must be an object mapping month strings ("1"-"12") to { day: number }.' }
        }
        for (const [m, o] of Object.entries(rule.month_overrides)) {
          const mNum = parseInt(m, 10)
          if (isNaN(mNum) || mNum < 1 || mNum > 12) {
            return { valid: false, error: `Invalid month override key: "${m}". Must be 1-12.` }
          }
          if (!o || typeof o !== 'object' || typeof (o as any).day !== 'number' || (o as any).day < 1 || (o as any).day > 31) {
            return { valid: false, error: `month_override for month ${m} must have numeric day (1-31).` }
          }
        }
      }
      if (rule.skip_months !== undefined) {
        if (!Array.isArray(rule.skip_months) || !rule.skip_months.every((m: any) => typeof m === 'number' && m >= 1 && m <= 12)) {
          return { valid: false, error: 'skip_months must be an array of month numbers (1-12).' }
        }
      }
      return { valid: true, normalizedRule: rule as DayOfMonthNextRule }
    }

    case 'month_end_plus_days': {
      if (typeof rule.days !== 'number' || rule.days < 1 || rule.days > 90) {
        return { valid: false, error: 'month_end_plus_days requires "days" between 1 and 90.' }
      }
      return { valid: true, normalizedRule: rule as MonthEndPlusDaysRule }
    }

    case 'period_end_plus_days': {
      if (rule.period !== 'quarter' && rule.period !== 'half_year') {
        return { valid: false, error: 'period_end_plus_days requires "period" to be "quarter" or "half_year".' }
      }
      if (typeof rule.days !== 'number' || rule.days < 1 || rule.days > 120) {
        return { valid: false, error: 'period_end_plus_days requires "days" between 1 and 120.' }
      }
      if (rule.skip_quarters !== undefined) {
        if (!Array.isArray(rule.skip_quarters) || !rule.skip_quarters.every((q: any) => typeof q === 'number' && q >= 1 && q <= 4)) {
          return { valid: false, error: 'skip_quarters must be an array of quarter numbers (1-4).' }
        }
      }
      return { valid: true, normalizedRule: rule as PeriodEndPlusDaysRule }
    }

    case 'day_after_period_end': {
      if (rule.period !== 'quarter') {
        return { valid: false, error: 'day_after_period_end requires "period" to be "quarter".' }
      }
      if (typeof rule.day !== 'number' || rule.day < 1 || rule.day > 31) {
        return { valid: false, error: 'day_after_period_end requires "day" between 1 and 31.' }
      }
      return { valid: true, normalizedRule: rule as DayAfterPeriodEndRule }
    }

    case 'quarter_map': {
      if (!rule.map || typeof rule.map !== 'object' || Array.isArray(rule.map)) {
        return { valid: false, error: 'quarter_map requires a "map" object with keys "1", "2", "3", "4".' }
      }
      for (const q of ['1', '2', '3', '4']) {
        const val = rule.map[q]
        if (!Array.isArray(val) || val.length !== 2 || typeof val[0] !== 'number' || typeof val[1] !== 'number' || val[0] < 1 || val[0] > 12 || val[1] < 1 || val[1] > 31) {
          return { valid: false, error: `quarter_map for Q${q} must be [month (1-12), day (1-31)].` }
        }
      }
      return { valid: true, normalizedRule: rule as QuarterMapRule }
    }

    case 'fixed_annual': {
      if (typeof rule.month !== 'number' || rule.month < 1 || rule.month > 12) {
        return { valid: false, error: 'fixed_annual requires "month" between 1 and 12.' }
      }
      if (typeof rule.day !== 'number' || rule.day < 1 || rule.day > 31) {
        return { valid: false, error: 'fixed_annual requires "day" between 1 and 31.' }
      }
      return { valid: true, normalizedRule: rule as FixedAnnualRule }
    }

    case 'half_year_fixed': {
      if (!Array.isArray(rule.h1) || rule.h1.length !== 2 || !Array.isArray(rule.h2) || rule.h2.length !== 2) {
        return { valid: false, error: 'half_year_fixed requires "h1" and "h2" as [month, day] pairs.' }
      }
      return { valid: true, normalizedRule: rule as HalfYearFixedRule }
    }

    case 'triennial_fixed': {
      if (typeof rule.month !== 'number' || rule.month < 1 || rule.month > 12) {
        return { valid: false, error: 'triennial_fixed requires "month" between 1 and 12.' }
      }
      if (typeof rule.day !== 'number' || rule.day < 1 || rule.day > 31) {
        return { valid: false, error: 'triennial_fixed requires "day" between 1 and 31.' }
      }
      if (typeof rule.start_year !== 'number' || rule.start_year < 2026) {
        return { valid: false, error: 'triennial_fixed requires "start_year" >= 2026.' }
      }
      return { valid: true, normalizedRule: rule as TriennialFixedRule }
    }

    case 'instalment_map': {
      if (!Array.isArray(rule.map) || rule.map.length === 0) {
        return { valid: false, error: 'instalment_map requires a non-empty array of instalment items.' }
      }
      for (const item of rule.map) {
        if (typeof item.month !== 'number' || typeof item.day !== 'number' || !item.label || typeof item.pct !== 'number') {
          return { valid: false, error: 'Each item in instalment_map must contain month, day, label, and pct.' }
        }
      }
      return { valid: true, normalizedRule: rule as InstalmentMapRule }
    }

    case 'event_offset': {
      if (!rule.event || typeof rule.event !== 'string') {
        return { valid: false, error: 'event_offset requires "event" (e.g. "AGM").' }
      }
      if (typeof rule.days !== 'number') {
        return { valid: false, error: 'event_offset requires numeric "days".' }
      }
      return { valid: true, normalizedRule: rule as EventOffsetRule }
    }

    case 'rrule': {
      if (!rule.rrule || typeof rule.rrule !== 'string' || !rule.rrule.startsWith('FREQ=')) {
        return { valid: false, error: 'rrule requires standard string starting with "FREQ=".' }
      }
      return { valid: true, normalizedRule: rule as RRuleRule }
    }

    default:
      return {
        valid: false,
        error: `Unknown recurrence rule template "${template}". Allowed templates: day_of_month_next, month_end_plus_days, period_end_plus_days, day_after_period_end, quarter_map, fixed_annual, half_year_fixed, triennial_fixed, instalment_map, event_offset, rrule.`
      }
  }
}

/**
 * Computes the next N preview instances given a validated rule and reference date.
 * Strictly implements §1.3 preview requirement. All computed instances are guaranteed
 * to be strictly forward from the anchor date (dueDate >= anchorMidnight).
 */
export function computePreviewInstances(
  rule: RecurrenceRule,
  anchorDate: Date = new Date(),
  count: number = 3
): Array<{ due_date: string; period_label: string }> {
  // Guardrail: event_offset is documentation-only, engine must refuse generation
  if (rule.template === 'event_offset') {
    return [
      {
        due_date: `Manual (Event-triggered)`,
        period_label: `Documentation only: ${rule.event} + ${rule.days} days (${rule.counting}). Event dates vary per entity.`
      }
    ]
  }

  const results: Array<{ due_date: string; period_label: string }> = []
  const startYear = anchorDate.getFullYear()
  const startMonth = anchorDate.getMonth() + 1 // 1-12
  const anchorMidnight = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate()).getTime()

  switch (rule.template) {
    case 'day_of_month_next': {
      let curY = startYear
      let curM = startMonth
      let iterations = 0

      while (results.length < count && iterations++ < 48) {
        if (rule.skip_months && rule.skip_months.includes(curM)) {
          curM++
          if (curM > 12) { curM = 1; curY++ }
          continue
        }
        let dueM = curM + 1
        let dueY = curY
        if (dueM > 12) { dueM = 1; dueY++ }

        let day = rule.day
        if (rule.month_overrides && rule.month_overrides[String(curM)]) {
          day = rule.month_overrides[String(curM)].day
        }

        const dueTime = new Date(dueY, dueM - 1, day).getTime()
        if (dueTime >= anchorMidnight) {
          results.push({
            due_date: `${day} ${MONTH_NAMES[dueM - 1]} ${dueY}`,
            period_label: `${MONTH_NAMES[curM - 1]} ${curY}`
          })
        }

        curM++
        if (curM > 12) { curM = 1; curY++ }
      }
      break
    }

    case 'month_end_plus_days': {
      let curY = startYear
      let curM = startMonth
      let iterations = 0

      while (results.length < count && iterations++ < 48) {
        // Find last day of period month curM in curY (day 0 of next month in JS Date)
        const lastDayOfPeriod = new Date(Date.UTC(curY, curM, 0))
        const dueDateObj = new Date(lastDayOfPeriod.getTime() + rule.days * 86400000)
        const d = dueDateObj.getUTCDate()
        const m = dueDateObj.getUTCMonth()
        const y = dueDateObj.getUTCFullYear()

        const dueTime = new Date(y, m, d).getTime()
        if (dueTime >= anchorMidnight) {
          results.push({
            due_date: `${d} ${MONTH_NAMES[m]} ${y}`,
            period_label: `${MONTH_NAMES[curM - 1]} ${curY}`
          })
        }

        curM++
        if (curM > 12) { curM = 1; curY++ }
      }
      break
    }

    case 'period_end_plus_days': {
      if (rule.period === 'quarter') {
        // Quarters: Q1 ends 30 Jun, Q2 ends 30 Sep, Q3 ends 31 Dec, Q4 ends 31 Mar
        const quarterEnds = [
          { q: 4, m: 3, d: 31, label: (y: number) => `Q4 (Jan-Mar) FY ${y-1}-${String(y).slice(-2)}` },
          { q: 1, m: 6, d: 30, label: (y: number) => `Q1 (Apr-Jun) FY ${y}-${String(y+1).slice(-2)}` },
          { q: 2, m: 9, d: 30, label: (y: number) => `Q2 (Jul-Sep) FY ${y}-${String(y+1).slice(-2)}` },
          { q: 3, m: 12, d: 31, label: (y: number) => `Q3 (Oct-Dec) FY ${y}-${String(y+1).slice(-2)}` },
        ]

        let curY = startYear - 1
        let qIdx = 0
        let iterations = 0

        while (results.length < count && iterations++ < 32) {
          const qe = quarterEnds[qIdx]
          if (rule.skip_quarters && rule.skip_quarters.includes(qe.q)) {
            qIdx = (qIdx + 1) % 4
            if (qIdx === 0) curY++
            continue
          }

          const qEndObj = new Date(Date.UTC(curY, qe.m - 1, qe.d))
          const dueDateObj = new Date(qEndObj.getTime() + rule.days * 86400000)
          const dueTime = new Date(dueDateObj.getUTCFullYear(), dueDateObj.getUTCMonth(), dueDateObj.getUTCDate()).getTime()

          if (dueTime >= anchorMidnight) {
            results.push({
              due_date: `${dueDateObj.getUTCDate()} ${MONTH_NAMES[dueDateObj.getUTCMonth()]} ${dueDateObj.getUTCFullYear()}`,
              period_label: qe.label(curY)
            })
          }

          qIdx = (qIdx + 1) % 4
          if (qIdx === 0) curY++
        }
      } else if (rule.period === 'half_year') {
        // H1 ends 30 Sep, H2 ends 31 Mar
        let curY = startYear - 1
        let isH1 = true
        let iterations = 0

        while (results.length < count && iterations++ < 20) {
          if (isH1) {
            const h1End = new Date(Date.UTC(curY, 8, 30))
            const dueObj = new Date(h1End.getTime() + rule.days * 86400000)
            const dueTime = new Date(dueObj.getUTCFullYear(), dueObj.getUTCMonth(), dueObj.getUTCDate()).getTime()

            if (dueTime >= anchorMidnight) {
              results.push({
                due_date: `${dueObj.getUTCDate()} ${MONTH_NAMES[dueObj.getUTCMonth()]} ${dueObj.getUTCFullYear()}`,
                period_label: `H1 (Apr-Sep) FY ${curY}-${String(curY + 1).slice(-2)}`
              })
            }
            isH1 = false
          } else {
            const h2End = new Date(Date.UTC(curY + 1, 2, 31))
            const dueObj = new Date(h2End.getTime() + rule.days * 86400000)
            const dueTime = new Date(dueObj.getUTCFullYear(), dueObj.getUTCMonth(), dueObj.getUTCDate()).getTime()

            if (dueTime >= anchorMidnight) {
              results.push({
                due_date: `${dueObj.getUTCDate()} ${MONTH_NAMES[dueObj.getUTCMonth()]} ${dueObj.getUTCFullYear()}`,
                period_label: `H2 (Oct-Mar) FY ${curY}-${String(curY + 1).slice(-2)}`
              })
            }
            isH1 = true
            curY++
          }
        }
      }
      break
    }

    case 'day_after_period_end': {
      // Day D of month after quarter ends (Jun -> Jul, Sep -> Oct, Dec -> Jan, Mar -> Apr)
      const quarters = [
        { q: 4, endM: 3, dueM: 4, label: (y: number) => `Q4 (Jan-Mar) FY ${y-1}-${String(y).slice(-2)}`, dueYearOffset: 0 },
        { q: 1, endM: 6, dueM: 7, label: (y: number) => `Q1 (Apr-Jun) FY ${y}-${String(y+1).slice(-2)}`, dueYearOffset: 0 },
        { q: 2, endM: 9, dueM: 10, label: (y: number) => `Q2 (Jul-Sep) FY ${y}-${String(y+1).slice(-2)}`, dueYearOffset: 0 },
        { q: 3, endM: 12, dueM: 1, label: (y: number) => `Q3 (Oct-Dec) FY ${y}-${String(y+1).slice(-2)}`, dueYearOffset: 1 },
      ]

      let curY = startYear - 1
      let qIdx = 0
      let iterations = 0

      while (results.length < count && iterations++ < 32) {
        const q = quarters[qIdx]
        const dueY = curY + q.dueYearOffset
        const dueTime = new Date(dueY, q.dueM - 1, rule.day).getTime()

        if (dueTime >= anchorMidnight) {
          results.push({
            due_date: `${rule.day} ${MONTH_NAMES[q.dueM - 1]} ${dueY}`,
            period_label: q.label(curY)
          })
        }

        qIdx = (qIdx + 1) % 4
        if (qIdx === 0) curY++
      }
      break
    }

    case 'quarter_map': {
      const qKeys: Array<'1'|'2'|'3'|'4'> = ['1', '2', '3', '4']
      const qLabels = [
        (y: number) => `Q1 (Apr-Jun) FY ${y}-${String(y+1).slice(-2)}`,
        (y: number) => `Q2 (Jul-Sep) FY ${y}-${String(y+1).slice(-2)}`,
        (y: number) => `Q3 (Oct-Dec) FY ${y}-${String(y+1).slice(-2)}`,
        (y: number) => `Q4 (Jan-Mar) FY ${y-1}-${String(y).slice(-2)}`,
      ]

      let curY = startYear - 1
      let qIdx = 0
      let iterations = 0

      while (results.length < count && iterations++ < 32) {
        const qKey = qKeys[qIdx]
        const [m, d] = rule.map[qKey]
        // Year calculation: Q3/Q4 may fall in next calendar year
        let dueY = curY
        if (qKey === '3' && m < 4) dueY = curY + 1
        if (qKey === '4') dueY = curY + 1

        const dueTime = new Date(dueY, m - 1, d).getTime()
        if (dueTime >= anchorMidnight) {
          results.push({
            due_date: `${d} ${MONTH_NAMES[m - 1]} ${dueY}`,
            period_label: qLabels[qIdx](curY)
          })
        }

        qIdx = (qIdx + 1) % 4
        if (qIdx === 0) curY++
      }
      break
    }

    case 'fixed_annual': {
      let curY = startYear - 1
      let iterations = 0
      while (results.length < count && iterations++ < 20) {
        const dueTime = new Date(curY, rule.month - 1, rule.day).getTime()
        if (dueTime >= anchorMidnight) {
          results.push({
            due_date: `${rule.day} ${MONTH_NAMES[rule.month - 1]} ${curY}`,
            period_label: `FY ${curY - 1}-${String(curY).slice(-2)}`
          })
        }
        curY++
      }
      break
    }

    case 'half_year_fixed': {
      let curY = startYear - 1
      let isH1 = true
      let iterations = 0

      while (results.length < count && iterations++ < 20) {
        if (isH1) {
          const dueTime = new Date(curY, rule.h1[0] - 1, rule.h1[1]).getTime()
          if (dueTime >= anchorMidnight) {
            results.push({
              due_date: `${rule.h1[1]} ${MONTH_NAMES[rule.h1[0] - 1]} ${curY}`,
              period_label: `H1 (Apr-Sep) FY ${curY}-${String(curY + 1).slice(-2)}`
            })
          }
          isH1 = false
        } else {
          const dueTime = new Date(curY + 1, rule.h2[0] - 1, rule.h2[1]).getTime()
          if (dueTime >= anchorMidnight) {
            results.push({
              due_date: `${rule.h2[1]} ${MONTH_NAMES[rule.h2[0] - 1]} ${curY + 1}`,
              period_label: `H2 (Oct-Mar) FY ${curY}-${String(curY + 1).slice(-2)}`
            })
          }
          isH1 = true
          curY++
        }
      }
      break
    }

    case 'triennial_fixed': {
      let curY = Math.max(rule.start_year, startYear - 3)
      let iterations = 0
      while (results.length < count && iterations++ < 15) {
        const dueTime = new Date(curY, rule.month - 1, rule.day).getTime()
        if (dueTime >= anchorMidnight) {
          results.push({
            due_date: `${rule.day} ${MONTH_NAMES[rule.month - 1]} ${curY}`,
            period_label: `Triennial Cycle (${curY - 3}–${curY})`
          })
        }
        curY += 3
      }
      break
    }

    case 'instalment_map': {
      let curY = startYear - 1
      let instIdx = 0
      let iterations = 0

      while (results.length < count && iterations++ < 32) {
        const inst = rule.map[instIdx]
        let dueY = curY
        if (inst.month < 4) dueY = curY + 1 // e.g. 4th instalment in March

        const dueTime = new Date(dueY, inst.month - 1, inst.day).getTime()
        if (dueTime >= anchorMidnight) {
          results.push({
            due_date: `${inst.day} ${MONTH_NAMES[inst.month - 1]} ${dueY}`,
            period_label: `${inst.label} Instalment (${inst.pct}% cumulative) FY ${curY}-${String(curY + 1).slice(-2)}`
          })
        }

        instIdx = (instIdx + 1) % rule.map.length
        if (instIdx === 0) curY++
      }
      break
    }

    case 'rrule': {
      results.push({
        due_date: `RRULE Pattern`,
        period_label: rule.rrule
      })
      break
    }
  }

  return results
}

/**
 * Normalizes form names for robust fuzzy matching.
 * E.g., 'GSTR-3B' -> 'gstr3b', 'Advance Tax (4th Instalment)' -> 'advancetax'
 */
export function normalizeFormName(formName: string): string {
  if (!formName) return ''
  return formName
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parentheticals like '(4th Instalment)'
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

/**
 * Checks whether a candidate row's due_date fits a series root's recurrence rule.
 */
export function candidateDateMatchesRule(rule: RecurrenceRule, candidateDateStr: string): boolean {
  const parsed = parseEntryDate(candidateDateStr)
  if (!parsed) return false
  const day = parsed.getDate()
  const month = parsed.getMonth() + 1 // 1-12

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

export interface LinkingMatch {
  candidateId: string
  candidateForm: string
  candidateDueDate: string
  candidateRegulator: string
  rootId: string
  rootForm: string
  rootTemplate: string
}

export interface LinkingResult {
  totalCandidates: number
  linkedCount: number
  matches: LinkingMatch[]
}
