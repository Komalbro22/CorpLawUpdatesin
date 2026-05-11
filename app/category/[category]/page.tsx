/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import CategoryBadge from '@/components/CategoryBadge'
import UpdateCard from '@/components/UpdateCard'
import Pagination from '@/components/Pagination'
import { Metadata } from 'next'
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

const categoryDescriptions: Record<string, string> = {
  mca: 'Ministry of Corporate Affairs circulars, notifications and amendments under Companies Act 2013.',
  sebi: 'SEBI circulars, notifications and regulations for listed companies and securities market.',
  rbi: 'Reserve Bank of India guidelines, circulars and monetary policy updates.',
  nclt: 'National Company Law Tribunal orders, judgments and insolvency proceedings.',
  ibc: 'Insolvency and Bankruptcy Code updates, IBBI regulations and NCLT insolvency orders.',
  fema: 'Foreign Exchange Management Act updates, RBI FEMA regulations and FDI notifications.',
}

const categoryTitles: Record<string, string> = {
  mca: 'MCA Updates 2026 — Ministry of Corporate Affairs Circulars',
  sebi: 'SEBI Updates 2026 — Securities and Exchange Board Notifications',
  rbi: 'RBI Updates 2026 — Reserve Bank of India Circulars',
  nclt: 'NCLT Updates 2026 — National Company Law Tribunal Orders',
  ibc: 'IBC Updates 2026 — Insolvency and Bankruptcy Code',
  fema: 'FEMA Updates 2026 — Foreign Exchange Management Act',
}

export async function generateMetadata(
  { params }: { params: { category: string } }
): Promise<Metadata> {
  const cat = params.category.toLowerCase()
  const title = categoryTitles[cat] ||
    `${cat.toUpperCase()} Updates 2026`
  const description = categoryDescriptions[cat] ||
    `Latest ${cat.toUpperCase()} regulatory updates for CS professionals.`
  const url = `https://www.corplawupdates.in/category/${cat}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
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
                    <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4 animate-fade-up">
                        {cat.toUpperCase()} Updates
                    </h1>
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
        </div>
    )
}
