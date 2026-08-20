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
  ChevronRight
} from 'lucide-react'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getRateSettings()
  const rate = settings.current_repo_rate || '5.25%'
  const rawDate = settings.current_repo_rate_date || 'August 2026'
  const cleanDate = rawDate.replace(/\(.*?\)/g, '').replace(/62st/gi, '62nd').trim() || 'August 2026'

  return {
    title: `Current RBI Repo Rate 2026 — ${rate} (${cleanDate}, 62nd MPC Meeting)`,
    description: `Current RBI repo rate is ${rate} as decided in the 62nd MPC meeting (August 3-5, 2026). Full analysis, GDP & CPI inflation forecasts, interactive EMI calculator, and October MPC dates.`,
    keywords: [
      'current repo rate',
      'rbi repo rate 2026',
      'current rbi repo rate',
      'repo rate today india',
      '62nd mpc meeting repo rate',
      'rbi monetary policy rate august 2026',
      'repo rate impact on home loan emi',
      'sdf rate rbi',
      'msf rate rbi',
      'crr slr rates rbi',
      'next rbi mpc meeting date',
    ],
    alternates: { canonical: 'https://www.corplawupdates.in/rbi/repo-rate' },
    openGraph: {
      title: `Current RBI Repo Rate 2026 — ${rate} (62nd MPC Meeting)`,
      description: `RBI repo rate remains steady at ${rate} in the 62nd MPC meeting. Unanimous decision, Neutral stance, GDP 6.7%, CPI 5.0%. Read full analysis and calculate your EMI impact.`,
      url: 'https://www.corplawupdates.in/rbi/repo-rate',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Current RBI Repo Rate 2026: ${rate} (62nd MPC)`,
      description: `RBI Monetary Policy Committee keeps repo rate unchanged at ${rate}. Full breakdown, GDP & inflation projections, and EMI calculator.`,
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

  // Schema.org FAQPage structured data for Google Rich Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the current RBI repo rate in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The current RBI repo rate is ${repoRate}, as decided in the 62nd Monetary Policy Committee (MPC) meeting held from August 3 to 5, 2026, under the chairmanship of Governor Shri Sanjay Malhotra. The MPC voted unanimously to keep the policy repo rate unchanged with a Neutral stance.`
        }
      },
      {
        '@type': 'Question',
        name: 'Why did the RBI keep the repo rate unchanged at 5.25% in the August 2026 meeting?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The MPC decided to keep rates unchanged to ensure headline CPI inflation (projected at 5.0% for FY 2026-27) converges durably with the 4% target amid volatile food and fuel prices and geopolitical uncertainties in West Asia, supported by robust real GDP growth projected at 6.7%.'
        }
      },
      {
        '@type': 'Question',
        name: 'When is the next RBI MPC meeting in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The next RBI Monetary Policy Committee meeting is scheduled for ${nextMpc}. The policy resolution will be announced on the final day.`
        }
      },
      {
        '@type': 'Question',
        name: 'What are the current SDF, MSF, Bank Rate, CRR, and SLR rates in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `As of August 2026, the Standing Deposit Facility (SDF) rate is ${sdfRate}, Marginal Standing Facility (MSF) rate is ${msfRate}, Bank Rate is ${msfRate}, Cash Reserve Ratio (CRR) is 4.50%, and Statutory Liquidity Ratio (SLR) is 18.00%.`
        }
      },
      {
        '@type': 'Question',
        name: 'How does the RBI repo rate affect home loan EMIs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Retail floating-rate home loans are pegged to External Benchmark Lending Rates (EBLR), which directly track the RBI repo rate. With the repo rate at ${repoRate}, home loan interest rates average between 8.50% and 9.25% p.a., keeping borrower monthly EMIs steady.`
        }
      }
    ]
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
    <div>
      {/* Schema.org Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      {/* HERO SECTION */}
      <div className="bg-navy py-12 px-4 text-center relative overflow-hidden border-b border-navy-700">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Official Benchmark Policy Rate
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-black text-white tracking-tight">
            {repoRate}
          </h1>

          <p className="text-amber-400 font-heading font-bold text-xl md:text-2xl">
            Current RBI Repo Rate (2026)
          </p>

          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            Decided at the <strong>62nd MPC Meeting (August 3–5, 2026)</strong> · Chaired by Governor Shri Sanjay Malhotra · Unanimous Vote · <strong>{stance} Stance</strong>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* 4 KEY RATE BADGES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Policy Repo Rate', value: repoRate, desc: 'Lending rate to banks', color: 'bg-blue-50 border-blue-200 text-blue-800', badge: 'Key Benchmark' },
            { label: 'Standing Deposit (SDF)', value: sdfRate, desc: 'Absorption floor rate', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'Floor Rate' },
            { label: 'MSF / Bank Rate', value: msfRate, desc: 'Emergency ceiling rate', color: 'bg-purple-50 border-purple-200 text-purple-800', badge: 'Ceiling Rate' },
            { label: 'Policy Stance', value: stance, desc: 'Growth-inflation calibrated', color: 'bg-amber-50 border-amber-200 text-amber-800', badge: 'Unanimous' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border p-5 text-center shadow-sm relative flex flex-col justify-between ${stat.color}`}>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-current/10">
                  {stat.badge}
                </span>
                <div className="text-3xl font-heading font-black mt-2">{stat.value}</div>
              </div>
              <div>
                <p className="text-xs font-bold mt-2">{stat.label}</p>
                <p className="text-[11px] opacity-75 mt-0.5">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 62nd MPC MEETING SUMMARY & OFFICIAL RATIONALE BANNER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Landmark className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-heading font-bold text-slate-900">
                  62nd MPC Meeting Key Decisions & Official Resolution (August 2026)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Resolution of the Monetary Policy Committee published via RBI Press Release No. 2026-2027/809 on August 5, 2026.
              </p>
            </div>
            <a
              href="https://rbidocs.rbi.org.in/rdocs/PressRelease/PDFs/PR80907599DE5FD164918A49085C9D6270116.PDF"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Official RBI PDF (310 KB)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* KEY PROJECTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Real GDP Growth (2026-27)</span>
                <span className="text-lg font-heading font-black text-blue-800">6.7% Projected</span>
              </div>
              <p className="text-xs text-blue-900/80 leading-relaxed">
                Projected quarterly trajectory: <strong>Q1: 7.0%</strong> | <strong>Q2: 6.4%</strong> | <strong>Q3: 6.5%</strong> | <strong>Q4: 6.8%</strong>. Projected at <strong>7.3%</strong> for Q1:2027-28.
              </p>
              <p className="text-[11px] text-blue-700">
                Driven by resilient private consumption, robust services momentum, buoyant capital goods investment, and healthy bank credit flow.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">CPI Inflation (2026-27)</span>
                <span className="text-lg font-heading font-black text-amber-800">5.0% Projected</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Projected quarterly trajectory: <strong>Q2: 4.7%</strong> | <strong>Q3: 5.9% (Peak)</strong> | <strong>Q4: 5.5%</strong>. Projected at <strong>5.3%</strong> for Q1:2027-28.
              </p>
              <p className="text-[11px] text-amber-800">
                Headline inflation rose to 4.4% in June due to food and retail fuel price revisions, while Core Inflation (ex-food/fuel) remained low at 3.9%.
              </p>
            </div>
          </div>

          {/* RATIONALE TEXT */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
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

        {/* INTERACTIVE EMI CALCULATOR COMPONENT */}
        <section>
          <RepoEmiCalculator />
        </section>

        {/* COMPLETE RBI BENCHMARK POLICY RATES TABLE */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Complete RBI Policy & Reserve Ratios Matrix (2026)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All benchmark interest rates and statutory reserve requirements determined under the RBI Act and BR Act.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Updated: August 2026</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-navy text-white text-left">
                <tr>
                  <th className="px-4 py-3 font-bold text-white">Rate / Reserve Ratio</th>
                  <th className="px-4 py-3 font-bold text-center text-white">Current Rate</th>
                  <th className="px-4 py-3 font-bold text-center text-white">Previous Rate</th>
                  <th className="px-4 py-3 font-bold text-white">Purpose / Operational Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-amber-50/50 hover:bg-amber-50">
                  <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Policy Repo Rate
                  </td>
                  <td className="px-4 py-3 text-center font-extrabold text-blue-700">{repoRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500">5.25%</td>
                  <td className="px-4 py-3 text-slate-600">Rate at which RBI injects liquidity to commercial banks against securities.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">Standing Deposit Facility (SDF)</td>
                  <td className="px-4 py-3 text-center font-extrabold text-emerald-700">{sdfRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500">5.00%</td>
                  <td className="px-4 py-3 text-slate-600">Floor rate for absorbing uncollateralised surplus liquidity from banks.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">Marginal Standing Facility (MSF)</td>
                  <td className="px-4 py-3 text-center font-extrabold text-purple-700">{msfRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500">5.50%</td>
                  <td className="px-4 py-3 text-slate-600">Penal ceiling rate for emergency overnight borrowing by banks.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">Bank Rate</td>
                  <td className="px-4 py-3 text-center font-extrabold text-purple-700">{msfRate}</td>
                  <td className="px-4 py-3 text-center text-slate-500">5.50%</td>
                  <td className="px-4 py-3 text-slate-600">Standard rate for long-term lending & statutory penalty calculations.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">Fixed Reverse Repo Rate</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">3.35%</td>
                  <td className="px-4 py-3 text-center text-slate-500">3.35%</td>
                  <td className="px-4 py-3 text-slate-600">Legacy facility under LAF (largely superseded by the SDF window).</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">Cash Reserve Ratio (CRR)</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">4.50%</td>
                  <td className="px-4 py-3 text-center text-slate-500">4.50%</td>
                  <td className="px-4 py-3 text-slate-600">Mandatory cash balance banks must maintain with the RBI as % of NDTL.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">Statutory Liquidity Ratio (SLR)</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">18.00%</td>
                  <td className="px-4 py-3 text-center text-slate-500">18.00%</td>
                  <td className="px-4 py-3 text-slate-600">Mandatory reserve invested in approved gold, cash, and G-Secs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* MAJOR BANKS REPO-LINKED HOME LOAN RATES (EBLR) */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Major Banks Repo-Linked Lending Rates (EBLR & RLLR)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current floating home loan interest rate bands across top Indian lenders linked to the {repoRate} Repo Rate.
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
              <div key={b.bank} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5">
                <p className="font-heading font-bold text-sm text-slate-900">{b.bank}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{b.type}</span>
                  <span className="font-heading font-extrabold text-sm text-blue-700">{b.band}</span>
                </div>
                <p className="text-[11px] text-slate-400">{b.spread}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RATE HISTORY TABLE */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-heading font-bold text-navy flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-500" />
                RBI Repo Rate History — Multi-Year Track Record
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chronological record of Monetary Policy Committee decisions, rate changes, and policy stances.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left px-4 py-3 font-semibold text-white">MPC Meeting</th>
                  <th className="text-center px-4 py-3 font-semibold text-white">Repo Rate</th>
                  <th className="text-center px-4 py-3 font-semibold text-white">Change</th>
                  <th className="text-left px-4 py-3 font-semibold text-white">Policy Stance</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {history.map((entry: any, i: number) => (
                  <tr key={entry.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 font-medium text-navy">{entry.meeting_name?.replace(/62st/gi, '62nd')}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-700">{entry.repo_rate}</td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {entry.change_direction === 'cut' ? '⬇️' : entry.change_direction === 'hike' ? '⬆️' : '⏸'} {entry.change_amount || 'Unchanged'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{entry.stance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            * Historical rates compiled from official RBI Monetary Policy statements and gazettes.
          </p>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-navy flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Common questions answered regarding RBI repo rates, MPC meeting schedules, and home loan impacts.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is the current RBI repo rate in 2026?',
                a: `The current RBI repo rate is ${repoRate}, as confirmed in the 62nd Monetary Policy Committee (MPC) meeting held from August 3 to 5, 2026. The MPC maintained a Neutral policy stance under the chairmanship of Governor Shri Sanjay Malhotra.`,
              },
              {
                q: 'Why did the RBI keep the repo rate unchanged in the August 2026 (62nd MPC) meeting?',
                a: 'The MPC unanimously decided to keep the policy repo rate steady at 5.25% to ensure retail inflation aligns with the 4.0% target on a durable basis. While core inflation remains low, food inflation volatility and global geopolitical tensions in West Asia warrant policy vigilance, backed by resilient domestic GDP growth (projected at 6.7%).',
              },
              {
                q: 'When is the next RBI MPC meeting in 2026?',
                a: `The next RBI Monetary Policy Committee meeting is scheduled for ${nextMpc}. The policy resolution will be announced on the final day, followed by minutes publication within 14 days.`,
              },
              {
                q: 'What is the difference between Repo Rate, SDF Rate, and MSF Rate?',
                a: `The Repo Rate (${repoRate}) is the rate at which RBI lends short-term funds to banks. The Standing Deposit Facility (SDF) rate (${sdfRate}) is the floor rate at which banks deposit excess funds with RBI without collateral. The Marginal Standing Facility (MSF) rate (${msfRate}) is the emergency borrowing ceiling rate.`,
              },
              {
                q: 'How does the repo rate affect home loan EMIs?',
                a: `All floating-rate retail loans (home and auto loans) are mandated by RBI to be linked to External Benchmark Lending Rates (EBLR). When the repo rate is held at ${repoRate}, borrower EMIs remain unchanged and predictable.`,
              },
              {
                q: 'What were the GDP growth and inflation forecasts in the August 2026 policy?',
                a: 'For FY 2026-27, the RBI MPC projected real GDP growth at 6.7% (Q1: 7.0%, Q2: 6.4%, Q3: 6.5%, Q4: 6.8%) and headline CPI inflation at 5.0% (Q2: 4.7%, Q3: 5.9%, Q4: 5.5%).',
              }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-colors">
                <p className="font-heading font-bold text-slate-900 text-sm mb-2">Q: {faq.q}</p>
                <p className="text-slate-600 text-sm leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED ARTICLES & ANALYSIS */}
        <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-navy text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              In-Depth RBI Analysis & Related Coverage
            </h3>
            <Link href="/category/rbi" className="text-xs font-bold text-amber-600 hover:underline">
              View All RBI Updates →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Latest August 2026 MPC Meeting Analysis Card */}
            <Link
              href="/updates/rbi-monetary-policy-august-2026-repo-rate-unchanged"
              className="p-4 rounded-xl bg-white border border-amber-300 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-2 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Latest MPC Analysis (62nd)
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="font-heading font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors mt-1.5">
                  RBI MPC August 2026 Meeting — Detailed Analysis (62nd MPC)
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Full member-wise voting breakdown, GDP & inflation trajectory, neutral policy stance analysis, and borrower EMI impacts.
                </p>
              </div>
            </Link>

            {/* Past MPC Analysis */}
            <Link
              href="/updates/rbi-mpc-repo-rate-june-2026"
              className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-sm transition-all group flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900">
                    Previous MPC Review
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="font-heading font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors mt-1.5">
                  RBI MPC June 2026 Meeting Analysis (61st MPC)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Review the previous June 2026 policy statement, neutral stance decision, and liquidity outlook.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* DISCLAIMER & OFFICIAL ATTRIBUTION */}
        <div className="text-center text-xs text-slate-400 space-y-1 pt-4 border-t border-slate-200">
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
