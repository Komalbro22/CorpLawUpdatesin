'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ShieldCheck, X } from 'lucide-react'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('clu_cookie_consent')
      if (!consent) {
        // Small delay to prevent layout thrashing on initial paint
        const timer = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage disabled or private browsing restriction
    }
  }, [])

  const handleAccept = (choice: 'all' | 'essential') => {
    try {
      localStorage.setItem('clu_cookie_consent', choice)
      localStorage.setItem('clu_cookie_consent_date', new Date().toISOString())
    } catch {
      // ignore storage error
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      role="region"
      aria-label="Cookie & Privacy Consent"
      className="fixed bottom-4 inset-x-4 max-w-3xl mx-auto z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-md text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-700/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Cookie className="size-5" aria-hidden="true" />
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              We use cookies to analyze reader engagement and serve relevant updates and advertisements in compliance with the{' '}
              <strong className="text-white">DPDP Act, 2023</strong> and{' '}
              <strong className="text-white">Google Publisher Policies</strong>. Review our{' '}
              <Link
                href="/privacy-policy"
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleAccept('essential')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => handleAccept('all')}
            className="px-4 py-2 text-xs font-bold text-navy bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-md shadow-amber-500/10 flex items-center gap-1.5"
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Accept All
          </button>
          <button
            type="button"
            onClick={() => handleAccept('essential')}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors ml-1 hidden sm:inline-flex"
            aria-label="Dismiss cookie notice"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
