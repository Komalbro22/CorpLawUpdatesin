import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from 'docx'
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'

export type LoanFacilityType =
  | 'term_loan'
  | 'working_capital'
  | 'cash_credit'
  | 'overdraft'
  | 'bank_guarantee_lc'
  | 'unsecured_loan'
  | 'composite'

export type SecurityType =
  | 'hypothecation_movables'
  | 'equitable_mortgage'
  | 'hypothecation_and_mortgage'
  | 'unsecured'
  | 'personal_guarantee'

export type SigningAuthority = 'any_one' | 'both_jointly' | 'director_or_cs'

export interface BankLoanFormData {
  facilityType: LoanFacilityType
  companyName: string
  cin: string
  companyType: 'private' | 'public' | 'opc'
  registeredOffice: string
  meetingDate: string
  meetingTime: string
  meetingVenue: string
  chairpersonName: string
  directorsPresent: string
  bankName: string
  bankBranch: string
  bankAddress: string
  sanctionLetterNo: string
  sanctionLetterDate: string
  facilityName: string
  loanAmount: number
  loanAmountWords: string
  interestRate: string
  tenure: string
  repaymentTerms: string
  loanPurpose: string
  securityType: SecurityType
  securityDescription: string
  isPariPassu: boolean
  pariPassuLenders: string
  personalGuarantors: string
  director1Name: string
  director1Din: string
  director2Name: string
  director2Din: string
  signingAuthority: SigningAuthority
  commonSealRequired: boolean
  hasChg1Filing: boolean
  certifiedDate: string

  // Section 180(1)(c) Borrowing Limits Fields
  paidUpCapital: number
  freeReserves: number
  securitiesPremium: number
  existingBorrowings: number
  egmDate: string
  egmTime: string
  egmVenue: string
}

export const DEFAULT_SAMPLE_BANK_LOAN_DATA: BankLoanFormData = {
  facilityType: 'term_loan',
  companyName: 'ACME TECHNOLOGIES PRIVATE LIMITED',
  cin: 'U72900DL2022PTC123456',
  companyType: 'private',
  registeredOffice: 'Plot No. 42, Okhla Industrial Area, Phase-III, New Delhi - 110020',
  meetingDate: '15/09/2026',
  meetingTime: '11:00 A.M.',
  meetingVenue: 'Registered Office of the Company at New Delhi',
  chairpersonName: 'Mr. Rajesh Sharma',
  directorsPresent:
    '1. Mr. Rajesh Sharma (Director & Chairperson, DIN: 01234567)\n2. Ms. Sunita Sharma (Director, DIN: 02345678)\n3. Mr. Amit Verma (Whole-time Director, DIN: 03456789)',
  bankName: 'State Bank of India',
  bankBranch: 'Commercial Branch, Barakhamba Road, Connaught Place, New Delhi',
  bankAddress: '11, Parliament Street, New Delhi - 110001',
  sanctionLetterNo: 'SBI/CB/ADV/2026-27/842',
  sanctionLetterDate: '02/09/2026',
  facilityName: 'Term Loan Facility',
  loanAmount: 15000000,
  loanAmountWords: 'Rupees One Crore Fifty Lakh Only',
  interestRate: '9.15% per annum floating linked to 1-Year MCLR / EBLR plus spread',
  tenure: '60 Months (including 6-month moratorium on principal repayment)',
  repaymentTerms: 'In 54 equated monthly instalments of principal plus monthly servicing of interest',
  loanPurpose: 'Procurement of advanced automated manufacturing machinery and factory modernization',
  securityType: 'hypothecation_movables',
  securityDescription:
    'First exclusive charge by way of hypothecation over all present and future plant, machinery, equipment, tools, and accessories purchased out of the bank facility, along with hypothecation of current assets.',
  isPariPassu: false,
  pariPassuLenders: '',
  personalGuarantors: 'Mr. Rajesh Sharma (Director) and Ms. Sunita Sharma (Director)',
  director1Name: 'Mr. Rajesh Sharma',
  director1Din: '01234567',
  director2Name: 'Ms. Sunita Sharma',
  director2Din: '02345678',
  signingAuthority: 'any_one',
  commonSealRequired: false,
  hasChg1Filing: true,
  certifiedDate: '15/09/2026',

  // Limits
  paidUpCapital: 5000000,
  freeReserves: 8000000,
  securitiesPremium: 2000000,
  existingBorrowings: 4000000,
  egmDate: '08/10/2026',
  egmTime: '11:30 A.M.',
  egmVenue: 'Registered Office of the Company / through Video Conferencing (VC/OAVM)',
}

const FONT = 'Times New Roman'

export function calculateBorrowingLimit(data: Partial<BankLoanFormData>) {
  const paidUpCapital = Number(data.paidUpCapital) || 0
  const freeReserves = Number(data.freeReserves) || 0
  const securitiesPremium = Number(data.securitiesPremium) || 0
  const existingBorrowings = Number(data.existingBorrowings) || 0
  const loanAmount = Number(data.loanAmount) || 0

  const statutoryCap = paidUpCapital + freeReserves + securitiesPremium
  const totalBorrowingsAfterLoan = existingBorrowings + loanAmount
  const isExceeding = totalBorrowingsAfterLoan > statutoryCap
  const isExempt = (data.companyType || 'private') === 'private'
  const specialResolutionRequired = isExceeding && !isExempt

  return {
    paidUpCapital,
    freeReserves,
    securitiesPremium,
    statutoryCap,
    existingBorrowings,
    loanAmount,
    totalBorrowingsAfterLoan,
    isExceeding,
    isExempt,
    specialResolutionRequired,
    excessAmount: Math.max(0, totalBorrowingsAfterLoan - statutoryCap),
  }
}

