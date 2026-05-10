'use client'

import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

function titleForPath(pathname: string): string {
    if (pathname === '/admin/dashboard') return 'Dashboard'
    if (pathname === '/admin/articles/new') return 'New article'
    if (pathname === '/admin/articles') return 'All articles'
    if (pathname.startsWith('/admin/articles/') && pathname.endsWith('/edit')) return 'Edit article'
    if (pathname === '/admin/subscribers') return 'Subscribers'
    if (pathname === '/admin/newsletter') return 'Newsletter'
    if (pathname === '/admin/newsletter/history') return 'Email history'
    if (pathname.startsWith('/admin/newsletter/history/')) return 'Campaign detail'
    if (pathname === '/admin/analytics') return 'Analytics'
    if (pathname === '/admin/analytics/articles') return 'Article statistics'
    if (pathname === '/admin/repo-rate') return 'Repo rate'
    if (pathname === '/admin/calendar') return 'Compliance calendar'
    if (pathname === '/admin/compliance') return 'Compliance'
    if (pathname === '/admin/compliance/suggestions') return 'Compliance suggestions'
    if (pathname === '/admin/settings') return 'Settings'
    if (pathname === '/admin') return 'Admin'
    return 'Admin'
}

export default function TopBar() {
    const pathname = usePathname()
    const title = titleForPath(pathname)

    return (
        <header className="h-16 bg-white border-b border-slate-200/90 flex justify-between items-center px-6 shrink-0 shadow-sm shadow-slate-900/[0.03]">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                    Administration
                </p>
                <h1 className="font-heading font-bold text-lg text-navy leading-tight">{title}</h1>
            </div>
            <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-lg px-3 py-2 transition-colors"
            >
                View live site
                <ExternalLink className="w-4 h-4 opacity-70" aria-hidden />
            </a>
        </header>
    )
}
