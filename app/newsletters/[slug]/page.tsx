import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Download, ArrowLeft, ArrowRight, Calendar, ShieldCheck, FileText, ChevronLeft, ChevronRight, Mail, Sparkles } from 'lucide-react'
import { getNewsletterPdfBySlug, fetchBriefingHtml, sanitizeBriefingHtml, extractBriefingSummary, getAdjacentNewsletters } from '@/lib/newsletter-pdfs'
import { newsletterFontVariables } from '@/lib/fonts'
import NewsletterShareBar from '@/components/NewsletterShareBar'
import NewsletterWidget from '@/components/NewsletterWidget'

export const revalidate = 300 // ISR cache 5 minutes

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: record } = await getNewsletterPdfBySlug(slug)

  if (!record) {
    return {
      title: 'Briefing Not Found | CorpLawUpdates.in',
    }
  }

  // Probe storage for HTML to extract lead headline for social description
  let leadHeadline: string | null = null
  const htmlStoragePath = record.html_path || `${record.slug}.html`
  const rawHtml = await fetchBriefingHtml(htmlStoragePath)
  if (rawHtml) {
    const summary = extractBriefingSummary(rawHtml)
    leadHeadline = summary.leadHeadline
  }

  const title = `CorpLawUpdates Weekly Briefing: ${record.week_label}`
  const description = leadHeadline
    ? `${leadHeadline}. Official weekly corporate law briefing for ${record.week_label} covering MCA, SEBI, RBI, and IBC statutory developments.`
    : `Read the weekly corporate law intelligence briefing for ${record.week_label}. Authoritative statutory coverage across MCA circulars, SEBI regulations, RBI directions, and IBC notifications.`
  const canonicalUrl = `https://www.corplawupdates.in/newsletters/${record.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(`Weekly Briefing: ${record.week_label}`)}&category=MCA`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://www.corplawupdates.in/api/og?title=${encodeURIComponent(`Weekly Briefing: ${record.week_label}`)}&category=MCA`],
    },
  }
}

