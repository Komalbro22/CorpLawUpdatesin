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

export type FirmCategory =
  | 'general_at_will'
  | 'fixed_term'
  | 'family_firm'
  | 'professional_services'
  | 'trading_retail'
  | 'manufacturing_industrial'
  | 'tech_ecommerce'

export interface PartnerProfile {
  name: string
  fatherOrSpouse: string
  address: string
  pan: string
  aadhaarOrId: string
  isWorkingPartner: boolean
  capitalAmount: number
  capitalPercentage: number
  profitShare: number // in % e.g. 50
  lossShare: number // in % e.g. 50
  monthlyRemuneration?: number
}

export interface PartnershipDeedFormData {
  firmName: string
  category: FirmCategory
  executionDate: string
  effectiveDate: string
  executionCity: string
  executionState: string
  principalAddress: string
  branchAddress?: string
  durationYears?: string // 'At Will' or '5 Years'

  // Business Objects
  businessObjects: string

  // Partners
  partners: PartnerProfile[]

  // Capital & Financials
  totalCapital: number
  totalCapitalWords: string
  hasCapitalInterest: boolean
  capitalInterestRate: number // max 12% as per Sec 40(b)(iv)
  hasPartnerRemuneration: boolean
  remunerationType: 'section_40b_formula' | 'fixed_monthly'
  estimatedAnnualBookProfit?: number

  // Partner Drawings
  monthlyDrawingsLimit: number

  // Banking & Operations
  bankName: string
  bankBranch: string
  bankingSigningAuthority: 'any_partner' | 'joint_all' | 'joint_any_two' | 'designated_managing'
  managingPartnerName?: string
  bankingTransactionLimitSingle: number

  // Dispute Resolution & Covenants
  arbitrationSeat: string
  governingLawState: string
  nonCompeteYears: number
  nonCompeteRadiusKm: number

  // Witnesses
  witness1Name: string
  witness1Address: string
  witness2Name: string
  witness2Address: string
}

/**
 * Calculates Section 40(b) Maximum Allowable Partner Remuneration
 * Updated post-Finance (No. 2) Act, 2024 (AY 2025-26 onwards):
 * - On first Rs. 6,00,000 of book profit (or loss): Rs. 3,00,000 or 90% of book profit (whichever higher)
 * - On the balance of book profit: 60%
 */
export function calculateSection40bRemuneration(bookProfit: number): {
  maxDeductible: number
  firstSlab: number
  balanceSlab: number
  explanation: string
} {
  const profit = Math.max(0, bookProfit || 0)

  if (profit <= 0) {
    return {
      maxDeductible: 300000,
      firstSlab: 300000,
      balanceSlab: 0,
      explanation: 'Statutory minimum of Rs. 3,00,000 allowable in case of loss under Section 40(b)(v) (AY 2025-26).',
    }
  }

  if (profit <= 600000) {
    const ninetyPercent = Math.round(profit * 0.9)
    const maxDeductible = Math.max(300000, ninetyPercent)
    return {
      maxDeductible,
      firstSlab: maxDeductible,
      balanceSlab: 0,
      explanation: `Higher of Rs. 3,00,000 or 90% of book profit (Rs. ${ninetyPercent.toLocaleString('en-IN')}) = Rs. ${maxDeductible.toLocaleString('en-IN')}.`,
    }
  }

  const firstSlab = 540000 // 90% of 6,00,000
  const balanceProfit = profit - 600000
  const balanceSlab = Math.round(balanceProfit * 0.6)
  const maxDeductible = firstSlab + balanceSlab

  return {
    maxDeductible,
    firstSlab,
    balanceSlab,
    explanation: `90% on first Rs. 6,00,000 (Rs. 5,40,000) + 60% on balance Rs. ${balanceProfit.toLocaleString('en-IN')} (Rs. ${balanceSlab.toLocaleString('en-IN')}) = Rs. ${maxDeductible.toLocaleString('en-IN')}.`,
  }
}

export function formatInrCurrency(amount: number): string {
  if (isNaN(amount)) return '0'
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount)
}

export function convertNumberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num === 0) return 'Zero'

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n: number): string => {
    let str = ''
    if (n > 99) {
      str += `${a[Math.floor(n / 100)]} Hundred `
      n %= 100
    }
    if (n > 19) {
      str += `${b[Math.floor(n / 10)]} `
      n %= 10
    }
    if (n > 0) {
      str += `${a[n]} `
    }
    return str.trim()
  }

  let crore = Math.floor(num / 10000000)
  num %= 10000000
  let lakh = Math.floor(num / 100000)
  num %= 100000
  let thousand = Math.floor(num / 1000)
  num %= 1000
  let rem = num

  let res = ''
  if (crore > 0) res += `${inWords(crore)} Crore `
  if (lakh > 0) res += `${inWords(lakh)} Lakh `
  if (thousand > 0) res += `${inWords(thousand)} Thousand `
  if (rem > 0) res += `${inWords(rem)} `

  return `Rupees ${res.trim()} Only`
}

export const PARTNERSHIP_PRESETS: Record<
  FirmCategory,
  {
    label: string
    shortBadge: string
    defaultDuration: string
    defaultObjects: string
    suggestedFirmName: string
    remunerationDefault: 'section_40b_formula' | 'fixed_monthly'
    notes: string
  }
