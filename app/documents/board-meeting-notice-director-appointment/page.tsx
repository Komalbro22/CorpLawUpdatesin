import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Board Meeting Notice and Agenda | Appointment of Additional Director (Companies Act 2013)'
  const description =
    'Download Board Meeting Notice and Agenda format under Section 173(3) and Secretarial Standard SS-1 for appointment of an Additional Director in a private limited company.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/board-meeting-notice-director-appointment',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/board-meeting-notice-director-appointment',
    },
  }
}

export default async function BoardMeetingNoticePage() {
  const spoke = await getSpokeDocument('board-meeting-notice-director-appointment')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'What is the minimum notice period for convening a Board Meeting?',
      answer:
        'Under Section 173(3) of the Companies Act, 2013 and ICSI Secretarial Standard SS-1, at least 7 days notice in writing must be given to every director at their registered address by hand, post, or electronic means (email).',
    },
    {
      question: 'Can a Board Meeting be convened at shorter notice?',
      answer:
        'Yes, under the proviso to Section 173(3) and SS-1 Clause 1.3.11, a Board Meeting may be called at shorter notice to transact urgent business, provided at least one Independent Director (if any) is present, or if decisions are ratified by at least one Independent Director.',
    },
    {
      question: 'Is an agenda note on the proposed director required with the notice?',
      answer:
        'Yes. SS-1 Clause 1.3.7 requires that notes on items of business set out in the Agenda must be sent to all directors along with the notice. This should include the proposed director brief profile, DIN, and consents in DIR-2 and DIR-8.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Failing to maintain proof of delivery for the Board Meeting notice',
      consequence: 'Risk of board proceedings and appointment being challenged as invalid under Section 173',
      correction: 'Retain electronic delivery confirmations, email sent logs, or postal receipts with the company secretarial records.',
    },
    {
      mistake: 'Not attaching the proposed director profile & DIR-2 / DIR-8 in the agenda notes',
      consequence: 'Directors cannot exercise informed fiduciary approval',
      correction: 'Enclose the consent in Form DIR-2, non-disqualification intimation in Form DIR-8, and profile as an annexure to the agenda note.',
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
        name: 'Board Meeting Notice & Agenda',
        item: 'https://www.corplawupdates.in/documents/board-meeting-notice-director-appointment',
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Board Meeting Notice and Agenda — Appointment of Additional Director',
    description:
      'Verified draft format for Board Meeting notice and agenda under Section 173(3) and ICSI SS-1 for private limited companies.',
    url: 'https://www.corplawupdates.in/documents/board-meeting-notice-director-appointment',
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
