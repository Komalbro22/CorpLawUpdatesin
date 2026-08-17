import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams?.slug

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

  // Optimize title/description for SEO based on document type (Next.js applies %s | CorpLawUpdates.in)
  let title = `${template.name} Format (Free Generator)`
  let description = `${template.description} Create, customize, and edit your document instantly with AI. Fully verified for compliance under Indian laws.`
  let keywords = [template.name, `${template.name} format`, `${template.name} india`, 'generator', 'drafting', 'legal template', 'pdf download']
  
  if (template.tags && Array.isArray(template.tags)) {
    keywords = [...keywords, ...template.tags]
  }

  // Special overrides for highly searched templates (clean titles under 60 chars)
  if (slug === 'lease-agreement') {
    title = 'Rent Agreement & Lease Deed Generator'
    description = 'Generate a legally compliant Lease Agreement or Rent Deed under the Transfer of Property Act 1882. Add security deposit, lock-in, escalation, and TDS clauses. Draft in minutes.'
    keywords = [...keywords, 'rent agreement generator', 'commercial lease india', '11 month rent agreement']
  } else if (slug.includes('mortgage')) {
    title = `${template.name} Format & Generator`
    description = `Generate a legally valid ${template.name} under the Transfer of Property Act, 1882. Add custom clauses, specify property details, and download in PDF/Word format instantly.`
    keywords = [...keywords, 'mortgage deed format', 'TPA 1882', 'property mortgage india']
  } else if (slug.includes('bank-guarantee') || slug.includes('letter-of-credit')) {
    title = `${template.name} Draft Generator`
    description = `Standard ${template.name} format as per Indian banking norms. Draft and customize financial guarantees and trade finance documents instantly.`
    keywords = [...keywords, 'bank guarantee format', 'trade finance india']
  } else if (slug === 'special-resolution-registered-office-shifting') {
    title = 'Special Resolution for Shifting Registered Office'
    description = 'Generate a legally valid Board Resolution, Special Resolution, and Section 102 Explanatory Statement for shifting the registered office from one State to another under Section 13 of the Companies Act 2013.'
    keywords = [...keywords, 'shifting of registered office from one state to another', 'state to state registered office shifting', 'section 13 special resolution', 'explanatory statement section 102']
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
      title: `${title} | CorpLawUpdates.in`,
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
      title: `${title} | CorpLawUpdates.in`,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function DocumentLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug

  let template: any = null
  if (slug && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('document_templates')
      .select('name, description, category, regulation_reference')
      .eq('slug', slug)
      .single()
    template = data
  }

  const docName = template?.name || (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Legal Document')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DigitalDocument',
        '@id': `https://www.corplawupdates.in/documents/${slug}#document`,
        name: docName,
        description: template?.description || `Free ${docName} format and generator for Indian legal compliance.`,
        url: `https://www.corplawupdates.in/documents/${slug}`,
        inLanguage: 'en-IN',
        publisher: {
          '@type': 'Organization',
          name: 'CorpLawUpdates.in',
          url: 'https://www.corplawupdates.in',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.corplawupdates.in',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Documents',
            item: 'https://www.corplawupdates.in/documents',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: docName,
            item: `https://www.corplawupdates.in/documents/${slug}`,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
