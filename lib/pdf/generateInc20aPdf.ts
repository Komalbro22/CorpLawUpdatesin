import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Inc20aCalculationResult,
  Inc20aCompanyClassification
} from '@/lib/rule-engine/inc20a-engine'
import {
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export interface Inc20aPdfData {
  companyName?: string
  cin?: string
  incorporationDate: string
  filingDate: string
  statutoryDueDate: string
  daysOfDelay: number;
  isDelay: boolean
  isExempt: boolean
  authorizedShareCapital: number
  capitalBracketLabel: string
  companyClassification: Inc20aCompanyClassification
  isSection446BEligible: boolean
  section446BReason: string
  baseFilingFee: number
  additionalFeeMultiplier: number
  additionalLateFee: number
  totalMcaPortalFee: number
  companyPenalty: number
  perDirectorDailyRate: number
  perDirectorPenaltyCap: number
  perDirectorPenalty: number
  totalOfficersPenalty: number
  totalAdjudicatedPenalty: number
  totalFinancialExposure: number
  numberOfDirectors: number
  operationalFreezeTriggered: boolean
  strikeOffRiskTriggered: boolean
  section454EscalationRisk: boolean
}

export function generateInc20aPdf(
  input: Inc20aPdfData | Inc20aCalculationResult,
  extraMeta?: { companyName?: string; cin?: string; numberOfDirectors?: number }
): jsPDF {
  const doc = new jsPDF()

  // Normalize input
  const isEngineResult = 'delaySlab' in input
  const data: Inc20aPdfData = isEngineResult
    ? {
        companyName: extraMeta?.companyName,
        cin: extraMeta?.cin,
        incorporationDate: input.incorporationDate,
        filingDate: input.filingDate,
        statutoryDueDate: input.statutoryDueDate,
        daysOfDelay: input.daysOfDelay,
        isDelay: input.isDelay,
        isExempt: input.isExempt,
        authorizedShareCapital: input.authorizedShareCapital,
        capitalBracketLabel: input.capitalBracketLabel,
        companyClassification: input.companyClassification,
        isSection446BEligible: input.isSection446BEligible,
        section446BReason: input.section446BReason,
        baseFilingFee: input.baseFilingFee,
        additionalFeeMultiplier: input.additionalFeeMultiplier,
        additionalLateFee: input.additionalLateFee,
        totalMcaPortalFee: input.totalMcaPortalFee,
        companyPenalty: input.companyPenalty,
        perDirectorDailyRate: input.perDirectorDailyRate,
        perDirectorPenaltyCap: input.perDirectorPenaltyCap,
        perDirectorPenalty: input.perDirectorPenalty,
        totalOfficersPenalty: input.totalOfficersPenalty,
        totalAdjudicatedPenalty: input.totalAdjudicatedPenalty,
        totalFinancialExposure: input.totalFinancialExposure,
        numberOfDirectors: extraMeta?.numberOfDirectors || 2,
        operationalFreezeTriggered: input.operationalFreezeTriggered,
        strikeOffRiskTriggered: input.strikeOffRiskTriggered,
        section454EscalationRisk: input.section454EscalationRisk
      }
    : {
        ...input,
        companyName: extraMeta?.companyName || input.companyName,
        cin: extraMeta?.cin || input.cin,
        numberOfDirectors: extraMeta?.numberOfDirectors || input.numberOfDirectors || 2
      }

  doc.setFont('helvetica')

  // Header
  const startY = renderDocumentHeader(doc, {
    title: 'FORM INC-20A - COMMENCEMENT OF BUSINESS & PENALTY MEMORANDUM',
    subtitle: 'Section 10A & Rule 23A, Companies (Incorporation) Rules, 2014 | Section 446B Audit',
    dateLabel: 'Assessment Date'
  })

  // Table 1: Entity & Compliance Parameters
  const paramRows: [string, string][] = [
    ['Company Name', data.companyName ? data.companyName.toUpperCase() : 'NOT SPECIFIED (PROVISIONAL ASSESSMENT)'],
    ['Corporate Identity Number (CIN)', data.cin ? data.cin.toUpperCase() : 'NOT SPECIFIED'],
    ['Date of Incorporation (CoI)', data.incorporationDate],
    ['Statutory Due Date (Strictly 180 Days)', `${data.statutoryDueDate} (Day 181 onwards = Default)`],
    ['Actual / Assessment Filing Date', data.filingDate],
    ['Statutory Delay Status', data.isExempt ? 'EXEMPT FROM SECTION 10A' : data.isDelay ? `DEFAULT: ${data.daysOfDelay} CALENDAR DAYS OVERDUE` : 'COMPLIANT (FILED ON TIME)'],
    ['Authorized Share Capital', `INR ${data.authorizedShareCapital.toLocaleString('en-IN')} (${data.capitalBracketLabel})`],
    ['Section 446B Lesser Penalties Eligibility', data.isSection446BEligible ? 'YES - ELIGIBLE (50% Relief on Company & Officer Penalties)' : 'NO - STANDARD SECTION 10A(2) PENALTIES APPLY']
  ]

  autoTable(doc, {
    startY: startY,
    head: [['Assessment Parameter', 'Statutory Detail']],
    body: cleanTableData(paramRows),
    theme: 'striped',
    headStyles: {
      fillColor: PDF_PALETTE.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: PDF_PALETTE.navy
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  })

  // Table 2: MCA21 Portal e-Challan Fee Determination
  const finalY1 = (doc as any).lastAutoTable.finalY || 100

  const portalFeeRows: [string, string, string][] = [
    [
      'Normal Filing Fee (Table A, Item 5)',
      `Based on nominal capital bracket: ${data.capitalBracketLabel}`,
      `INR ${data.baseFilingFee.toLocaleString('en-IN')}`
    ],
    [
      'Additional Late Fee (Table B Multiplier)',
      data.isDelay
        ? `${data.daysOfDelay} days delay: Multiplier of ${data.additionalFeeMultiplier}x normal fee`
        : '0x Multiplier (Filed within 180 days)',
      `INR ${data.additionalLateFee.toLocaleString('en-IN')}`
    ],
    [
      'Total MCA21 Portal e-Challan',
      'Payable directly on MCA V3 portal upon form submission',
      `INR ${data.totalMcaPortalFee.toLocaleString('en-IN')}`
    ]
  ]

  autoTable(doc, {
    startY: finalY1 + 4,
    head: [['MCA21 Portal Fee Component', 'Statutory Computation Basis', 'Amount (INR)']],
    body: cleanTableData(portalFeeRows),
    theme: 'grid',
    headStyles: {
      fillColor: PDF_PALETTE.blue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: PDF_PALETTE.navy
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', halign: 'right', cellWidth: 'auto' }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === portalFeeRows.length - 1) {
        hookData.cell.styles.fillColor = [241, 245, 249]
        hookData.cell.styles.textColor = PDF_PALETTE.navy
        hookData.cell.styles.fontStyle = 'bold'
      }
    },
    margin: { left: 14, right: 14 }
  })

  // Table 3: Section 10A(2) Adjudication Liability Exposure
  const finalY2 = (doc as any).lastAutoTable.finalY || 150

  const adjRows: [string, string, string][] = [
    [
      'Company Statutory Penalty',
      data.isSection446BEligible
        ? 'Section 446B reduced penalty (50% of INR 50,000 flat fine)'
        : 'Section 10A(2) standard flat penalty on the company',
      `INR ${data.companyPenalty.toLocaleString('en-IN')}`
    ],
    [
      `Per-Officer Personal Penalty (${data.numberOfDirectors} Director${data.numberOfDirectors > 1 ? 's' : ''})`,
      data.isSection446BEligible
        ? `INR 500/day continuing default (capped at INR 50,000 per officer)`
        : `INR 1,000/day continuing default (capped at INR 1,00,000 per officer)`,
      `INR ${data.totalOfficersPenalty.toLocaleString('en-IN')}`
    ],
    [
      'Total Section 10A(2) Adjudication Exposure',
      'Payable upon ROC adjudication order. Officers MUST pay from personal funds',
      `INR ${data.totalAdjudicatedPenalty.toLocaleString('en-IN')}`
    ],
    [
      'COMBINED STATUTORY COMPLIANCE LIABILITY',
      'Total Financial Exposure = MCA Portal Fee + Section 10A(2) Adjudication Exposure',
      `INR ${data.totalFinancialExposure.toLocaleString('en-IN')}`
    ]
  ]

  autoTable(doc, {
    startY: finalY2 + 4,
    head: [['Adjudication Penalty Head (Sec 10A(2))', 'Adjudication Scope & Personal Liability', 'Amount (INR)']],
    body: cleanTableData(adjRows),
    theme: 'grid',
    headStyles: {
      fillColor: PDF_PALETTE.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: PDF_PALETTE.navy
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', halign: 'right', cellWidth: 'auto' }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === adjRows.length - 1) {
        hookData.cell.styles.fillColor = [254, 242, 242]
        hookData.cell.styles.textColor = PDF_PALETTE.red
        hookData.cell.styles.fontStyle = 'bold'
      }
    },
    margin: { left: 14, right: 14 }
  })

  // Table 4: Critical Warnings & Legal Precedents
  const finalY3 = (doc as any).lastAutoTable.finalY || 205

  const warningRows: [string, string][] = [
    [
      'Operational Freeze (Section 10A(1))',
      'Under Section 10A(1), a company cannot commence business or exercise borrowing powers prior to filing Form INC-20A. Pre-filing contracts are voidable and loans taken are unauthorized.'
    ],
    [
      'Strike-Off Risk (Section 10A(3) / 248)',
      data.strikeOffRiskTriggered
        ? 'CRITICAL ALERT: Delay exceeds 180 days (360 days from incorporation). ROC may initiate strike-off and entity dissolution under Section 248(1)(c) for failure to commence business.'
        : 'If default extends beyond 180 days past the statutory deadline, the ROC is empowered to initiate name removal under Section 248(1)(c).'
    ],
    [
      'CCFS-2026 Exclusion Warning',
      'The Companies Compliance Facilitation Scheme (CCFS-2026) covers Sections 92 and 137 only. Section 10A defaults are strictly EXCLUDED from CCFS amnesty.'
    ],
    [
      'Non-Payment Escalation (Section 454(8))',
      'Failure to remit adjudicated penalties within 90 days of the ROC order triggers additional fines up to INR 5 Lakh on the company, and up to 6 months imprisonment on officers.'
    ]
  ]

  autoTable(doc, {
    startY: finalY3 + 4,
    head: [['Statutory Caution / Risk Indicator', 'Legal Implication & Enforcement Mechanism']],
    body: cleanTableData(warningRows),
    theme: 'plain',
    headStyles: {
      fillColor: PDF_PALETTE.slate,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: PDF_PALETTE.slate
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, textColor: PDF_PALETTE.navy },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  })

  // Mandatory Attachment Verification Checklist
  const finalY4 = (doc as any).lastAutoTable.finalY || 250
  const disclaimer =
    'Statutory Disclaimer: This memorandum is generated algorithmically by CorpLawUpdates.in based on Section 10A of the Companies Act, 2013 and the Companies (Registration Offices and Fees) Rules, 2014. MCA21 portal fees and Section 10A(2) adjudication penalties are distinct legal liabilities. Remit portal fees on mca.gov.in and verify with practicing corporate counsel.'

  renderSafeDisclaimer(doc, disclaimer, finalY4 + 4, { fontSize: 6.5 })
  renderPageFooters(doc, 'Form INC-20A Statutory Due Date & Penalty Memorandum')

  return doc
}
