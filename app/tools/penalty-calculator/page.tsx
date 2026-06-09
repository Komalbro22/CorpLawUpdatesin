import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ROC Compliance Penalty Calculator — Companies, LLP & MSME | CorpLawUpdates',
  description: 'Free compliance penalty calculator. MCA filing fees, Section 403 late fees, MSME delayed payment interest under Section 16 MSMED Act, and Form MSME-1 penalties. For CS professionals, CA firms & compliance officers.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/penalty-calculator',
  },
}

const sschema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'ROC Compliance Penalty Calculator',
  description: 'Calculate statutory filing fees, ROC late fees, adjudication penalties, and MSME delayed payment interest for Companies, LLPs, and MSMEs.',
  url: 'https://www.corplawupdates.in/tools/penalty-calculator',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Compliance Penalty Calculators',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Company ROC Penalty Calculator',
        url: 'https://www.corplawupdates.in/tools/penalty-calculator/company',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'LLP ROC Penalty Calculator',
        url: 'https://www.corplawupdates.in/tools/penalty-calculator/llp',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'MSME Delayed Payment Interest Calculator',
        url: 'https://www.corplawupdates.in/tools/penalty-calculator/msme',
      },
    ],
  },
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
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    },
    {
      title: 'LLP Compliance',
      href: '/tools/penalty-calculator/llp',
      icon: '🤝',
      desc: 'Calculate annual filing fees and the mandatory late filing fees under LLP Rules.',
      details: 'Form 8 & Form 11. ₹100/day late fee with no cap.',
      badge: 'Free',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    },
    {
      title: 'MSME Compliance',
      href: '/tools/penalty-calculator/msme',
      icon: '🏭',
      desc: 'Calculate Section 16 MSMED interest with monthly compounding rests, plus half-yearly MSME-1 non-filing penalties.',
      details: 'Delayed payment interest at 3× RBI Bank Rate + Form MSME-1 non-filing penalty.',
      badge: 'Interactive',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    },
    {
      title: 'Partnership Firms',
      href: '#',
      icon: '📋',
      desc: 'Filing fees and penalty calculators for registrar of firms compliance.',
      details: 'Registration, modifications and dissolution filing fees.',
      badge: 'Coming Soon',
      badgeColor: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      isComingSoon: true,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <JsonLd data={sschema as any} />

      {/* Header */}
      <div className="bg-navy py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            🛠️ ROC Compliance Penalty Calculator Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">
            ROC Compliance Penalty Calculator
          </h1>
          <p className="text-slate-450 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Calculate statutory filing fees, ROC late fees, adjudication penalties, and MSME delayed payment interest — for Companies, LLPs, and MSMEs. Know your exact compliance exposure before filing.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map(card => {
            const CardWrapper = card.isComingSoon ? 'div' : Link
            return (
              <CardWrapper
                key={card.title}
                href={card.href}
                className={`group border rounded-2xl p-8 transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between ${
                  card.isComingSoon
                    ? 'border-dashed border-slate-200 dark:border-slate-800 opacity-75'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/5'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-4xl">{card.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-heading text-navy dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
                    {card.desc}
                  </p>
                  <div className="mt-4 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-900/60">
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
        
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-450 italic">
            🛡️ Results are indicative for compliance planning purposes. Consult a Company Secretary or lawyer for adjudication matters.
          </p>
        </div>
      </div>
    </div>
  )
}
