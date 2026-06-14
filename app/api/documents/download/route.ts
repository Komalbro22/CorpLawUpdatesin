import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx'
import sharp from 'sharp'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import HTMLtoDOCX from 'html-to-docx'
import { markdownToHtml } from '@/lib/markdown'

// ─── Markdown Blocks & Text Runs Parser ──────────────────────────────────────
interface TextRunItem {
  text: string
  isBold: boolean
}

interface Block {
  type: 'heading1' | 'heading2' | 'heading3' | 'list_item' | 'paragraph'
  runs: TextRunItem[]
}

function parseTextRuns(text: string): TextRunItem[] {
  const parts = text.split('**')
  const runs: TextRunItem[] = []
  parts.forEach((part, index) => {
    const isBold = index % 2 === 1
    if (part !== '') {
      runs.push({ text: part, isBold })
    }
  })
  return runs
}

function parseBlocks(markdown: string): Block[] {
  const rawParagraphs = markdown.split(/\n\s*\n/)
  const blocks: Block[] = []

  for (const rawPara of rawParagraphs) {
    const trimmed = rawPara.trim()
    if (trimmed === '') continue

    let type: Block['type'] = 'paragraph'
    let content = trimmed

    if (trimmed.startsWith('# ')) {
      type = 'heading1'
      content = trimmed.slice(2).trim()
    } else if (trimmed.startsWith('## ')) {
      type = 'heading2'
      content = trimmed.slice(3).trim()
    } else if (trimmed.startsWith('### ')) {
      type = 'heading3'
      content = trimmed.slice(4).trim()
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      type = 'list_item'
      content = trimmed.slice(2).trim()
    } else {
      const numMatch = trimmed.match(/^(\d+)\.\s+([\s\S]*)$/)
      if (numMatch) {
        type = 'list_item'
        content = `${numMatch[1]}. ${numMatch[2].trim()}`
      }
    }

    const cleanContent = content.replace(/\r?\n/g, ' ')
    blocks.push({
      type,
      runs: parseTextRuns(cleanContent)
    })
  }

  return blocks
}

// ─── Tokenized Word Wrapping Engine ──────────────────────────────────────────
type LineSegment = { text: string; isBold: boolean }
type WrappedLine = LineSegment[]

function wrapRuns(
  runs: TextRunItem[],
  printableW: number,
  fontNormal: any,
  fontBold: any,
  fontSize: number
): WrappedLine[] {
  const wrappedLines: WrappedLine[] = []
  const tokens: { text: string; isBold: boolean }[] = []

  for (const run of runs) {
    const wordsAndSpaces = run.text.split(/(\s+)/)
    for (const ws of wordsAndSpaces) {
      if (ws === '') continue
      tokens.push({ text: ws, isBold: run.isBold })
    }
  }

  let activeLineSegments: LineSegment[] = []
  let activeLineWidth = 0

  for (const token of tokens) {
    const font = token.isBold ? fontBold : fontNormal
    const tokenWidth = font.widthOfTextAtSize(token.text, fontSize)

    if (token.text.trim() === '' && activeLineWidth === 0) {
      continue
    }

    if (activeLineWidth + tokenWidth <= printableW) {
      activeLineSegments.push({ text: token.text, isBold: token.isBold })
      activeLineWidth += tokenWidth
    } else {
      if (token.text.trim() !== '') {
        if (activeLineSegments.length > 0) {
          wrappedLines.push(activeLineSegments)
        }
        activeLineSegments = [{ text: token.text, isBold: token.isBold }]
        activeLineWidth = tokenWidth
      } else {
        if (activeLineSegments.length > 0) {
          wrappedLines.push(activeLineSegments)
          activeLineSegments = []
          activeLineWidth = 0
        }
      }
    }
  }

  if (activeLineSegments.length > 0) {
    wrappedLines.push(activeLineSegments)
  }

  return wrappedLines
}

