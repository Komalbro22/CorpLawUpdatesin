import type { Metadata } from 'next'

const pageUrl = 'https://www.corplawupdates.in/documents/memorandum-of-understanding'
const title =
  'MoU Format — Free Word (.docx) & PDF Download, Sample Draft & Generator (India) | CorpLawUpdates.in'
const description =
  'Download free MoU format in Word (.docx) and PDF for India. Generate custom Memorandum of Understanding drafts with AI purpose assistant. Covers Business Partnership, Joint Venture, Vendor, Co-Founders, State Stamp Duty (Article 5), and Indian Contract Act 1872 enforceability.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'mou format',
    'mou format in word free download',
    'mou draft',
    'mou fill form',
    'mou format in word free download pdf',
    'mou form',
    'mou download',
    'mou pdf download',
    'mou generator',
    'mou template india',
    'mou files',
    'mou copy',
    'mou maker',
    'format of mou',
    'memorandum of understanding format',
    'memorandum of understanding sample',
    'mou sample draft india',
    'business partnership mou format',
    'joint venture memorandum of understanding',
    'vendor mou draft word',
    'startup co-founder mou template',
    'is mou legally binding in india',
    'mou stamp duty article 5',
    'mou vs agreement difference',
    'memorandum of understanding download pdf',
    'indian contract act 1872 mou',
    'mou arbitration clause',
    'mou confidentiality addendum',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    siteName: 'CorpLawUpdates.in',
    title: 'MoU Format — Free Word (.docx) & PDF Download, Sample Draft & Generator (India)',
    description,
    images: [
      {
        url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(
          'MoU Format — Word (.docx) & PDF Download, Sample Draft & Generator'
        )}&type=Legal Document`,
        width: 1200,
        height: 630,
        alt: 'MoU Format and Generator in Word and PDF for India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoU Format — Free Word (.docx) & PDF Download, Sample Draft & Generator (India)',
    description,
  },
}

export default function MouLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
