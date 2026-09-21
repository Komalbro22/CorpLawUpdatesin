'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, ExternalLink, ArrowRight } from 'lucide-react'

interface GooglePreferredSourceButtonProps {
    variant?: 'badge' | 'banner' | 'card' | 'footer' | 'compact'
    location?: string
    slug?: string
    theme?: 'light' | 'dark'
    className?: string
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                fill="#4285F4"
            />
            <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                fill="#34A853"
            />
            <path
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                fill="#FBBC05"
            />
            <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                fill="#EA4335"
            />
        </svg>
    )
}

export default function GooglePreferredSourceButton({
    variant = 'banner',
    location = 'article_bottom',
    slug = '',
    theme = 'light',
    className = ''
}: GooglePreferredSourceButtonProps) {
    const [clicked, setClicked] = useState(false)
    const [isNativeLoaded, setIsNativeLoaded] = useState(false)
    const nativeContainerRef = useRef<HTMLDivElement>(null)

    const GOOGLE_PREFERENCE_URL = 'https://www.google.com/preferences/source?q=https://www.corplawupdates.in'

    // Detect if Google's official publisher.js injected the native 1-click button
    useEffect(() => {
        const el = nativeContainerRef.current
        if (!el) return

        const check = () => {
            if (el.children.length > 0 || el.querySelector('button, iframe, [role="button"]')) {
                setIsNativeLoaded(true)
                return true
            }
            return false
        }

        if (check()) return

        const observer = new MutationObserver(() => {
            if (check()) {
                observer.disconnect()
            }
        })

        observer.observe(el, { childList: true, subtree: true })
        const timer = setTimeout(check, 1200)

        return () => {
            observer.disconnect()
            clearTimeout(timer)
        }
    }, [])

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

    // --- VARIANT 1: Google-Native Article Banner ---
    if (variant === 'banner') {
        return (
            <div 
                className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
                onClickCapture={trackClick}
            >
                {/* CSS Rule: Automatically hide fallback button if Google's official SDK renders inside container */}
                <style>{`
                    div[google-add-preferred-source-btn]:not(:empty) + .google-preferred-fallback-btn,
                    div[google-add-preferred-source-btn]:not(:empty) ~ .google-preferred-fallback-btn {
                        display: none !important;
                    }
                `}</style>

                {/* Official Google 4-Color Top Hairline Bar */}
                <div 
                    className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" 
                    aria-hidden="true" 
                />

                <div className="p-6 sm:p-7 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* Text & Explainer */}
                        <div className="space-y-3 max-w-2xl">
                            {/* Official Google Search Feature Pill */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>Google Search Feature</span>
                                </span>

                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-[11px] font-bold text-[#1A73E8] dark:text-blue-400">
                                    Top Stories & AI Overviews
                                </span>
                            </div>

                            {/* Headline */}
                            <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                Get Corporate Law Updates First on Google
                            </h3>

                            {/* Description */}
                            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                                Add <strong className="font-semibold text-slate-900 dark:text-white">CorpLawUpdates.in</strong> as your Preferred Source on Google to see verified MCA, SEBI, RBI & NCLT circulars prioritized whenever you search.
                            </p>

                            {/* Subtle Trust & Search Preview Indicator */}
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                <span className="inline-flex items-center justify-center size-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                                    ✓
                                </span>
                                <span>Official Google Search personalization · 1-click add · No sign-in required</span>
                            </div>
                        </div>

                        {/* CTA Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0">
                            {/* Google Publisher.js container (Official 1-Click Button) */}
                            <div 
                                ref={nativeContainerRef}
                                {...{ 'google-add-preferred-source-btn': '' }}
                                data-theme={theme}
                                data-lang="en"
                                className="flex justify-center min-h-[38px] items-center"
                            />

                            {/* Fallback One-Click CTA (Only displayed if Google's script does not load) */}
                            <a
                                href={GOOGLE_PREFERENCE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`google-preferred-fallback-btn inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] group ${
                                    isNativeLoaded ? 'hidden' : ''
                                }`}
                            >
                                <span className="flex size-6 items-center justify-center rounded-full bg-white shrink-0 shadow-xs">
                                    <GoogleIcon className="w-3.5 h-3.5" />
                                </span>

                                <span className="whitespace-nowrap font-medium">
                                    {clicked ? 'Opening Google Preferences...' : 'Add as Preferred Source'}
                                </span>

                                {clicked ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                                )}
                            </a>

                            <div className="text-center lg:text-right">
                                <a 
                                    href="https://developers.google.com/search/docs/appearance/preferred-sources"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 underline inline-flex items-center gap-1"
                                >
                                    <span>Learn how Google Preferred Sources works</span>
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>

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
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition-all hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95"
                >
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
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
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 text-slate-200 text-xs font-semibold transition-all group"
            >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Google Preferred Source</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </a>
        </div>
    )
}
