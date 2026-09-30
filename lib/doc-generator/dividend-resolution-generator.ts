import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export {
  type DividendResolutionData,
  buildDividendResolutionText,
  SAMPLE_DIVIDEND_RESOLUTION_DATA,
} from './dividend-resolution-text'
import {
  type DividendResolutionData,
  buildDividendResolutionText,
} from './dividend-resolution-text'

export async function buildDividendResolutionDocx(data: DividendResolutionData) {
  const lines = buildDividendResolutionText(data)
  const paragraphs = lines.map((line, index) => new Paragraph({
    alignment: index === 4 ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { after: line ? 140 : 40, line: 300 },
    children: [new TextRun({
      text: line,
      font: 'Times New Roman',
      size: index === 4 ? 21 : 22,
      bold: index === 4 || line.startsWith('“RESOLVED THAT') || line.startsWith('RESOLVED FURTHER'),
    })],
  }))

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1200, bottom: 1200, left: 1300, right: 1300 } } },
      children: paragraphs,
    }],
  })
  return Packer.toBuffer(doc)
}

export async function buildDividendResolutionPdf(data: DividendResolutionData) {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.TimesRoman)
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const pageSize: [number, number] = [595.28, 841.89]
  const margin = 54
  let page = pdf.addPage(pageSize)
  let y = page.getHeight() - margin
  const lines = buildDividendResolutionText(data)

  for (const paragraph of lines) {
    if (!paragraph) { y -= 10; continue }
    const selectedFont = paragraph.startsWith('“RESOLVED') || paragraph.startsWith('RESOLVED') || paragraph.startsWith('CERTIFIED') ? bold : font
    const size = paragraph.startsWith('CERTIFIED') ? 9 : 10
    const words = paragraph.split(/\s+/)
    let currentLine = ''
    const wrapped: string[] = []
    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word
      if (selectedFont.widthOfTextAtSize(candidate, size) > page.getWidth() - margin * 2) {
        if (currentLine) wrapped.push(currentLine)
        currentLine = word
      } else currentLine = candidate
    }
    if (currentLine) wrapped.push(currentLine)

    for (const line of wrapped) {
      if (y < margin + 30) { page = pdf.addPage(pageSize); y = page.getHeight() - margin }
      page.drawText(line, { x: margin, y, size, font: selectedFont, color: rgb(0.08, 0.08, 0.08) })
      y -= 14
    }
    y -= 4
  }
  return pdf.save()
}
