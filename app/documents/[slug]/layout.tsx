import { Metadata } from 'next'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

interface LayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  // Extract slug - handle Next.js 13/14 App Router param types
  const slug = params?.slug

  if (!slug) {
    return {
      title: 'AI Legal Document Generator | CorpLawUpdates.in',
    }
  }

  // Fetch template from Supabase
  let template = null
  if (supabaseDocumentsAdmin) {
    const { data } = await supabaseDocumentsAdmin
      .from('document_templates')
      .select('name, description')
      .eq('slug', slug)
      .single()
    template = data
  }

  if (!template) {
    return {
      title: 'AI Legal Document Generator | CorpLawUpdates.in',
    }
  }

  // Optimize title/description for SEO based on document type
  let title = `${template.name} Generator India — AI-Powered & Free | CorpLawUpdates.in`
  let description = `${template.description}. Create, customize, and edit your document instantly with AI. Fully verified for compliance under Indian laws.`
  let keywords = [template.name, 'generator', 'india', 'drafting', 'legal format', 'template', 'pdf download']

  if (slug === 'lease-agreement') {
    title = 'Rent Agreement & Lease Deed Generator India — Free & Legal | CorpLawUpdates.in'
    description = 'Generate a legally compliant Lease Agreement or Rent Deed under the Transfer of Property Act 1882. Add security deposit, lock-in, escalation, and TDS clauses. Draft in minutes.'
    keywords = ['rent agreement generator', 'lease deed format', 'commercial lease india', '11 month rent agreement', 'online rent agreement']
  }

  const ogImageUrl = `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(template.name)}&type=Document Generator`

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://www.corplawupdates.in/documents/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.corplawupdates.in/documents/${slug}`,
      type: 'website',
      siteName: 'CorpLawUpdates.in',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${template.name} Document Generator`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
