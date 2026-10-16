import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'
import BalanceSheetBuilderClient from './BalanceSheetBuilderClient'
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Info,
  Scale
} from 'lucide-react'

const canonicalUrl = 'https://www.corplawupdates.in/tools/financial-statements/balance-sheet'
const ogImageUrl = 'https://www.corplawupdates.in/api/og?title=Schedule+III+Balance+Sheet+Builder+%26+Format+Download&category=Tools'

export const metadata: Metadata = {
  title: 'Balance Sheet Format PDF & Excel Download | Schedule III',
  description:
    'Free Schedule III Balance Sheet builder and format downloads (PDF, Excel, Word). Prepare statutory Division I statements from your trial balance with 2021 amendments, ageing schedules, and ratios.',
  alternates: {
    canonical: canonicalUrl
  },
  openGraph: {
    title: 'Schedule III Balance Sheet Builder & Format Downloads (Excel/PDF/Word)',
    description:
      'Prepare statutory Division I balance sheets in browser with automated account mapping, ageing schedules, ratios, and 12 blank download packs.',
    url: canonicalUrl,
    type: 'website',
    siteName: 'CorpLawUpdates.in',
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Schedule III Balance Sheet Builder' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Balance Sheet Format PDF & Excel Download | Schedule III',
    description: 'Free browser-only Schedule III financial statement builder with PDF, Excel, and Word exports.',
    images: [ogImageUrl]
  }
}

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: 'Free Schedule III Balance Sheet Builder and Format Downloads',
      description:
        'A browser-only Schedule III financial statement preparation tool with genuine Excel, PDF, and Word outputs for Indian private limited, public limited, and OPC companies.',
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
          name: 'Balance Sheet Builder',
          item: canonicalUrl
        }
      ]
    },
    {
      '@type': 'WebApplication',
      '@id': `${canonicalUrl}#app`,
      name: 'Schedule III Balance Sheet Builder',
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

export default function BalanceSheetPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <JsonLd data={pageJsonLd} />

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider mb-2">
            <span>Companies Act, 2013</span>
            <span>•</span>
            <span>Schedule III Division I</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">100% Client-Side Privacy</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy dark:text-white tracking-tight">
            Schedule III Balance Sheet Builder
          </h1>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
            Under <strong>Section 129</strong> of the Companies Act, 2013, every Indian company must prepare its Balance Sheet in accordance with <strong>Schedule III</strong> and applicable Accounting Standards. Use this free, browser-only builder to convert your trial balance into a verified statutory draft with March 2021 disclosures (promoter shareholding, trade ageing, CWIP schedules, and 11 ratios), or download print-ready blank Excel, PDF, and Word templates.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Zero server data transmission
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              March 2021 MCA amendments integrated
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              Formula-linked XLSX &amp; docx exports
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Tool Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        <BalanceSheetBuilderClient />
      </div>

      {/* Comprehensive Server-Rendered Legal & Accounting Reference */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 space-y-12 text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
        {/* Section 1: Statutory Framework */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            1. Legal Basis: Section 129 and Schedule III Division I
          </h2>
          <p>
            Section 129(1) of the Companies Act, 2013 requires that financial statements shall give a true and fair view of the state of affairs of the company and comply with the accounting standards notified under Section 133. Schedule III sets out the general instructions for preparation of the Balance Sheet and Statement of Profit and Loss.
          </p>
          <p>
            Schedule III is divided into three statutory frameworks:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            <li>
              <strong>Division I:</strong> Applies to companies required to comply with the Companies (Accounting Standards) Rules, 2006 (AS / Non-Ind AS framework). This applies to the vast majority of private limited companies, OPCs, and unlisted entities below Ind AS net worth thresholds.
            </li>
            <li>
              <strong>Division II:</strong> Applies to companies required to comply with the Companies (Indian Accounting Standards) Rules, 2015 (Ind AS).
            </li>
            <li>
              <strong>Division III:</strong> Applies specifically to Non-Banking Financial Companies (NBFCs) preparing financial statements under Ind AS.
            </li>
          </ul>
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-blue-200">
            <strong>Important Legal Distinction:</strong> Company type (Private Limited, Public, OPC, or Section 8) does not automatically decide whether Division I or Division II applies. Applicability is governed by the Ind AS roadmap (e.g. net worth exceeding ₹250 Crores or listed securities). Always confirm the accounting framework before finalizing financial statements.
          </div>
        </section>

        {/* Section 2: Statutory Line Order Walkthrough */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Scale className="w-5 h-5 text-blue-600" />
            2. Schedule III Division I Balance Sheet Structure
          </h2>
          <p>
            Under Schedule III Division I Part I, the Balance Sheet follows a strict vertical format with Roman numeral classifications. Horizontal T-shaped balance sheets are prohibited under the Companies Act, 2013.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                I. EQUITY AND LIABILITIES
              </h3>
              <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <strong>Shareholders' Funds:</strong> Share capital, Reserves and surplus, Money received against share warrants.
                </li>
                <li>
                  <strong>Share Application Money Pending Allotment:</strong> Disclosed to the extent not refundable.
                </li>
                <li>
                  <strong>Non-Current Liabilities:</strong> Long-term borrowings, Deferred tax liabilities (Net), Other long-term liabilities, Long-term provisions.
                </li>
                <li>
                  <strong>Current Liabilities:</strong> Short-term borrowings, Trade payables (with MSME and non-MSME split), Other current liabilities, Short-term provisions.
                </li>
              </ol>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                II. ASSETS
              </h3>
              <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <strong>Non-Current Assets:</strong> Property, Plant and Equipment and Intangible Assets (PPE, Intangibles, CWIP, Intangibles under dev), Non-current investments, Deferred tax assets (Net), Long-term loans &amp; advances, Other non-current assets.
                </li>
                <li>
                  <strong>Current Assets:</strong> Current investments, Inventories, Trade receivables, Cash and cash equivalents, Short-term loans and advances, Other current assets.
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Section 3: March 2021 Amendments */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Info className="w-5 h-5 text-blue-600" />
            3. The March 2021 Schedule III Amendments Checklist
          </h2>
          <p>
            Vide Notification No. G.S.R. 207(E) dated 24 March 2021 (effective from 1 April 2021), the Ministry of Corporate Affairs made comprehensive amendments to Schedule III disclosures. Key statutory requirements include:
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <strong className="text-slate-900 dark:text-white block mb-1">
                1. Promoter Shareholding Disclosures:
              </strong>
              A separate tabular note specifying the number of shares held by each promoter, percentage of total shares, and percentage change during the year across equity and preference classes.
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <strong className="text-slate-900 dark:text-white block mb-1">
                2. Trade Payables Ageing Schedule:
              </strong>
              Ageing schedule split into MSME and others, and disputed vs undisputed dues across periods: Less than 1 year, 1-2 years, 2-3 years, and more than 3 years.
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <strong className="text-slate-900 dark:text-white block mb-1">
                3. Trade Receivables Ageing Schedule:
              </strong>
              Bucketed into less than 6 months, 6 months to 1 year, 1-2 years, 2-3 years, and more than 3 years, classified across undisputed good, doubtful, disputed good, and disputed doubtful.
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <strong className="text-slate-900 dark:text-white block mb-1">
                4. Capital Work-in-Progress (CWIP) Ageing &amp; Completion:
              </strong>
              Schedule distinguishing projects in progress from temporarily suspended projects, with cost overrun and time overrun tracking.
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <strong className="text-slate-900 dark:text-white block mb-1">
                5. The 11 Statutory Financial Ratios:
              </strong>
              Mandatory computation of 11 ratios (Current Ratio, Debt-Equity, DSCR, ROE, Inventory Turnover, Trade Receivables Turnover, Trade Payables Turnover, Net Capital Turnover, Net Profit Ratio, ROCE, ROI) accompanied by explanations whenever variance against the preceding year exceeds 25%.
            </div>
          </div>
        </section>

        {/* Section 4: Worked Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            4. Illustrative Example: Trial Balance to Balance Sheet
          </h2>
          <p>
            Consider a private limited tech services company with ₹50 Lakhs paid-up capital, ₹78.5 Lakhs reserves &amp; surplus, ₹40 Lakhs bank term loan, and ₹15 Lakhs current maturities. On the assets side, the company has ₹101 Lakhs net PPE, ₹48.6 Lakhs trade receivables, and ₹33.2 Lakhs cash and bank equivalents.
          </p>
          <p>
            In the Schedule III layout:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li>
              The ₹15 Lakhs current maturities of long-term debt are classified under <strong>Short-Term Borrowings</strong> (Current Liabilities), not Other Current Liabilities.
            </li>
            <li>
              Sundry Debtors of ₹48.6 Lakhs are accompanied by Note 23 detailing undisputed trade receivables and the statutory ageing schedule.
            </li>
            <li>
              Accumulated depreciation of ₹22.5 Lakhs is presented as a contra asset offsetting gross Property, Plant and Equipment.
            </li>
          </ul>
        </section>

        {/* Section 5: FAQs */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            5. Frequently Asked Questions (FAQs)
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Can an LLP use this Schedule III Balance Sheet format?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                No. Limited Liability Partnerships are governed by the LLP Act, 2008 and file Form 8 (Statement of Account &amp; Solvency). Schedule III is enacted under Section 129 of the Companies Act, 2013 and applies exclusively to incorporated companies.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Is a balanced balance sheet automatically legally compliant?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                No. A balance sheet where total assets equal total liabilities is arithmetically balanced, but legal compliance requires correct current/non-current categorization, proper Accounting Standard treatments, mandatory note disclosures (promoters, MSME ageing, ratios), and statutory audit verification.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Where are current maturities of long-term borrowings shown?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Following the March 2021 MCA amendments, current maturities of long-term borrowings must be disclosed separately under <strong>Short-term borrowings</strong> under Current Liabilities. Prior practice of grouping them under Other Current Liabilities was discontinued.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Are my company financial figures uploaded to your servers?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                No. The Financial Statements Builder runs 100% client-side in your local browser. All trial balance parsing, formula recalculations, and PDF/XLSX/Word export compilations happen in JavaScript on your device. No financial data is sent to our servers.
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
