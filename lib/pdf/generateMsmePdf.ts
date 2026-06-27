import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompoundingScheduleItem } from '../penaltyCalculator';

interface PdfData {
  invoiceAmount: string;
  acceptanceDate: string;
  agreedPaymentDate: string;
  actualPaymentDate: string;
  bankRate: string;
  result: {
    principal: number;
    appointedDay: string;
    daysDelayed: number;
    interestRate: number;
    accruedInterest: number;
    totalPayable: number;
    schedule: CompoundingScheduleItem[];
  };
}

export function generateMsmePdf(data: PdfData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Colors
  const navy: [number, number, number] = [15, 23, 42];
  const purple: [number, number, number] = [126, 34, 206];
  const red: [number, number, number] = [220, 38, 38];
  const gray: [number, number, number] = [100, 116, 139];

  // Fonts
  doc.setFont('helvetica');

  // Header
  doc.setFontSize(22);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('CorpLawUpdates.in', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('CORPORATE LAW INTELLIGENCE', 14, 27);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(purple[0], purple[1], purple[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('MSME Delayed Payment Interest Report', 14, 42);
  
  doc.setFontSize(10);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated in accordance with Section 16 of the MSMED Act, 2006', 14, 48);
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 48, { align: 'right' });

  // Input Parameters
  doc.setFontSize(12);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculation Parameters', 14, 60);

  autoTable(doc, {
    startY: 64,
    theme: 'plain',
    head: [],
    body: [
      ['Invoice / Principal Amount:', `Rs. ${Math.round(parseFloat(data.invoiceAmount) || 0).toLocaleString('en-IN')}`],
      ['Date of Acceptance:', data.acceptanceDate],
      ['Agreed Payment Date:', data.agreedPaymentDate || 'Not specified'],
      ['Actual Payment Date:', data.actualPaymentDate],
      ['RBI Bank Rate:', `${data.bankRate}%`],
    ],
    styles: { fontSize: 10, cellPadding: 2, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 100 }
    }
  });

  // Summary
  const finalYParams = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculation Summary', 14, finalYParams);

  autoTable(doc, {
    startY: finalYParams + 4,
    theme: 'grid',
    headStyles: { fillColor: navy, textColor: 255 },
    body: [
      ['Appointed Day (Payment Due)', data.result.appointedDay],
      ['Days Delayed', `${data.result.daysDelayed} Days`],
      ['Compounding Rate (3x Bank Rate)', `${data.result.interestRate.toFixed(2)}% p.a.`],
      ['Total Interest Accrued', `Rs. ${Math.round(data.result.accruedInterest).toLocaleString('en-IN')}`],
      ['Total Amount Payable', `Rs. ${Math.round(data.result.totalPayable).toLocaleString('en-IN')}`],
    ],
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100, fillColor: [248, 250, 252], textColor: [15, 23, 42] },
      1: { fontStyle: 'bold', halign: 'right', textColor: [15, 23, 42] }
    },
    didParseCell: function(data) {
      if (data.row.index === 3 && data.section === 'body' && data.column.index === 1) {
        data.cell.styles.textColor = red;
      }
      if (data.row.index === 4 && data.section === 'body' && data.column.index === 1) {
        data.cell.styles.fontSize = 13;
      }
    }
  });

  // Schedule Table
  if (data.result.schedule && data.result.schedule.length > 0) {
    const finalYSummary = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Compounding Schedule (Rests)', 14, finalYSummary);

    const scheduleBody = data.result.schedule.map(item => [
      `Month ${item.month}`,
      item.daysElapsed,
      `Rs. ${Math.round(item.interestThisMonth).toLocaleString('en-IN')}`,
      `Rs. ${Math.round(item.cumulativeInterest).toLocaleString('en-IN')}`,
      `Rs. ${Math.round(item.totalPayable).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: finalYSummary + 4,
      theme: 'striped',
      head: [['Rest', 'Elapsed Days', 'Monthly Interest', 'Cumulative Int.', 'Balance Due']],
      headStyles: { fillColor: navy, textColor: 255 },
      body: scheduleBody,
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold', textColor: red },
        4: { halign: 'right', fontStyle: 'bold', textColor: navy }
      }
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'normal');
    const footerText = 'Disclaimer: This report provides indicative interest calculations under the MSMED Act. This does not constitute legal or financial advice.';
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  // Save PDF
  doc.save(`MSME_Penalty_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
