import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CompanyMaster, ComplianceFlag } from '@/types'
import { CINBreakdown } from '@/lib/cin-decoder'

export function generateCompanyPdfBuffer(company: CompanyMaster, flags: ComplianceFlag[]): Buffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Brand Colors
  const navy: [number, number, number] = [15, 23, 42]
  const amber: [number, number, number] = [217, 119, 6]
  const gray: [number, number, number] = [100, 116, 139]

  doc.setFont('helvetica')

  // Header
  doc.setFontSize(22)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('CorpLawUpdates.in', 14, 20)

  doc.setFontSize(9)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')
  doc.text('CORPORATE LAW INTELLIGENCE & COMPLIANCE SNAPSHOT', 14, 25)

  // Title
  doc.setFontSize(14)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text(`${company.company_name}`, 14, 38)

  doc.setFontSize(10)
  doc.setTextColor(amber[0], amber[1], amber[2])
  doc.setFont('helvetica', 'normal')
  doc.text(`CIN: ${company.cin} | Status: ${company.company_status || 'Active'}`, 14, 44)
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 14, 44, { align: 'right' })

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(14, 48, pageWidth - 14, 48)

  // 1. Company Registration Master Details Table
  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Company Master Details', 14, 56)

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A'
    return `Rs. ${val.toLocaleString('en-IN')}`
  }

  autoTable(doc, {
    startY: 60,
    theme: 'grid',
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold' },
    body: [
      ['CIN', company.cin],
      ['Company Name', company.company_name],
      ['Registration Date', company.date_of_registration ? new Date(company.date_of_registration).toLocaleDateString('en-IN') : 'N/A'],
      ['Status', company.company_status || 'Active'],
      ['Company Class', company.company_class || 'N/A'],
      ['Category / Sub-Category', `${company.company_category || ''} ${company.company_subcategory ? '/ ' + company.company_subcategory : ''}`.trim() || 'N/A'],
      ['ROC Office & State', `${company.roc_office || 'N/A'} (${company.registered_state || 'N/A'})`],
      ['Registered Address', company.registered_address || 'N/A'],
    ],
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] },
      1: { cellWidth: 125 }
    }
  })

  // 2. Capital Structure Table
  const finalYDetails = (doc as any).lastAutoTable.finalY + 6

  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Capital Structure & Categorization', 14, finalYDetails)

  autoTable(doc, {
    startY: finalYDetails + 4,
    theme: 'grid',
    head: [['Parameter', 'Amount / Classification', 'Legal Significance']],
    headStyles: { fillColor: navy, textColor: 255 },
    body: [
      ['Authorised Capital', formatCurrency(company.authorised_capital), 'Maximum share capital company is authorised to issue.'],
      ['Paid-up Capital', formatCurrency(company.paid_up_capital), 'Actual paid-up equity capital received from shareholders.'],
      ['Small Company Threshold', company.paid_up_capital && company.paid_up_capital <= 40000000 ? 'ELIGIBLE' : 'INELIGIBLE', 'Paid-up capital <= Rs 4.00 Cr limit under Sec 2(85).'],
    ],
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { fontStyle: 'bold', cellWidth: 55 },
      2: { cellWidth: 75 }
    }
  })

  // 3. Board of Directors Table
  const finalYCapital = (doc as any).lastAutoTable.finalY + 6

  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Board of Directors & DIN Master Data', 14, finalYCapital)

  const directorRows = (company.directors || []).map(d => [
    d.din,
    d.name,
    d.designation,
    d.date_of_appointment ? new Date(d.date_of_appointment).toLocaleDateString('en-IN') : 'N/A',
    'ACTIVE'
  ])

  autoTable(doc, {
    startY: finalYCapital + 4,
    theme: 'striped',
    head: [['DIN Number', 'Director Legal Name', 'Designation', 'Appointment Date', 'DIR-3 KYC']],
    headStyles: { fillColor: navy, textColor: 255 },
    body: directorRows.length > 0 ? directorRows : [['N/A', 'No Director Data Registered', 'N/A', 'N/A', 'N/A']],
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { fontStyle: 'bold', cellWidth: 60 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20, halign: 'center' }
    }
  })

  // 4. Bank Charges & Loan Mortgages Table
  const finalYDirectors = (doc as any).lastAutoTable.finalY + 6

  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Secured Bank Charges & Mortgages (CHG-1)', 14, finalYDirectors)

  const chargeRows = (company.charges || []).map(c => [
    `#${c.charge_id}`,
    c.holder_name,
    `Rs. ${(c.amount / 10000000).toFixed(2)} Cr`,
    c.creation_date ? new Date(c.creation_date).toLocaleDateString('en-IN') : 'N/A',
    c.status
  ])

  autoTable(doc, {
    startY: finalYDirectors + 4,
    theme: 'striped',
    head: [['Charge ID', 'Lending Institution / Bank Name', 'Secured Amount', 'Creation Date', 'Status']],
    headStyles: { fillColor: navy, textColor: 255 },
    body: chargeRows.length > 0 ? chargeRows : [['N/A', 'No Active Bank Charges Registered', 'N/A', 'N/A', 'N/A']],
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { fontStyle: 'bold', cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20, halign: 'center' }
    }
  })

  // 5. Statutory Compliance Snapshot Table
  const finalYCharges = (doc as any).lastAutoTable.finalY + 6

  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Phase 1 Statutory Compliance Risk Snapshot', 14, finalYCharges)

  const flagRows = flags.map(f => [
    f.label,
    f.status.toUpperCase(),
    f.detail,
    f.legal_section
  ])

  autoTable(doc, {
    startY: finalYCharges + 4,
    theme: 'striped',
    head: [['Compliance Area', 'Status', 'Assessment & Deadline Details', 'Legal Citation']],
    headStyles: { fillColor: navy, textColor: 255 },
    body: flagRows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { fontStyle: 'bold', cellWidth: 20, halign: 'center' },
      2: { cellWidth: 70 },
      3: { cellWidth: 45, fontStyle: 'italic' }
    }
  })

  // Footer Disclaimer on every page
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    const disclaimer = `Data Disclaimer: Based on last available MCA public record as of ${company.last_synced_at ? new Date(company.last_synced_at).toLocaleDateString('en-IN') : 'recent sync'}. Not a substitute for professional verification. Page ${i} of ${pageCount}`
    doc.text(disclaimer, pageWidth / 2, doc.internal.pageSize.height - 8, { align: 'center' })
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

