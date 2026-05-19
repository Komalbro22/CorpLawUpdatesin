import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { linkGlossaryTerms } from '@/lib/glossaryLinker'
import TableOfContents from '@/components/TableOfContents'
import { BookOpen, Link2, Search, FileText, HelpCircle } from 'lucide-react'

export const revalidate = 0 // Revalidate immediately (instant updates)

type Props = {
  params: { slug: string }
}

function getWordCount(text: string): number {
  if (!text) return 0
  // Strip HTML tags to get pure word count
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!clean) return 0
  return clean.split(/\s+/).length
}
function extractFaqsFromContent(content: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  if (!content) return faqs;

  // Flexible regex to match <div class="faq-q">Question</div> followed by <div class="faq-a">Answer</div>
  // Handles styling/attributes and extra spaces or comments seamlessly
  const regex = /<div[^>]*class="[^"]*faq-q[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*faq-a[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const qRaw = match[1] || '';
    const aRaw = match[2] || '';

    // Strip HTML tags inside question and answer to get clean text for Google Schema
    const q = qRaw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const a = aRaw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    if (q && a) {
      faqs.push({ q, a });
    }
  }
  return faqs;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: term } = await supabase
    .from('glossary')
    .select('term, slug, definition, extended_note')
    .eq('slug', params.slug)
    .single()

  if (!term) {
    return { title: 'Term Not Found | CorpLawUpdates' }
  }

  const totalWords = getWordCount(term.definition || '') + getWordCount(term.extended_note || '')
  const isThin = totalWords < 300

  // Strip HTML for clean SEO description
  const cleanDescription = (term.definition || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  return {
    title: `${term.term} — Meaning, Definition | CorpLawUpdates Legal Glossary`,
    description: `${term.term} meaning under Indian corporate law: ${cleanDescription.slice(0, 160)}. Learn key legal provisions, statutory authorities, and compliance checklists.`,
    alternates: {
      canonical: `https://corplawupdates.in/glossary/${term.slug}`,
    },
    openGraph: {
      title: `${term.term} — Legal Definition`,
      description: cleanDescription.slice(0, 160),
      url: `https://corplawupdates.in/glossary/${term.slug}`,
    },
    // Thin glossary pages (< 300 words) get noindex to protect domain authority
    ...(isThin ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function GlossaryTermPage({ params }: Props) {
  // Fetch detailed term fields including faqs and synonyms
  const { data: term } = await supabase
    .from('glossary')
    .select('term, slug, definition, category, keywords, extended_note, related_terms, created_at, is_verified, faqs, synonyms')
    .eq('slug', params.slug)
    .single()

  if (!term || !term.is_verified) {
    notFound()
  }

  // Fetch all other verified terms for internal cross-linking (excludes this term to prevent self-linking)
  const { data: allOtherTerms } = await supabase
    .from('glossary')
    .select('term, slug')
    .eq('is_verified', true)
    .neq('slug', params.slug)

  // Pass current definitions/notes through the dynamic linker helper
  const processedDefinition = linkGlossaryTerms(term.definition || '', allOtherTerms || [])
  const processedExtendedNote = linkGlossaryTerms(term.extended_note || '', allOtherTerms || [])

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

  // Compile FAQs: 
  // 1. Try to extract from HTML-embedded structures inside definition and extended_note first
  const hasInlineFaqs = extractFaqsFromContent(term.definition || '').length > 0 || extractFaqsFromContent(term.extended_note || '').length > 0

  let faqsList: { q: string; a: string }[] = [
    ...extractFaqsFromContent(term.definition || ''),
    ...extractFaqsFromContent(term.extended_note || '')
  ]

  // 2. Fall back to manual database-entered FAQs if no HTML ones were parsed
  if (faqsList.length === 0 && term.faqs && Array.isArray(term.faqs) && term.faqs.length > 0) {
    faqsList = term.faqs
      .map((f: { q?: string; question?: string; a?: string; answer?: string }) => ({
        q: f.q || f.question || '',
        a: f.a || f.answer || ''
      }))
      .filter((f: { q: string; a: string }) => f.q.trim() && f.a.trim())
  }

  // 3. Fall back to auto-generated baseline ones if still empty
  if (faqsList.length === 0) {
    const cleanDef = (term.definition || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    faqsList = [
      {
        q: `What is ${term.term} in Indian corporate law?`,
        a: cleanDef
      },
      {
        q: `Why is ${term.term} important for compliance?`,
        a: `${term.term} is ${ctx}. Understanding this concept is essential for ensuring regulatory compliance, avoiding penalties, and making informed corporate decisions in India.`
      },
      ...(isAcronym ? [{
        q: `What is the full form of ${term.term}?`,
        a: cleanDef.split('—')[0]?.trim() + ' — that is the full form of ' + term.term + '.'
      }] : [{
        q: `Who should know about ${term.term}?`,
        a: `${term.term} is relevant for company secretaries, compliance officers, chartered accountants, corporate lawyers, board members, and all professionals dealing with ${term.category} regulatory matters in India.`
      }])
    ]
  }

  // DefinedTerm JSON-LD Schema
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.term,
    "description": (term.definition || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
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

  // FAQPage JSON-LD Schema — always emit if we have FAQs to maximize Google rich results appearance
  const faqSchema = faqsList.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsList.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a }
    }))
  } : null

   // Dynamic category branding colors for cards
  const cat = term.category?.toUpperCase() || 'DEFAULT';
  let themeStyles = {
    borderColor: 'border-slate-200/60',
    borderLeftColor: 'border-l-gold',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/50',
    iconColor: 'text-amber-500',
    titleColor: 'text-navy',
  };

  if (cat === 'SEBI') {
    themeStyles = {
      borderColor: 'border-emerald-100',
      borderLeftColor: 'border-l-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
      iconColor: 'text-emerald-500',
      titleColor: 'text-emerald-900',
    };
  } else if (cat === 'MCA') {
    themeStyles = {
      borderColor: 'border-blue-100',
      borderLeftColor: 'border-l-blue-500',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200/50',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
    };
  } else if (cat === 'RBI') {
    themeStyles = {
      borderColor: 'border-violet-100',
      borderLeftColor: 'border-l-violet-500',
      badgeBg: 'bg-violet-50 text-violet-800 border-violet-200/50',
      iconColor: 'text-violet-500',
      titleColor: 'text-violet-900',
    };
  } else if (cat === 'NCLT') {
    themeStyles = {
      borderColor: 'border-orange-100',
      borderLeftColor: 'border-l-orange-500',
      badgeBg: 'bg-orange-50 text-orange-850 border-orange-200/50',
      iconColor: 'text-orange-500',
      titleColor: 'text-orange-900',
    };
  } else if (cat === 'IBC') {
    themeStyles = {
      borderColor: 'border-red-100',
      borderLeftColor: 'border-l-red-500',
      badgeBg: 'bg-red-50 text-red-850 border-red-200/50',
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
    };
  } else if (cat === 'FEMA') {
    themeStyles = {
      borderColor: 'border-teal-100',
      borderLeftColor: 'border-l-teal-500',
      badgeBg: 'bg-teal-50 text-teal-855 border-teal-200/50',
      iconColor: 'text-teal-500',
      titleColor: 'text-teal-900',
    };
  }

  // Consolidated content outline for Table of Contents sidebar extraction
  const combinedContent = `
## Definition
${term.definition || ''}

${term.extended_note ? `## Understanding ${term.term}\n${term.extended_note}` : ''}

${!hasInlineFaqs && faqsList.length > 0 ? `## Frequently Asked Questions (FAQs)` : ''}

${relatedTermsData.length > 0 ? `## Related Terms` : ''}
${relatedArticles && relatedArticles.length > 0 ? `## Contextual Analysis & Regulatory Updates` : ''}
${term.keywords && term.keywords.length > 0 ? `## Related Searches` : ''}
  `

  return (
    <article
      id="article-root"
      className="article-font-md mx-auto w-full max-w-4xl px-4 py-8 sm:py-12"
    >
      {/* Breadcrumb */}
      <nav className="mb-7 flex flex-wrap items-center gap-1.5 text-sm text-slate-400 print:hidden" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <span className="text-slate-300">/</span>
        <Link href="/glossary" className="hover:text-gold transition-colors">Glossary</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 font-semibold">{term.term}</span>
      </nav>

      {/* Table of Contents Sticky Sidebar */}
      {combinedContent && <TableOfContents content={combinedContent} />}

      <div className="article-content space-y-8">
        
        {/* Main Definition Card */}
        <section id="definition" className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm relative overflow-hidden border-l-[4px] md:border-l-[5px] ${themeStyles.borderLeftColor}`}>
          {/* Decorative background letter */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none" aria-hidden="true">
            <span className="text-9xl font-heading font-bold text-slate-900 leading-none">
              {term.term.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${themeStyles.badgeBg} border`}>
                {term.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-6">
              {term.term}
            </h1>
            
            {/* Dynamically cross-linked definition */}
            <div className="text-slate-700">
              <MarkdownRenderer content={processedDefinition} />
            </div>

            {term.synonyms && term.synonyms.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1.5">Acronyms / Synonyms:</span>
                {term.synonyms.map((syn: string) => (
                  <span key={syn} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-100">
                    {syn}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-400 mt-8 text-right font-medium">
              Last updated: {new Date(term.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Extended Note Section */}
        {term.extended_note && (
          <section id={`understanding-${term.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm border-l-[4px] ${themeStyles.borderLeftColor}`}>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2.5 font-heading">
              <BookOpen className={`h-6 w-6 ${themeStyles.iconColor}`} aria-hidden />
              Understanding {term.term}
            </h2>
            <div className="text-slate-600">
              <MarkdownRenderer content={processedExtendedNote} />
            </div>
          </section>
        )}

        {/* Frequently Asked Questions (FAQ) Section - Only if not already inline in the text */}
        {!hasInlineFaqs && faqsList.length > 0 && (
          <section id="frequently-asked-questions-faqs" className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm border-l-[4px] ${themeStyles.borderLeftColor}`}>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2.5 font-heading">
              <HelpCircle className={`h-6 w-6 ${themeStyles.iconColor}`} aria-hidden />
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              {faqsList.map((faq, index) => (
                <details 
                  key={index}
                  className="group border border-slate-105 rounded-xl bg-slate-50/50 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex justify-between items-center p-4 font-bold text-navy hover:text-amber-700 cursor-pointer list-none select-none transition-colors duration-150">
                    <span className="pr-4 text-sm sm:text-base leading-snug">
                      Q{index + 1}. {faq.q}
                    </span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 text-lg shrink-0">
                      ▼
                    </span>
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-white rounded-b-xl">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Terms */}
        {relatedTermsData.length > 0 && (
          <section id="related-terms" className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm border-l-[4px] ${themeStyles.borderLeftColor}`}>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2.5 font-heading">
              <Link2 className={`h-6 w-6 ${themeStyles.iconColor}`} aria-hidden />
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

        {/* Contextual Analysis & Related Updates */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section id="contextual-analysis-regulatory-updates" className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm border-l-[4px] ${themeStyles.borderLeftColor}`}>
            <h2 className="text-2xl font-bold text-navy mb-4 flex items-center gap-2.5 font-heading">
              <FileText className={`h-6 w-6 ${themeStyles.iconColor}`} aria-hidden />
              Contextual Analysis & Regulatory Updates
            </h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">
              Read our latest analysis and critical updates on corporate circulars related to <strong>{term.category}</strong>:
            </p>
            <div className="space-y-4">
              {relatedArticles.map((article: { title: string; slug: string; published_at: string }) => (
                <Link 
                  key={article.slug} 
                  href={`/updates/${article.slug}`}
                  className="group block p-5 border border-slate-100 rounded-2xl bg-slate-50/30 hover:bg-amber-50/10 hover:border-amber-400/60 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-navy group-hover:text-amber-700 transition-colors duration-150 leading-snug">
                        {article.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        Published: {new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-200 text-xl font-light">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Searches */}
        {term.keywords && term.keywords.length > 0 && (
          <section id="related-searches" className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm border-l-[4px] ${themeStyles.borderLeftColor}`}>
            <h2 className="text-2xl font-bold text-navy mb-4 flex items-center gap-2.5 font-heading">
              <Search className={`h-6 w-6 ${themeStyles.iconColor}`} aria-hidden />
              Related Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {term.keywords.map((kw: string, i: number) => {
                const matchedTerm = allOtherTerms?.find(
                  (ot) => ot.term.toLowerCase() === kw.trim().toLowerCase()
                )

                const linkUrl = matchedTerm 
                  ? `/glossary/${matchedTerm.slug}` 
                  : `/updates?search=${encodeURIComponent(kw.trim())}`

                return (
                  <Link
                    key={i}
                    href={linkUrl}
                    className="text-sm bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-slate-200/60 px-4 py-2 rounded-full font-medium transition-all shadow-sm flex items-center gap-1 group"
                  >
                    <span>{kw.trim()}</span>
                    <span className="text-slate-400 group-hover:text-amber-600 transition-colors text-xs">↗</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

      </div>

      <div id="article-end" className="h-4" />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </article>
  )
}
