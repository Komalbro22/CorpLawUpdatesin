import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export type DividendResolutionData = {
  resolutionType: 'final' | 'interim'
  companyName?: string
  cin?: string
  registeredOffice?: string
  meetingDate?: string
  meetingTime?: string
  meetingPlace?: string
  financialYear?: string
  dividendPerShare?: string
  faceValue?: string
  eligibleShares?: string
  recordDate?: string
  paymentDeadline?: string
  chairperson?: string
  bankName?: string
}

const value = (input?: string, fallback = '____________________________') => input?.trim() || fallback

export function buildDividendResolutionText(data: DividendResolutionData) {
  const company = value(data.companyName, '[NAME OF THE COMPANY]')
  const resolutionType = data.resolutionType === 'interim' ? 'Interim' : 'Final'
  const amount = value(data.dividendPerShare, '[AMOUNT]')
  const faceValue = value(data.faceValue, '[FACE VALUE]')
  const year = value(data.financialYear, '[FINANCIAL YEAR]')
  const shares = value(data.eligibleShares, '[NUMBER OF ELIGIBLE SHARES]')
  const total = Number(data.dividendPerShare || 0) * Number(data.eligibleShares || 0)
  const totalText = total > 0 && Number.isFinite(total) ? `Rs. ${total.toLocaleString('en-IN')}` : '[AGGREGATE AMOUNT]'
  const date = value(data.meetingDate, '[DATE]')
  const time = value(data.meetingTime, '[TIME]')
  const place = value(data.meetingPlace || data.registeredOffice, '[VENUE / VC DETAILS]')
  const recordDate = value(data.recordDate, '[RECORD DATE, IF APPLICABLE]')
  const payBy = value(data.paymentDeadline, '[PAYMENT DEADLINE]')
  const bank = value(data.bankName, '[SCHEDULED BANK]')
  const chair = value(data.chairperson, '[CHAIRPERSON]')
  const cin = value(data.cin, '[CIN]')

  const opening = [
    `${company}`,
    `CIN: ${cin}`,
    `Registered Office: ${value(data.registeredOffice)}`,
    '',
    `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${company} HELD ON ${date} AT ${time} AT ${place}`,
    '',
    `CHAIRPERSON: ${chair}`,
    '',
  ]

  const finalResolution = [
    `“RESOLVED THAT pursuant to the applicable provisions of the Companies Act, 2013, including section 123, the rules made thereunder and the Articles of Association of the Company, and subject to approval of the members at the ensuing Annual General Meeting, a ${resolutionType.toLowerCase()} dividend of Rs. ${amount} per fully paid-up equity share of face value Rs. ${faceValue} each, aggregating approximately to ${totalText}, be and is hereby recommended for the financial year ${year}, to the members whose names appear in the Register of Members / beneficial owners’ records as on ${recordDate}.`,
    '',
    `RESOLVED FURTHER THAT the Board recommends that the members, at the ensuing Annual General Meeting, declare the aforesaid dividend, and that the dividend, if declared, be paid within the period prescribed by law, subject to deduction of tax at source and other applicable statutory requirements.`,
  ]

  const interimResolution = [
    `“RESOLVED THAT pursuant to section 123(3) and other applicable provisions of the Companies Act, 2013, the rules made thereunder and the Articles of Association of the Company, and after considering the financial position and available profits of the Company, an interim dividend of Rs. ${amount} per fully paid-up equity share of face value Rs. ${faceValue} each, aggregating approximately to ${totalText}, be and is hereby declared for the financial year ${year}, payable to the members whose names appear in the Register of Members / beneficial owners’ records as on ${recordDate}.`,
    '',
    `RESOLVED FURTHER THAT the total amount of dividend declared be deposited in a separate bank account with ${bank} within the period prescribed under section 123(4) of the Act, and that the dividend be paid within the period prescribed under section 127, after applicable tax deductions and verification of shareholder payment details.`,
  ]

  const common = [
    '',
    `RESOLVED FURTHER THAT the Company Secretary / Chief Financial Officer be and is hereby authorised to finalise the eligible shareholder list, verify the number of eligible shares (currently estimated at ${shares}), calculate the final aggregate amount, arrange the required bank transfer and statutory deductions, issue payment instructions, maintain supporting records, and do all acts necessary to give effect to this resolution, subject to the Act, applicable rules, the Articles of Association and any applicable SEBI requirements.`,
    '',
    `RESOLVED FURTHER THAT the authorised signatories be and are hereby authorised to operate the relevant bank account and sign such instructions and documents as may be required for payment of the dividend by ${payBy}, or within the applicable statutory period if earlier or otherwise required by law.`,
    '',
    'RESOLVED FURTHER THAT the Company Secretary be and is hereby authorised to make the necessary entries in the minutes and statutory records and, where applicable, make required intimations to the stock exchange(s) and other authorities.',
    '',
    'For and on behalf of the Board',
    '',
    `For ${company}`,
    '',
    '________________________________________',
    `${chair}`,
    'Chairperson / Director',
    'DIN: [DIN, IF APPLICABLE]',
    '',
    `Date: ${date}`,
    'Place: [PLACE]',
    '',
    'Drafting note: This is a specimen for adaptation. A final dividend is only recommended by the Board; members declare it at the AGM. An interim dividend is declared by the Board subject to section 123. Confirm distributable profits, Articles of Association, shareholder entitlement, tax treatment, record date and any listing obligations before use.',
  ]

  return [...opening, ...(data.resolutionType === 'interim' ? interimResolution : finalResolution), ...common]
}

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
