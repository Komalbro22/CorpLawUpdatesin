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
 * - Section 446B Concession: 50% penalty relief for Small Companies, OPCs, Startups (DPIIT), and Producer Companies (Company cap ₹2,00,000; Officer cap ₹50,000)
 * - Companies (Registration Offices and Fees) Rules, 2014:
 *   - Table of Fees Item II: Differential capital registration fee = Fee(New Capital) - Fee(Existing Capital)
 *   - Table of Fees Item B: Delay on capital increase = 2.5% per month (first 6 months) + 3.0% per month thereafter
 *   - Table A & Table B: Standard base fee and 2x to 12x multipliers for non-capital alterations
 * - Relevant State Stamp Acts for Stamp Duty on MOA Capital Clause alteration.
 */

import { getOtherCompanyIncorporationFee, getOpcSmallIncorporationFee } from '@/lib/fee-calculator-core'

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
  requiresAoaAmendment?: boolean // true if AOA requires Special Resolution under Sec 14
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
  delayMonths: number
  lateFeePercentage: number
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

  // State Stamp Duty Architecture Metadata
  stampDutyConfig?: StateStampConfig
  stampDutyNote?: string
  statutoryScopeNotice: string

  // Checklist & Alerts
  requiresAoaAmendment: boolean
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
 * Computes base MCA filing fee under Table 7 of the official MCA Form SH-7 Instruction Kit
 * for alterations other than increase in nominal share capital (consolidation, sub-division,
 * cancellation, conversion into stock, redemption).
 *
 * NOTE: Table 7 applies uniformly across ALL companies (no separate Small/OPC concession column):
 * - Less than ₹1,00,000: ₹200
 * - ₹1,00,000 to < ₹5,00,000: ₹300
 * - ₹5,00,000 to < ₹25,00,000: ₹400
 * - ₹25,00,000 to < ₹1,00,00,000: ₹500
 * - ₹1,00,00,000 or more: ₹600
 */
export function calculateSh7BaseFee(
  capital: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _companyType?: Sh7CompanyType
): { normalFee: number; slabLabel: string } {
  if (capital < 100000) return { normalFee: 200, slabLabel: 'Table 7: Capital < ₹1 Lakh (₹200)' }
  if (capital < 500000) return { normalFee: 300, slabLabel: 'Table 7: Capital ₹1L – ₹5L (₹300)' }
  if (capital < 2500000) return { normalFee: 400, slabLabel: 'Table 7: Capital ₹5L – ₹25L (₹400)' }
  if (capital < 10000000) return { normalFee: 500, slabLabel: 'Table 7: Capital ₹25L – ₹1 Crore (₹500)' }
  return { normalFee: 600, slabLabel: 'Table 7: Capital ₹1 Crore or more (₹600)' }
}

/**
 * Computes Table B delay multiplier for non-capital alterations.
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
 * Calculates statutory MCA registration fee on incremental authorised share capital
 * per Table of Fees Item II of the Companies (Registration Offices and Fees) Rules, 2014.
 *
 * Formula: Differential Registration Fee = RegistrationFee(NewCapital) - RegistrationFee(ExistingCapital)
 *
 * Official MCA SH-7 Instruction Kit Example (OPC ₹10L -> ₹60L):
 * - Fee on ₹60L under Item I(a) normal scale = ₹1,66,000
 * - Less Fee on ₹10L under Item I(b) OPC/Small scale = ₹2,000
 * - Fee payable = ₹1,64,000
 *
 * For Small Companies and OPCs:
 * - Existing capital (up to ₹50L) is computed under Item I(b) concessional schedule.
 * - New capital exceeding ₹50L uses Item I(a) normal schedule.
 */
export function calculateIncrementalCapitalFee(
  oldCapital: number,
  newCapital: number,
  companyType?: Sh7CompanyType
): number {
  if (newCapital <= oldCapital) return 0
  const isOpcSmall = companyType === 'small_company' || companyType === 'opc'

  const feeOld = (isOpcSmall && oldCapital <= 5000000)
    ? getOpcSmallIncorporationFee(oldCapital, false)
    : getOtherCompanyIncorporationFee(oldCapital, false)

  const feeNew = (isOpcSmall && newCapital <= 5000000)
    ? getOpcSmallIncorporationFee(newCapital, false)
    : getOtherCompanyIncorporationFee(newCapital, false)

  return Math.max(0, feeNew - feeOld)
}

