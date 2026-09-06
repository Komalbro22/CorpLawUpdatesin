import jsPDF from 'jspdf'

export const PDF_PALETTE = {
  navy: [15, 23, 42] as [number, number, number],          // #0F172A Slate-900
  blue: [37, 99, 235] as [number, number, number],         // #2563EB Blue-600
  teal: [13, 148, 136] as [number, number, number],        // #0D9488 Teal-600
  purple: [126, 34, 206] as [number, number, number],      // #7E22CE Purple-700
  slate: [71, 85, 105] as [number, number, number],        // #475569 Slate-600
  gray: [100, 116, 139] as [number, number, number],       // #64748B Slate-500
  lightGray: [226, 232, 240] as [number, number, number],  // #E2E8F0 Slate-200
  red: [220, 38, 38] as [number, number, number],          // #DC2626 Red-600
  green: [16, 185, 129] as [number, number, number],       // #10B981 Emerald-500
  amber: [217, 119, 6] as [number, number, number],        // #D97706 Amber-600
}

/**
 * Universal text sanitizer for standard jsPDF helvetica font (WinAnsi/Latin-1 safe).
 * Converts Unicode symbols (Rupee, inequality, arrows, dashes, box-drawings) to clean ASCII text.
 * Prevents font metric blowout, corrupted glyphs (e.g. â‚¹), and table cell width overflows.
 */
export function cleanPdfText(text: string | null | undefined, currency: 'INR' | 'Rs' = 'INR'): string {
  if (!text) return ''
  const curr = currency === 'INR' ? 'INR ' : 'Rs. '

  return text
    // Currency normalization (handle both ₹ 500 and ₹500 without double spaces)
    .replace(/₹\s*/g, curr)
    // Box-drawing and horizontal bars
    .replace(/[═─━―—–_]{3,}/g, '---')
    .replace(/[═─━]/g, '-')
    .replace(/[│┃]/g, '|')
    // Dashes & hyphens
    .replace(/[—–]/g, ' - ')
    .replace(/[−]/g, '-')
    // Mathematical & logical
    .replace(/≤/g, '<= ')
    .replace(/≥/g, '>= ')
    .replace(/×/g, 'x')
    .replace(/≠/g, '!=')
    .replace(/±/g, '+/-')
    // Arrows
    .replace(/→/g, ' -> ')
    .replace(/←/g, ' <- ')
    .replace(/⇒/g, ' => ')
    // Quotes & apostrophes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // Bullets & checks
    .replace(/✓/g, '[Y]')
    .replace(/✔/g, '[Y]')
    .replace(/✗/g, '[N]')
    .replace(/•/g, '-')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Recursively sanitizes table rows for jsPDF-autotable, handling strings and object cells.
 */
export function cleanTableData(data: any[][], currency: 'INR' | 'Rs' = 'INR'): any[][] {
  return data.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) {
        return ''
      }
      if (typeof cell === 'string') {
        return cleanPdfText(cell, currency)
      }
      if (typeof cell === 'number' || typeof cell === 'boolean') {
        return cell
      }
      if (typeof cell === 'object' && typeof cell.content === 'string') {
        return {
          ...cell,
          content: cleanPdfText(cell.content, currency)
        }
      }
      return cell
    })
  )
}

export interface HeaderOptions {
  title: string
  subtitle?: string
  dateLabel?: string
  dateValue?: string
  categoryTag?: string
  titleColor?: [number, number, number]
}

/**
 * Renders a standard header that dynamically accounts for title length,
 * guaranteeing zero collision between the title and the right-aligned date.
 * Returns the recommended startY coordinate for the first content table/section.
 */
