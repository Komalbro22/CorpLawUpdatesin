'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, CheckCircle2, ArrowLeft, Send } from 'lucide-react'

export default function FeedbackClient() {
  const searchParams = useSearchParams()
  const rawType = searchParams.get('type') || 'document_set'
  const rawTitle = searchParams.get('title') || 'Legal Document Template'
  const rawUrl = searchParams.get('url') || '/documents'

  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [sentiment, setSentiment] = useState<'positive' | 'negative'>('positive')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const validTypes = ['article', 'calculator', 'document', 'glossary', 'document_set'] as const
  const contextType = validTypes.includes(rawType as any) ? (rawType as typeof validTypes[number]) : 'document_set'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) {
      setError('Please provide your feedback or correction details.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_type: contextType,
          context_title: rawTitle,
          context_url: rawUrl,
          sentiment,
          tags: ['web_feedback'],
          comment: comment.trim(),
          user_email: email.trim() || null,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit feedback')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy dark:text-white mb-2">Thank you for your feedback!</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
          Our editorial and legal secretarial research team reviews all suggestions to ensure verified statutory compliance.
        </p>
        <Link
          href={rawUrl.startsWith('/') ? rawUrl : '/documents'}
          className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to document</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy dark:text-white">Reader Feedback & Legal Suggestions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For: <span className="font-semibold text-slate-700 dark:text-slate-300">{rawTitle}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Was this document template or guide helpful?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSentiment('positive')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                sentiment === 'positive'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              👍 Yes, accurate & helpful
            </button>
            <button
              type="button"
              onClick={() => setSentiment('negative')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                sentiment === 'negative'
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              ⚠️ Needs correction / suggestion
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="feedback-comment" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Your Comments, Corrections, or Questions <span className="text-red-500">*</span>
          </label>
          <textarea
            id="feedback-comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what can be improved, or provide statutory references for any inaccuracies..."
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
        </div>

        <div>
          <label htmlFor="feedback-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Your Email (Optional, if you would like an editorial follow-up)
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ca.partner@example.com"
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href={rawUrl.startsWith('/') ? rawUrl : '/documents'}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Send Feedback'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
