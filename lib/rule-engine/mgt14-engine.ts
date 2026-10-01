/**
 * MCA Form MGT-14 Compliance, Fee, Due Date & Penalty Engine
 * 
 * Statutory Authority:
 * - Section 117 of the Companies Act, 2013 (Resolutions and Agreements to be Filed)
 * - Rule 24 of Companies (Management and Administration) Rules, 2014
 * - Rule 12, Table A & Table B of Companies (Registration Offices and Fees) Rules, 2014
 * - Section 446B of the Companies Act, 2013 (Lesser penalties for OPC, Small Companies, Startups, Producer Companies)
 * - Section 460(b) / Form CG-1 & Form INC-28 (Condonation of Delay beyond 300 days)
 * - MCA Notifications G.S.R. 8(E) & 9(E) dated 04.01.2017 (IFSC 60-day filing window)
 * - MCA Exemption Notification G.S.R. 464(E) dated 05.06.2015 (Private Company Section 179(3) exemption)
 */

export type Mgt14CompanyType = 'normal' | 'small_company' | 'opc' | 'startup' | 'producer'
export type Mgt14EventType = 'special_resolution' | 'board_resolution' | 'postal_ballot' | 'agreement'

export interface Mgt14NormalFeeSlab {
  minCapital: number
  maxCapital: number
  fee: number
  description: string
}

export const MGT14_NORMAL_FEE_SLABS: Mgt14NormalFeeSlab[] = [
  { minCapital: 0, maxCapital: 99999, fee: 200, description: 'Less than ₹1,00,000' },
  { minCapital: 100000, maxCapital: 499999, fee: 300, description: '₹1,00,000 to ₹4,99,999' },
  { minCapital: 500000, maxCapital: 2499999, fee: 400, description: '₹5,00,000 to ₹24,99,999' },
  { minCapital: 2500000, maxCapital: 9999999, fee: 500, description: '₹25,00,000 to ₹99,99,999' },
  { minCapital: 10000000, maxCapital: Infinity, fee: 600, description: '₹1,00,00,000 or more' },
]

export const MGT14_NO_SHARE_CAPITAL_FEE = 200

export interface Mgt14AdditionalFeeSlab {
  minDelayDays: number
  maxDelayDays: number
  multiplier: number
  label: string
}

export const MGT14_ADDITIONAL_FEE_SLABS: Mgt14AdditionalFeeSlab[] = [
  { minDelayDays: 0, maxDelayDays: 0, multiplier: 0, label: 'On Time (0 additional fee)' },
  { minDelayDays: 1, maxDelayDays: 30, multiplier: 2, label: 'Up to 30 days (2× normal fee)' },
  { minDelayDays: 31, maxDelayDays: 60, multiplier: 4, label: 'More than 30 and up to 60 days (4× normal fee)' },
  { minDelayDays: 61, maxDelayDays: 90, multiplier: 6, label: 'More than 60 and up to 90 days (6× normal fee)' },
  { minDelayDays: 91, maxDelayDays: 180, multiplier: 10, label: 'More than 90 and up to 180 days (10× normal fee)' },
  { minDelayDays: 181, maxDelayDays: Infinity, multiplier: 12, label: 'More than 180 days (12× normal fee)' },
]

export interface Mgt14PurposeDetail {
  id: string
  label: string
  category: 'special_resolution' | 'board_resolution' | 'agreement' | 'postal_ballot'
  sectionRef: string
  applicableToPrivate: boolean
  isMandatory: boolean
  requiredAttachments: string[]
  explanation: string
}

