import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Form MBP-1 Format | Notice of Interest by Director (Companies Act 2013)'
  const description =
    'Download Form MBP-1 format under Section 184(1) and Rule 9(1). Disclosure of interest by a director in other companies, bodies corporate, and firms.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/mbp-1-format',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/mbp-1-format',
    },
  }
}

export default async function Mbp1FormatPage() {
  const spoke = await getSpokeDocument('mbp-1-format')
  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'When must a newly appointed director submit Form MBP-1?',
      answer:
        'Under Section 184(1) of the Companies Act, 2013 read with Rule 9(1), a newly appointed director must submit Form MBP-1 disclosing their interests at the VERY FIRST Board Meeting they attend as a director.',
    },
    {
      question: 'Where are MBP-1 disclosures recorded in the company registers?',
      answer:
        'The disclosures made in Form MBP-1 are read out and taken on record by the Board, and entered into the Register of Contracts or Arrangements in which Directors are Interested (Form MBP-4) under Section 189.',
    },
    {
      question: 'What is the penalty for failure to disclose interest under Section 184?',
      answer:
        'A director who fails to disclose their interest under Section 184(1) is punishable with a fine of up to ₹1,00,000, and vacates office as a director under Section 167(1)(c) of the Act.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Waiting until the next financial year to collect MBP-1',
      consequence: 'Non-compliance with Section 184(1) and vacation of office risk under Section 167',
      correction: 'Collect Form MBP-1 immediately upon appointment so it is tabled at the very first meeting the new director attends.',
    },
    {
      mistake: 'Failing to record disclosures in the Section 189 Register (MBP-4)',
      consequence: 'Audit observation and MCA adjudication penalties on Company and officers in default',
      correction: 'Promptly enter all entities disclosed in Form MBP-1 into the statutory MBP-4 register maintained at the registered office.',
    },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
      { '@type': 'ListItem', position: 3, name: 'MBP-1 Format', item: 'https://www.corplawupdates.in/documents/mbp-1-format' },
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
        quickAnswer="Form MBP-1 is the statutory disclosure of interest under Section 184(1) of the Companies Act, 2013 and Rule 9(1) of the Companies (Meetings of Board and its Powers) Rules, 2014. It is mandatory for every new director to submit Form MBP-1 at the first board meeting attended to disclose directorships, shareholdings, and firm partnerships."
        faqs={faqs}
        commonMistakes={commonMistakes}
      />
    </>
  )
}
