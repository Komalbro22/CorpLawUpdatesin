import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  Packer,
} from 'docx'
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { cleanText } from './docx-utils'

export type DirectorDesignation =
  | 'Additional Director'
  | 'Director'
  | 'Independent Director'
  | 'Nominee Director'
  | 'Executive Director'
  | 'Managing Director'

export interface DirectorAppointmentFormData {
  companyName: string
  companyCin: string
  companyAddress: string
  companyEmail?: string
  directorName: string
  directorDin: string
  directorAddress: string
  directorPan?: string
  designation: DirectorDesignation
  effectiveDate: string
  term: string
  remuneration: string
  boardCommittees: string
  signatoryName: string
  signatoryDesignation: string
  meetingDate?: string
}

export const DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA: DirectorAppointmentFormData = {
  companyName: 'ZENITH AGROTECH PRIVATE LIMITED',
  companyCin: 'U01100MH2020PTC345678',
  companyAddress: '401, Nariman Bhavan, 227 Backbay Reclamation, Nariman Point, Mumbai - 400021, Maharashtra, India',
  companyEmail: 'compliance@zenithagrotech.in',
  directorName: 'CA Sneha Ramesh Kulkarni',
  directorDin: '08945612',
  directorAddress: 'B-702, Sea Green Apartments, Worli Sea Face, Mumbai - 400030, Maharashtra, India',
  directorPan: 'ABCDE1234F',
  designation: 'Independent Director',
  effectiveDate: '15th October 2026',
  term: '5 (Five) consecutive years from October 15, 2026 to October 14, 2031',
  remuneration: 'Sitting fees of ₹30,000 per meeting of the Board and ₹15,000 per Committee meeting, plus reimbursement of actual travel expenses incurred for attending meetings, subject to Section 197 of the Companies Act, 2013.',
  boardCommittees: 'Audit Committee (Chairperson), Nomination & Remuneration Committee (Member)',
  signatoryName: 'Rajendra Prasad Verma',
  signatoryDesignation: 'Director',
  meetingDate: '14th October 2026',
}

/**
 * Generates plain markdown for live preview in the browser
 */
