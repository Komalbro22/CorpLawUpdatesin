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
      className="fixed bottom-4 inset-x-4 max-w-4xl mx-auto z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-md text-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-slate-700/80 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Cookie className="size-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm mb-1">Cookie Preferences</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
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
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors shrink-0"
              aria-label="Dismiss cookie notice"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showDetails ? (
              <>
                <ChevronUp className="size-4" aria-hidden="true" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="size-4" aria-hidden="true" />
                Show details and customize
              </>
            )}
          </button>

          {/* Detailed Options */}
          {showDetails && (
            <div className="space-y-3 bg-slate-800/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              {/* Necessary */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="font-semibold text-white text-sm">Essential Cookies</label>
                  <p className="text-xs text-slate-400 mt-0.5">Required for site functionality (always enabled)</p>
                </div>
                <div className="px-3 py-1.5 bg-slate-700 rounded-lg text-xs text-slate-300">
                  Always on
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="font-semibold text-white text-sm">Analytics Cookies</label>
                  <p className="text-xs text-slate-400 mt-0.5">Help us improve site performance and content</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConsent('analytics', !consent.analytics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consent.analytics ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={consent.analytics}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consent.analytics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="font-semibold text-white text-sm">Advertising Cookies</label>
                  <p className="text-xs text-slate-400 mt-0.5">Personalized ads and ad performance measurement</p>
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
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="font-semibold text-white text-sm">Functional Cookies</label>
                  <p className="text-xs text-slate-400 mt-0.5">Remember preferences and enhance features</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConsent('functional', !consent.functional)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consent.functional ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={consent.functional}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consent.functional ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleRejectAll}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            >
              Reject All
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-navy bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-md shadow-amber-500/10"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-navy bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
