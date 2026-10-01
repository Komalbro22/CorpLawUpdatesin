import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Mgt14CalculationResult,
  MGT14_PURPOSES,
  formatInr
} from '@/lib/rule-engine/mgt14-engine'
import {
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export interface Mgt14PdfExtraMeta {
  companyName?: string
  cin?: string
  professionalFirm?: string
}

export function generateMgt14Pdf(
  data: Mgt14CalculationResult,
  extraMeta?: Mgt14PdfExtraMeta
): jsPDF {
  const doc = new jsPDF()
  doc.setFont('helvetica')

  // 1. Header
  const startY = renderDocumentHeader(doc, {
    title: 'FORM MGT-14: RESOLUTIONS & AGREEMENTS FILING & FEE REPORT',
    subtitle: 'Section 117 & 446B, Companies Act, 2013 | Rule 24, Management & Administration Rules, 2014 | Table A & Table B Fee Rules',
    dateLabel: 'Assessment Date'
  })

  let currentY = startY + 4

  // 2. Metadata Section
  const companyTypeLabel =
    data.input.companyType === 'small_company' ? 'Small Company (Sec 2(85)) - Eligible for Sec 446B' :
    data.input.companyType === 'startup' ? 'DPIIT Recognised Startup - Eligible for Sec 446B' :
    data.input.companyType === 'opc' ? 'One Person Company (OPC) - Eligible for Sec 446B' :
    data.input.companyType === 'producer' ? 'Producer Company - Eligible for Sec 446B' :
    'Standard Corporate Entity'

  const selectedPurpose = MGT14_PURPOSES.find(p => p.id === data.input.purposeId)
  const purposeLabel = selectedPurpose ? selectedPurpose.label : 'General Resolution Filing (Section 117)'

  const metaRows = [
    [
      { content: 'Company / Entity', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.companyName || 'Corporate Entity',
      { content: 'CIN / Corporate ID', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.cin || 'Not Specified'
    ],
    [
      { content: 'Entity Classification', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      companyTypeLabel,
      { content: 'IFSC Entity Status', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.input.isIfscCompany ? 'Yes (60-day window per GSR 8(E)/9(E))' : 'No (Standard 30-day window)'
    ],
    [
      { content: 'Nominal Share Capital', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.input.hasShareCapital ? formatInr(data.input.nominalShareCapital) : 'Company without share capital',
      { content: 'Event Category', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.input.eventType.replace('_', ' ').toUpperCase()
    ],
    [
      { content: 'Resolution / Purpose', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      purposeLabel,
      { content: 'Governing Section', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      selectedPurpose ? selectedPurpose.sectionRef : 'Section 117(3)'
    ],
    [
      { content: 'Event / Passing Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.input.eventDate,
      { content: 'Filing / Evaluation Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.input.filingDate
    ],
    [
      { content: 'Statutory Window', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.filingWindowDays} Calendar Days (Due Date: ${data.dueDate})`,
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

  // 3. MCA V3 Portal Fee Computation (Table A & Table B)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feeRows: any[] = [
    [
      'Normal Filing Fee (Table A)',
      data.input.hasShareCapital
        ? `Nominal Capital: ${formatInr(data.input.nominalShareCapital)}`
        : 'Company not having share capital (Flat fee)',
      formatInr(data.normalFee)
    ],
    [
      'Table B Additional Late Filing Fee',
      data.isDelayed
        ? `${data.delayDays} calendar day(s) delay (${data.additionalFeeMultiplier}× normal fee)`
        : 'Filed on or before statutory due date (Zero additional fee)',
      formatInr(data.additionalFee)
    ],
    [
      { content: 'Total MCA Portal e-Challan', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: 'Normal Base Fee + Table B Delay Multiplier', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      { content: formatInr(data.totalPortalFee), styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray, textColor: PDF_PALETTE.navy } }
    ]
  ]

  autoTable(doc, {
    startY: currentY,
    head: [['Fee Component (MCA V3 Portal)', 'Regulatory Basis / Slab Calculation', 'Payable Amount (INR)']],
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

  // 4. Section 117(2) Statutory Adjudication Penalties (Separate from Portal Fee)
  const officersCount = Math.max(1, data.input.numOfficersInDefault || 1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const penaltyRows: any[] = [
    [
      'Company Penalty (Section 117(2))',
      data.isDelayed
        ? `₹10,000 base + ₹100/day for continuing failure (Capped at ${formatInr(data.statutoryMaxCompanyPenalty)})`
        : 'Nil (Filed within statutory window)',
      formatInr(data.totalCompanyPenalty)
    ],
    [
      `Officers in Default (${officersCount} officer(s))`,
      data.isDelayed
        ? `${formatInr(data.totalOfficerPenaltyPerPerson)} each (Capped at ${formatInr(data.statutoryMaxOfficerPenalty)} each)`
        : 'Nil (Filed within statutory window)',
      formatInr(data.totalAllOfficersPenalty)
    ],
    [
      { content: 'Estimated Adjudication Exposure (ROC Sec 454)', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: data.is446BEligible ? 'Section 446B Relief Applied: Penalty capped at 50% for eligible entity' : 'Standard Section 117(2) Statutory Regime', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: formatInr(data.totalStatutoryPenaltyExposure), styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray, textColor: [180, 0, 0] } }
    ]
  ]

  if (data.is446BEligible && data.reliefAmountSaved > 0) {
    penaltyRows.push([
      { content: 'Section 446B Relief Benefit', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: '50% statutory discount on adjudication penalty liabilities', styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray } },
      { content: `(-) ${formatInr(data.reliefAmountSaved)}`, styles: { fontStyle: 'bold', fillColor: PDF_PALETTE.lightGray, textColor: [0, 128, 0] } }
    ])
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Statutory Adjudication Liability', 'Formula / Statutory Limits', 'Estimated Exposure (INR)']],
    body: cleanTableData(penaltyRows),
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

  // 5. Condonation of Delay Warning if >300 Days
  if (data.requiresCondonation && currentY < 230) {
    const condonationText = [
      'CRITICAL PROCEDURAL REQUIREMENT: CONDONATION OF DELAY BEYOND 300 DAYS',
      'The event date exceeds 300 calendar days from the proposed filing date. Under the official MCA Form MGT-14 Instruction Kit and Section 460(b), the MCA V3 portal blocks direct upload without condonation.',
      'Mandatory Procedural Sequence: (1) Apply to Central Government / Regional Director via Form CG-1; (2) Obtain formal Condonation Order; (3) File the Order with ROC via Form INC-28; (4) Cite the approved INC-28 SRN in Form MGT-14 to complete filing.'
    ]
    doc.setFillColor(254, 242, 242)
    doc.setDrawColor(220, 38, 38)
    doc.rect(14, currentY, 182, 24, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(185, 28, 28)
    doc.text(condonationText[0], 18, currentY + 5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(127, 29, 29)
    doc.text(condonationText[1], 18, currentY + 11, { maxWidth: 174 })
    doc.text(condonationText[2], 18, currentY + 17, { maxWidth: 174 })
    currentY += 28
  }

  // 6. Purpose Attachments Checklist
  if (selectedPurpose && selectedPurpose.requiredAttachments.length > 0 && currentY < 240) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attachmentRows: any[] = selectedPurpose.requiredAttachments.map((att, idx) => [
      `Attachment ${idx + 1}`,
      att
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Sr.', `Mandatory Attachments for ${selectedPurpose.sectionRef} Filing`]],
      body: cleanTableData(attachmentRows),
      theme: 'grid',
      headStyles: { fillColor: PDF_PALETTE.slate, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2, textColor: PDF_PALETTE.navy },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 160 }
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable.finalY + 6
  }

  // 7. Statutory Disclaimer
  renderSafeDisclaimer(
    doc,
    'LEGAL NOTICE & STATUTORY DISCLAIMER: 1. This MGT-14 calculation report is an automated compliance intelligence tool generated for internal working papers, regulatory audits, and client advisory. 2. The exact portal filing fee is determined by the MCA V3 portal upon XML form generation and e-Challan generation based on Companies (Registration Offices and Fees) Rules, 2014. 3. Statutory adjudication penalties under Section 117(2) are independent of portal filing fees and can only be levied by the Registrar of Companies pursuant to quasi-judicial adjudication under Section 454 of the Companies Act, 2013. 4. Private Limited Companies are exempt from filing Board Resolutions passed under Section 179(3) pursuant to MCA Exemption Notification No. G.S.R. 464(E) dated 5th June 2015.',
    currentY
  )

  // 8. Page Footers
  renderPageFooters(doc, 'CorpLawUpdates.in | Form MGT-14 Statutory Fee & Adjudication Report')

  return doc
}
