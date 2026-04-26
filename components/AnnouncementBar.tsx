'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
    <div className="bg-amber-400 text-navy text-sm font-medium text-center py-2 px-4 print:hidden">
      {data.url ? (
        <Link
          href={data.url}
          target={data.url.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="hover:underline"
        >
          📢 {data.text} →
        </Link>
      ) : (
        <span>📢 {data.text}</span>
      )}
    </div>
  )
}
