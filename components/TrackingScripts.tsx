'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { X } from 'lucide-react'

export default function TrackingScripts() {
  const [showBanner, setShowBanner] = useState(false)
  const [ids, setIds] = useState<{ gaId: string | null; clarityId: string | null } | null>(null)

  useEffect(() => {
    // Check if user has already dismissed the notice
    let timer: NodeJS.Timeout
    try {
      const dismissed = localStorage.getItem('cookie_notice_dismissed') || localStorage.getItem('cookie_consent_acknowledged')
      if (!dismissed) {
        // Show after 2.5s or on scroll
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
      console.warn('LocalStorage unavailable:', e)
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

  const handleDismiss = () => {
    try {
      localStorage.setItem('cookie_notice_dismissed', 'true')
      localStorage.setItem('cookie_consent_acknowledged', 'true')
    } catch (e) {
      console.warn('Failed to write to LocalStorage:', e)
    }
    setShowBanner(false)
  }

  return (
    <>
      {/* Non-blocking Slim Informational Cookie Bar with Got It / Close */}
      {showBanner && (
        <div className="fixed bottom-0 inset-x-0 z-[9999] bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 py-2.5 px-3 sm:px-6 shadow-2xl animate-fade-in text-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-left">
            <p className="text-[11px] sm:text-xs text-slate-300 leading-snug line-clamp-2 sm:line-clamp-none">
              🍪 We use cookies to analyze site traffic and enhance your compliance tools experience.{' '}
              <a href="/privacy-policy" className="text-amber-400 hover:underline font-semibold underline underline-offset-2">
                Privacy Policy
              </a>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="text-[11px] sm:text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 px-3 py-1 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                aria-label="Got it, close cookie notice"
              >
                <span>Got it</span>
                <X className="size-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

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

