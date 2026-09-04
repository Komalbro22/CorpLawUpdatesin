import type { Metadata } from 'next'

const pageUrl =
  'https://www.corplawupdates.in/documents/board-resolution-registered-office-change'
const title =
  'Board Resolution for Change of Registered Office: Word & PDF Download (2026)'
const description =
  'Download official format of board resolution for change of registered office within the same city in Word (.docx) and PDF. Includes Form INC-22 30-day filing checklist, mandatory attachments & Bank Intimation Letter under Section 12.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'format of board resolution for change of registered office within the same city',
    'board resolution for address change word format',
    'board resolution for change of registered office within same city',
    'board resolution for change of registered office',
    'board resolution for shifting of registered office',
    'form for change in registered office of company',
    'registered office address change letter format',
    'board resolution for change of address',
    'draft a resolution',
    'board resolution format for change of registered office address',
    'Section 12 Companies Act 2013',
    'Form INC-22 MCA',
    'Rule 25 Companies Incorporation Rules 2014',
    'Rule 27 Companies Incorporation Rules 2014',
    'bank intimation letter registered office change',
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
          'Board Resolution for Change of Registered Office (Same City)'
        )}&type=Document Generator`,
        width: 1200,
        height: 630,
        alt: 'Board Resolution for Change of Registered Office format in Word and PDF',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | CorpLawUpdates.in`,
    description,
    images: [
      `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(
        'Board Resolution for Change of Registered Office (Same City)'
      )}&type=Document Generator`,
    ],
  },
}

export default function RegisteredOfficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
