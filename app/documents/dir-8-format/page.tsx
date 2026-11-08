import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Form DIR-8 Format | Intimation by Director Non-Disqualification (Companies Act 2013)'
  const description =
    'Download Form DIR-8 format under Section 164(2) and Rule 14(1). Formal intimation by a proposed director that they are not disqualified from appointment.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/dir-8-format',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/dir-8-format',
    },
  }
}

export default async function Dir8FormatPage() {
  const spoke = await getSpokeDocument('dir-8-format')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'What is Form DIR-8 and why is it required?',
      answer:
        'Form DIR-8 is a statutory declaration made by a proposed director under Section 164(2) read with Rule 14(1) of the Companies Rules, 2014, confirming that they are not disqualified from acting as a director on account of non-filing of financial statements or default on deposits/debentures in any company.',
    },
    {
      question: 'Is Form DIR-8 uploaded to the MCA portal?',
      answer:
        'Form DIR-8 is primarily retained in company secretarial records and placed before the Board at the appointment meeting. While some ROCs request it as an optional attachment to Form DIR-12, its statutory requirement is internal board satisfaction before appointment.',
    },
    {
      question: 'How often must Form DIR-8 be submitted by existing directors?',
      answer:
        'Under Rule 14(1), every director must submit Form DIR-8 before appointment or re-appointment, and annually in each financial year before the close of the financial year.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Failing to check 3-year non-filing in previous directorships',
      consequence: 'Director appointment becomes void ab initio under Section 164(2)(a)',
      correction: 'Conduct a thorough MCA portal check on all companies where the appointee is a director to confirm annual returns and financial statements are up to date.',
    },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
      { '@type': 'ListItem', position: 3, name: 'DIR-8 Format', item: 'https://www.corplawupdates.in/documents/dir-8-format' },
    ],
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
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />
      <SpokeDocumentShell
        document={doc}
        set={set}
        currentStep={currentStep}
        prevStep={prevStep}
        nextStep={nextStep}
        quickAnswer="Form DIR-8 is the statutory intimation by a proposed director under Section 164(2) of the Companies Act, 2013 and Rule 14(1) of the Companies Rules, 2014, certifying that the appointee is not disqualified due to defaults in any existing directorships. It must be provided prior to the Board Meeting."
        faqs={faqs}
        commonMistakes={commonMistakes}
      />
    </>
  )
}
