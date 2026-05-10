'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Megaphone } from 'lucide-react'

export default function AnnouncementBar() {
  const [data, setData] = useState<{ text: string; url: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  if (loading || !data?.text?.trim()) return null

  return (
    <div className="bg-amber-400 text-navy text-sm font-medium text-center py-2.5 px-4 print:hidden border-b border-amber-500/30">
      {data.url ? (
        <Link
          href={data.url}
          target={data.url.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 hover:underline underline-offset-2"
        >
          <Megaphone className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
          <span>{data.text}</span>
          <span className="opacity-80" aria-hidden>→</span>
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          <Megaphone className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
          {data.text}
        </span>
      )}
    </div>
  )
}
