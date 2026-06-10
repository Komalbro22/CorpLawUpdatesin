'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import HubSearch from './HubSearch'
import { mcaForms } from '@/data/mca-forms'

const hubJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Compliance Fee & Penalty Calculators Hub',
  description: 'Free interactive fee and penalty calculators for Companies, LLPs, MSMEs, and GST late fees.',
  url: 'https://www.corplawupdates.in/tools/fee-calculator',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        url: 'https://www.corplawupdates.in/tools/fee-calculator/companies',
        name: 'Company ROC Fee Calculator'
      },
      {
        '@type': 'ListItem',
        position: 2,
        url: 'https://www.corplawupdates.in/tools/fee-calculator/llp',
        name: 'LLP Fee & Penalty Calculator'
      },
      {
        '@type': 'ListItem',
        position: 3,
        url: 'https://www.corplawupdates.in/tools/fee-calculator/msme',
        name: 'MSME Interest Calculator'
      }
    ]
  }
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

function HubSEO() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        Statutory Compliance & Tax Fee Calculators Hub
      </h2>
      <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
        Navigating the complex landscape of statutory compliance in India requires absolute precision. Whether you are dealing with the Ministry of Corporate Affairs (MCA) for company or LLP filings, calculating delayed payment interest under the MSMED Act, or managing GST late fees with the CBIC, our comprehensive hub provides exact, up-to-date calculation tools.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Corporate Compliance (MCA)</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            For Companies and LLPs, missing statutory deadlines (like AOC-4, MGT-7, or Form 11) results in compounding penalties. MCA late fees can range from standard multipliers (up to 12x) to strict ₹100 per day flat penalties. Select our Company or LLP calculator for exact fee breakdowns including state-wise stamp duty.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Taxation & MSME Rules</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Beyond MCA, strict rules govern delayed payments to MSMEs (attracting compound interest at 3 times the RBI Repo Rate) and late GST return filings. Use our specialized calculators to determine your exact liability under the MSMED Act and CGST Act.
          </p>
        </div>
      </div>
    </article>
  )
}

function HubFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Are these fee calculators updated for the current financial year?',
      a: 'Yes, all our calculators (Company, LLP, and MSME) are strictly updated with the latest MCA notifications, Companies (Registration Offices and Fees) Rules, and current RBI repo rates for FY 2026-27.'
    },
    {
      q: 'Which calculator should I use for AOC-4 and MGT-7 late fees?',
      a: 'Please use the "Company ROC Fee Calculator". Inside, navigate to the "Annual Returns" tab. It handles the specific uncapped ₹100 per day penalty logic for both private and public limited companies.'
    },
    {
      q: 'Why are LLPs and Companies calculated differently?',
      a: 'The Limited Liability Partnership Act prescribes a flat ₹100 per day late fee for almost all forms (like Form 8 and Form 11) without any upper cap. In contrast, the Companies Act generally uses a multiplier system (up to 12x normal fee) for general forms, reserving the flat ₹100/day penalty strictly for annual returns.'
    },
    {
      q: 'Is the GST Calculator available?',
      a: 'The GST Late Fee Calculator is currently in active development and will be launching soon. It will cover exact penalty and interest calculations for GSTR-1, GSTR-3B, and annual returns.'
    }
  ]

  return (
    <div className="mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
        General FAQs
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div 
              key={index} 
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                isOpen 
                ? 'border-navy dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className={`font-semibold text-lg ${isOpen ? 'text-navy dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {faq.q}
                </span>
                <span className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-navy dark:text-white' : 'text-slate-400'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              <div className={`px-6 overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
                  {faq.a}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HubGuides() {
  const allGuides = mcaForms
    .flatMap(f => f.filingGuides || [])
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 6);

  if (allGuides.length === 0) return null;

  return (
    <div className="mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        Filing Guides & Resources
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allGuides.map((guide, idx) => (
          <Link key={idx} href={guide.slug} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg transition-all group flex flex-col">
            <h3 className="font-bold text-lg text-navy dark:text-white mb-2 group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {guide.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 flex-grow">
              {guide.summary}
            </p>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span>{new Date(guide.publishedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              <span className="text-[#1D4ED8] dark:text-blue-400 group-hover:underline">Read Guide →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function FeeCalculatorHub() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={hubJsonLd as any} />

      <div className="bg-navy py-16 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/tools" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to All Tools
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-white font-heading mb-6 mt-4">
            Compliance Fee Calculators
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Your central hub for calculating statutory compliance fees, late penalties, and interest across MCA, MSMED Act, and GST.
          </p>
          <HubSearch />
        </div>
      </div>

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
                  <div className="p-6 flex flex-col h-full">
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

      <div className="max-w-5xl mx-auto px-4 border-t border-slate-200 dark:border-slate-800 pt-16">
        <HubGuides />
        <HubSEO />
        <HubFAQ />
      </div>
    </div>
  )
}
