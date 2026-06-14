import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ROC Deadline Tracker 2026 — Free Personalized ROC Filing Calendar | CorpLawUpdates.in',
  description: 'Free ROC deadline tracker for Indian companies. Calculate personalized MCA filing deadlines for MGT-7, AOC-4, DIR-3 KYC, ADT-1, DPT-3. Shows overdue penalties and CCFS 2026 savings instantly.',
  keywords: [
    'ROC deadline tracker',
    'MCA filing deadlines 2026',
    'MGT-7 due date calculator',
    'AOC-4 filing deadline',
    'DIR-3 KYC due date 2026',
    'ROC compliance calendar',
    'annual return due date',
    'MCA late fee calculator',
    'ROC filing tracker India',
    'company compliance deadlines',
    'CCFS 2026 calculator',
    'DPT-3 due date',
    'MSME-1 filing deadline',
    'ADT-1 due date',
    'INC-20A filing deadline'
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/roc-deadline-tracker',
  },
  openGraph: {
    title: 'ROC Deadline Tracker 2026 — Free for Indian Companies',
    description: 'Get personalized ROC filing deadlines for your company instantly. Free tool.',
    type: 'website',
  },
}

const faqs = [
  {
    q: 'What is the due date for MGT-7 (Annual Return) in 2026?',
    a: 'MGT-7 must be filed within 60 days from the date of AGM. Since AGM must be held within 6 months from the close of financial year (31 March for most companies), the AGM deadline is 30 September 2025, making the MGT-7 due date 29 November 2025. Our ROC Tracker calculates your exact due date based on your actual AGM date.'
  },
  {
    q: 'What is the ROC late fee for delayed MGT-7 filing?',
    a: 'The additional late fee for delayed MGT-7 filing is Rs. 100 per day with no maximum cap. Under the CCFS 2026 scheme (closing 15 July 2026), you can pay only 10% of accumulated additional fee, saving up to 90%. Our tracker shows your exact penalty and CCFS savings.'
  },
  {
    q: 'What is DIR-3 KYC due date 2026?',
    a: 'DIR-3 KYC must be filed by 30 September 2026 for all directors holding a valid DIN. Missing this deadline deactivates the DIN and requires payment of a flat Rs. 5,000 reactivation fee. DIR-3 KYC is NOT covered under the CCFS 2026 scheme.'
  },
  {
    q: 'What are the mandatory annual ROC filings for a Private Limited Company?',
    a: 'Every Private Limited Company must mandatorily file: (1) MGT-7 — Annual Return within 60 days of AGM, (2) AOC-4 — Financial Statements within 30 days of AGM, (3) DIR-3 KYC — Director KYC by 30 September, (4) ADT-1 — Auditor appointment within 15 days of AGM, (5) DPT-3 — Return of deposits/loans by 30 June, (6) MSME-1 — if MSME vendor payments outstanding.'
  },
  {
    q: 'What is the due date for AOC-4 (Financial Statements) in 2026?',
    a: 'AOC-4 must be filed within 30 days from the date of AGM. For companies with March 31 financial year end and AGM held by 30 September 2025, the AOC-4 due date is 30 October 2025. OPC has a different rule — 180 days from financial year end.'
  },
  {
    q: 'What is DPT-3 and when is it due?',
    a: 'DPT-3 is the annual return of outstanding deposits and exempted deposits (including loans from directors and shareholders) as on 31 March. It must be filed by 30 June every year. Most companies have loans that qualify — even if no public deposits are accepted. Delayed filing attracts a slab-based additional late fee of 2x to 12x the normal filing fee depending on the delay.'
  },
  {
    q: 'What is MSME-1 and who needs to file it?',
    a: 'MSME-1 is a half-yearly return required for companies that have received goods/services from MSME suppliers and have outstanding payments exceeding 45 days. Filed twice: April-September period by 31 October, October-March period by 30 April. Non-filing can attract penalty of Rs. 25,000 to Rs. 3,00,000.'
  },
  {
    q: 'What is CCFS 2026 and how does it help?',
    a: 'CCFS 2026 (Companies Compliance Facilitation Scheme) is a one-time amnesty scheme by MCA allowing companies to pay only 10% of accumulated additional fees for delayed filings of forms like MGT-7, AOC-4, ADT-1, DIR-12 etc. The scheme closes on 15 July 2026. Our ROC tracker shows your exact savings under CCFS.'
  },
  {
    q: 'What happens if INC-20A is not filed within 180 days?',
    a: 'If INC-20A (Commencement of Business declaration) is not filed within 180 days of incorporation, the company cannot legally commence business or exercise borrowing powers. The ROC can initiate strike-off proceedings. Penalty is Rs. 50,000 for the company and Rs. 1,000 per day for each defaulting director.'
  },
  {
    q: 'Can a Small Company skip some ROC filings?',
    a: 'Small Companies (paid-up capital ≤ Rs. 10 Crore AND turnover ≤ Rs. 100 Crore) have a simplified annual return — MGT-7A instead of MGT-7. They are also exempt from certain requirements like mandatory rotation of auditors and secretarial audit. However, core filings like AOC-4, DIR-3 KYC, ADT-1 and DPT-3 remain mandatory.'
  },
]

