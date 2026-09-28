import type { Metadata } from 'next'

const pageUrl =
  'https://www.corplawupdates.in/documents/board-resolution-registered-office-change'
const title =
  'Board Resolution for Shifting of Registered Office: Word & PDF Format, MCA Procedure & Checklist (2026)'
const description =
  'Download official Board Resolution format for shifting of registered office in Word (.docx) & PDF. Covers same city (local limits), outside local limits, different RoC, and inter-state shifting with Form INC-22 checklist, Special Resolution, Form INC-26 newspaper notice, Form 15 for LLP, and Section 12 & 13 Companies Act 2013 compliance.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'shifting of registered office resolution',
    'board resolution for shifting of registered office',
    'board resolution for shifting of registered office within local limits',
    'board resolution for shifting of registered office within same state',
    'board resolution for shifting of registered office outside local limits',
    'shifting of registered office within same city board resolution',
    'change of registered office address resolution',
    'shifting of registered office from one state to another resolution',
    'shifting of registered office board resolution',
    'change of registered office board resolution',
    'change of registered address board resolution',
    'change of registered office address board resolution',
    'shifting of registered office within local limits board resolution',
    'shifting of registered office by circular resolution',
    'format of board resolution for shifting of registered office',
    'resolution for shifting of registered office within the city',
    'board resolution for shifting of registered office of the company',
    'draft resolution for shifting of registered office',
    'egm resolution for shifting of registered office',
    'resolution for shifting of registered office',
    'resolution for shifting of registered office outside local limits',
    'resolution for shifting of registered office within local limits',
    'resolution for shifting of registered office of llp',
    'shifting of registered office',
    'change of registered office special resolution',
    'special resolution for shifting of registered office',
    'board resolution for shifting of registered office within same city',
    'shifting of registered office from one state to another',
    'shifting of registered office within same state but different roc',
    'shifting of registered office from one state to another procedure',
    'shifting of registered office within same city',
    'shifting of registered office from one state to another section',
    'shifting of registered office within same state',
    'shifting of registered office companies act 2013',
    'advertisement for shifting of registered office',
    'shifting of registered office from one roc to another',
    'shifting of registered office from one city to another',
    'shifting of registered office from one district to another',
    'newspaper advertisement for shifting of registered office',
    'newspaper advertisement for shifting of registered office of llp',
    'process of shifting of registered office',
    'shifting of registered office bse',
    'stock exchange intimation for shifting of registered office',
    'documents required for shifting of registered office',
    'draft petition for shifting of registered office',
    'egm notice for shifting of registered office',
    'explanatory statement for shifting of registered office',
    'format of noc from creditors for shifting of registered office',
    'format of notice to creditors for shifting of registered office',
    'form for shifting of registered office',
    'change of registered office in gst',
    'gnl 1 for shifting of registered office',
    'gnl 2 for shifting of registered office',
    'procedure for shifting of registered office',
    'shifting of registered office in llp',
    'change of registered office in llp',
    'change of registered office in mca',
    'Section 12 Companies Act 2013',
    'Section 13 Companies Act 2013',
    'Form INC-22 MCA',
    'Form INC-23 Regional Director',
    'Form INC-26 newspaper notice',
    'Rule 25 Companies Incorporation Rules 2014',
    'Rule 28 Companies Incorporation Rules 2014',
    'Rule 30 Companies Incorporation Rules 2014',
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
          'Board Resolution for Registered Office Shifting (Same City, RoC & Inter-State)'
        )}&type=Document Generator`,
        width: 1200,
        height: 630,
        alt: 'Board Resolution for Shifting of Registered Office format in Word and PDF',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | CorpLawUpdates.in`,
    description,
    images: [
      `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(
        'Board Resolution for Registered Office Shifting (Same City, RoC & Inter-State)'
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
