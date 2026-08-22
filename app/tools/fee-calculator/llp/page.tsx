import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import LLPFeeCalc from '../components/LLPFeeCalc'
import LLPFAQ from './LLPFAQ'
import { LLP_FAQS } from './faq-data'

export const metadata: Metadata = {
  title: 'LLP Fee Calculator: Form 8, Form 11, Form 3, Form 4 & Form 24',
  description:
    'Calculate statutory MCA filing fees, Section 69 late filing multipliers, and indicative Section 34(5)/35(2) statutory penalties for Form 8, Form 11, Form 3, Form 4, Form 5, Form 15, and Form 24.',
  keywords: [
    'LLP fee calculator',
    'LLP late filing fee',
    'Form 11 penalty calculator',
    'Form 8 late fee LLP',
    'Form 3 LLP agreement fee',
    'Form 4 partner change fee',
    'Form 24 LLP strike off fee',
    'LLP Section 69 additional fee',
    'Section 34 5 penalty LLP',
    'Section 35 2 penalty LLP',
  ],
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
      name: 'LLP Fee & Late Filing Calculator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      description:
        'Calculate statutory MCA filing fees, Section 69 late filing multipliers, and indicative Section 34(5)/35(2) statutory penalties for Limited Liability Partnerships.',
      featureList: [
        'Form 8 Statement of Account & Solvency Fee (Due 30 Oct)',
        'Form 8 Charge Creation & Satisfaction Fee (Rs. 1,000 per doc)',
        'Form 11 Annual Return Fee & Multipliers (Due 30 May)',
        'Form 3 Initial Agreement & Contribution Increase Fee Slabs',
        'Form 4 Partner & Designated Partner Change Fees',
        'Form 5 Name Change & Form 15 Registered Office Change Fees',
        'Form 24 Strike-off Prerequisites & Application Fees',
        'Objective Small LLP Assessment (Contribution <= Rs. 25L & Turnover <= Rs. 40L)',
        'Section 76A Statutory Proviso Notice',
        'Non-Audit PDF Calculation Report Generation',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
        { '@type': 'ListItem', position: 3, name: 'Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator' },
        { '@type': 'ListItem', position: 4, name: 'LLP Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator/llp' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: LLP_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  ],
}

function LLPSEO() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        Statutory Framework for LLP Filing Fees, Late Multipliers & Penalties
      </h2>
      <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
        Compliance for Limited Liability Partnerships (LLPs) in India is governed by the <strong>Limited Liability Partnership Act, 2008</strong> (as amended by the LLP Amendment Act, 2021) and the <strong>Limited Liability Partnership Rules, 2009</strong> (as amended by the LLP 2nd Amendment Rules, 2022). Understanding the distinction between <em>MCA Portal Additional Filing Fees</em> and <em>ROC Statutory Adjudication Penalties</em> is critical for compliance professionals.
      </p>

      {/* Distinction Callout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold">💳</span>
            1. Section 69 Additional Filing Fees
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Payable directly at MCA21 portal checkout upon delayed filing. Under the 2022 Amendment Rules, fees follow a slab-multiplier schedule (1× to 15× for Small LLPs; 1× to 30× for Other LLPs). Beyond 360 days, Forms 8 and 11 attract an uncapped daily fee (₹10/day for Small, ₹20/day for Other), while general event forms are capped at 25× / 50×.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">⚖️</span>
            2. Section 34(5) & 35(2) Adjudication Penalties
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Separate quasi-judicial civil penalties levied by the Registrar of Companies (ROC) under Section 76A. Prescribes ₹100 per day of continuing default (capped at ₹1,00,000 for the LLP entity and ₹50,000 for each Designated Partner). These penalties require formal show-cause proceedings and are <strong>never</strong> added into portal checkout fees.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-navy dark:text-white mt-8 mb-4">
        Key LLP Forms, Filing Deadlines & Discrete Fee Schedules
      </h3>

      <div className="space-y-4 text-slate-600 dark:text-slate-300">
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/50">
          <h4 className="font-bold text-navy dark:text-white text-base mb-1">
            Form 11 — Annual Return of LLP
          </h4>
          <p className="text-sm">
            <strong>Filing Deadline:</strong> Within 60 days from the closure of the financial year (i.e. <strong>30th May</strong> every year for FY ending March 31). Base fee is contribution-based (₹50 to ₹600). Late filing attracts Section 69 multipliers plus Section 35(2) penalty exposure.
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/50">
          <h4 className="font-bold text-navy dark:text-white text-base mb-1">
            Form 8 — Statement of Account & Solvency (Annual) vs Charges
          </h4>
          <p className="text-sm">
            <strong>Annual Statement:</strong> Filed within 30 days from the expiry of 6 months of financial year close (i.e. <strong>30th October</strong> every year). Base fee: ₹50 to ₹600.<br />
            <strong>Charge Filing:</strong> Creation, modification, or satisfaction of charge carries a flat statutory fee of <strong>₹1,000 per document</strong> (Annexure-A Items 4 & 5). Late filings attract Table B Item 1 multipliers capped at 25× (Small) and 50× (Other).
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/50">
          <h4 className="font-bold text-navy dark:text-white text-base mb-1">
            Form 3 — LLP Agreement & Contribution Increases
          </h4>
          <p className="text-sm">
            <strong>Initial Agreement:</strong> Filed within 30 days of incorporation under Annexure-A Item 3 slabs (₹500 for ≤ ₹1L to ₹25,000 for &gt; ₹1Cr).<br />
            <strong>Agreement Modifications:</strong> Base document fee applies, plus an incremental registration fee differential if the total contribution slab increases.
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/50">
          <h4 className="font-bold text-navy dark:text-white text-base mb-1">
            Form 4 — Partner & Designated Partner Changes
          </h4>
          <p className="text-sm">
            <strong>Filing Deadline:</strong> Within 30 days of appointment, cessation, or change in particulars. Base fee: <strong>₹50 for Small LLPs</strong> and <strong>₹150 for Other LLPs</strong> (Annexure-A Item 2).
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/50">
          <h4 className="font-bold text-navy dark:text-white text-base mb-1">
            Form 24 — Application for Striking off Name (Closure)
          </h4>
          <p className="text-sm">
            Carries a flat application fee of <strong>₹500 for Small LLPs</strong> and <strong>₹1,000 for Other LLPs</strong> (Annexure-A Item 5). Requires at least 1 year of commercial cessation, zero active liabilities, up-to-date Form 8/11 filings, and a CA-certified Statement of Account.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-navy dark:text-white mt-8 mb-4">
        Section 76A Adjudication & 30-Day Proviso Cure Conditions
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
        Section 76A governs ROC adjudication proceedings for non-compliance. Importantly, the statutory proviso to Section 76A specifies that for filing defaults under <strong>Section 34(3)</strong> (Statement of Account & Solvency) or <strong>Section 35(1)</strong> (Annual Return), no penalty shall be imposed by the adjudicating officer where the default is rectified before or within 30 days of the notice issued by the adjudicating officer, subject to statutory conditions.
      </p>
    </article>
  )
}

export default function LLPFeePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={llpJsonLd as any} />
      
      {/* Banner */}
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/tools/fee-calculator"
            className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2"
          >
            ← Back to Calculator Hub
          </Link>
          <div className="inline-flex items-center gap-2 bg-teal-400/20 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider block w-max">
            ✓ Updated for FY 2026-27 (LLP 2nd Amendment Rules 2022)
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            LLP Fee & Late Filing Calculator
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Calculate MCA portal base fees, Section 69 additional late filing fees, and indicative statutory penalty exposure under the Limited Liability Partnership Act, 2008.
          </p>
        </div>
      </div>

      {/* Main Interactive Form Workspace */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 mb-16">
        <LLPFeeCalc />
      </div>

      {/* SEO & FAQ Knowledge Modules */}
      <div className="max-w-5xl mx-auto px-4">
        <LLPSEO />
        <LLPFAQ />
        <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4 mt-8">
          Fees shown are indicative estimates based on the Limited Liability Partnership Rules, 2009 (as amended by the LLP (Second Amendment) Rules, 2022) and the Limited Liability Partnership Act, 2008. Always verify official fees on the MCA21 portal before filing. This tool does not constitute an audit, legal opinion, or certification.
        </p>
      </div>
    </div>
  )
}