export function generateDirectorAppointmentMarkdown(data: DirectorAppointmentFormData): string {
  const isAdditional = data.designation === 'Additional Director'
  const isIndependent = data.designation === 'Independent Director'

  return `# ${data.companyName.toUpperCase()}
**CIN:** ${data.companyCin}  
**Registered Office:** ${data.companyAddress}  
**Email:** ${data.companyEmail || 'compliance@company.in'}

---

**CONFIDENTIAL & FORMAL APPOINTMENT LETTER**

**Date:** ${data.effectiveDate}  
**Reference:** BOD/APPT/${new Date().getFullYear()}/${data.directorDin}

To,  
**${data.directorName}**  
**DIN:** ${data.directorDin}  
${data.directorPan ? `**PAN:** ${data.directorPan}  \n` : ''}${data.directorAddress}

---

### **Subject: Letter of Appointment as ${data.designation} of ${data.companyName}**

Dear Sir / Madam,

On behalf of **${data.companyName}** (the **"Company"**), we are pleased to inform you that the Board of Directors of the Company, in its meeting held on **${
    data.meetingDate || data.effectiveDate
  }**, has approved your appointment as an **${data.designation}** on the Board of Directors of the Company, pursuant to the provisions of the Companies Act, 2013 and the Articles of Association of the Company.

The detailed terms and conditions of your appointment, which are in accordance with the Companies Act, 2013 and applicable corporate governance standards, are set out below:

---

### **1. Term and Tenure of Appointment**
1.1 Your appointment as an **${data.designation}** shall take effect from **${data.effectiveDate}**.  
${
  isAdditional
    ? `1.2 Pursuant to Section 161(1) of the Companies Act, 2013, as an Additional Director, you shall hold office up to the date of the next Annual General Meeting (AGM) of the Company or the last date on which the AGM should have been held, whichever is earlier. Your appointment is subject to regularisation by the shareholders at the ensuing general meeting.`
    : isIndependent
    ? `1.2 Pursuant to Section 149, Section 152, and Schedule IV of the Companies Act, 2013, your appointment is for a tenure of **${data.term}**, subject to the approval of shareholders in a General Meeting. You shall not be liable to retire by rotation.`
    : `1.2 Your appointment is for a tenure of **${data.term}**, subject to the provisions of the Articles of Association and the Companies Act, 2013.`
}

### **2. Board Committees**
2.1 During your tenure, you may be requested to serve on one or more committees of the Board. As on the date of appointment, you have been designated to serve on:
> **${data.boardCommittees || 'General Board Oversight Committees as constituted by the Board'}**

### **3. Fiduciary Duties and Responsibilities (Section 166)**
3.1 You shall discharge your duties with due and reasonable care, skill, and diligence in accordance with **Section 166 of the Companies Act, 2013**, including:
*(a)* To act in good faith in order to promote the objects of the Company for the benefit of its members as a whole, and in the best interests of the Company, its employees, the shareholders, and the community;  
*(b)* To exercise independent judgment and avoid situations involving direct or indirect conflicts of interest with the Company;  
*(c)* Not to achieve or attempt to achieve any undue gain or advantage either for yourself or for your relatives, partners, or associates;  
*(d)* Not to assign your office, as any assignment so made shall be void under Section 166(6).

${
  isIndependent
    ? `### **4. Code for Independent Directors (Schedule IV)**
4.1 As an Independent Director, you shall adhere strictly to the **Code for Independent Directors** prescribed under **Schedule IV** of the Companies Act, 2013.  
4.2 You confirm that you satisfy the criteria of independence specified in **Section 149(6)** and undertake to submit the annual declaration of independence under **Section 149(7)** at the first board meeting of every financial year.`
    : ''
}

### **${isIndependent ? '5' : '4'}. Remuneration and Sitting Fees**
${isIndependent ? '5' : '4'}.1 **Terms of Remuneration:**  
> ${data.remuneration}  
${isIndependent ? '5' : '4'}.2 The Company shall reimburse you for all reasonable, properly documented out-of-pocket expenses (including airfare, lodging, and local conveyance) incurred in connection with the performance of your duties or attendance at Board/Committee meetings, subject to Section 197 and Schedule V limits.

### **${isIndependent ? '6' : '5'}. Disclosures and Statutory Compliances**
${isIndependent ? '6' : '5'}.1 You acknowledge having provided your **written consent to act as director in Form DIR-2** pursuant to Section 152(5) and Rule 8 of the Companies (Appointment and Qualification of Directors) Rules, 2014.  
${isIndependent ? '6' : '5'}.2 You confirm non-disqualification under **Section 164** of the Companies Act, 2013.  
${isIndependent ? '6' : '5'}.3 You agree to disclose your concern or interest in any other companies, firms, or bodies corporate in **Form MBP-1** pursuant to **Section 184(1)** at the first Board Meeting in which you participate as director.  
${isIndependent ? '6' : '5'}.4 The Company shall file **Form DIR-12** with the Registrar of Companies (ROC) within thirty (30) days of your appointment under Section 170(2).

### **${isIndependent ? '7' : '6'}. Confidentiality and Insider Trading**
${isIndependent ? '7' : '6'}.1 You shall maintain strict confidentiality concerning all non-public commercial, financial, operational, and strategic information acquired during the course of your directorship and shall not disclose the same to any third party without prior Board sanction.

### **${isIndependent ? '8' : '7'}. Governing Law**
${isIndependent ? '8' : '7'}.1 This letter of appointment and any dispute arising hereunder shall be governed by and construed in accordance with the laws of the Republic of India and subject to the exclusive jurisdiction of the competent civil courts at the Company's registered office.

---

Kindly signify your formal acceptance of the terms and conditions of this appointment by signing and returning the duplicate copy of this letter to the Company.

We look forward to your valuable guidance, counsel, and contribution to the growth of the Company.

Yours faithfully,  
**For and on behalf of ${data.companyName}**

<br><br>
___________________________________________  
**${data.signatoryName}**  
${data.signatoryDesignation}  
DIN / PAN: Available in ROC Records

---

### **FORMAL ACCEPTANCE AND ACKNOWLEDGEMENT**

I, **${data.directorName}** (DIN: **${data.directorDin}**), hereby confirm and accept the terms and conditions of my appointment as **${data.designation}** of **${data.companyName}** as set forth in this Letter of Appointment.

<br><br>
___________________________________________  
**Signature of Appointee Director**  
**Name:** ${data.directorName}  
**DIN:** ${data.directorDin}  
**Date of Acceptance:** _______________________  
**Place:** ___________________________________
`
}

