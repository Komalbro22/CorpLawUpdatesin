'use client'

import React, { useState } from 'react'
import { companyFaqs, FAQItem } from './companyFaqsData'

export type { FAQItem }
export { companyFaqs }

export default function CompanyFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="mb-20">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Statutory Intelligence</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
        Frequently Asked Questions: MCA &amp; ROC Fees (FY 2026-27)
      </h2>
      <div className="space-y-3">
        {companyFaqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div 
              key={index} 
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                isOpen 
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-slate-800/60 shadow-sm' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className={`font-semibold text-base md:text-lg ${isOpen ? 'text-blue-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {faq.q}
                </span>
                <span className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              <div className={`px-6 overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
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
