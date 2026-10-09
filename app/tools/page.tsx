import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'
import { FileText, Calculator, Calendar, CalendarDays, Landmark, BookOpen, Search } from 'lucide-react'

const ogImageUrl = 'https://www.corplawupdates.in/api/og?title=Free+Corporate+Law+%26+Compliance+Tools&category=Tools'

export const metadata: Metadata = {
  title: 'Free Corporate Law & Compliance Tools',
  description: 'Free interactive compliance and corporate law tools. Access our AI document generator, MCA fee calculators, CIN decoder, and compliance calendar.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools',
  },
  openGraph: {
    title: 'Free Corporate Law & Compliance Tools | CorpLawUpdates.in',
    description: 'Free interactive compliance and corporate law tools. Access our AI document generator, MCA late fee calculator, CIN decoder, and compliance calendar.',
    url: 'https://www.corplawupdates.in/tools',
    type: 'website',
    siteName: 'CorpLawUpdates.in',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Free Corporate Law & Compliance Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Corporate Law & Compliance Tools | CorpLawUpdates.in',
    description: 'Free interactive compliance and corporate law tools for legal and compliance professionals.',
    images: [ogImageUrl],
  },
}

const toolsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.corplawupdates.in/tools#webpage',
      name: 'Free Corporate Law & Compliance Tools',
      description: 'Free interactive compliance and corporate law tools open to everyone. Access our AI document generator, MCA late fee calculator, compliance calendar, repo rate tracker, and glossary.',
      url: 'https://www.corplawupdates.in/tools',
      hasPart: [
        {
          '@type': 'WebApplication',
          name: 'Legal Document Generator',
          url: 'https://www.corplawupdates.in/documents',
          applicationCategory: 'LegalApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          }
        },
        {
          '@type': 'WebApplication',
          name: 'MCA & ROC Fee Calculator',
          url: 'https://www.corplawupdates.in/tools/fee-calculator',
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          }
        },
        {
          '@type': 'WebApplication',
          name: 'Compliance Calendar 2026',
          url: 'https://www.corplawupdates.in/calendar',
          applicationCategory: 'UtilityApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          }
        },
        {
          '@type': 'WebApplication',
          name: 'RBI Repo Rate Tracker',
          url: 'https://www.corplawupdates.in/rbi/repo-rate',
          applicationCategory: 'FinanceApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          }
        },
        {
          '@type': 'WebApplication',
          name: 'Corporate Law Glossary',
          url: 'https://www.corplawupdates.in/glossary',
          applicationCategory: 'EducationalApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          }
        },
        {
          '@type': 'WebApplication',
          name: 'ROC Compliance Tracker',
          url: 'https://www.corplawupdates.in/tools/roc-tracker',
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          }
        },
        {
          '@type': 'WebApplication',
          name: 'CIN Decoder',
          url: 'https://www.corplawupdates.in/tools/cin-decoder',
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          }
        }
      ]
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' }
      ]
    }
  ]
}


const tools = [
  {
    id: 'documents',
    href: '/documents',
    icon: <FileText size={24} />,
    label: 'Legal Document Generator',
    description: 'Generate board resolutions, agreements, appointment letters and more. Formatted per ICSI SS-1 and MCA standards.',
    badge: 'ICSI SS-1',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    stats: '8+ document types',
    isLive: true,
    tags: ['Board Resolution', 'MOA', 'Director Appointment', 'Agreements'],
    color: 'border-purple-200 hover:border-purple-400 dark:border-slate-800 dark:hover:border-purple-900/50',
    headerBg: 'from-purple-600 to-purple-800',
  },
  {
    id: 'fee-calculator',
    href: '/tools/fee-calculator',
    icon: <Calculator size={24} />,
    label: 'MCA & ROC Fee Calculator',
    description: 'Calculate statutory filing fees, ROC late fees, adjudication penalties, stamp duty and MSME delayed payment interest for Companies, LLPs, and MSMEs.',
    badge: 'Free',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
    stats: 'Companies, LLP & MSME',
    isLive: true,
    tags: ['MGT-7', 'AOC-4', 'DIR-3 KYC', 'Section 403', 'LLP Form 11', 'MSME Interest'],
    color: 'border-green-200 hover:border-green-400 dark:border-slate-800 dark:hover:border-green-900/50',
    headerBg: 'from-green-600 to-green-800',
  },
  {
    id: 'roc-tracker',
    href: '/tools/roc-tracker',
    icon: <CalendarDays size={24} />,
    label: 'ROC Deadline Tracker',
    description: 'Track personalized ROC deadlines (MGT-7, AOC-4, DIR-3 KYC etc.), estimate delay penalties, and calculate CCFS 2026 scheme savings.',
    badge: 'New',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    stats: '12+ forms tracked',
    isLive: true,
    tags: ['MGT-7', 'AOC-4', 'DIR-3 KYC', 'DPT-3', 'CCFS 2026'],
    color: 'border-amber-200 hover:border-amber-400 dark:border-slate-800 dark:hover:border-amber-900/50',
    headerBg: 'from-amber-500 to-amber-700',
  },
  {
    id: 'calendar',
    href: '/calendar',
    icon: <Calendar size={24} />,
    label: 'Compliance Calendar 2026',
    description: 'Complete compliance deadline calendar for MCA, SEBI, RBI, FEMA and Income Tax. Export to Google Calendar.',
    badge: 'Community',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    stats: '90+ deadlines',
    isLive: true,
    tags: ['MCA Deadlines', 'SEBI Quarterly', 'Income Tax', 'FEMA'],
    color: 'border-blue-200 hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-900/50',
    headerBg: 'from-blue-600 to-blue-800',
  },
  {
    id: 'repo-rate',
    href: '/rbi/repo-rate',
    icon: <Landmark size={24} />,
    label: 'RBI Repo Rate Tracker',
    description: 'Current RBI repo rate, rate history, next MPC meeting date and impact on home loans and EMIs.',
    badge: 'Live Data',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    stats: 'Updated after every MPC',
    isLive: true,
    tags: ['Repo Rate', 'RBI MPC', 'Interest Rate', 'Home Loan'],
    color: 'border-amber-200 hover:border-amber-400 dark:border-slate-800 dark:hover:border-amber-900/50',
    headerBg: 'from-amber-500 to-amber-700',
  },
  {
    id: 'cin-decoder',
    href: '/tools/cin-decoder',
    icon: <Search size={24} />,
    label: 'CIN Decoder',
    description: 'Decode any 21-character Corporate Identification Number (CIN) to reveal company type, state code, year of incorporation, and ROC jurisdiction.',
    badge: 'Free',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    stats: 'Instant decode',
    isLive: true,
    tags: ['CIN Lookup', 'ROC Code', 'Company Type', 'State Code'],
    color: 'border-blue-200 hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-900/50',
    headerBg: 'from-blue-600 to-blue-800',
  },
  {
    id: 'glossary',
    href: '/glossary',
    icon: <BookOpen size={24} />,
    label: 'Corporate Law Glossary',
    description: 'Plain English definitions of 180+ corporate law terms. IBC, MCA, SEBI, RBI and FEMA terminology explained.',
    badge: 'Free',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
    stats: '180+ terms',
    isLive: true,
    tags: ['CIRP', 'DIN', 'NCLT', 'IBC', 'SEBI', 'FEMA'],
    color: 'border-teal-200 hover:border-teal-400 dark:border-slate-800 dark:hover:border-teal-900/50',
    headerBg: 'from-teal-600 to-teal-800',
  },
]

