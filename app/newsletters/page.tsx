import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { FileText, Download, Calendar, Mail, ArrowRight, ShieldCheck, Sparkles, Layers } from 'lucide-react'
import { listNewsletterPdfs, formatFileSize, fetchBriefingHtml, extractBriefingSummary } from '@/lib/newsletter-pdfs'
import { formatDate } from '@/lib/utils'
import NewsletterCoverThumbnail from '@/components/NewsletterCoverThumbnail'

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Weekly Corporate Law Briefing Archive — PDF & Reading Editions | CorpLawUpdates.in',
  description: 'Explore the complete archive of weekly corporate law briefings. Curated intelligence covering MCA circulars, SEBI master directions, RBI notifications, and IBC rulings.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/newsletters',
  },
  openGraph: {
    title: 'Weekly Corporate Law Briefing Archive | CorpLawUpdates.in',
    description: 'Explore verified weekly corporate law briefings in broadsheet format and downloadable PDF editions.',
    url: 'https://www.corplawupdates.in/newsletters',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=Weekly%20Briefing%20Archive&category=MCA', width: 1200, height: 630 }],
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

  // Fetch summaries for each edition for lead headlines & update counts
  const editionsWithSummaries = await Promise.all(
    newsletters.map(async (edition, index) => {
      const htmlPath = edition.html_path || `${edition.slug}.html`
      const rawHtml = await fetchBriefingHtml(htmlPath)
      const summary = extractBriefingSummary(rawHtml)
      const year = edition.week_end ? edition.week_end.substring(0, 4) : '2026'
      return {
        ...edition,
        isLatest: index === 0,
        leadHeadline: summary.leadHeadline,
        deck: summary.deck,
        updateCount: summary.updateCount,
        year,
      }
    })
  )

  // Group by year
  const years = Array.from(new Set(editionsWithSummaries.map(e => e.year))).sort().reverse()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* ─── Hero Banner ─── */}
      <section className="bg-navy text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="size-3.5 text-amber-400" aria-hidden="true" />
            Official Briefing Archive
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Weekly Corporate Law Intelligence Archive
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-pretty">
            Every Monday at 8:00 AM IST, CorpLawUpdates publishes an authoritative weekly briefing. Read each broadsheet edition online or download the verified PDF.
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
              Showing {newsletters.length} {newsletters.length === 1 ? 'edition' : 'editions'} across MCA, SEBI, RBI, and IBC
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
            Interactive broadsheet sheet • Direct PDF download
          </div>
        </div>

        {editionsWithSummaries.length === 0 ? (
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
          <div className="space-y-12">
            {years.map(year => {
              const yearEditions = editionsWithSummaries.filter(e => e.year === year)
              return (
                <div key={year} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-heading">
                      {year} Editions
                    </h2>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {yearEditions.map((edition) => (
                      <article
                        key={edition.id}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-amber-400/60 dark:hover:border-amber-500/60 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Broadsheet Newspaper Cover Thumbnail */}
                          <Link href={`/newsletters/${edition.slug}`} tabIndex={-1} aria-hidden="true">
                            <NewsletterCoverThumbnail
                              weekLabel={edition.week_label}
                              leadHeadline={edition.leadHeadline}
                              isLatest={edition.isLatest}
                            />
                          </Link>

                          {/* Edition Title & Metadata */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                {edition.isLatest ? 'Latest Edition' : 'Weekly Briefing'}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {edition.updateCount && (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold text-[11px]">
                                    {edition.updateCount}
                                  </span>
                                )}
                                <span>{formatFileSize(edition.file_size_bytes)}</span>
                              </div>
                            </div>

                            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              <Link href={`/newsletters/${edition.slug}`}>
                                Week of {edition.week_label}
                              </Link>
                            </h3>

                            {edition.leadHeadline && (
                              <p className="font-serif text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2 mt-1.5 italic">
                                "{edition.leadHeadline}"
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3">
                              <Calendar className="size-3.5" aria-hidden="true" />
                              <span>Coverage: {formatDate(edition.week_start)} – {formatDate(edition.week_end)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
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
                </div>
              )
            })}
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
