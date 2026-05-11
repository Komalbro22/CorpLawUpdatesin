/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from '@/components/CategoryBadge'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ErrorBoundary from '@/components/ErrorBoundary'
import TableOfContents from '@/components/TableOfContents'
import UpdateCard from '@/components/UpdateCard'
import { calculateReadingTime, formatDate, BASE_URL } from '@/lib/utils'
import ViewCounter from '@/components/ViewCounter'
import ArticleActions from '@/components/ArticleActions'
import ReadingProgress from '@/components/ReadingProgress'
import FontSizeToggle from '@/components/FontSizeToggle'

export const revalidate = 3600

export async function generateStaticParams() {
    const { data } = await supabase.from('updates').select('slug')
    return (data || []).map((update) => ({ slug: update.slug }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { data: update } = await supabase
    .from('updates')
    .select('title, summary, category, published_at, updated_at, tags, slug, seo_title, seo_description')
    .eq('slug', params.slug)
    .single()

  if (!update) return { title: 'Article Not Found', description: 'The article you are looking for does not exist.' }

  const url = `https://www.corplawupdates.in/updates/${update.slug}`
  const imageUrl = `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(update.title)}&category=${encodeURIComponent(update.category)}`

  const titleStr = update.seo_title || update.title
  const seoTitle = (t: string): string => t.length <= 100 ? t : t.slice(0, 97) + '...'
  const descStr = update.seo_description || update.summary
  const seoDesc = (d: string): string => d.length <= 300 ? d : d.slice(0, 297) + '...'

  return {
    title: seoTitle(titleStr),
    description: seoDesc(descStr),
    keywords: [
      update.category,
      ...(update.tags || []),
      'corporate law India',
      'CS professional',
      'compliance India',
      update.category + ' circular 2026',
    ],
    authors: [{ name: 'CorpLawUpdates.in' }],
    alternates: { canonical: url },
    openGraph: {
      title: update.title,
      description: update.summary,
      url,
      type: 'article',
      publishedTime: update.published_at || undefined,
      modifiedTime: update.updated_at || update.published_at || undefined,
      section: update.category,
      tags: update.tags || [],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: update.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: update.title,
      description: update.summary,
      images: [imageUrl],
    },
  }
}

export default async function SingleUpdatePage({ params }: { params: { slug: string } }) {
    const { data: update } = await supabase
        .from('updates')
        .select('*')
        .eq('slug', params.slug)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .single()

    if (!update) notFound()

    const { data: relatedRes } = await supabase
        .from('updates')
        .select('*')
        .eq('category', update.category)
        .neq('slug', update.slug)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(3)

    const related = relatedRes || []

    const readTime = calculateReadingTime(update.content || '')
    const formattedDate = formatDate(update.published_at)

    const wordCount = update.content
        ? update.content.replace(/<[^>]*>/g, '').split(/\s+/).length
        : 0

    const tagsList = update.tags
        ? (typeof update.tags === 'string' ? update.tags.split(',') : update.tags)
        : []

    const articleUrl = `https://www.corplawupdates.in/updates/${update.slug}`

    return (
        <article
          id="article-root"
          className="article-font-md max-w-4xl mx-auto py-10 px-4 w-full"
        >
            <ReadingProgress />
            <ViewCounter slug={update.slug} />

            {/* Breadcrumb JSON-LD */}
            <BreadcrumbJsonLd items={[
              { name: 'Home',    url: 'https://www.corplawupdates.in' },
              { name: 'Updates', url: 'https://www.corplawupdates.in/updates' },
              { name: update.title, url: articleUrl },
            ]} />

            {/* 1. BREADCRUMB NAV */}
            <nav className="text-sm text-slate-400 mb-7 flex items-center gap-1.5 flex-wrap print:hidden" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="text-slate-300">/</span>
                <Link href="/updates" className="hover:text-gold transition-colors">Updates</Link>
                <span className="text-slate-300">/</span>
                <span className="text-navy font-medium truncate max-w-[220px]">
                    {update.title.length > 45 ? update.title.substring(0, 45) + '…' : update.title}
                </span>
            </nav>

            {/* 2. ARTICLE HEADER */}
            <header className="mb-8">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                    <CategoryBadge category={update.category as any} />
                    {/* Font size toggle — client island */}
                    <FontSizeToggle />
                </div>

                {/* Hero image */}
                {update.image_url && (
                    <div className="relative w-full h-64 md:h-[400px] mb-8 rounded-2xl overflow-hidden shadow-md">
                        <Image
                            src={update.image_url}
                            alt={update.title}
                            fill
                            className="object-cover"
                            priority={true}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1200px"
                        />
                    </div>
                )}

                {/* Key change banner */}
                {update.key_change && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-6 flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">📋</span>
                        <div>
                            <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">Key Change</p>
                            <p className="text-amber-800 text-sm leading-relaxed">{update.key_change}</p>
                        </div>
                    </div>
                )}

                {/* Key changes accordion */}
                {update.key_changes && Array.isArray(update.key_changes) && update.key_changes.length > 0 && (
                    <details className="group bg-slate-50 border border-slate-200 rounded-xl mb-6 overflow-hidden print:hidden">
                        <summary className="cursor-pointer p-4 font-bold text-navy flex justify-between items-center bg-white hover:bg-slate-50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">💡</span>
                                All Key Changes
                            </div>
                            <span className="text-slate-400 group-open:rotate-180 transition-transform duration-300">▼</span>
                        </summary>
                        <div className="p-5 border-t border-slate-100">
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                                {update.key_changes.map((kc: string, i: number) => (
                                    <li key={i}>{kc}</li>
                                ))}
                            </ul>
                        </div>
                    </details>
                )}

                {/* Title */}
                <h1 className="font-heading text-3xl md:text-[2.2rem] text-navy font-bold mb-4 leading-snug break-words">
                    {update.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center text-sm text-slate-400 gap-2 mb-5">
                    <time className="publish-date" dateTime={update.published_at}>{formattedDate}</time>
                    <span className="text-slate-300">•</span>
                    <span className="read-count flex items-center gap-1">
                        🕐 {readTime} min read
                    </span>
                    {wordCount > 0 && (
                        <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 read-count">{wordCount.toLocaleString('en-IN')} words</span>
                        </>
                    )}
                    {update.source_name && (
                        <>
                            <span className="text-slate-300 print:hidden">•</span>
                            <span className="print:hidden text-slate-400">{update.source_name}</span>
                        </>
                    )}
                    {update.effective_date && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            📅 Effective: {formatDate(update.effective_date)}
                        </span>
                    )}
                    {update.impact_level && (
                        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                            update.impact_level === 'high'   ? 'bg-red-100 text-red-700'   :
                            update.impact_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                               'bg-green-100 text-green-700'
                        }`}>
                            {update.impact_level === 'high'   && '🔴 High Impact'}
                            {update.impact_level === 'medium' && '🟡 Medium Impact'}
                            {update.impact_level === 'low'    && '🟢 Low Impact'}
                        </span>
                    )}
                    {(update.views || 0) > 0 && (
                        <span className="text-slate-400 text-xs views-count">
                            · {update.views!.toLocaleString('en-IN')} views
                        </span>
                    )}
                </div>

                {/* Summary box */}
                {update.summary && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4 mb-6">
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">📌 Summary</p>
                        <p className="text-blue-900 text-sm leading-relaxed font-medium">{update.summary}</p>
                    </div>
                )}

                {/* Share buttons */}
                <ArticleActions
                    title={update.title}
                    url={`${BASE_URL}/updates/${update.slug}`}
                />
            </header>

            {/* 3. ARTICLE CONTENT (+ sticky sidebar TOC auto-renders at xl) */}
            <div className="mb-12">
                {update.content && <TableOfContents content={update.content} />}
                <ErrorBoundary>
                    <div className="article-content">
                        <MarkdownRenderer content={update.content || ''} />
                    </div>
                </ErrorBoundary>
            </div>

            {/* 4. SOURCE ATTRIBUTION */}
            <div className="print:hidden">
                {(update.source_url || (update.sources && update.sources.length > 0)) && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 flex flex-col gap-2">
                        <span className="text-slate-600 font-semibold text-sm">Sources</span>
                        <ul className="space-y-1">
                            {update.source_name && update.source_url && (
                                <li>
                                    <a
                                        href={update.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gold font-bold hover:text-amber-600 transition-colors underline break-all text-sm"
                                    >
                                        {update.source_name}
                                    </a>
                                </li>
                            )}
                            {update.sources && update.sources.map((src: any, i: number) => (
                                <li key={i}>
                                    <a
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gold font-bold hover:text-amber-600 transition-colors underline break-all text-sm"
                                    >
                                        {src.name || src.url}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* 5. TAGS */}
            {tagsList && tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 mb-6 print:hidden">
                    <span className="text-xs text-slate-400 self-center mr-1 font-medium">Tags:</span>
                    {tagsList.map((tag: string) => (
                        <Link
                            key={tag}
                            href={`/updates?search=${encodeURIComponent(tag.trim())}`}
                            className="bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs px-3 py-1 rounded-full transition-all duration-200 border border-slate-200 hover:border-amber-300 hover:shadow-sm"
                        >
                            #{tag.trim()}
                        </Link>
                    ))}
                </div>
            )}

            {/* 6. RELATED UPDATES */}
            {related.length > 0 && (
                <section className="pt-10 border-t border-slate-200 print:hidden">
                    <h2 className="text-xl font-heading font-bold text-navy mb-6">Related Updates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {related.map((rel: any, i: number) => (
                            <UpdateCard key={rel.id} update={rel} animationDelay={i * 60} />
                        ))}
                    </div>
                </section>
            )}

            {/* 7. INTERNAL LINKS — SEO */}
            <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200 print:hidden">
                <h3 className="font-bold text-navy text-sm mb-3">
                    📚 Browse More {update.category.toUpperCase()} Updates
                </h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: `All ${update.category.toUpperCase()} Updates`, href: `/category/${update.category.toLowerCase()}` },
                        { label: 'All Updates', href: '/updates' },
                        { label: '📅 Compliance Calendar', href: '/calendar' },
                        { label: '📧 Newsletter', href: '/newsletter' },
                    ].map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm bg-white border border-slate-200 text-navy px-3 py-1.5 rounded-lg hover:border-amber-400 hover:text-amber-700 transition-colors"
                        >
                            {link.label} →
                        </Link>
                    ))}
                </div>
            </div>

            {/* 8. ARTICLE JSON-LD */}
            <JsonLd data={{
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: update.title,
              description: update.summary,
              url: articleUrl,
              datePublished: update.published_at,
              dateModified: update.updated_at || update.published_at,
              author: { '@type': 'Organization', name: 'CorpLawUpdates.in', url: 'https://www.corplawupdates.in' },
              publisher: {
                '@type': 'Organization',
                name: 'CorpLawUpdates.in',
                url: 'https://www.corplawupdates.in',
                logo: { '@type': 'ImageObject', url: 'https://www.corplawupdates.in/icon.png' },
              },
              mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
              articleSection: update.category,
              keywords: update.tags?.join(', ') || '',
              inLanguage: 'en-IN',
              isAccessibleForFree: true,
            }} />
        </article>
    )
}
