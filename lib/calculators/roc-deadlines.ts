import { calculateMCAFee } from '../calculatorUtils';

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
  hasOfficeChange?: boolean
  hasDirectorChange?: boolean
  hasShareAllotment?: boolean
  hasCapitalChange?: boolean
  hasAuditorAppointment?: boolean
  hasAuditorResignation?: boolean
  hasBooksOtherPlace?: boolean
  hasDirectorInterest?: boolean
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
  status: 'overdue' | 'due-soon' | 'upcoming' | 'not-applicable' | 'unconfirmed-due'
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
  
  // Non-MCA forms with zero base fee
  if (['RBI-FLA', 'FORM-3CD', 'ITR-6', 'BOARD-MEETINGS'].includes(code)) {
    return 0;
  }

  // Delegate to core fee engine for all MCA forms
  const res = calculateMCAFee({
    formSlug: formCode.toLowerCase().replace(/ /g, '-'),
    companyType,
    capital,
    delayDays: 0
  });

  return res.baseFee;
}

export function calculateLateFeeForTracker(
  formCode: string,
  daysOverdue: number,
  normalFee: number,
  turnover: number,
  dbFlatFee?: number | null,
  companyType: string = 'private',
  capital: number = 0
): number {
  if (daysOverdue <= 0) return 0;

  const code = formCode.toUpperCase().trim();

  // Non-MCA forms with specific hardcoded late fee logic
  if (code === 'RBI-FLA') return 7500;
  if (code === 'FORM-3CD') return Math.min(Math.round(turnover * 0.005), 150000);
  if (code === 'ITR-6') return 5000;
  if (code === 'BOARD-MEETINGS') return 10000;
  if (code === 'MSME-1') return 0; // Handled by adjudication
  if (code === 'MBP-1') return 0;

  if (dbFlatFee && dbFlatFee > 0) {
    return dbFlatFee;
  }

  // Delegate to core fee engine for MCA forms
  const res = calculateMCAFee({
    formSlug: formCode.toLowerCase().replace(/ /g, '-'),
    companyType,
    capital,
    delayDays: daysOverdue
  });

  return res.lateFee;
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

    // Event-based form triggers
    if (form.form_code === 'INC-22') {
      specialApplicable = isApplicable && !!profile.hasOfficeChange
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if company changed its registered office address'
      }
    }

    if (form.form_code === 'DIR-12') {
      specialApplicable = isApplicable && !!profile.hasDirectorChange
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if company had changes in its Directors or Key Managerial Personnel (KMP)'
      }
    }

    if (form.form_code === 'PAS-3') {
      specialApplicable = isApplicable && !!profile.hasShareAllotment
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if company allotted new shares'
      }
    }

    if (form.form_code === 'SH-7') {
      specialApplicable = isApplicable && !!profile.hasCapitalChange
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if company increased or changed its authorised share capital'
      }
    }

    if (form.form_code === 'ADT-1') {
      specialApplicable = isApplicable && !!profile.hasAuditorAppointment
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if company appointed a statutory auditor'
      }
    }

    if (form.form_code === 'ADT-3') {
      specialApplicable = isApplicable && !!profile.hasAuditorResignation
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if statutory auditor resigned'
      }
    }

    if (form.form_code === 'AOC-5') {
      specialApplicable = isApplicable && !!profile.hasBooksOtherPlace
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if books of accounts are kept at a place other than registered office'
      }
    }

    if (form.form_code === 'MBP-1') {
      specialApplicable = isApplicable && !!profile.hasDirectorInterest
      if (!specialApplicable) {
        notApplicableReason = 'Only applicable if directors disclosed interest in other entities'
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
      form.flat_late_fee,
      profile.companyType,
      profile.paidUpCapital
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
      overdue: 0, 'unconfirmed-due': 1, 'due-soon': 2, 
      upcoming: 3, 'not-applicable': 4 
    }
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status]
    }
    return a.daysRemaining - b.daysRemaining
  })
}
