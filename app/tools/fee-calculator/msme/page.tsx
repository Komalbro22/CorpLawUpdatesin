import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import MSMEFeeCalc from '../components/MSMEFeeCalc'
import MSMEFAQ from './MSMEFAQ'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'MSME Delayed Payment Interest Calculator | Section 16 MSMED Act',
  description: 'Calculate statutory compound interest with monthly rests on delayed payments to Micro and Small Enterprises under Section 16 of the MSMED Act (3x RBI Bank Rate).',
  keywords: ['MSME interest calculator', 'MSMED Act Section 16', 'delayed payment calculator', 'MSME Samadhaan interest', '3x Bank Rate calculator', 'Section 15 MSME'],
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator/msme',
  },
}

const msmeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/msme#webapplication',
      name: 'MSME Delayed Payment Interest Calculator',
      url: 'https://www.corplawupdates.in/tools/fee-calculator/msme',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR'
      },
      description: 'Calculate statutory delayed payment compound interest owed to Micro and Small Enterprises under Section 16 of the MSMED Act (3x RBI Bank Rate with calendar monthly rests).',
      featureList: [
        'Section 16 MSMED Act Statutory Compounding Engine',
        '3x RBI Bank Rate Compound Interest Calculation',
        'Calendar Monthly Rests with Anchor-Preserved Date Math',
        'Section 15 45-Day Statutory Agreement Cap Enforcement',
        'Section 2(b) Day 16 Appointed Day Date-Counting',
        'Supplier Eligibility Evaluator (Micro, Small, Medium, Traders)',
        'Section 23 & 43B(h) Income Tax Disallowance Audit Notes',
        'Downloadable Multi-Page Calculation PDF Report'
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
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/msme#faq',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How is MSME delayed payment interest calculated under Section 16 of the MSMED Act?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Under Section 16 of the MSMED Act, 2006, interest on delayed payments to Micro and Small enterprises is calculated as compound interest with monthly rests at three times (3x) the Bank Rate notified by the Reserve Bank of India. The rate compounds at the end of each calendar monthly rest on the opening balance of principal plus accumulated interest.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the statutory deadline to pay a Micro or Small enterprise under Section 15?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Under Section 15 of the MSMED Act, 2006, the buyer must make payment on or before the contractually agreed date in writing, which cannot exceed 45 days from the day of acceptance or deemed acceptance. In the absence of a written agreement, payment is mandatory before the Appointed Day (within 15 calendar days of delivery).'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the Appointed Day under Section 2(b) of the MSMED Act?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Under Section 2(b) of the MSMED Act, the Appointed Day is defined as the day following immediately after the expiry of the period of 15 days from the day of acceptance or deemed acceptance (i.e. Day 16). Where no written agreement exists, interest begins to accrue automatically from the Appointed Day.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can buyers agree in writing to credit terms longer than 45 days?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No. The proviso to Section 15 of the MSMED Act explicitly mandates that the period of credit agreed upon between the buyer and the supplier shall in no case exceed 45 days. Any contractual clause providing credit terms beyond 45 days is void in law, and statutory interest accrues from Day 46 onward.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can MSME delayed payment interest be claimed as an income tax deduction?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No. Under Section 23 of the MSMED Act, 2006, any interest paid or payable by a buyer under Section 16 is expressly disallowed as an expenditure and cannot be deducted from business profits when computing taxable income under the Income Tax Act, 1961.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How does Section 43B(h) of the Income Tax Act impact MSME payments?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Section 43B(h) of the Income Tax Act, 1961 stipulates that any sum payable to a Micro or Small enterprise beyond the Section 15 statutory time limit (15 days without agreement or up to 45 days with agreement) is disallowed in the financial year of accrual and is allowable as a deduction only in the previous year in which it is actually paid.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Are Medium Enterprises entitled to claim 3x Bank Rate compound interest under Chapter V?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No. Chapter V of the MSMED Act, 2006 (Sections 15 to 25) applies exclusively to Micro and Small Enterprises. Medium Enterprises are statutory exclusions from MSEFC facilitation and 3x Bank Rate compounding remedies.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the 75% pre-deposit requirement under Section 19 of the MSMED Act?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Under Section 19 of the MSMED Act, no court or appellate authority can entertain any application from a buyer to set aside an MSEFC decree, award, or order unless the buyer first deposits 75% of the total awarded amount (including accrued compound interest) with the court.'
          }
        }
      ]
    }
  ]
}

