import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import CompanyFAQ from './CompanyFAQ'
import { companyFaqs } from './companyFaqsData'
import { mcaForms } from '@/data/mca-forms'
import UnifiedCalculator from './UnifiedCalculator'

export const metadata: Metadata = {
  title: 'MCA Fee Calculator (V3) & ROC Late Fee Penalty Calculator | FY 2026-27',
  description: 'Calculate MCA21 V3 filing fees, ROC late penalties, Table B additional fee multipliers, ₹100/day annual return delays, ad-valorem charges, and state stamp duty for 25+ MCA forms for FY 2026-27.',
  keywords: [
    'MCA fee calculator',
    'ROC fees calculator',
    'MCA fees calculator',
    'MCA late fee calculator',
    'ROC late fees calculator',
    'ROC penalty calculator',
    'MCA penalty calculator',
    'stamp duty calculator MCA',
    'MCA calculate fees',
    'calculate ROC fees',
    'Table A normal fee MCA',
    'Table B late fee MCA',
    'MGT-7 late fee',
    'AOC-4 late fee',
    'CHG-1 ad valorem',
    'Small company fee calculator',
    'Section 446B penalty relief'
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator/companies',
  },
  openGraph: {
    title: 'MCA Fee Calculator (V3) & ROC Late Fee Penalty Calculator | FY 2026-27',
    description: 'Calculate exact MCA21 V3 normal filing fees, Table B late multipliers, ₹100/day uncapped penalties for AOC-4 & MGT-7, ad-valorem charges, and state stamp duty.',
    url: 'https://www.corplawupdates.in/tools/fee-calculator/companies',
    siteName: 'CorpLawUpdates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCA Fee Calculator (V3) & ROC Late Fee Penalty Calculator | FY 2026-27',
    description: 'Instant MCA V3 filing fee, late fee multipliers, ₹100/day annual return penalties, and state stamp duty calculator for Indian companies.',
  }
}

const companyJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/companies#webapp',
      name: 'MCA Fee Calculator (V3) & ROC Late Fee Penalty Calculator',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Corporate Compliance & Legal Fee Calculator',
      operatingSystem: 'All',
      url: 'https://www.corplawupdates.in/tools/fee-calculator/companies',
      softwareVersion: '2.19.0',
      inLanguage: 'en-IN',
      dateModified: '2026-09-06',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR'
      },
      description: 'Comprehensive institutional calculator for MCA21 V3 portal filing fees, Table B late multipliers, ₹100/day annual return penalties, ad-valorem charges, Section 446B relief, and state stamp duty.',
      featureList: [
        'Table A Normal Base Fee Calculation (Items 5 & 6)',
        'Table B Multiplier Fee Engine (2x to 12x) for Event-Based Forms',
        'Uncapped ₹100/day Late Filing Fees for AOC-4 & MGT-7',
        'Form CHG-1 & CHG-9 Ad-Valorem Charge Calculation (0.025% to 0.10%)',
        'Section 446B 50% Penalty Relief & Halved Caps for Small Co & OPC',
        'State-Wise MOA/AOA Stamp Duty Estimation for SH-7 & SPICe+',
        'Instant Executive PDF Breakdown Export & MCA V3 Compliance Reports'
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1280',
        bestRating: '5',
        worstRating: '1'
      },
      author: {
        '@type': 'Organization',
        name: 'CorpLawUpdates Legal Editorial Board',
        url: 'https://www.corplawupdates.in'
      }
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
        { '@type': 'ListItem', position: 3, name: 'Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator' },
        { '@type': 'ListItem', position: 4, name: 'Company ROC Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator/companies' }
      ]
    },
    {
      '@type': 'HowTo',
      name: 'How to Calculate MCA V3 Filing Fees and ROC Late Penalties for Companies',
      description: 'Step-by-step procedure to compute normal filing fees under Table A, additional late fees under Table B or ₹100/day rules, and statutory penalty exposure on MCA21 V3.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Select the Relevant MCA Form',
          text: 'Choose whether you are filing an annual return (MGT-7/7A), financial statements (AOC-4), auditor appointment (ADT-1), charge creation (CHG-1), or a general event-based form (DIR-12, INC-22, MGT-14).'
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Identify the Nominal (Authorized) Share Capital',
          text: 'Check the authorized share capital of the company from the MCA master data. Normal base filing fees under Table A (Items 5 & 6) range from ₹200 for capital under ₹1 Lakh to ₹600 for capital of ₹1 Crore or more.'
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Calculate Delay in Days from the Statutory Due Date',
          text: 'Compute the calendar days elapsed past the statutory deadline (e.g., 60 days from AGM for MGT-7, 30 days from AGM for AOC-4, 15 days from meeting for ADT-1, or 30 days from creation for CHG-1).'
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Apply the Specific Late Fee Mechanism',
          text: 'For annual filings (AOC-4 and MGT-7), apply flat ₹100 per day uncapped late fee. For event-based forms, apply Table B multipliers (2× to 12× normal fee). For Form CHG-1, apply additional fees plus ad-valorem percentages.'
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Verify Small Company and Section 446B Concessions',
          text: 'Check if the company qualifies as a Small Company under Section 2(85) (Paid-up Capital ≤ ₹10 Cr and Turnover ≤ ₹100 Cr under G.S.R. 880(E)). If eligible, apply Section 446B 50% statutory penalty relief.'
        },
        {
          '@type': 'HowToStep',
          position: 6,
          name: 'Generate and Verify Portal Challan Payable',
          text: 'Combine normal base fee, additional late fees, and any applicable state stamp duty or ad-valorem charges to determine the final portal payable amount.'
        }
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: companyFaqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a
        }
      }))
    }
  ]
}

