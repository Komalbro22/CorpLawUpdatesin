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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { cleanText } from './docx-utils'

export type PoaType = 'General Power of Attorney' | 'Special Power of Attorney'
export type PoaRevocability = 'Revocable' | 'Irrevocable (Coupled with Interest — Sec 202)'

export interface PoaFormData {
  poaType: PoaType
  revocability: PoaRevocability
  executionDate: string
  executionCity: string
  executionState: string

  // Principal (Grantor)
  principalName: string
  principalFatherOrSpouse: string
  principalAge: string
  principalAddress: string
  principalPan?: string
  principalAadhaar?: string
  isNri: boolean
  nriCountry?: string

  // Attorney (Agent / Grantee)
  attorneyName: string
  attorneyFatherOrSpouse: string
  attorneyAge: string
  attorneyAddress: string
  attorneyRelationship: string
  attorneyPan?: string
  attorneyAadhaar?: string

  // Powers Granted
  powerBankAccounts: boolean
  powerProperty: boolean
  powerTaxAuthorities: boolean
  powerLitigation: boolean
  powerRegistration: boolean
  powerMoneys: boolean
  otherPowers?: string

  // Property details (if powerProperty is selected)
  propertySurveyOrFlatNo?: string
  propertyBuilding?: string
  propertyStreet?: string
  propertyCity?: string
  propertyState?: string
  propertyArea?: string

  // Duration
  durationMode: 'Until Revoked in Writing' | 'Fixed Period'
  validUntilDate?: string

  // Custom Clauses
  customClauses?: Array<{
    id: string
    title: string
    text: string
    riskWarning?: string | null
  }>
}

export const DEFAULT_SAMPLE_POA_DATA: PoaFormData = {
  poaType: 'General Power of Attorney',
  revocability: 'Revocable',
  executionDate: '15th October 2026',
  executionCity: 'Mumbai',
  executionState: 'Maharashtra',

  principalName: 'Devendra Chandrakant Patil',
  principalFatherOrSpouse: 'Late Chandrakant Patil',
  principalAge: '62',
  principalAddress: 'Flat 1201, Imperial Heights, Senapati Bapat Marg, Lower Parel, Mumbai - 400013, Maharashtra',
  principalPan: 'ABCDE9876K',
  principalAadhaar: 'XXXX-XXXX-3344',
  isNri: false,
  nriCountry: '',

  attorneyName: 'Aditya Devendra Patil',
  attorneyFatherOrSpouse: 'Devendra Chandrakant Patil',
  attorneyAge: '34',
  attorneyAddress: 'Flat 1201, Imperial Heights, Senapati Bapat Marg, Lower Parel, Mumbai - 400013, Maharashtra',
  attorneyRelationship: 'Son',
  attorneyPan: 'XYZPA5432M',
  attorneyAadhaar: 'XXXX-XXXX-7788',

  powerBankAccounts: true,
  powerProperty: true,
  powerTaxAuthorities: true,
  powerLitigation: true,
  powerRegistration: true,
  powerMoneys: true,
  otherPowers: 'Power to represent before municipal ward office for property tax assessment and water meter renewal.',

  propertySurveyOrFlatNo: 'Commercial Unit No. 302, 3rd Floor',
  propertyBuilding: 'Trade Tower Co-op Society Ltd.',
  propertyStreet: 'Kalyani Nagar',
  propertyCity: 'Pune',
  propertyState: 'Maharashtra',
  propertyArea: '1,250 sq. ft. Built-up Area',

  durationMode: 'Until Revoked in Writing',
  validUntilDate: '',

  customClauses: [],
}

