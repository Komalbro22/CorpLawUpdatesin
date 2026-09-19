import React from 'react'
import Link from 'next/link'
import { CheckCircle2, Mail, ShieldCheck, Scale, ExternalLink, FileCheck } from 'lucide-react'
import { getEditorialDesk } from '@/lib/editorial'

interface EditorialAuthorCardProps {
  category?: string | null
  articleTitle?: string
}

export default function EditorialAuthorCard({ category, articleTitle }: EditorialAuthorCardProps) {
  const desk = getEditorialDesk(category)

  const correctionSubject = encodeURIComponent(
    articleTitle
      ? `Editorial Inquiry / Correction: ${articleTitle}`
      : 'Editorial Inquiry / Correction'
  )

  return (
    <section
      aria-label="Editorial Authorship & Verification Standards"
      className="my-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-amber-50/20 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 p-5 sm:p-7 shadow-sm transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
        {/* Avatar / Desk Emblem */}
        <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-br from-navy to-slate-800 dark:from-amber-500 dark:to-amber-600 text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-sm border border-slate-700/50 dark:border-amber-400">
          <Scale className="size-6 sm:size-7" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {desk.badgeText}
              </span>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {desk.name}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1 text-xs font-semibold">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Verified Regulatory Source
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {desk.tagline}
          </p>

          {/* Primary Regulators Monitored */}
          {desk.regulators && desk.regulators.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <FileCheck className="size-3.5 text-slate-400" aria-hidden="true" />
                Primary Sources:
              </span>
              {desk.regulators.map((reg, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300 text-[11px]"
                >
                  {reg}
                </span>
              ))}
            </div>
          )}

          {/* Standards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Gazette Verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Scale className="size-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>4-Eye Legal Review</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
              <span>Independent Editorial</span>
            </div>
          </div>

          {/* Actions: Email + Editorial Policy */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <a
              href={`mailto:${desk.email}?subject=${correctionSubject}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300 rounded-xl px-3.5 py-2 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Mail className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>{desk.email}</span>
            </a>

            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/editorial-policy"
                className="font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 underline transition-colors"
              >
                Editorial Standards & Policy &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
