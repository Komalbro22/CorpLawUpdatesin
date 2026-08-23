import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Mgt7ComplianceCalculationResult } from '@/lib/rule-engine/mgt7-engine'

export function generateMgt7Pdf(result: Mgt7ComplianceCalculationResult): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Brand Colors
  const navy: [number, number, number] = [15, 23, 42]
  const blue: [number, number, number] = [37, 99, 235]
  const gray: [number, number, number] = [100, 116, 139]
  const red: [number, number, number] = [220, 38, 38]

  doc.setFont('helvetica')

  // Header
  doc.setFontSize(20)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('CorpLawUpdates.in', 14, 20)

  doc.setFontSize(8.5)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')
  doc.text("India's Free Corporate Law Intelligence Platform", 14, 25)

  // Title
  doc.setFontSize(13)
  doc.setTextColor(blue[0], blue[1], blue[2])
  doc.setFont('helvetica', 'bold')
  doc.text(`${result.metadata.formCode} — Filing Fee & Statutory Penalty Calculation Report`, 14, 35)

  doc.setFontSize(9)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, pageWidth - 14, 35, { align: 'right' })

  // Divider line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(14, 39, pageWidth - 14, 39)

  // 1. Filing & Entity Parameters Table
  autoTable(doc, {
    startY: 44,
    theme: 'grid',
    head: [['Compliance Parameter', 'Value / Particulars', 'Statutory Basis / Note']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    body: [
      ['Form Number & Title', `${result.metadata.formCode} — ${result.metadata.formName}`, 'Rule 11, Companies (Management & Admin) Rules 2014'],
      ['Financial Year', result.metadata.financialYear, 'Relevant annual return filing period'],
      ['Company Classification', result.metadata.companyClassification, result.metadata.isSmallCompany ? 'Small Co under Sec 2(85)' : 'Standard entity class'],
      ['Nominal Share Capital', result.metadata.hasShareCapital ? `₹ ${result.metadata.nominalCapital.toLocaleString('en-IN')}` : 'Without Share Capital', 'Table A, Items 5 & 6 bracket basis'],
      ['AGM Type & Status', `${result.metadata.agmType === 'first' ? 'First AGM' : 'Subsequent AGM'} (${result.metadata.agmStatus})`, result.metadata.agmType === 'first' ? 'Sec 96(1): 9m limit (No ROC ext)' : 'Sec 96(1): 6m limit (Max 3m ext)'],
      ['Statutory Due Date', result.metadata.statutoryDueDate, `Section 92(4) deadline (${result.metadata.daysDelayed > 0 ? result.metadata.daysDelayed + ' day(s) overdue' : 'Compliant'})`],
      ['Actual / Filing Date', result.metadata.actualFilingDate, 'Date considered for delay and fee computation'],
      ['Small Company Assessment', result.smallCompanyAssessment.isSmallCompany ? 'QUALIFIED AS SMALL COMPANY' : 'NOT CLASSIFIED AS SMALL COMPANY', result.smallCompanyAssessment.disqualificationReason || `Threshold: ${result.smallCompanyAssessment.thresholdApplied.notificationReference}`],
      ['Section 446B Relief Status', result.metadata.section446BEligible ? 'ELIGIBLE (50% Relief Ceiling)' : 'NOT ELIGIBLE', result.statutoryPenaltyExposure.reliefCeilingExplanation],
      ['PCS Certification Status', result.pcsCertification.pcsCertificationRequired ? 'MGT-8 CERTIFICATION REQUIRED' : 'DIRECTOR / CS SIGNATURE ONLY', result.pcsCertification.basisExplanation]
    ],
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { fontStyle: 'bold', cellWidth: 60 },
      2: { cellWidth: 72 }
    }
  })

  // 2. Financial Panel 1: MCA Portal Payable
  const finalYParams = (doc as any).lastAutoTable.finalY + 6

  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
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
    startY: finalYParams + 3,
    theme: 'grid',
    head: [['Fee Component', 'Calculation Basis / Statutory Source', 'Amount (INR)']],
    headStyles: { fillColor: blue, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: portalRows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', cellWidth: 42, halign: 'right' }
    }
  })

  // 3. Financial Panel 2: Indicative Section 92(5) Penalty Exposure
  const finalYPortal = (doc as any).lastAutoTable.finalY + 6

  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. Indicative Section 92(5) Statutory Penalty Exposure (Adjudication Required)', 14, finalYPortal)

  const penaltyRows: any[] = [
    ['Company Statutory Penalty Exposure', `Base ₹10,000 + ${result.metadata.continuingDaysAfterFirst} continuing day(s) @ ₹100/day (Max Cap ₹2,00,000)`, `INR ${result.statutoryPenaltyExposure.companyStandardExposure.toLocaleString('en-IN')}`],
    ['Officers in Default Penalty Exposure', `Base ₹10,000 + ${result.metadata.continuingDaysAfterFirst} day(s) @ ₹100/day per officer (Max Cap ₹50,000/off)`, `INR ${result.statutoryPenaltyExposure.officersStandardExposure.toLocaleString('en-IN')}`]
  ]

  if (result.metadata.section446BEligible && result.metadata.daysDelayed > 0) {
    penaltyRows.push([
      'Section 446B Relief Ceiling',
      'Penalty shall not exceed one-half of statutory amount (Company Cap: ₹1,00,000 | Officer Cap: ₹25,000)',
      '- 50% Statutory Ceiling'
    ])
    penaltyRows.push([
      { content: 'INDICATIVE MAX PENALTY EXPOSURE (AFTER 446B)', styles: { fontStyle: 'bold', textColor: red, fillColor: [254, 242, 242] } },
      { content: 'Adjudication order by ROC under Section 454 required', styles: { fontStyle: 'italic', fillColor: [254, 242, 242] } },
      { content: `INR ${result.statutoryPenaltyExposure.totalIndicativeMaximumExposure.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: red, fillColor: [254, 242, 242] } }
    ])
  } else {
    penaltyRows.push([
      { content: 'TOTAL INDICATIVE STATUTORY EXPOSURE', styles: { fontStyle: 'bold', textColor: result.metadata.daysDelayed > 0 ? red : [30, 41, 59], fillColor: [248, 250, 252] } },
      { content: 'Adjudication order by ROC under Section 454 required', styles: { fontStyle: 'italic', fillColor: [248, 250, 252] } },
      { content: `INR ${result.statutoryPenaltyExposure.totalStandardExposure.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: result.metadata.daysDelayed > 0 ? red : [30, 41, 59], fillColor: [248, 250, 252] } }
    ])
  }

  autoTable(doc, {
    startY: finalYPortal + 3,
    theme: 'grid',
    head: [['Penalty Component', 'Statutory Provision / Adjudication Formula', 'Indicative Amount']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: penaltyRows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 75 },
      2: { fontStyle: 'bold', cellWidth: 42, halign: 'right' }
    }
  })

  // Mandatory Statutory Disclaimer & Non-Audit Notice
  const finalYPenalty = (doc as any).lastAutoTable.finalY + 6
  doc.setFontSize(7.5)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')

  const disclaimer = 
    "LEGAL DISCLAIMER & STATUTORY NOTICE: This report is generated automatically by CorpLawUpdates.in from user-entered parameters and applicable rule data. It is provided for informational and estimation purposes only and does not constitute an audit, certification, legal opinion, or official MCA document. The MCA portal remains the final authority for the fee charged at filing. Section 92(5) penalties are not collected via MCA21 e-Challan; they represent potential statutory exposure if adjudication proceedings are initiated by the Registrar of Companies under Section 454."

  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28)
  doc.text(splitDisclaimer, 14, finalYPenalty)

  return doc
}
