import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { GLOSSARY_INDEX_COLUMNS } from '@/lib/supabase-queries'
import GlossaryClient from '@/components/GlossaryClient'
import HubExploreLinks from '@/components/HubExploreLinks'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Legal Glossary — Indian Corporate Law Terms | CorpLawUpdates',
  description: 'Plain-language definitions of 200+ Indian corporate law terms covering IBC, CIRP, SEBI, MCA, RBI, and FEMA — simplified for professionals, CA, CMA, and law students.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/glossary',
  },
  openGraph: {
    title: 'Legal Glossary — Indian Corporate Law Terms',
    description: 'Definitions of IBC, SEBI, MCA, RBI, FEMA terms for professionals.',
    url: 'https://www.corplawupdates.in/glossary',
    type: 'website',
  },
}

export default async function GlossaryHubPage() {
  const { data: terms, error } = await supabase
    .from('glossary')
    .select(GLOSSARY_INDEX_COLUMNS)
    .eq('is_verified', true)
    .order('term')

  if (error) {
    console.error('Error fetching glossary terms:', error)
  }

  const termCount = terms?.length || 0

  const glossarySchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Indian Corporate Law Glossary",
    "description": "Definitions of IBC, SEBI, MCA, RBI, FEMA, and NCLT terms for compliance professionals",
    "url": "https://www.corplawupdates.in/glossary",
    "inLanguage": "en-IN"
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.corplawupdates.in" },
      { "@type": "ListItem", "position": 2, "name": "Glossary", "item": "https://www.corplawupdates.in/glossary" }
    ]
  }

  return (
    <>
      <main id="main-content">
        <div className="bg-navy py-14 px-4 text-center border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300 mb-3">
              Statutory Reference & Definitions
            </p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight">
              Legal Glossary — Indian Corporate Law Terms
            </h1>
            <p className="text-slate-200 max-w-2xl mx-auto text-base md:text-lg font-normal">
              {termCount}+ plain-language definitions for CS, CA, CMA professionals and law students.
            </p>
          </div>
        </div>

        <GlossaryClient terms={terms || []} />

        <div className="max-w-7xl mx-auto px-4 pb-12">
          <HubExploreLinks
            title="Related Resources"
            links={[
              { href: '/updates', label: 'Latest Updates', desc: 'Daily regulatory briefs' },
              { href: '/category', label: 'Browse by Regulator', desc: 'MCA, SEBI, RBI & more' },
              { href: '/tools', label: 'Compliance Tools', desc: 'Calculators & generators' },
              { href: '/tools/cin-decoder', label: 'CIN Decoder', desc: 'Decode company CINs' },
              { href: '/editorial-policy', label: 'Editorial Policy', desc: 'How we verify content' },
            ]}
          />
        </div>
      </main>

      {/* DefinedTermSet JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }}
      />

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
