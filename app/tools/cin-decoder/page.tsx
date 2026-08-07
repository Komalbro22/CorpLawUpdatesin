import { Metadata } from 'next'
import Link from 'next/link'
import { decodeCIN } from '@/lib/cin-decoder'
import { Binary, Sparkles, FileText, HelpCircle, ShieldCheck, MapPin, Calendar, Briefcase, Award, Building2, Download, Search, CheckCircle2, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Free Corporate Identification Number (CIN) Decoder & Analyzer | MCA CIN Lookup Tool',
  description: 'Instantly decode any 21-digit Indian Corporate Identification Number (CIN). Analyze listing status, 5-digit NIC industry classification, state RoC jurisdiction, incorporation year, ownership type, and statutory compliance rules.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/cin-decoder',
  },
  openGraph: {
    title: 'Free Corporate Identification Number (CIN) Decoder & Structure Analyzer',
    description: 'Decode 21-digit MCA CIN numbers into 6 statutory corporate dimensions including NIC industry codes, RoC state jurisdiction, and ownership classification.',
    url: 'https://www.corplawupdates.in/tools/cin-decoder',
    type: 'website',
  },
}

type Props = {
  searchParams: Promise<{ cin?: string }> | { cin?: string }
}

export default async function CinDecoderToolPage({ searchParams }: Props) {
  const resolvedParams = await Promise.resolve(searchParams)
  const inputCin = (resolvedParams?.cin || 'L21091MH1945PLC004520').trim().toUpperCase()
  const breakdown = decodeCIN(inputCin)

  const sampleCins = [
    { label: 'Tata Motors (Public Listed)', cin: 'L21091MH1945PLC004520' },
    { label: 'Infosys (IT & Software)', cin: 'L85110KA1981PLC013115' },
    { label: 'Reliance Industries (Energy)', cin: 'L17110MH1973PLC019786' },
    { label: 'Private IT Startup (Unlisted)', cin: 'U72200KA2008PTC046124' },
    { label: 'State Govt Company', cin: 'U65191DL2015SGC288000' },
  ]

  const geoSummary = breakdown
    ? `CIN ${breakdown.cin} represents a ${breakdown.listingStatus.label} (${breakdown.companyType.label}) incorporated in ${breakdown.incorporationYear} in ${breakdown.state.name} under ${breakdown.state.rocOffice}. Its primary industrial activity is classified under NIC Code ${breakdown.nicCode.code} (${breakdown.nicCode.industry}) within the ${breakdown.nicCode.sectorGroup} sector.`
    : `Decode any 21-digit Indian Corporate Identification Number (CIN) into 6 official statutory dimensions.`

  const faqs = [
    {
      q: 'What is a Corporate Identification Number (CIN) in India?',
      a: 'A CIN (Corporate Identification Number) is a unique 21-character alphanumeric code assigned by the Registrar of Companies (RoC) under the Ministry of Corporate Affairs (MCA) to every company registered in India.'
    },
    {
      q: 'What do the 6 segments of a 21-digit CIN represent?',
      a: '1. First Letter (L/U): Listed vs Unlisted. 2. Next 5 Digits: National Industrial Classification (NIC) Code. 3. Next 2 Letters: Registered State Code. 4. Next 4 Digits: Year of Incorporation. 5. Next 3 Letters: Company Ownership Type (PLC/PTC/FLC/GOI/NPL). 6. Last 6 Digits: Unique RoC Serial Registration Number.'
    },
    {
      q: 'How does the 5-digit NIC code in a CIN identify industry activity?',
      a: 'The 5-digit National Industrial Classification (NIC-2008) code embedded in characters 2 to 6 of the CIN defines the primary business sector of the company (e.g. 21091 = Motor Vehicles, 85110 = Software Development, 65920 = Banking).'
    },
    {
      q: 'Can a Public Limited Company be eligible for Small Company status?',
      a: 'No. Under Section 2(85) of the Companies Act 2013, Public Limited Companies (CIN with PLC or starting with L) are strictly excluded from Small Company status regardless of capital or turnover.'
    },
  ]

  const pageUrl = 'https://www.corplawupdates.in/tools/cin-decoder'

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: 'Free Corporate Identification Number (CIN) Decoder & Structure Analyzer',
        description: geoSummary,
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
      },
      {
        '@type': 'SoftwareApplication',
        name: 'CorpLawUpdates CIN Decoder Tool',
        operatingSystem: 'All',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR'
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
          { '@type': 'ListItem', position: 3, name: 'CIN Decoder Tool', item: pageUrl }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a
          }
        }))
      }
    ]
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Tools</span>
          <span>/</span>
          <span className="text-navy dark:text-white font-bold">CIN Decoder & Structure Analyzer</span>
        </nav>

        {/* Hero Section & Search Form */}
        <header className="bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
              <Binary className="w-3.5 h-3.5" /> 100% Free Statutory MCA Decoder
            </div>
            <h1 className="text-2xl md:text-4xl font-heading font-bold text-white leading-snug">
              Corporate Identification Number (CIN) Decoder
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Instantly decode any 21-digit Indian CIN string into listing status, 5-digit NIC industry classification, RoC state jurisdiction, incorporation year, and legal class.
            </p>

            {/* Input Form */}
            <form action="/tools/cin-decoder" method="GET" className="pt-3 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="cin"
                  defaultValue={inputCin}
                  placeholder="Enter 21-digit CIN (e.g. L21091MH1945PLC004520)"
                  maxLength={21}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-navy font-bold px-6 py-2.5 rounded-xl text-xs md:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                Decode CIN Now
              </button>
            </form>

            {/* Quick Sample Short-cuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Try sample CINs:</span>
              {sampleCins.map((s) => (
                <Link
                  key={s.cin}
                  href={`/tools/cin-decoder?cin=${s.cin}`}
                  className="bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors"
                >
                  {s.cin}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* AI-SEO / GEO Summary Box */}
        <section className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-2xl p-5 md:p-6 border border-amber-300/40 dark:border-amber-500/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              AI Summary & Practitioner Overview
            </h2>
          </div>
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {geoSummary}
          </p>
        </section>

        {/* Main Decoded Result Breakdown */}
        {breakdown ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-navy dark:text-white font-heading">
                  Decoded CIN Structure Analysis
                </h2>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  Extracted 6 statutory dimensions for CIN <strong className="text-navy dark:text-white">{breakdown.cin}</strong>
                </p>
              </div>

              {/* PDF Download Trigger */}
              <a
                href={`/api/tools/cin-decoder/pdf?cin=${breakdown.cin}`}
                target="_blank"
                download={`CIN_Breakdown_${breakdown.cin}.pdf`}
                className="inline-flex items-center gap-2 bg-navy hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-navy font-bold px-4 py-2 rounded-xl text-xs md:text-sm transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" /> Download PDF Certificate
              </a>
            </div>

            {/* 6-Segment Breakdown Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* 1. Listing Status */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                  <Award className="w-4 h-4" /> 1. Listing Status ({breakdown.listingStatus.code})
                </div>
                <div className="font-bold text-base text-navy dark:text-white mb-1">{breakdown.listingStatus.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{breakdown.listingStatus.description}</div>
              </div>

              {/* 2. NIC Industry Code */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <Briefcase className="w-4 h-4" /> 2. NIC Code ({breakdown.nicCode.code})
                </div>
                <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-0.5">{breakdown.nicCode.sectorGroup}</div>
                <div className="font-semibold text-xs text-navy dark:text-slate-200">{breakdown.nicCode.industry}</div>
              </div>

              {/* 3. State & RoC Office */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                  <MapPin className="w-4 h-4" /> 3. State ({breakdown.state.code})
                </div>
                <div className="font-bold text-base text-navy dark:text-white mb-1">{breakdown.state.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Jurisdiction: {breakdown.state.rocOffice}</div>
              </div>

              {/* 4. Incorporation Year */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                  <Calendar className="w-4 h-4" /> 4. Year ({breakdown.incorporationYear})
                </div>
                <div className="font-bold text-base text-navy dark:text-white mb-1">Incorporated {breakdown.incorporationYear}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Year of statutory registration under MCA.</div>
              </div>

              {/* 5. Ownership Class */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  <Building2 className="w-4 h-4" /> 5. Ownership ({breakdown.companyType.code})
                </div>
                <div className="font-bold text-base text-navy dark:text-white mb-1">{breakdown.companyType.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{breakdown.companyType.description}</div>
              </div>

              {/* 6. RoC Registration Serial No */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                  <ShieldCheck className="w-4 h-4" /> 6. Serial No ({breakdown.registrationNumber})
                </div>
                <div className="font-bold text-base text-navy dark:text-white mb-1">RoC Serial Number</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Unique 6-digit registration serial code.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <h3 className="text-lg font-bold">Invalid CIN Format</h3>
            <p className="text-xs mt-1 text-slate-500">Please enter a valid 21-character Corporate Identification Number (e.g. L21091MH1945PLC004520).</p>
          </div>
        )}

        {/* FAQs */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-bold text-navy dark:text-white font-heading mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" /> Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={index} className="group border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <summary className="flex justify-between items-center p-4 font-bold text-navy dark:text-slate-200 text-xs md:text-sm cursor-pointer list-none select-none">
                  <span>Q{index + 1}. {faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 pt-1 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

      </div>
    </article>
  )
}
