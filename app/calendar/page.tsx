import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import CalendarPageClient, { type ComplianceEntry } from '@/components/CalendarPageClient'

export const revalidate = 1800

const CURRENT_YEAR = new Date().getFullYear()
const NEXT_YEAR = CURRENT_YEAR + 1

export const metadata: Metadata = {
  title: `Compliance Calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} — MCA, GST, SEBI, Income Tax & Labor Law Due Dates India`,
  description: `Complete corporate compliance deadline calendar for FY ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)}. All MCA & LLP filing due dates, GST GSTR-1 & GSTR-3B deadlines, SEBI LODR compliance, RBI FEMA dates, Income Tax due dates & Labor Laws PF/ESIC for Indian companies. Free for CS & CA professionals.`,
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
  ],
  alternates: { canonical: 'https://www.corplawupdates.in/calendar' },
  openGraph: {
    title: `Compliance Calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} — All MCA GST SEBI RBI Due Dates India`,
    description: `Complete compliance deadline calendar for Indian companies. MCA, GST, SEBI, RBI, Income Tax and Labor Laws due dates for FY ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} in one place.`,
    url: 'https://www.corplawupdates.in/calendar',
    images: [{ url: 'https://www.corplawupdates.in/og-image.jpg', width: 1200, height: 630 }],
  },
}

// JSON-LD Schemas
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
    { '@type': 'ListItem', position: 2, name: `Compliance Calendar ${CURRENT_YEAR}`, item: 'https://www.corplawupdates.in/calendar' },
  ],
}

export default async function CalendarPage() {
  const { data: rawEntries } = await supabase
    .from('compliance_entries')
    .select('*')
    .eq('is_active', true)
    .order('regulator')
    .order('display_order')

  return (
    <>
      <CalendarPageClient entries={(rawEntries || []) as ComplianceEntry[]} />

      {/* SEO Knowledge Footer */}
      <section className="max-w-5xl mx-auto px-4 pb-16 pt-4 border-t border-slate-100">
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-navy mb-4 font-heading">
            About the Corporate Compliance Calendar {CURRENT_YEAR}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm text-slate-500 leading-relaxed">
            <div className="space-y-3">
              <p>
                The <strong>Corporate Compliance Calendar {CURRENT_YEAR}-{String(NEXT_YEAR).slice(2)}</strong> tracks all key regulatory filing deadlines for Indian companies under:
              </p>
              <ul className="space-y-1 list-none">
                {[
                  'MCA / ROC / LLP filings — MGT-7, AOC-4, DIR-3 KYC, DPT-3, LLP Form 11 & Form 8',
                  'GST filings — GSTR-1 (Outward Supplies), GSTR-3B (Returns & Tax Payment), CMP-08',
                  'SEBI LODR deadlines — Quarterly results, governance reports, shareholding patterns',
                  'Income Tax due dates — Corporate ITR, Tax Audit Form 3CD, TDS returns & monthly deposits',
                  'Labor Laws compliance — Monthly EPF (PF) & ESIC return filings and PT deposits',
                  'RBI & FEMA compliance dates — FLA annual return, ECB, FDI, ODI return filings',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <p>
                Designed for <strong>Company Secretaries (CS)</strong>, <strong>Chartered Accountants (CA)</strong>, <strong>Cost Accountants (CMA)</strong>, CS/CA/CMA students, legal enthusiasts, and corporate compliance teams managing multiple regulatory deadlines under the Companies Act, 2013, GST, Labor Laws, SEBI LODR, and RBI FEMA regulations.
              </p>
              <p className="text-xs text-slate-400 italic">
                All dates are indicative and subject to change by MCA, GSTN, EPFO, ESIC, SEBI or RBI. Always verify with official government portals.
              </p>
            </div>
          </div>

          {/* SEO Compliance Keywords Directory */}
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-3 font-semibold">
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
                  className="inline-flex items-center text-[11px] bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200/80 px-2 py-0.5 rounded transition-colors cursor-default"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  )
}
