'use client'
import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

export default function ViewCounter({ slug }: { slug: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const hasFetched = useRef(false)

  useEffect(() => {
    if (inView && !hasFetched.current) {
      hasFetched.current = true
      // Fire and forget — don't await, don't block render
      fetch(`/api/views/${slug}`, { method: 'POST' })
        .then(res => {
          if (res.ok) {
            // Optimistically update the live counter on the same page
            window.dispatchEvent(new CustomEvent('article_viewed', { detail: { slug } }))
          } else {
            console.error(`Failed to record view: server returned ${res.status}`)
          }
        })
        .catch(err => {
          console.error('Network error while recording view:', err)
        })
    }
  }, [inView, slug])

  return <span ref={ref} className="sr-only" aria-hidden="true" />
}
