'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

export default function TrackingScripts() {
  const [ids, setIds] = useState<{ gaId: string | null; clarityId: string | null } | null>(null)

  useEffect(() => {
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