export function formatInrCurrency(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

/**
 * Builds Certified True Copy of Board Resolution (.docx)
 */
export async function buildBankLoanBoardResolutionDocx(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Buffer> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }
  const limits = calculateBorrowingLimit(data)

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const dt = data.meetingDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingDate
  const tm = data.meetingTime || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingTime
  const venue = data.meetingVenue || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingVenue
  const chair = data.chairpersonName || DEFAULT_SAMPLE_BANK_LOAN_DATA.chairpersonName
  const dirPresent = data.directorsPresent || DEFAULT_SAMPLE_BANK_LOAN_DATA.directorsPresent
  const bank = data.bankName || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankName
  const branch = data.bankBranch || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankBranch
  const sanctionNo = data.sanctionLetterNo || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterNo
  const sanctionDate = data.sanctionLetterDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterDate
  const facility = data.facilityName || DEFAULT_SAMPLE_BANK_LOAN_DATA.facilityName
  const amtFormatted = formatInrCurrency(data.loanAmount || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmount)
  const amtWords = data.loanAmountWords || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmountWords
  const interest = data.interestRate || DEFAULT_SAMPLE_BANK_LOAN_DATA.interestRate
  const tenure = data.tenure || DEFAULT_SAMPLE_BANK_LOAN_DATA.tenure
  const repayment = data.repaymentTerms || DEFAULT_SAMPLE_BANK_LOAN_DATA.repaymentTerms
  const purpose = data.loanPurpose || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanPurpose
  const security = data.securityDescription || DEFAULT_SAMPLE_BANK_LOAN_DATA.securityDescription
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din
  const dir2 = data.director2Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director2Name
  const din2 = data.director2Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director2Din
  const certDate = data.certifiedDate || dt
  const isUnsecured = data.facilityType === 'unsecured_loan' || data.securityType === 'unsecured'

  const signingClauseText =
    data.signingAuthority === 'both_jointly'
      ? `${dir1}, Director (DIN: ${din1}) and ${dir2}, Director (DIN: ${din2}) jointly`
      : data.signingAuthority === 'director_or_cs'
      ? `${dir1}, Director (DIN: ${din1}) or the Company Secretary of the Company severally`
      : `${dir1}, Director (DIN: ${din1}) or ${dir2}, Director (DIN: ${din2}) severally`

  const paragraphs: Paragraph[] = [
    // Header
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: comp, bold: true, size: 28, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `CIN: ${cin}`, bold: true, size: 20, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Regd. Office: ${regOffice}`,
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
          text: `HELD ON ${dt} AT ${tm} AT ${venue.toUpperCase()}`,
          bold: true,
          size: 20,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Meeting Record
    new Paragraph({
      children: [
        new TextRun({ text: 'PRESENT:', bold: true, size: 20, font: FONT, underline: {} }),
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

    // Subject
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `APPROVAL FOR AVAILING ${facility.toUpperCase()} OF ${amtFormatted} FROM ${bank.toUpperCase()}`,
          bold: true,
          size: 21,
          font: FONT,
          underline: {},
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Recital
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `The Chairperson informed the Board that in order to meet the financial requirements for ${purpose}, the Company had approached ${bank}, ${branch} for sanctioning of credit facilities. The Board was further apprised that ${bank} has vide its Sanction Letter bearing Reference No. ${sanctionNo} dated ${sanctionDate} sanctioned the ${facility} of ${amtFormatted} (${amtWords}) upon the terms and conditions mentioned therein. A copy of the said Sanction Letter was placed on the table before the Board and the terms and conditions were deliberated upon.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Resolution 1: Approval & Acceptance
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `pursuant to the provisions of Section 179(3)(d) of the Companies Act, 2013 read with the applicable Rules made thereunder and other applicable provisions (including any statutory modification(s) or re-enactment(s) thereof for the time being in force), and in accordance with the enabling provisions in the Memorandum and Articles of Association of the Company, the consent and approval of the Board of Directors of the Company be and is hereby accorded to avail credit facility in the nature of ${facility} up to an aggregate principal limit of ${amtFormatted} (${amtWords}) from ${bank}, ${branch} for the purpose of ${purpose}, on the terms, conditions, rate of interest, and repayment schedule as stipulated by the Bank in its Sanction Letter dated ${sanctionDate}.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Resolution 2: Key Financial Terms
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `the Company accepts the key terms and commercial conditions governing the facility as follows:`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `• Facility Type: `, bold: true, size: 20, font: FONT }),
        new TextRun({ text: facility, size: 20, font: FONT }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `• Sanctioned Limit: `, bold: true, size: 20, font: FONT }),
        new TextRun({ text: `${amtFormatted} (${amtWords})`, size: 20, font: FONT }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `• Rate of Interest: `, bold: true, size: 20, font: FONT }),
        new TextRun({ text: interest, size: 20, font: FONT }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `• Tenure & Repayment: `, bold: true, size: 20, font: FONT }),
        new TextRun({ text: `${tenure}; Repayable ${repayment}`, size: 20, font: FONT }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Resolution 3: Creation of Security / Charge
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: isUnsecured
            ? `the credit facility availed from ${bank} shall be clean and unsecured, and no mortgage, charge, hypothecation, pledge, or other encumbrance shall be created on any of the movable, immovable, or intangible assets or properties of the Company.`
            : `for securing the due repayment of the principal amount together with interest, compound interest, additional interest, penal charges, commitment charges, costs, and other monies payable by the Company to ${bank} under the said facility, the consent of the Board be and is hereby accorded for the creation of security by way of ${security} in favour of ${bank}${data.isPariPassu ? ` on a pari-passu basis with ${data.pariPassuLenders || 'existing consortium lenders'}` : ' on an exclusive first charge basis'}.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Resolution 4: Execution Authority
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `${signingClauseText} be and is/are hereby authorized on behalf of the Company to negotiate, finalize, accept, and sign the duplicate copy of the Sanction Letter, Loan Agreement, Hypothecation Deed, Mortgage Deeds, Demand Promissory Notes, Deeds of Guarantee, Indemnity Bonds, Letters of Continuity, Undertakings, and all such other agreements, declarations, and deeds as may be required by ${bank} from time to time in connection with the availment of the said credit facility.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Resolution 5: Common Seal / Execution under Section 22
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: data.commonSealRequired
            ? `the Common Seal of the Company, if required to be affixed on any of the loan agreements, hypothecation deeds, or security documents, be affixed in the presence of any one of the aforementioned authorized Directors who shall sign the same in token thereof pursuant to the Articles of Association of the Company.`
            : `pursuant to the provisions of Section 22 of the Companies Act, 2013 as amended, the Company not maintaining a Common Seal, any document, contract, or agreement executed on behalf of the Company by any two Directors or by a Director and the Company Secretary shall have the same effect as if executed under the Common Seal of the Company.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Resolution 6: ROC Form CHG-1 Filing
    ...(data.hasChg1Filing && !isUnsecured
      ? [
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `pursuant to Section 77 of the Companies Act, 2013 read with Rule 3 of the Companies (Registration of Charges) Rules, 2014, ${dir1}, Director (DIN: ${din1}) or ${dir2}, Director (DIN: ${din2}) or the Company Secretary of the Company be and is hereby authorized to file statutory e-Form CHG-1 with the Registrar of Companies (ROC) within 30 days of the execution of the charge documents, along with the certified true copy of the resolution and executed security deeds, and to do all such acts, deeds, and things as may be necessary to register the charge and obtain the Certificate of Registration of Charge (Form CHG-2) from the Registrar of Companies.`,
                size: 21,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
        ]
      : []),

    // Resolution 7: Certification
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `a certified true copy of this resolution signed by any Director or Company Secretary of the Company be furnished to ${bank} and that the Bank be requested to act upon the same."`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),

    // Signature Block
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `For ${comp}`, bold: true, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `(${dir1})`, bold: true, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `Director / Authorised Signatory`, size: 20, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `DIN: ${din1}`, size: 20, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({ text: `Date: ${certDate}`, size: 20, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({ text: `Place: New Delhi`, size: 20, font: FONT }),
      ],
    }),
  ]

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Section 180(1)(c) Special Resolution (.docx)
 */
