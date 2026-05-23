import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function CategoryLoading() {
    return (
        <div>
            {/* Hero skeleton */}
            <div className="relative bg-navy text-white overflow-hidden animate-pulse">
                <div
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(245,158,11,0.12),transparent_50%)]" aria-hidden />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 relative">
                    <div className="flex items-center gap-2 text-white/30 text-xs mb-3">
                        <span>Home</span>
                        <span>/</span>
                        <span>Category</span>
                    </div>
                    <div className="h-5 w-48 bg-white/10 rounded mb-3" />
                    <div className="h-10 w-96 bg-white/10 rounded mb-4" />
                    <div className="space-y-2 max-w-3xl">
                        <div className="h-4 w-full bg-white/10 rounded" />
                        <div className="h-4 w-4/5 bg-white/10 rounded" />
                    </div>
                </div>
            </div>

            {/* Grid skeleton */}
            <div className="max-w-7xl mx-auto px-4 pb-16 pt-8 md:pt-10">
                <div className="h-5 w-40 bg-slate-200 rounded mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <LoadingSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    )
}
