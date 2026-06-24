import { SkeletonGrid } from '@/components/LoadingSkeleton'

export default function GlossaryLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mb-8" />
      <div className="h-10 w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
      <SkeletonGrid />
    </div>
  )
}
