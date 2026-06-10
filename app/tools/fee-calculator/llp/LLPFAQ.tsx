'use client'

import React, { useState } from 'react'

export default function LLPFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is the penalty for filing LLP Form 11 late?',
      a: 'If an LLP fails to file Form 11 (Annual Return) by the due date (usually 30th May), a strict flat penalty of ₹100 per day is levied for every day of delay. There is no upper limit or cap to this penalty.'
    },
    {
      q: 'How much is the penalty for late filing of LLP Form 8?',
      a: 'Similar to Form 11, delayed filing of Form 8 (Statement of Account & Solvency) attracts a flat penalty of ₹100 per day. This applies uniformly to all LLPs regardless of their capital contribution.'
    },
    {
      q: 'Is there a maximum cap on LLP late filing penalties?',
      a: 'No, unlike companies where general forms have a maximum multiplier cap (up to 12x), LLP late fees accumulate continuously at ₹100/day indefinitely.'
    },
    {
      q: 'Can the ROC waive the LLP late filing fee of ₹100 per day?',
      a: 'The ₹100 per day additional fee is statutorily fixed under the LLP Act. The ROC does not have the discretionary power to waive this fee. Waivers are only possible if the government announces a special amnesty scheme like the LLP Settlement Scheme.'
    },
    {
      q: 'What is the fee for DIR-3 KYC for Designated Partners?',
      a: 'If DIR-3 KYC is filed before the due date (30th September), it is completely free. If filed late, a flat penalty of ₹5,000 applies.'
    }
  ]

  return (
    <div className="mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
        Frequently Asked Questions about LLP Fees
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
