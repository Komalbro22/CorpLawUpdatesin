import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { REPO_RATE_HISTORY_COLUMNS } from '@/lib/supabase-queries'
import RepoEmiCalculator from '@/components/rbi/RepoEmiCalculator'
import {
  Landmark,
  TrendingDown,
  Calendar,
  Building2,
  HelpCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Bell,
  ArrowRight,
  Sparkles,
  PieChart,
  Percent,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
  Calculator,
  Info
} from 'lucide-react'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getRateSettings()
  const rate = settings.current_repo_rate || '5.25%'
  const rawDate = settings.current_repo_rate_date || 'August 2026'
  const cleanDate = rawDate.replace(/\(.*?\)/g, '').replace(/62st/gi, '62nd').trim() || 'August 2026'
  const nextMpc = settings.next_mpc_date || 'October 5 to 7, 2026'
  const sdfRate = settings.sdf_rate || '5.00%'
  const msfRate = settings.msf_rate || '5.50%'

  return {
    title: `Current RBI Repo Rate: ${rate} (Active Today) — 62nd MPC Decision, SDF & Loan Rates`,
    description: `Current RBI repo rate is ${rate}, officially active under a Neutral stance. Check SDF (${sdfRate}), MSF (${msfRate}), Reverse Repo Rate (3.35%), next October MPC meeting schedule (${nextMpc}), and calculate loan EMI impact.`,
    keywords: [
      'current repo rate',
      'current rbi repo rate',
      'rbi repo rate 2026',
      'repo rate today india',
      'present repo rate',
      'next repo rate',
      'next rbi mpc meeting date',
      'present reverse repo rate in india 2026',
      'bank rate india',
      'current msf rate rbi',
      '62nd mpc meeting repo rate',
      'rbi monetary policy rate 2026',
      'repo rate impact on home loan emi',
      'sdf rate rbi',
      'crr slr rates rbi',
    ],
    alternates: { canonical: 'https://www.corplawupdates.in/rbi/repo-rate' },
    openGraph: {
      title: `Current RBI Repo Rate: ${rate} (Active Today) — 62nd MPC Decision`,
      description: `Official RBI benchmark repo rate stands at ${rate} with a Neutral stance. Real GDP projected at 6.7%, CPI 5.0%. View full interest rate corridor, next MPC dates (${nextMpc}), and loan EMI calculator.`,
      url: 'https://www.corplawupdates.in/rbi/repo-rate',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Current RBI Repo Rate: ${rate} (Active Today) — 62nd MPC`,
      description: `Official RBI repo rate stands at ${rate}. Complete breakdown of SDF, MSF, Bank Rate, next MPC meeting schedule, and interactive EMI calculator.`,
    }
  }
}

async function getRateSettings() {
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'current_repo_rate',
      'current_repo_rate_date',
      'next_mpc_date',
      'mpc_stance',
      'sdf_rate',
      'msf_rate',
    ])

  const settings: Record<string, string> = {}
  data?.forEach(row => {
    settings[row.key] = row.value || ''
  })
  return settings
}

async function getRateHistory() {
  const { data } = await supabase
    .from('repo_rate_history')
    .select(REPO_RATE_HISTORY_COLUMNS)
    .order('meeting_date', { ascending: false })
    .limit(20)
  return data || []
}

export default async function RepoRatePage() {
  const [settings, history] = await Promise.all([
    getRateSettings(),
    getRateHistory(),
  ])

  const repoRate = settings.current_repo_rate || '5.25%'
  const rawRateDate = settings.current_repo_rate_date || 'August 2026'
  const cleanRateDate = rawRateDate.replace(/\(.*?\)/g, '').replace(/62st/gi, '62nd').trim() || 'August 2026'
  const nextMpc = settings.next_mpc_date || 'October 5 to 7, 2026'
  const stance = settings.mpc_stance || 'Neutral'
  const sdfRate = settings.sdf_rate || '5.00%'
  const msfRate = settings.msf_rate || '5.50%'

  // Schema.org FAQPage structured data for Google Rich Snippets & AI Overviews
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the current RBI repo rate in India today (2026)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The current RBI repo rate is ${repoRate}, decided at the 62nd Monetary Policy Committee (MPC) meeting (August 3 to 5, 2026) under Governor Shri Sanjay Malhotra with a unanimous 6-0 vote and a Neutral stance. Because the MPC convenes bi-monthly, ${repoRate} remains India's operative benchmark lending rate until the next MPC meeting in October 2026.`
        }
      },
      {
        '@type': 'Question',
        name: 'When is the next RBI MPC meeting in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The next RBI Monetary Policy Committee meeting is scheduled for ${nextMpc}. The 3-day meeting concludes with the policy resolution announcement and the Governor's address, followed by detailed meeting minutes published 14 days later.`
        }
      },
      {
        '@type': 'Question',
        name: 'What is the current Reverse Repo Rate and SDF rate in India in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The fixed reverse repo rate stands at 3.35%, but the operational floor for absorbing surplus bank liquidity under the LAF corridor is the Standing Deposit Facility (SDF) rate at ${sdfRate}. The SDF operates without requiring government securities collateral from the RBI.`
        }
      },
      {
        '@type': 'Question',
        name: 'What are the current SDF, MSF, Bank Rate, CRR, and SLR rates in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `As of 2026, the key benchmark rates are: Policy Repo Rate: ${repoRate}, Standing Deposit Facility (SDF): ${sdfRate}, Marginal Standing Facility (MSF): ${msfRate}, Bank Rate: ${msfRate}, Fixed Reverse Repo Rate: 3.35%, Cash Reserve Ratio (CRR): 4.50%, and Statutory Liquidity Ratio (SLR): 18.00%.`
        }
      },
      {
        '@type': 'Question',
        name: 'Why did the RBI keep the repo rate unchanged at 5.25% in the 62nd MPC meeting?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The MPC unanimously retained the repo rate at 5.25% with a Neutral stance to ensure headline CPI inflation (projected at 5.0% for FY 2026-27) converges durably to the 4.0% target amidst food price volatility, supported by strong real GDP growth projected at 6.7%.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does the RBI repo rate affect home loan and MSME interest rates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Floating-rate retail home loans are pegged to External Benchmark Lending Rates (EBLR) which track the repo rate. With repo rate at ${repoRate}, home loan interest rates average between 8.40% and 9.35% p.a. For MSMEs, delayed payment interest under Section 16 of the MSMED Act is charged at 3 times the Bank Rate (${msfRate}), totaling 16.50% compounded monthly.`
        }
      },
      {
        '@type': 'Question',
        name: 'What are the GDP growth and inflation projections by RBI for 2026-27?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The RBI MPC projects real GDP growth for FY 2026-27 at 6.7% (Q1: 7.0%, Q2: 6.4%, Q3: 6.5%, Q4: 6.8%) and headline CPI inflation at 5.0% (Q2: 4.7%, Q3: 5.9%, Q4: 5.5%).'
        }
      }
    ]
  }

  // WebPage Schema with dateModified for Freshness Signaling
  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Current RBI Repo Rate: ${repoRate} (Active Benchmark)`,
    description: `Current RBI repo rate is ${repoRate}. Complete policy corridor, meeting schedule, and loan EMI analysis.`,
    url: 'https://www.corplawupdates.in/rbi/repo-rate',
    inLanguage: 'en-IN',
    datePublished: '2025-02-07T10:00:00+05:30',
    dateModified: new Date().toISOString(),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.corplawupdates.in'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'RBI Updates',
          item: 'https://www.corplawupdates.in/category/rbi'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Repo Rate Tracker',
          item: 'https://www.corplawupdates.in/rbi/repo-rate'
        }
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: 'CorpLawUpdates.in',
      url: 'https://www.corplawupdates.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.corplawupdates.in/icon-512.png'
      }
    }
  }

  // Dataset / Financial Indicator Schema
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Reserve Bank of India (RBI) Policy Repo Rate & Monetary Policy History',
    description: 'Official historical policy interest rates, meeting dates, stance, and macroeconomic forecasts published by the Reserve Bank of India Monetary Policy Committee.',
    url: 'https://www.corplawupdates.in/rbi/repo-rate',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'Reserve Bank of India',
      url: 'https://www.rbi.org.in'
    },
    publisher: {
      '@type': 'Organization',
      name: 'CorpLawUpdates.in',
      url: 'https://www.corplawupdates.in'
    },
    temporalCoverage: '2020/2026',
    variableMeasured: 'Policy Repo Rate, SDF Rate, MSF Rate, CPI Inflation Projection, Real GDP Projection'
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Schema.org Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      {/* HERO SECTION */}
      <div className="bg-navy py-12 px-4 text-center relative overflow-hidden border-b border-navy-700">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
            Official Benchmark Policy Rate · In Force Today
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-black text-white tracking-tight tabular-nums">
            {repoRate}
          </h1>

          <p className="text-amber-400 font-heading font-bold text-xl md:text-2xl">
            Current RBI Repo Rate (2026)
          </p>

          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            Reaffirmed at the <strong>62nd MPC Meeting (August 3–5, 2026)</strong> · Chaired by Governor Shri Sanjay Malhotra · Unanimous 6-0 Vote · <strong>{stance} Stance</strong>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/10 text-slate-200 border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />
              Bi-Monthly Cycle: Rate active until {nextMpc}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/10 text-slate-200 border border-white/10 backdrop-blur-sm">
              <Clock className="size-3.5 text-amber-400" aria-hidden="true" />
              Next Decision: October 7, 2026 (10 AM IST)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* FEATURED SNIPPET / POSITION 0 ANSWER-FIRST QUICK FACTS BOX */}
        <div className="bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-indigo-500/10 dark:from-amber-950/40 dark:via-blue-950/20 dark:to-indigo-950/40 border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/80 dark:border-amber-800/40">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900 dark:text-white">
                  Current RBI Policy Rates & Key Financial Indicators at a Glance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Operative monetary policy rates under the Reserve Bank of India Act & Banking Regulation Act
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shrink-0 self-start sm:self-auto">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              Active & Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Policy Repo Rate</p>
              <p className="text-xl font-heading font-black text-blue-700 dark:text-blue-400 tabular-nums">{repoRate}</p>
              <p className="text-[10px] text-slate-400">Main lending benchmark</p>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Standing Deposit (SDF)</p>
              <p className="text-xl font-heading font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{sdfRate}</p>
              <p className="text-[10px] text-slate-400">Operative absorption floor</p>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">MSF / Bank Rate</p>
              <p className="text-xl font-heading font-black text-purple-700 dark:text-purple-400 tabular-nums">{msfRate}</p>
              <p className="text-[10px] text-slate-400">Penal borrowing ceiling</p>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Fixed Reverse Repo</p>
              <p className="text-xl font-heading font-black text-slate-800 dark:text-slate-200 tabular-nums">3.35%</p>
              <p className="text-[10px] text-slate-400">Legacy LAF facility</p>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Cash Reserve (CRR)</p>
              <p className="text-xl font-heading font-black text-slate-800 dark:text-slate-200 tabular-nums">4.50%</p>
              <p className="text-[10px] text-slate-400">Mandatory bank reserve</p>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Statutory Liquidity (SLR)</p>
              <p className="text-xl font-heading font-black text-slate-800 dark:text-slate-200 tabular-nums">18.00%</p>
              <p className="text-[10px] text-slate-400">G-Sec & gold reserves</p>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1 lg:col-span-2 space-y-0.5">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Next Scheduled MPC Meeting</p>
              <p className="text-base sm:text-lg font-heading font-bold text-amber-700 dark:text-amber-400">{nextMpc}</p>
              <p className="text-[10px] text-slate-400">63rd MPC meeting & policy announcement</p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <Info className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Why Rates Don&apos;t Change Every Month:</strong> Under Section 45ZB of the RBI Act, the Monetary Policy Committee convenes bi-monthly (every 2 months). The rate of <strong className="tabular-nums">{repoRate}</strong> decided in the 62nd MPC continues as the official national benchmark until the 63rd MPC resolution in October 2026.
            </p>
          </div>
        </div>

        {/* 4 KEY RATE BADGES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Policy Repo Rate', value: repoRate, desc: 'Lending rate to banks', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300', badge: 'Key Benchmark' },
            { label: 'Standing Deposit (SDF)', value: sdfRate, desc: 'Absorption floor rate', color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300', badge: 'Floor Rate' },
            { label: 'MSF / Bank Rate', value: msfRate, desc: 'Emergency ceiling rate', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40 text-purple-800 dark:text-purple-300', badge: 'Ceiling Rate' },
            { label: 'Policy Stance', value: stance, desc: 'Growth-inflation calibrated', color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300', badge: 'Unanimous' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border p-5 text-center shadow-sm relative flex flex-col justify-between ${stat.color}`}>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-current/10">
                  {stat.badge}
                </span>
                <div className="text-3xl font-heading font-black mt-2 tabular-nums">{stat.value}</div>
              </div>
              <div>
                <p className="text-xs font-bold mt-2">{stat.label}</p>
                <p className="text-[11px] opacity-75 mt-0.5">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 62nd MPC MEETING SUMMARY & OFFICIAL RATIONALE BANNER */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                  <Landmark className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                  62nd MPC Meeting Key Decisions & Official Resolution (August 2026)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Resolution of the Monetary Policy Committee published via RBI Press Release No. 2026-2027/809 on August 5, 2026.
              </p>
            </div>
            <a
              href="https://rbidocs.rbi.org.in/rdocs/PressRelease/PDFs/PR80907599DE5FD164918A49085C9D6270116.PDF"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 self-start sm:self-auto"
            >
              <FileText className="size-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
              <span>Official RBI PDF (310 KB)</span>
              <ExternalLink className="size-3 text-slate-400" aria-hidden="true" />
            </a>
          </div>

          {/* KEY PROJECTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Real GDP Growth (2026-27)</span>
                <span className="text-lg font-heading font-black text-blue-800 dark:text-blue-200 tabular-nums">6.7% Projected</span>
              </div>
              <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
                Projected quarterly trajectory: <strong className="tabular-nums">Q1: 7.0%</strong> | <strong className="tabular-nums">Q2: 6.4%</strong> | <strong className="tabular-nums">Q3: 6.5%</strong> | <strong className="tabular-nums">Q4: 6.8%</strong>. Projected at <strong className="tabular-nums">7.3%</strong> for Q1:2027-28.
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Driven by resilient private consumption, robust services momentum, buoyant capital goods investment, and healthy bank credit flow.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">CPI Inflation (2026-27)</span>
                <span className="text-lg font-heading font-black text-amber-800 dark:text-amber-200 tabular-nums">5.0% Projected</span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                Projected quarterly trajectory: <strong className="tabular-nums">Q2: 4.7%</strong> | <strong className="tabular-nums">Q3: 5.9% (Peak)</strong> | <strong className="tabular-nums">Q4: 5.5%</strong>. Projected at <strong className="tabular-nums">5.3%</strong> for Q1:2027-28.
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Headline inflation rose to 4.4% in June due to food and retail fuel price revisions, while Core Inflation (ex-food/fuel) remained low at 3.9%.
              </p>
            </div>
          </div>

          {/* RATIONALE TEXT */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Why the MPC Voted to Keep Rates Unchanged with a Neutral Stance:
            </p>
            <p>
              1. <strong>Inflation Vigilance:</strong> While core inflation remains benign (2.3–2.5% excluding precious metals), headline inflation is expected to peak in Q3:2026-27 due to food supply pressures and geopolitical risks in West Asia impacting crude prices. The MPC remains resolute on durably aligning inflation with the 4% target.
            </p>
            <p>
              2. <strong>Growth Cushion:</strong> Robust domestic demand, capacity utilization, and government infrastructure investments ensure India remains the world&apos;s fastest-growing major economy, giving the MPC headroom to prioritize price stability.
            </p>
            <p>
              3. <strong>Unanimous Voting:</strong> All 6 MPC members (Governor Sanjay Malhotra, Dr. Nagesh Kumar, Shri Saugata Bhattacharya, Prof. Ram Singh, Dr. Poonam Gupta, and Shri Indranil Bhattacharyya) voted in unison to maintain the policy rate and neutral stance.
            </p>
          </div>
        </div>

        {/* NEXT RBI MPC MEETING SCHEDULE & OUTLOOK (Captures Position 5.1 'next repo rate' queries) */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                <Calendar className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                  Next RBI MPC Meeting Schedule & Policy Outlook (October 2026)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  63rd Monetary Policy Committee Deliberation Timeline and Rate Decision Window
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0 self-start sm:self-auto">
              Scheduled: {nextMpc}
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The Reserve Bank of India convenes the Monetary Policy Committee bi-monthly. In between scheduled policy meetings, the benchmark repo rate remains unchanged at <strong className="tabular-nums font-bold text-blue-700 dark:text-blue-400">{repoRate}</strong> unless unforeseen macroeconomic shocks necessitate an unscheduled off-cycle intervention. Here is the scheduled timeline and policy dynamics for the upcoming 63rd MPC meeting:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Clock className="size-4 text-amber-500" aria-hidden="true" />
                Meeting Roadmap
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>October 5, 2026:</strong> Day 1 internal deliberations on domestic liquidity and credit flow.<br />
                <strong>October 6, 2026:</strong> Day 2 review of global headwinds, crude benchmarks & CPI print.<br />
                <strong>October 7, 2026 (10:00 AM IST):</strong> Governor&apos;s live policy resolution & press meet.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <PieChart className="size-4 text-blue-500" aria-hidden="true" />
                Key Deciding Factors
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The MPC will assess post-monsoon kharif crop arrivals, Q2 retail food prices, crude oil volatility from Middle East geopolitical developments, and federal capex execution before reconsidering the &apos;Neutral&apos; policy stance.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Building2 className="size-4 text-emerald-500" aria-hidden="true" />
                Borrower Impact Window
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If the MPC cuts or holds the repo rate in October, commercial banks (SBI, HDFC, ICICI, PNB) are required to reset their external benchmark lending rates (EBLR/RLLR) for home and business loans within their quarterly reset windows.
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE EMI CALCULATOR COMPONENT */}
        <section>
          <RepoEmiCalculator />
        </section>

        {/* COMPLETE RBI BENCHMARK POLICY RATES TABLE */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="size-5 text-amber-500" aria-hidden="true" />
                Complete RBI Policy & Reserve Ratios Matrix (2026)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All benchmark interest rates and statutory reserve requirements determined under the RBI Act and BR Act.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Updated: August 2026</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-navy text-white text-left">
                <tr>
                  <th className="px-4 py-3 font-bold text-white">Rate / Reserve Ratio</th>
                  <th className="px-4 py-3 font-bold text-center text-white">Current Rate</th>
                  <th className="px-4 py-3 font-bold text-center text-white">Previous Rate</th>
                  <th className="px-4 py-3 font-bold text-white">Purpose / Operational Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
                    Policy Repo Rate
                  </td>
                  <td className="px-4 py-3 text-center font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">{repoRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 tabular-nums">5.25%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Rate at which RBI injects liquidity to commercial banks against securities.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">Standing Deposit Facility (SDF)</td>
                  <td className="px-4 py-3 text-center font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">{sdfRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 tabular-nums">5.00%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Floor rate for absorbing uncollateralised surplus liquidity from banks.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">Marginal Standing Facility (MSF)</td>
                  <td className="px-4 py-3 text-center font-extrabold text-purple-700 dark:text-purple-400 tabular-nums">{msfRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 tabular-nums">5.50%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Penal ceiling rate for emergency overnight borrowing by banks.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">Bank Rate</td>
                  <td className="px-4 py-3 text-center font-extrabold text-purple-700 dark:text-purple-400 tabular-nums">{msfRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 tabular-nums">5.50%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Standard rate for long-term lending & statutory penalty calculations.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">Fixed Reverse Repo Rate</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300 tabular-nums">3.35%</td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 tabular-nums">3.35%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Legacy facility under LAF (largely superseded by the SDF window).</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">Cash Reserve Ratio (CRR)</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300 tabular-nums">4.50%</td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 tabular-nums">4.50%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Mandatory cash balance banks must maintain with the RBI as % of NDTL.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">Statutory Liquidity Ratio (SLR)</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300 tabular-nums">18.00%</td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 tabular-nums">18.00%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Mandatory reserve invested in approved gold, cash, and G-Secs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* MAJOR BANKS REPO-LINKED HOME LOAN RATES (EBLR) */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="size-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              Major Banks Repo-Linked Lending Rates (EBLR & RLLR)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current floating home loan interest rate bands across top Indian lenders linked to the <span className="tabular-nums font-semibold">{repoRate}</span> Repo Rate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { bank: 'State Bank of India (SBI)', type: 'EBLR Benchmark', band: '8.50% – 9.15%', spread: 'Repo + 3.25% onwards' },
              { bank: 'HDFC Bank', type: 'Repo Benchmark Rate', band: '8.55% – 9.25%', spread: 'Repo + 3.30% onwards' },
              { bank: 'ICICI Bank', type: 'I-EBLR', band: '8.60% – 9.30%', spread: 'Repo + 3.35% onwards' },
              { bank: 'Punjab National Bank (PNB)', type: 'RLLR Benchmark', band: '8.45% – 9.10%', spread: 'Repo + 3.20% onwards' },
              { bank: 'Bank of Baroda (BoB)', type: 'BRLLR', band: '8.40% – 9.05%', spread: 'Repo + 3.15% onwards' },
              { bank: 'Axis Bank', type: 'Repo Linked EBLR', band: '8.65% – 9.35%', spread: 'Repo + 3.40% onwards' },
            ].map(b => (
              <div key={b.bank} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors space-y-1.5">
                <p className="font-heading font-bold text-sm text-slate-900 dark:text-white">{b.bank}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{b.type}</span>
                  <span className="font-heading font-extrabold text-sm text-blue-700 dark:text-blue-400 tabular-nums">{b.band}</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{b.spread}</p>
              </div>
            ))}
          </div>
        </section>

        {/* REVERSE REPO RATE VS SDF EXPLAINER (Captures Position 11.4 'reverse repo rate 2026' queries) */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300">
                <TrendingDown className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                  What is the Current Reverse Repo Rate in India (2026)?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fixed Reverse Repo (3.35%) vs Standing Deposit Facility (SDF at {sdfRate}) Explained
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0 self-start sm:self-auto">
              Operative Floor: {sdfRate}
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Many market participants and loan applicants search for India&apos;s current &quot;reverse repo rate&quot;. In the modern RBI operating framework, liquidity absorption is managed primarily through the <strong>Standing Deposit Facility (SDF)</strong> rather than the legacy Fixed Reverse Repo window:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                  1. Standing Deposit Facility (SDF) — {sdfRate}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                  Operative Floor
                </span>
              </div>
              <p className="text-xs text-emerald-900/85 dark:text-emerald-300/85 leading-relaxed">
                Introduced in April 2022, the SDF rate is set 25 basis points below the policy repo rate (currently <strong className="tabular-nums">{sdfRate}</strong>). When commercial banks deposit surplus funds overnight with the RBI, they receive {sdfRate}. Critically, the RBI does not need to provide government securities (G-Secs) as collateral for SDF deposits.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-sm">
                  2. Fixed Reverse Repo Rate — 3.35%
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                  Collateralized Window
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The legacy Fixed Reverse Repo Rate remains on the books at <strong className="tabular-nums">3.35%</strong>. Because 3.35% is significantly lower than the {sdfRate} SDF rate, banks do not park discretionary surplus cash through this facility. It remains retained in the RBI&apos;s regulatory architecture for specific collateralized liquidity actions.
              </p>
            </div>
          </div>
        </section>

        {/* RATE HISTORY TABLE */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-heading font-bold text-navy dark:text-white flex items-center gap-2">
                <Percent className="size-5 text-amber-500" aria-hidden="true" />
                RBI Repo Rate History — Multi-Year Track Record
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chronological record of Monetary Policy Committee decisions, rate changes, and policy stances.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left px-4 py-3 font-semibold text-white">MPC Meeting</th>
                  <th className="text-center px-4 py-3 font-semibold text-white">Repo Rate</th>
                  <th className="text-center px-4 py-3 font-semibold text-white">Change</th>
                  <th className="text-left px-4 py-3 font-semibold text-white">Policy Stance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {history.map((entry: any, i: number) => (
                  <tr key={entry.id} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                    <td className="px-4 py-3 font-medium text-navy dark:text-slate-200">{entry.meeting_name?.replace(/62st/gi, '62nd')}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-700 dark:text-blue-400 tabular-nums">{entry.repo_rate}</td>
                    <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                      {entry.change_direction === 'cut' ? '⬇️' : entry.change_direction === 'hike' ? '⬆️' : '⏸'} {entry.change_amount || 'Unchanged'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{entry.stance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            * Historical rates compiled from official RBI Monetary Policy statements and gazettes.
          </p>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white flex items-center gap-2">
              <HelpCircle className="size-6 text-amber-500" aria-hidden="true" />
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authoritative answers regarding current repo rates, MPC bi-monthly schedules, and bank lending impact.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is the current RBI repo rate in India today (2026)?',
                a: `The current RBI repo rate is ${repoRate}. It was reaffirmed at the 62nd Monetary Policy Committee (MPC) meeting held from August 3 to 5, 2026, under the chairmanship of Governor Shri Sanjay Malhotra. The MPC voted unanimously (6-0) to maintain a Neutral stance. Because the MPC reviews rates bi-monthly, ${repoRate} remains India's active statutory benchmark rate until the next MPC meeting in October 2026.`,
              },
              {
                q: 'Why does the RBI repo rate only change every 2 to 3 months?',
                a: 'Under Section 45ZB of the Reserve Bank of India Act, 1934, the Monetary Policy Committee is statutory mandated to meet at least four times a year, operating on a bi-monthly schedule (every 2 months: February, April, June, August, October, December). Rate decisions remain active throughout the two-month interim between meetings unless an extraordinary off-cycle meeting is convened.',
              },
              {
                q: 'When is the next RBI MPC meeting in 2026?',
                a: `The next RBI Monetary Policy Committee meeting is scheduled for ${nextMpc}. The 3-day meeting begins with internal evaluations, concluding on the final day with the policy statement announcement by the Governor at 10:00 AM IST. Detailed meeting minutes are published 14 days later.`,
              },
              {
                q: 'What is the difference between Repo Rate, SDF Rate, and Fixed Reverse Repo Rate?',
                a: `The Repo Rate (${repoRate}) is the rate at which RBI lends short-term liquidity to banks against collateral. The Standing Deposit Facility (SDF) rate (${sdfRate}) is the operative floor rate at which banks deposit surplus funds with RBI without collateral. The Fixed Reverse Repo Rate (3.35%) is a legacy facility largely superseded by the SDF window.`,
              },
              {
                q: 'What is the current Bank Rate in India, and how does it affect MSMEs?',
                a: `The current Bank Rate is ${msfRate} (aligned with the Marginal Standing Facility rate). Beyond emergency bank borrowing, the Bank Rate serves as the statutory benchmark for commercial penalties. For example, under Section 16 of the MSMED Act, 2006, delayed payments to registered MSMEs attract mandatory compound monthly interest at three times the Bank Rate (${(parseFloat(msfRate) * 3).toFixed(2)}% p.a.).`,
              },
              {
                q: 'How does the current repo rate affect floating home loan EMIs?',
                a: `All floating-rate retail loans (home and personal loans) sanctioned by commercial banks are mandated by the RBI to be linked to External Benchmark Lending Rates (EBLR). With the repo rate at ${repoRate}, home loan interest rates average between 8.40% and 9.35% p.a. across major lenders (SBI, HDFC Bank, ICICI Bank), keeping monthly borrower EMIs stable.`,
              },
              {
                q: 'What were the GDP growth and inflation forecasts in the 62nd MPC resolution?',
                a: 'For FY 2026-27, the RBI MPC projected real GDP growth at 6.7% (Q1: 7.0%, Q2: 6.4%, Q3: 6.5%, Q4: 6.8%) and headline CPI inflation at 5.0% (Q2: 4.7%, Q3: 5.9%, Q4: 5.5%).',
              }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-amber-300 dark:hover:border-amber-700/50 bg-slate-50/30 dark:bg-slate-800/20 transition-colors">
                <p className="font-heading font-bold text-slate-900 dark:text-white text-sm mb-2">Q: {faq.q}</p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED ARTICLES & FINANCIAL TOOLS */}
        <section className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-navy dark:text-white text-base flex items-center gap-2">
              <FileText className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              In-Depth RBI Analysis & Related Financial Intelligence
            </h3>
            <Link href="/category/rbi" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
              View All RBI Updates →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Latest August 2026 MPC Meeting Analysis Card */}
            <Link
              href="/updates/rbi-monetary-policy-august-2026-repo-rate-unchanged"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/60 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-2 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
                    Latest MPC Analysis (62nd)
                  </span>
                  <ArrowRight className="size-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                </div>
                <p className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mt-1.5">
                  RBI MPC August 2026 Meeting — Detailed Analysis
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Full member-wise voting breakdown, GDP & inflation trajectory, neutral policy stance analysis, and borrower EMI impacts.
                </p>
              </div>
            </Link>

            {/* Board Resolution for Bank Loan / Facility */}
            <Link
              href="/documents/board-resolution-bank-loan"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all group flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                    <Building2 className="size-3" aria-hidden="true" />
                    Legal Template
                  </span>
                  <ArrowRight className="size-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                </div>
                <p className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mt-1.5">
                  Board Resolution for Bank Loan & Credit Facilities
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ready-to-use Companies Act compliant board resolution draft for availing term loans and cash credit from commercial banks.
                </p>
              </div>
            </Link>

            {/* All Corporate Compliance Tools */}
            <Link
              href="/tools"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all group flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <Calculator className="size-3" aria-hidden="true" />
                    Free Calculators
                  </span>
                  <ArrowRight className="size-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                </div>
                <p className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mt-1.5">
                  Corporate Compliance & Fee Calculators
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Access ROC fee calculators, CIN decoder, MSME fee estimators, and corporate governance toolkits.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* DISCLAIMER & OFFICIAL ATTRIBUTION */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p>
            Last updated: {cleanRateDate} · Official Source: Reserve Bank of India Press Release No. 2026-2027/809
          </p>
          <p>
            Disclaimer: Content provided for informational and corporate compliance intelligence purposes. For official regulatory circulars, visit rbi.org.in.
          </p>
        </div>

      </div>
    </div>
  )
}
