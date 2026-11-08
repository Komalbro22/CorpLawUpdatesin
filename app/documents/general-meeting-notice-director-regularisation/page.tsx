import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'General Meeting Notice & Section 102 Explanatory Statement | Director Regularisation'
  const description =
    'Download General Meeting (AGM/EGM) Notice format with Section 102 Explanatory Statement for regularisation of an Additional Director under Section 152 and 161(1).'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/general-meeting-notice-director-regularisation',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/general-meeting-notice-director-regularisation',
    },
  }
}

export default async function GeneralMeetingNoticePage() {
  const spoke = await getSpokeDocument('general-meeting-notice-director-regularisation')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'What is the required notice period for an AGM or EGM?',
      answer:
        'Under Section 101(1) of the Companies Act, 2013 and ICSI SS-2, a general meeting requires not less than 21 clear days notice in writing or through electronic mode to all members, legal representatives, and auditors.',
    },
    {
      question: 'Is an explanatory statement under Section 102 mandatory for director regularisation?',
      answer:
        'Yes. Regularisation of an Additional Director is considered special business under Section 102(2)(a). An explanatory statement annexing the appointee qualifications, experience, terms, and interest of directors must accompany the notice.',
    },
    {
      question: 'Can shareholders approve the regularisation at shorter notice?',
      answer:
        'Yes, under Section 101(1), general meetings may be called after giving shorter notice if consent in writing or electronic mode is accorded by not less than 95% of members entitled to vote at such meeting.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Failing to give 21 "clear" days notice',
      consequence: 'Risk of the entire AGM / EGM proceedings being challenged as invalid',
      correction: 'Exclude the date of dispatch and the date of the meeting, plus 48 hours if sent by post, when computing the 21 clear days.',
    },
    {
      mistake: 'Omitting Section 102 statutory disclosures regarding director interest',
      consequence: 'Section 102 penalty on every promoter, director, manager or other key managerial personnel in default',
      correction: 'Include explicit declaration in the explanatory statement specifying whether any other director is interested in the appointment.',
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
        name: 'General Meeting Notice & Explanatory Statement',
        item: 'https://www.corplawupdates.in/documents/general-meeting-notice-director-regularisation',
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'General Meeting Notice & Section 102 Explanatory Statement — Director Regularisation',
    description:
      'Verified draft format for General Meeting notice and Section 102 explanatory statement under Companies Act 2013.',
    url: 'https://www.corplawupdates.in/documents/general-meeting-notice-director-regularisation',
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
