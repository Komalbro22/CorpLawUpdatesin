import type { Metadata } from 'next'

const pageUrl = 'https://www.corplawupdates.in/documents/partnership-deed'
const title =
  'Partnership Deed Format — Free Word & PDF Download, Sample Draft & AI Generator (India, 2026) | CorpLawUpdates.in'
const description =
  'Download free partnership deed format in Word (.docx) and PDF for India. Generate custom Partnership Deed drafts with AI business objects assistant, Section 40(b) (AY 2025-26) remuneration slabs, Section 194T TDS compliance, 18-state stamp duty calculator, and ROF Form 1.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'partnership deed format',
    'partnership deed format pdf free download',
    'partnership deed format in word free download',
    'partnership deed draft',
    'partnership deed',
    'partnership deed forms',
    'partnership deed specimen',
    'partnership deed sample',
    'partnership deed maker',
    'partnership deed generator',
    'original partnership deed',
    'amendment in partnership deed format',
    'supplementary partnership deed',
    'section 40b remuneration limit',
    'partner remuneration section 40b',
    'maximum remuneration to working partners ay 2025-26',
    '194T tds on partner payments',
    'partnership deed stamp duty',
    'partnership deed stamp duty maharashtra',
    'partnership deed stamp duty delhi',
    'partnership deed stamp duty karnataka',
    'instrument of partnership article 46',
    'partnership firm registration form 1',
    'rof form 1',
    'maharashtra partnership amendment act 2026',
    'section 69 unregistered partnership firm',
    'section 42 c dissolution on death',
    'interest on capital 12 percent partnership',
    'bank current account partnership mandate',
    'partnership at will format',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    siteName: 'CorpLawUpdates.in',
    title: 'Partnership Deed Format — Free Word & PDF Download, Sample Draft & AI Generator (India, 2026)',
    description,
    images: [
      {
        url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(
          'Partnership Deed Format — Word (.docx) & PDF Download, Sec 40(b) & AI Generator'
        )}&type=Legal Document`,
        width: 1200,
        height: 630,
        alt: 'Partnership Deed Format in Word and PDF with Section 40(b) Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partnership Deed Format — Free Word & PDF Download, Sample Draft & AI Generator (India, 2026)',
    description,
    images: [
      `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(
        'Partnership Deed Format — Word (.docx) & PDF Download, Sec 40(b) & AI Generator'
      )}&type=Legal Document`,
    ],
  },
}

export default function PartnershipDeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
