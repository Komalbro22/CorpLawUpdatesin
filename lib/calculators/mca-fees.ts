// ═══════════════════════════════
// MCA COMPANY FORMS
// ═══════════════════════════════

export interface MCAForm {
  id: string
  name: string
  description: string
  section: string
  normalFee: number        // Base government fee
  additionalFeePerDay: number  // ₹100 or ₹200/day
  maxAdditionalFee: number | null // null = no cap
  gracePeriodDays: number  // Days before late fee starts
  applicableTo: string[]   // company types
  category: string         // 'annual' | 'event' | 'other'
  ccfsEligible: boolean    // Under CCFS 2026 scheme
}

export const MCA_FORMS: MCAForm[] = [
  {
    id: 'mgt-7',
    name: 'MGT-7 / MGT-7A',
    description: 'Annual Return (Companies / Small Companies)',
    section: 'Section 92, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 100,
    maxAdditionalFee: null,
    gracePeriodDays: 0,
    applicableTo: ['private', 'public', 'opc', 'small'],
    category: 'annual',
    ccfsEligible: true,
  },
  {
    id: 'aoc-4',
    name: 'AOC-4 / AOC-4 XBRL / AOC-4 CFS',
    description: 'Filing of Financial Statements',
    section: 'Section 137, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 100,
    maxAdditionalFee: null,
    gracePeriodDays: 0,
    applicableTo: ['private', 'public', 'opc', 'small'],
    category: 'annual',
    ccfsEligible: true,
  },
  {
    id: 'dir-3-kyc',
    name: 'DIR-3 KYC Web',
    description: 'Director KYC (every 3 financial years)',
    section: 'Rule 12A, Companies (Appointment) Rules',
    normalFee: 0,
    additionalFeePerDay: 0,
    maxAdditionalFee: 5000,
    gracePeriodDays: 0,
    applicableTo: ['all_directors'],
    category: 'event',
    ccfsEligible: false,
  },
  {
    id: 'adt-1',
    name: 'ADT-1',
    description: 'Auditor Appointment Intimation',
    section: 'Section 139, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 300,
    maxAdditionalFee: null,
    gracePeriodDays: 0,
    applicableTo: ['private', 'public', 'opc'],
    category: 'event',
    ccfsEligible: true,
  },
  {
    id: 'dir-12',
    name: 'DIR-12',
    description: 'Change in Directors / KMP',
    section: 'Section 168, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 300,
    maxAdditionalFee: null,
    gracePeriodDays: 30,
    applicableTo: ['private', 'public', 'opc'],
    category: 'event',
    ccfsEligible: true,
  },
  {
    id: 'mgt-14',
    name: 'MGT-14',
    description: 'Filing of Resolutions',
    section: 'Section 117, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 300,
    maxAdditionalFee: null,
    gracePeriodDays: 30,
    applicableTo: ['public'],
    category: 'event',
    ccfsEligible: true,
  },
  {
    id: 'inc-20a',
    name: 'INC-20A',
    description: 'Declaration of Commencement of Business',
    section: 'Section 10A, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 0,
    maxAdditionalFee: null,
    gracePeriodDays: 180,
    applicableTo: ['private', 'public', 'opc'],
    category: 'event',
    ccfsEligible: true,
  },
  {
    id: 'dpt-3',
    name: 'DPT-3',
    description: 'Return of Deposits',
    section: 'Section 73, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 100,
    maxAdditionalFee: null,
    gracePeriodDays: 0,
    applicableTo: ['private', 'public'],
    category: 'annual',
    ccfsEligible: true,
  },
  {
    id: 'ben-2',
    name: 'BEN-2',
    description: 'Beneficial Ownership Return',
    section: 'Section 90, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 100,
    maxAdditionalFee: null,
    gracePeriodDays: 30,
    applicableTo: ['private', 'public'],
    category: 'event',
    ccfsEligible: true,
  },
  {
    id: 'mgt-6',
    name: 'MGT-6',
    description: 'Register of Significant Beneficial Owners',
    section: 'Section 90(4A), Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 100,
    maxAdditionalFee: null,
    gracePeriodDays: 0,
    applicableTo: ['private', 'public'],
    category: 'event',
    ccfsEligible: false,
  },
  {
    id: 'inc-22',
    name: 'INC-22',
    description: 'Change of Registered Office',
    section: 'Section 12, Companies Act 2013',
    normalFee: 300,
    additionalFeePerDay: 300,
    maxAdditionalFee: null,
    gracePeriodDays: 30,
    applicableTo: ['private', 'public', 'opc'],
    category: 'event',
    ccfsEligible: true,
  },
  {
    id: 'msme-1',
    name: 'MSME-1',
    description: 'Outstanding payments to MSME vendors',
    section: 'MSME Development Act 2006',
    normalFee: 0,
    additionalFeePerDay: 0,
    maxAdditionalFee: null,
    gracePeriodDays: 0,
    applicableTo: ['private', 'public'],
    category: 'annual',
    ccfsEligible: false,
  },
  {
    id: 'cra-4',
    name: 'CRA-4',
    description: 'Cost Audit Report',
    section: 'Companies (Cost Records) Rules 2014',
    normalFee: 300,
    additionalFeePerDay: 100,
    maxAdditionalFee: null,
    gracePeriodDays: 30,
    applicableTo: ['public'],
    category: 'annual',
    ccfsEligible: false,
  },
]

