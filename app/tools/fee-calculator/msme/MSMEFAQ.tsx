'use client'

import React, { useState } from 'react'

export default function MSMEFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is the MSME Samadhaan Scheme?',
      a: 'MSME Samadhaan is a statutory portal established under the MSMED Act, 2006. It empowers registered Micro and Small entrepreneurs across India to directly register delayed payment cases against buyers before the State Micro and Small Enterprises Facilitation Council (MSEFC).'
    },
    {
      q: 'What is the maximum time a buyer has to pay an MSME?',
      a: 'Under Section 15 of the MSMED Act, the buyer must make payment within the period agreed upon in writing, which cannot exceed 45 days from the day of acceptance or deemed acceptance. If there is no written agreement, payment must be made before the Appointed Day (within 15 days of acceptance).'
    },
    {
      q: 'What is the Appointed Day under Section 2(b)?',
      a: 'Under Section 2(b) of the MSMED Act, the Appointed Day is the day following immediately after the expiry of the period of 15 days from the day of acceptance or deemed acceptance (i.e. Day 16). In the absence of a written agreement, interest begins to accrue from the Appointed Day.'
    },
    {
      q: 'How is the MSME delayed payment interest calculated?',
      a: 'Under Section 16 of the MSMED Act, defaulting buyers are legally obligated to pay compound interest with monthly rests at three times (3x) the Bank Rate notified by the Reserve Bank of India.'
    },
    {
      q: 'Can this interest be claimed as a tax deduction?',
      a: 'No. As per Section 23 of the MSMED Act, interest paid or payable by a buyer for delayed payments to an MSME is expressly disallowed as an expenditure/deduction under the Income Tax Act, 1961.'
    },
    {
      q: 'What are the reporting requirements under Form MSME-1?',
      a: 'Under Section 405(4) of the Companies Act, 2013, specified companies having outstanding dues to Micro and Small enterprises exceeding 45 days must file a half-yearly return in Form MSME-1 with the ROC detailing all outstanding amounts and reasons for delay.'
    }
  ]

  return (
    <div className="mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
        MSME Delayed Payment FAQs
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
