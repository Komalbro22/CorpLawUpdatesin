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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { cleanText, safeTextRuns } from './docx-utils'

export type LeaseAgreementType =
  | '11-Month Leave & License (Maharashtra)'
  | '11-Month Rent Agreement (other states)'
  | 'Registered Lease Deed (1+ years)'
  | 'Commercial Lease'

export interface LeaseFormData {
  agreementType: LeaseAgreementType
  agreementDate: string
  executionCity: string
  executionState: string

  // Lessor / Licensor
  lessorName: string
  lessorFatherOrSpouse: string
  lessorAge: string
  lessorAddress: string
  lessorPan?: string
  lessorAadhaar?: string

  // Lessee / Licensee
  lesseeName: string
  lesseeFatherOrSpouse: string
  lesseeAge: string
  lesseePermanentAddress: string
  lesseePan?: string
  lesseeAadhaar?: string
  lesseeEmployment?: string

  // Property
  propertyType:
    | 'Residential Flat / Apartment'
    | 'Independent House / Villa'
    | 'Commercial Office'
    | 'Retail Shop'
  propertyNumber: string
  buildingName: string
  streetAddress: string
  locality: string
  city: string
  state: string
  pincode: string
  superBuiltUpArea: string
  parkingSlot?: string
  furnishingStatus: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished'
  fixturesInventory: string

  // Term & Financials
  tenureMonths: number
  commencementDate: string
  expiryDate: string
  monthlyRent: number
  rentDueDate: number
  paymentMode: 'NEFT / IMPS / Net Banking' | 'Cheque' | 'UPI'
  securityDeposit: number
  nonRefundableDeposit?: number
  depositRefundDays: number
  lockInPeriodMonths: number
  noticePeriodMonths: number
  annualEscalationPercent: number
  maintenancePayer: 'Lessor / Owner' | 'Lessee / Tenant' | 'Shared Equally'
  electricityWaterPayer: 'Lessee / Tenant' | 'Lessor / Owner'

  // Custom Clauses
  customClauses?: Array<{
    id: string
    title: string
    text: string
    riskWarning?: string | null
  }>
}

export interface MaharashtraStampDutyResult {
  totalRent: number
  tenureYears: number
  refundableDeposit: number
  notionalInterest: number
  nonRefundableDeposit: number
  taxableBase: number
  ratePercent: number
  stampDuty: number
  registrationFeeUrban: number
  registrationFeeRural: number
  digitalStampingCompulsory: boolean
}

export function calculateMaharashtraStampDuty(
  monthlyRent: number,
  tenureMonths: number,
  securityDeposit: number,
  nonRefundableDeposit: number = 0
): MaharashtraStampDutyResult {
  const mRent = Math.max(0, monthlyRent || 0)
  const months = Math.max(1, tenureMonths || 11)
  const totalRent = mRent * months
  const tenureYears = months / 12
  const notionalInterest = Math.round((securityDeposit || 0) * 0.1 * tenureYears)
  const taxableBase = totalRent + (nonRefundableDeposit || 0) + notionalInterest

  let ratePercent = 0.25
  if (months > 120) {
    ratePercent = 1.0
  } else if (months > 60) {
    ratePercent = 0.5
  }

  const stampDuty = Math.max(100, Math.ceil((taxableBase * ratePercent) / 100))

  return {
    totalRent,
    tenureYears: parseFloat(tenureYears.toFixed(2)),
    refundableDeposit: securityDeposit || 0,
    notionalInterest,
    nonRefundableDeposit: nonRefundableDeposit || 0,
    taxableBase,
    ratePercent,
    stampDuty,
    registrationFeeUrban: 1000,
    registrationFeeRural: 500,
    digitalStampingCompulsory: true,
  }
}