// ═══════════════════════════════
// LLP FORMS
// ═══════════════════════════════

export interface LLPForm {
  id: string
  name: string
  description: string
  section: string
  normalFee: number
  additionalFeePerDay: number
  gracePeriodDays: number
  applicableTo: string
  category: string
}

export const LLP_FORMS: LLPForm[] = [
  {
    id: 'form-11',
    name: 'Form 11',
    description: 'LLP Annual Return',
    section: 'Section 35, LLP Act 2008',
    normalFee: 50,
    additionalFeePerDay: 100,
    gracePeriodDays: 0,
    applicableTo: 'All LLPs',
    category: 'annual',
  },
  {
    id: 'form-8',
    name: 'Form 8',
    description: 'Statement of Accounts & Solvency',
    section: 'Section 34, LLP Act 2008',
    normalFee: 50,
    additionalFeePerDay: 100,
    gracePeriodDays: 0,
    applicableTo: 'All LLPs',
    category: 'annual',
  },
  {
    id: 'form-3',
    name: 'Form 3',
    description: 'LLP Agreement Filing',
    section: 'Section 23, LLP Act 2008',
    normalFee: 50,
    additionalFeePerDay: 100,
    gracePeriodDays: 30,
    applicableTo: 'All LLPs',
    category: 'event',
  },
  {
    id: 'form-4',
    name: 'Form 4',
    description: 'Change in Partners',
    section: 'Rule 22, LLP Rules 2009',
    normalFee: 50,
    additionalFeePerDay: 100,
    gracePeriodDays: 30,
    applicableTo: 'All LLPs',
    category: 'event',
  },
  {
    id: 'form-15',
    name: 'Form 15',
    description: 'Change of Registered Office of LLP',
    section: 'Section 13, LLP Act 2008',
    normalFee: 50,
    additionalFeePerDay: 100,
    gracePeriodDays: 30,
    applicableTo: 'All LLPs',
    category: 'event',
  },
]

// ═══════════════════════════════
// MSME PENALTY STRUCTURE
// ═══════════════════════════════

export interface MSMEPenalty {
  description: string
  penaltyAmount: string
  section: string
}

export const MSME_PENALTIES: MSMEPenalty[] = [
  {
    description: 'Non-filing of MSME-1 (half-yearly return)',
    penaltyAmount: '₹25,000 - ₹3,00,000 for company + ₹25,000 - ₹1,00,000 for every officer',
    section: 'Section 405(4), Companies Act 2013',
  },
  {
    description: 'Delayed payment to MSME beyond 45 days',
    penaltyAmount: 'Compound interest at 3x bank rate from agreed payment date',
    section: 'Section 16, MSME Development Act 2006',
  },
  {
    description: 'Non-compliance with MSMED Act',
    penaltyAmount: '₹10,000 per day of default',
    section: 'Section 27, MSME Development Act 2006',
  },
]

// ═══════════════════════════════
// CALCULATION ENGINE
// ═══════════════════════════════

export interface FeeCalculationResult {
  form: MCAForm | LLPForm
  daysDelayed: number
  normalGovernmentFee: number
  normalAdditionalFee: number
  totalNormalFee: number
  
  // CCFS (if applicable)
  ccfsEligible: boolean
  ccfsAdditionalFee: number
  totalCcfsFee: number
  ccfsSavings: number
  ccfsSavingsPercent: number
  
  // Dir-3 KYC flat fee
  flatLateFee?: number
  
  // Breakdown
  breakdown: {
    label: string
    amount: number
    note?: string
  }[]
}

