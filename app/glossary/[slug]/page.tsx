import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Revalidate every hour

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const { data: terms } = await supabase
    .from('glossary')
    .select('slug')
    .eq('is_verified', true)

  return (terms || []).map((term) => ({
    slug: term.slug,
  }))
}

// Content quality threshold — pages below this get noindex to protect domain authority
const CONTENT_QUALITY_THRESHOLD = 200

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: term } = await supabase
    .from('glossary')
    .select('term, slug, definition, extended_note')
    .eq('slug', params.slug)
    .single()

  if (!term) {
    return { title: 'Term Not Found | CorpLawUpdates' }
  }

  const contentLength = (term.definition || '').length + (term.extended_note || '').length
  const isThin = contentLength < CONTENT_QUALITY_THRESHOLD

  return {
    title: `${term.term} — Meaning, Definition | CorpLawUpdates Legal Glossary`,
    description: `${term.term} meaning: ${term.definition.slice(0, 150)}. Part of CorpLawUpdates Indian corporate law glossary.`,
    openGraph: {
      title: `${term.term} — Legal Definition`,
      description: term.definition.slice(0, 150),
      url: `https://corplawupdates.in/glossary/${term.slug}`,
    },
    // Thin glossary pages get noindex to prevent quality dilution — links still followed
    ...(isThin ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function GlossaryTermPage({ params }: Props) {
  // Fetch detailed term fields
  const { data: term } = await supabase
    .from('glossary')
    .select('term, slug, definition, category, keywords, extended_note, related_terms, created_at, is_verified')
    .eq('slug', params.slug)
    .single()

  if (!term || !term.is_verified) {
    notFound()
  }

  // Fetch related terms slugs based on the related_terms array (which stores term names)
  let relatedTermsData: { term: string; slug: string }[] = []
  if (term.related_terms && term.related_terms.length > 0) {
    const { data: related } = await supabase
      .from('glossary')
      .select('term, slug')
      .in('term', term.related_terms)
      .eq('is_verified', true)
    
    if (related) {
      relatedTermsData = related
    }
  }

  // Fetch related updates/articles from same category
  const { data: relatedArticles } = await supabase
    .from('updates')
    .select('title, slug, published_at')
    .ilike('category', term.category)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(3)

  // Check if term is an acronym (all caps or short abbreviation)
  const isAcronym = /^[A-Z]{2,8}$/.test(term.term) || 
                    /^[A-Z][A-Z0-9\-]{1,7}$/.test(term.term)

  // Content quality check — only generate rich FAQs for substantial content
  const contentLength = (term.definition || '').length + (term.extended_note || '').length
  const isSubstantial = contentLength >= CONTENT_QUALITY_THRESHOLD

  // Category-specific contextual phrases for unique FAQ answers
  const categoryContext: Record<string, string> = {
    'MCA': 'governed by the Ministry of Corporate Affairs under the Companies Act, 2013',
    'SEBI': 'regulated by the Securities and Exchange Board of India under applicable SEBI regulations',
    'RBI': 'governed by the Reserve Bank of India under applicable banking and monetary policy frameworks',
    'NCLT': 'adjudicated by the National Company Law Tribunal under the Companies Act, 2013 or IBC',
    'IBC': 'governed by the Insolvency and Bankruptcy Code, 2016 and regulated by IBBI',
    'FEMA': 'governed by the Foreign Exchange Management Act, 1999 and regulated by RBI',
  }
  const ctx = categoryContext[term.category] || `regulated under Indian ${term.category} law`

  // Auto-generate high-quality, non-repetitive FAQs
  const faqs = [
    {
      q: `What is ${term.term} in Indian corporate law?`,
      a: term.definition
    },
    {
      q: `Why is ${term.term} important for compliance?`,
      a: `${term.term} is ${ctx}. Understanding this concept is essential for ensuring regulatory compliance, avoiding penalties, and making informed corporate decisions in India.`
    },
    ...(isAcronym ? [{
      q: `What is the full form of ${term.term}?`,
      a: term.definition.split('—')[0]?.trim() + ' — that is the full form of ' + term.term + '.'
    }] : [{
      q: `Who should know about ${term.term}?`,
      a: `${term.term} is relevant for company secretaries, compliance officers, chartered accountants, corporate lawyers, board members, and all professionals dealing with ${term.category} regulatory matters in India.`
    }])
  ]

  // DefinedTerm JSON-LD Schema
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.term,
    "description": term.definition,
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Indian Corporate Law Glossary",
      "url": "https://corplawupdates.in/glossary"
    },
    "url": `https://corplawupdates.in/glossary/${term.slug}`
  }

  // BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://corplawupdates.in" },
      { "@type": "ListItem", "position": 2, "name": "Glossary", "item": "https://corplawupdates.in/glossary" },
      { "@type": "ListItem", "position": 3, "name": term.term, "item": `https://corplawupdates.in/glossary/${term.slug}` }
    ]
  }

  // FAQPage JSON-LD Schema — only emit for substantial content to avoid thin-content penalties
  const faqSchema = isSubstantial ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a }
    }))
  } : null

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-slate-500 font-medium">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
          <li><span aria-hidden="true" className="mx-1">›</span></li>
          <li><Link href="/glossary" className="hover:text-gold transition-colors">Glossary</Link></li>
          <li><span aria-hidden="true" className="mx-1">›</span></li>
          <li className="text-navy font-semibold">{term.term}</li>
        </ol>
      </nav>

      {/* Main Definition Card */}
      <article className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Decorative background letter */}
        <div className="absolute top-0 right-0 p-8 opacity-5" aria-hidden="true">
          <span className="text-9xl font-heading font-bold text-slate-900 leading-none">
            {term.term.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="relative z-10">
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              {term.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-6">
            {term.term}
          </h1>
          
          <div className="prose prose-slate prose-lg max-w-none text-slate-700">
            <p className="leading-relaxed leading-8 text-base md:text-lg">
              {term.definition}
            </p>
          </div>

          <p className="text-xs text-slate-400 mt-8 text-right">
            Last updated: {new Date(term.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </article>

      {/* Extended Note Section */}
      {term.extended_note && (
        <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
          <h3 className="text-xl font-bold text-navy mb-4">Understanding {term.term}</h3>
          <p className="text-slate-600 text-base leading-relaxed leading-7">
            {term.extended_note}
          </p>
        </section>
      )}

      {/* Frequently Asked Questions (Accordion) */}
      <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
        <h2 className="text-xl font-bold text-navy mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq: { q: string; a: string }, i: number) => (
            <details key={i} className="group border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
              <summary className="font-semibold text-navy flex items-center justify-between focus:outline-none select-none list-none [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
              </summary>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed border-t border-slate-200/50 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Terms */}
      {relatedTermsData.length > 0 && (
        <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
          <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Related Terms
          </h2>
          <div className="flex flex-wrap gap-3">
            {relatedTermsData.map((related) => (
              <Link 
                key={related.slug} 
                href={`/glossary/${related.slug}`}
                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-navy hover:border-amber-400 hover:text-amber-700 hover:shadow-sm transition-all"
              >
                {related.term}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Updates */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
          <h3 className="text-xl font-bold text-navy mb-6">Related Updates</h3>
          <div className="space-y-4">
            {relatedArticles.map((article: { title: string; slug: string; published_at: string | null }) => (
              <Link 
                key={article.slug} 
                href={`/updates/${article.slug}`}
                className="block p-4 border border-slate-100 rounded-xl hover:border-amber-400 hover:bg-amber-50/20 transition-all font-medium text-navy hover:text-amber-700"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Searches (Keyword Pills) */}
      {term.keywords && term.keywords.length > 0 && (
        <section className="mt-8 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
          <h3 className="text-lg font-bold text-navy mb-4">Related Searches</h3>
          <div className="flex flex-wrap gap-2">
            {term.keywords.map((kw: string, i: number) => (
              <span key={i} className="text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">
                {kw}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* DefinedTerm JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* FAQPage JSON-LD — gated behind quality threshold */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </div>
  )
}
