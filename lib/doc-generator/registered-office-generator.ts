import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export interface RegisteredOfficeFormData {
  companyName?: string
  cin?: string
  meetingDate?: string
  meetingTime?: string
  meetingVenue?: string
  chairpersonName?: string
  directorsPresent?: string
  oldAddress?: string
  newAddress?: string
  effectiveDate?: string
  premisesType?: 'rented' | 'owned' | 'leased'
  ownerName?: string
  directorName?: string
  directorDin?: string
  companySecretaryName?: string
  csMembershipNo?: string
  certifiedDate?: string
  bankName?: string
  bankBranch?: string
  bankAccountNumber?: string
}

export const DEFAULT_SAMPLE_REG_OFFICE_DATA: RegisteredOfficeFormData = {
  companyName: 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED',
  cin: 'U72900DL2024PTC999999',
  meetingDate: '15/09/2026',
  meetingTime: '11:00 A.M.',
  meetingVenue: '101, Old Business Hub, Barakhamba Road, Connaught Place, New Delhi - 110001',
  chairpersonName: 'Shri A. K. Sharma',
  directorsPresent: '1. Shri A. K. Sharma (Director & Chairperson)\n2. Smt. Priya Verma (Director)\n3. Shri Vikram Mehta (Director)',
  oldAddress: '101, Old Business Hub, Barakhamba Road, Connaught Place, New Delhi - 110001',
  newAddress: 'Plot No. 99, Sample Commercial Tower, Phase II, Okhla Industrial Area, New Delhi - 110020',
  effectiveDate: '15/09/2026',
  premisesType: 'rented',
  ownerName: 'Shri R. P. Singh (Landlord)',
  directorName: 'Sample Director (Authorised Signatory)',
  directorDin: '09999999',
  companySecretaryName: 'CS Sample Sharma',
  csMembershipNo: 'A99999',
  certifiedDate: '15/09/2026',
  bankName: 'HDFC Bank Limited',
  bankBranch: 'Connaught Place Branch, New Delhi',
  bankAccountNumber: '50200012345678',
}

const FONT = 'Times New Roman'

/**
 * Builds Certified True Copy of Board Resolution (.docx)
 */
