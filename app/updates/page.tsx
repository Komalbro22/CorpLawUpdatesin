/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import UpdatesClient from './UpdatesClient'
import { SkeletonGrid } from '@/components/LoadingSkeleton'
import { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 3600

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().toLocaleString('en-IN', { month: 'long' })

export async function generateMetadata(
  { searchParams }: { searchParams: { search?: string, category?: string } }
): Promise<Metadata> {
  const title = `Latest Corporate Law & Regulatory Updates ${CURRENT_YEAR} — MCA, SEBI, RBI Circulars India`
  const description = `Browse all latest corporate law updates for ${CURRENT_YEAR}: MCA circulars today, SEBI notifications, RBI guidelines, NCLT orders, IBC updates and FEMA regulations. Updated daily for CS, CA & compliance professionals in India.`
  return {
    title,
    description,
    keywords: [
      'latest corporate law updates India',
      'latest regulatory update India',
      `MCA update today ${CURRENT_YEAR}`,
      `MCA circular today ${CURRENT_YEAR}`,
      `SEBI notification today ${CURRENT_YEAR}`,
      `RBI circular today ${CURRENT_YEAR}`,
      'MCA circulars India',
      'SEBI notifications India',
      'RBI guidelines India',
      'NCLT orders India',
      'IBC updates India',
      'FEMA notifications India',
      'corporate compliance updates',
      'CS professional updates India',
    ],
    alternates: { canonical: 'https://www.corplawupdates.in/updates' },
    robots: searchParams.search || searchParams.category
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: 'https://www.corplawupdates.in/updates',
      images: [{ url: 'https://www.corplawupdates.in/api/og?title=All%20Regulatory%20Updates&category=', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.corplawupdates.in/api/og?title=All%20Regulatory%20Updates&category='],
    },
  }
}

export default async function UpdatesPage() {
    const { data } = await supabase
        .from('updates')
        .select('*')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })

    const updates = data || []
    const top5 = updates.slice(0, 5)
    const lastModified = updates[0]?.published_at || new Date().toISOString()

    const counts: Record<string, number> = {}
    updates.forEach(u => { counts[u.category] = (counts[u.category] || 0) + 1 })

    // JSON-LD Schemas
    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Latest Corporate Law & Regulatory Updates ${CURRENT_YEAR}`,
        description: 'Comprehensive archive of latest MCA circulars, SEBI notifications, RBI guidelines, NCLT orders, IBC and FEMA regulatory updates for India.',
        url: 'https://www.corplawupdates.in/updates',
        dateModified: lastModified,
        publisher: { '@type': 'Organization', name: 'CorpLawUpdates.in', url: 'https://www.corplawupdates.in' },
    }

    const itemListSchema = top5.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Latest Regulatory Updates — ${CURRENT_MONTH} ${CURRENT_YEAR}`,
        numberOfItems: top5.length,
        itemListElement: top5.map((u: any, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: u.title,
            url: `https://www.corplawupdates.in/updates/${u.slug}`,
            datePublished: u.published_at,
            description: u.summary || u.excerpt || u.title,
        })),
    } : null

    const faqSchema = top5.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What is the latest MCA update today ${CURRENT_YEAR}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: top5.find((u: any) => u.category === 'MCA')
                        ? `The latest MCA update is "${top5.find((u: any) => u.category === 'MCA')?.title}". ${top5.find((u: any) => u.category === 'MCA')?.summary || ''}`
                        : `Visit our MCA updates page at https://www.corplawupdates.in/category/mca for the latest MCA circulars and notifications.`,
                },
            },
            {
                '@type': 'Question',
                name: `What is the latest SEBI notification today ${CURRENT_YEAR}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: top5.find((u: any) => u.category === 'SEBI')
                        ? `The latest SEBI update is "${top5.find((u: any) => u.category === 'SEBI')?.title}". ${top5.find((u: any) => u.category === 'SEBI')?.summary || ''}`
                        : `Visit our SEBI updates page at https://www.corplawupdates.in/category/sebi for the latest SEBI circulars.`,
                },
            },
            {
                '@type': 'Question',
                name: 'What is the latest regulatory update in India?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: top5[0]
                        ? `The most recent regulatory update is "${top5[0].title}" from ${top5[0].category}. ${top5[0].summary || ''} Published on ${new Date(top5[0].published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}.`
                        : `CorpLawUpdates.in tracks daily regulatory updates from MCA, SEBI, RBI, NCLT, IBC and FEMA.`,
                },
            },
        ],
    } : null

    return (
        <div>
            {/* Hero */}
            <div className="relative bg-navy text-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(245,158,11,0.12),transparent_50%)]" aria-hidden />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 relative">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/50 text-xs mb-3">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white/80">All Regulatory Updates</span>
                    </nav>
                    <p className="text-gold/90 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                        Browse the archive
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-balance">
                            Latest Corporate Law & Regulatory Updates {CURRENT_YEAR}
                        </h1>
                        <span className="inline-flex items-center w-fit bg-white/10 text-white font-semibold py-2 px-4 rounded-lg text-sm ring-1 ring-white/15 backdrop-blur-sm">
                            {updates.length} articles
                        </span>
                    </div>
                    {/* Answer-First paragraph for AI/Google */}
                    <p className="text-slate-300 mt-4 max-w-3xl text-sm md:text-base leading-relaxed">
                        Track all latest regulatory updates in India — MCA circulars today, SEBI notifications, RBI guidelines, NCLT orders, IBC circulars and FEMA notifications — updated daily for Company Secretaries, Chartered Accountants, Cost Accountants (CMA), law students, CS students, legal enthusiasts, and corporate compliance professionals.
                    </p>
                    {updates[0] && (
                        <p className="text-white/50 text-xs mt-3">
                            Last updated: <time dateTime={updates[0].published_at}>
                                {new Date(updates[0].published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </time>
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16 pt-8 md:pt-10">
                {updates.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-card">
                        <h2 className="font-heading text-xl font-bold text-navy">No updates published yet</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                            Published regulatory updates will appear here once they are available.
                        </p>
                    </div>
                ) : (
                    <Suspense fallback={<SkeletonGrid />}>
                        <UpdatesClient updates={updates} counts={counts} />
                    </Suspense>
                )}
            </div>

            {/* SEO Knowledge Footer */}
            <section className="max-w-7xl mx-auto px-4 pb-16 border-t border-slate-100">
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-navy mb-4 font-heading">
                        About Indian Corporate Law & Regulatory Updates {CURRENT_YEAR}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm text-slate-500 leading-relaxed">
                        <div className="space-y-3">
                            <p>
                                Stay ahead with the <strong>latest corporate law updates in India</strong> including
                                <strong> MCA circulars today</strong>, <strong>SEBI notifications</strong>,
                                <strong> RBI circulars</strong>, NCLT orders, IBC amendments, and FEMA notifications.
                            </p>
                            <p>
                                Our platform provides simplified, expert-sourced summaries of every <strong>regulatory update in India {CURRENT_YEAR}</strong> — ideal for Company Secretaries (CS), Chartered Accountants (CA), Cost Accountants (CMA), law students, CS/CA/CMA students, legal enthusiasts, corporate lawyers, and compliance teams tracking daily regulatory changes.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p>Browse updates by regulator:</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Latest MCA Circulars', href: '/category/mca' },
                                    { label: 'SEBI Notifications', href: '/category/sebi' },
                                    { label: 'RBI Circulars', href: '/category/rbi' },
                                    { label: 'NCLT Orders', href: '/category/nclt' },
                                    { label: 'IBC Updates', href: '/category/ibc' },
                                    { label: 'FEMA Notifications', href: '/category/fema' },
                                    { label: `Compliance Calendar ${CURRENT_YEAR}`, href: '/calendar' },
                                ].map(l => (
                                    <Link key={l.href} href={l.href} className="text-xs bg-white border border-slate-200 text-gold px-3 py-1.5 rounded-full hover:border-amber-300 hover:bg-amber-50 transition-colors font-medium">
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* JSON-LD Schemas */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
            {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
        </div>
    )
}
