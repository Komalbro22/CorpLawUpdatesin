'use client'

import { useEffect, useRef } from 'react'

export default function ViewCounter({ slug }: { slug: string }) {
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!slug || hasFetched.current) return

    // Session-based debounce: avoid inflating views on fast refreshes within the same browser session
    const sessionKey = `viewed_${slug}`
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem(sessionKey)) {
          return
        }
      } catch {
        // Ignore storage exceptions (e.g., incognito or security sandbox restrictions)
      }
    }

    hasFetched.current = true

    // Fire and forget — asynchronous tracking that does not block UI rendering
    fetch(`/api/views/${slug}`, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          try {
            sessionStorage.setItem(sessionKey, '1')
          } catch {
            // Ignore storage write exceptions
          }
          // Optimistically notify any live counters on the page
          window.dispatchEvent(new CustomEvent('article_viewed', { detail: { slug } }))
        } else {
          console.error(`Failed to record view: server returned ${res.status}`)
        }
      })
      .catch(err => {
        console.error('Network error while recording view:', err)
      })
  }, [slug])

  return null
}
