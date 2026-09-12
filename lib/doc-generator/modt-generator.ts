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
} from 'docx'
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'

export type MortgagorType = 'individual' | 'joint' | 'corporate'

export type ModtDocumentType =
  | 'modt'
  | 'undertaking'
  | 'letter_of_deposit'
  | 'chg1_extract'

export interface TitleDeedItem {
  serialNo: number
  docType: string
  docNo: string
  date: string
  executants: string
}

export interface PropertyBoundaries {
  north: string
  south: string
  east: string
  west: string
}

export interface ModtFormData {
  mortgagorType: MortgagorType
  mortgagorName: string
  mortgagorFatherOrRep: string
  mortgagorAddress: string
  mortgagorPanOrCin: string
  isCoOwner: boolean
  coOwnerName: string
  coOwnerFather: string
  coOwnerAddress: string
  coOwnerPan: string

  // Corporate specific
  companyName: string
  cin: string
  registeredOffice: string
  director1Name: string
  director1Din: string
  director2Name: string
  director2Din: string
  meetingDate: string

  // Lender & Facility
  bankName: string
  bankBranch: string
  bankAddress: string
  sanctionLetterNo: string
  sanctionLetterDate: string
  loanFacilityName: string
  loanAmount: number
  loanAmountWords: string
  interestRate: string
  tenure: string

  // Territorial Jurisdiction (Sec 58(f) TPA)
  executionDate: string
  notifiedTown: string
  state: string

  // Property Details (Second Schedule)
  propertyDescription: string
  surveyOrPlotNo: string
  propertyArea: string
  boundaries: PropertyBoundaries

  // List of Deeds (First Schedule)
  titleDeeds: TitleDeedItem[]

  // Witnesses
  witness1Name: string
  witness1Address: string
  witness2Name: string
  witness2Address: string
}

export const DEFAULT_SAMPLE_MODT_DATA: ModtFormData = {
  mortgagorType: 'corporate',
  mortgagorName: 'ACME TECHNOLOGIES PRIVATE LIMITED',
  mortgagorFatherOrRep: 'acting through its Authorized Director, Mr. Rajesh Sharma (DIN: 01234567)',
  mortgagorAddress: 'Plot No. 42, Okhla Industrial Area, Phase-III, New Delhi - 110020',
  mortgagorPanOrCin: 'AAACA1234F',
  isCoOwner: false,
  coOwnerName: '',
  coOwnerFather: '',
  coOwnerAddress: '',
  coOwnerPan: '',

  companyName: 'ACME TECHNOLOGIES PRIVATE LIMITED',
  cin: 'U72900DL2022PTC123456',
  registeredOffice: 'Plot No. 42, Okhla Industrial Area, Phase-III, New Delhi - 110020',
  director1Name: 'Mr. Rajesh Sharma',
  director1Din: '01234567',
  director2Name: 'Ms. Sunita Sharma',
  director2Din: '02345678',
  meetingDate: '10/09/2026',

  bankName: 'State Bank of India',
  bankBranch: 'Commercial Branch, Barakhamba Road, Connaught Place',
  bankAddress: '11, Parliament Street, New Delhi - 110001',
  sanctionLetterNo: 'SBI/CB/ADV/2026-27/842',
  sanctionLetterDate: '02/09/2026',
  loanFacilityName: 'Term Loan / Working Capital Credit Facility',
  loanAmount: 15000000,
  loanAmountWords: 'Rupees One Crore Fifty Lakh Only',
  interestRate: '9.15% per annum floating linked to 1-Year MCLR / EBLR plus spread',
  tenure: '60 Months',

  executionDate: '15/09/2026',
  notifiedTown: 'New Delhi',
  state: 'Delhi',

  propertyDescription:
    'All that piece and parcel of commercial freehold industrial property bearing Municipal No. 42, with built-up RCC structure thereon, situated at Okhla Industrial Area, Phase-III, New Delhi - 110020',
  surveyOrPlotNo: 'Plot No. 42, Khasra No. 340/12',
  propertyArea: '5,400 Square Feet (Built-up Super Area 12,000 Sq. Ft.)',
  boundaries: {
    north: 'By 60 Feet Wide Main Industrial Sector Road',
    south: 'By Plot No. 43 (M/s Apex Precision Engineering)',
    east: 'By 40 Feet Service Lane',
    west: 'By Plot No. 41 (M/s Global Logistics Pvt Ltd)',
  },

  titleDeeds: [
    {
      serialNo: 1,
      docType: 'Original Registered Sale Deed',
      docNo: 'Registration No. 4521, Book No. 1, Vol. 842, Pages 110-128',
      date: '14/05/2018',
      executants: 'Executed by Delhi State Industrial Infrastructure Dev Corp (DSIIDC) in favour of Mortgagor',
    },
    {
      serialNo: 2,
      docType: 'Original Mutation Certificate & Property Tax Receipt',
      docNo: 'Mutation Sanction Order No. MCD/SZ/PROP/2018/992',
      date: '28/06/2018',
      executants: 'Issued by Municipal Corporation of Delhi (South Zone)',
    },
    {
      serialNo: 3,
      docType: 'Nil Encumbrance Certificate (Search for 30 Years)',
      docNo: 'Form No. 15, Certificate No. EC/DL/2026/04912',
      date: '25/08/2026',
      executants: 'Issued by Office of the Sub-Registrar-V, New Delhi',
    },
    {
      serialNo: 4,
      docType: 'Sanctioned Building & Structural Plan',
      docNo: 'Plan Sanction File No. 12/B/DSIIDC/2019/BP-42',
      date: '10/01/2019',
      executants: 'Duly approved and signed by Chief Architect, DSIIDC, New Delhi',
    },
  ],

  witness1Name: 'Mr. Vikram Malhotra',
  witness1Address: 'B-4/122, Safdarjung Enclave, New Delhi - 110029',
  witness2Name: 'Ms. Pooja Singhania',
  witness2Address: 'Flat No. 302, Palm Court, Sector 14, Gurugram, Haryana - 122001',
}

