import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'
import ProfitLossBuilderClient from './ProfitLossBuilderClient'
import {
  PieChart,
  FileSpreadsheet,
  ShieldCheck,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Scale,
  Info
} from 'lucide-react'

const canonicalUrl = 'https://www.corplawupdates.in/tools/financial-statements/profit-and-loss'
const ogImageUrl = 'https://www.corplawupdates.in/api/og?title=Schedule+III+Profit+and+Loss+Statement+Builder&category=Tools'

export const metadata: Metadata = {
  title: 'Profit and Loss Statement Format Excel & PDF | Schedule III',
  description:
    'Free Schedule III Statement of Profit and Loss builder and format downloads (Excel, PDF, Word). Prepare statutory Division I Part II statements with revenue/expense groupings, tax provisions, and retained earnings roll-forwards.',
  alternates: {
    canonical: canonicalUrl
  },
  openGraph: {
    title: 'Schedule III Profit and Loss Statement Builder (Excel, PDF, Word)',
    description:
      'Prepare statutory Division I Statement of Profit and Loss in browser with revenue classifications, expense breakdowns, and retained earnings bridges.',
    url: canonicalUrl,
    type: 'website',
    siteName: 'CorpLawUpdates.in',
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Schedule III Profit and Loss Builder' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profit and Loss Statement Format Excel & PDF | Schedule III',
    description: 'Free Schedule III Profit and Loss builder with Excel, PDF, and Word downloads.',
    images: [ogImageUrl]
  }
}

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: 'Free Schedule III Profit and Loss Statement Builder',
      description:
        'A browser-only Schedule III Division I Part II Profit and Loss statement preparation tool with Excel, PDF, and Word outputs.',
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
          name: 'Profit and Loss Builder',
          item: canonicalUrl
        }
      ]
    },
    {
      '@type': 'WebApplication',
      '@id': `${canonicalUrl}#app`,
      name: 'Schedule III Profit and Loss Builder',
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

export default function ProfitLossPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <JsonLd data={pageJsonLd} />

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            <span>Companies Act, 2013</span>
            <span>•</span>
            <span>Schedule III Division I Part II</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">100% Client-Side Privacy</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy dark:text-white tracking-tight">
            Schedule III Statement of Profit and Loss Builder
          </h1>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
            The <strong>Statement of Profit and Loss</strong> presents an enterprise's financial performance by measuring revenue earned against expenses incurred over an accounting period. Under <strong>Part II of Schedule III</strong> (Companies Act, 2013), Indian companies must classify expenses by nature (materials, employee benefits, finance costs, depreciation) rather than function. Use this tool to generate statutory Division I statements or download customizable Excel, PDF, and Word templates.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Zero server data transmission
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <Scale className="w-3.5 h-3.5 text-navy dark:text-blue-400" />
              Retained earnings &amp; reserves bridge
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              <FileSpreadsheet className="w-3.5 h-3.5 text-gold" />
              Formula Excel, PDF &amp; Word exports
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Tool Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        <ProfitLossBuilderClient />
      </div>

      {/* Comprehensive Server-Rendered Legal & Accounting Reference */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 space-y-12 text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
        {/* Section 1: Statutory Order and Line Classification */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <BookOpen className="w-5 h-5 text-navy dark:text-gold-accent" />
            1. Statutory Structure of Schedule III Part II (Division I)
          </h2>
          <p>
            Schedule III Division I Part II prescribes the strict order of presentation for the Statement of Profit and Loss for non-Ind AS companies:
          </p>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy text-white font-bold">
                  <th className="p-3 w-16">Item</th>
                  <th className="p-3">Statutory Particulars</th>
                  <th className="p-3">Accounting Standard Basis &amp; Statutory Inclusions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">I.</td>
                  <td className="p-3 font-semibold">Revenue from operations</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Sale of products, sale of services, and other operating revenues (net of GST/trade discounts).</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">II.</td>
                  <td className="p-3 font-semibold">Other income</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Interest on fixed deposits, dividend income, net gain on sale of investments, foreign exchange differences.</td>
                </tr>
                <tr className="bg-amber-50/70 dark:bg-amber-950/30 font-bold text-slate-900 dark:text-white">
                  <td className="p-3 font-mono text-gold dark:text-gold-accent">III.</td>
                  <td className="p-3">Total Revenue (I + II)</td>
                  <td className="p-3">Sum of operating turnover and other income.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent" rowSpan={8}>IV.</td>
                  <td className="p-3 font-semibold">Expenses:</td>
                  <td className="p-3 text-slate-500 italic">Operating and administrative costs classified strictly by nature:</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">• Cost of materials consumed</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Raw materials, components, and direct consumption items.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">• Purchases of Stock-in-Trade</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Finished goods purchased for direct resale without processing.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">• Changes in inventories of finished goods, work-in-progress and Stock-in-Trade</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Opening inventory minus closing inventory differential.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">• Employee benefits expense</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Salaries, wages, bonus, PF/gratuity contributions, and staff welfare.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">• Finance costs</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Interest expense, loan processing fees, bank borrowing charges.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">• Depreciation and amortisation expense</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Depreciation on PPE and amortisation of intangible assets.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">• Other expenses</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Rent, rates, taxes, auditor remuneration, legal and professional fees.</td>
                </tr>
                <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                  <td className="p-3 font-mono text-navy dark:text-gold-accent">IV.</td>
                  <td className="p-3">Total expenses</td>
                  <td className="p-3">Sum of all expense line items classified by nature.</td>
                </tr>
                <tr className="font-semibold">
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">V.</td>
                  <td className="p-3">Profit before exceptional and extraordinary items and tax (III − IV)</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Operating profit before exceptional adjustments.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">VI.</td>
                  <td className="p-3 font-semibold">Exceptional items</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Items of income or expense within ordinary activities that require separate disclosure by virtue of size or incidence (AS-5).</td>
                </tr>
                <tr className="font-semibold">
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">VII.</td>
                  <td className="p-3">Profit before extraordinary items and tax (V − VI)</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Subtotal after exceptional items.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">VIII.</td>
                  <td className="p-3 font-semibold">Extraordinary items</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Events clearly distinct from ordinary activities (e.g. losses from unforeseen natural calamities) (AS-5).</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td className="p-3 font-mono text-navy dark:text-gold-accent">IX.</td>
                  <td className="p-3">Profit before tax (VII − VIII)</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Statutory Profit Before Tax (PBT).</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent" rowSpan={3}>X.</td>
                  <td className="p-3 font-semibold">Tax expense:</td>
                  <td className="p-3 text-slate-500 italic">Provisions for tax under the Income-tax Act, 1961 and AS-22:</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">(1) Current tax</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Income tax payable for the current financial year.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">(2) Deferred tax</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Deferred tax charge or credit arising from timing differences under AS-22.</td>
                </tr>
                <tr className="font-semibold">
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">XI.</td>
                  <td className="p-3">Profit/(Loss) for the period from continuing operations (IX − X)</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Operating result from ongoing business activities after tax.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">XII.</td>
                  <td className="p-3 font-semibold">Profit/(loss) from discontinuing operations</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Pre-tax result attributable to discontinuing operations under AS-24.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">XIII.</td>
                  <td className="p-3 font-semibold">Tax expense of discontinuing operations</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Current and deferred tax specifically attributable to discontinuing operations.</td>
                </tr>
                <tr className="font-semibold">
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent">XIV.</td>
                  <td className="p-3">Profit/(loss) from discontinuing operations (after tax) (XII − XIII)</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Net after-tax result from discontinuing operations.</td>
                </tr>
                <tr className="bg-navy text-white font-bold">
                  <td className="p-3 font-mono text-gold-accent">XV.</td>
                  <td className="p-3">Profit/(Loss) for the period (XI + XIV)</td>
                  <td className="p-3 text-slate-200">Final statutory bottom-line Profit After Tax (PAT) transferred to Reserves &amp; Surplus.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-navy dark:text-gold-accent" rowSpan={3}>XVI.</td>
                  <td className="p-3 font-semibold">Earnings per equity share:</td>
                  <td className="p-3 text-slate-500 italic">Calculated in accordance with Accounting Standard 20 (AS-20):</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">(1) Basic (₹)</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Profit attributable to equity shareholders divided by weighted average number of equity shares.</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="p-3 pl-6 font-medium">(2) Diluted (₹)</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">EPS adjusted for potential dilution from stock options, warrants, or convertible instruments.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Profit to Reserves Bridge */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Scale className="w-5 h-5 text-blue-600" />
            2. The Retained Earnings and Reserves &amp; Surplus Bridge
          </h2>
          <p>
            A common trap in corporate reporting is assuming that Current Year Profit After Tax (PAT) automatically equals the change in Reserves and Surplus on the Balance Sheet. In statutory reality, the reserves roll-forward must account for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li><strong>Opening Surplus in Statement of Profit &amp; Loss</strong> brought forward from the preceding financial year.</li>
            <li><strong>Add: Profit for the Year (PAT)</strong> transferred from the Statement of Profit and Loss.</li>
            <li><strong>Less: Interim and Final Dividends</strong> declared or paid.</li>
            <li><strong>Less: Statutory Transfers to Reserves</strong> (such as Debenture Redemption Reserve or General Reserve).</li>
            <li><strong>Less: Bonus Shares Issued</strong> capitalised out of retained earnings or securities premium.</li>
          </ul>
        </section>

        {/* Section 3: Section 8 Non-Profit Companies */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Info className="w-5 h-5 text-blue-600" />
            3. Disclosures for Section 8 (Non-Profit) Entities
          </h2>
          <p>
            Section 8 companies prepare an <strong>Income and Expenditure Account</strong> instead of a Profit and Loss Account. Operating receipts predominantly comprise grants, donations, subscriptions, and project funds rather than commercial turnover. Surpluses cannot be distributed as dividends to members under Section 8(1)(b) of the Companies Act, 2013 and must be applied exclusively towards promoting charitable objects.
          </p>
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
                Can an Indian company classify expenses by function (e.g. administrative, selling, distribution)?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                No. Companies Act 2013 Schedule III Division I specifically requires expenses to be classified by <strong>nature</strong> (cost of materials, employee benefits, finance costs, depreciation, and other expenses). Functional classifications (like Cost of Goods Sold or Selling &amp; Distribution) used in US GAAP or traditional management accounting are not permitted on the face of the Schedule III statement.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                What is the difference between Exceptional and Extraordinary items?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Under AS-5, <strong>Exceptional items</strong> are items of income or expense that arise from ordinary activities of the enterprise but are of such size, nature, or incidence that their disclosure is relevant to explain performance (e.g. disposal of fixed assets or restructuring). <strong>Extraordinary items</strong> are non-recurring events that are clearly distinct from ordinary activities (e.g. losses from natural calamities or government expropriation).
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Are comparative figures required for the previous financial year?
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Yes. Schedule III General Instructions mandate comparative figures for the preceding reporting period for all items in the Statement of Profit and Loss and Notes to Accounts, except for the first financial statements after incorporation.
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
