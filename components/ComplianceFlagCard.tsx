import React from 'react'
import { ComplianceFlag } from '@/types'
import { CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react'

interface ComplianceFlagCardProps {
  flag: ComplianceFlag
}

export default function ComplianceFlagCard({ flag }: ComplianceFlagCardProps) {
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
  let containerBg = 'bg-white border-slate-200/80 dark:bg-slate-900 dark:border-slate-800'
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'

  if (flag.status === 'flag') {
    icon = <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />
    containerBg = 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50'
    badgeBg = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
  } else if (flag.status === 'info') {
    icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
    badgeBg = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
  }

  return (
    <div className={`p-4 md:p-5 rounded-xl border ${containerBg} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <h4 className="text-sm md:text-base font-bold text-navy dark:text-white leading-snug">
              {flag.label}
            </h4>
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
              {flag.category}
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2.5">
            {flag.detail}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Ref: {flag.legal_section}
            </span>
            <span className="italic text-slate-400">
              {flag.disclaimer}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
