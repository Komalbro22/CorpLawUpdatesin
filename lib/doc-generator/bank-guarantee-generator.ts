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

export type BankGuaranteeType = 'financial' | 'performance' | 'advance_payment'
export type GuaranteeNature = 'unconditional' | 'conditional'

export interface BankGuaranteeFormData {
  guaranteeType: BankGuaranteeType
  nature: GuaranteeNature
  bgNumber?: string
  applicantName: string
  applicantAddress: string
  applicantCin?: string
  beneficiaryName: string
  beneficiaryAddress: string
  beneficiaryType?: 'commercial' | 'government_public_works'
  bankName: string
  bankBranch: string
  bankAddress: string
  bankIfsc?: string
  amount: number
  amountWords: string
  underlyingContractRef: string
  contractDate: string
  validityFrom: string
  validityTo: string
  claimPeriodDate: string
  executionPlace: string
  signatory1Name: string
  signatory1Designation: string
  signatory1PaNumber?: string
  signatory2Name?: string
  signatory2Designation?: string
  signatory2PaNumber?: string
  customClauses?: Array<{
    id: string
    title: string
    text: string
    riskWarning?: string | null
  }>
}

export function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero Rupees Only'
  if (isNaN(num)) return ''

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const numToWords = (n: number): string => {
    let str = ''
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '')
    } else {
      str += a[n]
    }
    return str
  }

  const crores = Math.floor(num / 10000000)
  num %= 10000000
  const lakhs = Math.floor(num / 100000)
  num %= 100000
  const thousands = Math.floor(num / 1000)
  num %= 1000
  const hundreds = Math.floor(num / 100)
  const remainder = num % 100

  let res = ''
  if (crores > 0) res += numToWords(crores) + ' Crore '
  if (lakhs > 0) res += numToWords(lakhs) + ' Lakh '
  if (thousands > 0) res += numToWords(thousands) + ' Thousand '
  if (hundreds > 0) res += numToWords(hundreds) + ' Hundred '
  if (remainder > 0) {
    if (res !== '') res += 'and '
    res += numToWords(remainder) + ' '
  }

  return 'Rupees ' + res.trim() + ' Only'
}

/**
 * Computes Maharashtra Stamp Duty under Article 34A
 * (Maharashtra Stamp Fourth Amendment Act, 2026, w.e.f. 22 July 2026)
 */
export function calculateMaharashtraBgStampDuty(
  amount: number,
  isGovernmentWorks: boolean = false
): { duty: number; rule: string } {
  if (isGovernmentWorks) {
    return {
      duty: 500,
      rule: 'Flat ₹500 under Article 34A proviso (in favour of Government Corporation / Local Authority for public works / procurement).',
    }
  }

  if (amount <= 500000) {
    // 0.1% subject to minimum 500
    const calc = Math.round(amount * 0.001)
    const duty = Math.max(500, calc)
    return {
      duty,
      rule: `0.1% of ₹${amount.toLocaleString('en-IN')} (min ₹500) under Article 34A(a) = ₹${duty.toLocaleString('en-IN')}`,
    }
  }

  // Above 5 lakh: 0.3% subject to maximum 20 lakh
  const calc = Math.round(amount * 0.003)
  const duty = Math.min(2000000, calc)
  return {
    duty,
    rule: `0.3% of ₹${amount.toLocaleString('en-IN')} (max ₹20,00,000) under Article 34A(b) = ₹${duty.toLocaleString('en-IN')}`,
  }
}

export const DEFAULT_SAMPLE_BANK_GUARANTEE_DATA: BankGuaranteeFormData = {
  guaranteeType: 'performance',
  nature: 'unconditional',
  bgNumber: 'BG/2026/PUN/009845',
  applicantName: 'TITAN INFRASTRUCTURE PROJECTS PRIVATE LIMITED',
  applicantAddress: 'Plot 77, MIDC Industrial Area, Bhosari, Pune - 411026, Maharashtra, India',
  applicantCin: 'U45200PN2019PTC184512',
  beneficiaryName: 'MAHARASHTRA STATE ROAD DEVELOPMENT CORPORATION LIMITED',
  beneficiaryAddress: 'Nepean Sea Road, Priyadarshini Park, Mumbai - 400036, Maharashtra, India',
  beneficiaryType: 'government_public_works',
  bankName: 'STATE BANK OF INDIA',
  bankBranch: 'Specialized Commercial Branch, Pune Main',
  bankAddress: '14, Dr. Ambedkar Road, Camp, Pune - 411001, Maharashtra, India',
  bankIfsc: 'SBIN0000454',
  amount: 5000000,
  amountWords: 'Rupees Fifty Lakh Only',
  underlyingContractRef: 'Tender Notice No. MSRDC/ENG/EXP-04/2026 for Construction of Elevated Corridor',
  contractDate: '12th September 2026',
  validityFrom: '15th October 2026',
  validityTo: '14th October 2027',
  claimPeriodDate: '14th November 2027',
  executionPlace: 'Pune, Maharashtra',
  signatory1Name: 'Sanjay Deshpande',
  signatory1Designation: 'Assistant General Manager',
  signatory1PaNumber: 'PA No. 45182',
  signatory2Name: 'Kavita Iyer',
  signatory2Designation: 'Chief Manager (Credit)',
  signatory2PaNumber: 'PA No. 67219',
}

