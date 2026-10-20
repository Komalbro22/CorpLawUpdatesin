'use client'

import React, { useState, useEffect } from 'react'
import { 
  Check, Copy, Bookmark, FileDown, Loader2, Share2, 
  Printer, MessageSquare, ExternalLink, Sparkles 
} from 'lucide-react'
import { isBookmarked, saveBookmark, removeBookmark } from '@/lib/bookmarks'
import { GlossaryPdfData } from '@/lib/pdf/generateGlossaryPdf'

interface GlossaryActionsProps {
  data: GlossaryPdfData
  url: string
  compact?: boolean
  showFeedbackLink?: boolean
}

export default function GlossaryActions({
  data,
  url,
  compact = false,
  showFeedbackLink = true
}: GlossaryActionsProps) {
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    if (data.slug) {
      setBookmarked(isBookmarked(data.slug))
    }
  }, [data.slug])

  const toggleBookmark = () => {
    if (!data.slug) return
    if (bookmarked) {
      removeBookmark(data.slug)
      setBookmarked(false)
    } else {
      saveBookmark({ slug: data.slug, title: data.term, url })
      setBookmarked(true)
    }
  }

  const encoded = {
    title: encodeURIComponent(`${data.term} — Indian Corporate Law Glossary`),
    url: encodeURIComponent(url),
    both: encodeURIComponent(`${data.term} (${data.category || 'Corporate Law'}): ${url}`)
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encoded.title}&url=${encoded.url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`,
    whatsapp: `https://wa.me/?text=${encoded.both}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const { generateGlossaryPdf } = await import('@/lib/pdf/generateGlossaryPdf')
      const doc = generateGlossaryPdf(data)
      doc.save(`${data.slug}-corporate-law-guide.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
      // Fallback to print
      window.print()
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs print:hidden">
        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
          title="Download formatted Corporate Law Dossier PDF"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileDown className="w-3.5 h-3.5" />
          )}
          <span>PDF Dossier</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200/80 active:scale-95"
          title="Copy Link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors border border-emerald-200/80"
          title="Share via WhatsApp"
        >
          <span>WhatsApp</span>
        </a>

        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium transition-colors border border-blue-200/80"
          title="Share on LinkedIn"
        >
          <span>LinkedIn</span>
        </a>

        {/* Bookmark */}
        <button
          onClick={toggleBookmark}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors border ${
            bookmarked 
              ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
          }`}
          title={bookmarked ? 'Saved to bookmarks' : 'Save to bookmarks'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
        </button>

        {showFeedbackLink && (
          <a
            href="#reader-feedback"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1.5 text-xs transition-colors"
            title="Report error or suggestion"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Feedback</span>
          </a>
        )}
      </div>
    )
  }

  // Full Sidebar Card Mode
  return (
    <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs print:hidden space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Actions &amp; Export
        </span>
        <button
          onClick={toggleBookmark}
          className={`text-xs px-2 py-1 rounded-md transition-colors flex items-center gap-1 border ${
            bookmarked 
              ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark this term'}
        >
          <Bookmark className={`w-3 h-3 ${bookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </button>
      </div>

      {/* Primary Download PDF CTA */}
      <button
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95 disabled:opacity-60"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        <span>{isGeneratingPdf ? 'Compiling Dossier...' : 'Download Legal PDF Dossier'}</span>
      </button>

      {/* Quick Share Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-2 rounded-xl text-xs font-medium transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-2 rounded-xl text-xs font-medium transition-all"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Guide</span>
        </button>

        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-2 rounded-xl text-xs font-medium transition-all"
        >
          <span>WhatsApp</span>
        </a>

        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 px-2.5 py-2 rounded-xl text-xs font-medium transition-all"
        >
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  )
}
