'use client'

import dynamic from 'next/dynamic'

const BackToTop = dynamic(() => import('@/components/BackToTop'), { ssr: false })
const CookieConsentBanner = dynamic(() => import('@/components/CookieConsentBanner'), { ssr: false })
const WebMCPRegistry = dynamic(() => import('@/components/WebMCPRegistry'), { ssr: false })

export default function ClientAuxiliary() {
  return (
    <>
      <BackToTop />
      <CookieConsentBanner />
      <WebMCPRegistry />
    </>
  )
}
