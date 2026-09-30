/**
 * Statutory Rule Engine for MCA Form SH-7
 * (Notice to Registrar of any Alteration of Share Capital)
 *
 * Governing Laws:
 * - Section 64(1) of the Companies Act, 2013 (Mandatory 30-day filing notice)
 * - Section 61(1) (Alteration of Share Capital: Increase, Consolidation, Sub-division, Conversion into Stock, Cancellation)
 * - Section 62(4) read with 62(6) (Increase in capital by Central Government order)
 * - Section 55 read with Section 64(1)(c) (Redemption of redeemable preference shares)
 * - Rule 15 of Companies (Share Capital and Debentures) Rules, 2014
 * - Section 64(2) Adjudication Penalty: ₹500/day up to ₹5,00,000 (Company) and ₹1,00,000 (each Officer in default)
 * - Section 446B Concession: 50% penalty relief for Small Companies, OPCs, Startups (DPIIT), and Producer Companies (Company cap ₹2,00,000; Officer cap ₹1,00,000)
 * - Companies (Registration Offices and Fees) Rules, 2014: Table A (Normal filing fee) and Table B (Delay Multipliers 2× to 12×)
 * - Stamp Act / State Stamp Duty rules on MOA Capital Clause alteration.
 */

export type Sh7AlterationType =
  | 'increase_authorised_capital'
  | 'consolidation_division'
  | 'sub_division'
  | 'cancellation_diminution'
  | 'conversion_stock'
  | 'redemption_preference_shares'
  | 'govt_order_increase'

export type Sh7CompanyType =
  | 'normal'
  | 'small_company'
  | 'opc'
  | 'startup'
  | 'producer'

export type IndianState =
  | 'maharashtra'
  | 'delhi'
  | 'karnataka'
  | 'tamil_nadu'
  | 'gujarat'
  | 'telangana'
  | 'uttar_pradesh'
  | 'west_bengal'
  | 'haryana'
  | 'rajasthan'
  | 'andhra_pradesh'
  | 'kerala'
  | 'other'

export interface Sh7Input {
  alterationType: Sh7AlterationType
  companyType: Sh7CompanyType
  state?: IndianState
  existingAuthorisedCapital: number
  newAuthorisedCapital?: number // only relevant for increase_authorised_capital & govt_order_increase
  resolutionDate: string // YYYY-MM-DD
  filingDate: string // YYYY-MM-DD
  numOfficersInDefault?: number // default 2
  mgt14Filed?: boolean
  mgt14Srn?: string
}

export interface Sh7CalculationResult {
  alterationType: Sh7AlterationType
  companyType: Sh7CompanyType
  state: IndianState
  existingAuthorisedCapital: number
  newAuthorisedCapital: number
  incrementalCapital: number
  resolutionDate: string
  filingDate: string
  statutoryDeadlineDays: number // 30
  statutoryDueDate: string // YYYY-MM-DD
  delayDays: number
  isDelayed: boolean
  governingSection: string

  // MCA Portal Fee Breakdown
  normalFee: number
  feeSlabLabel: string
  lateMultiplier: number
  additionalLateFee: number
  incrementalCapitalRegistrationFee: number
  estimatedStampDuty: number
  totalMcaChallanFee: number

  // Statutory Section 64(2) Adjudication Penalties
  dailyPenaltyRate: number
  rawDailyPenalty: number
  companyPenaltyCap: number
  officerPenaltyCap: number
  companyPenalty: number
  perOfficerPenalty: number
  numOfficers: number
  totalOfficersPenalty: number
  totalAdjudicationPenalty: number
  section446BApplied: boolean
  savingsFrom446B: number

  // Total Financial Exposure
  totalFinancialExposure: number