export function generatePoaMarkdown(data: PoaFormData): string {
  const isSpa = data.poaType === 'Special Power of Attorney'
  const docTitle = isSpa ? 'SPECIAL POWER OF ATTORNEY' : 'GENERAL POWER OF ATTORNEY'

  let clauseIndex = 1

  let md = `# ${docTitle}\n`
  md += `*(Governed by the Powers of Attorney Act, 1882 & Sections 182–238 of the Indian Contract Act, 1872)*\n\n`
  md += `**Classification:** ${data.poaType} | **Nature:** ${data.revocability}  \n`
  md += `**Execution Date:** ${data.executionDate}  \n`
  md += `**Place of Execution:** ${data.executionCity}, ${data.executionState}, India\n\n`
  md += `---\n\n`

  md += `### PRINCIPAL (GRANTOR OF POWER)\n\n`
  md += `**KNOW ALL MEN BY THESE PRESENTS THAT I,**  \n`
  md += `**Name:** ${data.principalName}, Age: approx. ${data.principalAge} years, S/o or W/o: ${data.principalFatherOrSpouse}.  \n`
  md += `**Residential Address:** ${data.principalAddress}  \n`
  if (data.principalPan) md += `**PAN:** \`${data.principalPan}\`  `
  if (data.principalAadhaar) md += `| **Aadhaar:** \`${data.principalAadhaar}\``
  if (data.isNri) {
    md += `\n**Residency Status:** Non-Resident Indian (NRI), residing in ${data.nriCountry || 'Abroad'}.  \n`
    md += `*(Note: Executed pursuant to Section 18 of the Indian Stamp Act, 1899 — to be stamped within 3 months of receipt in India.)*\n`
  }
  md += `\n*(hereinafter referred to as the **"PRINCIPAL"**, which expression shall unless repugnant to the context include my heirs, executors, and legal representatives of the ONE PART).*\n\n`

  md += `### ATTORNEY (AGENT / GRANTEE OF POWER)\n\n`
  md += `**DO HEREBY APPOINT, NOMINATE, AND CONSTITUTE:**  \n`
  md += `**Name:** ${data.attorneyName}, Age: approx. ${data.attorneyAge} years, S/o or W/o: ${data.attorneyFatherOrSpouse}.  \n`
  md += `**Address:** ${data.attorneyAddress}  \n`
  md += `**Relationship with Principal:** ${data.attorneyRelationship}  \n`
  if (data.attorneyPan) md += `**PAN:** \`${data.attorneyPan}\`  `
  if (data.attorneyAadhaar) md += `| **Aadhaar:** \`${data.attorneyAadhaar}\``
  md += `\n*(hereinafter referred to as the **"ATTORNEY"**, which expression shall unless repugnant to the context include their legal representatives of the OTHER PART).*\n\n`

  md += `### PREAMBLE & APPOINTMENT RECITALS\n\n`
  md += `WHEREAS the Principal is presently preoccupied with personal/professional engagements and is unable to personally attend to various legal, administrative, and proprietary affairs at ${data.executionCity} and elsewhere in India;  \n`
  md += `AND WHEREAS the Principal reposes absolute trust and confidence in the said Attorney, being the Principal's ${data.attorneyRelationship}, and has agreed to confer upon the Attorney the powers set forth herein.\n\n`

  if (data.powerProperty && data.propertySurveyOrFlatNo) {
    md += `### SCHEDULE OF IMMOVABLE PROPERTY\n\n`
    md += `- **Premise / Plot:** ${data.propertySurveyOrFlatNo}, ${data.propertyBuilding || ''}\n`
    md += `- **Location:** ${data.propertyStreet || ''}, ${data.propertyCity || ''}, ${data.propertyState || ''}\n`
    md += `- **Built-up / Plot Area:** ${data.propertyArea || 'As per title deeds'}\n\n`
  }

  md += `---\n\n`
  md += `### POWERS AND AUTHORITIES CONFERRED\n\n`
  md += `NOW KNOW YE AND THESE PRESENTS WITNESS that the Principal hereby authorizes, empowers, and directs the Attorney to do, execute, and perform all or any of the following acts, deeds, and things in the name and on behalf of the Principal:\n\n`

  // 1. Banking
  if (data.powerBankAccounts) {
    md += `**${clauseIndex++}. BANKING & FINANCIAL TRANSACTIONS:**  \n`
    md += `To operate, manage, and draw upon any bank accounts, savings accounts, current accounts, or fixed deposits held in the name of the Principal; to sign cheques, withdraw cash, issue pay orders, endorse negotiable instruments, and execute RTGS/NEFT payment instructions.\n\n`
  }

  // 2. Property
  if (data.powerProperty) {
    md += `**${clauseIndex++}. MANAGEMENT & LETTING OF IMMOVABLE PROPERTY:**  \n`
    md += `To manage, supervise, oversee, and let out on lease or leave and license basis the Scheduled Property; to execute rental agreements, receive monthly rents and security deposits, issue receipts, and terminate tenancy or license agreements.\n\n`
  }

  // 3. Tax & Government
  if (data.powerTaxAuthorities) {
    md += `**${clauseIndex++}. REPRESENTATION BEFORE REVENUE & STATUTORY BODIES:**  \n`
    md += `To represent the Principal before the Income Tax Department, GST authorities, Municipal Corporations, Revenue Officers, Registrar of Companies, and other statutory or government bodies; to sign and file returns, replies, declarations, and applications.\n\n`
  }

  // 4. Litigation
  if (data.powerLitigation) {
    md += `**${clauseIndex++}. LEGAL PROCEEDINGS & ADVOCATE ENGAGEMENT:**  \n`
    md += `To institute, prosecute, defend, compromise, or settle any civil, criminal, revenue, or arbitration proceedings; to sign plaints, written statements, affidavits, and vakalatnamas; and to engage Advocates, Solicitors, and Senior Counsel.\n\n`
  }

  // 5. Registration
  if (data.powerRegistration) {
    md += `**${clauseIndex++}. EXECUTION AND REGISTRATION OF DEEDS:**  \n`
    md += `To present, execute, sign, and admit the execution of deeds, instruments, agreements, or releases before any Sub-Registrar of Assurances or Registrar having jurisdiction, and to receive back registered original documents.\n\n`
  }

  // 6. Moneys
  if (data.powerMoneys) {
    md += `**${clauseIndex++}. RECEIPT OF MONEYS AND DISCHARGES:**  \n`
    md += `To demand, sue for, recover, and receive all debts, sums of money, securities, dividends, and dues owing to the Principal, and to give valid and binding receipts and full discharges for the same.\n\n`
  }

  // Other bespoke powers
  if (data.otherPowers && data.otherPowers.trim()) {
    md += `**${clauseIndex++}. ADDITIONAL SPECIFIC POWERS:**  \n`
    md += `${data.otherPowers.trim()}\n\n`
  }

  // Statutory Suraj Lamp Callout
  md += `> **STATUTORY NOTICE (Suraj Lamp & Industries v. State of Haryana, 2011 SC):**  \n`
  md += `> This Power of Attorney confers agency authority only and does NOT convey, transfer, or create any proprietary title or ownership in immovable property. Transfer of title requires a registered conveyance deed under Section 54 of the Transfer of Property Act, 1882.\n\n`

  // Custom Clauses
  if (data.customClauses && data.customClauses.length > 0) {
    for (const c of data.customClauses) {
      md += `**${clauseIndex++}. ${c.title.toUpperCase()}** *(Custom Clause)*:  \n`
      md += `${c.text}\n`
      md += `*[AI-Drafted Custom Clause — review before signing]*\n\n`
    }
  }

  // Duration & Revocability
  md += `**${clauseIndex++}. DURATION AND REVOCATION:**  \n`
  if (data.revocability.includes('Irrevocable')) {
    md += `This agency is irrevocable under Section 202 of the Indian Contract Act, 1872, as the Attorney has an interest in the property/subject-matter forming consideration of this grant.\n\n`
  } else {
    md += `This Power of Attorney is revocable at the will of the Principal by executing a deed of revocation and serving written notice upon the Attorney. It shall remain valid ${
      data.durationMode === 'Fixed Period' && data.validUntilDate
        ? `until ${data.validUntilDate}`
        : 'until explicitly revoked in writing by the Principal'
    }.\n\n`
  }

  // Ratification clause
  md += `**${clauseIndex++}. RATIFICATION COVENANT:**  \n`
  md += `AND the Principal hereby agrees and undertakes to ratify, confirm, and validate all lawful acts, deeds, and things whatsoever which the said Attorney shall lawfully do or cause to be done in and about the premises by virtue of these presents.\n\n`

  md += `---\n\n`
  md += `### SIGNATURE AND EXECUTION BLOCK\n\n`
  md += `IN WITNESS WHEREOF, the Principal has signed and set their hand to these presents on the day, month, and year first written above.\n\n`

  md += `| **PRINCIPAL (GRANTOR)** | **SPECIMEN SIGNATURE OF ATTORNEY (GRANTEE)** |\n`
  md += `|:---|:---|\n`
  md += `| **Signature:** __________________________ | **Signature:** __________________________ |\n`
  md += `| **Name:** ${data.principalName} | **Name:** ${data.attorneyName} |\n`
  md += `| **Date:** ${data.executionDate} | **Date:** ${data.executionDate} |\n`
  md += `| **Place:** ${data.executionCity} | **Place:** ${data.executionCity} |\n\n`

  md += `**WITNESSES TO EXECUTION:**\n\n`
  md += `1. **Witness 1:**  \n`
  md += `Signature: __________________________  \n`
  md += `Name: _______________________________  \n`
  md += `Address: ____________________________  \n\n`
  md += `2. **Witness 2:**  \n`
  md += `Signature: __________________________  \n`
  md += `Name: _______________________________  \n`
  md += `Address: ____________________________  \n\n`

  md += `### NOTARIAL / REGISTRATION ATTESTATION\n\n`
  md += `*(To be attested by a Notary Public or registered before the Sub-Registrar of Assurances)*  \n`
  md += `Signed, sealed, and delivered before me by the above-named Principal who is personally known to me / identified by the witnesses.\n\n`
  md += `**Notary Public / Sub-Registrar Seal & Signature:** __________________________  \n`
  md += `**Notarial Registration No.:** ____________________ **Date:** ____________________\n`

  return md
}

