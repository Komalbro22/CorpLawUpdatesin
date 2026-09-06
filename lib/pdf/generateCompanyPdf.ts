import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CompanyMaster, ComplianceFlag } from '@/types'
import { CINBreakdown } from '@/lib/cin-decoder'
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderPageFooters,
  PDF_PALETTE
} from './pdfUtils'

export function generateCompanyPdfBuffer(company: CompanyMaster, flags: ComplianceFlag[]): Buffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Brand Colors
  const navy = PDF_PALETTE.navy
  const amber = PDF_PALETTE.amber
  const gray = PDF_PALETTE.gray
  const slate = PDF_PALETTE.slate

  doc.setFont('helvetica')

  // Platform Header
  doc.setFontSize(18)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('CorpLawUpdates.in', 14, 18)

  doc.setFontSize(8)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')
  doc.text('CORPORATE LAW INTELLIGENCE & COMPLIANCE SNAPSHOT', 14, 23)

  // Company Name (Wrapped to prevent overflow)
  doc.setFontSize(12.5)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  const cleanName = cleanPdfText(company.company_name || 'Corporate Entity Master Record')
  const nameLines = doc.splitTextToSize(cleanName, pageWidth - 28)
  let headerY = 31
  doc.text(nameLines, 14, headerY)
  headerY += (nameLines.length * 4.5)

  // Sub-line: CIN, Status and Report Generated Date (Safe layout)
  doc.setFontSize(8)
  doc.setTextColor(amber[0], amber[1], amber[2])
  doc.setFont('helvetica', 'normal')
  const statusStr = `CIN: ${company.cin} | Status: ${cleanPdfText(company.company_status || 'Active')}`
  const maxStatusW = pageWidth - 28 - 55
  const statusLines = doc.splitTextToSize(statusStr, maxStatusW)
  doc.text(statusLines[0], 14, headerY)

  doc.setTextColor(gray[0], gray[1], gray[2])
  const printDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  doc.text(`Generated: ${printDate}`, pageWidth - 14, headerY, { align: 'right' })
  headerY += 3.5

  // Divider
  doc.setDrawColor(PDF_PALETTE.lightGray[0], PDF_PALETTE.lightGray[1], PDF_PALETTE.lightGray[2])
  doc.setLineWidth(0.5)
  doc.line(14, headerY, pageWidth - 14, headerY)

  // 1. Company Registration Master Details Table
  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. Company Master Details', 14, headerY + 5)

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A'
    return `INR ${val.toLocaleString('en-IN')}`
  }

  const masterRows = [
    ['CIN', company.cin],
    ['Company Name', company.company_name],
    ['Registration Date', company.date_of_registration ? new Date(company.date_of_registration).toLocaleDateString('en-IN') : 'N/A'],
    ['Status', company.company_status || 'Active'],
    ['Company Class', company.company_class || 'N/A'],
    ['Category / Sub-Category', `${company.company_category || ''} ${company.company_subcategory ? '/ ' + company.company_subcategory : ''}`.trim() || 'N/A'],
    ['ROC Office & State', `${company.roc_office || 'N/A'} (${company.registered_state || 'N/A'})`],
    ['Registered Address', company.registered_address || 'N/A'],
  ]

  autoTable(doc, {
    startY: headerY + 7,
    theme: 'grid',
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: cleanTableData(masterRows),
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { cellWidth: 132 }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  })

  // 2. Capital Structure Table
  const finalYDetails = (doc as any).lastAutoTable.finalY + 5

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('2. Capital Structure & Categorization', 14, finalYDetails)

  const capitalRows = [
    ['Authorised Capital', formatCurrency(company.authorised_capital), 'Maximum share capital company is authorised to issue.'],
    ['Paid-up Capital', formatCurrency(company.paid_up_capital), 'Actual paid-up equity capital received from shareholders.'],
    ['Small Company Threshold', company.paid_up_capital && company.paid_up_capital <= 40000000 ? 'ELIGIBLE' : 'INELIGIBLE', 'Paid-up capital <= INR 4.00 Cr limit under Sec 2(85).'],
  ]

  autoTable(doc, {
    startY: finalYDetails + 3,
    theme: 'grid',
    head: [['Parameter', 'Amount / Classification', 'Legal Significance']],
    headStyles: { fillColor: navy, textColor: 255, fontSize: 8 },
    body: cleanTableData(capitalRows),
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { fontStyle: 'bold', cellWidth: 55 },
      2: { cellWidth: 77 }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  })

  // 3. Board of Directors Table
  const finalYCapital = (doc as any).lastAutoTable.finalY + 5

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('3. Board of Directors & DIN Master Data', 14, finalYCapital)

  const directorRows = (company.directors || []).map(d => [
    d.din,
    d.name,
    d.designation,
    d.date_of_appointment ? new Date(d.date_of_appointment).toLocaleDateString('en-IN') : 'N/A',
    'ACTIVE'
  ])

  autoTable(doc, {
    startY: finalYCapital + 3,
    theme: 'striped',
    head: [['DIN Number', 'Director Legal Name', 'Designation', 'Appointment Date', 'DIR-3 KYC']],
    headStyles: { fillColor: navy, textColor: 255, fontSize: 8 },
    body: cleanTableData(directorRows.length > 0 ? directorRows : [['N/A', 'No Director Data Registered', 'N/A', 'N/A', 'N/A']]),
    styles: { fontSize: 7.2, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { fontStyle: 'bold', cellWidth: 60 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25 },
      4: { cellWidth: 22, halign: 'center' }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  })

  // 4. Bank Charges & Loan Mortgages Table
  const finalYDirectors = (doc as any).lastAutoTable.finalY + 5

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('4. Secured Bank Charges & Mortgages (CHG-1)', 14, finalYDirectors)

  const chargeRows = (company.charges || []).map(c => [
    `#${c.charge_id}`,
    c.holder_name,
    `INR ${(c.amount / 10000000).toFixed(2)} Cr`,
    c.creation_date ? new Date(c.creation_date).toLocaleDateString('en-IN') : 'N/A',
    c.status
  ])

  autoTable(doc, {
    startY: finalYDirectors + 3,
    theme: 'striped',
    head: [['Charge ID', 'Lending Institution / Bank Name', 'Secured Amount', 'Creation Date', 'Status']],
    headStyles: { fillColor: navy, textColor: 255, fontSize: 8 },
    body: cleanTableData(chargeRows.length > 0 ? chargeRows : [['N/A', 'No Active Bank Charges Registered', 'N/A', 'N/A', 'N/A']]),
    styles: { fontSize: 7.2, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { fontStyle: 'bold', cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 22, halign: 'center' }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  })

  // 5. Statutory Compliance Snapshot Table
  const finalYCharges = (doc as any).lastAutoTable.finalY + 5

  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('5. Phase 1 Statutory Compliance Risk Snapshot', 14, finalYCharges)

  const flagRows = flags.map(f => [
    f.label,
    f.status.toUpperCase(),
    f.detail,
    f.legal_section
  ])

  autoTable(doc, {
    startY: finalYCharges + 3,
    theme: 'striped',
    head: [['Compliance Area', 'Status', 'Assessment & Deadline Details', 'Legal Citation']],
    headStyles: { fillColor: navy, textColor: 255, fontSize: 8 },
    body: cleanTableData(flagRows),
    styles: { fontSize: 7.2, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { fontStyle: 'bold', cellWidth: 20, halign: 'center' },
      2: { cellWidth: 70 },
      3: { cellWidth: 47, fontStyle: 'italic' }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  })

  // Footer on every page
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    const disclaimer = `Data Disclaimer: Based on last available MCA public record as of ${company.last_synced_at ? new Date(company.last_synced_at).toLocaleDateString('en-IN') : 'recent sync'}. Not a substitute for professional verification.`
    doc.text(cleanPdfText(disclaimer), 14, doc.internal.pageSize.height - 6)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.height - 6, { align: 'right' })
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

export function generateCinDecoderPdfBuffer(breakdown: CINBreakdown): Buffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  const navy = PDF_PALETTE.navy

  doc.setFont('helvetica')

  // Header
  const startY = renderDocumentHeader(doc, {
    title: `CIN Structure & Analysis Certificate: ${breakdown.cin}`,
    subtitle: `Classification: ${breakdown.companyType.label} | State: ${breakdown.state.name}`,
    categoryTag: 'CORPORATE IDENTIFICATION NUMBER (CIN) STRUCTURE & ANALYSIS CERTIFICATE',
    dateLabel: 'Report Date'
  })

  // Section 1: 6-Segment Breakdown Table
  doc.setFontSize(10)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. Decoded 6-Segment Corporate Structure', 14, startY)

  const segmentRows = [
    ['Char 1 (Listing Status)', breakdown.listingStatus.code, breakdown.listingStatus.label, breakdown.listingStatus.description],
    ['Chars 2-6 (NIC Code)', breakdown.nicCode.code, breakdown.nicCode.sectorGroup, breakdown.nicCode.industry],
    ['Chars 7-8 (State Code)', breakdown.state.code, breakdown.state.name, `RoC Jurisdiction: ${breakdown.state.rocOffice}`],
    ['Chars 9-12 (Year)', String(breakdown.incorporationYear), `Incorporated in ${breakdown.incorporationYear}`, 'Year of registration under MCA.'],
    ['Chars 13-15 (Ownership)', breakdown.companyType.code, breakdown.companyType.label, breakdown.companyType.description],
    ['Chars 16-21 (Serial No)', breakdown.registrationNumber, 'RoC Serial Number', 'Unique 6-digit registration serial code.'],
  ]

  autoTable(doc, {
    startY: startY + 3,
    theme: 'grid',
    head: [['Segment Position', 'Extracted Code', 'Decoded Statutory Category', 'Official Description & Meaning']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    body: cleanTableData(segmentRows),
    styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      1: { fontStyle: 'bold', cellWidth: 25, halign: 'center' },
      2: { fontStyle: 'bold', cellWidth: 45 },
      3: { cellWidth: 67 }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  })

  // Footer Disclaimer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    const disclaimer = `CorpLawUpdates.in CIN Decoder & Structure Certificate. Statutory analysis generated on ${new Date().toLocaleDateString('en-IN')}.`
    doc.text(cleanPdfText(disclaimer), 14, doc.internal.pageSize.height - 6)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.height - 6, { align: 'right' })
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
