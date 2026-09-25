import { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import IBBIFeeCalc from './components/IBBIFeeCalc';
import IBBIFAQ from './components/IBBIFAQ';
import { IBBI_FAQS } from './ibbiFaqsData';
import ReaderFeedback from '@/components/ReaderFeedback';
import { Scale, ShieldAlert, Sparkles, BookOpen, Clock, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    absolute: 'IBBI Delayed Filing Fee Calculator (Liquidation & CIRP) | CorpLaw',
  },
  description:
    'Calculate statutory delayed filing fees under Regulation 47B (Liquidation Forms LIQ-1 to LIQ-4) and Regulation 40B (CIRP Forms) at ₹500/month + 18% GST per Circular No. IBBI/LIQ/107/2026, plus Liquidator realization fee slabs.',
  keywords: [
    'IBBI fee calculator',
    'Regulation 47B fee calculator',
    'IBBI liquidation delay fee',
    'IBBI circular 107 2026',
    'Circular No IBBI/LIQ/107/2026',
    'Form LIQ-1 late fee',
    'Form LIQ-2 late fee',
    'Form LIQ-3 fee calculator',
    'Form LIQ-4 fee calculator',
    'CIRP regulation 40b late fee calculator',
    'Liquidator fee calculator IBBI',
    'IBBI delayed form filing fee',
    'IBBI GST late fee',
    'Insolvency professional fee calculator',
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator/ibbi',
  },
  openGraph: {
    title: 'IBBI Delayed Filing Fee & Liquidation Calculator | CorpLawUpdates',
    description:
      'Calculate statutory delayed filing fees for Liquidation Forms (Reg 47B) & CIRP Forms (Reg 40B) at ₹500/month + 18% GST, plus Liquidator realization fee slabs.',
    url: 'https://www.corplawupdates.in/tools/fee-calculator/ibbi',
    siteName: 'CorpLawUpdates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IBBI Delayed Filing Fee & Liquidation Calculator | CorpLawUpdates',
    description:
      'Calculate statutory delayed filing fees under Regulation 47B & 40B at ₹500/month + 18% GST, updated for Circular No. IBBI/LIQ/107/2026.',
  },
};

const ibbiJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/ibbi#webapp',
      name: 'IBBI Delayed Filing Fee & Liquidation Calculator',
      url: 'https://www.corplawupdates.in/tools/fee-calculator/ibbi',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Insolvency & Bankruptcy Compliance Fee Calculator',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      description:
        'Institutional calculator for Insolvency Professionals and Liquidators to calculate statutory delayed filing fees under Regulation 47B (Liquidation Process) and Regulation 40B (CIRP) at ₹500/month plus 18% GST, along with Regulation 4(2)(b) Liquidator remuneration slabs.',
      featureList: [
        'Regulation 47B Liquidation Process Forms Delay Engine (Circular IBBI/LIQ/107/2026)',
        'Regulation 40B CIRP Forms Delay Engine (Circular IBBI/CIRP/89/2025)',
        'Statutory ₹500/Month Base Late Fee + 18% GST (₹90) Calculator (Gross ₹590/Month)',
        'Batch Multi-Form & Multi-Quarter Filing Multiplier',
        'Form Updation / Correction Surcharge Evaluator',
        '30th September 2026 Statutory Cutoff Verification',
        'Regulation 4(2)(b) Liquidator Tiered Realisation & Distribution Commission Slabs',
        'One-Click Form Filing Note Exporter for Court & IBBI Compliance Records',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Fee Calculator',
          item: 'https://www.corplawupdates.in/tools/fee-calculator',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'IBBI Fee Calculator',
          item: 'https://www.corplawupdates.in/tools/fee-calculator/ibbi',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/ibbi#faq',
      mainEntity: IBBI_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  ],
};

