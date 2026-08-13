'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, Download, ExternalLink, Home, PenSquare, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import AdminGlobalSearch from './AdminGlobalSearch'

interface BreadcrumbSegment {
    label: string
    href?: string
}

function segmentsForPath(pathname: string): BreadcrumbSegment[] {
    const base: BreadcrumbSegment = { label: 'Admin', href: '/admin/dashboard' }

    if (pathname === '/admin/dashboard') return [base, { label: 'Dashboard' }]
    if (pathname === '/admin/articles/new') return [base, { label: 'Articles', href: '/admin/articles' }, { label: 'New Article' }]
    if (pathname === '/admin/articles') return [base, { label: 'Articles' }]
    if (pathname.startsWith('/admin/articles/') && pathname.endsWith('/edit')) return [base, { label: 'Articles', href: '/admin/articles' }, { label: 'Edit Article' }]
    if (pathname === '/admin/subscribers') return [base, { label: 'Subscribers' }]
    if (pathname === '/admin/newsletter') return [base, { label: 'Newsletter' }]
    if (pathname === '/admin/newsletter/history') return [base, { label: 'Newsletter', href: '/admin/newsletter' }, { label: 'Email History' }]
    if (pathname.startsWith('/admin/newsletter/history/')) return [base, { label: 'Newsletter', href: '/admin/newsletter' }, { label: 'History', href: '/admin/newsletter/history' }, { label: 'Campaign' }]
    if (pathname === '/admin/analytics') return [base, { label: 'Analytics' }]
    if (pathname === '/admin/analytics/articles') return [base, { label: 'Analytics', href: '/admin/analytics' }, { label: 'Article Stats' }]
    if (pathname === '/admin/analytics/tools') return [base, { label: 'Analytics', href: '/admin/analytics' }, { label: 'Tool Usage' }]
    if (pathname === '/admin/glossary') return [base, { label: 'Glossary' }]
    if (pathname === '/admin/glossary/new') return [base, { label: 'Glossary', href: '/admin/glossary' }, { label: 'New Term' }]
    if (pathname.startsWith('/admin/glossary/') && pathname.endsWith('/edit')) return [base, { label: 'Glossary', href: '/admin/glossary' }, { label: 'Edit Term' }]
    if (pathname === '/admin/documents') return [base, { label: 'Documents' }]
    if (pathname === '/admin/documents/analytics') return [base, { label: 'Documents', href: '/admin/documents' }, { label: 'AI Analytics' }]
    if (pathname === '/admin/repo-rate') return [base, { label: 'Repo Rate' }]
    if (pathname === '/admin/rates') return [base, { label: 'Tool Rates' }]
    if (pathname === '/admin/rule-engine') return [base, { label: 'Rule Engine' }]
    if (pathname === '/admin/rule-learning') return [base, { label: 'Rule Learning' }]
    if (pathname === '/admin/roc') return [base, { label: 'ROC Forms' }]
    if (pathname === '/admin/calendar') return [base, { label: 'Calendar' }]
    if (pathname === '/admin/compliance') return [base, { label: 'Compliance' }]
    if (pathname === '/admin/compliance/suggestions') return [base, { label: 'Compliance', href: '/admin/compliance' }, { label: 'Suggestions' }]
    if (pathname === '/admin/notifications') return [base, { label: 'Push Broadcast' }]
    if (pathname === '/admin/partner-interests') return [base, { label: 'Partner Interests' }]
    if (pathname === '/admin/settings') return [base, { label: 'Settings' }]
    return [base]
}

function titleForPath(pathname: string): string {
    const segs = segmentsForPath(pathname)
    return segs[segs.length - 1]?.label ?? 'Admin'
}

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

// Contextual action per page
interface CtxAction {
    label: string
    href: string
    icon: React.ElementType
    colorClass: string
}

