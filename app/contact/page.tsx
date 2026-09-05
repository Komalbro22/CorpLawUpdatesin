'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Calendar, CheckCircle2, Clock, Lightbulb, Loader2, Mail, Newspaper, Rss } from 'lucide-react'

const contactCards: {
    Icon: LucideIcon
    title: string
    desc: string
    action: { label: string; href: string; internal?: boolean } | null
}[] = [
    {
        Icon: Mail,
        title: 'General enquiries',
        desc: 'Questions about the site, content, or partnerships.',
        action: {
            label: 'mail@corplawupdates.in',
            href: 'mailto:mail@corplawupdates.in',
        },
    },
    {
        Icon: Lightbulb,
        title: 'Submit a regulatory tip',
        desc: 'Spotted a new MCA circular or SEBI notification? Send us the link and we will cover it.',
        action: {
            label: 'Send tip',
            href: 'mailto:mail@corplawupdates.in?subject=Article%20Tip',
        },
    },
    {
        Icon: Newspaper,
        title: 'Newsletter',
        desc: 'Subscribe, unsubscribe, or report a newsletter issue.',
        action: {
            label: 'Manage subscription',
            href: '/newsletter',
            internal: true,
        },
    },
    {
        Icon: Clock,
        title: 'Response time',
        desc: 'We typically respond within 24–48 hours on working days.',
        action: null,
    },
]

const subjectOptions = [
    'General Enquiry',
    'Submit Article Tip',
    'Newsletter Issue',
    'Report an Error in Article',
    'Partnership / Collaboration',
    'Feedback / Suggestion',
    'Other',
]

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Failed to send message')
                return
            }
            setSubmitted(true)
        } catch {
            setError('Failed to send message. Please email mail@corplawupdates.in directly.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* HERO */}
            <div className="relative bg-navy py-12 md:py-14 px-4 text-center overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:64px_64px]"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(245,158,11,0.1),transparent_55%)]" aria-hidden="true" />
                <h1 className="relative text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                    Contact
                </h1>
                <p className="relative text-slate-300 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                    Questions, suggestions, regulatory tips, or feedback — we read every message.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* ── LEFT COLUMN ── */}
                    <div className="space-y-4">

                        {contactCards.map((card) => {
                            const CardIcon = card.Icon
                            return (
                            <div
                                key={card.title}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 flex gap-4 items-start hover:border-amber-400/60 dark:hover:border-amber-500/40 hover:shadow-card transition-all duration-200 ring-1 ring-transparent hover:ring-slate-900/[0.03]"
                            >
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-navy dark:text-amber-400 border border-slate-100 dark:border-slate-700">
                                    <CardIcon className="size-5" aria-hidden="true" />
                                </span>
                                <div>
                                    <h3 className="font-bold text-navy dark:text-white text-sm mb-1">
                                        {card.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
                                        {card.desc}
                                    </p>
                                    {card.action && (
                                        card.action.internal ? (
                                            <Link
                                                href={card.action.href}
                                                className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold text-sm inline-flex items-center gap-1 transition-colors"
                                            >
                                                {card.action.label}
                                                <span aria-hidden="true">→</span>
                                            </Link>
                                        ) : (
                                            <a
                                                href={card.action.href}
                                                className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold text-sm inline-flex items-center gap-1 transition-colors"
                                            >
                                                {card.action.label}
                                                <span aria-hidden="true">→</span>
                                            </a>
                                        )
                                    )}
                                </div>
                            </div>
                            )
                        })}

                        {/* FOLLOW US */}
                        <div className="bg-slate-100/70 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5">
                            <h3 className="font-bold text-navy dark:text-white text-sm mb-3">
                                Stay in the loop
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/newsletter"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors duration-200 shadow-sm"
                                >
                                    <Mail className="size-3.5 opacity-90" aria-hidden="true" />
                                    Newsletter
                                </Link>
                                <a
                                    href="/api/feed.xml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-sm"
                                >
                                    <Rss className="size-3.5 opacity-90" aria-hidden="true" />
                                    RSS
                                </a>
                                <Link
                                    href="/calendar"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-amber-400 text-navy text-xs font-semibold rounded-lg hover:bg-amber-500 transition-colors duration-200 shadow-sm"
                                >
                                    <Calendar className="size-3.5 opacity-90" aria-hidden="true" />
                                    Calendar
                                </Link>
                            </div>
                        </div>

                        {/* LEGAL LINKS */}
                        <div className="flex gap-4 text-xs text-slate-400 pt-2">
                            <Link href="/privacy-policy" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                Privacy Policy
                            </Link>
                            <span>·</span>
                            <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                Terms of Service
                            </Link>
                        </div>

                    </div>

                    {/* ── RIGHT COLUMN — FORM ── */}
                    <div>
                        {submitted ? (
                            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 min-h-[400px] content-fade-in">
                                <span className="flex size-16 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/40">
                                    <CheckCircle2 className="size-9" aria-hidden="true" />
                                </span>
                                <h3 className="text-xl font-heading font-bold text-emerald-900 dark:text-emerald-300">
                                    Message sent
                                </h3>
                                <p className="text-emerald-800/90 dark:text-emerald-400 text-sm max-w-xs leading-relaxed">
                                    Thank you for reaching out. We typically respond within 24–48 hours on working days.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubmitted(false)
                                        setName('')
                                        setEmail('')
                                        setSubject('')
                                        setMessage('')
                                    }}
                                    className="text-sm text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 mt-2 font-semibold underline-offset-2 hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-5 shadow-card ring-1 ring-slate-900/[0.02] dark:ring-white/[0.02]"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-navy dark:text-white">
                                        Send a Message
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        We read every message and reply within 24–48 hours.
                                    </p>
                                </div>

                                {/* Name */}
                                <div>
                                    <label htmlFor="contact-name" className="block text-sm font-semibold text-navy dark:text-slate-200 mb-1.5">
                                        Your Name *
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-semibold text-navy dark:text-slate-200 mb-1.5">
                                        Your Email *
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-navy dark:text-slate-200 mb-1.5">
                                        Subject *
                                    </label>
                                    <select
                                        id="contact-subject"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    >
                                        <option value="">Select a subject...</option>
                                        {subjectOptions.map((opt) => (
                                            <option key={opt} value={opt} className="dark:bg-slate-800 dark:text-slate-100">
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="contact-message" className="block text-sm font-semibold text-navy dark:text-slate-200 mb-1.5">
                                        Message *
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        required
                                        rows={5}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell us how we can help..."
                                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2" role="alert">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gold hover:bg-amber-400 disabled:opacity-60 text-navy font-bold py-3.5 rounded-lg transition-colors duration-200 text-sm shadow-sm inline-flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                                    {loading ? 'Sending...' : 'Send message'}
                                </button>

                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                                    Or email us directly at{' '}
                                    <a href="mailto:mail@corplawupdates.in" className="text-amber-700 dark:text-amber-400 hover:underline font-medium">
                                        mail@corplawupdates.in
                                    </a>
                                </p>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