export const DEFAULT_SAMPLE_LEASE_DATA: LeaseFormData = {
  agreementType: '11-Month Leave & License (Maharashtra)',
  agreementDate: '15th October 2026',
  executionCity: 'Mumbai',
  executionState: 'Maharashtra',

  lessorName: 'Rameshwar Nath Kulkarni',
  lessorFatherOrSpouse: 'Late Vasantrao Kulkarni',
  lessorAge: '58',
  lessorAddress: 'Flat 902, Emerald Towers, Gokhale Road, Dadar (West), Mumbai - 400028, Maharashtra',
  lessorPan: 'ABCDE1234F',
  lessorAadhaar: 'XXXX-XXXX-4589',

  lesseeName: 'Arjun Somesh Sharma',
  lesseeFatherOrSpouse: 'Somesh Sharma',
  lesseeAge: '32',
  lesseePermanentAddress: 'House 42, Civil Lines, Jaipur - 302006, Rajasthan',
  lesseePan: 'FGHIJ5678K',
  lesseeAadhaar: 'XXXX-XXXX-9821',
  lesseeEmployment: 'Senior Software Architect, Veritas Infotech Ltd.',

  propertyType: 'Residential Flat / Apartment',
  propertyNumber: 'Flat No. 404, 4th Floor',
  buildingName: 'Palm Heights Co-operative Housing Society Ltd.',
  streetAddress: 'Link Road, Andheri (West)',
  locality: 'Andheri West',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400053',
  superBuiltUpArea: '850 sq. ft. (Carpet Area: 640 sq. ft.)',
  parkingSlot: 'Stilt Parking Space No. P-14',
  furnishingStatus: 'Semi-Furnished',
  fixturesInventory:
    '3 Ceiling Fans (Havells), 6 LED Tube Lights (Philips), 2 Split ACs (1.5 Ton Daikin), 1 25L Water Geyser (AO Smith), Modular Kitchen with Chimney, 1 Master Bed with Mattress.',

  tenureMonths: 11,
  commencementDate: '1st November 2026',
  expiryDate: '30th September 2027',
  monthlyRent: 35000,
  rentDueDate: 5,
  paymentMode: 'NEFT / IMPS / Net Banking',
  securityDeposit: 100000,
  nonRefundableDeposit: 0,
  depositRefundDays: 15,
  lockInPeriodMonths: 6,
  noticePeriodMonths: 1,
  annualEscalationPercent: 5,
  maintenancePayer: 'Lessor / Owner',
  electricityWaterPayer: 'Lessee / Tenant',

  customClauses: [],
}

