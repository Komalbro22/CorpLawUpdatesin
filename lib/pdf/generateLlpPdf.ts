import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LlpCalculationResult, LlpFeeParams } from '../penaltyCalculator';
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils';

export interface LlpPdfPayload {
  params: LlpFeeParams;
  result: LlpCalculationResult;
}

export function generateLlpPdf(data: LlpPdfPayload) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Palette
  const navy = PDF_PALETTE.navy;
  const teal = PDF_PALETTE.teal;
  const gray = PDF_PALETTE.gray;
  const darkGray = [51, 65, 85] as [number, number, number];
  const amber = PDF_PALETTE.amber;

  doc.setFont('helvetica');

  // Top Header Banner with safe non-colliding title and date
  let startY = renderDocumentHeader(doc, {
    title: 'LLP Filing Fee & Statutory Penalty Calculation Report',
    subtitle: 'Limited Liability Partnership Act, 2008 & LLP Rules, 2009 (Rule 12 & Annexure A)',
    dateLabel: 'Generated',
    titleColor: teal
  });

  // General Disclaimer Banner
  doc.setFontSize(7.2);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'italic');
  const disclaimerLines = doc.splitTextToSize(
    'This report is generated automatically by the CorpLawUpdates.in calculator based on user-entered parameters. It is provided for informational and estimation purposes only and does not constitute an audit, legal opinion, certification, or statutory adjudication. Actual filing fees are calculated by the MCA21 portal at the time of form upload. Statutory adjudication penalties require formal proceedings under Section 76A.',
    pageWidth - 28
  );
  doc.text(disclaimerLines, 14, startY);

  startY += (disclaimerLines.length * 3.5) + 3.5;

  // Section 1: Entity & Filing Overview
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Entity & Filing Overview', 14, startY);

  const overviewRows = [
    ['Filing Form:', cleanPdfText(data.result.formName)],
    ['Statutory Authority:', cleanPdfText(data.result.statutoryAuthority)],
    ['Total Contribution:', `INR ${data.params.contribution.toLocaleString('en-IN')}`],
    ['Small LLP Assessment:', cleanPdfText(data.result.smallLlpAssessmentBasis)],
  ];

  if (data.params.turnover !== undefined && data.params.turnover !== null) {
    overviewRows.push(['Preceding FY Turnover:', `INR ${data.params.turnover.toLocaleString('en-IN')}`]);
  }
  if (data.result.dueDateFormatted) {
    overviewRows.push(['Statutory Due Date:', cleanPdfText(data.result.dueDateFormatted)]);
  }
  if (data.result.filingDateFormatted && data.result.filingDateFormatted !== 'Not Specified') {
    overviewRows.push(['Actual Filing Date:', cleanPdfText(data.result.filingDateFormatted)]);
  }
  overviewRows.push(['Days Delayed Past Due Date:', `${data.result.days} Days`]);

  autoTable(doc, {
    startY: startY + 2.5,
    theme: 'plain',
    body: cleanTableData(overviewRows),
    styles: { fontSize: 7.5, cellPadding: 1.6, textColor: darkGray },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 14, right: 14 }
  });

  startY = (doc as any).lastAutoTable.finalY + 5;

  // Section 2: Four-Tier Financial Breakdown
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Fee & Statutory Penalty Breakdown', 14, startY);

  const feeTableRows: any[] = [
    ['Tier 1: Normal Base Filing Fee', cleanPdfText(data.result.whyExplanation.baseFeeDescription), `INR ${data.result.normalFee.toLocaleString('en-IN')}`],
    ['Tier 2: Additional Filing Fee (Late Filing)', cleanPdfText(data.result.whyExplanation.multiplierDescription), `INR ${data.result.lateFee.toLocaleString('en-IN')}`],
  ];

  if (data.result.incrementalFee > 0) {
    feeTableRows.push([
      'Tier 3: Incremental Registration Fee',
      cleanPdfText(data.result.whyExplanation.incrementalFeeDescription || 'Incremental fee for contribution increase'),
      `INR ${data.result.incrementalFee.toLocaleString('en-IN')}`
    ]);
  }

  feeTableRows.push([
    'TOTAL MCA PORTAL PAYABLE AMOUNT',
    'Total fee payable at MCA checkout (Tier 1 + Tier 2 + Tier 3)',
    `INR ${data.result.totalPayable.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: startY + 2.5,
    theme: 'striped',
    head: [['Fee Component', 'Calculation Details & Rule Slabs', 'Amount (INR)']],
    headStyles: { fillColor: navy, textColor: 255, fontSize: 8 },
    body: cleanTableData(feeTableRows),
    styles: { fontSize: 7.5, cellPadding: 2, textColor: darkGray },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 80 },
      2: { fontStyle: 'bold', halign: 'right', cellWidth: 35 }
    },
    didParseCell: function(cellData) {
      const isTotalRow = cellData.row.index === feeTableRows.length - 1;
      if (isTotalRow && cellData.section === 'body') {
        cellData.cell.styles.fillColor = [240, 253, 250];
        cellData.cell.styles.textColor = teal;
        cellData.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 }
  });

  startY = (doc as any).lastAutoTable.finalY + 5;

  // Section 3: Statutory Penalty Exposure & Section 76A Notice
  if (data.result.totalPenaltyExposure > 0) {
    doc.setFontSize(9.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Indicative Statutory Adjudication Penalty Exposure', 14, startY);

    const penaltyRows = [
      ['LLP Entity Penalty Exposure:', `INR ${data.result.llpPenalty.toLocaleString('en-IN')} (Section 34(5)/35(2) - INR ${data.result.isSmallLlp ? '50' : '100'}/day, cap INR 1,00,000)`],
      ['Designated Partners Exposure:', `INR ${data.result.dpPenalty.toLocaleString('en-IN')} (INR ${data.result.isSmallLlp ? '50' : '100'}/day per DP, cap INR 50,000 each)`],
      ['Total Adjudication Exposure:', `INR ${data.result.totalPenaltyExposure.toLocaleString('en-IN')} (NOT included in MCA portal payable amount)`],
    ];

    autoTable(doc, {
      startY: startY + 2.5,
      theme: 'plain',
      body: cleanTableData(penaltyRows),
      styles: { fontSize: 7.5, cellPadding: 1.6, textColor: darkGray },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, textColor: amber },
        1: { cellWidth: 120 }
      },
      margin: { left: 14, right: 14 }
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Section 76A Notice Box
    doc.setFontSize(7.2);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    const noticeLines = doc.splitTextToSize(
      cleanPdfText(`Notice: ${data.result.penaltyNotice} Statutory penalties are quasi-judicial civil liabilities determined via ROC adjudication under Section 76A and are separate from portal filing fees.`),
      pageWidth - 28
    );
    doc.text(noticeLines, 14, startY);
    startY += (noticeLines.length * 3.5) + 3.5;
  }

  // Section 4: Procedural Notes (if any, e.g. Form 24 / Charge)
  if (data.result.proceduralNotes) {
    doc.setFontSize(8.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Procedural & Compliance Notes:', 14, startY);

    doc.setFontSize(7.2);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    const procLines = doc.splitTextToSize(cleanPdfText(data.result.proceduralNotes), pageWidth - 28);
    doc.text(procLines, 14, startY + 4);
  }

  // Uniform Page Footers
  renderPageFooters(doc, 'Generated by CorpLawUpdates.in - Informational calculation estimate only');

  doc.save(`LLP_Fee_Calculation_${data.result.formId}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
