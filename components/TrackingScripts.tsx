'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

// Type declarations for Google Analytics
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default function TrackingScripts() {
  const [ids, setIds] = useState<{ gaId: string | null; clarityId: string | null } | null>(null)

  useEffect(() => {
    // Intercept generic cross-origin "Script error." caused by client-side ad-blockers
    // (e.g. uBlock, Brave Shields) blocking third-party ad network scripts (Google AdSense, DoubleClick, SwG)
    // so they do not pollute telemetry or Microsoft Clarity with false positive alarms.
    const handleGlobalScriptError = (event: ErrorEvent) => {
      const msg = (event.message || '').toLowerCase()
      if (msg.includes('script error') && (!event.filename || event.lineno === 0)) {
        event.stopImmediatePropagation?.()
      }
    }

    window.addEventListener('error', handleGlobalScriptError, true)

    // Initialize Google Consent Mode v2 with default DENIED state
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      window.gtag = gtag

      // Initialize Google Consent Mode v2: strict opt-in defaults for EEA/UK/CH visitors
      const EEA_REGIONS = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU',
        'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
        'GB', 'CH',
      ]

      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        region: EEA_REGIONS,
      })

      gtag('consent', 'default', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
      })

      // Apply existing saved consent preferences if present
      const savedConsent = localStorage.getItem('clu_cookie_consent_v2')
      if (savedConsent) {
        try {
          const parsed = JSON.parse(savedConsent)
          const consentUpdate: Record<string, string> = {
            analytics_storage: parsed.analytics ? 'granted' : 'denied',
            functionality_storage: parsed.functional ? 'granted' : 'denied',
          }
          if (typeof parsed.advertising === 'boolean') {
            const adState = parsed.advertising ? 'granted' : 'denied'
            consentUpdate.ad_storage = adState
            consentUpdate.ad_user_data = adState
            consentUpdate.ad_personalization = adState
          }
          gtag('consent', 'update', consentUpdate)
        } catch {
          // Invalid consent, keep defaults
        }
      }
    }

    // Fetch tracker IDs dynamically at runtime
    fetch('/api/settings/trackers')
      .then(async (res) => {
        if (!res.ok) return null
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return res.json()
        }
        return null
      })
      .then((data) => {
        if (data) {
          setIds({
            gaId: data.gaId || null,
            clarityId: data.clarityId || null,
          })
        }
      })
      .catch((err) => {
        console.warn('Tracker settings unavailable:', err)
      })

    return () => {
      window.removeEventListener('error', handleGlobalScriptError, true)
    }
  }, [])

  return (
    <>

      {/* Google Analytics: Injected with lazyOnload strategy to preserve fast Core Web Vitals */}
      {ids?.gaId && ids.gaId.startsWith('G-') && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ids.gaId}`}
            strategy="lazyOnload"
          />
          <Script id="ga-init-script" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ids.gaId}', {
                cookie_flags: 'SameSite=None;Secure'
              });
            `}
          </Script>
        </>
      )}

      {/* Microsoft Clarity: Injected with lazyOnload strategy for complete heatmaps and session recordings */}
      {ids?.clarityId && (
        <Script id="clarity-script" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${ids.clarityId}");
          `}
        </Script>
      )}
    </>
  )
}

