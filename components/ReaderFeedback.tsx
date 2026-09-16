'use client'

import React, { useState } from 'react'
import { ThumbsUp, AlertCircle, CheckCircle2, Send } from 'lucide-react'

interface ReaderFeedbackProps {
  contextType: 'article' | 'calculator' | 'document'
  contextTitle: string
  contextUrl?: string
}

const POSITIVE_TAGS = [
  'Simple to understand',
  'Accurate & up to date',
  'Saved me time',
  'Covered all points',
  'Clear compliance steps',
]

const ISSUE_TAGS = [
  'Outdated rule or date',
  'Fee calculation discrepancy',
  'Missing key points',
  'Unclear wording',
  'Source link broken',
  'Typo / formatting issue',
]

export default function ReaderFeedback({
  contextType,
  contextTitle,
  contextUrl,
}: ReaderFeedbackProps) {
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!sentiment) return

    setLoading(true)
    setError('')

    try {
      const url = contextUrl || (typeof window !== 'undefined' ? window.location.pathname : '/')
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_type: contextType,
          context_title: contextTitle,
          context_url: url,
          sentiment,
          tags: selectedTags,
          comment: comment.trim() || null,
          user_email: userEmail.trim() || null,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit')
      }

      setSubmitted(true)
    } catch {
      setError('Unable to send feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="my-8 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 text-emerald-900 dark:text-emerald-300 text-sm animate-in fade-in duration-300">
        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Thank you for your feedback!</p>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
            Your input helps our editorial and compliance team keep regulatory information accurate for everyone.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section
      aria-label="Reader Feedback"
      className="my-8 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 transition-all"
    >
      {sentiment === null ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-navy dark:text-slate-200">
              Was this {contextType === 'calculator' ? 'calculation' : contextType === 'document' ? 'document template' : 'article'} accurate and helpful?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Help us maintain high accuracy standards across corporate law updates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSentiment('positive')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shadow-sm"
            >
              <ThumbsUp className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Helpful & Clear
            </button>

            <button
              type="button"
              onClick={() => setSentiment('negative')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors shadow-sm"
            >
              <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              Found an Issue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {sentiment === 'positive' ? (
                <ThumbsUp className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {sentiment === 'positive' ? 'What worked well?' : 'What needs improvement or correction?'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSentiment(null)
                setSelectedTags([])
                setComment('')
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              Cancel
            </button>
          </div>

          {/* Quick Choice Chips */}
          <div>
            <div className="flex flex-wrap gap-1.5">
              {(sentiment === 'positive' ? POSITIVE_TAGS : ISSUE_TAGS).map(tag => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? sentiment === 'positive'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <textarea
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={
                sentiment === 'positive'
                  ? 'Add any additional thoughts (optional)...'
                  : 'Tell us what was incorrect or missing so we can fix it (optional)...'
              }
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Optional Email for follow-up */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <input
              type="email"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              placeholder="Your email if you'd like a reply (optional)"
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 max-w-sm"
            />

            <div className="flex items-center gap-2 justify-end">
              {error && <span className="text-xs text-rose-500">{error}</span>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-navy dark:bg-amber-500 text-white dark:text-navy hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="size-3" />
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  )
}