function MSMESEO() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        Statutory Framework for MSME Delayed Payment Interest (Sections 15–25, MSMED Act, 2006)
      </h2>

      <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
        Chapter V of the <strong>Micro, Small and Medium Enterprises Development (MSMED) Act, 2006</strong> contains an overriding statutory mechanism designed to protect registered Micro and Small Enterprises (MSEs) from commercial payment defaults and working capital erosion. Under Sections 15 and 16, buyers who delay settlements beyond mandatory credit windows are liable to pay <strong>compound interest with monthly rests at three times (3x) the Reserve Bank of India (RBI) Bank Rate</strong>.
      </p>

      {/* Core Statutory Pillars Callout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-8 not-prose">
        <div className="bg-purple-50 dark:bg-purple-950/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-900/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-bold text-purple-900 dark:text-purple-200 text-sm">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">⏱️</span>
            Statutory Payment Limits (Section 15)
          </div>
          <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
            Payment must be completed on or before the contractually agreed date in writing, which <strong>cannot exceed 45 calendar days</strong> from delivery. If no written agreement exists, payment is legally due before the <strong>Appointed Day (within 15 calendar days)</strong>.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-bold text-red-900 dark:text-red-200 text-sm">
            <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">📈</span>
            3x RBI Bank Rate Compounding (Section 16)
          </div>
          <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
            Delayed amounts attract mandatory compound interest with calendar monthly rests at <strong>3x the RBI Bank Rate</strong>. With the current RBI Bank Rate at <strong>5.50%</strong>, the applicable statutory interest rate is <strong>16.50% p.a.</strong>
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">🚫</span>
            Tax Disallowance (Section 23 &amp; 43B(h))
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Under Section 23 of the MSMED Act, interest paid or payable is <strong>strictly non-deductible</strong> from business income. Under Section 43B(h) of the Income Tax Act, delayed principal amounts are disallowed in the year of accrual.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-bold text-blue-900 dark:text-blue-200 text-sm">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">⚖️</span>
            MSEFC Recovery &amp; 75% Pre-Deposit (Section 18 &amp; 19)
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            Suppliers can file claims on the MSME Samadhaan portal. Under Section 19, buyers challenging an MSEFC award before courts must mandatorily deposit <strong>75% of the total awarded amount</strong>.
          </p>
        </div>
      </div>

      {/* Section 15 Payment Timeline Breakdown */}
      <h3 className="text-xl font-bold text-navy dark:text-white mt-10 mb-4">
        1. Payment Timelines &amp; The 45-Day Statutory Ceiling (Section 15)
      </h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        Section 15 of the MSMED Act regulates the maximum credit period a buyer can avail when purchasing goods or obtaining services from a Micro or Small supplier. The law bifurcates transactions into two clear scenarios:
      </p>

      <div className="overflow-x-auto my-4 not-prose">
        <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3 font-semibold">Contractual Scenario</th>
              <th className="p-3 font-semibold">Statutory Due Date</th>
              <th className="p-3 font-semibold">Interest Accrual Date</th>
              <th className="p-3 font-semibold">Legal Provision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <td className="p-3 font-medium">No Written Agreement</td>
              <td className="p-3">Day 15 from delivery / acceptance</td>
              <td className="p-3 text-red-600 dark:text-red-400 font-semibold">Day 16 (Appointed Day)</td>
              <td className="p-3">Section 15 (Main Body)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium">Written Agreement (&le; 45 Days)</td>
              <td className="p-3">Contractually agreed date</td>
              <td className="p-3 text-red-600 dark:text-red-400 font-semibold">Day immediately following agreed date</td>
              <td className="p-3">Section 15 (Main Body)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-amber-700 dark:text-amber-400">Written Agreement (&gt; 45 Days)</td>
              <td className="p-3 font-semibold text-purple-700 dark:text-purple-300">Day 45 (Capped by Statute)</td>
              <td className="p-3 text-red-600 dark:text-red-400 font-semibold">Day 46 onward</td>
              <td className="p-3">Proviso to Section 15</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
        * Note: Contractual credit clauses purporting to allow 60, 90, or 120 days of credit are void ab initio to the extent they exceed 45 days, per the overriding non-obstante effect of Section 24 of the MSMED Act.
      </p>

      {/* Appointed Day Section */}
      <h3 className="text-xl font-bold text-navy dark:text-white mt-10 mb-4">
        2. Date-Counting Analysis: What is the "Appointed Day" (Section 2(b))?
      </h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        Under Section 2(b) of the MSMED Act, 2006, the <strong>"Appointed Day"</strong> is defined as <em>"the day following immediately after the expiry of the period of fifteen days from the day of acceptance or the day of deemed acceptance of any goods supplied or services rendered by a supplier."</em>
      </p>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        Under Section 9 of the General Clauses Act, 1897, the date of delivery/acceptance represents <strong>Day 0</strong>. Days 1 through 15 constitute the statutory grace period. <strong>Day 16 is the Appointed Day</strong>. If payment is made on or before Day 15, zero interest is payable. If the buyer defaults on Day 15, interest begins accruing from Day 16 (the Appointed Day).
      </p>

      {/* Written Objections */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 my-4 space-y-2">
        <p className="font-bold text-navy dark:text-white">⚖️ Deemed Acceptance vs. Written Objection Rules (Section 2(b) Explanation):</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
          <li><strong>Deemed Acceptance:</strong> Where no objection is made in writing within 15 days of delivery, the date of actual delivery is legally deemed to be the date of acceptance.</li>
          <li><strong>Timely Written Objection:</strong> If the buyer serves a written objection regarding defect/quality within 15 days of delivery, the date on which the objection is resolved by the supplier becomes the effective Date of Acceptance.</li>
          <li><strong>Late Objection (&gt; 15 Days):</strong> Objections raised after 15 days from delivery are legally ineffective to postpone the acceptance date, and deemed acceptance defaults to the original delivery date.</li>
        </ul>
      </div>

      {/* Section 16 Interest Formula */}
      <h3 className="text-xl font-bold text-navy dark:text-white mt-10 mb-4">
        3. The Compounding Engine &amp; 3x RBI Bank Rate Formula (Section 16)
      </h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        Section 16 of the MSMED Act mandates that interest on delayed payments is not computed on simple interest terms; instead, it requires <strong>compound interest calculated with monthly rests</strong> at exactly <strong>three times the Bank Rate notified by the RBI</strong>.
      </p>

      <div className="p-5 bg-navy text-white rounded-2xl my-5 font-mono text-xs leading-relaxed overflow-x-auto not-prose shadow-lg">
        <p className="text-amber-400 font-bold mb-2">// Statutory Monthly Compounding Equation (Section 16)</p>
        <p className="text-slate-300">Statutory Rate (r) = 3 × RBI Bank Rate</p>
        <p className="text-slate-300">Monthly Interest (I) = P_opening × (r / 100 / 12) × (Days_in_Period / Days_in_Month)</p>
        <p className="text-slate-300">Next Rest Principal (P_next) = P_opening + I</p>
      </div>

      {/* Numerical Walkthrough Example */}
      <h3 className="text-xl font-bold text-navy dark:text-white mt-10 mb-4">
        4. Step-by-Step Calculation Example
      </h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        Consider a commercial invoice of <strong>₹10,00,000</strong> delivered on <strong>1 January 2026</strong> with no written agreement. Payment is delayed and settled on <strong>1 April 2026</strong>.
      </p>

      <div className="overflow-x-auto my-4 not-prose">
        <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-2.5 font-semibold">Monthly Rest</th>
              <th className="p-2.5 font-semibold">Period Range</th>
              <th className="p-2.5 font-semibold text-right">Days</th>
              <th className="p-2.5 font-semibold text-right">Annual Rate</th>
              <th className="p-2.5 font-semibold text-right">Opening Balance</th>
              <th className="p-2.5 font-semibold text-right">Period Interest</th>
              <th className="p-2.5 font-semibold text-right">Closing Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            <tr>
              <td className="p-2.5 font-sans font-medium">Month 1</td>
              <td className="p-2.5">17 Jan 2026 &rarr; 17 Feb 2026</td>
              <td className="p-2.5 text-right">31</td>
              <td className="p-2.5 text-right">16.50%</td>
              <td className="p-2.5 text-right">₹ 10,00,000</td>
              <td className="p-2.5 text-right text-red-600 dark:text-red-400 font-bold">₹ 13,750</td>
              <td className="p-2.5 text-right font-bold">₹ 10,13,750</td>
            </tr>
            <tr>
              <td className="p-2.5 font-sans font-medium">Month 2</td>
              <td className="p-2.5">17 Feb 2026 &rarr; 17 Mar 2026</td>
              <td className="p-2.5 text-right">28</td>
              <td className="p-2.5 text-right">16.50%</td>
              <td className="p-2.5 text-right">₹ 10,13,750</td>
              <td className="p-2.5 text-right text-red-600 dark:text-red-400 font-bold">₹ 13,939</td>
              <td className="p-2.5 text-right font-bold">₹ 10,27,689</td>
            </tr>
            <tr>
              <td className="p-2.5 font-sans font-medium">Month 3</td>
              <td className="p-2.5">17 Mar 2026 &rarr; 1 Apr 2026</td>
              <td className="p-2.5 text-right">15</td>
              <td className="p-2.5 text-right">16.50%</td>
              <td className="p-2.5 text-right">₹ 10,27,689</td>
              <td className="p-2.5 text-right text-red-600 dark:text-red-400 font-bold">₹ 6,864</td>
              <td className="p-2.5 text-right font-bold text-purple-700 dark:text-purple-300">₹ 10,34,553</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Supplier Eligibility & Legal Precedents */}
      <h3 className="text-xl font-bold text-navy dark:text-white mt-10 mb-4">
        5. Supplier Eligibility &amp; Judicial Precedents
      </h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        Not all business entities are legally entitled to claim Section 16 penal interest or initiate arbitration before the MSEFC. Strict statutory eligibility thresholds apply:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <li><strong>Micro &amp; Small Enterprises:</strong> Eligible. Covered under Chapter V of the MSMED Act if registered under Udyam / UAM at the time of supply.</li>
        <li><strong>Medium Enterprises:</strong> Ineligible. Excluded from Chapter V delayed payment interest and MSEFC recovery under Section 18.</li>
        <li><strong>Retail &amp; Wholesale Traders:</strong> While allowed Udyam registration for Priority Sector Lending (PSL) via Ministry OM dated 02.07.2021, MSEFC dispute recovery eligibility remains subject to judicial determination across state High Courts.</li>
        <li><strong>Timing of Registration (<em>Silpi Industries v. KSRTC</em>, 2021 SC):</strong> The Supreme Court of India held that benefits of the MSMED Act can only be claimed if the supplier held valid registration on the date of entering the contract or executing the supply. Registration obtained retrospectively after supply execution does not confer Chapter V statutory benefits.</li>
      </ul>

      {/* Tax & Corporate Filing Implications */}
      <h3 className="text-xl font-bold text-navy dark:text-white mt-10 mb-4">
        6. Income Tax Disallowance (Section 23 &amp; 43B(h)) &amp; Form MSME-1
      </h3>
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>
          <strong>Complete Tax Disallowance (Section 23):</strong> Section 23 of the MSMED Act operates with non-obstante authority over the Income Tax Act, 1961. Any penal interest paid or payable to an MSME under Section 16 cannot be claimed as an expense or deducted from business profits, resulting in pure after-tax financial loss for defaulting buyers.
        </p>
        <p>
          <strong>Year-End Invoice Deduction (Section 43B(h)):</strong> Under Section 43B(h) of the Income Tax Act, payments due to Micro and Small enterprises beyond Section 15 time limits that remain outstanding at year-end are disallowed in that financial year and are taxable until the year of actual payment.
        </p>
        <p>
          <strong>Half-Yearly Corporate Reporting (Form MSME-1):</strong> Under Section 405(4) of the Companies Act, 2013, specified companies having outstanding dues to Micro and Small suppliers exceeding 45 days must file half-yearly returns in Form MSME-1 with the Registrar of Companies (ROC) by 31 October and 30 April.
        </p>
      </div>
    </article>
  )
}

