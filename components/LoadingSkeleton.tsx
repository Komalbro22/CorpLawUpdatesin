export default function LoadingSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 border-t-[3px] border-t-slate-200 bg-white shadow-card animate-pulse">
            {/* Image aspect-ratio video placeholder */}
            <div className="relative w-full aspect-video bg-slate-200 flex-shrink-0" />

            <div className="p-5 flex flex-col flex-1 space-y-4">
                {/* Badges/Category */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-5 w-16 bg-slate-200 rounded-md" />
                    <div className="h-5 w-12 bg-slate-200 rounded-md" />
                </div>

                {/* Title (2 lines) */}
                <div className="space-y-2">
                    <div className="h-5 w-full bg-slate-200 rounded" />
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                </div>

                {/* Excerpt Summary (2 lines) */}
                <div className="space-y-2 pt-1">
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-5/6 bg-slate-100 rounded" />
                </div>

                {/* Footer metadata */}
                <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100/80 pt-3">
                    <div className="flex flex-col gap-1 w-1/3">
                        <div className="h-3 w-full bg-slate-150 rounded" />
                        <div className="h-3 w-3/4 bg-slate-150 rounded" />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <div className="h-6 w-12 bg-slate-100 rounded-md" />
                        <div className="h-7 w-7 bg-slate-200 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} />
            ))}
        </div>
    )
}
