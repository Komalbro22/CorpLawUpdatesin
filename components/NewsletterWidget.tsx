/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Mail, Calendar, ArrowRight, ShieldCheck } from 'lucide-react'

export default function NewsletterWidget() {
    const [email, setEmail] = useState('')
    const [consent, setConsent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)
    const [error, setError] = useState('')
    const [savedEmail, setSavedEmail] = useState<string | null>(null)
    const [isEditingDifferent, setIsEditingDifferent] = useState(false)

    // Check localStorage on mount for prior subscription
    useEffect(() => {
        try {
            const stored = localStorage.getItem('corplaw_subscribed_email')
            if (stored && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stored)) {
                setSavedEmail(stored)
            }
        } catch (e) {
            // Ignore localStorage errors in restricted environments
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.')
            return
        }

        if (!consent) {
            setError('You must consent to our Privacy Policy to subscribe.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to subscribe')
            }

            const cleanEmail = email.trim().toLowerCase()

            // Persist to localStorage
            try {
                localStorage.setItem('corplaw_subscribed_email', cleanEmail)
                localStorage.setItem('corplaw_subscribed_at', new Date().toISOString())
            } catch (e) {
                // Ignore storage error
            }

            setSavedEmail(cleanEmail)
            setIsAlreadySubscribed(Boolean(data.alreadySubscribed))
            setSuccess(true)
            setIsEditingDifferent(false)
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const activeConfirmed = (savedEmail && !isEditingDifferent) || success

    return (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-card ring-1 ring-slate-900/[0.02] dark:ring-white/[0.02] transition-all duration-300 hover:shadow-card-hover">
            
            {/* Header / Brand */}
            <div className="flex items-start gap-3.5 mb-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 dark:bg-white/10 text-navy dark:text-amber-400">
                    <Mail className="size-5" aria-hidden="true" />
                </span>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg md:text-xl font-bold text-navy dark:text-white leading-snug">
                            Corporate Law Intelligence Digest
                        </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-0.5 leading-relaxed">
                        High-impact MCA, SEBI & RBI circulars delivered every Monday morning. Free forever.
                    </p>
                </div>
            </div>

            {/* Confirmed / Active State */}
            {activeConfirmed ? (
                <div className="mt-2 space-y-4">
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30 p-4 text-emerald-900 dark:text-emerald-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 flex-wrap">
                                    <span>{isAlreadySubscribed ? "You're already subscribed!" : "Subscription Confirmed!"}</span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-200/60 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                        <ShieldCheck size={12} /> Active
                                    </span>
                                </p>
                                <p className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                                    Your weekly briefing is active for <strong className="font-semibold text-emerald-950 dark:text-emerald-100">{savedEmail || email}</strong>.
                                    {isAlreadySubscribed ? (
                                        " You will continue receiving our Monday executive memo and statutory deadlines."
                                    ) : (
                                        " We've dispatched your welcome briefing to your inbox. (Check spam if not found within 2 minutes)."
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Mobile Breaking Channels */}
                        <div className="mt-4 pt-3.5 border-t border-emerald-200/80 dark:border-emerald-800/50">
                            <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2">
                                ⚡ Also get instant circular alerts on your phone:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href="https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg font-bold shadow-xs hover:opacity-95 transition-all"
                                >
                                    WhatsApp Channel
                                </a>
                                <a
                                    href="https://t.me/corplawupdate"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs bg-[#229ED9] hover:bg-[#1f8ec4] text-white px-3 py-1.5 rounded-lg font-bold shadow-xs hover:opacity-95 transition-all"
                                >
                                    Telegram Channel
                                </a>
                                <Link
                                    href="/calendar"
                                    className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-semibold hover:border-amber-400 hover:text-amber-700 transition-colors"
                                >
                                    <Calendar size={13} className="text-amber-500" />
                                    Compliance Calendar
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Change email button */}
                    <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
                        <span>Subscribed with corporate email?</span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditingDifferent(true)
                                setEmail('')
                                setError('')
                            }}
                            className="font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                            Change email address
                            <ArrowRight size={11} />
                        </button>
                    </div>
                </div>
            ) : (
                /* Subscription Form */
                <form 
                  onSubmit={handleSubmit} 
                  className="flex flex-col gap-3 mt-3"
                  toolname="subscribe_newsletter"
                  tooldescription="Subscribe an email address to the CorpLawUpdates weekly compliance digest newsletter."
                >
                    {isEditingDifferent && savedEmail && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                            <span>Currently subscribed as: <strong className="text-slate-700 dark:text-slate-200">{savedEmail}</strong></span>
                            <button
                                type="button"
                                onClick={() => setIsEditingDifferent(false)}
                                className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <div>
                        <label htmlFor="newsletter-widget-email" className="sr-only">
                            Corporate email address
                        </label>
                        <input
                            name="email"
                            id="newsletter-widget-email"
                            type="email"
                            toolparamdescription="Valid email address to subscribe (e.g. name@example.com)"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@company.com or ca.firm@gmail.com"
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? "newsletter-email-error" : undefined}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400"
                            required
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>
                    
                    <div className="flex items-start gap-2.5 my-1">
                        <input
                            id="newsletter-widget-consent"
                            type="checkbox"
                            checked={consent}
                            onChange={e => setConsent(e.target.checked)}
                            className="mt-0.5 size-4 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-navy focus:ring-navy dark:focus:ring-amber-500 cursor-pointer"
                            required
                            disabled={loading}
                        />
                        <label htmlFor="newsletter-widget-consent" className="text-xs text-slate-500 dark:text-slate-400 leading-normal select-none cursor-pointer">
                            I agree to receive the weekly regulatory briefing and agree to the{' '}
                            <Link href="/privacy-policy" target="_blank" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">
                                Privacy Policy
                            </Link>. Unsubscribe with 1-click anytime.
                        </label>
                    </div>

                    {error && (
                        <p id="newsletter-email-error" className="text-red-600 dark:text-red-400 text-xs font-semibold" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-navy hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-65 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.99]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                Subscribing...
                            </>
                        ) : (
                            'Subscribe Free — No Spam'
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
