/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/lib/supabase'
import { UPDATE_LIST_COLUMNS } from '@/lib/supabase-queries'
import { notFound, redirect } from 'next/navigation'
import UpdateCard from '@/components/UpdateCard'
import Pagination from '@/components/Pagination'
import { Metadata } from 'next'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'

export const revalidate = 43200 // 12 hours

const CATEGORIES = ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema']

const CATEGORY_FULL_NAMES: Record<string, string> = {
    mca: 'Ministry of Corporate Affairs',
    sebi: 'Securities and Exchange Board of India',
    rbi: 'Reserve Bank of India',
    nclt: 'National Company Law Tribunal',
    ibc: 'Insolvency and Bankruptcy Code',
    fema: 'Foreign Exchange Management Act',
}

const OFFICIAL_URLS: Record<string, string> = {
    mca: 'https://www.mca.gov.in',
    sebi: 'https://www.sebi.gov.in',
    rbi: 'https://www.rbi.org.in',
    nclt: 'https://nclt.gov.in',
    ibc: 'https://ibbi.gov.in',
    fema: 'https://rbi.org.in/Scripts/BS_FemaNotifications.aspx',
}

// Answer-First definition paragraphs for AI Overview + SEO
const ANSWER_FIRST: Record<string, { definition: string; facts: string[] }> = {
    mca: {
        definition:
            'MCA Circulars are official communications issued by the Ministry of Corporate Affairs under the Companies Act, 2013. They clarify procedural requirements, grant extensions, and amend compliance deadlines for registered companies and LLPs in India. This page tracks all latest MCA circulars, notifications, orders, consultation papers and clarifications.',
        facts: [
            'MCA issues circulars, notifications, orders, and consultation papers.',
            'Key compliance forms include MCA V3 portal filings such as MGT-7, AOC-4, DIR-3 KYC.',
            'MCA circulars are binding on all companies registered under Companies Act, 2013.',
            'Violations may lead to penalty, adjudication, or director disqualification.',
        ],
    },
    sebi: {
        definition:
            'SEBI Circulars are official directives issued by the Securities and Exchange Board of India under the SEBI Act, 1992. They regulate capital markets, stock exchanges, mutual funds, listed companies, and investor protection in India. This page tracks all latest SEBI circulars, master circulars, notifications, and consultation papers.',
        facts: [
            'SEBI issues circulars, master circulars, informal guidance, and consultation papers.',
            'SEBI regulates stock exchanges, brokers, mutual funds, and listed entities.',
            'SEBI circulars apply to SEBI-registered market intermediaries and listed companies.',
            'Non-compliance can lead to warnings, penalties, or suspension of registration.',
        ],
    },
    rbi: {
        definition:
            'RBI Circulars are official directives issued by the Reserve Bank of India under the RBI Act, 1934 and the Banking Regulation Act, 1949. They cover banking regulation, monetary policy, FEMA compliance, foreign exchange management, and NBFC rules in India. This page tracks all latest RBI circulars, master directions, notifications, and press releases.',
        facts: [
            'RBI issues circulars, master directions, press releases, and guidelines.',
            'RBI regulates commercial banks, cooperative banks, NBFCs, and payment systems.',
            'RBI circulars are binding on all scheduled banks and regulated entities.',
            'FEMA (Foreign Exchange Management Act) circulars are also issued under RBI authority.',
        ],
    },
    nclt: {
        definition:
            'NCLT Orders are judicial pronouncements issued by the National Company Law Tribunal under the Companies Act, 2013 and the Insolvency and Bankruptcy Code, 2016. They adjudicate corporate insolvency, mergers, acquisitions, oppression and mismanagement disputes. This page tracks all latest NCLT orders, circulars, and practice directions.',
        facts: [
            'NCLT has benches across India including Delhi, Mumbai, Chennai, and Kolkata.',
            'NCLT adjudicates insolvency resolution proceedings (CIRP) and liquidation.',
            'NCLT orders on mergers and amalgamations are binding under Companies Act, 2013.',
            'NCLAT is the appellate tribunal for NCLT orders.',
        ],
    },
    ibc: {
        definition:
            'IBC Updates refer to amendments, notifications, and circulars issued under the Insolvency and Bankruptcy Code, 2016 by the Ministry of Corporate Affairs and the Insolvency and Bankruptcy Board of India (IBBI). They govern corporate insolvency resolution, personal insolvency, and liquidation in India. This page tracks all latest IBC updates, IBBI circulars, and regulatory changes.',
        facts: [
            'IBC was enacted in 2016 to consolidate insolvency laws in India.',
            'IBBI (Insolvency and Bankruptcy Board of India) is the regulator under IBC.',
            'The Corporate Insolvency Resolution Process (CIRP) must be completed within 330 days.',
            'IBC governs both corporate and personal insolvency proceedings.',
        ],
    },
    fema: {
        definition:
            'FEMA Notifications are official directives issued under the Foreign Exchange Management Act, 1999 by the Reserve Bank of India. They govern cross-border transactions, foreign direct investment (FDI), overseas direct investment (ODI), and external commercial borrowings (ECB) in India. This page tracks all latest FEMA notifications, master directions, and RBI circulars on foreign exchange.',
        facts: [
            'FEMA replaced FERA (Foreign Exchange Regulation Act) in 1999.',
            'FEMA violations are civil offences unlike the erstwhile criminal offences under FERA.',
            'RBI issues FEMA Master Directions on FDI, ODI, ECB, and remittances.',
            'Enforcement Directorate (ED) investigates FEMA violations.',
        ],
    },
}

