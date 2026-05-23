import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function UpdatesLoading() {
    const CURRENT_YEAR = new Date().getFullYear()

    return (
        <div>
            {/* Hero skeleton */}
            <div className="relative bg-navy text-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(245,158,11,0.12),transparent_50%)]" aria-hidden />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 relative">
                    <div className="flex items-center gap-2 text-white/30 text-xs mb-3">
                        <span>Home</span>
                        <span>/</span>
                        <span>All Regulatory Updates</span>
                    </div>
                    <div className="h-4 w-32 bg-white/10 rounded mb-3 animate-pulse" />
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
                            Latest Corporate Law & Regulatory Updates {CURRENT_YEAR}
                        </h1>
                        <div className="h-9 w-24 bg-white/10 rounded-lg animate-pulse" />
                    </div>
                    <div className="space-y-2 mt-4 max-w-3xl">
                        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Content grid skeleton */}
            <div className="max-w-7xl mx-auto px-4 pb-16 pt-8 md:pt-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                    {/* Sidebar filters skeleton */}
                    <aside className="w-full md:w-72 flex-shrink-0">
                        <div className="sticky top-24 bg-white p-5 md:p-6 rounded-xl border border-slate-200/80 space-y-6">
                            <div className="space-y-2">
                                <div className="h-4 w-12 bg-slate-200 rounded" />
                                <div className="h-10 w-full bg-slate-100 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-slate-200 rounded" />
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-8 w-16 bg-slate-100 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Updates list grid of skeletons */}
                    <div className="flex-grow min-w-0">
                        <div className="h-5 w-40 bg-slate-200 rounded mb-6 animate-pulse" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <LoadingSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
