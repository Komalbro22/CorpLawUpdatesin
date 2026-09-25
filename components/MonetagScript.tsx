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
 * Premium route-guarded Monetag In-Page Push banner script.
 * Strictly suppressed on professional utility pages (calculators, legal document builders,
 * company search, and admin dashboards) to preserve user experience and statutory credibility.
 */
export default function MonetagScript() {
  const pathname = usePathname()

  if (!pathname) return null

  // Keep all calculators, legal generators, search lookup, and legal compliance pages completely clean
  const isExcluded = EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  if (isExcluded) return null

  return (
    <Script
      id="monetag-inpage-push"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='11889835',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
      }}
    />
  )
}