/**
 * Calculates late fee for Increase in Nominal Share Capital.
 * Governed by Table of Fees Item B (delay on increase in nominal share capital):
 * - Delay up to 6 months: 2.5% per month or part thereof on the differential capital fee
 * - Delay beyond 6 months: 2.5% per month for first 6 months + 3.0% per month or part thereof thereafter
 */
export function calculateCapitalIncreaseLateFee(
  delayDays: number,
  differentialFee: number
): {
  additionalLateFee: number
  delayMonths: number
  percentageRate: number
  description: string
} {
  if (delayDays <= 0 || differentialFee <= 0) {
    return {
      additionalLateFee: 0,
      delayMonths: 0,
      percentageRate: 0,
      description: 'Filed on or before statutory due date (Zero late fee)'
    }
  }

  const delayMonths = Math.ceil(delayDays / 30)
  let percentageRate = 0

  if (delayMonths <= 6) {
    percentageRate = delayMonths * 0.025
  } else {
    percentageRate = 6 * 0.025 + (delayMonths - 6) * 0.03
  }

  const additionalLateFee = Math.round(differentialFee * percentageRate)
  const pctDisplay = (percentageRate * 100).toFixed(1)
  const description = `Delay of ${delayDays} days (${delayMonths} month${delayMonths > 1 ? 's' : ''}): ${pctDisplay}% on differential registration fee`

  return {
    additionalLateFee,
    delayMonths,
    percentageRate,
    description
  }
}

export interface StateStampConfig {
  stateKey: IndianState
  name: string
  rateDescription: string
  effectiveDate: string
  legislativeSource: string
  mcaAnnexureReference: string
  lastVerifiedDate: string
  notes: string
  calculate: (existingCapital: number, newCapital: number) => number
}

/**
 * Versioned State Stamp Duty Registry for MOA Alteration on Form SH-7.
 *
 * NOTE: The official MCA Form SH-7 Instruction Kit instructs users to refer to the
 * authentic State/UT Stamp Acts. Where current state legislation has amended stamp duty
 * schedules (e.g. Maharashtra Act 9 of 2025), current state law supersedes legacy MCA Annexure tables.
 */
