import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Register of Directors & KMP Specimen Entry | Section 170 Format (Companies Act 2013)'
  const description =
    'Download statutory specimen format for Register of Directors and Key Managerial Personnel (KMP) entries under Section 170(1) and Rule 17.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/register-of-directors-specimen-entry',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/register-of-directors-specimen-entry',
    },
  }
}

export default async function RegisterOfDirectorsPage() {
  const spoke = await getSpokeDocument('register-of-directors-specimen-entry')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'Where must the Register of Directors and KMP be kept?',
      answer:
        'Under Section 170(1) of the Companies Act, 2013, the register must be kept at the registered office of the company and remain open for inspection by members during business hours without fee.',
    },
    {
      question: 'What details must be recorded in the register for a newly appointed director?',
      answer:
        'Under Rule 17 of the Companies (Appointment and Qualification of Directors) Rules, 2014, the register must contain: DIN, present name, former name, father/spouse name, date of birth, residential address, nationality, occupation, date of appointment, date of cessation (if applicable), and details of securities held in the company or its holding/subsidiary/associate companies.',
    },
    {
      question: 'What is the penalty for failure to maintain the Register of Directors under Section 172?',
      answer:
        'Under Section 172 of the Act, the company and every officer who is in default is liable to a penalty of ₹50,000, and in case of continuing failure, a further penalty of ₹500 for each day during which such failure continues, up to ₹3,00,000 for the company and ₹1,00,000 for an officer.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Failing to record securities holdings in the register',
      consequence: 'Non-compliance with Section 170(1) clause (b)',
      correction: 'Record the number, description and nominal value of securities held by the director, their spouse, or minor children.',
    },
    {
      mistake: 'Delaying register update until the end of the financial year',
      consequence: 'Statutory registers become non-compliant with immediate effect upon appointment date',
      correction: 'Enter the appointee particulars in the register immediately upon passing the board resolution and obtaining DIN details.',
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
        name: 'Register of Directors Specimen Entry',
        item: 'https://www.corplawupdates.in/documents/register-of-directors-specimen-entry',
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Register of Directors & KMP Specimen Entry (Companies Act 2013)',
    description:
      'Statutory specimen format for Register of Directors and KMP under Section 170(1) and Rule 17.',
    url: 'https://www.corplawupdates.in/documents/register-of-directors-specimen-entry',
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