> = {
  general_at_will: {
    label: 'General Commercial Partnership (At Will)',
    shortBadge: 'Partnership At Will',
    defaultDuration: 'At Will (Terminable on written notice)',
    defaultObjects:
      'To carry on the business of wholesale and retail commercial trade, import, export, distribution, marketing, and agency representation of commercial merchandise, industrial goods, FMCG products, and allied consumer commodities.',
    suggestedFirmName: 'M/s APEX GLOBAL TRADERS',
    remunerationDefault: 'section_40b_formula',
    notes: 'Default partnership at will under Section 7 of Indian Partnership Act 1932. Terminable by any partner upon 30 days written notice.',
  },
  fixed_term: {
    label: 'Fixed-Term Commercial Partnership',
    shortBadge: 'Fixed Term',
    defaultDuration: '5 (Five) Years from the Commencement Date',
    defaultObjects:
      'To execute specific civil contracting projects, joint property infrastructure works, commercial procurement supply agreements, and turnkey project installations as mutually approved by all partners.',
    suggestedFirmName: 'M/s HORIZON INFRASTRUCTURE PARTNERS',
    remunerationDefault: 'section_40b_formula',
    notes: 'Section 8 contract for fixed venture or defined duration. Does not dissolve at will until tenure expiry or project completion.',
  },
  family_firm: {
    label: 'Family / Spousal Partnership Firm',
    shortBadge: 'Family Firm',
    defaultDuration: 'At Will',
    defaultObjects:
      'To carry on family-held commercial trading, retail shop operations, logistics distribution, warehousing, and commercial enterprise management with mutual capital participation.',
    suggestedFirmName: 'M/s SHARMA & SONS ENTERPRISES',
    remunerationDefault: 'section_40b_formula',
    notes: 'Subject to genuine commercial participation test by Income Tax Department under Section 40(b). Both partners must contribute verifiable capital or working time.',
  },
  professional_services: {
    label: 'Professional Practice Firm (CS / CA / Advocates / Architects)',
    shortBadge: 'Professional Firm',
    defaultDuration: 'At Will',
    defaultObjects:
      'To provide professional corporate secretarial, legal advisory, financial consulting, taxation compliance, internal auditing, architectural drafting, management consulting, and statutory certification services.',
    suggestedFirmName: 'M/s VERMA & KAPOOR ASSOCIATES',
    remunerationDefault: 'section_40b_formula',
    notes: 'Subject to relevant professional institute codes (ICSI, ICAI, Bar Council). Remuneration deductible under Section 40(b) up to statutory slabs.',
  },
  trading_retail: {
    label: 'Trading & Retail Commercial Enterprise',
    shortBadge: 'Trading & Retail',
    defaultDuration: 'At Will',
    defaultObjects:
      'To carry on the business of wholesale distribution, supermarket and retail outlets, supply chain aggregation, direct-to-consumer merchandising, dealership agency, and general merchandise logistics.',
    suggestedFirmName: 'M/s METRO TRADING COMPANY',
    remunerationDefault: 'section_40b_formula',
    notes: 'Includes single signatory banking authority up to defined limit for fast-paced commercial retail transactions.',
  },
  manufacturing_industrial: {
    label: 'Manufacturing & Industrial Processing Firm',
    shortBadge: 'Manufacturing Unit',
    defaultDuration: 'At Will',
    defaultObjects:
      'To establish, operate, and manage manufacturing facilities, fabrication workshops, assembly plants, engineering works, and industrial processing units, and to purchase, machine, assemble, and market finished components.',
    suggestedFirmName: 'M/s PRECISION INDUSTRIAL FABRICATORS',
    remunerationDefault: 'section_40b_formula',
    notes: 'Includes capital asset depreciation covenants and partner capex contribution procedures.',
  },
  tech_ecommerce: {
    label: 'Technology & E-Commerce Startup Firm',
    shortBadge: 'Tech & Digital',
    defaultDuration: 'At Will',
    defaultObjects:
      'To design, develop, deploy, and market software products, SaaS applications, mobile applications, e-commerce platforms, cloud solutions, and digital marketplace services, and to license technology solutions worldwide.',
    suggestedFirmName: 'M/s NEXTGEN DIGITAL SOLUTIONS',
    remunerationDefault: 'section_40b_formula',
    notes: 'Includes pre-existing intellectual property assignment covenants ensuring software and code belong exclusively to the partnership firm.',
  },
}

export const DEFAULT_SAMPLE_PARTNERSHIP_DATA: PartnershipDeedFormData = {
  firmName: 'M/s APEX GLOBAL TRADERS',
  category: 'general_at_will',
  executionDate: '12/09/2026',
  effectiveDate: '01/10/2026',
  executionCity: 'New Delhi',
  executionState: 'Delhi',
  principalAddress: 'Shop No. 14, Commercial Complex, Barakhamba Road, Connaught Place, New Delhi - 110001',
  branchAddress: '',
  durationYears: 'At Will',

  businessObjects:
    'To carry on the business of wholesale and retail commercial trade, import, export, distribution, marketing, and agency representation of commercial merchandise, industrial components, electronic appliances, and consumer goods, and to engage in all ancillary activities necessary for the commercial growth of the firm.',

  partners: [
    {
      name: 'Mr. Rajesh Sharma',
      fatherOrSpouse: 'S/o Late Shri Omprakash Sharma',
      address: 'Flat 402, Block C, Preet Vihar, Delhi - 110092',
      pan: 'ABCPS1234F',
      aadhaarOrId: 'XXXX-XXXX-4812',
      isWorkingPartner: true,
      capitalAmount: 500000,
      capitalPercentage: 50,
      profitShare: 50,
      lossShare: 50,
      monthlyRemuneration: 35000,
    },
    {
      name: 'Mr. Vikram Singhania',
      fatherOrSpouse: 'S/o Shri Suresh Singhania',
      address: 'B-12, Sector 15, Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301',
      pan: 'XYZPS5678G',
      aadhaarOrId: 'XXXX-XXXX-9134',
      isWorkingPartner: true,
      capitalAmount: 500000,
      capitalPercentage: 50,
      profitShare: 50,
      lossShare: 50,
      monthlyRemuneration: 35000,
    },
  ],

  totalCapital: 1000000,
  totalCapitalWords: 'Rupees Ten Lakh Only',
  hasCapitalInterest: true,
  capitalInterestRate: 12,
  hasPartnerRemuneration: true,
  remunerationType: 'section_40b_formula',
  estimatedAnnualBookProfit: 1500000,

  monthlyDrawingsLimit: 50000,

  bankName: 'State Bank of India',
  bankBranch: 'Connaught Place Branch, New Delhi',
  bankingSigningAuthority: 'any_partner',
  managingPartnerName: 'Mr. Rajesh Sharma',
  bankingTransactionLimitSingle: 100000,

  arbitrationSeat: 'New Delhi',
  governingLawState: 'Delhi',
  nonCompeteYears: 2,
  nonCompeteRadiusKm: 5,

  witness1Name: 'Mr. Amit Kumar',
  witness1Address: '12/4, Laxmi Nagar, Delhi - 110092',
  witness2Name: 'Ms. Pooja Verma',
  witness2Address: '88, Anand Vihar, Delhi - 110092',
}