const liveTools = tools.filter(t => t.isLive)

export default function ToolsPage() {
  return (
    <div id="tools-page-content" className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <JsonLd data={toolsJsonLd as any} />

      {/* Hero Banner */}
      <div className="bg-navy py-16 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 uppercase tracking-wider border border-amber-400/30">
            🛠️ Free Tools · No Login Required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4 tracking-tight">
            Compliance Tools Hub
          </h1>
          <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Free interactive tools open to everyone — built for professionals, students, business owners, and compliance leaders.
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { v: `${liveTools.length}`, l: 'Live Tools' },
              { v: '100%', l: 'Free Access' },
              { v: '0', l: 'Login Required' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-3xl font-black text-amber-400 tabular-nums">
                  {s.v}
                </div>
                <div className="text-slate-300 text-xs mt-0.5 font-medium">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Live Tools */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-2.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-navy dark:text-white font-heading">
              Live Tools
            </h2>
            <span className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 dark:border dark:border-green-900/30 text-xs font-bold px-2.5 py-1 rounded-full tabular-nums">
              {liveTools.length} Available Now
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {liveTools.map(tool => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all duration-200 flex flex-col"
              >
                {/* Card header */}
                <span className="block bg-navy dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5">
                  <span className="flex items-center gap-4">
                    <span className="size-12 rounded-xl bg-white/10 dark:bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                      {tool.icon}
                    </span>
                    <span className="block min-w-0">
                      <span className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      </span>
                      <span className="block text-white font-bold text-lg leading-snug">
                        {tool.label}
                      </span>
                      <span className="block text-slate-300 dark:text-slate-400 text-xs mt-0.5">
                        {tool.stats}
                      </span>
                    </span>
                  </span>
                </span>

                {/* Card body */}
                <span className="block p-5 flex-1">
                  <span className="block text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                    {tool.description}
                  </span>

                  {/* Tags */}
                  <span className="flex flex-wrap gap-1.5 mb-4">
                    {tool.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </span>

                  <span className="flex items-center justify-between">
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
                      Live Now
                    </span>
                    <span className="text-navy dark:text-amber-400 font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Open Tool <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <HubExploreLinks
          title="More on CorpLawUpdates"
          links={[
            { href: '/updates', label: 'Latest Updates', desc: 'Daily regulatory briefs' },
            { href: '/category', label: 'Browse by Regulator', desc: 'MCA, SEBI, RBI & more' },
            { href: '/tools/fee-calculator/companies', label: 'MCA Form Calculators', desc: 'MGT-7, AOC-4, DIR-3 & more' },
            { href: '/documents', label: 'Legal Document Hub', desc: 'Board resolutions & agreements' },
            { href: '/partners', label: 'List Your Service', desc: 'For CS, CA & Advocates' },
            { href: '/editorial-policy', label: 'Editorial Policy', desc: 'How we verify content' },
          ]}
          className="mb-12"
        />

        {/* Newsletter CTA */}
        <div className="mt-12 bg-navy rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white font-heading mb-2">
            Get notified when new tools launch
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Subscribe to our newsletter and be the first to access new compliance tools.
          </p>
          <Link href="/newsletter"
                className="inline-block bg-amber-400 hover:bg-amber-500 text-navy font-bold px-8 py-3.5 rounded-xl transition-colors">
            Subscribe Free →
          </Link>
        </div>
      </div>
    </div>
  )
}
