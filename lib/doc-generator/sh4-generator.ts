import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
} from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export interface Sh4FormData {
  executionDate?: string
  cin?: string
  companyName?: string
  stockExchange?: string
  securityClass?: string
  nominalValue?: string
  calledUpValue?: string
  paidUpValue?: string
  numberOfSecurities?: string
  numberOfSecuritiesWords?: string
  consideration?: string
  considerationWords?: string
  distinctiveFrom?: string
  distinctiveTo?: string
  certificateNumbers?: string
  transferorFolio?: string
  transferorName?: string
  witnessName?: string
  witnessAddress?: string
  witnessPincode?: string
  transfereeName?: string
  transfereeRelativeName?: string
  transfereeAddress?: string
  transfereePincode?: string
  transfereeEmail?: string
  transfereeOccupation?: string
  transfereeExistingFolio?: string
  transfereeFolioNo?: string
  stampDutyAmount?: string
  femaApprovalRequired?: boolean
  directorName?: string
  directorDin?: string
  meetingDate?: string
  registeredOffice?: string
}

export const DEFAULT_SAMPLE_SH4_DATA: Sh4FormData = {
  executionDate: '15/09/2026',
  cin: 'U72900DL2024PTC999999',
  companyName: 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED',
  stockExchange: 'N/A (Unlisted Private Company)',
  securityClass: 'Equity Shares',
  nominalValue: '10',
  calledUpValue: '10',
  paidUpValue: '10',
  numberOfSecurities: '1,000',
  numberOfSecuritiesWords: 'One Thousand Only',
  consideration: '1,00,000',
  considerationWords: 'One Lakh Rupees Only',
  distinctiveFrom: '1001',
  distinctiveTo: '2000',
  certificateNumbers: '01',
  transferorFolio: 'SMPL-001',
  transferorName: 'Sample Transferor (Shri A. K. Sharma)',
  witnessName: 'Sample Witness (Shri R. P. Singh)',
  witnessAddress: '102, Sample Commercial Complex, Barakhamba Road, New Delhi',
  witnessPincode: '110001',
  transfereeName: 'Sample Transferee (Smt. Priya Verma)',
  transfereeRelativeName: 'Late Shri M. L. Verma (Father)',
  transfereeAddress: 'Flat No. 404, Sample Residency, Sector 14, Gurugram, Haryana',
  transfereePincode: '122001',
  transfereeEmail: 'transferee.sample@example.com',
  transfereeOccupation: 'Professional / Business (Sample)',
  transfereeExistingFolio: 'New Member',
  stampDutyAmount: '15.00',
  femaApprovalRequired: false,
  directorName: 'Sample Director (Authorised Signatory)',
  directorDin: '09999999',
  meetingDate: '25/09/2026',
  registeredOffice: 'Plot No. 99, Sample Industrial Area, Phase II, New Delhi - 110020',
}

const FONT = 'Times New Roman'
const BORDER_STYLE = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
}

const CELL_MARGINS = { top: 100, bottom: 100, left: 140, right: 140 }

function createCell(
  text: string,
  options?: {
    bold?: boolean
    widthPct?: number
    align?: (typeof AlignmentType)[keyof typeof AlignmentType]
    size?: number
    italics?: boolean
  }
) {
  const size = options?.size || 20
  const bold = !!options?.bold
  const italics = !!options?.italics
  const align = options?.align || AlignmentType.LEFT

  return new TableCell({
    width: options?.widthPct ? { size: options.widthPct, type: WidthType.PERCENTAGE } : undefined,
    borders: BORDER_STYLE,
    margins: CELL_MARGINS,
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text,
            font: FONT,
            size,
            bold,
            italics,
          }),
        ],
      }),
    ],
  })
}

/**
 * Builds Form SH-4 Microsoft Word Document (.docx)
 */
