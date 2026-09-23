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
  Coins,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Corporate Law Updates India 2026',
  description:
    'Daily MCA, SEBI, RBI, IFSCA (GIFT City), CCI, NCLT, IBC and Labour Law updates for CS, CA and compliance professionals. Free compliance tools included.',
  alternates: { canonical: 'https://www.corplawupdates.in' },
  openGraph: {
    title: 'Corporate Law Updates India 2026 | CorpLawUpdates.in',
    description:
      'Daily MCA, SEBI, RBI, IFSCA (GIFT City), CCI, NCLT, IBC and Labour Law updates for CS, CA and compliance professionals.',
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
      'Daily MCA, SEBI, RBI, IFSCA (GIFT City), CCI, NCLT, IBC and Labour Law updates for CS, CA and compliance professionals.',
    images: ['https://www.corplawupdates.in/api/og?title=Corporate+Law+Updates+India+2026&category='],
  },
}

const categoryMeta = [
  {
    id: 'MCA',
    label: 'MCA',
    shortDesc: 'Companies & ROC',
    Icon: Building2,
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    hoverBorder: 'hover:border-blue-400/80 dark:hover:border-blue-500/60',
    hoverShadow: 'hover:shadow-blue-500/5',
  },
  {
    id: 'SEBI',
    label: 'SEBI',
    shortDesc: 'Capital Markets',
    Icon: TrendingUp,
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-400/80 dark:hover:border-emerald-500/60',
    hoverShadow: 'hover:shadow-emerald-500/5',
  },
  {
    id: 'RBI',
    label: 'RBI',
    shortDesc: 'Banking & NBFCs',
    Icon: Landmark,
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    hoverBorder: 'hover:border-purple-400/80 dark:hover:border-purple-500/60',
    hoverShadow: 'hover:shadow-purple-500/5',
  },
  {
    id: 'IBC',
    label: 'IBC',
    shortDesc: 'Insolvency & CIRP',
    Icon: Gavel,
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    hoverBorder: 'hover:border-rose-400/80 dark:hover:border-rose-500/60',
    hoverShadow: 'hover:shadow-rose-500/5',
  },
  {
    id: 'FEMA',
    label: 'FEMA',
    shortDesc: 'Forex, FDI & ODI',
    Icon: Globe2,
    badgeBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    hoverBorder: 'hover:border-teal-400/80 dark:hover:border-teal-500/60',
    hoverShadow: 'hover:shadow-teal-500/5',
  },
  {
    id: 'IFSCA',
    label: 'IFSCA',
    shortDesc: 'GIFT City / IFSC',
    Icon: Coins,
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-400/80 dark:hover:border-cyan-500/60',
    hoverShadow: 'hover:shadow-cyan-500/5',
  },
  {
    id: 'CCI',
    label: 'CCI',
    shortDesc: 'Competition Law',
    Icon: ShieldCheck,
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    hoverBorder: 'hover:border-indigo-400/80 dark:hover:border-indigo-500/60',
    hoverShadow: 'hover:shadow-indigo-500/5',
  },
  {
    id: 'NCLT',
    label: 'NCLT',
    shortDesc: 'Tribunal Orders',
    Icon: Scale,
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hoverBorder: 'hover:border-amber-400/80 dark:hover:border-amber-500/60',
    hoverShadow: 'hover:shadow-amber-500/5',
  },
  {
    id: 'LABOUR',
    label: 'Labour',
    shortDesc: 'EPF, ESI & Codes',
    Icon: Users,
    badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    hoverBorder: 'hover:border-slate-400/80 dark:hover:border-slate-500/60',
    hoverShadow: 'hover:shadow-slate-500/5',
  },
]

export default async function HomePage() {
  const latestQuery = supabase
    .from('updates')
    .select(UPDATE_LIST_COLUMNS)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(9)

  const [featuredRes, latestRes, popularRes, countsRes] = await Promise.all([
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
    supabase.rpc('get_published_category_counts'),
  ])

  const countsMap: Record<string, number> = {}
  if (Array.isArray(countsRes?.data)) {
    countsRes.data.forEach((item: any) => {
      if (item.category) countsMap[item.category.toUpperCase()] = Number(item.count) || 0
    })
  }

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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md max-w-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">MCA • SEBI • RBI • CCI • NCLT • IBC • FEMA</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight sm:leading-[1.15] text-white text-balance tracking-tight">
              Corporate Law Updates &amp; Compliance Tools
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-200 text-pretty font-normal">
              Daily regulatory circulars, SEBI regulations, and verified compliance tools — engineered for Company Secretaries, Chartered Accountants, and legal leaders.
            </p>
            
            {/* Clear CTA Hierarchy */}
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-2.5 sm:gap-3 w-full max-w-md">
              {/* 1. Standout Primary CTA */}
              <Link
                href="/updates"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-safe:hover:scale-[1.02] active:scale-[0.98]"
              >
                Browse updates
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              {/* 2. Distinct Secondary CTA */}
              <Link
                href="/tools"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700/80 px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Explore tools
              </Link>
            </div>

            {/* 3. Subtle Tertiary CTA */}
            <Link
              href="/newsletter"
              className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 hover:underline transition-colors"
            >
              <span>📬</span> Subscribe free for weekly Monday morning briefings
            </Link>

            <div className="mt-5 flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-medium text-slate-300">
              {['No login required', 'Updated daily', 'Built for Indian compliance'].map(item => (
                <span key={item} className="inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-amber-400 shrink-0" aria-hidden="true" />
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
        <section className="py-14 sm:py-16 px-4 w-full border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-500">
                  Regulatory Jurisdictions
                </p>
                <h2 className="mt-1 text-2xl md:text-3xl font-extrabold text-navy dark:text-white font-heading tracking-tight">
                  Browse by Regulator
                </h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm md:text-base">
                  Direct access to circulars, master directions, and enforcement orders from India&apos;s key corporate authorities.
                </p>
              </div>
              <Link
                href="/category"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                View all authority hubs
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2.5 sm:gap-3">
              {categoryMeta.map(({ id, label, Icon, badgeBg, hoverBorder, hoverShadow, shortDesc }, i) => {
                const count = countsMap[id] ?? 0
                return (
                  <Link
                    key={id}
                    href={`/category/${id.toLowerCase()}`}
                    style={{ '--delay': `${i * 35}ms` } as CSSProperties}
                    className={`animate-fade-up group flex flex-col items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 text-center shadow-xs ${hoverBorder} ${hoverShadow} hover:shadow-md transition-[transform,box-shadow,border-color] duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 motion-safe:hover:-translate-y-1`}
                  >
                    <div className={`size-10 sm:size-11 rounded-xl flex items-center justify-center border ${badgeBg} mb-2.5 transition-transform duration-200 group-hover:scale-110 shadow-2xs`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col items-center w-full">
                      <span className="font-heading font-extrabold text-sm sm:text-base text-navy dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {label}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 line-clamp-1">
                        {shortDesc}
                      </span>
                    </div>
                    {count > 0 ? (
                      <span className="mt-2 text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                        {count} updates
                      </span>
                    ) : (
                      <span className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Explore
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/category"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white"
              >
                View all authority hubs
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
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
                desc: 'Generate Board Resolutions, Director Appointment letters, Agreements, and corporate letters in seconds. Formatted per ICSI SS-1 standards.',
                badge: 'ICSI SS-1',
                badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
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
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-8 py-3.5 font-bold text-navy shadow-md transition-colors hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
