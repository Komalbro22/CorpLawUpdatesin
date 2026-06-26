'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Megaphone, X } from 'lucide-react'

const DISMISSED_KEY = 'announcement_dismissed_v1'

export default function AnnouncementBar() {
  const [data, setData] = useState<{ text: string; url: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed — wrapped in try-catch for private browsing
    try {
      if (localStorage.getItem(DISMISSED_KEY) === '1') {
        setDismissed(true)
        setLoading(false)
        return
      }
    } catch { /* localStorage unavailable — show the bar */ }

    fetch('/api/settings/announcement')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  function handleDismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch { /* localStorage unavailable — dismiss only for this session via state */ }
  }

  if (loading || dismissed || !data?.text?.trim()) return null

  return (
    <div className="relative border-b border-amber-500/30 bg-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-navy print:hidden">
      {data.url ? (
        <Link
          href={data.url}
          target={data.url.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 underline-offset-2 transition-colors hover:text-slate-800 hover:underline"
        >
          <Megaphone className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span>{data.text}</span>
          <span className="opacity-80" aria-hidden>-&gt;</span>
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          <Megaphone className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          {data.text}
        </span>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/50"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

