import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from 'docx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  cleanTableData,
  renderDocumentHeader,
  renderSafeDisclaimer,
  renderPageFooters,
  PDF_PALETTE
} from '@/lib/pdf/pdfUtils'

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
          text: `for securing the due repayment of the principal amount together with interest, compound interest, additional interest, penal charges, commitment charges, costs, and other monies payable by the Company to ${bank} under the said facility, the consent of the Board be and is hereby accorded for the creation of security by way of ${security} in favour of ${bank}${data.isPariPassu ? ` on a pari-passu basis with ${data.pariPassuLenders || 'existing consortium lenders'}` : ' on an exclusive first charge basis'}.`,
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
    ...(data.hasChg1Filing
      ? [
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({ text: 'RESOLVED FURTHER THAT ', bold: true, size: 21, font: FONT }),
              new TextRun({
                text: `pursuant to Section 77 of the Companies Act, 2013 read with Rule 3 of the Companies (Registration of Charges) Rules, 2014, ${dir1}, Director (DIN: ${din1}) or ${dir2}, Director (DIN: ${din2}) or the Company Secretary of the Company be and is hereby authorized to file statutory e-Form CHG-1 with the Registrar of Companies (ROC) within 30 days of the execution of the charge documents, along with the certified true copy of the resolution and executed security deeds, and to do all such acts, deeds, and things as may be necessary to register the charge and obtain the Certificate of Registration of Charge (Form CHG-2) from the Registrar of Companies."`,
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
      children: [
        new TextRun({ text: 'To,', bold: true, size: 21, font: FONT }),
      ],
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
          text: 'Duly signed Loan Agreement and Hypothecation / Security Deeds',
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

/**
 * Builds printable PDF document for Board Resolution using jsPDF
 */
export async function buildBankLoanBoardResolutionPdf(
  inputData: Partial<BankLoanFormData> = {}
): Promise<Uint8Array> {
  const data: BankLoanFormData = { ...DEFAULT_SAMPLE_BANK_LOAN_DATA, ...inputData }
  const doc = new jsPDF()

  const comp = (data.companyName || DEFAULT_SAMPLE_BANK_LOAN_DATA.companyName).toUpperCase()
  const cin = data.cin || DEFAULT_SAMPLE_BANK_LOAN_DATA.cin
  const facility = data.facilityName || DEFAULT_SAMPLE_BANK_LOAN_DATA.facilityName
  const bank = data.bankName || DEFAULT_SAMPLE_BANK_LOAN_DATA.bankName
  const amtFormatted = formatInrCurrency(data.loanAmount || DEFAULT_SAMPLE_BANK_LOAN_DATA.loanAmount)

  // Document Header
  const startY = renderDocumentHeader(doc, {
    title: 'CERTIFIED TRUE COPY OF BOARD RESOLUTION',
    subtitle: `Availing ${facility} of ${amtFormatted} from ${bank} | Under Section 179(3)(d), Companies Act 2013`,
    dateLabel: 'Resolution Date',
  })

  let currentY = startY + 4

  // Metadata Table
  const metaRows = [
    [
      { content: 'Company Name', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      comp,
      { content: 'CIN', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      cin,
    ],
    [
      { content: 'Lending Bank', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${bank} (${data.bankBranch})`,
      { content: 'Sanction Ref & Date', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.sanctionLetterNo} dt. ${data.sanctionLetterDate}`,
    ],
    [
      { content: 'Facility Sanctioned', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      facility,
      { content: 'Facility Amount', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${amtFormatted} (${data.loanAmountWords})`,
    ],
    [
      { content: 'Interest Rate & Tenure', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      `${data.interestRate} | ${data.tenure}`,
      { content: 'Security / Collateral', styles: { fontStyle: 'bold' as const, fillColor: PDF_PALETTE.lightGray } },
      data.securityDescription,
    ],
  ]

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: cleanTableData(metaRows),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 56 },
      2: { cellWidth: 35 },
      3: { cellWidth: 56 },
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // Resolution Clauses Table
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_PALETTE.navy)
  doc.text('Statutory Resolution Clauses (Passed at Duly Convened Board Meeting)', 14, currentY)
  currentY += 4

  const clausesRows = [
    [
      { content: '1. Facility Approval', styles: { fontStyle: 'bold' as const } },
      `RESOLVED THAT pursuant to Section 179(3)(d) of the Companies Act, 2013 and Memorandum & Articles of Association, approval of the Board be and is hereby accorded to avail ${facility} up to ${amtFormatted} from ${bank}, ${data.bankBranch} for ${data.loanPurpose}.`,
    ],
    [
      { content: '2. Security Creation', styles: { fontStyle: 'bold' as const } },
      `RESOLVED FURTHER THAT the Company create security by way of ${data.securityDescription} in favour of ${bank} to secure the principal and interest charges.`,
    ],
    [
      { content: '3. Execution Authority', styles: { fontStyle: 'bold' as const } },
      `RESOLVED FURTHER THAT ${data.director1Name}, Director (DIN: ${data.director1Din}) or ${data.director2Name}, Director (DIN: ${data.director2Din}) be and is/are hereby authorized to execute loan agreements, security deeds, demand promissory notes, and guarantees with the Bank.`,
    ],
    [
      { content: '4. Form CHG-1 Filing', styles: { fontStyle: 'bold' as const } },
      `RESOLVED FURTHER THAT pursuant to Section 77 of the Companies Act, 2013, the Directors/CS be authorized to file e-Form CHG-1 on MCA V3 within 30 days of charge creation and obtain Form CHG-2 Certificate of Registration of Charge.`,
    ],
    [
      { content: '5. Certified Copy', styles: { fontStyle: 'bold' as const } },
      `RESOLVED FURTHER THAT a certified true copy of this resolution signed by any Director or Company Secretary be provided to ${bank}.`,
    ],
  ]

  autoTable(doc, {
    startY: currentY,
    head: [['Clause Heading', 'Resolution Text']],
    body: cleanTableData(clausesRows),
    theme: 'striped',
    headStyles: { fillColor: PDF_PALETTE.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5, textColor: PDF_PALETTE.navy },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 142 },
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 6

  // Disclaimer
  const disclaimer =
    'DISCLAIMER: This certified resolution format is generated based on user inputs in compliance with Section 179(3)(d), Section 180(1)(c), and Section 77 of the Companies Act, 2013. Verify bank-specific covenants and state stamp duties prior to execution. Does not constitute formal legal counsel.'
  renderSafeDisclaimer(doc, disclaimer, currentY, { fontSize: 6.8 })

  renderPageFooters(doc, `CorpLawUpdates.in • Board Resolution Bank Loan • ${comp}`)

  return new Uint8Array(doc.output('arraybuffer'))
}
