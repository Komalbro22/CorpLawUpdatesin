import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Msme1CalculationResult,
  CURRENT_RBI_BANK_RATE,
  MSME_PENAL_INTEREST_RATE
} from '@/lib/rule-engine/msme1-engine';
import {
  cleanTableData,
  cleanPdfText,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils';

export interface Msme1PdfExtraMeta {
  companyName?: string;
  cin?: string;
  professionalFirm?: string;
}

export function generateMsme1Pdf(
  data: Msme1CalculationResult,
  extraMeta?: Msme1PdfExtraMeta
): jsPDF {
  const doc = new jsPDF();
  doc.setFont('helvetica');

  // 1. Document Header
  const startY = renderDocumentHeader(doc, {
    title: 'FORM MSME-1: COMPLIANCE & PENALTY ASSESSMENT REPORT',
    subtitle: 'Section 405 Companies Act 2013 | MSMED Act 2006 | Income Tax Sec 43B(h) | MCA V3 Analysis',
    dateLabel: 'Assessment Date'
  });

  let currentY = startY + 4;

  // 2. Metadata Section
  const metaRows = [
    [
      { content: 'Company / Entity', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.companyName || 'Specified Corporate Buyer (Sec 405 Scope)',
      { content: 'CIN / Corporate ID', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.cin || 'Not Specified'
    ],
    [
      { content: 'Reporting Half Year', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.halfYear === 'Apr-Sep' ? 'April 1 – September 30' : 'October 1 – March 31'} (${data.financialYear})`,
      { content: 'Statutory Due Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.dueDateFormatted
    ],
    [
      { content: 'Filing Status', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.isDelayed ? `DELAYED BY ${data.daysDelayed} DAYS` : 'ON-TIME (Compliant)',
      { content: 'Officers in Default', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.numOfficers} Director(s) / Officer(s)`
    ],
    [
      { content: 'MCA V3 Status', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.isFilingTriggeredOnV3 ? 'MANDATORY FILING TRIGGERED' : 'NIL RETURN (No Filing Needed)',
      { content: 'Statutory Risk Rating', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.riskLevel} COMPLIANCE RISK`
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    body: cleanTableData(metaRows),
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.8, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 44 },
      1: { cellWidth: 51 },
      2: { cellWidth: 44 },
      3: { cellWidth: 51 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 3. Multi-Layer Financial Exposure Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('1. THREE-LAYER FINANCIAL & PENALTY EXPOSURE BREAKDOWN', 14, currentY);
  currentY += 4;

  const exposureHeaders = ['Compliance Layer', 'Liability Head', 'Statutory Basis & Formula', 'Amount (INR)'];
  const exposureRows: any[] = [
    [
      'Layer 1: MCA Portal',
      'Normal Filing Fee',
      'MCA V3 Portal Schedule — MSME-1 filed free of cost',
      cleanPdfText('INR 0')
    ],
    [
      'Layer 1: MCA Portal',
      'Portal Additional Late Fee',
      'No delay multiplier prescribed on MCA portal checkout',
      cleanPdfText('INR 0')
    ],
    [
      'Layer 1: ROC Penalty',
      'Section 405(4) Company Penalty',
      `Base INR 20,000 + (INR 1,000 × ${data.daysDelayed} days) [Cap: INR 3,00,000]`,
      cleanPdfText(`INR ${data.companyPenalty.toLocaleString('en-IN')}`)
    ],
    [
      'Layer 1: ROC Penalty',
      `Section 405(4) Officers Penalty (${data.numOfficers}x)`,
      `Base INR 20,000 + (INR 1,000 × ${data.daysDelayed} days) per officer [Cap: INR 3,00,000 each]`,
      cleanPdfText(`INR ${data.totalOfficersPenalty.toLocaleString('en-IN')}`)
    ],
    [
      'Layer 2: MSMED Act',
      'Section 16 Compound Interest',
      `3× RBI Bank Rate (${MSME_PENAL_INTEREST_RATE}% p.a.) compounded with monthly rests`,
      cleanPdfText(`INR ${data.penalInterestPayable.toLocaleString('en-IN')}`)
    ],
    [
      'Layer 3: Income Tax',
      'Section 43B(h) Disallowance Tax',
      `Delayed principal + penal interest disallowed from income @ 25.17% tax`,
      cleanPdfText(`INR ${data.estimatedTaxCashOutflow.toLocaleString('en-IN')}`)
    ],
    [
      'TOTAL EXPOSURE',
      'Combined Statutory Exposure',
      'Includes ROC adjudication + Section 16 interest + Section 43B(h) tax impact',
      cleanPdfText(`INR ${(data.totalSection405Exposure + data.penalInterestPayable + data.estimatedTaxCashOutflow).toLocaleString('en-IN')}`)
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [exposureHeaders],
    body: cleanTableData(exposureRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 48 },
      2: { cellWidth: 68 },
      3: { cellWidth: 32, halign: 'right' }
    },
    didParseCell: (hookData) => {
      if (hookData.row.index === exposureRows.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [238, 242, 255];
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 4. V3 4-Category Disclosure Analysis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('2. MCA V3 FOUR-CATEGORY REPORTING DISCLOSURE ARCHITECTURE', 14, currentY);
  currentY += 4;

  const v3Headers = ['Category #', 'Transaction Classification', 'Reporting Requirement on MCA V3', 'Filing Trigger Impact'];
  const v3Rows = [
    [
      'Category 1',
      'Micro/Small Vendors Paid Within 45 Days',
      'Mandatory disclosure of invoice, URN, amount and payment date if supplier triggered',
      'Informative (Compliant)'
    ],
    [
      'Category 2',
      'Micro/Small Vendors Paid After 45 Days',
      'All payments exceeding 45 days during half-year, even if settled before period end',
      'CRITICAL: Triggers V3 Filing Obligation'
    ],
    [
      'Category 3',
      'Outstanding at Period End (<= 45 Days)',
      'Accrued vendor invoices within normal statutory or agreed credit limit',
      'Informative (Not in Default)'
    ],
    [
      'Category 4',
      'Outstanding at Period End (> 45 Days)',
      'Overdue vendor invoices unpaid at half-year end with specific reasons for delay',
      'CRITICAL: Core Trigger for MSME-1 & ROC Action'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [v3Headers],
    body: cleanTableData(v3Rows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 54 },
      2: { cellWidth: 68 },
      3: { cellWidth: 44 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 5. Compliance Roadmap Table (new page if needed)
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('3. STEP-BY-STEP MSME FORM 1 FILING PROTOCOL (MCA21 V3)', 14, currentY);
  currentY += 4;

  const roadHeaders = ['Step', 'Stage on MCA V3', 'Statutory Action & Documentation Required'];
  const roadRows = data.complianceRoadmap.map(item => [
    `Step ${item.step}`,
    cleanPdfText(item.title),
    cleanPdfText(item.description)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [roadHeaders],
    body: cleanTableData(roadRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7, cellPadding: 2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 60 },
      2: { cellWidth: 112 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 6. Disclaimer & Footers
  const disclaimerText = 'Statutory Note: Form MSME-1 incurs INR 0 portal fee upon submission. Penalties under Section 405(4) of the Companies Act, 2013 (INR 20,000 base + INR 1,000 per day continuing default, capped at INR 3,00,000 each for company and officers) are levied through civil adjudication under Section 454. Precedent orders include Natrinai Ventures Ltd (INR 9 Lakhs) and Samsung R&D India (~INR 11.67 Lakhs). Section 16 penal compound interest is payable directly to MSME vendors at 3× RBI Bank Rate (16.50% p.a.).';
  renderSafeDisclaimer(doc, disclaimerText, currentY);
  renderPageFooters(doc, 'Form MSME-1 Half-Yearly Return | CorpLawUpdates.in');

  return doc;
}
