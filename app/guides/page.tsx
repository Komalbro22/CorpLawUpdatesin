import { supabase } from '@/lib/supabase'
import { GUIDE_LIST_COLUMNS } from '@/lib/supabase-queries'
import GuidesClient from './GuidesClient'
import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { BookOpen, ChevronRight } from 'lucide-react'

export const revalidate = 300 // 5 minutes fallback; instant on-demand via revalidateArticleMutation

const PAGE_TITLE = 'Compliance Guides & Filing Kits'
const PAGE_DESCRIPTION = 'Step-by-step corporate law filing and compliance guides for MCA, SEBI, IBC, and Taxation. Verified against official notifications, rules, and circulars.'
const CANONICAL_URL = 'https://www.corplawupdates.in/guides'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: CANONICAL_URL,
    type: 'website',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=Compliance%20Guides&category=MCA', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ['https://www.corplawupdates.in/api/og?title=Compliance%20Guides&category=MCA'],
  },
}

export default async function GuidesPage() {
  const { data, error } = await supabase
    .from('updates')
    .select(GUIDE_LIST_COLUMNS)
    .eq('hide_from_listings', false)
    .not('published_at', 'is', null)
    .contains('tags', ['Evergreen Guide'])

  if (error) {
    console.error('Error fetching guides:', error)
  }

  // Sort: most recently verified first (last_verified desc, fallback to updated_at || published_at desc)
  const guides = (data || []).sort((a: any, b: any) => {
    const timeA = new Date(a.last_verified || a.updated_at || a.published_at || 0).getTime()
    const timeB = new Date(b.last_verified || b.updated_at || b.published_at || 0).getTime()
    return timeB - timeA
  })

  // JSON-LD Schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
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
        name: 'Compliance Guides',
        item: CANONICAL_URL,
      },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Compliance Guides',
    description: 'Complete step-by-step filing and compliance guides, verified against official sources.',
    numberOfItems: guides.length,
    itemListElement: guides.map((guide, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: guide.title,
      url: `https://www.corplawupdates.in/updates/${guide.slug}`,
    })),
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 sm:py-12">
      <JsonLd data={breadcrumbSchema} id="breadcrumb-schema" />
      <JsonLd data={itemListSchema} id="itemlist-schema" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors font-medium">Home</Link>
          <ChevronRight className="size-3 text-slate-400" aria-hidden="true" />
          <span className="text-navy dark:text-slate-200 font-semibold">Guides</span>
        </nav>

        {/* Header Hero */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3 border border-amber-500/20">
            <BookOpen className="size-3.5" aria-hidden="true" />
            <span>VERIFIED COMPLIANCE KITS</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-navy dark:text-white tracking-tight mb-2.5">
            Compliance Guides
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Complete step-by-step filing and compliance guides, verified against official sources.
          </p>
        </div>

        {/* Guides Client Interface */}
        <h2 className="sr-only">Available Compliance Guides</h2>
        <GuidesClient initialGuides={guides as any} />
      </main>
    </div>
  )
}
