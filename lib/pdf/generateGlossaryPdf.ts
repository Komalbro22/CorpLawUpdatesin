import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  cleanPdfText,
  cleanTableData,
  renderDocumentHeader,
  renderPageFooters,
  renderSafeDisclaimer,
  PDF_PALETTE
} from './pdfUtils'

export interface GlossaryPdfData {
  term: string
  slug: string
  category: string
  fullForm?: string
  synonyms?: string[]
  definition?: string
  tldr?: string[]
  keyNumbers?: { value: string; label: string; detail?: string }[]
  cleanContent?: string
  faqs?: { q: string; a: string }[]
  lastUpdated?: string
}

export function generateGlossaryPdf(data: GlossaryPdfData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  // Category Accent Color
  const cat = (data.category || '').toUpperCase()
  let accentColor = PDF_PALETTE.blue
  if (cat === 'SEBI') accentColor = PDF_PALETTE.green
  else if (cat === 'RBI') accentColor = PDF_PALETTE.purple
  else if (cat === 'IBC') accentColor = PDF_PALETTE.red
  else if (cat === 'MCA') accentColor = PDF_PALETTE.blue
  else if (cat === 'NCLT') accentColor = PDF_PALETTE.amber
  else if (cat === 'FEMA') accentColor = PDF_PALETTE.teal

  // 1. Render platform header
  const titleText = data.fullForm 
    ? `${data.term} (${data.fullForm})`
    : data.term

  const subtitleText = [
    `Regulator: ${data.category || 'General Corporate Law'}`,
    data.synonyms && data.synonyms.length > 0 ? `Synonyms: ${data.synonyms.slice(0, 4).join(', ')}` : null,
  ].filter(Boolean).join('  |  ')

  let currentY = renderDocumentHeader(doc, {
    title: titleText,
    subtitle: subtitleText,
    dateLabel: 'Last Updated',
    dateValue: data.lastUpdated || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    categoryTag: 'CorpLawUpdates.in — Statutory Definition & Legal Commentary Dossier',
    titleColor: accentColor
  })

  // 2. Executive Quick Summary Card
  const cleanDef = cleanPdfText(data.definition || '')
  if (cleanDef) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
    doc.text('1. STATUTORY DEFINITION & LEGAL MEANING', margin, currentY)
    currentY += 4.5

    const defLines = doc.splitTextToSize(cleanDef, contentWidth - 8)
    const boxHeight = defLines.length * 4.2 + 8

    // Shaded box
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(PDF_PALETTE.lightGray[0], PDF_PALETTE.lightGray[1], PDF_PALETTE.lightGray[2])
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD')

    // Left accent bar
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(margin, currentY, 2.5, boxHeight, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
    doc.text(defLines, margin + 6, currentY + 5.5)

    currentY += boxHeight + 6
  }

  // 3. Executive Takeaways
  if (data.tldr && data.tldr.length > 0) {
    // Check page overflow
    if (currentY > pageHeight - 50) {
      doc.addPage()
      currentY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
    doc.text('2. EXECUTIVE COMPLIANCE TAKEAWAYS', margin, currentY)
    currentY += 4

    const takeawaysTableData = data.tldr.map((point, idx) => [
      `${idx + 1}.`,
      cleanPdfText(point)
    ])

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: takeawaysTableData,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        textColor: PDF_PALETTE.navy,
        overflow: 'linebreak',
        font: 'helvetica'
      },
      columnStyles: {
        0: { cellWidth: 8, fontStyle: 'bold', textColor: accentColor },
        1: { cellWidth: contentWidth - 10 }
      },
      margin: { left: margin, right: margin }
    })

    currentY = (doc as any).lastAutoTable.finalY + 6
  }

  // 4. Key Numbers at a Glance
  if (data.keyNumbers && data.keyNumbers.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage()
      currentY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
    doc.text('3. KEY STATUTORY THRESHOLDS & NUMBERS', margin, currentY)
    currentY += 4

    const numbersTableData = data.keyNumbers.map(kn => [
      cleanPdfText(kn.value),
      cleanPdfText(kn.label),
      cleanPdfText(kn.detail || '-')
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Threshold / Value', 'Statutory Requirement', 'Legal Detail / Reference']],
      body: cleanTableData(numbersTableData),
      theme: 'grid',
      headStyles: {
        fillColor: PDF_PALETTE.navy,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: PDF_PALETTE.navy,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 32, textColor: accentColor },
        1: { cellWidth: 55, fontStyle: 'bold' },
        2: { cellWidth: contentWidth - 87 }
      },
      margin: { left: margin, right: margin }
    })

    currentY = (doc as any).lastAutoTable.finalY + 6
  }

  // 5. Extended Commentary Sections (split headings and paragraphs)
  if (data.cleanContent) {
    const rawContent = data.cleanContent
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')

    // Extract sections by markdown headings or paragraphs
    const paragraphs = rawContent
      .split(/(?:\r?\n){2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 0 && !p.startsWith('<div class="faq'))

    if (paragraphs.length > 0) {
      if (currentY > pageHeight - 45) {
        doc.addPage()
        currentY = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
      doc.text('4. STATUTORY ANALYSIS & DETAILED COMMENTARY', margin, currentY)
      currentY += 5

      for (const para of paragraphs) {
        const isHeading2 = para.startsWith('## ')
        const isHeading3 = para.startsWith('### ')

        if (isHeading2 || isHeading3) {
          const cleanHeading = cleanPdfText(para.replace(/^#{2,3}\s+/, '').replace(/<[^>]*>/g, ''))
          if (currentY > pageHeight - 35) {
            doc.addPage()
            currentY = 20
          }
          currentY += 2
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(isHeading2 ? 9.5 : 8.5)
          doc.setTextColor(isHeading2 ? accentColor[0] : PDF_PALETTE.navy[0], isHeading2 ? accentColor[1] : PDF_PALETTE.navy[1], isHeading2 ? accentColor[2] : PDF_PALETTE.navy[2])
          doc.text(cleanHeading, margin, currentY)
          currentY += isHeading2 ? 4.5 : 4
        } else {
          // Regular text / list
          const cleanPara = cleanPdfText(para.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '))
          if (cleanPara.length < 5) continue

          const lines = doc.splitTextToSize(cleanPara, contentWidth)
          const neededHeight = lines.length * 3.8 + 3

          if (currentY + neededHeight > pageHeight - 25) {
            doc.addPage()
            currentY = 20
          }

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(PDF_PALETTE.slate[0], PDF_PALETTE.slate[1], PDF_PALETTE.slate[2])
          doc.text(lines, margin, currentY)
          currentY += lines.length * 3.8 + 2.5
        }
      }
      currentY += 4
    }
  }

  // 6. Frequently Asked Questions
  if (data.faqs && data.faqs.length > 0) {
    if (currentY > pageHeight - 45) {
      doc.addPage()
      currentY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
    doc.text('5. FREQUENTLY ASKED QUESTIONS (FAQS)', margin, currentY)
    currentY += 4

    const faqRows = data.faqs.slice(0, 10).map((faq, i) => [
      `Q${i + 1}: ${cleanPdfText(faq.q)}`,
      cleanPdfText(faq.a)
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Question', 'Statutory Answer & Compliance Rule']],
      body: cleanTableData(faqRows),
      theme: 'striped',
      headStyles: {
        fillColor: PDF_PALETTE.navy,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: PDF_PALETTE.navy,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65 },
        1: { cellWidth: contentWidth - 65 }
      },
      margin: { left: margin, right: margin }
    })

    currentY = (doc as any).lastAutoTable.finalY + 6
  }

  // 7. Statutory Disclaimer
  renderSafeDisclaimer(
    doc,
    'DISCLAIMER: This document is prepared for educational and professional compliance guidance by CorpLawUpdates.in. It does not constitute formal legal counsel. Readers must verify specific statutory provisions and ongoing notifications with the official Gazette of India or relevant regulatory portals (MCA, SEBI, RBI, IBBI).',
    currentY,
    { fontSize: 6.5 }
  )

  // 8. Universal Footers on all pages
  renderPageFooters(doc, 'CorpLawUpdates.in | Corporate Law Intelligence & Compliance Monograph')

  return doc
}
