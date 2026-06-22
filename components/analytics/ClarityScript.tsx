'use client'

import { useEffect, useState } from 'react'

export default function ClarityScript() {
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      try {
        if (localStorage.getItem('cookie_consent_acknowledged') === 'true') {
          setConsentGiven(true)
        }
      } catch (e) {
        console.warn('LocalStorage error:', e)
      }
    }

    checkConsent()

    // Poll for consent in case the user accepts the banner in the current session
    const intervalId = setInterval(() => {
      if (!consentGiven) {
        checkConsent()
      }
    }, 1000)
    
    return () => clearInterval(intervalId)
  }, [consentGiven])

  useEffect(() => {
    // Only run on client-side, in production, and if consent is given
    if (typeof window !== 'undefined' && consentGiven && process.env.NODE_ENV === 'production') {
      const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
      // Prevent multiple initializations
      if (projectId && !(window as any).__clarity_initialized) {
        import('clarity-js').then(({ clarity }) => {
          clarity.start({ projectId })
          ;(window as any).__clarity_initialized = true
        })
      }
    }
  }, [consentGiven])

  return null
}
