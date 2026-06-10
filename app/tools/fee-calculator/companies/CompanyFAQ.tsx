'use client'

import React, { useState } from 'react'

export default function CompanyFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is the normal fee for filing Company ROC forms?',
      a: 'For private and public companies, normal filing fees range from ₹200 to ₹600 depending on the authorized share capital. For OPCs and Small Companies, the fee is heavily subsidized, ranging from ₹50 to ₹200.'
    },
    {
      q: 'How is the late fee calculated for AOC-4 and MGT-7?',
      a: 'Annual returns like AOC-4 and MGT-7 have an uncapped penalty of ₹100 per day. For example, if you are 30 days late, the penalty will be exactly ₹3,000 in addition to the normal filing fee.'
    },
    {
      q: 'What happens if I delay filing general forms like ADT-1 or INC-22?',
      a: 'General forms attract a multiplier-based penalty. If filed within 15-30 days of the due date, you pay 2x the normal fee. Delaying over 180 days attracts a penalty of 12x the normal fee. (Note: ADT-1 has a 15-day grace period where no penalty applies).'
    },
    {
      q: 'How is stamp duty calculated for Share Capital (SH-7)?',
      a: 'Stamp duty for increasing authorized share capital is determined by your state. For example, Maharashtra charges 0.2% subject to a cap of ₹50 Lakhs, while Delhi charges 0.15%. Our calculator provides an indicative estimate based on your selected state.'
    },
    {
      q: 'What is the penalty for late filing of CHG-1?',
      a: 'If CHG-1 (Creation of Charge) is delayed beyond 30 days, an ad valorem fee is charged. This fee is a percentage of the secured amount (0.05% for normal companies, up to a cap of ₹5,00,000) on top of the standard late fee multiplier.'
    }
  ]

  return (
    <div className="mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
        Frequently Asked Questions
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
