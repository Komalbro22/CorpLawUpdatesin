import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ROC Penalty & Late Fee Calculator 2026 — Company, LLP & MSME | CorpLawUpdates',
  description: 'Free ROC compliance calculators for Companies (MGT-7, AOC-4), LLPs (Form 8, Form 11), and MSMEs (Section 16 delayed payment). Instantly calculate MCA late filing fees, penalty exposure, and MSME compound interest. Trusted by CAs, CS & CFOs.',
  keywords: [
    'ROC penalty calculator', 'MCA late fee calculator', 'company ROC penalty calculator India',
    'ROC late filing penalty calculator', 'MCA late fees calculator', 'ROC fees calculator',
    'MCA fees calculator v3', 'company late fee calculator India', 'LLP fee calculator India',
    'MSME late fee calculator India', 'ROC late filing fees', 'company annual return penalty',
    'LLP annual return penalty', 'MSME delayed payment calculator'
  ],
  alternates: { canonical: 'https://www.corplawupdates.in/tools/penalty-calculator' },
  openGraph: {
    title: 'ROC Penalty & Late Fee Calculator 2026 | CorpLawUpdates',
    description: 'Calculate MCA filing fees, ROC late fees and MSME delayed payment interest. Free, instant, accurate.',
    url: 'https://www.corplawupdates.in/tools/penalty-calculator',
    type: 'website',
  },
}

const sschema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.corplawupdates.in/tools/penalty-calculator',
      name: 'ROC Penalty & Late Fee Calculator Suite',
      description: 'Calculate statutory filing fees, ROC late fees, adjudication penalties, and MSME delayed payment interest.',
      url: 'https://www.corplawupdates.in/tools/penalty-calculator',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
          { '@type': 'ListItem', position: 3, name: 'Penalty Calculator', item: 'https://www.corplawupdates.in/tools/penalty-calculator' },
        ],
      },
    },
    {
      '@type': 'ItemList',
      name: 'ROC Compliance Penalty Calculators',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Company ROC Penalty & Late Fee Calculator', url: 'https://www.corplawupdates.in/tools/penalty-calculator/company' },
        { '@type': 'ListItem', position: 2, name: 'LLP Annual Filing Penalty Calculator', url: 'https://www.corplawupdates.in/tools/penalty-calculator/llp' },
        { '@type': 'ListItem', position: 3, name: 'MSME Delayed Payment Interest Calculator', url: 'https://www.corplawupdates.in/tools/penalty-calculator/msme' },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Calculate ROC Late Fee',
      description: 'Step-by-step guide to calculate MCA ROC late fee for company filings.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Select Calculator', text: 'Choose the appropriate calculator: Company (MGT-7/AOC-4), LLP (Form 8/Form 11), or MSME (Section 16 interest).' },
        { '@type': 'HowToStep', position: 2, name: 'Enter Filing Parameters', text: 'Select entity type, authorized capital or contribution slab, and the MCA form.' },
        { '@type': 'HowToStep', position: 3, name: 'Enter Dates', text: 'Enter the statutory due date and actual/intended filing date, or directly enter the number of days delayed.' },
        { '@type': 'HowToStep', position: 4, name: 'Read Results', text: 'Instantly view the total MCA late fee payable, adjudication penalty exposure, and statutory provisions.' },
      ],
    },
  ],
}

