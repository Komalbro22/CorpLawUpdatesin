import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  SpiceCalculationResult,
  formatInr
} from '@/lib/rule-engine/spice-engine';
import {
  cleanTableData,
  cleanPdfText,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils';

export interface SpicePdfExtraMeta {
  proposedName?: string;
  professionalFirm?: string;
}

export function generateSpicePdf(
  data: SpiceCalculationResult,
  extraMeta?: SpicePdfExtraMeta
): jsPDF {
  const doc = new jsPDF();
  doc.setFont('helvetica');

  // 1. Document Header
  const startY = renderDocumentHeader(doc, {
    title: 'SPICE+ (INC-32) COMPANY INCORPORATION ESTIMATE',
    subtitle: 'Section 7, Companies Act 2013 | G.S.R. 329(E) Exemption & State Stamp Duty Audit',
    dateLabel: 'Estimation Date'
  });

  let currentY = startY + 4;

  // 2. Metadata Section: Proposed Company Parameters
  const companyTypeName =
    data.companyType === 'one_person_company' ? 'One Person Company (OPC)' :
    data.companyType === 'small_company' ? 'Small Company (Sec 2(85))' :
    data.companyType === 'section_8' ? 'Section 8 Company (Non-Profit)' :
    data.companyType === 'public_unlisted' ? 'Public Limited Company (Unlisted)' :
    data.companyType === 'producer' ? 'Producer Company' :
    'Private Limited Company';

  const metaRows = [
    [
      { content: 'Proposed Name', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      extraMeta?.proposedName || 'Proposed Company (Subject to Part A Approval)',
      { content: 'Company Type', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      companyTypeName
    ],
    [
      { content: 'Registered Office', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.stateName} (${data.costTier} Cost Tier)`,
      { content: 'Authorised Capital', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      cleanPdfText(formatInr(data.capital))
    ],
    [
      { content: 'Proposed Directors', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.directorCount} Director(s) (${data.freeDinsAllotted} Free DINs, ${data.paidDinsCount} via DIR-3)`,
      { content: 'Zero MCA Fee Status', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.isMcaFeeZero ? 'ELIGIBLE (Capital <= INR 15 Lakhs)' : 'STANDARD TABLE A APPLIES'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    body: cleanTableData(metaRows),
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 55 },
      2: { cellWidth: 40 },
      3: { cellWidth: 55 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 3. Cost Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('1. STATUTORY GOVERNMENT FEE & STAMP DUTY BREAKDOWN', 14, currentY);
  currentY += 4;

  const feeHeaders = ['Component', 'Category', 'Statutory Basis', 'Amount (INR)'];
  const feeRows = data.breakdown.map(item => [
    item.name,
    item.category,
    item.basis,
    item.amount === 0 ? 'INR 0 (Exempt)' : cleanPdfText(formatInr(item.amount))
  ]);

  // Grand Total Row
  feeRows.push([
    'TOTAL GOVERNMENT PAYABLE',
    'Combined Outlay',
    'Total statutory challans payable at SPICe+ submission',
    cleanPdfText(formatInr(data.totalGovernmentPayable))
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [feeHeaders],
    body: cleanTableData(feeRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 38 },
      2: { cellWidth: 68 },
      3: { cellWidth: 34, halign: 'right' }
    },
    didParseCell: (hookData) => {
      // Highlight Grand Total Row
      if (hookData.row.index === feeRows.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = PDF_PALETTE.lightGray;
        hookData.cell.styles.textColor = PDF_PALETTE.blue;
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Savings Highlight Box (if zero MCA fee applies)
  if (data.isMcaFeeZero && data.mcaFeeSaved > 0) {
    doc.setFillColor(240, 253, 244); // Light Emerald
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, currentY, 182, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61); // Emerald-700
    doc.text(
      cleanPdfText(`GOVERNMENT FEE WAIVER: INR ${data.mcaFeeSaved.toLocaleString('en-IN')} Saved via G.S.R. 329(E)`),
      18,
      currentY + 6
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text(
      'Under the Companies (Registration Offices and Fees) Rules, companies with capital <= INR 15,00,000 pay ZERO MCA filing fee.',
      18,
      currentY + 10
    );

    currentY += 20;
  }

  // 5. State Stamp Duty Comparison Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('2. STATE STAMP DUTY BENCHMARK COMPARISON (AT CURRENT CAPITAL)', 14, currentY);
  currentY += 4;

  const compHeaders = ['State / Startup Hub', 'MOA + AOA + Form Stamp Duty', 'Difference vs Selected State'];
  const compRows = data.stateComparison.map(hub => {
    const diffText = hub.difference === 0 ? 'Current Selection' :
      hub.difference > 0 ? `+${cleanPdfText(formatInr(hub.difference))} Higher` :
      `${cleanPdfText(formatInr(hub.difference))} Lower`;

    return [
      hub.stateName,
      cleanPdfText(formatInr(hub.totalDuty)),
      diffText
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [compHeaders],
    body: cleanTableData(compRows),
    theme: 'grid',
    headStyles: { fillColor: PDF_PALETTE.slate, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 55, halign: 'right' },
      2: { cellWidth: 65, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page break for 180-Day Compliance Timeline
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // 6. Mandatory 180-Day Post-Incorporation Compliance Schedule
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_PALETTE.navy);
  doc.text('3. MANDATORY POST-INCORPORATION COMPLIANCE ROADMAP (FIRST 180 DAYS)', 14, currentY);
  currentY += 4;

  const roadHeaders = ['Timeline', 'Action / Form', 'Governing Section', 'Default Consequence & Penalty'];
  const roadRows = data.postIncorporationRoadmap.map(m => [
    m.dayWindow,
    `${m.action} (${m.form})`,
    m.statutorySection,
    m.penaltySummary
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [roadHeaders],
    body: cleanTableData(roadRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 48 },
      2: { cellWidth: 42 },
      3: { cellWidth: 68 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 7. Render Safe Disclaimer and Footers
  const disclaimerText = 'Note: Government stamp duty and MCA fees are auto-calculated in accordance with State Stamp Acts and G.S.R. 329(E). Professional certification fees (CA/CS/CMA) and DSC costs are excluded from statutory estimates.';
  renderSafeDisclaimer(doc, disclaimerText, currentY);

  renderPageFooters(doc, 'SPICe+ Company Incorporation Estimate | CorpLawUpdates.in');

  return doc;
}
