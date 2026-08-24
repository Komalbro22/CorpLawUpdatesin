'use client'

import { useState } from 'react'
import { Sparkles, Check, ExternalLink } from 'lucide-react'

interface GooglePreferredSourceButtonProps {
    variant?: 'badge' | 'banner' | 'card' | 'footer' | 'compact'
    location?: string
    slug?: string
    theme?: 'light' | 'dark'
    className?: string
}

export default function GooglePreferredSourceButton({
    variant = 'banner',
    location = 'article_bottom',
    slug = '',
    theme = 'dark',
    className = ''
}: GooglePreferredSourceButtonProps) {
    const [clicked, setClicked] = useState(false)

    const GOOGLE_PREFERENCE_URL = 'https://www.google.com/preferences/source?q=https://www.corplawupdates.in'

    const trackClick = () => {
        setClicked(true)
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

        // 1. First-Party Telemetry Ping
        try {
            const payload = JSON.stringify({
                location,
                slug,
                pageUrl: typeof window !== 'undefined' ? window.location.pathname : '',
                device: isMobile ? 'mobile' : 'desktop'
            })
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/track/preferred-source', payload)
            } else {
                fetch('/api/track/preferred-source', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true
                }).catch(() => {})
            }
        } catch {}

        // 2. Google Analytics 4 Event
        try {
            if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
                (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'google_preferred_source_click', {
                    event_category: 'engagement',
                    event_label: location,
                    article_slug: slug,
                    device: isMobile ? 'mobile' : 'desktop'
                })
            }
        } catch {}

        // 3. Microsoft Clarity Event
        try {
            if (typeof window !== 'undefined' && (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity) {
                (window as unknown as { clarity: (...args: unknown[]) => void }).clarity('event', 'preferred_source_click')
            }
        } catch {}
    }

    // --- VARIANT 1: High-Converting Banner (for bottom of article) ---
    if (variant === 'banner') {
        return (
            <div 
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-slate-900 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-amber-500/30 ${className}`}
                onClickCapture={trackClick}
            >
                {/* Decorative background glow */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
                <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            Google Search Feature
                        </div>
                        <h3 className="font-heading text-xl md:text-2xl font-bold text-white tracking-tight">
                            Get Corporate Law Updates First on Google
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Add <strong className="text-white">CorpLawUpdates.in</strong> as your Preferred Source on Google to see daily MCA, SEBI, RBI & NCLT circulars prioritized in your <strong className="text-amber-300">Top Stories</strong> and <strong className="text-amber-300">AI Overviews</strong>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        {/* Native Google Preferred Source Button Container (auto-filled by publisher.js) */}
                        <div 
                            {...{ 'google-add-preferred-source-btn': '' }}
                            data-theme={theme}
                            data-lang="en"
                            className="flex justify-center"
                        />

                        {/* Fallback & Direct One-Click CTA */}
                        <a
                            href={GOOGLE_PREFERENCE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 group"
                        >
                            {clicked ? (
                                <>
                                    <Check className="w-4 h-4 text-slate-950" />
                                    <span>Opening Google Preferences...</span>
                                </>
                            ) : (
                                <>
                                    <span>⭐ Set as Preferred Source</span>
                                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // --- VARIANT 2: Compact / Badge (for Top Article Share bar or Navbar) ---
    if (variant === 'compact' || variant === 'badge') {
        return (
            <div className={`inline-flex items-center ${className}`} onClickCapture={trackClick}>
                <a
                    href={GOOGLE_PREFERENCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Add CorpLawUpdates.in as your Preferred Source in Google Search"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Follow on Google</span>
                </a>
            </div>
        )
    }

    // --- VARIANT 3: Card / Footer Link ---
    return (
        <div className={`inline-block ${className}`} onClickCapture={trackClick}>
            <a
                href={GOOGLE_PREFERENCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-slate-200 text-xs font-medium transition-all group"
            >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Google Preferred Source</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
            </a>
        </div>
    )
}
