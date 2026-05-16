'use client'
import React, { useState, useEffect, useRef } from 'react'
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
    Menu,
    PenSquare,
    ScrollText,
    Settings,
    Users,
    X,
    BookOpen,
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
            { href: '/admin/glossary',       icon: BookOpen,        label: 'Glossary'     },
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
    const [drawerOpen, setDrawerOpen] = useState(false)
    const drawerRef = useRef<HTMLDivElement>(null)
    const menuButtonRef = useRef<HTMLButtonElement>(null)

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin/login'
    }

    useEffect(() => {
        if (!drawerOpen) return
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const drawer = drawerRef.current
        if (!drawer) {
            return () => {
                document.body.style.overflow = prevOverflow
            }
        }

        const focusables = drawer.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled])'
        )
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        window.setTimeout(() => first?.focus(), 0)

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault()
                setDrawerOpen(false)
                menuButtonRef.current?.focus()
                return
            }
            if (e.key !== 'Tab' || focusables.length === 0) return
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault()
                    last?.focus()
                }
            } else if (document.activeElement === last) {
                e.preventDefault()
                first?.focus()
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = prevOverflow
        }
    }, [drawerOpen])

    const closeDrawer = () => {
        setDrawerOpen(false)
        menuButtonRef.current?.focus()
    }

    return (
        <>
        <div className="shrink-0 border-b border-white/[0.06] bg-[#080f1e] lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
                <Link href="/admin/dashboard" className="block group min-w-0">
                    <h2 className="truncate font-heading text-base font-bold leading-tight">
                        <span className="text-white group-hover:text-white/90 transition-colors">CorpLawUpdates</span>
                        <span className="text-gold">.in</span>
                    </h2>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5 tracking-[0.18em] uppercase">
                        Admin Console
                    </p>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 text-slate-200 hover:bg-white/[0.08]"
                        aria-expanded={drawerOpen}
                        aria-controls="admin-mobile-drawer"
                        aria-label="Open admin menu"
                    >
                        <Menu className="h-5 w-5" aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-red-950/40 hover:text-red-300"
                    >
                        <LogOut className="h-3.5 w-3.5" aria-hidden />
                        Sign out
                    </button>
                </div>
            </div>
        </div>

        {drawerOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
                <button
                    type="button"
                    className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
                    aria-label="Close menu"
                    onClick={closeDrawer}
                />
                <div
                    id="admin-mobile-drawer"
                    ref={drawerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Admin navigation"
                    className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col border-r border-white/[0.08] bg-[#080f1e] shadow-admin"
                >
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-4">
                        <span className="font-heading text-sm font-bold text-white">Menu</span>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4" aria-label="Admin navigation">
                        {sections.map(section => {
                            const hasActive = section.links.some(l => pathname === l.href)
                            return (
                                <div key={section.label}>
                                    <p
                                        className={`px-3 mb-1 text-[9px] font-bold tracking-[0.2em] uppercase ${
                                            hasActive ? 'text-amber-500/90' : 'text-slate-400'
                                        }`}
                                    >
                                        {section.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {section.links.map(link => {
                                            const active = pathname === link.href
                                            const Icon = link.icon
                                            return (
                                                <Link
                                                    href={link.href}
                                                    key={link.href}
                                                    onClick={closeDrawer}
                                                    className={`flex min-h-[44px] items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-[13px] transition-all duration-150 ${
                                                        active
                                                            ? 'border-amber-400 bg-amber-400/10 font-semibold text-amber-400 shadow-glow-gold-sm'
                                                            : 'border-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white'
                                                    }`}
                                                >
                                                    <Icon
                                                        className={`h-[15px] w-[15px] shrink-0 ${active ? 'opacity-100' : 'opacity-60'}`}
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
                    <div className="border-t border-white/[0.06] p-2">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-slate-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
                        >
                            <LogOut className="h-[15px] w-[15px] shrink-0 opacity-70" aria-hidden />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        )}

        <aside className="hidden w-[240px] h-screen bg-[#080f1e] flex-col shrink-0 border-r border-white/[0.06] lg:flex">
            {/* Logo */}
            <div className="px-5 py-5 shrink-0 border-b border-white/[0.06]">
                <Link href="/admin/dashboard" className="block group">
                    <h2 className="font-heading text-base font-bold leading-tight">
                        <span className="text-white group-hover:text-white/90 transition-colors">CorpLawUpdates</span>
                        <span className="text-gold">.in</span>
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 tracking-[0.18em] uppercase">
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
                                hasActive ? 'text-amber-500/90' : 'text-slate-400'
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
