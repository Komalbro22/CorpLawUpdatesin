import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Packer,
  HeadingLevel,
} from 'docx'
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { safeTextRuns, cleanText } from './docx-utils'

// ─── Document Presets & Employment Types ─────────────────────────────────────
export type EmploymentType =
  | 'permanent_full_time'
  | 'fixed_term'
  | 'probationary'
  | 'remote_wfh'
  | 'executive'
  | 'service_commitment'

export type WorkMode = 'in_office' | 'hybrid' | 'fully_remote'

export interface SalaryBreakdown {
  basicMonthly: number
  hraMonthly: number
  specialAllowanceMonthly: number
  pfEmployerMonthly: number
  statutoryBonusMonthly: number
  otherAllowancesMonthly: number
  grossMonthly: number
  annualCtc: number
  variablePayAnnual?: number
}

export interface EmploymentAgreementFormData {
  // Document Profile
  presetType: EmploymentType
  executionDate: string // YYYY-MM-DD
  executionPlace: string // e.g. "Bengaluru, Karnataka"
  state: string // e.g. "karnataka", "maharashtra", "delhi"

  // Employer Profile
  employerName: string
  employerEntityType: string // "Private Limited Company", "Public Limited Company", "LLP", "Partnership Firm", "Sole Proprietorship"
  employerRegistrationNumber?: string // CIN / LLPIN / Registration No.
  employerRegisteredAddress: string
  employerWorkplaceAddress: string
  signatoryName: string
  signatoryDesignation: string

  // Employee Profile
  employeeName: string
  employeeFatherOrSpouseName?: string
  employeeResidentialAddress: string
  employeePan?: string
  employeeEmail?: string
  employeePhone?: string

  // Position & Role
  designation: string
  department: string
  reportingManagerDesignation: string
  joiningDate: string // YYYY-MM-DD
  workMode: WorkMode
  workLocationCity: string

  // Probation & Confirmation
  hasProbation: boolean
  probationMonths: number // e.g. 3 or 6
  probationNoticeDays: number // e.g. 15

  // Fixed Term Specifics (if applicable)
  isFixedTerm: boolean
  fixedTermDurationMonths?: number // e.g. 12, 24, 36
  fixedTermEndDate?: string

  // Compensation & Benefits
  currency: string // INR
  annualCtc: number
  monthlyGross: number
  salaryStructure: SalaryBreakdown
  paymentDayOfMonth: number // e.g. 7 or 10
  probationSalary?: number

  // Working Hours & Schedule
  workHoursPerDay: number // e.g. 8 or 9
  workDaysPerWeek: number // e.g. 5 or 6
  weeklyOffDay: string // e.g. "Sunday" or "Saturday and Sunday"

  // Notice Period & Separation
  noticePeriodDays: number // e.g. 30, 60, 90
  noticePayInLieuPermitted: boolean

  // Restrictive Covenants & Training Bond
  hasTrainingBond: boolean
  bondDurationMonths?: number // e.g. 12 or 24
  trainingCostAmount?: number // Liquidated damages pre-estimate
  trainingSpecialityDescription?: string

  nonSolicitMonths: number // e.g. 12 or 24
  includeNonCompeteCaution: boolean

  // Assets & IT
  providedAssets: string[] // e.g. ["Company Laptop", "Corporate Email Account", "Security Key"]
  customClauses?: { title: string; content: string }[]
}

// ─── State Stamp Duty Schedule for Employment Agreements ─────────────────────
// Under Article 5 ("Agreement or Memorandum of Agreement") of State Stamp Acts
export interface StateStampRule {
  stateName: string
  articleRef: string
  stampDutyAmount: number
  stampType: string
  eStampPortal: string
  legalNote: string
}

export const STATE_STAMP_SCHEDULE: Record<string, StateStampRule> = {
  maharashtra: {
    stateName: 'Maharashtra',
    articleRef: 'Article 5(h)(B), Maharashtra Stamp Act, 1958',
    stampDutyAmount: 500,
    stampType: 'Non-Judicial Stamp Paper or e-SBTR / GRAS',
    eStampPortal: 'https://gras.mahakosh.gov.in',
    legalNote:
      'In Maharashtra, agreements not otherwise provided for attract ₹500 stamp duty under Article 5(h)(B). Can be paid via physical stamp paper, franking, or electronic GRAS / e-SBTR challan.',
  },
  delhi: {
    stateName: 'Delhi (NCT)',
    articleRef: 'Article 5(c), Indian Stamp Act, 1899 (Delhi Schedule)',
    stampDutyAmount: 100,
    stampType: 'SHCIL e-Stamp Paper',
    eStampPortal: 'https://www.shcilestamp.com',
    legalNote:
      'Delhi requires mandatory e-stamping via Stock Holding Corporation of India (SHCIL). The standard rate for employment/service contracts under Article 5(c) is ₹50 to ₹100.',
  },
  karnataka: {
    stateName: 'Karnataka',
    articleRef: 'Article 5(j), Karnataka Stamp Act, 1957',
    stampDutyAmount: 200,
    stampType: 'Kaveri 2.0 / SHCIL e-Stamp Paper',
    eStampPortal: 'https://kaveri.karnataka.gov.in',
    legalNote:
      'Karnataka mandates e-stamping under Article 5(j) for general agreements. Standard duty is ₹200. Payable through Kaveri 2.0 or authorized SHCIL centres.',
  },
  tamil_nadu: {
    stateName: 'Tamil Nadu',
    articleRef: 'Article 5(j), Indian Stamp Act, 1899 (Tamil Nadu Schedule)',
    stampDutyAmount: 100,
    stampType: 'SHCIL e-Stamp or Non-Judicial Stamp Paper',
    eStampPortal: 'https://www.shcilestamp.com',
    legalNote:
      'Under Tamil Nadu Schedule Article 5(j), general employment agreements require ₹100 non-judicial stamp duty.',
  },
  telangana: {
    stateName: 'Telangana',
    articleRef: 'Article 6, Indian Stamp Act, 1899 (Telangana Schedule)',
    stampDutyAmount: 100,
    stampType: 'IGRS Telangana e-Stamp / Non-Judicial Paper',
    eStampPortal: 'https://registration.telangana.gov.in',
    legalNote:
      'Telangana specifies ₹100 non-judicial stamp duty for agreements relating to employment/service not otherwise provided for.',
  },
  uttar_pradesh: {
    stateName: 'Uttar Pradesh',
    articleRef: 'Article 5(c), Indian Stamp Act, 1899 (UP Schedule)',
    stampDutyAmount: 100,
    stampType: 'IGRS UP e-Stamping / SHCIL',
    eStampPortal: 'https://igrsup.gov.in',
    legalNote:
      'Under the UP Stamp Schedule, agreements for personal service or employment attract ₹100 non-judicial stamp duty.',
  },
  west_bengal: {
    stateName: 'West Bengal',
    articleRef: 'Article 5(c), Indian Stamp Act, 1899 (WB Schedule)',
    stampDutyAmount: 50,
    stampType: 'GRIPS West Bengal / SHCIL',
    eStampPortal: 'https://wbfin.wb.gov.in/GRIPS',
    legalNote:
      'West Bengal specifies ₹50 non-judicial stamp duty for miscellaneous agreements under Article 5(c).',
  },
  gujarat: {
    stateName: 'Gujarat',
    articleRef: 'Article 5(h), Gujarat Stamp Act, 1958',
    stampDutyAmount: 300,
    stampType: 'SHCIL Gujarat e-Stamping',
    eStampPortal: 'https://www.shcilestamp.com',
    legalNote:
      'Under the Gujarat Stamp Act, general agreements require ₹300 stamp duty. E-stamping via SHCIL is widespread across Gujarat.',
  },
  haryana: {
    stateName: 'Haryana',
    articleRef: 'Article 5(c), Indian Stamp Act, 1899 (Haryana Schedule)',
    stampDutyAmount: 100,
    stampType: 'e-GRAS Haryana / SHCIL',
    eStampPortal: 'https://egrashry.nic.in',
    legalNote:
      'Haryana specifies ₹100 non-judicial stamp duty for general employment agreements, generated via e-GRAS Haryana.',
  },
  rajasthan: {
    stateName: 'Rajasthan',
    articleRef: 'Article 5(c), Rajasthan Stamp Act, 1998',
    stampDutyAmount: 500,
    stampType: 'e-GRAS Rajasthan / SHCIL',
    eStampPortal: 'https://gras.raj.nic.in',
    legalNote:
      'Rajasthan levies stamp duty plus surcharges on agreements under Article 5(c), commonly executed on ₹500 non-judicial stamp paper.',
  },
}