function getContextualAction(pathname: string): CtxAction | null {
    if (pathname === '/admin/articles' || pathname.startsWith('/admin/articles/')) {
        return { label: 'New Article', href: '/admin/articles/new', icon: PenSquare, colorClass: 'text-white btn-vibrant-amber' }
    }
    if (pathname === '/admin/subscribers') {
        return { label: 'Export CSV', href: '/api/admin/subscribers?export=csv', icon: Download, colorClass: 'text-white btn-vibrant-amber' }
    }
    if (pathname === '/admin/analytics' || pathname.startsWith('/admin/analytics/')) {
        return { label: 'Article Stats', href: '/admin/analytics/articles', icon: TrendingUp, colorClass: 'text-white btn-vibrant-amber' }
    }
    if (pathname === '/admin/newsletter') {
        return { label: 'View Subscribers', href: '/admin/subscribers', icon: Users, colorClass: 'text-white btn-vibrant-amber' }
    }
    return null
}

export default function TopBar() {
    const pathname = usePathname()
    const title = titleForPath(pathname)
    const segments = segmentsForPath(pathname)
    const greeting = getGreeting()
    const ctxAction = getContextualAction(pathname)
    const [time, setTime] = useState('')
    const [dateLabel, setDateLabel] = useState('')
    const [scrolled, setScrolled] = useState(false)

    // Live clock
    useEffect(() => {
        function tick() {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }))
            setDateLabel(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }))
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    // Scroll shadow on parent scrollable
    useEffect(() => {
        const main = document.getElementById('admin-main-scroll')
        if (!main) return
        const onScroll = () => setScrolled(main.scrollTop > 4)
        main.addEventListener('scroll', onScroll, { passive: true })
        return () => main.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header className={`admin-topbar-sticky admin-topbar min-h-16 flex justify-between items-center gap-3 px-4 py-3 sm:px-6 shrink-0 admin-topbar-glass ${scrolled ? 'scrolled' : ''}`}>
            <div className="flex min-w-0 flex-col justify-center gap-0.5">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-0.5 text-[11px] text-slate-400 flex-wrap">
                    {segments.map((seg, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                            {i === 0 ? (
                                seg.href ? (
                                    <Link href={seg.href} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-slate-100 hover:text-amber-600 transition-colors">
                                        <Home className="w-3 h-3" aria-hidden />
                                        <span>{seg.label}</span>
                                    </Link>
                                ) : (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md">
                                        <Home className="w-3 h-3" aria-hidden />
                                        <span>{seg.label}</span>
                                    </span>
                                )
                            ) : (
                                <>
                                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" aria-hidden />
                                    {seg.href && i < segments.length - 1 ? (
                                        <Link href={seg.href} className="px-1.5 py-0.5 rounded-md hover:bg-slate-100 hover:text-amber-600 transition-colors">
                                            {seg.label}
                                        </Link>
                                    ) : (
                                        <span className={i === segments.length - 1 ? 'px-1.5 py-0.5 rounded-md text-slate-600 font-semibold' : 'px-1.5 py-0.5 rounded-md'}>
                                            {seg.label}
                                        </span>
                                    )}
                                </>
                            )}
                        </span>
                    ))}
                </nav>

                {/* Page title */}
                <div className="flex items-baseline gap-2">
                    <h1 className="font-heading font-bold text-[18px] text-slate-900 leading-tight truncate">
                        {title}
                    </h1>
                    <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">
                        {greeting} <span className="text-amber-400">✨</span>
                    </span>
                </div>
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-2">
                <AdminGlobalSearch />

                {/* Live clock + date */}
                <div className="hidden md:flex flex-col items-end">
                    <span className="admin-clock text-[12px] font-semibold text-slate-700 leading-tight">
                        {time}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                        {dateLabel}
                    </span>
                </div>

                {/* Contextual action (page-aware) — shown on sm+, falls back to New Article */}
                {ctxAction ? (
                    <Link
                        href={ctxAction.href}
                        className={`hidden sm:inline-flex items-center gap-1.5 admin-ctx-btn ${ctxAction.colorClass}`}
                    >
                        <ctxAction.icon className="w-3.5 h-3.5" aria-hidden />
                        {ctxAction.label}
                    </Link>
                ) : (
                    <Link
                        href="/admin/articles/new"
                        className="hidden sm:inline-flex items-center gap-1.5 admin-ctx-btn text-white btn-vibrant-amber"
                    >
                        <PenSquare className="w-3.5 h-3.5" aria-hidden />
                        New Article
                    </Link>
                )}

                {/* Live Site link */}
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 transition-colors shadow-sm"
                >
                    <span className="hidden sm:inline">Live Site</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                </a>
            </div>
        </header>
    )
}