const UPDATE_TYPE_LABELS: Record<string, string> = {
    circular: 'Circular',
    notification: 'Notification',
    order: 'Order',
    consultation_paper: 'Consultation Paper',
    clarification: 'Clarification',
    rules: 'Rules / Amendment',
    press_release: 'Press Release',
    master_direction: 'Master Direction',
}

export async function generateStaticParams() {
    return CATEGORIES.map((category) => ({ category }))
}

export async function generateMetadata(
    { params }: { params: { category: string } }
): Promise<Metadata> {
    const cat = params.category.toLowerCase()
    const categoryName = cat.toUpperCase()

    const { data: latestUpdate } = await supabase
        .from('updates')
        .select('title, published_at')
        .eq('category', categoryName)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(1)
        .single()

    const dynamicSuffix = latestUpdate ? ` Latest: ${latestUpdate.title}.` : ''

    const title = `Latest ${categoryName} Circulars, Notifications & Updates Today – India`
    const description = `Get the latest ${categoryName} circulars, notifications, orders and regulatory updates today from ${CATEGORY_FULL_NAMES[cat]}. Track all ${categoryName} compliance changes in India.${dynamicSuffix}`
    const url = `https://www.corplawupdates.in/category/${cat}`

    return {
        title,
        description,
        keywords: [
            `${categoryName} update today`,
            `${categoryName} circular today`,
            `latest ${categoryName} notifications India`,
            `${categoryName} compliance updates`,
            `${CATEGORY_FULL_NAMES[cat]} circulars`,
            `MCA SEBI RBI updates for CS CA`,
        ],
        alternates: { canonical: url },
        other: {
            'revisit-after': '1 day',
        },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            images: [{ url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(cat)}`, width: 1200, height: 630 }],
            modifiedTime: latestUpdate?.published_at || new Date().toISOString(),
        } as any,
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`https://www.corplawupdates.in/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(cat)}`],
        },
    }
}

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: { category: string },
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const originalCat = params.category
    if (originalCat !== originalCat.toLowerCase()) {
        redirect(`/category/${originalCat.toLowerCase()}`)
    }
    const cat = originalCat.toLowerCase()

    if (!CATEGORIES.includes(cat)) {
        notFound()
    }

    const page = searchParams?.page && typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1
    const currentPage = Math.max(1, page)
    const ITEMS_PER_PAGE = 12

    const now = new Date().toISOString()
    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const categoryBase = (withCount = false) =>
        supabase
            .from('updates')
            .select(UPDATE_LIST_COLUMNS, withCount ? { count: 'exact' } : undefined)
            .eq('category', cat.toUpperCase())
            .not('published_at', 'is', null)
            .lte('published_at', now)
            .order('published_at', { ascending: false })

    const [{ data: paginatedUpdates, count: totalCount }, { data: top5Data }] = await Promise.all([
        categoryBase(true).range(from, to),
        categoryBase().limit(5),
    ])

    const pageUpdates = paginatedUpdates || []

    const top5Updates = top5Data || []
    const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
    const latestUpdate = top5Updates[0]
    const lastModified = latestUpdate?.published_at ? new Date(latestUpdate.published_at).toISOString() : new Date().toISOString()

    const answerFirst = ANSWER_FIRST[cat]

    const bgColors: Record<string, string> = {
        mca: 'from-blue-600 to-blue-800',
        sebi: 'from-emerald-600 to-emerald-800',
        rbi: 'from-violet-600 to-violet-800',
        nclt: 'from-orange-500 to-orange-700',
        ibc: 'from-red-600 to-red-800',
        fema: 'from-teal-600 to-teal-800',
    }

    // ─── JSON-LD Schemas ───────────────────────────────────────────────────────

    const collectionPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `Latest ${cat.toUpperCase()} Circulars, Notifications & Updates`,
        'description': answerFirst.definition,
        'url': `https://www.corplawupdates.in/category/${cat}`,
        'dateModified': lastModified,
        'about': {
            '@type': 'GovernmentOrganization',
            'name': CATEGORY_FULL_NAMES[cat],
            'url': OFFICIAL_URLS[cat],
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'CorpLawUpdates.in',
            'url': 'https://www.corplawupdates.in',
        },
    }

    const faqSchema = top5Updates.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `What is the latest ${cat.toUpperCase()} update today?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': top5Updates[0]
                        ? `The latest ${cat.toUpperCase()} update is "${top5Updates[0].title}", published on ${new Date(top5Updates[0].published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}. ${top5Updates[0].summary || ''}`
                        : `Visit our ${cat.toUpperCase()} updates page for the latest circulars and notifications.`,
                },
            },
            ...top5Updates.slice(1).map((u: any) => ({
                '@type': 'Question',
                'name': `What is the latest ${cat.toUpperCase()} circular/notification about "${u.title}"?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `${u.summary || u.title} — Published on ${new Date(u.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}. Read more at https://www.corplawupdates.in/updates/${u.slug}`,
                },
            })),
        ],
    } : null

    const itemListSchema = top5Updates.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': `Latest ${cat.toUpperCase()} Circulars & Notifications`,
        'description': `Chronological list of the most recent ${cat.toUpperCase()} regulatory documents.`,
        'numberOfItems': top5Updates.length,
        'itemListElement': top5Updates.map((u: any, index: number) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': u.title,
            'url': `https://www.corplawupdates.in/updates/${u.slug}`,
            'datePublished': u.published_at,
        })),
    } : null

    const definedTermSchema = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        'name': `${cat.toUpperCase()} Circular`,
        'description': answerFirst.definition,
        'inDefinedTermSet': 'https://www.corplawupdates.in/category',
        'url': `https://www.corplawupdates.in/category/${cat}`,
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.corplawupdates.in' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Categories', 'item': 'https://www.corplawupdates.in/category' },
            { '@type': 'ListItem', 'position': 3, 'name': `${cat.toUpperCase()} Updates`, 'item': `https://www.corplawupdates.in/category/${cat}` },
        ],
    }

    return (
        <div>
            {/* Category Hero */}
            <div className={`relative bg-gradient-to-br ${bgColors[cat]} text-white overflow-hidden`}>
                <div
                    className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(255,255,255,0.05),transparent_60%)]" aria-hidden />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/60 text-xs mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white/80">{cat.toUpperCase()} Updates</span>
                    </nav>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-sm ring-1 ring-white/30">
                            Regulator
                        </span>
                        <span className="text-white/60 text-sm">·</span>
                        <span className="text-white/80 text-sm font-medium">{totalCount || 0} articles</span>
                        {latestUpdate && (
                            <>
                                <span className="text-white/60 text-sm">·</span>
                                <span className="text-white/70 text-xs">
                                    Last updated: <time dateTime={latestUpdate.published_at}>
                                        {new Date(latestUpdate.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </time>
                                </span>
                            </>
                        )}
                    </div>

                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 animate-fade-up">
                        Latest {cat.toUpperCase()} Circulars, Notifications & Updates
                    </h1>

                    {/* Answer-First Paragraph for AI Overview */}
                    <p className="text-base md:text-lg text-white/90 max-w-3xl leading-relaxed mb-4">
                        {answerFirst.definition}
                    </p>

                    <p className="text-sm text-white/60">
                        Updated daily · <a href={OFFICIAL_URLS[cat]} target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">{CATEGORY_FULL_NAMES[cat]} Official Site ↗</a>
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto py-10 px-4">
                {pageUpdates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                            {pageUpdates.map((update: any, i: number) => (
                                <UpdateCard
                                    key={update.id}
                                    update={update}
                                    animationDelay={i * 60}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                basePath={`/category/${cat}`}
                            />
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card ring-1 ring-slate-900/[0.02]">
                        <EmptyState
                            icon="📋"
                            title={`No ${cat.toUpperCase()} updates yet`}
                            description={`We're working on adding articles for this category. Subscribe to get notified when new updates are published.`}
                            actionLabel="Subscribe to Newsletter"
                            actionHref="/newsletter"
                        />
                    </div>
                )}
            </div>

            {/* Dynamic Latest Circulars & Notifications (Bottom — FAQ-style for AI) */}
            {top5Updates.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 py-8 mb-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-navy mb-2 font-heading">
                            Latest {cat.toUpperCase()} Circulars & Notifications
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })} · Auto-updated with every new publication
                        </p>
                        <div className="space-y-6">
                            {top5Updates.map((u: any, idx: number) => (
                                <div key={u.id} className={`${idx !== top5Updates.length - 1 ? 'border-b border-slate-100 pb-6' : ''}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {u.update_type && (
                                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                {UPDATE_TYPE_LABELS[u.update_type] || u.update_type}
                                            </span>
                                        )}
                                        <time dateTime={u.published_at} className="text-xs text-slate-400">
                                            {new Date(u.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </time>
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-800 mb-1 leading-snug">
                                        <Link href={`/updates/${u.slug}`} className="hover:text-gold transition-colors">
                                            {u.title}
                                        </Link>
                                    </h3>
                                    {u.excerpt && (
                                        <p className="text-sm text-slate-500 line-clamp-2">{u.excerpt}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Professional SEO Knowledge Footer — "About" Section */}
            <section className="max-w-7xl mx-auto px-4 py-10 border-t border-slate-100">
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-8 shadow-sm">
                    {/* Key Facts List */}
                    <h2 className="text-xl font-bold text-navy mb-4 font-heading">
                        About {CATEGORY_FULL_NAMES[cat]} ({cat.toUpperCase()}) — Regulatory Guide
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm text-slate-500 leading-relaxed">
                        <div className="space-y-4">
                            <p>
                                Stay updated with the <strong>latest {cat.toUpperCase()} circulars today</strong>,
                                including <strong>{cat.toUpperCase()} notifications India</strong>, orders, consultation papers and
                                regulatory changes issued by {CATEGORY_FULL_NAMES[cat]}.
                            </p>
                            <ul className="space-y-1 list-none">
                                {answerFirst.facts.map((fact, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-gold mt-0.5">✓</span>
                                        <span>{fact}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <p>
                                Our platform provides simplified, sourced summaries of all <strong>{cat.toUpperCase()} updates in India</strong>
                                to help Company Secretaries, Chartered Accountants (CA), Cost Accountants (CMA), CS/CA/CMA students, legal enthusiasts, corporate lawyers, and compliance teams track <strong>{cat.toUpperCase()} circular and notification updates</strong> in real time.
                            </p>
                            <p>
                                <strong>Official Source:</strong>{' '}
                                <a href={OFFICIAL_URLS[cat]} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber-700 transition-colors underline underline-offset-4">
                                    {OFFICIAL_URLS[cat]}
                                </a>
                            </p>
                            <p className="pt-2">
                                👉 <Link href="/" className="text-gold font-bold hover:text-amber-700 transition-colors underline decoration-gold/30 underline-offset-4">
                                    Latest Corporate Law Updates in India
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* All JSON-LD Schemas */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
            {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
        </div>
    )
}
