'use client'
import { usePathname } from 'next/navigation'

export default function TopBar() {
    const pathname = usePathname()
    let title = 'Admin'

    if (pathname === '/admin/dashboard') title = 'Dashboard'
    if (pathname === '/admin/articles/new') title = 'New Article'
    if (pathname === '/admin/articles') title = 'All Articles'
    if (pathname === '/admin/subscribers') title = 'Subscribers'
    if (pathname === '/admin/newsletter') title = 'Newsletter'
    if (pathname === '/admin/settings') title = 'Settings'

    return (
        <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shrink-0">
            <h1 className="font-heading font-bold text-xl text-navy">{title}</h1>
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-navy transition-colors">
                View Live Site →
            </a>
        </div>
    )
}