export function renderDocumentHeader(doc: jsPDF, options: HeaderOptions): number {
  const pageWidth = doc.internal.pageSize.width
  const {
    title,
    subtitle,
    dateLabel = 'Date',
    dateValue,
    categoryTag = "India's Free Corporate Law Intelligence & Statutory Compliance Platform",
    titleColor = PDF_PALETTE.blue
  } = options

  // 1. Platform Brand
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(PDF_PALETTE.navy[0], PDF_PALETTE.navy[1], PDF_PALETTE.navy[2])
  doc.text('CorpLawUpdates.in', 14, 18)

  // 2. Tagline
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(PDF_PALETTE.slate[0], PDF_PALETTE.slate[1], PDF_PALETTE.slate[2])
  doc.text(cleanPdfText(categoryTag), 14, 23)

  // 3. Document Title - bounded width to prevent running off right page margin
  const cleanTitle = cleanPdfText(title)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(titleColor[0], titleColor[1], titleColor[2])

  const titleLines = doc.splitTextToSize(cleanTitle, pageWidth - 28)
  let currentY = 31
  doc.text(titleLines, 14, currentY)
  currentY += (titleLines.length * 4.5)

  // 4. Subtitle and Date on dedicated sub-line (prevents horizontal title collision)
  const printDate = dateValue || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  if (subtitle) {
    doc.setTextColor(PDF_PALETTE.slate[0], PDF_PALETTE.slate[1], PDF_PALETTE.slate[2])
    const cleanSub = cleanPdfText(subtitle)
    // Constrain subtitle width so it leaves at least 55mm for the right-aligned date
    const maxSubWidth = pageWidth - 28 - 55
    const subLines = doc.splitTextToSize(cleanSub, maxSubWidth)
    doc.text(subLines[0], 14, currentY)
  }

  // Right-aligned Date
  doc.setTextColor(PDF_PALETTE.gray[0], PDF_PALETTE.gray[1], PDF_PALETTE.gray[2])
  doc.text(`${cleanPdfText(dateLabel)}: ${printDate}`, pageWidth - 14, currentY, { align: 'right' })
  currentY += 3.5

  // 5. Divider line
  doc.setDrawColor(PDF_PALETTE.lightGray[0], PDF_PALETTE.lightGray[1], PDF_PALETTE.lightGray[2])
  doc.setLineWidth(0.5)
  doc.line(14, currentY, pageWidth - 14, currentY)

  return currentY + 4.5
}

/**
 * Renders a legal/statutory disclaimer with page overflow protection.
 * If the disclaimer would overflow past the printable bottom margin, it automatically creates
 * a clean new page or clamps gracefully so text is never sliced off at the bottom.
 */
export function renderSafeDisclaimer(
  doc: jsPDF,
  disclaimerText: string,
  startY: number,
  options?: { fontSize?: number; topMargin?: number; bottomLimit?: number }
): number {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const fontSize = options?.fontSize || 7
  const bottomLimit = options?.bottomLimit || (pageHeight - 12)
  const cleanText = cleanPdfText(disclaimerText)

  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(PDF_PALETTE.gray[0], PDF_PALETTE.gray[1], PDF_PALETTE.gray[2])

  const splitText = doc.splitTextToSize(cleanText, pageWidth - 28)
  const lineHeight = fontSize * 0.42 // approx mm per line
  const requiredHeight = splitText.length * lineHeight

  let y = startY
  if (y + requiredHeight > bottomLimit) {
    doc.addPage()
    y = options?.topMargin || 18
  }

  doc.text(splitText, 14, y)
  return y + requiredHeight
}

/**
 * Loops through all pages in the document and renders clean, uniform footers:
 * Left: Platform attribution / description
 * Right: Page X of Y
 */
export function renderPageFooters(doc: jsPDF, customLeftText?: string) {
  const pageCount = (doc as any).internal.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(PDF_PALETTE.gray[0], PDF_PALETTE.gray[1], PDF_PALETTE.gray[2])

    const leftText = customLeftText || 'CorpLawUpdates.in - Free Statutory Compliance & Fee Assessment Platform'
    doc.text(cleanPdfText(leftText), 14, pageHeight - 6)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 6, { align: 'right' })
  }
}
