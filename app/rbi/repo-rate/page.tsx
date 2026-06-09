import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getRateSettings()
  const rate = settings.current_repo_rate || '5.25%'
  const date = settings.current_repo_rate_date || 'April 2026'
  return {
    title: `Current RBI Repo Rate ${new Date().getFullYear()} — ${rate} (${date})`,
    description: `Current RBI repo rate is ${rate} as of ${date} MPC meeting. Complete rate history, next MPC meeting date, and impact on home loans and EMIs.`,
    keywords: [
      'current repo rate',
      `rbi repo rate ${new Date().getFullYear()}`,
      'current rbi repo rate',
      'repo rate today india',
      'rbi monetary policy rate',
      `repo rate ${date.toLowerCase()}`,
      'current repo rate india',
    ],
    alternates: { canonical: 'https://www.corplawupdates.in/rbi/repo-rate' },
    openGraph: {
      title: `Current RBI Repo Rate ${new Date().getFullYear()} — ${rate}`,
      description: `RBI repo rate is ${rate} (${date}). Next MPC meeting details inside.`,
      url: 'https://www.corplawupdates.in/rbi/repo-rate',
    },
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
    .select('*')
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
  const rateDate = settings.current_repo_rate_date || 'April 2026'
  const nextMpc = settings.next_mpc_date || 'June 3-5, 2026'
  const stance = settings.mpc_stance || 'Neutral'
  const sdfRate = settings.sdf_rate || '5.00%'
  const msfRate = settings.msf_rate || '5.50%'

  return (
    <div>
      {/* HERO */}
      <div className="bg-navy py-10 px-4 text-center">
        <p className="text-slate-400 text-sm mb-2 uppercase tracking-wide">
          Reserve Bank of India — Current Policy Rate
        </p>
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-3">
          {repoRate}
        </h1>
        <p className="text-amber-400 font-semibold text-xl mb-2">
          Current RBI Repo Rate
        </p>
        <p className="text-slate-300 text-sm">
          Decided at 61st MPC Meeting · {rateDate} · Unchanged · {stance} Stance
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Repo Rate', value: repoRate, color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'SDF Rate', value: sdfRate, color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'MSF / Bank Rate', value: msfRate, color: 'bg-purple-50 border-purple-200 text-purple-700' },
            { label: 'Stance', value: stance, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl border p-4 text-center ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-1 opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* NEXT MPC */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
          <span className="text-2xl flex-shrink-0">📅</span>
          <div>
            <p className="font-bold text-amber-900">
              Next MPC Meeting — {nextMpc}
            </p>
            <p className="text-amber-700 text-sm mt-1">
              The next Monetary Policy Committee meeting is scheduled for {nextMpc}. A rate cut is possible if West Asia conflict eases and crude prices stabilize.
            </p>
          </div>
        </div>

        {/* RATE HISTORY TABLE */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-navy mb-4">
            📊 RBI Repo Rate History — Last 3 Years
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left px-4 py-3 font-semibold text-white">MPC Meeting</th>
                  <th className="text-center px-4 py-3 font-semibold text-white">Repo Rate</th>
                  <th className="text-center px-4 py-3 font-semibold text-white">Change</th>
                  <th className="text-left px-4 py-3 font-semibold text-white">Stance</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {history.map((entry: any, i: number) => (
                  <tr key={entry.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 font-medium text-navy">{entry.meeting_name}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-700">{entry.repo_rate}</td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {entry.change_direction === 'cut' ? '⬇️' : entry.change_direction === 'hike' ? '⬆️' : '⏸'} {entry.change_amount}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{entry.stance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            * Historical rates may vary. Always verify with RBI official portal.
          </p>
        </section>

        {/* IMPACT ON LOANS */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-navy mb-4">
            🏠 How Repo Rate Affects You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: '🏠',
                title: 'Home Loan Borrowers',
                text: `Repo rate at ${repoRate} means home loan rates are around 8.5-9.5%. EMIs remain stable until next MPC change.`,
                color: 'bg-blue-50 border-blue-200',
              },
              {
                icon: '🏦',
                title: 'Fixed Deposit Holders',
                text: 'FD rates remain stable. Good time to lock in current rates for 1-3 year tenure.',
                color: 'bg-green-50 border-green-200',
              },
              {
                icon: '🏭',
                title: 'Business / MSME',
                text: 'No additional borrowing cost. However, high energy and input costs continue due to West Asia conflict.',
                color: 'bg-amber-50 border-amber-200',
              },
              {
                icon: '📈',
                title: 'Equity Investors',
                text: 'June 2026 MPC held rates steady at 5.25%. Market now watching August 4-6, 2026 MPC — a rate cut is possible if inflation stays within the 2-6% band.',
                color: 'bg-purple-50 border-purple-200',
              },
            ].map(card => (
              <div key={card.title} className={`p-5 rounded-xl border ${card.color}`}>
                <p className="text-2xl mb-2">{card.icon}</p>
                <p className="font-bold text-navy text-sm mb-1">{card.title}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-navy mb-4">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'What is the current RBI repo rate in 2026?',
                a: `The current RBI repo rate is ${repoRate} as decided in the 61st MPC meeting held June 4-6, 2026. The rate has been unchanged since the February 2026 MPC meeting when RBI cut rates by 25 bps.`,
              },
              {
                q: 'When is the next RBI MPC meeting in 2026?',
                a: `The next RBI Monetary Policy Committee (MPC) meeting is scheduled for ${nextMpc}. The decision will be announced on the last day of the meeting.`,
              },
              {
                q: 'Did RBI cut repo rate in June 2026?',
                a: 'No. RBI kept the repo rate unchanged at 5.25% in the June 2026 (61st MPC) meeting. The MPC maintained a Neutral stance. The next opportunity for a rate cut is the August 4-6, 2026 MPC meeting.',
              },
              {
                q: 'What is the difference between repo rate and reverse repo rate?',
                a: `Repo rate is the rate at which RBI lends money to commercial banks. The Standing Deposit Facility (SDF) rate has replaced the reverse repo rate — currently at ${sdfRate}, at which banks park excess funds with RBI.`,
              },
              {
                q: 'How does repo rate affect home loan EMI?',
                a: `When RBI increases repo rate, banks increase their lending rates, making home loans expensive. When repo rate decreases, home loan rates fall and EMIs reduce. With repo rate at ${repoRate}, home loan rates are approximately 8.5-9.5%.`,
              },
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-5">
                <p className="font-bold text-navy text-sm mb-2">Q: {faq.q}</p>
                <p className="text-slate-600 text-sm leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED LINKS */}
        <section className="bg-slate-50 rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-navy mb-3">📚 Related RBI Updates</h3>
          <div className="space-y-2">
            <Link
              href="/updates/rbi-mpc-repo-rate-june-2026"
              className="block text-amber-600 hover:underline text-sm font-semibold"
            >
              → RBI MPC June 2026 Meeting — Full Analysis (61st MPC)
            </Link>
            <Link
              href="/updates/rbi-keeps-repo-rate-unchanged-at-525-mpc-april-2026-meeting-key-highlights"
              className="block text-amber-600 hover:underline text-sm"
            >
              → RBI MPC April 2026 Meeting — Full Analysis (60th MPC)
            </Link>
            <Link href="/category/rbi" className="block text-amber-600 hover:underline text-sm">
              → All RBI Updates 2026
            </Link>
            <Link href="/calendar" className="block text-amber-600 hover:underline text-sm">
              → RBI Compliance Calendar 2026
            </Link>
          </div>
        </section>

        {/* DISCLAIMER */}
        <p className="text-xs text-slate-400 text-center">
          Last updated: {rateDate} · Source: RBI Press Releases · Not financial advice
        </p>

      </div>
    </div>
  )
}
