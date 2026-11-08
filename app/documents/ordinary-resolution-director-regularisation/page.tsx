import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Ordinary Resolution for Regularisation of Additional Director | Format (Section 152)'
  const description =
    'Download Ordinary Resolution format under Section 152 and 161(1) for regularising an Additional Director into a regular Director at the Annual General Meeting.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/ordinary-resolution-director-regularisation',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/ordinary-resolution-director-regularisation',
    },
  }
}

export default async function OrdinaryResolutionPage() {
  const spoke = await getSpokeDocument('ordinary-resolution-director-regularisation')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'What majority is required to pass an Ordinary Resolution under Section 152?',
      answer:
        'An ordinary resolution requires that the votes cast in favour of the resolution by members (present in person or by proxy/postal ballot) exceed the votes cast against it under Section 114(1) of the Act.',
    },
    {
      question: 'Is Form MGT-14 required for filing an ordinary resolution for director appointment in a private company?',
      answer:
        'No. Under MCA Exemption Notification G.S.R. 464(E) dated 5 June 2015, private companies are exempt from Section 117(3)(g). Therefore, Form MGT-14 is NOT required for ordinary resolutions appointing directors in private companies.',
    },
    {
      question: 'What ROC filing is required after passing the ordinary resolution?',
      answer:
        'A second Form DIR-12 must be filed with the ROC within 30 days of the AGM/EGM selecting "Change in designation" from Additional Director to Director, with the certified copy of the ordinary resolution attached.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Failing to regularise the Additional Director before or at the AGM',
      consequence: 'Automatic vacation of office under Section 161(1) on the day of the AGM or the last due date of the AGM',
      correction: 'Table and pass the ordinary resolution at the AGM before the meeting concludes.',
    },
    {
      mistake: 'Filing DIR-12 as "Appointment" instead of "Change in designation"',
      consequence: 'MCA V3 portal validation error and rejection by ROC',
      correction: 'Select "Change in designation" on Form DIR-12 because the director is already on record with the ROC as an Additional Director.',
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
        name: 'Ordinary Resolution — Regularisation',
        item: 'https://www.corplawupdates.in/documents/ordinary-resolution-director-regularisation',
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Ordinary Resolution — Regularisation of Additional Director (Companies Act 2013)',
    description:
      'Certified format of Ordinary Resolution under Section 152 and 161(1) of the Companies Act, 2013.',
    url: 'https://www.corplawupdates.in/documents/ordinary-resolution-director-regularisation',
    datePublished: '2026-11-07',
    dateModified: '2026-11-07',
    author: {
      '@type': 'Organization',
      name: 'CorpLawUpdates Editorial Team',
      url: 'https://www.corplawupdates.in',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
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
