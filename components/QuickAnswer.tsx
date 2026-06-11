import { Lightbulb } from 'lucide-react'

export function QuickAnswer({ answer }: { answer: string }) {
  if (!answer) return null

  return (
    <div className="my-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
      <div className="shrink-0 bg-amber-100 dark:bg-amber-900/50 p-2.5 rounded-lg text-amber-600 dark:text-amber-400 mt-1">
        <Lightbulb className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-1.5 flex items-center gap-1.5">
          Quick Answer
          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded text-[9px] tracking-widest font-bold">AI</span>
        </h4>
        <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed font-medium">
          {answer}
        </p>
      </div>
    </div>
  )
}
