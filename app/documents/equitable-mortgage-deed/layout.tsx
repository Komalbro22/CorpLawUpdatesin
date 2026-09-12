import type { Metadata } from 'next'

const pageUrl = 'https://www.corplawupdates.in/documents/equitable-mortgage-deed'
const title = 'MODT (Memorandum of Deposit of Title Deeds): Meaning, Format, Draft & Free Generator (2026)'
const description =
  'What is MODT? Full form, meaning, stamp duty & format under Section 58(f) Transfer of Property Act. Download free MODT sample draft in Word (.docx) and PDF. Includes State Stamp Duty rates & Form CHG-1 filing checklist.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'modt format',
    'modt draft',
    'modt document download',
    'modt format pdf',
    'memorandum of deposit of title deeds format',
    'modt document',
    'memorandum of deposit of title deeds',
    'what is modt',
    'modt full form',
    'modt meaning',
    'motd full form',
    'equitable mortgage deed format',
    'equitable mortgage under section 58 f',
    'modt vs registered mortgage',
    'modt stamp duty maharashtra',
    'notice of intimation section 89b maharashtra',
    'modt registration karnataka',
    'modt stamp duty tamil nadu',
    'form chg 1 equitable mortgage',
    'equitable mortgage format word',
    'first schedule title deeds deposit',
    'memorandum of deposit of title deeds sample',
    'cersai registration equitable mortgage',
    'deed of equitable mortgage india',
    'transfer of property act section 58 f',
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
          'MODT (Memorandum of Deposit of Title Deeds): Format, Meaning & Generator'
        )}&type=Legal Document`,
        width: 1200,
        height: 630,
        alt: 'MODT Memorandum of Deposit of Title Deeds Format in Word and PDF',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function EquitableMortgageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
