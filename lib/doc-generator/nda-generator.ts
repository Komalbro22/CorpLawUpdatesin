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
  ShadingType,
  Packer,
} from 'docx'
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { cleanText, safeTextRuns } from './docx-utils'

export type NdaType = 'unilateral' | 'mutual'

export type NdaRelationshipContext =
  | 'employee'
  | 'contractor'
  | 'business_discussion'
  | 'investor_pitch'
  | 'vendor'
  | 'other'

export interface NdaFormData {
  ndaType: NdaType
  relationshipContext: NdaRelationshipContext
  effectiveDate: string
  disclosingPartyName: string
  disclosingPartyType: 'company' | 'individual' | 'llp'
  disclosingPartyAddress: string
  disclosingPartyCin?: string
  disclosingSignatoryName: string
  disclosingSignatoryDesignation: string
  receivingPartyName: string
  receivingPartyType: 'company' | 'individual' | 'llp'
  receivingPartyAddress: string
  receivingPartyCin?: string
  receivingSignatoryName: string
  receivingSignatoryDesignation: string
  purposeOfDisclosure: string
  confidentialityPeriod: '2_years' | '3_years' | '5_years' | 'custom'
  customConfidentialityPeriod?: string
  governingState: string
  disputeResolution: 'arbitration' | 'courts'
  arbitrationCity?: string
  includeNonSolicit?: boolean
}

export const DEFAULT_SAMPLE_NDA_DATA: NdaFormData = {
  ndaType: 'mutual',
  relationshipContext: 'business_discussion',
  effectiveDate: '15th October 2026',
  disclosingPartyName: 'VERITAS TECHNOLOGIES PRIVATE LIMITED',
  disclosingPartyType: 'company',
  disclosingPartyAddress: 'Suite 402, Trade Centre, Bandra-Kurla Complex, Bandra (East), Mumbai - 400051, Maharashtra, India',
  disclosingPartyCin: 'U72900MH2021PTC123456',
  disclosingSignatoryName: 'Vikramaditya Singhania',
  disclosingSignatoryDesignation: 'Director',
  receivingPartyName: 'APEX DIGITAL INNOVATIONS PRIVATE LIMITED',
  receivingPartyType: 'company',
  receivingPartyAddress: 'Plot No. 12, Cyber City, DLF Phase 2, Gurugram - 122002, Haryana, India',
  receivingPartyCin: 'U74999HR2022PTC654321',
  receivingSignatoryName: 'Ananya Deshmukh',
  receivingSignatoryDesignation: 'Managing Director',
  purposeOfDisclosure: 'evaluating a potential strategic technological collaboration, joint product development, and software integration engagement',
  confidentialityPeriod: '3_years',
  customConfidentialityPeriod: '3 (Three) years',
  governingState: 'Maharashtra',
  disputeResolution: 'arbitration',
  arbitrationCity: 'Mumbai',
  includeNonSolicit: true,
}

export function getConfidentialityDurationLabel(data: NdaFormData): string {
  switch (data.confidentialityPeriod) {
    case '2_years':
      return '2 (Two) years'
    case '3_years':
      return '3 (Three) years'
    case '5_years':
      return '5 (Five) years'
    case 'custom':
      return data.customConfidentialityPeriod || '3 (Three) years'
    default:
      return '3 (Three) years'
  }
}

/**
 * Generates plain markdown for live preview in the browser
 */
