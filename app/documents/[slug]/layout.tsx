import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'

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
  const { data: template } = await supabaseAdmin
    .from('document_templates')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!template) {
    return {
      title: 'AI Legal Document Generator | CorpLawUpdates.in',
    }
  }

  // Optimize title/description for SEO based on document type
  let title = `${template.name} Generator India — AI-Powered & Free | CorpLawUpdates.in`
  let description = `${template.description}. Create, customize, and edit your document instantly with AI. Fully verified for compliance under Indian laws.`

  if (slug === 'lease-agreement') {
    title = 'Rent Agreement & Lease Deed Generator India — Free & Legal | CorpLawUpdates.in'
    description = 'Generate a legally compliant Lease Agreement or Rent Deed under the Transfer of Property Act 1882. Add security deposit, lock-in, escalation, and TDS clauses. Draft in minutes.'
  }

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.corplawupdates.in/documents/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.corplawupdates.in/documents/${slug}`,
      type: 'website',
    },
  }
}

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
