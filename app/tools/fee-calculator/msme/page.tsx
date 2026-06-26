import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import MSMEFeeCalc from '../components/MSMEFeeCalc'
import MSMEFAQ from './MSMEFAQ'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'MSME Delayed Payment Interest Calculator | Section 16 MSMED Act',
  description: 'Calculate compound interest on delayed payments to Micro and Small Enterprises exactly as per Section 16 of the MSMED Act (3x RBI Bank Rate).',
  keywords: ['MSME interest calculator', 'MSMED Act Section 16', 'delayed payment calculator', 'MSME Samadhaan interest', '3x Bank Rate calculator'],
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator/msme',
  },
}

const msmeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/msme#softwareapplication',
      name: 'MSME Delayed Payment Interest Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR'
      },
      description: 'Calculate the exact delayed payment compound interest owed to MSMEs under Section 16 of the MSMED Act.',
      featureList: [
        'Section 16 MSMED Act Compliance',
        '3x RBI Bank Rate Compound Interest',
        'Monthly Rest Calculation',
        'Principal + Interest Payable tracking'
      ]
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
        { '@type': 'ListItem', position: 3, name: 'Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator' },
        { '@type': 'ListItem', position: 4, name: 'MSME Interest Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator/msme' }
      ]
    }
  ]
}

function MSMESEO() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        Understanding MSME Delayed Payment Rules (Section 16, MSMED Act)
      </h2>
      <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
        The Micro, Small and Medium Enterprises Development (MSMED) Act, 2006 contains stringent provisions to protect micro and small suppliers from delayed payments by large buyers. These rules ensure that MSMEs maintain healthy working capital cycles.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
        <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-200 dark:border-purple-900/30 shadow-sm">
          <h3 className="font-bold text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">⏱️</span>
            The 45-Day Rule
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Under Section 15 of the MSMED Act, buyers must make payments on or before the date agreed upon in writing. However, this agreed-upon period <strong>cannot exceed 45 days</strong> from the day of acceptance.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm">
          <h3 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">📈</span>
            3x Bank Rate Penalty
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            If payment is delayed beyond 45 days, the buyer is legally obligated under Section 16 to pay compound interest with monthly rests at <strong>three times (3x) the bank rate</strong> notified by the RBI.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-navy dark:text-white mt-8 mb-4">
        Additional Repercussions for Defaults
      </h3>
      <ul className="list-disc pl-6 space-y-3 text-slate-600 dark:text-slate-300">
        <li><strong>No Income Tax Deduction:</strong> Any interest paid or payable to MSMEs under these rules is expressly disallowed as a deduction when calculating the buyer's taxable income (Section 23).</li>
        <li><strong>Statutory Reporting:</strong> Companies must disclose the exact principal amount and interest owed to MSMEs in their annual financial statements and half-yearly via the <strong>MSME-1 form</strong>.</li>
        <li><strong>Samadhaan Portal:</strong> MSMEs can file cases directly on the MSME Samadhaan portal. The Facilitation Council can order the buyer to pay the principal along with the penal interest calculated above.</li>
      </ul>
    </article>
  )
}

async function getSettings() {
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['msf_rate', 'next_mpc_date'])

  const settings: Record<string, string> = {}
  data?.forEach(row => {
    settings[row.key] = row.value || ''
  })
  return settings
}

export default async function MSMEFeePage() {
  const settings = await getSettings()
  // msf_rate is stored like "6.75%" so we parse it
  const msfRateStr = settings.msf_rate ? settings.msf_rate.replace('%', '') : '6.75'
  const nextMpcDate = settings.next_mpc_date || 'TBD'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={msmeJsonLd as any} />
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link href="/tools/fee-calculator" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to Calculator Hub
          </Link>
          <div className="inline-flex items-center gap-2 bg-purple-400/20 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider block w-max">
            ✓ MSMED Act Section 16
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            MSME Interest Calculator
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-2">
            Calculate the exact delayed payment compound interest owed to MSMEs under the MSME Samadhaan scheme.
          </p>
          <p className="text-slate-500 text-sm">
            Current RBI Bank Rate: <strong className="text-amber-400">{msfRateStr}%</strong> (Next MPC Date: {nextMpcDate})
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 mb-16">
          <MSMEFeeCalc initialBankRate={msfRateStr} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <MSMESEO />
        <MSMEFAQ />
      </div>
    </div>
  )
}
