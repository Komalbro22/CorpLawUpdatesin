import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  const { data: terms } = await supabase
    .from('glossary')
    .select('slug')
    .eq('is_verified', true)

  return (terms || []).map((term) => ({
    slug: term.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: term } = await supabase
    .from('glossary')
    .select('term, definition')
    .eq('slug', params.slug)
    .single()

  if (!term) {
    return { title: 'Term Not Found | CorpLawUpdates' }
  }

  return {
    title: `${term.term} — Legal Definition | CorpLawUpdates`,
    description: `${term.definition.slice(0, 160)}${term.definition.length > 160 ? '...' : ''}`,
    alternates: {
      canonical: `https://www.corplawupdates.in/glossary/${params.slug}`,
    },
  }
}

export default async function GlossaryTermPage({ params }: { params: { slug: string } }) {
  const { data: term } = await supabase
    .from('glossary')
    .select('*')
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

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.term,
    "description": term.definition,
    "inDefinedTermSet": "https://www.corplawupdates.in/glossary"
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-slate-500 font-medium">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
          <li><span aria-hidden="true" className="mx-1">›</span></li>
          <li><Link href="/glossary" className="hover:text-gold transition-colors">Glossary</Link></li>
          <li><span aria-hidden="true" className="mx-1">›</span></li>
          <li className="text-navy">{term.term}</li>
        </ol>
      </nav>

      {/* Main Definition Card */}
      <article className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
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
            <p className="leading-relaxed">
              {term.definition}
            </p>
          </div>
        </div>
      </article>

      {/* Related Terms */}
      {relatedTermsData.length > 0 && (
        <section className="mt-12">
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

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />
    </div>
  )
}
