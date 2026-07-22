/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'

export default function NewsletterWidget() {
    const [email, setEmail] = useState('')
    const [consent, setConsent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

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
                body: JSON.stringify({ email }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to subscribe')
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card ring-1 ring-slate-900/[0.02] dark:ring-white/[0.02] transition-shadow duration-300 hover:shadow-card-hover md:p-7">
            <div className="flex items-start gap-3 mb-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 dark:bg-white/10 text-navy dark:text-white">
                    <Mail className="h-5 w-5" aria-hidden />
                </span>
                <div>
                    <h3 className="font-heading text-lg md:text-xl font-bold text-navy dark:text-white leading-snug">
                        Subscribe to corporate law updates
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                        MCA, SEBI, and RBI highlights in one place, without the clutter.
                    </p>
                </div>
            </div>

            {success ? (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                    <div>
                        <p className="font-bold text-emerald-900">
                            ✅ You're subscribed!
                        </p>
                        <p className="text-emerald-700 text-sm mt-1">
                            Check your inbox — we just sent you a welcome email with recent articles.
                            (Check spam if not found in 2 minutes)
                        </p>
                    </div>
                </div>
            ) : (
                <form toolname="subscribeNewsletter" tooldescription="Subscribe to daily Indian corporate law regulatory update emails." onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            name="email"
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/45 focus:border-gold/35 text-navy text-sm transition-shadow duration-200 placeholder:text-slate-400"
                            required
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>
                    
                    <div className="flex items-start gap-2.5 my-1.5">
                        <input
                            id="consent"
                            type="checkbox"
                            checked={consent}
                            onChange={e => setConsent(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy cursor-pointer"
                            required
                            disabled={loading}
                        />
                        <label htmlFor="consent" className="text-xs text-slate-500 leading-normal select-none cursor-pointer">
                            I consent to receive weekly updates and agree to the{' '}
                            <Link href="/privacy-policy" target="_blank" className="text-amber-500 hover:underline">
                                Privacy Policy
                            </Link>{' '}
                            including email tracking.
                        </label>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm font-medium" role="alert">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-navy text-white font-semibold py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors duration-200 disabled:opacity-65 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-slate-900/10"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                                Subscribing...
                            </>
                        ) : (
                            'Subscribe free'
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