export function getBgTypeTitle(type: BankGuaranteeType): string {
  switch (type) {
    case 'financial':
      return 'FINANCIAL BANK GUARANTEE'
    case 'performance':
      return 'PERFORMANCE BANK GUARANTEE'
    case 'advance_payment':
      return 'ADVANCE PAYMENT BANK GUARANTEE'
    default:
      return 'BANK GUARANTEE'
  }
}

/**
 * Generates live browser markdown preview
 */
export function generateBankGuaranteeMarkdown(data: BankGuaranteeFormData): string {
  const title = getBgTypeTitle(data.guaranteeType)
  const isUnconditional = data.nature === 'unconditional'
  const isGovt = data.beneficiaryType === 'government_public_works'
  const stampCalc = calculateMaharashtraBgStampDuty(data.amount, isGovt)

  return `# ${data.bankName.toUpperCase()}
**Branch:** ${data.bankBranch}  
**Address:** ${data.bankAddress}  
**IFSC:** ${data.bankIfsc || 'N/A'}

---

**${title} (${isUnconditional ? 'UNCONDITIONAL / ON-DEMAND' : 'CONDITIONAL'})**

**Bank Guarantee No.:** ${data.bgNumber || 'BG/2026/AUTO'}  
**Date of Issue:** ${data.validityFrom}  
**Guarantee Amount:** ₹ ${data.amount.toLocaleString('en-IN')} (${data.amountWords})  
**Validity Period:** From **${data.validityFrom}** up to **${data.validityTo}**  
**Claim Expiry Date:** **${data.claimPeriodDate}**  
**Place of Execution:** ${data.executionPlace}

---

To,  
**${data.beneficiaryName.toUpperCase()}**  
${data.beneficiaryAddress}  
*(hereinafter referred to as the **"Beneficiary"**, which expression shall unless repugnant to the context include its successors and assigns)*

---

### **WHEREAS:**
A. **${data.applicantName.toUpperCase()}**, having registered office at ${data.applicantAddress}${
    data.applicantCin ? ` (CIN: ${data.applicantCin})` : ''
  } (hereinafter referred to as the **"Applicant / Contractor"**), has entered into an agreement / accepted Tender Letter of Award bearing reference **"${
    data.underlyingContractRef
  }"** dated **${data.contractDate}** with the Beneficiary.

B. Under the terms of the said contract, the Applicant is obligated to furnish an irrevocable and unconditional Bank Guarantee for an aggregate amount of **₹ ${data.amount.toLocaleString(
    'en-IN'
  )} (${data.amountWords})** as security for ${
    data.guaranteeType === 'performance'
      ? 'due and faithful performance of its contractual obligations.'
      : data.guaranteeType === 'advance_payment'
      ? 'mobilization and proper utilization of advance payments released by the Beneficiary.'
      : 'due repayment and financial security.'
  }

C. At the request of the Applicant, we, **${data.bankName}**, a scheduled commercial bank constituted under Indian banking laws, having our Branch at ${
    data.bankBranch
  } (hereinafter referred to as the **"Bank"** or **"Surety"**), do hereby undertake and guarantee as follows:

---

### **OPERATIVE GUARANTEE TERMS & CONDITIONS**

#### **1. Irrevocable & Unconditional Payment Undertaking**
1.1 We, the Bank, hereby irrevocably and unconditionally guarantee and undertake to pay to the Beneficiary on first written demand, without any demur, reservation, contest, or recourse, any sum or sums not exceeding in the aggregate **₹ ${data.amount.toLocaleString(
    'en-IN'
  )} (${data.amountWords})**.  
${
  isUnconditional
    ? `1.2 Any written demand made by the Beneficiary stating that the Applicant has defaulted or failed to fulfill its obligations under the Contract shall be conclusive, final, and binding on the Bank. The Bank shall NOT inquire into the merits, propriety, or legality of such demand, nor into any disputes pending before any court, tribunal, or arbitral forum between the Applicant and Beneficiary.`
    : `1.2 Payment shall be released upon receipt of a written claim accompanied by documentary proof evidencing the Applicant's default under the specific clauses of the underlying Contract.`
}

