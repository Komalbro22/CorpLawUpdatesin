'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar, Clock, Eye, Share2, BookOpen } from 'lucide-react'
import CategoryBadge from '@/components/CategoryBadge'
import GazetteLedgerRail from '@/components/shared/GazetteLedgerRail'
import { formatDate } from '@/lib/utils'

export interface ArticleLayoutProps {
  category: string
  title: string
  summary?: string
  publishedAt?: string
  updatedAt?: string
  readingTime?: number
  views?: number
  sourceName?: string
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function ArticleLayout({
  category,
  title,
  summary,
  publishedAt,
  updatedAt,
  readingTime,
  views,
  sourceName,
  children,
  sidebar,
}: ArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-6 pb-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <ol className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <li>
            <Link href="/" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden />
          </li>
          <li>
            <Link href="/updates" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
              Updates
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden />
          </li>
          <li className="truncate max-w-[200px] sm:max-w-xs text-navy dark:text-white font-bold" aria-current="page">
            {category}
          </li>
        </ol>
      </nav>

      {/* Main Article Grid */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Body Column */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Signature Gazette Ledger Rail Accent */}
            <GazetteLedgerRail category={category} sectionRef={sourceName} />

            {/* Category & Metadata Header */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <CategoryBadge category={category} />
              {publishedAt && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" aria-hidden />
                  {formatDate(publishedAt)}
                </span>
              )}
              {readingTime && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" aria-hidden />
                  {readingTime} min read
                </span>
              )}
              {typeof views === 'number' && views > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <Eye className="w-3.5 h-3.5" aria-hidden />
                  {views.toLocaleString('en-IN')} views
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-4xl font-bold text-navy dark:text-white leading-tight mb-4 text-balance">
              {title}
            </h1>

            {/* Summary / Excerpt Callout */}
            {summary && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-amber-600 text-slate-700 dark:text-slate-300 text-base leading-relaxed font-medium mb-8">
                {summary}
              </div>
            )}

            {/* Main Content Render */}
            <div className="article-body prose prose-slate max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-navy dark:prose-headings:text-white prose-a:text-amber-700 dark:prose-a:text-amber-400">
              {children}
            </div>
          </div>

          {/* Sidebar Column */}
          {sidebar && (
            <aside className="lg:col-span-4 space-y-6 sticky top-24">
              {sidebar}
            </aside>
          )}
        </article>
      </main>
    </div>
  )
}

export default ArticleLayout
