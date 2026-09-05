/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import { supabase } from '@/lib/supabase'
import { UPDATE_LIST_COLUMNS } from '@/lib/supabase-queries'
import UpdateCard from '@/components/UpdateCard'
import JsonLd from '@/components/JsonLd'
import Link from 'next/link'
import { Metadata } from 'next'
import type { CSSProperties } from 'react'
import HomeToolCard from '@/components/tools/HomeToolCard'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Gavel,
  Globe2,
  Landmark,
  Newspaper,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Corporate Law Updates India 2026',
  description:
    'Daily MCA, SEBI, RBI, CCI, NCLT, IBC and Labour Law updates for CS, CA and compliance professionals. Free compliance tools included.',
  alternates: { canonical: 'https://www.corplawupdates.in' },
  openGraph: {
    title: 'Corporate Law Updates India 2026 | CorpLawUpdates.in',
    description:
      'Daily MCA, SEBI, RBI, CCI, NCLT, IBC and Labour Law updates for CS, CA and compliance professionals.',
    url: 'https://www.corplawupdates.in',
    type: 'website',
    siteName: 'CorpLawUpdates.in',
    locale: 'en_IN',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=Corporate+Law+Updates+India+2026&category=', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@corplawupdates',
    creator: '@corplawupdates',
    title: 'Corporate Law Updates India 2026 | CorpLawUpdates.in',
    description:
      'Daily MCA, SEBI, RBI, CCI, NCLT, IBC and Labour Law updates for CS, CA and compliance professionals.',
    images: ['https://www.corplawupdates.in/api/og?title=Corporate+Law+Updates+India+2026&category='],
  },
}

