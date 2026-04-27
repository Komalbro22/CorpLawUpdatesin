'use client'

import { useState } from 'react'
import Link from 'next/link'

const contactCards = [
    {
        icon: '📧',
        title: 'General Enquiries',
        desc: 'For questions about the site, content, or partnerships.',
        action: {
            label: 'corplawupdatesin@gmail.com',
            href: 'mailto:corplawupdatesin@gmail.com',
        },
    },
    {
        icon: '💡',
        title: 'Submit a Regulatory Tip',
        desc: 'Spotted a new MCA circular or SEBI notification? Send us the link and we will cover it.',
        action: {
            label: 'Send tip →',
            href: 'mailto:corplawupdatesin@gmail.com?subject=Article%20Tip',
        },
    },
    {
        icon: '📰',
        title: 'Newsletter',
        desc: 'To subscribe, unsubscribe, or report a newsletter issue.',
        action: {
            label: 'Manage subscription →',
            href: '/newsletter',
            internal: true,
        },
    },
    {
        icon: '⏱️',
        title: 'Response Time',
        desc: 'We typically respond within 24-48 hours on working days.',
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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const sub = encodeURIComponent(
            subject || 'Enquiry from CorpLawUpdates.in'
        )
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        )
        window.location.href =
            `mailto:corplawupdatesin@gmail.com` +
            `?subject=${sub}&body=${body}`
        setSubmitted(true)
    }

    return (
        <div>

            {/* HERO */}
            <div className="bg-navy py-12 px-4 text-center">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                    Get in Touch
                </h1>
                <p className="text-slate-300 max-w-xl mx-auto text-lg">
                    Questions, suggestions, article tips
                    or just want to say hello?
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* ── LEFT COLUMN ── */}
                    <div className="space-y-4">

                        {contactCards.map((card) => (
                            <div
                                key={card.title}
                                className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start hover:border-amber-300 hover:shadow-sm transition-all duration-200"
                            >
                                <span className="text-2xl flex-shrink-0">
                                    {card.icon}
                                </span>
                                <div>
                                    <h3 className="font-bold text-navy text-sm mb-1">
                                        {card.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-2">
                                        {card.desc}
                                    </p>
                                    {card.action && (
                                        card.action.internal ? (
                                            <Link
                                                href={card.action.href}
                                                className="text-amber-600 hover:underline font-medium text-sm"
                                            >
                                                {card.action.label}
                                            </Link>
                                        ) : (
                                            <a
                                                href={card.action.href}
                                                className="text-amber-600 hover:underline font-medium text-sm"
                                            >
                                                {card.action.label}
                                            </a>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* FOLLOW US */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                            <h3 className="font-bold text-navy text-sm mb-3">
                                📲 Follow for Daily Updates
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/newsletter"
                                    className="flex items-center gap-2 px-3 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    📧 Newsletter
                                </Link>
                                <a
                                    href="/api/feed.xml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    ◉ RSS Feed
                                </a>
                                <Link
                                    href="/calendar"
                                    className="flex items-center gap-2 px-3 py-2 bg-amber-400 text-navy text-xs font-semibold rounded-lg hover:bg-amber-500 transition-colors"
                                >
                                    📅 Calendar
                                </Link>
                            </div>
                        </div>

                        {/* LEGAL LINKS */}
                        <div className="flex gap-4 text-xs text-slate-400 pt-2">
                            <Link href="/privacy-policy" className="hover:text-amber-600 transition-colors">
                                Privacy Policy
                            </Link>
                            <span>·</span>
                            <Link href="/terms" className="hover:text-amber-600 transition-colors">
                                Terms of Service
                            </Link>
                        </div>

                    </div>

                    {/* ── RIGHT COLUMN — FORM ── */}
                    <div>
                        {submitted ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 min-h-[400px]">
                                <span className="text-6xl">✅</span>
                                <h3 className="text-xl font-bold text-green-800">
                                    Email app opened!
                                </h3>
                                <p className="text-green-700 text-sm max-w-xs leading-relaxed">
                                    Your default email app should have
                                    opened with your message pre-filled.
                                    Just hit send!
                                </p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false)
                                        setName('')
                                        setEmail('')
                                        setSubject('')
                                        setMessage('')
                                    }}
                                    className="text-sm text-green-600 hover:underline mt-2 font-medium"
                                >
                                    ← Send another message
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-navy">
                                        Send a Message
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Fills your email app — no data sent to any server.
                                    </p>
                                </div>

                                {/* Name */}
                                <div>
                                    <label htmlFor="contact-name" className="block text-sm font-semibold text-navy mb-1.5">
                                        Your Name *
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-semibold text-navy mb-1.5">
                                        Your Email *
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-navy mb-1.5">
                                        Subject *
                                    </label>
                                    <select
                                        id="contact-subject"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                                    >
                                        <option value="">Select a subject...</option>
                                        {subjectOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="contact-message" className="block text-sm font-semibold text-navy mb-1.5">
                                        Message *
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        required
                                        rows={5}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell us how we can help..."
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-amber-400 hover:bg-amber-500 text-navy font-bold py-3.5 rounded-lg transition-colors text-sm"
                                >
                                    Open Email App to Send →
                                </button>

                                <p className="text-xs text-slate-400 text-center leading-relaxed">
                                    Clicking will open your default email
                                    app (Gmail, Outlook etc.) with your
                                    message pre-filled. Just hit send!
                                </p>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
