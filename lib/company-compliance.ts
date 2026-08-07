import { CompanyMaster, ComplianceFlag } from '@/types'

export function calculateCompanyComplianceFlags(company: CompanyMaster): ComplianceFlag[] {
  const flags: ComplianceFlag[] = []
  const freshnessDisclaimer = `Based on last available MCA public record as of ${company.last_synced_at ? new Date(company.last_synced_at).toLocaleDateString('en-IN') : 'recent sync'}. Not a substitute for professional verification.`

  // 1. Status Flag
  const statusRaw = (company.company_status || 'Active').trim().toLowerCase()
  let statusType: 'ok' | 'flag' | 'info' | 'unknown' = 'ok'
  let statusDetail = 'Company is currently registered as ACTIVE in MCA records.'

  if (statusRaw.includes('struck') || statusRaw.includes('dissolved') || statusRaw.includes('removed')) {
    statusType = 'flag'
    statusDetail = 'CRITICAL: Company status is STRUCK OFF / DISSOLVED. No business operations allowed.'
  } else if (statusRaw.includes('dormant')) {
    statusType = 'info'
    statusDetail = 'Company is registered as DORMANT under Section 455 of the Companies Act, 2013.'
  } else if (statusRaw.includes('liquid') || statusRaw.includes('winding')) {
    statusType = 'flag'
    statusDetail = 'WARNING: Company is UNDER LIQUIDATION / WINDING UP proceedings.'
  }

  flags.push({
    rule_id: 'STATUS_CHECK',
    category: 'STATUS',
    label: 'Statutory Registration Status',
    status: statusType,
    detail: statusDetail,
    legal_section: 'Section 248 & 252, Companies Act 2013',
    disclaimer: freshnessDisclaimer,
  })

  // 2. AGM Due Date Logic
  const regDate = company.date_of_registration ? new Date(company.date_of_registration) : null
  const currentYear = new Date().getFullYear()

  let agmDetail = ''
  let agmStatus: 'ok' | 'flag' | 'info' = 'ok'

  if (regDate) {
    const regYear = regDate.getFullYear()
    if (regYear === currentYear || regYear === currentYear - 1) {
      // First AGM rule: within 9 months from closing of first financial year
      agmDetail = `First AGM Due: Within 9 months from the end of the first financial year (by 31st December ${regYear + 1}).`
      agmStatus = 'info'
    } else {
      // Subsequent AGM: within 6 months from closing of financial year (30th September)
      agmDetail = `Annual AGM Deadline: 30th September ${currentYear} (within 6 months from end of FY 31-Mar-${currentYear}).`
      agmStatus = 'ok'
    }
  } else {
    agmDetail = `Standard Annual AGM Deadline: 30th September ${currentYear} (within 6 months of FY end).`
  }

  flags.push({
    rule_id: 'AGM_DUE_DATE',
    category: 'AGM',
    label: 'Annual General Meeting (AGM) Compliance',
    status: agmStatus,
    detail: agmDetail,
    legal_section: 'Section 96(1), Companies Act 2013',
    disclaimer: freshnessDisclaimer,
  })

  // 3. Board Meeting Maximum Gap Rule Flag
  flags.push({
    rule_id: 'BOARD_MEETING_GAP',
    category: 'BOARD_MEETING',
    label: 'Board Meeting Gap Limit (120 Days)',
    status: 'info',
    detail: `Minimum 4 board meetings required per calendar year. Maximum permissible gap between two consecutive meetings is 120 days.`,
    legal_section: 'Section 173(1), Companies Act 2013',
    disclaimer: freshnessDisclaimer,
  })

  // 4. DIR-3 KYC Universal Deadline Flag
  flags.push({
    rule_id: 'DIR3_KYC_UNIVERSAL',
    category: 'DIR3_KYC',
    label: 'Director DIR-3 KYC Annual Filing',
    status: 'flag',
    detail: `Universal annual deadline for DIR-3 KYC for all directors with active DIN is 30th September ${currentYear}. Late fee of ₹5,000 applies thereafter per DIN.`,
    legal_section: 'Rule 12A, Companies (Appointment and Qualification of Directors) Rules, 2014',
    disclaimer: freshnessDisclaimer,
  })

  // 5. Small Company Eligibility Flag
  const paidUp = company.paid_up_capital || 0
  const smallCapThreshold = 40000000 // ₹4 Crore (Current MCA Notification limit; statutory ceiling under Sec 2(85) is up to ₹10 Cr capital & ₹100 Cr turnover)
  const cinCode = (company.cin || '').toUpperCase()
  const isPublic = cinCode.startsWith('L') || cinCode.includes('PLC') || (company.company_class || '').toLowerCase() === 'public'

  let smallCompStatus: 'ok' | 'info' | 'flag' = 'info'
  let smallCompDetail = ''

  if (isPublic) {
    smallCompDetail = 'INELIGIBLE (Public Company): Section 2(85) of Companies Act 2013 strictly excludes Public Companies from Small Company status regardless of capital or turnover.'
    smallCompStatus = 'flag'
  } else if (paidUp <= smallCapThreshold) {
    const paidUpCr = (paidUp / 10000000).toFixed(2)
    smallCompDetail = `Eligible for Small Company privileges (Paid-Up Capital ₹${paidUpCr} Cr ≤ ₹4.00 Cr MCA notified limit; statutory ceiling under Sec 2(85) is up to ₹10 Cr capital & ₹100 Cr turnover). Excludes holding/subsidiary/Section 8 companies.`
    smallCompStatus = 'ok'
  } else {
    const paidUpCr = (paidUp / 10000000).toFixed(2)
    smallCompDetail = `Exceeds Small Company Paid-Up Capital cap (Paid-up capital ₹${paidUpCr} Cr > ₹4.00 Cr threshold; statutory ceiling under Sec 2(85) is up to ₹10 Cr capital & ₹100 Cr turnover). Full corporate compliance regime applies.`
    smallCompStatus = 'info'
  }

  flags.push({
    rule_id: 'SMALL_COMPANY_ELIGIBILITY',
    category: 'SMALL_COMPANY',
    label: 'Small Company Status Assessment',
    status: smallCompStatus,
    detail: smallCompDetail,
    legal_section: 'Section 2(85), Companies Act 2013 read with Companies (Specification of definitions details) Rules',
    disclaimer: freshnessDisclaimer,
  })

  return flags
}
