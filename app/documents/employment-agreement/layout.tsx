import type { Metadata } from 'next'

const pageUrl = 'https://www.corplawupdates.in/documents/employment-agreement'
const title =
  'Employment Agreement Format India — Free Word & PDF Download, Sample Draft & AI Generator (2026) | CorpLawUpdates.in'
const description =
  'Download free employment agreement format in Word (.docx) & PDF for India. Built under Indian Contract Act 1872, 4 Labour Codes (2025/2026), Section 2(y) 50% wage rule, OSH Code appointment terms, Article 5 stamp duty, and AI drafting assistant.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'employment agreement format',
    'employment agreement format India',
    'employment agreement format PDF',
    'employment agreement format Word',
    'employment agreement format in Word free download',
    'employment agreement format in Hindi',
    'simple employee agreement format in Word',
    'company employee agreement format PDF',
    'employment contract agreement format',
    'what should an employment agreement include',
    'is employment agreement legal in India',
    'employment agreement vs appointment letter',
    'fixed term employment agreement India',
    'remote employment agreement format',
    'executive employment agreement India',
    'employment bond agreement format India',
    'employee service agreement format',
    '2 years bond agreement format for employee Word',
    '1 year employment contract sample PDF',
    'Section 27 non compete employment India',
    'Code on Wages 50 percent rule',
    'OSH Code appointment letter format Section 6',
    'employment agreement stamp duty Maharashtra Delhi Karnataka',
    'employee confidentiality agreement NDA',
    'employee laptop asset agreement format',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'Employment Agreement Format India — Free Word & PDF Download & AI Generator',
    description:
      'Customizable Indian employment contract format in Word & PDF. Compliant with Labour Codes, Section 2(y) wage definition, state stamp duty, and IP assignment.',
    siteName: 'CorpLawUpdates.in',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employment Agreement Format India — Free Word & PDF Generator',
    description:
      'Free Indian employment contract format in Word & PDF with live AI drafting assistant.',
  },
}

export default function EmploymentAgreementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: title,
        description,
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://www.corplawupdates.in/#website',
          url: 'https://www.corplawupdates.in',
          name: 'CorpLawUpdates.in',
        },
        about: {
          '@type': 'Thing',
          name: 'Employment Agreement in India',
          description:
            'A bilateral legal contract between employer and employee governing duties, remuneration, intellectual property, confidentiality, working hours, and separation under Indian labour and contract law.',
        },
        inLanguage: 'en-IN',
        datePublished: '2026-05-15T00:00:00+05:30',
        dateModified: '2026-09-30T19:00:00+05:30',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.corplawupdates.in',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Legal Documents',
            item: 'https://www.corplawupdates.in/documents',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Employment Agreement Format India',
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'CorpLawUpdates Employment Agreement Generator & AI Drafter',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All Modern Web Browsers',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
        description:
          'Interactive legal document drafter generating custom Indian Employment Agreements with live preview, AI assistance, salary breakdown, state stamp duty calculator, and Word/PDF export.',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
