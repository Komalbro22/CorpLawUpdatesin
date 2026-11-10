'use client'

import React, { useState } from 'react'
import { Share2, Check, Copy, Printer, MessageCircle } from 'lucide-react'

interface NewsletterShareBarProps {
  title: string
  weekLabel: string
  url: string
}

export default function NewsletterShareBar({ title, weekLabel, url }: NewsletterShareBarProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `CorpLawUpdates Weekly Briefing (${weekLabel}): ${title}`
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(shareText)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Fallback
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
      >
        <MessageCircle className="size-3.5 fill-current" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
      >
        <svg className="size-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>Post</span>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077b5] hover:bg-[#005f93] text-white text-xs font-semibold shadow-2xs transition-colors"
      >
        <svg className="size-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.78c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
        </svg>
        <span>Share</span>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        aria-label="Copy link to briefing"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="size-3.5" aria-hidden="true" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Print */}
      <button
        onClick={handlePrint}
        aria-label="Print briefing sheet"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
      >
        <Printer className="size-3.5" aria-hidden="true" />
        <span>Print Sheet</span>
      </button>
    </div>
  )
}
