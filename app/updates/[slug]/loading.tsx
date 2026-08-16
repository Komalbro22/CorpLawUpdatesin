export default function SingleArticleLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Category Badge & Metadata Pill Skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Key Change Box Skeleton */}
      <div className="mb-6 p-4 rounded-xl border border-amber-200/60 bg-amber-50/40 dark:bg-slate-900 dark:border-amber-900/30">
        <div className="h-4 w-28 bg-amber-200 dark:bg-amber-900/50 rounded mb-2" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded mb-1.5" />
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Article Main Headline */}
      <div className="space-y-3 mb-6">
        <div className="h-8 sm:h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 sm:h-10 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Action Buttons Bar Skeleton (Share, Save, PDF) */}
      <div className="flex items-center gap-2 py-4 border-y border-slate-100 dark:border-slate-800 mb-8">
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Article Content Paragraphs Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
        
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mt-8 mb-4" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-10/12 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  )
}
