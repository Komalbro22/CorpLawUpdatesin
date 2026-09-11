/**
 * Rule engine for Form PAS-3 (Return of Allotment).
 * Governing Law:
 * - Section 39(4) read with Rule 12 of Companies (Prospectus and Allotment of Securities) Rules, 2014 (Ordinary Allotments - 30 days)
 * - Section 42(8) read with Rule 14 of Companies (PAS) Rules, 2014 (Private Placement - 15 days)
 * - Section 39(5) penalty: ₹1,000/day up to ₹1,00,000 (company and each officer in default)
 * - Section 42(9) penalty: ₹1,000/day up to ₹25,00,000 (company, promoters, and directors personally)
 * - Section 42(6) proviso: Application money cannot be used until PAS-3 is filed (contravention under 42(10): up to amount raised or ₹2 Cr)
 * - Section 446B concession: Half penalty for Small Company, OPC, DPIIT Startup, Producer Company (Max ₹2L for company, ₹1L for officer/promoter/director)
 * - Companies (Registration Offices and Fees) Rules, 2014: Table A (Base fee ₹200-₹600) and Table B (Multipliers 2x to 12x)
 */

export type Pas3AllotmentMode = 'private_placement' | 'ordinary_allotment'

export type Pas3CompanyType =
  | 'normal'
  | 'small_company'
  | 'opc'
  | 'startup'
  | 'producer'
  | 'nidhi'
  | 'without_share_capital'

export interface Pas3Input {
  allotmentMode: Pas3AllotmentMode
  companyType: Pas3CompanyType
  authorisedCapital: number
  allotmentDate: string // YYYY-MM-DD
  filingDate: string // YYYY-MM-DD
  numPromotersDirectors?: number // default 2
  fundsUtilisedBeforeFiling?: boolean
  applicationMoneyReceivedDate?: string // YYYY-MM-DD (to check 60-day allotment window)
  allotmentCount?: number // Number of distinct allotment dates (to check 5-allotment batching rule)
  oldestAllotmentDate?: string // For multiple allotments
  amountRaised?: number // For Section 42(10) potential exposure
  nominalValueIssued?: number // For Nidhi companies
}

export interface Pas3CalculationResult {
  allotmentMode: Pas3AllotmentMode
  companyType: Pas3CompanyType
  authorisedCapital: number
  allotmentDate: string
  filingDate: string
  statutoryDeadlineDays: number // 15 or 30
  statutoryDueDate: string // YYYY-MM-DD
  delayDays: number
  isDelayed: boolean
  governingSection: string

  // Fee Breakdown
  normalFee: number
  feeSlabLabel: string
  lateMultiplier: number
  additionalLateFee: number
  totalMcaChallanFee: number

  // Statutory Adjudication Penalties
  dailyPenaltyRate: number
  rawDelayPenalty: number
  penaltyRegime: string
  companyPenaltyCap: number
  individualPenaltyCap: number
  companyPenalty: number
  perIndividualPenalty: number
  numIndividuals: number
  individualRoleTitle: string
  totalIndividualPenalty: number
  totalAdjudicationPenalty: number
  section446BApplied: boolean
  savingsFrom446B: number

  // Overall Financial Exposure
  totalFinancialExposure: number

  // Compliance Flags & Warnings
  warnings: string[]
  criticalBreaches: string[]
  passedChecks: string[]
}

/**
 * Parses YYYY-MM-DD safely into UTC date.
 */