export const MGT14_PURPOSES: Mgt14PurposeDetail[] = [
  {
    id: 'moa_alteration',
    label: 'Alteration of Memorandum of Association (MOA) - Object / Name / Capital Clause',
    category: 'special_resolution',
    sectionRef: 'Section 13',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution with Explanatory Statement (Sec 102)',
      'Altered Memorandum of Association (MOA)',
      'Notice of General Meeting with relevant agenda',
      'Copy of approval order if object change or registered office change is involved'
    ],
    explanation: 'Any alteration of the Memorandum (other than capital increase governed strictly under Section 64/SH-7) requires a Special Resolution filed in MGT-14 under Section 13 read with Section 117(3)(a).'
  },
  {
    id: 'aoa_alteration',
    label: 'Alteration of Articles of Association (AOA) / Adoption of New Articles',
    category: 'special_resolution',
    sectionRef: 'Section 14',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution with Explanatory Statement',
      'Altered copy of Articles of Association (AOA)',
      'Notice of General Meeting',
      'Copy of approval order from Central Government / RD if converting public company to private'
    ],
    explanation: 'Alteration of Articles under Section 14 mandates passing of a Special Resolution and filing with ROC via Form MGT-14 within 30 days.'
  },
  {
    id: 'registered_office_interstate',
    label: 'Change of Registered Office from one State to another / one ROC to another in same State',
    category: 'special_resolution',
    sectionRef: 'Section 12(5)',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution',
      'Explanatory Statement pursuant to Section 102',
      'Notice of General Meeting'
    ],
    explanation: 'Changing registered office outside local limits of city/town or from one State/ROC to another requires a Special Resolution filed under Section 12(5) read with Section 117(3)(a).'
  },
  {
    id: 'private_placement',
    label: 'Private Placement Offer Letter & Securities Issuance (PAS-4 / PAS-5 Approval)',
    category: 'special_resolution',
    sectionRef: 'Section 42 & Rule 14',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution approving offer',
      'Explanatory Statement setting out basis of valuation & price',
      'Draft Private Placement Offer Letter (PAS-4)'
    ],
    explanation: 'Under Section 42, private placement requires prior approval of shareholders by way of Special Resolution for each offer or invitation.'
  },
  {
    id: 'borrowing_exceeding_limits',
    label: 'Borrowings exceeding Paid-up Capital + Free Reserves + Securities Premium',
    category: 'special_resolution',
    sectionRef: 'Section 180(1)(c)',
    applicableToPrivate: false, // Section 180 does not apply to private companies (Notification dated 05.06.2015)
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution specifying borrowing ceiling',
      'Explanatory Statement',
      'Notice of General Meeting'
    ],
    explanation: 'Public companies exceeding statutory borrowing threshold under Section 180(1)(c) must pass Special Resolution. NOTE: Private companies are exempt from Section 180 per MCA Notification dated 05.06.2015.'
  },
  {
    id: 'intercorporate_loans_investments',
    label: 'Loans, Guarantees, Securities, or Investments exceeding Section 186(2) limits',
    category: 'special_resolution',
    sectionRef: 'Section 186(3)',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution',
      'Explanatory statement detailing terms, borrower particulars, and financial limits',
      'Prior approval of financial institution/bank if applicable'
    ],
    explanation: 'Giving loan, guarantee, security, or acquiring securities exceeding 60% of paid-up capital + free reserves + securities premium or 100% of free reserves + securities premium requires a prior Special Resolution.'
  },
  {
    id: 'md_appointment_variation',
    label: 'Appointment, Re-appointment or Variation of Terms of Managing Director / Whole-time Director',
    category: 'agreement',
    sectionRef: 'Section 117(3)(c) & Section 196',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Copy of Board Resolution / General Meeting Resolution',
      'Agreement / Contract of Employment detailing remuneration, perquisites, and tenure',
      'Consent to act as Director (DIR-2) & Disqualification Declaration (DIR-8)'
    ],
    explanation: 'Board resolutions or agreements relating to appointment, re-appointment, or variation in terms of appointment of a Managing Director must be filed under Section 117(3)(c).'
  },
  {
    id: 'board_powers_sec_179_public',
    label: 'Board Resolution for Borrowings, Investments, or Granting Loans (Section 179(3))',
    category: 'board_resolution',
    sectionRef: 'Section 179(3) read with Section 117(3)(g)',
    applicableToPrivate: false, // Private companies exempt under June 5, 2015 notification
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Board Resolution',
      'Extract of minutes of the Board Meeting'
    ],
    explanation: 'Resolutions passed by the Board under Section 179(3) (e.g., borrowing funds, investing company funds, making calls on shares) require MGT-14 ONLY for Public Limited Companies. Private companies are EXEMPT per MCA Notification G.S.R. 464(E) dated 05.06.2015.'
  },
  {
    id: 'voluntary_winding_up',
    label: 'Voluntary Winding Up of Company under Section 59 of IBC, 2016',
    category: 'special_resolution',
    sectionRef: 'Section 117(3)(f) & IBC Sec 59',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution for voluntary liquidation',
      'Declaration of Solvency from majority of Directors',
      'Audited financial statements and record of business operations',
      'Valuation report of assets if any'
    ],
    explanation: 'Resolutions requiring a company to be wound up voluntarily passed in pursuance of section 59 of the Insolvency and Bankruptcy Code, 2016 must be filed in MGT-14 within 30 days.'
  },
  {
    id: 'removal_of_auditor',
    label: 'Removal of Statutory Auditor before expiry of term',
    category: 'special_resolution',
    sectionRef: 'Section 140(1)',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution',
      'Copy of Central Government / Regional Director approval in Form ADT-2',
      'Explanatory Statement'
    ],
    explanation: 'Removing an auditor before term expiry requires Central Government previous approval followed by a Special Resolution filed via MGT-14.'
  },
  {
    id: 'more_than_15_directors',
    label: 'Increasing Maximum Number of Directors beyond 15',
    category: 'special_resolution',
    sectionRef: 'Section 149(1) Proviso',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution',
      'Explanatory Statement',
      'Notice of General Meeting'
    ],
    explanation: 'Section 149(1) sets a statutory limit of 15 directors; appointing more than 15 directors requires passing a Special Resolution filed in MGT-14.'
  },
  {
    id: 'independent_director_reappointment',
    label: 'Re-appointment of Independent Director for Second Term of 5 Years',
    category: 'special_resolution',
    sectionRef: 'Section 149(10)',
    applicableToPrivate: false, // Independent directors applicable to public companies
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution',
      'Board evaluation report justifying performance and independence',
      'DIR-2 Consent and DIR-8 Intimation'
    ],
    explanation: 'An independent director can be re-appointed for a second term of up to 5 consecutive years only on passing of a Special Resolution by the company.'
  },
  {
    id: 'other_special_resolution',
    label: 'Any Other Special Resolution passed under Companies Act, 2013',
    category: 'special_resolution',
    sectionRef: 'Section 117(3)(a)',
    applicableToPrivate: true,
    isMandatory: true,
    requiredAttachments: [
      'Certified true copy of Special Resolution',
      'Explanatory Statement pursuant to Section 102',
      'Notice of General Meeting'
    ],
    explanation: 'Under Section 117(3)(a), a copy of EVERY Special Resolution passed by the company must be filed with ROC in Form MGT-14 within 30 days.'
  },
]