/**
 * Builds Word (.docx) document
 */
export async function buildDirectorAppointmentDocx(data: DirectorAppointmentFormData = DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA): Promise<Buffer> {
  const FONT = 'Times New Roman'
  const isAdditional = data.designation === 'Additional Director'
  const isIndependent = data.designation === 'Independent Director'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          // Letterhead
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: cleanText(data.companyName).toUpperCase(), bold: true, size: 26, font: FONT }),
              new TextRun({ break: 1, text: `CIN: ${cleanText(data.companyCin)}`, font: FONT, size: 18 }),
              new TextRun({ break: 1, text: `Registered Office: ${cleanText(data.companyAddress)}`, font: FONT, size: 18 }),
              new TextRun({ break: 1, text: `Email: ${cleanText(data.companyEmail || 'compliance@company.in')}`, font: FONT, size: 18 }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: 'FORMAL LETTER OF APPOINTMENT AS DIRECTOR',
                bold: true,
                size: 22,
                font: FONT,
                underline: {},
              }),
            ],
          }),

          // Date & Addressee
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Date: ', bold: true, font: FONT, size: 21 }),
              new TextRun({ text: cleanText(data.effectiveDate), font: FONT, size: 21 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({ text: 'To,\n', font: FONT, size: 21 }),
              new TextRun({ text: `${cleanText(data.directorName)}\n`, bold: true, font: FONT, size: 21 }),
              new TextRun({ text: `DIN: ${cleanText(data.directorDin)}\n`, font: FONT, size: 21 }),
              new TextRun({ text: `${cleanText(data.directorAddress)}`, font: FONT, size: 20 }),
            ],
          }),

          // Subject
          new Paragraph({
            spacing: { before: 80, after: 120 },
            children: [
              new TextRun({
                text: `Subject: Appointment as ${cleanText(data.designation)} of ${cleanText(data.companyName)}`,
                bold: true,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({
                text: `Dear Sir / Madam,\nWe are pleased to confirm that the Board of Directors of ${cleanText(
                  data.companyName
                )}, in its meeting held on ${cleanText(data.meetingDate || data.effectiveDate)}, has approved your appointment as an `,
                font: FONT,
                size: 21,
              }),
              new TextRun({ text: cleanText(data.designation), bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: ` on the Board of Directors of the Company pursuant to the provisions of the Companies Act, 2013 and the Articles of Association.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 1: Term
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '1. Term of Appointment: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: isAdditional
                  ? `Your appointment is effective from ${cleanText(
                      data.effectiveDate
                    )}. Under Section 161(1) of the Companies Act, 2013, as an Additional Director you hold office up to the date of the next Annual General Meeting (AGM) of the Company and your appointment is subject to regularisation by shareholders at the ensuing general meeting.`
                  : `Your appointment is effective from ${cleanText(data.effectiveDate)} for a tenure of: ${cleanText(
                      data.term
                    )}, subject to the provisions of the Companies Act, 2013 and the Articles of Association.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 2: Committees
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '2. Board Committees: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `You have been requested to serve on the following Board Committees: ${cleanText(
                  data.boardCommittees || 'General committees as constituted'
                )}.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 3: Duties
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '3. Fiduciary Duties (Section 166): ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'You shall act in good faith to promote the objects of the Company, exercise independent judgment, avoid conflicts of interest, and refrain from seeking any undue gain or advantage. Office of director cannot be assigned under Section 166(6).',
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 4: Remuneration
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '4. Remuneration & Sitting Fees: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `${cleanText(data.remuneration)} Actual travelling and out-of-pocket expenses for attending meetings shall be reimbursed pursuant to Section 197 limits.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 5: Statutory Filings
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 280 },
            children: [
              new TextRun({ text: '5. Mandatory Disclosures & ROC Filings: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'The Company records receipt of your Form DIR-2 consent (Section 152(5)) and Section 164 non-disqualification. You shall submit Form MBP-1 general disclosure of interest (Section 184(1)) at the first meeting. The Company shall file Form DIR-12 with the Registrar of Companies within 30 days pursuant to Section 170(2).',
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Sign-off
          new Paragraph({
            spacing: { before: 140, after: 80 },
            children: [
              new TextRun({ text: `For and on behalf of ${cleanText(data.companyName)}:`, bold: true, font: FONT, size: 21 }),
              new TextRun({ break: 3, text: '____________________________________', font: FONT, size: 21 }),
              new TextRun({ break: 1, text: cleanText(data.signatoryName), bold: true, font: FONT, size: 21 }),
              new TextRun({ break: 1, text: cleanText(data.signatoryDesignation), font: FONT, size: 20 }),
            ],
          }),

          // Acceptance Block
          new Paragraph({
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: 'ACCEPTANCE AND ACKNOWLEDGEMENT:', bold: true, font: FONT, size: 21, underline: {} }),
              new TextRun({
                break: 1,
                text: `I, ${cleanText(data.directorName)} (DIN: ${cleanText(
                  data.directorDin
                )}), hereby accept the appointment and agree to the terms set out herein.`,
                font: FONT,
                size: 20,
              }),
              new TextRun({ break: 3, text: '____________________________________', font: FONT, size: 21 }),
              new TextRun({ break: 1, text: `Signature of Appointee Director`, bold: true, font: FONT, size: 20 }),
              new TextRun({ break: 1, text: `Date: ________________________`, font: FONT, size: 20 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds PDF document
 */
export async function buildDirectorAppointmentPdf(data: DirectorAppointmentFormData = DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  const margin = 50
  const pageWidth = 595.28
  const pageHeight = 841.89
  const contentWidth = pageWidth - margin * 2
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const checkNewPage = (needed: number) => {
    if (y - needed < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
  }

  const drawWrapped = (text: string, font: PDFFont, size: number, lineHeight: number, color = rgb(0.1, 0.1, 0.1), indent = 0) => {
    const clean = text.replace(/[\r\n]+/g, ' ').trim()
    const words = clean.split(/\s+/)
    let line = ''
    const maxW = contentWidth - indent

    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (font.widthOfTextAtSize(test, size) > maxW) {
        checkNewPage(lineHeight)
        currentPage.drawText(line, { x: margin + indent, y, size, font, color })
        y -= lineHeight
        line = w
      } else {
        line = test
      }
    }
    if (line) {
      checkNewPage(lineHeight)
      currentPage.drawText(line, { x: margin + indent, y, size, font, color })
      y -= lineHeight
    }
  }

  // Header Letterhead
  const comp = data.companyName.toUpperCase()
  const compW = fontBold.widthOfTextAtSize(comp, 13)
  currentPage.drawText(comp, { x: (pageWidth - compW) / 2, y, size: 13, font: fontBold, color: rgb(0.05, 0.1, 0.2) })
  y -= 14

  const cinLine = `CIN: ${data.companyCin} | Regd Office: ${data.companyAddress.substring(0, 75)}`
  const cinW = fontRegular.widthOfTextAtSize(cinLine, 8)
  currentPage.drawText(cinLine, { x: (pageWidth - cinW) / 2, y, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) })
  y -= 16

  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.1, 0.6, 0.4),
  })
  y -= 18

  // Title
  const title = `LETTER OF APPOINTMENT — ${data.designation.toUpperCase()}`
  const titleW = fontBold.widthOfTextAtSize(title, 11)
  currentPage.drawText(title, { x: (pageWidth - titleW) / 2, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  y -= 18

  drawWrapped(`Date: ${data.effectiveDate}`, fontBold, 9.5, 13)
  y -= 2
  drawWrapped(`To: ${data.directorName} (DIN: ${data.directorDin})`, fontBold, 9.5, 13)
  drawWrapped(`Address: ${data.directorAddress}`, fontRegular, 9, 12.5)
  y -= 8

  drawWrapped(`Subject: Appointment as ${data.designation} under the Companies Act, 2013`, fontBold, 9.5, 13.5)
  y -= 4

  drawWrapped(
    `We are pleased to confirm that the Board of Directors, in its meeting held on ${data.meetingDate || data.effectiveDate}, has appointed you as ${data.designation} of ${data.companyName} on the following terms:`,
    fontRegular,
    9,
    13
  )
  y -= 6

  const items = [
    {
      title: '1. Tenure: ',
      text:
        data.designation === 'Additional Director'
          ? `Effective ${data.effectiveDate}. Holds office until the next AGM under Section 161(1), subject to regularisation.`
          : `Effective ${data.effectiveDate} for ${data.term} pursuant to Sections 149/152.`,
    },
    {
      title: '2. Committees: ',
      text: `Assigned to: ${data.boardCommittees || 'General committees as constituted by the Board'}.`,
    },
    {
      title: '3. Duties (Sec 166): ',
      text: 'To act in good faith, exercise due care, avoid conflict of interest, and ensure no office assignment.',
    },
    {
      title: '4. Remuneration: ',
      text: `${data.remuneration} Subject to Section 197 ceiling and out-of-pocket travel reimbursements.`,
    },
    {
      title: '5. Compliances: ',
      text: 'Form DIR-2 received. Submit Form MBP-1 (Sec 184) at first meeting. Company will file Form DIR-12 within 30 days (Sec 170(2)).',
    },
  ]

  for (const item of items) {
    checkNewPage(30)
    currentPage.drawText(item.title, { x: margin, y, size: 9, font: fontBold })
    const w = fontBold.widthOfTextAtSize(item.title, 9)
    drawWrapped(item.text, fontRegular, 9, 12.5, rgb(0.15, 0.15, 0.15), w)
    y -= 3
  }

  // Signatures
  checkNewPage(120)
  y -= 12
  currentPage.drawText(`For and on behalf of ${data.companyName.substring(0, 40)}:`, { x: margin, y, size: 8.5, font: fontBold })
  y -= 30
  currentPage.drawText('___________________________________', { x: margin, y, size: 8.5, font: fontRegular })
  y -= 12
  currentPage.drawText(`${data.signatoryName} (${data.signatoryDesignation})`, { x: margin, y, size: 8.5, font: fontRegular })

  y -= 25
  currentPage.drawText('ACCEPTANCE BY DIRECTOR:', { x: margin, y, size: 8.5, font: fontBold })
  drawWrapped(`I, ${data.directorName} (DIN: ${data.directorDin}), agree to the terms of this appointment letter.`, fontRegular, 8.5, 12)
  y -= 25
  currentPage.drawText('___________________________________', { x: margin, y, size: 8.5, font: fontRegular })
  y -= 12
  currentPage.drawText(`Signature & Date: ___________________`, { x: margin, y, size: 8.5, font: fontRegular })

  return await pdfDoc.save()
}
