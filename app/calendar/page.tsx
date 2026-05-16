import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import CalendarPageClient, { type ComplianceEntry } from '@/components/CalendarPageClient'

export const revalidate = 1800

const CURRENT_YEAR = new Date().getFullYear()
const NEXT_YEAR = CURRENT_YEAR + 1

export const metadata: Metadata = {
  title: `Compliance Calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} — MCA SEBI RBI Income Tax Due Dates India`,
  description: `Complete corporate compliance deadline calendar for FY ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)}. All MCA filing due dates, SEBI LODR deadlines, RBI FEMA compliance dates, Income Tax due dates for Indian companies. Free for CS & CA professionals.`,
  keywords: [
    `compliance calendar ${CURRENT_YEAR}`,
    `compliance calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)}`,
    `MCA filing due dates ${CURRENT_YEAR}`,
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
    title: `Compliance Calendar ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} — All MCA SEBI RBI Due Dates India`,
    description: `Complete compliance deadline calendar for Indian companies. MCA, SEBI, RBI, Income Tax due dates for FY ${CURRENT_YEAR}-${String(NEXT_YEAR).slice(2)} in one place.`,
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `What are the key MCA compliance deadlines for ${CURRENT_YEAR}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Key MCA compliance deadlines for ${CURRENT_YEAR} include: MGT-7 (Annual Return) due 60 days after AGM; AOC-4 (Financial Statements) due 30 days after AGM; DIR-3 KYC Web due 30 June; MSME-1 due 30 April and 31 October; DPT-3 due 30 June. All dates are indicative and subject to MCA extensions.`,
      },
    },
    {
      '@type': 'Question',
      name: `What is the due date for MGT-7 annual return in ${CURRENT_YEAR}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `The MGT-7 Annual Return is due within 60 days from the date of Annual General Meeting (AGM). For most companies with AGM in September, this means the MGT-7 is due by 28 November. Late filing attracts additional fees under the Companies Act, 2013.`,
      },
    },
    {
      '@type': 'Question',
      name: `What are the SEBI LODR compliance deadlines for listed companies ${CURRENT_YEAR}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Key SEBI LODR compliance deadlines for listed companies include quarterly financial results (45 days from quarter end), annual report filing, corporate governance report (within 21 days of AGM), shareholding pattern (21 days from quarter end), and reconciliation of share capital audit (30 days from quarter end).`,
      },
    },
    {
      '@type': 'Question',
      name: `What is the DIR-3 KYC due date for directors in ${CURRENT_YEAR}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `DIR-3 KYC Web is due by 30 June each year for all directors who have a DIN. From FY 2025-26, the MCA has changed the DIR-3 KYC filing cycle to triennial (every 3 years) for certain categories. Non-compliance results in deactivation of DIN and a ₹5,000 penalty for late filing.`,
      },
    },
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
                  'MCA / ROC filings — MGT-7, AOC-4, DIR-3 KYC, DPT-3, MSME-1',
                  'SEBI LODR deadlines — Quarterly results, governance reports',
                  'RBI & FEMA compliance dates — ECB, FDI, ODI returns',
                  'Income Tax due dates — ITR, TDS, advance tax',
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
                Designed for <strong>Company Secretaries (CS)</strong>, <strong>Chartered Accountants (CA)</strong>, <strong>Cost Accountants (CMA)</strong>, CS/CA/CMA students, legal enthusiasts, and corporate compliance teams managing multiple regulatory deadlines under the Companies Act, 2013, SEBI LODR, and RBI FEMA regulations.
              </p>
              <p className="text-xs text-slate-400 italic">
                All dates are indicative and subject to change by MCA, SEBI or RBI. Always verify with official government portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  )
}

