import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpokeDocument } from '@/lib/document-sets-data'
import { getCachedDocumentTemplate } from '@/lib/document-template-cache'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import DocumentGeneratorClient from '../[slug]/DocumentGeneratorClient'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Board Resolution for Appointment of Director | Certified True Copy Format (Sec 161)'
  const description =
    'Download certified board resolution format for appointment of Additional Director under Section 161(1) of the Companies Act, 2013 in Word (.docx) and PDF.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/board-resolution-director-appointment',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/board-resolution-director-appointment',
    },
  }
}

export default async function BoardResolutionDirectorAppointmentPage() {
  const [spoke, template] = await Promise.all([
    getSpokeDocument('board-resolution-director-appointment'),
    getCachedDocumentTemplate('board-resolution-director-appointment'),
  ])

  if (!spoke) notFound()

  const { document: doc, set, currentStep, prevStep, nextStep } = spoke

  const faqs = [
    {
      question: 'Which Section of the Companies Act governs the appointment of an Additional Director by the Board?',
      answer:
        'Section 161(1) of the Companies Act, 2013 empowers the Board of Directors to appoint any person as an Additional Director if authorised by the company\'s Articles of Association. Such director holds office up to the date of the next AGM or the last date on which the AGM should have been held.',
    },
    {
      question: 'Is Form MGT-14 required for a board resolution appointing an Additional Director in a private limited company?',
      answer:
        'No. Under MCA Notification G.S.R. 464(E) dated 5 June 2015, private companies are exempt from Section 117(3)(g) regarding board resolutions passed under Section 179(3). Therefore, no MGT-14 filing is required for this resolution in a private company.',
    },
    {
      question: 'What filing must be completed after passing this board resolution?',
      answer:
        'Form DIR-12 must be electronically filed on the MCA V3 portal within 30 days of the date of the board meeting, attaching a certified true copy of this resolution, Form DIR-2 consent, and Form DIR-8 intimation.',
    },
  ]

  const commonMistakes = [
    {
      mistake: 'Appointing an Additional Director when the Articles of Association do not contain an enabling clause',
      consequence: 'Appointment is ultra vires and invalid',
      correction: 'Inspect the company Articles of Association (AoA). If the AoA does not explicitly empower the Board to appoint Additional Directors, amend the AoA via special resolution first.',
    },
    {
      mistake: 'Filing Form MGT-14 for private companies',
      consequence: 'Unnecessary expenditure of MCA fees and administrative confusion',
      correction: 'Private limited companies are exempt from filing MGT-14 for Section 179(3) board resolutions under Notification G.S.R. 464(E).',
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
        name: 'Board Resolution — Director Appointment',
        item: 'https://www.corplawupdates.in/documents/board-resolution-director-appointment',
      },
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
        quickAnswer="This Certified True Copy of the Board Resolution is passed under Section 161(1) of the Companies Act, 2013 and the company's Articles of Association to appoint an Additional Director. It authorizes the filing of Form DIR-12 with the ROC within 30 days and the making of statutory entries in the Register of Directors under Section 170."
        faqs={faqs}
        commonMistakes={commonMistakes}
      >
        {template && (
          <div className="p-6 rounded-2xl bg-card border border-border mb-8 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Interactive Document Customizer
              </span>
              <h3 className="text-lg font-bold text-foreground">
                Customize & Generate Resolution Online
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fill company and director details below to customize the resolution or download the locked Bookman Old Style template above.
              </p>
            </div>
            <DocumentGeneratorClient
              slugOverride="board-resolution-director-appointment"
              initialTemplate={template}
            />
          </div>
        )}
      </SpokeDocumentShell>
    </>
  )
}
