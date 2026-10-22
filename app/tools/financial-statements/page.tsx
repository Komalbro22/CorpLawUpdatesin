import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'
import FinancialStatementsNav from './FinancialStatementsNav'
import BlankTemplatesDownloadGrid from './BlankTemplatesDownloadGrid'
import {
  FileSpreadsheet,
  PieChart,
  ArrowRightLeft,
  Download,
  ShieldCheck,
  Scale,
  BookOpen,
  ArrowRight,
  Layers,
  HelpCircle,
  FileText,
  Lock
} from 'lucide-react'

const canonicalUrl = 'https://www.corplawupdates.in/tools/financial-statements'
const ogImageUrl = 'https://www.corplawupdates.in/api/og?title=Financial+Statements+Builder+%26+Schedule+III+Formats&category=Tools'

export const metadata: Metadata = {
  title: 'Financial Statements Builder & Schedule III Formats | Free Tools',
  description:
    'Free Schedule III Financial Statements Builder for Indian companies. Prepare Balance Sheets, Profit & Loss Statements, and Indirect Cash Flows (Division I AS & Division II Ind AS) with Excel, PDF, and Word downloads.',
  alternates: {
    canonical: canonicalUrl
  },
  openGraph: {
    title: 'Financial Statements Builder & Schedule III Formats | CorpLawUpdates.in',
    description:
      'Free browser-only financial statements preparation suite. Convert trial balances into Schedule III Division I & II statements with 2021 amendments, ageing schedules, and ratios.',
    url: canonicalUrl,
    type: 'website',
    siteName: 'CorpLawUpdates.in',
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Financial Statements Builder Hub' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial Statements Builder & Schedule III Formats | Free Tools',
    description: 'Free browser-only Schedule III statement builder and downloadable format packs.',
    images: [ogImageUrl]
  }
}

const hubJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#collectionpage`,
      name: 'Financial Statements Builder — Schedule III Formats and Tools',
      description:
        'A comprehensive free browser-only financial statement preparation suite for Indian companies under Companies Act 2013 Schedule III.',
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            url: 'https://www.corplawupdates.in/tools/financial-statements/balance-sheet',
            name: 'Schedule III Balance Sheet Builder'
          },
          {
            '@type': 'ListItem',
            position: 2,
            url: 'https://www.corplawupdates.in/tools/financial-statements/profit-and-loss',
            name: 'Statement of Profit and Loss Builder'
          },
          {
            '@type': 'ListItem',
            position: 3,
            url: 'https://www.corplawupdates.in/tools/financial-statements/cash-flow-statement',
            name: 'Cash Flow Statement Builder (Indirect Method)'
          }
        ]
      }
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
          name: 'Financial Statements Builder',
          item: canonicalUrl
        }
      ]
    }
  ]
}

