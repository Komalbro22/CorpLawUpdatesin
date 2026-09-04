import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export type ShiftingScope =
  | 'same_city'
  | 'outside_local'
  | 'different_roc'
  | 'different_state'

export interface RegisteredOfficeFormData {
  shiftingScope?: ShiftingScope
  companyName?: string
  cin?: string
  meetingDate?: string
  meetingTime?: string
  meetingVenue?: string
  chairpersonName?: string
  directorsPresent?: string
  oldAddress?: string
  newAddress?: string
  oldState?: string
  newState?: string
  oldRoc?: string
  newRoc?: string
  effectiveDate?: string
  premisesType?: 'rented' | 'owned' | 'leased'
  ownerName?: string
  directorName?: string
  directorDin?: string
  companySecretaryName?: string
  csMembershipNo?: string
  certifiedDate?: string

  // EGM & Special Resolution fields
  egmDate?: string
  egmTime?: string
  egmVenue?: string

  // Regional Director & Newspaper notice fields
  rdJurisdiction?: string
  newspaperEnglish?: string
  newspaperVernacular?: string
  creditorCount?: string
  creditorDebtAmount?: string

  // Bank particulars
  bankName?: string
  bankBranch?: string
  bankAccountNumber?: string
}

export const DEFAULT_SAMPLE_REG_OFFICE_DATA: RegisteredOfficeFormData = {
  shiftingScope: 'same_city',
  companyName: 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED',
  cin: 'U72900DL2024PTC999999',
  meetingDate: '15/09/2026',
  meetingTime: '11:00 A.M.',
  meetingVenue: '101, Old Business Hub, Barakhamba Road, Connaught Place, New Delhi - 110001',
  chairpersonName: 'Shri A. K. Sharma',
  directorsPresent:
    '1. Shri A. K. Sharma (Director & Chairperson, DIN: 09999999)\n2. Smt. Priya Verma (Director, DIN: 08888888)\n3. Shri Vikram Mehta (Director, DIN: 07777777)',
  oldAddress: '101, Old Business Hub, Barakhamba Road, Connaught Place, New Delhi - 110001',
  newAddress:
    'Plot No. 99, Sample Commercial Tower, Phase II, Okhla Industrial Area, New Delhi - 110020',
  oldState: 'National Capital Territory of Delhi',
  newState: 'State of Maharashtra',
  oldRoc: 'RoC Mumbai',
  newRoc: 'RoC Pune',
  effectiveDate: '15/09/2026',
  premisesType: 'rented',
  ownerName: 'Shri R. P. Singh (Landlord)',
  directorName: 'Sample Director (Authorised Signatory)',
  directorDin: '09999999',
  companySecretaryName: 'CS Sample Sharma',
  csMembershipNo: 'A99999',
  certifiedDate: '15/09/2026',

  // EGM particulars
  egmDate: '10/10/2026',
  egmTime: '11:30 A.M.',
  egmVenue:
    'Registered Office of the Company / through Video Conferencing (VC / OAVM)',

  // RD & Notice particulars
  rdJurisdiction:
    'Regional Director, Northern Region, Ministry of Corporate Affairs, New Delhi',
  newspaperEnglish: 'The Financial Express (Delhi Edition)',
  newspaperVernacular: 'Jansatta (Hindi Delhi Edition)',
  creditorCount: '12',
  creditorDebtAmount: '45,00,000',

  // Bank particulars
  bankName: 'HDFC Bank Limited',
  bankBranch: 'Connaught Place Branch, New Delhi',
  bankAccountNumber: '50200012345678',
}

const FONT = 'Times New Roman'

/**
 * Builds Certified True Copy of Board Resolution (.docx) based on shifting scope
 */
