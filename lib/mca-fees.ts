export type FormType = 'AOC-4' | 'MGT-7' | 'DIR-3-KYC' | 'DPT-3' | 'LLP-11' | 'LLP-8'

export interface CalculationResult {
  standard: number
  late: number
  total: number
  daysDelayed: number
  source: string
  legalNotes?: string
}

const COMPANY_FEE_SLABS = [
  { maxCapital: 100_000,    fee: 200 },
  { maxCapital: 500_000,    fee: 300 },
  { maxCapital: 2_500_000,  fee: 400 },
  { maxCapital: 10_000_000, fee: 500 },
  { maxCapital: Infinity,   fee: 600 },
]

export function getCompanyStandardFee(nominalCapital: number, isSmallOrOPC: boolean): number {
  const base = COMPANY_FEE_SLABS.find(s => nominalCapital <= s.maxCapital)!.fee
  return isSmallOrOPC ? Math.round(base * 0.5) : base // Statutory 50% discount
}

export function getDaysDelay(dueDate: Date, filingDate: Date): number {
  const ms = filingDate.getTime() - dueDate.getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export function getStatutoryDueDate(form: FormType, financialYear: number): Date {
  switch (form) {
    case 'AOC-4':
      return new Date(financialYear + 1, 9, 30) // October 30 (30 days from assumed AGM Sept 30)
    case 'MGT-7':
      return new Date(financialYear + 1, 10, 29) // November 29 (60 days from AGM)
    case 'DIR-3-KYC':
      return new Date(financialYear + 1, 8, 30) // September 30 annually
    case 'DPT-3':
      return new Date(financialYear + 1, 5, 30) // June 30 annually
    case 'LLP-11':
      return new Date(financialYear + 1, 4, 30) // May 30 annually
    case 'LLP-8':
      return new Date(financialYear + 1, 9, 30) // October 30 annually
  }
}

export function calculateFees(
  form: FormType,
  delay: number,
  nominalCapital: number,
  isSmallOrOPC: boolean,
  isAmnestyActive: boolean = false
): CalculationResult {
  if (isAmnestyActive && form !== 'DIR-3-KYC') {
    const standard = getCompanyStandardFee(nominalCapital, isSmallOrOPC)
    return {
      standard,
      late: 0,
      total: standard,
      daysDelayed: delay,
      source: 'MCA Amnesty Waiver Scheme (CFSS Framework Directive)',
      legalNotes: 'Waiver Active: All daily additional late filing fees are completely waived under current policy.'
    }
  }

  if (form === 'DIR-3-KYC') {
    const late = delay > 0 ? 5000 : 0
    return {
      standard: 0,
      late,
      total: late,
      daysDelayed: delay,
      source: 'Section 12(1A) proviso, Companies Act, 2013 read with Rule 12A of Companies Rules, 2014.',
      legalNotes: 'DIN Late Fee: Flat ₹5,000 statutory fee applies for re-activation or delay after September 30.'
    }
  }

  // Decoupled LLP Fee Slabs (Amended Effective April 1, 2022)
  if (form === 'LLP-11' || form === 'LLP-8') {
    const isSmallLLP = nominalCapital <= 2500000
    const baseFee = isSmallLLP ? 50 : 150
    let late = 0

    if (delay > 0) {
      if (isSmallLLP) {
        if (delay <= 15) late = baseFee * 1
        else if (delay <= 30) late = baseFee * 2
        else if (delay <= 60) late = baseFee * 4
        else if (delay <= 90) late = baseFee * 6
        else if (delay <= 180) late = baseFee * 10
        else if (delay <= 360) late = baseFee * 15
        else late = baseFee * 15 + (delay - 360) * 10
      } else {
        if (delay <= 15) late = baseFee * 1
        else if (delay <= 30) late = baseFee * 4
        else if (delay <= 60) late = baseFee * 8
        else if (delay <= 90) late = baseFee * 12
        else if (delay <= 180) late = baseFee * 20
        else if (delay <= 360) late = baseFee * 30
        else late = baseFee * 30 + (delay - 360) * 20
      }
    }

    return {
      standard: baseFee,
      late,
      total: baseFee + late,
      daysDelayed: delay,
      source: 'Rule 36 & Annexure-A of Limited Liability Partnership Rules, 2009 (As amended by LLP Second Amendment Rules, 2022, effective April 1, 2022).',
      legalNotes: 'LLP Slabs: The flat ₹100/day penalty was replaced by a slab multiplier system based on the delay period.'
    }
  }

  // Standard Company Forms: AOC-4, MGT-7, DPT-3
  const standard = getCompanyStandardFee(nominalCapital, isSmallOrOPC)
  let late = 0

  if (delay > 0) {
    if (form === 'MGT-7' || form === 'AOC-4') {
      late = delay * 100 // Statutory ₹100/day
      return {
        standard,
        late,
        total: standard + late,
        daysDelayed: delay,
        source: 'Section 403 of Companies Act, 2013 read with Companies (Registration Offices and Fees) Amendment Rules, 2018 (effective July 1, 2018).',
        legalNotes: 'Standard Penalties: Additional late fee of ₹100 per day is calculated daily without any statutory maximum cap.'
      }
    } else {
      // General forms (e.g. DPT-3) use time-slab multiplier
      let multiplier = 1
      if (delay <= 30) multiplier = 2
      else if (delay <= 60) multiplier = 4
      else if (delay <= 90) multiplier = 6
      else if (delay <= 180) multiplier = 10
      else multiplier = 12

      late = standard * multiplier
      return {
        standard,
        late,
        total: standard + late,
        daysDelayed: delay,
        source: 'Companies (Registration Offices and Fees) Rules, 2014.',
        legalNotes: 'General Forms: Additional late fee is calculated using a multiplier (up to 12x) on the standard filing fee based on delay period.'
      }
    }
  }

  return {
    standard,
    late: 0,
    total: standard,
    daysDelayed: delay,
    source: 'Companies Act, 2013 / LLP Act, 2008.',
    legalNotes: 'Filed on time. No additional fee applies.'
  }
}
