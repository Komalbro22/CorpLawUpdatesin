'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

const EXCLUDED_PREFIXES = [
  '/tools',
  '/documents',
  '/company-search',
  '/admin',
  '/privacy-policy',
  '/terms',
  '/contact',
]

/**
 * Route-guarded AdSense script loader.
 * Google AdSense publisher policy strictly prohibits auto-ads and ad serving
 * on functional utility pages (calculators, document wizards, search lookup, admin).
 * This component guarantees that the AdSense script is only executed on editorial content routes.
 */
export default function AdSenseScript() {
  const pathname = usePathname()

  if (!pathname) return null

  // Suppress AdSense on functional tools, wizards, calculators, and administrative pages
  const isExcluded = EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix))

  if (isExcluded) return null

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8404756575471756"
      crossOrigin="anonymous"
    />
  )
}
