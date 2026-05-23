export default function CalendarLoading() {
    const CURRENT_YEAR = new Date().getFullYear()
    const NEXT_YEAR = CURRENT_YEAR + 1

    return (
        <div>
            {/* Hero skeleton */}
            <div className="relative bg-navy text-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(245,158,11,0.12),transparent_50%)]" aria-hidden />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 relative text-center">
                    <div className="flex justify-center items-center gap-2 text-white/30 text-xs mb-3">
                        <span>Home</span>
                        <span>/</span>
                        <span>Compliance Calendar</span>
                    </div>
                    <div className="h-4 w-32 bg-white/10 rounded mx-auto mb-3 animate-pulse" />
                    <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight max-w-3xl mx-auto">
                        Compliance Calendar {CURRENT_YEAR}-{String(NEXT_YEAR).slice(2)}
                    </h1>
                    <div className="space-y-2 mt-4 max-w-2xl mx-auto">
                        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Quick filter & table skeleton container */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Regulator categories flex */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 animate-pulse">
                    {['ALL', 'MCA', 'GST', 'SEBI', 'INCOME TAX', 'LABOR LAWS', 'RBI'].map((name, i) => (
                        <div key={i} className="h-9 w-20 bg-slate-100 rounded-full" />
                    ))}
                </div>

                {/* Table search & rows loading skeleton */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center gap-4 animate-pulse">
                        <div className="h-10 w-64 bg-slate-100 rounded-lg" />
                        <div className="h-8 w-32 bg-slate-100 rounded-md" />
                    </div>
                    
                    {/* Rows */}
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
