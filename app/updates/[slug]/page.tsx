/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { UPDATE_DETAIL_COLUMNS, UPDATE_LIST_COLUMNS } from '@/lib/supabase-queries'
import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from '@/components/CategoryBadge'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ErrorBoundary from '@/components/ErrorBoundary'
import TableOfContents from '@/components/TableOfContents'
import UpdateCard from '@/components/UpdateCard'
import { calculateReadingTime, formatDate, BASE_URL } from '@/lib/utils'
import { linkGlossaryTerms } from '@/lib/glossaryLinker'
import ViewCounter from '@/components/ViewCounter'
import ArticleActions from '@/components/ArticleActions'
import ReadingProgress from '@/components/ReadingProgress'
import FontSizeToggle from '@/components/FontSizeToggle'
import { QuickAnswer } from '@/components/QuickAnswer'
import { AlertCircle, BookOpen, CalendarDays, ChevronDown, Clock3, Eye, FileText, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize'
import { mcaForms } from '@/data/mca-forms'

const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : ''

function extractFirstImage(content: string): string | null {
    if (!content) return null
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/)
    if (mdMatch && mdMatch[1]) return mdMatch[1]
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/)
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1]
    return null
}

export const revalidate = 86400 // 24 hours

export async function generateStaticParams() {
    const { data } = await supabase.from('updates').select('slug')
    return (data || []).map((update) => ({ slug: update.slug }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug)
  
  const { data: update } = await supabase
    .from('updates')
    .select('title, summary, category, published_at, updated_at, tags, slug, seo_title, seo_description, content, featured_image_url')
    .ilike('slug', decodedSlug)
    .single()

  const canonicalUrl = `https://www.corplawupdates.in/updates/${params.slug.toLowerCase()}`

  if (!update) {
    return { 
      title: 'Article Not Found', 
      description: 'The article you are looking for does not exist.',
      robots: { index: false, follow: true },
      alternates: { canonical: canonicalUrl }
    }
  }

  const titleStr = update.seo_title || update.title
  const seoTitle = (t: string): string => t.length <= 100 ? t : t.slice(0, 97) + '...'
  const descStr = update.seo_description || update.summary
  const seoDesc = (d: string): string => d.length <= 300 ? d : d.slice(0, 297) + '...'
  let extractedImageUrl = update.featured_image_url || null;
  if (!extractedImageUrl && update.content) {
    const imgMatch = update.content.match(/<img[^>]+src=["']([^"']+)["']/i) || update.content.match(/!\[.*?\]\((.*?)\)/i);
    if (imgMatch && imgMatch[1]) {
      extractedImageUrl = imgMatch[1];
    }
  }

  const imageUrl = extractedImageUrl 
    ? (extractedImageUrl.startsWith('http') ? extractedImageUrl : `https://www.corplawupdates.in${extractedImageUrl}`)
    : `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(update.title)}&category=${encodeURIComponent(update.category || '')}`

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
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: update.title,
      description: update.summary,
      url: canonicalUrl,
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
        .select(UPDATE_DETAIL_COLUMNS)
        .ilike('slug', decodeURIComponent(params.slug))
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .single()

    if (!update) notFound()

    const { data: geoData } = await supabase
        .from('updates')
        .select('quick_answer, has_steps, steps_json, last_verified, regulation_ref, key_takeaways, last_amended')
        .ilike('slug', decodeURIComponent(params.slug))
        .maybeSingle();

    const { data: relatedRes } = await supabase
        .from('updates')
        .select(UPDATE_LIST_COLUMNS)
        .eq('category', update.category)
        .neq('slug', update.slug)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(3)

    const related = relatedRes || []

    // Fetch glossary terms for auto-linking (Cached for 24 hours)
    let glossaryTerms = []
    try {
        const glossaryRes = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/glossary?select=term,slug,synonyms&is_verified=eq.true`,
            {
                headers: {
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
                },
                next: { revalidate: 86400 }
            }
        )
        if (glossaryRes.ok) {
            const rawTerms = await glossaryRes.json()
            glossaryTerms = rawTerms.flatMap((item: any) => {
                const mappings = [{ term: item.term, slug: item.slug, mainTermName: item.term }]
                if (item.synonyms && Array.isArray(item.synonyms)) {
                    item.synonyms.forEach((syn: string) => {
                        const trimmed = syn.trim()
                        if (trimmed && trimmed.toLowerCase() !== item.term.toLowerCase()) {
                            mappings.push({
                                term: trimmed,
                                slug: item.slug,
                                mainTermName: item.term
                            })
                        }
                    })
                }
                return mappings
            })
        }
    } catch (e) {
        console.error('Failed to fetch glossary terms for linking:', e)
    }

    // Apply auto-linking to the content and key changes
    if (glossaryTerms.length > 0) {
        if (update.content) {
            update.content = linkGlossaryTerms(update.content, glossaryTerms)
        }
        if (update.key_change) {
            update.key_change = linkGlossaryTerms(update.key_change, glossaryTerms)
        }
        if (update.key_changes && Array.isArray(update.key_changes)) {
            update.key_changes = update.key_changes.map((kc: string) => linkGlossaryTerms(kc, glossaryTerms))
        }
    }

    const readTime = calculateReadingTime(update.content || '')
    const formattedDate = formatDate(update.published_at)

    const wordCount = update.content
        ? update.content.replace(/<[^>]*>/g, '').split(/\s+/).length
        : 0

    const tagsList = update.tags
        ? (typeof update.tags === 'string' ? update.tags.split(',') : update.tags)
        : []

    const articleUrl = `https://www.corplawupdates.in/updates/${update.slug}`
    const imageUrl = update.featured_image_url || extractFirstImage(update.content || '')

    // Auto-extract FAQs for Search Console Rich Results
    const faqs: { question: string; answer: string }[] = []
    if (update.content) {
        // 1. Convert HTML rich text to plain text, preserving paragraph breaks
        const plainText = update.content
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n')
            .replace(/<[^>]*>/g, '') // Remove all other HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ');
            
        // 2. Find all markers (Q1, Q2, Question 1, etc.)
        const markerRegex = /(?:\r?\n|^)\s*((?:Q|Question)\s*\d+[:.\s]+)/gi
        const markers = Array.from(plainText.matchAll(markerRegex)) as any[]
        
        const cleanText = (text: string) => text ? text.replace(/\s+/g, ' ').trim() : ''

        markers.forEach((marker, i) => {
            const start = (marker.index || 0) + marker[0].length
            const nextMarker = markers[i + 1]
            let end = nextMarker ? (nextMarker.index || plainText.length) : plainText.length

            // If it is the last FAQ, terminate the block early if we find standard post-FAQ headings
            if (!nextMarker) {
                const endingKeywords = [
                    /(?:\r?\n|^)\s*(?:###?\s*)?Conclusion\b/i,
                    /(?:\r?\n|^)\s*(?:###?\s*)?Disclaimer\b/i,
                    /(?:\r?\n|^)\s*(?:###?\s*)?About the Author\b/i,
                    /(?:\r?\n|^)\s*(?:###?\s*)?Note\b/i,
                    /(?:\r?\n|^)\s*(?:###?\s*)?References?\b/i
                ]
                for (const pattern of endingKeywords) {
                    const match = plainText.substring(start).match(pattern)
                    if (match && match.index !== undefined) {
                        end = start + match.index
                        break
                    }
                }
            }

            const block = plainText.substring(start, end).trim()
            
            // 3. Smart split: Question ends at first '?' or first newline
            let qRaw = ''
            let aRaw = ''
            
            const qEndMatch = block.match(/^(.*?\?)(?:\s+|$)([\s\S]*)$/)
            if (qEndMatch) {
                qRaw = qEndMatch[1]
                aRaw = qEndMatch[2]
            } else {
                const lines = block.split(/\r?\n/)
                qRaw = lines[0]
                aRaw = lines.slice(1).join(' ')
            }

            // Include the "Q1" prefix in the question for completeness
            const q = cleanText(marker[1].trim() + ' ' + qRaw)
            const a = cleanText(aRaw)
            
            if (q && a) {
                faqs.push({ question: q, answer: a })
            }
        })
    }

    let contentPart1 = update.content || ''
    let contentPart2 = ''
    
    // Find if this article is mapped to any form's filingGuides
    const relatedForm = mcaForms.find(f => f.filingGuides && f.filingGuides.some(g => g.slug.includes(update.slug)))

    if (relatedForm && update.content) {
        const pTags = update.content.split('</p>')
        if (pTags.length > 3) {
            contentPart1 = pTags.slice(0, 3).join('</p>') + '</p>'
            contentPart2 = pTags.slice(3).join('</p>')
        } else {
            const mdParas = update.content.split(/\n\n+/)
            if (mdParas.length > 3) {
                contentPart1 = mdParas.slice(0, 3).join('\n\n') + '\n\n'
                contentPart2 = mdParas.slice(3).join('\n\n')
            }
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900">
            <article
              id="article-root"
              className="article-font-md mx-auto w-full max-w-4xl px-4 py-8 sm:py-12"
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
            <nav className="mb-7 flex flex-wrap items-center gap-1.5 text-sm text-slate-400 print:hidden" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="text-slate-300">/</span>
                <Link href="/updates" className="hover:text-gold transition-colors">Updates</Link>
                <span className="text-slate-300">/</span>
                <span className="text-navy dark:text-slate-200 font-medium truncate max-w-[220px]">
                    {update.title.length > 45 ? update.title.substring(0, 45) + '...' : update.title}
                </span>
            </nav>

            {/* 2. ARTICLE HEADER */}
            <header className="mb-8">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <CategoryBadge category={update.category as any} />
                        <Link 
                            href={`/category/${update.category.toLowerCase()}`}
                            className="text-xs font-bold text-slate-400 hover:text-gold transition-colors uppercase tracking-widest"
                        >
                            {update.category.toUpperCase()} updates
                        </Link>
                    </div>
                    {/* Font size toggle - client island */}
                    <FontSizeToggle />
                </div>



                {/* Key change banner */}
                {update.key_change && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/80 dark:border-amber-900/30 border-l-[3px] border-l-amber-500 bg-amber-50/90 dark:bg-amber-950/20 p-4 shadow-sm ring-1 ring-slate-900/[0.02] dark:ring-white/[0.02]">
                        <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                        <div>
                            <p className="text-xs font-bold text-amber-900 dark:text-amber-450 uppercase tracking-widest mb-1">Key Change</p>
                            <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(update.key_change) }} />
                        </div>
                    </div>
                )}

                {/* Key changes accordion - Wrapped in semantic section for accessibility & AI crawler extraction */}
                {update.key_changes && Array.isArray(update.key_changes) && update.key_changes.length > 0 && (() => {
                    const cat = update.category?.toUpperCase() || 'DEFAULT';
                    let cardStyles = {
                        borderColor: 'border-slate-200',
                        borderLeftColor: 'border-l-gold',
                        bgColor: 'bg-slate-50/40',
                        accentColor: 'text-gold',
                        iconColor: 'text-amber-500',
                        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/50',
                    };

                    if (cat === 'SEBI') {
                        cardStyles = {
                            borderColor: 'border-emerald-100',
                            borderLeftColor: 'border-l-emerald-500',
                            bgColor: 'bg-emerald-50/30',
                            accentColor: 'text-emerald-600',
                            iconColor: 'text-emerald-500',
                            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
                        };
                    } else if (cat === 'MCA') {
                        cardStyles = {
                            borderColor: 'border-blue-100',
                            borderLeftColor: 'border-l-blue-500',
                            bgColor: 'bg-blue-50/30',
                            accentColor: 'text-blue-600',
                            iconColor: 'text-blue-500',
                            badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/50',
                        };
                    } else if (cat === 'RBI') {
                        cardStyles = {
                            borderColor: 'border-violet-100',
                            borderLeftColor: 'border-l-violet-500',
                            bgColor: 'bg-violet-50/30',
                            accentColor: 'text-violet-600',
                            iconColor: 'text-violet-500',
                            badgeBg: 'bg-violet-50 text-violet-700 border-violet-200/50',
                        };
                    } else if (cat === 'NCLT') {
                        cardStyles = {
                            borderColor: 'border-orange-100',
                            borderLeftColor: 'border-l-orange-500',
                            bgColor: 'bg-orange-50/30',
                            accentColor: 'text-orange-600',
                            iconColor: 'text-orange-500',
                            badgeBg: 'bg-orange-50 text-orange-700 border-orange-200/50',
                        };
                    } else if (cat === 'IBC') {
                        cardStyles = {
                            borderColor: 'border-red-100',
                            borderLeftColor: 'border-l-red-500',
                            bgColor: 'bg-red-50/30',
                            accentColor: 'text-red-600',
                            iconColor: 'text-red-500',
                            badgeBg: 'bg-red-50 text-red-700 border-red-200/50',
                        };
                    } else if (cat === 'FEMA') {
                        cardStyles = {
                            borderColor: 'border-teal-100',
                            borderLeftColor: 'border-l-teal-500',
                            bgColor: 'bg-teal-50/30',
                            accentColor: 'text-teal-600',
                            iconColor: 'text-teal-500',
                            badgeBg: 'bg-teal-50 text-teal-700 border-teal-200/50',
                        };
                    }

                    return (
                        <section id="tldr-summary" aria-label="TL;DR Executive Summary" className="mb-6">
                            <details open className={`group overflow-hidden rounded-xl border ${cardStyles.borderColor} dark:border-slate-800 border-l-[4px] ${cardStyles.borderLeftColor} ${cardStyles.bgColor} shadow-sm transition-all duration-200`}>
                                <summary className="cursor-pointer p-4 font-bold text-navy dark:text-slate-100 flex justify-between items-center bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors list-none [&::-webkit-details-marker]:hidden focus:outline-none">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className={`h-5 w-5 ${cardStyles.iconColor} animate-pulse`} aria-hidden />
                                        <span className="font-heading text-base font-bold text-navy dark:text-white tracking-tight">TL;DR — Executive Summary</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cardStyles.badgeBg}`}>
                                            ⚡ Key Takeaways
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-300 group-open:rotate-180" aria-hidden />
                                    </div>
                                </summary>
                                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                                    <ul className="space-y-3.5 list-none pl-0 m-0" itemProp="abstract" data-ai-summary="true">
                                        {update.key_changes.map((kc: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                                                <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cardStyles.iconColor}`} aria-hidden />
                                                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(kc) }} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </details>
                        </section>
                    );
                })()}

                {/* Title */}
                <h1 className="font-heading text-3xl md:text-[2.2rem] text-navy dark:text-slate-50 font-bold mb-4 leading-snug break-words">
                    {update.title}
                </h1>
                
                {/* 3.1 About this article / Editorial team */}
                {geoData?.last_verified && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 text-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white font-bold">CL</div>
                            <div>
                                <p className="font-bold text-slate-700 dark:text-slate-300">Editorial team</p>
                                <p className="text-slate-500">CorpLawUpdates.in · Professionals & compliance specialists</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-500">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Verified for compliance
                            </span>
                            <span className="text-slate-400">Last verified: {formatDate(geoData.last_verified)}</span>
                        </div>
                    </div>
                )}
                
                {/* 3.2 Regulation reference */}
                {geoData?.regulation_ref && (
                    <div className="mb-6 flex items-center gap-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                        <BookOpen className="h-4 w-4 text-amber-600" aria-hidden />
                        <span className="font-bold">Legal basis:</span> {geoData.regulation_ref}
                    </div>
                )}
                
                {/* Meta row */}
                <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <time className="publish-date inline-flex items-center gap-1.5" dateTime={update.published_at}>
                        <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
                        {formattedDate}
                    </time>
                    <span className="read-count inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-slate-400" aria-hidden />
                        {readTime} min read
                    </span>
                    {wordCount > 0 && (
                        <span className="read-count inline-flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-slate-400" aria-hidden />
                            {wordCount.toLocaleString('en-IN')} words
                        </span>
                    )}
                    {update.source_name && (
                        <span className="print:hidden text-slate-500 dark:text-slate-400">{update.source_name}</span>
                    )}
                    {update.effective_date && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-950/20 px-2 py-1 text-xs font-medium text-green-755">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                            Effective: {formatDate(update.effective_date)}
                        </span>
                    )}
                    {geoData?.last_amended && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" aria-hidden />
                            Last amended: {formatDate(geoData.last_amended)}
                        </span>
                    )}
                    {update.impact_level && (
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                            update.impact_level === 'high'   ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'   :
                            update.impact_level === 'medium' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
                                                               'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                        }`}>
                            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                            {update.impact_level === 'high'   && 'High impact'}
                            {update.impact_level === 'medium' && 'Medium impact'}
                            {update.impact_level === 'low'    && 'Low impact'}
                        </span>
                    )}
                    {(update.views || 0) > 0 && (
                        <span className="views-count inline-flex items-center gap-1.5 text-xs text-slate-400">
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                            {update.views!.toLocaleString('en-IN')} views
                        </span>
                    )}
                </div>

                {/* Summary box */}
                {update.summary && (
                    <div className="mb-6 rounded-r-lg border-l-4 border-blue-400 dark:border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 p-4">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-800 dark:text-blue-400">
                            <FileText className="h-4 w-4" aria-hidden />
                            Summary
                        </p>
                        <p className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed font-medium">{update.summary}</p>
                    </div>
                )}

                {/* Quick Answer box */}
                {geoData?.quick_answer && (
                    <QuickAnswer answer={geoData.quick_answer} />
                )}

                {/* Key Takeaways */}
                {geoData?.key_takeaways && Array.isArray(geoData.key_takeaways) && geoData.key_takeaways.length > 0 && (
                    <div className="mb-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 shadow-sm">
                        <h3 className="mb-3 font-heading text-lg font-bold text-navy dark:text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
                            Key Takeaways
                        </h3>
                        <ul className="space-y-2 pl-2">
                            {geoData.key_takeaways.map((point: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
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
                        <MarkdownRenderer content={contentPart1} />
                        
                        {relatedForm && (
                            <div className="my-10 bg-[#0F172A] rounded-[12px] p-8 flex flex-col items-center text-center shadow-lg border border-slate-800 clear-both">
                                <span className="text-4xl mb-4" aria-hidden>🧮</span>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    Calculate Your {relatedForm.formNumber} Fee & Penalty
                                </h3>
                                <p className="text-slate-300 text-base max-w-lg mb-8 leading-relaxed">
                                    Use our free calculator to get the exact filing fee and late penalty for your company in under 30 seconds.
                                </p>
                                <Link 
                                    href={`/tools/fee-calculator/companies/${relatedForm.slug}`}
                                    className="bg-[#1D4ED8] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block w-full sm:w-auto"
                                >
                                    Open {relatedForm.formNumber} Fee Calculator →
                                </Link>
                                {/* 10E SEO Rule: Contextual Link within the widget block */}
                                <p className="sr-only">
                                    <a href={`/tools/fee-calculator/companies/${relatedForm.slug}`}>{relatedForm.formNumber} fee calculator</a>
                                </p>
                            </div>
                        )}
                        
                        {contentPart2 && <MarkdownRenderer content={contentPart2} />}
                    </div>
                </ErrorBoundary>
            </div>

            {/* 4. SOURCE ATTRIBUTION */}
            <div className="print:hidden">
                {(update.source_url || (update.sources && update.sources.length > 0)) && (
                    <div className="mb-8 flex flex-col gap-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
                        <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">Sources</span>
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
                            className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs text-slate-600 dark:text-slate-400 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-700 dark:hover:text-amber-400 hover:shadow-sm"
                        >
                            #{tag.trim()}
                        </Link>
                    ))}
                </div>
            )}

            <div id="article-end" className="h-4" aria-hidden />

            {/* 6. RELATED UPDATES */}
            {related.length > 0 && (
                <section className="pt-10 border-t border-slate-200 dark:border-slate-800 print:hidden">
                    <h2 className="text-xl font-heading font-bold text-navy dark:text-white mb-6">Related Updates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {related.map((rel: any, i: number) => (
                            <UpdateCard key={rel.id} update={rel} animationDelay={i * 60} />
                        ))}
                    </div>
                </section>
            )}

            {/* 7. INTERNAL LINKS - SEO */}
            <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 print:hidden">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy dark:text-white">
                    <BookOpen className="h-4 w-4 text-amber-600" aria-hidden />
                    Browse More {update.category.toUpperCase()} Updates
                </h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: `All ${update.category.toUpperCase()} Updates`, href: `/category/${update.category.toLowerCase()}` },
                        { label: 'All Updates', href: '/updates' },
                        { label: 'Compliance Calendar', href: '/calendar' },
                        { label: 'Newsletter', href: '/newsletter' },
                    ].map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-navy dark:text-slate-200 px-3 py-1.5 rounded-lg hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                        >
                            {link.label} <span aria-hidden>{'->'}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 8. ARTICLE JSON-LD — enriched with summary, key changes, source */}
            <JsonLd data={{
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: update.title,
              description: update.summary,
              abstract: update.summary,
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
              keywords: [
                ...(update.tags || []),
                update.category,
                `${update.category} circular`,
                `${update.category} notification`,
                'India corporate law',
              ].join(', '),
              inLanguage: 'en-IN',
              isAccessibleForFree: true,
              ...(imageUrl ? { image: { '@type': 'ImageObject', url: imageUrl } } : {}),
              ...(update.source_url ? { citation: { '@type': 'CreativeWork', name: update.source_name || 'Official Source', url: update.source_url } } : {}),
              ...(update.effective_date ? { temporal: update.effective_date } : {}),
            }} />
            {/* Key changes as ItemList for AI indexing */}
            {(update.key_change || (update.key_changes && update.key_changes.length > 0)) && (
              <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: `Key Changes — ${update.title}`,
                description: `Key regulatory changes from: ${update.title}`,
                numberOfItems: (update.key_change ? 1 : 0) + (update.key_changes?.length || 0),
                itemListElement: [
                  ...(update.key_change ? [{
                    '@type': 'ListItem',
                    position: 1,
                    name: stripHtml(update.key_change)
                  }] : []),
                  ...(update.key_changes?.map((kc: string, i: number) => ({
                    '@type': 'ListItem',
                    position: (update.key_change ? 2 : 1) + i,
                    name: stripHtml(kc),
                  })) || [])
                ],
              }} />
            )}

            {/* 10. FAQ SCHEMA — for Google Search Console Rich Results */}
            {faqs.length > 0 && (
              <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map(f => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.answer,
                  },
                })),
              }} />
            )}

            {/* 11. HOWTO SCHEMA */}
            {geoData?.has_steps && Array.isArray(geoData.steps_json) && geoData.steps_json.length > 0 && (
              <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'HowTo',
                name: update.title,
                description: update.summary,
                step: geoData.steps_json.map((step: any, i: number) => ({
                  '@type': 'HowToStep',
                  position: i + 1,
                  name: step.heading || `Step ${i + 1}`,
                  text: step.description || '',
                }))
              }} />
            )}
        </article>
      </div>
    )
}
