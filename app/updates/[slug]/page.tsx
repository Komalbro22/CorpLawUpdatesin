/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
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

export const revalidate = 86400

export async function generateStaticParams() {
    const { data } = await supabase.from('updates').select('slug')
    return (data || []).map((update) => ({
        slug: update.slug,
    }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { data: update } = await supabase
    .from('updates')
    .select('title, summary, category, published_at, tags, slug, seo_title, seo_description')
    .eq('slug', params.slug)
    .single()

  if (!update) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for does not exist.',
    }
  }

  const url = `https://www.corplawupdates.in/updates/${update.slug}`
  const imageUrl = `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(update.title)}&category=${encodeURIComponent(update.category)}`

  const titleStr = update.seo_title || update.title
  const seoTitle = (t: string): string => t.length <= 60 ? t : t.slice(0, 57) + '...'

  return {
    title: seoTitle(titleStr),
    description: update.seo_description || update.summary,
    keywords: [
      update.category,
      ...(update.tags || []),
      'corporate law India',
      'CS professional',
      'compliance India',
      update.category + ' circular 2026',
    ],
    authors: [{ name: 'CorpLawUpdates.in' }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: update.title,
      description: update.summary,
      url,
      type: 'article',
      publishedTime: update.published_at || undefined,
      section: update.category,
      tags: update.tags || [],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: update.title,
        },
      ],
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

    if (!update) {
        notFound()
    }

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
        ? update.content.replace(/<[^>]*>/g, '')
            .split(/\s+/).length
        : 0

    const tagsList = update.tags ? (typeof update.tags === 'string' ? update.tags.split(',') : update.tags) : []



    return (
        <article className="max-w-4xl mx-auto py-12 px-4 w-full">
            <ReadingProgress />
            <ViewCounter slug={update.slug} />


            {/* 1. BREADCRUMB */}
            <nav className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4 print:hidden">
                <Link href="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="mx-2">&gt;</span>
                <Link href="/updates" className="hover:text-gold transition-colors">Updates</Link>
                <span className="mx-2">&gt;</span>
                <span className="text-navy font-bold truncate max-w-[200px] inline-block align-bottom">
                    {update.title.length > 40 ? update.title.substring(0, 40) + '...' : update.title}
                </span>
            </nav>

            {/* 2. ARTICLE HEADER */}
            <header className="mb-10">
                <div className="mb-4">
                    <CategoryBadge category={update.category as "MCA" | "SEBI" | "RBI" | "NCLT" | "IBC" | "FEMA"} />
                </div>
                {update.image_url && (
                    <div className="relative w-full h-64 md:h-96 
                                  mb-8 rounded-2xl overflow-hidden">
                    <Image
                      src={update.image_url}
                      alt={update.title}
                      fill
                      className="object-cover"
                      priority={true}
                      sizes="(max-width: 768px) 100vw, 
                             (max-width: 1200px) 800px, 
                             1200px"
                    />
                  </div>
                )}
                {update.key_change && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 
                                  rounded-r-xl p-4 mb-6 
                                  flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">📋</span>
                        <div>
                            <p className="text-xs font-bold text-amber-900 
                                    uppercase tracking-widest mb-1">
                                Key Change
                            </p>
                            <p className="text-amber-800 text-sm leading-relaxed">
                                {update.key_change}
                            </p>
                        </div>
                    </div>
                )}
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
                <h1 className="font-heading text-3xl md:text-4xl text-navy font-bold mb-4 leading-snug break-words overflow-wrap-anywhere">
                    {update.title}
                </h1>
                <div className="flex flex-wrap items-center text-sm text-slate-500 gap-2 mb-6">
                    <span className="publish-date">{formattedDate}</span>
                    <span className="text-slate-300 publish-date">•</span>
                    <span className="read-count">{readTime} min read</span>
                    {wordCount > 0 && (
                        <>
                            <span className="text-slate-300 read-count">•</span>
                            <span className="text-slate-400 read-count">{wordCount.toLocaleString('en-IN')} words</span>
                        </>
                    )}
                    {update.source_name && (
                        <>
                            <span className="text-slate-300 print:hidden">•</span>
                            <span className="print:hidden">{update.source_name}</span>
                        </>
                    )}
                    {update.effective_date && (
                        <span className="inline-flex items-center gap-1
                                       bg-green-100 text-green-700 text-xs 
                                       px-2 py-1 rounded-full font-medium">
                            📅 Effective: {formatDate(update.effective_date)}
                        </span>
                    )}

                    {update.impact_level && (
                        <span className={`inline-flex items-center text-xs 
                                        px-2 py-1 rounded-full font-medium ${update.impact_level === 'high'
                                ? 'bg-red-100 text-red-700'
                                : update.impact_level === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                            }`}>
                            {update.impact_level === 'high' && '🔴 High Impact'}
                            {update.impact_level === 'medium' && '🟡 Medium Impact'}
                            {update.impact_level === 'low' && '🟢 Low Impact'}
                        </span>
                    )}

                    {(update.views || 0) > 0 && (
                        <span className="text-slate-400 text-sm views-count">
                            · {update.views!.toLocaleString('en-IN')} views
                        </span>
                    )}
                </div>

                {update.summary && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4 mb-6">
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                            📌 Summary
                        </p>
                        <p className="text-blue-900 text-sm leading-relaxed font-medium">
                            {update.summary}
                        </p>
                    </div>
                )}

                {/* 3. SHARE BUTTONS */}
                <ArticleActions
                    title={update.title}
                    url={`${BASE_URL}/updates/${update.slug}`}
                />
            </header>

            {/* 4. ARTICLE CONTENT */}
            <div className="mb-12 max-w-3xl mx-auto px-4">
                {update.content && (
                  <TableOfContents content={update.content} />
                )}
                <ErrorBoundary>
                    <div className="article-content">
                        <MarkdownRenderer content={update.content || ''} />
                    </div>
                </ErrorBoundary>
            </div>

            {/* 5. SOURCE ATTRIBUTION — hidden in print (source already in article HTML) */}
            <div className="print:hidden">
                {(update.source_url || (update.sources && update.sources.length > 0)) && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8 flex flex-col gap-2">
                        <span className="text-slate-600 font-medium mr-2">Sources:</span>
                        <ul className="space-y-1">
                            {update.source_name && update.source_url && (
                                <li>
                                    <a
                                        href={update.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gold font-bold hover:text-amber-600 transition-colors underline break-all"
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
                                        className="text-gold font-bold hover:text-amber-600 transition-colors underline break-all"
                                    >
                                        {src.name || src.url}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* 6. TAGS */}
            {tagsList && tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 mb-2">
                    <span className="text-sm text-slate-400 self-center mr-1">
                        Tags:
                    </span>
                    {tagsList.map((tag: string) => (
                        <Link
                            key={tag}
                            href={`/updates?search=${encodeURIComponent(tag.trim())}`}
                            className="bg-slate-100 hover:bg-amber-50
                                       text-slate-600 hover:text-amber-700
                                       text-sm px-3 py-1 rounded-full
                                       transition-all duration-200
                                       border border-slate-200
                                       hover:border-amber-300
                                       hover:shadow-sm"
                        >
                            #{tag.trim()}
                        </Link>
                    ))}
                </div>
            )}


            {/* 7. RELATED UPDATES */}
            {related.length > 0 && (
                <section className="pt-10 border-t border-slate-200 print:hidden">
                    <h2 className="text-2xl font-heading font-bold text-navy mb-6">Related Updates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {related.map((rel: any) => (
                            <UpdateCard key={rel.id} update={rel} />
                        ))}
                    </div>
                </section>
            )}

            {/* 8. INTERNAL LINKS — SEO */}
            <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200 print:hidden">
              <h3 className="font-bold text-navy text-sm mb-3">
                📚 Browse More {update.category.toUpperCase()} Updates
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { 
                    label: `All ${update.category.toUpperCase()} Updates`, 
                    href: `/category/${update.category.toLowerCase()}` 
                  },
                  { label: 'All Updates', href: '/updates' },
                  { label: '📅 Compliance Calendar', href: '/calendar' },
                  { label: '📧 Newsletter', href: '/newsletter' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm bg-white border border-slate-200
                               text-navy px-3 py-1.5 rounded-lg
                               hover:border-amber-400 
                               hover:text-amber-600 transition-colors"
                  >
                    {link.label} →
                  </Link>
                ))}
              </div>
            </div>
            <JsonLd data={{
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: update.title,
              description: update.summary,
              url: `https://www.corplawupdates.in/updates/${update.slug}`,
              datePublished: update.published_at,
              dateModified: update.updated_at || update.published_at,
              author: {
                '@type': 'Organization',
                name: 'CorpLawUpdates.in',
                url: 'https://www.corplawupdates.in',
              },
              publisher: {
                '@type': 'Organization',
                name: 'CorpLawUpdates.in',
                url: 'https://www.corplawupdates.in',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.corplawupdates.in/icon.png',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://www.corplawupdates.in/updates/${update.slug}`,
              },
              articleSection: update.category,
              keywords: update.tags?.join(', ') || '',
              inLanguage: 'en-IN',
              isAccessibleForFree: true,
            }} />
        </article>
    )
}
