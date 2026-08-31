import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'
import { FileText, Calculator, Calendar, CalendarDays, Landmark, BookOpen, Bot, CheckSquare, Target, Search } from 'lucide-react'

const ogImageUrl = 'https://www.corplawupdates.in/api/og?title=Free+Corporate+Law+%26+Compliance+Tools&category=Tools'

export const metadata: Metadata = {
  title: 'Free Corporate Law & Compliance Tools',
  description: 'Free interactive compliance and corporate law tools. Access our AI document generator, MCA late fee calculator, CIN decoder, compliance calendar, and repo rate tracker.',
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
        },
        {
          '@type': 'WebApplication',
          name: 'Company Search',
          url: 'https://www.corplawupdates.in/company-search',
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
    description: 'Generate board resolutions, agreements, appointment letters and more. AI-powered with ICSI SS-1 format.',
    badge: 'AI Powered',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
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
    stats: '50+ deadlines',
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
    id: 'company-search',
    href: '/company-search',
    icon: <BookOpen size={24} />,
    label: 'Company Search & CIN Lookup',
    description: 'Search 15+ Lakh registered Indian companies by CIN or Name. Instant compliance snapshot, AGM due dates, Small Company status & statutory flags.',
    badge: 'New',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    stats: '15+ Lakh Companies',
    isLive: true,
    tags: ['CIN Lookup', 'AGM Due Date', 'Small Company', 'MCA Master Data'],
    color: 'border-amber-200 hover:border-amber-400 dark:border-slate-800 dark:hover:border-amber-900/50',
    headerBg: 'from-amber-600 to-amber-800',
  },
  {
    id: 'glossary',
    href: '/glossary',
    icon: <BookOpen size={24} />,
    label: 'Corporate Law Glossary',
    description: 'Plain English definitions of 200+ corporate law terms. IBC, MCA, SEBI, RBI and FEMA terminology explained.',
    badge: 'Free',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
    stats: '200+ terms',
    isLive: true,
    tags: ['CIRP', 'DIN', 'NCLT', 'IBC', 'SEBI', 'FEMA'],
    color: 'border-teal-200 hover:border-teal-400 dark:border-slate-800 dark:hover:border-teal-900/50',
    headerBg: 'from-teal-600 to-teal-800',
  },
  {
    id: 'circular-summarizer',
    href: '/tools/circular-summarizer',
    icon: <Bot size={24} />,
    label: 'AI Circular Summarizer',
    description: 'Paste any SEBI/MCA/RBI circular URL and get an instant plain-English summary with key changes and action items.',
    badge: 'Coming Soon',
    badgeColor: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    stats: 'AI powered',
    isLive: false,
    tags: ['SEBI Circular', 'MCA Notification', 'RBI Circular', 'Summary'],
    color: 'border-slate-200 hover:border-slate-300 dark:border-slate-800/50 dark:hover:border-slate-700',
    headerBg: 'from-slate-500 to-slate-700',
  },
  {
    id: 'checklist',
    href: '/tools/compliance-checklist',
    icon: <CheckSquare size={24} />,
    label: 'Compliance Checklist Generator',
    description: 'Answer 5 questions about your company and get a personalized compliance checklist with all applicable deadlines.',
    badge: 'Coming Soon',
    badgeColor: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    stats: 'Personalized',
    isLive: false,
    tags: ['Pvt Ltd', 'LLP', 'Listed Company', 'OPC', 'Annual Compliance'],
    color: 'border-slate-200 hover:border-slate-300 dark:border-slate-800/50 dark:hover:border-slate-700',
    headerBg: 'from-slate-500 to-slate-700',
  },
  {
    id: 'quiz',
    href: '/tools/cs-quiz',
    icon: <Target size={24} />,
    label: 'Daily Corporate Law Quiz',
    description: '5 quick MCQs every day on Companies Act, SEBI, RBI and business law. Perfect for students, professionals and curious minds. Build your streak!',
    badge: 'Coming Soon',
    badgeColor: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    stats: 'New questions daily',
    isLive: false,
    tags: ['Daily Quiz', 'MCQ', 'Companies Act', 'Anyone Can Play'],
    color: 'border-slate-200 hover:border-slate-300 dark:border-slate-800/50 dark:hover:border-slate-700',
    headerBg: 'from-slate-500 to-slate-700',
  },
]

const liveTools = tools.filter(t => t.isLive)
const comingTools = tools.filter(t => !t.isLive)

export default function ToolsPage() {
  return (
    <div id="tools-page-content" className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
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
              { v: `${comingTools.length}+`, l: 'Coming Soon' },
              { v: '100%', l: 'Free' },
              { v: '0', l: 'Login Required' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-3xl font-black text-amber-400">
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
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-2xl font-bold text-navy dark:text-white font-heading">
              Live Tools
            </h2>
            <span className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 dark:border dark:border-green-900/30 text-xs font-bold px-2.5 py-1 rounded-full">
              {liveTools.length} Available Now
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {liveTools.map(tool => (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group bg-white dark:bg-slate-900 border-2 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${tool.color}`}
              >
                {/* Card header */}
                <span className={`block bg-gradient-to-r ${tool.headerBg} p-5`}>
                  <span className="flex items-center gap-4">
                    <span className="text-5xl shrink-0">{tool.icon}</span>
                    <span className="block min-w-0">
                      <span className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      </span>
                      <span className="block text-white font-bold text-lg leading-snug">
                        {tool.label}
                      </span>
                      <span className="block text-white/60 text-xs mt-0.5">
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
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      ● Live Now
                    </span>
                    <span className="text-navy dark:text-amber-400 font-bold text-sm group-hover:translate-x-1 transition-transform inline-block">
                      Open Tool →
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Coming Soon Tools */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🚀</span>
            <h2 className="text-2xl font-bold text-navy dark:text-white font-heading">
              Coming Soon
            </h2>
            <span className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {comingTools.length} In Development
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comingTools.map(tool => (
              <div key={tool.id}
                   className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-5 opacity-80">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0 opacity-60">
                    {tool.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-navy dark:text-slate-200 text-sm">
                        {tool.label}
                      </h3>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full flex-shrink-0">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tool.tags.slice(0, 3).map(tag => (
                        <span key={tag}
                              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <HubExploreLinks
          title="More on CorpLawUpdates"
          links={[
            { href: '/updates', label: 'Latest Updates', desc: 'Daily regulatory briefs' },
            { href: '/category', label: 'Browse by Regulator', desc: 'MCA, SEBI, RBI & more' },
            { href: '/tools/fee-calculator/companies', label: 'MCA Form Calculators', desc: 'MGT-7, AOC-4, DIR-3 & more' },
            { href: '/tools/doc-generator', label: 'AI Doc Generator', desc: 'Board resolutions & letters' },
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
