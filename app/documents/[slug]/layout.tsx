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
  let template = null
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('document_templates')
      .select('name, description, tags, category')
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
  let title = `${template.name} Format India (Free Generator) | CorpLawUpdates.in`
  let description = `${template.description} Create, customize, and edit your document instantly with AI. Fully verified for compliance under Indian laws.`
  let keywords = [template.name, `${template.name} format`, `${template.name} india`, 'generator', 'drafting', 'legal template', 'pdf download']
  
  if (template.tags && Array.isArray(template.tags)) {
    keywords = [...keywords, ...template.tags]
  }

  // Special overrides for highly searched templates
  if (slug === 'lease-agreement') {
    title = 'Rent Agreement & Lease Deed Generator India — Free & Legal | CorpLawUpdates.in'
    description = 'Generate a legally compliant Lease Agreement or Rent Deed under the Transfer of Property Act 1882. Add security deposit, lock-in, escalation, and TDS clauses. Draft in minutes.'
    keywords = [...keywords, 'rent agreement generator', 'commercial lease india', '11 month rent agreement']
  } else if (slug.includes('mortgage')) {
    title = `${template.name} Format & Generator India — Free & Legal | CorpLawUpdates.in`
    description = `Generate a legally valid ${template.name} under the Transfer of Property Act, 1882. Add custom clauses, specify property details, and download in PDF/Word format instantly.`
    keywords = [...keywords, 'mortgage deed format', 'TPA 1882', 'property mortgage india']
  } else if (slug.includes('bank-guarantee') || slug.includes('letter-of-credit')) {
    title = `${template.name} Format India — Bank Draft Generator | CorpLawUpdates.in`
    description = `Standard ${template.name} format as per Indian banking norms. Draft and customize financial guarantees and trade finance documents instantly.`
    keywords = [...keywords, 'bank guarantee format', 'trade finance india']
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
