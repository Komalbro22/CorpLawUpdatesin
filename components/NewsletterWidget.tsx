/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'

export default function NewsletterWidget() {
    const [email, setEmail] = useState('')
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
        <div className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-card ring-1 ring-slate-900/[0.02] transition-shadow duration-300 hover:shadow-card-hover md:p-7">
            <div className="flex items-start gap-3 mb-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
                    <Mail className="h-5 w-5" aria-hidden />
                </span>
                <div>
                    <h3 className="font-heading text-lg md:text-xl font-bold text-navy leading-snug">
                        Subscribe to corporate law updates
                    </h3>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                        MCA, SEBI, and RBI highlights in one place, without the clutter.
                    </p>
                </div>
            </div>

            {success ? (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                    <span className="font-medium text-sm leading-relaxed">
                        You are subscribed. Check your inbox for a confirmation message.
                    </span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
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