export async function buildPoaDocx(data: PoaFormData): Promise<Buffer> {
  const isSpa = data.poaType === 'Special Power of Attorney'
  const docTitle = isSpa ? 'SPECIAL POWER OF ATTORNEY' : 'GENERAL POWER OF ATTORNEY'
  const FONT = 'Arial'

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  }

  let clauseIndex = 1

  const children: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `[TO BE EXECUTED ON NON-JUDICIAL STAMP PAPER OR E-STAMP AS PER ${data.executionState.toUpperCase()} STAMP ACT]`,
          bold: true,
          font: FONT,
          size: 18,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: docTitle,
          bold: true,
          font: FONT,
          size: 28,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: `(Under the Powers of Attorney Act, 1882 & Sections 182-238 of the Indian Contract Act, 1872 — ${data.revocability})`,
          italics: true,
          font: FONT,
          size: 20,
          color: '475569',
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120, line: 280 },
      children: [
        new TextRun({
          text: `KNOW ALL MEN BY THESE PRESENTS THAT I, ${cleanText(data.principalName).toUpperCase()}`,
          bold: true,
          font: FONT,
          size: 21,
        }),
        new TextRun({
          text: `, Age: approx. ${cleanText(data.principalAge)} years, S/o or W/o: ${cleanText(
            data.principalFatherOrSpouse
          )}, residing at: ${cleanText(data.principalAddress)}${
            data.principalPan ? ` [PAN: ${cleanText(data.principalPan)}]` : ''
          }${data.principalAadhaar ? ` [Aadhaar: ${cleanText(data.principalAadhaar)}]` : ''}${
            data.isNri ? ` (NRI residing in ${cleanText(data.nriCountry || 'Abroad')})` : ''
          } (hereinafter called the "PRINCIPAL"),`,
          font: FONT,
          size: 21,
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 140, line: 280 },
      children: [
        new TextRun({
          text: `DO HEREBY APPOINT, NOMINATE AND CONSTITUTE: ${cleanText(data.attorneyName).toUpperCase()}`,
          bold: true,
          font: FONT,
          size: 21,
        }),
        new TextRun({
          text: `, Age: approx. ${cleanText(data.attorneyAge)} years, S/o or W/o: ${cleanText(
            data.attorneyFatherOrSpouse
          )}, residing at: ${cleanText(data.attorneyAddress)}, being my ${cleanText(
            data.attorneyRelationship
          )}${data.attorneyPan ? ` [PAN: ${cleanText(data.attorneyPan)}]` : ''} (hereinafter called the "ATTORNEY"), to act as my true and lawful attorney in my name and on my behalf.`,
          font: FONT,
          size: 21,
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 100, after: 80 },
      children: [
        new TextRun({
          text: 'POWERS AND AUTHORITIES CONFERRED:',
          bold: true,
          font: FONT,
          size: 22,
        }),
      ],
    }),
  ]

  if (data.powerBankAccounts) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100, line: 280 },
        children: [
          new TextRun({ text: `${clauseIndex++}. BANKING OPERATIONS: `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: 'To operate all bank accounts, sign cheques, withdraw moneys, deposit instruments, and manage deposits held in the Principal’s name.',
            font: FONT,
            size: 21,
          }),
        ],
      })
    )
  }

  if (data.powerProperty) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100, line: 280 },
        children: [
          new TextRun({ text: `${clauseIndex++}. PROPERTY MANAGEMENT: `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `To manage, let out, and supervise the premises situated at: ${cleanText(
              data.propertySurveyOrFlatNo
            )}, ${cleanText(data.propertyBuilding)}, ${cleanText(data.propertyCity)}; execute lease deeds and collect rents.`,
            font: FONT,
            size: 21,
          }),
        ],
      })
    )
  }

  if (data.powerTaxAuthorities) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100, line: 280 },
        children: [
          new TextRun({ text: `${clauseIndex++}. REVENUE AUTHORITIES: `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: 'To represent before Income Tax, GST, Municipal, and governmental departments; sign returns and applications.',
            font: FONT,
            size: 21,
          }),
        ],
      })
    )
  }

  if (data.powerLitigation) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100, line: 280 },
        children: [
          new TextRun({ text: `${clauseIndex++}. LITIGATION & ADVOCATES: `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: 'To institute, defend, sign plaints, affidavits, compromise suits, and engage Advocates in all competent courts.',
            font: FONT,
            size: 21,
          }),
        ],
      })
    )
  }

  if (data.powerRegistration) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100, line: 280 },
        children: [
          new TextRun({ text: `${clauseIndex++}. REGISTRATION OF DOCUMENTS: `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: 'To present deeds, admit execution, and complete formalities before the Sub-Registrar of Assurances.',
            font: FONT,
            size: 21,
          }),
        ],
      })
    )
  }

  if (data.powerMoneys) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100, line: 280 },
        children: [
          new TextRun({ text: `${clauseIndex++}. MONEY RECOVERY & RECEIPTS: `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: 'To demand, collect, and give valid discharges and receipts for all moneys, debts, and claims.',
            font: FONT,
            size: 21,
          }),
        ],
      })
    )
  }

  // Suraj Lamp statutory callout
  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 80, after: 100, line: 280 },
      children: [
        new TextRun({
          text: 'STATUTORY NOTICE (Suraj Lamp, 2011 SC): ',
          bold: true,
          font: FONT,
          size: 20,
          color: 'B91C1C',
        }),
        new TextRun({
          text: 'This Power of Attorney creates agency authority only and does not transfer title to immovable property. Title passes solely through registered conveyance.',
          italics: true,
          font: FONT,
          size: 20,
          color: '7F1D1D',
        }),
      ],
    })
  )

  // Custom Clauses
  if (data.customClauses && data.customClauses.length > 0) {
    for (const c of data.customClauses) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 100, line: 280 },
          children: [
            new TextRun({
              text: `${clauseIndex++}. ${cleanText(c.title).toUpperCase()}: `,
              bold: true,
              font: FONT,
              size: 21,
            }),
            new TextRun({
              text: cleanText(c.text),
              font: FONT,
              size: 21,
            }),
            new TextRun({
              text: ' [AI-Drafted Custom Clause — review before signing]',
              italics: true,
              font: FONT,
              size: 18,
              color: '888888',
            }),
          ],
        })
      )
    }
  }

  // Ratification
  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 140, line: 280 },
      children: [
        new TextRun({ text: `${clauseIndex++}. RATIFICATION: `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: 'The Principal undertakes to ratify and confirm all lawful acts done by the Attorney pursuant to these presents.',
          font: FONT,
          size: 21,
        }),
      ],
    }),

    // Signatures Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: borderNone,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'PRINCIPAL (GRANTOR)', bold: true, font: FONT, size: 20 })],
                }),
                new Paragraph({
                  spacing: { before: 240 },
                  children: [new TextRun({ text: '_______________________________', font: FONT })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Name: ${cleanText(data.principalName)}`, font: FONT, size: 19 })],
                }),
              ],
            }),
            new TableCell({
              borders: borderNone,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'SPECIMEN SIGNATURE OF ATTORNEY', bold: true, font: FONT, size: 20 })],
                }),
                new Paragraph({
                  spacing: { before: 240 },
                  children: [new TextRun({ text: '_______________________________', font: FONT })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Name: ${cleanText(data.attorneyName)}`, font: FONT, size: 19 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 180, after: 60 },
      children: [new TextRun({ text: 'WITNESSES:', bold: true, font: FONT, size: 20 })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '1. Name & Address: _____________________________________________________ Signature: _________________',
          font: FONT,
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 80 },
      children: [
        new TextRun({
          text: '2. Name & Address: _____________________________________________________ Signature: _________________',
          font: FONT,
          size: 18,
        }),
      ],
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        children,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

export async function buildPoaPdf(data: PoaFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  let currentPage = pdfDoc.addPage([595.28, 841.89])
  const { width: pageWidth, height: pageHeight } = currentPage.getSize()
  const margin = 45
  const contentWidth = pageWidth - margin * 2
  let y = pageHeight - margin

  const isSpa = data.poaType === 'Special Power of Attorney'
  const title = isSpa ? 'SPECIAL POWER OF ATTORNEY' : 'GENERAL POWER OF ATTORNEY'

  const checkNewPage = (neededSpace: number) => {
    if (y - neededSpace < margin) {
      currentPage = pdfDoc.addPage([595.28, 841.89])
      y = pageHeight - margin
    }
  }

  const drawWrapped = (
    text: string,
    font: any,
    size: number,
    lineHeight: number,
    color = rgb(0.1, 0.1, 0.1),
    indent = 0
  ) => {
    const clean = text.replace(/[\r\n]+/g, ' ').trim()
    const words = clean.split(' ')
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

  // Title
  const titleW = fontBold.widthOfTextAtSize(title, 13)
  currentPage.drawText(title, {
    x: (pageWidth - titleW) / 2,
    y,
    size: 13,
    font: fontBold,
    color: rgb(0.05, 0.1, 0.2),
  })
  y -= 16

  const sub = `(Under Powers of Attorney Act, 1882 & Indian Contract Act, 1872 — ${data.revocability})`
  const subW = fontItalic.widthOfTextAtSize(sub, 9.5)
  currentPage.drawText(sub, {
    x: (pageWidth - subW) / 2,
    y,
    size: 9.5,
    font: fontItalic,
    color: rgb(0.35, 0.35, 0.35),
  })
  y -= 18

  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.6, 0.1),
  })
  y -= 16

  drawWrapped(
    `KNOW ALL MEN BY THESE PRESENTS that I, ${data.principalName.toUpperCase()}, Age: ${
      data.principalAge
    } yrs, S/o or W/o: ${data.principalFatherOrSpouse}, residing at ${data.principalAddress}${
      data.isNri ? ` (NRI in ${data.nriCountry || 'Abroad'})` : ''
    } ("PRINCIPAL"),`,
    fontRegular,
    9.5,
    13.5
  )
  y -= 4

  drawWrapped(
    `DO HEREBY CONSTITUTE AND APPOINT: ${data.attorneyName.toUpperCase()}, Age: ${
      data.attorneyAge
    } yrs, S/o or W/o: ${data.attorneyFatherOrSpouse}, residing at ${data.attorneyAddress}, being my ${
      data.attorneyRelationship
    } ("ATTORNEY"), to act as my true and lawful attorney for the following matters:`,
    fontRegular,
    9.5,
    13.5
  )
  y -= 8

  const powers: string[] = []
  if (data.powerBankAccounts)
    powers.push('1. Banking Operations: Operate bank accounts, sign cheques, manage FDs, and handle transfers.')
  if (data.powerProperty)
    powers.push(
      `2. Property Management: Manage and let out premise at ${data.propertySurveyOrFlatNo || 'Scheduled Property'}, collect rents.`
    )
  if (data.powerTaxAuthorities)
    powers.push('3. Revenue Authorities: Represent before Income Tax, GST, and Municipal authorities.')
  if (data.powerLitigation)
    powers.push('4. Litigation: File plaints, defend suits, sign affidavits, and engage Advocates.')
  if (data.powerRegistration)
    powers.push('5. Registration: Present deeds and admit execution before the Sub-Registrar.')
  if (data.powerMoneys) powers.push('6. Recoveries: Demand and collect all moneys and grant valid discharges.')

  for (const p of powers) {
    checkNewPage(24)
    drawWrapped(p, fontRegular, 9, 13)
    y -= 4
  }

  // Suraj Lamp notice
  checkNewPage(32)
  drawWrapped(
    'STATUTORY NOTICE (Suraj Lamp, 2011 SC): GPA confers agency authority only and does NOT convey title to immovable property. Title passes strictly through registered conveyance.',
    fontItalic,
    8.5,
    12,
    rgb(0.7, 0.1, 0.1)
  )
  y -= 8

  // Custom clauses
  if (data.customClauses && data.customClauses.length > 0) {
    for (const cc of data.customClauses) {
      checkNewPage(26)
      drawWrapped(`${cc.title.toUpperCase()}: ${cc.text} (AI-Drafted Custom Clause)`, fontRegular, 9, 13)
      y -= 4
    }
  }

  // Ratification
  checkNewPage(26)
  drawWrapped(
    'RATIFICATION: The Principal agrees to ratify and confirm all lawful acts executed by the Attorney under these presents.',
    fontRegular,
    9,
    13
  )
  y -= 12

  // Signatures
  checkNewPage(80)
  currentPage.drawText('PRINCIPAL (GRANTOR): ____________________', {
    x: margin,
    y,
    size: 9.5,
    font: fontBold,
  })
  currentPage.drawText('ATTORNEY SIGNATURE: ____________________', {
    x: margin + 260,
    y,
    size: 9.5,
    font: fontBold,
  })
  y -= 16
  currentPage.drawText(`(${data.principalName})`, { x: margin, y, size: 8.5, font: fontRegular })
  currentPage.drawText(`(${data.attorneyName})`, { x: margin + 260, y, size: 8.5, font: fontRegular })

  y -= 26
  currentPage.drawText('Witness 1: ______________________________', {
    x: margin,
    y,
    size: 8.5,
    font: fontRegular,
  })
  currentPage.drawText('Witness 2: ______________________________', {
    x: margin + 260,
    y,
    size: 8.5,
    font: fontRegular,
  })

  return await pdfDoc.save()
}