#### **2. Co-Extensive Nature & Independent Contract (Sections 126–128)**
2.1 This Guarantee is a contract of guarantee governed by **Sections 124–147 of the Indian Contract Act, 1872**. In accordance with established judicial precedents of the Supreme Court of India, this Bank Guarantee is an **independent, separate, and distinct contract** between the Bank and the Beneficiary.  
2.2 The liability of the Bank hereunder shall be absolute and shall not be discharged, impaired, or diminished by any variation in the terms of the underlying contract, time extensions granted to the Applicant, or forbearance shown by the Beneficiary.

#### **3. Invocation Procedure & Turnaround**
3.1 The Beneficiary may invoke this Guarantee by presenting a written claim / demand letter on its official letterhead, duly signed by an authorized signatory, delivered to the Bank at **${
    data.bankAddress
  }** on or before the **Claim Expiry Date (${data.claimPeriodDate})**.  
3.2 Upon receipt of a valid written demand conforming to the terms hereof, the Bank undertakes to remit the demanded sum directly to the designated bank account of the Beneficiary via RTGS / NEFT within **three (3) working days**.

#### **4. Validity and Claim Period (Strict Expiry Rule)**
4.1 This Guarantee shall remain in full force and effect from **${data.validityFrom}** up to **${
    data.validityTo
  }** (the **"Validity Period"**).  
4.2 **CRITICAL NOTICE:** Notwithstanding anything contained herein:
*(a)* Our total liability under this Bank Guarantee shall not exceed **₹ ${data.amount.toLocaleString('en-IN')} (${data.amountWords})**;  
*(b)* This Bank Guarantee is valid up to **${data.validityTo}**;  
*(c)* We are liable to pay the guaranteed amount or any part thereof only and strictly if we receive a written claim or demand at our branch counters on or before **${
    data.claimPeriodDate
  }**;  
*(d)* Unless a written demand or claim is presented to us on or before **${
    data.claimPeriodDate
  }**, all rights of the Beneficiary under this guarantee shall be forfeited and the Bank shall be fully released and discharged from all liabilities hereunder, whether the physical instrument is returned to us or not.

${
  data.customClauses && data.customClauses.length > 0
    ? data.customClauses
        .map(
          (c, idx) => `#### **Custom Clause ${idx + 1}: ${c.title}**
${c.text}
*[AI-Drafted Custom Clause — review before signing]*
`
        )
        .join('\n')
    : ''
}

#### **5. Governing Law & Stamp Duty**
5.1 This Guarantee shall be governed by and construed in accordance with the laws of India.  
5.2 **Stamp Duty Assessment:** Non-judicial stamp duty is paid under **Article 34A** of the Maharashtra Stamp Act (as amended by the Maharashtra Stamp (Fourth Amendment) Act, 2026, w.e.f. 22 July 2026) / relevant State Stamp Act at ${
    data.executionPlace
  }.  
*(Calculated Duty: ₹ ${stampCalc.duty.toLocaleString('en-IN')} &bull; ${stampCalc.rule})*

---

### **SIGNATURES AND BANK SEAL**

Dated this **${data.validityFrom}** at **${data.executionPlace}**.

**For and on behalf of ${data.bankName.toUpperCase()}**

