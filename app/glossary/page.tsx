import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { GLOSSARY_INDEX_COLUMNS } from '@/lib/supabase-queries'
import GlossaryClient from '@/components/GlossaryClient'

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
      <div className="bg-navy py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
          Legal Glossary — Indian Corporate Law Terms
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
          {termCount}+ definitions for CS, CA, CMA professionals and law students
        </p>
      </div>

      <GlossaryClient terms={terms || []} />

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
