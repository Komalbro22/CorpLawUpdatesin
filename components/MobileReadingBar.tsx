'use client'

import { useEffect, useState } from 'react'
import {
    ArrowUp,
    Bookmark,
    Check,
    ChevronUp,
    List,
    MessageCircle,
    Share2,
    Type,
    X,
} from 'lucide-react'

interface Heading {
    id: string
    text: string
    level: number
}

type FontSize = 'sm' | 'md' | 'lg'
const classMap: Record<FontSize, string> = {
    sm: 'article-font-sm',
    md: 'article-font-md',
    lg: 'article-font-lg',
}
const sizes: FontSize[] = ['sm', 'md', 'lg']

export default function MobileReadingBar({ title }: { title?: string }) {
    const [progress, setProgress] = useState(0)
    const [visible, setVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [headings, setHeadings] = useState<Heading[]>([])
    const [activeHeadingId, setActiveHeadingId] = useState('')
    const [tocOpen, setTocOpen] = useState(false)
    const [fontSizeOpen, setFontSizeOpen] = useState(false)
    const [fontSize, setFontSize] = useState<FontSize>('md')
    const [copied, setCopied] = useState(false)

    // Load initial font size
    useEffect(() => {
        try {
            const saved = (localStorage.getItem('article-font-size') as FontSize) || 'md'
            if (sizes.includes(saved)) setFontSize(saved)
        } catch {}
    }, [])

    // Apply font size
    function changeFontSize(sz: FontSize) {
        setFontSize(sz)
        try {
            localStorage.setItem('article-font-size', sz)
        } catch {}
        const article = document.getElementById('article-root')
        if (article) {
            sizes.forEach(s => article.classList.remove(classMap[s]))
            article.classList.add(classMap[sz])
        }
    }

    // Track scroll position & auto-hide/show bar
    useEffect(() => {
        let lastY = window.scrollY
        function handleScroll() {
            const currentY = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const pct = docHeight > 0 ? (currentY / docHeight) * 100 : 0
            setProgress(Math.min(100, Math.max(0, pct)))

            // Auto hide on scroll down, show on scroll up (after 100px threshold)
            if (currentY > 150) {
                if (currentY > lastY + 10) {
                    setVisible(false)
                    setTocOpen(false)
                    setFontSizeOpen(false)
                } else if (currentY < lastY - 10) {
                    setVisible(true)
                }
            } else {
                setVisible(true)
            }
            lastY = currentY
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Extract headings for Table of Contents
    useEffect(() => {
        const article = document.querySelector('.article-content')
        if (!article) return

        const elements = article.querySelectorAll('h2, h3')
        const items: Heading[] = []

        elements.forEach(el => {
            const text = el.textContent?.trim() || ''
            if (!text) return
            const id = el.id || text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50)
            el.id = id
            items.push({ id, text: text.replace(/^[#\s]+/, ''), level: el.tagName === 'H2' ? 2 : 3 })
        })

        setHeadings(items)
    }, [])

    // Scroll to heading
    function scrollTo(id: string) {
        const el = document.getElementById(id)
        if (!el) return
        const top = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top, behavior: 'smooth' })
        setActiveHeadingId(id)
        setTocOpen(false)
    }

    function shareWhatsApp() {
        const url = window.location.href
        const text = `*${title || 'CorpLaw Update'}*\nRead full article: ${url}`
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    }

    function copyLink() {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <>
            {/* ── TOC Drawer (Mobile Bottom Sheet) ───────────────── */}
            {tocOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setTocOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="absolute bottom-0 left-0 right-0 max-h-[75dvh] bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col p-4 animate-slide-up">
                        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <List className="size-4 text-amber-500" aria-hidden="true" />
                                <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                                    Table of Contents ({headings.length})
                                </span>
                            </div>
                            <button
                                onClick={() => setTocOpen(false)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                aria-label="Close table of contents"
                            >
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-3 space-y-1.5 scrollbar-thin">
                            {headings.length === 0 ? (
                                <p className="text-xs text-slate-400 py-4 text-center">No sections found in this article.</p>
                            ) : (
                                headings.map(h => (
                                    <button
                                        key={h.id}
                                        onClick={() => scrollTo(h.id)}
                                        className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-colors flex items-start gap-2 ${
                                            h.level === 3 ? 'pl-6 text-[11px]' : 'font-semibold'
                                        } ${
                                            activeHeadingId === h.id
                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                                        <span className="line-clamp-2">{h.text}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Font Size Drawer Popover ────────────────────────── */}
            {fontSizeOpen && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 md:hidden animate-fade-up">
                    <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white border border-slate-700/60 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">Text Size:</span>
                        <div className="flex items-center gap-1">
                            {sizes.map(s => (
                                <button
                                    key={s}
                                    onClick={() => changeFontSize(s)}
                                    aria-label={`Set font size to ${s === 'sm' ? 'small' : s === 'md' ? 'medium' : 'large'}`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        fontSize === s
                                            ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    {s === 'sm' ? 'A-' : s === 'md' ? 'A' : 'A+'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Floating Mobile Reading Bar ─────────────────────── */}
            <div
                className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden transition-all duration-300 ${
                    visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
                }`}
            >
                <div className="bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-xl text-white border border-slate-800/80 rounded-full shadow-2xl px-4 py-2 flex items-center gap-3">
                    {/* Font Size Toggle */}
                    <button
                        onClick={() => { setFontSizeOpen(!fontSizeOpen); setTocOpen(false); }}
                        className={`p-2 rounded-full transition-colors ${
                            fontSizeOpen ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                        }`}
                        aria-label="Adjust font size"
                        title="Adjust Font Size"
                    >
                        <Type className="size-4" aria-hidden="true" />
                    </button>

                    <div className="w-px h-4 bg-slate-800" />

                    {/* Table of Contents */}
                    {headings.length > 0 && (
                        <button
                            onClick={() => { setTocOpen(!tocOpen); setFontSizeOpen(false); }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                tocOpen ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                            }`}
                            aria-label="Toggle table of contents"
                        >
                            <List className="size-4 text-amber-400" aria-hidden="true" />
                            <span>TOC</span>
                            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums">
                                {headings.length}
                            </span>
                        </button>
                    )}

                    <div className="w-px h-4 bg-slate-800" />

                    {/* WhatsApp Share */}
                    <button
                        onClick={shareWhatsApp}
                        className="p-2 rounded-full text-emerald-400 hover:text-emerald-300 transition-colors"
                        aria-label="Share on WhatsApp"
                        title="Share on WhatsApp"
                    >
                        <MessageCircle className="size-4 fill-emerald-400/20" aria-hidden="true" />
                    </button>

                    {/* Scroll to top with progress ring */}
                    <button
                        onClick={scrollToTop}
                        className="relative p-2 rounded-full text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center"
                        aria-label="Scroll to top"
                        title="Scroll to Top"
                    >
                        <ArrowUp className="size-4" aria-hidden="true" />
                        <span className="text-[9px] font-mono tabular-nums font-bold ml-0.5 text-slate-300">
                            {Math.round(progress)}%
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}
