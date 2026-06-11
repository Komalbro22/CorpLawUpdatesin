import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseDocuments } from '@/lib/supabase-documents'
import DocumentIntentSearch from '@/components/documents/DocumentIntentSearch'
import { formatTemplateSource } from '@/lib/document-clause-checker'

export const metadata: Metadata = {
  title: 'Free Legal Document Generator India — Board Resolutions, Agreements | CorpLawUpdates.in',
  description: 'Generate legally accurate Indian company documents free. Board resolutions, MOA, director appointments, lease agreements — powered by AI. Updated to latest MCA/ICSI formats.',
  keywords: ['legal document generator', 'free board resolution generator', 'draft lease agreement india', 'online rent agreement format', 'mca compliance documents'],
  alternates: {
    canonical: 'https://www.corplawupdates.in/documents',
  },
}

export const revalidate = 3600

const categoryConfig = {
  board_resolution: {
    label: 'Board Resolutions',
    icon: '🏛️',
    color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300',
    description: 'Certified true copies per ICSI Secretarial Standards'
  },
  commercial_contracts: {
    label: 'Commercial Contracts & Deeds',
    icon: '📑',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/50 dark:text-indigo-300',
    description: 'Partnership deeds, power of attorney, SLAs, joint venture agreements'
  },
  appointments: {
    label: 'Appointment Letters',
    icon: '📄',
    color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300',
    description: 'Director, KMP, CS appointment letters'
  },
  company_drafts: {
    label: 'Company Drafts',
    icon: '🏢',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-950/30 dark:border-cyan-900/50 dark:text-cyan-300',
    description: 'Share transfers, MOA amendments, statutory registers'
  },
  shareholders_meeting: {
    label: 'Shareholders Meeting',
    icon: '👥',
    color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-300',
    description: 'AGM/EGM notices, minutes, resolutions'
  },
  agreements: {
    label: 'Agreements',
    icon: '🤝',
    color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-900/50 dark:text-purple-300',
    description: 'Employment, NDA, service agreements'
  },
  mca_forms: {
    label: 'MCA Form Guides',
    icon: '📋',
    color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300',
    description: 'MGT-7, AOC-4, DIR forms'
  },
  notices: {
    label: 'Notices',
    icon: '📢',
    color: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/30 dark:border-teal-900/50 dark:text-teal-300',
    description: 'Board meeting, AGM, EGM notices'
  },
}

