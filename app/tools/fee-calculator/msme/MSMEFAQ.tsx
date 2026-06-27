'use client'

import React, { useState } from 'react'

export default function MSMEFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is the MSME Samadhaan Scheme?',
      a: 'MSME Samadhaan is a portal and scheme launched by the Ministry of Micro, Small and Medium Enterprises. It empowers micro and small entrepreneurs across the country to directly register their cases relating to delayed payments by Central Ministries/Departments/CPSEs/State Governments or any other buyer.'
    },
    {
      q: 'What is the maximum time a buyer has to pay an MSME?',
      a: 'Under Section 15 of the MSMED Act, the buyer must make payment within the period agreed upon in writing. In no case should this period exceed 45 days from the day of acceptance of the goods/services. If there is no written agreement, the payment must be made within 15 days.'
    },
    {
      q: 'How is the MSME delayed payment interest calculated?',
      a: 'If the buyer fails to pay within 45 days, they are liable to pay compound interest with monthly rests. The rate of interest is three times (3x) the bank rate notified by the Reserve Bank of India (RBI Bank Rate).'
    },
    {
      q: 'Can this interest be claimed as a tax deduction?',
      a: 'No, as per Section 23 of the MSMED Act, the interest paid or payable by a buyer for delayed payments to an MSME is NOT allowed as a deduction under the Income Tax Act, 1961. This adds an additional tax burden on the defaulting buyer.'
    },
    {
      q: 'What happens if a company fails to report MSME dues in Form MSME-1?',
      a: 'Failure to file Form MSME-1 detailing outstanding dues attracts severe penalties under Section 405(4) of the Companies Act. The company and every officer in default are liable to a base penalty of ₹20,000 plus ₹1,000 for every day the default continues, subject to a maximum of ₹3,00,000.'
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
