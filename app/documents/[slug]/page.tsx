import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseDocuments } from '@/lib/supabase-documents'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getCachedDocumentTemplate } from '@/lib/document-template-cache'
import { getSpokeDocument } from '@/lib/document-sets-data'
import { DOCUMENT_SET_DOCUMENTS_SEED } from '@/data/director-appointment-seed'
import SpokeDocumentShell from '@/components/documents/SpokeDocumentShell'
import JsonLd from '@/components/JsonLd'
import DocumentGeneratorClient from './DocumentGeneratorClient'

export const revalidate = 3600
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs: { slug: string }[] = []

  // Document Set Spokes that don't have explicit directories
  const explicitFolders = [
    'dir-2-consent-format',
    'dir-8-format',
    'mbp-1-format',
    'director-appointment-letter',
    'board-resolution-director-appointment'
  ]

  DOCUMENT_SET_DOCUMENTS_SEED.forEach(doc => {
    if (doc.spoke_slug && !doc.spoke_slug.includes('#') && !explicitFolders.includes(doc.spoke_slug)) {
      slugs.push({ slug: doc.spoke_slug })
    }
  })

  // 34 Generator templates
  try {
    const client = supabaseDocuments || supabaseAdmin
    if (client) {
      const { data } = await client
        .from('document_templates')
        .select('slug')
        .eq('is_active', true)

      if (data) {
        data.forEach((t: { slug: string }) => {
          if (!slugs.some(s => s.slug === t.slug)) {
            slugs.push({ slug: t.slug })
          }
        })
      }
    }
  } catch {}

  return slugs
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams?.slug
  if (!slug) return {}

  // 1. Spoke Document Metadata
  const spoke = await getSpokeDocument(slug)
  if (spoke) {
    const title = spoke.document.seo_title || `${spoke.document.title} | Format & Law (Companies Act 2013)`
    const description =
      spoke.document.seo_description ||
      `Download ${spoke.document.title} in Word (.docx) and PDF. Governing section: ${spoke.document.governing_section}. Step ${spoke.document.step_number} of 11.`

    return {
      title,
      description,
      alternates: {
        canonical: `https://www.corplawupdates.in/documents/${slug}`,
      },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://www.corplawupdates.in/documents/${slug}`,
      },
    }
  }

  // 2. Legacy Generator Template Metadata
  const template = await getCachedDocumentTemplate(slug)
  if (template) {
    return {
      title: `${template.name} | Legal Document Generator`,
      description: template.description,
      alternates: {
        canonical: `https://www.corplawupdates.in/documents/${slug}`,
      },
    }
  }

  return {}
}

export default async function DocumentSlugPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug

  if (!slug) {
    notFound()
  }

  // 1. First check: Is this a Document Set Spoke document?
  const spoke = await getSpokeDocument(slug)
  if (spoke) {
    const { document: doc, set, currentStep, prevStep, nextStep } = spoke

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${doc.title} — Format (Companies Act, 2013)`,
      description: `Verified ${doc.title} format for private limited company. Governing section: ${doc.governing_section}. Step ${doc.step_number} of 11.`,
      url: `https://www.corplawupdates.in/documents/${doc.spoke_slug}`,
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
        <JsonLd data={jsonLd} />
        <SpokeDocumentShell
          document={doc}
          set={set}
          currentStep={currentStep}
          prevStep={prevStep}
          nextStep={nextStep}
          faqs={doc.faqs || []}
          commonMistakes={[]}
        />
      </>
    )
  }

  // 2. Second check: Is this an AI Studio Generator Template?
  const template = await getCachedDocumentTemplate(slug)
  if (template) {
    return (
      <main>
        <DocumentGeneratorClient
          slugOverride={slug}
          initialTemplate={template}
        />
      </main>
    )
  }

  notFound()
}