export async function buildRegisteredOfficeBoardResolutionDocx(
  data: Partial<RegisteredOfficeFormData> = {}
): Promise<Buffer> {
  const comp = data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const dt = data.meetingDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingDate || '15/09/2026'
  const tm = data.meetingTime || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingTime || '11:00 A.M.'
  const venue = data.meetingVenue || data.oldAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress || '[MEETING VENUE]'
  const chair = data.chairpersonName || DEFAULT_SAMPLE_REG_OFFICE_DATA.chairpersonName || '[CHAIRPERSON NAME]'
  const dirPresent = data.directorsPresent || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorsPresent || ''
  const oldAddr = data.oldAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress || '[OLD REGISTERED OFFICE ADDRESS]'
  const newAddr = data.newAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress || '[NEW REGISTERED OFFICE ADDRESS]'
  const effDate = data.effectiveDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.effectiveDate || dt
  const dir = data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'
  const cs = data.companySecretaryName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companySecretaryName || 'CS Sample Sharma'
  const csMem = data.csMembershipNo || DEFAULT_SAMPLE_REG_OFFICE_DATA.csMembershipNo || 'A99999'
  const certDate = data.certifiedDate || dt

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          // Company Heading
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: comp.toUpperCase(), bold: true, size: 28, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `CIN: ${cin}`, bold: true, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Registered Office: ${oldAddr}`, size: 18, italics: true, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Certified True Copy Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS',
                bold: true,
                size: 22,
                underline: {},
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `HELD ON ${dt.toUpperCase()} AT ${tm.toUpperCase()} AT ${venue.toUpperCase()}`,
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Present List
          new Paragraph({
            children: [
              new TextRun({ text: 'DIRECTORS PRESENT:', bold: true, size: 20, font: FONT }),
            ],
          }),
          ...dirPresent.split('\n').filter(Boolean).map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 20, font: FONT })],
              })
          ),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({ text: 'CHAIRPERSON: ', bold: true, size: 20, font: FONT }),
              new TextRun({ text: `${chair}, Director, took the Chair.`, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Subject Heading
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CHANGE OF REGISTERED OFFICE OF THE COMPANY WITHIN LOCAL LIMITS OF THE SAME CITY',
                bold: true,
                size: 22,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Resolution Clause 1
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `"RESOLVED THAT `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `pursuant to the provisions of Section 12(5)(a) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014 (including any statutory modification(s) or re-enactment(s) thereof for the time being in force) and the relevant provisions of the Articles of Association of the Company, the consent of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Address Box
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 720 },
            children: [
              new TextRun({ text: 'Existing Registered Office:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${oldAddr}\n\n`, font: FONT, size: 20 }),
              new TextRun({ text: 'To New Registered Office:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${newAddr}\n`, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `with effect from ${effDate}, which is within the local limits of the same city / town / village and within the jurisdiction of the same Registrar of Companies.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Resolution Clause 2: Proof of address & NOC
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `RESOLVED FURTHER THAT `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `the No Objection Certificate (NOC) received from the owner/landlord of the new premises together with the latest utility bill (electricity bill not older than 2 months) and the lease/rent agreement in respect of the new premises, placed before the meeting, be and are hereby noted and accepted as conclusive proof of the right to use the premises as the Registered Office of the Company.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Resolution Clause 3: Form INC-22 Authorization
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `RESOLVED FURTHER THAT `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) of the Company, be and are hereby severally authorized to digitally sign, certify, and file e-Form INC-22 with the Registrar of Companies within the statutory timeline of 30 days from the date of this resolution, along with requisite statutory attachments and fees, as prescribed under Section 12 of the Companies Act, 2013.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Resolution Clause 4: Name Board & Stationery
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `RESOLVED FURTHER THAT `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `the Company shall arrange to paint or affix the Company’s Name and Registered Office Address in legible letters outside and inside the new premises in English and in the local language as mandated under Section 12(3)(a) and Rule 25(2) of the Companies (Incorporation) Rules, 2014, and to arrange for taking geo-tagged interior and exterior photographs showing at least one Director/KMP present inside the registered office as required for MCA verification.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Resolution Clause 5: GST, Banks, Tax intimations
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `RESOLVED FURTHER THAT `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `the Directors of the Company be and are hereby severally authorized to update the registered office address on the company letterheads, business correspondence, invoices, official website, and to file application for amendment of core fields in Form GST REG-14 within 15 days on the GST portal, and to intimate the change of address to all banking partners, financial institutions, Income Tax authorities, EPFO, ESIC, and other regulatory agencies."`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Sign-off section
          new Paragraph({
            children: [
              new TextRun({ text: `For ${comp.toUpperCase()}\n\n\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: '________________________________________\n', font: FONT, size: 20 }),
              new TextRun({ text: `${chair}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: 'Chairperson / Director\n\n\n', font: FONT, size: 20 }),
            ],
          }),

          // Certification block
          new Paragraph({
            children: [
              new TextRun({ text: 'CERTIFIED TRUE COPY:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `For ${comp.toUpperCase()}\n\n\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: '________________________________________\n', font: FONT, size: 20 }),
              new TextRun({ text: `${dir}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `Director / Authorised Signatory\n`, font: FONT, size: 20 }),
              new TextRun({ text: `DIN: ${din}\n`, font: FONT, size: 20 }),
              new TextRun({ text: `Date: ${certDate}\n`, font: FONT, size: 20 }),
              new TextRun({ text: `Place: ${venue.split(',').pop()?.trim() || 'New Delhi'}`, font: FONT, size: 20 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Printable PDF document
 */
export async function buildRegisteredOfficeBoardResolutionPdf(
  data: Partial<RegisteredOfficeFormData> = {}
): Promise<Uint8Array> {
  const comp = data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const dt = data.meetingDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingDate || '15/09/2026'
  const tm = data.meetingTime || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingTime || '11:00 A.M.'
  const oldAddr = data.oldAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress || '[OLD REGISTERED OFFICE ADDRESS]'
  const newAddr = data.newAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress || '[NEW REGISTERED OFFICE ADDRESS]'
  const effDate = data.effectiveDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.effectiveDate || dt
  const dir = data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  let y = 800
  const margin = 50
  const contentWidth = 495

  const drawCentered = (text: string, font: any, size: number, color = rgb(0.1, 0.1, 0.1)) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    const x = (595.28 - textWidth) / 2
    page.drawText(text, { x, y, size, font, color })
    y -= size + 4
  }

  const drawJustified = (text: string, font: any, size: number, lineHeight: number) => {
    const words = text.split(' ')
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, size)
      if (width > contentWidth) {
        page.drawText(currentLine, { x: margin, y, size, font, color: rgb(0.1, 0.1, 0.1) })
        y -= lineHeight
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      page.drawText(currentLine, { x: margin, y, size, font, color: rgb(0.1, 0.1, 0.1) })
      y -= lineHeight
    }
  }

  // Company Name
  drawCentered(comp.toUpperCase(), fontBold, 13)
  drawCentered(`CIN: ${cin}`, fontBold, 9.5)
  drawCentered(`Registered Office: ${oldAddr}`, fontItalic, 8.5)
  y -= 8

  // Line separator
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + contentWidth, y },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  })
  y -= 16

  drawCentered('CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE BOARD MEETING', fontBold, 10.5)
  drawCentered(`HELD ON ${dt} AT ${tm}`, fontBold, 9.5)
  y -= 10

  drawCentered('CHANGE OF REGISTERED OFFICE WITHIN SAME LOCAL LIMITS (SECTION 12)', fontBold, 10)
  y -= 12

  drawJustified(
    `"RESOLVED THAT pursuant to the provisions of Section 12(5)(a) of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014, the approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:`,
    fontRegular,
    9.5,
    14
  )
  y -= 4

  // Address Block
  page.drawRectangle({
    x: margin + 15,
    y: y - 50,
    width: contentWidth - 30,
    height: 52,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.7, 0.75, 0.8),
    borderWidth: 0.8,
  })
  page.drawText(`From: ${oldAddr}`, {
    x: margin + 25,
    y: y - 18,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  })
  page.drawText(`To:   ${newAddr}`, {
    x: margin + 25,
    y: y - 36,
    size: 8.5,
    font: fontBold,
    color: rgb(0.05, 0.15, 0.35),
  })
  y -= 66

  drawJustified(
    `with effect from ${effDate}, which is within the local limits of the same city / town / village and within the jurisdiction of the same Registrar of Companies.`,
    fontRegular,
    9.5,
    14
  )
  y -= 6

  drawJustified(
    `RESOLVED FURTHER THAT the No Objection Certificate (NOC) and latest utility bill of the new premises placed before the Board be and are hereby accepted as proof of right to use the premises.`,
    fontRegular,
    9.5,
    14
  )
  y -= 6

  drawJustified(
    `RESOLVED FURTHER THAT ${dir}, Director (DIN: ${din}) of the Company, be and is hereby authorized to file Form INC-22 with the Registrar of Companies within 30 days of this resolution and to do all such acts, deeds, and things as may be necessary to give full effect to this resolution.`,
    fontRegular,
    9.5,
    14
  )
  y -= 6

  drawJustified(
    `RESOLVED FURTHER THAT the Company shall affix name boards at the new premises in English and local language per Section 12(3) & Rule 25(2), file Form GST REG-14 within 15 days, and intimate banking partners, tax authorities, and utility providers."`,
    fontRegular,
    9.5,
    14
  )
  y -= 25

  // Signatures
  page.drawText(`For ${comp.toUpperCase()}`, { x: margin, y, size: 9.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  page.drawText(`CERTIFIED TRUE COPY`, { x: margin + 300, y, size: 9.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  y -= 45

  page.drawLine({ start: { x: margin, y }, end: { x: margin + 140, y }, thickness: 0.8, color: rgb(0.4, 0.4, 0.4) })
  page.drawLine({ start: { x: margin + 300, y }, end: { x: margin + 440, y }, thickness: 0.8, color: rgb(0.4, 0.4, 0.4) })
  y -= 14

  page.drawText(`Chairperson`, { x: margin, y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) })
  page.drawText(`${dir}`, { x: margin + 300, y, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  y -= 12

  page.drawText(`Director / Authorised Signatory`, { x: margin + 300, y, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) })
  y -= 12
  page.drawText(`DIN: ${din}`, { x: margin + 300, y, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) })

  return await pdfDoc.save()
}

/**
 * Builds Bank & Statutory Authority Intimation Letter (.docx)
 */
export async function buildBankIntimationLetterDocx(
  data: Partial<RegisteredOfficeFormData> = {}
): Promise<Buffer> {
  const comp = data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const dt = data.meetingDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingDate || '15/09/2026'
  const oldAddr = data.oldAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress || '[OLD ADDRESS]'
  const newAddr = data.newAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress || '[NEW ADDRESS]'
  const effDate = data.effectiveDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.effectiveDate || dt
  const dir = data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'
  const bank = data.bankName || DEFAULT_SAMPLE_REG_OFFICE_DATA.bankName || '[BANK NAME]'
  const branch = data.bankBranch || DEFAULT_SAMPLE_REG_OFFICE_DATA.bankBranch || '[BRANCH ADDRESS]'
  const acct = data.bankAccountNumber || DEFAULT_SAMPLE_REG_OFFICE_DATA.bankAccountNumber || '[ACCOUNT NUMBER]'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: comp.toUpperCase(), bold: true, size: 26, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `CIN: ${cin}`, bold: true, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `New Registered Office: ${newAddr}`, size: 18, italics: true, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `Date: ${dt}`, bold: true, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Recipient
          new Paragraph({
            children: [
              new TextRun({ text: 'To,\n', font: FONT, size: 20 }),
              new TextRun({ text: 'The Branch Manager,\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${bank}\n`, font: FONT, size: 20 }),
              new TextRun({ text: `${branch}\n`, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Subject
          new Paragraph({
            children: [
              new TextRun({
                text: `SUBJECT: INTIMATION OF CHANGE OF REGISTERED OFFICE ADDRESS — ACCOUNT NO. ${acct}`,
                bold: true,
                size: 21,
                underline: {},
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Body
          new Paragraph({
            children: [
              new TextRun({ text: 'Dear Sir / Madam,\n\n', font: FONT, size: 20 }),
              new TextRun({
                text: `We wish to inform you that the Board of Directors of our Company, ${comp}, at its meeting held on ${dt}, has approved the shifting of the Registered Office of the Company from its existing premises to the following new premises with effect from ${effDate}:`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: 'Old Registered Office:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${oldAddr}\n\n`, font: FONT, size: 20 }),
              new TextRun({ text: 'New Registered Office:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${newAddr}\n`, bold: true, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `The necessary statutory e-Form INC-22 has been submitted to the Registrar of Companies (ROC) pursuant to Section 12 of the Companies Act, 2013.`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `We request you to kindly update the new Registered Office address in your bank records, CBS system, checkbook issuances, and communication records for our Current Account No. ${acct} maintained with your branch.`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'We enclose herewith the following documents for your verification and records:\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: '1. Certified True Copy of the Board Resolution dated ' + dt + '\n', font: FONT, size: 20 }),
              new TextRun({ text: '2. Copy of e-Form INC-22 filed with ROC along with MCA Challan / SRN Receipt\n', font: FONT, size: 20 }),
              new TextRun({ text: '3. Proof of Address for the new premises (Electricity Bill / Rent Agreement)\n', font: FONT, size: 20 }),
              new TextRun({ text: '4. Self-attested PAN Card copy of the Company\n\n', font: FONT, size: 20 }),
              new TextRun({ text: 'Thanking you,\nYours faithfully,\n\n', font: FONT, size: 20 }),
              new TextRun({ text: `For ${comp.toUpperCase()}\n\n\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: '________________________________________\n', font: FONT, size: 20 }),
              new TextRun({ text: `${dir}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `Director / Authorised Signatory\nDIN: ${din}`, font: FONT, size: 20 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}
