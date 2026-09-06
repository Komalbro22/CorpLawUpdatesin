import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Dpt3ComplianceCalculationResult, Dpt3FilingPurpose } from '@/lib/rule-engine/dpt3-engine'

export interface Dpt3PdfData {
  companyName?: string
  nominalCapital: number
  hasShareCapital: boolean
  filingPurpose: Dpt3FilingPurpose | string
  selectedFY: string
  statutoryDueDate: string
  waiverEndDate?: string | null
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
  const pageWidth = doc.internal.pageSize.width

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

  // Executive Palette
  const navy: [number, number, number] = [15, 23, 42]      // #0F172A
  const blue: [number, number, number] = [37, 99, 235]     // #2563EB
  const slate: [number, number, number] = [71, 85, 105]    // #475569
  const gray: [number, number, number] = [100, 116, 139]   // #64748B
  const red: [number, number, number] = [220, 38, 38]      // #DC2626

  doc.setFont('helvetica')

  // Top Header Banner
  doc.setFontSize(18)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('CorpLawUpdates.in', 14, 18)

  doc.setFontSize(8)
  doc.setTextColor(slate[0], slate[1], slate[2])
  doc.setFont('helvetica', 'normal')
  doc.text("India's Free Corporate Law Intelligence & Statutory Compliance Platform", 14, 23)

  // Title & Timestamp
  doc.setFontSize(11)
  doc.setTextColor(blue[0], blue[1], blue[2])
  doc.setFont('helvetica', 'bold')
  doc.text('FORM DPT-3 — STATUTORY RETURN OF DEPOSITS & FEE ASSESSMENT MEMORANDUM', 14, 32)

  const printDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  doc.setFontSize(8)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')
  doc.text(`Assessment Date: ${printDate}`, pageWidth - 14, 32, { align: 'right' })

  // Divider line
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.5)
  doc.line(14, 36, pageWidth - 14, 36)

  // Purpose Label
  let purposeLabel = 'Particulars of transactions not considered as deposit (Rule 2(1)(c))'
  if (data.filingPurpose === 'deposits') {
    purposeLabel = 'Return of Deposits (Section 73/76) [Auditor Certificate Mandatory]'
  } else if (data.filingPurpose === 'both') {
    purposeLabel = 'Return of Deposits and Exempted Transactions [Auditor Certificate Mandatory]'
  } else if (data.filingPurpose === 'one_time_loan') {
    purposeLabel = 'One-time Return of outstanding loans/receipts (Rule 16A(3))'
  } else if (data.filingPurpose === 'nil') {
    purposeLabel = 'Nil Return (Best Governance Practice — No Receipts Outstanding)'
  }

  // Section 1: Company & Statutory Filing Profile
  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. COMPANY & STATUTORY FILING PROFILE', 14, 43)

  const capitalDisplay = data.hasShareCapital
    ? `₹ ${data.nominalCapital.toLocaleString('en-IN')}`
    : 'Company Without Share Capital (Flat ₹200 Table A)'

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
    startY: 46,
    head: [['Parameter', 'Statutory Assessment']],
    body: profileRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold', textColor: [51, 65, 85] },
      1: { cellWidth: 110 }
    }
  })

  // Section 2: MCA21 Portal Payable Breakdown (Challan)
  const afterProfile = (doc as any).lastAutoTable.finalY + 7
  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. MCA21 PORTAL PAYABLE BREAKDOWN (e-CHALLAN)', 14, afterProfile)

  const feeRows = [
    [
      'Normal Filing Fee (Table A, Items 5 & 6)',
      'Companies (Registration Offices and Fees) Rules, 2014',
      `₹ ${data.normalFee.toLocaleString('en-IN')}`
    ],
    [
      `Additional Late Filing Fee (${data.multiplier}× Normal Fee)`,
      `Table B Slabs (Calculated on ${data.calculatedDelayDays} days delay)`,
      `₹ ${data.additionalFee.toLocaleString('en-IN')}`
    ],
    [
      'TOTAL MCA21 PORTAL PAYABLE',
      'Immediate e-Challan / UPI / NetBanking at Form Upload',
      `₹ ${data.totalFee.toLocaleString('en-IN')}`
    ]
  ]

  autoTable(doc, {
    startY: afterProfile + 3,
    head: [['Fee Component', 'Statutory Basis', 'Amount (INR)']],
    body: feeRows,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: navy, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  })

  // Section 3: Procedural & Substantive Penalty Exposure
  const afterFees = (doc as any).lastAutoTable.finalY + 7
  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('3. STATUTORY PENALTY EXPOSURE (ADJUDICATION)', 14, afterFees)

  const penaltyRows = [
    [
      'Rule 21 Procedural Fine',
      `Company: ₹5,000 + ₹500/d | ${data.officersCount} Officers: ₹${(data.officersCount * 5000).toLocaleString('en-IN')} + ₹500/d`,
      `₹ ${data.rule21Penalty.toLocaleString('en-IN')}`
    ],
    [
      'Section 76A Deposit Contravention',
      'Applies ONLY if unauthorized public deposits are accepted/unpaid',
      '₹ 1 Cr to ₹ 10 Cr + Imprisonment (If applicable)'
    ]
  ]

  autoTable(doc, {
    startY: afterFees + 3,
    head: [['Penalty Provision', 'Statutory Description', 'Indicative Risk']],
    body: penaltyRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: red },
      1: { cellWidth: 85 },
      2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  })

  // Section 4: Statutory Compliance Notes & Reminders
  const afterPenalties = (doc as any).lastAutoTable.finalY + 7
  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
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
    body: reminderRows,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: [51, 65, 85] },
      1: { cellWidth: 130 }
    }
  })

  // Footer & Disclaimers
  const afterReminders = (doc as any).lastAutoTable.finalY + 6
  doc.setFontSize(7)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'italic')
  doc.text(
    'LEGAL NOTICE: This assessment memorandum is automatically generated by CorpLawUpdates.in for professional advisory and planning purposes.',
    14,
    afterReminders
  )
  doc.text(
    'Normal and additional fees are governed by the Companies (Registration Offices and Fees) Rules, 2014 and MCA Circular 02/2026.',
    14,
    afterReminders + 3.5
  )
  doc.text(
    'Rule 21 penalties are not collected via MCA21 e-Challan; they require formal ROC adjudication proceedings under Section 454.',
    14,
    afterReminders + 7
  )

  return doc
}
