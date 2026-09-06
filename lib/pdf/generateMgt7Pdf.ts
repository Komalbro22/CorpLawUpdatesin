import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Mgt7ComplianceCalculationResult } from '@/lib/rule-engine/mgt7-engine'
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export function generateMgt7Pdf(result: Mgt7ComplianceCalculationResult, companyName?: string): jsPDF {
  const doc = new jsPDF()

  doc.setFont('helvetica')

  // Top Header Banner with safe non-colliding title and date
  const startY = renderDocumentHeader(doc, {
    title: `${result.metadata.formCode} - Filing Fee & Statutory Penalty Calculation Report`,
    subtitle: 'Section 92 & Rule 11, Companies (Management and Administration) Rules, 2014',
    dateLabel: 'Report Date'
  })

  // 1. Filing & Entity Parameters Table
  const parameterRows: any[] = [
    ['Form Number & Title', `${result.metadata.formCode} - ${result.metadata.formName}`, 'Rule 11, Companies (Management & Admin) Rules 2014'],
    ['Company Name', companyName ? companyName.toUpperCase() : 'Not Specified (Generic Estimation)', 'As registered on MCA21 portal'],
    ['Financial Year', result.metadata.financialYear, 'Relevant annual return filing period'],
    ['Company Classification', result.metadata.companyClassification, result.metadata.isSmallCompany ? 'Small Co under Sec 2(85)' : 'Standard entity class'],
    ['Nominal Share Capital', result.metadata.hasShareCapital ? `INR ${result.metadata.nominalCapital.toLocaleString('en-IN')}` : 'Without Share Capital', 'Table A, Items 5 & 6 bracket basis'],
    ['AGM Type & Status', `${result.metadata.agmType === 'first' ? 'First AGM' : 'Subsequent AGM'} (${result.metadata.agmStatus})`, result.metadata.agmType === 'first' ? 'Sec 96(1): 9m limit (No ROC ext)' : 'Sec 96(1): 6m limit (Max 3m ext)'],
    ['Statutory Due Date', result.metadata.statutoryDueDate, `Section 92(4) deadline (${result.metadata.daysDelayed > 0 ? result.metadata.daysDelayed + ' day(s) overdue' : 'Compliant'})`],
    ['Actual / Filing Date', result.metadata.actualFilingDate, 'Date considered for delay and fee computation'],
    ['Small Company Assessment', result.smallCompanyAssessment.isSmallCompany ? 'QUALIFIED AS SMALL COMPANY' : 'NOT CLASSIFIED AS SMALL COMPANY', result.smallCompanyAssessment.disqualificationReason || `Threshold: ${result.smallCompanyAssessment.thresholdApplied.notificationReference}`],
    ['Section 446B Relief Status', result.metadata.section446BEligible ? 'ELIGIBLE (50% Relief Ceiling)' : 'NOT ELIGIBLE', result.statutoryPenaltyExposure.reliefCeilingExplanation],
    ['PCS Certification Status', result.pcsCertification.pcsCertificationRequired ? 'MGT-8 CERTIFICATION REQUIRED' : 'DIRECTOR / CS SIGNATURE ONLY', result.pcsCertification.basisExplanation]
  ]

  autoTable(doc, {
    startY: startY,
    theme: 'grid',
    head: [['Compliance Parameter', 'Value / Particulars', 'Statutory Basis / Note']],
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    body: cleanTableData(parameterRows),
    styles: { fontSize: 7.2, cellPadding: 1.6, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { fontStyle: 'bold', cellWidth: 62 },
      2: { cellWidth: 70 }
    },
    margin: { left: 14, right: 14 }
  })

  // 2. Financial Panel 1: MCA Portal Payable
  const finalYParams = (doc as any).lastAutoTable.finalY + 4

  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. MCA21 Portal Payable (Payable at Time of e-Filing)', 14, finalYParams)

  const portalRows: any[] = [
    ['Normal Government Filing Fee', result.mcaPortalPayable.basisNormalFee, `INR ${result.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}`],
    ['Additional Filing Fee (Delay)', result.mcaPortalPayable.basisAdditionalFee, `INR ${result.mcaPortalPayable.additionalFilingFee.toLocaleString('en-IN')}`],
    [
      { content: 'TOTAL MCA21 PORTAL PAYABLE', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'Paid via MCA21 e-Challan upon upload', styles: { fontStyle: 'italic', fillColor: [241, 245, 249] } },
      { content: `INR ${result.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }
    ]
  ]

  autoTable(doc, {
    startY: finalYParams + 2.5,
    theme: 'grid',
    head: [['Fee Component', 'Calculation Basis / Statutory Source', 'Amount (INR)']],
    headStyles: { fillColor: PDF_PALETTE.blue, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    body: cleanTableData(portalRows),
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', cellWidth: 42, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  })

  // 3. Financial Panel 2: Indicative Section 92(5) Penalty Exposure
  const finalYPortal = (doc as any).lastAutoTable.finalY + 4

  doc.setFontSize(9.5)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. Indicative Section 92(5) Statutory Penalty Exposure (Adjudication Required)', 14, finalYPortal)

  const penaltyRows: any[] = [
    ['Company Statutory Penalty Exposure', `Base INR 10,000 + ${result.metadata.continuingDaysAfterFirst} continuing day(s) @ INR 100/day (Max Cap INR 2,00,000)`, `INR ${result.statutoryPenaltyExposure.companyStandardExposure.toLocaleString('en-IN')}`],
    ['Officers in Default Penalty Exposure', `Base INR 10,000 + ${result.metadata.continuingDaysAfterFirst} day(s) @ INR 100/day per officer (Max Cap INR 50,000/off)`, `INR ${result.statutoryPenaltyExposure.officersStandardExposure.toLocaleString('en-IN')}`]
  ]

  if (result.metadata.section446BEligible && result.metadata.daysDelayed > 0) {
    penaltyRows.push([
      'Section 446B Relief Ceiling',
      'Penalty shall not exceed one-half of statutory amount (Company Cap: INR 1,00,000 | Officer Cap: INR 25,000)',
      '- 50% Statutory Ceiling'
    ])
    penaltyRows.push([
      { content: 'INDICATIVE MAX PENALTY EXPOSURE (AFTER 446B)', styles: { fontStyle: 'bold', textColor: PDF_PALETTE.red, fillColor: [254, 242, 242] } },
      { content: 'Adjudication order by ROC under Section 454 required', styles: { fontStyle: 'italic', fillColor: [254, 242, 242] } },
      { content: `INR ${result.statutoryPenaltyExposure.totalIndicativeMaximumExposure.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: PDF_PALETTE.red, fillColor: [254, 242, 242] } }
    ])
  } else {
    penaltyRows.push([
      { content: 'TOTAL INDICATIVE STATUTORY EXPOSURE', styles: { fontStyle: 'bold', textColor: result.metadata.daysDelayed > 0 ? PDF_PALETTE.red : [30, 41, 59], fillColor: [248, 250, 252] } },
      { content: 'Adjudication order by ROC under Section 454 required', styles: { fontStyle: 'italic', fillColor: [248, 250, 252] } },
      { content: `INR ${result.statutoryPenaltyExposure.totalStandardExposure.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: result.metadata.daysDelayed > 0 ? PDF_PALETTE.red : [30, 41, 59], fillColor: [248, 250, 252] } }
    ])
  }

  autoTable(doc, {
    startY: finalYPortal + 2.5,
    theme: 'grid',
    head: [['Penalty Component', 'Statutory Provision / Adjudication Formula', 'Indicative Amount']],
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    body: cleanTableData(penaltyRows),
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 75 },
      2: { fontStyle: 'bold', cellWidth: 42, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  })

  // Mandatory Statutory Disclaimer & Non-Audit Notice
  const finalYPenalty = (doc as any).lastAutoTable.finalY + 4
  const disclaimer = 
    "LEGAL DISCLAIMER & STATUTORY NOTICE: This report is generated automatically by CorpLawUpdates.in from user-entered parameters and applicable rule data. It is provided for informational and estimation purposes only and does not constitute an audit, certification, legal opinion, or official MCA document. The MCA portal remains the final authority for the fee charged at filing. Section 92(5) penalties are not collected via MCA21 e-Challan; they represent potential statutory exposure if adjudication proceedings are initiated by the Registrar of Companies under Section 454."

  renderSafeDisclaimer(doc, disclaimer, finalYPenalty, { fontSize: 6.8 })

  renderPageFooters(doc, `Form ${result.metadata.formCode} Calculation Report`)

  return doc
}
