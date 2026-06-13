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

  const deadlines: DeadlineItem[] = []

  for (const form of forms) {
    
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
    } else if (profile.companyType === 'opc' && form.form_code === 'MGT-7A') {
      dueDate = addDays(fy.end, 240)
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

    let currentPenalty = 0
    if (daysOverdue > form.grace_period_days) {
      if (form.flat_late_fee) {
        currentPenalty = form.flat_late_fee
      } else {
        const billableDays = 
          daysOverdue - form.grace_period_days
        currentPenalty = billableDays * 
          form.additional_fee_per_day
        if (form.max_additional_fee) {
          currentPenalty = Math.min(
            currentPenalty, 
            form.max_additional_fee
          )
        }
      }
    }

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
      normalFee: form.normal_govt_fee,
      lateFeePerDay: form.additional_fee_per_day,
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