function parseDateUtc(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
function formatDateIso(d: Date): string {
  return d.toISOString().split('T')[0]
}

/**
 * Formats a number to Indian Currency string (e.g. ₹25,00,000).
 */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Calculate standard MCA base filing fee (Table A).
 */
export function calculatePas3BaseFee(
  capital: number,
  companyType: Pas3CompanyType,
  nominalValueIssued: number = 0
): { normalFee: number; slabLabel: string } {
  if (companyType === 'without_share_capital') {
    return {
      normalFee: 200,
      slabLabel: 'Company without share capital (Flat ₹200)'
    }
  }

  if (companyType === 'nidhi') {
    // ₹1 for every ₹100 of nominal value issued, capped at normal capital slab
    const calculatedNidhiFee = Math.max(200, Math.ceil(nominalValueIssued / 100))
    const cap = capital >= 10000000 ? 600 : capital >= 2500000 ? 500 : capital >= 500000 ? 400 : capital >= 100000 ? 300 : 200
    const finalFee = Math.min(calculatedNidhiFee, cap)
    return {
      normalFee: finalFee,
      slabLabel: `Nidhi Company (₹1 per ₹100 nominal, capped at ₹${cap})`
    }
  }

  if (capital < 100000) {
    return { normalFee: 200, slabLabel: 'Less than ₹1,00,000 (₹200)' }
  } else if (capital < 500000) {
    return { normalFee: 300, slabLabel: '₹1,00,000 to ₹4,99,999 (₹300)' }
  } else if (capital < 2500000) {
    return { normalFee: 400, slabLabel: '₹5,00,000 to ₹24,99,999 (₹400)' }
  } else if (capital < 10000000) {
    return { normalFee: 500, slabLabel: '₹25,00,000 to ₹99,99,999 (₹500)' }
  } else {
    return { normalFee: 600, slabLabel: '₹1,00,00,000 or more (₹600)' }
  }
}

/**
 * Calculates Table B escalation multiplier based on days of delay.
 */
export function getTableBLateMultiplier(delayDays: number): number {
  if (delayDays <= 0) return 0
  if (delayDays <= 30) return 2
  if (delayDays <= 60) return 4
  if (delayDays <= 90) return 6
  if (delayDays <= 180) return 10
  return 12
}

/**
 * Main PAS-3 Compliance & Fee Calculation Engine.
 */
export function calculatePas3Compliance(input: Pas3Input): Pas3CalculationResult {
  const {
    allotmentMode,
    companyType,
    authorisedCapital,
    allotmentDate,
    filingDate,
    numPromotersDirectors = 2,
    fundsUtilisedBeforeFiling = false,
    applicationMoneyReceivedDate,
    allotmentCount = 1,
    oldestAllotmentDate,
    nominalValueIssued = 0
  } = input

  // 1. Determine statutory deadline days based on mode of allotment
  // Section 42(8) vs Section 39(4)
  const isPrivatePlacement = allotmentMode === 'private_placement'
  const statutoryDeadlineDays = isPrivatePlacement ? 15 : 30
  const governingSection = isPrivatePlacement
    ? 'Section 42(8) read with Rule 14, Companies (PAS) Rules, 2014'
    : 'Section 39(4) read with Rule 12, Companies (PAS) Rules, 2014'

  // 2. Compute due date and delay
  const allotmentDateObj = parseDateUtc(allotmentDate)
  const dueDateObj = new Date(allotmentDateObj.getTime())
  dueDateObj.setUTCDate(dueDateObj.getUTCDate() + statutoryDeadlineDays)
  const statutoryDueDate = formatDateIso(dueDateObj)

  const filingDateObj = parseDateUtc(filingDate)
  const diffTime = filingDateObj.getTime() - dueDateObj.getTime()
  const delayDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  const isDelayed = delayDays > 0

  // 3. Normal base fee & Table B late fees
  const { normalFee, slabLabel: feeSlabLabel } = calculatePas3BaseFee(
    authorisedCapital,
    companyType,
    nominalValueIssued
  )
  const lateMultiplier = getTableBLateMultiplier(delayDays)
  const additionalLateFee = normalFee * lateMultiplier
  const totalMcaChallanFee = normalFee + additionalLateFee

  // 4. Statutory Penalties: Section 39(5) vs Section 42(9)
  const is446BEligible = [
    'small_company',
    'opc',
    'startup',
    'producer'
  ].includes(companyType)

  const dailyPenaltyRate = 1000
  const rawDelayPenalty = dailyPenaltyRate * delayDays

  let companyPenaltyCap = 0
  let individualPenaltyCap = 0
  let penaltyRegime = ''
  let individualRoleTitle = ''

  if (isPrivatePlacement) {
    // Section 42(9): company, promoters, and directors personally (Cap ₹25 Lakh each)
    penaltyRegime = 'Section 42(9) — Private Placement Allotment Default'
    individualRoleTitle = 'Promoter / Director (Personal Liability)'

    if (is446BEligible) {
      // Under Section 446B: Max ₹2,00,000 for company, ₹1,00,000 for each officer/promoter
      companyPenaltyCap = 200000
      individualPenaltyCap = 100000
    } else {
      companyPenaltyCap = 2500000
      individualPenaltyCap = 2500000
    }
  } else {
    // Section 39(5): company and every officer in default (Cap ₹1 Lakh each)
    penaltyRegime = 'Section 39(5) — Ordinary Return of Allotment Default'
    individualRoleTitle = 'Officer in Default'

    if (is446BEligible) {
      companyPenaltyCap = 100000 // min(raw/2, 100000)
      individualPenaltyCap = 100000
    } else {
      companyPenaltyCap = 100000
      individualPenaltyCap = 100000
    }
  }

  // Calculate actual penalties
  let companyPenalty = 0
  let perIndividualPenalty = 0
  let standardTotalPenaltyWithout446B = 0

  if (isDelayed) {
    if (isPrivatePlacement) {
      if (is446BEligible) {
        // Half penalty up to 2L / 1L
        companyPenalty = Math.min(Math.floor(rawDelayPenalty / 2), companyPenaltyCap)
        perIndividualPenalty = Math.min(Math.floor(rawDelayPenalty / 2), individualPenaltyCap)
        const unreducedCo = Math.min(rawDelayPenalty, 2500000)
        const unreducedInd = Math.min(rawDelayPenalty, 2500000)
        standardTotalPenaltyWithout446B = unreducedCo + unreducedInd * numPromotersDirectors
      } else {
        companyPenalty = Math.min(rawDelayPenalty, companyPenaltyCap)
        perIndividualPenalty = Math.min(rawDelayPenalty, individualPenaltyCap)
        standardTotalPenaltyWithout446B = companyPenalty + perIndividualPenalty * numPromotersDirectors
      }
    } else {
      if (is446BEligible) {
        // Half penalty up to 1L
        companyPenalty = Math.min(Math.floor(rawDelayPenalty / 2), companyPenaltyCap)
        perIndividualPenalty = Math.min(Math.floor(rawDelayPenalty / 2), individualPenaltyCap)
        const unreducedCo = Math.min(rawDelayPenalty, 100000)
        const unreducedInd = Math.min(rawDelayPenalty, 100000)
        standardTotalPenaltyWithout446B = unreducedCo + unreducedInd * numPromotersDirectors
      } else {
        companyPenalty = Math.min(rawDelayPenalty, companyPenaltyCap)
        perIndividualPenalty = Math.min(rawDelayPenalty, individualPenaltyCap)
        standardTotalPenaltyWithout446B = companyPenalty + perIndividualPenalty * numPromotersDirectors
      }
    }
  }

  const totalIndividualPenalty = perIndividualPenalty * numPromotersDirectors
  const totalAdjudicationPenalty = companyPenalty + totalIndividualPenalty
  const savingsFrom446B = isDelayed && is446BEligible
    ? Math.max(0, standardTotalPenaltyWithout446B - totalAdjudicationPenalty)
    : 0

  // 5. Total Financial Exposure
  const totalFinancialExposure = totalMcaChallanFee + totalAdjudicationPenalty

  // 6. Formulate Warnings, Critical Breaches & Passed Checks
  const warnings: string[] = []
  const criticalBreaches: string[] = []
  const passedChecks: string[] = []

  if (!isDelayed) {
    passedChecks.push(
      `Filing is within the statutory ${statutoryDeadlineDays}-day window. Zero additional late fees or ROC adjudication penalties apply.`
    )
  } else {
    criticalBreaches.push(
      `Filing is delayed by ${delayDays} day(s) beyond the ${statutoryDeadlineDays}-day statutory deadline (${statutoryDueDate}).`
    )
    if (isPrivatePlacement) {
      criticalBreaches.push(
        `Section 42(9) imposes personal liability on Promoters and Directors up to ${formatInr(individualPenaltyCap)} each, separate from company penalty.`
      )
    }
  }

  // Upstream Check 1: Utilization of funds prior to PAS-3 filing
  if (isPrivatePlacement && fundsUtilisedBeforeFiling) {
    criticalBreaches.push(
      'CRITICAL BREACH (Section 42(6) Proviso): Application money was utilised before Form PAS-3 was filed. Under Section 42(10), this triggers penalty up to amount raised or ₹2 Crore (whichever is lower), plus mandatory refund of all subscription monies with 12% p.a. interest.'
    )
  }

  // Upstream Check 2: 60-day allotment window from application money
  if (isPrivatePlacement && applicationMoneyReceivedDate) {
    const appMoneyDateObj = parseDateUtc(applicationMoneyReceivedDate)
    const allotmentDiffDays = Math.ceil(
      (allotmentDateObj.getTime() - appMoneyDateObj.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (allotmentDiffDays > 60) {
      criticalBreaches.push(
        `Section 42(6) Window Exceeded: Shares were allotted ${allotmentDiffDays} days after receiving application money (exceeding the 60-day statutory limit). The company is legally liable to refund all money with 12% p.a. interest starting from day 61.`
      )
    } else {
      passedChecks.push(
        `Allotment executed within ${allotmentDiffDays} days of receiving application money (well within the 60-day window).`
      )
    }
  }

  // Check 3: Multiple allotment dates batching rule
  if (allotmentCount > 1) {
    if (allotmentCount > 5) {
      warnings.push(
        `MCA V3 Batching Limit: A maximum of 5 allotment dates can be combined in a single Form PAS-3. You have ${allotmentCount} allotments, requiring separate forms.`
      )
    }
    if (oldestAllotmentDate) {
      const oldestDateObj = parseDateUtc(oldestAllotmentDate)
      const batchDiffDays = Math.ceil(
        (filingDateObj.getTime() - oldestDateObj.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (batchDiffDays > 30) {
        warnings.push(
          `MCA V3 30-Day Window Rule: Multiple allotments can ONLY be combined if all allotment dates fall within 30 days of the filing date. Your oldest allotment date (${oldestAllotmentDate}) is ${batchDiffDays} days prior to filing, requiring a separate PAS-3 for each event date.`
        )
      } else {
        passedChecks.push(
          'All batch allotment dates fall within 30 days of filing date and do not exceed the 5-allotment portal limit.'
        )
      }
    }
  }

  // Pre-filing check reminders
  warnings.push(
    'Pre-Filing Compliance: Ensure the company has filed Form INC-22A (ACTIVE) and that the digital signature of the certifying professional (PCS/PCA/PCMA) is registered on MCA V3.'
  )

  return {
    allotmentMode,
    companyType,
    authorisedCapital,
    allotmentDate,
    filingDate,
    statutoryDeadlineDays,
    statutoryDueDate,
    delayDays,
    isDelayed,
    governingSection,
    normalFee,
    feeSlabLabel,
    lateMultiplier,
    additionalLateFee,
    totalMcaChallanFee,
    dailyPenaltyRate,
    rawDelayPenalty,
    penaltyRegime,
    companyPenaltyCap,
    individualPenaltyCap,
    companyPenalty,
    perIndividualPenalty,
    numIndividuals: numPromotersDirectors,
    individualRoleTitle,
    totalIndividualPenalty,
    totalAdjudicationPenalty,
    section446BApplied: is446BEligible && isDelayed,
    savingsFrom446B,
    totalFinancialExposure,
    warnings,
    criticalBreaches,
    passedChecks
  }
}