export function generateNdaMarkdown(data: NdaFormData): string {
  const isMutual = data.ndaType === 'mutual'
  const durationText = getConfidentialityDurationLabel(data)
  const isCompanyA = data.disclosingPartyType === 'company'
  const isCompanyB = data.receivingPartyType === 'company'

  const partyATitle = isMutual ? 'PARTY OF THE FIRST PART ("DISCLOSING / RECEIVING PARTY")' : 'DISCLOSING PARTY'
  const partyBTitle = isMutual ? 'PARTY OF THE SECOND PART ("RECEIVING / DISCLOSING PARTY")' : 'RECEIVING PARTY'

  return `# NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

*(Executed in accordance with the Indian Contract Act, 1872)*

---

**THIS NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT** (the **"Agreement"**) is entered into and made effective as of **${data.effectiveDate}** (the **"Effective Date"**), by and between:

### 1. **${data.disclosingPartyName.toUpperCase()}**, ${
    isCompanyA
      ? `a company incorporated under the Companies Act with CIN: **${data.disclosingPartyCin || 'N/A'}**`
      : 'an entity / individual'
  }, having its registered office / principal address at:
> ${data.disclosingPartyAddress}  
*(acting through its authorized signatory, **${data.disclosingSignatoryName}**, ${data.disclosingSignatoryDesignation})*, hereinafter referred to as the **${partyATitle}** (which expression shall unless repugnant to the context include its successors and permitted assigns);

**AND**

### 2. **${data.receivingPartyName.toUpperCase()}**, ${
    isCompanyB
      ? `a company incorporated under the Companies Act with CIN: **${data.receivingPartyCin || 'N/A'}**`
      : 'an entity / individual'
  }, having its registered office / principal address at:
> ${data.receivingPartyAddress}  
*(acting through its authorized signatory, **${data.receivingSignatoryName}**, ${data.receivingSignatoryDesignation})*, hereinafter referred to as the **${partyBTitle}** (which expression shall unless repugnant to the context include its successors and permitted assigns).

*(The Disclosing Party and Receiving Party are hereinafter collectively referred to as the **"Parties"** and individually as a **"Party"**).*

---

### **RECITALS**

**WHEREAS:**
A. The Parties are desirous of exploring a potential relationship concerning **${data.purposeOfDisclosure}** (the **"Authorized Purpose"**).  
B. In connection with the Authorized Purpose, ${
    isMutual
      ? 'each Party may disclose to the other Party certain proprietary, sensitive, and confidential technical, financial, and business information.'
      : 'the Disclosing Party may disclose to the Receiving Party certain proprietary, confidential, and trade-secret technical and business information.'
  }  
C. The Parties wish to define the terms governing the use, disclosure, protection, and preservation of confidentiality of such proprietary information under the Indian Contract Act, 1872.

---

### **OPERATIVE TERMS & CONDITIONS**

#### **Clause 1: Definition of Confidential Information**
1.1 For purposes of this Agreement, **"Confidential Information"** means all non-public, proprietary, confidential, or sensitive information, whether oral, visual, electronic, or written, disclosed by the Disclosing Party to the Receiving Party, including but not limited to:
- Technical data, trade secrets, software code, source models, architecture schemas, APIs, algorithms, and research data;
- Business plans, customer lists, vendor agreements, pricing models, marketing strategies, and financial projections;
- Any documentation, analysis, compilations, or notes prepared by the Receiving Party containing or derived from such information;
- The fact that discussions are taking place between the Parties concerning the Authorized Purpose.

#### **Clause 2: Exclusions from Confidential Information**
2.1 Confidential Information shall NOT include information that the Receiving Party can prove by contemporaneous written records:
*(a)* is or becomes publicly available through no breach of this Agreement by the Receiving Party;  
*(b)* was already in the lawful possession of the Receiving Party prior to disclosure hereunder;  
*(c)* is rightfully received from a third party having no confidentiality obligation towards the Disclosing Party;  
*(d)* is independently developed by employees of the Receiving Party without access to or reliance upon the Disclosing Party's Confidential Information; or  
*(e)* is required to be disclosed pursuant to a valid judicial or statutory order of a court or regulatory authority in India (provided prompt written notice is given to the Disclosing Party to enable it to seek a protective order).

#### **Clause 3: Non-Disclosure & Standard of Care**
3.1 The Receiving Party agrees:
*(a)* To use Confidential Information **solely and strictly for the Authorized Purpose** and for no other commercial or competitive purpose;  
*(b)* To protect Confidential Information with the same degree of care it exercises for its own confidential assets of like importance, but in no event less than **reasonable care**;  
*(c)* To restrict access to its employees, directors, key consultants, and legal/financial advisors on a strict **"need-to-know"** basis, each bound by written confidentiality covenants at least as restrictive as this Agreement;  
*(d)* Not to reverse engineer, decompile, disassemble, or derive source code from any software prototypes or samples provided.

#### **Clause 4: Term & Survival of Confidentiality**
4.1 This Agreement shall commence on the Effective Date. The confidentiality, non-use, and non-disclosure obligations set forth herein shall survive and remain binding for a period of **${durationText}** from the date of disclosure of the relevant Confidential Information, or in perpetuity with respect to information qualifying as a trade secret under Indian jurisprudence.

#### **Clause 5: Return or Destruction of Materials**
5.1 Upon written request of the Disclosing Party or upon completion/termination of the Authorized Purpose, the Receiving Party shall within **fourteen (14) calendar days**:
*(a)* Promptly return all originals, copies, summaries, and extracts of Confidential Information; or  
*(b)* Permanently destroy and expunge all digital files, notes, and backup media containing Confidential Information, and deliver a written certificate of compliance signed by an executive officer.

#### **Clause 6: Intellectual Property Rights & No Licence**
6.1 All Confidential Information remains the exclusive, absolute property of the Disclosing Party. Nothing in this Agreement shall be construed as granting, by implication, estoppel, or otherwise, any licence, patent, trademark, copyright, or ownership right in the Confidential Information.

#### **Clause 7: Injunctive Relief & Remedies**
7.1 The Receiving Party acknowledges that monetary damages alone would be inadequate compensation for any unauthorized disclosure or use of Confidential Information. In the event of a breach or threatened breach, the Disclosing Party shall be entitled to seek **interim and permanent injunctive relief** and specific performance under the **Specific Relief Act, 1963**, without the necessity of proving actual damages or posting a bond, in addition to any other legal or equitable remedies available under law.

${
  data.includeNonSolicit
    ? `#### **Clause 8: Non-Solicitation Covenant**
8.1 During the term of this Agreement and for twelve (12) months thereafter, neither Party shall directly or indirectly solicit, induce, or attempt to hire any key technical, management, or executive employee of the other Party who was directly involved in discussions concerning the Authorized Purpose, save through bona fide general public advertisements.`
    : ''
}

#### **Clause ${data.includeNonSolicit ? '9' : '8'}: Governing Law & Dispute Resolution**
${
  data.disputeResolution === 'arbitration'
    ? `${data.includeNonSolicit ? '9' : '8'}.1 **Arbitration:** Any dispute, controversy, or claim arising out of or relating to this Agreement shall be referred to and finally resolved by confidential arbitration in accordance with the **Arbitration and Conciliation Act, 1996**. The arbitration shall be conducted by a **Sole Arbitrator** mutually appointed by the Parties. The seat and legal place of arbitration shall be **${
        data.arbitrationCity || 'Mumbai'
      }, ${data.governingState}**, India, and proceedings shall be in the English language.  
${data.includeNonSolicit ? '9' : '8'}.2 **Governing Law:** This Agreement shall be governed by, interpreted, and construed in accordance with the laws of the Republic of India.`
    : `${data.includeNonSolicit ? '9' : '8'}.1 **Court Jurisdiction:** This Agreement shall be governed by and construed in accordance with the substantive laws of India. The competent civil courts situated at **${
        data.arbitrationCity || 'Mumbai'
      }, ${data.governingState}** shall have exclusive jurisdiction over all matters arising hereunder.`
}

#### **Clause ${data.includeNonSolicit ? '10' : '9'}: Miscellaneous Provisions**
- **Section 27 Compliance:** The covenants herein are intended solely for the protection of legitimate trade secrets and shall not be construed as an unlawful restraint of trade under Section 27 of the Indian Contract Act, 1872.
- **IT Act & DPDP Compliance:** Disclosures involving digital sensitive data shall adhere to Section 43A and Section 72A of the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
- **Stamp Duty:** Non-judicial stamp duty under the relevant State Stamp Act shall be borne equally or as mutually agreed.
- **Counterparts:** This Agreement may be executed in counterparts and via electronic signature (valid under the IT Act, 2000).

---

### **SIGNATURES AND EXECUTION**

**IN WITNESS WHEREOF**, the Parties hereto have caused this Non-Disclosure Agreement to be duly executed by their authorized representatives as of the Effective Date written above.

| **FOR AND ON BEHALF OF:**<br>**${data.disclosingPartyName}** | **FOR AND ON BEHALF OF:**<br>**${data.receivingPartyName}** |
| :--- | :--- |
| <br><br>_________________________________________<br>**Name:** ${data.disclosingSignatoryName}<br>**Designation:** ${data.disclosingSignatoryDesignation}<br>**Date:** ${data.effectiveDate} | <br><br>_________________________________________<br>**Name:** ${data.receivingSignatoryName}<br>**Designation:** ${data.receivingSignatoryDesignation}<br>**Date:** ${data.effectiveDate} |

**WITNESSES:**

1. Signature: _________________________________  
   Name & Address: ___________________________

2. Signature: _________________________________  
   Name & Address: ___________________________
`
}

