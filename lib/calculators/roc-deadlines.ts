export interface CompanyProfile {
  companyName: string
  cin?: string
  companyType: 'private' | 'public' | 'opc' | 'small' | 'section8'
  incorporationDate: Date
  financialYearEnd: 'march' | 'september'
  paidUpCapital: number
  turnover: number
  hasCS: boolean
  agmDate: Date | null
  directorCount: number
  isXBRL: boolean
  isListed: boolean
  hasForeignShareholders: boolean
  hasDeposits: boolean
  auditDate: Date | null
  hasSBO?: boolean
  hasResolutions?: boolean
  hasSubsidiaries?: boolean
  filingYear?: string
  hasMSMEDues?: boolean
  hasPublicDeposits?: boolean
}

export function getFYFromYear(
  financialYearEnd: 'march' | 'september',
  filingYear: string
): { start: Date, end: Date, label: string } {
  const parts = filingYear.split('-')
  const startYear = parseInt(parts[0])
  const endYear = startYear + 1

  if (financialYearEnd === 'march') {
    const start = new Date(startYear, 3, 1) // April 1st
    const end = new Date(endYear, 2, 31)   // March 31st
    const label = `FY ${filingYear}`
    return { start, end, label }
  } else {
    const start = new Date(startYear, 9, 1) // October 1st
    const end = new Date(endYear, 8, 30)   // September 30th
    const label = `FY ${filingYear}`
    return { start, end, label }
  }
}


export interface DeadlineItem {
  id: string
  formName: string
  description: string
  dueDate: Date
  daysRemaining: number
  status: 'overdue' | 'due-soon' | 'upcoming' | 'not-applicable'
  normalFee: number
  lateFeePerDay: number
  currentPenalty: number
  ccfsEligible: boolean
  ccfsPenalty: number
  ccfsSavings: number
  legalSection: string
  moreInfoUrl: string
  howToFile: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  isApplicable: boolean
  notApplicableReason?: string
}