export interface Mgt14CalculationInput {
  hasShareCapital: boolean
  nominalShareCapital: number
  isIfscCompany: boolean
  companyType: Mgt14CompanyType
  eventType: Mgt14EventType
  purposeId?: string
  eventDate: string // YYYY-MM-DD
  filingDate: string // YYYY-MM-DD
  numOfficersInDefault: number
}

export interface Mgt14CalculationResult {
  input: Mgt14CalculationInput
  normalFee: number
  dueDate: string
  filingWindowDays: number
  delayDays: number
  isDelayed: boolean
  isExtendedDelay: boolean // > 300 days
  requiresCondonation: boolean // > 300 days
  additionalFeeMultiplier: number
  additionalFee: number
  totalPortalFee: number
  
  // Section 117(2) Penalty Exposure (Separate from filing fees!)
  penaltyPerDay: number
  companyPenaltyBase: number
  officerPenaltyBase: number
  totalCompanyPenalty: number
  totalOfficerPenaltyPerPerson: number
  totalAllOfficersPenalty: number
  totalStatutoryPenaltyExposure: number
  
  // Section 446B Relief
  is446BEligible: boolean
  statutoryMaxCompanyPenalty: number
  statutoryMaxOfficerPenalty: number
  reliefAmountSaved: number
  