export function formatInrCurrency(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

export function convertNumberToIndianWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero'
  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n: number): string => {
    let str = ''
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10]
    } else {
      str += a[n]
    }
    return str
  }

  let amount = Math.floor(num)
  let words = ''

  const crore = Math.floor(amount / 10000000)
  amount %= 10000000
  const lakh = Math.floor(amount / 100000)
  amount %= 100000
  const thousand = Math.floor(amount / 1000)
  amount %= 1000
  const hundred = Math.floor(amount / 100)
  amount %= 100

  if (crore > 0) words += inWords(crore) + 'Crore '
  if (lakh > 0) words += inWords(lakh) + 'Lakh '
  if (thousand > 0) words += inWords(thousand) + 'Thousand '
  if (hundred > 0) words += inWords(hundred) + 'Hundred '
  if (amount > 0) {
    if (words !== '') words += 'and '
    words += inWords(amount)
  }

  return `Rupees ${words.trim()} Only`
}

const FONT = 'Bookman Old Style'

// ==========================================
// DOCX GENERATORS
// ==========================================

export async function buildModtDocx(inputData: Partial<ModtFormData> = {}): Promise<Buffer> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }
  const isCorp = data.mortgagorType === 'corporate'
  const isJoint = data.mortgagorType === 'joint' || data.isCoOwner
  const amtFormatted = formatInrCurrency(data.loanAmount)

  const mortgagorDesc = isCorp
    ? `${data.companyName}, a company incorporated under the Companies Act with CIN ${data.cin}, having its Registered Office at ${data.registeredOffice}, ${data.mortgagorFatherOrRep} (hereinafter referred to as the "MORTGAGOR", which expression shall unless repugnant to the context include its successors and permitted assigns)`
    : `${data.mortgagorName}, ${data.mortgagorFatherOrRep}, resident of ${data.mortgagorAddress} (PAN: ${data.mortgagorPanOrCin}) (hereinafter referred to as the "MORTGAGOR")`

  const coOwnerClause =
    isJoint && data.coOwnerName
      ? ` AND ${data.coOwnerName}, ${data.coOwnerFather}, resident of ${data.coOwnerAddress} (PAN: ${data.coOwnerPan}) (hereinafter referred to as the "CO-MORTGAGOR")`
      : ''

  const deedRows = data.titleDeeds.map(
    (deed, idx) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: `${idx + 1}.`, font: FONT, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: deed.docType, font: FONT, size: 20, bold: true })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: deed.docNo, font: FONT, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: deed.date, font: FONT, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: deed.executants, font: FONT, size: 18 })],
              }),
            ],
          }),
        ],
      })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'MEMORANDUM OF DEPOSIT OF TITLE DEEDS (MODT)',
                bold: true,
                size: 26,
                font: FONT,
                underline: {},
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(EVIDENCING CREATION OF EQUITABLE MORTGAGE UNDER SECTION 58(f) OF TRANSFER OF PROPERTY ACT, 1882)',
                bold: true,
                size: 18,
                font: FONT,
                color: '333333',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Preamble
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `THIS MEMORANDUM OF DEPOSIT OF TITLE DEEDS is executed on this `,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `${data.executionDate} `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `at the Notified Town/City of `,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `${data.notifiedTown}, State of ${data.state};`,
                bold: true,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // BY
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'BY', bold: true, size: 22, font: FONT })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: mortgagorDesc + coOwnerClause,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // IN FAVOUR OF
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'IN FAVOUR OF', bold: true, size: 22, font: FONT })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `${data.bankName.toUpperCase()}, `,
                bold: true,
                font: FONT,
                size: 21,
              }),
              new TextRun({
                text: `a banking corporation constituted under the laws of India and having its branch office at ${data.bankBranch}, ${data.bankAddress} (hereinafter referred to as the "LENDER" / "MORTGAGEE", which expression shall unless repugnant to the context include its successors, transferees and assigns).`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // RECITALS
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'WHEREAS:', bold: true, size: 22, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '1. Sanction of Credit Facilities: ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `At the request of the Mortgagor, the Lender has sanctioned credit facility/facilities comprising ${data.loanFacilityName} up to an aggregate limit of ${amtFormatted} (${data.loanAmountWords}) vide its Sanction Letter bearing Ref. No. ${data.sanctionLetterNo} dated ${data.sanctionLetterDate}, on the terms and conditions stipulated therein and in the loan/security agreements executed between the parties.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '2. Stipulation for Security by Equitable Mortgage: ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `One of the primary stipulations of the said sanction is that the due repayment of the said loan facility along with interest, compound interest, penal interest, banking charges, costs, and expenses shall be secured by creating an Equitable Mortgage by Deposit of Title Deeds under Section 58(f) of the Transfer of Property Act, 1882 over the immovable property more particularly described in the Second Schedule hereunder written.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '3. Ownership & Absolute Title: ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `The Mortgagor is the sole and absolute legal owner and seized and possessed of the said immovable property with clear, marketable, and unencumbered title, free from all claims, liens, lis pendens, statutory attachments, or disputes of any nature whatsoever.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // OPERATIVE COVENANTS
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'NOW THIS MEMORANDUM WITNESSETH AND IT IS HEREBY RECORDED AND CONFIRMED AS FOLLOWS:',
                bold: true,
                size: 22,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Clause 1 (Deposit of Documents in Notified Town): ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `The Mortgagor hereby confirms that on ${data.executionDate} at the branch office of the Lender situated at ${data.notifiedTown}, being a town specifically notified by the State Government under Section 58(f) of the Transfer of Property Act, 1882, the Mortgagor has physically and voluntarily handed over and deposited with the authorized officer of the Lender all original documents of title, deeds, writings, revenue records, and plan sanctions as detailed in the FIRST SCHEDULE hereunder written.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Clause 2 (Intent to Create Equitable Mortgage): ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `The Mortgagor expressly declares and records that the deposit of the said title deeds was made with the clear, unequivocal, and deliberate intention to create a security by way of Equitable Mortgage (Mortgage by Deposit of Title Deeds) over the immovable property detailed in the SECOND SCHEDULE hereunder written, together with all present and future buildings, fixtures, erections, easements, and appurtenances, in favour of the Lender to secure repayment of ${amtFormatted} (${data.loanAmountWords}) together with interest at ${data.interestRate} and all costs.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Clause 3 (Continuing Security): ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `The equitable mortgage hereby created shall operate as a continuing security for the ultimate balance due from time to time in respect of the credit facilities, interest, costs, charges, and expenses, and shall not be determined or affected by any partial repayment, fluctuation, renewal, or extension of credit.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Clause 4 (Covenants of Title & Non-Encumbrance): ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `The Mortgagor covenants that the deposited deeds constitute the complete and only original chain of title to the property; that the Mortgagor has not created any prior charge, mortgage, lease, or encumbrance; and that during the subsistence of this mortgage, the Mortgagor shall not sell, transfer, lease, encumber, or alter the character of the mortgaged property without the prior written consent of the Lender.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Clause 5 (Enforcement under SARFAESI & Recovery Laws): ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `In the event of default in payment of the secured debt or breach of any covenant, the Lender shall be entitled to invoke all rights and remedies available to a secured creditor under the Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act, 2002 (SARFAESI Act), the Recovery of Debts and Bankruptcy Act, 1993, and the Transfer of Property Act, 1882, including taking possession, appointing a receiver, or selling the mortgaged property.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          ...(isCorp
            ? [
                new Paragraph({
                  alignment: AlignmentType.JUSTIFIED,
                  children: [
                    new TextRun({
                      text: 'Clause 6 (Statutory ROC Charge Filing under Section 77): ',
                      bold: true,
                      size: 21,
                      font: FONT,
                    }),
                    new TextRun({
                      text: `The Mortgagor Company undertakes to file the statutory particulars of the charge created herein with the Registrar of Companies in e-Form CHG-1 under Section 77 of the Companies Act, 2013 within thirty (30) days of execution, and furnish the Certificate of Registration of Charge (Form CHG-2) issued by the ROC to the Lender immediately upon receipt.`,
                      font: FONT,
                      size: 21,
                    }),
                  ],
                }),
                new Paragraph({ text: '' }),
              ]
            : []),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'Clause 7 (Notice of Intimation & Registration Compliance): ',
                bold: true,
                size: 21,
                font: FONT,
              }),
              new TextRun({
                text: `The Mortgagor undertakes to pay all applicable stamp duty under the relevant State Stamp Act and to comply with statutory filing requirements, including filing Notice of Intimation under Section 89B of the Registration Act, 1908 (where applicable) and registration with the Central Electronic Registry (CERSAI) under Chapter IV-A of the SARFAESI Act, 2002.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // SCHEDULES
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'THE FIRST SCHEDULE ABOVE REFERRED TO',
                bold: true,
                size: 22,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(List of Original Title Deeds and Documents Deposited with the Lender)',
                italics: true,
                size: 19,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // First Schedule Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    width: { size: 8, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'S.No.', bold: true, font: FONT, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 32, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Nature of Document', bold: true, font: FONT, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Document / Regn. No.', bold: true, font: FONT, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Date', bold: true, font: FONT, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Executant / Parties', bold: true, font: FONT, size: 20 })],
                      }),
                    ],
                  }),
                ],
              }),
              ...deedRows,
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // Second Schedule
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'THE SECOND SCHEDULE ABOVE REFERRED TO',
                bold: true,
                size: 22,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(Description of the Immovable Mortgaged Property)',
                italics: true,
                size: 19,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Property Description: ', bold: true, size: 21, font: FONT }),
              new TextRun({ text: data.propertyDescription, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Survey / Plot / Khasra No.: ', bold: true, size: 21, font: FONT }),
              new TextRun({ text: data.surveyOrPlotNo, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Total Extent / Area: ', bold: true, size: 21, font: FONT }),
              new TextRun({ text: data.propertyArea, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Four Boundaries of the Scheduled Property:', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: '• North: ', bold: true, size: 20, font: FONT }),
              new TextRun({ text: data.boundaries.north, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: '• South: ', bold: true, size: 20, font: FONT }),
              new TextRun({ text: data.boundaries.south, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: '• East: ', bold: true, size: 20, font: FONT }),
              new TextRun({ text: data.boundaries.east, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: '• West: ', bold: true, size: 20, font: FONT }),
              new TextRun({ text: data.boundaries.west, size: 20, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // Execution & Signatures
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'IN WITNESS WHEREOF the Mortgagor has executed and delivered this Memorandum of Deposit of Title Deeds on the day, month, and year first above written.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: isCorp ? `For ${data.companyName.toUpperCase()}` : `SIGNED & DELIVERED BY THE MORTGAGOR`,
                bold: true,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: isCorp ? `(${data.director1Name})\nDirector (DIN: ${data.director1Din})` : `(${data.mortgagorName})\nMortgagor`,
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [new TextRun({ text: 'WITNESSES IN WHOSE PRESENCE EXECUTED:', bold: true, size: 21, font: FONT })],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Signature: _______________________\n', bold: true, size: 20, font: FONT }),
              new TextRun({ text: `   Name: ${data.witness1Name}\n   Address: ${data.witness1Address}`, size: 19, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Signature: _______________________\n', bold: true, size: 20, font: FONT }),
              new TextRun({ text: `   Name: ${data.witness2Name}\n   Address: ${data.witness2Address}`, size: 19, font: FONT }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Mortgagor Declaration & Undertaking (.docx)
 */
export async function buildUndertakingDocx(inputData: Partial<ModtFormData> = {}): Promise<Buffer> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }
  const isCorp = data.mortgagorType === 'corporate'

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'AFFIDAVIT-CUM-DECLARATION & INDEMNITY UNDERTAKING',
                bold: true,
                size: 26,
                font: FONT,
                underline: {},
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(IN RESPECT OF EQUITABLE MORTGAGE CREATED UNDER SECTION 58(f) OF TRANSFER OF PROPERTY ACT, 1882)',
                bold: true,
                size: 18,
                font: FONT,
                color: '333333',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: isCorp
                  ? `I, ${data.director1Name}, Director of ${data.companyName} (CIN: ${data.cin}), having its registered office at ${data.registeredOffice}, do hereby solemnly declare, affirm, and undertake as under:`
                  : `I, ${data.mortgagorName}, ${data.mortgagorFatherOrRep}, resident of ${data.mortgagorAddress} (PAN: ${data.mortgagorPanOrCin}), do hereby solemnly affirm, declare, and state as under:`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '1. Absolute Marketable Title: ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `I / the Mortgagor Company am/is the sole, absolute, and exclusive owner of the immovable property bearing ${data.propertyDescription} (Plot/Khasra: ${data.surveyOrPlotNo}, Area: ${data.propertyArea}). The title is clear, marketable, freely transferable, and unencumbered.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '2. Authenticity of Title Deeds: ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `The title deeds, parent deeds, mutation certificates, and tax receipts deposited with ${data.bankName}, ${data.bankBranch} are original, authentic, genuine, and valid instruments. No duplicate, fake, or fabricated documents have been deposited, and no prior equitable or registered mortgage has been created with any other lender or cooperative credit society.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '3. No Litigation or Statutory Restraint: ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `There are no pending litigations, civil suits, insolvency/bankruptcy proceedings under IBC 2016, DRT/NCLT proceedings, tax attachment notices, acquisition notices from land development authorities, or lis pendens affecting the scheduled property.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: '4. Indemnity Covenant: ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `I / the Mortgagor Company hereby agree to indemnify and keep indemnified ${data.bankName} and its successors against all losses, damages, legal costs, expenses, and claims that the Bank may incur or suffer on account of any defect or flaw in title or any breach of representations made herein.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: isCorp ? `For ${data.companyName.toUpperCase()}\n\n\n(${data.director1Name})\nDeponent / Authorized Signatory` : `(${data.mortgagorName})\nDeponent / Mortgagor`,
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [new TextRun({ text: 'VERIFICATION', bold: true, size: 22, font: FONT, underline: {} })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `Verified at ${data.notifiedTown} on this ${data.executionDate} that the contents of the above affidavit are true and correct to the best of my knowledge, belief, and records, and nothing material has been concealed therefrom.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'DEPONENT', bold: true, size: 21, font: FONT })],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Covering Letter to Bank Manager (.docx)
 */
export async function buildLetterOfDepositDocx(inputData: Partial<ModtFormData> = {}): Promise<Buffer> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }
  const isCorp = data.mortgagorType === 'corporate'

  const deedListItems = data.titleDeeds.map(
    (d, i) =>
      new Paragraph({
        indent: { left: 720 },
        children: [
          new TextRun({ text: `${i + 1}. ${d.docType}`, bold: true, size: 20, font: FONT }),
          new TextRun({ text: ` (Doc No: ${d.docNo}, Dated: ${d.date})`, size: 20, font: FONT }),
        ],
      })
  )

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `Date: ${data.executionDate}\n\n`, size: 20, font: FONT }),
              new TextRun({ text: 'To,\nThe Branch Manager,\n', font: FONT, size: 21 }),
              new TextRun({ text: `${data.bankName}\n`, bold: true, font: FONT, size: 21 }),
              new TextRun({ text: `${data.bankBranch}\n${data.bankAddress}\n\n`, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Subject: Deposit of Original Title Deeds with intent to create Equitable Mortgage for securing ${data.loanFacilityName} of ${formatInrCurrency(data.loanAmount)} (Sanction Letter Ref: ${data.sanctionLetterNo})`,
                bold: true,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [new TextRun({ text: 'Dear Sir / Madam,', font: FONT, size: 21 })],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `In connection with the credit facilities sanctioned by you vide Sanction Letter No. ${data.sanctionLetterNo} dated ${data.sanctionLetterDate}, I / we confirm that on this day, ${data.executionDate}, at your office in the notified town of ${data.notifiedTown}, I / we have voluntarily deposited with you the original documents of title detailed below relating to the scheduled property bearing ${data.propertyDescription}:`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          ...deedListItems,
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `The deposit of the aforesaid original title deeds has been made with the express intent to create an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882 in favour of ${data.bankName} to secure the due repayment of the sanctioned limit of ${formatInrCurrency(data.loanAmount)} (${data.loanAmountWords}) together with interest, costs, charges, and expenses.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'Kindly acknowledge receipt of the original documents and furnish us with a certified duplicate of the safe custody acknowledgment.',
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [new TextRun({ text: 'Yours faithfully,\n\n', font: FONT, size: 21 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: isCorp ? `For ${data.companyName.toUpperCase()}\n\n(${data.director1Name})\nDirector (DIN: ${data.director1Din})` : `(${data.mortgagorName})\nMortgagor / Borrower`,
                bold: true,
                font: FONT,
                size: 20,
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
 * Builds Corporate Resolution Extract for Form CHG-1 (.docx)
 */
export async function buildChg1ExtractDocx(inputData: Partial<ModtFormData> = {}): Promise<Buffer> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: data.companyName.toUpperCase(), bold: true, size: 28, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `CIN: ${data.cin}`, bold: true, size: 20, font: FONT })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Regd. Office: ${data.registeredOffice}`,
                size: 18,
                italics: true,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF THE COMPANY',
                bold: true,
                size: 21,
                font: FONT,
                underline: {},
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `HELD ON ${data.meetingDate} AT THE REGISTERED OFFICE OF THE COMPANY`,
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'CREATION OF SECURITY BY EQUITABLE MORTGAGE & ROC CHARGE FILING:', bold: true, size: 21, font: FONT }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'RESOLVED THAT ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `pursuant to the provisions of Section 179(3)(d), Section 179(3)(e), Section 77 of the Companies Act, 2013 and other applicable rules, the consent of the Board of Directors be and is hereby accorded to create an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882 by depositing original title deeds in respect of the Company\'s immovable property situated at ${data.propertyDescription} in favour of ${data.bankName}, ${data.bankBranch} to secure the ${data.loanFacilityName} of ${formatInrCurrency(data.loanAmount)} (${data.loanAmountWords}).`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `${data.director1Name}, Director (DIN: ${data.director1Din}) and ${data.director2Name}, Director (DIN: ${data.director2Din}) be and are hereby severally authorized to deposit the original title deeds, execute the Memorandum of Deposit of Title Deeds, Declarations, Undertakings, and sign and submit statutory e-Form CHG-1 on the MCA portal within 30 days of creation of charge."`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `For ${data.companyName.toUpperCase()}\n\n\n(${data.director1Name})\nDirector (DIN: ${data.director1Din})`, bold: true, size: 20, font: FONT }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

// ==========================================
// PDF GENERATORS (pdf-lib)
// ==========================================

function sanitizePdfText(str: string): string {
  if (!str) return ''
  return str
    .replace(/₹/g, 'Rs. ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/•/g, '-')
    .replace(/[^\x00-\x7F\xA0-\xFF]/g, '')
}

class LegalDocBuilder {
  doc: PDFDocument
  fontBold: PDFFont
  fontRegular: PDFFont
  fontItalic: PDFFont
  fontBoldItalic: PDFFont
  pages: PDFPage[] = []
  currentPage!: PDFPage
  y: number = 0
  margin = 45
  pageWidth = 595.28
  pageHeight = 841.89
  contentWidth = 505.28
  bottomMargin = 45

  static async create(): Promise<LegalDocBuilder> {
    const doc = await PDFDocument.create()
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold)
    const fontRegular = await doc.embedFont(StandardFonts.TimesRoman)
    const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)
    const fontBoldItalic = await doc.embedFont(StandardFonts.TimesRomanBoldItalic)
    const builder = new LegalDocBuilder(doc, fontBold, fontRegular, fontItalic, fontBoldItalic)
    builder.newPage()
    return builder
  }

  constructor(
    doc: PDFDocument,
    fontBold: PDFFont,
    fontRegular: PDFFont,
    fontItalic: PDFFont,
    fontBoldItalic: PDFFont
  ) {
    this.doc = doc
    this.fontBold = fontBold
    this.fontRegular = fontRegular
    this.fontItalic = fontItalic
    this.fontBoldItalic = fontBoldItalic
  }

  newPage(): PDFPage {
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight])
    this.pages.push(this.currentPage)
    this.y = this.pageHeight - this.margin
    return this.currentPage
  }

  ensureSpace(neededHeight: number) {
    if (this.y - neededHeight < this.bottomMargin) {
      this.newPage()
    }
  }

  drawCentered(
    text: string,
    font: PDFFont,
    size: number,
    color = rgb(0.1, 0.1, 0.1),
    extraSpacing = 4
  ) {
    const cleanText = sanitizePdfText(text)
    const words = cleanText.split(/\s+/).filter(Boolean)
    let currentLine = ''
    const lines: string[] = []

    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word
      if (font.widthOfTextAtSize(test, size) > this.contentWidth) {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = test
      }
    }
    if (currentLine) lines.push(currentLine)

    for (const line of lines) {
      this.ensureSpace(size + 3)
      const textWidth = font.widthOfTextAtSize(line, size)
      const x = (this.pageWidth - textWidth) / 2
      this.currentPage.drawText(line, { x, y: this.y, size, font, color })
      this.y -= size + 3
    }
    this.y -= extraSpacing
  }

  drawDivider(spacing = 6) {
    this.ensureSpace(spacing * 2 + 1)
    this.y -= spacing
    this.currentPage.drawLine({
      start: { x: this.margin, y: this.y },
      end: { x: this.pageWidth - this.margin, y: this.y },
      thickness: 0.5,
      color: rgb(0.75, 0.75, 0.75),
    })
    this.y -= spacing
  }

  drawParagraph(
    text: string,
    options: {
      boldPrefix?: string
      size?: number
      lineHeight?: number
      color?: any
      extraSpacing?: number
      indent?: number
    } = {}
  ) {
    const cleanText = sanitizePdfText(text)
    const cleanPrefix = options.boldPrefix ? sanitizePdfText(options.boldPrefix) : undefined
    const size = options.size || 9.5
    const lineHeight = options.lineHeight || 13.5
    const color = options.color || rgb(0.12, 0.12, 0.12)
    const extraSpacing = options.extraSpacing ?? 6
    const indent = options.indent || 0

    const effectiveWidth = this.contentWidth - indent
    const startX = this.margin + indent

    let prefixWidth = 0
    let prefixDrawn = false

    if (cleanPrefix) {
      prefixWidth = this.fontBold.widthOfTextAtSize(cleanPrefix, size)
    }

    const words = cleanText.split(/\s+/).filter(Boolean)
    let currentLine = ''

    const flushLine = (lineText: string, isFirstLine: boolean) => {
      this.ensureSpace(lineHeight)
      if (isFirstLine && cleanPrefix && !prefixDrawn) {
        this.currentPage.drawText(cleanPrefix, {
          x: startX,
          y: this.y,
          size,
          font: this.fontBold,
          color,
        })
        prefixDrawn = true
        if (lineText) {
          this.currentPage.drawText(lineText, {
            x: startX + prefixWidth,
            y: this.y,
            size,
            font: this.fontRegular,
            color,
          })
        }
      } else {
        if (lineText) {
          this.currentPage.drawText(lineText, {
            x: startX,
            y: this.y,
            size,
            font: this.fontRegular,
            color,
          })
        }
      }
      this.y -= lineHeight
    }

    let isFirst = true
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const maxWidth = isFirst && cleanPrefix ? effectiveWidth - prefixWidth : effectiveWidth
      const measured = this.fontRegular.widthOfTextAtSize(testLine, size)

      if (measured > maxWidth) {
        flushLine(currentLine, isFirst)
        isFirst = false
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine || (isFirst && cleanPrefix && !prefixDrawn)) {
      flushLine(currentLine, isFirst)
    }

    this.y -= extraSpacing
  }

  drawTable(
    headers: string[],
    widths: number[],
    rows: string[][],
    options: { fontSize?: number; headerBg?: boolean } = {}
  ) {
    const fontSize = options.fontSize || 8.5
    const rowHeight = 16
    const totalTableWidth = widths.reduce((a, b) => a + b, 0)
    const scaleFactor = this.contentWidth / totalTableWidth
    const scaledWidths = widths.map(w => w * scaleFactor)

    this.ensureSpace(rowHeight * 2)

    // Draw header background
    this.currentPage.drawRectangle({
      x: this.margin,
      y: this.y - rowHeight,
      width: this.contentWidth,
      height: rowHeight,
      color: rgb(0.95, 0.96, 0.98),
    })

    let curX = this.margin
    for (let i = 0; i < headers.length; i++) {
      this.currentPage.drawText(sanitizePdfText(headers[i]), {
        x: curX + 4,
        y: this.y - rowHeight + 4,
        size: fontSize,
        font: this.fontBold,
        color: rgb(0.1, 0.1, 0.1),
      })
      curX += scaledWidths[i]
    }
    this.y -= rowHeight

    for (const row of rows) {
      let maxLines = 1
      for (let i = 0; i < row.length; i++) {
        const text = sanitizePdfText(row[i] || '')
        const colW = scaledWidths[i] - 8
        const words = text.split(/\s+/).filter(Boolean)
        let cur = ''
        let lCount = 1
        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w
          if (this.fontRegular.widthOfTextAtSize(test, fontSize) > colW) {
            lCount++
            cur = w
          } else {
            cur = test
          }
        }
        if (lCount > maxLines) maxLines = lCount
      }

      const calculatedRowH = Math.max(rowHeight, maxLines * 11 + 6)
      this.ensureSpace(calculatedRowH)

      this.currentPage.drawRectangle({
        x: this.margin,
        y: this.y - calculatedRowH,
        width: this.contentWidth,
        height: calculatedRowH,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.5,
      })

      let cellX = this.margin
      for (let i = 0; i < row.length; i++) {
        const text = sanitizePdfText(row[i] || '')
        const colW = scaledWidths[i] - 8
        const words = text.split(/\s+/).filter(Boolean)
        let cur = ''
        const lines: string[] = []
        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w
          if (this.fontRegular.widthOfTextAtSize(test, fontSize) > colW) {
            if (cur) lines.push(cur)
            cur = w
          } else {
            cur = test
          }
        }
        if (cur) lines.push(cur)

        let textY = this.y - 11
        for (const line of lines) {
          this.currentPage.drawText(line, {
            x: cellX + 4,
            y: textY,
            size: fontSize,
            font: i === 0 ? this.fontBold : this.fontRegular,
            color: rgb(0.15, 0.15, 0.15),
          })
          textY -= 11
        }

        cellX += scaledWidths[i]
      }

      this.y -= calculatedRowH
    }
    this.y -= 8
  }

  applyFooter() {
    const totalPages = this.pages.length
    for (let i = 0; i < totalPages; i++) {
      const page = this.pages[i]
      const footerText = sanitizePdfText(`Page ${i + 1} of ${totalPages}`)
      const textWidth = this.fontRegular.widthOfTextAtSize(footerText, 8.5)

      page.drawLine({
        start: { x: this.margin, y: 35 },
        end: { x: this.pageWidth - this.margin, y: 35 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })

      page.drawText(footerText, {
        x: (this.pageWidth - textWidth) / 2,
        y: 22,
        size: 8.5,
        font: this.fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      })
    }
  }

  async finish(): Promise<Uint8Array> {
    this.applyFooter()
    return await this.doc.save()
  }
}

/**
 * Builds Certified MODT PDF
 */
export async function buildModtPdf(inputData: Partial<ModtFormData> = {}): Promise<Uint8Array> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }
  const isCorp = data.mortgagorType === 'corporate'
  const amtFormatted = formatInrCurrency(data.loanAmount)
  const b = await LegalDocBuilder.create()

  // Title
  b.drawCentered('MEMORANDUM OF DEPOSIT OF TITLE DEEDS (MODT)', b.fontBold, 14, rgb(0.08, 0.18, 0.36))
  b.drawCentered(
    '(Evidencing Creation of Equitable Mortgage under Section 58(f) of Transfer of Property Act, 1882)',
    b.fontItalic,
    9.5,
    rgb(0.3, 0.3, 0.3)
  )
  b.drawDivider(6)

  // Execution particulars
  b.drawParagraph(
    `THIS MEMORANDUM OF DEPOSIT OF TITLE DEEDS is made and executed on this ${data.executionDate} at the Notified Town/City of ${data.notifiedTown}, State of ${data.state};`,
    { size: 9.5 }
  )

  b.drawParagraph('BY', { boldPrefix: 'BY: ', size: 9.5, extraSpacing: 3 })
  b.drawParagraph(
    isCorp
      ? `${data.companyName}, a company registered under the Companies Act with CIN ${data.cin}, having its Registered Office at ${data.registeredOffice}, ${data.mortgagorFatherOrRep} (hereinafter referred to as the "MORTGAGOR").`
      : `${data.mortgagorName}, ${data.mortgagorFatherOrRep}, resident of ${data.mortgagorAddress} (PAN: ${data.mortgagorPanOrCin}) (hereinafter referred to as the "MORTGAGOR").`,
    { size: 9.5, indent: 12 }
  )

  b.drawParagraph('IN FAVOUR OF', { boldPrefix: 'IN FAVOUR OF: ', size: 9.5, extraSpacing: 3 })
  b.drawParagraph(
    `${data.bankName.toUpperCase()}, a banking corporation having its branch office at ${data.bankBranch}, ${data.bankAddress} (hereinafter referred to as the "LENDER" / "MORTGAGEE").`,
    { size: 9.5, indent: 12 }
  )

  b.drawDivider(6)

  // Recitals
  b.drawParagraph('WHEREAS:', { boldPrefix: 'WHEREAS: ', size: 10, extraSpacing: 4 })
  b.drawParagraph(
    `1. The Lender has sanctioned ${data.loanFacilityName} up to an aggregate principal limit of ${amtFormatted} (${data.loanAmountWords}) vide Sanction Letter Ref. ${data.sanctionLetterNo} dated ${data.sanctionLetterDate}.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `2. One of the conditions precedent to disbursement is the creation of an Equitable Mortgage by Deposit of Title Deeds under Section 58(f) of the Transfer of Property Act, 1882 over the property described in the Second Schedule.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `3. The Mortgagor declares absolute ownership, clear marketable title, and unencumbered possession over the scheduled property.`,
    { size: 9.5, indent: 10 }
  )

  b.drawParagraph('NOW THIS MEMORANDUM WITNESSETH AND RECORDS AS FOLLOWS:', {
    boldPrefix: 'OPERATIVE COVENANTS: ',
    size: 10,
    extraSpacing: 6,
  })

  b.drawParagraph(
    `1. Deposit in Notified Town: The Mortgagor confirms that on ${data.executionDate} at ${data.bankBranch} in the Notified Town of ${data.notifiedTown}, the Mortgagor physically and voluntarily deposited with the Lender all original title deeds detailed in the First Schedule.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `2. Intent to Secure: The deposit was made with the unequivocal intent to create security by Equitable Mortgage over the property described in the Second Schedule to secure repayment of ${amtFormatted} with interest at ${data.interestRate}.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `3. Continuing Security: The mortgage shall operate as a continuing security for all outstanding balances and liabilities.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `4. Enforcement: The Lender shall have all statutory powers of enforcement under the SARFAESI Act, 2002 and Transfer of Property Act, 1882 in case of default.`,
    { size: 9.5, indent: 10 }
  )

  if (isCorp) {
    b.drawParagraph(
      `5. ROC Charge Filing: The Mortgagor Company undertakes to file e-Form CHG-1 with the ROC under Section 77 of the Companies Act, 2013 within 30 days of creation.`,
      { size: 9.5, indent: 10 }
    )
  }

  b.drawDivider(6)

  // First Schedule Table
  b.drawCentered('FIRST SCHEDULE: LIST OF ORIGINAL TITLE DEEDS DEPOSITED', b.fontBold, 10)
  const headers = ['S.No', 'Nature of Title Deed', 'Document / Regn No.', 'Date', 'Parties']
  const widths = [35, 150, 130, 70, 120]
  const tableRows = data.titleDeeds.map(d => [
    `${d.serialNo}`,
    d.docType,
    d.docNo,
    d.date,
    d.executants,
  ])
  b.drawTable(headers, widths, tableRows, { fontSize: 8 })

  // Second Schedule
  b.drawCentered('SECOND SCHEDULE: DESCRIPTION OF MORTGAGED IMMOVABLE PROPERTY', b.fontBold, 10)
  b.drawParagraph(data.propertyDescription, { boldPrefix: 'Description: ', size: 9, indent: 8 })
  b.drawParagraph(data.surveyOrPlotNo, { boldPrefix: 'Survey/Plot No: ', size: 9, indent: 8 })
  b.drawParagraph(data.propertyArea, { boldPrefix: 'Total Area: ', size: 9, indent: 8 })
  b.drawParagraph(
    `North: ${data.boundaries.north} | South: ${data.boundaries.south} | East: ${data.boundaries.east} | West: ${data.boundaries.west}`,
    { boldPrefix: 'Boundaries: ', size: 8.5, indent: 8 }
  )

  b.drawDivider(6)

  // Signatures
  b.drawParagraph(
    `IN WITNESS WHEREOF the Mortgagor has executed and delivered this Memorandum on the day, month, and year first above written.`,
    { size: 9.5 }
  )

  b.ensureSpace(60)
  if (isCorp) {
    b.drawParagraph(`For ${data.companyName.toUpperCase()}`, { size: 10, extraSpacing: 18 })
    b.drawParagraph(`(${data.director1Name})`, { size: 9.5 })
    b.drawParagraph(`Director (DIN: ${data.director1Din})`, { size: 9, extraSpacing: 10 })
  } else {
    b.drawParagraph('SIGNED & DELIVERED BY THE MORTGAGOR:', { size: 10, extraSpacing: 18 })
    b.drawParagraph(`(${data.mortgagorName})`, { size: 9.5 })
    b.drawParagraph('Mortgagor', { size: 9, extraSpacing: 10 })
  }

  b.drawParagraph('WITNESSES:', { boldPrefix: 'WITNESSES: ', size: 9.5, extraSpacing: 4 })
  b.drawParagraph(`1. ${data.witness1Name} - ${data.witness1Address}`, { size: 8.5, indent: 10 })
  b.drawParagraph(`2. ${data.witness2Name} - ${data.witness2Address}`, { size: 8.5, indent: 10 })

  return await b.finish()
}

/**
 * Builds Undertaking PDF
 */
export async function buildUndertakingPdf(inputData: Partial<ModtFormData> = {}): Promise<Uint8Array> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }
  const isCorp = data.mortgagorType === 'corporate'
  const b = await LegalDocBuilder.create()

  b.drawCentered('AFFIDAVIT-CUM-DECLARATION & INDEMNITY UNDERTAKING', b.fontBold, 13, rgb(0.08, 0.18, 0.36))
  b.drawCentered('(Under Section 58(f) of Transfer of Property Act, 1882)', b.fontItalic, 9.5, rgb(0.3, 0.3, 0.3))
  b.drawDivider(6)

  b.drawParagraph(
    isCorp
      ? `I, ${data.director1Name}, Director of ${data.companyName} (CIN: ${data.cin}), having its registered office at ${data.registeredOffice}, do hereby solemnly declare, affirm, and undertake as under:`
      : `I, ${data.mortgagorName}, ${data.mortgagorFatherOrRep}, resident of ${data.mortgagorAddress} (PAN: ${data.mortgagorPanOrCin}), do hereby solemnly affirm, declare, and state as under:`,
    { size: 9.5 }
  )

  b.drawParagraph(
    `1. Marketable Title: I / the Mortgagor Company am/is the sole absolute owner of ${data.propertyDescription} (Plot/Khasra: ${data.surveyOrPlotNo}, Area: ${data.propertyArea}). Title is clear and marketable.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `2. Genuine Original Deeds: The title deeds deposited with ${data.bankName}, ${data.bankBranch} are authentic original instruments. No prior mortgage exists.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `3. Non-Encumbrance: No litigations, IBC proceedings, or statutory attachments are pending against the property.`,
    { size: 9.5, indent: 10 }
  )
  b.drawParagraph(
    `4. Indemnity: I / the Mortgagor Company indemnify ${data.bankName} against any losses, legal costs, or claims arising out of any title dispute.`,
    { size: 9.5, indent: 10 }
  )

  b.drawDivider(6)

  b.ensureSpace(50)
  if (isCorp) {
    b.drawParagraph(`For ${data.companyName.toUpperCase()}`, { size: 9.5, extraSpacing: 16 })
    b.drawParagraph(`(${data.director1Name})`, { size: 9.5 })
    b.drawParagraph('Deponent / Authorized Signatory', { size: 9, extraSpacing: 10 })
  } else {
    b.drawParagraph('DEPONENT:', { size: 9.5, extraSpacing: 16 })
    b.drawParagraph(`(${data.mortgagorName})`, { size: 9.5 })
    b.drawParagraph('Mortgagor', { size: 9, extraSpacing: 10 })
  }

  b.drawCentered('VERIFICATION', b.fontBold, 10)
  b.drawParagraph(
    `Verified at ${data.notifiedTown} on this ${data.executionDate} that the contents of the above affidavit are true and correct to the best of my knowledge and belief.`,
    { size: 9 }
  )

  return await b.finish()
}

/**
 * Builds Bank Covering Letter PDF
 */
export async function buildLetterOfDepositPdf(inputData: Partial<ModtFormData> = {}): Promise<Uint8Array> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }
  const isCorp = data.mortgagorType === 'corporate'
  const b = await LegalDocBuilder.create()

  b.drawParagraph(`Date: ${data.executionDate}`, { size: 9.5 })
  b.drawParagraph(`To,\nThe Branch Manager,\n${data.bankName},\n${data.bankBranch},\n${data.bankAddress}`, {
    boldPrefix: 'To: ',
    size: 9.5,
    extraSpacing: 8,
  })

  b.drawParagraph(
    `Subject: Deposit of Original Title Deeds for creating Equitable Mortgage - ${data.loanFacilityName} of ${formatInrCurrency(data.loanAmount)} (Sanction Letter: ${data.sanctionLetterNo})`,
    { boldPrefix: 'SUBJECT: ', size: 10, extraSpacing: 8 }
  )

  b.drawParagraph('Dear Sir / Madam,', { size: 9.5 })
  b.drawParagraph(
    `In terms of Sanction Letter No. ${data.sanctionLetterNo} dated ${data.sanctionLetterDate}, I / we confirm that on this day, ${data.executionDate}, at your office in the notified town of ${data.notifiedTown}, I / we have deposited the following original title deeds relating to property situated at ${data.propertyDescription}:`,
    { size: 9.5 }
  )

  for (let i = 0; i < data.titleDeeds.length; i++) {
    const deed = data.titleDeeds[i]
    b.drawParagraph(`${i + 1}. ${deed.docType} (Doc No: ${deed.docNo}, Dated: ${deed.date})`, {
      size: 9,
      indent: 12,
      extraSpacing: 3,
    })
  }

  b.drawParagraph(
    `The deposit is made with the express intent to create an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882 to secure ${formatInrCurrency(data.loanAmount)} (${data.loanAmountWords}) with interest.`,
    { size: 9.5, extraSpacing: 8 }
  )

  b.drawParagraph('Kindly acknowledge receipt of the original documents and provide safe custody confirmation.', {
    size: 9.5,
    extraSpacing: 15,
  })

  if (isCorp) {
    b.drawParagraph(`For ${data.companyName.toUpperCase()}`, { size: 9.5, extraSpacing: 16 })
    b.drawParagraph(`(${data.director1Name})`, { size: 9.5 })
    b.drawParagraph(`Director (DIN: ${data.director1Din})`, { size: 9 })
  } else {
    b.drawParagraph('Yours faithfully,', { size: 9.5, extraSpacing: 16 })
    b.drawParagraph(`(${data.mortgagorName})`, { size: 9.5 })
    b.drawParagraph('Mortgagor / Borrower', { size: 9 })
  }

  return await b.finish()
}

/**
 * Builds Corporate Resolution Extract PDF for Form CHG-1
 */
export async function buildChg1ExtractPdf(inputData: Partial<ModtFormData> = {}): Promise<Uint8Array> {
  const data: ModtFormData = { ...DEFAULT_SAMPLE_MODT_DATA, ...inputData }
  const b = await LegalDocBuilder.create()

  b.drawCentered(data.companyName.toUpperCase(), b.fontBold, 14, rgb(0.08, 0.18, 0.36))
  b.drawCentered(`CIN: ${data.cin}`, b.fontBold, 9.5, rgb(0.2, 0.2, 0.2))
  b.drawCentered(`Regd. Office: ${data.registeredOffice}`, b.fontItalic, 8.5, rgb(0.3, 0.3, 0.3))
  b.drawDivider(6)

  b.drawCentered(
    'CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS',
    b.fontBold,
    10.5
  )
  b.drawCentered(`HELD ON ${data.meetingDate} AT THE REGISTERED OFFICE`, b.fontBold, 9.5)
  b.drawDivider(6)

  b.drawParagraph(
    'CREATION OF EQUITABLE MORTGAGE & ROC CHARGE REGISTRATION:',
    { boldPrefix: 'ITEM: ', size: 10, extraSpacing: 6 }
  )

  b.drawParagraph(
    `pursuant to the provisions of Section 179(3)(d), Section 179(3)(e), and Section 77 of the Companies Act, 2013, the consent of the Board be and is hereby accorded to create an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882 over the immovable property at ${data.propertyDescription} in favour of ${data.bankName}, ${data.bankBranch} to secure ${data.loanFacilityName} of ${formatInrCurrency(data.loanAmount)} (${data.loanAmountWords}).`,
    { boldPrefix: 'RESOLVED THAT ', size: 9.5, extraSpacing: 8 }
  )

  b.drawParagraph(
    `${data.director1Name}, Director (DIN: ${data.director1Din}) and ${data.director2Name}, Director (DIN: ${data.director2Din}) be and are hereby severally authorized to deposit the original title deeds, sign the MODT, and file e-Form CHG-1 with the Registrar of Companies within 30 days."`,
    { boldPrefix: 'RESOLVED FURTHER THAT ', size: 9.5, extraSpacing: 15 }
  )

  b.ensureSpace(50)
  b.drawParagraph('CERTIFIED TRUE COPY:', { size: 9.5, extraSpacing: 4 })
  b.drawParagraph(`For ${data.companyName.toUpperCase()}`, { size: 9.5, extraSpacing: 16 })
  b.drawParagraph(`(${data.director1Name})`, { size: 9.5 })
  b.drawParagraph(`Director (DIN: ${data.director1Din})`, { size: 9 })

  return await b.finish()
}
