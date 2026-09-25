import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Service Level Agreement (SLA) Format: Word (.docx) & PDF Download (2026)',
  description:
    'Download professional Service Level Agreement (SLA) format in Word (.docx) and PDF. Includes cloud computing SLA, uptime targets, incident severity matrix, penalty calculation formulas, DPDP Act 2023 clauses, and stamp duty guide under Indian Contract Act.',
  keywords: [
    'service level agreement',
    'service level agreement in cloud computing',
    'service level agreement template',
    'sla service level agreement template',
    'what is a service level agreement',
    'service level agreement meaning',
    'customer service level agreement',
    'recruitment service level agreement',
    'service level agreement example',
    'service level agreement format in word',
    'service level agreement pdf download',
    'service level agreement sample',
    'it service level agreement format',
    'sla penalty clause indian contract act section 74',
    'vendor service level agreement india',
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/documents/service-level-agreement',
  },
  openGraph: {
    title: 'Service Level Agreement (SLA) Format: Word & PDF Download (2026)',
    description:
      'Download ready-to-use Service Level Agreement (SLA) templates in Word (.docx) & PDF. Covers cloud computing, IT SaaS, vendor contracts, uptime metrics, and Indian Contract Act liquidated damages.',
    url: 'https://www.corplawupdates.in/documents/service-level-agreement',
    siteName: 'CorpLawUpdates.in',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.corplawupdates.in/api/og?title=Service+Level+Agreement+(SLA)+Format+in+Word+%26+PDF&category=Agreements',
        width: 1200,
        height: 630,
        alt: 'Service Level Agreement Format in Word & PDF - CorpLawUpdates.in',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Service Level Agreement (SLA) Format: Word & PDF Download (2026)',
    description:
      'Free editable Service Level Agreement (SLA) templates in Word and PDF with cloud computing metrics, severity matrix, and DPDP Act 2023 clauses.',
    images: [
      'https://www.corplawupdates.in/api/og?title=Service+Level+Agreement+(SLA)+Format+in+Word+%26+PDF&category=Agreements',
    ],
  },
}

export default function SlaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