export async function buildBankLoanSpecialResolutionDocx(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Buffer> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }
  const limits = calculateBorrowingLimit(data)

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const egmDt = data.egmDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.egmDate
  const egmTm = data.egmTime || DEFAULT_SAMPLE_BANK_LOAN_DATA.egmTime
  const egmVn = data.egmVenue || DEFAULT_SAMPLE_BANK_LOAN_DATA.egmVenue
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din
  const capFormatted = formatInrCurrency(limits.statutoryCap)
  const proposedBorrowingLimit = formatInrCurrency(limits.totalBorrowingsAfterLoan * 1.5)

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: comp, bold: true, size: 28, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `CIN: ${cin}`, bold: true, size: 20, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Regd. Office: ${regOffice}`,
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
          text: 'SPECIAL RESOLUTION PASSED BY THE MEMBERS AT EXTRAORDINARY GENERAL MEETING (EGM)',
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
          text: `HELD ON ${egmDt} AT ${egmTm} AT ${egmVn.toUpperCase()}`,
          bold: true,
          size: 20,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Item Heading
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: 'ITEM NO. 1: APPROVAL FOR BORROWING MONIES IN EXCESS OF AGGREGATE OF PAID-UP SHARE CAPITAL, FREE RESERVES AND SECURITIES PREMIUM UNDER SECTION 180(1)(c)',
          bold: true,
          size: 21,
          font: FONT,
          underline: {},
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Resolution Text
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `pursuant to the provisions of Section 180(1)(c) and other applicable provisions, if any, of the Companies Act, 2013 read with the Companies (Meetings of Board and its Powers) Rules, 2014 (including any statutory modification(s) or re-enactment(s) thereof), and the Memorandum and Articles of Association of the Company, the consent of the Members of the Company be and is hereby accorded to the Board of Directors of the Company (hereinafter referred to as the "Board", which term shall be deemed to include any Committee thereof) to borrow from time to time, any sum or sums of monies, on such terms and conditions and with or without security as the Board may deem fit, which together with the monies already borrowed by the Company (apart from temporary loans obtained or to be obtained from the Company\'s bankers in the ordinary course of business) may exceed the aggregate of the paid-up share capital, free reserves, and securities premium of the Company, provided that the total amount so borrowed and outstanding at any one time shall not exceed the limit of ${proposedBorrowingLimit} (Rupees Equivalent).`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `pursuant to Section 180(1)(a) of the Companies Act, 2013, the consent of the Members be and is hereby accorded to the Board to create such charges, mortgages, and hypothecations on the whole or substantially the whole of any one or more of the undertakings of the Company, both present and future, in favour of banks, financial institutions, or lenders to secure the borrowings within the limits approved above.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `the Board of Directors be and is hereby authorized to file e-Form MGT-14 with the Registrar of Companies within 30 days of passing this resolution and to do all such acts, deeds, and things as may be necessary to give effect to this resolution."`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Explanatory Statement
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013',
          bold: true,
          size: 21,
          font: FONT,
          underline: {},
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `Pursuant to Section 180(1)(c) of the Companies Act, 2013, the Board of Directors cannot borrow money exceeding the aggregate of the paid-up share capital, free reserves, and securities premium without obtaining prior approval of the shareholders by way of a Special Resolution. As on date, the paid-up share capital of the Company is ${formatInrCurrency(limits.paidUpCapital)}, free reserves are ${formatInrCurrency(limits.freeReserves)}, and securities premium is ${formatInrCurrency(limits.securitiesPremium)}, aggregating to ${capFormatted}. In view of expanding business operations and capital expenditure requirements, total borrowings are projected to exceed this statutory ceiling. Accordingly, the Board recommends the Special Resolution set out in Item No. 1 for approval by the Members. None of the Directors or Key Managerial Personnel (KMP) of the Company or their relatives are financially or otherwise interested in this resolution, except to the extent of their shareholding.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),

    // Sign
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `For ${comp}`, bold: true, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `(${dir1})`, bold: true, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `Director (DIN: ${din1})`, size: 20, font: FONT }),
      ],
    }),
  ]

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Bank Covering Letter (.docx)
 */
export async function buildBankCoveringLetterDocx(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Buffer> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const bank = data.bankName || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankName
  const branch = data.bankBranch || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankBranch
  const bankAddr = data.bankAddress || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankAddress
  const sanctionNo = data.sanctionLetterNo || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterNo
  const sanctionDate = data.sanctionLetterDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterDate
  const facility = data.facilityName || DEFAULT_SAMPLE_BANK_LOAN_DATA.facilityName
  const amtFormatted = formatInrCurrency(data.loanAmount || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmount)
  const dt = data.certifiedDate || data.meetingDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingDate
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din

  const isUnsecured = data.facilityType === 'unsecured_loan' || data.securityType === 'unsecured'

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: comp, bold: true, size: 28, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `CIN: ${cin}`, bold: true, size: 20, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Registered Office: ${regOffice}`,
          size: 18,
          italics: true,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      children: [new TextRun({ text: `Date: ${dt}`, size: 21, font: FONT })],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      children: [new TextRun({ text: 'To,', size: 21, font: FONT })],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'The Chief Manager / Branch Manager,', size: 21, font: FONT }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${bank},`, bold: true, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${branch},`, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: bankAddr, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `Subject: Submission of Board Resolution and Acceptance of Sanction Terms for ${facility} of ${amtFormatted} (Sanction Ref: ${sanctionNo})`,
          bold: true,
          size: 21,
          font: FONT,
          underline: {},
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Dear Sir / Madam,', size: 21, font: FONT }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `We refer to your Sanction Letter bearing Reference No. ${sanctionNo} dated ${sanctionDate} regarding sanction of ${facility} of ${amtFormatted} to our Company.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `In this regard, we are pleased to inform you that the Board of Directors of the Company at its duly convened meeting held on ${data.meetingDate} has approved the availment of the said facility and accepted all terms and conditions outlined in the Sanction Letter.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      children: [
        new TextRun({
          text: 'We enclose herewith the following statutory documents for your records and disbursement processing:',
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '1. ', bold: true, size: 20, font: FONT }),
        new TextRun({
          text: 'Certified True Copy of the Board Resolution passed on ' + data.meetingDate,
          size: 20,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '2. ', bold: true, size: 20, font: FONT }),
        new TextRun({
          text: 'Duplicate copy of Sanction Letter duly signed by the Authorised Directors as token of acceptance',
          size: 20,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '3. ', bold: true, size: 20, font: FONT }),
        new TextRun({
          text: isUnsecured
            ? 'Duly signed Clean Loan Agreement and Promissory Notes'
            : 'Duly signed Loan Agreement and Hypothecation / Security Deeds',
          size: 20,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '4. ', bold: true, size: 20, font: FONT }),
        new TextRun({
          text: 'List of Directors with DIN and attested specimen signatures of Authorised Signatories',
          size: 20,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '5. ', bold: true, size: 20, font: FONT }),
        new TextRun({
          text: 'Statutory Declaration under Section 179(3)(d) and Section 180(1)(c) of the Companies Act, 2013',
          size: 20,
          font: FONT,
        }),
      ],
    }),
    ...(!isUnsecured && data.hasChg1Filing
      ? [
          new Paragraph({
            children: [
              new TextRun({ text: '6. ', bold: true, size: 20, font: FONT }),
              new TextRun({
                text: 'Undertaking to file e-Form CHG-1 with ROC within 30 days and provide Certificate of Registration of Charge (CHG-2)',
                size: 20,
                font: FONT,
              }),
            ],
          }),
        ]
      : []),
    new Paragraph({ text: '' }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `You are kindly requested to process the documentation and disburse the sanctioned facility at the earliest.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [new TextRun({ text: 'Thanking you,', size: 21, font: FONT })],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Yours faithfully,', size: 21, font: FONT })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `For ${comp}`, bold: true, size: 21, font: FONT })],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [new TextRun({ text: `(${dir1})`, bold: true, size: 21, font: FONT })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `Director / Authorised Signatory (DIN: ${din1})`, size: 20, font: FONT })],
    }),
  ]

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Builds Form CHG-1 Board Resolution Extract (.docx)
 */
export async function buildChg1ExtractDocx(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Buffer> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const dt = data.meetingDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingDate
  const bank = data.bankName || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankName
  const branch = data.bankBranch || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankBranch
  const facility = data.facilityName || DEFAULT_SAMPLE_BANK_LOAN_DATA.facilityName
  const amtFormatted = formatInrCurrency(data.loanAmount || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmount)
  const amtWords = data.loanAmountWords || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmountWords
  const security = data.securityDescription || DEFAULT_SAMPLE_BANK_LOAN_DATA.securityDescription
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: comp, bold: true, size: 28, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `CIN: ${cin}`, bold: true, size: 20, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Regd. Office: ${regOffice}`,
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
          text: 'EXTRACT OF THE RESOLUTION PASSED BY THE BOARD OF DIRECTORS AUTHORIZING CREATION OF CHARGE UNDER SECTION 77 OF THE COMPANIES ACT, 2013 (FOR MCA E-FORM CHG-1)',
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
          text: `AT ITS MEETING HELD ON ${dt}`,
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
        new TextRun({ text: 'RESOLVED THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `pursuant to the provisions of Section 77, 179(3)(d), and other applicable provisions of the Companies Act, 2013 read with the Companies (Registration of Charges) Rules, 2014, the consent of the Board of Directors be and is hereby accorded to create security by way of ${security} in favour of ${bank}, ${branch} for securing the ${facility} of ${amtFormatted} (${amtWords}) sanctioned to the Company.`,
          size: 21,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
        new TextRun({
          text: `${dir1}, Director (DIN: ${din1}) or the Company Secretary of the Company be and is hereby authorized to file statutory e-Form CHG-1 on the MCA V3 portal within 30 days of the creation of the charge, sign the forms digitally, upload requisite documents, pay statutory filing fees, and do all such acts, deeds, and things as may be necessary for registering the charge with the Registrar of Companies."`,
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
        new TextRun({ text: `For ${comp}`, bold: true, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `(${dir1})`, bold: true, size: 21, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `Director (DIN: ${din1})`, size: 20, font: FONT }),
      ],
    }),
  ]

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

function sanitizePdfText(str: string): string {
  if (!str) return ''
  return str
    .replace(/₹/g, 'Rs. ')
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

  private drawSingleParagraph(
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
    const paragraphs = text.split('\n')
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const pText = paragraphs[pIdx].trim()
      if (!pText) {
        this.y -= (options.lineHeight || 13.5) / 2
        continue
      }
      const isFirstPara = pIdx === 0
      const boldPrefix = isFirstPara ? options.boldPrefix : undefined
      this.drawSingleParagraph(pText, { ...options, boldPrefix })
    }
  }

  drawBoxedTerms(terms: Array<{ label: string; value: string }>) {
    const boxPadding = 8
    const lineH = 13
    const totalH = terms.length * lineH + boxPadding * 2 + 2
    this.ensureSpace(totalH + 8)

    const boxY = this.y - totalH
    this.currentPage.drawRectangle({
      x: this.margin,
      y: boxY,
      width: this.contentWidth,
      height: totalH,
      borderColor: rgb(0.8, 0.83, 0.88),
      borderWidth: 0.75,
      color: rgb(0.97, 0.98, 0.99),
    })

    let curY = this.y - boxPadding - 9
    for (const term of terms) {
      const cleanLabel = sanitizePdfText(term.label)
      const cleanVal = sanitizePdfText(term.value)
      const labelText = `- ${cleanLabel}: `
      const labelW = this.fontBold.widthOfTextAtSize(labelText, 8.5)
      this.currentPage.drawText(labelText, {
        x: this.margin + boxPadding,
        y: curY,
        size: 8.5,
        font: this.fontBold,
        color: rgb(0.1, 0.2, 0.4),
      })
      this.currentPage.drawText(cleanVal, {
        x: this.margin + boxPadding + labelW,
        y: curY,
        size: 8.5,
        font: this.fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      })
      curY -= lineH
    }
    this.y = boxY - 8
  }

  drawSignatureBlock(options: {
    companyName: string
    directorName: string
    directorDin: string
    certifiedDate: string
    place: string
    designation?: string
  }) {
    const blockHeight = 90
    this.ensureSpace(blockHeight)

    this.currentPage.drawText('CERTIFIED TRUE COPY', {
      x: this.margin,
      y: this.y,
      size: 9.5,
      font: this.fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })

    const compText = sanitizePdfText(`For ${options.companyName.toUpperCase()}`)
    const alignRightX = this.pageWidth - this.margin - 180

    this.currentPage.drawText(compText, {
      x: alignRightX,
      y: this.y,
      size: 9,
      font: this.fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })

    this.y -= 38

    const signerName = sanitizePdfText(`(${options.directorName})`)
    const desig = sanitizePdfText(options.designation || 'Director / Authorised Signatory')
    const dinText = sanitizePdfText(`DIN: ${options.directorDin}`)

    this.currentPage.drawText(signerName, {
      x: alignRightX,
      y: this.y,
      size: 9,
      font: this.fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })

    this.currentPage.drawText(desig, {
      x: alignRightX,
      y: this.y - 12,
      size: 8.5,
      font: this.fontRegular,
      color: rgb(0.35, 0.35, 0.35),
    })

    this.currentPage.drawText(dinText, {
      x: alignRightX,
      y: this.y - 24,
      size: 8.5,
      font: this.fontRegular,
      color: rgb(0.35, 0.35, 0.35),
    })

    const dateText = sanitizePdfText(`Date: ${options.certifiedDate}`)
    const placeText = sanitizePdfText(`Place: ${options.place}`)

    this.currentPage.drawText(dateText, {
      x: this.margin,
      y: this.y - 12,
      size: 8.5,
      font: this.fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    })
    this.currentPage.drawText(placeText, {
      x: this.margin,
      y: this.y - 24,
      size: 8.5,
      font: this.fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    })

    this.y -= 35
  }

  addFooters(footerLeft: string) {
    const cleanFooter = sanitizePdfText(footerLeft)
    const totalPages = this.doc.getPageCount()
    for (let i = 0; i < totalPages; i++) {
      const page = this.doc.getPage(i)
      page.drawLine({
        start: { x: this.margin, y: 34 },
        end: { x: this.pageWidth - this.margin, y: 34 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })

      page.drawText(cleanFooter, {
        x: this.margin,
        y: 22,
        size: 7.5,
        font: this.fontItalic,
        color: rgb(0.45, 0.45, 0.45),
      })

      const pageStr = `Page ${i + 1} of ${totalPages}`
      const pageW = this.fontRegular.widthOfTextAtSize(pageStr, 7.5)
      page.drawText(pageStr, {
        x: this.pageWidth - this.margin - pageW,
        y: 22,
        size: 7.5,
        font: this.fontRegular,
        color: rgb(0.45, 0.45, 0.45),
      })
    }
  }

  async save(): Promise<Uint8Array> {
    return await this.doc.save()
  }
}

/**
 * Builds authentic Certified True Copy of Board Resolution (.pdf) using pdf-lib
 */
export async function buildBankLoanBoardResolutionPdf(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Uint8Array> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }
  const builder = await LegalDocBuilder.create()

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const dt = data.meetingDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingDate
  const tm = data.meetingTime || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingTime
  const venue = data.meetingVenue || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingVenue
  const chair = data.chairpersonName || DEFAULT_SAMPLE_BANK_LOAN_DATA.chairpersonName
  const bank = data.bankName || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankName
  const branch = data.bankBranch || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankBranch
  const sanctionNo = data.sanctionLetterNo || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterNo
  const sanctionDate = data.sanctionLetterDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterDate
  const facility = data.facilityName || DEFAULT_SAMPLE_BANK_LOAN_DATA.facilityName
  const amtFormatted = formatInrCurrency(data.loanAmount || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmount)
  const amtWords = data.loanAmountWords || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmountWords
  const interest = data.interestRate || DEFAULT_SAMPLE_BANK_LOAN_DATA.interestRate
  const tenure = data.tenure || DEFAULT_SAMPLE_BANK_LOAN_DATA.tenure
  const repayment = data.repaymentTerms || DEFAULT_SAMPLE_BANK_LOAN_DATA.repaymentTerms
  const purpose = data.loanPurpose || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanPurpose
  const security = data.securityDescription || DEFAULT_SAMPLE_BANK_LOAN_DATA.securityDescription
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din
  const dir2 = data.director2Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director2Name
  const din2 = data.director2Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director2Din
  const isUnsecured = data.facilityType === 'unsecured_loan' || data.securityType === 'unsecured'

  const signingClauseText =
    data.signingAuthority === 'both_jointly'
      ? `${dir1}, Director (DIN: ${din1}) and ${dir2}, Director (DIN: ${din2}) jointly`
      : data.signingAuthority === 'director_or_cs'
      ? `${dir1}, Director (DIN: ${din1}) or the Company Secretary of the Company severally`
      : `${dir1}, Director (DIN: ${din1}) or ${dir2}, Director (DIN: ${din2}) severally`

  // Letterhead Header
  builder.drawCentered(comp, builder.fontBold, 13, rgb(0.05, 0.12, 0.25))
  builder.drawCentered(`CIN: ${cin}`, builder.fontBold, 8.5, rgb(0.3, 0.3, 0.3))
  builder.drawCentered(`Regd. Office: ${regOffice}`, builder.fontItalic, 7.5, rgb(0.4, 0.4, 0.4))
  builder.drawDivider(5)

  // Document Title
  builder.drawCentered(
    'CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF THE COMPANY',
    builder.fontBold,
    9.5,
    rgb(0.1, 0.1, 0.1),
    2
  )
  builder.drawCentered(
    `HELD ON ${dt} AT ${tm} AT ${venue.toUpperCase()}`,
    builder.fontBold,
    8.5,
    rgb(0.25, 0.25, 0.25),
    6
  )

  // Directors Present & Chair
  builder.drawParagraph('PRESENT:', { boldPrefix: 'PRESENT:', size: 8.5, extraSpacing: 1 })
  const directorsLines = (data.directorsPresent || DEFAULT_SAMPLE_BANK_LOAN_DATA.directorsPresent)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  for (const line of directorsLines) {
    builder.drawParagraph(line, { size: 8, lineHeight: 11.5, extraSpacing: 1, indent: 8 })
  }
  builder.drawParagraph(`${chair}, Director, took the Chair.`, {
    boldPrefix: 'CHAIRPERSON: ',
    size: 8.5,
    extraSpacing: 6,
  })

  // Subject Banner
  builder.drawCentered(
    `APPROVAL FOR AVAILING ${facility.toUpperCase()} OF ${amtFormatted} FROM ${bank.toUpperCase()}`,
    builder.fontBold,
    9,
    rgb(0.08, 0.2, 0.45),
    6
  )

  // Recital
  builder.drawParagraph(
    `The Chairperson informed the Board that in order to meet the financial requirements for ${purpose}, the Company had approached ${bank}, ${branch} for sanctioning of credit facilities. The Board was further apprised that ${bank} has vide its Sanction Letter bearing Reference No. ${sanctionNo} dated ${sanctionDate} sanctioned the ${facility} of ${amtFormatted} (${amtWords}) upon the terms and conditions mentioned therein. A copy of the said Sanction Letter was placed on the table before the Board and the terms and conditions were deliberated upon.`,
    { size: 8.5, lineHeight: 12.5, extraSpacing: 5 }
  )

  // Resolution 1
  builder.drawParagraph(
    `pursuant to the provisions of Section 179(3)(d) of the Companies Act, 2013 read with the applicable Rules made thereunder and other applicable provisions (including any statutory modification(s) or re-enactment(s) thereof for the time being in force), and in accordance with the enabling provisions in the Memorandum and Articles of Association of the Company, the consent and approval of the Board of Directors of the Company be and is hereby accorded to avail credit facility in the nature of ${facility} up to an aggregate principal limit of ${amtFormatted} (${amtWords}) from ${bank}, ${branch} for the purpose of ${purpose}, on the terms, conditions, rate of interest, and repayment schedule as stipulated by the Bank in its Sanction Letter dated ${sanctionDate}.`,
    { boldPrefix: 'RESOLVED THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 5 }
  )

  // Resolution 2 (Terms)
  builder.drawParagraph(
    `the Company accepts the key terms and commercial conditions governing the facility as follows:`,
    { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 3 }
  )

  builder.drawBoxedTerms([
    { label: 'Facility Type', value: facility },
    { label: 'Sanctioned Limit', value: `${amtFormatted} (${amtWords})` },
    { label: 'Rate of Interest', value: interest },
    { label: 'Tenure & Repayment', value: `${tenure}; Repayable ${repayment}` },
  ])

  // Resolution 3 (Security)
  if (isUnsecured) {
    builder.drawParagraph(
      `the credit facility availed from ${bank} shall be clean and unsecured, and no mortgage, charge, hypothecation, pledge, or other encumbrance shall be created on any of the movable, immovable, or intangible assets or properties of the Company.`,
      { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 5 }
    )
  } else {
    builder.drawParagraph(
      `for securing the due repayment of the principal amount together with interest, compound interest, additional interest, penal charges, commitment charges, costs, and other monies payable by the Company to ${bank} under the said facility, the consent of the Board be and is hereby accorded for the creation of security by way of ${security} in favour of ${bank}${data.isPariPassu ? ` on a pari-passu basis with ${data.pariPassuLenders || 'existing consortium lenders'}` : ' on an exclusive first charge basis'}.`,
      { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 5 }
    )
  }

  // Resolution 4 (Execution Authority)
  builder.drawParagraph(
    `${signingClauseText} be and is/are hereby authorized on behalf of the Company to negotiate, finalize, accept, and sign the duplicate copy of the Sanction Letter, Loan Agreement, Hypothecation Deed, Mortgage Deeds, Demand Promissory Notes, Deeds of Guarantee, Indemnity Bonds, Letters of Continuity, Undertakings, and all such other agreements, declarations, and deeds as may be required by ${bank} from time to time in connection with the availment of the said credit facility.`,
    { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 5 }
  )

  // Resolution 5 (Seal / Section 22)
  const sealClause = data.commonSealRequired
    ? `the Common Seal of the Company, if required to be affixed on any of the loan agreements, hypothecation deeds, or security documents, be affixed in the presence of any one of the aforementioned authorized Directors who shall sign the same in token thereof pursuant to the Articles of Association of the Company.`
    : `pursuant to the provisions of Section 22 of the Companies Act, 2013 as amended, the Company not maintaining a Common Seal, any document, contract, or agreement executed on behalf of the Company by any two Directors or by a Director and the Company Secretary shall have the same effect as if executed under the Common Seal of the Company.`
  builder.drawParagraph(sealClause, {
    boldPrefix: 'RESOLVED FURTHER THAT ',
    size: 8.5,
    lineHeight: 12.5,
    extraSpacing: 5,
  })

  // Resolution 6 (ROC Form CHG-1)
  if (data.hasChg1Filing && !isUnsecured) {
    builder.drawParagraph(
      `pursuant to Section 77 of the Companies Act, 2013 read with Rule 3 of the Companies (Registration of Charges) Rules, 2014, ${dir1}, Director (DIN: ${din1}) or ${dir2}, Director (DIN: ${din2}) or the Company Secretary of the Company be and is hereby authorized to file statutory e-Form CHG-1 with the Registrar of Companies (ROC) within 30 days of the execution of the charge documents, along with the certified true copy of the resolution and executed security deeds, and to do all such acts, deeds, and things as may be necessary to register the charge and obtain the Certificate of Registration of Charge (Form CHG-2) from the Registrar of Companies.`,
      { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 5 }
    )
  }

  // Resolution 7 (Certification)
  builder.drawParagraph(
    `a certified true copy of this resolution signed by any Director or Company Secretary of the Company be furnished to ${bank} and that the Bank be requested to act upon the same."`,
    { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 8 }
  )

  // Signature Block
  builder.drawSignatureBlock({
    companyName: comp,
    directorName: dir1,
    directorDin: din1,
    certifiedDate: data.certifiedDate || dt,
    place: data.meetingVenue?.split(',').pop()?.trim() || 'New Delhi',
  })

  builder.addFooters(`Certified True Copy • Board Resolution under Section 179(3)(d) • ${comp}`)

  return await builder.save()
}

/**
 * Builds authentic Special Resolution under Section 180(1)(c) (.pdf) using pdf-lib
 */
export async function buildBankLoanSpecialResolutionPdf(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Uint8Array> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }
  const limits = calculateBorrowingLimit(data)
  const builder = await LegalDocBuilder.create()

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const egmDate = data.egmDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.egmDate
  const egmTime = data.egmTime || DEFAULT_SAMPLE_BANK_LOAN_DATA.egmTime
  const egmVenue = data.egmVenue || DEFAULT_SAMPLE_BANK_LOAN_DATA.egmVenue
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din

  const totalCapFormatted = formatInrCurrency(limits.totalBorrowingsAfterLoan * 1.5)

  // Header
  builder.drawCentered(comp, builder.fontBold, 13, rgb(0.05, 0.12, 0.25))
  builder.drawCentered(`CIN: ${cin}`, builder.fontBold, 8.5, rgb(0.3, 0.3, 0.3))
  builder.drawCentered(`Regd. Office: ${regOffice}`, builder.fontItalic, 7.5, rgb(0.4, 0.4, 0.4))
  builder.drawDivider(5)

  // Title
  builder.drawCentered(
    'SPECIAL RESOLUTION UNDER SECTION 180(1)(c) OF THE COMPANIES ACT, 2013',
    builder.fontBold,
    10,
    rgb(0.1, 0.1, 0.1),
    2
  )
  builder.drawCentered(
    `PASSED AT THE EXTRAORDINARY GENERAL MEETING HELD ON ${egmDate} AT ${egmTime} AT ${egmVenue.toUpperCase()}`,
    builder.fontBold,
    8.5,
    rgb(0.25, 0.25, 0.25),
    8
  )

  // Item Heading
  builder.drawParagraph(
    'APPROVAL FOR BORROWING MONIES IN EXCESS OF PAID-UP CAPITAL, FREE RESERVES AND SECURITIES PREMIUM UNDER SECTION 180(1)(c)',
    { size: 9, boldPrefix: 'ITEM NO. 1: ', color: rgb(0.1, 0.2, 0.4), extraSpacing: 6 }
  )

  // Resolution 1
  builder.drawParagraph(
    `pursuant to the provisions of Section 180(1)(c) and other applicable provisions, if any, of the Companies Act, 2013 read with the rules framed thereunder (including any statutory modification(s) or re-enactment(s) thereof for the time being in force), and the Articles of Association of the Company, consent of the Members of the Company be and is hereby accorded to the Board of Directors of the Company to borrow from time to time monies on such terms and conditions as the Board may deem fit, which together with monies already borrowed by the Company (apart from temporary loans obtained from the Company's bankers in the ordinary course of business) may exceed the aggregate of the paid-up share capital, free reserves, and securities premium of the Company, provided that the total amount so borrowed shall not at any time exceed the limit of ${totalCapFormatted}.`,
    { boldPrefix: 'RESOLVED THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 6 }
  )

  // Resolution 2
  builder.drawParagraph(
    `pursuant to the provisions of Section 180(1)(a) and other applicable provisions of the Companies Act, 2013, the consent of the Members be and is hereby accorded to the Board of Directors to create mortgage, hypothecation, pledge, or charge on such terms and at such time on the whole or substantially the whole of any of the undertakings or immovable and movable properties of the Company, present and future, in favour of banks, financial institutions, or lenders to secure such borrowings.`,
    { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 6 }
  )

  // Resolution 3
  builder.drawParagraph(
    `the Board of Directors or the Company Secretary of the Company be and is hereby authorized to file statutory e-Form MGT-14 with the Registrar of Companies within 30 days of passing of this resolution and to do all such acts, deeds, and things as may be necessary to give full effect to the aforesaid resolutions."`,
    { boldPrefix: 'RESOLVED FURTHER THAT ', size: 8.5, lineHeight: 12.5, extraSpacing: 8 }
  )

  // Explanatory Statement
  builder.drawCentered(
    'EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013',
    builder.fontBold,
    9,
    rgb(0.1, 0.1, 0.1),
    6
  )

  const explText = `Under Section 180(1)(c) of the Companies Act, 2013, the Board of Directors cannot, except with the consent of the company by a Special Resolution in general meeting, borrow monies where the monies to be borrowed together with monies already borrowed exceed the aggregate of its paid-up share capital, free reserves, and securities premium. As on date, the paid-up share capital of the Company is ${formatInrCurrency(limits.paidUpCapital)}, free reserves stand at ${formatInrCurrency(limits.freeReserves)}, and securities premium is ${formatInrCurrency(limits.securitiesPremium)}, aggregating to a statutory ceiling of ${formatInrCurrency(limits.statutoryCap)}. In view of the Company's business expansion, Capex, and operational working capital requirements, borrowings are anticipated to exceed this statutory ceiling. The Board accordingly recommends the Special Resolution set out at Item No. 1 for approval by the Members. None of the Directors, Key Managerial Personnel (KMP), or their relatives are concerned or interested, financially or otherwise, in the proposed resolution.`

  builder.drawParagraph(explText, { size: 8.5, lineHeight: 12, extraSpacing: 12 })

  builder.drawSignatureBlock({
    companyName: comp,
    directorName: dir1,
    directorDin: din1,
    certifiedDate: egmDate,
    place: data.meetingVenue?.split(',').pop()?.trim() || 'New Delhi',
    designation: 'Director / Chairperson',
  })

  builder.addFooters(`Certified True Copy • Special Resolution under Section 180(1)(c) • ${comp}`)

  return await builder.save()
}

/**
 * Builds authentic Bank Covering Letter (.pdf) using pdf-lib
 */
export async function buildBankCoveringLetterPdf(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Uint8Array> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }
  const builder = await LegalDocBuilder.create()

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const dt = data.meetingDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingDate
  const bank = data.bankName || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankName
  const branch = data.bankBranch || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankBranch
  const bankAddress = data.bankAddress || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankAddress
  const sanctionNo = data.sanctionLetterNo || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterNo
  const sanctionDate = data.sanctionLetterDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.sanctionLetterDate
  const facility = data.facilityName || DEFAULT_SAMPLE_BANK_LOAN_DATA.facilityName
  const amtFormatted = formatInrCurrency(data.loanAmount || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmount)
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din
  const certDate = data.certifiedDate || dt
  const isUnsecured = data.facilityType === 'unsecured_loan' || data.securityType === 'unsecured'

  // Header
  builder.drawCentered(comp, builder.fontBold, 13, rgb(0.05, 0.12, 0.25))
  builder.drawCentered(`CIN: ${cin}`, builder.fontBold, 8.5, rgb(0.3, 0.3, 0.3))
  builder.drawCentered(`Regd. Office: ${regOffice}`, builder.fontItalic, 7.5, rgb(0.4, 0.4, 0.4))
  builder.drawDivider(5)

  // Date
  builder.ensureSpace(14)
  builder.currentPage.drawText(`Date: ${certDate}`, {
    x: builder.margin,
    y: builder.y,
    size: 9,
    font: builder.fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  })
  builder.y -= 16

  // To Address
  builder.drawParagraph('To,', { size: 9, extraSpacing: 1 })
  builder.drawParagraph('The Branch Manager,', { size: 9, extraSpacing: 1 })
  builder.drawParagraph(`${bank},`, { boldPrefix: `${bank},`, size: 9, extraSpacing: 1 })
  builder.drawParagraph(`${branch}, ${bankAddress}`, { size: 8.5, extraSpacing: 8 })

  // Subject
  builder.drawParagraph(
    `Submission of Board Resolution and Acceptance of Sanction Terms for ${facility} of ${amtFormatted} (Sanction Ref: ${sanctionNo})`,
    {
      boldPrefix: 'Subject: ',
      size: 9,
      lineHeight: 12.5,
      color: rgb(0.05, 0.15, 0.35),
      extraSpacing: 8,
    }
  )

  // Salutation
  builder.drawParagraph('Dear Sir / Madam,', { size: 9, extraSpacing: 4 })

  // Body
  builder.drawParagraph(
    `We refer to your Sanction Letter Ref. No. ${sanctionNo} dated ${sanctionDate} regarding sanction of credit facilities to our Company. We are pleased to inform you that the Board of Directors of the Company at its meeting held on ${dt} has formally approved the acceptance of the terms and conditions and the availment of the said credit facility.`,
    { size: 9, lineHeight: 13, extraSpacing: 6 }
  )

  builder.drawParagraph(
    'We enclose herewith the following statutory documents for your records and disbursement processing:',
    { size: 9, extraSpacing: 4 }
  )

  const enclosures = [
    `Certified True Copy of the Board Resolution passed on ${dt}`,
    'Duplicate copy of Sanction Letter duly signed by Authorised Directors as token of acceptance',
    isUnsecured
      ? 'Duly signed Clean Loan Agreement and Promissory Notes'
      : 'Duly signed Loan Agreement and Hypothecation / Security Deeds',
    'List of Directors with DIN and attested specimen signatures of Authorised Signatories',
    'Statutory Declaration under Section 179(3)(d) and Section 180(1)(c) of the Companies Act, 2013',
  ]
  if (!isUnsecured && data.hasChg1Filing) {
    enclosures.push(
      'Undertaking to file e-Form CHG-1 with ROC within 30 days and provide Certificate of Registration of Charge (CHG-2)'
    )
  }

  for (let idx = 0; idx < enclosures.length; idx++) {
    builder.drawParagraph(enclosures[idx], {
      boldPrefix: `${idx + 1}. `,
      size: 8.5,
      lineHeight: 12,
      extraSpacing: 2,
      indent: 8,
    })
  }

  builder.y -= 4
  builder.drawParagraph(
    'You are kindly requested to process the documentation and disburse the sanctioned facility at the earliest.',
    { size: 9, lineHeight: 13, extraSpacing: 10 }
  )

  // Sign off
  builder.ensureSpace(80)
  builder.currentPage.drawText('Yours faithfully,', {
    x: builder.margin,
    y: builder.y,
    size: 9,
    font: builder.fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  })
  builder.y -= 12

  builder.currentPage.drawText(`For ${comp}`, {
    x: builder.margin,
    y: builder.y,
    size: 9,
    font: builder.fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  builder.y -= 38

  builder.currentPage.drawText(`(${dir1})`, {
    x: builder.margin,
    y: builder.y,
    size: 9,
    font: builder.fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  builder.currentPage.drawText(`Director / Authorised Signatory (DIN: ${din1})`, {
    x: builder.margin,
    y: builder.y - 12,
    size: 8.5,
    font: builder.fontRegular,
    color: rgb(0.35, 0.35, 0.35),
  })

  builder.addFooters(`Bank Submission Covering Letter • ${comp}`)

  return await builder.save()
}

/**
 * Builds authentic Form CHG-1 Board Resolution Extract (.pdf) using pdf-lib
 */
export async function buildChg1ExtractPdf(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Uint8Array> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }
  const builder = await LegalDocBuilder.create()

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const regOffice = data.registeredOffice || DEFAULT_SAMPLE_BANK_LOAN_DATA.registeredOffice
  const dt = data.meetingDate || DEFAULT_SAMPLE_BANK_LOAN_DATA.meetingDate
  const bank = data.bankName || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankName
  const branch = data.bankBranch || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankBranch
  const facility = data.facilityName || DEFAULT_SAMPLE_BANK_LOAN_DATA.facilityName
  const amtFormatted = formatInrCurrency(data.loanAmount || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmount)
  const amtWords = data.loanAmountWords || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmountWords
  const security = data.securityDescription || DEFAULT_SAMPLE_BANK_LOAN_DATA.securityDescription
  const dir1 = data.director1Name || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Name
  const din1 = data.director1Din || DEFAULT_SAMPLE_BANK_LOAN_DATA.director1Din

  // Header
  builder.drawCentered(comp, builder.fontBold, 13, rgb(0.05, 0.12, 0.25))
  builder.drawCentered(`CIN: ${cin}`, builder.fontBold, 8.5, rgb(0.3, 0.3, 0.3))
  builder.drawCentered(`Regd. Office: ${regOffice}`, builder.fontItalic, 7.5, rgb(0.4, 0.4, 0.4))
  builder.drawDivider(5)

  // Title
  builder.drawCentered(
    'EXTRACT OF THE RESOLUTION PASSED BY THE BOARD OF DIRECTORS AUTHORIZING CREATION OF CHARGE UNDER SECTION 77 OF THE COMPANIES ACT, 2013 (FOR MCA E-FORM CHG-1)',
    builder.fontBold,
    9.5,
    rgb(0.1, 0.1, 0.1),
    4
  )
  builder.drawCentered(`AT ITS MEETING HELD ON ${dt}`, builder.fontBold, 9, rgb(0.25, 0.25, 0.25), 8)

  // Resolution 1
  builder.drawParagraph(
    `pursuant to the provisions of Section 77, 179(3)(d), and other applicable provisions of the Companies Act, 2013 read with the Companies (Registration of Charges) Rules, 2014, the consent of the Board of Directors be and is hereby accorded to create security by way of ${security} in favour of ${bank}, ${branch} for securing the ${facility} of ${amtFormatted} (${amtWords}) sanctioned to the Company.`,
    { boldPrefix: 'RESOLVED THAT ', size: 9, lineHeight: 13, extraSpacing: 8 }
  )

  // Resolution 2
  builder.drawParagraph(
    `${dir1}, Director (DIN: ${din1}) or the Company Secretary of the Company be and is hereby authorized to file statutory e-Form CHG-1 on the MCA V3 portal within 30 days of the creation of the charge, sign the forms digitally, upload requisite documents, pay statutory filing fees, and do all such acts, deeds, and things as may be necessary for registering the charge with the Registrar of Companies."`,
    { boldPrefix: 'RESOLVED FURTHER THAT ', size: 9, lineHeight: 13, extraSpacing: 14 }
  )

  // Sign off
  builder.ensureSpace(80)
  const rightX = builder.pageWidth - builder.margin - 180

  builder.currentPage.drawText(`For ${comp}`, {
    x: rightX,
    y: builder.y,
    size: 9,
    font: builder.fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  builder.y -= 38

  builder.currentPage.drawText(`(${dir1})`, {
    x: rightX,
    y: builder.y,
    size: 9,
    font: builder.fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  builder.currentPage.drawText(`Director (DIN: ${din1})`, {
    x: rightX,
    y: builder.y - 12,
    size: 8.5,
    font: builder.fontRegular,
    color: rgb(0.35, 0.35, 0.35),
  })

  builder.addFooters(`Form CHG-1 Resolution Extract • Section 77 • ${comp}`)

  return await builder.save()
}
