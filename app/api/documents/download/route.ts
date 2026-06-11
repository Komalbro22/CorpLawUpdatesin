import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx'
import sharp from 'sharp'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

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
      // Create a PDF Document
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
      
      // Determine print-safe margins based on letterhead layout type or custom slider offsets
      let marginT = custom_margin_top !== undefined ? Number(custom_margin_top) : 72
      let marginB = custom_margin_bottom !== undefined ? Number(custom_margin_bottom) : 72
      const marginL = custom_margin_side !== undefined ? Number(custom_margin_side) : 72 // 1-inch
      const marginR = custom_margin_side !== undefined ? Number(custom_margin_side) : 72 // 1-inch

      if (custom_margin_top === undefined) {
        if (letterhead_type === 'full_page') {
          marginT = 180 // Clears top header
          marginB = 120 // Clears bottom footer
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

      // Split and wrap text lines by paragraph/clause to prevent mid-clause page breaks
      const fontHeight = 11
      const lineHeight = 15
      const lines = content.split('\n')
      
      const pagesData: { text: string; isBold: boolean }[][] = [[]]
      let currentPageLines = pagesData[0]
      let currentHeightUsed = 0

      for (const line of lines) {
        const paragraphLines: { text: string; isBold: boolean }[] = []
        if (line.trim() === '') {
          paragraphLines.push({ text: '', isBold: false })
        } else {
          // Bolding heuristics for legal documents
          const isLineBold = 
            line.toUpperCase() === line ||
            line.trim().startsWith('RESOLVED THAT') ||
            line.trim().startsWith('FURTHER RESOLVED') ||
            line.trim().startsWith('DIRECTORS PRESENT') ||
            line.trim().startsWith('CHAIRPERSON') ||
            line.trim().startsWith('CERTIFIED TRUE COPY');

          const activeFont = isLineBold ? timesBold : timesRoman
          const words = line.split(' ')
          let currentLine = ''

          for (const word of words) {
            const testLine = currentLine === '' ? word : `${currentLine} ${word}`
            const testWidth = activeFont.widthOfTextAtSize(testLine, fontHeight)
            if (testWidth > printableW) {
              paragraphLines.push({ text: currentLine, isBold: isLineBold })
              currentLine = word
            } else {
              currentLine = testLine
            }
          }
          if (currentLine !== '') {
            paragraphLines.push({ text: currentLine, isBold: isLineBold })
          }
        }

        // Calculate height needed for this paragraph
        const paragraphHeight = paragraphLines.length * lineHeight

        // Prevent mid-clause page breaks:
        // If the paragraph doesn't fit on the current page, AND it's smaller than a full page, move to next page
        if (currentHeightUsed + paragraphHeight > printableH && paragraphHeight < printableH) {
          pagesData.push([])
          currentPageLines = pagesData[pagesData.length - 1]
          currentHeightUsed = 0
        }

        // Add lines to current page (might still overflow if the paragraph is larger than a full page)
        for (const wl of paragraphLines) {
          if (currentHeightUsed + lineHeight > printableH) {
            pagesData.push([])
            currentPageLines = pagesData[pagesData.length - 1]
            currentHeightUsed = 0
          }
          currentPageLines.push(wl)
          currentHeightUsed += lineHeight
        }
      }

      // Render each page using vector page-layering if PDF letterhead is uploaded
      for (let pageIdx = 0; pageIdx < pagesData.length; pageIdx++) {
        let page: any = null
        
        if (letterheadPdfDoc) {
          try {
            // Copy the matching template page (fallback to page 0 if template has fewer pages)
            const templatePageIdx = pageIdx < letterheadPdfDoc.getPageCount() ? pageIdx : 0
            const [copiedPage] = await pdfDoc.copyPages(letterheadPdfDoc, [templatePageIdx])
            page = pdfDoc.addPage(copiedPage)
          } catch (err) {
            console.error('Failed to copy PDF letterhead page:', err)
          }
        }
        
        if (!page) {
          page = pdfDoc.addPage([pageW, pageH])
        }

        const pageLines = pagesData[pageIdx]

        // If a raster image is provided as the fallback letterhead
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

        // Draw standard faded center watermark if watermark layout is active (and we don't have a PDF letterhead backdrop already)
        if (letterhead_type === 'watermark' && embeddedImage && !letterheadPdfDoc) {
          // Centered faded logo watermark: opacity between 0.03 - 0.08
          page.drawImage(embeddedImage, {
            x: (pageW - 200) / 2,
            y: (pageH - 200) / 2,
            width: 200,
            height: 200,
            opacity: 0.05,
          })
        }

        // Draw page numbers in bottom footer margin space
        if (pagesData.length > 1) {
          const pageNumStr = `Page ${pageIdx + 1} of ${pagesData.length}`
          const pageNumW = timesRoman.widthOfTextAtSize(pageNumStr, 9)
          page.drawText(pageNumStr, {
            x: pageW - marginR - pageNumW,
            y: 36, // Print-safe 0.5-inch margin from bottom edge
            size: 9,
            font: timesRoman,
            color: rgb(0.4, 0.4, 0.4),
          })
        }

        // Draw document content text
        let yPos = pageH - marginT
        for (const wl of pageLines) {
          if (wl.text !== '') {
            const font = wl.isBold ? timesBold : timesRoman
            
            page.drawText(wl.text, {
              x: marginL,
              y: yPos,
              size: fontHeight,
              font: font,
              color: rgb(0.1, 0.1, 0.2),
            })
          }
          yPos -= lineHeight
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
      const htmlToDocx = require('html-to-docx');
      
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

      let htmlContent = content;
      if (!/<[a-z][\\s\\S]*>/i.test(htmlContent)) {
        htmlContent = htmlContent.split('\\n').map((line: string) => `<p>${line || '<br/>'}</p>`).join('');
      }

      const docxOptions = {
        margins: {
          top: twipT,
          bottom: twipB,
          left: twipL,
          right: twipR,
        },
        font: 'Times New Roman',
      };

      let headerHTML = null;
      if (letterhead_url && letterhead_type === 'logo_only') {
         headerHTML = `<div><img src="${letterhead_url}" width="120" /></div>`;
      }

      const buffer = await htmlToDocx(htmlContent, headerHTML, docxOptions);
      const uint8Array = new Uint8Array(buffer);

      return new Response(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(document_name || 'document')}.docx"`,
          'Content-Length': uint8Array.length.toString(),
        },
      })
    }

  } catch (err: any) {
    console.error('Download API error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