export function generateLeaseMarkdown(data: LeaseFormData): string {
  const isLicense = data.agreementType.includes('Leave & License')
  const partyOneLabel = isLicense ? 'LICENSOR' : 'LESSOR'
  const partyTwoLabel = isLicense ? 'LICENSEE' : 'LESSEE'
  const docTitle = isLicense
    ? 'LEAVE AND LICENSE AGREEMENT'
    : data.agreementType === 'Commercial Lease'
    ? 'COMMERCIAL LEASE DEED'
    : 'RENT / LEASE AGREEMENT'

  const statuteNote = isLicense
    ? '(Governed by Section 52 of the Indian Easements Act, 1882)'
    : '(Governed by Sections 105 to 108 of the Transfer of Property Act, 1882)'

  let clauseIndex = 1

  let md = `# ${docTitle}\n`
  md += `${statuteNote}\n\n`
  md += `**Execution Date:** ${data.agreementDate}  \n`
  md += `**Place of Execution:** ${data.executionCity}, ${data.executionState}\n\n`
  md += `---\n\n`

  md += `### PARTIES TO THE AGREEMENT\n\n`
  md += `**1. FIRST PARTY (${partyOneLabel} / OWNER):**  \n`
  md += `**Name:** ${data.lessorName}, Age: approx. ${data.lessorAge} years, S/o or W/o: ${data.lessorFatherOrSpouse}.  \n`
  md += `**Address:** ${data.lessorAddress}  \n`
  if (data.lessorPan) md += `**PAN:** \`${data.lessorPan}\`  `
  if (data.lessorAadhaar) md += `| **Aadhaar:** \`${data.lessorAadhaar}\``
  md += `\n*(hereinafter referred to as the **"${partyOneLabel}"**, which expression shall unless repugnant to the context include their heirs, legal representatives, and assigns of the FIRST PART).*\n\n`

  md += `**AND**\n\n`

  md += `**2. SECOND PARTY (${partyTwoLabel} / OCCUPANT):**  \n`
  md += `**Name:** ${data.lesseeName}, Age: approx. ${data.lesseeAge} years, S/o or W/o: ${data.lesseeFatherOrSpouse}.  \n`
  md += `**Permanent Address:** ${data.lesseePermanentAddress}  \n`
  if (data.lesseeEmployment) md += `**Occupation / Employment:** ${data.lesseeEmployment}  \n`
  if (data.lesseePan) md += `**PAN:** \`${data.lesseePan}\`  `
  if (data.lesseeAadhaar) md += `| **Aadhaar:** \`${data.lesseeAadhaar}\``
  md += `\n*(hereinafter referred to as the **"${partyTwoLabel}"**, which expression shall unless repugnant to the context include their legal representatives and permitted assigns of the SECOND PART).*\n\n`

  md += `### RECITALS\n\n`
  md += `A. The ${partyOneLabel} is the absolute and lawful owner / authorized custodian of the residential/commercial premise described below ("Scheduled Premise").  \n`
  md += `B. The ${partyTwoLabel} has requested temporary permission to occupy and use the Scheduled Premise for ${
    data.propertyType.includes('Commercial') ? 'commercial business operations' : 'strictly bona fide residential purpose'
  }, and the ${partyOneLabel} has agreed to grant such permission on the terms and conditions set forth herein.\n\n`

  md += `### SCHEDULE OF PROPERTY ("LICENSED / LEASED PREMISE")\n\n`
  md += `- **Premise Designation:** ${data.propertyNumber}, ${data.buildingName}\n`
  md += `- **Location:** ${data.streetAddress}, ${data.locality}, ${data.city}, ${data.state} - ${data.pincode}\n`
  md += `- **Super Built-Up / Carpet Area:** ${data.superBuiltUpArea}\n`
  if (data.parkingSlot) md += `- **Designated Parking:** ${data.parkingSlot}\n`
  md += `- **Furnishing Status:** ${data.furnishingStatus}\n`
  md += `- **Fixtures & Fittings Inventory:** ${data.fixturesInventory || 'Standard electrical switches, sanitary fittings, and light points.'}\n\n`

  md += `---\n\n`
  md += `### OPERATIVE TERMS AND COVENANTS\n\n`

  // Clause 1
  md += `**${clauseIndex++}. GRANT OF TEMPORARY OCCUPATION:**  \n`
  if (isLicense) {
    md += `The Licensor hereby grants unto the Licensee a purely temporary, revocable leave and personal license under Section 52 of the Indian Easements Act, 1882 to use and occupy the Scheduled Premise. Nothing herein shall be construed as creating any tenancy, sub-tenancy, or transfer of legal interest, leasehold estate, or exclusive ownership rights in favour of the Licensee.\n\n`
  } else {
    md += `The Lessor hereby demises and leases unto the Lessee the Scheduled Premise under Section 105 of the Transfer of Property Act, 1882, to hold the same for the term specified herein subject to the payment of monthly rent and adherence to covenants.\n\n`
  }

  // Clause 2
  md += `**${clauseIndex++}. TERM AND TENURE:**  \n`
  md += `The term of this Agreement shall be for a fixed period of **${data.tenureMonths} months**, commencing on **${data.commencementDate}** and expiring on **${data.expiryDate}**, unless terminated earlier in accordance with the provisions herein.\n\n`

  // Clause 3
  md += `**${clauseIndex++}. MONTHLY CONSIDERATION / RENT:**  \n`
  md += `The ${partyTwoLabel} shall pay to the ${partyOneLabel} a monthly compensation / rent of **₹${data.monthlyRent.toLocaleString('en-IN')}** (Rupees ${data.monthlyRent} only), payable in advance on or before the **${data.rentDueDate}th day** of each English calendar month via **${data.paymentMode}**. In case of renewal beyond the initial tenure, the monthly rent shall be enhanced by **${data.annualEscalationPercent}%**.\n\n`

  // Clause 4
  md += `**${clauseIndex++}. INTEREST-FREE REFUNDABLE SECURITY DEPOSIT:**  \n`
  md += `The ${partyTwoLabel} has deposited with the ${partyOneLabel} a sum of **₹${data.securityDeposit.toLocaleString('en-IN')}** as an interest-free refundable security deposit. This deposit shall be refunded to the ${partyTwoLabel} within **${data.depositRefundDays} days** of peaceful, vacant possession being handed back, after deducting unpaid rent, utility bills, or damages beyond normal wear and tear.\n\n`

  // Clause 5
  md += `**${clauseIndex++}. OUTGOINGS, MAINTENANCE & UTILITIES:**  \n`
  md += `Society maintenance charges shall be borne and paid by the **${data.maintenancePayer}**. Electricity, water, cooking gas, and internet consumption charges shall be borne and paid promptly by the **${data.electricityWaterPayer}** as per actual meter readings.\n\n`

  // Clause 6
  md += `**${clauseIndex++}. RESTRICTION ON SUBLETTING & USAGE:**  \n`
  md += `The Scheduled Premise shall be used solely for **${
    data.propertyType.includes('Commercial') ? 'lawful commercial office use' : 'residential living for the occupant and immediate family'
  }**. The ${partyTwoLabel} shall NOT assign, transfer, sub-let, underlet, or part with possession of the premise or any portion thereof to any third party under any circumstances.\n\n`

  // Clause 7
  md += `**${clauseIndex++}. INSPECTION RIGHTS:**  \n`
  md += `The ${partyOneLabel} or their authorized agent shall have the right to inspect the Scheduled Premise at reasonable daytime hours after giving at least twenty-four (24) hours' prior written or telephonic notice to the ${partyTwoLabel}.\n\n`

  // Clause 8
  md += `**${clauseIndex++}. LOCK-IN PERIOD & NOTICE PERIOD FOR TERMINATION:**  \n`
  if (data.lockInPeriodMonths > 0) {
    md += `Both parties agree to a mandatory lock-in period of **${data.lockInPeriodMonths} months** from the commencement date, during which neither party may terminate this agreement except for fundamental breach. After expiry of the lock-in period, either party may terminate this agreement by giving **${data.noticePeriodMonths} month(s)** prior written notice.\n\n`
  } else {
    md += `Either party may terminate this Agreement by serving **${data.noticePeriodMonths} month(s)** prior written notice upon the other party without assigning reasons.\n\n`
  }

  // Clause 9: Police Verification
  md += `**${clauseIndex++}. COMPLIANCE WITH POLICE VERIFICATION & BYELAWS:**  \n`
  md += `The ${partyTwoLabel} covenants to furnish all required identification documents, passport-size photographs, and employment proofs to complete Tenant Police Verification with the local police station jurisdiction, and strictly abide by the rules and society bye-laws.\n\n`

  // Custom Clauses (inserted before boilerplate)
  if (data.customClauses && data.customClauses.length > 0) {
    for (const c of data.customClauses) {
      md += `**${clauseIndex++}. ${c.title.toUpperCase()}** *(Custom Clause)*:  \n`
      md += `${c.text}\n`
      md += `*[AI-Drafted Custom Clause — review before signing]*\n\n`
    }
  }

  // Boilerplate / Governing Law
  md += `**${clauseIndex++}. PEACEFUL HANDOVER ON EXPIRY:**  \n`
  md += `Upon the expiry or sooner determination of this Agreement, the ${partyTwoLabel} shall peacefully vacate and deliver vacant possession of the Scheduled Premise along with all fixtures and fittings listed in the Schedule in good condition (reasonable wear and tear excepted).\n\n`

  md += `**${clauseIndex++}. DISPUTE RESOLUTION & JURISDICTION:**  \n`
  md += `This Agreement shall be governed by the laws of India. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the competent civil courts situated at **${data.executionCity}, ${data.executionState}**.\n\n`

  md += `---\n\n`
  md += `### SIGNATURE AND ATTESTATION\n\n`
  md += `IN WITNESS WHEREOF, the ${partyOneLabel} and ${partyTwoLabel} have signed and executed this Agreement on the day, month, and year first above written, in the presence of following witnesses:\n\n`

  md += `| **${partyOneLabel} (OWNER / LICENSOR)** | **${partyTwoLabel} (TENANT / LICENSEE)** |\n`
  md += `|:---|:---|\n`
  md += `| **Signature:** __________________________ | **Signature:** __________________________ |\n`
  md += `| **Name:** ${data.lessorName} | **Name:** ${data.lesseeName} |\n`
  md += `| **Date:** ${data.agreementDate} | **Date:** ${data.agreementDate} |\n`
  md += `| **Place:** ${data.executionCity} | **Place:** ${data.executionCity} |\n\n`

  md += `**WITNESSES:**\n\n`
  md += `1. **Witness 1:**  \n`
  md += `Signature: __________________________  \n`
  md += `Name: _______________________________  \n`
  md += `Address: ____________________________  \n\n`
  md += `2. **Witness 2:**  \n`
  md += `Signature: __________________________  \n`
  md += `Name: _______________________________  \n`
  md += `Address: ____________________________  \n`

  return md
}