/**
 * Builds standard Microsoft Word (.docx) package
 */
export async function buildNdaDocx(data: NdaFormData = DEFAULT_SAMPLE_NDA_DATA): Promise<Buffer> {
  const FONT = 'Times New Roman'
  const durationText = getConfidentialityDurationLabel(data)
  const isMutual = data.ndaType === 'mutual'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          // Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT',
                bold: true,
                size: 26,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `(Governed under the Indian Contract Act, 1872 — ${isMutual ? 'Mutual / Bilateral' : 'One-Way / Unilateral'})`,
                italics: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),

          // Date & Preamble
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 180, line: 280 },
            children: [
              new TextRun({
                text: `THIS NON-DISCLOSURE AGREEMENT ("Agreement") is executed on this `,
                font: FONT,
                size: 22,
              }),
              new TextRun({
                text: `${cleanText(data.effectiveDate)} `,
                bold: true,
                font: FONT,
                size: 22,
              }),
              new TextRun({
                text: `("Effective Date") at ${cleanText(data.governingState)}, Republic of India, BY AND BETWEEN:`,
                font: FONT,
                size: 22,
              }),
            ],
          }),

          // Party A Block
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 140, line: 280 },
            children: [
              new TextRun({
                text: `1. ${cleanText(data.disclosingPartyName).toUpperCase()}`,
                bold: true,
                font: FONT,
                size: 22,
              }),
              new TextRun({
                text: `, having its registered / principal place of business at ${cleanText(data.disclosingPartyAddress)}${
                  data.disclosingPartyCin ? ` (CIN: ${cleanText(data.disclosingPartyCin)})` : ''
                }, acting through its authorized representative ${cleanText(data.disclosingSignatoryName)}, ${cleanText(
                  data.disclosingSignatoryDesignation
                )}, hereinafter referred to as the "DISCLOSING PARTY";`,
                font: FONT,
                size: 22,
              }),
            ],
          }),

          // AND
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [new TextRun({ text: 'AND', bold: true, font: FONT, size: 22 })],
          }),

          // Party B Block
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 280 },
            children: [
              new TextRun({
                text: `2. ${cleanText(data.receivingPartyName).toUpperCase()}`,
                bold: true,
                font: FONT,
                size: 22,
              }),
              new TextRun({
                text: `, having its registered / principal place of business at ${cleanText(data.receivingPartyAddress)}${
                  data.receivingPartyCin ? ` (CIN: ${cleanText(data.receivingPartyCin)})` : ''
                }, acting through its authorized representative ${cleanText(data.receivingSignatoryName)}, ${cleanText(
                  data.receivingSignatoryDesignation
                )}, hereinafter referred to as the "RECEIVING PARTY".`,
                font: FONT,
                size: 22,
              }),
            ],
          }),

          // Recitals Heading
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [new TextRun({ text: 'RECITALS:', bold: true, font: FONT, size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({
                text: `WHEREAS the Parties wish to evaluate a potential business arrangement relating to: "${cleanText(
                  data.purposeOfDisclosure
                )}" ("Authorized Purpose"); and in furtherance thereof, certain proprietary and confidential data will be disclosed under the protections of this Agreement.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Operative Clauses
          new Paragraph({
            spacing: { before: 140, after: 100 },
            children: [
              new TextRun({
                text: 'NOW, THEREFORE, IN CONSIDERATION OF THE MUTUAL COVENANTS CONTAINED HEREIN, THE PARTIES AGREE AS FOLLOWS:',
                bold: true,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 1
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '1. CONFIDENTIAL INFORMATION: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'Includes all technical data, software code, trade secrets, business plans, financials, pricing formulas, customer records, and operational know-how disclosed by Disclosing Party to Receiving Party, whether in writing, oral, or electronic format.',
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
              new TextRun({ text: '2. EXCLUSIONS: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'Confidential Information does not include information that is publicly known through no breach, was already known prior to receipt, is independently developed without reference to the disclosure, or is required to be disclosed by applicable Indian law or court order with prior written notice.',
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
              new TextRun({ text: '3. NON-DISCLOSURE OBLIGATIONS: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'Receiving Party agrees to exercise reasonable care to protect the confidentiality of such information, to use it solely for the Authorized Purpose, and to restrict disclosure strictly to employees and advisors with a need-to-know who are bound by written confidentiality agreements.',
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 4
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '4. TERM & SURVIVAL: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `The obligations of non-disclosure and non-use shall remain in effect during the evaluation and shall survive for a period of ${durationText} from the date of disclosure. Trade secrets shall be maintained confidential perpetually.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 5
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '5. RETURN OF MATERIALS: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'Upon written notice from the Disclosing Party, the Receiving Party shall promptly return or destroy all physical and digital copies of Confidential Information within fourteen (14) days and provide written certification of such destruction.',
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 6
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '6. INJUNCTIVE RELIEF: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: 'The Parties acknowledge that monetary damages are inadequate for any breach of confidentiality. The Disclosing Party shall be entitled to seek immediate injunctive relief and specific performance under the Specific Relief Act, 1963 in any court of competent jurisdiction.',
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Clause 7
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 280 },
            children: [
              new TextRun({ text: '7. GOVERNING LAW & JURISDICTION: ', bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `This Agreement shall be governed by the laws of India. ${
                  data.disputeResolution === 'arbitration'
                    ? `Disputes shall be finally settled by sole-arbitrator arbitration under the Arbitration & Conciliation Act, 1996 with seat at ${cleanText(
                        data.arbitrationCity || 'Mumbai'
                      )}, ${cleanText(data.governingState)}.`
                    : `The competent civil courts at ${cleanText(data.arbitrationCity || 'Mumbai')}, ${cleanText(
                        data.governingState
                      )} shall have exclusive jurisdiction.`
                }`,
                font: FONT,
                size: 21,
              }),
            ],
          }),

          // Signatures Section
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: 'IN WITNESS WHEREOF, the Parties have executed this Agreement:', bold: true, font: FONT, size: 21 })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `For ${cleanText(data.disclosingPartyName).toUpperCase()}:`, bold: true, font: FONT, size: 20 }),
                          new TextRun({ break: 3, text: '____________________________________', font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: `Name: ${cleanText(data.disclosingSignatoryName)}`, bold: true, font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: `Title: ${cleanText(data.disclosingSignatoryDesignation)}`, font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: `Date: ${cleanText(data.effectiveDate)}`, font: FONT, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `For ${cleanText(data.receivingPartyName).toUpperCase()}:`, bold: true, font: FONT, size: 20 }),
                          new TextRun({ break: 3, text: '____________________________________', font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: `Name: ${cleanText(data.receivingSignatoryName)}`, bold: true, font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: `Title: ${cleanText(data.receivingSignatoryDesignation)}`, font: FONT, size: 20 }),
                          new TextRun({ break: 1, text: `Date: ${cleanText(data.effectiveDate)}`, font: FONT, size: 20 }),
                        ],
                      }),
                    ],
                  }),
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
 * Builds standard PDF package using pdf-lib
 */