// ─── Default Sample Data ─────────────────────────────────────────────────────
export const DEFAULT_SAMPLE_EMPLOYMENT_DATA: EmploymentAgreementFormData = {
  presetType: 'permanent_full_time',
  executionDate: '2026-10-01',
  executionPlace: 'Bengaluru, Karnataka',
  state: 'karnataka',

  employerName: 'Apex Infotech Solutions Private Limited',
  employerEntityType: 'Private Limited Company',
  employerRegistrationNumber: 'U72200KA2022PTC158942',
  employerRegisteredAddress:
    'Level 4, Prestige Cyber Towers, Outer Ring Road, Bellandur, Bengaluru - 560103, Karnataka, India',
  employerWorkplaceAddress:
    'Level 4, Prestige Cyber Towers, Outer Ring Road, Bellandur, Bengaluru - 560103, Karnataka, India',
  signatoryName: 'Vikram Malhotra',
  signatoryDesignation: 'Director & Head of Human Resources',

  employeeName: 'Rahul Verma',
  employeeFatherOrSpouseName: 'Suresh Verma',
  employeeResidentialAddress:
    'Flat No. 302, Green Glen Residency, 24th Main, HSR Layout Sector 2, Bengaluru - 560102, Karnataka, India',
  employeePan: 'ABCDE1234F',
  employeeEmail: 'rahul.verma@example.com',
  employeePhone: '+91 98765 43210',

  designation: 'Senior Software Engineer',
  department: 'Core Platform Engineering',
  reportingManagerDesignation: 'VP of Technology & Engineering',
  joiningDate: '2026-10-05',
  workMode: 'hybrid',
  workLocationCity: 'Bengaluru',

  hasProbation: true,
  probationMonths: 3,
  probationNoticeDays: 15,

  isFixedTerm: false,

  currency: 'INR',
  annualCtc: 1200000,
  monthlyGross: 100000,
  salaryStructure: {
    basicMonthly: 50000,
    hraMonthly: 20000,
    specialAllowanceMonthly: 24000,
    pfEmployerMonthly: 6000,
    statutoryBonusMonthly: 0,
    otherAllowancesMonthly: 0,
    grossMonthly: 94000,
    annualCtc: 1200000,
    variablePayAnnual: 0,
  },
  paymentDayOfMonth: 7,

  workHoursPerDay: 8,
  workDaysPerWeek: 5,
  weeklyOffDay: 'Saturday and Sunday',

  noticePeriodDays: 30,
  noticePayInLieuPermitted: true,

  hasTrainingBond: false,
  nonSolicitMonths: 12,
  includeNonCompeteCaution: true,

  providedAssets: [
    'Company-issued Apple MacBook Pro (Asset Tag: APX-LAP-2026-88)',
    'Corporate Email Account & Cloud Access Credentials',
    'Building Access Smart Identity Card',
  ],
}

// ─── Presets ─────────────────────────────────────────────────────────────────
export interface EmploymentPreset {
  id: EmploymentType
  label: string
  subtitle: string
  badgeText: string
  description: string
  defaults: Partial<EmploymentAgreementFormData>
}

export const EMPLOYMENT_PRESETS: Record<EmploymentType, EmploymentPreset> = {
  permanent_full_time: {
    id: 'permanent_full_time',
    label: 'Standard Permanent Employment Agreement',
    subtitle: 'Regular Full-Time Corporate / IT / Professional Staff',
    badgeText: 'Most Popular',
    description:
      'Standard permanent contract with confirmation, monthly payroll breakdown, 30-60 days notice, IP assignment, and confidentiality protection.',
    defaults: {
      presetType: 'permanent_full_time',
      hasProbation: true,
      probationMonths: 3,
      probationNoticeDays: 15,
      isFixedTerm: false,
      noticePeriodDays: 30,
      hasTrainingBond: false,
      workMode: 'hybrid',
    },
  },
  remote_wfh: {
    id: 'remote_wfh',
    label: 'Remote / Work-From-Home Employment Agreement',
    subtitle: 'Fully Distributed & Work-From-Anywhere Roles',
    badgeText: 'Remote First',
    description:
      'Includes specialized remote work clauses: home office security, encrypted network access, company asset preservation, remote data privacy under DPDP Act 2023, and virtual attendance norms.',
    defaults: {
      presetType: 'remote_wfh',
      workMode: 'fully_remote',
      hasProbation: true,
      probationMonths: 3,
      probationNoticeDays: 15,
      isFixedTerm: false,
      noticePeriodDays: 30,
      hasTrainingBond: false,
    },
  },
  fixed_term: {
    id: 'fixed_term',
    label: 'Fixed-Term Employment Agreement (FTE)',
    subtitle: 'Specific Term (1-3 Years) under Industrial Relations Code, 2020',
    badgeText: 'IR Code 2020 Compliant',
    description:
      'Compliant with Section 2(o) of the Industrial Relations Code, 2020. Features equal statutory wages, pro-rata gratuity under Section 53 of Code on Social Security (after 1 year), and automatic expiry without retrenchment liability.',
    defaults: {
      presetType: 'fixed_term',
      isFixedTerm: true,
      fixedTermDurationMonths: 12,
      hasProbation: false,
      probationMonths: 0,
      noticePeriodDays: 30,
      hasTrainingBond: false,
    },
  },
  executive: {
    id: 'executive',
    label: 'Senior Executive / Leadership Employment Agreement',
    subtitle: 'CXO, VP, Department Head & Senior Manager Roles',
    badgeText: 'Executive Tier',
    description:
      'Designed for senior managerial personnel. Includes extensive non-solicitation, garden leave provisions, fiduciary duties under Companies Act, key performance goals, and extended 90 days notice.',
    defaults: {
      presetType: 'executive',
      hasProbation: false,
      probationMonths: 0,
      isFixedTerm: false,
      noticePeriodDays: 90,
      nonSolicitMonths: 24,
      hasTrainingBond: false,
    },
  },
  probationary: {
    id: 'probationary',
    label: 'Probationary / Trainee Employment Agreement',
    subtitle: 'New Hires Subject to Structured Evaluation & Confirmation',
    badgeText: 'Probation First',
    description:
      'Defines 3 to 6 months evaluation period with clear performance appraisal standards, shorter 15 days exit notice during probation, and automatic confirmation conditions.',
    defaults: {
      presetType: 'probationary',
      hasProbation: true,
      probationMonths: 6,
      probationNoticeDays: 15,
      noticePeriodDays: 30,
      isFixedTerm: false,
      hasTrainingBond: false,
    },
  },
  service_commitment: {
    id: 'service_commitment',
    label: 'Employment Agreement with Training Cost Commitment',
    subtitle: 'Lawful Training Cost Recovery under Section 74, Indian Contract Act',
    badgeText: 'Section 74 Compliant',
    description:
      'Carefully drafted under Section 74 of the Indian Contract Act, 1872. Recovers ONLY actual, reasonable, specialized training expenditure (liquidated damages pre-estimate) rather than an illegal restraint of trade under Section 27.',
    defaults: {
      presetType: 'service_commitment',
      hasTrainingBond: true,
      bondDurationMonths: 18,
      trainingCostAmount: 150000,
      trainingSpecialityDescription:
        'Advanced Enterprise Cloud Architecture, Specialized Security Certifications, and Proprietary Systems Onboarding',
      hasProbation: true,
      probationMonths: 3,
      noticePeriodDays: 30,
    },
  },
}

// ─── Number Formatters & Helpers ─────────────────────────────────────────────
export function formatInr(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0'
  return '₹' + Number(val).toLocaleString('en-IN')
}