export default function PenaltyCalculatorHub() {
  const cards = [
    {
      title: 'Companies Compliance',
      href: '/tools/penalty-calculator/company',
      icon: '🏛️',
      desc: 'Calculate MCA filing fees, Section 403 daily late fees, and statutory Section 92/137 adjudication penalties.',
      details: 'MGT-7, AOC-4, DIR-3 KYC & 11 more forms. Section 403 late fee + Section 92/137 penalty.',
      badge: 'Free',
      badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    {
      title: 'LLP Compliance',
      href: '/tools/penalty-calculator/llp',
      icon: '🤝',
      desc: 'Calculate annual filing fees and the mandatory late filing fees under LLP Rules.',
      details: 'Form 8 & Form 11. ₹100/day late fee with no cap.',
      badge: 'Free',
      badgeColor: 'bg-green-500/10 text-green-400 border border-green-500/20',
    },
    {
      title: 'MSME Compliance',
      href: '/tools/penalty-calculator/msme',
      icon: '🏭',
      desc: 'Calculate Section 16 MSMED interest with monthly compounding rests, plus half-yearly MSME-1 non-filing penalties.',
      details: 'Delayed payment interest at 3× RBI Bank Rate + Form MSME-1 non-filing penalty.',
      badge: 'Interactive',
      badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    },
    {
      title: 'Partnership Firms',
      href: '#',
      icon: '📋',
      desc: 'Filing fees and penalty calculators for registrar of firms compliance.',
      details: 'Registration, modifications and dissolution filing fees.',
      badge: 'Coming Soon',
      badgeColor: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
      isComingSoon: true,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <JsonLd data={sschema as any} />

      {/* Hero Header */}
      <div className="bg-navy py-16 px-4 relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            🛠️ ROC Compliance Penalty Calculator Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">
            ROC Compliance Penalty Calculator
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Calculate statutory filing fees, ROC late fees, adjudication penalties, and MSME delayed payment interest — for Companies, LLPs, and MSMEs. Know your exact compliance exposure before filing.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-5 relative z-20">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: '3 Free Calculators', color: 'bg-amber-400/10 text-amber-500 border border-amber-500/20' },
            { label: 'MCA Rule-Compliant', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
            { label: 'Instant Results', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
          ].map(pill => (
            <span
              key={pill.label}
              className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm ${pill.color}`}
            >
              {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map(card => {
            const CardWrapper = card.isComingSoon ? 'div' : Link
            return (
              <CardWrapper
                key={card.title}
                href={card.href}
                className={`group border rounded-2xl p-8 transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col justify-between ${
                  card.isComingSoon
                    ? 'border-dashed border-slate-200 dark:border-slate-800 opacity-70 cursor-default'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5'
                }`}
              >
                <div>
                  {/* Icon + Badge Row */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      card.isComingSoon
                        ? 'bg-slate-100 dark:bg-slate-800/60'
                        : 'bg-amber-500/10 dark:bg-amber-500/10'
                    }`}>
                      {card.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold font-heading text-navy dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
                    {card.desc}
                  </p>

                  {/* Coverage detail box */}
                  <div className="mt-4 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border-l-4 border-l-amber-500 border border-slate-100 dark:border-slate-900/60">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Coverage
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-light">
                      {card.details}
                    </span>
                  </div>
                </div>

                {!card.isComingSoon && (
                  <div className="mt-8 flex items-center justify-between text-sm font-bold text-navy dark:text-amber-400">
                    <span>Open Calculator</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </CardWrapper>
            )
          })}
        </div>

        {/* Who Is This For */}
        <div className="mt-16 text-center">
          <h2 className="text-lg font-bold font-heading text-navy dark:text-white mb-5">
            Who Is This For?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '⚖️ Company Secretaries',
              '📊 Chartered Accountants',
              '💼 CFOs & Finance Teams',
              '🚀 Startups & Founders',
            ].map(pill => (
              <span
                key={pill}
                className="text-sm font-semibold px-5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all duration-200"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Trust Strip */}
        <div className="mt-10 text-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-block px-5 py-2 rounded-full shadow-sm">
            🛡️ Based on Companies Act 2013, LLP Act 2008 &amp; MSMED Act 2006
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-450 dark:text-slate-500 italic">
            🛡️ Results are indicative for compliance planning purposes. Consult a Company Secretary or lawyer for adjudication matters.
          </p>
        </div>
      </div>
    </div>
  )
}