export const STATE_STAMP_REGISTRY: Record<IndianState, StateStampConfig> = {
  maharashtra: {
    stateKey: 'maharashtra',
    name: 'Maharashtra',
    rateDescription: '0.3% of increased share capital, max ₹1,00,00,000 (₹1 Crore)',
    effectiveDate: '2024-10-14 (Ordinance) / 2025-01-01 (Mah. Act 9 of 2025)',
    legislativeSource: 'Article 10, Schedule I of Maharashtra Stamp Act, 1958 (amended by Maharashtra Act No. IX of 2025)',
    mcaAnnexureReference: 'Supersedes legacy MCA Annexure A rate (₹1,000 per ₹5 Lakhs, max ₹50 Lakhs)',
    lastVerifiedDate: '2026-03-31',
    notes: 'Amended to 0.3% on share capital / increased share capital subject to ₹1 Crore maximum cap. Difference mechanism applies against previous capital.',
    calculate: (oldCap, newCap) => {
      if (newCap <= oldCap) return 0
      return Math.max(0, Math.min(10000000, Math.round(newCap * 0.003)) - Math.min(10000000, Math.round(oldCap * 0.003)))
    }
  },
  karnataka: {
    stateKey: 'karnataka',
    name: 'Karnataka',
    rateDescription: '₹5,000 for every ₹10,00,000 of increase or part thereof, max ₹1,00,00,000 (₹1 Crore)',
    effectiveDate: '2020-04-01',
    legislativeSource: 'Article 10, Schedule to Karnataka Stamp Act, 1957',
    mcaAnnexureReference: 'Matches official MCA Form SH-7 Instruction Kit Annexure A',
    lastVerifiedDate: '2026-03-31',
    notes: 'Levied in blocks of ₹10 Lakhs or part thereof on incremental capital.',
    calculate: (oldCap, newCap) => {
      const inc = Math.max(0, newCap - oldCap)
      if (inc <= 0) return 0
      return Math.min(10000000, Math.ceil(inc / 1000000) * 5000)
    }
  },
  delhi: {
    stateKey: 'delhi',
    name: 'Delhi',
    rateDescription: '0.15% on incremental capital, max ₹25,00,000',
    effectiveDate: '2010-06-01',
    legislativeSource: 'Article 10, Schedule 1A, Indian Stamp (Delhi Amendment) Act',
    mcaAnnexureReference: 'Matches official MCA Form SH-7 Instruction Kit Annexure A',
    lastVerifiedDate: '2026-03-31',
    notes: '0.15% of incremental capital capped at ₹25 Lakhs.',
    calculate: (oldCap, newCap) => {
      const inc = Math.max(0, newCap - oldCap)
      if (inc <= 0) return 0
      return Math.min(2500000, Math.round(inc * 0.0015))
    }
  },
  gujarat: {
    stateKey: 'gujarat',
    name: 'Gujarat',
    rateDescription: '0.5% on capital, less duty on existing capital, max ₹5,00,000',
    effectiveDate: '2013-04-01',
    legislativeSource: 'Article 10, Schedule I of Gujarat Stamp Act, 1958 & MCA e-Stamp schedule',
    mcaAnnexureReference: 'Matches MCA e-Stamp schedule difference and capping mechanism (eStamp_rate.pdf)',
    lastVerifiedDate: '2026-03-31',
    notes: '0.5% of increased authorised capital subject to ₹5 Lakh maximum cap, with deduction/credit for duty on existing capital. Once ₹5 Lakh cumulative ceiling is hit, incremental duty is ₹0.',
    calculate: (oldCap, newCap) => {
      if (newCap <= oldCap) return 0
      return Math.max(0, Math.min(500000, Math.round(newCap * 0.005)) - Math.min(500000, Math.round(oldCap * 0.005)))
    }
  },
  tamil_nadu: {
    stateKey: 'tamil_nadu',
    name: 'Tamil Nadu',
    rateDescription: '₹500 for every ₹10,00,000 of increase or part thereof, max ₹5,00,000',
    effectiveDate: '2018-06-01',
    legislativeSource: 'Article 10, Tamil Nadu Stamp Act',
    mcaAnnexureReference: 'Matches official MCA Form SH-7 Instruction Kit Annexure A',
    lastVerifiedDate: '2026-03-31',
    notes: 'Levied in blocks of ₹10 Lakhs or part thereof on incremental capital, max ₹5 Lakhs.',
    calculate: (oldCap, newCap) => {
      const inc = Math.max(0, newCap - oldCap)
      if (inc <= 0) return 0
      return Math.min(500000, Math.ceil(inc / 1000000) * 500)
    }
  },
  telangana: {
    stateKey: 'telangana',
    name: 'Telangana',
    rateDescription: '0.15% on incremental capital, min ₹1,000, max ₹5,00,000',
    effectiveDate: '2014-06-02',
    legislativeSource: 'Article 10, Indian Stamp (Telangana Amendment) Act',
    mcaAnnexureReference: 'Matches official MCA Form SH-7 Instruction Kit Annexure A',
    lastVerifiedDate: '2026-03-31',
    notes: '0.15% on increase, subject to statutory minimum ₹1,000 and maximum ₹5 Lakhs.',
    calculate: (oldCap, newCap) => {
      const inc = Math.max(0, newCap - oldCap)
      if (inc <= 0) return 0
      return Math.min(500000, Math.max(1000, Math.round(inc * 0.0015)))
    }
  },
  andhra_pradesh: {
    stateKey: 'andhra_pradesh',
    name: 'Andhra Pradesh',
    rateDescription: '0.15% on incremental capital, min ₹1,000, max ₹5,00,000',
    effectiveDate: '2014-06-02',
    legislativeSource: 'Article 10, Indian Stamp (Andhra Pradesh Amendment) Act',
    mcaAnnexureReference: 'Matches official MCA Form SH-7 Instruction Kit Annexure A',
    lastVerifiedDate: '2026-03-31',
    notes: '0.15% on increase, subject to statutory minimum ₹1,000 and maximum ₹5 Lakhs.',
    calculate: (oldCap, newCap) => {
      const inc = Math.max(0, newCap - oldCap)
      if (inc <= 0) return 0
      return Math.min(500000, Math.max(1000, Math.round(inc * 0.0015)))
    }
  },
  rajasthan: {
    stateKey: 'rajasthan',
    name: 'Rajasthan',
    rateDescription: '0.2% on incremental capital, max ₹25,00,000',
    effectiveDate: '2019-07-01',
    legislativeSource: 'Article 10, Schedule to Rajasthan Stamp Act, 1998',
    mcaAnnexureReference: 'Matches official MCA Form SH-7 Instruction Kit Annexure A',
    lastVerifiedDate: '2026-03-31',
    notes: '0.2% on incremental capital, max ₹25 Lakhs.',
    calculate: (oldCap, newCap) => {
      const inc = Math.max(0, newCap - oldCap)
      if (inc <= 0) return 0
      return Math.min(2500000, Math.round(inc * 0.002))
    }
  },
  uttar_pradesh: {
    stateKey: 'uttar_pradesh',
    name: 'Uttar Pradesh',
    rateDescription: 'NIL via MCA Portal e-stamping (Physical stamping per state rules)',
    effectiveDate: 'Current',
    legislativeSource: 'Annexure A, MCA Form SH-7 Instruction Kit',
    mcaAnnexureReference: 'MOA alteration e-stamping is NIL / not collected on MCA V3 portal',
    lastVerifiedDate: '2026-03-31',
    notes: 'Not integrated for electronic payment on MCA V3 portal challan.',
    calculate: () => 0
  },
  west_bengal: {
    stateKey: 'west_bengal',
    name: 'West Bengal',
    rateDescription: 'NIL via MCA Portal e-stamping (Physical stamping per state rules)',
    effectiveDate: 'Current',
    legislativeSource: 'Annexure A, MCA Form SH-7 Instruction Kit',
    mcaAnnexureReference: 'MOA alteration e-stamping is NIL / not collected on MCA V3 portal',
    lastVerifiedDate: '2026-03-31',
    notes: 'Not integrated for electronic payment on MCA V3 portal challan.',
    calculate: () => 0
  },
  kerala: {
    stateKey: 'kerala',
    name: 'Kerala',
    rateDescription: 'NIL via MCA Portal e-stamping (Physical stamping per state rules)',
    effectiveDate: 'Current',
    legislativeSource: 'Annexure A, MCA Form SH-7 Instruction Kit',
    mcaAnnexureReference: 'MOA alteration e-stamping is NIL / not collected on MCA V3 portal',
    lastVerifiedDate: '2026-03-31',
    notes: 'Not integrated for electronic payment on MCA V3 portal challan.',
    calculate: () => 0
  },
  haryana: {
    stateKey: 'haryana',
    name: 'Haryana',
    rateDescription: 'NIL via MCA Portal e-stamping (Physical stamping per state rules)',
    effectiveDate: 'Current',
    legislativeSource: 'Annexure A, MCA Form SH-7 Instruction Kit',
    mcaAnnexureReference: 'MOA alteration e-stamping is NIL / not collected on MCA V3 portal',
    lastVerifiedDate: '2026-03-31',
    notes: 'Not integrated for electronic payment on MCA V3 portal challan.',
    calculate: () => 0
  },
  other: {
    stateKey: 'other',
    name: 'Other States / UTs',
    rateDescription: 'NIL via MCA Portal (Physical treasury stamping per state rules)',
    effectiveDate: 'Current',
    legislativeSource: 'Annexure A, MCA Form SH-7 Instruction Kit',
    mcaAnnexureReference: 'Not collected on MCA V3 portal',
    lastVerifiedDate: '2026-03-31',
    notes: 'Consult local state treasury for physical non-judicial stamp duty requirements.',
    calculate: () => 0
  }
}