export async function POST(request: Request) {
  try {
    const { 
      content, 
      document_name, 
      letterhead_url, 
      letterhead_type, 
      format,
      custom_margin_top,
      custom_margin_bottom,
      custom_margin_side 
    } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // 1. Fetch and process letterhead image or PDF template
    let letterheadBuffer: Buffer | null = null
    let letterheadPdfDoc: PDFDocument | null = null
    let imgWidth = 0
    let imgHeight = 0
    const isLetterheadPdf = letterhead_url && letterhead_url.toLowerCase().endsWith('.pdf')

    if (letterhead_url) {
      try {
        const imgRes = await fetch(letterhead_url)
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer()
          if (isLetterheadPdf) {
            letterheadPdfDoc = await PDFDocument.load(arrayBuffer)
          } else {
            const rawBuffer = Buffer.from(arrayBuffer)
            const sharpImg = sharp(rawBuffer)
            const metadata = await sharpImg.metadata()
            letterheadBuffer = await sharpImg.png().toBuffer()
            imgWidth = metadata.width || 0
            imgHeight = metadata.height || 0
          }
        }
      } catch (err) {
        console.error('Failed to fetch/process letterhead:', err)
      }
    }

    if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create()
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
      const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

      let embeddedImage: any = null
      if (letterheadBuffer) {
        try {
          embeddedImage = await pdfDoc.embedPng(letterheadBuffer)
        } catch (err) {
          console.error('Failed to embed letterhead image in PDF:', err)
        }
      }

      // PDF Settings
      const pageW = 595.27 // A4 width
      const pageH = 841.89 // A4 height
      
      let marginT = custom_margin_top !== undefined ? Number(custom_margin_top) : 72
      let marginB = custom_margin_bottom !== undefined ? Number(custom_margin_bottom) : 72
      const marginL = custom_margin_side !== undefined ? Number(custom_margin_side) : 72
      const marginR = custom_margin_side !== undefined ? Number(custom_margin_side) : 72

      if (custom_margin_top === undefined) {
        if (letterhead_type === 'full_page') {
          marginT = 180
          marginB = 120
        } else if (letterhead_type === 'top_only') {
          marginT = 180
          marginB = 54
        } else if (letterhead_type === 'footer_only') {
          marginT = 54
          marginB = 120
        } else if (letterhead_type === 'top_bottom_footer') {
          marginT = 180
          marginB = 120
        } else if (letterhead_type === 'logo_only') {
          marginT = 120
          marginB = 54
        } else if (letterhead_type === 'watermark') {
          marginT = 72
          marginB = 72
        }
      }

      const printableW = pageW - marginL - marginR
      const printableH = pageH - marginT - marginB

      // Dynamic page builder
      const pages: any[] = []
      const addPage = async () => {
        const pageIdx = pages.length
        let page: any = null

        if (letterheadPdfDoc) {
          try {
            const templatePageIdx = pageIdx < letterheadPdfDoc.getPageCount() ? pageIdx : 0
            const copiedPages = await pdfDoc.copyPages(letterheadPdfDoc, [templatePageIdx])
            const copiedPage = copiedPages[0]
            page = pdfDoc.addPage(copiedPage)
          } catch (err) {
            console.error('Failed to copy PDF letterhead page:', err)
          }
        }

        if (!page) {
          page = pdfDoc.addPage([pageW, pageH])
        }

        // Draw image backdrop if exists
        if (embeddedImage) {
          if (letterhead_type === 'full_page') {
            page.drawImage(embeddedImage, { x: 0, y: 0, width: pageW, height: pageH })
          } else if (letterhead_type === 'top_only') {
            const headerHeight = 110
            page.drawImage(embeddedImage, { x: 0, y: pageH - headerHeight, width: pageW, height: headerHeight })
          } else if (letterhead_type === 'top_bottom_footer') {
            page.drawImage(embeddedImage, { x: 0, y: 0, width: pageW, height: pageH })
          } else if (letterhead_type === 'logo_only') {
            const logoW = 80
            const logoH = 50
            page.drawImage(embeddedImage, { x: marginL, y: pageH - marginT + 20, width: logoW, height: logoH })
          }
        }

        // Faded watermark if active
        if (letterhead_type === 'watermark' && embeddedImage && !letterheadPdfDoc) {
          page.drawImage(embeddedImage, {
            x: (pageW - 200) / 2,
            y: (pageH - 200) / 2,
            width: 200,
            height: 200,
            opacity: 0.05,
          })
        }

        pages.push(page)
        return page
      }

      // Initialize first page
      let currentPage = await addPage()
      let yPos = pageH - marginT

      // Parse document markdown into blocks
      const blocks = parseBlocks(content)

      for (const block of blocks) {
        let fontSize = 10.5
        let lineHeight = 14.5
        let spaceBefore = 0
        let spaceAfter = 7
        let isBlockBold = false
        let indent = 0

        if (block.type === 'heading1') {
          fontSize = 15
          lineHeight = 19
          spaceBefore = 14
          spaceAfter = 8
          isBlockBold = true
        } else if (block.type === 'heading2') {
          fontSize = 13
          lineHeight = 17
          spaceBefore = 12
          spaceAfter = 6
          isBlockBold = true
        } else if (block.type === 'heading3') {
          fontSize = 11.5
          lineHeight = 15
          spaceBefore = 10
          spaceAfter = 6
          isBlockBold = true
        } else if (block.type === 'list_item') {
          fontSize = 10.5
          lineHeight = 14
          spaceAfter = 5
          indent = 15
        }

        // Apply space before if not at top of page
        if (spaceBefore > 0 && yPos < pageH - marginT) {
          yPos -= spaceBefore
        }

        const blockPrintableW = printableW - indent
        const wrappedLines = wrapRuns(block.runs, blockPrintableW, timesRoman, timesBold, fontSize)

        for (let lineIdx = 0; lineIdx < wrappedLines.length; lineIdx++) {
          const line = wrappedLines[lineIdx]

          // Check for page break
          if (yPos - lineHeight < marginB) {
            currentPage = await addPage()
            yPos = pageH - marginT
          }

          let currentX = marginL + indent

          // Draw bullet / prefix
          if (block.type === 'list_item' && lineIdx === 0) {
            const firstSegmentText = line[0]?.text || ''
            const hasNumberPrefix = /^\s*\d+\./.test(firstSegmentText)

            if (!hasNumberPrefix) {
              currentPage.drawText('•', {
                x: marginL + 4,
                y: yPos,
                size: fontSize,
                font: timesBold,
                color: rgb(0.12, 0.16, 0.23),
              })
            }
          }

          // Draw text segments
          for (const segment of line) {
            const isBold = isBlockBold || segment.isBold
            const font = isBold ? timesBold : timesRoman

            currentPage.drawText(segment.text, {
              x: currentX,
              y: yPos,
              size: fontSize,
              font: font,
              color: rgb(0.12, 0.16, 0.23),
            })
            currentX += font.widthOfTextAtSize(segment.text, fontSize)
          }

          yPos -= lineHeight
        }

        yPos -= spaceAfter
      }

      // Draw page numbers
      const totalPages = pages.length
      if (totalPages > 1) {
        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
          const page = pages[pageIdx]
          const pageNumStr = `Page ${pageIdx + 1} of ${totalPages}`
          const pageNumW = timesRoman.widthOfTextAtSize(pageNumStr, 9)
          page.drawText(pageNumStr, {
            x: pageW - marginR - pageNumW,
            y: 36,
            size: 9,
            font: timesRoman,
            color: rgb(0.4, 0.4, 0.4),
          })
        }
      }

      const pdfBytes = await pdfDoc.save()
      return new Response(pdfBytes as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(document_name || 'document')}.pdf"`,
          'Content-Length': pdfBytes.length.toString(),
        },
      })
    } else {
      // WORD (DOCX) EXPORT
      
      let twipT = (custom_margin_top !== undefined ? Number(custom_margin_top) : 72) * 20
      let twipB = (custom_margin_bottom !== undefined ? Number(custom_margin_bottom) : 72) * 20
      const twipL = (custom_margin_side !== undefined ? Number(custom_margin_side) : 72) * 20 // 1-inch
      const twipR = (custom_margin_side !== undefined ? Number(custom_margin_side) : 72) * 20 // 1-inch

      if (custom_margin_top === undefined) {
        if (letterhead_type === 'full_page' || letterhead_type === 'top_bottom_footer') {
          twipT = 3600 // 180 points * 20 = 3600 twips
          twipB = 2400 // 120 points * 20 = 2400 twips
        } else if (letterhead_type === 'top_only') {
          twipT = 3600
          twipB = 1080
        } else if (letterhead_type === 'footer_only') {
          twipT = 1080
          twipB = 2400
        } else if (letterhead_type === 'logo_only') {
          twipT = 2400 // 120 points * 20
          twipB = 1080
        }
      }

      const htmlContent = markdownToHtml(content);

      const docxOptions = {
        margins: {
          top: twipT,
          bottom: twipB,
          left: twipL,
          right: twipR,
          header: 720,
          footer: 720,
          gutter: 0,
        },
        font: 'Times New Roman',
      };

      let headerHTML = null;
      if (letterhead_url && letterhead_type === 'logo_only') {
         headerHTML = `<div><img src="${letterhead_url}" width="120" /></div>`;
      }

      const buffer = await HTMLtoDOCX(htmlContent, headerHTML, docxOptions);
      const responseData = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : (buffer as any);

      return new Response(responseData, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(document_name || 'document')}.docx"`,
          'Content-Length': responseData.length.toString(),
        },
      })
    }

  } catch (err: any) {
    console.error('Download API error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