export default async function DocumentsPage() {
  let templates: any[] = []
  if (supabaseDocuments) {
    const { data } = await supabaseDocuments
      .from('document_templates')
      .select('id, name, slug, description, category, source, last_verified, is_free, usage_count, tags')
      .eq('is_active', true)
      .order('display_order')
    templates = data || []
  }

  // Group by category
  const grouped = (templates || []).reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = []
      acc[t.category].push(t)
      return acc
    },
    {} as Record<string, any[]>
  )

  const totalDocs = templates?.length || 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Hero */}
      <div className="bg-navy py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 
                          bg-amber-400/20 text-amber-400 
                          text-xs font-bold px-3 py-1.5 
                          rounded-full mb-6 
                          uppercase tracking-wide">
            ✨ AI Powered · Free · Updated to Latest MCA Format
          </div>
          <h1 className="text-4xl md:text-5xl 
                         font-heading font-bold 
                         text-white mb-4 
                         leading-tight">
            Legal Document Generator
          </h1>
          <p className="text-slate-400 text-lg mb-8 
                        max-w-2xl mx-auto">
            Generate legally accurate Indian company 
            documents in seconds. Powered by AI. 
            Based on ICSI Secretarial Standards 
            and Companies Act 2013.
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-8 
                          mb-8 flex-wrap">
            {[
              { v: `${totalDocs}+`, l: 'Document Types' },
              { v: 'ICSI SS-1', l: 'Standard Format' },
              { v: 'Free', l: 'Always' },
              { v: 'AI', l: 'Powered' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-bold 
                                text-amber-400">{s.v}</div>
                <div className="text-slate-400 text-xs">
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* AI Intent Search */}
          <DocumentIntentSearch />

        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/15 border-b 
                      border-amber-200 dark:border-amber-900/35 py-3 px-4">
        <p className="text-amber-800 dark:text-amber-300 text-xs 
                      text-center max-w-3xl mx-auto">
          ⚠️ These are draft documents for reference 
          only. Always verify with a qualified legal 
          professional before filing. 
          CorpLawUpdates.in is not liable for any 
          legal consequences of use.
        </p>
      </div>

      {/* Templates by category */}
      <div className="max-w-6xl mx-auto px-4 
                      py-12 space-y-12">
        
        {Object.entries(categoryConfig).map(
          ([cat, config]) => {
            const catTemplates = grouped[cat] || []
            if (catTemplates.length === 0) return null
            
            return (
              <section key={cat}>
                {/* Category header */}
                <div className="flex items-center 
                                gap-3 mb-6">
                  <span className="text-3xl">
                    {config.icon}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold 
                                   text-navy dark:text-white font-heading">
                      {config.label}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {config.description}
                    </p>
                  </div>
                  <span className={`ml-auto text-xs 
                    font-bold px-3 py-1 rounded-full 
                    border ${config.color}`}>
                    {catTemplates.length} templates
                  </span>
                </div>

                {/* Template cards grid */}
                <div className="grid grid-cols-1 
                                md:grid-cols-2 
                                lg:grid-cols-3 
                                gap-4">
                  {catTemplates.map((template: any) => (
                    <Link
                      key={template.slug}
                      href={`/documents/${template.slug}`}
                      className="bg-white dark:bg-slate-900 border 
                                 border-slate-200 dark:border-slate-800 
                                 rounded-2xl p-5 
                                 hover:border-amber-400 dark:hover:border-amber-500
                                 hover:shadow-md
                                 transition-all 
                                 duration-200 group"
                    >
                      {/* Free badge */}
                      <div className="flex justify-between 
                                      items-start mb-3">
                        {template.is_free ? (
                          <span className="text-xs 
                            bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 
                            font-bold px-2 py-0.5 
                            rounded-full">
                            FREE
                          </span>
                        ) : (
                          <span className="text-xs 
                            bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 
                            font-bold px-2 py-0.5 
                            rounded-full">
                            PRO
                          </span>
                        )}
                        {template.usage_count > 0 && (
                          <span className="text-xs 
                                           text-slate-400 dark:text-slate-500">
                            {template.usage_count} uses
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-bold text-navy dark:text-slate-100 
                                     text-sm mb-2 
                                     group-hover:text-amber-705 dark:group-hover:text-amber-400
                                     transition-colors
                                     leading-snug">
                        {template.name}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-500 dark:text-slate-400 
                                    text-xs mb-3 
                                    line-clamp-2">
                        {template.description}
                      </p>

                      {/* Source + date */}
                      <div className="flex items-center 
                                      justify-between">
                        <span className="text-xs 
                                         text-slate-400 dark:text-slate-500">
                          📚 {formatTemplateSource(template.slug, template.source, template.category)}
                        </span>
                        {template.last_verified && (
                          <span className="text-xs 
                                           text-green-600 dark:text-green-455">
                            ✓ Verified {new Date(
                              template.last_verified
                            ).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="mt-4 text-amber-500 
                                      text-sm font-semibold
                                      group-hover:translate-x-1
                                      transition-transform">
                        Generate Document →
                      </div>
                    </Link>
                  ))}

                  {/* Coming soon card */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 border 
                                  border-dashed 
                                  border-slate-300 dark:border-slate-800 
                                  rounded-2xl p-5 
                                  flex flex-col 
                                  items-center 
                                  justify-center 
                                  text-center">
                    <span className="text-3xl mb-2">
                      ➕
                    </span>
                    <p className="text-sm font-semibold 
                                  text-slate-500 dark:text-slate-450">
                      More Coming Soon
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 
                                  mt-1">
                      Suggest a document type
                    </p>
                  </div>
                </div>
              </section>
            )
          }
        )}
      </div>
    </div>
  )
}
