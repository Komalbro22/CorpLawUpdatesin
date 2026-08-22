import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LlpCalculationResult, LlpFeeParams } from '../penaltyCalculator';

export interface LlpPdfPayload {
  params: LlpFeeParams;
  result: LlpCalculationResult;
}

export function generateLlpPdf(data: LlpPdfPayload) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Palette
  const navy: [number, number, number] = [15, 23, 42];
  const teal: [number, number, number] = [13, 148, 136];
  const gray: [number, number, number] = [100, 116, 139];
  const darkGray: [number, number, number] = [51, 65, 85];
  const amber: [number, number, number] = [217, 119, 6];

  doc.setFont('helvetica');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('CorpLawUpdates.in', 14, 18);

  doc.setFontSize(8.5);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('CORPORATE & LLP COMPLIANCE INTELLIGENCE', 14, 23);

  // Document Title
  doc.setFontSize(14);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('LLP Filing Fee & Statutory Penalty Calculation Report', 14, 34);

  doc.setFontSize(8.5);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Calculator-generated estimate under the Limited Liability Partnership Act, 2008 & LLP Rules, 2009', 14, 39);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 14, 39, { align: 'right' });

  // General Disclaimer Banner
  doc.setFontSize(7.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'italic');
  const disclaimerLines = doc.splitTextToSize(
    'This report is generated automatically by the CorpLawUpdates.in calculator based on user-entered parameters. It is provided for informational and estimation purposes only and does not constitute an audit, legal opinion, certification, or statutory adjudication. Actual filing fees are calculated by the MCA21 portal at the time of form upload. Statutory adjudication penalties require formal proceedings under Section 76A.',
    pageWidth - 28
  );
  doc.text(disclaimerLines, 14, 46);

  let startY = 46 + (disclaimerLines.length * 3.5) + 3;

  // Section 1: Entity & Filing Overview
  doc.setFontSize(10.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Entity & Filing Overview', 14, startY);

  const overviewRows = [
    ['Filing Form:', data.result.formName],
    ['Statutory Authority:', data.result.statutoryAuthority],
    ['Total Contribution:', `Rs. ${data.params.contribution.toLocaleString('en-IN')}`],
    ['Small LLP Assessment:', data.result.smallLlpAssessmentBasis],
  ];

  if (data.params.turnover !== undefined && data.params.turnover !== null) {
    overviewRows.push(['Preceding FY Turnover:', `Rs. ${data.params.turnover.toLocaleString('en-IN')}`]);
  }
  if (data.result.dueDateFormatted) {
    overviewRows.push(['Statutory Due Date:', data.result.dueDateFormatted]);
  }
  if (data.result.filingDateFormatted && data.result.filingDateFormatted !== 'Not Specified') {
    overviewRows.push(['Actual Filing Date:', data.result.filingDateFormatted]);
  }
  overviewRows.push(['Days Delayed Past Due Date:', `${data.result.days} Days`]);

  autoTable(doc, {
    startY: startY + 2.5,
    theme: 'plain',
    body: overviewRows,
    styles: { fontSize: 8.5, cellPadding: 1.8, textColor: darkGray },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    }
  });

  startY = (doc as any).lastAutoTable.finalY + 6;

  // Section 2: Four-Tier Financial Breakdown
  doc.setFontSize(10.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Fee & Statutory Penalty Breakdown', 14, startY);

  const feeTableRows: any[] = [
    ['Tier 1: Normal Base Filing Fee', data.result.whyExplanation.baseFeeDescription, `Rs. ${data.result.normalFee.toLocaleString('en-IN')}`],
    ['Tier 2: Additional Filing Fee (Late Filing)', data.result.whyExplanation.multiplierDescription, `Rs. ${data.result.lateFee.toLocaleString('en-IN')}`],
  ];

  if (data.result.incrementalFee > 0) {
    feeTableRows.push([
      'Tier 3: Incremental Registration Fee',
      data.result.whyExplanation.incrementalFeeDescription || 'Incremental fee for contribution increase',
      `Rs. ${data.result.incrementalFee.toLocaleString('en-IN')}`
    ]);
  }

  feeTableRows.push([
    'TOTAL MCA PORTAL PAYABLE AMOUNT',
    'Total fee payable at MCA checkout (Tier 1 + Tier 2 + Tier 3)',
    `Rs. ${data.result.totalPayable.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: startY + 2.5,
    theme: 'grid',
    head: [['Fee Component', 'Calculation Methodology / Basis', 'Amount (INR)']],
    body: feeTableRows,
    headStyles: { fillColor: navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.2, textColor: darkGray },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 85 },
      2: { fontStyle: 'bold', cellWidth: 40, halign: 'right' }
    }
  });

  startY = (doc as any).lastAutoTable.finalY + 6;

  // Section 3: Statutory Penalty Exposure & Section 76A Notice
  if (data.result.totalPenaltyExposure > 0 || data.result.proceduralNotes) {
    doc.setFontSize(10.5);
    doc.setTextColor(amber[0], amber[1], amber[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Indicative Statutory Adjudication Penalty Exposure', 14, startY);

    const penaltyRows: any[] = [
      ['LLP Entity Penalty Exposure:', `Rs. ${data.result.llpPenalty.toLocaleString('en-IN')} (Section 34(5)/35(2) - Rs. 100/day, cap Rs. 1,00,000)`],
      ['Designated Partners Exposure:', `Rs. ${data.result.dpPenalty.toLocaleString('en-IN')} (Rs. 100/day per DP, cap Rs. 50,000 each)`],
      ['Total Adjudication Exposure:', `Rs. ${data.result.totalPenaltyExposure.toLocaleString('en-IN')} (NOT included in MCA portal payable amount)`],
    ];

    autoTable(doc, {
      startY: startY + 2.5,
      theme: 'plain',
      body: penaltyRows,
      styles: { fontSize: 8.5, cellPadding: 1.8, textColor: darkGray },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      }
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Section 76A Notice Box
    doc.setFontSize(7.5);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    const noticeLines = doc.splitTextToSize(
      `Notice: ${data.result.penaltyNotice} Statutory penalties are quasi-judicial civil liabilities determined via ROC adjudication under Section 76A and are separate from portal filing fees.`,
      pageWidth - 28
    );
    doc.text(noticeLines, 14, startY);
    startY += (noticeLines.length * 3.5) + 4;
  }

  // Section 4: Procedural Notes (if any, e.g. Form 24 / Charge)
  if (data.result.proceduralNotes) {
    doc.setFontSize(8.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Procedural & Compliance Notes:', 14, startY);

    doc.setFontSize(7.5);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    const procLines = doc.splitTextToSize(data.result.proceduralNotes, pageWidth - 28);
    doc.text(procLines, 14, startY + 4);
  }

  // Footer on All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Generated by CorpLawUpdates.in — Informational calculation estimate only. Official fees subject to MCA21 validation.',
      14,
      doc.internal.pageSize.height - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, doc.internal.pageSize.height - 8, { align: 'right' });
  }

  doc.save(`LLP_Fee_Calculation_${data.result.formId}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
