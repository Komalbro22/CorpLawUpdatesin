import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseDocuments } from '@/lib/supabase-documents'
import DocumentIntentSearch from '@/components/documents/DocumentIntentSearch'
import HubExploreLinks from '@/components/HubExploreLinks'
import { formatTemplateSource } from '@/lib/document-clause-checker'
import { MVP_DOCUMENTS_META } from '@/lib/doc-generator/ai-engine'

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
    label: 'Notices & Public Notices',
    icon: '📢',
    color: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/30 dark:border-teal-900/50 dark:text-teal-300',
    description: 'Board meeting, AGM, EGM, and SEBI Public notices'
  },
  banking_finance: {
    label: 'Banking & Finance',
    icon: '🏦',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300',
    description: 'Letters of Credit, Bank Guarantees, Financial Instruments'
  },
  real_estate: {
    label: 'Real Estate & Property',
    icon: '🏠',
    color: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-300',
    description: 'Mortgage Deeds, Lease Agreements, and Property Transfers'
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

      if (t.tags && Array.isArray(t.tags)) {
        if (t.tags.some((tag: string) => tag.toLowerCase().includes('banking') || tag.toLowerCase().includes('finance') || tag.toLowerCase().includes('credit') || tag.toLowerCase().includes('guarantee'))) {
          if (!acc['banking_finance']) acc['banking_finance'] = []
          if (t.category !== 'banking_finance') {
            acc['banking_finance'].push(t)
          }
        }
        
        if (t.tags.some((tag: string) => tag.toLowerCase().includes('real estate') || tag.toLowerCase().includes('mortgage') || tag.toLowerCase().includes('property'))) {
          if (!acc['real_estate']) acc['real_estate'] = []
          if (t.category !== 'real_estate') {
            acc['real_estate'].push(t)
          }
        }
      }

      if (t.category === 'agreements' && t.category !== 'commercial_contracts') {
        if (!acc['commercial_contracts']) acc['commercial_contracts'] = []
        acc['commercial_contracts'].push(t)
      }

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
              { v: `${totalDocs + 3}+`, l: 'Document Types' },
              { v: 'ICSI SS-1', l: 'Standard Format' },
              { v: 'Free', l: 'Always' },
              { v: 'AI Studio', l: 'Multi-Turn' },
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
          <div className="flex flex-col items-center gap-4">
            <DocumentIntentSearch />
            <Link 
              href="/documents/saved" 
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-amber-400/50"
            >
              📄 View Saved Documents
            </Link>
          </div>

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

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        
        {/* FEATURED: AI PARAMETRIC DOCUMENT GENERATOR STUDIO */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-blue-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                ⚡ Featured AI Studio Generators
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Multi-Turn AI Document Generator Studio
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Generate perfectly formatted Microsoft Word (<code className="text-amber-300">.docx</code>) compliance documents with dynamic agendas, statutory citations & Bookman Old Style 12pt legal layout.
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
              ✓ DOCX Word Export Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MVP_DOCUMENTS_META.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-400/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800/40">
                      {doc.category}
                    </span>
                    <span className="text-xs text-slate-400">~{doc.estimatedMinutes} min</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {doc.shortDescription}
                  </p>

                  <p className="text-xs text-slate-400 font-mono truncate border-t border-slate-800 pt-2">
                    📜 {doc.actReference}
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    href={`/documents/generator/${doc.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
                  >
                    <span>Launch AI Generator →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Templates by category */}
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
                                 hover:shadow-md transition-all duration-200 
                                 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            {template.category?.replace(/_/g, ' ')}
                          </span>
                          {template.is_free && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                              FREE
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors mb-2">
                          {template.name}
                        </h3>

                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">
                          {template.description}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate max-w-[200px]">
                          📜 {formatTemplateSource(template.slug || '', template.source || '', template.category || '')}
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform font-bold text-amber-500">
                          Draft →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          }
        )}

        <HubExploreLinks
          title="Related Compliance Tools"
          links={[
            { href: '/tools/fee-calculator', label: 'ROC Fee Calculator', desc: 'Late fees & penalties' },
            { href: '/tools/cin-decoder', label: 'CIN Decoder', desc: 'Decode company CINs' },
            { href: '/company-search', label: 'Company Search', desc: '15+ lakh companies' },
            { href: '/calendar', label: 'Compliance Calendar', desc: '50+ deadlines' },
            { href: '/updates', label: 'Latest Updates', desc: 'MCA, SEBI, RBI briefs' },
            { href: '/editorial-policy', label: 'Editorial Policy', desc: 'How we verify content' },
          ]}
          className="mt-12"
        />

      </div>
    </div>
  )
}