function sanitizePdfText(text: string): string {
  if (!text) return ''
  return text
    .replace(/[₹]/g, 'Rs. ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[•]/g, '-')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^\x00-\x7F]/g, '')
    .trim()
}

class LegalDocBuilder {
  doc: PDFDocument
  currentPage: PDFPage
  fontRegular!: PDFFont
  fontBold!: PDFFont
  fontItalic!: PDFFont
  pageWidth: number
  pageHeight: number
  margin: number
  contentWidth: number
  y: number
  bottomMargin: number
  pageNumber: number

  private constructor(doc: PDFDocument) {
    this.doc = doc
    this.pageWidth = 595.28 // A4 width
    this.pageHeight = 841.89 // A4 height
    this.margin = 50
    this.contentWidth = this.pageWidth - this.margin * 2
    this.bottomMargin = 50
    this.y = this.pageHeight - this.margin
    this.pageNumber = 1
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight])
  }

  static async create(): Promise<LegalDocBuilder> {
    const doc = await PDFDocument.create()
    const builder = new LegalDocBuilder(doc)
    builder.fontRegular = await doc.embedFont(StandardFonts.TimesRoman)
    builder.fontBold = await doc.embedFont(StandardFonts.TimesRomanBold)
    builder.fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)
    return builder
  }

  newPage() {
    this.drawFooter()
    this.pageNumber++
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight])
    this.y = this.pageHeight - this.margin
    this.drawHeader()
  }

  private drawHeader() {
    const headerText = 'PARTNERSHIP DEED - INDIAN PARTNERSHIP ACT, 1932'
    this.currentPage.drawText(headerText, {
      x: this.margin,
      y: this.pageHeight - 32,
      size: 7.5,
      font: this.fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    })
    this.currentPage.drawLine({
      start: { x: this.margin, y: this.pageHeight - 36 },
      end: { x: this.pageWidth - this.margin, y: this.pageHeight - 36 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
  }

  private drawFooter() {
    const pageStr = `Page ${this.pageNumber}`
    const width = this.fontRegular.widthOfTextAtSize(pageStr, 8)
    this.currentPage.drawText(pageStr, {
      x: this.pageWidth - this.margin - width,
      y: 28,
      size: 8,
      font: this.fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    })
    this.currentPage.drawText('Drafted in compliance with Section 40(b) Income-tax Act & Indian Partnership Act 1932', {
      x: this.margin,
      y: 28,
      size: 7,
      font: this.fontItalic,
      color: rgb(0.5, 0.5, 0.5),
    })
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
    opts: {
      boldPrefix?: string
      size?: number
      indent?: number
      lineHeight?: number
      extraSpacing?: number
      color?: any
      bold?: boolean
    } = {}
  ) {
    const size = opts.size || 9.5
    const lineHeight = opts.lineHeight || size * 1.35
    const extraSpacing = opts.extraSpacing !== undefined ? opts.extraSpacing : 4
    const indent = opts.indent || 0
    const color = opts.color || rgb(0.1, 0.1, 0.1)
    const font = opts.bold ? this.fontBold : this.fontRegular

    const cleanText = sanitizePdfText(text)
    const availableWidth = this.contentWidth - indent

    if (opts.boldPrefix) {
      const cleanPrefix = sanitizePdfText(opts.boldPrefix)
      const fullText = `${cleanPrefix} ${cleanText}`
      const words = fullText.split(/\s+/).filter(Boolean)
      let currentLine = ''
      const lines: string[] = []

      for (const word of words) {
        const test = currentLine ? `${currentLine} ${word}` : word
        if (this.fontRegular.widthOfTextAtSize(test, size) > availableWidth) {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = test
        }
      }
      if (currentLine) lines.push(currentLine)

      for (let i = 0; i < lines.length; i++) {
        this.ensureSpace(lineHeight)
        const line = lines[i]
        const x = this.margin + indent

        if (i === 0 && line.startsWith(cleanPrefix)) {
          this.currentPage.drawText(cleanPrefix, {
            x,
            y: this.y,
            size,
            font: this.fontBold,
            color,
          })
          const prefixWidth = this.fontBold.widthOfTextAtSize(cleanPrefix + ' ', size)
          const remainingLine = line.substring(cleanPrefix.length).trim()
          if (remainingLine) {
            this.currentPage.drawText(remainingLine, {
              x: x + prefixWidth,
              y: this.y,
              size,
              font: this.fontRegular,
              color,
            })
          }
        } else {
          this.currentPage.drawText(line, {
            x,
            y: this.y,
            size,
            font: this.fontRegular,
            color,
          })
        }
        this.y -= lineHeight
      }
    } else {
      const words = cleanText.split(/\s+/).filter(Boolean)
      let currentLine = ''
      const lines: string[] = []

      for (const word of words) {
        const test = currentLine ? `${currentLine} ${word}` : word
        if (font.widthOfTextAtSize(test, size) > availableWidth) {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = test
        }
      }
      if (currentLine) lines.push(currentLine)

      for (const line of lines) {
        this.ensureSpace(lineHeight)
        this.currentPage.drawText(line, {
          x: this.margin + indent,
          y: this.y,
          size,
          font,
          color,
        })
        this.y -= lineHeight
      }
    }
    this.y -= extraSpacing
  }

  async finish(): Promise<Uint8Array> {
    this.drawFooter()
    return await this.doc.save()
  }
}

/**
 * Builds Full Partnership Deed in DOCX format (Bookman Old Style 12pt)
 */
export async function buildPartnershipDeedDocx(
  inputData: Partial<PartnershipDeedFormData> = {}
): Promise<Buffer> {
  const data: PartnershipDeedFormData = { ...DEFAULT_SAMPLE_PARTNERSHIP_DATA, ...inputData }

  const paragraphs: Paragraph[] = []

  // Document Title
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'PARTNERSHIP DEED',
          bold: true,
          size: 28, // 14pt
          font: 'Bookman Old Style',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `OF ${data.firmName.toUpperCase()}`,
          bold: true,
          size: 24, // 12pt
          font: 'Bookman Old Style',
        }),
      ],
    })
  )

  // Preamble
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 276, after: 140 },
      children: [
        new TextRun({
          text: `THIS DEED OF PARTNERSHIP is made and executed on this ${data.executionDate} at ${data.executionCity}, State of ${data.executionState}, by and between:`,
          font: 'Bookman Old Style',
          size: 24,
        }),
      ],
    })
  )

  // Partners List
  data.partners.forEach((partner, idx) => {
    const isLast = idx === data.partners.length - 1
    const partnerPrefix = idx === 0 ? 'FIRST PARTY' : idx === 1 ? 'SECOND PARTY' : idx === 2 ? 'THIRD PARTY' : `PARTY NO. ${idx + 1}`

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 276, after: 100 },
        children: [
          new TextRun({
            text: `${idx + 1}. ${partner.name.toUpperCase()}`,
            bold: true,
            font: 'Bookman Old Style',
            size: 24,
          }),
          new TextRun({
            text: `, ${partner.fatherOrSpouse}, residing at ${partner.address}, bearing Permanent Account Number (PAN) ${partner.pan} and Aadhaar/ID No. ${partner.aadhaarOrId} (hereinafter referred to as the `,
            font: 'Bookman Old Style',
            size: 24,
          }),
          new TextRun({
            text: `"${partnerPrefix}"`,
            bold: true,
            font: 'Bookman Old Style',
            size: 24,
          }),
          new TextRun({
            text: `, which expression shall unless repugnant to the context include their legal heirs, executors, administrators, and permitted assigns)${isLast ? ';' : '; AND'}`,
            font: 'Bookman Old Style',
            size: 24,
          }),
        ],
      })
    )
  })

  // Recitals
  paragraphs.push(
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: 'WHEREAS:',
          bold: true,
          font: 'Bookman Old Style',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 276, after: 100 },
      children: [
        new TextRun({
          text: `A. The Parties hereto have mutually agreed to associate themselves together as partners to carry on commercial business under the name and style of ${data.firmName} under the provisions of the Indian Partnership Act, 1932.`,
          font: 'Bookman Old Style',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 276, after: 140 },
      children: [
        new TextRun({
          text: `B. The Parties deem it expedient and necessary to reduce the agreed terms, rights, duties, capital contributions, profit-sharing ratio, and operational management of the partnership firm into writing.`,
          font: 'Bookman Old Style',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 276, after: 160 },
      children: [
        new TextRun({
          text: 'NOW, THEREFORE, THIS DEED OF PARTNERSHIP WITNESSETH AND IT IS HEREBY MUTUALLY AGREED BY AND BETWEEN THE PARTIES HERETO AS FOLLOWS:',
          bold: true,
          font: 'Bookman Old Style',
          size: 24,
        }),
      ],
    })
  )

  // 15 Standard Legal Clauses
  const clauses: { title: string; body: string }[] = [
    {
      title: '1. NAME AND STYLE OF THE FIRM',
      body: `The business of the Partnership shall be carried on under the firm name and style of "${data.firmName.toUpperCase()}" or such other name or names as the Partners may mutually decide in writing from time to time.`,
    },
    {
      title: '2. COMMENCEMENT AND DURATION',
      body: `The Partnership shall be deemed to have commenced on ${data.effectiveDate}. The duration of the Partnership shall be "${data.durationYears || 'At Will'}", subject to determination in accordance with the provisions of this Deed and the Indian Partnership Act, 1932.`,
    },
    {
      title: '3. PRINCIPAL PLACE OF BUSINESS',
      body: `The principal place of business of the firm shall be situated at ${data.principalAddress}${
        data.branchAddress ? `, and at branch office situated at ${data.branchAddress}` : ''
      }, or at such other place or places as the Partners may mutually determine from time to time.`,
    },
    {
      title: '4. NATURE AND OBJECTS OF BUSINESS',
      body: `${data.businessObjects} The firm may undertake such other commercial, manufacturing, trading, or service activities as may be mutually agreed upon in writing by all Partners.`,
    },
    {
      title: '5. CAPITAL CONTRIBUTION',
      body: `The initial capital of the firm shall be Rs. ${formatInrCurrency(data.totalCapital)} (${data.totalCapitalWords}), contributed by the Partners in their agreed proportions as set forth in the Capital Schedule herein. Any further capital required for the expansion of the business shall be contributed by the Partners as mutually agreed upon in writing.`,
    },
    {
      title: '6. PROFIT AND LOSS SHARING RATIO',
      body: `The net profits and losses of the firm (including capital profits and losses) after charging interest on capital and remuneration payable to working partners shall be divided and borne between the Partners in the following ratio:\n` +
        data.partners.map(p => `• ${p.name}: ${p.profitShare}% of net profits and ${p.lossShare}% of net losses`).join('\n'),
    },
    {
      title: '7. INTEREST ON CAPITAL',
      body: data.hasCapitalInterest
        ? `In accordance with Section 40(b)(iv) of the Income-tax Act, 1961, simple interest at the rate of ${data.capitalInterestRate}% per annum (or such other lower rate as the Partners may determine from time to time, not exceeding 12% per annum) shall be payable to the Partners on the capital standing to their credit as on the first day of the accounting year.`
        : `No interest shall be paid to any Partner on the capital contribution standing to their credit in the books of the firm.`,
    },
    {
      title: '8. REMUNERATION TO WORKING PARTNERS (SECTION 40(b) INCOME-TAX ACT)',
      body: data.hasPartnerRemuneration
        ? `The working partners of the firm who devote their personal time and attention to the conduct of the business are hereby designated as follows: ${data.partners
            .filter(p => p.isWorkingPartner)
            .map(p => p.name)
            .join(', ')}. In compliance with Section 40(b)(v) of the Income-tax Act, 1961 (as amended post-Finance (No. 2) Act, 2024 for AY 2025-26 onwards), working partners shall be entitled to receive remuneration computed strictly as per the following statutory formula:\n` +
          `a) On the first Rs. 6,00,000 of book profit (or in case of a loss): Rs. 3,00,000 or at the rate of 90% of the book profit, whichever is more;\n` +
          `b) On the balance of the book profit: at the rate of 60% of such balance.\n` +
          `The aggregate remuneration computed under the above formula shall be divided between the working partners in equal proportion or as mutually agreed in writing at the end of the accounting year.`
        : `No salary, remuneration, commission, or bonus shall be paid to any Partner for their services to the firm.`,
    },
    {
      title: '9. TDS COMPLIANCE UNDER SECTION 194T',
      body: `The firm shall deduct tax at source (TDS) at the statutory rate of 10% under Section 194T of the Income-tax Act, 1961 on all payments or credits of salary, remuneration, commission, bonus, or interest made to any Partner where the aggregate of such amounts exceeds Rs. 20,000 in a financial year. Profit share distributed under Section 10(2A) shall remain exempt from tax and TDS.`,
    },
    {
      title: '10. PARTNER DRAWINGS',
      body: `Each Partner shall be entitled to draw out of the firm's funds on account of their share of profits a sum not exceeding Rs. ${formatInrCurrency(data.monthlyDrawingsLimit)} per month, provided that if at the annual closing it is found that any Partner has drawn excess funds, such excess shall be refunded forthwith or debited to their capital account.`,
    },
    {
      title: '11. BANKING OPERATIONS AND SIGNING AUTHORITY',
      body: `All bank accounts in the name of the firm shall be maintained with ${data.bankName || 'scheduled commercial banks'}, ${data.bankBranch || 'approved branches'}. All cheques, bills of exchange, and banking instruments shall be signed and operated: ${
        data.bankingSigningAuthority === 'any_partner'
          ? `by ANY ONE of the Partners individually up to a transaction limit of Rs. ${formatInrCurrency(data.bankingTransactionLimitSingle)}, and JOINTLY by all Partners for amounts exceeding the said limit.`
          : data.bankingSigningAuthority === 'designated_managing'
          ? `by the Managing Partner, ${data.managingPartnerName || data.partners[0]?.name}, individually, or by any two Partners jointly.`
          : `JOINTLY by all Partners of the firm.`
      }`,
    },
    {
      title: '12. BOOKS OF ACCOUNT AND ANNUAL CLOSING',
      body: `Proper and standard books of account shall be kept on mercantile/accrual basis at the principal place of business. The accounting year of the firm shall commence on the 1st day of April and terminate on the 31st day of March of each succeeding year. The books shall be balanced and audited annually by an independent Chartered Accountant in compliance with Section 44AB of the Income-tax Act.`,
    },
    {
      title: '13. RETIREMENT AND EXPULSION OF PARTNERS',
      body: `Any Partner may retire from the firm by giving not less than 30 (thirty) days prior notice in writing to the other Partners. No Partner shall be expelled from the firm except on grounds of gross misconduct or fraud, upon the unanimous consensus of all other Partners. The outgoing Partner shall be paid their capital credit, share of accrued profits, and valuation of goodwill within 90 days.`,
    },
    {
      title: '14. CONTINUATION OF FIRM (OVERRULING SECTION 42(c))',
      body: `The Partnership shall NOT automatically dissolve upon the death, retirement, insolvency, or lunacy of any Partner (expressly overriding the default provision of Section 42(c) of the Indian Partnership Act, 1932). The surviving Partners shall be entitled to continue the business of the firm with the admission of the legal heir(s) of the deceased Partner or by paying out the deceased Partner's capital share to their legal representatives.`,
    },
    {
      title: '15. DISPUTE RESOLUTION, NON-COMPETE, AND ARBITRATION',
      body: `a) Non-Compete: An outgoing or retiring Partner shall not engage in, establish, or associate with any business competing directly with the firm within a geographical radius of ${data.nonCompeteRadiusKm} kilometers for a period of ${data.nonCompeteYears} years from the date of retirement.\n` +
        `b) Arbitration: Any dispute or difference arising out of or in connection with this Deed shall be referred to a sole arbitrator appointed by mutual consent under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be ${data.arbitrationSeat}, and the courts at ${data.governingLawState} shall have exclusive territorial jurisdiction.`,
    },
  ]

  clauses.forEach(c => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: c.title,
            bold: true,
            font: 'Bookman Old Style',
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 276, after: 120 },
        children: [
          new TextRun({
            text: c.body,
            font: 'Bookman Old Style',
            size: 24,
          }),
        ],
      })
    )
  })

  // Execution & Witness Preamble
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, line: 276, after: 180 },
      children: [
        new TextRun({
          text: 'IN WITNESS WHEREOF, the Partners hereto have set and subscribed their respective hands and seals on this Deed of Partnership on the day, month, and year first above written.',
          bold: true,
          font: 'Bookman Old Style',
          size: 24,
        }),
      ],
    })
  )

  // Partner Signatures
  data.partners.forEach((partner, idx) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 100, after: 30 },
        children: [
          new TextRun({
            text: `SIGNED, SEALED AND DELIVERED by Partner ${idx + 1}:`,
            bold: true,
            font: 'Bookman Old Style',
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `_________________________________________\n${partner.name.toUpperCase()} (PAN: ${partner.pan})`,
            font: 'Bookman Old Style',
            size: 24,
          }),
        ],
      })
    )
  })

  // Witnesses
  paragraphs.push(
    new Paragraph({
      spacing: { before: 140, after: 40 },
      children: [
        new TextRun({
          text: 'IN THE PRESENCE OF WITNESSES:',
          bold: true,
          font: 'Bookman Old Style',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: `1. Signature: _______________________\nName: ${data.witness1Name}\nAddress: ${data.witness1Address}`,
          font: 'Bookman Old Style',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `2. Signature: _______________________\nName: ${data.witness2Name}\nAddress: ${data.witness2Address}`,
          font: 'Bookman Old Style',
          size: 22,
        }),
      ],
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Full Partnership Deed in PDF format
 */
export async function buildPartnershipDeedPdf(
  inputData: Partial<PartnershipDeedFormData> = {}
): Promise<Uint8Array> {
  const data: PartnershipDeedFormData = { ...DEFAULT_SAMPLE_PARTNERSHIP_DATA, ...inputData }
  const b = await LegalDocBuilder.create()

  // Title
  b.drawCentered('PARTNERSHIP DEED', b.fontBold, 15, rgb(0.08, 0.18, 0.36))
  b.drawCentered(`OF ${data.firmName.toUpperCase()}`, b.fontBold, 12, rgb(0.15, 0.15, 0.15))
  b.drawCentered('(Under the Indian Partnership Act, 1932)', b.fontItalic, 9, rgb(0.4, 0.4, 0.4))
  b.drawDivider(6)

  // Preamble
  b.drawParagraph(
    `THIS DEED OF PARTNERSHIP is made and executed on this ${data.executionDate} at ${data.executionCity}, State of ${data.executionState}, by and between:`,
    { size: 9.5, extraSpacing: 6 }
  )

  // Partners List
  data.partners.forEach((p, idx) => {
    b.drawParagraph(
      `${idx + 1}. ${p.name.toUpperCase()}, ${p.fatherOrSpouse}, residing at ${p.address}, holding PAN: ${p.pan} and ID: ${p.aadhaarOrId}.`,
      { size: 9, indent: 8, extraSpacing: 4 }
    )
  })

  b.drawDivider(4)

  // Recitals
  b.drawParagraph('WHEREAS the Parties have agreed to carry on business in partnership as per the following terms:', {
    size: 9.5,
    extraSpacing: 6,
    bold: true,
  })

  const clauses: { title: string; body: string }[] = [
    {
      title: '1. FIRM NAME:',
      body: `The firm name shall be "${data.firmName.toUpperCase()}".`,
    },
    {
      title: '2. COMMENCEMENT & DURATION:',
      body: `Commenced on ${data.effectiveDate}. Duration is "${data.durationYears || 'At Will'}".`,
    },
    {
      title: '3. PLACE OF BUSINESS:',
      body: `${data.principalAddress}${data.branchAddress ? `; Branch: ${data.branchAddress}` : ''}`,
    },
    {
      title: '4. BUSINESS OBJECTS:',
      body: data.businessObjects,
    },
    {
      title: '5. TOTAL CAPITAL:',
      body: `Rs. ${formatInrCurrency(data.totalCapital)} (${data.totalCapitalWords}) contributed as agreed.`,
    },
    {
      title: '6. PROFIT & LOSS SHARING RATIO:',
      body: data.partners.map(p => `${p.name}: ${p.profitShare}%`).join(' | '),
    },
    {
      title: '7. INTEREST ON CAPITAL (SEC 40(b)(iv)):',
      body: data.hasCapitalInterest
        ? `Simple interest at ${data.capitalInterestRate}% p.a. (max 12% as permitted under Section 40(b)(iv) Income-tax Act).`
        : 'No interest on partner capital.',
    },
    {
      title: '8. WORKING PARTNER REMUNERATION (SEC 40(b)(v)):',
      body: data.hasPartnerRemuneration
        ? `Working partners (${data.partners.filter(p => p.isWorkingPartner).map(p => p.name).join(', ')}) shall receive remuneration computed under Section 40(b)(v) formula (90% on first Rs. 6,00,000 book profit, 60% on balance).`
        : 'No remuneration payable.',
    },
    {
      title: '9. SECTION 194T TDS COMPLIANCE:',
      body: 'The firm shall deduct 10% TDS on partner salary, interest, and bonus exceeding Rs. 20,000 p.a. Profit share is exempt under Section 10(2A).',
    },
    {
      title: '10. PARTNER DRAWINGS:',
      body: `Drawings limited to Rs. ${formatInrCurrency(data.monthlyDrawingsLimit)} per month per partner against profit.`,
    },
    {
      title: '11. BANKING SIGNING AUTHORITY:',
      body: `${data.bankName || 'Scheduled Bank'}: Operated ${
        data.bankingSigningAuthority === 'any_partner'
          ? `singly up to Rs. ${formatInrCurrency(data.bankingTransactionLimitSingle)}, and jointly for higher amounts.`
          : 'jointly by partners.'
      }`,
    },
    {
      title: '12. BOOKS & ANNUAL AUDIT:',
      body: 'Mercantile/accrual basis, fiscal year ending 31st March, audited under Section 44AB.',
    },
    {
      title: '13. RETIREMENT NOTICE:',
      body: '30 days prior written notice. Capital and goodwill settled within 90 days.',
    },
    {
      title: '14. CONTINUATION (SECTION 42(c) OVERRULED):',
      body: 'The firm shall NOT dissolve upon death or retirement of a partner; business continues with legal heirs or surviving partners.',
    },
    {
      title: '15. NON-COMPETE & ARBITRATION:',
      body: `Non-compete: ${data.nonCompeteRadiusKm} km radius for ${data.nonCompeteYears} years. Disputes resolved by sole arbitrator at ${data.arbitrationSeat}.`,
    },
  ]

  clauses.forEach(c => {
    b.drawParagraph(c.body, { boldPrefix: c.title, size: 9, extraSpacing: 4 })
  })

  b.drawDivider(6)

  // Execution
  b.drawParagraph(
    'IN WITNESS WHEREOF, the Partners hereto set their hands on the day, month, and year first written above.',
    { size: 9, bold: true, extraSpacing: 10 }
  )

  b.ensureSpace(50)
  data.partners.forEach(p => {
    b.drawParagraph(`SIGNED BY: ${p.name.toUpperCase()} (PAN: ${p.pan})`, { size: 9, extraSpacing: 8 })
  })

  b.ensureSpace(40)
  b.drawParagraph('WITNESSES:', { boldPrefix: 'WITNESSES: ', size: 9, extraSpacing: 4 })
  b.drawParagraph(`1. ${data.witness1Name} - ${data.witness1Address}`, { size: 8.5, indent: 8 })
  b.drawParagraph(`2. ${data.witness2Name} - ${data.witness2Address}`, { size: 8.5, indent: 8 })

  return await b.finish()
}

/**
 * Builds ROF Form No. 1 Application in DOCX format (Section 58 Indian Partnership Act)
 */
export async function buildRofForm1Docx(
  inputData: Partial<PartnershipDeedFormData> = {}
): Promise<Buffer> {
  const data: PartnershipDeedFormData = { ...DEFAULT_SAMPLE_PARTNERSHIP_DATA, ...inputData }

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'FORM NO. 1',
          bold: true,
          size: 26,
          font: 'Bookman Old Style',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'STATEMENT FOR REGISTRATION OF FIRM UNDER SECTION 58',
          bold: true,
          size: 22,
          font: 'Bookman Old Style',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: '(To be filed with the Registrar of Firms)',
          font: 'Bookman Old Style',
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { line: 276, after: 100 },
      children: [
        new TextRun({ text: '1. Firm Name: ', bold: true, font: 'Bookman Old Style', size: 22 }),
        new TextRun({ text: data.firmName, font: 'Bookman Old Style', size: 22 }),
      ],
    }),
    new Paragraph({
      spacing: { line: 276, after: 100 },
      children: [
        new TextRun({ text: '2. Principal Place of Business: ', bold: true, font: 'Bookman Old Style', size: 22 }),
        new TextRun({ text: data.principalAddress, font: 'Bookman Old Style', size: 22 }),
      ],
    }),
    new Paragraph({
      spacing: { line: 276, after: 100 },
      children: [
        new TextRun({ text: '3. Other Places of Business / Branches: ', bold: true, font: 'Bookman Old Style', size: 22 }),
        new TextRun({ text: data.branchAddress || 'None', font: 'Bookman Old Style', size: 22 }),
      ],
    }),
    new Paragraph({
      spacing: { line: 276, after: 100 },
      children: [
        new TextRun({ text: '4. Duration of the Firm: ', bold: true, font: 'Bookman Old Style', size: 22 }),
        new TextRun({ text: data.durationYears || 'At Will', font: 'Bookman Old Style', size: 22 }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({ text: '5. Particulars of Partners:', bold: true, font: 'Bookman Old Style', size: 22 }),
      ],
    }),
  ]

  data.partners.forEach((p, idx) => {
    paragraphs.push(
      new Paragraph({
        spacing: { line: 260, after: 60 },
        children: [
          new TextRun({
            text: `Partner ${idx + 1}: ${p.name} | Father/Spouse: ${p.fatherOrSpouse} | Address: ${p.address} | Joining Date: ${data.effectiveDate}`,
            font: 'Bookman Old Style',
            size: 20,
          }),
        ],
      })
    )
  })

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, line: 276, after: 160 },
      children: [
        new TextRun({
          text: 'VERIFICATION: We, the above-named partners, do hereby declare that the particulars given above are true and correct to the best of our knowledge and belief.',
          bold: true,
          font: 'Bookman Old Style',
          size: 22,
        }),
      ],
    })
  )

  data.partners.forEach(p => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Signature of Partner: ______________________ (${p.name})`,
            font: 'Bookman Old Style',
            size: 20,
          }),
        ],
      })
    )
  })

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds ROF Form No. 1 in PDF format
 */
export async function buildRofForm1Pdf(
  inputData: Partial<PartnershipDeedFormData> = {}
): Promise<Uint8Array> {
  const data: PartnershipDeedFormData = { ...DEFAULT_SAMPLE_PARTNERSHIP_DATA, ...inputData }
  const b = await LegalDocBuilder.create()

  b.drawCentered('FORM NO. 1', b.fontBold, 14, rgb(0.08, 0.18, 0.36))
  b.drawCentered('STATEMENT FOR REGISTRATION OF FIRM UNDER SECTION 58', b.fontBold, 11)
  b.drawCentered('(To be filed with the Registrar of Firms under Indian Partnership Act, 1932)', b.fontItalic, 8.5)
  b.drawDivider(6)

  b.drawParagraph(data.firmName, { boldPrefix: '1. Firm Name: ', size: 9.5, extraSpacing: 4 })
  b.drawParagraph(data.principalAddress, { boldPrefix: '2. Principal Place: ', size: 9.5, extraSpacing: 4 })
  b.drawParagraph(data.branchAddress || 'None', { boldPrefix: '3. Branches: ', size: 9.5, extraSpacing: 4 })
  b.drawParagraph(data.durationYears || 'At Will', { boldPrefix: '4. Duration: ', size: 9.5, extraSpacing: 8 })

  b.drawParagraph('5. PARTNERS PARTICULARS:', { size: 9.5, bold: true, extraSpacing: 4 })
  data.partners.forEach((p, idx) => {
    b.drawParagraph(
      `${idx + 1}. ${p.name} (${p.fatherOrSpouse}), Address: ${p.address}, Joined: ${data.effectiveDate}`,
      { size: 8.5, indent: 8, extraSpacing: 3 }
    )
  })

  b.drawDivider(6)
  b.drawParagraph(
    'VERIFICATION: We hereby declare that the particulars given above are true and correct to the best of our knowledge and belief.',
    { size: 9, bold: true, extraSpacing: 16 }
  )

  data.partners.forEach(p => {
    b.drawParagraph(`Signature of Partner: ___________________________ (${p.name})`, { size: 9, extraSpacing: 10 })
  })

  return await b.finish()
}

/**
 * Builds Bank Current Account Opening Mandate in DOCX format
 */
export async function buildBankMandateDocx(
  inputData: Partial<PartnershipDeedFormData> = {}
): Promise<Buffer> {
  const data: PartnershipDeedFormData = { ...DEFAULT_SAMPLE_PARTNERSHIP_DATA, ...inputData }

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: data.firmName.toUpperCase(),
          bold: true,
          size: 26,
          font: 'Bookman Old Style',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Principal Place: ${data.principalAddress}`,
          font: 'Bookman Old Style',
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: 'PARTNERSHIP LETTER / MANDATE FOR OPENING CURRENT BANK ACCOUNT',
          bold: true,
          size: 22,
          font: 'Bookman Old Style',
        }),
      ],
    }),
    new Paragraph({
      spacing: { line: 276, after: 100 },
      children: [
        new TextRun({
          text: `Date: ${data.executionDate}\nTo,\nThe Branch Manager,\n${data.bankName || 'The Bank'},\n${data.bankBranch || 'Branch Office'}`,
          font: 'Bookman Old Style',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { line: 276, after: 120 },
      children: [
        new TextRun({
          text: `Dear Sir/Madam,\n\nRe: Opening of Current Account in the name of "${data.firmName}"`,
          bold: true,
          font: 'Bookman Old Style',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 276, after: 120 },
      children: [
        new TextRun({
          text: `We, the undersigned, being all the partners of the firm "${data.firmName}", request you to open a Current Account in the name of the firm. We hand you herewith a certified true copy of the Partnership Deed dated ${data.executionDate} governing the constitution of our firm.`,
          font: 'Bookman Old Style',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 276, after: 140 },
      children: [
        new TextRun({
          text: `We confirm that the account shall be operated: ${
            data.bankingSigningAuthority === 'any_partner'
              ? `by ANY ONE of the partners individually up to Rs. ${formatInrCurrency(data.bankingTransactionLimitSingle)}, and JOINTLY by all partners for higher amounts.`
              : data.bankingSigningAuthority === 'designated_managing'
              ? `by the Managing Partner (${data.managingPartnerName || data.partners[0]?.name}) individually.`
              : 'JOINTLY by all partners.'
          }`,
          font: 'Bookman Old Style',
          size: 22,
        }),
      ],
    }),
  ]

  data.partners.forEach(p => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Partner Name: ${p.name} | Specimen Signature: ______________________`,
            font: 'Bookman Old Style',
            size: 20,
          }),
        ],
      })
    )
  })

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Bank Mandate in PDF format
 */
export async function buildBankMandatePdf(
  inputData: Partial<PartnershipDeedFormData> = {}
): Promise<Uint8Array> {
  const data: PartnershipDeedFormData = { ...DEFAULT_SAMPLE_PARTNERSHIP_DATA, ...inputData }
  const b = await LegalDocBuilder.create()

  b.drawCentered(data.firmName.toUpperCase(), b.fontBold, 14, rgb(0.08, 0.18, 0.36))
  b.drawCentered(`Principal Office: ${data.principalAddress}`, b.fontRegular, 8.5)
  b.drawCentered('PARTNERSHIP LETTER / MANDATE FOR BANK CURRENT ACCOUNT', b.fontBold, 11)
  b.drawDivider(6)

  b.drawParagraph(`Date: ${data.executionDate}`, { size: 9, extraSpacing: 4 })
  b.drawParagraph(`To,\nThe Branch Manager,\n${data.bankName || 'The Bank'},\n${data.bankBranch || 'Branch Office'}`, {
    size: 9,
    extraSpacing: 6,
  })

  b.drawParagraph(`SUB: OPENING OF CURRENT ACCOUNT IN THE NAME OF "${data.firmName}"`, {
    size: 9.5,
    bold: true,
    extraSpacing: 6,
  })

  b.drawParagraph(
    `We, the undersigned, being all the partners of "${data.firmName}", request you to open a Current Account in the name of the firm. A certified copy of the Partnership Deed dated ${data.executionDate} is enclosed herewith.`,
    { size: 9, extraSpacing: 6 }
  )

  b.drawParagraph(
    `ACCOUNT OPERATIONAL MANDATE: The account shall be operated: ${
      data.bankingSigningAuthority === 'any_partner'
        ? `singly by ANY ONE partner up to Rs. ${formatInrCurrency(data.bankingTransactionLimitSingle)}, and JOINTLY for higher amounts.`
        : 'JOINTLY by all partners.'
    }`,
    { size: 9, bold: true, extraSpacing: 14 }
  )

  b.drawParagraph('SPECIMEN SIGNATURES OF ALL PARTNERS:', { size: 9, bold: true, extraSpacing: 8 })
  data.partners.forEach(p => {
    b.drawParagraph(`Partner: ${p.name} (PAN: ${p.pan}) - Specimen Sign: _________________________`, {
      size: 8.5,
      indent: 8,
      extraSpacing: 6,
    })
  })

  return await b.finish()
}
