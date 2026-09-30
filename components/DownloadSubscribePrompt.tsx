'use client'

import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { markDownloadPromptSkipped, markDownloadPromptSubscribed } from '@/lib/download-prompt-storage'

export { DOWNLOAD_PROMPT_SKIP_DAYS, isDownloadPromptSuppressed, markDownloadPromptSkipped, markDownloadPromptSubscribed } from '@/lib/download-prompt-storage'

export type DownloadPromptSource = 'gazette-pdf' | 'template' | 'other'
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DownloadSubscribePromptProps {
  open: boolean
  source: DownloadPromptSource
  onClose: () => void
}

const professions = ['CA', 'CS', 'CMA', 'Advocate', 'Student', 'Other'] as const

export default function DownloadSubscribePrompt({ open, source, onClose }: DownloadSubscribePromptProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  const submittingRef = useRef(false)
  const [email, setEmail] = useState('')
  const [profession, setProfession] = useState('')
  const [professionOther, setProfessionOther] = useState('')
  const [frequency, setFrequency] = useState<'Weekly' | 'Daily'>('Weekly')
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow
    const focusFrame = window.requestAnimationFrame(() => emailRef.current?.focus())

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  const closeAsSkip = () => {
    if (!subscribed) markDownloadPromptSkipped()
    onClose()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current || !email.trim()) return

    submittingRef.current = true
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          profession: profession || undefined,
          profession_other: profession === 'Other' ? professionOther.trim().slice(0, 60) : undefined,
          frequency,
          source,
          source_page: window.location.href,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        setError(response.status === 429
          ? 'Too many attempts right now. Your download has started; please try subscribing again later.'
          : 'We could not complete your subscription right now. Your download has started; please try again later.')
        return
      }

      markDownloadPromptSubscribed()
      setSubscribed(true)
    } catch {
      setError('We could not connect right now. Your download has started; please try again later.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:max-h-[calc(100dvh-2.5rem)] sm:p-7"
      >
        <button
          type="button"
          onClick={closeAsSkip}
          aria-label="Close and continue"
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <h2 id={titleId} className="pr-9 text-xl font-bold leading-snug text-slate-950 dark:text-white sm:text-2xl">
          Your download has started. Want updates like this by email?
        </h2>
        <p id={descriptionId} className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
          We never sell your email or share it with third parties for marketing. No spam, unsubscribe anytime.
        </p>

        {subscribed ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" role="status" aria-live="polite">
            You’re subscribed. Thanks for joining!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor={`${titleId}-email`} className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Email address <span aria-hidden="true">*</span>
              </label>
              <input
                ref={emailRef}
                id={`${titleId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor={`${titleId}-profession`} className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                You are a: <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <select
                id={`${titleId}-profession`}
                name="profession"
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Choose one (optional)</option>
                {professions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {profession === 'Other' && (
                <label htmlFor={`${titleId}-profession-other`} className="mt-2 block">
                  <span className="sr-only">Please specify your profession (optional)</span>
                  <input
                    id={`${titleId}-profession-other`}
                    name="profession_other"
                    type="text"
                    maxLength={60}
                    value={professionOther}
                    onChange={(event) => setProfessionOther(event.target.value.slice(0, 60))}
                    placeholder="Please specify (optional)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
              )}
            </div>

            <div>
              <label htmlFor={`${titleId}-frequency`} className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                How often? <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <select
                id={`${titleId}-frequency`}
                name="frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as 'Weekly' | 'Daily')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
              </select>
              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Right now we send a weekly digest. Daily alerts are coming soon.
              </p>
            </div>

            {error && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{error}</p>}

            <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
              By subscribing you agree to receive our email updates. See our{' '}
              <a href="/privacy-policy" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
                Privacy Policy
              </a>
              .
            </p>

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAsSkip}
                className="min-h-11 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                No thanks
              </button>
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="min-h-11 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                Subscribe
              </button>
            </div>
          </form>
        )}

        {subscribed && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              No thanks
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