const categoryMeta = [
  { id: 'MCA', label: 'MCA', Icon: Building2, bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-800/40 hover:bg-blue-100/60 dark:hover:bg-blue-900/40', desc: 'Ministry of Corporate Affairs' },
  { id: 'SEBI', label: 'SEBI', Icon: TrendingUp, bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40', desc: 'Securities & Exchange Board' },
  { id: 'RBI', label: 'RBI', Icon: Landmark, bg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-800/40 hover:bg-purple-100/60 dark:hover:bg-purple-900/40', desc: 'Reserve Bank of India' },
  { id: 'CCI', label: 'CCI', Icon: ShieldCheck, bg: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40', desc: 'Competition Commission' },
  { id: 'LABOUR', label: 'Labour Law', Icon: Users, bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/40 hover:bg-amber-100/60 dark:hover:bg-amber-900/40', desc: 'Labour Codes & EPF' },
  { id: 'NCLT', label: 'NCLT', Icon: Scale, bg: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200/70 dark:border-orange-800/40 hover:bg-orange-100/60 dark:hover:bg-orange-900/40', desc: 'Company Law Tribunal' },
  { id: 'IBC', label: 'IBC', Icon: Gavel, bg: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200/70 dark:border-red-800/40 hover:bg-red-100/60 dark:hover:bg-red-900/40', desc: 'Insolvency & Bankruptcy' },
  { id: 'FEMA', label: 'FEMA', Icon: Globe2, bg: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-200/70 dark:border-teal-800/40 hover:bg-teal-100/60 dark:hover:bg-teal-900/40', desc: 'Foreign Exchange' },
]

export default async function HomePage() {
  const latestQuery = supabase
    .from('updates')
    .select(UPDATE_LIST_COLUMNS)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(9)

  const [featuredRes, latestRes, popularRes] = await Promise.all([
    supabase
      .from('updates')
      .select(UPDATE_LIST_COLUMNS)
      .eq('is_featured', true)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(3),
    latestQuery,
    supabase
      .from('updates')
      .select(UPDATE_LIST_COLUMNS)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('views', { ascending: false })
      .limit(3),
  ])

  const featuredUpdates = featuredRes.data || []
  const latestUpdates = latestRes.data || []
  let popularUpdates = popularRes.data || []

  // Fallback to top views overall if fewer than 3 updates this week
  if (popularUpdates.length < 3) {
    const excludedIds = popularUpdates.map((u: any) => u.id)
    const fallbackLimit = 3 - popularUpdates.length
    
    let fallbackQuery = supabase
      .from('updates')
      .select(UPDATE_LIST_COLUMNS)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      
    if (excludedIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${excludedIds.join(',')})`)
    }
    
    const fallbackRes = await fallbackQuery
      .order('views', { ascending: false })
      .limit(fallbackLimit)
      
    if (fallbackRes.data) {
      popularUpdates = [...popularUpdates, ...fallbackRes.data]
    }
  }

  const hasUpdates = featuredUpdates.length > 0 || latestUpdates.length > 0

  return (
    <div>
      {/* High-Trust Editorial Navy Hero Banner */}
      {/* High-Trust Editorial Navy Hero Banner */}
      <section className="relative w-full overflow-hidden bg-navy text-white py-8 md:py-12 border-b border-slate-800">
        <div
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-[size:64px_64px]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-4 text-center sm:px-6 md:py-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              MCA • SEBI • RBI • CCI • NCLT • IBC • FEMA • LABOUR LAW
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-white text-balance tracking-tight">
              Corporate Law Updates & Compliance Tools
            </h1>
            <p className="mt-3.5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-200 text-balance font-normal">
              Daily regulatory circulars, SEBI regulations, and verified compliance tools — engineered for Company Secretaries, Chartered Accountants, and legal leaders.
            </p>
            
            {/* Clear CTA Hierarchy */}
            <div className="mt-7 flex flex-wrap justify-center items-center gap-3 w-full max-w-lg">
              {/* 1. Standout Primary CTA */}
              <Link
                href="/updates"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-7 py-3 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-safe:hover:scale-[1.02] active:scale-[0.98]"
              >
                Browse updates
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              {/* 2. Distinct Secondary CTA */}
              <Link
                href="/tools"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 hover:border-slate-400 bg-slate-800/80 hover:bg-slate-700/80 px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Explore tools
              </Link>
              {/* 3. Subtle Tertiary CTA */}
              <Link
                href="/newsletter"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-amber-300 hover:text-amber-200 hover:underline transition-colors"
              >
                <span>📬</span> Subscribe free
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-300">
              {['No login required', 'Updated daily', 'Built for Indian compliance'].map(item => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-amber-400" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Landmark Container */}
      <div id="content-section">
        {!hasUpdates && (
          <section className="py-20 text-center px-4">
            <h2 className="text-2xl font-bold text-navy mb-4 font-heading">Updates coming soon</h2>
            <p className="text-slate-600">Check back shortly.</p>
          </section>
        )}

        {featuredUpdates.length > 0 && (
          <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
            <div className="mb-8 md:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">Editor's desk</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading">
                  Featured updates
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  Hand-picked regulatory highlights worth reading first.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredUpdates.map((update: any, i: number) => (
                <UpdateCard key={update.id} update={update} animationDelay={i * 80} priority={i < 3} />
              ))}
            </div>
          </section>
        )}

        {popularUpdates.length > 0 && (
          <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
            <div className="mb-8 md:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700 dark:text-red-500 flex items-center gap-2">
                  <TrendingUp className="size-4 text-red-600 dark:text-red-500" aria-hidden="true" /> Trending
                </p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading">
                  Popular this week
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  The most read corporate law updates from the past 7 days.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {popularUpdates.map((update: any, i: number) => (
                <UpdateCard key={update.id} update={update} animationDelay={i * 80} />
              ))}
            </div>
          </section>
        )}

        {/* Browse By Regulator */}
        <section className="py-14 px-4 w-full border-y border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-2 font-heading text-center">
              Browse by regulator
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm md:text-base mb-10 max-w-xl mx-auto">
              Jump straight to updates from the authority you follow.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
              {categoryMeta.map(({ id, label, Icon, bg, desc }, i) => (
                <Link
                  key={id}
                  href={`/category/${id.toLowerCase()}`}
                  style={{ '--delay': `${i * 40}ms` } as CSSProperties}
                  className={`animate-fade-up group flex min-h-[115px] flex-col items-center justify-center gap-2 rounded-xl ${bg} p-3.5 text-center shadow-sm transition-[transform,box-shadow,background-color] duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 motion-safe:hover:-translate-y-1 hover:shadow-md`}
                >
                  <Icon className="size-6 opacity-90 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-sm md:text-base leading-tight">{label}</span>
                    <span className="text-[10px] opacity-75 font-medium leading-tight mt-1 line-clamp-1 hidden sm:block">{desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {latestUpdates.length > 0 && (
          <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
            <div className="mb-8 md:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" id="updates">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading">
                  Latest updates
                </h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm md:text-base">
                  New and recent briefs from Indian regulators.
                </p>
              </div>
              <Link
                href="/updates"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-navy dark:text-slate-100 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
              {latestUpdates.map((update: any, i: number) => (
                <UpdateCard key={update.id} update={update} animationDelay={i * 60} priority={featuredUpdates.length === 0 && i < 3} />
              ))}
            </div>
            <div className="text-center sm:hidden">
              <Link
                href="/updates"
                className="inline-flex items-center gap-2 text-navy dark:text-slate-200 font-semibold hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-base group"
              >
                View all updates
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        {/* Free Compliance & Legal Tools Section */}
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/85">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-500">Interactive Suite</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-navy dark:text-white font-heading tracking-tight">
                Free Legal & Compliance Tools
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm md:text-base">
                No login required. Self-service utilities for Company Secretaries, corporate lawyers, and compliance teams.
              </p>
            </div>
            <Link href="/tools"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-navy dark:text-slate-100 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap self-start md:self-end">
              View All Tools <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                href: '/documents',
                icon: '📄',
                title: 'Document Generator',
                desc: 'Generate Board Resolutions, Director Appointment letters, Agreements, and corporate letters in seconds. AI-powered with ICSI SS-1 formatting.',
                badge: 'AI Powered',
                badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
              },
              {
                href: '/tools/fee-calculator',
                icon: '🧮',
                title: 'MCA & ROC Fee Calculator',
                desc: 'Calculate statutory filing fees, ROC late fees, adjudication penalties, and MSME payment interest.',
                badge: 'Free',
                badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
              },
              {
                href: '/calendar',
                icon: '📅',
                title: 'Compliance Calendar',
                desc: 'Track 50+ deadlines for MCA, SEBI, RBI, FEMA, and Tax compliance. Export events directly to Google Calendar.',
                badge: 'Community',
                badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
              },
              {
                href: '/rbi/repo-rate',
                icon: '🏦',
                title: 'RBI Repo Rate Tracker',
                desc: 'Get the latest repo rate, change histories, next MPC schedule, and run home loan EMI impact calculations.',
                badge: 'Live Data',
                badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
              },
              {
                href: '/tools/cin-decoder',
                icon: '🔍',
                title: 'CIN Decoder',
                desc: 'Decode any 21-character CIN to reveal company type, state code, incorporation year, and ROC jurisdiction.',
                badge: 'Free',
                badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
              },
              {
                href: '/company-search',
                icon: '🏢',
                title: 'Company Search',
                desc: 'Search 15+ lakh registered Indian companies by CIN or name. View compliance snapshot and AGM due dates.',
                badge: 'New',
                badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
              },
              {
                href: '/glossary',
                icon: '📚',
                title: 'Corporate Law Glossary',
                desc: 'Over 200+ complex corporate law, IBC, SEBI, and FEMA definitions explained in simplified, plain English.',
                badge: 'Free',
                badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
              },
              {
                href: '/tools',
                icon: '🎯',
                title: 'Daily Corporate Law Quiz',
                desc: '5 daily quick MCQs covering Companies Act, SEBI guidelines, and RBI updates. Perfect for self-testing and mock practice.',
                badge: 'Coming Soon',
                badgeColor: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
                isLive: false,
              },
            ].map(tool => (
              <HomeToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </section>

        <section className="w-full bg-navy dark:bg-slate-950 py-16 md:py-20 px-4 text-center relative overflow-hidden border-t border-slate-800">
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-[size:72px_72px]" aria-hidden="true" />
          <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
            <Newspaper className="mb-4 size-8 text-gold" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
              Weekly Corporate Law Digest
            </h2>
            <p className="text-slate-300/90 mb-8 max-w-xl mx-auto leading-relaxed">
              One email on Mondays: MCA, SEBI, RBI, CCI, NCLT, IBC, FEMA and Labour Law. No spam. Unsubscribe anytime.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 font-bold text-navy shadow-md transition-colors hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Subscribe free
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Trimmed site context — keeps internal links without keyword stuffing */}
        <section className="max-w-7xl mx-auto px-4 py-10 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-3xl mx-auto text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            <p>
              CorpLawUpdates.in covers{' '}
              <Link href="/category/mca" className="text-gold hover:underline font-medium">MCA</Link>,{' '}
              <Link href="/category/sebi" className="text-gold hover:underline font-medium">SEBI</Link>,{' '}
              <Link href="/category/rbi" className="text-gold hover:underline font-medium">RBI</Link>,{' '}
              <Link href="/category/cci" className="text-gold hover:underline font-medium">CCI</Link>, and{' '}
              <Link href="/category/labour" className="text-gold hover:underline font-medium">Labour Law</Link>{' '}
              updates with free tools including the{' '}
              <Link href="/documents" className="text-gold hover:underline font-medium">Document Generator</Link>,{' '}
              <Link href="/tools/fee-calculator" className="text-gold hover:underline font-medium">ROC Fee Calculator</Link>, and{' '}
              <Link href="/calendar" className="text-gold hover:underline font-medium">Compliance Calendar</Link>.
            </p>
          </div>
        </section>

        {/* Homepage ItemList Schema for AI Search & Google indexing */}
        {latestUpdates.length > 0 && (
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Latest Corporate Law Updates India 2026',
            description: 'Latest statutory regulatory circulars, notifications, and compliance updates for India.',
            itemListElement: latestUpdates.map((u: any, idx: number) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: u.title,
              url: `https://www.corplawupdates.in/updates/${u.slug}`,
            })),
          }} />
        )}
      </div>
    </div>
  )
}
