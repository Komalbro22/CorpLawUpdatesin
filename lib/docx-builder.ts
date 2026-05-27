// src/lib/docx-builder.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export async function generateDocx(
  markdown: string, 
  companyName?: string, 
  cin?: string,
  letterheadMode: 'digital' | 'preprinted' | 'none' = 'digital'
): Promise<Blob> {
  const children: any[] = []

  // 1. Digital Letterhead Header Setup
  if (letterheadMode === 'digital' && companyName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: companyName.toUpperCase(),
            bold: true,
            size: 28,
            color: '0B1F3A',
            font: 'Georgia'
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: cin ? `CIN: ${cin}` : 'CIN: Pending',
            size: 18,
            color: '8B9BB4',
            font: 'Arial'
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: '________________________________________________________________________________',
            color: 'C9A84C',
            size: 16
          })
        ]
      })
    )
  }

  // 2. Parse Markdown Lines to Document Elements
  const lines = markdown.split('\n')
  lines.forEach(line => {
    const cleanLine = line.trim()
    
    if (cleanLine.startsWith('# ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 200 },
          children: [
            new TextRun({
              text: cleanLine.substring(2).toUpperCase(),
              bold: true,
              size: 24,
              color: '0B1F3A',
              font: 'Georgia'
            })
          ]
        })
      )
    } else if (cleanLine.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 120 },
          children: [
            new TextRun({
              text: cleanLine.substring(4),
              bold: true,
              size: 20,
              color: '1E3A5F',
              font: 'Georgia'
            })
          ]
        })
      )
    } else if (cleanLine.startsWith('---')) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({
              text: '________________________________________________________________________________',
              color: '8B9BB4',
              size: 12
            })
          ]
        })
      )
    } else if (cleanLine) {
      children.push(
        new Paragraph({
          spacing: { after: 140 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: cleanLine,
              size: 22,
              font: 'Georgia'
            })
          ]
        })
      )
    }
  })


  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      }
    ]
  })

  return await Packer.toBlob(doc)
}
