import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface Adt1PdfData {
  companyName?: string
  nominalCapital: number
  hasShareCapital: boolean
  appointmentType: 'agm' | 'casual_vacancy' | 'first_auditor'
  calcMode: 'date' | 'days'
  meetingDate?: string
  statutoryDueDate?: string | null
  actualFilingDate?: string
  calculatedDelayDays: number
  normalFee: number
  multiplier: number
  additionalFee: number
  totalFee: number
  isCondonation: boolean
}

export function generateAdt1Pdf(data: Adt1PdfData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Executive Palette
  const navy: [number, number, number] = [15, 23, 42]      // #0F172A
  const blue: [number, number, number] = [37, 99, 235]     // #2563EB
  const slate: [number, number, number] = [71, 85, 105]    // #475569
  const gray: [number, number, number] = [100, 116, 139]   // #64748B
  const red: [number, number, number] = [220, 38, 38]      // #DC2626
  const green: [number, number, number] = [16, 185, 129]   // #10B981

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
  doc.text('FORM ADT-1 — STATUTORY AUDITOR APPOINTMENT FEE & DELAY CERTIFICATE', 14, 32)

  const printDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  doc.setFontSize(8)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')
  doc.text(`Certificate Date: ${printDate}`, pageWidth - 14, 32, { align: 'right' })

  // Divider line
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.5)
  doc.line(14, 36, pageWidth - 14, 36)

  // Appointment Type Label
  let apptLabel = 'Annual General Meeting (AGM) — Section 139(1) [5-Year Term]'
  if (data.appointmentType === 'casual_vacancy') {
    apptLabel = 'Casual Vacancy Appointment — Section 139(8) [Board / EGM]'
  } else if (data.appointmentType === 'first_auditor') {
    apptLabel = 'First Auditor Appointment — Section 139(6) [Board Meeting]'
  }

  // 1. Filing & Entity Parameters Table
  const parameterRows: any[] = [
    ['Form Number & Title', 'Form ADT-1 (Notice to Registrar of Appointment of Auditor)', 'Section 139(1), 139(6), 139(8) read with Rule 4(2)'],
    ['Company Name', data.companyName ? data.companyName.toUpperCase() : 'Not Specified (Generic Estimation)', 'As registered on MCA21 portal'],
    ['Appointment Context', apptLabel, 'Statutory term & legal appointment mechanism'],
    ['Nominal / Authorized Capital', data.hasShareCapital ? `INR ${data.nominalCapital.toLocaleString('en-IN')}` : 'Company without Share Capital', 'Table A (Items 5 & 6) fee slab determinant']
  ]

  if (data.calcMode === 'date') {
    parameterRows.push(
      ['Meeting / Appointment Date', data.meetingDate || '—', 'Day 0 of statutory timeline computation'],
      ['Statutory Due Date', data.statutoryDueDate || '—', 'Strict 15-day deadline pursuant to Rule 4(2)'],
      ['Actual / Filing Date', data.actualFilingDate || '—', 'Benchmark date considered for delay computation']
    )
  }

  parameterRows.push(
    ['Delay Assessment', data.calculatedDelayDays > 0 ? `${data.calculatedDelayDays} Day(s) Overdue` : 'COMPLIANT (Timely Filing)', data.calculatedDelayDays > 0 ? `Delay attracts ${data.multiplier}x Table B multiplier` : 'Filing within statutory 15-day window'],
    ['MCA Approval Mode', 'Straight Through Process (STP) — Auto Approval', 'Auto-processed upon successful challan generation'],
    ['Section 403 Condonation Status', data.isCondonation ? 'CONDONATION REQUIRED (> 270 Days Delay)' : 'STANDARD E-FILING ELIGIBLE', data.isCondonation ? 'Requires prior Form CG-1 application to RD' : 'Direct upload on MCA V3 allowed']
  )

  autoTable(doc, {
    startY: 40,
    theme: 'grid',
    head: [['Compliance Parameter', 'Particulars', 'Statutory Basis & Notes']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: parameterRows,
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { fontStyle: 'bold', cellWidth: 65 },
      2: { cellWidth: 67 }
    }
  })

  // 2. MCA21 Portal Payable Breakdown Table
  const finalYParams = (doc as any).lastAutoTable.finalY + 5

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. MCA21 Portal Fee Payable (e-Challan Checkout)', 14, finalYParams)

  const portalRows: any[] = [
    [
      'Normal Government Filing Fee',
      data.hasShareCapital ? `Governed by Table A, Item 5 (Capital: INR ${data.nominalCapital.toLocaleString('en-IN')})` : 'Governed by Table A, Item 6 (Without Share Capital)',
      `INR ${data.normalFee.toLocaleString('en-IN')}`
    ],
    [
      'Additional Filing Fee (Delay Multiplier)',
      data.calculatedDelayDays === 0
        ? 'No delay — filed within 15-day statutory window (0x)'
        : `Governed by Table B, Rule 12 (${data.calculatedDelayDays} days delay = ${data.multiplier}x Normal Fee)`,
      `INR ${data.additionalFee.toLocaleString('en-IN')}`
    ],
    [
      { content: 'TOTAL MCA21 CHALLAN PAYABLE', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'Payable online via Bharatkosh / MCA21 Gateway upon form submission', styles: { fontStyle: 'italic', fillColor: [241, 245, 249] } },
      { content: `INR ${data.totalFee.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }
    ]
  ]

  autoTable(doc, {
    startY: finalYParams + 3,
    theme: 'grid',
    head: [['Fee Component', 'Calculation Basis / Statutory Rule', 'Payable Amount']],
    headStyles: { fillColor: blue, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: portalRows,
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', cellWidth: 42, halign: 'right' }
    }
  })

  // 3. Statutory Compliance Guidelines & Checklist Table
  const finalYPortal = (doc as any).lastAutoTable.finalY + 5

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. Regulatory Guidelines & Mandatory Attachments (MCA V3)', 14, finalYPortal)

  const complianceRows: any[] = [
    [
      'Notification G.S.R. 359(E) (w.e.f. 14-Jul-2025)',
      'MCA amended Rule 4(2) to explicitly require Form ADT-1 for the First Auditor within 15 days of Board Meeting under Section 139(6). Ambiguity resolved; backdating prohibited.'
    ],
    [
      'STP Auto-Approval & Backdating Prohibition',
      'Form ADT-1 processes via Straight Through Process (STP). MCA V3 system validates dates and prevents backdated appointments. Strict accuracy of meeting dates is mandatory.'
    ],
    [
      'Mandatory Attachment 1: Auditor Written Consent',
      'Written consent letter from statutory auditor/firm pursuant to Section 139(1) second proviso.'
    ],
    [
      'Mandatory Attachment 2: Eligibility Certificate',
      'Section 141 certificate certifying auditor is not disqualified and is within 20-company statutory ceiling.'
    ],
    [
      'Mandatory Attachment 3: Resolution Copy',
      'Certified true copy of Board resolution (First Auditor / Casual vacancy) or AGM ordinary resolution (5-year term).'
    ],
    [
      'Mandatory Attachment 4: Appointment Letter',
      'Copy of formal appointment intimation dispatched by company to incoming auditor pursuant to Section 139(1).'
    ]
  ]

  if (data.isCondonation) {
    complianceRows.unshift([
      'CRITICAL: Section 403 Condonation (> 270 Days)',
      'Delay exceeds 270 days. As per Section 403 second proviso, belated Form ADT-1 cannot be filed directly without prior condonation order from Regional Director (RD) via Form CG-1.'
    ])
  }

  autoTable(doc, {
    startY: finalYPortal + 3,
    theme: 'grid',
    head: [['Regulatory Provision / Document', 'Compliance Mandate & MCA V3 Verification']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: complianceRows,
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 62 },
      1: { cellWidth: 120 }
    }
  })

  // Mandatory Statutory Disclaimer
  const finalYComp = (doc as any).lastAutoTable.finalY + 5
  doc.setFontSize(6.8)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')

  const disclaimer =
    "LEGAL DISCLAIMER & STATUTORY NOTICE: This calculation memorandum is automatically generated by CorpLawUpdates.in for professional reference and fee estimation based on user inputs and Table B of the Companies (Registration Offices and Fees) Rules, 2014. Form ADT-1 does NOT attract ₹100/day penalties (which apply exclusively to AOC-4 & MGT-7). MCA portal records and generated challans represent the final authority. For delays beyond 270 days, prior condonation of delay under Section 403(1) is mandatory."

  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28)
  doc.text(splitDisclaimer, 14, finalYComp)

  return doc
}