export function numberToWordsInr(amount: number): string {
  if (!amount || isNaN(amount)) return 'Zero Rupees'
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ]
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convertTwoDigits(num: number): string {
    if (num < 10) return units[num]
    if (num >= 10 && num < 20) return teens[num - 10]
    const u = num % 10
    const t = Math.floor(num / 10)
    return tens[t] + (u > 0 ? ' ' + units[u] : '')
  }

  function convertThreeDigits(num: number): string {
    const h = Math.floor(num / 100)
    const rest = num % 100
    let res = ''
    if (h > 0) res += units[h] + ' Hundred'
    if (rest > 0) {
      if (res.length > 0) res += ' and '
      res += convertTwoDigits(rest)
    }
    return res
  }

  let n = Math.floor(amount)
  if (n === 0) return 'Zero Rupees'

  const crore = Math.floor(n / 10000000)
  n %= 10000000
  const lakh = Math.floor(n / 100000)
  n %= 100000
  const thousand = Math.floor(n / 1000)
  n %= 1000
  const hundredAndBelow = n

  const parts: string[] = []
  if (crore > 0) parts.push(convertTwoDigits(crore) + ' Crore')
  if (lakh > 0) parts.push(convertTwoDigits(lakh) + ' Lakh')
  if (thousand > 0) parts.push(convertTwoDigits(thousand) + ' Thousand')
  if (hundredAndBelow > 0) parts.push(convertThreeDigits(hundredAndBelow))

  return parts.join(' ') + ' Rupees Only'
}

/**
 * Validates Code on Wages 2019 "50% rule":
 * Basic + DA must constitute at least 50% of the total monthly compensation to ensure
 * statutory compliance for PF and Gratuity.
 */
export function checkWageFiftyPercentRule(breakdown: SalaryBreakdown): {
  isCompliant: boolean
  basicPercentage: number
  recommendedBasic: number
  message: string
} {
  const total = breakdown.grossMonthly || 1
  const basic = breakdown.basicMonthly || 0
  const pct = Math.round((basic / total) * 100)
  const recommended = Math.round(total * 0.5)

  if (pct >= 50) {
    return {
      isCompliant: true,
      basicPercentage: pct,
      recommendedBasic: recommended,
      message: `Compliant with Code on Wages, 2019: Basic constitutes ${pct}% of gross monthly pay (statutory minimum is 50%).`,
    }
  }

  return {
    isCompliant: false,
    basicPercentage: pct,
    recommendedBasic: recommended,
    message: `Statutory Warning under Code on Wages, 2019: Basic salary is currently ${pct}% of monthly remuneration. If non-basic allowances exceed 50%, the surplus will be deemed wages for PF, ESI, and gratuity calculations. Consider setting Basic to at least ${formatInr(recommended)}/month.`,
  }
}

