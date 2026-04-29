/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
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
    const cat = params.category.toLowerCase()

    if (!CATEGORIES.includes(cat)) {
        notFound()
    }

    const page = searchParams?.page && typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1
    const currentPage = Math.max(1, page)
    const ITEMS_PER_PAGE = 10

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
        mca: 'bg-[#3B82F6]', sebi: 'bg-[#10B981]', rbi: 'bg-[#8B5CF6]',
        nclt: 'bg-[#F97316]', ibc: 'bg-[#EF4444]', fema: 'bg-[#14B8A6]'
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <div className={`${bgColors[cat]} text-white p-8 md:p-12 rounded-2xl shadow-md mb-12`}>
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{cat.toUpperCase()} Updates</h1>
                <p className="text-lg md:text-xl opacity-90 max-w-2xl">{CATEGORY_DESC[cat]}</p>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <CategoryBadge category={cat.toUpperCase() as "MCA" | "SEBI" | "RBI" | "NCLT" | "IBC" | "FEMA"} />
                </div>
                <span className="text-slate-500 font-medium">
                    {allUpdates.length} updates
                </span>
            </div>

            {paginatedUpdates.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {paginatedUpdates.map((update: any) => (
                            <UpdateCard key={update.id} update={update} />
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
                <div className="bg-white p-12 rounded-xl border border-slate-100 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-navy mb-2">No updates yet</h3>
                    <p className="text-slate-500">We don't have any updates for {cat.toUpperCase()} yet.</p>
                </div>
            )}
        </div>
    )
}
