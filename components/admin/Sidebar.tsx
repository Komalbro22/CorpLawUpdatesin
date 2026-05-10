'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    Calendar,
    ClipboardList,
    FileText,
    Landmark,
    LayoutDashboard,
    Lightbulb,
    LineChart,
    LogOut,
    Mail,
    PenSquare,
    ScrollText,
    Settings,
    Users,
} from 'lucide-react'

const links = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/articles/new', icon: PenSquare, label: 'New article' },
    { href: '/admin/articles', icon: FileText, label: 'All articles' },
    { href: '/admin/subscribers', icon: Users, label: 'Subscribers' },
    { href: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { href: '/admin/newsletter/history', icon: ScrollText, label: 'Email history' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/analytics/articles', icon: LineChart, label: 'Article stats' },
    { href: '/admin/repo-rate', icon: Landmark, label: 'Repo rate' },
    { href: '/admin/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/admin/compliance', icon: ClipboardList, label: 'Compliance' },
    { href: '/admin/compliance/suggestions', icon: Lightbulb, label: 'Suggestions' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
] as const

export default function Sidebar() {
    const pathname = usePathname()

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin/login'
    }

    return (
        <aside className="w-[260px] h-screen bg-[#0c1222] flex flex-col shrink-0 border-r border-slate-800/80">
            <div className="px-5 py-5 shrink-0 border-b border-white/5">
                <h2 className="font-heading text-lg font-bold leading-tight">
                    <span className="text-white">CorpLawUpdates</span>
                    <span className="text-gold">.in</span>
                </h2>
                <p className="text-[11px] font-medium text-slate-500 mt-1.5 tracking-wide uppercase">
                    Admin console
                </p>
            </div>

            <nav className="flex-1 overflow-y-auto flex flex-col gap-0.5 py-3 px-2" aria-label="Admin">
                {links.map((link) => {
                    const active = pathname === link.href
                    const Icon = link.icon
                    return (
                        <Link
                            href={link.href}
                            key={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                active
                                    ? 'bg-white/[0.08] text-gold font-medium border-l-2 border-gold -ml-0.5 pl-[calc(0.75rem-2px)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent'
                            }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${active ? 'opacity-100' : 'opacity-70'}`} aria-hidden />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="shrink-0 p-2 border-t border-white/5">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4 shrink-0" aria-hidden />
                    Sign out
                </button>
            </div>
        </aside>
    )
}
