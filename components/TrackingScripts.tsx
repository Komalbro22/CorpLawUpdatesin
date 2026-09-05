'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

export default function TrackingScripts() {
  const [showBanner, setShowBanner] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [ids, setIds] = useState<{ gaId: string | null; clarityId: string | null } | null>(null)

  useEffect(() => {
    // Check consent with slight delay or scroll to avoid blocking initial CTA
    let timer: NodeJS.Timeout
    try {
      const acknowledged = localStorage.getItem('cookie_consent_acknowledged')
      if (acknowledged === 'true') {
        setConsentGiven(true)
      } else if (acknowledged !== 'false') {
        // Show after 2.5s or after first scroll
        timer = setTimeout(() => setShowBanner(true), 2500)
        const onScroll = () => {
          if (window.scrollY > 120) {
            setShowBanner(true)
            window.removeEventListener('scroll', onScroll)
          }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
      }
    } catch (e) {
      console.warn('LocalStorage is blocked or unavailable:', e)
      timer = setTimeout(() => setShowBanner(true), 2500)
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
      if (timer) clearTimeout(timer)
    }
  }, [])

  const setConsent = (accepted: boolean) => {
    try {
      localStorage.setItem('cookie_consent_acknowledged', accepted ? 'true' : 'false')
    } catch (e) {
      console.warn('Failed to write to LocalStorage:', e)
    }
    setConsentGiven(accepted)
    setShowBanner(false)
    window.dispatchEvent(new Event('cookie-consent-change'))
  }

  const handleAcknowledge = () => setConsent(true)
  const handleReject = () => setConsent(false)

  return (
    <>
      {/* Non-blocking Slim Cookie Bar */}
      {showBanner && (
        <div className="fixed bottom-0 inset-x-0 z-[9999] bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 py-2.5 px-4 sm:px-6 shadow-2xl animate-fade-in text-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              🍪 We use cookies to analyze traffic and enhance your compliance tools experience. Read our{' '}
              <a href="/privacy-policy" className="text-amber-400 hover:underline font-semibold">
                Privacy Policy
              </a>.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReject}
                className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-slate-700/80 hover:border-slate-600 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAcknowledge}
                className="text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 px-4 py-1.5 rounded-lg transition-all shadow-sm"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Scripts injected only after consent with lazyOnload strategy */}
      {consentGiven && ids?.gaId && ids.gaId.startsWith('G-') && (
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

      {consentGiven && ids?.clarityId && (
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

