import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import LLPFeeCalc from '../components/LLPFeeCalc'
import LLPFAQ from './LLPFAQ'

export const metadata: Metadata = {
  title: 'LLP Fee Calculator | Form 11 & Form 8 Penalty Calculator',
  description: 'Calculate indicative LLP filing fees and late filing penalties for Form 8, Form 11, Form 3, and DIR-3 KYC under the LLP Amendment Rules 2022.',
  keywords: ['LLP fee calculator', 'LLP late fee penalty', 'Form 11 penalty calculator', 'Form 8 late fee LLP', 'LLP filing fee'],
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator/llp',
  },
}

const llpJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/llp#softwareapplication',
      name: 'LLP Fee & Penalty Calculator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR'
      },
      description: 'Calculate statutory filing fees and flat ₹100/day late filing penalties for Limited Liability Partnerships (Form 8, Form 11, etc).',
      featureList: [
        'Form 11 Annual Return Penalty',
        'Form 8 Statement of Account Penalty',
        'Form 3 LLP Agreement Fee',
        'DIR-3 KYC Late Fee'
      ]
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
        { '@type': 'ListItem', position: 3, name: 'Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator' },
        { '@type': 'ListItem', position: 4, name: 'LLP Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator/llp' }
      ]
    }
  ]
}

function LLPSEO() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        Understanding LLP Filing Fees and the ₹100/Day Penalty
      </h2>
      <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
        Limited Liability Partnerships (LLPs) are subject to strict late filing penalties under the Indian regulatory framework. Since 1 April 2022, the LLP 2nd Amendment Rules 2022 replaced the old flat ₹100/day penalty with a slab-multiplier system based on the total contribution and delay period.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">📝</span>
            Normal Base Fees
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The normal filing fee for an LLP form depends entirely on the total capital contribution of the LLP. It starts as low as ₹50 for LLPs with contributions up to ₹1 Lakh, and caps at ₹600 for LLPs with contributions exceeding ₹1 Crore.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm">
          <h3 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">🚨</span>
            Slab-Multiplier Late Fee (from 1 April 2022)
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            Under LLP 2nd Amendment Rules 2022, Form 8 and Form 11 attract multiplier-based additional fees ranging from 1× to 50× (other LLP) or 25× (Small LLP) of the normal fee. Beyond 360 days, the fee is capped at a fixed amount.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-navy dark:text-white mt-8 mb-4">
        Key LLP Forms and Their Due Dates
      </h3>
      <ul className="list-disc pl-6 space-y-3 text-slate-600 dark:text-slate-300">
        <li><strong>Form 11 (Annual Return):</strong> Must be filed within 60 days of the closure of the financial year (i.e., by 30th May every year).</li>
        <li><strong>Form 8 (Statement of Account & Solvency):</strong> Must be filed within 30 days from the end of 6 months of the financial year (i.e., by 30th October every year).</li>
        <li><strong>Form 3 (LLP Agreement):</strong> Must be filed within 30 days of the date of incorporation or within 30 days of any subsequent changes to the agreement.</li>
      </ul>
    </article>
  )
}

export default function LLPFeePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={llpJsonLd as any} />
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link href="/tools/fee-calculator" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to Calculator Hub
          </Link>
          <div className="inline-flex items-center gap-2 bg-blue-400/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider block w-max">
            ✓ Updated for FY 2026-27
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            LLP Fee & Penalty Calculator
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Calculate statutory filing fees and flat ₹100/day late filing penalties for Limited Liability Partnerships.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 mb-16">
          <LLPFeeCalc />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <LLPSEO />
        <LLPFAQ />
        <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4 mt-8">
          Fees shown are indicative based on the Companies (Registration Offices and Fees) Rules, 2014 as amended. Always verify on the MCA portal before filing. This tool does not account for state stamp duty or professional charges.
        </p>
      </div>
    </div>
  )
}
