/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import CategoryBadge from '@/components/CategoryBadge'
import UpdateCard from '@/components/UpdateCard'
import Pagination from '@/components/Pagination'
import { Metadata } from 'next'
import Link from 'next/link'
import { BASE_URL } from '@/lib/utils'

export const revalidate = 3600

const CATEGORIES = ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema']

const CATEGORY_DESC: Record<string, string> = {
    mca: "Ministry of Corporate Affairs — Company law, incorporation, compliance and governance updates",
    sebi: "Securities and Exchange Board of India — Capital markets, listing, investor protection updates",
    rbi: "Reserve Bank of India — Banking regulation, FEMA, foreign exchange and monetary policy updates",
    nclt: "National Company Law Tribunal — Insolvency, mergers, acquisitions and corporate disputes",
    ibc: "Insolvency and Bankruptcy Code — Resolution process, liquidation and creditor rights updates",
    fema: "Foreign Exchange Management Act — Cross-border transactions and foreign investment updates"
}

export async function generateStaticParams() {
    return CATEGORIES.map((category) => ({
        category,
    }))
}

const CATEGORY_FULL_NAMES: Record<string, string> = {
  mca: 'Ministry of Corporate Affairs',
  sebi: 'Securities and Exchange Board of India',
  rbi: 'Reserve Bank of India',
  nclt: 'National Company Law Tribunal',
  ibc: 'Insolvency and Bankruptcy Code',
  fema: 'Foreign Exchange Management Act',
}

export async function generateMetadata(
  { params }: { params: { category: string } }
): Promise<Metadata> {
  const cat = params.category.toLowerCase()
  const categoryName = cat.toUpperCase()
  const title = `Latest ${categoryName} Updates Today (India) – CorpLawUpdates.in`
  const description = `Get the latest ${categoryName} updates today including notifications, circulars, compliance rules and regulatory changes in India.`
  const url = `https://www.corplawupdates.in/category/${cat}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: 'https://www.corplawupdates.in/og-image.jpg', width: 1200, height: 630 }],
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

    const { data: updates } = await supabase
        .from('updates')
        .select('*')
        .eq('category', cat.toUpperCase())
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })

    const allUpdates = updates || []

    const totalPages = Math.ceil(allUpdates.length / ITEMS_PER_PAGE)
    const paginatedUpdates = allUpdates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const bgColors: Record<string, string> = {
        mca: 'from-blue-600 to-blue-800', sebi: 'from-emerald-600 to-emerald-800', rbi: 'from-violet-600 to-violet-800',
        nclt: 'from-orange-500 to-orange-700', ibc: 'from-red-600 to-red-800', fema: 'from-teal-600 to-teal-800'
    };

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
                    <div className="flex items-center gap-3 mb-4">
                         <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-sm ring-1 ring-white/30">
                            Regulator
                         </span>
                         <span className="text-white/60 text-sm">·</span>
                         <span className="text-white/80 text-sm font-medium">{allUpdates.length} articles</span>
                    </div>
                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2 animate-fade-up">
                        Latest {cat.toUpperCase()} Updates Today ({CATEGORY_FULL_NAMES[cat]})
                    </h1>
                    <p className="text-sm text-white/70 mb-6 animate-fade-up">
                        Updated daily with the latest {cat.toUpperCase()} updates in India.
                    </p>
                    <p className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed animate-fade-up" style={{ '--delay': '100ms' } as any}>
                        {CATEGORY_DESC[cat]}
                    </p>
                </div>
            </div>


            {/* Content Area */}
            <div className="max-w-7xl mx-auto py-10 px-4">
                {paginatedUpdates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                            {paginatedUpdates.map((update: any, i: number) => (
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
                    <div className="bg-white p-16 md:p-20 rounded-2xl border border-slate-200/80 text-center shadow-card ring-1 ring-slate-900/[0.02] content-fade-in">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-2xl font-heading font-bold text-navy mb-2">No updates yet</h3>
                        <p className="text-slate-500 max-w-md mx-auto">We haven't published any {cat.toUpperCase()} specific updates recently. Please check back later.</p>
                    </div>
                )}
            </div>

            {/* Subtle SEO Context at Bottom */}
            <section className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-100 mt-10">
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-navy mb-4 font-heading">Regulatory Information: {cat.toUpperCase()} Updates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm text-slate-500 leading-relaxed">
                        <div className="space-y-4">
                            <p>
                                Stay updated with the <strong>latest {cat.toUpperCase()} updates today</strong>,
                                including <strong>{cat.toUpperCase()} notifications India</strong>, circulars, compliance rules and
                                regulatory changes issued by {CATEGORY_FULL_NAMES[cat]}.
                            </p>
                            <p>
                                These updates are crucial for Company Secretaries (CS), CA students, and legal professionals 
                                tracking <strong>{cat.toUpperCase()} circular updates</strong>.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p>
                                Our platform provides simplified, sourced summaries of all <strong>{cat.toUpperCase()} updates in India</strong> 
                                to help compliance teams and practitioners stay informed about the latest changes.
                            </p>
                            <p className="pt-2">
                                👉 <Link href="/corporate-law-updates-india" className="text-gold font-bold hover:text-amber-700 transition-colors underline decoration-gold/30 underline-offset-4">
                                  latest corporate law updates in India
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": `Latest ${cat.toUpperCase()} Updates Today`,
                        "description": `Stay updated with the latest ${cat.toUpperCase()} updates in India, including notifications, circulars and compliance rules from ${CATEGORY_FULL_NAMES[cat]}.`,
                        "url": `https://www.corplawupdates.in/category/${cat}`
                    })
                }}
            />
        </div>
    )
}