export async function buildNdaPdf(data: NdaFormData = DEFAULT_SAMPLE_NDA_DATA): Promise<Uint8Array> {
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

  const drawWrappedText = (
    text: string,
    font: PDFFont,
    size: number,
    lineHeight: number,
    color = rgb(0.1, 0.1, 0.1),
    indent = 0
  ) => {
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

  // Header Title
  const title = 'NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT'
  const titleW = fontBold.widthOfTextAtSize(title, 14)
  currentPage.drawText(title, { x: (pageWidth - titleW) / 2, y, size: 14, font: fontBold, color: rgb(0.05, 0.1, 0.2) })
  y -= 18

  const sub = `(Under Indian Contract Act, 1872 — ${data.ndaType === 'mutual' ? 'Mutual' : 'One-Way'})`
  const subW = fontItalic.widthOfTextAtSize(sub, 10)
  currentPage.drawText(sub, { x: (pageWidth - subW) / 2, y, size: 10, font: fontItalic, color: rgb(0.3, 0.3, 0.3) })
  y -= 22

  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.6, 0.1),
  })
  y -= 18

  // Body
  drawWrappedText(
    `THIS AGREEMENT is executed on ${data.effectiveDate} at ${data.governingState}, India, by and between:`,
    fontRegular,
    10,
    14
  )
  y -= 6

  drawWrappedText(
    `1. ${data.disclosingPartyName.toUpperCase()}, having registered office at ${data.disclosingPartyAddress}${
      data.disclosingPartyCin ? ` (CIN: ${data.disclosingPartyCin})` : ''
    }, represented by ${data.disclosingSignatoryName}, ${data.disclosingSignatoryDesignation} (the "Disclosing Party"); and`,
    fontRegular,
    9.5,
    13.5
  )
  y -= 4

  drawWrappedText(
    `2. ${data.receivingPartyName.toUpperCase()}, having registered office at ${data.receivingPartyAddress}${
      data.receivingPartyCin ? ` (CIN: ${data.receivingPartyCin})` : ''
    }, represented by ${data.receivingSignatoryName}, ${data.receivingSignatoryDesignation} (the "Receiving Party").`,
    fontRegular,
    9.5,
    13.5
  )
  y -= 10

  drawWrappedText(
    `WHEREAS Parties wish to evaluate: "${data.purposeOfDisclosure}" ("Authorized Purpose"), and agree as follows:`,
    fontItalic,
    9.5,
    13.5
  )
  y -= 12

  const clauses = [
    {
      title: '1. Confidential Information: ',
      text: 'Includes all technical, financial, code, client, trade-secret and business data disclosed whether oral, written, or electronic.',
    },
    {
      title: '2. Exclusions: ',
      text: 'Excludes info public without breach, already known, independently developed, or required by law/court order.',
    },
    {
      title: '3. Non-Disclosure & Care: ',
      text: 'Receiving Party shall use info solely for Authorized Purpose, exercise reasonable care, and restrict to need-to-know staff.',
    },
    {
      title: '4. Term & Survival: ',
      text: `Obligations remain binding for ${getConfidentialityDurationLabel(data)} from disclosure. Trade secrets survive perpetually.`,
    },
    {
      title: '5. Return of Materials: ',
      text: 'Within 14 days of written demand, Receiving Party shall return or destroy all copies and certify destruction.',
    },
    {
      title: '6. Injunctive Relief: ',
      text: 'Damages are recognized as inadequate. Disclosing Party may seek interim injunctive relief under Specific Relief Act, 1963.',
    },
    {
      title: '7. Dispute Resolution: ',
      text:
        data.disputeResolution === 'arbitration'
          ? `Settled by Sole Arbitrator under Arbitration & Conciliation Act, 1996 seated at ${data.arbitrationCity || 'Mumbai'}, ${data.governingState}.`
          : `Governed by Indian laws with exclusive jurisdiction of courts at ${data.arbitrationCity || 'Mumbai'}, ${data.governingState}.`,
    },
  ]

  for (const c of clauses) {
    checkNewPage(35)
    currentPage.drawText(c.title, { x: margin, y, size: 9.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
    const prefixW = fontBold.widthOfTextAtSize(c.title, 9.5)
    drawWrappedText(c.text, fontRegular, 9.5, 13.5, rgb(0.15, 0.15, 0.15), prefixW)
    y -= 4
  }

  // Signatures
  checkNewPage(120)
  y -= 16
  currentPage.drawText('IN WITNESS WHEREOF, the Parties have executed this Non-Disclosure Agreement:', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
  })
  y -= 25

  const colW = contentWidth / 2
  currentPage.drawText(`For ${data.disclosingPartyName.substring(0, 30)}:`, { x: margin, y, size: 9, font: fontBold })
  currentPage.drawText(`For ${data.receivingPartyName.substring(0, 30)}:`, { x: margin + colW, y, size: 9, font: fontBold })
  y -= 35

  currentPage.drawText('___________________________________', { x: margin, y, size: 9, font: fontRegular })
  currentPage.drawText('___________________________________', { x: margin + colW, y, size: 9, font: fontRegular })
  y -= 14

  currentPage.drawText(`Name: ${data.disclosingSignatoryName}`, { x: margin, y, size: 8.5, font: fontRegular })
  currentPage.drawText(`Name: ${data.receivingSignatoryName}`, { x: margin + colW, y, size: 8.5, font: fontRegular })
  y -= 12

  currentPage.drawText(`Designation: ${data.disclosingSignatoryDesignation}`, { x: margin, y, size: 8.5, font: fontRegular })
  currentPage.drawText(`Designation: ${data.receivingSignatoryDesignation}`, { x: margin + colW, y, size: 8.5, font: fontRegular })

  return await pdfDoc.save()
}
