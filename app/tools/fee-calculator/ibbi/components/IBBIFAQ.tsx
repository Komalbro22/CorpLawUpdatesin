'use client';

import React, { useState } from 'react';
import { IBBI_FAQS } from '../ibbiFaqsData';

export default function IBBIFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
        IBBI Fee & Liquidation Compliance FAQs
      </h2>
      <div className="space-y-3">
        {IBBI_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
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
                <span
                  className={`font-semibold text-lg ${
                    isOpen ? 'text-navy dark:text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-navy dark:text-white' : 'text-slate-400'
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
