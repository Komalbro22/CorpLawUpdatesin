import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Footer,
  Packer,
  HeadingLevel,
  PageBreak
} from 'docx'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { DocumentSetDocument } from '@/lib/document-sets-data'

export const DOCUMENT_SET_FOOTER_STAMP =
  'CorpLawUpdates.in | Director Appointment Document Set v1.0 | Law as at 7 November 2026 | Draft template for reference — get it reviewed by your company secretary before use or filing.'

const FONT_FAMILY = 'Bookman Old Style'
const SIZE_TITLE = 28 // 14pt
const SIZE_HEADING = 24 // 12pt Bold
const SIZE_BODY = 24 // 12pt
const SIZE_FOOTNOTE = 18 // 9pt
const LINE_SPACING = 360 // 1.5 line spacing
const MARGIN_DXA = 1440 // 1 inch

/**
 * Compiles a single DocumentSetDocument into a Word (.docx) buffer.
 */
export async function compileDocumentSetDocx(doc: DocumentSetDocument): Promise<Buffer> {
  const children: Paragraph[] = []

  // Document Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: doc.title.toUpperCase(),
          bold: true,
          size: SIZE_TITLE,
          font: FONT_FAMILY,
        }),
      ],
    })
  )

  // Governing Section & Step Badge
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Step ${doc.step_number} of 11 • ${doc.governing_section} • Version ${doc.version}`,
          size: SIZE_FOOTNOTE,
          font: FONT_FAMILY,
          color: '555555',
          italics: true,
        }),
      ],
    })
  )

  // Body paragraphs split by double newline
  const paragraphs = doc.template_text.split(/\n\n+/)
  for (const pText of paragraphs) {
    const trimmed = pText.trim()
    if (!trimmed) continue

    const lines = trimmed.split('\n')
    const runs: TextRun[] = []

    lines.forEach((line, lIdx) => {
      const isBold = line.startsWith('FORM ') || line.startsWith('NOTICE ') || line.startsWith('AGENDA') || line.startsWith('PART ') || line.startsWith('CERTIFIED TRUE COPY')
      runs.push(
        new TextRun({
          text: line,
          bold: isBold,
          size: SIZE_BODY,
          font: FONT_FAMILY,
          break: lIdx > 0 ? 1 : 0,
        })
      )
    })

    const isCenter = trimmed.startsWith('FORM ') || trimmed.startsWith('NOTICE ') || trimmed.startsWith('CERTIFIED TRUE COPY')
    children.push(
      new Paragraph({
        alignment: isCenter ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        spacing: { after: 180, line: LINE_SPACING },
        children: runs,
      })
    )
  }

  // Footer stamp inside docx
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120 },
        children: [
          new TextRun({
            text: DOCUMENT_SET_FOOTER_STAMP,
            size: SIZE_FOOTNOTE,
            font: FONT_FAMILY,
            color: '666666',
            italics: true,
          }),
        ],
      }),
    ],
  })

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_DXA,
              right: MARGIN_DXA,
              bottom: MARGIN_DXA,
              left: MARGIN_DXA,
            },
          },
        },
        footers: {
          default: footer,
        },
        children,
      },
    ],
  })

  return await Packer.toBuffer(wordDoc)
}

/**
 * Compiles all documents in the set into a single combined complete pack (.docx).
 */
export async function compileCompletePackDocx(documents: DocumentSetDocument[]): Promise<Buffer> {
  const children: Paragraph[] = []

  // Pack Cover Page Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'DIRECTOR APPOINTMENT - COMPLETE DOCUMENT SET',
          bold: true,
          size: 32, // 16pt
          font: FONT_FAMILY,
        }),
      ],
    })
  )

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'All documents of this set in filing order — Companies Act, 2013 (Law as at 7 November 2026)',
          size: SIZE_BODY,
          font: FONT_FAMILY,
          italics: true,
          color: '444444',
        }),
      ],
    })
  )

  children.push(new Paragraph({ children: [new PageBreak()] }))

  // Iterate over each document in filing order
  documents.forEach((doc, idx) => {
    // Document Section Header
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 150 },
        children: [
          new TextRun({
            text: `DOCUMENT ${String(idx + 1).padStart(2, '0')}: ${doc.title.toUpperCase()}`,
            bold: true,
            size: SIZE_TITLE,
            font: FONT_FAMILY,
          }),
        ],
      })
    )

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 250 },
        children: [
          new TextRun({
            text: `Governing Law: ${doc.governing_section} | Step ${doc.step_number} of 11`,
            size: SIZE_FOOTNOTE,
            font: FONT_FAMILY,
            color: '666666',
            italics: true,
          }),
        ],
      })
    )

    // Body content
    const paragraphs = doc.template_text.split(/\n\n+/)
    for (const pText of paragraphs) {
      const trimmed = pText.trim()
      if (!trimmed) continue
      const lines = trimmed.split('\n')
      const runs: TextRun[] = []
      lines.forEach((line, lIdx) => {
        const isBold = line.startsWith('FORM ') || line.startsWith('NOTICE ') || line.startsWith('AGENDA') || line.startsWith('PART ') || line.startsWith('CERTIFIED TRUE COPY')
        runs.push(
          new TextRun({
            text: line,
            bold: isBold,
            size: SIZE_BODY,
            font: FONT_FAMILY,
            break: lIdx > 0 ? 1 : 0,
          })
        )
      })
      const isCenter = trimmed.startsWith('FORM ') || trimmed.startsWith('NOTICE ') || trimmed.startsWith('CERTIFIED TRUE COPY')
      children.push(
        new Paragraph({
          alignment: isCenter ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          spacing: { after: 180, line: LINE_SPACING },
          children: runs,
        })
      )
    }

    if (idx < documents.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }
  })

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120 },
        children: [
          new TextRun({
            text: DOCUMENT_SET_FOOTER_STAMP,
            size: SIZE_FOOTNOTE,
            font: FONT_FAMILY,
            color: '666666',
            italics: true,
          }),
        ],
      }),
    ],
  })

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_DXA,
              right: MARGIN_DXA,
              bottom: MARGIN_DXA,
              left: MARGIN_DXA,
            },
          },
        },
        footers: {
          default: footer,
        },
        children,
      },
    ],
  })

  return await Packer.toBuffer(wordDoc)
}

/**
 * Compiles a single DocumentSetDocument into a PDF buffer using jsPDF.
 */
export async function compileDocumentSetPdf(doc: DocumentSetDocument): Promise<Buffer> {
  const pdf = new jsPDF({
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 54 // 0.75 in
  const usableWidth = pageWidth - margin * 2

  let y = margin

  const printFooter = () => {
    pdf.setFont('times', 'italic')
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text(DOCUMENT_SET_FOOTER_STAMP, pageWidth / 2, pageHeight - 30, {
      align: 'center',
      maxWidth: usableWidth,
    })
  }

  // Document Title
  pdf.setFont('times', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(15, 23, 42)
  const titleLines = pdf.splitTextToSize(doc.title.toUpperCase(), usableWidth)
  pdf.text(titleLines, pageWidth / 2, y, { align: 'center' })
  y += titleLines.length * 18 + 5

  // Subtitle
  pdf.setFont('times', 'italic')
  pdf.setFontSize(10)
  pdf.setTextColor(80, 80, 80)
  pdf.text(`Step ${doc.step_number} of 11 • ${doc.governing_section} • Version ${doc.version}`, pageWidth / 2, y, { align: 'center' })
  y += 25

  printFooter()

  // Body
  pdf.setFont('times', 'normal')
  pdf.setFontSize(10.5)
  pdf.setTextColor(20, 20, 20)

  const paragraphs = doc.template_text.split(/\n\n+/)
  for (const p of paragraphs) {
    const trimmed = p.trim()
    if (!trimmed) continue

    const isBold = trimmed.startsWith('FORM ') || trimmed.startsWith('NOTICE ') || trimmed.startsWith('AGENDA') || trimmed.startsWith('PART ') || trimmed.startsWith('CERTIFIED TRUE COPY')
    if (isBold) {
      pdf.setFont('times', 'bold')
    } else {
      pdf.setFont('times', 'normal')
    }

    const lines = pdf.splitTextToSize(trimmed, usableWidth)
    const requiredHeight = lines.length * 15 + 10

    if (y + requiredHeight > pageHeight - 50) {
      pdf.addPage()
      printFooter()
      y = margin
    }

    pdf.text(lines, margin, y)
    y += lines.length * 15 + 10
  }

  const arrayBuffer = pdf.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

/**
 * Compiles all documents into a ZIP archive containing individual .docx files.
 */
export async function compileCompletePackZip(documents: DocumentSetDocument[]): Promise<Buffer> {
  const zip = new JSZip()

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    const docxBuf = await compileDocumentSetDocx(doc)
    const filename = `${String(i + 1).padStart(2, '0')}-${doc.spoke_slug.replace(/[^a-z0-9_-]/gi, '')}-${doc.version}.docx`
    zip.file(filename, docxBuf)
  }

  // Also include the combined single pack
  const combinedBuf = await compileCompletePackDocx(documents)
  zip.file('00-director-appointment-complete-pack-v1.0.docx', combinedBuf)

  return await zip.generateAsync({ type: 'nodebuffer' })
}
