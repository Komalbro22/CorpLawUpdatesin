'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

const ADSENSE_CLIENT_ID = 'ca-pub-8404756575471756'

export default function AdSenseLoader() {
  const pathname = usePathname()
  const advertisingEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true'
  const consentPlatformReady = process.env.NEXT_PUBLIC_ADSENSE_CMP_READY === 'true'
  const isEditorialArticle = pathname?.startsWith('/updates/')

  if (!advertisingEnabled || !consentPlatformReady || !isEditorialArticle) {
    return null
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