export async function buildLeaseDocx(data: LeaseFormData): Promise<Buffer> {
  const isLicense = data.agreementType.includes('Leave & License')
  const partyOneLabel = isLicense ? 'LICENSOR' : 'LESSOR'
  const partyTwoLabel = isLicense ? 'LICENSEE' : 'LESSEE'
  const FONT = 'Arial'

  const docTitle = isLicense
    ? 'LEAVE AND LICENSE AGREEMENT'
    : data.agreementType === 'Commercial Lease'
    ? 'COMMERCIAL LEASE DEED'
    : 'RENT / LEASE AGREEMENT'

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  }

  let clauseIndex = 1

  const children: any[] = [
    // Stamp paper note
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

    // Document Title
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
          text: isLicense
            ? '(Under Section 52 of the Indian Easements Act, 1882)'
            : '(Under Sections 105 to 108 of the Transfer of Property Act, 1882)',
          italics: true,
          font: FONT,
          size: 20,
          color: '475569',
        }),
      ],
    }),

    // Execution preamble
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120, line: 280 },
      children: [
        new TextRun({
          text: `THIS AGREEMENT is entered into and executed at ${cleanText(
            data.executionCity
          )}, ${cleanText(data.executionState)}, India, on this ${cleanText(
            data.agreementDate
          )}, by and between:`,
          font: FONT,
          size: 21,
        }),
      ],
    }),

    // Party 1
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100, line: 280 },
      children: [
        new TextRun({ text: `1. ${cleanText(data.lessorName).toUpperCase()}`, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `, Age: approx. ${cleanText(data.lessorAge)} years, S/o or W/o: ${cleanText(
            data.lessorFatherOrSpouse
          )}, residing at: ${cleanText(data.lessorAddress)}${
            data.lessorPan ? ` [PAN: ${cleanText(data.lessorPan)}]` : ''
          }${data.lessorAadhaar ? ` [Aadhaar: ${cleanText(data.lessorAadhaar)}]` : ''} (hereinafter referred to as the "${partyOneLabel}", which expression shall unless repugnant to context include heirs, legal representatives, and assigns of the FIRST PART); and`,
          font: FONT,
          size: 21,
        }),
      ],
    }),

    // Party 2
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 140, line: 280 },
      children: [
        new TextRun({ text: `2. ${cleanText(data.lesseeName).toUpperCase()}`, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `, Age: approx. ${cleanText(data.lesseeAge)} years, S/o or W/o: ${cleanText(
            data.lesseeFatherOrSpouse
          )}, permanent residence: ${cleanText(data.lesseePermanentAddress)}${
            data.lesseeEmployment ? ` [Occupation: ${cleanText(data.lesseeEmployment)}]` : ''
          }${data.lesseePan ? ` [PAN: ${cleanText(data.lesseePan)}]` : ''}${
            data.lesseeAadhaar ? ` [Aadhaar: ${cleanText(data.lesseeAadhaar)}]` : ''
          } (hereinafter referred to as the "${partyTwoLabel}", which expression shall unless repugnant to context include legal representatives and permitted assigns of the SECOND PART).`,
          font: FONT,
          size: 21,
        }),
      ],
    }),

    // Recitals
    new Paragraph({
      spacing: { before: 100, after: 80 },
      children: [new TextRun({ text: 'RECITALS:', bold: true, font: FONT, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120, line: 280 },
      children: [
        new TextRun({
          text: `WHEREAS the ${partyOneLabel} is the lawful and absolute owner of the premises situated at: ${cleanText(
            data.propertyNumber
          )}, ${cleanText(data.buildingName)}, ${cleanText(data.streetAddress)}, ${cleanText(
            data.locality
          )}, ${cleanText(data.city)}, ${cleanText(data.state)} - ${cleanText(
            data.pincode
          )} ("Scheduled Premise"); and the ${partyTwoLabel} has approached the ${partyOneLabel} requesting temporary occupation for residential/commercial use on the terms and conditions agreed hereunder.`,
          font: FONT,
          size: 21,
        }),
      ],
    }),

    // Agreement statement
    new Paragraph({
      spacing: { before: 80, after: 100 },
      children: [
        new TextRun({
          text: 'NOW, THEREFORE, THE PARTIES HEREBY MUTUALLY AGREE AS FOLLOWS:',
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
        new TextRun({
          text: `${clauseIndex++}. GRANT OF OCCUPANCY: `,
          bold: true,
          font: FONT,
          size: 21,
        }),
        new TextRun({
          text: isLicense
            ? `The Licensor hereby grants unto the Licensee temporary leave and license under Section 52 of the Indian Easements Act, 1882 to use and occupy the Scheduled Premise. This agreement is a personal privilege and does not create any estate, tenancy, or transferable interest in the property.`
            : `The Lessor hereby demises and leases unto the Lessee the Scheduled Premise under Section 105 of the Transfer of Property Act, 1882, for the tenure specified herein subject to compliance with terms.`,
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
        new TextRun({ text: `${clauseIndex++}. TERM: `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `The tenure of this agreement shall be for a period of ${data.tenureMonths} months commencing from ${cleanText(
            data.commencementDate
          )} to ${cleanText(data.expiryDate)}.`,
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
        new TextRun({ text: `${clauseIndex++}. RENT & ESCALATION: `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `The ${partyTwoLabel} shall pay monthly rent/compensation of Rs. ${data.monthlyRent.toLocaleString(
            'en-IN'
          )}/- on or before the ${data.rentDueDate}th of each English calendar month via ${cleanText(
            data.paymentMode
          )}. Rent shall escalate by ${data.annualEscalationPercent}% upon renewal.`,
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
        new TextRun({
          text: `${clauseIndex++}. REFUNDABLE SECURITY DEPOSIT: `,
          bold: true,
          font: FONT,
          size: 21,
        }),
        new TextRun({
          text: `The ${partyTwoLabel} has deposited an interest-free refundable deposit of Rs. ${data.securityDeposit.toLocaleString(
            'en-IN'
          )}/-, which shall be refunded within ${
            data.depositRefundDays
          } days of peaceful handover of vacant possession, subject to deduction of arrears or damage costs.`,
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
        new TextRun({ text: `${clauseIndex++}. MAINTENANCE & UTILITIES: `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `Building society maintenance shall be borne by ${cleanText(
            data.maintenancePayer
          )}. Electricity, water, and gas charges shall be paid by ${cleanText(
            data.electricityWaterPayer
          )} as per consumption.`,
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
        new TextRun({ text: `${clauseIndex++}. SUBLETTING: `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `The ${partyTwoLabel} shall NOT assign, sub-let, transfer, or part with possession of the premises or any part thereof to any third party.`,
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
        new TextRun({ text: `${clauseIndex++}. LOCK-IN & TERMINATION: `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `Lock-in period: ${data.lockInPeriodMonths} months. Either party may terminate thereafter by serving ${data.noticePeriodMonths} month(s) advance written notice.`,
          font: FONT,
          size: 21,
        }),
      ],
    }),

    // Clause 8
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100, line: 280 },
      children: [
        new TextRun({
          text: `${clauseIndex++}. POLICE VERIFICATION: `,
          bold: true,
          font: FONT,
          size: 21,
        }),
        new TextRun({
          text: `The ${partyTwoLabel} shall cooperate and submit all required KYC documentation for Tenant Police Verification in compliance with local police commissionerate directives.`,
          font: FONT,
          size: 21,
        }),
      ],
    }),
  ]

  // Add custom clauses
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

  // Final jurisdiction clause
  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 140, line: 280 },
      children: [
        new TextRun({ text: `${clauseIndex++}. JURISDICTION: `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `This agreement shall be subject to the exclusive jurisdiction of the competent civil courts at ${cleanText(
            data.executionCity
          )}, ${cleanText(data.executionState)}.`,
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
                  children: [
                    new TextRun({
                      text: `${partyOneLabel} (OWNER / LICENSOR)`,
                      bold: true,
                      font: FONT,
                      size: 20,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 240 },
                  children: [new TextRun({ text: '_______________________________', font: FONT })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Name: ${cleanText(data.lessorName)}`, font: FONT, size: 19 })],
                }),
              ],
            }),
            new TableCell({
              borders: borderNone,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${partyTwoLabel} (TENANT / LICENSEE)`,
                      bold: true,
                      font: FONT,
                      size: 20,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 240 },
                  children: [new TextRun({ text: '_______________________________', font: FONT })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Name: ${cleanText(data.lesseeName)}`, font: FONT, size: 19 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // Witnesses
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

export async function buildLeasePdf(data: LeaseFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  let currentPage = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width: pageWidth, height: pageHeight } = currentPage.getSize()
  const margin = 45
  const contentWidth = pageWidth - margin * 2
  let y = pageHeight - margin

  const isLicense = data.agreementType.includes('Leave & License')
  const partyOneLabel = isLicense ? 'LICENSOR' : 'LESSOR'
  const partyTwoLabel = isLicense ? 'LICENSEE' : 'LESSEE'

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

  // Header Title
  const title = isLicense
    ? 'LEAVE AND LICENSE AGREEMENT'
    : data.agreementType === 'Commercial Lease'
    ? 'COMMERCIAL LEASE DEED'
    : 'RENT / LEASE AGREEMENT'

  const titleW = fontBold.widthOfTextAtSize(title, 13)
  currentPage.drawText(title, {
    x: (pageWidth - titleW) / 2,
    y,
    size: 13,
    font: fontBold,
    color: rgb(0.05, 0.1, 0.2),
  })
  y -= 16

  const sub = isLicense
    ? '(Under Indian Easements Act, 1882 — Personal License)'
    : '(Under Transfer of Property Act, 1882)'
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

  // Preamble
  drawWrapped(
    `THIS AGREEMENT is executed on ${data.agreementDate} at ${data.executionCity}, ${data.executionState}, India, between:`,
    fontRegular,
    9.5,
    13.5
  )
  y -= 4

  drawWrapped(
    `1. ${data.lessorName.toUpperCase()}, Age: ${data.lessorAge} yrs, S/o or W/o: ${
      data.lessorFatherOrSpouse
    }, residing at ${data.lessorAddress} ("${partyOneLabel}"); and`,
    fontRegular,
    9,
    13
  )
  y -= 3

  drawWrapped(
    `2. ${data.lesseeName.toUpperCase()}, Age: ${data.lesseeAge} yrs, S/o or W/o: ${
      data.lesseeFatherOrSpouse
    }, permanent address: ${data.lesseePermanentAddress} ("${partyTwoLabel}").`,
    fontRegular,
    9,
    13
  )
  y -= 8

  drawWrapped(
    `SCHEDULE PREMISE: ${data.propertyNumber}, ${data.buildingName}, ${data.streetAddress}, ${data.locality}, ${data.city} - ${data.pincode} (${data.superBuiltUpArea}, ${data.furnishingStatus}).`,
    fontItalic,
    9,
    13
  )
  y -= 10

  const clauses = [
    {
      num: '1',
      title: 'Grant of Occupation: ',
      text: isLicense
        ? 'Purely personal leave and license under Sec 52 of Indian Easements Act, 1882 without creating any tenancy or estate.'
        : 'Demised and leased under Sec 105 of Transfer of Property Act, 1882.',
    },
    {
      num: '2',
      title: 'Tenure: ',
      text: `Fixed term of ${data.tenureMonths} months from ${data.commencementDate} to ${data.expiryDate}.`,
    },
    {
      num: '3',
      title: 'Rent & Due Date: ',
      text: `Rs. ${data.monthlyRent.toLocaleString('en-IN')}/- payable on or before the ${
        data.rentDueDate
      }th of each month via ${data.paymentMode}. Escalation: ${data.annualEscalationPercent}%.`,
    },
    {
      num: '4',
      title: 'Security Deposit: ',
      text: `Interest-free refundable deposit of Rs. ${data.securityDeposit.toLocaleString(
        'en-IN'
      )}/-, refundable within ${data.depositRefundDays} days of vacant handover.`,
    },
    {
      num: '5',
      title: 'Maintenance & Utilities: ',
      text: `Society maintenance borne by ${data.maintenancePayer}. Electricity/water borne by ${data.electricityWaterPayer}.`,
    },
    {
      num: '6',
      title: 'Subletting Prohibition: ',
      text: 'Licensee shall not sub-let, assign, or part with possession of the premises to any third party.',
    },
    {
      num: '7',
      title: 'Lock-in & Notice: ',
      text: `Lock-in: ${data.lockInPeriodMonths} months. Notice period for early exit: ${data.noticePeriodMonths} month(s).`,
    },
    {
      num: '8',
      title: 'Police Verification: ',
      text: 'Tenant KYC verification to be submitted to local police station.',
    },
  ]

  let curIdx = 9
  for (const c of clauses) {
    checkNewPage(26)
    drawWrapped(`${c.num}. ${c.title}${c.text}`, fontRegular, 9, 13)
    y -= 5
  }

  // Custom Clauses
  if (data.customClauses && data.customClauses.length > 0) {
    for (const cc of data.customClauses) {
      checkNewPage(28)
      drawWrapped(`${curIdx++}. ${cc.title.toUpperCase()}: ${cc.text} (AI-Drafted Custom Clause)`, fontRegular, 9, 13)
      y -= 5
    }
  }

  // Signatures
  checkNewPage(90)
  y -= 12
  currentPage.drawText(`${partyOneLabel}: _________________________`, {
    x: margin,
    y,
    size: 9.5,
    font: fontBold,
  })
  currentPage.drawText(`${partyTwoLabel}: _________________________`, {
    x: margin + 260,
    y,
    size: 9.5,
    font: fontBold,
  })
  y -= 16
  currentPage.drawText(`(${data.lessorName})`, { x: margin, y, size: 8.5, font: fontRegular })
  currentPage.drawText(`(${data.lesseeName})`, { x: margin + 260, y, size: 8.5, font: fontRegular })

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