  // Status & Explanations
  filingStatus: 'on_time' | 'late' | 'severely_delayed' | 'condonation_required'
  statusBadge: string
  statusMessage: string
  condonationNote?: string
  calculationSteps: string[]
  workingPaperText: string
  applicabilityNote: string
}

export function formatInr(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0'
  return '₹' + Math.round(val).toLocaleString('en-IN')
}

/**
 * Calculates calendar day differences safely between two YYYY-MM-DD strings.
 * Avoids daylight saving time or timezone hour drift.
 */
export function getCalendarDaysDiff(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0
  const [sy, sm, sd] = startDateStr.split('-').map(Number)
  const [ey, em, ed] = endDateStr.split('-').map(Number)
  
  const startUtc = Date.UTC(sy, sm - 1, sd)
  const endUtc = Date.UTC(ey, em - 1, ed)
  
  const diffMs = endUtc - startUtc
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Adds exact calendar days to a YYYY-MM-DD string, returning YYYY-MM-DD.
 */
export function addCalendarDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  const yr = date.getUTCFullYear()
  const mo = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dy = String(date.getUTCDate()).padStart(2, '0')
  return `${yr}-${mo}-${dy}`
}

/**
 * Evaluates normal Table A MGT-14 filing fee based on nominal share capital.
 */
export function getNormalMgt14Fee(hasShareCapital: boolean, nominalShareCapital: number): number {
  if (!hasShareCapital) {
    return MGT14_NO_SHARE_CAPITAL_FEE
  }
  const capital = Math.max(0, nominalShareCapital || 0)
  for (const slab of MGT14_NORMAL_FEE_SLABS) {
    if (capital >= slab.minCapital && capital <= slab.maxCapital) {
      return slab.fee
    }
  }
  return 600
}

/**
 * Evaluates Table B additional fee multiplier.
 */
export function getAdditionalFeeMultiplier(delayDays: number): number {
  if (delayDays <= 0) return 0
  if (delayDays <= 30) return 2
  if (delayDays <= 60) return 4
  if (delayDays <= 90) return 6
  if (delayDays <= 180) return 10
  return 12
}

/**
 * Determines eligibility for Section 446B relief (lesser penalties).
 */
export function check446BEligibility(companyType: Mgt14CompanyType): boolean {
  return ['small_company', 'opc', 'startup', 'producer'].includes(companyType)
}

/**
 * Main deterministic compliance and fee engine for MCA Form MGT-14.
 */
