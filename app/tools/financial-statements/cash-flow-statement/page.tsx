import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'
import CashFlowBuilderClient from './CashFlowBuilderClient'
import {
  ArrowRightLeft,
  FileSpreadsheet,
  ShieldCheck,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Scale,
  Info
} from 'lucide-react'

const canonicalUrl = 'https://www.corplawupdates.in/tools/financial-statements/cash-flow-statement'
const ogImageUrl = 'https://www.corplawupdates.in/api/og?title=Cash+Flow+Statement+Builder+(Indirect+Method)&category=Tools'

export const metadata: Metadata = {
  title: 'Cash Flow Statement Format Excel | Indirect Method',
  description:
    'Free Cash Flow Statement builder using the indirect method (AS-3 & Ind AS 7). Convert P&L and Balance Sheet movements into operating, investing, and financing cash flows with Section 2(40) exemption guidance.',
  alternates: {
    canonical: canonicalUrl
  },
  openGraph: {
    title: 'Cash Flow Statement Builder (Indirect Method) | Excel & PDF Downloads',
    description:
      'Prepare indirect-method cash flow statements in browser with working capital reconciliations and Section 2(40) exemption checks.',
    url: canonicalUrl,
    type: 'website',
    siteName: 'CorpLawUpdates.in',
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Cash Flow Statement Builder' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cash Flow Statement Format Excel | Indirect Method',
    description: 'Free indirect cash flow statement builder with Excel, PDF, and Word exports.',
    images: [ogImageUrl]
  }
}

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: 'Free Cash Flow Statement Builder — Indirect Method',
      description:
        'A browser-only indirect method cash flow statement preparation tool with Excel, PDF, and Word outputs compliant with AS-3 and Ind AS 7.',
      url: canonicalUrl
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Financial Statements',
          item: 'https://www.corplawupdates.in/tools/financial-statements'
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Cash Flow Statement',
          item: canonicalUrl
        }
      ]
    },
    {
      '@type': 'WebApplication',
      '@id': `${canonicalUrl}#app`,
      name: 'Cash Flow Statement Builder (Indirect Method)',
      url: canonicalUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All modern web browsers',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR'
      }
    }
  ]
}

