import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCachedDocumentTemplate } from '@/lib/document-template-cache'
import { getDocumentSeoGuide } from '@/lib/documents-seo-guides'
import JsonLd from '@/components/JsonLd'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams?.slug

  if (!slug) {
    notFound()
  }

  const template = await getCachedDocumentTemplate(slug)

  if (!template) {
    notFound()
  }

  const guide = getDocumentSeoGuide(slug)

  // Optimize title/description for SEO based on document type (Next.js applies %s | CorpLawUpdates.in)
  let title = `${template.name} Format (Free Generator)`
  let description = `${template.description} Create and customize an editable draft for professional review. Check the stated legal references and suitability for your circumstances before use.`
  let keywords = [template.name, `${template.name} format`, `${template.name} india`, 'generator', 'drafting', 'legal template', 'pdf download']

  if (template.tags && Array.isArray(template.tags)) {
    keywords = [...keywords, ...template.tags]
  }

  if (guide) {
    title = guide.seoTitle
    description = guide.metaDescription
    keywords = [...guide.keywords, ...keywords]
  } else if (slug === 'lease-agreement') {
    title = 'Rent Agreement & Lease Deed Generator'
    description = 'Generate a legally compliant Lease Agreement or Rent Deed under the Transfer of Property Act 1882. Add security deposit, lock-in, escalation, and TDS clauses. Draft in minutes.'
    keywords = [...keywords, 'rent agreement generator', 'commercial lease india', '11 month rent agreement']
  } else if (slug.includes('mortgage')) {
    title = `${template.name} Format & Generator`
    description = `Draft a ${template.name} referencing the Transfer of Property Act, 1882. Add custom clauses, specify property details, and download in PDF/Word format for review.`
    keywords = [...keywords, 'mortgage deed format', 'TPA 1882', 'property mortgage india']
  } else if (slug.includes('bank-guarantee') || slug.includes('letter-of-credit')) {
    title = `${template.name} Draft Generator`
    description = `Draft a ${template.name} using the template details and review it against applicable Indian banking requirements before execution.`
    keywords = [...keywords, 'bank guarantee format', 'trade finance india']
  } else if (slug === 'special-resolution-registered-office-shifting') {
    title = 'Special Resolution for Shifting Registered Office'
    description = 'Generate a legally valid Board Resolution, Special Resolution, and Section 102 Explanatory Statement for shifting the registered office from one State to another under Section 13 of the Companies Act 2013.'
    keywords = [...keywords, 'shifting of registered office from one state to another', 'state to state registered office shifting', 'section 13 special resolution', 'explanatory statement section 102']
  }

  const uniqueKeywords = Array.from(new Set(keywords))

  const ogImageUrl = `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(template.name)}&type=Document Generator`

  return {
    title,
    description,
    keywords: uniqueKeywords,
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
  if (!slug) {
    notFound()
  }

  const template = await getCachedDocumentTemplate(slug)

  if (!template) {
    notFound()
  }

  const guide = getDocumentSeoGuide(slug)
  const docName = guide?.h1 || template.name
  const docUrl = `https://www.corplawupdates.in/documents/${slug}`
  const docDescription =
    guide?.metaDescription ||
    template?.description ||
    `Free ${template.name} format and generator for Indian legal compliance.`

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': 'https://www.corplawupdates.in/#website',
      url: 'https://www.corplawupdates.in',
      name: 'CorpLawUpdates.in',
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.corplawupdates.in/#organization',
      name: 'CorpLawUpdates.in',
      url: 'https://www.corplawupdates.in',
    },
    {
      '@type': 'WebPage',
      '@id': `${docUrl}#webpage`,
      url: docUrl,
      name: guide?.seoTitle || `${template.name} Format (Free Generator)`,
      description: docDescription,
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
      mainEntity: { '@id': `${docUrl}#document` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${docUrl}#generator`,
      name: `${template.name} Generator`,
      url: docUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      publisher: { '@id': 'https://www.corplawupdates.in/#organization' },
    },
    {
      '@type': 'DigitalDocument',
      '@id': `${docUrl}#document`,
      name: docName,
      description: docDescription,
      url: docUrl,
      inLanguage: 'en-IN',
      publisher: { '@id': 'https://www.corplawupdates.in/#organization' },
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
          name: template.name,
          item: docUrl,
        },
      ],
    },
  ]

  if (guide && guide.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${docUrl}#faq`,
      mainEntity: guide.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    })
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return (
    <>
      <JsonLd id={`document-template-schema-${slug}`} data={jsonLd} />
      {children}
    </>
  )
}