/**
 * Estimates state stamp duty on MOA alteration for incremental authorised share capital
 * using the versioned state stamp registry.
 */
export function calculateEstimatedStampDuty(
  state: IndianState,
  incrementalCapital: number,
  existingCapital: number = 0,
  newCapital: number = existingCapital + incrementalCapital
): number {
  if (incrementalCapital <= 0) return 0
  const config = STATE_STAMP_REGISTRY[state] || STATE_STAMP_REGISTRY.other
  return config.calculate(existingCapital, newCapital)
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
    mgt14Srn = '',
    requiresAoaAmendment = false
  } = input

  // 1. Calculate Timelines & Statutory Deadlines (30 calendar days under Section 64(1))
  const resDate = parseDateUtc(resolutionDate)
  const filDate = parseDateUtc(filingDate)

  const dueDate = new Date(resDate)
  dueDate.setUTCDate(dueDate.getUTCDate() + 30)

  const statutoryDueDate = formatDateIso(dueDate)
  const diffTime = filDate.getTime() - dueDate.getTime()
  const delayDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  const isDelayed = delayDays > 0

  const isCapitalIncrease =
    alterationType === 'increase_authorised_capital' || alterationType === 'govt_order_increase'

  const effectiveNewCapital = isCapitalIncrease ? Math.max(existingAuthorisedCapital, newAuthorisedCapital) : existingAuthorisedCapital
  const incrementalCapital = isCapitalIncrease ? Math.max(0, effectiveNewCapital - existingAuthorisedCapital) : 0

  // 2. Incremental Registration Fee (Table of Fees Item II)
  const incrementalCapitalRegistrationFee = isCapitalIncrease
    ? calculateIncrementalCapitalFee(existingAuthorisedCapital, effectiveNewCapital, companyType)
    : 0

  // 3. Normal MCA e-Form Fee (Table A)
  // CRITICAL MCA RULE: When increasing capital, the differential registration fee IS the filing fee;
  // standard Table A fee is NOT added on top. For non-capital alterations, Table A fee applies.
  let normalFee = 0
  let feeSlabLabel = ''

  if (isCapitalIncrease) {
    normalFee = 0
    feeSlabLabel = 'Capital Increase: Differential Registration Fee replaces Table A Base Fee'
  } else {
    const baseFeeResult = calculateSh7BaseFee(existingAuthorisedCapital, companyType)
    normalFee = baseFeeResult.normalFee
    feeSlabLabel = baseFeeResult.slabLabel
  }

  // 4. Additional Late Filing Fee
  // For capital increase: 2.5% per month (<= 6 months) or 3% per month thereafter on differential fee
  // For non-capital alterations: Table B multipliers (2x to 12x) on normal fee
  let lateMultiplier = 0
  let delayMonths = 0
  let lateFeePercentage = 0
  let additionalLateFee = 0

  if (isCapitalIncrease) {
    const lateFeeRes = calculateCapitalIncreaseLateFee(delayDays, incrementalCapitalRegistrationFee)
    additionalLateFee = lateFeeRes.additionalLateFee
    delayMonths = lateFeeRes.delayMonths
    lateFeePercentage = lateFeeRes.percentageRate
    lateMultiplier = 0
  } else {
    const lateMultRes = calculateSh7LateMultiplier(delayDays)
    lateMultiplier = lateMultRes.multiplier
    delayMonths = Math.ceil(delayDays / 30)
    additionalLateFee = normalFee * lateMultiplier
  }

  // 5. Estimated Stamp Duty on MOA Alteration
  const stampConfig = STATE_STAMP_REGISTRY[state] || STATE_STAMP_REGISTRY.other
  const estimatedStampDuty = isCapitalIncrease
    ? calculateEstimatedStampDuty(state, incrementalCapital, existingAuthorisedCapital, effectiveNewCapital)
    : 0

  // Total MCA e-Challan payment (Payable immediately on MCA V3 submission)
  const totalMcaChallanFee =
    normalFee + additionalLateFee + incrementalCapitalRegistrationFee + estimatedStampDuty

  // 6. Statutory Adjudication Penalties under Section 64(2)
  // Governed by Section 454 adjudication procedure - NEVER paid on form filing challan.
  // Standard: ₹500/day | Company cap: ₹5,00,000 | Officer cap: ₹1,00,000
  // Section 446B Relief: 50% discount (₹250/day) | Company cap: ₹2,00,000 | Officer cap: ₹1,00,000 (statutory ceiling retained)
  const isSmallOrStartup =
    companyType === 'small_company' ||
    companyType === 'opc' ||
    companyType === 'startup' ||
    companyType === 'producer'

  const standardDailyRate = 500
  const dailyPenaltyRate = isSmallOrStartup ? 250 : 500

  const standardCompanyCap = 500000
  const standardOfficerCap = 100000

  const companyPenaltyCap = isSmallOrStartup ? 200000 : standardCompanyCap
  const officerPenaltyCap = standardOfficerCap

  const rawDailyPenalty = delayDays * dailyPenaltyRate

  const companyPenalty = isDelayed ? Math.min(rawDailyPenalty, companyPenaltyCap) : 0
  const perOfficerPenalty = isDelayed ? Math.min(rawDailyPenalty, officerPenaltyCap) : 0
  const numOfficers = Math.max(1, numOfficersInDefault)
  const totalOfficersPenalty = perOfficerPenalty * numOfficers
  const totalAdjudicationPenalty = companyPenalty + totalOfficersPenalty

  // Calculate Section 446B savings
  const standardCompanyPenalty = isDelayed ? Math.min(delayDays * standardDailyRate, standardCompanyCap) : 0
  const standardOfficerPenalty = isDelayed ? Math.min(delayDays * standardDailyRate, standardOfficerCap) : 0
  const standardTotalPenalty = standardCompanyPenalty + standardOfficerPenalty * numOfficers
  const savingsFrom446B = isSmallOrStartup ? Math.max(0, standardTotalPenalty - totalAdjudicationPenalty) : 0

  // Total Financial Exposure
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
        `Severe Delay of ${delayDays} days beyond the 30-day statutory window. For capital increases, 3% monthly additional fee applies. ROC may initiate suo-motu Section 454 adjudication proceedings.`
      )
    } else {
      warnings.push(
        `Filing is delayed by ${delayDays} days past the statutory due date (${statutoryDueDate}). Additional filing fee of ${formatInr(additionalLateFee)} applies on the MCA V3 portal.`
      )
    }
  } else {
    passedChecks.push(`Filed within the statutory 30-day window (Due Date: ${statutoryDueDate}). Zero late fees.`)
  }

  // Check 2: MGT-14 Dependency
  if (requiresAoaAmendment) {
    if (!mgt14Filed) {
      criticalBreaches.push(
        'Form MGT-14 has not been filed! Amending Articles of Association (AOA) requires a Special Resolution under Section 14. Under Section 117(3)(a), Form MGT-14 must be filed with the ROC within 30 days before filing Form SH-7 on MCA V3.'
      )
    } else if (!mgt14Srn) {
      warnings.push('Ensure you have the approved SRN of Form MGT-14 ready before submitting Form SH-7 on MCA V3.')
    } else {
      passedChecks.push(`Form MGT-14 prerequisite satisfied (SRN: ${mgt14Srn}).`)
    }
  } else {
    passedChecks.push(
      'Articles of Association already contain enabling capital alteration clause. Under Section 61(1) read with Section 117(3), an Ordinary Resolution does not require filing Form MGT-14.'
    )
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
  if (requiresAoaAmendment) {
    mandatoryAttachments.push('Certified True Copy of Special Resolution passed under Section 14 altering Articles of Association')
    mandatoryAttachments.push('Copy of Altered Articles of Association (AOA)')
  } else {
    mandatoryAttachments.push('Certified True Copy of Ordinary Resolution passed in General Meeting (EGM/AGM) under Section 61(1)')
  }
  mandatoryAttachments.push('Copy of Explanatory Statement annexed to the EGM notice pursuant to Section 102')
  mandatoryAttachments.push('Altered Memorandum of Association (MOA) containing revised Capital Clause (Clause V)')
  if (alterationType === 'govt_order_increase') {
    mandatoryAttachments.push('Certified copy of the Central Government Order under Section 62(4) & 62(6)')
  }
  if (alterationType === 'redemption_preference_shares') {
    mandatoryAttachments.push('Certified copy of Board / General Meeting resolution approving redemption of preference shares')
    mandatoryAttachments.push('Auditor certificate certifying compliance with Section 55 reserves and CRR creation')
  }
  if (alterationType === 'cancellation_diminution') {
    mandatoryAttachments.push('Declaration of solvency / Confirmation that cancelled shares were not taken or agreed to be taken')
  }

  return {
    alterationType,
    companyType,
    state,
    existingAuthorisedCapital,
    newAuthorisedCapital: effectiveNewCapital,
    incrementalCapital,
    resolutionDate,
    filingDate,
    statutoryDeadlineDays: 30,
    statutoryDueDate,
    delayDays,
    isDelayed,
    governingSection: 'Section 64(1) read with Section 61(1) and Rule 15',

    normalFee,
    feeSlabLabel,
    lateMultiplier,
    delayMonths,
    lateFeePercentage,
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
    numOfficers,
    totalOfficersPenalty,
    totalAdjudicationPenalty,
    section446BApplied: isSmallOrStartup,
    savingsFrom446B,

    totalFinancialExposure,

    // State Stamp Duty Architecture Metadata
    stampDutyConfig: stampConfig,
    stampDutyNote: isCapitalIncrease ? stampConfig.notes : 'MOA Capital clause unchanged (Zero stamp duty)',
    statutoryScopeNotice:
      'Statutory Scope: Form SH-7 filed under Section 64(1)(a) read with Section 61(1) for Share Capital Alteration. (Companies limited by guarantee not having share capital increasing number of members under Section 64(1)(b) are governed by a separate member-slab fee structure).',

    requiresAoaAmendment,
    warnings,
    criticalBreaches,
    passedChecks,
    mandatoryAttachments
  }
}
