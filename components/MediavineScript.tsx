'use client'

import { usePathname } from 'next/navigation'

export default function MediavineScript() {
  const pathname = usePathname()

  // Exclude Mediavine Journey script from all admin and auth routes
  if (!pathname || pathname.startsWith('/admin')) {
    if (typeof window !== 'undefined') {
      try {
        document.querySelectorAll('script[src*="scriptwrapper.com"]').forEach(el => el.remove())
        document.querySelectorAll('[id*="grow"], [class*="grow-"], .grow-housead, #grow-me-container, div[data-mediavine]').forEach(el => el.remove())
      } catch {}
    }
    return null
  }

  return (
    <>
      <link rel="preconnect" href="https://scripts.scriptwrapper.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://scripts.scriptwrapper.com" />
      {/* Mediavine Journey Tag */}
      <script
        type="text/javascript"
        async
        data-noptimize="1"
        data-cfasync="false"
        src="//scripts.scriptwrapper.com/tags/bb9707b8-bfe3-4206-9309-6bc7e7923faf.js"
      />
    </>
  )
}
