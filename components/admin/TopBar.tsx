'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, ExternalLink, PenSquare, Search } from 'lucide-react'
import Link from 'next/link'

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
    if (pathname === '/admin/repo-rate') return [base, { label: 'Repo Rate' }]
    if (pathname === '/admin/calendar') return [base, { label: 'Calendar' }]
    if (pathname === '/admin/compliance') return [base, { label: 'Compliance' }]
    if (pathname === '/admin/compliance/suggestions') return [base, { label: 'Compliance', href: '/admin/compliance' }, { label: 'Suggestions' }]
    if (pathname === '/admin/settings') return [base, { label: 'Settings' }]
    return [base]
}

function titleForPath(pathname: string): string {
    const segs = segmentsForPath(pathname)
    return segs[segs.length - 1]?.label ?? 'Admin'
}

function todayLabel() {
    return new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
}

export default function TopBar() {
    const pathname = usePathname()
    const title = titleForPath(pathname)
    const segments = segmentsForPath(pathname)
    const greeting = getGreeting()

    return (
        <header className="admin-topbar min-h-16 flex justify-between items-center gap-3 px-4 py-3 sm:px-6 shrink-0">
            <div className="flex min-w-0 flex-col justify-center">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    {segments.map((seg, i) => (
                        <span key={i} className="flex items-center gap-1">
                            {i > 0 && (
                                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" aria-hidden />
                            )}
                            {seg.href && i < segments.length - 1 ? (
                                <Link
                                    href={seg.href}
                                    className="bg-white/[0.06] px-2 py-0.5 rounded-md hover:bg-white/[0.1] hover:text-amber-400 transition-all duration-200"
                                >
                                    {seg.label}
                                </Link>
                            ) : (
                                <span
                                    className={
                                        i === segments.length - 1
                                            ? 'bg-white/[0.06] px-2 py-0.5 rounded-md text-slate-300 font-semibold'
                                            : 'bg-white/[0.06] px-2 py-0.5 rounded-md'
                                    }
                                >
                                    {seg.label}
                                </span>
                            )}
                        </span>
                    ))}
                </nav>

                {/* Greeting */}
                <span className="text-[11px] text-slate-500 font-medium tracking-wide mb-0.5">
                    {greeting} ✨
                </span>

                {/* Page title */}
                <h1 className="font-heading font-bold text-[17px] text-white leading-tight truncate">
                    {title}
                </h1>
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-2">
                {/* Search hint */}
                <div className="hidden lg:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-white/[0.07] transition-all duration-200 group">
                    <Search className="w-3 h-3 text-slate-500 group-hover:text-slate-400 transition-colors" aria-hidden />
                    <span className="text-[11px] text-slate-500 group-hover:text-slate-400 font-medium transition-colors">⌘K</span>
                </div>

                {/* Date badge */}
                <span className="hidden sm:inline text-[11px] text-slate-300 font-medium px-2.5 py-1.5 bg-white/[0.06] rounded-lg border border-white/[0.08]">
                    {todayLabel()}
                </span>

                {/* New Article button */}
                <Link
                    href="/admin/articles/new"
                    className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-lg px-3.5 py-2 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:shadow-admin-glow-amber"
                >
                    <PenSquare className="w-3.5 h-3.5" aria-hidden />
                    New Article
                </Link>

                {/* Live Site link */}
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-white/[0.03]"
                >
                    <span className="hidden sm:inline">Live Site</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
                </a>
            </div>
        </header>
    )
}
