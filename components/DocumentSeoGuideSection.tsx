import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import type { DocumentSeoGuide } from '@/lib/documents-seo-guides-types'

interface DocumentSeoGuideSectionProps {
  guide: DocumentSeoGuide | null
  templateName: string
  slug: string
}

export default function DocumentSeoGuideSection({
  guide,
  templateName,
  slug,
}: DocumentSeoGuideSectionProps) {
  if (!guide) {
    return (
      <section
        aria-label="Document index navigation"
        className="max-w-6xl mx-auto px-4 pb-10"
      >
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy dark:text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Browse all corporate document generators
          </Link>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Format: {templateName} ({slug})
          </span>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="doc-seo-guide-heading"
      className="max-w-6xl mx-auto px-4 py-12 space-y-10"
    >
      {/* Quick Statutory & Applicability Reference Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              Statutory &amp; Practice Overview
            </p>
            <h2
              id="doc-seo-guide-heading"
              className="text-2xl md:text-3xl font-bold font-heading text-navy dark:text-white"
            >
              {templateName}: Statutory Reference &amp; Execution Guide
            </h2>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            All Document Generators
          </Link>
        </div>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {guide.introSummary}
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                <th
                  scope="col"
                  className="py-3 px-4 font-semibold text-navy dark:text-slate-100 w-1/3"
                >
                  Compliance Parameter
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 font-semibold text-navy dark:text-slate-100"
                >
                  Statutory Position / Standard Requirement
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {guide.quickSummary.map((row) => (
                <tr
                  key={row.label}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <th
                    scope="row"
                    className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 align-top"
                  >
                    {row.label}
                  </th>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* When Required + Execution Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <Scale className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
            <h2 className="text-xl font-bold font-heading text-navy dark:text-white">
              When Is This {templateName} Required?
            </h2>
          </div>
          <ul className="space-y-3">
            {guide.whenRequired.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                <CheckCircle2
                  className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
            <h2 className="text-xl font-bold font-heading text-navy dark:text-white">
              Execution, Stamp Duty &amp; Filing Checklist
            </h2>
          </div>
          <ol className="space-y-3">
            {guide.executionChecklist.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Key Clauses Explained */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <FileText className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">
            Essential Clauses Explained
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Review the legal purpose of each operative clause before signing, certifying, or filing with the Registrar of Companies or Sub-Registrar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guide.clausesExplained.map((clause, index) => (
            <div
              key={clause.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                Clause {index + 1}
              </div>
              <h3 className="text-base font-bold text-navy dark:text-slate-100 mb-1.5">
                {clause.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {clause.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Linking Hub: Related Generators & Verified Glossary */}
      {(guide.relatedDocs.length > 0 || guide.relatedGlossary.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {guide.relatedDocs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-7 shadow-xs">
              <h2 className="text-lg font-bold font-heading text-navy dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Related Document Generators
              </h2>
              <div className="space-y-2.5">
                {guide.relatedDocs.map((doc) => (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-semibold text-navy dark:text-slate-100 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{doc.label}</span>
                    {doc.badge && (
                      <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {doc.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {guide.relatedGlossary.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold font-heading text-navy dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  Related Corporate Law Terms &amp; Guides
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {guide.relatedGlossary.map((term) => (
                    <Link
                      key={term.href}
                      href={term.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <span>{term.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/documents"
                  className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  View complete library of free Indian corporate legal formats →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Frequently Asked Questions — Native <details>/<summary> for A11y & Find-in-Page */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-7">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-navy dark:text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Practical guidance on Indian statutory rules, format requirements, Word/PDF exports, and filing compliance for {templateName}.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {guide.faqs.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 overflow-hidden"
            >
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between gap-4 px-5 py-4 font-bold text-navy dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-sm md:text-base focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-[-2px]">
                <span>{faq.question}</span>
                <ChevronDown
                  className="w-5 h-5 shrink-0 text-amber-500 transition-transform motion-safe:duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="px-5 pb-5 pt-2 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Professional Review Disclaimer */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/15 px-5 py-4 text-xs md:text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
        <strong>Professional Review Note:</strong> This {templateName} draft generator is provided for informational and drafting assistance only. Always verify state-specific stamp duty rates, Articles of Association provisions, and current MCA V3 / SEBI / Transfer of Property Act requirements with a practising Company Secretary (PCS) or Advocate before execution or filing.
      </div>
    </section>
  )
}
