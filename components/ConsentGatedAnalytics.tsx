'use client'

import { useState, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const CONSENT_KEY = 'cookie_consent_acknowledged'

export default function ConsentGatedAnalytics() {
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    const syncConsent = () => {
      try {
        setConsentGiven(localStorage.getItem(CONSENT_KEY) === 'true')
      } catch {
        setConsentGiven(false)
      }
    }

    syncConsent()
    window.addEventListener('cookie-consent-change', syncConsent)
    return () => window.removeEventListener('cookie-consent-change', syncConsent)
  }, [])

  if (!consentGiven) return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
