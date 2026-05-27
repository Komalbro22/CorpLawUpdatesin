import { Metadata } from 'next'
import MCAFeeCalculator from '@/components/calculators/MCAFeeCalculator'

export const metadata: Metadata = {
  title: 'MCA Late Fee Calculator 2026 — Free Tool for CS Professionals',
  description: 'Calculate exact MCA, LLP and MSME late filing fees instantly. Includes CCFS 2026 savings calculator. Free tool for Company Secretaries and compliance professionals.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator',
  },
  openGraph: {
    title: 'MCA Late Fee Calculator 2026',
    description: 'Calculate MCA, LLP and MSME late filing fees instantly. Free tool.',
  },
}

export default function FeeCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Page Header */}
      <div className="bg-navy py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase">
            Free Tool · No Login Required
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-3">
            MCA Late Fee Calculator
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Calculate exact penalties for delayed filings of MCA forms, LLP forms and MSME returns. Includes CCFS 2026 savings calculator.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <MCAFeeCalculator />
      </div>

      {/* Related articles */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-navy dark:text-white font-heading mb-4">
          Related Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              href: '/updates/mca-introduces-companies-compliance-facilitation-scheme-2026-ccfs-2026-big-relief-for-defaulting-companies',
              title: 'CCFS 2026 — Complete Filing Guide',
              category: 'MCA',
              color: 'text-blue-600'
            },
            {
              href: '/updates/dir-3-kyc-web-2026-complete-guide',
              title: 'DIR-3 KYC 2026 Complete Guide',
              category: 'MCA',
              color: 'text-blue-600'
            },
            {
              href: '/updates/mgt-7-annual-return-filing-guide-fy-2025-26-due-date-mca-v3-small-company-limits-ccfs2026',
              title: 'MGT-7 Annual Return Guide FY 2025-26',
              category: 'MCA',
              color: 'text-blue-600'
            },
            {
              href: '/calendar',
              title: 'Compliance Calendar 2026 — All Deadlines',
              category: 'Calendar',
              color: 'text-green-600'
            },
          ].map(article => (
            <a key={article.href}
               href={article.href}
               className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-amber-400 transition-colors">
              <span className={`text-xs font-bold ${article.color}`}>
                {article.category}
              </span>
              <p className="text-navy dark:text-white font-semibold text-sm mt-1">
                {article.title} →
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* FAQ for SEO */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-navy dark:text-white font-heading mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'What is the late fee for MGT-7 filing?',
              a: 'The late fee for MGT-7 (Annual Return) is ₹100 per day from the due date (60 days from AGM). There is no maximum cap on the additional fee. Under CCFS 2026 scheme (closing July 15, 2026), you pay only 10% of the accumulated additional fee.',
            },
            {
              q: 'What is the penalty for not filing DIR-3 KYC?',
              a: 'If you miss the DIR-3 KYC due date (September 30 each year or once every 3 financial years), your DIN gets deactivated. To reactivate, you must pay a flat fee of ₹5,000 along with the KYC filing. This is not covered under CCFS 2026.',
            },
            {
              q: 'What is the late fee for LLP Form 11?',
              a: 'The late fee for LLP Form 11 (Annual Return) is ₹100 per day from the due date (May 30 each year). There is no cap on the additional fee. Unlike company forms, LLP forms are generally NOT covered under CCFS 2026.',
            },
            {
              q: 'How much can I save under CCFS 2026?',
              a: 'Under CCFS 2026 (Companies Compliance Facilitation Scheme), you pay only 10% of accumulated additional fees for eligible MCA forms including MGT-7, AOC-4, ADT-1, DIR-12 etc. This means you save 90% of accumulated late fees. The scheme is available until July 15, 2026.',
            },
            {
              q: 'Is there any cap on MCA late fees?',
              a: 'Most MCA forms do not have a cap on late fees — ₹100 or ₹200/day can accumulate indefinitely. However, DIR-3 KYC has a flat reactivation fee of ₹5,000 regardless of delay period. CCFS 2026 effectively provides relief by capping effective payment at 10% of accumulated fees.',
            },
          ].map((faq, i) => (
            <div key={i}
                 className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <p className="font-bold text-navy dark:text-white text-sm mb-2">
                Q: {faq.q}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                A: {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
