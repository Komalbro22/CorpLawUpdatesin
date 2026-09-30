import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Sh7CalculationResult,
  formatInr
} from '@/lib/rule-engine/sh7-engine'
import {
  cleanTableData,
  cleanPdfText,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export interface Sh7PdfExtraMeta {
  companyName?: string
  cin?: string
  professionalFirm?: string
}

export function generateSh7Pdf(
  data: Sh7CalculationResult,
  extraMeta?: Sh7PdfExtraMeta
): jsPDF {
  const doc = new jsPDF()
  doc.setFont('helvetica')

  // 1. Header
  const startY = renderDocumentHeader(doc, {
    title: 'FORM SH-7: ALTERATION OF SHARE CAPITAL & FEE REPORT',
    subtitle: 'Sections 61, 64 & 446B, Companies Act, 2013 read with Share Capital Rules, 2014 | MCA V3 Compliance Analysis',
    dateLabel: 'Assessment Date'
  })

  let currentY = startY + 4

  // 2. Metadata Section
  const alterationModeLabel =
    data.alterationType === 'increase_authorised_capital' ? 'Increase in Authorised Share Capital (Sec 61(1)(a))' :
    data.alterationType === 'consolidation_division' ? 'Consolidation of Shares (Sec 61(1)(b))' :
    data.alterationType === 'sub_division' ? 'Sub-division of Shares (Sec 61(1)(d))' :
    data.alterationType === 'cancellation_diminution' ? 'Cancellation / Diminution of Capital (Sec 61(1)(e))' :
    data.alterationType === 'conversion_stock' ? 'Conversion into Stock / Reconversion (Sec 61(1)(c))' :
    data.alterationType === 'redemption_preference_shares' ? 'Redemption of Preference Shares (Sec 55)' :
    'Govt Order Increase in Capital (Sec 62(4))'

  const companyTypeLabel =
    data.companyType === 'small_company' ? 'Small Company (Sec 2(85))' :
    data.companyType === 'startup' ? 'DPIIT Recognised Startup (Sec 446B)' :
    data.companyType === 'opc' ? 'One Person Company (OPC)' :
    data.companyType === 'producer' ? 'Producer Company (Sec 446B)' :
    'Standard Corporate Entity'

  const metaRows = [
    [
      { content: 'Company / Entity', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.companyName || 'Corporate Entity',
      { content: 'CIN / Corporate ID', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.cin || 'Not Specified'
    ],
    [
      { content: 'Nature of Alteration', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      alterationModeLabel,
      { content: 'Entity Classification', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      companyTypeLabel
    ],
    [
      { content: 'Existing Authorised Capital', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      formatInr(data.existingAuthorisedCapital),
      { content: 'New Authorised Capital', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      formatInr(data.newAuthorisedCapital)
    ],
    [
      { content: 'General Meeting Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.resolutionDate,
      { content: 'Evaluation / Filing Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.filingDate
    ],
    [
      { content: 'Statutory Window', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.statutoryDeadlineDays} Calendar Days (Due: ${data.statutoryDueDate})`,
      { content: 'Filing Status', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.isDelayed
        ? `BELATED by ${data.delayDays} day(s)`
        : 'TIMELY / ON-SCHEDULE (Zero Late Fee)'
    ]
  ]

  autoTable(doc, {
    startY: currentY,
    body: cleanTableData(metaRows),
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 50 },
      2: { cellWidth: 45 },
      3: { cellWidth: 50 }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // 3. Financial Liability & Fee Matrix
  const isCapIncrease = data.incrementalCapitalRegistrationFee > 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feeRows: any[] = []

  if (isCapIncrease) {
    feeRows.push([
      'Differential Capital Registration Fee (Item II)',
      'Statutory Fee(New Capital) minus Fee(Existing Capital)',
      formatInr(data.incrementalCapitalRegistrationFee)
    ])
    feeRows.push([
      'Additional Late Filing Fee (Item B Percentage Rule)',
      data.isDelayed
        ? `${data.delayDays} days delay (${data.delayMonths} mo) · ${(data.lateFeePercentage * 100).toFixed(1)}% on differential fee`
        : 'Filed within 30-day statutory window (Zero late fee)',
      formatInr(data.additionalLateFee)
    ])
    if (data.estimatedStampDuty > 0) {
      const stampBasis = data.stampDutyConfig
        ? `${data.stampDutyConfig.name}: ${data.stampDutyConfig.rateDescription}`
        : `Payable via MCA V3 e-Stamping (${data.state.toUpperCase()})`
      feeRows.push([
        'Estimated State Stamp Duty (MOA)',
        stampBasis,
        formatInr(data.estimatedStampDuty)
      ])
    }
    feeRows.push([
      { content: 'Total MCA Portal e-Challan', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: 'Differential Capital Fee + Late Fee + Stamp Duty', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: formatInr(data.totalMcaChallanFee), styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray, textColor: PDF_PALETTE.navy } }
    ])
  } else {
    feeRows.push([
      'Normal MCA e-Form Fee (Table A)',
      data.feeSlabLabel,
      formatInr(data.normalFee)
    ])
    feeRows.push([
      'Table B Late Filing Multiplier',
      data.isDelayed
        ? `${data.lateMultiplier}× normal fee (${data.delayDays} days delay)`
        : 'Filed within 30-day statutory window (Zero late fee)',
      formatInr(data.additionalLateFee)
    ])
    feeRows.push([
      { content: 'Total MCA Portal e-Challan', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: 'Normal Base Fee + Table B Delay Multiplier', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: formatInr(data.totalMcaChallanFee), styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray, textColor: PDF_PALETTE.navy } }
    ])
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Fee Component (MCA V3 Portal)', 'Basis / Regulatory Reference', 'Payable Amount (INR)']],
    body: cleanTableData(feeRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 75 },
      2: { cellWidth: 45, halign: 'right' }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // 4. Section 64(2) Statutory Adjudication Penalties (Quasi-Judicial ROC Exposure)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const penaltyRows: any[] = [
    [
      'Company Penalty (Section 64(2))',
      `${formatInr(data.dailyPenaltyRate)}/day × ${data.delayDays} days (Capped at ${formatInr(data.companyPenaltyCap)})`,
      formatInr(data.companyPenalty)
    ],
    [
      `Officers in Default (${data.numOfficers} persons)`,
      `${formatInr(data.dailyPenaltyRate)}/day × ${data.delayDays} days (Capped at ${formatInr(data.officerPenaltyCap)} each)`,
      formatInr(data.totalOfficersPenalty)
    ],
    [
      { content: 'Total Adjudication Liability (ROC Sec 454)', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: data.section446BApplied ? 'Illustrative maximum based on one-half of the statutory penalty rate: ₹250/day (Section 446B: penalty shall not be more than one-half; Company cap ₹2L, Officer statutory cap ₹1L)' : 'Standard Corporate Penalty Regime (Sec 64(2): ₹500/day, Co max ₹5L, Officer max ₹1L)', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: formatInr(data.totalAdjudicationPenalty), styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray, textColor: [180, 0, 0] } }
    ]
  ]

  if (data.section446BApplied && data.savingsFrom446B > 0) {
    penaltyRows.push([
      { content: 'Section 446B Relief Savings', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: 'Statutory 50% discount for Small Companies / Startups', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: `(-) ${formatInr(data.savingsFrom446B)}`, styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray, textColor: [0, 128, 0] } }
    ])
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Statutory Adjudication Liability (Sec 454)', 'Computation Rule & Statutory Ceiling', 'Exposure (INR)']],
    body: cleanTableData(penaltyRows),
    theme: 'striped',
    headStyles: { fillColor: [180, 50, 50], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 75 },
      2: { cellWidth: 45, halign: 'right' }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // 5. Total Combined Exposure Summary Box
  const summaryRows = [
    [
      { content: 'TOTAL ESTIMATED FINANCIAL EXPOSURE', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.navy, textColor: 255 } },
      { content: 'Total MCA Challan + Total Section 64(2) Adjudication Exposure', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.navy, textColor: 255 } },
      { content: formatInr(data.totalFinancialExposure), styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.navy, textColor: 255, halign: 'right' as const } }
    ]
  ]

  autoTable(doc, {
    startY: currentY,
    body: cleanTableData(summaryRows),
    theme: 'plain',
    styles: { fontSize: 9.5, cellPadding: 3.5 }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // 6. Mandatory Attachments
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.text('MANDATORY ATTACHMENTS CHECKLIST (RULE 15)', 14, currentY)
  currentY += 4

  const attachmentRows = data.mandatoryAttachments.map((att, idx) => [
    `[  ] ${idx + 1}.`,
    cleanPdfText(att)
  ])

  autoTable(doc, {
    startY: currentY,
    body: attachmentRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 178 }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 4

  // 7. Footer & Disclaimer
  const disclaimer = 'Statutory Disclaimer: This computation is generated strictly for informational and compliance planning purposes based on the Companies Act, 2013, the Companies (Share Capital and Debentures) Rules, 2014, and the Companies (Registration Offices and Fees) Rules, 2014. Section 64(2) penalties are quasi-judicial adjudication liabilities administered by the ROC under Section 454; they are not paid on the MCA portal filing challan. Final filing fees, late fees, and stamp duties are subject to official MCA V3 portal validations and state stamp rules.'
  renderSafeDisclaimer(doc, disclaimer, currentY, { fontSize: 6.8 })
  renderPageFooters(doc)

  return doc
}