async function getSettings() {
  const { data } = await supabase
    .from('compliance_rates')
    .select('key, rate_value')
    .in('key', ['rbi_bank_rate'])

  const { data: siteData } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['next_mpc_date'])

  const settings: Record<string, string> = {}
  data?.forEach(row => {
    settings[row.key] = String(row.rate_value ?? '')
  })
  siteData?.forEach(row => {
    settings[row.key] = row.value || ''
  })
  return settings
}

export default async function MSMEFeePage() {
  const settings = await getSettings()
  const bankRateStr = settings.rbi_bank_rate ? settings.rbi_bank_rate : '5.50'
  const bankRateNum = parseFloat(bankRateStr) || 5.50
  const msmeRateNum = bankRateNum * 3
  const nextMpcDate = settings.next_mpc_date || 'Scheduled MPC'

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
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
            Calculate statutory compound interest with monthly rests on delayed payments to Micro and Small Enterprises under the MSMED Act.
          </p>
          <p className="text-slate-500 text-sm">
            Current RBI Bank Rate: <strong className="text-amber-400">{bankRateStr}%</strong> → Statutory MSME Rate: <strong className="text-amber-400">{msmeRateNum.toFixed(2)}%</strong> p.a. (Next MPC: {nextMpcDate})
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 mb-16">
          <MSMEFeeCalc initialBankRate={bankRateStr} />
          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            Interest is computed with calendar monthly rests under Section 16 of the MSMED Act, 2006. Multi-period calculations apply verified historical RBI Bank Rates from 5 April 2016 onward.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <MSMESEO />
        <MSMEFAQ />
      </div>
    </div>
  )
}