export function generateCinDecoderPdfBuffer(breakdown: CINBreakdown): Buffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  const navy: [number, number, number] = [15, 23, 42]
  const amber: [number, number, number] = [217, 119, 6]
  const gray: [number, number, number] = [100, 116, 139]

  doc.setFont('helvetica')

  // Header
  doc.setFontSize(22)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('CorpLawUpdates.in', 14, 20)

  doc.setFontSize(9)
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.setFont('helvetica', 'normal')
  doc.text('CORPORATE IDENTIFICATION NUMBER (CIN) STRUCTURE & ANALYSIS CERTIFICATE', 14, 25)

  // Title
  doc.setFontSize(14)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text(`CIN: ${breakdown.cin}`, 14, 38)

  doc.setFontSize(10)
  doc.setTextColor(amber[0], amber[1], amber[2])
  doc.setFont('helvetica', 'normal')
  doc.text(`Classification: ${breakdown.companyType.label} | State: ${breakdown.state.name}`, 14, 44)
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 14, 44, { align: 'right' })

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(14, 48, pageWidth - 14, 48)

  // Section 1: 6-Segment Breakdown Table
  doc.setFontSize(11)
  doc.setTextColor(navy[0], navy[1], navy[2])
  doc.setFont('helvetica', 'bold')
  doc.text('1. Decoded 6-Segment Corporate Structure', 14, 56)

  autoTable(doc, {
    startY: 60,
    theme: 'grid',
    head: [['Segment Position', 'Extracted Code', 'Decoded Statutory Category', 'Official Description & Meaning']],
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold' },
    body: [
      ['Char 1 (Listing Status)', breakdown.listingStatus.code, breakdown.listingStatus.label, breakdown.listingStatus.description],
      ['Chars 2-6 (NIC Code)', breakdown.nicCode.code, breakdown.nicCode.sectorGroup, breakdown.nicCode.industry],
      ['Chars 7-8 (State Code)', breakdown.state.code, breakdown.state.name, `RoC Jurisdiction: ${breakdown.state.rocOffice}`],
      ['Chars 9-12 (Year)', String(breakdown.incorporationYear), `Incorporated in ${breakdown.incorporationYear}`, 'Year of registration under MCA.'],
      ['Chars 13-15 (Ownership)', breakdown.companyType.code, breakdown.companyType.label, breakdown.companyType.description],
      ['Chars 16-21 (Serial No)', breakdown.registrationNumber, 'RoC Serial Number', 'Unique 6-digit registration serial code.'],
    ],
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      1: { fontStyle: 'bold', cellWidth: 25, halign: 'center' },
      2: { fontStyle: 'bold', cellWidth: 45 },
      3: { cellWidth: 65 }
    }
  })

  // Footer Disclaimer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    const disclaimer = `CorpLawUpdates.in CIN Decoder & Structure Certificate. Statutory analysis generated on ${new Date().toLocaleDateString('en-IN')}. Page ${i} of ${pageCount}`
    doc.text(disclaimer, pageWidth / 2, doc.internal.pageSize.height - 8, { align: 'center' })
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
