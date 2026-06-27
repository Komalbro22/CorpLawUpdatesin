'use client'

import React, { useState } from 'react'

export default function LLPFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is the penalty for filing LLP Form 11 or Form 8 late?',
      a: 'Since 1 April 2022, the flat ₹100/day penalty was abolished. LLPs now pay a multiplier-based additional fee (ranging from 1× to 30× the normal fee depending on the delay). For Form 8 and 11 specifically, if the delay exceeds 360 days, you pay the maximum multiplier PLUS a daily penalty (₹10/day for Small LLPs, ₹20/day for Other LLPs).'
    },
    {
      q: 'Are normal filing fees halved for Small LLPs?',
      a: 'No, the normal filing fee for general forms like Form 8 and Form 11 is NOT halved for Small LLPs. It is based strictly on the contribution slab for all LLPs (ranging from ₹50 to ₹600). However, Small LLPs enjoy a much lower multiplier schedule for late fees.'
    },
    {
      q: 'Is there a maximum cap on LLP late filing penalties?',
      a: 'For forms other than Form 8 and Form 11, the late fee is capped at 25× the normal fee for Small LLPs and 50× for Other LLPs. However, for Form 8 and Form 11, the penalty accumulates daily without an upper cap beyond 360 days.'
    },
    {
      q: 'How do I know if my LLP is a Small LLP?',
      a: 'A Small LLP is one where the contribution does not exceed ₹25 Lakhs AND the turnover for the immediately preceding financial year does not exceed ₹40 Lakhs. If you meet both conditions, your late fee multipliers are significantly reduced.'
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
