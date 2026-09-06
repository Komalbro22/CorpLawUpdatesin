import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Dir3KycCalculationResult } from '@/lib/rule-engine/dir3kyc-engine'
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

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

  doc.setFont('helvetica')

  // Safe Non-Colliding Header
  const startY = renderDocumentHeader(doc, {
    title: 'FORM DIR-3 KYC WEB - STATUTORY DUE DATE & FEE ASSESSMENT MEMORANDUM',
    subtitle: 'Rule 12A(1) & 12A(2), Companies (Appointment of Directors) Rules, 2014 (G.S.R. 943(E) & 300(E))',
    dateLabel: 'Assessment Date'
  })

  // Table 1: DIN & Profile Assessment
  const profileRows: [string, string][] = [
    ['Director Identification Number (DIN)', data.dinNumber ? data.dinNumber : 'Not Specified'],
    ['Director Legal Name', data.directorName ? data.directorName : 'Not Specified'],
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
    startY: startY,
    head: [['Assessment Parameter', 'Statutory Detail']],
    body: cleanTableData(profileRows),
    theme: 'striped',
    headStyles: {
      fillColor: PDF_PALETTE.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: PDF_PALETTE.navy
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  })

  // Table 2: MCA21 Portal e-Challan Fee Determination
  const finalY = (doc as any).lastAutoTable.finalY || 100

  const feeRows: [string, string, string][] = [
    [
      'Routine Triennial Filing (Rule 12A(1))',
      'Filed within on-time statutory window (April - 30 June of due year)',
      data.filingType === 'routine' && data.isDueThisYear ? 'INR 0 (NIL)' : 'INR 0'
    ],
    [
      'Event-Based Update (Rule 12A(2))',
      'Change in mobile number, email, address, or nationality (per filing)',
      data.filingType === 'change' ? `INR ${data.totalFee}` : 'N/A'
    ],
    [
      'DIN Reactivation Fee',
      'Reactivation of DIN deactivated due to prior non-filing (STP auto-approval)',
      data.dinStatus === 'deactivated' || data.filingType === 'reactivation' ? 'INR 5,000' : 'N/A'
    ],
    [
      'Total MCA21 Portal e-Challan',
      'Governed by Item VII, Annexure, Fees Rules, 2014 (G.S.R. 300(E))',
      `INR ${data.totalFee.toLocaleString('en-IN')}`
    ]
  ]

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Challan Component', 'Statutory Basis & Notes', 'Amount (INR)']],
    body: cleanTableData(feeRows),
    theme: 'grid',
    headStyles: {
      fillColor: PDF_PALETTE.blue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: PDF_PALETTE.navy
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', halign: 'right', cellWidth: 'auto' }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === feeRows.length - 1) {
        hookData.cell.styles.fillColor = [241, 245, 249]
        hookData.cell.styles.textColor = data.totalFee > 0 ? PDF_PALETTE.red : PDF_PALETTE.green
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
    startY: finalY2 + 5,
    head: [['Statutory Directive / Risk Warning', 'Regulatory Explanation']],
    body: cleanTableData(directiveRows),
    theme: 'plain',
    headStyles: {
      fillColor: PDF_PALETTE.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: PDF_PALETTE.slate
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, textColor: PDF_PALETTE.navy },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  })

  // Footer Disclaimers
  const finalY3 = (doc as any).lastAutoTable.finalY || 240
  const disclaimer =
    'Statutory Disclaimer: This memorandum is generated algorithmically by CorpLawUpdates.in for professional compliance assessment. Filing fees reflect G.S.R. 943(E) and G.S.R. 300(E). Please cross-verify with official MCA21 V3 portal prior to formal remittance.'

  renderSafeDisclaimer(doc, disclaimer, finalY3 + 6, { fontSize: 6.8 })

  renderPageFooters(doc, 'Form DIR-3 KYC Web Compliance Assessment')

  return doc
}
