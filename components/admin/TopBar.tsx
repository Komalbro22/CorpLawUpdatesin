'use client'

import { usePathname } from 'next/navigation'
import { ExternalLink, PenSquare } from 'lucide-react'
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

export default function TopBar() {
    const pathname = usePathname()
    const title = titleForPath(pathname)
    const segments = segmentsForPath(pathname)

    return (
        <header className="h-16 bg-white border-b border-slate-200/80 flex justify-between items-center px-6 shrink-0 shadow-sm shadow-slate-900/[0.03]">
            <div className="flex flex-col justify-center">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
                    {segments.map((seg, i) => (
                        <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-slate-300">/</span>}
                            {seg.href && i < segments.length - 1 ? (
                                <Link href={seg.href} className="hover:text-amber-600 transition-colors">
                                    {seg.label}
                                </Link>
                            ) : (
                                <span className={i === segments.length - 1 ? 'text-navy font-semibold' : ''}>
                                    {seg.label}
                                </span>
                            )}
                        </span>
                    ))}
                </nav>
                {/* Page title */}
                <h1 className="font-heading font-bold text-[17px] text-navy leading-tight">{title}</h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] text-slate-400 font-medium px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200/80">
                    {todayLabel()}
                </span>

                <Link
                    href="/admin/articles/new"
                    className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg px-3 py-2 transition-colors shadow-sm"
                >
                    <PenSquare className="w-3.5 h-3.5" aria-hidden />
                    New Article
                </Link>

                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-navy bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg px-3 py-2 transition-colors"
                >
                    Live Site
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
                </a>
            </div>
        </header>
    )
}