| **SIGNATORY 1:** | **SIGNATORY 2 (IF REQUIRED BY BANK RULE):** |
| :--- | :--- |
| <br><br>_________________________________________<br>**Name:** ${data.signatory1Name}<br>**Designation:** ${data.signatory1Designation}<br>**PA No.:** ${data.signatory1PaNumber || 'N/A'}<br>**Branch:** ${data.bankBranch} | <br><br>_________________________________________<br>**Name:** ${data.signatory2Name || 'N/A'}<br>**Designation:** ${data.signatory2Designation || 'N/A'}<br>**PA No.:** ${data.signatory2PaNumber || 'N/A'}<br>**Bank Seal / Stamp** |
`
}

/**
 * Builds Word (.docx) document
 */
export async function buildBankGuaranteeDocx(data: BankGuaranteeFormData = DEFAULT_SAMPLE_BANK_GUARANTEE_DATA): Promise<Buffer> {
  const FONT = 'Times New Roman'
  const title = getBgTypeTitle(data.guaranteeType)
  const isUnconditional = data.nature === 'unconditional'
  const isGovt = data.beneficiaryType === 'government_public_works'
  const stampCalc = calculateMaharashtraBgStampDuty(data.amount, isGovt)

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          // Header Bank Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: cleanText(data.bankName).toUpperCase(), bold: true, size: 26, font: FONT }),
              new TextRun({ break: 1, text: `Branch: ${cleanText(data.bankBranch)}`, font: FONT, size: 19 }),
              new TextRun({ break: 1, text: cleanText(data.bankAddress), font: FONT, size: 18 }),
              new TextRun({ break: 1, text: `IFSC: ${cleanText(data.bankIfsc || 'N/A')}`, font: FONT, size: 18 }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: `${title} (${isUnconditional ? 'UNCONDITIONAL / ON-DEMAND' : 'CONDITIONAL'})`,
                bold: true,
                size: 22,
                font: FONT,
                underline: {},
              }),
            ],
          }),

          // Meta Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Bank Guarantee No: ', bold: true, font: FONT, size: 20 }),
                          new TextRun({ text: cleanText(data.bgNumber || 'BG/2026/AUTO'), font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: 'Date of Issue: ', bold: true, font: FONT, size: 20 }),
                          new TextRun({ text: cleanText(data.validityFrom), font: FONT, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Guarantee Amount: ', bold: true, font: FONT, size: 20 }),
                          new TextRun({ text: `INR ${data.amount.toLocaleString('en-IN')}`, bold: true, font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: 'Validity Up To: ', bold: true, font: FONT, size: 20 }),
                          new TextRun({ text: cleanText(data.validityTo), font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: 'Claim Expiry Date: ', bold: true, font: FONT, size: 20 }),
                          new TextRun({ text: cleanText(data.claimPeriodDate), bold: true, font: FONT, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Addressee
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'To,\n', font: FONT, size: 21 }),
              new TextRun({ text: `${cleanText(data.beneficiaryName).toUpperCase()}\n`, bold: true, font: FONT, size: 21 }),
              new TextRun({ text: `${cleanText(data.beneficiaryAddress)}`, font: FONT, size: 20 }),
            ],
          }),

          // Recitals
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: 'WHEREAS ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `${cleanText(data.applicantName).toUpperCase()} ("Applicant") has entered into a contract / tender award bearing reference "${cleanText(
                  data.underlyingContractRef
                )}" dated ${cleanText(data.contractDate)} with the Beneficiary; and has agreed to furnish a Bank Guarantee for `,
                font: FONT,
                size: 21,
              }),
              new TextRun({ text: `INR ${data.amount.toLocaleString('en-IN')} (${cleanText(data.amountWords)})`, bold: true, font: FONT, size: 21 }),
              new TextRun({ text: ` as security for the due fulfillment thereof.`, font: FONT, size: 21 }),
            ],
          }),

          // Clause 1
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '1. UNDERTAKING TO PAY ON DEMAND: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `We, ${cleanText(
                  data.bankName
                )}, do hereby irrevocably and unconditionally guarantee and undertake to pay to the Beneficiary on first written demand, without any demur or contest, an amount not exceeding INR ${data.amount.toLocaleString(
                  'en-IN'
                )} (${cleanText(
                  data.amountWords
                )}). The Bank shall not inquire into the merits of the dispute or any claim between the Applicant and Beneficiary.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 2
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '2. INDEPENDENT CONTRACT: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'This Guarantee is an independent tripartite contract under Sections 124–147 of the Indian Contract Act, 1872. The liability of the Bank shall not be impaired by any time extension or indulgence granted to the Applicant.',
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 3
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '3. INVOCATION & CLAIM PERIOD: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `A written demand stating that the Applicant has defaulted must be delivered to our counters on or before ${cleanText(
                  data.claimPeriodDate
                )}. Any demand received after said date shall be null and void, and the Bank shall be discharged from all obligations.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 4
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 280 },
            children: [
              new TextRun({ text: '4. STAMP DUTY COMPLIANCE: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `Duly stamped under Article 34A of the Maharashtra Stamp Act (effective 22 July 2026) / applicable State Stamp Act. Duty assessed: INR ${stampCalc.duty.toLocaleString(
                  'en-IN'
                )} (${stampCalc.rule}).`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Signature Block
          new Paragraph({
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: `For and on behalf of ${cleanText(data.bankName)}:`, bold: true, font: FONT, size: 21 }),
              new TextRun({ break: 3, text: '____________________________________', font: FONT, size: 21 }),
              new TextRun({ break: 1, text: cleanText(data.signatory1Name), bold: true, font: FONT, size: 21 }),
              new TextRun({ break: 1, text: `${cleanText(data.signatory1Designation)} (${cleanText(data.signatory1PaNumber || 'PA No.')})`, font: FONT, size: 20 }),
              new TextRun({ break: 1, text: `Date: ${cleanText(data.validityFrom)} | Place: ${cleanText(data.executionPlace)}`, font: FONT, size: 20 }),
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
export async function buildBankGuaranteePdf(data: BankGuaranteeFormData = DEFAULT_SAMPLE_BANK_GUARANTEE_DATA): Promise<Uint8Array> {
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

  // Header Bank Name
  const bankTitle = data.bankName.toUpperCase()
  const bankW = fontBold.widthOfTextAtSize(bankTitle, 13)
  currentPage.drawText(bankTitle, { x: (pageWidth - bankW) / 2, y, size: 13, font: fontBold, color: rgb(0.05, 0.1, 0.25) })
  y -= 14

  const branchLine = `Branch: ${data.bankBranch} | IFSC: ${data.bankIfsc || 'N/A'}`
  const branchW = fontRegular.widthOfTextAtSize(branchLine, 8.5)
  currentPage.drawText(branchLine, { x: (pageWidth - branchW) / 2, y, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) })
  y -= 16

  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.6, 0.4, 0.8),
  })
  y -= 16

  // Title
  const title = `${getBgTypeTitle(data.guaranteeType)} (${data.nature === 'unconditional' ? 'ON-DEMAND' : 'CONDITIONAL'})`
  const titleW = fontBold.widthOfTextAtSize(title, 11)
  currentPage.drawText(title, { x: (pageWidth - titleW) / 2, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  y -= 18

  drawWrapped(`BG No: ${data.bgNumber || 'BG/2026/AUTO'} | Date: ${data.validityFrom}`, fontBold, 9.5, 13)
  drawWrapped(`Amount: INR ${data.amount.toLocaleString('en-IN')} (${data.amountWords})`, fontBold, 9.5, 13)
  drawWrapped(`Validity: ${data.validityFrom} to ${data.validityTo} | Claim Expiry: ${data.claimPeriodDate}`, fontBold, 9, 13, rgb(0.6, 0.1, 0.1))
  y -= 6

  drawWrapped(`To: ${data.beneficiaryName.toUpperCase()}`, fontBold, 9.5, 13)
  drawWrapped(`Address: ${data.beneficiaryAddress}`, fontRegular, 8.5, 12)
  y -= 8

  drawWrapped(
    `WHEREAS ${data.applicantName.toUpperCase()} ("Applicant") has contracted under "${data.underlyingContractRef}" dated ${data.contractDate} and must furnish a guarantee of INR ${data.amount.toLocaleString(
      'en-IN'
    )}:`,
    fontRegular,
    9,
    13
  )
  y -= 6

  const items = [
    {
      title: '1. On-Demand Undertaking: ',
      text: `We, ${data.bankName}, irrevocably guarantee to pay the Beneficiary on first written demand without demur up to INR ${data.amount.toLocaleString(
        'en-IN'
      )}. The Bank shall not inquire into the commercial dispute.`,
    },
    {
      title: '2. Tripartite Contract: ',
      text: 'Governed by Sections 124–147 Indian Contract Act, 1872. Independent from underlying contract. Liability not affected by time extensions.',
    },
    {
      title: '3. Claim Period: ',
      text: `Demand must be received at our counter on or before ${data.claimPeriodDate}. After this date, guarantee expires and Bank is fully released.`,
    },
    {
      title: '4. Stamp Duty: ',
      text: `Stamped under Article 34A Maharashtra Stamp Act (effective 22 July 2026) / State Stamp Act at ${data.executionPlace}.`,
    },
  ]

  for (const item of items) {
    checkNewPage(32)
    currentPage.drawText(item.title, { x: margin, y, size: 9, font: fontBold })
    const w = fontBold.widthOfTextAtSize(item.title, 9)
    drawWrapped(item.text, fontRegular, 9, 12.5, rgb(0.15, 0.15, 0.15), w)
    y -= 3
  }

  // Signatures
  checkNewPage(90)
  y -= 14
  currentPage.drawText(`For ${data.bankName.substring(0, 40)}:`, { x: margin, y, size: 8.5, font: fontBold })
  y -= 25
  currentPage.drawText('___________________________________', { x: margin, y, size: 8.5, font: fontRegular })
  y -= 12
  currentPage.drawText(`${data.signatory1Name} (${data.signatory1Designation})`, { x: margin, y, size: 8.5, font: fontRegular })
  currentPage.drawText(`Date: ${data.validityFrom} | Place: ${data.executionPlace}`, { x: margin, y: y - 10, size: 8, font: fontRegular })

  return await pdfDoc.save()
}