const forms = [
  { code: 'MGT-7/MGT-7A', name: 'Annual Return', due: '60 days from AGM', fee: '₹100/day', ccfs: true },
  { code: 'AOC-4', name: 'Financial Statements', due: '30 days from AGM', fee: '₹100/day', ccfs: true },
  { code: 'DIR-3 KYC', name: 'Director KYC', due: '30 September', fee: '₹5,000 flat', ccfs: false },
  { code: 'ADT-1', name: 'Auditor Appointment', due: '15 days from AGM', fee: '2x to 12x fee', ccfs: true },
  { code: 'DPT-3', name: 'Return of Deposits', due: '30 June', fee: '2x to 12x fee', ccfs: true },
  { code: 'MSME-1', name: 'MSME Payments Return', due: 'Apr 30 & Oct 31', fee: 'Fixed penalty', ccfs: false },
  { code: 'INC-20A', name: 'Commencement of Business', due: '180 days from incorporation', fee: '2x to 12x fee', ccfs: true },
  { code: 'BEN-2', name: 'Beneficial Ownership', due: '30 days from FY start', fee: '2x to 12x fee', ccfs: true },
]

export default function ROCTrackerSEOPage() {
  return (
    <div className="min-h-screen bg-slate-50 
                    dark:bg-slate-950">
      
      {/* Hero */}
      <div className="bg-navy py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 
                          bg-amber-400/20 text-amber-400 
                          text-xs font-bold px-3 py-1.5 
                          rounded-full mb-5 uppercase">
            Updated June 2026 · Free · Personalized
          </div>
          <h1 className="text-4xl md:text-5xl font-bold 
                         text-white font-heading mb-4">
            ROC Deadline Tracker 2026
          </h1>
          <p className="text-slate-400 text-lg 
                        max-w-2xl mx-auto mb-8">
            Enter your company details and instantly 
            see all ROC filing deadlines, exact 
            penalties, and how much you can save 
            under CCFS 2026.
          </p>
          <Link href="/tools/roc-tracker"
                className="inline-block bg-amber-400 
                           hover:bg-amber-500 text-navy 
                           font-black px-10 py-4 
                           rounded-xl text-lg 
                           transition-colors">
            Track My ROC Deadlines Free →
          </Link>
          <p className="text-slate-500 text-xs mt-4">
            No registration required · 
            Instant results · 12 forms tracked
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 
                      space-y-16">

        {/* ROC Forms Table */}
        <section>
          <h2 className="text-3xl font-bold text-navy 
                         dark:text-white font-heading mb-6">
            Annual ROC Filing Calendar 2025-26
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white 
                               dark:bg-slate-800 
                               border border-slate-200 
                               dark:border-slate-700 
                               rounded-2xl overflow-hidden 
                               text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left px-5 py-3">
                    Form
                  </th>
                  <th className="text-left px-5 py-3">
                    Purpose
                  </th>
                  <th className="text-left px-5 py-3">
                    Due Date
                  </th>
                  <th className="text-left px-5 py-3">
                    Late Fee
                  </th>
                  <th className="text-center px-5 py-3">
                    CCFS?
                  </th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form, i) => (
                  <tr key={form.code}
                      className={`border-t 
                        border-slate-100 
                        dark:border-slate-700
                        ${i % 2 === 0 
                          ? '' 
                          : 'bg-slate-50 dark:bg-slate-900'}`}>
                    <td className="px-5 py-3 font-bold 
                                   text-navy 
                                   dark:text-white">
                      {form.code}
                    </td>
                    <td className="px-5 py-3 
                                   text-slate-600 
                                   dark:text-slate-300">
                      {form.name}
                    </td>
                    <td className="px-5 py-3 
                                   text-slate-600 
                                   dark:text-slate-300">
                      {form.due}
                    </td>
                    <td className="px-5 py-3 
                                   text-red-600 
                                   dark:text-red-400 
                                   font-medium">
                      {form.fee}
                    </td>
                    <td className="px-5 py-3 
                                   text-center">
                      {form.ccfs ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-400 text-xs mt-2">
            ✅ = Eligible for CCFS 2026 scheme 
            (90% waiver on additional fees, 
            closing 15 July 2026)
          </p>
        </section>

        {/* CTA */}
        <section className="bg-navy rounded-3xl 
                             p-10 text-center">
          <h2 className="text-3xl font-bold text-white 
                         font-heading mb-3">
            Get Your Personalized Deadline Report
          </h2>
          <p className="text-slate-400 mb-6">
            Enter your company details and get 
            exact due dates, penalties and 
            CCFS savings instantly.
          </p>
          <Link href="/tools/roc-tracker"
                className="inline-block bg-amber-400 
                           hover:bg-amber-500 text-navy 
                           font-black px-10 py-4 
                           rounded-xl text-lg">
            Calculate My Deadlines →
          </Link>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold text-navy 
                         dark:text-white font-heading mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i}
                   className="bg-white dark:bg-slate-800 
                              border border-slate-200 
                              dark:border-slate-700 
                              rounded-2xl p-5">
                <p className="font-bold text-navy 
                               dark:text-white text-sm mb-2">
                  Q: {faq.q}
                </p>
                <p className="text-slate-600 
                               dark:text-slate-300 text-sm 
                               leading-relaxed">
                  A: {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related tools */}
        <section>
          <h2 className="text-2xl font-bold text-navy 
                         dark:text-white font-heading mb-4">
            Related Tools
          </h2>
          <div className="grid grid-cols-1 
                          md:grid-cols-3 gap-4">
            {[
              { 
                href: '/tools/fee-calculator', 
                icon: '🧮', 
                title: 'MCA Late Fee Calculator',
                desc: 'Calculate exact penalty for any form'
              },
              { 
                href: '/calendar', 
                icon: '📅', 
                title: 'Compliance Calendar 2026',
                desc: '50+ deadlines for all regulators'
              },
              { 
                href: '/documents', 
                icon: '📄', 
                title: 'Document Generator',
                desc: 'Generate board resolutions free'
              },
            ].map(t => (
              <Link key={t.href} href={t.href}
                    className="bg-white dark:bg-slate-800 
                               border border-slate-200 
                               dark:border-slate-700 
                               rounded-2xl p-5 
                               hover:border-amber-400 
                               transition-colors">
                <span className="text-3xl">
                  {t.icon}
                </span>
                <p className="font-bold text-navy 
                               dark:text-white 
                               text-sm mt-2">
                  {t.title}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {t.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'FAQPage',
                mainEntity: faqs.map(f => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.a,
                  },
                })),
              },
              {
                '@type': 'WebApplication',
                name: 'ROC Deadline Tracker',
                url: 'https://www.corplawupdates.in/tools/roc-tracker',
                description: 'Free personalized ROC filing deadline tracker for Indian companies',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'INR',
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