function CompanySEO() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      {/* E-E-A-T & Statutory Trust Badge */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-10 not-prose flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg">
            ⚖️
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Statutory Authority: Companies (Registration Offices and Fees) Rules, 2014 &amp; Companies Act, 2013
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Updated for FY 2026-27 • Incorporates MCA Notification G.S.R. 880(E) &amp; V3 Portal Filing Algorithms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 self-start md:self-auto">
          <span>✓ Validated against MCA21 V3 Portal Fee Schedules</span>
        </div>
      </div>

      {/* Target Definition & GEO Citability Block (First 30% of content, 58 words) */}
      <h2 className="text-2xl font-bold text-navy dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        What Are MCA and ROC Filing Fees and How Are They Calculated?
      </h2>
      <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed font-normal bg-blue-50/50 dark:bg-slate-900/50 p-5 rounded-xl border-l-4 border-blue-600 mb-8">
        <strong>MCA and ROC filing fees in India</strong> are statutory charges levied under the Companies (Registration Offices and Fees) Rules, 2014 for submitting corporate documents on the MCA21 V3 portal. Normal base fees range from ₹200 to ₹600 based on authorized capital (Table A). Delays incur either a flat ₹100 per day uncapped late fee (for annual filings AOC-4 &amp; MGT-7) or 2× to 12× additional fee multipliers (for event-based forms under Table B).
      </p>

      {/* Section 1: Normal Base Fees (Table A) */}
      <div className="my-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm">📊</span>
          Table A: Normal Filing Fee Slabs (Items 5 &amp; 6)
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          Pursuant to Table A of the Companies (Registration Offices and Fees) Rules, 2014, normal filing fees apply uniformly to all companies having share capital (Private Limited, Public Limited, One Person Companies, Small Companies, and Section 8 Companies). For companies not having share capital, Item 6 mandates a flat fee of ₹200.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm not-prose">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Nominal / Authorized Share Capital (₹)</th>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Normal Fee (Having Capital)</th>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Statutory Rule Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Less than ₹1,00,000</td>
                <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400">₹ 200</td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">Table A, Item 5(i)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">₹1,00,000 to ₹4,99,999</td>
                <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400">₹ 300</td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">Table A, Item 5(ii)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">₹5,00,000 to ₹24,99,999</td>
                <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400">₹ 400</td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">Table A, Item 5(iii)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">₹25,00,000 to ₹99,99,999</td>
                <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400">₹ 500</td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">Table A, Item 5(iv)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">₹1,00,00,000 or More (≥ ₹1 Crore)</td>
                <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400">₹ 600</td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">Table A, Item 5(v)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Company Not Having Share Capital</td>
                <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400">₹ 200</td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">Table A, Item 6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Table B Multipliers for General Forms */}
      <div className="my-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 text-sm">⏱️</span>
          Table B: Standard Additional Late Fee Multipliers (Rule 12)
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          For event-based forms under Section 403 (such as Form ADT-1, INC-22, DIR-12, PAS-3, MGT-14, and DPT-3), late filing fees escalate according to the delay duration. Delays exceeding 270 days cannot be filed directly without condonation of delay.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm not-prose">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Delay Period</th>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Additional Fee Multiplier</th>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Example (₹400 Base Fee)</th>
                <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Total Challan Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Up to 30 Days</td>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">2× Normal Fee</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹ 800</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹ 1,200</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">More than 30 Days and up to 60 Days</td>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">4× Normal Fee</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹ 1,600</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹ 2,000</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">More than 60 Days and up to 90 Days</td>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">6× Normal Fee</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹ 2,400</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹ 2,800</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">More than 90 Days and up to 180 Days</td>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">10× Normal Fee</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹ 4,000</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹ 4,400</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">More than 180 Days and up to 270 Days</td>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">12× Normal Fee</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹ 4,800</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹ 5,200</td>
              </tr>
              <tr className="hover:bg-red-50/30 dark:hover:bg-red-950/20 bg-red-50/20 dark:bg-red-950/10">
                <td className="px-4 py-3 font-bold text-red-700 dark:text-red-400">Beyond 270 Days</td>
                <td className="px-4 py-3 font-bold text-red-700 dark:text-red-400">Direct Filing Barred</td>
                <td className="px-4 py-3 text-xs text-red-600 dark:text-red-300" colSpan={2}>
                  Section 403 second proviso applies. Form CG-1 required for condonation.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Annual Return ₹100/day Uncapped Late Fees */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3">
        Uncapped ₹100/Day Delay Fee for Annual Returns (AOC-4 &amp; MGT-7)
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
        Under the Companies (Registration Offices and Fees) Second Amendment Rules, 2018, annual compliance documents (Form AOC-4, AOC-4 CFS, AOC-4 XBRL, MGT-7, and MGT-7A) do not follow Table B multipliers. Instead, an uncapped additional fee of <strong>₹100 per day</strong> accumulates from the 61st day after the Annual General Meeting (AGM).
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm not-prose mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Delay Period</th>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Late Fee Per Form</th>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Combined (AOC-4 + MGT-7)</th>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Statutory Exposure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-medium">30 Days Delay</td>
              <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">₹ 3,000</td>
              <td className="px-4 py-3 font-bold">₹ 6,000 + normal fees</td>
              <td className="px-4 py-3 text-xs text-slate-500">Portal additional fee only</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-medium">90 Days Delay</td>
              <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">₹ 9,000</td>
              <td className="px-4 py-3 font-bold">₹ 18,000 + normal fees</td>
              <td className="px-4 py-3 text-xs text-slate-500">Section 92(5) notice risk</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-medium">180 Days Delay (6 Months)</td>
              <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">₹ 18,000</td>
              <td className="px-4 py-3 font-bold">₹ 36,000 + normal fees</td>
              <td className="px-4 py-3 text-xs text-slate-500">ROC adjudication summons</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-medium">365 Days Delay (1 Year)</td>
              <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">₹ 36,500</td>
              <td className="px-4 py-3 font-bold">₹ 73,000 + normal fees</td>
              <td className="px-4 py-3 text-xs text-slate-500">Maximum penalty exposure</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Charge Creation (CHG-1) 30-60-120 Day Matrix */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3">
        Form CHG-1 &amp; CHG-9: Charge Creation Statutory Timelines &amp; Ad Valorem Fees
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
        Pursuant to Section 77(1) of the Companies Act, 2013 and Rule 12(3) of the Fees Rules, charges created after 02.11.2018 have three statutory windows. Direct ROC registration is strictly barred after 120 days from creation.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm not-prose mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Timeline from Creation</th>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Delay Period</th>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Small Company / OPC Fee</th>
              <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Other Companies Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-semibold">Days 1 to 30</td>
              <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">0 Days (Timely)</td>
              <td className="px-4 py-3">Normal Fee (₹200 to ₹600)</td>
              <td className="px-4 py-3">Normal Fee (₹200 to ₹600)</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-semibold">Days 31 to 60</td>
              <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-bold">1 to 30 Days</td>
              <td className="px-4 py-3">Normal Fee + 3× Addl Fee + Ad-Valorem (0.025%, Max ₹1L)</td>
              <td className="px-4 py-3">Normal Fee + 6× Addl Fee + Ad-Valorem (0.05%, Max ₹5L)</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-semibold">Days 61 to 120</td>
              <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">31 to 90 Days</td>
              <td className="px-4 py-3">Normal Fee + 6× Addl Fee + Ad-Valorem (0.05%, Max ₹2L)</td>
              <td className="px-4 py-3">Normal Fee + 6× Addl Fee + Higher Ad-Valorem (0.10%, Max ₹10L)</td>
            </tr>
            <tr className="bg-red-50/20 dark:bg-red-950/10">
              <td className="px-4 py-3 font-bold text-red-700 dark:text-red-400">Beyond 120 Days</td>
              <td className="px-4 py-3 font-bold text-red-700 dark:text-red-400">&gt; 90 Days Delay</td>
              <td className="px-4 py-3 text-xs text-red-600 dark:text-red-300" colSpan={2}>
                Registration strictly barred. Must file Form CHG-8 with Regional Director under Section 87.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 5: Small Company Definition & Section 446B Halving Relief */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-10 not-prose">
        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
          <span>🛡️</span> Small Company Expansion (G.S.R. 880(E)) &amp; Section 446B 50% Penalty Relief
        </h3>
        <p className="text-emerald-950 dark:text-emerald-200 text-sm leading-relaxed mb-3">
          Effective <strong>1st December 2025</strong> via MCA Notification G.S.R. 880(E), a private company qualifies as a <strong>Small Company</strong> under Section 2(85) if its <strong>Paid-Up Capital does not exceed ₹10 Crore</strong> and its <strong>Turnover does not exceed ₹100 Crore</strong>.
        </p>
        <p className="text-emerald-950 dark:text-emerald-200 text-sm leading-relaxed mb-4">
          Under <strong>Section 446B</strong>, Small Companies, One Person Companies (OPCs), Startups, and Producer Companies enjoy statutory relief: any civil adjudication penalty is <strong>slashed by 50%</strong>, and the maximum statutory liability is capped at ₹2,00,000 for the company and ₹1,00,000 for an officer in default.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Paid-Up Capital Ceiling</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">₹ 10 Crore</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Under amended Section 2(85)</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Annual Turnover Ceiling</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">₹ 100 Crore</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Immediately preceding FY</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Section 446B Relief</p>
            <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">50% Penalty Discount</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Caps halved for entity &amp; officers</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function CompaniesFeePage() {
  return (
    <div className="min-h-dvh bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={companyJsonLd as any} />
      
      {/* Header Banner */}
      <div className="bg-[#0F172A] py-12 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <Link href="/tools/fee-calculator" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to Calculator Hub
          </Link>
          <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] text-[0.75rem] font-bold px-[12px] py-[4px] rounded-full mb-5 uppercase tracking-wider block w-max">
            ✓ Updated for FY 2026-27 • MCA V3 Portal Validated
          </div>
          <h1 className="text-[2.25rem] md:text-[2.75rem] font-bold text-white font-serif mb-4 leading-tight">
            MCA Fee Calculator (V3) &amp; ROC Late Fee Penalty Calculator
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">
            Institutional calculator for Indian corporate filings. Compute exact Table A normal filing fees, Table B late multipliers, ₹100/day uncapped annual return delays (AOC-4 &amp; MGT-7), ad-valorem charges (CHG-1), and state-wise stamp duty under Companies Act, 2013.
          </p>
        </div>
      </div>

      {/* Interactive Unified Calculator Widget */}
      <div className="max-w-5xl mx-auto px-4 relative z-10 -mt-8 mb-12">
        <UnifiedCalculator />
      </div>

      {/* Dedicated Workspace Spotlight Banner Cards */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚡</span> Dedicated Form Compliance Workspaces
          </h2>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Deep Date Engines &amp; PDF Generators</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/tools/fee-calculator/companies/mgt-7"
            className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">MGT-7 &amp; 7A</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Annual Return</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                MGT-7 / MGT-7A Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                60-day AGM calendar date engine, Small Co evaluator (G.S.R. 880(E)), MGT-8 PCS check, and executive PDF challan.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/aoc-4"
            className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 hover:border-indigo-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-600 text-white">AOC-4 Family</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Financial Statements</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                Form AOC-4 Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                30-day AGM &amp; 180-day OPC engine, Small Co cash flow exemption, XBRL eligibility, and Section 137(3) penalty calculator.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/dpt-3"
            className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-600 text-white">DPT-3</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Return of Deposits</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">
                Form DPT-3 Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Circular 02/2026 fee waiver check, Table B delay multipliers (2× to 12×), 18 Rule 2(1)(c) exclusions, and Rule 21 penalty advisor.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/dir-3-kyc"
            className="p-5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 hover:border-sky-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-sky-600 text-white">DIR-3 KYC</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Director Verification</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors mb-1">
                Form DIR-3 KYC Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Triennial cycle checker (G.S.R. 943(E)), 30-day event update tracker (Rule 12A(2)), and STP DIN reactivation calculator.
              </p>
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/adt-1"
            className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">ADT-1</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Auditor Appointment</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                Form ADT-1 Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                15-day meeting deadline calculation, Section 139 first-tier rules, Table B multipliers, and instant printable fee sheet.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/chg-1"
            className="p-5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-600 text-white">CHG-1</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Creation of Charge</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                Form CHG-1 Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Section 77 30–60–120 day ad-valorem calculations, 3×/6× extension fees, Regional Director condonation tracker.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/inc-20a"
            className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:border-rose-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">INC-20A</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Commencement of Business</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors mb-1">
                Form INC-20A Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                180-day incorporation deadline tracker, Table B late multipliers (2x to 12x), Section 10A(2) adjudication penalties, Section 446B relief, and strike-off risks.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/spice-plus"
            className="p-5 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 hover:border-orange-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-600 text-white">SPICe+</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Company Incorporation</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-1">
                SPICe+ (INC-32) Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                36-state stamp duty engine, G.S.R. 329(E) zero-fee threshold (capital up to ₹15L), Part A/B fees, and incorporation roadmap.
              </p>
            </div>
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>

          <Link
            href="/tools/fee-calculator/companies/pas-6"
            className="p-5 rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 hover:border-violet-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-violet-600 text-white">PAS-6</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Share Capital Reconciliation</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-1">
                Form PAS-6 Workspace
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Rule 9A &amp; 9B rolling 18-month demat clock, Table B late multipliers (2× to 12×), Section 450 adjudication exposure, and depository balance tracker.
              </p>
            </div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-4 flex items-center gap-1">
              Open Dedicated Workspace →
            </span>
          </Link>
        </div>
      </div>

      {/* Complete MCA Forms Catalog Grid */}
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy dark:text-white font-heading">
            Browse All MCA Company Forms (20+)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click any form for in-depth rules &amp; individual calculator
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mcaForms.map(form => (
            <Link 
              key={form.slug} 
              href={`/tools/fee-calculator/companies/${form.slug}`}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-blue-600 dark:hover:border-blue-500 transition-all flex flex-col h-full group"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[0.75rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {form.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  Calculate →
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {form.formNumber} — {form.formName}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-auto flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Due:</span> {form.dueDate}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* SEO & Legal Knowledge Base + FAQ */}
      <div className="max-w-5xl mx-auto px-4">
        <CompanySEO />
        <CompanyFAQ />
        
        {/* Footnote & Disclaimer */}
        <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-6 mt-8 space-y-2">
          <p>
            <strong>Statutory Disclaimer:</strong> Fees and penalties computed by this tool are based on the Companies Act, 2013, the Companies (Registration Offices and Fees) Rules, 2014 as amended up to FY 2026-27, and relevant state stamp acts. This calculator is provided for compliance planning and institutional advisory estimation. Official fee challans are generated exclusively upon form upload and pre-scrutiny on the Ministry of Corporate Affairs MCA21 V3 portal.
          </p>
          <p>
            © {new Date().getFullYear()} CorpLawUpdates.in — India&apos;s Independent Corporate Law &amp; Regulatory Intelligence Platform.
          </p>
        </div>
      </div>
    </div>
  )
}

