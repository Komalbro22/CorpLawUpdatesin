import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface Chg1PdfData {
  companyName?: string
  nominalCapital: number
  hasShareCapital: boolean
  isSmallOrOpc: boolean
  chargeNature: 'creation' | 'modification' | 'foreign_property'
  chargeAmount: number
  lenderName?: string
  calcMode: 'date' | 'days'
  creationDate?: string
  statutoryDueDate?: string | null
  firstExtensionDate?: string | null
  finalRocExtensionDate?: string | null
  actualFilingDate?: string
  calculatedDelayDays: number
  daysFromCreation: number
  normalFee: number
  multiplier: number
  multiplierFee: number
  adValoremPercent: number
  adValoremFee: number
  adValoremCapped: boolean
  maxAdValoremCap: number
  totalFee: number
  isCondonation: boolean
}

export function generateChg1Pdf(data: Chg1PdfData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Corporate Executive Color Palette
  const navy: [number, number, number] = [15, 23, 42]      // #0F172A
  const blue: [number, number, number] = [37, 99, 235]     // #2563EB
  const slate: [number, number, number] = [71, 85, 105]    // #475569
  const gray: [number, number, number] = [100, 116, 139]   // #64748B
  const red: [number, number, number] = [220, 38, 38]      // #DC2626

  doc.setFont('helvetica')

  // ── Header Banner ──
  doc.setFontSize(18)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('CorpLawUpdates.in', 14, 18)

  doc.setFontSize(8)
  doc.setTextColor(slate[0], slate[1], slate[2])
  doc.setFont('helvetica', 'normal')
  doc.text("India's Free Corporate Law Intelligence & Statutory Compliance Platform", 14, 23)

  // ── Document Title ──
  doc.setFontSize(11)
  doc.setTextColor(blue[0], blue[1], blue[2])
  doc.setFont('helvetica', 'bold')
  doc.text('FORM CHG-1 — STATUTORY CHARGE REGISTRATION & FEE MEMORANDUM', 14, 32)

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

  // Charge Nature Label
  let natureLabel = 'Creation of Charge (Section 77)'
  if (data.chargeNature === 'modification') {
    natureLabel = 'Modification of Charge (Section 79)'
  } else if (data.chargeNature === 'foreign_property') {
    natureLabel = 'Charge on Foreign Property / Assets outside India (Section 77 Proviso)'
  }

  // ── 1. Entity & Secured Facility Parameters Table ──
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
      ['Date of Charge Creation', data.creationDate || '—', 'Day 0 of Chapter VI statutory timeline'],
      ['Initial Due Date (30 Days)', data.statutoryDueDate || '—', 'Normal fee window under Section 77(1)'],
      ['ROC Final Cutoff (120 Days)', data.finalRocExtensionDate || '—', 'Absolute statutory limit for ROC registration without RD order'],
      ['Actual / Planned Filing Date', data.actualFilingDate || '—', 'Benchmark date considered for fee computation']
    )
  }

  let delayStatusText = 'COMPLIANT — On-Time Filing (Within 30-Day Window)'
  let delaySubtext = 'Eligible for base filing fee only'
  if (data.isCondonation) {
    delayStatusText = 'HARD STOP — SECTION 87 CONDONATION REQUIRED'
    delaySubtext = 'Exceeds 120 days from creation (delay > 90 days). ROC direct filing barred. Requires Form CHG-8 to RD.'
  } else if (data.calculatedDelayDays > 30) {
    delayStatusText = `DELAYED by ${data.calculatedDelayDays} day(s) (Days 61–120 Window)`
    delaySubtext = `Attracts ${data.multiplier}x normal fee + ${(data.adValoremPercent * 100).toFixed(3)}% ad-valorem fee`
  } else if (data.calculatedDelayDays > 0) {
    delayStatusText = `DELAYED by ${data.calculatedDelayDays} day(s) (Days 31–60 Window)`
    delaySubtext = `Attracts ${data.multiplier}x normal fee (First extension window)`
  }

  parameterRows.push(
    ['Delay & Window Status', delayStatusText, delaySubtext],
    ['Statutory Filing Route', data.isCondonation ? 'Section 87 Regional Director Condonation' : 'Standard ROC Electronic Filing (Approval by ROC)', data.isCondonation ? 'Requires RD order via Form CHG-8 before CHG-1' : 'Processed by ROC after scrutiny of instruments']
  )

  autoTable(doc, {
    startY: 40,
    theme: 'grid',
    head: [['Compliance Parameter', 'Particulars', 'Statutory Basis & Notes']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: parameterRows,
    styles: { fontSize: 7.2, cellPadding: 1.8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { fontStyle: 'bold', cellWidth: 68 },
      2: { cellWidth: 64 }
    }
  })

  // ── 2. MCA21 Portal Challan Fee Computation Table ──
  const finalYParams = (doc as any).lastAutoTable.finalY + 4

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. MCA21 Portal Fee Payable (e-Challan Checkout)', 14, finalYParams)

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
        'Section 77(1) second proviso — ROC cannot compute or accept fees directly after 90 days',
        'Direct Payment Blocked'
      ],
      [
        { content: 'SECTION 87 CONDONATION REQUIRED', styles: { fontStyle: 'bold', fillColor: [254, 242, 242], textColor: red } },
        { content: 'Form CHG-8 must be filed with Regional Director along with petition & affidavit', styles: { fontStyle: 'italic', fillColor: [254, 242, 242], textColor: red } },
        { content: 'Subject to RD Penalty', styles: { fontStyle: 'bold', fillColor: [254, 242, 242], textColor: red } }
      ]
    ]
  } else {
    portalRows = [
      [
        'Normal Government Filing Fee',
        data.hasShareCapital
          ? `Governed by Table A, Item 5 (Capital: INR ${data.nominalCapital.toLocaleString('en-IN')})`
          : 'Governed by Table A, Item 6 (Company without Share Capital)',
        `INR ${data.normalFee.toLocaleString('en-IN')}`
      ],
      [
        'Additional Filing Fee (Extension Multiplier)',
        data.calculatedDelayDays === 0
          ? 'Filed within initial 30 days of creation — No delay fee'
          : `Section 77(1) first/second proviso (${data.multiplier}x Normal Fee for ${data.isSmallOrOpc ? 'Small/OPC' : 'Other'})`,
        `INR ${data.multiplierFee.toLocaleString('en-IN')}`
      ],
      [
        'Ad Valorem Additional Fee',
        data.calculatedDelayDays <= 30
          ? 'Not applicable for filings within 60 days of charge creation'
          : `Section 77(1) second proviso (${(data.adValoremPercent * 100).toFixed(3)}% of INR ${data.chargeAmount.toLocaleString('en-IN')}${data.adValoremCapped ? ` [Capped at INR ${data.maxAdValoremCap.toLocaleString('en-IN')}]` : ''})`,
        `INR ${data.adValoremFee.toLocaleString('en-IN')}`
      ],
      [
        { content: 'TOTAL MCA21 CHALLAN PAYABLE', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: 'Payable online via Bharatkosh / MCA21 Gateway upon e-form submission', styles: { fontStyle: 'italic', fillColor: [241, 245, 249] } },
        { content: `INR ${data.totalFee.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }
      ]
    ]
  }

  autoTable(doc, {
    startY: finalYParams + 3,
    theme: 'grid',
    head: [['Fee Component', 'Statutory Authority & Basis', 'Amount (INR)']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: portalRows,
    styles: { fontSize: 7.2, cellPadding: 1.8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] },
      1: { cellWidth: 88 },
      2: { fontStyle: 'bold', cellWidth: 39, halign: 'right' }
    }
  })

  // ── 3. Regulatory Guidelines & MCA V3 Checklist ──
  const finalYChecklist = (doc as any).lastAutoTable.finalY + 4

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. Regulatory Roadmap & MCA V3 Filing Safeguards', 14, finalYChecklist)

  const guidanceRows: any[] = [
    [
      'Section 77 Timeline Framework',
      'Charges created on/after 02.11.2018 have a strict 3-tier timeline: (1) Days 0–30: Normal fee; (2) Days 31–60: 3x/6x fee; (3) Days 61–120: 3x/6x + Ad Valorem (0.025%/0.05% capped at 1L/5L). Beyond 120 days (delay > 90 days), ROC has NO jurisdiction to register.'
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
      '1. Sanction Letter from Bank/NBFC; 2. Instrument creating/modifying charge (Deed of Hypothecation / Mortgage Deed / Indenture); 3. Certified Board Resolution (Section 179(3)(d)); 4. Special Resolution under Section 180(1)(a)/(c) if borrowing limits are exceeded; 5. NOC from existing charge-holders in case of consortium/pari-passu charge.'
    ]
  ]

  autoTable(doc, {
    startY: finalYChecklist + 3,
    theme: 'grid',
    head: [['Compliance Domain', 'Statutory Provision & Procedural Direction']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: guidanceRows,
    styles: { fontSize: 7, cellPadding: 1.6, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { cellWidth: 132 }
    }
  })

  // ── 4. Professional Sign-off & Verification ──
  const finalYSign = (doc as any).lastAutoTable.finalY + 8

  doc.setFontSize(7.5)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.text('Prepared & Verified by:', 14, finalYSign)
  doc.text('Approved for Filing by:', pageWidth - 70, finalYSign)

  doc.setDrawColor(203, 213, 225)
  doc.line(14, finalYSign + 11, 75, finalYSign + 11)
  doc.line(pageWidth - 70, finalYSign + 11, pageWidth - 14, finalYSign + 11)

  doc.setFontSize(7)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Practicing CS / CA / Cost Accountant', 14, finalYSign + 15)
  doc.text('Authorized Director / MD / Secretary', pageWidth - 70, finalYSign + 15)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.text('Membership / COP Number: _______________', 14, finalYSign + 19)
  doc.text('DIN / PAN Number: _______________', pageWidth - 70, finalYSign + 19)

  // ── 5. Statutory Disclaimer ──
  doc.setFontSize(6.5)
  doc.setTextColor(gray[0], gray[1], gray[2])
  const disclaimer = 'STATUTORY NOTICE: This memorandum is generated for professional estimation purposes based on Section 77 & 78 of the Companies Act, 2013 and the Companies (Registration Offices and Fees) Rules, 2014. Form CHG-1 does not attract standard daily late fees; it is strictly governed by the 30-60-90 day ad-valorem structure. MCA portal records and generated challans remain the final statutory authority.'
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - 28), 14, finalYSign + 25)

  return doc
}