export function calculateMgt14Compliance(input: Mgt14CalculationInput): Mgt14CalculationResult {
  const {
    hasShareCapital,
    nominalShareCapital,
    isIfscCompany,
    companyType,
    eventType,
    purposeId,
    eventDate,
    filingDate,
    numOfficersInDefault = 1
  } = input

  // 1. Due date calculation
  const filingWindowDays = isIfscCompany ? 60 : 30
  const dueDate = addCalendarDays(eventDate, filingWindowDays)
  
  // 2. Delay calculation
  const daysFromEvent = getCalendarDaysDiff(eventDate, filingDate)
  const delayDays = Math.max(0, getCalendarDaysDiff(dueDate, filingDate))
  const isDelayed = delayDays > 0
  const isExtendedDelay = daysFromEvent > 300
  const requiresCondonation = isExtendedDelay

  // 3. Normal Fee calculation (Table A)
  const normalFee = getNormalMgt14Fee(hasShareCapital, nominalShareCapital)

  // 4. Additional Fee calculation (Table B)
  const additionalFeeMultiplier = getAdditionalFeeMultiplier(delayDays)
  const additionalFee = isDelayed ? normalFee * additionalFeeMultiplier : 0
  const totalPortalFee = normalFee + additionalFee

  // 5. Section 117(2) Statutory Penalty Calculation
  // Standard limits:
  // Company: ₹10,000 + ₹100 per day after 1st day of continuing failure, max ₹2,00,000
  // Officer: ₹10,000 + ₹100 per day after 1st day of continuing failure, max ₹50,000 per officer
  const is446B = check446BEligibility(companyType)
  
  const statutoryMaxCompany = is446B ? 100000 : 200000
  const statutoryMaxOfficer = is446B ? 25000 : 50000

  let totalCompanyPenalty = 0
  let totalOfficerPenaltyPerPerson = 0
  let unreducedCompanyPenalty = 0
  let unreducedOfficerPenaltyPerPerson = 0

  if (isDelayed) {
    const continuingDays = Math.max(0, delayDays - 1)
    
    // Standard unreduced penalty formula
    unreducedCompanyPenalty = Math.min(200000, 10000 + 100 * continuingDays)
    unreducedOfficerPenaltyPerPerson = Math.min(50000, 10000 + 100 * continuingDays)

    if (is446B) {
      // Section 446B provides penalty shall not be more than one-half of penalty specified
      totalCompanyPenalty = Math.min(statutoryMaxCompany, Math.round(unreducedCompanyPenalty * 0.5))
      totalOfficerPenaltyPerPerson = Math.min(statutoryMaxOfficer, Math.round(unreducedOfficerPenaltyPerPerson * 0.5))
    } else {
      totalCompanyPenalty = unreducedCompanyPenalty
      totalOfficerPenaltyPerPerson = unreducedOfficerPenaltyPerPerson
    }
  }

  const validOfficers = Math.max(1, numOfficersInDefault || 1)
  const totalAllOfficersPenalty = totalOfficerPenaltyPerPerson * validOfficers
  const totalStatutoryPenaltyExposure = totalCompanyPenalty + totalAllOfficersPenalty

  const reliefAmountSaved = is446B && isDelayed
    ? (unreducedCompanyPenalty - totalCompanyPenalty) + (unreducedOfficerPenaltyPerPerson - totalOfficerPenaltyPerPerson) * validOfficers
    : 0

  // 6. Filing Status & Messages
  let filingStatus: Mgt14CalculationResult['filingStatus'] = 'on_time'
  let statusBadge = 'On Time'
  let statusMessage = 'Filing is on schedule within the prescribed statutory period.'
  let condonationNote: string | undefined

  if (requiresCondonation) {
    filingStatus = 'condonation_required'
    statusBadge = 'Condonation Required (>300 Days)'
    statusMessage = 'Event date exceeds 300 days from filing date. MCA V3 mandates Condonation of Delay via Form CG-1 & Form INC-28 SRN.'
    condonationNote = 'Under the MCA Form MGT-14 Instruction Kit and Section 460(b), if the event date is not within 300 days of the filing date, the company must obtain a Condonation of Delay order from the Central Government / Regional Director by filing Form CG-1, file the order in Form INC-28, and cite the INC-28 SRN in Form MGT-14.'
  } else if (delayDays > 90) {
    filingStatus = 'severely_delayed'
    statusBadge = 'Severely Delayed'
    statusMessage = `Delayed by ${delayDays} days. High Table B multiplier (${additionalFeeMultiplier}×) and significant Section 117(2) penalty exposure.`
  } else if (isDelayed) {
    filingStatus = 'late'
    statusBadge = `Late Filing (${delayDays}d Delay)`
    statusMessage = `Delayed by ${delayDays} calendar days past statutory deadline (${dueDate}).`
  }

  // 7. Purpose & Applicability Note
  const selectedPurpose = MGT14_PURPOSES.find(p => p.id === purposeId)
  let applicabilityNote = ''
  if (selectedPurpose) {
    applicabilityNote = selectedPurpose.explanation
    if (!selectedPurpose.applicableToPrivate && (companyType === 'small_company' || companyType === 'opc' || companyType === 'startup')) {
      applicabilityNote += ' ⚠️ IMPORTANT: Private companies are EXEMPT from filing Section 179(3) Board Resolutions pursuant to MCA Exemption Notification G.S.R. 464(E) dated 05.06.2015.'
    }
  } else if (eventType === 'special_resolution') {
    applicabilityNote = 'Special Resolutions are universally required to be filed in Form MGT-14 with the ROC under Section 117(3)(a) of the Companies Act, 2013.'
  } else if (eventType === 'board_resolution') {
    applicabilityNote = 'Board resolutions under Section 179(3) require MGT-14 filing for Public Companies only. Private Limited Companies are exempt under MCA Notification dated 05.06.2015.'
  } else if (eventType === 'agreement') {
    applicabilityNote = 'Agreements relating to appointment, re-appointment, or terms of Managing Director / Whole-time Director require MGT-14 under Section 117(3)(c).'
  }

  // 8. Step-by-Step Calculation Breakdown
  const calculationSteps: string[] = []
  if (!hasShareCapital) {
    calculationSteps.push('1. Company not having share capital: Flat Table A normal fee of ₹200 applies.')
  } else {
    calculationSteps.push(`1. Nominal Share Capital: ${formatInr(nominalShareCapital)}. Applicable Table A fee slab is ${formatInr(normalFee)}.`)
  }

  if (isIfscCompany) {
    calculationSteps.push(`2. IFSC Company status: Statutory window is 60 calendar days (MCA Notification G.S.R. 8(E)/9(E) dated 04.01.2017). Due Date is ${dueDate}.`)
  } else {
    calculationSteps.push(`2. Standard Company status: Statutory window is 30 calendar days (Section 117(1)). Due Date is ${dueDate}.`)
  }

  if (!isDelayed) {
    calculationSteps.push('3. Filed on or before due date: Delay = 0 days. Additional fee multiple = 0×.')
    calculationSteps.push(`4. Total MCA Portal Challan = Normal Fee (${formatInr(normalFee)}) + Additional Fee (₹0) = ${formatInr(totalPortalFee)}.`)
    calculationSteps.push('5. Statutory Penalty under Section 117(2): ₹0 (no default).')
  } else {
    calculationSteps.push(`3. Filing date (${filingDate}) is ${delayDays} calendar days past statutory due date (${dueDate}).`)
    calculationSteps.push(`4. Table B Additional Fee Slab: Delay of ${delayDays} days falls into "${additionalFeeMultiplier}× normal fee" slab. Additional Fee = ${additionalFeeMultiplier} × ${formatInr(normalFee)} = ${formatInr(additionalFee)}.`)
    calculationSteps.push(`5. Total MCA Portal Challan = Normal Fee (${formatInr(normalFee)}) + Additional Fee (${formatInr(additionalFee)}) = ${formatInr(totalPortalFee)}.`)
    
    if (is446B) {
      calculationSteps.push(`6. Section 446B Relief Applied (${companyType.toUpperCase()}): 50% reduction in statutory adjudication penalties. Company Penalty: ${formatInr(totalCompanyPenalty)} (capped at ₹1,00,000). Officer Penalty: ${formatInr(totalOfficerPenaltyPerPerson)} each for ${validOfficers} officer(s) (capped at ₹25,000/officer). Total relief saved: ${formatInr(reliefAmountSaved)}.`)
    } else {
      calculationSteps.push(`6. Section 117(2) Adjudication Exposure: Company: ₹10,000 base + ₹100/day after 1st day = ${formatInr(totalCompanyPenalty)} (max ₹2,00,000). Officers in default (${validOfficers}): ₹10,000 base + ₹100/day = ${formatInr(totalOfficerPenaltyPerPerson)} per officer (max ₹50,000/officer). Total = ${formatInr(totalStatutoryPenaltyExposure)}.`)
    }

    if (requiresCondonation) {
      calculationSteps.push(`7. ⚠️ CONDONATION REQUIREMENT: Event date is ${daysFromEvent} days prior to filing (> 300 days). Direct MCA filing is blocked without Central Govt / Regional Director condonation in Form CG-1 and Form INC-28 SRN.`)
    }
  }

  // 9. CS Working Paper Text Format
  const workingPaperText = `================================================================================
MCA FORM MGT-14: STATUTORY FILING & FEE WORKING PAPER
================================================================================
Generated via CorpLawUpdates Compliance Engine (www.corplawupdates.in)
Assessment Date      : ${filingDate}
Legal Basis          : Section 117 & 446B, Companies Act, 2013 read with
                       Rule 24, Management and Administration Rules, 2014 &
                       Table A and Table B, Fees Rules, 2014

1. ENTITY PARTICULARS
--------------------------------------------------------------------------------
Entity Classification: ${companyType.toUpperCase()} ${is446B ? '(Eligible for Section 446B Relief)' : ''}
IFSC Status          : ${isIfscCompany ? 'Yes (60-day window per GSR 8(E)/9(E))' : 'No (Standard 30-day window)'}
Share Capital Status : ${hasShareCapital ? `Nominal Capital: ${formatInr(nominalShareCapital)}` : 'Company without share capital'}
Officers in Default  : ${validOfficers}

2. TRANSACTION & EVENT PARTICULARS
--------------------------------------------------------------------------------
Event Type           : ${eventType.replace('_', ' ').toUpperCase()}
Purpose              : ${selectedPurpose ? selectedPurpose.label : 'General Resolution Filing'}
Governing Section    : ${selectedPurpose ? selectedPurpose.sectionRef : 'Section 117(3)'}
Event / Passing Date : ${eventDate}
Statutory Due Date   : ${dueDate} (${filingWindowDays} days window)
Actual Filing Date   : ${filingDate}
Delay in Days        : ${delayDays} calendar day(s)
Filing Status        : ${statusBadge}

3. MCA V3 PORTAL FEE COMPUTATION (TABLE A & TABLE B)
--------------------------------------------------------------------------------
Normal Base Fee      : ${formatInr(normalFee)} (Table A)
Additional Fee Slab  : ${additionalFeeMultiplier}× Normal Fee (Table B)
Additional Late Fee  : ${formatInr(additionalFee)}
--------------------------------------------------------------------------------
TOTAL MCA PORTAL FEE : ${formatInr(totalPortalFee)}
--------------------------------------------------------------------------------

4. STATUTORY PENALTY EXPOSURE UNDER SECTION 117(2) (SEPARATE FROM PORTAL FEE)
--------------------------------------------------------------------------------
Company Penalty      : ${formatInr(totalCompanyPenalty)} ${is446B ? '(Sec 446B Relief applied, max ₹1L)' : '(Max ₹2L)'}
Officer Penalty Each : ${formatInr(totalOfficerPenaltyPerPerson)} ${is446B ? '(Sec 446B Relief applied, max ₹25k)' : '(Max ₹50k)'}
Total Officer Penalty: ${formatInr(totalAllOfficersPenalty)} (${validOfficers} officer(s))
--------------------------------------------------------------------------------
ESTIMATED PENALTY    : ${formatInr(totalStatutoryPenaltyExposure)} (Subject to ROC Sec 454 Adjudication)
--------------------------------------------------------------------------------
${is446B ? `* Section 446B Benefit Saved: ${formatInr(reliefAmountSaved)} in adjudication penalty liabilities.\n` : ''}
${requiresCondonation ? `⚠️ CONDONATION WARNING: Delay exceeds 300 days from event date. File Form CG-1 with Regional Director and obtain INC-28 SRN before filing MGT-14.\n` : ''}
DISCLAIMER: This working paper is for professional reference and compliance audit trails. Exact challan is generated by the MCA V3 system. Statutory penalties are adjudicated separately by the ROC under Section 454.
================================================================================`

  return {
    input,
    normalFee,
    dueDate,
    filingWindowDays,
    delayDays,
    isDelayed,
    isExtendedDelay,
    requiresCondonation,
    additionalFeeMultiplier,
    additionalFee,
    totalPortalFee,
    penaltyPerDay: 100,
    companyPenaltyBase: 10000,
    officerPenaltyBase: 10000,
    totalCompanyPenalty,
    totalOfficerPenaltyPerPerson,
    totalAllOfficersPenalty,
    totalStatutoryPenaltyExposure,
    is446BEligible: is446B,
    statutoryMaxCompanyPenalty: statutoryMaxCompany,
    statutoryMaxOfficerPenalty: statutoryMaxOfficer,
    reliefAmountSaved,
    filingStatus,
    statusBadge,
    statusMessage,
    condonationNote,
    calculationSteps,
    workingPaperText,
    applicabilityNote
  }
}
