/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { UPDATE_LIST_COLUMNS } from '@/lib/supabase-queries'
import UpdatesClient from './UpdatesClient'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import ArticleSearchTool from '@/components/ArticleSearchTool'
import { Building2, TrendingUp, Landmark, ShieldCheck, Users, Scale, Gavel, Globe2, HelpCircle, ChevronDown, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react'

export const revalidate = 60 // 1 minute

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().toLocaleString('en-IN', { month: 'long' })

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ search?: string, category?: string }> }
): Promise<Metadata> {
  const sParams = await searchParams
  const title = `Latest Corporate Law Updates India (${CURRENT_YEAR}) – MCA, SEBI, RBI Circulars & Notifications`
  const description = `Track real-time corporate law updates in India for ${CURRENT_YEAR}. Daily circulars, notifications & regulatory compliance briefs from MCA, SEBI, RBI, NCLT, IBC, CCI, Labour Law and FEMA for CS, CA & legal professionals.`
  return {
    title,
    description,
    keywords: [
      'latest corporate law updates India',
      `corporate law updates ${CURRENT_YEAR}`,
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
    robots: sParams?.search || sParams?.category
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: 'https://www.corplawupdates.in/updates',
      type: 'website',
      images: [{ url: 'https://www.corplawupdates.in/api/og?title=Latest%20Corporate%20Law%20Updates&category=', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.corplawupdates.in/api/og?title=Latest%20Corporate%20Law%20Updates&category='],
    },
  }
}

export default async function UpdatesPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string; page?: string }>
}) {
    const sParams = await searchParams
    const search = sParams?.search || ''
    const category = sParams?.category || ''
    const page = Math.max(1, parseInt(sParams?.page || '1', 10))
    const ITEMS_PER_PAGE = 10

    // Fetch dynamic counts by category using cache
    const getCategoryCounts = unstable_cache(
        async () => {
            const { data } = await supabase.rpc('get_published_category_counts')
            return data || []
        },
        ['category-counts'],
        { revalidate: 60, tags: ['updates'] }
    )

    // Build paginated query using cache dynamically keyed by parameters
    const getUpdates = (cat: string, q: string, p: number) =>
        unstable_cache(
            async () => {
                let query = supabase
                    .from('updates')
                    .select(UPDATE_LIST_COLUMNS, { count: 'exact' })
                    .not('published_at', 'is', null)
                    .lte('published_at', new Date().toISOString())
                    .order('published_at', { ascending: false })

                if (cat && cat !== 'All') {
                    query = query.eq('category', cat)
                }

                if (q) {
                    const sanitizedSearch = q.replace(/[%_\\()\\.,]/g, '')
                    if (sanitizedSearch.trim()) {
                        query = query.or(`title.ilike.%${sanitizedSearch}%,summary.ilike.%${sanitizedSearch}%`)
                    }
                }

                const from = (p - 1) * ITEMS_PER_PAGE
                const to = from + ITEMS_PER_PAGE - 1
                const { data, count } = await query.range(from, to)
                return { data: data || [], count: count || 0 }
            },
            ['paginated-updates', cat, q, String(p)],
            { revalidate: 60, tags: ['updates'] }
        )()

    // Fetch top 10 updates using cache for AI ItemList schema
    const getTop10 = unstable_cache(
        async () => {
            const { data } = await supabase
                .from('updates')
                .select(UPDATE_LIST_COLUMNS)
                .not('published_at', 'is', null)
                .lte('published_at', new Date().toISOString())
                .order('published_at', { ascending: false })
                .limit(10)
            return data || []
        },
        ['top-10-updates'],
        { revalidate: 3600, tags: ['updates'] }
    )

    const categoryRows = await getCategoryCounts()
    const counts: Record<string, number> = {}
    let totalPublishedCount = 0
    ;(categoryRows || []).forEach((row: { category: string; count: number }) => {
        counts[row.category] = Number(row.count)
        totalPublishedCount += Number(row.count)
    })

    const { data: paginatedUpdates, count: totalFilteredCount } = await getUpdates(category, search, page)
    const top10 = await getTop10()
    const lastModified = top10[0]?.published_at || new Date().toISOString()

    const latestMca = top10.find((u: any) => u.category === 'MCA')
    const latestSebi = top10.find((u: any) => u.category === 'SEBI')
    const latestRbi = top10.find((u: any) => u.category === 'RBI')

    // 1. Breadcrumb JSON-LD Schema
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
                name: 'Corporate Law Updates',
                item: 'https://www.corplawupdates.in/updates',
            },
        ],
    }

    // 2. CollectionPage JSON-LD Schema
    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Latest Corporate Law & Regulatory Updates ${CURRENT_YEAR}`,
        description: 'Real-time archive of latest MCA circulars, SEBI notifications, RBI guidelines, NCLT orders, IBC amendments, and FEMA regulatory updates for India.',
        url: 'https://www.corplawupdates.in/updates',
        dateModified: lastModified,
        inLanguage: 'en-IN',
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['#updates-overview-heading', '#updates-overview-summary'],
        },
        publisher: {
            '@type': 'Organization',
            name: 'CorpLawUpdates.in',
            url: 'https://www.corplawupdates.in',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.corplawupdates.in/icon.png',
            },
        },
    }

    // 3. ItemList JSON-LD Schema (Top 10 Updates for AI Engines)
    const itemListSchema = top10.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Latest Indian Corporate Law Updates — ${CURRENT_MONTH} ${CURRENT_YEAR}`,
        numberOfItems: top10.length,
        itemListElement: top10.map((u: any, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: u.title,
            url: `https://www.corplawupdates.in/updates/${u.slug}`,
            datePublished: u.published_at,
            description: u.summary || u.excerpt || u.title,
        })),
    } : null

    // 4. Comprehensive FAQ Schema for Google Search Rich Results & AI Overviews
    const faqs = [
        {
            question: `What are the latest corporate law updates in India for ${CURRENT_YEAR}?`,
            answer: `The latest corporate law updates cover statutory circulars and notifications issued across MCA (Companies Act 2013), SEBI (LODR & ICDR Regulations), RBI (Monetary & Banking directions), IBC/IBBI (Insolvency proceedings), CCI, and Labour Laws. Recent key updates include "${top10[0]?.title || 'regulatory circulars'}" published with practical compliance analysis.`
        },
        {
            question: `Where can professionals find MCA circulars and ROC notifications today?`,
            answer: latestMca
                ? `The latest MCA update is "${latestMca.title}". ${latestMca.summary || ''} All MCA notifications and Companies Act compliance filings can be tracked at https://www.corplawupdates.in/category/mca.`
                : `All Ministry of Corporate Affairs (MCA) circulars, e-form guidelines, and ROC updates are tracked daily at https://www.corplawupdates.in/category/mca.`
        },
        {
            question: `What recent SEBI and RBI regulatory changes affect Indian companies?`,
            answer: `SEBI regularly releases circulars regarding LODR disclosures, accredited investors, debt securities risk-o-meters, and market conduct. RBI updates focus on master directions, interest rates, lending norms, and FEMA cross-border compliance. The latest SEBI notification is "${latestSebi?.title || 'SEBI regulatory circular'}".`
        },
        {
            question: `How do Company Secretaries and CAs stay compliant with frequent statutory amendments?`,
            answer: `Professionals track official gazette notifications, subscribe to verified corporate law feeds, utilize interactive ROC fee calculators, and reference statutory compliance calendars to ensure timely filings for Forms AOC-4, MGT-7, DIR-3 KYC, and LODR quarterly disclosures.`
        },
        {
            question: `Are circular summaries on CorpLawUpdates verified against official regulator sources?`,
            answer: `Yes, all corporate law briefings on CorpLawUpdates.in are analyzed and verified by corporate law professionals directly against official gazettes, press releases, and circulars issued by MCA, SEBI, RBI, NCLT, IBBI, and the Ministry of Labour & Employment.`
        }
    ]

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    }

    return (
        <div>
            <ArticleSearchTool />

            {/* High-Authority Editorial Navy Hero */}
            <div className="relative bg-navy text-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(245,158,11,0.14),transparent_50%)]" aria-hidden />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 relative">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/60 text-xs mb-3">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white/90 font-medium">All Regulatory Updates</span>
                    </nav>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
                            <Sparkles className="size-3.5 text-amber-300" aria-hidden="true" />
                            Live Regulatory Feed {CURRENT_YEAR}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <h1 id="updates-overview-heading" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-balance">
                            Latest Corporate Law & Regulatory Updates {CURRENT_YEAR}
                        </h1>
                        <span className="inline-flex items-center w-fit bg-white/10 text-white font-semibold py-2 px-4 rounded-lg text-sm ring-1 ring-white/15 backdrop-blur-sm shadow-sm tabular-nums">
                            {totalPublishedCount} articles published
                        </span>
                    </div>

                    {/* Answer-First High-Relevance Summary for Google & AI Overviews */}
                    <p id="updates-overview-summary" className="text-slate-200 mt-4 max-w-3xl text-sm md:text-base leading-relaxed">
                        Track all <strong>latest corporate law updates in India</strong> — including <strong>MCA circulars today</strong>, <strong>SEBI notifications</strong>, <strong>RBI guidelines</strong>, NCLT judgments, IBC amendments, CCI orders, and Labour Laws. Updated daily with simplified analysis for Company Secretaries (CS), Chartered Accountants (CA), Cost Accountants (CMA), legal professionals, and corporate leaders.
                    </p>
                    {top10[0] && (
                        <p className="text-slate-300 text-xs mt-3 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                            Last updated: <time dateTime={top10[0].published_at} className="font-medium text-white tabular-nums">
                                {new Date(top10[0].published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </time>
                        </p>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 pb-16 pt-8 md:pt-10">
                <h2 className="sr-only">Corporate Law & Regulatory Circulars Directory</h2>
                {totalPublishedCount === 0 ? (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-12 text-center shadow-card">
                        <h3 className="font-heading text-xl font-bold text-navy dark:text-white">No updates published yet</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Published regulatory updates will appear here once they are available.
                        </p>
                    </div>
                ) : (
                    <Suspense fallback={
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <LoadingSkeleton key={i} />
                        ))}
                      </div>
                    }>
                        <UpdatesClient 
                            paginatedUpdates={paginatedUpdates} 
                            totalFilteredCount={totalFilteredCount}
                            totalPublishedCount={totalPublishedCount}
                            counts={counts} 
                        />
                    </Suspense>
                )}
            </div>

            {/* Regulatory Authority Coverage Taxonomy */}
            <section className="max-w-7xl mx-auto px-4 pb-12">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="size-5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-navy dark:text-white font-heading">
                            Indian Regulatory Authorities & Statutory Coverage
                        </h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-3xl">
                        Our intelligence engine monitors real-time circulars, master directions, and gazette notifications across India's primary corporate and financial regulatory bodies:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: 'MCA Updates', code: 'MCA', desc: 'Ministry of Corporate Affairs, Companies Act 2013, LLP Act & ROC compliance', href: '/category/mca', color: 'border-l-blue-600' },
                            { name: 'SEBI Notifications', code: 'SEBI', desc: 'Securities and Exchange Board of India, LODR, ICDR & capital markets', href: '/category/sebi', color: 'border-l-emerald-600' },
                            { name: 'RBI Circulars', code: 'RBI', desc: 'Reserve Bank of India, master directions, banking regulation & monetary policy', href: '/category/rbi', color: 'border-l-violet-600' },
                            { name: 'CCI Orders', code: 'CCI', desc: 'Competition Commission of India, antitrust, merger control & combinations', href: '/category/cci', color: 'border-l-indigo-600' },
                            { name: 'Labour Law Updates', code: 'LABOUR', desc: '4 Labour Codes, EPFO ECR, ESIC compliance & statutory wages', href: '/category/labour', color: 'border-l-amber-600' },
                            { name: 'NCLT Orders', code: 'NCLT', desc: 'National Company Law Tribunal orders, company petition decisions & appeals', href: '/category/nclt', color: 'border-l-orange-600' },
                            { name: 'IBC Updates', code: 'IBC', desc: 'Insolvency and Bankruptcy Board of India (IBBI) regulations & CIRP processes', href: '/category/ibc', color: 'border-l-red-600' },
                            { name: 'FEMA Regulations', code: 'FEMA', desc: 'Foreign Exchange Management Act, FDI, ODI, ECB & cross-border remittances', href: '/category/fema', color: 'border-l-teal-600' },
                        ].map(reg => (
                            <Link
                                key={reg.code}
                                href={reg.href}
                                className={`block p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 ${reg.color} bg-slate-50/50 dark:bg-slate-900/50 hover:bg-amber-50/50 dark:hover:bg-slate-800/60 transition-colors group`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-bold text-sm text-navy dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">{reg.name}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{reg.code}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{reg.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI & GEO Optimized FAQ Accordion Section */}
            <section id="faq-section" aria-label="Frequently Asked Questions" className="max-w-7xl mx-auto px-4 pb-16">
                <div className="bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="size-5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-navy dark:text-white font-heading">
                            Frequently Asked Questions: Latest Corporate Law Updates
                        </h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                        Essential answers regarding Indian corporate law, MCA filing rules, and regulatory tracking in {CURRENT_YEAR}:
                    </p>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <details
                                key={idx}
                                open={idx === 0}
                                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all duration-200"
                            >
                                <summary className="cursor-pointer font-semibold text-navy dark:text-slate-100 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden focus:outline-none text-sm md:text-base">
                                    <span className="flex items-center gap-2.5">
                                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" />
                                        {faq.question}
                                    </span>
                                    <ChevronDown className="size-4 text-slate-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0 ml-2" aria-hidden="true" />
                                </summary>
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Compliance Tools & Navigation Bar */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-navy dark:text-white font-heading mb-1">
                            Explore Free Corporate Compliance Tools
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                            Access our legal document generator, MCA fee calculator, statutory calendar, and company search engine.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <Link href="/tools/fee-calculator" className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-slate-700 text-navy dark:text-slate-200 font-semibold px-3.5 py-2 rounded-lg transition-colors">
                            ROC Fee Calculator
                        </Link>
                        <Link href="/calendar" className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-slate-700 text-navy dark:text-slate-200 font-semibold px-3.5 py-2 rounded-lg transition-colors">
                            Compliance Calendar
                        </Link>
                        <Link href="/documents" className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-slate-700 text-navy dark:text-slate-200 font-semibold px-3.5 py-2 rounded-lg transition-colors">
                            Document Generator
                        </Link>
                        <Link href="/company-search" className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold px-3.5 py-2 rounded-lg transition-colors">
                            Company Search
                        </Link>
                    </div>
                </div>
            </section>

            {/* JSON-LD Schemas */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
            {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </div>
    )
}
