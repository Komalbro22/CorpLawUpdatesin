import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { FileText, Download, Calendar, Mail, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react'
import { listNewsletterPdfs, formatFileSize } from '@/lib/newsletter-pdfs'
import { formatDate } from '@/lib/utils'

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Weekly Briefing Archive — PDF Editions | CorpLawUpdates.in',
  description: 'Download verified weekly corporate law briefings in PDF format. Curated intelligence covering MCA circulars, SEBI regulations, RBI master directions, and insolvency rulings.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/newsletters',
  },
  openGraph: {
    title: 'Weekly Corporate Law Briefing PDF Archive | CorpLawUpdates.in',
    description: 'Download verified weekly corporate law briefings in PDF format. Curated intelligence covering MCA circulars, SEBI regulations, RBI master directions, and insolvency rulings.',
    url: 'https://www.corplawupdates.in/newsletters',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=Weekly%20Briefing%20PDF%20Archive&category=MCA', width: 1200, height: 630 }],
  },
}

export default async function NewslettersArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ not_found?: string }>
}) {
  const params = await searchParams
  const isNotFound = params.not_found === '1'
  const { data: newsletters } = await listNewsletterPdfs()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* ─── Hero Banner ─── */}
      <section className="bg-navy text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="size-3.5 text-amber-400" aria-hidden="true" />
            Official PDF Archive
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Weekly Corporate Law Briefing Archive
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-pretty">
            Every Monday, CorpLawUpdates publishes an authoritative weekly intelligence briefing covering MCA, SEBI, RBI, and IBC developments. Access and download every verified PDF edition here.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Mail className="size-4" aria-hidden="true" />
              Subscribe for Free Monday Email
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all"
            >
              Browse Daily Updates
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {isNotFound && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-900 dark:text-amber-200 text-sm flex items-center gap-3">
            <span className="font-bold">Notice:</span> The requested newsletter edition link could not be found or has been replaced. Please select an available briefing below.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
              Published Briefings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Showing {newsletters.length} {newsletters.length === 1 ? 'edition' : 'editions'} in chronological order
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
            Direct CDN PDF delivery • Fast inline preview
          </div>
        </div>

        {newsletters.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
            <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <FileText className="size-8" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-2">
              First Hosted PDF Edition Publishing Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Our automated weekly briefing PDFs are deployed every Monday. Subscribe below to receive the inaugural hosted PDF edition directly in your inbox.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy font-bold text-sm px-5 py-2.5 rounded-lg transition-all"
            >
              <Mail className="size-4" aria-hidden="true" />
              Subscribe to Weekly Newsletter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsletters.map((edition, idx) => (
              <article
                key={edition.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {idx === 0 ? 'Latest Edition' : 'Weekly Briefing'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {formatFileSize(edition.file_size_bytes)}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    Week of {edition.week_label}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <Calendar className="size-3.5" aria-hidden="true" />
                    <span>Coverage: {formatDate(edition.week_start)} – {formatDate(edition.week_end)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {edition.download_count > 0 ? (
                      <span className="tabular-nums font-medium">{edition.download_count.toLocaleString('en-IN')} downloads</span>
                    ) : (
                      <span>Official Edition</span>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/newsletters/${edition.slug}`}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                      aria-label={`Read weekly briefing online for ${edition.week_label}`}
                    >
                      <FileText className="size-3.5 text-amber-500" aria-hidden="true" />
                      Read
                    </Link>

                    <a
                      href={`/newsletters/${edition.slug}/download`}
                      className="inline-flex items-center gap-1.5 bg-navy hover:bg-slate-800 text-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-navy text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
                      aria-label={`Download weekly briefing PDF for ${edition.week_label}`}
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      Download PDF
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ─── Bottom Explainer Card ─── */}
        <section className="mt-14 bg-gradient-to-br from-slate-100 to-amber-500/5 dark:from-slate-900 dark:to-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-1">
              Need custom compliance intelligence for your firm?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              CorpLawUpdates provides automated statutory deadline reminders, ROC fee calculators, and corporate secretarial document sets.
            </p>
          </div>
          <Link
            href="/documents"
            className="mt-4 sm:mt-0 shrink-0 inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:border-amber-500 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            Explore Secretarial Document Sets
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  )
}