export default function CashFlowStatementPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <JsonLd data={pageJsonLd} />

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            <span>Accounting Standard 3 (AS-3)</span>
            <span>•</span>
            <span>Ind AS 7</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">100% Client-Side Privacy</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Free Cash Flow Statement Builder — Indirect Method
          </h1>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
            A <strong>Cash Flow Statement</strong> reports cash inflows and outflows classified into operating, investing, and financing activities during an accounting period. Under the <strong>indirect method</strong> (prescribed by AS-3 and Ind AS 7), net cash flow from operating activities is determined by adjusting profit or loss before tax for the effects of non-cash transactions, working capital changes, and actual taxes paid.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Zero server data transmission
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              Section 2(40) proviso exemption checker
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              Formula Excel, PDF &amp; Word exports
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Tool Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        <CashFlowBuilderClient />
      </div>

      {/* Comprehensive Server-Rendered Legal & Accounting Reference */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 space-y-12 text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
        {/* Section 1: The Three Pillars of Cash Flow */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            1. Understanding the Three Cash Flow Categories
          </h2>
          <p>
            Under both Accounting Standard 3 (AS-3) and Indian Accounting Standard 7 (Ind AS 7), cash flows are segregated into three mutually exclusive operational classifications:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-1">
                A. Operating Activities
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Principal revenue-producing activities of the company. In the indirect method, we start with Profit Before Tax, add back non-cash expenses (depreciation, amortisation, finance costs), adjust for changes in working capital (inventory, debtors, creditors), and deduct direct taxes actually paid.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-purple-600 dark:text-purple-400 mb-1">
                B. Investing Activities
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Acquisition and disposal of long-term assets and other investments not included in cash equivalents. Includes payments to purchase property, plant, and equipment, proceeds from sale of fixed assets, investments in mutual funds/subsidiaries, and interest/dividends received.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                C. Financing Activities
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Activities that alter the size and composition of equity capital and borrowings. Includes proceeds from issuing equity shares, proceeds from bank loans/debentures, repayments of long-term borrowings, and payments of finance costs (interest) and dividends.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Statutory Exemption under Section 2(40) Proviso */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Scale className="w-5 h-5 text-blue-600" />
            2. Cash Flow Statement Exemption: Section 2(40) Proviso
          </h2>
          <p>
            A common misconception in corporate practice is that cash flow statement exemptions originate in Section 129. The actual statutory definition and its exemptions stem from the <strong>proviso to Section 2(40)</strong> of the Companies Act, 2013:
          </p>
          <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border-l-4 border-blue-600 font-serif italic text-xs text-slate-800 dark:text-slate-200">
            &ldquo;Provided that the financial statement, with respect to One Person Company, small company, dormant company and private company (if such private company is a start-up) may not include the cash flow statement.&rdquo;
          </div>
          <p>
            Entities entitled to omit the Cash Flow Statement from their statutory annual filing (Form AOC-4) include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li><strong>One Person Companies (OPCs)</strong> incorporated under Section 2(62).</li>
            <li><strong>Small Companies</strong> meeting the Section 2(85) thresholds (paid-up capital ≤ ₹4 Crores and turnover ≤ ₹40 Crores).</li>
            <li><strong>Dormant Companies</strong> registered under Section 455.</li>
            <li><strong>DPIIT-Recognised Start-up Private Companies</strong> for 10 years from incorporation.</li>
          </ul>
          <p className="text-xs text-slate-500">
            Note: Section 8 (non-profit) companies are not automatically exempt from preparing a cash flow statement solely because they are Section 8 companies, unless they qualify as a small company.
          </p>
        </section>

        {/* Section 3: Why Balance Sheet Movements Alone Are Insufficient */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Info className="w-5 h-5 text-blue-600" />
            3. Why Opening &amp; Closing Balances Alone Cannot Produce a Complete Cash Flow
          </h2>
          <p>
            A naive software tool often subtracts opening balance sheet numbers from closing balance sheet numbers and calls the result a cash flow. Under Indian GAAP and Ind AS, this creates material inaccuracies because:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li>
              <strong>Non-Cash Depreciation &amp; Amortisation:</strong> A drop in Property, Plant and Equipment of ₹10 Lakhs could be pure non-cash depreciation, not a ₹10 Lakh cash sale of machinery.
            </li>
            <li>
              <strong>Asset Sales at Gain/Loss:</strong> If a vehicle with book value ₹2 Lakhs is sold for ₹2.5 Lakhs, the cash inflow is ₹2.5 Lakhs (investing), while the ₹0.5 Lakh gain must be subtracted from PBT (operating).
            </li>
            <li>
              <strong>Gross Borrowings vs Repayments:</strong> Net change in term loans might be zero if the company took a new ₹50 Lakh loan and repaid ₹50 Lakhs of old loans; both gross cash movements must be disclosed.
            </li>
            <li>
              <strong>Actual Taxes Paid:</strong> P&amp;L tax expense includes deferred tax provisions; operating cash flow requires the actual advance tax and TDS cash paid during the financial year.
            </li>
          </ul>
        </section>

        {/* Section 4: FAQs */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            4. Frequently Asked Questions (FAQs)
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                What is the difference between Direct and Indirect method?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                The direct method reports major classes of gross operating cash receipts (e.g. cash received from customers) and gross cash payments (e.g. cash paid to suppliers). The indirect method starts with Net Profit Before Tax and reconciles it to net operating cash by adjusting for non-cash expenses and working capital movements. Both methods produce identical Investing, Financing, and Net Cash Flow totals.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Why does Cash Flow closing cash differ from Bank Statement balance?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Cash and Cash Equivalents under AS-3 includes cash in hand, petty cash, current account bank balances, cheques in hand, and short-term highly liquid fixed deposits with maturity less than 3 months. Longer term fixed deposits and restricted bank balances are classified as investments or other assets.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Where are bank overdrafts and cash credits classified?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Under AS-3, bank overdrafts and cash credit facilities that are repayable on demand and form an integral part of an enterprise's cash management are included as a component of cash and cash equivalents (or financing activities depending on specific accounting policy).
              </p>
            </div>
          </div>
        </section>

        {/* Hub Explore Links */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <HubExploreLinks />
        </div>
      </div>
    </div>
  )
}
