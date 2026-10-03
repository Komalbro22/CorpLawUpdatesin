'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ShieldCheck, X, ChevronDown, ChevronUp } from 'lucide-react'

// Type declarations for Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

interface ConsentState {
  necessary: boolean
  analytics: boolean
  advertising: boolean
  functional: boolean
}

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  advertising: false,
  functional: false,
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT)

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem('clu_cookie_consent_v2')
      if (!savedConsent) {
        // Small delay to prevent layout thrashing on initial paint
        const timer = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(timer)
      } else {
        // Load existing consent
        setConsent(JSON.parse(savedConsent))
      }
    } catch {
      // localStorage disabled or private browsing restriction
    }
  }, [])

  const updateConsent = (key: keyof ConsentState, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    try {
      localStorage.setItem('clu_cookie_consent_v2', JSON.stringify(consent))
      localStorage.setItem('clu_cookie_consent_date_v2', new Date().toISOString())
      
      // Update Google Consent Mode
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: consent.advertising ? 'granted' : 'denied',
          ad_user_data: consent.advertising ? 'granted' : 'denied',
          ad_personalization: consent.advertising ? 'granted' : 'denied',
          analytics_storage: consent.analytics ? 'granted' : 'denied',
          functionality_storage: consent.functional ? 'granted' : 'denied',
        })
      }
    } catch {
      // ignore storage error
    }
    setVisible(false)
  }

  const handleAcceptAll = () => {
    setConsent({
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true,
    })
    handleSave()
  }

  const handleRejectAll = () => {
    setConsent(DEFAULT_CONSENT)
    handleSave()
  }

  if (!visible) return null

  return (
    <aside
      role="region"
      aria-label="Cookie & Privacy Consent"
      className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 sm:bottom-4 sm:inset-x-4 sm:max-w-4xl sm:mx-auto"
    >
      <div className="bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-md text-white p-3 sm:p-6 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-700/80 dark:border-slate-800">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Header */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Cookie className="size-4 sm:size-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Cookie Preferences</h3>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-snug sm:leading-relaxed">
                We use cookies for analytics and ads per{' '}
                <Link
                  href="/privacy-policy"
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors shrink-0"
              aria-label="Dismiss cookie notice"
            >
              <X className="size-3.5 sm:size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showDetails ? (
              <>
                <ChevronUp className="size-3.5 sm:size-4" aria-hidden="true" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 sm:size-4" aria-hidden="true" />
                Customize choices
              </>
            )}
          </button>

          {/* Detailed Options */}
          {showDetails && (
            <div className="space-y-2 sm:space-y-3 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-700/50">
              {/* Necessary */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <label className="font-semibold text-white text-xs sm:text-sm">Essential</label>
                  <p className="text-[10px] sm:text-xs text-slate-400">Required (always on)</p>
                </div>
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-700 rounded text-[10px] sm:text-xs text-slate-300 shrink-0">
                  On
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <label className="font-semibold text-white text-xs sm:text-sm">Analytics</label>
                  <p className="text-[10px] sm:text-xs text-slate-400">Site performance</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConsent('analytics', !consent.analytics)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors shrink-0 ${
                    consent.analytics ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={consent.analytics}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      consent.analytics ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <label className="font-semibold text-white text-xs sm:text-sm">Advertising</label>
                  <p className="text-[10px] sm:text-xs text-slate-400">Personalized ads</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConsent('advertising', !consent.advertising)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consent.advertising ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={consent.advertising}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consent.advertising ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Functional */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <label className="font-semibold text-white text-xs sm:text-sm">Functional</label>
                  <p className="text-[10px] sm:text-xs text-slate-400">Preferences</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConsent('functional', !consent.functional)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors shrink-0 ${
                    consent.functional ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={consent.functional}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      consent.functional ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={handleRejectAll}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg sm:rounded-xl transition-colors border border-slate-700"
            >
              Reject All
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold text-navy bg-amber-400 hover:bg-amber-300 rounded-lg sm:rounded-xl transition-colors shadow-md shadow-amber-500/10"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold text-navy bg-emerald-500 hover:bg-emerald-400 rounded-lg sm:rounded-xl transition-colors shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="size-3 sm:size-3.5" aria-hidden="true" />
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
