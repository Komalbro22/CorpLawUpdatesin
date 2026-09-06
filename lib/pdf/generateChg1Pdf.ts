import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export interface Chg1PdfData {
  companyName?: string
  lenderName?: string
  nominalCapital: number
  hasShareCapital: boolean
  isSmallOrOpc: boolean
  chargeNature: 'creation' | 'modification' | 'foreign_property'
  chargeAmount: number
  calcMode: 'date' | 'days'
  creationDate?: string
  statutoryDueDate?: string | null
  firstExtensionDate?: string | null
  finalRocExtensionDate?: string | null
  actualFilingDate?: string
  daysFromCreation?: number
  calculatedDelayDays: number
  normalFee: number
  multiplier: number
  multiplierFee?: number
  additionalFee?: number
  adValoremPercent?: number
  adValoremFee: number
  adValoremCapped?: boolean
  maxAdValoremCap?: number
  totalFee: number
  isCondonation: boolean
}

export function generateChg1Pdf(data: Chg1PdfData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  doc.setFont('helvetica')

  // Top Header Banner with safe non-colliding title and date
  const startY = renderDocumentHeader(doc, {
    title: 'FORM CHG-1 - STATUTORY CHARGE REGISTRATION & FEE MEMORANDUM',
    subtitle: 'Chapter VI (Sections 77, 78 & 79), Companies Act, 2013 & Registration Rules',
    dateLabel: 'Certificate Date'
  })

  // Charge Nature Label
  let natureLabel = 'Creation of Charge (Section 77)'
  if (data.chargeNature === 'modification') {
    natureLabel = 'Modification of Charge (Section 79)'
  } else if (data.chargeNature === 'foreign_property') {
    natureLabel = 'Charge on Foreign Property / Assets outside India (Section 77 Proviso)'
  }

  // 1. Entity & Secured Facility Parameters Table
  const parameterRows: any[] = [
    ['Form Number & Title', 'Form CHG-1 (Application for registration of creation/modification of charge)', 'Section 77, 78 & 79 read with Rule 3, 4 & 12'],
    ['Company Name', data.companyName ? data.companyName.toUpperCase() : 'Not Specified (Generic Assessment)', 'Borrower / Chargor entity registered on MCA21 portal'],
    ['Entity Classification', data.isSmallOrOpc ? 'Small Company / One Person Company (OPC)' : 'Other Company (Standard Private / Public Limited)', data.isSmallOrOpc ? 'Eligible for 3x multiplier & 0.025% ad-valorem (max 1L)' : 'Subject to 6x multiplier & 0.05% ad-valorem (max 5L)'],
    ['Nature of Transaction', natureLabel, 'Statutory transaction category under Chapter VI'],
    ['Charge Secured Amount', `INR ${data.chargeAmount.toLocaleString('en-IN')}`, 'Principal / Sanctioned credit facility secured by charge'],
    ['Lender / Charge-Holder', data.lenderName ? data.lenderName.toUpperCase() : 'Scheduled Commercial Bank / Financial Institution', 'Beneficiary secured creditor / Chargee'],
    ['Nominal / Authorized Capital', data.hasShareCapital ? `INR ${data.nominalCapital.toLocaleString('en-IN')}` : 'Company without Share Capital', 'Table A (Items 5 & 6) base filing fee determinant']
  ]

  if (data.calcMode === 'date') {
    parameterRows.push(
      ['Date of Charge Creation', data.creationDate || '-', 'Day 0 of Chapter VI statutory timeline'],
      ['Initial Due Date (30 Days)', data.statutoryDueDate || '-', 'Normal fee window under Section 77(1)'],
      ['ROC Final Cutoff (120 Days)', data.finalRocExtensionDate || '-', 'Absolute statutory limit for ROC registration without RD order'],
      ['Actual / Planned Filing Date', data.actualFilingDate || '-', 'Benchmark date considered for fee computation']
    )
  }

  let delayStatusText = 'COMPLIANT - On-Time Filing (Within 30-Day Window)'
  let delaySubtext = 'Eligible for base filing fee only'
  if (data.isCondonation) {
    delayStatusText = 'HARD STOP - SECTION 87 CONDONATION REQUIRED'
    delaySubtext = 'Exceeds 120 days from creation (delay > 90 days). ROC direct filing barred. Requires Form CHG-8 to RD.'
  } else if (data.calculatedDelayDays > 30) {
    delayStatusText = `DELAYED by ${data.calculatedDelayDays} day(s) (Days 61-120 Window)`
    delaySubtext = `Attracts maximum Table B multiplier (${data.multiplier}x) PLUS Ad-Valorem statutory fee`
  } else if (data.calculatedDelayDays > 0) {
    delayStatusText = `DELAYED by ${data.calculatedDelayDays} day(s) (Days 31-60 Window)`
    delaySubtext = `Attracts Table B delay multiplier (${data.multiplier}x base fee)`
  }

  parameterRows.push(
    ['Delay Assessment', delayStatusText, delaySubtext],
    ['Condonation Status', data.isCondonation ? 'MANDATORY (Form CHG-8 to RD)' : 'NOT REQUIRED (Within ROC Jurisdiction)', data.isCondonation ? 'Form INC-28 required post-order before CHG-1 upload' : 'Direct upload eligible on MCA V3 portal']
  )

  autoTable(doc, {
    startY: startY,
    theme: 'grid',
    head: [['Compliance Parameter', 'Particulars', 'Statutory Basis & Legal Rules']],
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    body: cleanTableData(parameterRows),
    styles: { fontSize: 7, cellPadding: 1.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { fontStyle: 'bold', cellWidth: 63 },
      2: { cellWidth: 69 }
    },
    margin: { left: 14, right: 14 }
  })

  // 2. MCA21 Portal Payable Breakdown Table
  const finalYParams = (doc as any).lastAutoTable.finalY + 4

  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. MCA21 Portal Fee Payable Breakdown (e-Challan Checkout)', 14, finalYParams)

  let portalRows: any[] = []

  if (data.isCondonation) {
    portalRows = [
      [
        'Normal Statutory Filing Fee',
        `Table A, Item 5 (Capital: INR ${data.nominalCapital.toLocaleString('en-IN')})`,
        'Deferred Pending RD Order'
      ],
      [
        'ROC Additional & Ad-Valorem Fees',
        'Section 77(1) second proviso - ROC cannot compute or accept fees directly after 90 days',
        'Direct Payment Blocked'
      ],
      [
        { content: 'SECTION 87 CONDONATION REQUIRED', styles: { fontStyle: 'bold', fillColor: [254, 242, 242], textColor: PDF_PALETTE.red } },
        { content: 'Form CHG-8 must be filed with Regional Director along with petition & affidavit', styles: { fontStyle: 'italic', fillColor: [254, 242, 242], textColor: PDF_PALETTE.red } },
        { content: 'Subject to RD Penalty', styles: { fontStyle: 'bold', fillColor: [254, 242, 242], textColor: PDF_PALETTE.red } }
      ]
    ]
  } else {
    const additionalAmount = data.additionalFee ?? data.multiplierFee ?? 0
    portalRows = [
      [
        '1. Normal Government Filing Fee',
        data.hasShareCapital
          ? `Table A, Item 5 (Authorized Capital: INR ${data.nominalCapital.toLocaleString('en-IN')})`
          : 'Table A, Item 6 (Without Share Capital)',
        `INR ${data.normalFee.toLocaleString('en-IN')}`
      ],
      [
        `2. Additional Fee (${data.multiplier}x Multiplier)`,
        data.calculatedDelayDays === 0
          ? 'Filed within initial 30 days of creation - No delay fee'
          : `Table B, Rule 12 (${data.isSmallOrOpc ? 'Small/OPC: 3x' : 'Other: 6x'} base fee for delay beyond 30 days)`,
        `INR ${additionalAmount.toLocaleString('en-IN')}`
      ]
    ]

    if (data.adValoremFee > 0) {
      portalRows.push([
        '3. Ad-Valorem Fee (Section 77 Proviso)',
        data.isSmallOrOpc
          ? `0.025% of charge amount (INR ${data.chargeAmount.toLocaleString('en-IN')}), capped at INR 1,00,000`
          : `0.05% of charge amount (INR ${data.chargeAmount.toLocaleString('en-IN')}), capped at INR 5,00,000`,
        `INR ${data.adValoremFee.toLocaleString('en-IN')}`
      ])
    }

    portalRows.push([
      { content: 'TOTAL MCA21 CHALLAN PAYABLE', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      {
        content: 'Payable online via Bharatkosh / MCA21 Gateway upon form submission',
        styles: { fontStyle: 'italic', fillColor: [241, 245, 249] }
      },
      {
        content: `INR ${data.totalFee.toLocaleString('en-IN')}`,
        styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] }
      }
    ])
  }

  autoTable(doc, {
    startY: finalYParams + 2.5,
    theme: 'grid',
    head: [['Fee Component', 'Calculation Basis / Statutory Rule', 'Payable Amount']],
    headStyles: { fillColor: PDF_PALETTE.blue, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    body: cleanTableData(portalRows),
    styles: { fontSize: 7, cellPadding: 1.6, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] },
      1: { cellWidth: 88 },
      2: { fontStyle: 'bold', cellWidth: 39, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  })

  // 3. Regulatory Guidelines & MCA V3 Checklist
  const finalYChecklist = (doc as any).lastAutoTable.finalY + 4

  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. Regulatory Roadmap & MCA V3 Filing Safeguards', 14, finalYChecklist)

  const guidanceRows: any[] = [
    [
      'Section 77 Timeline Framework',
      'Charges created on/after 02.11.2018 have a strict 3-tier timeline: (1) Days 0-30: Normal fee; (2) Days 31-60: 3x/6x fee; (3) Days 61-120: 3x/6x + Ad Valorem (0.025%/0.05% capped at 1L/5L). Beyond 120 days (delay > 90 days), ROC has NO jurisdiction to register.'
    ],
    [
      'Section 87 Condonation Warning',
      data.isCondonation
        ? 'CRITICAL NOTICE: The statutory 120-day ROC window has expired (delay exceeds 90 days). The company cannot file Form CHG-1 directly on MCA V3. An application in Form CHG-8 must be submitted to the Regional Director. After the RD condonation order is granted, it must be filed with the ROC in Form INC-28 before CHG-1 can be filed.'
        : 'COMPLIANT WINDOW: The charge is within the permissible 120-day ROC window. ROC approval can be obtained upon payment of the calculated challan without RD condonation.'
    ],
    [
      'Section 78 Charge-Holder Filing Right',
      'If the company fails to register the charge within the initial 30 days, Section 78 permits the bank / charge-holder to apply for registration. The ROC gives 14 days notice to the company and registers the charge, allowing the bank to recover the fee from the company.'
    ],
    [
      'Mandatory PDF Attachments Checklist',
      '1. Sanction Letter from Bank/NBFC; 2. Instrument creating/modifying charge (Deed of Hypothecation / Mortgage Deed); 3. Certified Board Resolution (Section 179(3)(d)); 4. Special Resolution under Section 180(1)(a)/(c) if borrowing limits are exceeded; 5. NOC from existing charge-holders in case of consortium charge.'
    ]
  ]

  autoTable(doc, {
    startY: finalYChecklist + 2.5,
    theme: 'grid',
    head: [['Compliance Domain', 'Statutory Provision & Procedural Direction']],
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    body: cleanTableData(guidanceRows),
    styles: { fontSize: 6.8, cellPadding: 1.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 48, fillColor: [248, 250, 252] },
      1: { cellWidth: 134 }
    },
    margin: { left: 14, right: 14 }
  })

  // 4. Professional Sign-off & Verification (Safe Page Budget Check)
  const lastTableY = (doc as any).lastAutoTable.finalY
  let finalYSign = lastTableY + 6

  // If remaining height is less than 35mm, move sign-off and disclaimer cleanly to page 2
  if (finalYSign + 35 > pageHeight - 12) {
    doc.addPage()
    finalYSign = 18
  }

  doc.setFontSize(7.5)
  doc.setTextColor(PDF_PALETTE.gray[0], PDF_PALETTE.gray[1], PDF_PALETTE.gray[2])
  doc.text('Prepared & Verified by:', 14, finalYSign)
  doc.text('Approved for Filing by:', pageWidth - 70, finalYSign)

  doc.setDrawColor(PDF_PALETTE.lightGray[0], PDF_PALETTE.lightGray[1], PDF_PALETTE.lightGray[2])
  doc.line(14, finalYSign + 10, 75, finalYSign + 10)
  doc.line(pageWidth - 70, finalYSign + 10, pageWidth - 14, finalYSign + 10)

  doc.setFontSize(7)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Practicing CS / CA / Cost Accountant', 14, finalYSign + 14)
  doc.text('Authorized Director / MD / Secretary', pageWidth - 70, finalYSign + 14)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(PDF_PALETTE.gray[0], PDF_PALETTE.gray[1], PDF_PALETTE.gray[2])
  doc.text('Membership / COP Number: _______________', 14, finalYSign + 18)
  doc.text('DIN / PAN Number: _______________', pageWidth - 70, finalYSign + 18)

  // 5. Statutory Disclaimer
  const disclaimer = 'STATUTORY NOTICE: This memorandum is generated for professional estimation purposes based on Section 77 & 78 of the Companies Act, 2013 and the Companies (Registration Offices and Fees) Rules, 2014. Form CHG-1 does not attract standard daily late fees; it is strictly governed by the 30-60-90 day ad-valorem structure. MCA portal records and generated challans remain the final statutory authority.'
  renderSafeDisclaimer(doc, disclaimer, finalYSign + 23, { fontSize: 6.5 })

  renderPageFooters(doc, 'Form CHG-1 Charge Registration Assessment Memorandum')

  return doc
}