export interface ROCFormDB {
  form_code: string
  form_name: string
  short_description: string
  applicable_to: string[]
  due_basis: string
  due_days: number | null
  due_fixed_month: number | null
  due_fixed_day: number | null
  due_second_date_month: number | null
  due_second_date_day: number | null
  normal_govt_fee: number
  additional_fee_per_day: number
  max_additional_fee: number | null
  flat_late_fee: number | null
  grace_period_days: number
  ccfs_eligible: boolean
  ccfs_expiry: string
  ccfs_waiver_percent: number
  legal_section: string
  more_info_url: string | null
  how_to_file: string | null
  mca_portal_path: string | null
  priority: string
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function daysFromToday(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getFY(
  financialYearEnd: 'march' | 'september',
  date: Date
): { start: Date, end: Date, label: string } {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-11
  
  if (financialYearEnd === 'march') {
    const startYear = month >= 3 ? year - 1 : year - 2
    const endYear = startYear + 1
    const start = new Date(startYear, 3, 1)
    const end = new Date(endYear, 2, 31)
    const label = `FY ${startYear}-${String(endYear).slice(-2)}`
    return { start, end, label }
  } else {
    const startYear = month >= 9 ? year - 1 : year - 2
    const endYear = startYear + 1
    const start = new Date(startYear, 9, 1)
    const end = new Date(endYear, 8, 30)
    const label = `FY ${startYear}-${String(endYear).slice(-2)}`
    return { start, end, label }
  }
}

export interface PenaltySummary {
  overdueCount: number
  dueSoonCount: number
  totalNormalPenalty: number
  totalCCFSPenalty: number
  totalSavings: number
}

export function getPenaltySummary(deadlines: DeadlineItem[]): PenaltySummary {
  let overdueCount = 0
  let dueSoonCount = 0
  let totalNormalPenalty = 0
  let totalCCFSPenalty = 0
  let totalSavings = 0

  for (const item of deadlines) {
    if (item.isApplicable) {
      if (item.status === 'overdue') {
        overdueCount++
      } else if (item.status === 'due-soon') {
        dueSoonCount++
      }
      totalNormalPenalty += item.currentPenalty || 0
      totalCCFSPenalty += item.ccfsPenalty || 0
      totalSavings += item.ccfsSavings || 0
    }
  }

  return {
    overdueCount,
    dueSoonCount,
    totalNormalPenalty,
    totalCCFSPenalty,
    totalSavings,
  }
}

export function getNormalFeeForTracker(
  formCode: string,
  companyType: 'private' | 'public' | 'opc' | 'small' | 'section8',
  capital: number
): number {
  const code = formCode.toUpperCase().trim();
  
  // Forms with zero normal fee
  if (['DIR-3-KYC', 'DIR-3 KYC', 'RBI-FLA', 'FORM-3CD', 'ITR-6', 'BOARD-MEETINGS', 'MSME-1', 'MBP-1'].includes(code)) {
    return 0;
  }

  // OPC / Small company concessional fee structure
  const isSmallOrOpc = companyType === 'opc' || companyType === 'small';
  
  let normalFee = 0;
  if (isSmallOrOpc) {
    if (capital < 100000) normalFee = 50;
    else if (capital < 500000) normalFee = 100;
    else if (capital < 2500000) normalFee = 150;
    else normalFee = 200;
  } else {
    if (capital < 100000) normalFee = 200;
    else if (capital < 500000) normalFee = 300;
    else if (capital < 2500000) normalFee = 400;
    else if (capital < 10000000) normalFee = 500;
    else normalFee = 600;
  }

  // Section 8 company discount: 1/3rd of the standard fee, rounded to nearest 50 (minimum 50)
  if (companyType === 'section8') {
    normalFee = Math.round(normalFee / 3 / 50) * 50;
    if (normalFee < 50) normalFee = 50;
  }

  return normalFee;
}

export function calculateLateFeeForTracker(
  formCode: string,
  daysOverdue: number,
  normalFee: number,
  turnover: number,
  dbFlatFee?: number | null
): number {
  if (daysOverdue <= 0) return 0;

  const code = formCode.toUpperCase().trim();

  // 1. Annual returns & Financial statements have flat ₹100/day
  if (['MGT-7', 'MGT-7A', 'AOC-4', 'AOC-4-CFS', 'AOC-4 CFS', 'AOC-4-XBRL', 'AOC-4 XBRL'].includes(code)) {
    return daysOverdue * 100;
  }

  // 2. DIR-3 KYC flat penalty
  if (code === 'DIR-3-KYC' || code === 'DIR-3 KYC') {
    return 5000;
  }

  // 3. RBI FLA Return flat late submission fee
  if (code === 'RBI-FLA') {
    return 7500;
  }

  // 4. Tax Audit Report (Form 3CD): 0.5% of turnover, max ₹1.5 Lakh
  if (code === 'FORM-3CD') {
    const calculatedPenalty = Math.round(turnover * 0.005);
    return Math.min(calculatedPenalty, 150000);
  }

  // 5. Income Tax Return (ITR-6/ITR-7): Flat ₹5,000
  if (code === 'ITR-6') {
    return 5000;
  }

  // 6. Board Meetings Compliance: Flat ₹10,000
  if (code === 'BOARD-MEETINGS') {
    return 10000;
  }

  // 7. MSME-1 has no portal late fee
  if (code === 'MSME-1') {
    return 0;
  }

  // 8. MBP-1 has no portal late fee
  if (code === 'MBP-1') {
    return 0;
  }

  // 9. If database defines a flat late fee (e.g. STK-2 or other future forms), prioritize it
  if (dbFlatFee && dbFlatFee > 0) {
    return dbFlatFee;
  }

  // 10. General forms use the multiplier system (2x to 12x of normal fee)
  let multiplier = 1;
  if (daysOverdue <= 30) {
    multiplier = 2;
  } else if (daysOverdue <= 60) {
    multiplier = 4;
  } else if (daysOverdue <= 90) {
    multiplier = 6;
  } else if (daysOverdue <= 180) {
    multiplier = 10;
  } else {
    multiplier = 12;
  }

  return normalFee * multiplier;
}

export function calculateDeadlinesFromDB(
  profile: CompanyProfile,
  forms: ROCFormDB[]
): DeadlineItem[] {
  const today = new Date()
  const fy = profile.filingYear
    ? getFYFromYear(profile.financialYearEnd, profile.filingYear)
    : getFY(profile.financialYearEnd, today)
  const currentYear = today.getFullYear()
  
  const agmDate = profile.agmDate || (
    profile.financialYearEnd === 'march'
      ? new Date(fy.end.getFullYear(), 8, 30)
      : new Date(fy.end.getFullYear(), 2, 31)
  )

  // Check CCFS is still active
  const ccfsStillActive = 
    new Date() <= new Date('2026-07-15')

  // Ensure the 4 new compliance requirements are present in forms list (as fallback if not loaded from DB)
  const requiredFormCodes = ['RBI-FLA', 'FORM-3CD', 'ITR-6', 'BOARD-MEETINGS'];
  
  const fallbackFormsMap: Record<string, ROCFormDB> = {
    'RBI-FLA': {
      form_code: 'RBI-FLA',
      form_name: 'RBI FLA Return',
      short_description: 'Annual Return on Foreign Liabilities and Assets',
      applicable_to: ['private', 'public', 'opc', 'small', 'section8'],
      due_basis: 'fixed_date',
      due_days: null,
      due_fixed_month: 7,
      due_fixed_day: 15,
      due_second_date_month: null,
      due_second_date_day: null,
      normal_govt_fee: 0,
      additional_fee_per_day: 0,
      max_additional_fee: null,
      flat_late_fee: 7500,
      grace_period_days: 0,
      ccfs_eligible: false,
      ccfs_expiry: '2026-07-15',
      ccfs_waiver_percent: 0,
      legal_section: 'Section 7(3)(b) of FEMA, 1999 read with RBI regulations',
      more_info_url: 'https://flair.rbi.org.in',
      how_to_file: 'RBI FLAIR Portal',
      mca_portal_path: null,
      priority: 'high'
    },
    'FORM-3CD': {
      form_code: 'FORM-3CD',
      form_name: 'Tax Audit Report (Form 3CD)',
      short_description: 'Tax Audit Report under Section 44AB of Income Tax Act',
      applicable_to: ['private', 'public', 'opc', 'small', 'section8'],
      due_basis: 'fixed_date',
      due_days: null,
      due_fixed_month: 9,
      due_fixed_day: 30,
      due_second_date_month: null,
      due_second_date_day: null,
      normal_govt_fee: 0,
      additional_fee_per_day: 0,
      max_additional_fee: 150000,
      flat_late_fee: null,
      grace_period_days: 0,
      ccfs_eligible: false,
      ccfs_expiry: '2026-07-15',
      ccfs_waiver_percent: 0,
      legal_section: 'Section 44AB of the Income Tax Act, 1961',
      more_info_url: 'https://www.incometax.gov.in',
      how_to_file: 'Income Tax e-Filing Portal',
      mca_portal_path: null,
      priority: 'critical'
    },
    'ITR-6': {
      form_code: 'ITR-6',
      form_name: 'Income Tax Return (ITR-6)',
      short_description: 'Annual corporate income tax return for companies',
      applicable_to: ['private', 'public', 'opc', 'small', 'section8'],
      due_basis: 'fixed_date',
      due_days: null,
      due_fixed_month: 10,
      due_fixed_day: 31,
      due_second_date_month: null,
      due_second_date_day: null,
      normal_govt_fee: 0,
      additional_fee_per_day: 0,
      max_additional_fee: null,
      flat_late_fee: 5000,
      grace_period_days: 0,
      ccfs_eligible: false,
      ccfs_expiry: '2026-07-15',
      ccfs_waiver_percent: 0,
      legal_section: 'Section 139(1) of the Income Tax Act, 1961',
      more_info_url: 'https://www.incometax.gov.in',
      how_to_file: 'Income Tax e-Filing Portal',
      mca_portal_path: null,
      priority: 'critical'
    },
    'BOARD-MEETINGS': {
      form_code: 'BOARD-MEETINGS',
      form_name: 'Board Meetings Compliance',
      short_description: 'Holding of minimum number of Board Meetings annually',
      applicable_to: ['private', 'public', 'small', 'section8'],
      due_basis: 'fixed_date',
      due_days: null,
      due_fixed_month: 3,
      due_fixed_day: 31,
      due_second_date_month: null,
      due_second_date_day: null,
      normal_govt_fee: 0,
      additional_fee_per_day: 0,
      max_additional_fee: null,
      flat_late_fee: 10000,
      grace_period_days: 0,
      ccfs_eligible: false,
      ccfs_expiry: '2026-07-15',
      ccfs_waiver_percent: 0,
      legal_section: 'Section 173 of the Companies Act, 2013',
      more_info_url: null,
      how_to_file: 'Kept internally in company Minutes Book',
      mca_portal_path: null,
      priority: 'high'
    }
  };

  const processedForms = [...forms];
  for (const code of requiredFormCodes) {
    if (!processedForms.some(f => f.form_code.toUpperCase() === code)) {
      processedForms.push(fallbackFormsMap[code]);
    }
  }

  const deadlines: DeadlineItem[] = []

  for (const form of processedForms) {
    
    // Check applicability
    const isApplicable = form.applicable_to.includes(
      profile.companyType
    )

    // Special case applicability
    let specialApplicable = isApplicable
    let notApplicableReason = ''

    // INC-20A only for recently incorporated
    if (form.form_code === 'INC-20A') {
      const daysSinceIncorp = Math.floor(
        (today.getTime() - 
         profile.incorporationDate.getTime()) / 
        (1000 * 60 * 60 * 24)
      )
      specialApplicable = 
        isApplicable && daysSinceIncorp <= 365
      if (!specialApplicable) {
        notApplicableReason = 
          'Only for companies incorporated recently'
      }
    }

    // PAS-6 only for unlisted public
    if (form.form_code === 'PAS-6') {
      specialApplicable = 
        profile.companyType === 'public' && 
        !profile.isListed
      if (!specialApplicable) {
        notApplicableReason = 
          'Only for unlisted Public Companies'
      }
    }

    // AOC-4 CFS only if has subsidiaries
    if (form.form_code === 'AOC-4 CFS') {
      specialApplicable = isApplicable && !!profile.hasSubsidiaries
      if (!specialApplicable) {
        notApplicableReason = 
          'Only applicable if company has subsidiaries, associates or joint ventures'
      }
    }

    // BEN-2 only if has SBO
    if (form.form_code === 'BEN-2') {
      specialApplicable = isApplicable && !!profile.hasSBO
      if (!specialApplicable) {
        notApplicableReason = 
          'Only applicable if company has Significant Beneficial Owners (SBO)'
      }
    }

    // MGT-14 only if resolutions passed
    if (form.form_code === 'MGT-14') {
      specialApplicable = isApplicable && !!profile.hasResolutions
      if (!specialApplicable) {
        notApplicableReason = 
          'Only applicable if company passed resolutions requiring MGT-14 filing'
      }
    }

    // MGT-7A for OPC/Small, MGT-7 for others
    if (form.form_code === 'MGT-7') {
      specialApplicable = 
        profile.companyType === 'private' ||
        profile.companyType === 'public'
    }
    if (form.form_code === 'MGT-7A') {
      specialApplicable = 
        profile.companyType === 'opc' ||
        profile.companyType === 'small'
    }

    // Calculate due date from DB logic
    let dueDate: Date

    if (profile.companyType === 'opc' && form.form_code === 'AOC-4') {
      dueDate = addDays(fy.end, 180)
    } else {
      switch (form.due_basis) {
        case 'from_agm':
          dueDate = addDays(agmDate, form.due_days || 60)
          break
        
        case 'from_fy_end':
          dueDate = addDays(fy.end, form.due_days || 30)
          break
        
        case 'fixed_date': {
          const fyEndYear = fy.end.getFullYear()
          const dueDate1 = new Date(
            fyEndYear,
            (form.due_fixed_month || 6) - 1,
            form.due_fixed_day || 30
          )
          dueDate = dueDate1
          
          if (form.due_second_date_month) {
            const dueDate2 = new Date(
              fyEndYear,
              form.due_second_date_month - 1,
              form.due_second_date_day || 30
            )
            if (today <= dueDate1) {
              dueDate = dueDate1
            } else if (today <= dueDate2) {
              dueDate = dueDate2
            } else {
              dueDate = dueDate2
            }
          }
          break
        }
        
        case 'from_incorporation':
          dueDate = addDays(
            profile.incorporationDate, 
            form.due_days || 180
          )
          break
        
        default:
          dueDate = addMonths(today, 3)
      }
    }

    // Calculate fees
    const daysRemaining = daysFromToday(dueDate)
    const daysOverdue = Math.max(0, -daysRemaining)

    const normalFee = getNormalFeeForTracker(form.form_code, profile.companyType, profile.paidUpCapital)
    const currentPenalty = calculateLateFeeForTracker(
      form.form_code,
      daysOverdue,
      normalFee,
      profile.turnover,
      form.flat_late_fee
    )

    // CCFS calculation
    const ccfsActive = 
      form.ccfs_eligible && ccfsStillActive
    const ccfsPenalty = ccfsActive
      ? Math.ceil(
          currentPenalty * 
          (1 - (form.ccfs_waiver_percent / 100))
        )
      : currentPenalty
    const ccfsSavings = currentPenalty - ccfsPenalty

    deadlines.push({
      id: form.form_code.toLowerCase()
            .replace(/[^a-z0-9]/g, '-'),
      formName: form.form_code,
      description: `${form.form_name} — ${fy.label}`,
      dueDate,
      daysRemaining,
      status: !specialApplicable 
        ? 'not-applicable'
        : daysRemaining < 0 ? 'overdue'
        : daysRemaining <= 30 ? 'due-soon'
        : 'upcoming',
      normalFee,
      lateFeePerDay: ['MGT-7', 'MGT-7A', 'AOC-4', 'AOC-4 CFS', 'AOC-4 XBRL'].includes(form.form_code) ? 100 : 0,
      currentPenalty,
      ccfsEligible: form.ccfs_eligible && ccfsStillActive,
      ccfsPenalty,
      ccfsSavings,
      legalSection: form.legal_section,
      moreInfoUrl: form.more_info_url || 
        '/tools/fee-calculator',
      howToFile: form.how_to_file || 
        'MCA V3 Portal',
      priority: form.priority as any,
      isApplicable: specialApplicable,
      notApplicableReason: notApplicableReason || 
        undefined,
    })
  }

  // Sort: overdue → due-soon → upcoming → N/A
  return deadlines.sort((a, b) => {
    const order = { 
      overdue: 0, 'due-soon': 1, 
      upcoming: 2, 'not-applicable': 3 
    }
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status]
    }
    return a.daysRemaining - b.daysRemaining
  })
}