export function calculateMCALateFee(
  formId: string,
  daysDelayed: number,
  companyType: string,
  applyCcfs: boolean = false
): FeeCalculationResult | null {
  const form = MCA_FORMS.find(f => f.id === formId)
  if (!form) return null

  const effectiveDays = Math.max(
    0, daysDelayed - form.gracePeriodDays
  )

  // Special case: DIR-3 KYC flat fee
  if (formId === 'dir-3-kyc') {
    return {
      form,
      daysDelayed,
      normalGovernmentFee: 0,
      normalAdditionalFee: 5000,
      totalNormalFee: 5000,
      ccfsEligible: false,
      ccfsAdditionalFee: 5000,
      totalCcfsFee: 5000,
      ccfsSavings: 0,
      ccfsSavingsPercent: 0,
      flatLateFee: 5000,
      breakdown: [
        {
          label: 'DIR-3 KYC Reactivation Fee',
          amount: 5000,
          note: 'Flat fee regardless of delay period'
        }
      ]
    }
  }

  // Normal fee calculation
  const normalGovernmentFee = form.normalFee
  const normalAdditionalFee = form.maxAdditionalFee !== null
    ? Math.min(
        effectiveDays * form.additionalFeePerDay,
        form.maxAdditionalFee
      )
    : effectiveDays * form.additionalFeePerDay

  const totalNormalFee = normalGovernmentFee + 
    normalAdditionalFee

  // CCFS calculation (10% of additional fee)
  const ccfsEligible = form.ccfsEligible && applyCcfs
  const ccfsAdditionalFee = ccfsEligible
    ? Math.ceil(normalAdditionalFee * 0.10)
    : normalAdditionalFee
  const totalCcfsFee = ccfsEligible
    ? normalGovernmentFee + ccfsAdditionalFee
    : totalNormalFee

  const ccfsSavings = totalNormalFee - totalCcfsFee
  const ccfsSavingsPercent = totalNormalFee > 0
    ? Math.round((ccfsSavings / totalNormalFee) * 100)
    : 0

  // Build breakdown
  const breakdown: FeeCalculationResult['breakdown'] = [
    {
      label: 'Government Filing Fee (base)',
      amount: normalGovernmentFee,
    },
  ]

  if (form.gracePeriodDays > 0 && 
      daysDelayed <= form.gracePeriodDays) {
    breakdown.push({
      label: 'Additional Fee (within grace period)',
      amount: 0,
      note: `No additional fee within ${form.gracePeriodDays} days`
    })
  } else if (effectiveDays > 0) {
    if (ccfsEligible) {
      breakdown.push({
        label: `Normal Additional Fee (${effectiveDays} days × ₹${form.additionalFeePerDay})`,
        amount: normalAdditionalFee,
        note: 'Without CCFS 2026'
      })
      breakdown.push({
        label: 'Additional Fee under CCFS 2026 (10%)',
        amount: ccfsAdditionalFee,
        note: '90% waiver on additional fee!'
      })
    } else {
      breakdown.push({
        label: `Additional Fee (${effectiveDays} days × ₹${form.additionalFeePerDay})`,
        amount: normalAdditionalFee,
      })
    }
  }

  return {
    form,
    daysDelayed,
    normalGovernmentFee,
    normalAdditionalFee,
    totalNormalFee,
    ccfsEligible,
    ccfsAdditionalFee,
    totalCcfsFee,
    ccfsSavings,
    ccfsSavingsPercent,
    breakdown,
  }
}

export function calculateLLPLateFee(
  formId: string,
  daysDelayed: number
): {
  form: LLPForm
  daysDelayed: number
  normalFee: number
  additionalFee: number
  totalFee: number
  breakdown: { label: string; amount: number; note?: string }[]
} | null {
  const form = LLP_FORMS.find(f => f.id === formId)
  if (!form) return null

  const effectiveDays = Math.max(
    0, daysDelayed - form.gracePeriodDays
  )

  const normalFee = form.normalFee
  const additionalFee = effectiveDays * 
    form.additionalFeePerDay
  const totalFee = normalFee + additionalFee

  return {
    form,
    daysDelayed,
    normalFee,
    additionalFee,
    totalFee,
    breakdown: [
      {
        label: 'LLP Form Filing Fee (base)',
        amount: normalFee,
      },
      {
        label: `Additional Fee (${effectiveDays} days × ₹${form.additionalFeePerDay})`,
        amount: additionalFee,
        note: form.gracePeriodDays > 0 
          ? `After ${form.gracePeriodDays}-day grace period`
          : undefined
      }
    ]
  }
}

// Format currency in Indian format
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number in words (Indian system)
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)} Crore`
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1)} Lakh`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} Thousand`
  }
  return num.toString()
}
