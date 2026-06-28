'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

export default function TrackingScripts() {
  const [showBanner, setShowBanner] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [ids, setIds] = useState<{ gaId: string | null; clarityId: string | null } | null>(null)

  useEffect(() => {
    try {
      const acknowledged = localStorage.getItem('cookie_consent_acknowledged')
      if (acknowledged === 'true') {
        setConsentGiven(true)
      } else {
        setShowBanner(true)
      }
    } catch (e) {
      console.warn('LocalStorage is blocked or unavailable:', e)
      // Fallback: show banner if we cannot read/verify consent state
      setShowBanner(true)
    }

    // Fetch tracker IDs dynamically at runtime
    fetch('/api/settings/trackers')
      .then(res => res.json())
      .then(data => {
        setIds({
          gaId: data.gaId || null,
          clarityId: data.clarityId || null,
        })
      })
      .catch(err => {
        console.error('Failed to load tracker settings:', err)
      })
  }, [])

  const handleAcknowledge = () => {
    try {
      localStorage.setItem('cookie_consent_acknowledged', 'true')
    } catch (e) {
      console.warn('Failed to write to LocalStorage:', e)
    }
    setConsentGiven(true)
    setShowBanner(false)
  }

  return (
    <>
      {/* Cookie Notice Banner */}
      {showBanner && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-2xl z-[9999] animate-fade-in flex flex-col gap-4 text-white">
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
              🍪 Cookie Notice
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We use cookies to analyze site traffic and enhance your document generation experience. By continuing to browse our site, you consent to our use of cookies as detailed in our{' '}
              <a href="/privacy-policy" className="text-amber-400 hover:underline font-semibold">
                Privacy Policy
              </a>.
            </p>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={handleAcknowledge}
              className="text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-500 px-6 py-2.5 rounded-xl transition-all shadow-md shadow-amber-400/10"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Analytics Scripts injected only after consent */}
      {consentGiven && ids?.gaId && ids.gaId.startsWith('G-') && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ids.gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init-script" strategy="afterInteractive">
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
        <Script id="clarity-script" strategy="afterInteractive">
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

