'use client'

import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname
      const search = searchParams?.toString()
      if (search) {
        url = `${url}?${search}`
      }

      // Avoid double-tracking the initial page view that is already fired inside posthog.init loaded()
      if (lastTrackedPath.current === null) {
        lastTrackedPath.current = url
        return
      }

      if (lastTrackedPath.current !== url && posthog.__loaded) {
        lastTrackedPath.current = url
        posthog.capture('$pageview', {
          $current_url: url,
        })
      }
    }
  }, [pathname, searchParams])

  return null
}

export default function ConsentGatedAnalytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (key && typeof window !== 'undefined') {
      posthog.init(key, {
        api_host: host,
        person_profiles: 'identified_only', // Preserves free quota by skipping profile creation for anonymous readers
        capture_pageview: false, // Manual pageview capture in PostHogPageView handles Next.js App Router navigations accurately
        capture_pageleave: true,
        disable_session_recording: true, // Keep OFF for zero performance overhead and 100/100 Core Web Vitals
        autocapture: false, // Web Analytics mode: minimal payload, no DOM click listeners
        persistence: 'localStorage+cookie',
        loaded: (ph) => {
          let url = window.origin + window.location.pathname
          if (window.location.search) {
            url += window.location.search
          }
          ph.capture('$pageview', {
            $current_url: url,
          })
        },
      })
    }
  }, [])

  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
