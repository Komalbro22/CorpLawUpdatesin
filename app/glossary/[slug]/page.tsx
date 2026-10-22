import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { GLOSSARY_LINK_COLUMNS } from '@/lib/supabase-queries'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { linkGlossaryTerms } from '@/lib/glossaryLinker'
import TableOfContents from '@/components/TableOfContents'
import JsonLd from '@/components/JsonLd'
import { formatDate } from '@/lib/utils'
import { 
  BookOpen, Search, FileText, Clock, Scale, 
  Sparkles, ArrowRight 
} from 'lucide-react'
import GlossaryActions from '@/components/GlossaryActions'
import ReaderFeedback from '@/components/ReaderFeedback'
import { GlossaryPdfData } from '@/lib/pdf/generateGlossaryPdf'

export const revalidate = 86400 // Revalidate daily per Supabase egress budget

type Props = {
  params: Promise<{ slug: string }>
}

function parseMetadata(content: string) {
  const match = content.match(/^\s*<!--\s*METADATA\s*([\s\S]*?)\s*METADATA\s*-->/)
  if (match) {
    try {
      const metadata = JSON.parse(match[1])
      const cleanContent = content.substring(match[0].length).trim()
      return {
        hideDefinition: !!metadata.hide_definition,
        seoTitle: metadata.seo_title || '',
        seoDescription: metadata.seo_description || '',
        tldr: Array.isArray(metadata.tldr) ? metadata.tldr : [],
        fullForm: metadata.full_form || '',
        keyNumbers: Array.isArray(metadata.key_numbers) ? metadata.key_numbers : [],
        updatedAt: metadata.updated_at || null,
        cleanContent
      }
    } catch (e) {
      console.error('Error parsing metadata:', e)
    }
  }
  return {
    hideDefinition: false,
    seoTitle: '',
    seoDescription: '',
    tldr: [],
    fullForm: '',
    keyNumbers: [],
    updatedAt: null,
    cleanContent: content
  }
}

function getWordCount(text: string): number {
  if (!text) return 0
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!clean) return 0
  return clean.split(/\s+/).length
}

