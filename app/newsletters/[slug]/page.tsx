import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Download, ArrowLeft, Calendar, ShieldCheck, FileText } from 'lucide-react'
import { getNewsletterPdfBySlug, fetchBriefingHtml, sanitizeBriefingHtml } from '@/lib/newsletter-pdfs'

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

  const title = `CorpLawUpdates Weekly Briefing: ${record.week_label}`
  const description = `Read the weekly corporate law intelligence briefing for ${record.week_label}. Authoritative statutory coverage across MCA circulars, SEBI regulations, RBI directions, and IBC notifications.`
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
  }
}

export default async function NewsletterReadingPage({ params }: PageProps) {
  const { slug } = await params
  const { data: record, error } = await getNewsletterPdfBySlug(slug)

  if (error || !record) {
    notFound()
  }

  // 1. Fetch briefing HTML from storage if html_path is known or derived
  let rawHtml: string | null = null
  const htmlStoragePath = record.html_path || `${record.slug}.html`
  if (record.has_html || record.html_path) {
    rawHtml = await fetchBriefingHtml(htmlStoragePath)
  } else {
    // Probe storage in case it was uploaded before DB column was migrated
    rawHtml = await fetchBriefingHtml(htmlStoragePath)
  }

  const sanitizedHtml = rawHtml ? sanitizeBriefingHtml(rawHtml) : ''
  const hasContent = !!sanitizedHtml && sanitizedHtml.trim().length > 0
  const downloadHref = `/newsletters/${record.slug}/download`

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* ─── Slim Sticky Top Bar ─── */}
      <header className="sticky top-0 z-30 bg-[#0f2a52] text-white border-b border-[#c9a227]/30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/newsletters"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors shrink-0"
              title="Back to Archive"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
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
              className="inline-flex items-center gap-2 bg-[#c9a227] hover:bg-[#d8b02e] text-[#0f2a52] font-bold text-xs px-3.5 py-1.5 rounded-md shadow-xs transition-all tracking-tight"
            >
              <Download className="size-3.5" aria-hidden="true" />
              <span>Download PDF</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content Canvas ─── */}
      <main className="py-8 sm:py-12 px-3 sm:px-6">
        {hasContent ? (
          <article className="max-w-[720px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 sm:p-10 lg:p-12 overflow-hidden">
            {/* Broadsheet Reading Container with responsive layout & typography */}
            <div
              className="briefing-content prose prose-slate dark:prose-invert max-w-none overflow-x-auto text-slate-900 dark:text-slate-100"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* Bottom Download Banner */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-6 rounded-xl">
              <div>
                <h4 className="font-serif font-bold text-[#0f2a52] dark:text-amber-300 text-sm sm:text-base">
                  Save or Share This Edition
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Download the official, high-resolution broadsheet PDF for offline reading and records.
                </p>
              </div>
              <Link
                href={downloadHref}
                className="inline-flex items-center gap-2 bg-[#0f2a52] hover:bg-[#153a6f] text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all shrink-0"
              >
                <Download className="size-3.5 text-[#c9a227]" aria-hidden="true" />
                <span>Download PDF ({record.file_size_bytes ? `${(record.file_size_bytes / (1024 * 1024)).toFixed(2)} MB` : 'PDF'})</span>
              </Link>
            </div>
          </article>
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
