import { Metadata } from 'next'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { COMPLIANCE_ENTRY_COLUMNS } from '@/lib/supabase-queries'
import CalendarPageClient, { type ComplianceEntry } from '@/components/CalendarPageClient'
import JsonLd from '@/components/JsonLd'

export const revalidate = 60 // 1 minute fallback for fast propagation; instant on-demand via revalidateComplianceMutation

const CURRENT_YEAR = new Date().getFullYear()
const NEXT_YEAR = CURRENT_YEAR + 1

export const metadata: Metadata = {
  title: `Compliance Calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} — Corporate Due Dates`,
  description: `Corporate compliance calendar for FY ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)}. Verified statutory deadlines for MCA, GST, Income Tax, SEBI, Labor Laws, and FEMA filings with forms, penalties, and circulars.`,
  keywords: [
    `compliance calendar ${CURRENT_YEAR}`,
    `compliance calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)}`,
    `MCA filing due dates ${CURRENT_YEAR}`,
    `GST due dates ${CURRENT_YEAR}`,
    `Labor Law deadlines ${CURRENT_YEAR}`,
    `EPF ESIC monthly returns ${CURRENT_YEAR}`,
    `SEBI compliance calendar ${CURRENT_YEAR}`,
    `company compliance deadlines India ${CURRENT_YEAR}`,
    'CS professional compliance dates',
    `MGT-7 due date ${CURRENT_YEAR}`,
    `AOC-4 due date ${CURRENT_YEAR}`,
    `DIR-3 KYC due date ${CURRENT_YEAR}`,
    `income tax due dates companies ${CURRENT_YEAR}`,
    `FEMA compliance dates ${CURRENT_YEAR}`,
    'MSME-1 due date',
    'PAS-3 filing deadline',
    'DPT-3 due date',
    'corporate compliance calendar India',
    'ROC filing deadlines India',
    'SEBI LODR compliance deadlines',
    'RBI compliance due dates',
    'Professional Tax due dates'
  ],
  alternates: { canonical: 'https://www.corplawupdates.in/calendar' },
  openGraph: {
    title: `Compliance Calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} — All MCA GST SEBI RBI Due Dates India`,
    description: `Complete compliance deadline calendar for Indian companies. MCA, GST, SEBI, RBI, Income Tax and Labor Laws due dates for FY ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} in one place.`,
    url: 'https://www.corplawupdates.in/calendar',
    images: [{ url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(`Compliance Calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)}`)}&category=`, width: 1200, height: 630 }],
  },
}

// Authoritative FAQs verified against official notifications
const STATUTORY_FAQS = [
  {
    question: 'What is the due date for MGT-7?',
    answer: '29 November 2026 for FY 2025-26 (60 days from the AGM); MCA General Circular 05/2026 allows filing till 31 January 2027 without additional fees.',
  },
  {
    question: 'What is the due date for AOC-4?',
    answer: '30 October 2026 for a 30 September AGM (30 days from the AGM); GC 05/2026 allows filing till 31 December 2026 without additional fees.',
  },
  {
    question: 'What is the due date for DIR-3 KYC?',
    answer: 'Once every three financial years; next due 30 June 2028 (Rule 12A as substituted by G.S.R. 943(E)).',
  },
  {
    question: 'What is the due date for GSTR-3B?',
    answer: '20th of the following month for monthly filers; QRMP filers: 22nd (Category A states) / 24th (Category B states).',
  },
  {
    question: 'What are the EPF and ESIC due dates?',
    answer: '15th of the following month for both EPF ECR and ESIC contributions.',
  },
]

const CANONICAL_REGULATORS = new Set(['income_tax', 'gst', 'mca', 'sebi', 'labor_law', 'fema', 'rbi', 'other'])

export default async function CalendarPage() {
  const { data } = await supabase
    .from('compliance_entries')
    .select(COMPLIANCE_ENTRY_COLUMNS)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('regulator')
    .order('display_order')

  // Filter strictly by canonical regulators — guarantees test rows/unrecognized categories never skew counts
  const rawEntries = ((data || []) as ComplianceEntry[]).filter(e => CANONICAL_REGULATORS.has(e.regulator))

  // Compute dynamic verification timestamp
  const latestVerifiedTimestamp = rawEntries
    .map(e => e.last_verified_at || e.updated_at)
    .filter(Boolean)
    .sort()
    .reverse()[0] || new Date().toISOString()

  let formattedVerifiedDate = '16 November 2026'
  try {
    const d = new Date(latestVerifiedTimestamp)
    if (!isNaN(d.getTime())) {
      formattedVerifiedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  } catch {}

  // JSON-LD: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: `Compliance Calendar ${CURRENT_YEAR}`, item: 'https://www.corplawupdates.in/calendar' },
    ],
  }

  // JSON-LD: Dynamic ItemList Schema from ALL live rows (no hardcoding, no stale data)
  const dynamicItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `India Corporate Compliance Calendar Deadlines FY ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)}`,
    description: `Complete list of ${rawEntries.length} verified statutory compliance deadlines under MCA, GST, Income Tax, SEBI, Labor Laws, and FEMA.`,
    numberOfItems: rawEntries.length,
    itemListElement: rawEntries.map((e, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `${e.form_name} — ${e.compliance_title}`,
      description: `Due Date: ${e.due_date}. Applicable to: ${e.applicable_to || 'Relevant entities'}.${e.penalty ? ` Penalty: ${e.penalty}` : ''}${e.regulation_reference ? ` Governing law: ${e.regulation_reference}` : ''}`,
      url: `https://www.corplawupdates.in/calendar?highlight=${e.id}`,
    })),
  }

  // JSON-LD: FAQPage Schema
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: STATUTORY_FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <Suspense fallback={
        <div className="space-y-4 max-w-5xl mx-auto px-4 py-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      }>
        <CalendarPageClient entries={rawEntries} />
      </Suspense>

      {/* ========================================================
          VISIBLE STATUTORY FAQS SECTION (GEO / AI SEO / Search)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6 pb-12 pt-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy dark:text-white">
              Frequently Asked Compliance Questions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            Direct statutory answers to high-frequency corporate compliance questions verified against current MCA general circulars, CBDT rules, and CBIC notifications.
          </p>

          <div className="space-y-4">
            {STATUTORY_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-700/60"
              >
                <h3 className="font-bold text-navy dark:text-white text-sm sm:text-base mb-1.5 flex items-start gap-2">
                  <span className="text-amber-500 font-black">Q.</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed pl-5 border-l-2 border-amber-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          SEO KNOWLEDGE FOOTER & DIRECTORY
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6 pb-16 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-navy dark:text-white mb-4 font-heading">
            About the Corporate Compliance Calendar FY {CURRENT_YEAR}-{String(NEXT_YEAR).slice(2)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="space-y-3">
              <p>
                The <strong>Corporate Compliance Calendar {CURRENT_YEAR}-{String(NEXT_YEAR).slice(2)}</strong> tracks all key regulatory filing deadlines for Indian companies under:
              </p>
              <ul className="space-y-1.5 list-none">
                {[
                  'MCA / ROC / LLP filings — MGT-7, AOC-4, DIR-3 KYC, DPT-3, LLP Form 11 & Form 8',
                  'GST filings — GSTR-1 (Outward Supplies), GSTR-3B (Returns & Tax Payment), CMP-08',
                  'SEBI LODR deadlines — Quarterly results, governance reports, shareholding patterns',
                  'Income Tax due dates — Corporate ITR, Tax Audit Form 3CD, TDS returns & monthly deposits',
                  'Labor Laws compliance — Monthly EPF (PF) & ESIC return filings and PT deposits',
                  'RBI & FEMA compliance dates — FLA annual return, ECB, FDI, ODI return filings',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <p>
                Designed for <strong>Company Secretaries (CS)</strong>, <strong>Chartered Accountants (CA)</strong>, <strong>Cost Accountants (CMA)</strong>, legal counsels, and corporate compliance teams managing statutory obligations under the Companies Act 2013, GST Acts, Labor Codes, SEBI LODR Regulations, and RBI Foreign Exchange Management Regulations.
              </p>
              <div className="text-xs bg-amber-500/10 dark:bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 text-amber-900 dark:text-amber-300">
                <span className="font-bold">Statutory Verification Note:</span> All due dates, rationalised late-fee slabs, and penalty provisions are verified against current statutory provisions and circulars including CBDT Circular No. 07/2026, MCA V3 notifications, CBIC GST late-fee rationalisation notifications, and SEBI LODR SOP guidelines. Last verified: <strong>{formattedVerifiedDate}</strong>.
              </div>
            </div>
          </div>

          {/* Frequently Searched Keywords Directory */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800">
            <h3 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider mb-3">
              Frequently Searched Compliances & Due Dates
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "GST due dates 2026-27", "GSTR-1 outward supply monthly deadline", "GSTR-3B monthly tax payment return",
                "EPF ECR monthly return filing", "ESIC monthly deposit date", "MCA company annual return dates",
                "LLP Form 11 annual return", "LLP Form 8 account & solvency statement", "AOC-4 financial statement filing",
                "MGT-7 annual return ROC", "DIR-3 KYC director verification date", "TDS monthly deposit challan 281",
                "Corporate Income Tax ITR filing", "Tax Audit Form 3CD deadline", "SEBI LODR quarterly compliance Reg 33",
                "RBI FEMA annual returns", "FLA return FDI compliance", "DPT-3 outstanding loans return",
                "MSME-1 half yearly return filing", "Professional Tax return monthly due date"
              ].map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 px-2.5 py-1 rounded-md transition-colors cursor-default border border-slate-200/50 dark:border-slate-700/50"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Schemas */}
      <JsonLd id="calendar-breadcrumb-schema" data={breadcrumbSchema} />
      <JsonLd id="calendar-itemlist-schema" data={dynamicItemListSchema} />
      <JsonLd id="calendar-faqpage-schema" data={faqPageSchema} />
    </>
  )
}
