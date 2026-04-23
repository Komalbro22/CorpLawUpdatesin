export default function LoadingSkeleton() {
    return (
        <div className="block bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
            <div className="mb-3">
                <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
                <div className="h-6 w-1/2 bg-slate-200 rounded-lg"></div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-slate-200 rounded-lg"></div>
                <div className="h-4 w-5/6 bg-slate-200 rounded-lg"></div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                <div className="flex flex-col gap-2 w-1/3">
                    <div className="h-3 w-full bg-slate-200 rounded"></div>
                    <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
            </div>
        </div>
    )
}

export function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} />
            ))}
        </div>
    )
}
