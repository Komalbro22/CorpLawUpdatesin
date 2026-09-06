import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MsmeInterestResult, SupplierEligibilityOutput } from '../penaltyCalculator';
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  PDF_PALETTE
} from './pdfUtils';

export interface MsmePdfPayload {
  invoiceAmount: string;
  deliveryDate: string;
  agreedPaymentDate?: string;
  actualPaymentDate: string;
  bankRateOverride?: string;
  eligibility?: SupplierEligibilityOutput;
  result: MsmeInterestResult;
}

export function generateMsmePdf(data: MsmePdfPayload) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Palette
  const navy = PDF_PALETTE.navy;
  const purple = PDF_PALETTE.purple;
  const red = PDF_PALETTE.red;
  const gray = PDF_PALETTE.gray;
  const darkGray = [51, 65, 85] as [number, number, number];

  doc.setFont('helvetica');

  // Top Header Banner with safe non-colliding title and date
  let startY = renderDocumentHeader(doc, {
    title: 'MSME Delayed Payment Interest Calculation Report',
    subtitle: 'Statutory calculation under Sections 15 and 16 of the MSMED Act, 2006',
    dateLabel: 'Generated',
    titleColor: purple
  });

  // General Disclaimer Banner
  doc.setFontSize(7.2);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'italic');
  const disclaimerLines = doc.splitTextToSize(
    'This report is generated automatically by the CorpLawUpdates.in calculator based on the information entered by the user and the methodology implemented in the tool. It is provided for informational and estimation purposes only and does not constitute a legal opinion, statutory certificate, audit, adjudication, or professional advice. Actual liability may depend on the facts, documents, applicable law, judicial interpretation, and the applicable RBI Bank Rate.',
    pageWidth - 28
  );
  doc.text(disclaimerLines, 14, startY);

  startY += (disclaimerLines.length * 3.5) + 3.5;

  // Supplier Eligibility Summary (if provided)
  if (data.eligibility) {
    doc.setFontSize(9.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Supplier Eligibility Overview', 14, startY);

    const eligibilityDisplayText = data.eligibility.status === 'ELIGIBLE'
      ? 'Eligible based on information provided'
      : data.eligibility.status;

    autoTable(doc, {
      startY: startY + 2.5,
      theme: 'plain',
      body: cleanTableData([
        ['Calculator Eligibility Assessment:', eligibilityDisplayText],
        ['Statutory Basis:', data.eligibility.statutoryReason]
      ]),
      styles: { fontSize: 7.5, cellPadding: 1.6, textColor: darkGray },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      },
      margin: { left: 14, right: 14, bottom: 16 }
    });
    startY = (doc as any).lastAutoTable.finalY + 5;
  }

  // Helper to format methodology name
  const getMethodologyLabel = (status: string) => {
    switch (status) {
      case 'VERIFIED_SECTION_16_MONTHLY_REST_METHOD':
        return 'Section 16 Monthly-Rest Calculation Method';
      case 'ILLUSTRATIVE_METHOD':
        return 'Daily-Prorated Method (Illustrative Calculation)';
      case 'LEGAL_VERIFICATION_REQUIRED':
        return 'Methodology Requires Legal Verification';
      default:
        return 'Section 16 Monthly-Rest Calculation Method';
    }
  };

  // Parameters Table
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Transaction & Delivery Parameters', 14, startY);

  autoTable(doc, {
    startY: startY + 2.5,
    theme: 'plain',
    body: cleanTableData([
      ['Principal Invoice Amount:', `INR ${Math.round(data.result.principal).toLocaleString('en-IN')}`],
      ['Date of Delivery / Supply:', data.result.deliveryDate || data.deliveryDate],
      ['Effective Acceptance Date:', `${data.result.effectiveAcceptanceDate} (${data.result.acceptanceModality})`],
      ['Appointed Day (Day 16):', `${data.result.appointedDay} (Section 2(b))`],
      ['Statutory Due Date:', `${data.result.dueDate} ${data.result.statutoryCapApplied ? '[Capped at 45 Days]' : ''}`],
      ['Actual Payment / Settlement Date:', data.actualPaymentDate],
      ['Rate Transition Strategy:', data.result.rateAudit.strategyUsed === 'rest_anchor' ? 'Rest Anchor Rate (Standard Monthly-Rest Method)' : 'Daily Prorated (Illustrative)'],
      ['Calculation Method:', getMethodologyLabel(data.result.methodologyStatus)],
      ['Primary Statutory Interest Rate:', `${data.result.appliedStatutoryRate.toFixed(2)}% p.a. (3x RBI Bank Rate: ${data.result.appliedBankRate.toFixed(2)}%)`]
    ]),
    styles: { fontSize: 7.5, cellPadding: 1.6, textColor: darkGray },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 115 }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  });

  // Summary Table
  const finalYParams = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Statutory Interest Calculation Summary', 14, finalYParams);

  const interestPeriodText = data.result.interestBearingDays > 0
    ? `${data.result.interestAccrualPeriod.from || data.result.interestStartDate} to ${data.result.interestAccrualPeriod.to || data.actualPaymentDate}`
    : 'N/A (Paid on or before due date)';

  autoTable(doc, {
    startY: finalYParams + 2.5,
    theme: 'grid',
    headStyles: { fillColor: navy, textColor: 255, fontSize: 8 },
    body: cleanTableData([
      ['Statutory Due Date', data.result.dueDate],
      ['Appointed Day (Day 16)', data.result.appointedDay],
      ['Interest Accrual Start Date', data.result.interestStartDate],
      ['Days Past Statutory Due Date', `${data.result.daysPastDueDate} Days`],
      ['Interest-Bearing Period', interestPeriodText],
      ['Interest-Bearing Days', `${data.result.interestBearingDays} Days`],
      ['Compounding Rest Periodicity', 'Calendar Monthly Rests (Anchor-Preserved)'],
      ['Calculation Method', getMethodologyLabel(data.result.methodologyStatus)],
      ['Total Statutory Interest Accrued', `INR ${Math.round(data.result.accruedInterest).toLocaleString('en-IN')}`],
      ['Total Cumulative Amount Payable', `INR ${Math.round(data.result.totalPayable).toLocaleString('en-IN')}`],
    ]),
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 95, fillColor: [248, 250, 252], textColor: [15, 23, 42] },
      1: { fontStyle: 'bold', halign: 'right', textColor: [15, 23, 42] }
    },
    didParseCell: function(cellData) {
      if (cellData.row.index === 8 && cellData.section === 'body' && cellData.column.index === 1) {
        cellData.cell.styles.textColor = red;
      }
      if (cellData.row.index === 9 && cellData.section === 'body' && cellData.column.index === 1) {
        cellData.cell.styles.fontSize = 8.5;
      }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  });

  let scheduleStartY = (doc as any).lastAutoTable.finalY + 5;

  // Rate transition disclaimer note
  if (data.result.rateAudit.statusDisclaimer) {
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'italic');
    doc.text(`Methodology note: ${cleanPdfText(data.result.rateAudit.statusDisclaimer)}`, 14, scheduleStartY);
    scheduleStartY += 4.5;
  } else if (data.result.rateAudit.isHistoricalMultiRate) {
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'italic');
    doc.text('Methodology note: Treatment of an RBI Bank Rate change occurring during an active monthly rest may require legal verification. Where applicable, this report identifies the selected calculation methodology.', 14, scheduleStartY);
    scheduleStartY += 4.5;
  }

  // Schedule Table (Multi-Page Supported)
  if (data.result.schedule && data.result.schedule.length > 0) {
    const finalYSummary = scheduleStartY + 1.5;
    
    doc.setFontSize(9.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Detailed Monthly Compounding Schedule (Rests)', 14, finalYSummary);

    const scheduleBody = data.result.schedule.map(item => [
      `M${item.month}`,
      `${item.periodStart} to ${item.periodEnd}`,
      `${item.daysInPeriod}d`,
      `${item.appliedStatutoryRate.toFixed(2)}%`,
      `INR ${Math.round(item.openingPrincipal).toLocaleString('en-IN')}`,
      `INR ${Math.round(item.interestThisMonth).toLocaleString('en-IN')}`,
      `INR ${Math.round(item.totalPayable).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: finalYSummary + 2.5,
      theme: 'striped',
      head: [['Rest', 'Rest Period', 'Days', 'Rate p.a.', 'Opening Balance', 'Monthly Interest', 'Closing Balance']],
      headStyles: { fillColor: navy, textColor: 255, fontSize: 7.5 },
      body: cleanTableData(scheduleBody),
      styles: { fontSize: 7, cellPadding: 1.8 },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'center' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold', textColor: red },
        6: { halign: 'right', fontStyle: 'bold', textColor: navy }
      },
      margin: { left: 14, right: 14, bottom: 16 }
    });
  }

  // Softened Statutory & Informational Footers on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    
    const taxNote = 'Section 23 note: Interest payable under Section 16 is not allowable as a deduction under the Income-tax Act, subject to applicable law.';
    const footerText = 'Generated by CorpLawUpdates.in - Informational calculation only';
    
    doc.text(taxNote, pageWidth / 2, doc.internal.pageSize.height - 11, { align: 'center' });
    doc.text(footerText, 14, doc.internal.pageSize.height - 6);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.height - 6, { align: 'right' });
  }

  doc.save(`MSME_Delayed_Payment_Interest_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
