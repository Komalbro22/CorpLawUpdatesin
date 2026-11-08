import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Minutes Extracts — Board & General Meeting | Director Appointment (Companies Act 2013)'
  const description =
    'Download certified Minutes Extracts format for Board Meeting and General Meeting director appointment resolutions under Section 118, SS-1 and SS-2.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/minutes-extracts-director-appointment',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/minutes-extracts-director-appointment',
    },
  }
}

export default async function MinutesExtractsPage() {
  const spoke = await getSpokeDocument('minutes-extracts-director-appointment')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'When must the Minutes of a Board Meeting or General Meeting be entered and signed?',
      answer:
        'Under Section 118(1) of the Companies Act, 2013 read with SS-1 and SS-2, minutes of proceedings must be entered in the statutory minutes book within 30 days of the conclusion of the meeting and signed by the Chairman.',
    },
    {
      question: 'Who can certify an extract of the minutes for ROC or bank filing?',
      answer:
        'A certified true copy of a resolution or minutes extract may be signed by any existing Director, Managing Director, or the Company Secretary of the company who attended the meeting.',
    },
    {
      question: 'What is the penalty for tampering with or failing to maintain minutes under Section 118?',
      answer:
        'Under Section 118(11), a company is liable to a penalty of ₹25,000 and every officer in default ₹5,000. Tampering with minutes carries imprisonment up to 2 years and a fine of ₹25,000 to ₹1,00,000 under Section 118(12).',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Failing to circulate draft board minutes within 15 days',
      consequence: 'Non-compliance with ICSI Secretarial Standard SS-1 Clause 7.4',
      correction: 'Circulate draft minutes to all directors within 15 days from the conclusion of the board meeting for comments.',
    },
    {
      mistake: 'Loose sheets in minutes binder without continuous page numbering',
      consequence: 'Breach of SS-1 Clause 7.1.4 and evidentiary rejection under Section 118(7)',
      correction: 'Maintain consecutive page numbering throughout the minutes book and have each page initialled by the Chairman.',
    },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Minutes Extracts',
        item: 'https://www.corplawupdates.in/documents/minutes-extracts-director-appointment',
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Minutes Extracts — Board & General Meeting (Companies Act 2013)',
    description:
      'Certified format of minutes extracts for director appointment under Section 118 and Secretarial Standards.',
    url: 'https://www.corplawupdates.in/documents/minutes-extracts-director-appointment',
    datePublished: '2026-11-07',
    dateModified: '2026-11-07',
    author: {
      '@type': 'Organization',
      name: 'CorpLawUpdates Editorial Team',
      url: 'https://www.corplawupdates.in',
    },
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <SpokeDocumentShell
        document={doc}
        set={set}
        currentStep={currentStep}
        prevStep={prevStep}
        nextStep={nextStep}
        faqs={faqs}
        commonMistakes={commonMistakes}
      />
    </>
  )
}
