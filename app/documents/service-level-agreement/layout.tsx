import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Service Level Agreement (SLA) Format: Word (.docx) & PDF Download (2026)',
  description:
    'Download free Service Level Agreement (SLA) format in Word (.docx) and PDF. Includes cloud computing SLA (AWS/Azure), enterprise vendor contracts, 4-tier severity matrix, Section 74 Indian Contract Act liquidated damages, and DPDP Act 2023 compliance.',
  keywords: [
    'service level agreement',
    'sla service level agreement',
    'service level agreement is classified as',
    'define service level agreement',
    'service level agreement in cloud computing',
    'aws service level agreement',
    'what is a service level agreement used for',
    'what is the purpose of a service level agreement',
    'sample sla agreement',
    'sla agreement examples',
    'service level agreement template',
    'sla contract example',
    'service level agreement format in word',
    'service level agreement pdf download',
    'components of service level agreement',
    'difference between service level agreement and contract',
    'difference between service agreement and service level agreement',
    'difference between service level agreement and memorandum of understanding',
    'service level agreement between two companies',
    'bpo service level agreement sample',
    'customer service level agreement',
    'recruitment service level agreement',
    'service level agreement meaning',
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
      'Download editable Service Level Agreement (SLA) templates in Word (.docx) & PDF. Covers cloud computing, IT SaaS, vendor contracts, uptime metrics, and Indian Contract Act liquidated damages.',
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
