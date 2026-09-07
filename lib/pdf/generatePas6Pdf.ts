import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Pas6CalculationResult,
  formatInr
} from '@/lib/rule-engine/pas6-engine';
import {
  cleanTableData,
  cleanPdfText,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils';

export interface Pas6PdfExtraMeta {
  companyName?: string;
  cin?: string;
  isin?: string;
  professionalFirm?: string;
}

export function generatePas6Pdf(
  data: Pas6CalculationResult,
  extraMeta?: Pas6PdfExtraMeta
): jsPDF {
  const doc = new jsPDF();
  doc.setFont('helvetica');

  // 1. Document Header
  const startY = renderDocumentHeader(doc, {
    title: 'FORM PAS-6: RECONCILIATION OF SHARE CAPITAL AUDIT REPORT',
    subtitle: 'Section 29 read with Rule 9A & 9B, Companies (PAS) Rules, 2014 | MCA V3 Compliance Audit',
    dateLabel: 'Audit Date'
  });

  let currentY = startY + 4;

  // 2. Metadata Section
  const companyTypeName =
    data.companyType === 'unlisted_public' ? 'Unlisted Public Company (Rule 9A)' :
    data.companyType === 'non_small_private' ? 'Non-Small Private Company (Rule 9B)' :
    data.companyType === 'section_8' ? 'Section 8 Non-Profit Company' :
    data.companyType === 'holding_subsidiary' ? 'Holding / Subsidiary Company' :
    data.companyType === 'producer' ? 'Producer Company (Rule 9B)' :
    data.companyType === 'startup' ? 'DPIIT Recognised Startup' :
    data.companyType === 'small_company' ? 'Small Company (Exempt under Sec 2(85))' :
    'Corporate Entity';

  const metaRows = [
    [
      { content: 'Company / Entity', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.companyName || 'Corporate Entity (Rule 9A/9B Scope)',
      { content: 'CIN / Corporate ID', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.cin || 'Not Specified'
    ],
    [
      { content: 'Reporting Half Year', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.periodLabel,
      { content: 'Entity Classification', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      companyTypeName
    ],
    [
      { content: 'Statutory Due Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.statutoryDueDate,
      { content: 'Filing / Evaluation Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.filingDate
    ],
    [
      { content: 'Filing Status', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.isDelay ? `DELAYED BY ${data.daysOfDelay} DAYS (${data.delaySlabLabel})` : 'TIMELY (Within 60-Day Window)',
      { content: 'ISIN for Class', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.isin || 'INE-XXXXXX-XXXX'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    body: cleanTableData(metaRows),
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.8, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 53 },
      2: { cellWidth: 42 },
      3: { cellWidth: 53 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 3. Dematerialisation Reconciliation Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('1. SHARE CAPITAL DEMAT RECONCILIATION AUDIT (RULE 9A(8))', 14, currentY);
  currentY += 4;

  const reconRows = [
    ['Total Issued Shares', cleanPdfText(data.reconciliation.issuedShares.toLocaleString('en-IN')), '100.00%', 'Base issued share capital reported'],
    ['Demat with CDSL', cleanPdfText(data.reconciliation.cdslShares.toLocaleString('en-IN')), `${((data.reconciliation.cdslShares / data.reconciliation.issuedShares) * 100 || 0).toFixed(2)}%`, 'Central Depository Services (India) Ltd'],
    ['Demat with NSDL', cleanPdfText(data.reconciliation.nsdlShares.toLocaleString('en-IN')), `${((data.reconciliation.nsdlShares / data.reconciliation.issuedShares) * 100 || 0).toFixed(2)}%`, 'National Securities Depository Ltd'],
    ['Physical Share Certificates', cleanPdfText(data.reconciliation.physicalShares.toLocaleString('en-IN')), `${data.reconciliation.physicalPercentage}%`, 'Pending dematerialisation by holders'],
    ['Total Reconciled Holdings', cleanPdfText(data.reconciliation.totalReconciledShares.toLocaleString('en-IN')), '100.00%', data.reconciliation.hasMismatch ? 'DISCREPANCY DETECTED' : 'FULLY RECONCILED (0 Mismatch)']
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Capital Segment', 'Number of Shares', '% of Issued', 'Depository Verification Status']],
    body: cleanTableData(reconRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 38, halign: 'right' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 76 }
    },
    didParseCell: (hookData) => {
      if (hookData.row.index === 4) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = data.reconciliation.hasMismatch ? [254, 242, 242] : [240, 253, 244];
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 4. Financial Cost & Penalty Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('2. STATUTORY MCA FEES & SECTION 450 PENALTY EXPOSURE', 14, currentY);
  currentY += 4;

  const costHeaders = ['Liability Head', 'Classification', 'Statutory Basis & Computation', 'Amount (INR)'];
  const costRows = data.breakdown.map(b => [
    b.name,
    b.category,
    b.basis,
    cleanPdfText(formatInr(b.amount))
  ]);

  costRows.push([
    'TOTAL STATUTORY EXPOSURE',
    'Combined Outlay',
    'Includes MCA V3 portal payable + ROC civil adjudication exposure',
    cleanPdfText(formatInr(data.totalStatutoryExposure))
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [costHeaders],
    body: cleanTableData(costRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 38 },
      2: { cellWidth: 66 },
      3: { cellWidth: 34, halign: 'right' }
    },
    didParseCell: (hookData) => {
      if (hookData.row.index === costRows.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [238, 242, 255];
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 5. Compliance Roadmap Table
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('3. STATUTORY DEMAT & AUDIT ROADMAP (RULES 9A & 9B)', 14, currentY);
  currentY += 4;

  const roadHeaders = ['Step', 'Action Required', 'Statutory Section', 'Statutory Mandate & Description'];
  const roadRows = data.roadmap.map(item => [
    `Step ${item.step}`,
    item.action,
    item.statutorySection,
    item.description
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
      1: { cellWidth: 50 },
      2: { cellWidth: 42 },
      3: { cellWidth: 80 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 6. Disclaimer & Footers
  const disclaimerText = 'Note: This audit calculation reflects Table A/B fees and Section 450 general civil penalty exposure. Civil adjudication penalties are subject to ROC adjudication under Section 454 and are not automatically collected at e-Challan upload. Professional certification fees (PCS/PCA) are excluded.';
  renderSafeDisclaimer(doc, disclaimerText, currentY);
  renderPageFooters(doc, 'Form PAS-6 Share Capital Reconciliation Audit | CorpLawUpdates.in');

  return doc;
}
