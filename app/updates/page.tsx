import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import UpdatesClient from './UpdatesClient'
import { SkeletonGrid } from '@/components/LoadingSkeleton'
import { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata(
  { searchParams }: { searchParams: { search?: string, category?: string } }
): Promise<Metadata> {
  return {
    title: 'All Updates - MCA, SEBI, RBI Regulatory News',
    description: 'Browse all Indian corporate law updates - MCA circulars, SEBI notifications, RBI guidelines, NCLT orders and FEMA regulations. Free for CS professionals.',
    alternates: {
      canonical: 'https://www.corplawupdates.in/updates',
    },
    robots: searchParams.search || searchParams.category
      ? { index: false, follow: true }
      : { index: true, follow: true },
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

    const counts: Record<string, number> = {}
    updates.forEach(u => {
        counts[u.category] = (counts[u.category] || 0) + 1
    })

    return (
        <div>
            <div className="relative bg-navy text-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(245,158,11,0.12),transparent_50%)]" aria-hidden />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 relative">
                    <p className="text-gold/90 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                        Browse the archive
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-balance">
                            All regulatory updates
                        </h1>
                        <span className="inline-flex items-center w-fit bg-white/10 text-white font-semibold py-2 px-4 rounded-lg text-sm ring-1 ring-white/15 backdrop-blur-sm">
                            {updates.length} articles
                        </span>
                    </div>
                    <p className="text-slate-300 mt-4 max-w-2xl text-sm md:text-base leading-relaxed">
                        Filter by regulator, search by keyword, and open the full brief in one click.
                    </p>
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
        </div>
    )
}
