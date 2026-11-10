import React from 'react'
import { FileText, Sparkles } from 'lucide-react'

interface NewsletterCoverThumbnailProps {
  weekLabel: string
  leadHeadline?: string | null
  isLatest?: boolean
}

export default function NewsletterCoverThumbnail({
  weekLabel,
  leadHeadline,
  isLatest = false,
}: NewsletterCoverThumbnailProps) {
  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-white rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden select-none p-3.5 flex flex-col justify-between text-slate-900 group-hover:border-amber-400 transition-colors">
      {/* Background paper texture & rule line */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] to-transparent pointer-events-none" />

      {/* Top Masthead Row */}
      <div>
        <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#0f2a52]">
          <div className="text-[10px] sm:text-xs font-bold tracking-[2.5px] text-[#0f2a52] font-serif uppercase">
            CORPLAW<span className="text-[#c9a227]">UPDATES</span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 font-semibold tracking-wider">
            WEEKLY BRIEFING
          </div>
        </div>

        {/* Thin gold rule */}
        <div className="h-[1.5px] bg-[#c9a227] mt-0.5 mb-2" />

        {/* Week Stamp & Statutory Tags */}
        <div className="flex items-center justify-between gap-1 text-[8.5px] uppercase tracking-wider text-slate-500 mb-1.5 font-sans">
          <span className="font-semibold text-[#0f2a52]">{weekLabel}</span>
          <span className="text-[#c9a227] font-bold">MCA · SEBI · RBI · TAX</span>
        </div>

        {/* Lead Headline Preview */}
        <h4 className="font-serif text-[11px] sm:text-xs font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
          {leadHeadline || 'Comprehensive Statutory Intelligence & Corporate Law Developments'}
        </h4>
      </div>

      {/* Bottom Data Strip & Watermark */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8.5px] text-slate-500">
        <div className="flex items-center gap-1 text-[#0f2a52] font-medium font-sans">
          <FileText className="size-3 text-[#c9a227]" aria-hidden="true" />
          <span>Official Verified Edition</span>
        </div>
        {isLatest ? (
          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
            <Sparkles className="size-2.5 text-amber-500" />
            LATEST
          </span>
        ) : (
          <span className="font-mono text-[8px] text-slate-400">PDF + WEB</span>
        )}
      </div>
    </div>
  )
}
