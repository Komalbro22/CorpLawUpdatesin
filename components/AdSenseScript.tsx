'use client'

import { usePathname } from 'next/navigation'

export const ADSENSE_CLIENT_ID = 'ca-pub-8806384636897940'

export default function AdSenseScript() {
  const pathname = usePathname()

  // Exclude Google AdSense script from all admin routes
  if (!pathname || pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
      />
    </>
  )
}
