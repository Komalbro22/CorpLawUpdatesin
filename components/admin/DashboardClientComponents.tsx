'use client'

import React, { useState, useEffect } from 'react'
import { Check, Copy, PenSquare, ArrowRight, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      showToast('Email copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Failed to copy', 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${email}`}
      aria-label={`Copy ${email}`}
      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

export function LiveGreeting() {
  const [greeting, setGreeting] = useState('Welcome back')
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      if (hour < 12) setGreeting('Good morning')
      else if (hour < 17) setGreeting('Good afternoon')
      else setGreeting('Good evening')

      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="text-amber-600 font-medium">
      {greeting} {time ? `· ${time}` : ''}
    </span>
  )
}

interface RadarDraftProps {
  title: string
  category: string
  sourceUrl?: string
  sourceName?: string
}

export function RadarQuickDraftButton({ title, category, sourceUrl, sourceName }: RadarDraftProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const handleDraft = () => {
    try {
      const prefill = {
        title,
        category: category.toUpperCase(),
        sourceUrl: sourceUrl || '',
        sourceName: sourceName || `${category} Official`,
        publishedAt: new Date().toISOString().slice(0, 16),
      }
      sessionStorage.setItem('corplaw_radar_prefill', JSON.stringify(prefill))
      showToast(`Drafting article for: ${category}`, 'info')
      router.push('/admin/articles/new')
    } catch {
      router.push(`/admin/articles/new?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDraft}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2 py-1 rounded-lg transition-colors shrink-0 active:scale-95"
    >
      <PenSquare className="w-3 h-3 text-amber-600" />
      <span>Draft</span>
    </button>
  )
}