// ─── Markdown Generator ──────────────────────────────────────────────────────
export function generateEmploymentAgreementMarkdown(data: EmploymentAgreementFormData): string {
  const d = data
  const stampRule = STATE_STAMP_SCHEDULE[d.state] || STATE_STAMP_SCHEDULE.karnataka
  const wageRule = checkWageFiftyPercentRule(d.salaryStructure)
  const isRemote = d.workMode === 'fully_remote'
  const isHybrid = d.workMode === 'hybrid'

  let doc = ''

  doc += `# EMPLOYMENT AGREEMENT\n\n`
  doc += `> **STATUTORY JURISDICTION & STAMP DUTY NOTICE:** This Agreement is executed in accordance with the Indian Contract Act, 1872, the Occupational Safety, Health and Working Conditions Code, 2020, and the Code on Wages, 2019. Under ${stampRule.articleRef}, applicable in the State of ${stampRule.stateName}, this instrument attracts non-judicial stamp duty of **${formatInr(stampRule.stampDutyAmount)}** payable via ${stampRule.stampType}.\n\n`

  doc += `---\n\n`

  doc += `This **EMPLOYMENT AGREEMENT** ("**Agreement**") is made and entered into on this **${d.executionDate || '[Date]'}** ("**Effective Date**"), at **${d.executionPlace || '[Execution Place]'}**, by and between:\n\n`

  doc += `**1. ${d.employerName}**, a ${d.employerEntityType}${d.employerRegistrationNumber ? ` bearing Registration/CIN No. **${d.employerRegistrationNumber}**` : ''}, having its registered office at:\n`
  doc += `> ${d.employerRegisteredAddress}\n`
  doc += `and principal place of business at ${d.employerWorkplaceAddress}, represented herein by its authorized representative, **${d.signatoryName}**, ${d.signatoryDesignation} (hereinafter referred to as the "**Company**" or "**Employer**", which expression shall, unless repugnant to the context, include its legal successors, affiliates, and permitted assigns) of the **FIRST PART**;\n\n`

  doc += `**AND**\n\n`

  doc += `**2. ${d.employeeName}**${d.employeeFatherOrSpouseName ? `, son/daughter/spouse of **${d.employeeFatherOrSpouseName}**` : ''}, residing at:\n`
  doc += `> ${d.employeeResidentialAddress}\n`
  doc += `having PAN: **${d.employeePan || '[PAN Required]'}**${d.employeeEmail ? `, Email: **${d.employeeEmail}**` : ''}${d.employeePhone ? `, Mobile: **${d.employeePhone}**` : ''} (hereinafter referred to as the "**Employee**", which expression shall, unless repugnant to the context, include their heirs, executors, and legal representatives) of the **SECOND PART**.\n\n`

  doc += `The Company and the Employee are hereinafter individually referred to as a "**Party**" and collectively as the "**Parties**".\n\n`

  doc += `### RECITALS\n\n`
  doc += `**WHEREAS:**\n`
  doc += `A. The Company is engaged in the business of commercial operations, software technology, professional consultancy, and enterprise services in India.\n`
  doc += `B. The Company requires the services of a qualified and competent professional to undertake the responsibilities of **${d.designation}** in its **${d.department}** department.\n`
  doc += `C. The Employee has represented that they possess the necessary skills, qualifications, professional experience, and legal competence to perform the duties required of the said position.\n`
  doc += `D. Relying upon the representations and warranties of the Employee, the Company has agreed to appoint the Employee, and the Employee has agreed to accept employment with the Company, upon the terms, conditions, and covenants set forth herein.\n\n`

  doc += `**NOW, THEREFORE**, in consideration of the mutual promises, covenants, and undertakings contained herein, the Parties agree as follows:\n\n`

  // ── Clause 1: Appointment & Title
  doc += `### 1. APPOINTMENT, DESIGNATION & COMMENCEMENT\n\n`
  doc += `1.1 **Appointment:** The Company hereby appoints the Employee, and the Employee hereby accepts employment with the Company, in the capacity of **${d.designation}** in the **${d.department}** department.\n\n`
  doc += `1.2 **Commencement Date:** The employment shall formally commence on **${d.joiningDate || '[Joining Date]'}** ("**Joining Date**"). The Employee’s continuous service with the Company shall be computed from this Joining Date.\n\n`
  doc += `1.3 **Reporting Structure:** The Employee shall initially report directly to the **${d.reportingManagerDesignation || 'Department Head'}** or such other designated officer as the Company may notify from time to time.\n\n`
  doc += `1.4 **Statutory Letter of Appointment:** This Agreement incorporates the mandatory particulars prescribed under **Section 6(1)(f) of the Occupational Safety, Health and Working Conditions Code, 2020** and the Central Rules framed thereunder, ensuring full statutory transparency regarding terms of service.\n\n`

  // ── Clause 2: Place of Work & Mode
  doc += `### 2. PLACE OF WORK & WORK MODE\n\n`
  if (isRemote) {
    doc += `2.1 **Remote Working Arrangement:** The Employee is engaged on a **Fully Remote (Work-From-Home)** basis. The Employee’s designated home workstation at ${d.employeeResidentialAddress} shall be considered their primary base of work. The Employee shall ensure a dedicated, ergonomic, private, and secure workspace equipped with high-speed internet and uninterrupted power supply.\n\n`
    doc += `2.2 **Information Security in Remote Environment:** In accordance with the **Digital Personal Data Protection Act, 2023 (DPDP Act)** and the Information Technology Act, 2000, the Employee shall strictly prevent family members, co-habitants, or third parties from accessing or viewing Company screens, confidential data, or customer records.\n\n`
    doc += `2.3 **Office Visits:** The Employee agrees to travel to the Company’s office in **${d.workLocationCity}** or client sites for quarterly reviews, project kickoffs, or company-wide summits upon reasonable advance written notice, with approved travel expenses reimbursed by the Company.\n\n`
  } else if (isHybrid) {
    doc += `2.1 **Hybrid Working Arrangement:** The Employee shall work on a **Hybrid Model**, alternating between the Company’s workplace in **${d.workLocationCity}** and remote home working, in accordance with the roster notified by the Department Head. Core operational days require mandatory physical presence at the establishment.\n\n`
    doc += `2.2 **Mobility & Transferability:** The Company reserves the right, upon reasonable written notice and business exigency, to transfer, second, or assign the Employee to any other branch, subsidiary, affiliate office, or client location within India, without adverse reduction in total remuneration.\n\n`
  } else {
    doc += `2.1 **Primary Workplace:** The Employee’s principal place of work shall be the Company’s establishment situated at **${d.employerWorkplaceAddress}** in **${d.workLocationCity}**.\n\n`
    doc += `2.2 **Transferability:** The Employee may be transferred or seconded to any other office, plant, branch, subsidiary, or client site of the Company anywhere in India, as operational requirements may dictate, subject to reasonable relocation assistance.\n\n`
  }

  // ── Clause 3: Probation & Confirmation / Fixed Term
  if (d.isFixedTerm) {
    doc += `### 3. FIXED-TERM EMPLOYMENT (STATUTORY PARITY & EXPIRY)\n\n`
    doc += `3.1 **Fixed-Term Tenure:** This employment is executed as a **Fixed-Term Employment** contract under **Section 2(o) of the Industrial Relations Code, 2020** for a definite period of **${d.fixedTermDurationMonths || 12} months**, commencing on ${d.joiningDate} and automatically expiring on **${d.fixedTermEndDate || '[End Date]'}**, unless terminated earlier in accordance with this Agreement.\n\n`
    doc += `3.2 **Non-Renewal & Retrenchment Exemption:** Pursuant to Section 2(zh) of the Industrial Relations Code, 2020, the termination of the Employee's service as a result of the non-renewal of the contract on its expiry shall **not** constitute retrenchment, and no retrenchment compensation shall be payable upon natural expiry.\n\n`
    doc += `3.3 **Statutory Benefits Parity:** In accordance with the Code on Social Security, 2020, the Employee shall be entitled to all statutory wages, allowances, medical benefits, and social security on par with a permanent worker doing similar work. Under **Section 53 of the Code on Social Security, 2020**, the Employee shall be eligible for pro-rata gratuity if continuous service equals or exceeds one (1) year.\n\n`
  } else if (d.hasProbation) {
    doc += `### 3. PROBATIONARY PERIOD & CONFIRMATION\n\n`
    doc += `3.1 **Probation Period:** The Employee shall be on probation for an initial period of **${d.probationMonths} months** from the Joining Date. The Company may, at its sole discretion, extend the probationary period by an additional period not exceeding three (3) months if the Employee's performance or conduct is deemed unsatisfactory.\n\n`
    doc += `3.2 **Confirmation:** Confirmation of employment is **not automatic**. The Employee shall be deemed confirmed only upon receipt of a formal written Letter of Confirmation issued by the authorized Human Resources representative.\n\n`
    doc += `3.3 **Termination during Probation:** During probation or any extension thereof, either Party may terminate this Agreement by giving **${d.probationNoticeDays} calendar days'** prior written notice or payment of basic salary in lieu thereof, without assigning any reason.\n\n`
  } else {
    doc += `### 3. REGULAR CONFIRMED STATUS\n\n`
    doc += `3.1 **Regular Employment:** The Employee is appointed directly as a regular confirmed employee from the Joining Date. Terms of separation, notice period, and performance evaluation shall be governed strictly by the provisions of Clause 13 herein.\n\n`
  }

  // ── Clause 4: Hours of Work, Rest & Attendance
  doc += `### 4. WORKING HOURS, WEEKLY REST & ATTENDANCE\n\n`
  doc += `4.1 **Standard Working Schedule:** The Employee’s standard working schedule shall comprise **${d.workHoursPerDay} hours per day**, **${d.workDaysPerWeek} days per week**, excluding meal breaks, not exceeding forty-eight (48) total weekly hours, in strict compliance with the **Occupational Safety, Health and Working Conditions Code, 2020**.\n\n`
  doc += `4.2 **Weekly Rest Day:** The Employee shall be entitled to at least one scheduled weekly day of rest, being **${d.weeklyOffDay}**.\n\n`
  doc += `4.3 **Overtime:** For non-exempt operational staff, overtime work beyond standard daily or weekly limits shall be compensated at twice the ordinary rate of wages in accordance with the OSH Code. Executive and managerial roles are salaried positions wherein compensation encompasses occasional project-driven extended hours without separate overtime remuneration.\n\n`

  // ── Clause 5: Compensation & Salary Structure
  doc += `### 5. REMUNERATION, ALLOWANCES & STATUTORY WAGES\n\n`
  doc += `5.1 **Cost to Company (CTC):** The Employee shall receive an annual Cost to Company (CTC) of **${formatInr(d.annualCtc)}** (${numberToWordsInr(d.annualCtc)}), payable in monthly installments subject to statutory deductions under Indian tax and labour laws.\n\n`
  doc += `5.2 **Monthly Gross Salary:** The monthly gross salary shall be **${formatInr(d.monthlyGross)}**, itemized in the Salary Structure specified in **Annexure A** hereto.\n\n`
  doc += `5.3 **Wage Definition & Compliance:** In compliance with **Section 2(y) of the Code on Wages, 2019**, the Employee’s Basic Salary is established at **${formatInr(d.salaryStructure.basicMonthly)} per month**, which constitutes **${wageRule.basicPercentage}%** of gross remuneration. The Parties acknowledge that this allocation satisfies the statutory benchmark that basic remuneration shall not fall below 50% of aggregate pay.\n\n`
  doc += `5.4 **Disbursement Date:** Monthly remuneration shall be disbursed electronically into the Employee’s designated Indian bank account on or before the **${d.paymentDayOfMonth}th day** of each succeeding calendar month, accompanied by a statutory itemized electronic pay slip.\n\n`
  doc += `5.5 **Statutory Deductions:** The Company shall make all mandatory statutory deductions at source, including:\n`
  doc += `* Income Tax (TDS) under Section 192 of the Income-tax Act, 1961;\n`
  doc += `* Employee Provident Fund (EPF) contributions under the Code on Social Security, 2020;\n`
  doc += `* Employee State Insurance (ESIC) contributions, wherever applicable under statutory wage ceilings;\n`
  doc += `* Applicable State Professional Tax under the relevant State State Tax on Professions Act.\n\n`

  // ── Clause 6: Statutory Social Security Benefits
  doc += `### 6. STATUTORY BENEFITS & SOCIAL SECURITY\n\n`
  doc += `6.1 **Provident Fund (EPF):** The Employee shall be enrolled in the Employees' Provident Fund Scheme administered by the EPFO. The Company and Employee shall each contribute the statutory percentage of qualifying wages in accordance with the Code on Social Security, 2020.\n\n`
  doc += `6.2 **Gratuity:** Gratuity shall be payable in accordance with Chapter V of the Code on Social Security, 2020 upon continuous service of not less than five (5) years, provided that in the case of Fixed-Term Employment, gratuity shall be payable pro-rata if continuous service equals or exceeds one (1) year.\n\n`
  doc += `6.3 **Maternity & Parental Benefits:** Female employees shall be entitled to twenty-six (26) weeks of fully paid maternity leave, nursing breaks, and crèche access in accordance with the Maternity Benefit provisions of the Code on Social Security, 2020.\n\n`

  // ── Clause 7: Leaves & Holidays
  doc += `### 7. LEAVE ENTITLEMENT & PUBLIC HOLIDAYS\n\n`
  doc += `7.1 **Annual Leave:** The Employee shall be entitled to earned/privilege leaves, casual leaves, and sick leaves in accordance with the Company’s Leave Policy and the applicable State Shops and Establishments Act / OSH Code, accruing at a minimum of one day of paid leave for every twenty (20) days worked.\n\n`
  doc += `7.2 **National & Festival Holidays:** The Employee shall be entitled to paid public holidays, including mandatory national holidays (Republic Day, Independence Day, and Mahatma Gandhi Jayanti) plus state-specific festival holidays as notified annually.\n\n`

  // ── Clause 8: Exclusivity & Moonlighting
  doc += `### 8. EXCLUSIVITY, WHOLE-TIME DEVOTION & NO DUAL EMPLOYMENT\n\n`
  doc += `8.1 **Full-Time Dedication:** The Employee shall devote their whole time, attention, skill, and best efforts exclusively to the business of the Company during business hours.\n\n`
  doc += `8.2 **Prohibition on Dual Employment (Moonlighting):** The Employee shall not, during the term of this Agreement, directly or indirectly engage in, undertake, or accept any other employment, consultancy, directorship, partnership, freelance engagement, advisory position, or commercial enterprise, whether with or without remuneration, without the express prior written consent of the Company's Board of Directors.\n\n`
  doc += `8.3 **Judicial Authority:** This covenant of whole-time service during the subsistence of active employment is legally binding and does not constitute a restraint of trade, as affirmed by the Supreme Court of India in *Niranjan Shankar Golikari v. Century Spinning & Mfg. Co. Ltd.* (AIR 1967 SC 1098).\n\n`

  // ── Clause 9: Confidentiality & Data Protection
  doc += `### 9. CONFIDENTIALITY, TRADE SECRETS & DATA PROTECTION\n\n`
  doc += `9.1 **Proprietary Information Defined:** "**Proprietary Information**" includes all non-public technical, business, software source code, financial, marketing, customer lists, vendor agreements, pricing models, intellectual assets, algorithms, and security credentials disclosed to or accessed by the Employee in the course of employment.\n\n`
  doc += `9.2 **Non-Disclosure Covenant:** The Employee shall hold all Proprietary Information in strict trust and confidence. The Employee shall not publish, disclose, copy, transfer, or exploit any Proprietary Information, directly or indirectly, for personal gain or for the benefit of any third party, both during the term of employment and perpetually following termination.\n\n`
  doc += `9.3 **Data Protection Compliance (DPDP Act, 2023):** The Employee shall process personal data of clients, consumers, and colleagues strictly in compliance with the **Digital Personal Data Protection Act, 2023**. Any unauthorized extraction, downloading, selling, or processing of personal data constitutes gross misconduct and a statutory violation.\n\n`

  // ── Clause 10: Intellectual Property Assignment
  doc += `### 10. INTELLECTUAL PROPERTY & WORK-FOR-HIRE\n\n`
  doc += `10.1 **Work Made for Hire:** Pursuant to **Section 17(c) of the Copyright Act, 1957**, all original literary, dramatic, musical, artistic works, software programs, code bases, databases, designs, documentation, and technical inventions developed, authored, conceived, or reduced to practice by the Employee (either solely or jointly with others) in the course of employment under this contract of service shall belong solely and exclusively to the Company from inception.\n\n`
  doc += `10.2 **Absolute Assignment:** To the extent any intellectual property rights do not automatically vest in the Company by operation of law, the Employee hereby irrevocably, unconditionally, and perpetually assigns to the Company, without further royalty or compensation, all worldwide right, title, and interest in and to such intellectual property, including all patents, copyrights, trademarks, trade secrets, and moral rights (to the maximum extent waivable by law under Section 57 of the Copyright Act, 1957).\n\n`
  doc += `10.3 **Execution of Documents:** The Employee undertakes to execute all assignment deeds, patent applications, and affidavits reasonably requested by the Company to register, protect, and defend its intellectual property in India or foreign jurisdictions.\n\n`

  // ── Clause 11: Company Property & Device Security
  doc += `### 11. COMPANY PROPERTY & INFORMATION TECHNOLOGY ASSETS\n\n`
  doc += `11.1 **Care of Assets:** The Company has entrusted the Employee with specific hardware, credentials, and assets as detailed in **Annexure C** hereto. The Employee shall use such property strictly for authorized business purposes, exercise due care, and comply with all cybersecurity policies.\n\n`
  doc += `11.2 **Inspection & Monitoring:** The Company reserves the right, within lawful limits and for enterprise cybersecurity purposes, to monitor corporate email accounts, cloud traffic, and device configurations on Company-owned hardware.\n\n`
  doc += `11.3 **Immediate Return upon Notice:** Upon receipt of notice of resignation or termination, or upon demand by the Company, the Employee shall immediately surrender all Company hardware, mobile devices, access cards, files, USB drives, and confidential data without retaining any copies, mirrors, or backups.\n\n`

  // ── Clause 12: Restrictive Covenants & Section 27 Caution
  doc += `### 12. RESTRICTIVE COVENANTS & STATUTORY CAUTION\n\n`
  doc += `12.1 **Non-Solicitation of Employees:** The Employee covenants that for a period of **${d.nonSolicitMonths || 12} months** following termination of employment for any reason, they shall not, directly or indirectly, solicit, entice, induce, or encourage any employee, contractor, or officer of the Company to terminate their employment or contract with the Company.\n\n`
  doc += `12.2 **Non-Solicitation of Clients:** For a period of **${d.nonSolicitMonths || 12} months** post-termination, the Employee shall not solicit, canvas, or divert any client, customer, vendor, or commercial partner with whom the Employee had active business dealings during the twelve (12) months preceding separation.\n\n`

  if (d.includeNonCompeteCaution) {
    doc += `12.3 **Statutory Caution regarding Post-Employment Non-Compete (Section 27):**\n`
    doc += `> **MANDATORY LEGAL DISCLOSURE UNDER INDIAN CONTRACT LAW:** Under **Section 27 of the Indian Contract Act, 1872**, every agreement by which anyone is restrained from exercising a lawful profession, trade, or business of any kind is void to that extent. As consistently established by the Supreme Court of India in *Percept D'Mark (India) Pvt. Ltd. v. Zaheer Khan* (2006) 4 SCC 227 and *Superintendence Company of India (P) Ltd. v. Krishan Murgai* (1981) 2 SCC 246, negative covenants that restrict an employee from joining a competitor **after** termination of employment are void and unenforceable in Indian courts. Therefore, this Agreement enforces rigorous **non-solicitation, confidentiality, and trade secret protection**, while advising both Parties that blanket post-employment non-compete prohibitions cannot be legally enforced under Indian jurisprudence.\n\n`
  }

  // ── Clause 13: Training Cost Commitment (if applicable)
  if (d.hasTrainingBond) {
    doc += `### 13. SPECIALIZED TRAINING COMMITMENT & RECOVERY OF COSTS (SECTION 74)\n\n`
    doc += `13.1 **Substantial Investment in Specialized Training:** The Company agrees to sponsor and impart specialized, high-value training to the Employee, comprising: *${d.trainingSpecialityDescription || 'Specialized technical and domain skill development'}*, incurring substantial verifiable direct expenditure on external instructors, course fees, travel, and proprietary training materials.\n\n`
    doc += `13.2 **Service Commitment Period:** In consideration of the Company incurring such direct training expenditure, the Employee voluntarily agrees to serve the Company for a minimum period of **${d.bondDurationMonths || 12} months** following completion of the said training.\n\n`
    doc += `13.3 **Reasonable Pre-Estimate of Liquidated Damages (Section 74):** If the Employee resigns or is terminated for gross misconduct prior to completing the service commitment period, the Employee shall reimburse the Company a reasonable sum of **${formatInr(d.trainingCostAmount || 100000)}** (${numberToWordsInr(d.trainingCostAmount || 100000)}), calculated on a pro-rata basis diminishing with every completed month of service.\n\n`
    doc += `13.4 **Statutory Safeguards under Indian Law:** The Parties expressly agree that this sum represents a genuine, reasonable pre-estimate of direct training losses under **Section 74 of the Indian Contract Act, 1872**, as recognized by the High Courts in *Sicpa India Ltd. v. Manas Pratim Deb* and *Toshniwal Brothers v. Eswarprasad*. This clause does **not** constitute a penalty, does not compel specific performance of personal service, and under no circumstances shall the Company retain original educational certificates or identity cards of the Employee.\n\n`
  }

  // ── Clause 14: Termination & Resignation
  doc += `### 14. TERMINATION OF EMPLOYMENT, RESIGNATION & NOTICE\n\n`
  doc += `14.1 **Termination without Cause:** Following confirmation, either Party may terminate this Agreement without assigning cause by providing **${d.noticePeriodDays} calendar days'** prior written notice to the other Party. ${d.noticePayInLieuPermitted ? 'The Company may, at its sole election, terminate the employment immediately by paying the Employee basic salary in lieu of unserved notice.' : ''}\n\n`
  doc += `14.2 **Termination for Cause (Immediate Dismissal):** The Company may terminate the Employee's employment immediately without notice, notice pay, or severance compensation upon the occurrence of any of the following events of gross misconduct:\n`
  doc += `* Commission of fraud, embezzlement, forgery, dishonesty, or criminal conviction;\n`
  doc += `* Breach of confidentiality, trade secrets, or intellectual property covenants;\n`
  doc += `* Sexual harassment or violation of the Prevention of Sexual Harassment (PoSH) Policy;\n`
  doc += `* Unauthorized absence from work exceeding eight (8) consecutive working days (voluntary abandonment);\n`
  doc += `* Falsification of resume, educational credentials, or prior employment background verification.\n\n`
  doc += `14.3 **Garden Leave:** The Company reserves the right, during any period of notice of resignation, to place the Employee on paid **Garden Leave** for all or part of the notice period, requiring the Employee to remain away from Company premises and refrain from contacting clients.\n\n`

  // ── Clause 15: Dispute Resolution & Governing Law
  doc += `### 15. GOVERNING LAW, JURISDICTION & DISPUTE RESOLUTION\n\n`
  doc += `15.1 **Governing Law:** This Agreement shall be governed by, construed, and enforced in accordance with the substantive laws of the Republic of India.\n\n`
  doc += `15.2 **Jurisdiction:** Subject to the arbitration clause herein, the competent courts at **${d.workLocationCity}** shall have exclusive jurisdiction over all claims, suits, or disputes arising out of or in connection with this Agreement.\n\n`
  doc += `15.3 **Amicable Settlement & Arbitration:** Any dispute, difference, or controversy shall first be attempted to be resolved amicably through good-faith executive negotiations within thirty (30) days. Failing such resolution, the dispute shall be referred to and finally resolved by a sole arbitrator appointed mutually by the Parties, conducted in English in accordance with the **Arbitration and Conciliation Act, 1996**.\n\n`

  // ── Clause 16: General Provisions
  doc += `### 16. MISCELLANEOUS PROVISIONS\n\n`
  doc += `16.1 **Entire Agreement:** This Agreement, together with Annexures A, B, and C, supersedes all prior discussions, offer letters, email correspondence, and understandings, and constitutes the entire contract between the Parties.\n\n`
  doc += `16.2 **Severability:** If any provision of this Agreement is held to be invalid or unenforceable under applicable Indian law, such invalidity shall not affect the remaining provisions, which shall continue in full force and effect.\n\n`
  doc += `16.3 **Electronic Signatures & Counterparts:** This Agreement may be executed in counterparts and via electronic signature (including Aadhaar eSign, DocuSign, or secure digital signatures) under Section 10A of the **Information Technology Act, 2000**, each of which shall be deemed an original and together constitute one and the same instrument.\n\n`

  // ── Execution Signatures
  doc += `---\n\n`
  doc += `**IN WITNESS WHEREOF, the Parties hereto have executed this Employment Agreement on the day, month, and year first written above.**\n\n`

  doc += `| FOR AND ON BEHALF OF THE COMPANY | SIGNED AND ACCEPTED BY THE EMPLOYEE |\n`
  doc += `| :--- | :--- |\n`
  doc += `| **For ${d.employerName}** | **Signature:** __________________________ |\n`
  doc += `| **Signature:** __________________________ | **Name:** ${d.employeeName} |\n`
  doc += `| **Name:** ${d.signatoryName} | **Designation:** ${d.designation} |\n`
  doc += `| **Designation:** ${d.signatoryDesignation} | **Date:** __________________________ |\n`
  doc += `| **Date:** __________________________ | **Place:** ${d.workLocationCity} |\n\n`

  doc += `**IN THE PRESENCE OF ATTESTING WITNESSES:**\n\n`
  doc += `1. **Witness 1 Signature:** ____________________  \n`
  doc += `   **Name & Address:** _________________________________________\n\n`
  doc += `2. **Witness 2 Signature:** ____________________  \n`
  doc += `   **Name & Address:** _________________________________________\n\n`

  // ── Annexures
  doc += `---\n\n`
  doc += `## ANNEXURE A: ITEMISED SALARY STRUCTURE (CTC BREAKDOWN)\n\n`
  doc += `**Employee Name:** ${d.employeeName} | **Designation:** ${d.designation} | **Joining Date:** ${d.joiningDate}\n\n`

  const sb = d.salaryStructure
  doc += `| Salary Component | Monthly Amount (INR) | Annualized Amount (INR) | Statutory Classification |\n`
  doc += `| :--- | :--- | :--- | :--- |\n`
  doc += `| **Basic Salary** | ${formatInr(sb.basicMonthly)} | ${formatInr(sb.basicMonthly * 12)} | Section 2(y) Core Wages (${wageRule.basicPercentage}%) |\n`
  doc += `| **House Rent Allowance (HRA)** | ${formatInr(sb.hraMonthly)} | ${formatInr(sb.hraMonthly * 12)} | Excluded Allowance (Sec 10(13A)) |\n`
  doc += `| **Special / Flexible Allowance** | ${formatInr(sb.specialAllowanceMonthly)} | ${formatInr(sb.specialAllowanceMonthly * 12)} | Performance & Role Allowance |\n`
  doc += `| **Employer EPF Contribution** | ${formatInr(sb.pfEmployerMonthly)} | ${formatInr(sb.pfEmployerMonthly * 12)} | Statutory Social Security Code |\n`
  if (sb.statutoryBonusMonthly > 0) {
    doc += `| **Statutory Bonus** | ${formatInr(sb.statutoryBonusMonthly)} | ${formatInr(sb.statutoryBonusMonthly * 12)} | Code on Wages, 2019 |\n`
  }
  doc += `| **TOTAL GROSS REMUNERATION** | **${formatInr(sb.grossMonthly)}** | **${formatInr(sb.grossMonthly * 12)}** | **Gross Earnings** |\n`
  doc += `| **TOTAL COST TO COMPANY (CTC)** | — | **${formatInr(d.annualCtc)}** | **Total Annual CTC** |\n\n`
  doc += `*Note: Net take-home pay is subject to statutory deductions (Employee EPF share, Professional Tax, and Income Tax TDS).* \n\n`

  doc += `---\n\n`
  doc += `## ANNEXURE B: KEY RESULT AREAS & JOB DESCRIPTION\n\n`
  doc += `* **Core Functional Role:** Perform the professional responsibilities of **${d.designation}** within the **${d.department}** division.\n`
  doc += `* **Operational Standards:** Comply with all written standard operating procedures, architectural guidelines, quality benchmarks, and code review practices.\n`
  doc += `* **Reporting Accountability:** Submit regular sprint updates, weekly progress logs, and quarterly performance reviews to the **${d.reportingManagerDesignation}**.\n\n`

  doc += `---\n\n`
  doc += `## ANNEXURE C: COMPANY ASSET & DEVICE HANDOVER RECEIPT\n\n`
  doc += `The Employee acknowledges receipt of the following enterprise property in good working condition:\n\n`
  if (d.providedAssets && d.providedAssets.length > 0) {
    d.providedAssets.forEach((asset, idx) => {
      doc += `${idx + 1}. **${asset}**\n`
    })
  } else {
    doc += `1. Standard enterprise laptop and security credentials.\n`
  }
  doc += `\n*The Employee agrees to maintain these assets with utmost diligence and surrender them immediately upon separation.*\n`

  return doc
}

