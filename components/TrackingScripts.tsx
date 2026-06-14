'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

interface TrackingScriptsProps {
  gaId: string | null
  clarityId: string | null
}

export default function TrackingScripts({ gaId, clarityId }: TrackingScriptsProps) {
  const [consent, setConsent] = useState<'accepted' | 'declined' | 'pending'>('pending')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedConsent = localStorage.getItem('cookie_consent')
    if (storedConsent === 'accepted') {
      setConsent('accepted')
    } else if (storedConsent === 'declined') {
      setConsent('declined')
    } else {
      setConsent('pending')
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setConsent('accepted')
  }

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined')
    setConsent('declined')
  }

  if (!mounted) return null

  return (
    <>
      {/* Load scripts if accepted */}
      {consent === 'accepted' && (
        <>
          {gaId && gaId.startsWith('G-') && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `}
              </Script>
            </>
          )}
          {clarityId && (
            <Script id="microsoft-clarity" strategy="afterInteractive">
              {`
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window,document,"clarity","script","${clarityId}");
              `}
            </Script>
          )}
        </>
      )}

      {/* Cookie Consent Banner */}
      {consent === 'pending' && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-2xl z-[9999] animate-fade-in flex flex-col gap-4 text-white">
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
              🍪 Cookie Consent
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We use cookies to analyze site traffic and enhance your document generation experience. By clicking "Accept All", you consent to our use of tracking cookies in accordance with our{' '}
              <a href="/privacy-policy" className="text-amber-400 hover:underline font-semibold">
                Privacy Policy
              </a>.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={handleDecline}
              className="text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-500 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-400/10"
            >
              Accept All
            </button>
          </div>
        </div>
      )}
    </>
  )
}