export async function buildRegisteredOfficeBoardResolutionDocx(
  data: Partial<RegisteredOfficeFormData> = {}
): Promise<Buffer> {
  const scope = data.shiftingScope || 'same_city'
  const comp =
    data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const dt = data.meetingDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingDate || '15/09/2026'
  const tm = data.meetingTime || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingTime || '11:00 A.M.'
  const venue =
    data.meetingVenue ||
    data.oldAddress ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress ||
    '[MEETING VENUE]'
  const chair =
    data.chairpersonName ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.chairpersonName ||
    '[CHAIRPERSON NAME]'
  const dirPresent =
    data.directorsPresent || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorsPresent || ''
  const oldAddr =
    data.oldAddress ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress ||
    '[OLD REGISTERED OFFICE ADDRESS]'
  const newAddr =
    data.newAddress ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress ||
    '[NEW REGISTERED OFFICE ADDRESS]'
  const effDate = data.effectiveDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.effectiveDate || dt
  const dir =
    data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'
  const cs =
    data.companySecretaryName ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.companySecretaryName ||
    'CS Sample Sharma'
  const csMem =
    data.csMembershipNo || DEFAULT_SAMPLE_REG_OFFICE_DATA.csMembershipNo || 'A99999'
  const certDate = data.certifiedDate || dt
  const egmDt = data.egmDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.egmDate || '10/10/2026'
  const egmTm = data.egmTime || DEFAULT_SAMPLE_REG_OFFICE_DATA.egmTime || '11:30 A.M.'
  const egmVn = data.egmVenue || DEFAULT_SAMPLE_REG_OFFICE_DATA.egmVenue || venue
  const oldR = data.oldRoc || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldRoc || 'RoC Mumbai'
  const newR = data.newRoc || DEFAULT_SAMPLE_REG_OFFICE_DATA.newRoc || 'RoC Pune'
  const oldSt =
    data.oldState ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.oldState ||
    'NCT of Delhi'
  const newSt =
    data.newState ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.newState ||
    'State of Maharashtra'
  const rd =
    data.rdJurisdiction ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.rdJurisdiction ||
    'Regional Director'

  // Determine Title and Body paragraphs by Scope
  let title = ''
  let resolutionParagraphs: Paragraph[] = []

  if (scope === 'same_city') {
    title =
      'SHIFTING OF REGISTERED OFFICE OF THE COMPANY WITHIN LOCAL LIMITS OF THE SAME CITY / TOWN / VILLAGE'
    resolutionParagraphs = [
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `"RESOLVED THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `pursuant to the provisions of Section 12(5)(a) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014 (including any statutory modification(s) or re-enactment(s) thereof for the time being in force) and the relevant provisions of the Articles of Association of the Company, the consent and approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
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
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `the No Objection Certificate (NOC) received from the owner/landlord of the new premises together with the latest utility bill (electricity bill not older than 2 months) and the lease/rent agreement in respect of the new premises, placed before the meeting, be and are hereby noted and accepted as conclusive proof of the right to use the premises as the Registered Office of the Company.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) of the Company, be and are hereby severally authorized to digitally sign, certify, and file e-Form INC-22 with the Registrar of Companies within the statutory timeline of 30 days from the date of this resolution, along with requisite statutory attachments and fees, as prescribed under Section 12 of the Companies Act, 2013.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
    ]
  } else if (scope === 'outside_local') {
    title =
      'SHIFTING OF REGISTERED OFFICE OUTSIDE LOCAL LIMITS OF CITY / TOWN / VILLAGE BUT WITHIN SAME ROC & STATE JURISDICTION'
    resolutionParagraphs = [
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `"RESOLVED THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `pursuant to the provisions of Section 12(5) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014, and subject to the approval of the Members of the Company by way of a Special Resolution, the consent and approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from ${oldAddr} to ${newAddr}, being outside the local limits of the city/town/village but within the jurisdiction of the same Registrar of Companies.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `an Extraordinary General Meeting (EGM) of the Members of the Company be convened on ${egmDt} at ${egmTm} at ${egmVn} for the purpose of seeking the approval of the Members by way of a Special Resolution for the shifting of the registered office outside local limits.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `the draft Notice convening the EGM along with the Explanatory Statement pursuant to Section 102 of the Companies Act, 2013, as placed before the Board, be and is hereby approved, and ${dir}, Director (DIN: ${din}) or ${cs}, Company Secretary (Membership No.: ${csMem}) be and is hereby authorized to issue the Notice to all Members, Directors, and Auditors of the Company in accordance with Section 101.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `upon the passing of the Special Resolution by the Members, ${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) be and are hereby severally authorized to file e-Form MGT-14 with the Registrar of Companies within 30 days of passing of the resolution, and subsequently file e-Form INC-22 along with the proof of address, Landlord NOC, and copy of the Special Resolution within 30 days of shifting."`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
    ]
  } else if (scope === 'different_roc') {
    title =
      'SHIFTING OF REGISTERED OFFICE FROM JURISDICTION OF ONE ROC TO ANOTHER ROC WITHIN SAME STATE'
    resolutionParagraphs = [
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `"RESOLVED THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `pursuant to the provisions of Section 12(5) second proviso and other applicable provisions of the Companies Act, 2013 read with Rule 28 of the Companies (Incorporation) Rules, 2014, and subject to the approval of the Members by way of a Special Resolution and confirmation by the Regional Director (${rd}), the consent of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from ${oldAddr} (under the jurisdiction of ${oldR}) to ${newAddr} (under the jurisdiction of ${newR}).`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `an Extraordinary General Meeting (EGM) of the Members of the Company be convened on ${egmDt} at ${egmTm} at ${egmVn} for passing the requisite Special Resolution, and the draft Notice together with the Explanatory Statement under Section 102 placed before the meeting be and is hereby approved.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) be and are hereby severally authorized to prepare, sign, and file an Application / Petition in e-Form INC-23 with the Regional Director (${rd}) seeking confirmation of shifting under Rule 28.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `the authorized signatories be and are hereby authorized to publish the public notice in Form INC-26 in an English daily newspaper and in a principal vernacular language daily newspaper circulating in the district where the registered office is situated, send individual notices to all creditors and debenture holders, and represent the Company before the Regional Director.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `upon receipt of the certified confirmation order from the Regional Director, the Company shall file e-Form INC-28 within 60 days of the order with both Registrars of Companies, and subsequently file e-Form INC-22 within 30 days of registration of Form INC-28."`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
    ]
  } else {
    // Inter-State Shifting (Section 13 & Rule 30)
    title =
      'SHIFTING OF REGISTERED OFFICE FROM ONE STATE TO ANOTHER AND ALTERATION OF CLAUSE II OF MEMORANDUM OF ASSOCIATION'
    resolutionParagraphs = [
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `"RESOLVED THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `pursuant to the provisions of Section 12(5), Section 13(4), (5), (7) and other applicable provisions of the Companies Act, 2013 read with Rule 30 of the Companies (Incorporation) Rules, 2014, and subject to the approval of the Members by way of Special Resolution and confirmation by the Central Government / Regional Director (${rd}), the consent of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from the ${oldSt} to the ${newSt}, from ${oldAddr} to ${newAddr}.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `subject to the approval of the Members and confirmation by the Regional Director, Clause II of the Memorandum of Association of the Company be altered by substituting the words "${oldSt}" with the words "${newSt}".`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `an Extraordinary General Meeting (EGM) of the Members of the Company be convened on ${egmDt} at ${egmTm} at ${egmVn} for passing the Special Resolution, and the draft Notice together with the Explanatory Statement under Section 102 placed before the meeting be and is hereby approved.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) be and are hereby severally authorized to prepare, verify by affidavit, and file a Petition in e-Form INC-23 with the Regional Director (${rd}), publish newspaper advertisements in Form INC-26 at least 14 days before hearing, serve notice to all creditors, debenture holders, Registrar of Companies, and the Chief Secretary of the Government of ${oldSt}.`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: `upon receipt of the certified order of the Regional Director approving the shifting and MOA alteration, the Company shall file e-Form INC-28 with the Registrar of Companies within 30 days of the date of the order, and file e-Form INC-22 within 30 days of registration of INC-28 for issuance of fresh Certificate of Incorporation / updated CIN by the Registrar of Companies."`,
            font: FONT,
            size: 21,
          }),
        ],
      }),
    ]
  }

  // Common statutory clauses for Name Board, Geo-tagged photos, GST, Banks
  const commonTrailingClauses: Paragraph[] = [
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `the Company shall arrange to paint or affix the Company’s Name and Registered Office Address in legible letters outside and inside the new premises in English and in the local language as mandated under Section 12(3)(a) and Rule 25(2) of the Companies (Incorporation) Rules, 2014, and to arrange for taking geo-tagged interior and exterior photographs showing at least one Director/KMP present inside the registered office as required for MCA verification.`,
          font: FONT,
          size: 21,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: `RESOLVED FURTHER THAT `, bold: true, font: FONT, size: 21 }),
        new TextRun({
          text: `the Directors of the Company be and are hereby severally authorized to update the registered office address on the company letterheads, business correspondence, invoices, official website, and to file application for amendment of core fields in Form GST REG-14 within 15 days on the GST portal, and to intimate the change of address to all banking partners, financial institutions, Income Tax authorities, EPFO, ESIC, and other regulatory agencies."`,
          font: FONT,
          size: 21,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ]

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
              new TextRun({
                text: `Registered Office: ${oldAddr}`,
                size: 18,
                italics: true,
                font: FONT,
              }),
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
          ...dirPresent
            .split('\n')
            .filter(Boolean)
            .map(
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
                text: title,
                bold: true,
                size: 22,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Resolution Body
          ...resolutionParagraphs,
          ...commonTrailingClauses,

          // Sign-off section
          new Paragraph({
            children: [
              new TextRun({
                text: `For ${comp.toUpperCase()}\n\n\n`,
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '________________________________________\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: `${chair}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: 'Chairperson / Director\n\n\n', font: FONT, size: 20 }),
            ],
          }),

          // Certification block
          new Paragraph({
            children: [
              new TextRun({ text: 'CERTIFIED TRUE COPY:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({
                text: `For ${comp.toUpperCase()}\n\n\n`,
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '________________________________________\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: `${dir}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `Director / Authorised Signatory\n`, font: FONT, size: 20 }),
              new TextRun({ text: `DIN: ${din}\n`, font: FONT, size: 20 }),
              new TextRun({ text: `Date: ${certDate}\n`, font: FONT, size: 20 }),
              new TextRun({
                text: `Place: ${venue.split(',').pop()?.trim() || 'New Delhi'}`,
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
 * Builds EGM Notice, Special Resolution, and Section 102 Explanatory Statement (.docx)
 * For Scopes 2, 3, and 4.
 */
export async function buildSpecialResolutionDocx(
  data: Partial<RegisteredOfficeFormData> = {}
): Promise<Buffer> {
  const scope = data.shiftingScope || 'outside_local'
  const comp =
    data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const oldAddr =
    data.oldAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress || '[OLD ADDRESS]'
  const newAddr =
    data.newAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress || '[NEW ADDRESS]'
  const egmDt = data.egmDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.egmDate || '10/10/2026'
  const egmTm = data.egmTime || DEFAULT_SAMPLE_REG_OFFICE_DATA.egmTime || '11:30 A.M.'
  const egmVn =
    data.egmVenue ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.egmVenue ||
    'Registered Office of the Company'
  const oldSt =
    data.oldState || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldState || 'NCT of Delhi'
  const newSt =
    data.newState || DEFAULT_SAMPLE_REG_OFFICE_DATA.newState || 'State of Maharashtra'
  const oldR = data.oldRoc || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldRoc || 'RoC Mumbai'
  const newR = data.newRoc || DEFAULT_SAMPLE_REG_OFFICE_DATA.newRoc || 'RoC Pune'
  const dir =
    data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'
  const rd =
    data.rdJurisdiction ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.rdJurisdiction ||
    'Regional Director'

  let resolutionTitle = ''
  let specialResolutionBody = ''
  let explanatoryRationale = ''

  if (scope === 'outside_local') {
    resolutionTitle =
      'SHIFTING OF REGISTERED OFFICE OUTSIDE LOCAL LIMITS OF CITY / TOWN / VILLAGE'
    specialResolutionBody = `"RESOLVED THAT pursuant to the provisions of Section 12(5) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and 27 of the Companies (Incorporation) Rules, 2014, the consent of the Members of the Company be and is hereby accorded to shift the Registered Office of the Company from ${oldAddr} to ${newAddr}, outside the local limits of the city/town/village but within the jurisdiction of the same Registrar of Companies.\n\nRESOLVED FURTHER THAT the Board of Directors of the Company be and is hereby authorized to file e-Form MGT-14 within 30 days and e-Form INC-22 with the Registrar of Companies and to do all such acts, deeds, and things as may be necessary, proper, or expedient to give effect to this resolution."`
    explanatoryRationale = `The current registered office of the Company at ${oldAddr} has become inadequate to support the expanding scale of business operations, technical staffing, and client servicing needs. The proposed new premises at ${newAddr} provide superior commercial infrastructure, modern warehousing, and enhanced connectivity. Since the new premises are situated outside the local limits of the existing city/town/village, approval of the Members by way of a Special Resolution under Section 12(5) of the Companies Act, 2013 is required.`
  } else if (scope === 'different_roc') {
    resolutionTitle =
      'SHIFTING OF REGISTERED OFFICE FROM JURISDICTION OF ONE ROC TO ANOTHER ROC WITHIN SAME STATE'
    specialResolutionBody = `"RESOLVED THAT pursuant to the provisions of Section 12(5) second proviso and other applicable provisions of the Companies Act, 2013 read with Rule 28 of the Companies (Incorporation) Rules, 2014, and subject to confirmation by the Regional Director (${rd}), the consent of the Members be and is hereby accorded to shift the Registered Office of the Company from ${oldAddr} (under ${oldR}) to ${newAddr} (under ${newR}).\n\nRESOLVED FURTHER THAT the Board of Directors of the Company be and is hereby authorized to file a Petition in Form INC-23 with the Regional Director, publish notices in Form INC-26, file Form MGT-14, Form INC-28, and Form INC-22 with the Registrar of Companies, and to do all acts, deeds, and things necessary to give full effect to this resolution."`
    explanatoryRationale = `The Board of Directors evaluated the geographic distribution of the Company's key clients and operational facilities and resolved to shift the registered office to ${newAddr}. Because this shift falls under the jurisdiction of a different Registrar of Companies (${newR}) within the same state, Section 12(5) mandates approval of the Members by Special Resolution and subsequent confirmation by the Regional Director under Rule 28.`
  } else {
    // Inter-State
    resolutionTitle =
      'SHIFTING OF REGISTERED OFFICE FROM ONE STATE TO ANOTHER AND ALTERATION OF CLAUSE II OF MEMORANDUM OF ASSOCIATION'
    specialResolutionBody = `"RESOLVED THAT pursuant to the provisions of Section 12(5), Section 13(4), (5), (7) and other applicable provisions of the Companies Act, 2013 read with Rule 30 of the Companies (Incorporation) Rules, 2014, and subject to confirmation by the Central Government / Regional Director (${rd}), the consent of the Members be and is hereby accorded to shift the Registered Office of the Company from the ${oldSt} to the ${newSt}, from ${oldAddr} to ${newAddr}.\n\nRESOLVED FURTHER THAT Clause II of the Memorandum of Association of the Company be altered by substituting the name of "${oldSt}" with "${newSt}".\n\nRESOLVED FURTHER THAT the Board of Directors of the Company be and is hereby authorized to file a Petition in Form INC-23 with the Regional Director, publish notices in Form INC-26, file Form MGT-14, Form INC-28, and Form INC-22, and do all such acts as may be necessary to implement the inter-state shifting."`
    explanatoryRationale = `The Company's core business activities, key leadership, and commercial partnerships have progressively centralized in the ${newSt}. Operating the registered office from ${newSt} will result in substantial administrative economies, direct executive supervision, and improved stakeholder management. Inter-state shifting entails alteration of the Situation Clause (Clause II) of the Memorandum of Association, requiring a Special Resolution under Section 13 followed by confirmation of the Regional Director under Rule 30. None of the employees or creditors will be prejudicially affected by the proposed shifting.`
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
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
              new TextRun({
                text: `Registered Office: ${oldAddr}`,
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
                text: 'NOTICE OF EXTRAORDINARY GENERAL MEETING (EGM)',
                bold: true,
                size: 24,
                underline: {},
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `NOTICE IS HEREBY GIVEN that an Extraordinary General Meeting of the Members of ${comp} will be held on ${egmDt} at ${egmTm} at ${egmVn} to transact the following Special Business:`,
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
                text: `ITEM NO. 1: ${resolutionTitle}`,
                bold: true,
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
                text: `To consider and, if thought fit, to pass with or without modification(s), the following resolution as a `,
                font: FONT,
                size: 21,
              }),
              new TextRun({ text: 'SPECIAL RESOLUTION:', bold: true, font: FONT, size: 21 }),
            ],
          }),
          new Paragraph({ text: '' }),

          ...specialResolutionBody.split('\n\n').map(
            (chunk) =>
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [new TextRun({ text: chunk, font: FONT, size: 21 })],
              })
          ),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({
                text: `By Order of the Board of Directors\nFor ${comp.toUpperCase()}\n\n\n`,
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '________________________________________\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: `${dir}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `Director / Authorised Signatory\n`, font: FONT, size: 20 }),
              new TextRun({ text: `DIN: ${din}\nDate: ${egmDt}`, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Page Break for Explanatory Statement
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013',
                bold: true,
                size: 22,
                underline: {},
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'Item No. 1: ', bold: true, font: FONT, size: 21 }),
              new TextRun({ text: explanatoryRationale, font: FONT, size: 21 }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `The proposed change of registered office will not affect any rights, privileges, obligations, or liabilities of the Company, nor will it render defective any legal proceedings by or against the Company. All existing commercial agreements, contracts, and banking arrangements shall continue in full force and effect.`,
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
                text: `None of the Directors, Key Managerial Personnel (KMP) of the Company, or their relatives are in any way concerned or interested, financially or otherwise, in the proposed resolution, except to the extent of their respective shareholding in the Company.`,
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
                text: `The Board of Directors recommends the Special Resolution set out at Item No. 1 of the accompanying Notice for approval by the Members of the Company.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({
                text: `For ${comp.toUpperCase()}\n\n\n`,
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '________________________________________\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: `${dir}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `Director\nDIN: ${din}`, font: FONT, size: 20 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Form INC-26 Public Newspaper Notice (.docx)
 * For Scopes 3 (Different RoC) and 4 (Inter-State).
 */
export async function buildFormInc26Docx(
  data: Partial<RegisteredOfficeFormData> = {}
): Promise<Buffer> {
  const comp =
    data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const oldAddr =
    data.oldAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress || '[OLD ADDRESS]'
  const newAddr =
    data.newAddress || DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress || '[NEW ADDRESS]'
  const oldSt =
    data.oldState || DEFAULT_SAMPLE_REG_OFFICE_DATA.oldState || 'NCT of Delhi'
  const newSt =
    data.newState || DEFAULT_SAMPLE_REG_OFFICE_DATA.newState || 'State of Maharashtra'
  const rd =
    data.rdJurisdiction ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.rdJurisdiction ||
    'Regional Director, Northern Region, New Delhi'
  const dir =
    data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'FORM NO. INC-26', bold: true, size: 24, font: FONT }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '[Pursuant to Rule 30 of the Companies (Incorporation) Rules, 2014]',
                italics: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `BEFORE THE REGIONAL DIRECTOR, ${rd.toUpperCase()}`,
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
                text: `IN THE MATTER OF SUB-SECTION (4) OF SECTION 13 OF THE COMPANIES ACT, 2013`,
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `AND IN THE MATTER OF ${comp.toUpperCase()} (CIN: ${cin})`,
                bold: true,
                size: 20,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'PUBLIC NOTICE',
                bold: true,
                size: 22,
                underline: {},
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `Notice is hereby given to the General Public that the Company intends to make an application to the Central Government / Regional Director under Section 13(4) of the Companies Act, 2013 read with Rule 30 of the Companies (Incorporation) Rules, 2014, seeking confirmation of alteration of the Memorandum of Association of the Company in terms of the Special Resolution passed at the Extraordinary General Meeting held on ${data.egmDate || '10/10/2026'}, to enable the Company to shift its Registered Office from the ${oldSt} to the ${newSt}.`,
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
                text: `The existing registered office of the Company is situated at: `,
                font: FONT,
                size: 21,
              }),
              new TextRun({ text: oldAddr, bold: true, font: FONT, size: 21 }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `The proposed new registered office of the Company will be situated at: `,
                font: FONT,
                size: 21,
              }),
              new TextRun({ text: newAddr, bold: true, font: FONT, size: 21 }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `Any person whose interest is likely to be affected by the proposed shifting of the registered office may deliver either on the MCA Portal (www.mca.gov.in) by filing investor objection or submit physical representations supported by an affidavit stating the nature of interest and grounds of opposition to the `,
                font: FONT,
                size: 21,
              }),
              new TextRun({ text: rd, bold: true, font: FONT, size: 21 }),
              new TextRun({
                text: `, within fourteen (14) days from the date of publication of this notice, with a copy to the applicant Company at its registered office address mentioned above.`,
                font: FONT,
                size: 21,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `For and on behalf of the Applicant Company\n${comp.toUpperCase()}\n\n\n`,
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '________________________________________\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: `${dir}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `Director (DIN: ${din})\n`, font: FONT, size: 20 }),
              new TextRun({
                text: `Date: ${data.meetingDate || '15/09/2026'}\n`,
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: `Place: ${oldAddr.split(',').pop()?.trim() || 'New Delhi'}`, font: FONT, size: 20 }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Bank Address Change Intimation Letter (.docx)
 */
export async function buildBankIntimationLetterDocx(
  data: Partial<RegisteredOfficeFormData> = {}
): Promise<Buffer> {
  const comp =
    data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const dt = data.meetingDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingDate || '15/09/2026'
  const oldAddr =
    data.oldAddress ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress ||
    '[OLD REGISTERED OFFICE ADDRESS]'
  const newAddr =
    data.newAddress ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress ||
    '[NEW REGISTERED OFFICE ADDRESS]'
  const dir =
    data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'
  const bName =
    data.bankName || DEFAULT_SAMPLE_REG_OFFICE_DATA.bankName || 'HDFC Bank Limited'
  const bBranch =
    data.bankBranch ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.bankBranch ||
    'Connaught Place Branch, New Delhi'
  const bAcc =
    data.bankAccountNumber ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.bankAccountNumber ||
    '50200012345678'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
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
              new TextRun({
                text: `Current Address: ${newAddr}`,
                size: 18,
                italics: true,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({ text: `Date: ${dt}\n\n`, font: FONT, size: 20 }),
              new TextRun({ text: 'To,\n', font: FONT, size: 20 }),
              new TextRun({ text: 'The Branch Manager,\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${bName},\n`, font: FONT, size: 20 }),
              new TextRun({ text: `${bBranch}.\n`, font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({
                text: `SUBJECT: INTIMATION FOR CHANGE OF REGISTERED OFFICE ADDRESS — CURRENT ACCOUNT NO.: ${bAcc}`,
                bold: true,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [new TextRun({ text: 'Dear Sir / Madam,', font: FONT, size: 20 })],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `We wish to inform you that the Board of Directors of ${comp} at its meeting held on ${dt} has approved the shifting of the Registered Office of the Company from:`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: 'Old Address:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${oldAddr}\n\n`, font: FONT, size: 20 }),
              new TextRun({ text: 'New Address:\n', bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `${newAddr}\n`, font: FONT, size: 20 }),
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
                text: `We kindly request you to update the new Registered Office Address in your banking records and system for our Current Account No. ${bAcc}, and forward all future bank correspondence, cheque books, and communication to the new registered address.`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'We enclose the following certified supporting documents for your records:\n',
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '1. Certified True Copy of Board Resolution dated ' + dt + '\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '2. Copy of e-Form INC-22 filed with ROC along with MCA Challan / SRN Receipt\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '3. Proof of Address for New Premises (Electricity Bill / Lease Agreement)\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: '4. Self-attested copy of Company PAN Card\n', font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Thanking you,\n\nYours faithfully,\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: `For ${comp.toUpperCase()}\n\n\n`,
                bold: true,
                font: FONT,
                size: 20,
              }),
              new TextRun({
                text: '________________________________________\n',
                font: FONT,
                size: 20,
              }),
              new TextRun({ text: `${dir}\n`, bold: true, font: FONT, size: 20 }),
              new TextRun({ text: `Authorised Signatory / Director\n`, font: FONT, size: 20 }),
              new TextRun({ text: `DIN: ${din}`, font: FONT, size: 20 }),
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
  const scope = data.shiftingScope || 'same_city'
  const comp =
    data.companyName || DEFAULT_SAMPLE_REG_OFFICE_DATA.companyName || '[COMPANY NAME]'
  const cin = data.cin || DEFAULT_SAMPLE_REG_OFFICE_DATA.cin || '[CIN]'
  const dt = data.meetingDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingDate || '15/09/2026'
  const tm = data.meetingTime || DEFAULT_SAMPLE_REG_OFFICE_DATA.meetingTime || '11:00 A.M.'
  const oldAddr =
    data.oldAddress ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.oldAddress ||
    '[OLD REGISTERED OFFICE ADDRESS]'
  const newAddr =
    data.newAddress ||
    DEFAULT_SAMPLE_REG_OFFICE_DATA.newAddress ||
    '[NEW REGISTERED OFFICE ADDRESS]'
  const effDate = data.effectiveDate || DEFAULT_SAMPLE_REG_OFFICE_DATA.effectiveDate || dt
  const dir =
    data.directorName || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorName || '[DIRECTOR NAME]'
  const din = data.directorDin || DEFAULT_SAMPLE_REG_OFFICE_DATA.directorDin || '09999999'

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  let y = 800
  const margin = 50
  const contentWidth = 495

  const drawCentered = (
    text: string,
    font: any,
    size: number,
    color = rgb(0.1, 0.1, 0.1)
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    const x = (595.28 - textWidth) / 2
    page.drawText(text, { x, y, size, font, color })
    y -= size + 4
  }

  const drawJustified = (
    text: string,
    font: any,
    size: number,
    lineHeight: number
  ) => {
    const words = text.split(' ')
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, size)
      if (width > contentWidth) {
        page.drawText(currentLine, {
          x: margin,
          y,
          size,
          font,
          color: rgb(0.1, 0.1, 0.1),
        })
        y -= lineHeight
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y,
        size,
        font,
        color: rgb(0.1, 0.1, 0.1),
      })
      y -= lineHeight
    }
  }

  // Header
  drawCentered(comp.toUpperCase(), fontBold, 15, rgb(0.05, 0.1, 0.2))
  drawCentered(`CIN: ${cin}`, fontBold, 10, rgb(0.3, 0.3, 0.3))
  drawCentered(`Registered Office: ${oldAddr}`, fontItalic, 8, rgb(0.4, 0.4, 0.4))
  y -= 10

  // Title
  let scopeSubTitle = 'WITHIN SAME CITY / TOWN / VILLAGE'
  let statutoryRef = 'Section 12(5)(a) of Companies Act, 2013'
  if (scope === 'outside_local') {
    scopeSubTitle = 'OUTSIDE LOCAL LIMITS (SAME ROC & STATE)'
    statutoryRef = 'Section 12(5) of Companies Act, 2013'
  } else if (scope === 'different_roc') {
    scopeSubTitle = 'ONE ROC TO ANOTHER ROC WITHIN SAME STATE'
    statutoryRef = 'Section 12(5) second proviso & Rule 28'
  } else if (scope === 'different_state') {
    scopeSubTitle = 'ONE STATE TO ANOTHER (INTER-STATE)'
    statutoryRef = 'Section 12 & Section 13(4) of Companies Act, 2013'
  }

  drawCentered(
    'CERTIFIED TRUE COPY OF BOARD RESOLUTION',
    fontBold,
    11,
    rgb(0.1, 0.1, 0.1)
  )
  drawCentered(
    `SHIFTING OF REGISTERED OFFICE — ${scopeSubTitle}`,
    fontBold,
    10,
    rgb(0.1, 0.3, 0.6)
  )
  drawCentered(
    `Passed at Meeting of Board of Directors held on ${dt} at ${tm}`,
    fontRegular,
    9,
    rgb(0.3, 0.3, 0.3)
  )
  y -= 15

  // Resolution text
  drawJustified(
    `"RESOLVED THAT pursuant to the provisions of ${statutoryRef} read with the applicable Companies (Incorporation) Rules, 2014, the approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:`,
    fontRegular,
    9.5,
    14
  )
  y -= 6

  // Address box
  page.drawRectangle({
    x: margin,
    y: y - 55,
    width: contentWidth,
    height: 55,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.97, 0.98, 1.0),
  })

  page.drawText('From Existing Address: ' + oldAddr, {
    x: margin + 10,
    y: y - 18,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  })
  page.drawText('To New Address: ' + newAddr, {
    x: margin + 10,
    y: y - 35,
    size: 8.5,
    font: fontBold,
    color: rgb(0.05, 0.1, 0.2),
  })
  page.drawText(`Effective Date: ${effDate}`, {
    x: margin + 10,
    y: y - 48,
    size: 8,
    font: fontItalic,
    color: rgb(0.4, 0.4, 0.4),
  })

  y -= 70

  let extraResolutionClause =
    'RESOLVED FURTHER THAT the No Objection Certificate (NOC) and utility bill placed before the meeting be accepted as conclusive proof of right to use the premises as registered office.'
  if (scope !== 'same_city') {
    extraResolutionClause = `RESOLVED FURTHER THAT an Extraordinary General Meeting (EGM) be convened on ${data.egmDate || '10/10/2026'} for passing a Special Resolution of Members, and e-Form MGT-14 and INC-22 be filed with the Registrar of Companies.`
  }

  drawJustified(extraResolutionClause, fontRegular, 9.5, 14)
  y -= 10

  drawJustified(
    `RESOLVED FURTHER THAT ${dir}, Director (DIN: ${din}) be and is hereby authorized to file requisite forms (e-Form INC-22 / MGT-14 / INC-23 / INC-28) with the Registrar of Companies within the statutory timeline, make core field amendments in Form GST REG-14 within 15 days, and intimate banking partners.`,
    fontRegular,
    9.5,
    14
  )
  y -= 25

  // Sign-off & Certification
  page.drawText('CERTIFIED TRUE COPY', {
    x: margin,
    y,
    size: 9.5,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  page.drawText(`For ${comp.toUpperCase()}`, {
    x: margin,
    y: y - 14,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  page.drawText('____________________________________', {
    x: margin,
    y: y - 40,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  })
  page.drawText(`${dir}`, {
    x: margin,
    y: y - 52,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  page.drawText(`Director (DIN: ${din})`, {
    x: margin,
    y: y - 64,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  })
  page.drawText(`Date: ${dt} | Place: ${data.meetingVenue?.split(',').pop()?.trim() || 'New Delhi'}`, {
    x: margin,
    y: y - 76,
    size: 8,
    font: fontItalic,
    color: rgb(0.5, 0.5, 0.5),
  })

  return await pdfDoc.save()
}
