'use client'
import React from 'react'
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

interface SidebarLink {
    href: string
    icon: React.ElementType
    label: string
}

interface SidebarSection {
    label: string
    links: SidebarLink[]
}

const sections: SidebarSection[] = [
    {
        label: 'Content',
        links: [
            { href: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard'    },
            { href: '/admin/articles/new',   icon: PenSquare,       label: 'New Article'  },
            { href: '/admin/articles',       icon: FileText,        label: 'All Articles' },
        ],
    },
    {
        label: 'Subscribers',
        links: [
            { href: '/admin/subscribers',         icon: Users,     label: 'Subscribers'  },
            { href: '/admin/newsletter',           icon: Mail,      label: 'Newsletter'   },
            { href: '/admin/newsletter/history',   icon: ScrollText, label: 'Email History' },
        ],
    },
    {
        label: 'Analytics',
        links: [
            { href: '/admin/analytics',           icon: BarChart3,   label: 'Analytics'       },
            { href: '/admin/analytics/articles',  icon: LineChart,   label: 'Article Stats'   },
        ],
    },
    {
        label: 'Tools',
        links: [
            { href: '/admin/repo-rate',            icon: Landmark,     label: 'Repo Rate'   },
            { href: '/admin/calendar',             icon: Calendar,     label: 'Calendar'    },
            { href: '/admin/compliance',           icon: ClipboardList, label: 'Compliance' },
            { href: '/admin/compliance/suggestions', icon: Lightbulb,  label: 'Suggestions' },
        ],
    },
    {
        label: 'System',
        links: [
            { href: '/admin/settings', icon: Settings, label: 'Settings' },
        ],
    },
]

export default function Sidebar() {
    const pathname = usePathname()

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin/login'
    }

    const allLinks = sections.flatMap(section => section.links)

    return (
        <>
        <div className="shrink-0 border-b border-white/[0.06] bg-[#080f1e] lg:hidden">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
                <Link href="/admin/dashboard" className="block group min-w-0">
                    <h2 className="truncate font-heading text-base font-bold leading-tight">
                        <span className="text-white group-hover:text-white/90 transition-colors">CorpLawUpdates</span>
                        <span className="text-gold">.in</span>
                    </h2>
                    <p className="text-[9px] font-semibold text-slate-500 mt-0.5 tracking-[0.18em] uppercase">
                        Admin Console
                    </p>
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-red-950/40 hover:text-red-300"
                >
                    <LogOut className="h-3.5 w-3.5" aria-hidden />
                    Sign out
                </button>
            </div>
            <nav className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-3" aria-label="Admin navigation">
                {allLinks.map((link) => {
                    const active = pathname === link.href
                    const Icon = link.icon
                    return (
                        <Link
                            href={link.href}
                            key={link.href}
                            className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                                active
                                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>
        </div>

        <aside className="hidden w-[240px] h-screen bg-[#080f1e] flex-col shrink-0 border-r border-white/[0.06] lg:flex">
            {/* Logo */}
            <div className="px-5 py-5 shrink-0 border-b border-white/[0.06]">
                <Link href="/admin/dashboard" className="block group">
                    <h2 className="font-heading text-base font-bold leading-tight">
                        <span className="text-white group-hover:text-white/90 transition-colors">CorpLawUpdates</span>
                        <span className="text-gold">.in</span>
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1 tracking-[0.18em] uppercase">
                        Admin Console
                    </p>
                </Link>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4" aria-label="Admin navigation">
                {sections.map((section) => {
                    const hasActive = section.links.some(l => pathname === l.href)
                    return (
                        <div key={section.label}>
                            <p className={`px-3 mb-1 text-[9px] font-bold tracking-[0.2em] uppercase transition-colors ${
                                hasActive ? 'text-amber-500/80' : 'text-slate-600'
                            }`}>
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.links.map((link) => {
                                    const active = pathname === link.href
                                    const Icon = link.icon
                                    return (
                                        <Link
                                            href={link.href}
                                            key={link.href}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                                                active
                                                    ? 'bg-amber-400/10 text-amber-400 font-semibold border-l-2 border-amber-400 shadow-glow-gold-sm'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border-l-2 border-transparent'
                                            }`}
                                        >
                                            <Icon
                                                className={`w-[15px] h-[15px] shrink-0 ${active ? 'opacity-100' : 'opacity-60'}`}
                                                aria-hidden
                                            />
                                            {link.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </nav>

            {/* Sign out */}
            <div className="shrink-0 p-2.5 border-t border-white/[0.06]">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-all duration-150 group"
                >
                    <LogOut className="w-[15px] h-[15px] shrink-0 opacity-70 group-hover:opacity-100" aria-hidden />
                    Sign Out
                </button>
            </div>
        </aside>
        </>
    )
}
