'use client'
import { useEffect } from 'react'

export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire and forget — don't await, don't block render
    fetch(`/api/views/${slug}`, { method: 'POST' })
      .catch(() => {}) // silently ignore errors
  }, [slug])

  return null
}