export async function buildSh4Docx(data: Partial<Sh4FormData> = {}): Promise<Buffer> {
  const d = {
    executionDate: data.executionDate || '____/____/2026',
    cin: data.cin || '__________________________________',
    companyName: data.companyName || '____________________________________________________',
    stockExchange: data.stockExchange || 'N/A (Unlisted Private Company)',
    securityClass: data.securityClass || 'Equity Shares',
    nominalValue: data.nominalValue || '______',
    calledUpValue: data.calledUpValue || '______',
    paidUpValue: data.paidUpValue || '______',
    numberOfSecurities: data.numberOfSecurities || '____________',
    numberOfSecuritiesWords: data.numberOfSecuritiesWords || '________________________________________________',
    consideration: data.consideration || '____________',
    considerationWords: data.considerationWords || '________________________________________________',
    distinctiveFrom: data.distinctiveFrom || '____________',
    distinctiveTo: data.distinctiveTo || '____________',
    certificateNumbers: data.certificateNumbers || '____________',
    transferorFolio: data.transferorFolio || '____________',
    transferorName: data.transferorName || '________________________________________________',
    witnessName: data.witnessName || '________________________________________________',
    witnessAddress: data.witnessAddress || '________________________________________________',
    witnessPincode: data.witnessPincode || '____________',
    transfereeName: data.transfereeName || '________________________________________________',
    transfereeRelativeName: data.transfereeRelativeName || '________________________________________________',
    transfereeAddress: data.transfereeAddress || '________________________________________________',
    transfereePincode: data.transfereePincode || '____________',
    transfereeEmail: data.transfereeEmail || '________________________',
    transfereeOccupation: data.transfereeOccupation || '________________________',
    transfereeExistingFolio: data.transfereeExistingFolio || 'New Member',
    stampDutyAmount: data.stampDutyAmount || '15.00',
    femaApprovalRequired: data.femaApprovalRequired ?? false,
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'FORM NO. SH-4', bold: true, size: 28, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'SECURITIES TRANSFER FORM', bold: true, size: 24, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '[Pursuant to section 56 of the Companies Act, 2013 and sub-rule (1) of rule 11 of the Companies (Share Capital and Debentures) Rules 2014]',
                italics: true,
                size: 18,
                font: FONT,
              }),
            ],
          }),

          // Date of execution
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 140 },
            children: [
              new TextRun({ text: 'Date of execution: ', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: d.executionDate, font: FONT, size: 20 }),
            ],
          }),

          // Recital
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 160, line: 280 },
            children: [
              new TextRun({
                text: 'FOR THE CONSIDERATION stated below the “Transferor(s)” named do hereby transfer to the “Transferee(s)” named the securities specified below subject to the conditions on which the said securities are now held by the Transferor(s) and the Transferee(s) do hereby agree to accept and hold the said securities subject to the conditions aforesaid.',
                font: FONT,
                size: 20,
              }),
            ],
          }),

          // Company Details
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'CIN: ', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: d.cin, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Name of the company (in full): ', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: d.companyName, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: 'Name of the Stock Exchange where the company is listed, if any: ',
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: d.stockExchange, font: FONT, size: 20 }),
            ],
          }),

          // Section Heading: Description of Securities
          new Paragraph({
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({ text: 'DESCRIPTION OF SECURITIES:', bold: true, size: 22, font: FONT }),
            ],
          }),

          // Table: Securities details
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell('Kind/Class of securities (1)', { bold: true, widthPct: 25 }),
                  createCell('Nominal value of each unit of security (2)', { bold: true, widthPct: 25 }),
                  createCell('Amount called up per unit of security (3)', { bold: true, widthPct: 25 }),
                  createCell('Amount paid up per unit of security (4)', { bold: true, widthPct: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(d.securityClass, { widthPct: 25 }),
                  createCell(`₹ ${d.nominalValue}`, { widthPct: 25 }),
                  createCell(`₹ ${d.calledUpValue}`, { widthPct: 25 }),
                  createCell(`₹ ${d.paidUpValue}`, { widthPct: 25 }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 80 } }),

          // Table: Quantity & Consideration
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell('No. of Securities being transferred', { bold: true, widthPct: 50 }),
                  createCell('Consideration Received (₹)', { bold: true, widthPct: 50 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(`In figures: ${d.numberOfSecurities}\nIn words: ${d.numberOfSecuritiesWords}`, { widthPct: 50 }),
                  createCell(`In figures: ₹ ${d.consideration}\nIn words: ${d.considerationWords}`, { widthPct: 50 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(`Distinctive Numbers: From ${d.distinctiveFrom} to ${d.distinctiveTo}`, { widthPct: 50 }),
                  createCell(`Corresponding Certificate Nos.: ${d.certificateNumbers}`, { widthPct: 50 }),
                ],
              }),
            ],
          }),

          // Section Heading: Transferor Particulars
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: 'TRANSFEROR’S PARTICULARS:', bold: true, size: 22, font: FONT }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell(`Registered Folio Number: ${d.transferorFolio}`, { bold: true, widthPct: 40 }),
                  createCell(`Name(s) in full: ${d.transferorName}`, { widthPct: 60 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Transferor Signature(s):', { bold: true, widthPct: 40 }),
                  createCell('\n\n________________________________________\nSignature of Transferor', { widthPct: 60 }),
                ],
              }),
            ],
          }),

          // Witness Confirmation
          new Paragraph({
            spacing: { before: 160, after: 80 },
            children: [
              new TextRun({ text: 'ATTESTATION / WITNESS CONFIRMATION:', bold: true, size: 22, font: FONT }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: 'I hereby confirm that the Transferor has signed before me.',
                italics: true,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell(`Name of Witness: ${d.witnessName}\nAddress: ${d.witnessAddress}\nPin Code: ${d.witnessPincode}`, { widthPct: 60 }),
                  createCell('\n\n________________________________________\nSignature of Witness', { widthPct: 40 }),
                ],
              }),
            ],
          }),

          // Section Heading: Transferee Particulars
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: 'TRANSFEREE’S PARTICULARS:', bold: true, size: 22, font: FONT }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell('Name in full (1)', { bold: true, widthPct: 22, size: 18 }),
                  createCell('Father’s / Mother’s / Spouse name (2)', { bold: true, widthPct: 22, size: 18 }),
                  createCell('Address & E-mail ID (3)', { bold: true, widthPct: 26, size: 18 }),
                  createCell('Occupation (4)', { bold: true, widthPct: 11, size: 18 }),
                  createCell('Existing Folio No., if any (5)', { bold: true, widthPct: 10, size: 18 }),
                  createCell('Signature (6)', { bold: true, widthPct: 9, size: 18 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(`1. ${d.transfereeName}`, { widthPct: 22, size: 18 }),
                  createCell(d.transfereeRelativeName, { widthPct: 22, size: 18 }),
                  createCell(`${d.transfereeAddress}\nPIN: ${d.transfereePincode}\nE-mail: ${d.transfereeEmail}`, { widthPct: 26, size: 18 }),
                  createCell(d.transfereeOccupation, { widthPct: 11, size: 18 }),
                  createCell(d.transfereeExistingFolio, { widthPct: 10, size: 18 }),
                  createCell('\n\n________________\n(1)', { widthPct: 9, size: 18 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('2.', { widthPct: 22, size: 18 }),
                  createCell('', { widthPct: 22, size: 18 }),
                  createCell('', { widthPct: 26, size: 18 }),
                  createCell('', { widthPct: 11, size: 18 }),
                  createCell('', { widthPct: 10, size: 18 }),
                  createCell('\n\n________________\n(2)', { widthPct: 9, size: 18 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('3.', { widthPct: 22, size: 18 }),
                  createCell('', { widthPct: 22, size: 18 }),
                  createCell('', { widthPct: 26, size: 18 }),
                  createCell('', { widthPct: 11, size: 18 }),
                  createCell('', { widthPct: 10, size: 18 }),
                  createCell('\n\n________________\n(3)', { widthPct: 9, size: 18 }),
                ],
              }),
            ],
          }),

          // Folio & Specimen Signature of Transferee
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell(`Folio No. of Transferee: ${d.transfereeExistingFolio}`, { bold: true, widthPct: 35, size: 18 }),
                  createCell('Specimen Signature of Transferee:\n(1) ____________________  (2) ____________________  (3) ____________________', { bold: true, widthPct: 65, size: 18 }),
                ],
              }),
            ],
          }),

          // Value of Stamp Affixed Box
          new Paragraph({
            spacing: { before: 180, after: 60 },
            children: [
              new TextRun({ text: 'Value of stamp affixed: ', bold: true, size: 20, font: FONT }),
              new TextRun({ text: `₹ ${d.stampDutyAmount}`, font: FONT, size: 20 }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: BORDER_STYLE,
                    margins: { top: 160, bottom: 160, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: `STAMPS\n(Statutory duty calculated @ 0.015% under Schedule I, Article 62 of Indian Stamp Act, 1899)\n\n[ SPACE FOR AFFIXING SHARE TRANSFER STAMPS / E-STAMP CERTIFICATE / ACKNOWLEDGEMENT ]\n\nNote: Cancel share transfer stamps by writing signature across or punching as required under Section 12 of Indian Stamp Act.`,
                            font: FONT,
                            size: 18,
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Mandatory 2022 Declaration (FEMA Non-debt Instruments Rules, 2019)
          new Paragraph({
            spacing: { before: 180, after: 60 },
            children: [
              new TextRun({
                text: 'Declaration (Pursuant to Companies (Share Capital & Debentures) Amendment Rules, 2022):',
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: d.femaApprovalRequired ? '(   )' : '( X )',
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: ' Transferee is not required to obtain the Government approval under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019 prior to transfer of shares; or',
                font: FONT,
                size: 19,
                bold: !d.femaApprovalRequired,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: d.femaApprovalRequired ? '( X )' : '(   )',
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: ' Transferee is required to obtain the Government approval under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019 prior to transfer of shares and the same has been obtained and is enclosed herewith.',
                font: FONT,
                size: 19,
                bold: d.femaApprovalRequired,
              }),
            ],
          }),

          // Enclosures
          new Paragraph({
            spacing: { before: 140, after: 50 },
            children: [
              new TextRun({ text: 'Enclosures:', bold: true, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({ text: '(1) Certificate of shares or debentures or other securities', font: FONT, size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({ text: '(2) If no certificate is issued, letter of allotment.', font: FONT, size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({ text: '(3) Copy of PAN Card of Transferee (mandatory).', font: FONT, size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({ text: '(4) Declaration / Approval under Foreign Exchange Management (Non-debt Instruments) Rules, 2019 (if applicable).', font: FONT, size: 18 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: '(5) Others, specify: __________________________________________________', font: FONT, size: 18 }),
            ],
          }),

          // Office Use Only
          new Paragraph({
            spacing: { before: 140, after: 50 },
            children: [
              new TextRun({ text: 'For office use only:', bold: true, size: 20, font: FONT }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell('Checked by: _________________________\nSignature tallied by: ____________________\nEntered in Register of Transfers on: _________\nvide Transfer No.: _____________________', { widthPct: 50, size: 18 }),
                  createCell('Approval Date: _________________________\nPower of attorney / Probate / Death Certificate / Letter of Administration\nRegistered on: _____________ at No.: __________', { widthPct: 50, size: 18 }),
                ],
              }),
            ],
          }),

          // Table of Endorsement (on reverse of certificate)
          new Paragraph({
            spacing: { before: 180, after: 60 },
            children: [
              new TextRun({ text: 'On the reverse page of the certificate:', bold: true, size: 20, font: FONT }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell('Name of the Transferor', { bold: true, widthPct: 25, size: 18 }),
                  createCell('Name of the Transferee', { bold: true, widthPct: 25, size: 18 }),
                  createCell('No. of shares', { bold: true, widthPct: 15, size: 18 }),
                  createCell('Date of Transfer', { bold: true, widthPct: 15, size: 18 }),
                  createCell('Signature of the authorized signatory', { bold: true, widthPct: 20, size: 18 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(d.transferorName, { widthPct: 25, size: 18 }),
                  createCell(d.transfereeName, { widthPct: 25, size: 18 }),
                  createCell(d.numberOfSecurities, { widthPct: 15, size: 18 }),
                  createCell('_____/_____/2026', { widthPct: 15, size: 18 }),
                  createCell('\n\n__________________', { widthPct: 20, size: 18 }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Board Resolution Word Document (.docx)
 */
export async function buildBoardResolutionDocx(data: Partial<Sh4FormData> = {}): Promise<Buffer> {
  const companyName = data.companyName || DEFAULT_SAMPLE_SH4_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_SH4_DATA.cin || '[CIN]'
  const registeredOffice = data.registeredOffice || DEFAULT_SAMPLE_SH4_DATA.registeredOffice || '[REGISTERED OFFICE ADDRESS]'
  const meetingDate = data.meetingDate || DEFAULT_SAMPLE_SH4_DATA.meetingDate || '25/09/2026'
  const numSecurities = data.numberOfSecurities || DEFAULT_SAMPLE_SH4_DATA.numberOfSecurities || '1,000'
  const numSecuritiesWords = data.numberOfSecuritiesWords || DEFAULT_SAMPLE_SH4_DATA.numberOfSecuritiesWords || 'One Thousand Only'
  const nominalValue = data.nominalValue || DEFAULT_SAMPLE_SH4_DATA.nominalValue || '10'
  const distinctiveFrom = data.distinctiveFrom || DEFAULT_SAMPLE_SH4_DATA.distinctiveFrom || '1001'
  const distinctiveTo = data.distinctiveTo || DEFAULT_SAMPLE_SH4_DATA.distinctiveTo || '2000'
  const certNumbers = data.certificateNumbers || DEFAULT_SAMPLE_SH4_DATA.certificateNumbers || '01'
  const transferorName = data.transferorName || DEFAULT_SAMPLE_SH4_DATA.transferorName || '[TRANSFEROR NAME]'
  const transfereeName = data.transfereeName || DEFAULT_SAMPLE_SH4_DATA.transfereeName || '[TRANSFEREE NAME]'
  const consideration = data.consideration || DEFAULT_SAMPLE_SH4_DATA.consideration || '1,00,000'
  const considerationWords = data.considerationWords || DEFAULT_SAMPLE_SH4_DATA.considerationWords || 'One Lakh Rupees Only'
  const directorName = data.directorName || DEFAULT_SAMPLE_SH4_DATA.directorName || '[DIRECTOR NAME]'
  const directorDin = data.directorDin || DEFAULT_SAMPLE_SH4_DATA.directorDin || '09999999'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: companyName.toUpperCase(), bold: true, size: 28, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `CIN: ${cin}`, size: 18, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({ text: `Registered Office: ${registeredOffice}`, size: 18, font: FONT }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${companyName.toUpperCase()} HELD ON ${meetingDate} AT THE REGISTERED OFFICE OF THE COMPANY`,
                bold: true,
                size: 22,
                font: FONT,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: 'APPROVAL FOR TRANSFER OF EQUITY SHARES UNDER SECTION 56 OF THE COMPANIES ACT, 2013',
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 180, line: 320 },
            children: [
              new TextRun({
                text: `"RESOLVED THAT pursuant to the provisions of Section 56 of the Companies Act, 2013 read with Rule 11 of the Companies (Share Capital and Debentures) Rules, 2014, and other applicable provisions (if any), and the Articles of Association of the Company, the transfer of ${numSecurities} (${numSecuritiesWords}) Equity Shares of ₹${nominalValue}/- each fully paid up bearing distinctive numbers from ${distinctiveFrom} to ${distinctiveTo} (both inclusive), comprised in Share Certificate No(s) ${certNumbers}, from ${transferorName} (Transferor) to ${transfereeName} (Transferee) for a total consideration of ₹${consideration}/- (Rupees ${considerationWords}) as per the duly stamped, dated and executed Share Transfer Deed in Form SH-4 received by the Company, be and is hereby approved.`,
                font: FONT,
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 180, line: 320 },
            children: [
              new TextRun({
                text: `RESOLVED FURTHER THAT ${directorName}, Director (DIN: ${directorDin}) of the Company, be and is hereby authorized to make necessary endorsements on the reverse of the relevant Share Certificate(s) and deliver the same to the Transferee within the statutory timeline of one month from the date of lodgement as prescribed under Section 56(4) of the Companies Act, 2013.`,
                font: FONT,
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360, line: 320 },
            children: [
              new TextRun({
                text: `RESOLVED FURTHER THAT ${directorName}, Director / Company Secretary of the Company, be and is hereby authorized to make necessary entries in the Register of Transfers (Form SH-6) and Register of Members (Form MGT-1) maintained pursuant to Section 88 of the Companies Act, 2013, and to take all such steps as may be necessary to give effect to the aforesaid resolution."`,
                font: FONT,
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 240, after: 60 },
            children: [
              new TextRun({ text: `For ${companyName}`, bold: true, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 20 },
            children: [
              new TextRun({ text: '\n\n\n________________________________________', font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 20 },
            children: [
              new TextRun({ text: directorName, bold: true, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `Director / Authorised Signatory\nDIN: ${directorDin}`, font: FONT, size: 18 }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 200 },
            children: [
              new TextRun({ text: `Date: ${meetingDate}\nPlace: New Delhi`, font: FONT, size: 18 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Form SH-4 Printable PDF Document
 */
export async function buildSh4Pdf(data: Partial<Sh4FormData> = {}): Promise<Uint8Array> {
  const d = {
    executionDate: data.executionDate || '____/____/2026',
    cin: data.cin || '____________________________________',
    companyName: data.companyName || '____________________________________________________',
    stockExchange: data.stockExchange || 'N/A (Unlisted Private Company)',
    securityClass: data.securityClass || 'Equity Shares',
    nominalValue: data.nominalValue || '______',
    calledUpValue: data.calledUpValue || '______',
    paidUpValue: data.paidUpValue || '______',
    numberOfSecurities: data.numberOfSecurities || '____________',
    numberOfSecuritiesWords: data.numberOfSecuritiesWords || '______________________________________',
    consideration: data.consideration || '____________',
    considerationWords: data.considerationWords || '______________________________________',
    distinctiveFrom: data.distinctiveFrom || '____________',
    distinctiveTo: data.distinctiveTo || '____________',
    certificateNumbers: data.certificateNumbers || '____________',
    transferorFolio: data.transferorFolio || '____________',
    transferorName: data.transferorName || '________________________________________________',
    witnessName: data.witnessName || '________________________________________________',
    witnessAddress: data.witnessAddress || '________________________________________________',
    witnessPincode: data.witnessPincode || '____________',
    transfereeName: data.transfereeName || '________________________________________________',
    transfereeRelativeName: data.transfereeRelativeName || '________________________________________________',
    transfereeAddress: data.transfereeAddress || '________________________________________________',
    transfereePincode: data.transfereePincode || '____________',
    transfereeEmail: data.transfereeEmail || '________________________',
    transfereeOccupation: data.transfereeOccupation || '________________________',
    transfereeExistingFolio: data.transfereeExistingFolio || 'New Member',
    stampDutyAmount: data.stampDutyAmount || '15.00',
    femaApprovalRequired: data.femaApprovalRequired ?? false,
  }

  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  // ==================== PAGE 1: FRONT PAGE ====================
  const page1 = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = page1.getSize()
  const margin = 36
  const tableW = width - margin * 2
  let y = height - 36

  const drawCenterText = (text: string, font: any, size: number, color = rgb(0.1, 0.1, 0.1)) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page1.drawText(text, { x: (width - textWidth) / 2, y, size, font, color })
    y -= size + 4
  }

  // Header
  drawCenterText('FORM NO. SH-4', helveticaBold, 13)
  drawCenterText('SECURITIES TRANSFER FORM', helveticaBold, 11)
  drawCenterText(
    '[Pursuant to section 56 of the Companies Act, 2013 and sub-rule (1) of rule 11 of the Companies (Share Capital and Debentures) Rules 2014]',
    helveticaOblique,
    7.5,
    rgb(0.3, 0.3, 0.3)
  )
  y -= 2

  // Date of Execution
  const dateStr = `Date of execution: ${d.executionDate}`
  const dateW = helveticaBold.widthOfTextAtSize(dateStr, 8.5)
  page1.drawText(dateStr, { x: width - margin - dateW, y, size: 8.5, font: helveticaBold })
  y -= 12

  // Recital text
  const recital =
    'FOR THE CONSIDERATION stated below the "Transferor(s)" named do hereby transfer to the "Transferee(s)" named the securities specified below subject to the conditions on which the said securities are now held by the Transferor(s) and the Transferee(s) do hereby agree to accept and hold the said securities subject to the conditions aforesaid.'

  const words = recital.split(' ')
  let line = ''
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word
    if (helvetica.widthOfTextAtSize(testLine, 7.5) > tableW) {
      page1.drawText(line, { x: margin, y, size: 7.5, font: helvetica, color: rgb(0.15, 0.15, 0.15) })
      y -= 10
      line = word
    } else {
      line = testLine
    }
  }
  if (line) {
    page1.drawText(line, { x: margin, y, size: 7.5, font: helvetica, color: rgb(0.15, 0.15, 0.15) })
    y -= 12
  }

  // Company Details
  page1.drawText(`CIN: ${d.cin}`, { x: margin, y, size: 8, font: helveticaBold })
  y -= 11
  page1.drawText(`Name of the company (in full): ${d.companyName}`, { x: margin, y, size: 8, font: helveticaBold })
  y -= 11
  page1.drawText(`Name of the Stock Exchange (if listed): ${d.stockExchange}`, { x: margin, y, size: 8, font: helvetica })
  y -= 13

  // Description of Securities Table
  page1.drawText('DESCRIPTION OF SECURITIES:', { x: margin, y, size: 8.5, font: helveticaBold })
  y -= 9

  const colW = tableW / 4
  const row1H = 18
  const row2H = 15

  page1.drawRectangle({
    x: margin,
    y: y - row1H - row2H,
    width: tableW,
    height: row1H + row2H,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })

  page1.drawText('Kind/Class of securities (1)', { x: margin + 4, y: y - 10, size: 7, font: helveticaBold })
  page1.drawText('Nominal value / unit (2)', { x: margin + colW + 4, y: y - 10, size: 7, font: helveticaBold })
  page1.drawText('Called up per unit (3)', { x: margin + colW * 2 + 4, y: y - 10, size: 7, font: helveticaBold })
  page1.drawText('Paid up per unit (4)', { x: margin + colW * 3 + 4, y: y - 10, size: 7, font: helveticaBold })

  page1.drawText(d.securityClass, { x: margin + 4, y: y - row1H - 9, size: 7.5, font: helvetica })
  page1.drawText(`INR ${d.nominalValue}`, { x: margin + colW + 4, y: y - row1H - 9, size: 7.5, font: helvetica })
  page1.drawText(`INR ${d.calledUpValue}`, { x: margin + colW * 2 + 4, y: y - row1H - 9, size: 7.5, font: helvetica })
  page1.drawText(`INR ${d.paidUpValue}`, { x: margin + colW * 3 + 4, y: y - row1H - 9, size: 7.5, font: helvetica })
  y -= row1H + row2H + 6

  // Quantity and Consideration Box
  page1.drawRectangle({
    x: margin,
    y: y - 42,
    width: tableW,
    height: 42,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })
  page1.drawText(`No. of Securities: ${d.numberOfSecurities} (In Words: ${d.numberOfSecuritiesWords})`, {
    x: margin + 6,
    y: y - 12,
    size: 7.5,
    font: helvetica,
  })
  page1.drawText(`Consideration Received: INR ${d.consideration} (In Words: ${d.considerationWords})`, {
    x: margin + 6,
    y: y - 24,
    size: 7.5,
    font: helvetica,
  })
  page1.drawText(`Distinctive Numbers: From ${d.distinctiveFrom} To ${d.distinctiveTo}   |   Certificate No(s): ${d.certificateNumbers}`, {
    x: margin + 6,
    y: y - 36,
    size: 7.5,
    font: helvetica,
  })
  y -= 48

  // Transferor Particulars
  page1.drawText('TRANSFEROR’S PARTICULARS:', { x: margin, y, size: 8.5, font: helveticaBold })
  y -= 9
  page1.drawRectangle({
    x: margin,
    y: y - 30,
    width: tableW,
    height: 30,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })
  page1.drawText(`Registered Folio No.: ${d.transferorFolio}   |   Name in full: ${d.transferorName}`, {
    x: margin + 6,
    y: y - 11,
    size: 7.5,
    font: helvetica,
  })
  page1.drawText('Signature of Transferor: ____________________________________________________________________', {
    x: margin + 6,
    y: y - 23,
    size: 7.5,
    font: helveticaBold,
  })
  y -= 37

  // Attestation / Witness
  page1.drawText('ATTESTATION / WITNESS CONFIRMATION:', { x: margin, y, size: 8.5, font: helveticaBold })
  y -= 9
  page1.drawRectangle({
    x: margin,
    y: y - 30,
    width: tableW,
    height: 30,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })
  page1.drawText('I hereby confirm that the Transferor has signed before me.', {
    x: margin + 6,
    y: y - 10,
    size: 7,
    font: helveticaOblique,
  })
  page1.drawText(`Witness: ${d.witnessName}, ${d.witnessAddress} (${d.witnessPincode})`, {
    x: margin + 6,
    y: y - 21,
    size: 7,
    font: helvetica,
  })
  page1.drawText('Witness Signature: ____________________________', {
    x: margin + tableW - 190,
    y: y - 21,
    size: 7,
    font: helveticaBold,
  })
  y -= 37

  // Transferee Particulars (Statutory Multi-Column)
  page1.drawText('TRANSFEREE’S PARTICULARS:', { x: margin, y, size: 8.5, font: helveticaBold })
  y -= 9
  page1.drawRectangle({
    x: margin,
    y: y - 64,
    width: tableW,
    height: 64,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })
  page1.drawText(`1. Name in full: ${d.transfereeName}`, { x: margin + 6, y: y - 11, size: 7.5, font: helvetica })
  page1.drawText(`2. Father’s / Mother’s / Spouse’s Name: ${d.transfereeRelativeName}`, { x: margin + 6, y: y - 22, size: 7.5, font: helvetica })
  page1.drawText(`3. Address: ${d.transfereeAddress} (PIN: ${d.transfereePincode})`, { x: margin + 6, y: y - 33, size: 7.5, font: helvetica })
  page1.drawText(`4. E-mail: ${d.transfereeEmail}   |   5. Occupation: ${d.transfereeOccupation}`, { x: margin + 6, y: y - 44, size: 7.5, font: helvetica })
  page1.drawText(`6. Existing Folio No., if any: ${d.transfereeExistingFolio}`, { x: margin + 6, y: y - 55, size: 7.5, font: helvetica })
  y -= 70

  // Specimen Signature Box
  page1.drawRectangle({
    x: margin,
    y: y - 26,
    width: tableW,
    height: 26,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })
  page1.drawText(`Folio No. of Transferee: ${d.transfereeExistingFolio}`, { x: margin + 6, y: y - 11, size: 7.5, font: helveticaBold })
  page1.drawText('Specimen Signature of Transferee: (1) ___________________ (2) ___________________ (3) ___________________', {
    x: margin + 6,
    y: y - 21,
    size: 7.5,
    font: helveticaBold,
  })
  y -= 34

  page1.drawText('Page 1 of 2 — Turn over for Stamp Duty, 2022 FEMA Declaration & Office Endorsements', {
    x: margin,
    y: 18,
    size: 7,
    font: helveticaOblique,
    color: rgb(0.4, 0.4, 0.4),
  })

  // ==================== PAGE 2: STATUTORY BACK PAGE ====================
  const page2 = pdfDoc.addPage([595.28, 841.89])
  let y2 = height - 36

  const drawPage2Center = (text: string, font: any, size: number, color = rgb(0.1, 0.1, 0.1)) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page2.drawText(text, { x: (width - textWidth) / 2, y: y2, size, font, color })
    y2 -= size + 4
  }

  drawPage2Center('FORM NO. SH-4 — SECURITIES TRANSFER FORM', helveticaBold, 12)
  drawPage2Center('Statutory Stamp Duty, Mandatory 2022 Declaration & Official Endorsements', helvetica, 8, rgb(0.3, 0.3, 0.3))
  y2 -= 6

  // Value of Stamp Affixed Box
  page2.drawText(`Value of stamp affixed: INR ${d.stampDutyAmount} (Duty calculated @ 0.015% under Schedule I, Article 62 of Indian Stamp Act, 1899)`, {
    x: margin,
    y: y2,
    size: 8.5,
    font: helveticaBold,
  })
  y2 -= 12

  page2.drawRectangle({
    x: margin,
    y: y2 - 70,
    width: tableW,
    height: 70,
    borderColor: rgb(0.4, 0.4, 0.4),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  })
  page2.drawText('STAMPS', { x: margin + tableW / 2 - 20, y: y2 - 16, size: 9, font: helveticaBold })
  page2.drawText('[ SPACE FOR AFFIXING SHARE TRANSFER ADHESIVE STAMPS OR ATTACHING E-STAMP CERTIFICATE ]', {
    x: margin + 30,
    y: y2 - 34,
    size: 7.5,
    font: helveticaOblique,
    color: rgb(0.4, 0.4, 0.4),
  })
  page2.drawText('Note: Adhesive stamps must be cancelled by writing signature or drawing a cross across them as required under Section 12 of Indian Stamp Act, 1899.', {
    x: margin + 12,
    y: y2 - 52,
    size: 7,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  })
  y2 -= 82

  // Mandatory 2022 MCA Amendment Declaration (FEMA Non-debt Instruments Rules, 2019)
  page2.drawText('Declaration (Pursuant to Companies (Share Capital and Debentures) Amendment Rules, 2022):', {
    x: margin,
    y: y2,
    size: 8.5,
    font: helveticaBold,
  })
  y2 -= 12

  page2.drawRectangle({
    x: margin,
    y: y2 - 58,
    width: tableW,
    height: 58,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })

  const mark1 = d.femaApprovalRequired ? '(   )' : '( X )'
  const mark2 = d.femaApprovalRequired ? '( X )' : '(   )'

  page2.drawText(`${mark1} Transferee is not required to obtain the Government approval under the Foreign Exchange Management`, {
    x: margin + 8,
    y: y2 - 14,
    size: 7.5,
    font: !d.femaApprovalRequired ? helveticaBold : helvetica,
  })
  page2.drawText('   (Non-debt Instruments) Rules, 2019 prior to transfer of shares; or', {
    x: margin + 8,
    y: y2 - 24,
    size: 7.5,
    font: !d.femaApprovalRequired ? helveticaBold : helvetica,
  })

  page2.drawText(`${mark2} Transferee is required to obtain the Government approval under the Foreign Exchange Management`, {
    x: margin + 8,
    y: y2 - 38,
    size: 7.5,
    font: d.femaApprovalRequired ? helveticaBold : helvetica,
  })
  page2.drawText('   (Non-debt Instruments) Rules, 2019 prior to transfer of shares and the same has been obtained and is enclosed herewith.', {
    x: margin + 8,
    y: y2 - 48,
    size: 7.5,
    font: d.femaApprovalRequired ? helveticaBold : helvetica,
  })
  y2 -= 70

  // Enclosures
  page2.drawText('Enclosures:', { x: margin, y: y2, size: 8.5, font: helveticaBold })
  y2 -= 10
  page2.drawText('(1) Certificate of shares or debentures or other securities', { x: margin + 6, y: y2, size: 7.5, font: helvetica })
  y2 -= 10
  page2.drawText('(2) If no certificate is issued, letter of allotment', { x: margin + 6, y: y2, size: 7.5, font: helvetica })
  y2 -= 10
  page2.drawText('(3) Copy of PAN Card of Transferee (mandatory)', { x: margin + 6, y: y2, size: 7.5, font: helvetica })
  y2 -= 10
  page2.drawText('(4) Declaration / Approval under Foreign Exchange Management (Non-debt Instruments) Rules, 2019 (if applicable)', {
    x: margin + 6,
    y: y2,
    size: 7.5,
    font: helvetica,
  })
  y2 -= 10
  page2.drawText('(5) Others, specify: ____________________________________________________________________', {
    x: margin + 6,
    y: y2,
    size: 7.5,
    font: helvetica,
  })
  y2 -= 18

  // For office use only
  page2.drawText('For office use only:', { x: margin, y: y2, size: 8.5, font: helveticaBold })
  y2 -= 9
  page2.drawRectangle({
    x: margin,
    y: y2 - 50,
    width: tableW,
    height: 50,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })
  page2.drawText('Checked by: _________________________             Signature tallied by: _________________________', {
    x: margin + 8,
    y: y2 - 13,
    size: 7.5,
    font: helvetica,
  })
  page2.drawText('Entered in the Register of Transfer on: ___________________ vide Transfer No.: ___________________', {
    x: margin + 8,
    y: y2 - 25,
    size: 7.5,
    font: helvetica,
  })
  page2.drawText('Approval Date: ___________________    Power of attorney / Probate / Death Certificate / Administration registered at No.: ______', {
    x: margin + 8,
    y: y2 - 37,
    size: 7,
    font: helvetica,
  })
  y2 -= 62

  // On the reverse page of the certificate
  page2.drawText('On the reverse page of the certificate (Endorsement of Transfer):', { x: margin, y: y2, size: 8.5, font: helveticaBold })
  y2 -= 9

  const endColW = tableW / 5
  page2.drawRectangle({
    x: margin,
    y: y2 - 40,
    width: tableW,
    height: 40,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.8,
  })
  page2.drawText('Name of Transferor', { x: margin + 4, y: y2 - 10, size: 7, font: helveticaBold })
  page2.drawText('Name of Transferee', { x: margin + endColW + 4, y: y2 - 10, size: 7, font: helveticaBold })
  page2.drawText('No. of shares', { x: margin + endColW * 2 + 4, y: y2 - 10, size: 7, font: helveticaBold })
  page2.drawText('Date of Transfer', { x: margin + endColW * 3 + 4, y: y2 - 10, size: 7, font: helveticaBold })
  page2.drawText('Authorised Signatory', { x: margin + endColW * 4 + 4, y: y2 - 10, size: 7, font: helveticaBold })

  page2.drawText(d.transferorName.slice(0, 24), { x: margin + 4, y: y2 - 26, size: 7, font: helvetica })
  page2.drawText(d.transfereeName.slice(0, 24), { x: margin + endColW + 4, y: y2 - 26, size: 7, font: helvetica })
  page2.drawText(d.numberOfSecurities, { x: margin + endColW * 2 + 4, y: y2 - 26, size: 7, font: helvetica })
  page2.drawText('___/___/2026', { x: margin + endColW * 3 + 4, y: y2 - 26, size: 7, font: helvetica })
  page2.drawText('_________________', { x: margin + endColW * 4 + 4, y: y2 - 26, size: 7, font: helvetica })

  return await pdfDoc.save()
}
