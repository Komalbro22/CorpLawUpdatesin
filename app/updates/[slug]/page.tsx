/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ErrorBoundary from '@/components/ErrorBoundary'
import UpdateCard from '@/components/UpdateCard'
import { calculateReadingTime, formatDate, BASE_URL } from '@/lib/utils'
import ShareButtons from './ShareButtons'

export const revalidate = 86400

export async function generateStaticParams() {
    const { data } = await supabase.from('updates').select('slug')
    return (data || []).map((update) => ({
        slug: update.slug,
    }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { data: update } = await supabase
        .from('updates')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (!update) return {}

    const title = update.title
    const summary = update.summary || ''
    const canonical = `${BASE_URL}/updates/${params.slug}`

    return {
        title,
        description: summary,
        alternates: { canonical },
        openGraph: {
            title,
            description: summary,
            type: 'article',
            publishedTime: update.published_at,
            images: [
                {
                    url: `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&category=${update.category}`,
                    width: 1200,
                    height: 630,
                },
            ],
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

    const tagsList = update.tags ? (typeof update.tags === 'string' ? update.tags.split(',') : update.tags) : []

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": update.title,
        "description": update.summary || '',
        "datePublished": update.published_at,
        "publisher": {
            "@type": "Organization",
            "name": "CorpLawUpdates.in",
            "url": BASE_URL
        }
    }

    return (
        <article className="max-w-4xl mx-auto py-12 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* 1. BREADCRUMB */}
            <nav className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
                <Link href="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="mx-2">&gt;</span>
                <Link href="/updates" className="hover:text-gold transition-colors">Updates</Link>
                <span className="mx-2">&gt;</span>
                <span className="text-navy font-bold">
                    {update.title.length > 40 ? update.title.substring(0, 40) + '...' : update.title}
                </span>
            </nav>

            {/* 2. ARTICLE HEADER */}
            <header className="mb-10">
                <div className="mb-4">
                    <CategoryBadge category={update.category as "MCA" | "SEBI" | "RBI" | "NCLT" | "IBC" | "FEMA"} />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-navy font-bold mb-4 leading-snug">
                    {update.title}
                </h1>
                <div className="flex flex-wrap items-center text-sm text-slate-500 gap-2 mb-6">
                    <span>{formattedDate}</span>
                    <span className="text-slate-300">•</span>
                    <span>{readTime} min read</span>
                    {update.source_name && (
                        <>
                            <span className="text-slate-300">•</span>
                            <span>{update.source_name}</span>
                        </>
                    )}
                </div>

                {/* 3. SHARE BUTTONS */}
                <ShareButtons
                    title={update.title}
                    url={`${BASE_URL}/updates/${update.slug}`}
                />
            </header>

            {/* 4. ARTICLE CONTENT */}
            <div className="mb-12">
                <ErrorBoundary>
                    <MarkdownRenderer content={update.content || ''} />
                </ErrorBoundary>
            </div>

            {/* 5. SOURCE ATTRIBUTION */}
            {update.source_url && update.source_name && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8 flex items-center">
                    <span className="text-slate-600 font-medium mr-2">Source:</span>
                    <a
                        href={update.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold font-bold hover:text-amber-600 transition-colors underline"
                    >
                        {update.source_name}
                    </a>
                </div>
            )}

            {/* 6. TAGS */}
            {tagsList && tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-16">
                    {tagsList.map((tag: string) => (
                        <span key={tag} className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200">
                            #{tag.trim()}
                        </span>
                    ))}
                </div>
            )}

            {/* 7. RELATED UPDATES */}
            {related.length > 0 && (
                <section className="pt-10 border-t border-slate-200">
                    <h2 className="text-2xl font-heading font-bold text-navy mb-6">Related Updates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {related.map((rel: any) => (
                            <UpdateCard key={rel.id} update={rel} />
                        ))}
                    </div>
                </section>
            )}
        </article>
    )
}