function extractFaqsFromContent(content: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = []
  if (!content) return faqs

  const regex = /<div[^>]*class="[^"]*faq-q[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*faq-a[^"]*"[^>]*>([\s\S]*?)<\/div>/gi

  let match
  while ((match = regex.exec(content)) !== null) {
    const qRaw = match[1] || ''
    const aRaw = match[2] || ''

    const q = qRaw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const a = aRaw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

    if (q && a) {
      faqs.push({ q, a })
    }
  }
  return faqs
}

const AGM_STATUTORY_RULE = "Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year; subsequent AGMs must be held within 6 months from the closing of the financial year (and not later than 15 months from the previous AGM)."

function getAgmFallbackTerm(slug: string) {
  return {
    term: 'Annual General Meeting (AGM)',
    slug: slug,
    definition: `An Annual General Meeting (AGM) is a mandatory yearly gathering of a company's shareholders and directors to review financial statements and statutory affairs. ${AGM_STATUTORY_RULE}`,
    category: 'MCA',
    keywords: ['AGM', 'Annual General Meeting', 'Section 96', 'Companies Act 2013', 'First AGM', 'Subsequent AGM', 'MCA'],
    extended_note: `<!-- METADATA {"seo_title": "AGM (Annual General Meeting) — Section 96 Rules & Timelines", "seo_description": "Under Section 96(1) of the Companies Act 2013, First AGM must be held within 9 months of FY end; subsequent AGMs within 6 months. Detailed statutory analysis."} METADATA -->

## Statutory Framework: Section 96 of Companies Act, 2013

Every company other than an One Person Company (OPC) is statutorily required to hold an Annual General Meeting in each calendar year.

### Key Statutory Requirements
- **First AGM Rule**: Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year of the company.
- **Subsequent AGMs**: Must be held within 6 months from the closing of the financial year.
- **Maximum Inter-Meeting Gap**: The interval between two consecutive AGMs must not exceed 15 months.

<div class="faq-q">What is the statutory deadline for holding the First AGM under Section 96(1)?</div>
<div class="faq-a">Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year. No extension of time can be granted by the Registrar of Companies for the first AGM.</div>

<div class="faq-q">What is the statutory timeline for subsequent AGMs?</div>
<div class="faq-a">Subsequent AGMs must be held within 6 months from the closing of the financial year and not later than 15 months from the date of the previous AGM.</div>
`,
    related_terms: ['Board Meeting', 'Extraordinary General Meeting', 'Financial Year'],
    created_at: '2024-01-01T00:00:00.000Z',
    is_verified: true,
    faqs: [
      {
        q: 'What is the statutory deadline for holding the First AGM under Section 96(1)?',
        a: 'Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year.'
      },
      {
        q: 'What is the statutory timeline for subsequent AGMs?',
        a: 'Subsequent AGMs must be held within 6 months from the closing of the financial year (and not later than 15 months from the previous AGM).'
      }
    ],
    synonyms: ['AGM', 'Annual Meeting']
  }
}

export async function generateStaticParams() {
  const { data: terms } = await supabase
    .from('glossary')
    .select('slug')
    .eq('is_verified', true)

  const slugs = (terms || []).map((term) => ({
    slug: term.slug,
  }))

  const existing = new Set(slugs.map(s => s.slug))
  if (!existing.has('agm')) slugs.push({ slug: 'agm' })
  if (!existing.has('annual-general-meeting')) slugs.push({ slug: 'annual-general-meeting' })

  return slugs
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  let { data: term } = await supabase
    .from('glossary')
    .select('term, slug, definition, category, extended_note')
    .eq('slug', slug)
    .single()

  if (slug === 'agm' || slug === 'annual-general-meeting') {
    if (!term) {
      term = getAgmFallbackTerm(slug)
    } else if (!term.definition || !term.definition.includes('within 9 months')) {
      term = {
        ...term,
        definition: term.definition ? `${term.definition.trim()} ${AGM_STATUTORY_RULE}` : AGM_STATUTORY_RULE
      }
    }
  }

  if (!term) {
    return { title: 'Term Not Found | CorpLawUpdates' }
  }

  const parsed = parseMetadata(term.extended_note || '')
  const cleanDescription = (term.definition || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  const title = parsed.seoTitle.trim()
    ? parsed.seoTitle.trim()
    : `${term.term} — Meaning, Definition | CorpLawUpdates Legal Glossary`

  const description = parsed.seoDescription.trim()
    ? parsed.seoDescription.trim()
    : `${term.term} meaning under Indian corporate law: ${cleanDescription.slice(0, 160)}. Learn key legal provisions, statutory authorities, and compliance checklists.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.corplawupdates.in/glossary/${term.slug}`,
    },
    openGraph: {
      title: `${term.term} — Legal Definition`,
      description,
      url: `https://www.corplawupdates.in/glossary/${term.slug}`,
      type: 'article',
      images: [
        {
          url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(term.term)}&category=${encodeURIComponent(term.category || 'Glossary')}`,
          width: 1200,
          height: 630,
          alt: `${term.term} — Legal Definition`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${term.term} — Legal Definition`,
      description,
      images: [`https://www.corplawupdates.in/api/og?title=${encodeURIComponent(term.term)}&category=${encodeURIComponent(term.category || 'Glossary')}`],
    },
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
  }
}

export default async function GlossaryTermPage({ params }: Props) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  // Fetch detailed term fields
  let { data: term } = await supabase
    .from('glossary')
    .select('term, slug, definition, category, keywords, extended_note, related_terms, created_at, is_verified, faqs, synonyms')
    .eq('slug', slug)
    .single()

  if (slug === 'agm' || slug === 'annual-general-meeting') {
    if (!term) {
      term = getAgmFallbackTerm(slug)
    } else if (!term.definition || !term.definition.includes('within 9 months')) {
      term = {
        ...term,
        definition: term.definition ? `${term.definition.trim()} ${AGM_STATUTORY_RULE}` : AGM_STATUTORY_RULE
      }
    }
  }

  if (!term || !term.is_verified) {
    notFound()
  }

  // Parse custom metadata block from extended_note
  const parsed = parseMetadata(term.extended_note || '')

  // Accurate Date calculation: Prefer parsed.updatedAt -> database updated_at -> created_at
  const lastUpdatedDate = parsed.updatedAt || (term as any).updated_at || term.created_at
  const formattedLastUpdated = formatDate(lastUpdatedDate)

  // Fetch all other verified terms for internal cross-linking
  const { data: allOtherTerms } = await supabase
    .from('glossary')
    .select(GLOSSARY_LINK_COLUMNS)
    .eq('is_verified', true)
    .neq('slug', (await params).slug)

  // Pass current definitions/notes through dynamic linker helper
  const processedDefinition = linkGlossaryTerms(term.definition || '', allOtherTerms || [])
  const processedExtendedNote = linkGlossaryTerms(parsed.cleanContent || '', allOtherTerms || [])

  // Fetch related terms data
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

  // Smart Matching for related circulars and updates
  const termName = term.term.trim().replace(/[%_,\\]/g, '\\$&')
  const { data: smartMatches } = await supabase
    .from('updates')
    .select('title, slug, published_at, category')
    .eq('hide_from_listings', false)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .or(`title.ilike.%${termName}%,summary.ilike.%${termName}%`)
    .order('published_at', { ascending: false })
    .limit(3)

  const { data: categoryMatches } = await supabase
    .from('updates')
    .select('title, slug, published_at, category')
    .eq('hide_from_listings', false)
    .ilike('category', term.category)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(5)

  const relatedArticles = [...(smartMatches || [])]
  if (categoryMatches) {
    for (const art of categoryMatches) {
      if (relatedArticles.length >= 3) break
      if (!relatedArticles.some(a => a.slug === art.slug)) {
        relatedArticles.push(art)
      }
    }
  }

  const isAcronym = /^[A-Z]{2,8}$/.test(term.term) || 
                    /^[A-Z][A-Z0-9\-]{1,7}$/.test(term.term)

  const categoryContext: Record<string, string> = {
    'MCA': 'governed by the Ministry of Corporate Affairs under the Companies Act, 2013',
    'SEBI': 'regulated by the Securities and Exchange Board of India under applicable SEBI regulations',
    'RBI': 'governed by the Reserve Bank of India under applicable banking and monetary policy frameworks',
    'NCLT': 'adjudicated by the National Company Law Tribunal under the Companies Act, 2013 or IBC',
    'IBC': 'governed by the Insolvency and Bankruptcy Code, 2016 and regulated by IBBI',
    'FEMA': 'governed by the Foreign Exchange Management Act, 1999 and regulated by RBI',
    'CCI': 'governed by the Competition Commission of India under the Competition Act, 2002',
    'LABOUR': 'governed by the Ministry of Labour & Employment under the Indian Labour Codes and statutory provisions',
    'IFSCA': 'governed by the International Financial Services Centres Authority under the IFSCA Act, 2019 and GIFT City regulations',
  }
  const ctx = categoryContext[term.category] || `regulated under Indian ${term.category} law`

  // Compile FAQs
  const hasInlineFaqs = extractFaqsFromContent(term.definition || '').length > 0 || extractFaqsFromContent(term.extended_note || '').length > 0

  let faqsList: { q: string; a: string }[] = [
    ...extractFaqsFromContent(term.definition || ''),
    ...extractFaqsFromContent(term.extended_note || '')
  ]

  if (faqsList.length === 0 && term.faqs && Array.isArray(term.faqs) && term.faqs.length > 0) {
    faqsList = term.faqs
      .map((f: { q?: string; question?: string; a?: string; answer?: string }) => ({
        q: f.q || f.question || '',
        a: f.a || f.answer || ''
      }))
      .filter((f: { q: string; a: string }) => f.q.trim() && f.a.trim())
  }

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

  // Category Branding Colors
  const cat = term.category?.toUpperCase() || 'DEFAULT'
  let themeStyles = {
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
    borderLeftColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    headerGlow: 'from-amber-500/10 via-amber-400/5 to-transparent'
  }

  if (cat === 'SEBI') {
    themeStyles = {
      badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
      borderLeftColor: 'border-l-emerald-500',
      iconColor: 'text-emerald-500',
      headerGlow: 'from-emerald-500/10 via-emerald-400/5 to-transparent'
    }
  } else if (cat === 'MCA') {
    themeStyles = {
      badgeBg: 'bg-blue-50 text-blue-900 border-blue-200/80',
      borderLeftColor: 'border-l-blue-500',
      iconColor: 'text-blue-500',
      headerGlow: 'from-blue-500/10 via-blue-400/5 to-transparent'
    }
  } else if (cat === 'RBI') {
    themeStyles = {
      badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200/80',
      borderLeftColor: 'border-l-indigo-500',
      iconColor: 'text-indigo-500',
      headerGlow: 'from-indigo-500/10 via-indigo-400/5 to-transparent'
    }
  } else if (cat === 'NCLT') {
    themeStyles = {
      badgeBg: 'bg-orange-50 text-orange-900 border-orange-200/80',
      borderLeftColor: 'border-l-orange-500',
      iconColor: 'text-orange-500',
      headerGlow: 'from-orange-500/10 via-orange-400/5 to-transparent'
    }
  } else if (cat === 'IBC') {
    themeStyles = {
      badgeBg: 'bg-rose-50 text-rose-900 border-rose-200/80',
      borderLeftColor: 'border-l-rose-500',
      iconColor: 'text-rose-500',
      headerGlow: 'from-rose-500/10 via-rose-400/5 to-transparent'
    }
  } else if (cat === 'FEMA') {
    themeStyles = {
      badgeBg: 'bg-teal-50 text-teal-900 border-teal-200/80',
      borderLeftColor: 'border-l-teal-500',
      iconColor: 'text-teal-500',
      headerGlow: 'from-teal-500/10 via-teal-400/5 to-transparent'
    }
  }

  // Dynamic reading time
  const definitionWords = getWordCount(term.definition || '')
  const extendedNoteWords = getWordCount(parsed.cleanContent || '')
  const totalWords = definitionWords + extendedNoteWords
  const readingTime = Math.max(1, Math.round(totalWords / 200))

  // Consolidated content outline for Table of Contents
  const combinedContent = `
${!parsed.hideDefinition ? '## Statutory Definition' : ''}
${parsed.tldr && parsed.tldr.length > 0 ? '## Executive Takeaways' : ''}
${parsed.keyNumbers && parsed.keyNumbers.length > 0 ? '## Key Numbers at a Glance' : ''}
${term.extended_note && parsed.cleanContent ? `## Understanding ${term.term}\n${parsed.cleanContent}` : ''}
${!hasInlineFaqs && faqsList.length > 0 ? `## Frequently Asked Questions (FAQs)` : ''}
${relatedTermsData.length > 0 ? `## Related Statutory Terms` : ''}
${relatedArticles && relatedArticles.length > 0 ? `## Contextual Analysis & Regulatory Circulars` : ''}
${term.keywords && term.keywords.length > 0 ? `## Related Searches` : ''}
  `

  const canonicalUrl = `https://www.corplawupdates.in/glossary/${term.slug}`

  // PDF Export Payload
  const pdfData: GlossaryPdfData = {
    term: term.term,
    slug: term.slug,
    category: term.category,
    fullForm: parsed.fullForm,
    synonyms: term.synonyms || [],
    definition: term.definition || '',
    tldr: parsed.tldr,
    keyNumbers: parsed.keyNumbers,
    cleanContent: parsed.cleanContent,
    faqs: faqsList,
    lastUpdated: formattedLastUpdated
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Table of Contents: Floating in Right Margin on Desktop (min-[1480px]), Collapsible Button on Mobile */}
      {combinedContent && <TableOfContents content={combinedContent} />}

      {/* CENTERED MAIN CONTENT CONTAINER */}
      <main className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 overflow-x-hidden">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 print:hidden min-w-0" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link href="/glossary" className="hover:text-amber-600 transition-colors">Glossary</Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[170px] xs:max-w-[220px] sm:max-w-md">{term.term}</span>
        </nav>

        {/* HERO EXECUTIVE MASTHEAD (Centered) */}
        <header className="mb-8 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-96 h-96 bg-linear-to-br ${themeStyles.headerGlow} rounded-full blur-3xl pointer-events-none -mr-20 -mt-20`} />

          <div className="relative z-10">
            {/* Meta tags & timestamps */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${themeStyles.badgeBg} border`}>
                  {term.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {readingTime} min read
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Statutory Term
                </span>
              </div>

              {/* Exact Accurate Date from Metadata / Updates */}
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>Last updated:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200" suppressHydrationWarning>
                  {formattedLastUpdated}
                </span>
              </div>
            </div>

            {/* Term Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-navy dark:text-slate-50 tracking-tight mb-3 break-words text-balance">
              {term.term}
            </h1>

            {/* Full Form Pill / Callout */}
            {parsed.fullForm && (
              <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 sm:px-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700 max-w-full">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Full Form:</span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 break-words">{parsed.fullForm}</span>
              </div>
            )}

            {/* Acronyms & Synonyms */}
            {term.synonyms && term.synonyms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Acronyms / Synonyms:</span>
                {term.synonyms.map((syn: string) => (
                  <span key={syn} className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700">
                    {syn}
                  </span>
                ))}
              </div>
            )}

            {/* Direct Down Action Toolbar: PDF Dossier, Copy, WhatsApp, LinkedIn, Save, Feedback */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full">
              <GlossaryActions data={pdfData} url={canonicalUrl} compact={true} />
            </div>
          </div>
        </header>

        {/* CENTERED ARTICLE CONTENT */}
        <article id="article-root" className="article-content space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden break-words">
          
          {/* 1. STATUTORY DEFINITION CARD */}
          {!parsed.hideDefinition && (
            <section id="statutory-definition" className={`bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden border-l-4 md:border-l-[5px] ${themeStyles.borderLeftColor}`}>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none" aria-hidden="true">
                <span className="text-9xl font-heading font-bold text-slate-900 dark:text-white leading-none">
                  {term.term.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold text-navy dark:text-slate-50 mb-4 flex items-center gap-2 font-heading">
                  <Scale className={`h-5 w-5 ${themeStyles.iconColor}`} />
                  <span>Statutory Meaning &amp; Definition</span>
                </h2>
                
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg font-serif italic border-l-2 border-slate-200 dark:border-slate-700 pl-3 sm:pl-4 py-1 my-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-r-xl break-words">
                  <MarkdownRenderer content={processedDefinition} />
                </div>
              </div>
            </section>
          )}

          {/* 2. EXECUTIVE TAKEAWAYS CARD */}
          {parsed.tldr && parsed.tldr.length > 0 && (
            <section id="executive-takeaways" className="bg-linear-to-br from-amber-50/70 via-amber-50/30 to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 border border-amber-200/80 dark:border-amber-900/50 shadow-xs relative overflow-hidden break-words">
              <div className="absolute top-0 right-0 p-8 opacity-[0.06] select-none pointer-events-none" aria-hidden="true">
                <FileText className="text-6xl text-amber-500" />
              </div>
              
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-navy dark:text-slate-50 mb-4 sm:mb-5 flex items-center gap-2.5 font-heading">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <span>Executive Takeaways</span>
              </h2>

              <ul className="space-y-3 sm:space-y-3.5">
                {parsed.tldr.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 sm:gap-3 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed break-words">
                    <span className="text-amber-500 font-bold select-none pt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3. STRUCTURED KEY NUMBERS CARD */}
          {parsed.keyNumbers && parsed.keyNumbers.length > 0 && !processedExtendedNote.includes('num-card') && !processedExtendedNote.includes('Key Numbers at a Glance') && (
            <section id="key-numbers-at-a-glance" className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs border-l-4 ${themeStyles.borderLeftColor} break-words`}>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-navy dark:text-slate-50 mb-4 sm:mb-5 flex items-center gap-2 font-heading">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <span>Key Numbers at a Glance</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                {parsed.keyNumbers.map((kn: { label?: string; value?: string; detail?: string }, idx: number) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-navy dark:text-amber-400 font-heading tabular-nums break-words">{kn.value}</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 break-words">{kn.label}</div>
                    {kn.detail && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug break-words">{kn.detail}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. EXTENDED STATUTORY COMMENTARY & ANALYSIS */}
          {term.extended_note && parsed.cleanContent && (
            <section id={`understanding-${term.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xs border-l-4 ${themeStyles.borderLeftColor} break-words overflow-x-hidden`}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy dark:text-slate-50 mb-5 sm:mb-6 flex items-center gap-2.5 font-heading">
                <BookOpen className={`h-5 w-5 sm:h-6 sm:w-6 ${themeStyles.iconColor}`} aria-hidden />
                <span>Understanding {term.term}</span>
              </h2>
              
              {/* Partial-HTML styled content with full responsiveness */}
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-navy dark:prose-headings:text-slate-100 prose-p:leading-relaxed prose-li:leading-relaxed text-slate-800 dark:text-slate-200 w-full overflow-x-hidden break-words">
                <MarkdownRenderer content={processedExtendedNote} />
              </div>
            </section>
          )}

          {/* 5. FREQUENTLY ASKED QUESTIONS */}
          {faqsList.length > 0 && (
            <section id="frequently-asked-questions-faqs" className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs break-words">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-navy dark:text-slate-50 mb-5 sm:mb-6 flex items-center gap-2.5 font-heading">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <span>Frequently Asked Questions (FAQs)</span>
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {faqsList.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-5 bg-slate-50/50 dark:bg-slate-800/40">
                    <h3 className="font-bold text-navy dark:text-slate-100 text-sm sm:text-base mb-1.5 sm:mb-2 break-words">
                      {faq.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. CONTEXTUAL ANALYSIS & RELATED REGULATORY CIRCULARS */}
          {relatedArticles && relatedArticles.length > 0 && (
            <section id="contextual-analysis-regulatory-updates" className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs break-words">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-navy dark:text-slate-50 mb-2 flex items-center gap-2.5 font-heading">
                <FileText className={`h-5 w-5 sm:h-6 sm:w-6 ${themeStyles.iconColor}`} aria-hidden />
                <span>Contextual Analysis &amp; Regulatory Circulars</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Recent analysis and regulatory updates related to <strong>{term.category}</strong>:
              </p>
              <div className="space-y-2.5 sm:space-y-3.5">
                {relatedArticles.map((article: { title: string; slug: string; published_at: string }) => (
                  <Link 
                    key={article.slug} 
                    href={`/updates/${article.slug}`}
                    className="group flex items-center justify-between p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-800/40 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 hover:border-amber-400 transition-all duration-150 gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors text-xs sm:text-base leading-snug break-words">
                        {article.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1" suppressHydrationWarning>
                        Published: {formatDate(article.published_at)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 7. RELATED STATUTORY TERMS */}
          {relatedTermsData.length > 0 && (
            <section id="related-statutory-terms" className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs break-words">
              <h2 className="text-lg sm:text-xl font-bold text-navy dark:text-slate-50 mb-3 sm:mb-4 flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span>Related Statutory Terms</span>
              </h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {relatedTermsData.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/glossary/${rel.slug}`}
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 hover:text-amber-700 text-xs sm:text-sm font-semibold border border-slate-200/80 dark:border-slate-700 hover:border-amber-300 transition-all break-words"
                  >
                    {rel.term} &rarr;
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 8. RELATED SEARCHES */}
          {term.keywords && term.keywords.length > 0 && (
            <section id="related-searches" className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs break-words">
              <h2 className="text-lg sm:text-xl font-bold text-navy dark:text-slate-50 mb-3 sm:mb-4 flex items-center gap-2 font-heading">
                <Search className={`h-4 w-4 sm:h-5 sm:w-5 ${themeStyles.iconColor}`} />
                <span>Related Searches</span>
              </h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                      className="text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80 dark:border-slate-700 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-medium transition-all break-words"
                    >
                      {kw.trim()}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* 9. READER FEEDBACK WIDGET */}
          <div id="reader-feedback" className="pt-4">
            <ReaderFeedback 
              contextType="glossary" 
              contextTitle={term.term} 
              contextUrl={canonicalUrl} 
            />
          </div>

        </article>

        <div id="article-end" className="h-4" />

        {/* Schema.org High-Performance AI SEO JSON-LD */}
        {(() => {
          const plainTextTldr = parsed.tldr ? parsed.tldr.join(' ').replace(/"/g, '\\"') : ''
          const cleanDescription = (term.definition || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

          const unifiedSchema = {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': `${canonicalUrl}#webpage`,
                'url': canonicalUrl,
                'name': `${term.term} — Legal Definition & Key Takeaways`,
                'description': cleanDescription,
                'abstract': plainTextTldr || undefined,
                'breadcrumb': { '@id': `${canonicalUrl}#breadcrumb` },
                'mainEntity': { '@id': `${canonicalUrl}#defined-term` }
              },
              {
                '@type': 'DefinedTerm',
                '@id': `${canonicalUrl}#defined-term`,
                'name': term.term,
                'description': cleanDescription,
                'inDefinedTermSet': {
                  '@type': 'DefinedTermSet',
                  'name': 'Indian Corporate Law Glossary',
                  'url': 'https://www.corplawupdates.in/glossary'
                },
                'url': canonicalUrl
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${canonicalUrl}#breadcrumb`,
                'itemListElement': [
                  { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.corplawupdates.in' },
                  { '@type': 'ListItem', 'position': 2, 'name': 'Glossary', 'item': 'https://www.corplawupdates.in/glossary' },
                  { '@type': 'ListItem', 'position': 3, 'name': term.term, 'item': canonicalUrl }
                ]
              },
              ...(faqsList.length > 0 ? [{
                '@type': 'FAQPage',
                '@id': `${canonicalUrl}#faq`,
                'mainEntity': faqsList.map((faq) => ({
                  '@type': 'Question',
                  'name': faq.q,
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.a
                  }
                }))
              }] : [])
            ]
          }

          return (
            <JsonLd id={`glossary-term-schema-${term.slug}`} data={unifiedSchema} />
          )
        })()}
      </main>
    </div>
  )
}
