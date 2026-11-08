import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const spoke = await getSpokeDocument('dir-2-consent-format')
  const title = 'Form DIR-2 Format | Consent to Act as Director (Companies Act 2013)'
  const description =
    'Download Form DIR-2 consent format in Word (.docx) and PDF. Required under Section 152(5) and Rule 8 of Companies Rules 2014 before director appointment.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/dir-2-consent-format',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/dir-2-consent-format',
    },
  }
}

export default async function Dir2FormatPage() {
  const spoke = await getSpokeDocument('dir-2-consent-format')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'When must Form DIR-2 be signed and submitted?',
      answer:
        'Form DIR-2 must be signed by the proposed director and delivered to the company BEFORE the board meeting where the appointment is approved. It is subsequently attached to Form DIR-12 and filed with the ROC within 30 days of the appointment.',
    },
    {
      question: 'What enclosures are mandatory with Form DIR-2?',
      answer:
        'The appointee director must enclose a self-attested copy of their PAN Card and a self-attested address proof (such as Aadhaar card, Passport, or Voter ID).',
    },
    {
      question: 'Is Form DIR-2 required for Additional Directors in private limited companies?',
      answer:
        'Yes. Section 152(5) applies to all companies and all director appointments. The consent in Form DIR-2 is a mandatory prerequisite before any individual can be appointed to the Board.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Dating DIR-2 after the Board Meeting',
      consequence: 'ROC rejection of Form DIR-12 for defective consent sequencing',
      correction: 'Ensure Form DIR-2 is dated on or before the date of the Board Meeting appointing the director.',
    },
    {
      mistake: 'Missing self-attested identity and address proofs',
      consequence: 'Resubmission marked by ROC on Form DIR-12',
      correction: 'Attach clear, self-attested copies of the appointee PAN and residential address proof to Form DIR-2.',
    },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
      { '@type': 'ListItem', position: 3, name: 'DIR-2 Format', item: 'https://www.corplawupdates.in/documents/dir-2-consent-format' },
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
        quickAnswer="Form DIR-2 is the statutory written consent to act as a Director under Section 152(5) of the Companies Act, 2013 and Rule 8 of the Companies (Appointment and Qualification of Directors) Rules, 2014. It must be executed by the appointee prior to the board meeting and attached to Form DIR-12 for filing on MCA V3 within 30 days."
        faqs={faqs}
        commonMistakes={commonMistakes}
      />
    </>
  )
}