export default async function NewsletterReadingPage({ params }: PageProps) {
  const { slug } = await params
  const { data: record, error } = await getNewsletterPdfBySlug(slug)

  if (error || !record) {
    notFound()
  }

  // 1. Fetch briefing HTML from storage
  let rawHtml: string | null = null
  const htmlStoragePath = record.html_path || `${record.slug}.html`
  rawHtml = await fetchBriefingHtml(htmlStoragePath)

  const sanitizedHtml = rawHtml ? sanitizeBriefingHtml(rawHtml) : ''
  const hasContent = !!sanitizedHtml && sanitizedHtml.trim().length > 0
  const summary = extractBriefingSummary(rawHtml)
  const downloadHref = `/newsletters/${record.slug}/download`
  const canonicalUrl = `https://www.corplawupdates.in/newsletters/${record.slug}`

  // 2. Fetch Adjacent Editions for Prev/Next Navigation
  const { prev: prevEdition, next: nextEdition } = await getAdjacentNewsletters(record.slug)

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased reading-page-container ${newsletterFontVariables}`}>
      {/* ─── Slim Sticky Mini-Bar ─── */}
      <header className="sticky top-0 z-30 bg-[#0f2a52] text-white border-b border-[#c9a227]/30 shadow-md sticky-top-bar no-print">
        <div className="max-w-[840px] mx-auto px-3 sm:px-6 h-13 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/newsletters"
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors shrink-0"
              title="Back to Archive"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Archive</span>
            </Link>
            <span className="text-slate-500 hidden sm:inline" aria-hidden="true">•</span>
            <div className="truncate text-xs sm:text-sm font-medium tracking-tight">
              <span className="text-amber-400 font-semibold font-serif">CorpLawUpdates Weekly Briefing</span>
              <span className="text-slate-300"> · {record.week_label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={downloadHref}
              className="inline-flex items-center gap-1.5 bg-[#c9a227] hover:bg-[#d8b02e] text-[#0f2a52] font-bold text-xs px-3 py-1.5 rounded-md shadow-2xs transition-all tracking-tight"
            >
              <Download className="size-3.5" aria-hidden="true" />
              <span>Download PDF</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content Canvas (Desktop ~840px column, mobile full-width) ─── */}
      <main className="py-4 sm:py-8 lg:py-10 px-2 sm:px-6 lg:px-8">
        {hasContent ? (
          <div className="max-w-[840px] mx-auto space-y-8">
            {/* ─── White Broadsheet Card (Theme Locked & Ad Protected) ─── */}
            <article className="briefing-sheet-card bg-white dark-override-exempt border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div
                className="briefing-sheet dark-override-exempt no-ads mediavine-no-ads data-no-ads select-text p-3.5 sm:p-6 lg:p-8"
                data-no-ads="true"
                data-ad-exclude="true"
                data-grow-disable="true"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </article>

            {/* ─── Save or Share This Edition ─── */}
            <section className="save-share-card no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#0f2a52] dark:text-amber-300">
                    Save or Share This Edition
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Share verified corporate intelligence with your team or download the broadsheet PDF.
                  </p>
                </div>

                <Link
                  href={downloadHref}
                  className="inline-flex items-center gap-2 bg-[#0f2a52] hover:bg-[#153a6f] text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-2xs transition-all shrink-0"
                >
                  <Download className="size-3.5 text-[#c9a227]" aria-hidden="true" />
                  <span>Download PDF ({record.file_size_bytes ? `${(record.file_size_bytes / (1024 * 1024)).toFixed(2)} MB` : 'PDF'})</span>
                </Link>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quick Share:
                </span>
                <NewsletterShareBar
                  title={summary.leadHeadline || record.week_label}
                  weekLabel={record.week_label}
                  url={canonicalUrl}
                />
              </div>
            </section>

            {/* ─── Chronological Prev / Next Navigation ─── */}
            {(prevEdition || nextEdition) && (
              <nav className="prev-next-nav no-print grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Edition Navigation">
                {prevEdition ? (
                  <Link
                    href={`/newsletters/${prevEdition.slug}`}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-colors flex items-center gap-3 group shadow-2xs"
                  >
                    <ChevronLeft className="size-5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Previous Edition</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        Week of {prevEdition.week_label}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {nextEdition && (
                  <Link
                    href={`/newsletters/${nextEdition.slug}`}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-colors flex items-center justify-between gap-3 group text-right shadow-2xs sm:col-start-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Next Edition</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        Week of {nextEdition.week_label}
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
                  </Link>
                )}
              </nav>
            )}

            {/* ─── Monday Email Subscribe Block (Readers from Search/Social) ─── */}
            <section className="subscribe-block no-print bg-gradient-to-br from-[#0f2a52] to-[#153a6f] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-white/10">
              <div className="text-center max-w-xl mx-auto mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="size-3 text-amber-400" />
                  Every Monday 8:00 AM IST
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-2">
                  Get this briefing in your inbox every Monday — free
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Join company secretaries, legal counsels, and compliance officers who read our curated weekly intelligence covering MCA, SEBI, RBI, and IBC statutory changes.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <NewsletterWidget />
              </div>
            </section>
          </div>
        ) : (
          /* ─── Graceful Fallback for Editions without HTML ─── */
          <div className="max-w-[720px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6">
              <FileText className="size-8" aria-hidden="true" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-3">
              <Calendar className="size-3.5 text-amber-500" aria-hidden="true" />
              <span>Week of {record.week_label}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f2a52] dark:text-white mb-3">
              CorpLawUpdates Weekly Briefing
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8">
              The web-formatted reading version for this edition is being processed. The full, verified corporate law intelligence briefing is available immediately as an official broadsheet PDF.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={downloadHref}
                className="inline-flex items-center gap-2 bg-[#c9a227] hover:bg-[#d8b02e] text-[#0f2a52] font-bold text-sm px-6 py-3 rounded-lg shadow-md transition-all w-full sm:w-auto justify-center"
              >
                <Download className="size-4" aria-hidden="true" />
                <span>Download Official PDF</span>
              </Link>
              <Link
                href="/newsletters"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm px-5 py-3 rounded-lg transition-all w-full sm:w-auto justify-center"
              >
                <span>View All Briefings</span>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
              <span>Instant direct CDN delivery • No registration required</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
