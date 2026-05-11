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

const sections = [
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
] as const

export default function Sidebar() {
    const pathname = usePathname()

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin/login'
    }

    return (
        <aside className="w-[240px] h-screen bg-[#080f1e] flex flex-col shrink-0 border-r border-white/[0.06]">
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
    )
}
