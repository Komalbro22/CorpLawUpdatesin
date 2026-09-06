import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Dir3KycCalculationResult } from '@/lib/rule-engine/dir3kyc-engine'

export interface Dir3KycPdfData {
  directorName?: string
  dinNumber?: string
  dinStatus: 'active' | 'deactivated'
  filingType: 'routine' | 'change' | 'reactivation'
  anchorFy: string
  nextDueWindow: string
  nextDueDate: string
  isDueThisYear: boolean
  totalFee: number
  changeCategoryLabel?: string
  changeDeadline?: string | null
  isChangeDelayed?: boolean
  cascadingRiskLevel: string
  companyFilingBlocked: boolean
}

export function generateDir3KycPdf(input: Dir3KycPdfData | Dir3KycCalculationResult): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Normalize input
  const isEngineResult = 'triennialCycle' in input
  const data: Dir3KycPdfData = isEngineResult
    ? {
        directorName: input.input.directorName,
        dinNumber: input.input.dinNumber,
        dinStatus: input.dinStatus,
        filingType: input.filingType,
        anchorFy: input.triennialCycle.anchorFy,
        nextDueWindow: input.triennialCycle.nextDueWindow,
        nextDueDate: input.triennialCycle.nextDueDate,
        isDueThisYear: input.triennialCycle.isFilingDueThisYear,
        totalFee: input.totalMcaChallan,
        changeCategoryLabel: input.changeCompliance.changeCategoryLabel,
        changeDeadline: input.changeCompliance.statutoryDeadline,
        isChangeDelayed: input.changeCompliance.isDelayed,
        cascadingRiskLevel: input.cascadingRisk.riskLevel,
        companyFilingBlocked: input.cascadingRisk.companyFilingBlocked
      }
    : input

  // Executive Palette
  const navy: [number, number, number] = [15, 23, 42]      // #0F172A
  const blue: [number, number, number] = [37, 99, 235]     // #2563EB
  const slate: [number, number, number] = [71, 85, 105]    // #475569
  const gray: [number, number, number] = [100, 116, 139]   // #64748B
  const red: [number, number, number] = [220, 38, 38]      // #DC2626
  const green: [number, number, number] = [22, 163, 74]    // #16A34A

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
  doc.text('FORM DIR-3 KYC WEB — STATUTORY DUE DATE & FEE ASSESSMENT MEMORANDUM', 14, 32)

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

  // Sub-header summary
  doc.setFontSize(9)
  doc.setTextColor(slate[0], slate[1], slate[2])
  doc.text(
    'Governed by Rule 12A(1) & 12A(2) of Companies (Appointment of Directors) Rules, 2014 (G.S.R. 943(E))\nand Item VII of Fees Rules Annexure (G.S.R. 300(E) effective 21 April 2026).',
    14,
    42
  )

  // Table 1: DIN & Profile Assessment
  const profileRows: [string, string][] = [
    ['Director Identification Number (DIN)', data.dinNumber ? data.dinNumber : 'Not Specified'],
    ['Director Name', data.directorName ? data.directorName : 'Not Specified'],
    ['Current DIN Status', data.dinStatus === 'deactivated' ? 'DEACTIVATED DUE TO NON-FILING' : 'ACTIVE / APPROVED'],
    ['Applicable Filing Mode', data.filingType === 'routine' ? 'Routine Triennial KYC (Rule 12A(1))' : data.filingType === 'change' ? 'Event-Based Change Update (Rule 12A(2))' : 'DIN Reactivation Filing'],
    ['Triennial Cycle Anchor FY', data.anchorFy],
    ['Next Statutory Routine Due Window', data.nextDueWindow],
    ['Next Statutory Due Date', data.nextDueDate]
  ]

  if (data.filingType === 'change') {
    profileRows.push(['Altered Particulars', data.changeCategoryLabel || 'Contact / Address'])
    profileRows.push(['30-Day Statutory Deadline', data.changeDeadline || 'Within 30 days of change'])
    profileRows.push(['30-Day Window Compliance', data.isChangeDelayed ? 'DELAYED (> 30 Days)' : 'COMPLIANT (Within 30 Days)'])
  }

  autoTable(doc, {
    startY: 52,
    head: [['Assessment Parameter', 'Statutory Detail']],
    body: profileRows,
    theme: 'striped',
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: navy
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  })

  // Table 2: MCA21 Portal e-Challan Fee Determination
  const finalY = (doc as any).lastAutoTable.finalY || 100

  const feeRows: [string, string, string][] = [
    [
      'Routine Triennial Filing (Rule 12A(1))',
      'Filed within on-time statutory window (April – 30 June of due year)',
      data.filingType === 'routine' && data.isDueThisYear ? '₹0 (NIL)' : '₹0'
    ],
    [
      'Event-Based Update (Rule 12A(2))',
      'Change in mobile number, email, address, or nationality (per filing)',
      data.filingType === 'change' ? `₹${data.totalFee}` : 'N/A'
    ],
    [
      'DIN Reactivation Fee',
      'Reactivation of DIN deactivated due to prior non-filing (STP auto-approval)',
      data.dinStatus === 'deactivated' || data.filingType === 'reactivation' ? '₹5,000' : 'N/A'
    ],
    [
      'Total MCA21 Portal e-Challan',
      'Governed by Item VII, Annexure, Fees Rules, 2014 (G.S.R. 300(E))',
      `₹${data.totalFee.toLocaleString('en-IN')}`
    ]
  ]

  autoTable(doc, {
    startY: finalY + 8,
    head: [['Challan Component', 'Statutory Basis & Notes', 'Amount (INR)']],
    body: feeRows,
    theme: 'grid',
    headStyles: {
      fillColor: blue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: navy
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', halign: 'right', cellWidth: 'auto' }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === feeRows.length - 1) {
        hookData.cell.styles.fillColor = [241, 245, 249]
        hookData.cell.styles.textColor = data.totalFee > 0 ? red : green
        hookData.cell.styles.fontStyle = 'bold'
      }
    },
    margin: { left: 14, right: 14 }
  })

  // Table 3: Statutory Directives & Cascading Risk Notice
  const finalY2 = (doc as any).lastAutoTable.finalY || 160

  const directiveRows: [string, string][] = [
    [
      'Non-Reset Rule (Rule 12A(2))',
      'Filing an event-based change of mobile/email/address keeps your DIN active and compliant, but DOES NOT reset or extend the 3-year triennial cycle clock. The next routine KYC remains anchored to original DIN allotment year.'
    ],
    [
      'Cascading Company Freeze Risk',
      data.companyFilingBlocked
        ? 'CRITICAL ALERT: Your deactivated DIN blocks all companies where you are a director from filing Form AOC-4 and MGT-7. If company filings lapse for 3 consecutive years, all directors face automatic 5-year disqualification under Section 164(2).'
        : 'If DIN is ever deactivated, company annual filings (AOC-4/MGT-7) requiring your digital signature cannot proceed on MCA V3.'
    ],
    [
      'False Statement Liability (Sec 448 & 449)',
      'DIR-3 KYC Web requires digital certification by a practicing CA/CS/CMA. Under Section 448 & 449, providing false statements or certifications attracts imprisonment up to 3 years and substantial fines for both director and professional.'
    ],
    [
      'Automatic STP Approval',
      'Upon payment of the applicable challan on MCA21 V3, Form DIR-3 KYC Web is processed on Straight-Through-Process (STP) basis. Approved SRN and DIN reactivation occur automatically without manual ROC intervention.'
    ]
  ]

  autoTable(doc, {
    startY: finalY2 + 8,
    head: [['Statutory Directive / Risk Warning', 'Regulatory Explanation']],
    body: directiveRows,
    theme: 'plain',
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: slate
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, textColor: navy },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  })

  // Footer Disclaimers
  const finalY3 = (doc as any).lastAutoTable.finalY || 240

  doc.setFontSize(7.5)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Statutory Disclaimer: This memorandum is generated algorithmically by CorpLawUpdates.in for professional compliance assessment.\nFiling fees reflect G.S.R. 943(E) and G.S.R. 300(E). Please cross-verify with official MCA21 V3 portal prior to formal remittance.',
    14,
    Math.min(finalY3 + 12, 280)
  )

  return doc
}
