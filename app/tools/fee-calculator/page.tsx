import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import SEOContent from './components/SEOContent'
import FAQSection from './components/FAQSection'

export const metadata: Metadata = {
  title: 'Fee Calculator Hub | MCA, LLP, MSME & GST | CorpLawUpdates.in',
  description: 'Free interactive compliance fee calculators. Accurately calculate ROC filing fees, LLP late filing penalty, MSME interest, and Stamp Duty. GST coming soon.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator',
  },
}

const hubJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Compliance Fee Calculators Hub',
  description: 'Free interactive fee and penalty calculators for Companies, LLPs, and MSMEs.',
  url: 'https://www.corplawupdates.in/tools/fee-calculator',
}

const calculators = [
  {
    id: 'companies',
    href: '/tools/fee-calculator/companies',
    icon: '🏢',
    label: 'Company ROC Fee Calculator',
    description: 'Calculate ROC filing fees, ₹100/day late penalty, and state-wise stamp duty for AOC-4, MGT-7, ADT-1, and 20+ MCA forms.',
    badge: 'Live',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
    stats: 'Private, Public, OPC',
    isLive: true,
    color: 'border-blue-200 hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-900/50',
    headerBg: 'from-blue-600 to-blue-800',
  },
  {
    id: 'llp',
    href: '/tools/fee-calculator/llp',
    icon: '🤝',
    label: 'LLP Fee & Penalty Calculator',
    description: 'Calculate statutory filing fees and flat ₹100/day late filing penalties for Limited Liability Partnerships (Form 8, Form 11, etc).',
    badge: 'Live',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
    stats: 'All LLPs',
    isLive: true,
    color: 'border-teal-200 hover:border-teal-400 dark:border-slate-800 dark:hover:border-teal-900/50',
    headerBg: 'from-teal-600 to-teal-800',
  },
  {
    id: 'msme',
    href: '/tools/fee-calculator/msme',
    icon: '🏭',
    label: 'MSME Interest Calculator',
    description: 'Calculate the exact delayed payment compound interest owed to MSMEs under Section 16 of the MSMED Act (3x Repo Rate).',
    badge: 'Live',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
    stats: 'Samadhaan Scheme',
    isLive: true,
    color: 'border-purple-200 hover:border-purple-400 dark:border-slate-800 dark:hover:border-purple-900/50',
    headerBg: 'from-purple-600 to-purple-800',
  },
  {
    id: 'gst',
    href: '#',
    icon: '🧾',
    label: 'GST Late Fee Calculator',
    description: 'Calculate late fees and interest for delayed filing of GSTR-1, GSTR-3B, GSTR-9 and GSTR-9C under the CGST Act.',
    badge: 'Coming Soon',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    stats: 'In Development',
    isLive: false,
    color: 'border-slate-200 hover:border-slate-300 dark:border-slate-800/50 dark:hover:border-slate-700',
    headerBg: 'from-slate-500 to-slate-700 opacity-80',
  }
]

export default function FeeCalculatorHub() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={hubJsonLd as any} />

      {/* Hero Header */}
      <div className="bg-navy py-16 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/tools" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to All Tools
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-white font-heading mb-6 mt-4">
            Fee & Penalty Calculators
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Your central hub for calculating statutory compliance fees, late penalties, and interest accurately and instantly.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calculators.map(calc => {
            if (calc.isLive) {
              return (
                <Link
                  key={calc.id}
                  href={calc.href}
                  className={`group bg-white dark:bg-slate-900 shadow-xl border-2 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${calc.color}`}
                >
                  <div className={`bg-gradient-to-r ${calc.headerBg} p-5 flex items-center gap-4`}>
                    <span className="text-5xl">{calc.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${calc.badgeColor}`}>
                          {calc.badge}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-xl leading-snug">
                        {calc.label}
                      </h3>
                      <p className="text-white/70 text-xs mt-1 font-medium tracking-wide">
                        {calc.stats}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                      {calc.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                        ● Available
                      </span>
                      <span className="text-navy dark:text-amber-400 font-bold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
                        Open Calculator <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            } else {
              return (
                <div
                  key={calc.id}
                  className={`bg-white dark:bg-slate-900/60 shadow-md border-2 border-dashed rounded-2xl overflow-hidden ${calc.color}`}
                >
                  <div className={`bg-gradient-to-r ${calc.headerBg} p-5 flex items-center gap-4 grayscale`}>
                    <span className="text-5xl opacity-70">{calc.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${calc.badgeColor}`}>
                          {calc.badge}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-xl leading-snug">
                        {calc.label}
                      </h3>
                      <p className="text-white/60 text-xs mt-1 font-medium tracking-wide">
                        {calc.stats}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {calc.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                        ⏳ In Development
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
      </div>

      {/* Shared Educational Content */}
      <div className="max-w-5xl mx-auto px-4 border-t border-slate-200 dark:border-slate-800 pt-16">
        <SEOContent />
        <FAQSection />
      </div>
    </div>
  )
}