  // Checklist & Alerts
  warnings: string[]
  criticalBreaches: string[]
  passedChecks: string[]
  mandatoryAttachments: string[]
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
 * Formats number into Indian Currency (e.g. ₹5,00,000)
 */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Computes base MCA filing fee under Table A.
 */
export function calculateSh7BaseFee(
  capital: number,
  companyType: Sh7CompanyType
): { normalFee: number; slabLabel: string } {
  const isSmall = companyType === 'small_company' || companyType === 'opc'

  if (isSmall) {
    if (capital < 100000) return { normalFee: 50, slabLabel: 'Small/OPC: Capital < ₹1 Lakh (₹50)' }
    if (capital < 500000) return { normalFee: 100, slabLabel: 'Small/OPC: Capital ₹1L – ₹5L (₹100)' }
    if (capital < 2500000) return { normalFee: 150, slabLabel: 'Small/OPC: Capital ₹5L – ₹25L (₹150)' }
    return { normalFee: 200, slabLabel: 'Small/OPC: Capital ₹25L+ (₹200)' }
  }

  if (capital < 100000) return { normalFee: 200, slabLabel: 'Capital < ₹1 Lakh (₹200)' }
  if (capital < 500000) return { normalFee: 300, slabLabel: 'Capital ₹1L – ₹5L (₹300)' }
  if (capital < 2500000) return { normalFee: 400, slabLabel: 'Capital ₹5L – ₹25L (₹400)' }
  if (capital < 10000000) return { normalFee: 500, slabLabel: 'Capital ₹25L – ₹1 Crore (₹500)' }
  return { normalFee: 600, slabLabel: 'Capital ₹1 Crore or more (₹600)' }
}

/**
 * Computes Table B delay multiplier for Form SH-7.
 */
export function calculateSh7LateMultiplier(delayDays: number): {
  multiplier: number
  description: string
} {
  if (delayDays <= 0) return { multiplier: 0, description: 'Filed on or before statutory due date (No late fee)' }
  if (delayDays <= 30) return { multiplier: 2, description: 'Delay up to 30 days (2× normal filing fee)' }
  if (delayDays <= 60) return { multiplier: 4, description: 'Delay 31 to 60 days (4× normal filing fee)' }
  if (delayDays <= 90) return { multiplier: 6, description: 'Delay 61 to 90 days (6× normal filing fee)' }
  if (delayDays <= 180) return { multiplier: 10, description: 'Delay 91 to 180 days (10× normal filing fee)' }
  return { multiplier: 12, description: 'Delay beyond 180 days (12× normal filing fee)' }
}

/**
 * Calculates MCA registration fee on incremental authorised share capital (Table of Fees).
 * Formula computes statutory registration fee on new capital minus fee paid on old capital.
 */
export function calculateIncrementalCapitalFee(
  oldCapital: number,
  newCapital: number
): number {
  if (newCapital <= oldCapital) return 0

  const calculateTotalFeeForCapital = (cap: number): number => {
    if (cap <= 1500000) return 0 // Zero registration fee up to ₹15 Lakhs for modern incorporations
    let fee = 0
    // Slabs:
    // ₹15L to ₹50L: ₹1,000 per ₹1,00,000 or part thereof
    if (cap > 1500000) {
      const taxableChunk = Math.min(cap, 5000000) - 1500000
      fee += Math.ceil(taxableChunk / 100000) * 1000
    }
    // ₹50L to ₹1 Crore: ₹750 per ₹1,00,000 or part thereof
    if (cap > 5000000) {
      const taxableChunk = Math.min(cap, 10000000) - 5000000
      fee += Math.ceil(taxableChunk / 100000) * 750
    }
    // Above ₹1 Crore: ₹500 per ₹1,00,000 or part thereof
    if (cap > 10000000) {
      const taxableChunk = cap - 10000000
      fee += Math.ceil(taxableChunk / 100000) * 500
    }
    return Math.min(fee, 25000000) // Statutory ceiling of ₹2.5 Crore
  }

  const feeOld = calculateTotalFeeForCapital(oldCapital)
  const feeNew = calculateTotalFeeForCapital(newCapital)
  return Math.max(0, feeNew - feeOld)
}

/**
 * Estimates state stamp duty on MOA alteration for incremental authorised share capital.
 */
export function calculateEstimatedStampDuty(
  state: IndianState,
  incrementalCapital: number
): number {
  if (incrementalCapital <= 0) return 0

  switch (state) {
    case 'maharashtra':
      // 0.2% on increase, max ₹50 Lakhs, min ₹1,000
      return Math.min(5000000, Math.max(1000, Math.round(incrementalCapital * 0.002)))
    case 'delhi':
      // 0.15% on incremental capital
      return Math.round(incrementalCapital * 0.0015)
    case 'karnataka':
      // Approx 0.1% or ₹1,000 per ₹1 Lakh, max ₹5 Lakhs
      return Math.min(500000, Math.max(1000, Math.round(incrementalCapital * 0.001)))
    case 'tamil_nadu':
      // Approx 0.2% on incremental capital
      return Math.round(incrementalCapital * 0.002)
    case 'gujarat':
      // Approx 0.15% or max ₹5 Lakhs
      return Math.min(500000, Math.round(incrementalCapital * 0.0015))
    case 'telangana':
    case 'andhra_pradesh':
      // Approx 0.15% on incremental capital
      return Math.round(incrementalCapital * 0.0015)
    case 'west_bengal':
      // Slabs approx 0.15%
      return Math.round(incrementalCapital * 0.0015)
    case 'uttar_pradesh':
      return Math.round(incrementalCapital * 0.002)
    default:
      // National average ~0.15%
      return Math.round(incrementalCapital * 0.0015)
  }
}

/**
 * Main Compliance & Fee Calculation Engine for Form SH-7.
 */
export function calculateSh7Compliance(input: Sh7Input): Sh7CalculationResult {
  const {
    alterationType,
    companyType,
    state = 'delhi',
    existingAuthorisedCapital,
    newAuthorisedCapital = existingAuthorisedCapital,
    resolutionDate,
    filingDate,
    numOfficersInDefault = 2,
    mgt14Filed = true,
    mgt14Srn = ''
  } = input

  // 1. Calculate Timelines & Statutory Deadlines (30 calendar days)
  const resDate = parseDateUtc(resolutionDate)
  const filDate = parseDateUtc(filingDate)

  const dueDate = new Date(resDate)
  dueDate.setUTCDate(dueDate.getUTCDate() + 30)

  const statutoryDueDate = formatDateIso(dueDate)
  const diffTime = filDate.getTime() - dueDate.getTime()
  const delayDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  const isDelayed = delayDays > 0

  // 2. Base MCA e-Form Fee (Table A)
  const effectiveCapital = Math.max(existingAuthorisedCapital, newAuthorisedCapital)
  const { normalFee, slabLabel } = calculateSh7BaseFee(effectiveCapital, companyType)

  // 3. Late Filing Multiplier (Table B)
  const { multiplier: lateMultiplier } = calculateSh7LateMultiplier(delayDays)
  const additionalLateFee = normalFee * lateMultiplier

  // 4. Incremental Registration Fee (only if capital is increased)
  const isCapitalIncrease =
    alterationType === 'increase_authorised_capital' || alterationType === 'govt_order_increase'
  const incrementalCapital = isCapitalIncrease ? Math.max(0, newAuthorisedCapital - existingAuthorisedCapital) : 0
  const incrementalCapitalRegistrationFee = isCapitalIncrease
    ? calculateIncrementalCapitalFee(existingAuthorisedCapital, newAuthorisedCapital)
    : 0

  // 5. Estimated Stamp Duty on MOA Alteration
  const estimatedStampDuty = isCapitalIncrease
    ? calculateEstimatedStampDuty(state, incrementalCapital)
    : 0

  // Total MCA e-Challan payment
  const totalMcaChallanFee =
    normalFee + additionalLateFee + incrementalCapitalRegistrationFee + estimatedStampDuty

  // 6. Statutory Adjudication Penalties under Section 64(2)
  // Statute: ₹500/day during which default continues
  // Company cap: ₹5,00,000 | Officer cap: ₹1,00,000 per officer
  const isSmallOrStartup =
    companyType === 'small_company' ||
    companyType === 'opc' ||
    companyType === 'startup' ||
    companyType === 'producer'

  const standardDailyRate = 500
  const dailyPenaltyRate = isSmallOrStartup ? 250 : 500 // Section 446B gives 50% discount

  const standardCompanyCap = 500000
  const standardOfficerCap = 100000

  // Section 446B statutory caps: Company max ₹2,00,000, Officer max ₹1,00,000
  const companyPenaltyCap = isSmallOrStartup ? 200000 : standardCompanyCap
  const officerPenaltyCap = isSmallOrStartup ? 100000 : standardOfficerCap

  const rawDailyPenalty = delayDays * dailyPenaltyRate

  const companyPenalty = isDelayed ? Math.min(rawDailyPenalty, companyPenaltyCap) : 0
  const perOfficerPenalty = isDelayed ? Math.min(rawDailyPenalty, officerPenaltyCap) : 0
  const totalOfficersPenalty = perOfficerPenalty * Math.max(1, numOfficersInDefault)
  const totalAdjudicationPenalty = companyPenalty + totalOfficersPenalty

  // Calculate Section 446B savings
  const standardCompanyPenalty = isDelayed ? Math.min(delayDays * standardDailyRate, standardCompanyCap) : 0
  const standardOfficerPenalty = isDelayed ? Math.min(delayDays * standardDailyRate, standardOfficerCap) : 0
  const standardTotalPenalty = standardCompanyPenalty + (standardOfficerPenalty * Math.max(1, numOfficersInDefault))
  const savingsFrom446B = isSmallOrStartup ? Math.max(0, standardTotalPenalty - totalAdjudicationPenalty) : 0

  const totalFinancialExposure = totalMcaChallanFee + totalAdjudicationPenalty

  // 7. Compliance Checks, Warnings, and Breaches
  const warnings: string[] = []
  const criticalBreaches: string[] = []
  const passedChecks: string[] = []
  const mandatoryAttachments: string[] = []

  // Check 1: Statutory 30-day timeline
  if (isDelayed) {
    if (delayDays > 180) {
      criticalBreaches.push(
        `Severe Delay of ${delayDays} days beyond 30-day statutory window. Table B additional fee reaches maximum 12× multiplier. ROC may initiate suo-motu Section 454 adjudication proceedings.`
      )
    } else {
      warnings.push(
        `Filing is delayed by ${delayDays} days past the statutory due date (${statutoryDueDate}). Additional filing fee of ${formatInr(additionalLateFee)} applies on the MCA portal.`
      )
    }
  } else {
    passedChecks.push(`Filed within the statutory 30-day window (Due Date: ${statutoryDueDate}). Zero late fees.`)
  }

  // Check 2: MGT-14 Dependency
  if (!mgt14Filed) {
    criticalBreaches.push(
      'Form MGT-14 has not been filed! Under Section 117(1), the resolution altering the MOA/capital must be filed in Form MGT-14 within 30 days. In MCA V3, Form SH-7 requires the approved SRN of Form MGT-14.'
    )
  } else if (!mgt14Srn && isCapitalIncrease) {
    warnings.push('Ensure you have the approved SRN of Form MGT-14 ready before initiating Form SH-7 on MCA V3.')
  } else {
    passedChecks.push('Form MGT-14 prerequisite satisfied.')
  }

  // Check 3: Section 64(2) Caps hit
  if (isDelayed && rawDailyPenalty >= companyPenaltyCap) {
    warnings.push(
      `Company adjudication penalty has reached the statutory cap of ${formatInr(companyPenaltyCap)} under Section 64(2)${isSmallOrStartup ? ' (Section 446B relief applied)' : ''}.`
    )
  }
  if (isDelayed && rawDailyPenalty >= officerPenaltyCap) {
    warnings.push(
      `Officer in default penalty has reached the individual statutory ceiling of ${formatInr(officerPenaltyCap)} per officer.`
    )
  }

  // Mandatory Attachments List
  mandatoryAttachments.push('Certified True Copy of Ordinary / Special Resolution passed in General Meeting (EGM/AGM)')
  mandatoryAttachments.push('Copy of Explanatory Statement annexed to the EGM notice pursuant to Section 102')
  mandatoryAttachments.push('Altered Memorandum of Association (MOA) containing revised Capital Clause (Clause V)')
  if (alterationType === 'govt_order_increase') {
    mandatoryAttachments.push('Certified copy of the Central Government Order under Section 62(4)')
  }
  if (alterationType === 'redemption_preference_shares') {
    mandatoryAttachments.push('Certified copy of Board resolution approving redemption of preference shares')
    mandatoryAttachments.push('Auditor certificate certifying compliance with Section 55 reserves and CRR creation')
  }
  mandatoryAttachments.push('Copy of Altered Articles of Association (AOA), if share classes or rights were modified')

  return {
    alterationType,
    companyType,
    state,
    existingAuthorisedCapital,
    newAuthorisedCapital,
    incrementalCapital,
    resolutionDate,
    filingDate,
    statutoryDeadlineDays: 30,
    statutoryDueDate,
    delayDays,
    isDelayed,
    governingSection: 'Section 64(1) read with Section 61(1) and Rule 15',

    normalFee,
    feeSlabLabel: slabLabel,
    lateMultiplier,
    additionalLateFee,
    incrementalCapitalRegistrationFee,
    estimatedStampDuty,
    totalMcaChallanFee,

    dailyPenaltyRate,
    rawDailyPenalty,
    companyPenaltyCap,
    officerPenaltyCap,
    companyPenalty,
    perOfficerPenalty,
    numOfficers: Math.max(1, numOfficersInDefault),
    totalOfficersPenalty,
    totalAdjudicationPenalty,
    section446BApplied: isSmallOrStartup,
    savingsFrom446B,

    totalFinancialExposure,

    warnings,
    criticalBreaches,
    passedChecks,
    mandatoryAttachments
  }
}
