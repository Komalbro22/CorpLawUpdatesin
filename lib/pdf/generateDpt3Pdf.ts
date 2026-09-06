import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Dpt3ComplianceCalculationResult } from '@/lib/rule-engine/dpt3-engine'
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export interface Dpt3PdfData {
  companyName?: string
  nominalCapital: number
  hasShareCapital: boolean
  filingPurpose: 'deposits' | 'exempted' | 'both' | 'one_time_loan' | 'nil'
  selectedFY: string
  statutoryDueDate: string
  waiverEndDate: string | null
  actualFilingDate: string
  calculatedDelayDays: number
  normalFee: number
  multiplier: number
  additionalFee: number
  totalFee: number
  rule21Penalty: number
  officersCount: number
  isAuditorCertRequired: boolean
}

export function generateDpt3Pdf(input: Dpt3PdfData | Dpt3ComplianceCalculationResult): jsPDF {
  const doc = new jsPDF()

  // Normalize input
  const isEngineResult = 'metadata' in input
  const data: Dpt3PdfData = isEngineResult
    ? {
        companyName: input.metadata.companyName,
        nominalCapital: input.metadata.nominalCapital,
        hasShareCapital: input.metadata.hasShareCapital,
        filingPurpose: input.metadata.filingPurpose,
        selectedFY: input.metadata.financialYear,
        statutoryDueDate: input.metadata.statutoryDueDate,
        waiverEndDate: input.metadata.waiverEndDate,
        actualFilingDate: input.metadata.actualFilingDateDisplay,
        calculatedDelayDays: input.metadata.effectiveDelayDays,
        normalFee: input.mcaPortalPayable.normalFilingFee,
        multiplier: input.mcaPortalPayable.tableBMultiplier,
        additionalFee: input.mcaPortalPayable.additionalLateFee,
        totalFee: input.mcaPortalPayable.totalPortalPayable,
        rule21Penalty: input.rule21ProceduralFine.totalRule21Exposure,
        officersCount: input.metadata.officerCount,
        isAuditorCertRequired: input.auditorCertificate.isMandatory
      }
    : input

  doc.setFont('helvetica')

  // Top Header Banner with safe non-colliding title and date
  const startY = renderDocumentHeader(doc, {
    title: 'FORM DPT-3 - STATUTORY RETURN OF DEPOSITS & FEE ASSESSMENT MEMORANDUM',
    subtitle: 'Section 73 & Rule 16/16A, Companies (Acceptance of Deposits) Rules, 2014',
    dateLabel: 'Assessment Date'
  })

  // Purpose Label
  let purposeLabel = 'Particulars of transactions not considered as deposit (Rule 2(1)(c))'
  if (data.filingPurpose === 'deposits') {
    purposeLabel = 'Return of Deposits (Section 73/76) [Auditor Certificate Mandatory]'
  } else if (data.filingPurpose === 'both') {
    purposeLabel = 'Return of Deposits and Exempted Transactions [Auditor Certificate Mandatory]'
  } else if (data.filingPurpose === 'one_time_loan') {
    purposeLabel = 'One-time Return of outstanding loans/receipts (Rule 16A(3))'
  } else if (data.filingPurpose === 'nil') {
    purposeLabel = 'Nil Return (Best Governance Practice - No Receipts Outstanding)'
  }

  // Section 1: Company & Statutory Filing Profile
  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. COMPANY & STATUTORY FILING PROFILE', 14, startY + 1)

  const capitalDisplay = data.hasShareCapital
    ? `INR ${data.nominalCapital.toLocaleString('en-IN')}`
    : 'Company Without Share Capital (Flat INR 200 Table A)'

  const profileRows = [
    ['Company / Entity Name', data.companyName?.trim() || 'Unspecified Corporate Entity'],
    ['Filing Category', 'Form DPT-3 (Annual Return under Rule 16/16A)'],
    ['Return Purpose', purposeLabel],
    ['Financial Year Reported', `FY ${data.selectedFY} (Position as on 31st March)`],
    ['Auditor Certificate Required?', data.isAuditorCertRequired ? 'YES (Mandatory under Rule 16)' : 'NO (Exempted Receipts Only)'],
    ['Nominal / Authorized Capital', capitalDisplay],
    ['Statutory Due Date', data.statutoryDueDate],
    ['Fee Waiver Status', data.waiverEndDate ? `Circular 02/2026 Waiver Active up to ${data.waiverEndDate}` : 'Standard Table B Slabs'],
    ['Actual / Anticipated Filing Date', data.actualFilingDate],
    ['Delay Beyond Due Date', `${data.calculatedDelayDays} Day(s) Delay`]
  ]

  autoTable(doc, {
    startY: startY + 4,
    head: [['Parameter', 'Statutory Assessment']],
    body: cleanTableData(profileRows),
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.6, textColor: [30, 41, 59] },
    headStyles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: [51, 65, 85] },
      1: { cellWidth: 115 }
    },
    margin: { left: 14, right: 14 }
  })

  // Section 2: MCA21 Portal Payable Breakdown (Challan)
  const afterProfile = (doc as any).lastAutoTable.finalY + 5
  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. MCA21 PORTAL PAYABLE BREAKDOWN (e-CHALLAN)', 14, afterProfile)

  const feeRows = [
    [
      'Normal Filing Fee (Table A, Items 5 & 6)',
      'Companies (Registration Offices and Fees) Rules, 2014',
      `INR ${data.normalFee.toLocaleString('en-IN')}`
    ],
    [
      `Additional Late Filing Fee (${data.multiplier}x Normal Fee)`,
      `Table B Slabs (Calculated on ${data.calculatedDelayDays} days delay)`,
      `INR ${data.additionalFee.toLocaleString('en-IN')}`
    ],
    [
      'TOTAL MCA21 PORTAL PAYABLE',
      'Immediate e-Challan / UPI / NetBanking at Form Upload',
      `INR ${data.totalFee.toLocaleString('en-IN')}`
    ]
  ]

  autoTable(doc, {
    startY: afterProfile + 3,
    head: [['Fee Component', 'Statutory Basis', 'Amount (INR)']],
    body: cleanTableData(feeRows),
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 75, fontStyle: 'bold' },
      1: { cellWidth: 75 },
      2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  })

  // Section 3: Procedural & Substantive Penalty Exposure
  const afterFees = (doc as any).lastAutoTable.finalY + 5
  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('3. STATUTORY PENALTY EXPOSURE (ADJUDICATION)', 14, afterFees)

  const penaltyRows = [
    [
      'Rule 21 Procedural Fine',
      `Company: INR 5,000 + INR 500/d | ${data.officersCount} Officers: INR ${(data.officersCount * 5000).toLocaleString('en-IN')} + INR 500/d`,
      `INR ${data.rule21Penalty.toLocaleString('en-IN')}`
    ],
    [
      'Section 76A Deposit Contravention',
      'Applies ONLY if unauthorized public deposits are accepted/unpaid',
      'INR 1 Cr to INR 10 Cr + Imprisonment (If applicable)'
    ]
  ]

  autoTable(doc, {
    startY: afterFees + 3,
    head: [['Penalty Provision', 'Statutory Description', 'Indicative Risk']],
    body: cleanTableData(penaltyRows),
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: PDF_PALETTE.red },
      1: { cellWidth: 88 },
      2: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  })

  // Section 4: Statutory Compliance Notes & Reminders
  const afterPenalties = (doc as any).lastAutoTable.finalY + 5
  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('4. STATUTORY ADVISORIES & COMPLIANCE DIRECTIVES', 14, afterPenalties)

  const reminderRows = [
    ['No Revision Once Filed', 'Form DPT-3 cannot be revised once uploaded on MCA21 V3. Any rectification requires petitioning ROC to mark filing defective and filing a fresh form.'],
    ['Net Worth Source', 'Net worth must be taken from the latest audited balance sheet prior to the return date (e.g. 31 March 2025 balance sheet for FY 2025-26).'],
    ['LLPs Excluded', 'Limited Liability Partnerships (LLPs) are NOT governed by Section 73 and do not file DPT-3. LLPs file Form 8 and Form 11.'],
    ['Circular 02/2026 Waiver', 'For FY 2025-26, fees were waived up to 31 July 2026. Filings from 1 August 2026 calculate delay from original 30 June due date.']
  ]

  autoTable(doc, {
    startY: afterPenalties + 3,
    head: [['Compliance Area', 'Directives & Legal Provisions']],
    body: cleanTableData(reminderRows),
    theme: 'plain',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', textColor: [51, 65, 85] },
      1: { cellWidth: 135 }
    },
    margin: { left: 14, right: 14 }
  })

  // Footer & Disclaimers
  const afterReminders = (doc as any).lastAutoTable.finalY + 5
  const disclaimer = 'LEGAL NOTICE: This assessment memorandum is automatically generated by CorpLawUpdates.in for professional advisory and planning purposes. Normal and additional fees are governed by the Companies (Registration Offices and Fees) Rules, 2014 and MCA Circular 02/2026. Rule 21 penalties are not collected via MCA21 e-Challan; they require formal ROC adjudication proceedings under Section 454.'
  renderSafeDisclaimer(doc, disclaimer, afterReminders, { fontSize: 6.8 })

  renderPageFooters(doc, 'Form DPT-3 Compliance Assessment Memorandum')

  return doc
}