export default function FinancialStatementsHubPage() {
  const toolCards = [
    {
      href: '/tools/financial-statements/balance-sheet',
      title: 'Schedule III Balance Sheet Builder',
      badge: 'Division I & 2021 Amendments',
      icon: FileSpreadsheet,
      badgeColor: 'bg-amber-50 text-gold dark:bg-amber-950/60 dark:text-gold-accent border border-amber-200/60 dark:border-amber-800/40',
      description:
        'Convert trial balances into vertical Schedule III Part I balance sheets. Includes promoter shareholding, trade ageing schedules, CWIP, and 11 statutory ratios.',
      action: 'Open Balance Sheet Builder'
    },
    {
      href: '/tools/financial-statements/profit-and-loss',
      title: 'Statement of Profit and Loss Builder',
      badge: 'Schedule III Part II',
      icon: PieChart,
      badgeColor: 'bg-blue-50 text-navy dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40',
      description:
        'Classify revenues and expenses by nature, compute PBT, provision for taxes (AS-22), and reconcile profit into the retained earnings roll-forward bridge.',
      action: 'Open Profit & Loss Builder'
    },
    {
      href: '/tools/financial-statements/cash-flow-statement',
      title: 'Cash Flow Statement Builder (Indirect)',
      badge: 'AS-3 / Ind AS 7',
      icon: ArrowRightLeft,
      badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
      description:
        'Reconcile net profit to operating cash flows via working capital movements, supplemented with actual non-cash and investing inputs. Includes Section 2(40) exemption checker.',
      action: 'Open Cash Flow Builder'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <JsonLd data={hubJsonLd} />

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider mb-2">
            <span>Companies Act, 2013</span>
            <span>•</span>
            <span>Statutory Compliance Suite</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">Zero Server Data Upload</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-navy dark:text-white tracking-tight break-words">
            Financial Statements Builder — Schedule III Formats and Tools
          </h1>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
            Prepare, verify, and export statutory corporate financial statements in accordance with Section 129 and Schedule III of the Companies Act, 2013. Designed for Company Secretaries, Chartered Accountants, and corporate finance teams — 100% free, no login required, and processed entirely in your browser with formula-linked Excel, PDF, and Word outputs.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Client-Side Privacy (Zero uploads)
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Scale className="w-3.5 h-3.5 text-navy dark:text-blue-400" />
              March 2021 MCA Disclosures Integrated
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <FileSpreadsheet className="w-3.5 h-3.5 text-gold" />
              12 Blank Download Packs (PDF, XLSX, DOCX)
            </span>
          </div>
        </div>
      </div>

      {/* Main Suite Cards */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-8 sm:py-10 overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {toolCards.map(tool => {
            const Icon = tool.icon
            return (
              <div
                key={tool.href}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-gold dark:text-gold-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-navy dark:text-white mb-2">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {tool.description}
                  </p>
                </div>

                <Link
                  href={tool.href}
                  className="w-full py-2.5 px-4 bg-navy hover:bg-[#152e56] text-white border border-gold-accent/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span>{tool.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-accent group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Division I vs Division II Comparative Matrix */}
        <div className="mt-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-navy dark:text-gold-accent" />
              Schedule III: Division I (AS) vs Division II (Ind AS) Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select the appropriate statutory division based on applicable accounting rules, not just company type.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy text-white font-bold">
                  <th className="p-3 w-40">Parameter</th>
                  <th className="p-3">Division I (Companies (Accounting Standards) Rules, 2006)</th>
                  <th className="p-3">Division II (Companies (Ind AS) Rules, 2015)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Applicability</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    Non-Ind AS companies: Unlisted entities with net worth &lt; ₹250 Crores, small companies, OPCs.
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    All listed companies (or in process of listing), and unlisted companies with net worth ≥ ₹250 Crores (including holding/subsidiaries).
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Equity Section</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    "Shareholders' Funds" (Share Capital, Reserves and Surplus, Money received against share warrants).
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    "Equity" (Equity Share Capital and Other Equity), Statement of Changes in Equity (SOCIE) mandatory.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Fixed Assets Terminology</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    Property, Plant and Equipment and Intangible Assets.
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    Property, Plant and Equipment (PPE), Right-of-Use (ROU) Assets (Ind AS 116), Investment Property, Intangibles.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">P&amp;L Presentation</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    Part II format: Expenses by nature ending in Profit / (Loss) for the period (PAT).
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    Statement of Profit and Loss plus Other Comprehensive Income (OCI) yielding Total Comprehensive Income.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Cash Flow Standard</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    Accounting Standard 3 (AS-3). Section 2(40) exemption applies for OPCs, small companies, and dormant companies.
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    Ind AS 7. Mandatory for all Ind AS entities without exemption.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200">
            <strong>Exclusions:</strong> Division III applies to relevant Non-Banking Financial Companies (NBFCs) under Ind AS and is excluded from this MVP. Limited Liability Partnerships (LLPs) do not prepare Schedule III statements and file Form 8 under the LLP Act, 2008.
          </div>
        </div>

        {/* 12 Blank Download Templates Showcase with Direct Client Downloads */}
        <div className="mt-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-navy dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-gold" />
                Statutory Blank Template Packs (12 Files)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Direct 1-click downloads for print-ready empty formats with statutory headings, formula-linked Excel sheets, and editable Word documents.
              </p>
            </div>
            <Link
              href="/tools/financial-statements/balance-sheet"
              className="text-xs font-semibold text-navy hover:text-gold dark:text-gold-accent flex items-center gap-1 transition-colors"
            >
              Open Builder to Generate →
            </Link>
          </div>

          <BlankTemplatesDownloadGrid />
        </div>

        {/* High Level 4-Step Workflow */}
        <div className="mt-14 bg-navy rounded-2xl p-6 sm:p-8 text-white border border-gold-accent/20 shadow-md">
          <h2 className="text-xl font-bold mb-2 text-gold-accent">How It Works: 4 Simple Steps</h2>
          <p className="text-xs text-slate-300 mb-6 max-w-2xl">
            Prepare review-ready Schedule III financial statements without sharing sensitive company numbers with third-party servers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold-accent text-navy font-bold text-[11px] mb-2 shadow">
                1
              </span>
              <strong className="block text-sm mb-1 text-white">Step 1: Company Setup</strong>
              <p className="text-slate-300">
                Enter company name, CIN, financial year-end date, and choose presentation units.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold-accent text-navy font-bold text-[11px] mb-2 shadow">
                2
              </span>
              <strong className="block text-sm mb-1 text-white">Step 2: Paste Trial Balance</strong>
              <p className="text-slate-300">
                Paste tab-separated columns from Excel or Tally. Unmapped ledgers are flagged instantly.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold-accent text-navy font-bold text-[11px] mb-2 shadow">
                3
              </span>
              <strong className="block text-sm mb-1 text-white">Step 3: Verify Disclosures</strong>
              <p className="text-slate-300">
                Check promoter holding, trade ageing schedules, CWIP, and 11 statutory ratios.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold-accent text-navy font-bold text-[11px] mb-2 shadow">
                4
              </span>
              <strong className="block text-sm mb-1 text-white">Step 4: Export Files</strong>
              <p className="text-slate-300">
                Download formatted PDF, formula-linked Excel (.xlsx), and Word (.docx) directly.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-14 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Is this tool completely free?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes. CorpLawUpdates provides this Financial Statements Builder free of charge for Indian legal, accounting, and compliance professionals. There are no paywalls, hidden fees, or mandatory account logins.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Are financial figures saved on your servers?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                No. All financial calculations, mapping, and document generation execute entirely client-side in your local browser memory. No trial balance, company name, or draft statements are transmitted to our servers.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Can I edit the generated Excel workbook?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes. The generated .xlsx workbook contains genuine dynamic Excel formulas (=SUM, subtotals, ratios) and is not password protected. You can adjust lines, insert additional notes, or re-run calculations in Microsoft Excel or Google Sheets.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Does this replace statutory audit?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                No. This builder is a preparation and reconciliation aid to help prepare review-ready statutory drafts. All financial statements must be audited and certified by an independent Chartered Accountant in accordance with Section 139 and Section 143 of the Companies Act, 2013.
              </p>
            </div>
          </div>
        </div>

        {/* Hub Explore Links */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800">
          <HubExploreLinks />
        </div>
      </div>
    </div>
  )
}