export default function IBBICalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <JsonLd data={ibbiJsonLd} />

      {/* Header Breadcrumbs & Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Tools
            </Link>
            <span>/</span>
            <Link href="/tools/fee-calculator" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Fee Calculator
            </Link>
            <span>/</span>
            <span className="text-navy dark:text-blue-400 font-semibold">IBBI Fee Calculator</span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  <Scale className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200/50 dark:border-blue-900/50">
                  Insolvency & Bankruptcy (IBBI)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-navy dark:text-white font-heading tracking-tight">
                IBBI Delayed Filing Fee & Liquidation Calculator
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-base max-w-3xl leading-relaxed">
                Institutional calculation tool for Insolvency Professionals and Liquidators. Compute statutory late filing fees under Regulation 47B and Regulation 40B at ₹500/month + 18% GST (gross ₹590/month), updated for Circular No. IBBI/LIQ/107/2026.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/updates/ibbi-reg-47b-delayed-liquidation-forms-fee-2026"
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read Circular 107/2026 Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* GEO Direct-Answer Block for Generative Search */}
        <section className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200 dark:border-blue-900/40 shadow-sm not-prose">
          <div className="flex items-start gap-3.5">
            <span className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-navy dark:text-blue-300 mb-1">
                Statutory Summary: Circular No. IBBI/LIQ/107/2026 (Commencement of Late Fee)
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                On <strong>24th September 2026</strong>, the Insolvency and Bankruptcy Board of India (IBBI) notified that every liquidation form (<strong>Forms LIQ-1, LIQ-2, LIQ-3, and LIQ-4</strong>) due on or before <strong>30th September 2026</strong> and submitted after its respective due date, <em>&quot;whether by correction, updation, or otherwise&quot;</em>, shall be accompanied by a statutory fee of <strong>₹500 per month of delay</strong> plus applicable <strong>18% GST (₹90 per month)</strong>, resulting in a total deposit of <strong>₹590 per calendar month per form</strong> deposited electronically via BharatKosh before generation of the filing receipt.
              </p>
            </div>
          </div>
        </section>

        {/* The Interactive Calculator Component */}
        <IBBIFeeCalc />

        {/* Comprehensive Editorial & Compliance Guide */}
        <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
            Understanding the Electronic Reporting Framework & Late Fee Regimes under IBC
          </h2>

          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Timely electronic reporting is a core statutory pillar under the Insolvency and Bankruptcy Code, 2016 (IBC). To prevent opacity, reporting delays, and prolonged asset stagnation, the Insolvency and Bankruptcy Board of India (IBBI) has established twin electronic filing regimes with compounding monetary disincentives for delayed submissions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Scale className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                  Liquidation Forms (Regulation 47B)
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Introduced vide Circular No. IBBI/LIQ/91/2026 (05.01.2026) and operationalized for fee collection vide Circular No. IBBI/LIQ/107/2026 (24.09.2026). Applies to Forms LIQ-1 to LIQ-4 due on or before 30.09.2026.
              </p>
              <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 font-mono">
                <li>• Base Fee: ₹500 per calendar month per form</li>
                <li>• GST: 18% (₹90 per month)</li>
                <li>• Total: ₹590 per month per form</li>
                <li>• Scope: Fresh delay & Updations / Corrections</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                  CIRP Forms (Regulation 40B)
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Governed by Regulation 40B of the CIRP Regulations read with Circular No. IBBI/CIRP/89/2025. Covers Form CIRP-1 through CIRP-7 and the biannual return in Form IP-1.
              </p>
              <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 font-mono">
                <li>• Base Fee: ₹500 per calendar month per form</li>
                <li>• GST: 18% (₹90 per month)</li>
                <li>• Total: ₹590 per month per form</li>
                <li>• Modification Utility: Fee charged if modified after due date</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
            Applicability of 18% GST on IBBI Regulatory Levies
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            Prior to July 2022, statutory and regulatory authorities enjoyed exemptions under entry 22 of Notification No. 12/2017-Central Tax (Rate). However, following recommendations of the 47th GST Council meeting, the Ministry of Finance issued <strong>Notification No. 04/2022-Central Tax (Rate)</strong> effective 18th July 2022, withdrawing exemptions on services provided by the Reserve Bank of India (RBI), Securities and Exchange Board of India (SEBI), and the Insolvency and Bankruptcy Board of India (IBBI).
          </p>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            Consequently, all regulatory levies, examination fees, registration fees, and delayed filing fees collected by IBBI attract <strong>Goods and Services Tax (GST) at 18%</strong> under Service Accounting Code (SAC) 9991 / 9983. For every ₹500 base delay fee, ₹90 in GST is collected, requiring a total electronic remittance of ₹590 per form per month.
          </p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
            Disciplinary Ramifications: The Authorisation for Assignment (AFA) Risk
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            Under the IBBI (Insolvency Professionals) Regulations, 2016, an Insolvency Professional (IP) cannot take up any fresh assignment as an IRP, RP, Liquidator, or Bankruptcy Trustee without a valid <strong>Authorisation for Assignment (AFA)</strong> issued by their Insolvency Professional Agency (IPA)—such as the Indian Institute of Insolvency Professionals of ICAI (IIIPI), ICSI Institute of Insolvency Professionals (ICSI IIP), or Insolvency Professional Agency of Institute of Cost Accountants of India (IPA ICAI).
          </p>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 my-6 not-prose">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-red-900 dark:text-red-200 leading-relaxed">
                <strong>Non-Compliance Alert:</strong> Regulation 47B(3) and Regulation 40B(3) state that providing incomplete, delayed, or inaccurate filings, or failing to pay the prescribed fee, constitutes disciplinary default under Section 196 and Section 218 of the Code. IPAs routinely withhold or refuse renewal of AFAs for practitioners with pending delayed fee arrears on the IBBI electronic portal.
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
            Liquidator Remuneration Slabs under Regulation 4(2)(b)
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            Where the Committee of Creditors (CoC) fails to determine remuneration under Regulation 39D of the CIRP Regulations, the liquidator’s fee is determined as a percentage of the amount realized (net of other liquidation costs) and amount distributed, as prescribed in Regulation 4(2)(b):
          </p>

          <div className="overflow-x-auto my-6 not-prose">
            <table className="w-full text-left text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700">Cumulative Realisation / Distribution Slab</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-center">First 6 Months</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-center">Next 6 Months</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-center">Next 1 Year</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-center">Thereafter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">On the first ₹1 Crore</td>
                  <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">5.00% / 2.50%</td>
                  <td className="p-3 text-center">3.75% / 1.88%</td>
                  <td className="p-3 text-center">2.50% / 1.25%</td>
                  <td className="p-3 text-center">1.25% / 0.63%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">On the next ₹9 Crores (₹1 Cr to ₹10 Cr)</td>
                  <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">3.75% / 1.88%</td>
                  <td className="p-3 text-center">2.80% / 1.40%</td>
                  <td className="p-3 text-center">1.88% / 0.94%</td>
                  <td className="p-3 text-center">0.94% / 0.47%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">On the next ₹40 Crores (₹10 Cr to ₹50 Cr)</td>
                  <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">2.50% / 1.25%</td>
                  <td className="p-3 text-center">1.88% / 0.94%</td>
                  <td className="p-3 text-center">1.25% / 0.63%</td>
                  <td className="p-3 text-center">0.63% / 0.31%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">On the next ₹50 Crores (₹50 Cr to ₹100 Cr)</td>
                  <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">1.25% / 0.63%</td>
                  <td className="p-3 text-center">0.94% / 0.47%</td>
                  <td className="p-3 text-center">0.63% / 0.31%</td>
                  <td className="p-3 text-center">0.31% / 0.16%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">On the amount thereafter (&gt; ₹100 Crores)</td>
                  <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">0.25% / 0.13%</td>
                  <td className="p-3 text-center">0.19% / 0.10%</td>
                  <td className="p-3 text-center">0.13% / 0.06%</td>
                  <td className="p-3 text-center">0.06% / 0.03%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            *Note: Format represents: <em>Realisation Rate % / Distribution Rate %</em>. Liquidator remuneration calculations follow the IBBI Clarification Circular dated 28th September 2023 on cumulative realization and distribution values.
          </p>
        </article>

        {/* FAQ Accordion Section */}
        <IBBIFAQ />

        {/* Feedback Section */}
        <ReaderFeedback
          contextType="calculator"
          contextTitle="IBBI Delayed Filing Fee & Liquidation Calculator"
          contextUrl="https://www.corplawupdates.in/tools/fee-calculator/ibbi"
        />
      </main>
    </div>
  );
}
