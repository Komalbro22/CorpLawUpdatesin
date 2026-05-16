import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import GlossaryClient from '@/components/GlossaryClient'

export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'Legal Glossary — IBC, SEBI, MCA, RBI, FEMA | CorpLawUpdates',
  description: 'Plain-language definitions of Indian corporate law terms covering IBC, SEBI, MCA, RBI, and FEMA for CS professionals and compliance officers.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/glossary',
  },
}

const glossarySchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "Indian Corporate Law Glossary",
  "url": "https://www.corplawupdates.in/glossary",
  "description": "Definitions of Indian corporate law and compliance terms.",
}

export default async function GlossaryHubPage() {
  const { data: terms, error } = await supabase
    .from('glossary')
    .select('id, term, slug, definition, category')
    .eq('is_verified', true)
    .order('term')

  if (error) {
    console.error('Error fetching glossary terms:', error)
  }

  return (
    <>
      <div className="bg-navy py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
          Legal Glossary
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
          Plain-English definitions of complex corporate law terms, covering MCA, SEBI, RBI, and IBC.
        </p>
      </div>

      <GlossaryClient terms={terms || []} />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }}
      />
    </>
  )
}