// ─── DOCX Builder ────────────────────────────────────────────────────────────
export async function buildEmploymentAgreementDocx(data: EmploymentAgreementFormData): Promise<Buffer> {
  const d = data
  const stampRule = STATE_STAMP_SCHEDULE[d.state] || STATE_STAMP_SCHEDULE.karnataka
  const wageRule = checkWageFiftyPercentRule(d.salaryStructure)
  const sb = d.salaryStructure

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch margins
          },
        },
        children: [
          // Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'EMPLOYMENT AGREEMENT',
                bold: true,
                size: 32, // 16pt
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Execution Date: ${d.executionDate} | Place: ${d.executionPlace}`,
                italics: true,
                size: 20,
                color: '64748B',
              }),
            ],
          }),

          // Stamp Duty Callout Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      left: { style: BorderStyle.SINGLE, size: 16, color: '2563EB' },
                      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({
                            text: `STATUTORY STAMP DUTY NOTICE (${stampRule.stateName}): `,
                            bold: true,
                            size: 18,
                            color: '1E3A8A',
                          }),
                          new TextRun({
                            text: `Payable at ${formatInr(stampRule.stampDutyAmount)} under ${stampRule.articleRef} via ${stampRule.stampType}.`,
                            size: 18,
                            color: '334155',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

          // Preamble
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `This EMPLOYMENT AGREEMENT ("Agreement") is entered into on this ${d.executionDate}, at ${d.executionPlace}, by and between:`,
                size: 22,
              }),
            ],
          }),

          // Employer
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: '1. ', bold: true, size: 22 }),
              new TextRun({ text: `${d.employerName}`, bold: true, size: 22 }),
              new TextRun({
                text: `, a ${d.employerEntityType}${d.employerRegistrationNumber ? ` (Registration/CIN: ${d.employerRegistrationNumber})` : ''}, having its registered office at ${d.employerRegisteredAddress}, represented herein by ${d.signatoryName}, ${d.signatoryDesignation} (hereinafter referred to as the "Company" or "Employer");`,
                size: 22,
              }),
            ],
          }),

          // AND
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: 'AND', bold: true, size: 22, color: '475569' })],
          }),

          // Employee
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: '2. ', bold: true, size: 22 }),
              new TextRun({ text: `${d.employeeName}`, bold: true, size: 22 }),
              new TextRun({
                text: `${d.employeeFatherOrSpouseName ? `, s/o / d/o / w/o ${d.employeeFatherOrSpouseName}` : ''}, residing at ${d.employeeResidentialAddress}, PAN: ${d.employeePan || '[PAN Required]'} (hereinafter referred to as the "Employee").`,
                size: 22,
              }),
            ],
          }),

          // Recitals Heading
          new Paragraph({
            spacing: { before: 160, after: 80 },
            children: [new TextRun({ text: 'RECITALS', bold: true, size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `A. The Company desires to appoint the Employee to the position of ${d.designation} in its ${d.department} department.`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `B. The Employee has represented that they possess the requisite competence and have agreed to accept employment on the terms and conditions set forth herein.`,
                size: 20,
              }),
            ],
          }),

          // ── Section 1: Appointment
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: '1. APPOINTMENT & REPORTING', bold: true, size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `1.1 The Company hereby appoints the Employee as ${d.designation}, commencing on the Joining Date of ${d.joiningDate}. The Employee shall report to the ${d.reportingManagerDesignation}. Pursuant to Section 6(1)(f) of the OSH Code, 2020, this contract records all statutory appointment particulars.`,
                size: 20,
              }),
            ],
          }),

          // ── Section 2: Workplace & Mode
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: '2. PLACE OF WORK & WORK MODE', bold: true, size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `2.1 The Employee is engaged on a ${d.workMode.replace('_', ' ').toUpperCase()} basis based out of ${d.workLocationCity}. The Employee shall maintain strict data confidentiality and home workstation security in compliance with the Digital Personal Data Protection Act, 2023.`,
                size: 20,
              }),
            ],
          }),

          // ── Section 3: Probation / Term
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: d.isFixedTerm
                  ? '3. FIXED-TERM TENURE (IR CODE, 2020)'
                  : d.hasProbation
                  ? '3. PROBATION & CONFIRMATION'
                  : '3. REGULAR CONFIRMED STATUS',
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: d.isFixedTerm
                  ? `3.1 This is a Fixed-Term Employment contract under Section 2(o) of the Industrial Relations Code, 2020 for ${d.fixedTermDurationMonths || 12} months. Expiry does not constitute retrenchment under Section 2(zh). Pro-rata gratuity is available after 1 year under Section 53 of the Social Security Code.`
                  : d.hasProbation
                  ? `3.1 The Employee shall serve an initial probation period of ${d.probationMonths} months. Confirmation requires written notification. Either party may terminate during probation on ${d.probationNoticeDays} days' written notice.`
                  : `3.1 The Employee is appointed directly as a regular confirmed employee with standard notice terms.`,
                size: 20,
              }),
            ],
          }),

          // ── Section 4: Remuneration
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: '4. REMUNERATION & STATUTORY SALARY', bold: true, size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `4.1 The Employee shall be paid an annual CTC of ${formatInr(d.annualCtc)} (${numberToWordsInr(d.annualCtc)}) payable monthly. Under Section 2(y) of the Code on Wages, 2019, Basic Salary is set at ${formatInr(sb.basicMonthly)}/month (${wageRule.basicPercentage}% of gross), complying with statutory wage thresholds. Remuneration is disbursed on or before the ${d.paymentDayOfMonth}th of each month subject to statutory tax TDS and EPF deductions.`,
                size: 20,
              }),
            ],
          }),

          // ── Section 5: Restrictive Covenants & IP
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: '5. CONFIDENTIALITY, IP & RESTRICTIVE COVENANTS', bold: true, size: 22 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `5.1 All proprietary software, code, and inventions authored by the Employee belong exclusively to the Company under Section 17(c) of the Copyright Act, 1957. The Employee agrees to a non-solicitation covenant for ${d.nonSolicitMonths} months post-termination. Blanket post-employment non-compete covenants are subject to Section 27 of the Indian Contract Act, 1872.`,
                size: 20,
              }),
            ],
          }),

          // ── Section 6: Separation & Notice
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: '6. NOTICE PERIOD & TERMINATION', bold: true, size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `6.1 Post-confirmation, either party may terminate this Agreement upon ${d.noticePeriodDays} days' written notice${d.noticePayInLieuPermitted ? ' or payment of basic salary in lieu thereof' : ''}. Termination for cause (gross misconduct, fraud, abandonment) may be effected immediately without notice.`,
                size: 20,
              }),
            ],
          }),

          // Signatures Section
          new Paragraph({
            spacing: { before: 240, after: 160 },
            children: [
              new TextRun({
                text: 'IN WITNESS WHEREOF, the Parties have executed this Agreement on the Effective Date.',
                bold: true,
                size: 20,
              }),
            ],
          }),

          // Signature Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `For ${d.employerName}`, bold: true })] }),
                      new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: 'Signature: ____________________' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Name: ${d.signatoryName}` })] }),
                      new Paragraph({ children: [new TextRun({ text: `Designation: ${d.signatoryDesignation}` })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'Accepted by Employee', bold: true })] }),
                      new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: 'Signature: ____________________' })] }),
                      new Paragraph({ children: [new TextRun({ text: `Name: ${d.employeeName}` })] }),
                      new Paragraph({ children: [new TextRun({ text: `Designation: ${d.designation}` })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Annexure A: Salary Breakdown
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 120 },
            children: [new TextRun({ text: 'ANNEXURE A: SALARY BREAKDOWN TABLE', bold: true, size: 24 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Component', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Monthly (INR)', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Annual (INR)', bold: true, color: 'FFFFFF' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Basic Salary' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.basicMonthly) })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.basicMonthly * 12) })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'House Rent Allowance (HRA)' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.hraMonthly) })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.hraMonthly * 12) })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Special Allowance' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.specialAllowanceMonthly) })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.specialAllowanceMonthly * 12) })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Employer PF Share' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.pfEmployerMonthly) })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.pfEmployerMonthly * 12) })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Total Gross Pay', bold: true })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: formatInr(sb.grossMonthly), bold: true })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: formatInr(d.annualCtc), bold: true })] })],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

// ─── PDF Builder (pdf-lib) ───────────────────────────────────────────────────
export async function buildEmploymentAgreementPdf(data: EmploymentAgreementFormData): Promise<Uint8Array> {
  const d = data
  const stampRule = STATE_STAMP_SCHEDULE[d.state] || STATE_STAMP_SCHEDULE.karnataka
  const wageRule = checkWageFiftyPercentRule(d.salaryStructure)
  const sb = d.salaryStructure

  function formatInrPdf(val: number): string {
    return formatInr(val).replace(/₹/g, 'Rs. ')
  }

  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const margin = 50
  const pageWidth = 595.28 // A4
  const pageHeight = 841.89 // A4
  const contentWidth = pageWidth - margin * 2

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  function checkNewPage(neededSpace: number) {
    if (y - neededSpace < margin + 40) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
      drawHeaderFooter(page)
    }
  }

  function drawHeaderFooter(p: PDFPage) {
    p.drawText('EMPLOYMENT AGREEMENT (INDIA)', {
      x: margin,
      y: pageHeight - 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    })
    p.drawLine({
      start: { x: margin, y: pageHeight - 34 },
      end: { x: pageWidth - margin, y: pageHeight - 34 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })

    p.drawText('CorpLawUpdates.in Legal Document Drafting Engine', {
      x: margin,
      y: 25,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    })
    p.drawLine({
      start: { x: margin, y: 35 },
      end: { x: pageWidth - margin, y: 35 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
  }

  drawHeaderFooter(page)

  // Title
  page.drawText('EMPLOYMENT AGREEMENT', {
    x: margin,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 20

  page.drawText(`Execution Date: ${d.executionDate} | Location: ${d.executionPlace}`, {
    x: margin,
    y,
    size: 9,
    font: fontOblique,
    color: rgb(0.39, 0.45, 0.55),
  })
  y -= 25

  // Stamp Duty Notice Box
  page.drawRectangle({
    x: margin,
    y: y - 28,
    width: contentWidth,
    height: 32,
    color: rgb(0.95, 0.96, 0.98),
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 1,
  })
  page.drawText(
    `STATE STAMP DUTY NOTICE (${stampRule.stateName}): Non-judicial duty of ${formatInrPdf(stampRule.stampDutyAmount)} under ${stampRule.articleRef}`,
    {
      x: margin + 8,
      y: y - 16,
      size: 8.5,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.54),
    }
  )
  y -= 45

  // Parties intro
  function drawWrappedText(text: string, font: PDFFont, size: number, color = rgb(0.15, 0.15, 0.15)) {
    const clean = text.replace(/₹/g, 'Rs. ')
    const words = clean.split(' ')
    let line = ''
    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? ' ' : '') + words[i]
      const width = font.widthOfTextAtSize(testLine, size)
      if (width > contentWidth && line.length > 0) {
        checkNewPage(16)
        page.drawText(line, { x: margin, y, size, font, color })
        y -= size + 5
        line = words[i]
      } else {
        line = testLine
      }
    }
    if (line) {
      checkNewPage(16)
      page.drawText(line, { x: margin, y, size, font, color })
      y -= size + 5
    }
  }

  drawWrappedText(
    `This Employment Agreement is entered into between ${d.employerName} ("Company/Employer") and ${d.employeeName} ("Employee"), PAN: ${d.employeePan || '[PAN Required]'}.`,
    fontRegular,
    9.5
  )
  y -= 8

  // Section 1
  checkNewPage(40)
  page.drawText('1. APPOINTMENT, COMMENCEMENT & OSH CODE COMPLIANCE', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 14
  drawWrappedText(
    `The Company appoints the Employee in the capacity of ${d.designation} (${d.department}) starting from ${d.joiningDate}. The Employee reports to the ${d.reportingManagerDesignation}. Under Section 6(1)(f) of the OSH Code, 2020, this agreement incorporates all required statutory terms of service.`,
    fontRegular,
    9
  )
  y -= 8

  // Section 2
  checkNewPage(40)
  page.drawText('2. WORKPLACE, MODE & DPDP ACT COMPLIANCE', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 14
  drawWrappedText(
    `The Employee is engaged on a ${d.workMode.replace('_', ' ').toUpperCase()} basis based out of ${d.workLocationCity}. The Employee shall adhere to cybersecurity and data privacy regulations under the Digital Personal Data Protection Act, 2023.`,
    fontRegular,
    9
  )
  y -= 8

  // Section 3
  checkNewPage(40)
  page.drawText(
    d.isFixedTerm
      ? '3. FIXED-TERM CONTRACT (IR CODE, 2020)'
      : d.hasProbation
      ? '3. PROBATION & CONFIRMATION'
      : '3. EMPLOYMENT STATUS',
    {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    }
  )
  y -= 14
  drawWrappedText(
    d.isFixedTerm
      ? `This Fixed-Term contract under Section 2(o) of the Industrial Relations Code, 2020 spans ${d.fixedTermDurationMonths || 12} months. Natural expiry does not constitute retrenchment. Pro-rata gratuity applies after 1 year under Section 53 of the Social Security Code.`
      : d.hasProbation
      ? `Initial probation is ${d.probationMonths} months. Either party may separate on ${d.probationNoticeDays} days' written notice during probation. Confirmation requires formal written notification.`
      : `The Employee is a confirmed regular employee with standard separation terms.`,
    fontRegular,
    9
  )
  y -= 8

  // Section 4: Remuneration
  checkNewPage(40)
  page.drawText('4. REMUNERATION & WAGES DEFINITION', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 14
  drawWrappedText(
    `Annual CTC: ${formatInrPdf(d.annualCtc)} (${numberToWordsInr(d.annualCtc)}). Under Code on Wages, 2019 Section 2(y), monthly basic pay is ${formatInrPdf(sb.basicMonthly)} (${wageRule.basicPercentage}% of gross). Monthly salary is credited by the ${d.paymentDayOfMonth}th of each calendar month.`,
    fontRegular,
    9
  )
  y -= 8

  // Section 5: Restrictive Covenants & Section 27 Caution
  checkNewPage(40)
  page.drawText('5. CONFIDENTIALITY, IP & SECTION 27 CAUTION', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 14
  drawWrappedText(
    `All works created vest in the Employer under Section 17(c) of the Copyright Act, 1957. A ${d.nonSolicitMonths}-month non-solicitation covenant applies post-employment. NOTE: Under Section 27 of the Indian Contract Act, 1872, post-employment non-compete covenants are void and unenforceable in Indian courts (Percept D'Mark v. Zaheer Khan).`,
    fontRegular,
    9
  )
  y -= 8

  // Section 6: Separation & Notice
  checkNewPage(40)
  page.drawText('6. NOTICE PERIOD & TERMINATION', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 14
  drawWrappedText(
    `Post-confirmation notice period: ${d.noticePeriodDays} days${d.noticePayInLieuPermitted ? ' (or basic pay in lieu)' : ''}. Termination for cause (fraud, criminal act, abandonment) is immediate without severance pay.`,
    fontRegular,
    9
  )
  y -= 18

  // Salary Table Box
  checkNewPage(120)
  page.drawText('ANNEXURE A: COMPENSATION SCHEDULE', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 14

  const tableTop = y
  page.drawRectangle({
    x: margin,
    y: tableTop - 70,
    width: contentWidth,
    height: 70,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.5,
  })

  // Table rows
  page.drawText(`Basic Salary: ${formatInrPdf(sb.basicMonthly)} / month (${formatInrPdf(sb.basicMonthly * 12)} p.a.)`, {
    x: margin + 10,
    y: tableTop - 16,
    size: 8.5,
    font: fontRegular,
  })
  page.drawText(`HRA Allowance: ${formatInrPdf(sb.hraMonthly)} / month (${formatInrPdf(sb.hraMonthly * 12)} p.a.)`, {
    x: margin + 10,
    y: tableTop - 30,
    size: 8.5,
    font: fontRegular,
  })
  page.drawText(`Special Allowance: ${formatInrPdf(sb.specialAllowanceMonthly)} / month (${formatInrPdf(sb.specialAllowanceMonthly * 12)} p.a.)`, {
    x: margin + 10,
    y: tableTop - 44,
    size: 8.5,
    font: fontRegular,
  })
  page.drawText(`Employer PF Share: ${formatInrPdf(sb.pfEmployerMonthly)} / month (${formatInrPdf(sb.pfEmployerMonthly * 12)} p.a.)`, {
    x: margin + 10,
    y: tableTop - 58,
    size: 8.5,
    font: fontRegular,
  })
  y -= 90

  // Signature Block
  checkNewPage(80)
  page.drawText('SIGNATURES & ACKNOWLEDGEMENT', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 25

  page.drawText(`For ${d.employerName}`, { x: margin, y, size: 9, font: fontBold })
  page.drawText('Accepted by Employee', { x: margin + 260, y, size: 9, font: fontBold })
  y -= 25
  page.drawText('Signature: __________________________', { x: margin, y, size: 8.5, font: fontRegular })
  page.drawText('Signature: __________________________', { x: margin + 260, y, size: 8.5, font: fontRegular })
  y -= 14
  page.drawText(`Name: ${d.signatoryName}`, { x: margin, y, size: 8.5, font: fontRegular })
  page.drawText(`Name: ${d.employeeName}`, { x: margin + 260, y, size: 8.5, font: fontRegular })
  y -= 14
  page.drawText(`Title: ${d.signatoryDesignation}`, { x: margin, y, size: 8.5, font: fontRegular })
  page.drawText(`Title: ${d.designation}`, { x: margin + 260, y, size: 8.5, font: fontRegular })

  return await pdfDoc.save()
}
