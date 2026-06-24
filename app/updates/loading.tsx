import { SkeletonGrid } from '@/components/LoadingSkeleton'

export default function UpdatesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
      <SkeletonGrid />
    </div>
  )
}
