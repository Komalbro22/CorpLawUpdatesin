import type { Metadata } from 'next'

const pageUrl = 'https://www.corplawupdates.in/documents/board-resolution-bank-loan'
const title =
  'Board Resolution for Bank Loan & Credit Facility: Format, Word (.docx) & PDF (2026)'
const description =
  'Download official board resolution format for availing bank loan (Term Loan, Cash Credit, Overdraft, LC/BG) in Word (.docx) and PDF. Includes Section 180(1)(c) limit calculator, Form CHG-1 charge checklist & Bank Covering Letter.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'board resolution for bank loan',
    'board resolution for bank loan word format',
    'board resolution for term loan',
    'board resolution for cash credit facility',
    'board resolution for bank overdraft',
    'board resolution for borrowing money from bank',
    'board resolution under section 179 3 d',
    'special resolution under section 180 1 c',
    'board resolution for credit facility',
    'format of board resolution for availing bank loan',
    'board resolution for vehicle loan company',
    'board resolution for bank guarantee',
    'board resolution for letter of credit',
    'draft board resolution for loan from bank',
    'board resolution for hypothecation of assets',
    'board resolution for creation of charge chg-1',
    'Section 179 3 d Companies Act 2013',
    'Section 180 1 c Companies Act 2013',
    'Form CHG-1 MCA',
    'bank loan sanction letter board resolution',
    'borrowing powers of directors',
    'private company exemption section 180',
    'GSR 464 E private company borrowing',
    'bank covering letter loan submission',
    'stamp duty on loan agreement',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    siteName: 'CorpLawUpdates.in',
    title: `${title} | CorpLawUpdates.in`,
    description,
    images: [
      {
        url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(
          'Board Resolution for Bank Loan & Credit Facilities (Term Loan, CC & Overdraft)'
        )}&type=Document Generator`,
        width: 1200,
        height: 630,
        alt: 'Board Resolution for Bank Loan format in Word and PDF',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | CorpLawUpdates.in`,
    description,
    images: [
      `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(
        'Board Resolution for Bank Loan & Credit Facilities (Term Loan, CC & Overdraft)'
      )}&type=Document Generator`,
    ],
  },
}

export default function BankLoanLayout({ children }: { children: React.ReactNode }) {
  return children
}
