import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Pas3CalculationResult,
  formatInr
} from '@/lib/rule-engine/pas3-engine'
import {
  cleanTableData,
  cleanPdfText,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export interface Pas3PdfExtraMeta {
  companyName?: string
  cin?: string
  professionalFirm?: string
}

export function generatePas3Pdf(
  data: Pas3CalculationResult,
  extraMeta?: Pas3PdfExtraMeta
): jsPDF {
  const doc = new jsPDF()
  doc.setFont('helvetica')

  // 1. Header
  const startY = renderDocumentHeader(doc, {
    title: 'FORM PAS-3: RETURN OF ALLOTMENT & FEE REPORT',
    subtitle: 'Sections 39, 42 & 446B, Companies Act, 2013 read with PAS Rules 2014 | MCA V3 Adjudication Analysis',
    dateLabel: 'Assessment Date'
  })

  let currentY = startY + 4

  // 2. Metadata Section
  const allotmentModeLabel =
    data.allotmentMode === 'private_placement'
      ? 'Private Placement (Section 42 — Strict 15-Day Clock)'
      : 'Ordinary Allotment (Section 39 — Rights, Preferential, Bonus, ESOP — 30-Day Clock)'

  const companyTypeLabel =
    data.companyType === 'small_company' ? 'Small Company (Sec 2(85))' :
    data.companyType === 'startup' ? 'DPIIT Recognised Startup (Sec 446B)' :
    data.companyType === 'opc' ? 'One Person Company (OPC)' :
    data.companyType === 'producer' ? 'Producer Company (Sec 446B)' :
    data.companyType === 'nidhi' ? 'Nidhi Company' :
    data.companyType === 'without_share_capital' ? 'Company Without Share Capital' :
    'Standard Corporate Entity'

  const metaRows = [
    [
      { content: 'Company / Entity', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.companyName || 'Corporate Entity',
      { content: 'CIN / Corporate ID', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.cin || 'Not Specified'
    ],
    [
      { content: 'Mode of Allotment', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      allotmentModeLabel,
      { content: 'Entity Classification', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      companyTypeLabel
    ],
    [
      { content: 'Board Allotment Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.allotmentDate,
      { content: 'Evaluation / Filing Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.filingDate
    ],
    [
      { content: 'Statutory Window', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.statutoryDeadlineDays} Calendar Days (${data.statutoryDueDate})`,
      { content: 'Filing Status', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.isDelayed
        ? `DELAYED by ${data.delayDays} day(s)`
        : 'TIMELY / ON-SCHEDULE (Zero Penalty)'
    ]
  ]

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: cleanTableData(metaRows),
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 57 },
      2: { cellWidth: 38 },
      3: { cellWidth: 57 }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // 3. MCA V3 Fee Breakdown Table
  const feeRows = [
    ['MCA Table A Normal Filing Fee', data.feeSlabLabel, formatInr(data.normalFee)],
    ['Statutory Delay Duration', `${data.delayDays} Days beyond ${data.statutoryDueDate}`, data.isDelayed ? `Delayed` : 'On Time'],
    ['Table B Late Fee Multiplier', data.lateMultiplier > 0 ? `${data.lateMultiplier}x Normal Fee` : 'NIL (0x)', data.lateMultiplier > 0 ? `${data.lateMultiplier}x` : '0x'],
    ['Additional Late Filing Fee', `${data.lateMultiplier}x of ${formatInr(data.normalFee)}`, formatInr(data.additionalLateFee)],
    [
      { content: 'Total MCA V3 Challan Payable', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: 'Normal Fee + Additional Table B Fee', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: formatInr(data.totalMcaChallanFee), styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } }
    ]
  ]

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_PALETTE.navy)
  doc.text('1. MCA V3 Portal Challan Fee Computation (Table A + Table B)', 14, currentY)
  currentY += 3

  autoTable(doc, {
    startY: currentY,
    head: [['Fee Component', 'Statutory Basis & Bracket', 'Payable Amount']],
    body: cleanTableData(feeRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 85 },
      2: { cellWidth: 40, halign: 'right' }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // 4. ROC Adjudication & Personal Liability Table
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_PALETTE.navy)
  doc.text('2. ROC Adjudication Penalties & Personal Exposure on Promoters/Officers', 14, currentY)
  currentY += 3

  const penaltyRows = [
    ['Statutory Penalty Regime', data.penaltyRegime, 'Govt Statutory Rule'],
    ['Daily Statutory Default Rate', 'Rs. 1,000 per day of continuing default', formatInr(data.dailyPenaltyRate) + '/day'],
    ['Company Adjudication Liability', `Capped at ${formatInr(data.companyPenaltyCap)}`, formatInr(data.companyPenalty)],
    [
      `Personal Liability: ${data.individualRoleTitle}`,
      `${data.numIndividuals} individual(s) at ${formatInr(data.perIndividualPenalty)} each (Cap: ${formatInr(data.individualPenaltyCap)})`,
      formatInr(data.totalIndividualPenalty)
    ],
    ['Section 446B Statutory Relief', data.section446BApplied ? `50% Concession Applied (Saved ${formatInr(data.savingsFrom446B)})` : 'Not Applicable (Standard Scale)', data.section446BApplied ? `-${formatInr(data.savingsFrom446B)}` : 'NIL'],
    [
      { content: 'Total Adjudication Liability', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: 'Company Penalty + Promoters/Directors Personal Penalty', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: formatInr(data.totalAdjudicationPenalty), styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } }
    ],
    [
      { content: 'COMPREHENSIVE FINANCIAL EXPOSURE', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255] } },
      { content: 'MCA Portal Challan + Maximum Potential Adjudication Fines', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255] } },
      { content: formatInr(data.totalFinancialExposure), styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255] } }
    ]
  ]

  autoTable(doc, {
    startY: currentY,
    head: [['Liability Head', 'Governing Provision & Calculation', 'Exposure']],
    body: cleanTableData(penaltyRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 85 },
      2: { cellWidth: 40, halign: 'right' }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // 5. Compliance Findings, Warnings & Precedents
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_PALETTE.navy)
  doc.text('3. Compliance Findings, Red Flags & Statutory Observations', 14, currentY)
  currentY += 3

  const findingsRows: any[] = []

  if (data.criticalBreaches.length > 0) {
    data.criticalBreaches.forEach(cb => {
      findingsRows.push([
        { content: '[CRITICAL BREACH]', styles: { fontStyle: 'bold' as const, textColor: PDF_PALETTE.red } },
        cb
      ])
    })
  }

  if (data.warnings.length > 0) {
    data.warnings.forEach(w => {
      findingsRows.push([
        { content: '[WARNING / RISK]', styles: { fontStyle: 'bold' as const, textColor: PDF_PALETTE.amber } },
        w
      ])
    })
  }

  if (data.passedChecks.length > 0) {
    data.passedChecks.forEach(pc => {
      findingsRows.push([
        { content: '[PASSED CHECK]', styles: { fontStyle: 'bold' as const, textColor: PDF_PALETTE.green } },
        pc
      ])
    })
  }

  // Add 2026 ROC Precedent Note
  findingsRows.push([
    { content: '[2026 ROC PRECEDENT]', styles: { fontStyle: 'bold' as const, textColor: PDF_PALETTE.blue } },
    'ROC Chennai Adjudication (5 March 2026): Company filed PAS-3 46 days after private placement allotment. ROC held that closing of round does not cure late filing and penalised company, promoters, and directors personally under Section 42(9).'
  ])

  autoTable(doc, {
    startY: currentY,
    head: [['Status Category', 'Statutory Finding / Observation']],
    body: cleanTableData(findingsRows),
    theme: 'grid',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 145 }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 4

  // Check if disclaimer fits on current page, else add page
  if (currentY > 260) {
    doc.addPage()
    currentY = 20
  }

  // 6. Safe Legal Disclaimer
  const disclaimerText =
    'This calculation report is generated for corporate secretarial evaluation and informational purposes based on user-provided inputs and prevailing MCA rules. It does not constitute formal legal counsel. For statutory filing and compounding representation, consult a qualified Practising Company Secretary (PCS) or legal counsel.'
  renderSafeDisclaimer(doc, disclaimerText, currentY, { fontSize: 6.8 })

  // 7. Render Professional Page Footers
  renderPageFooters(doc, 'CorpLawUpdates.in • PAS-3 Statutory Compliance Report • Confidential')

  return doc
}
