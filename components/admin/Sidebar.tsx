'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    Calendar,
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
    Cpu,
    Brain,
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
            { href: '/admin/documents',      icon: ScrollText,      label: 'Documents'    },
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
            { href: '/admin/documents/analytics', icon: Cpu,         label: 'Doc AI Analytics'},
        ],
    },
    {
        label: 'Tools',
        links: [
            { href: '/admin/repo-rate',            icon: Landmark,     label: 'Repo Rate'   },
            { href: '/admin/rates',                icon: Settings,     label: 'Tool Rates & Waiver' },
            { href: '/admin/compliance',           icon: Calendar,     label: 'Compliance Calendar' },
            { href: '/admin/compliance/suggestions', icon: Lightbulb,  label: 'Suggestions' },
            { href: '/admin/rule-engine',          icon: Cpu,          label: 'Rule Engine' },
            { href: '/admin/rule-learning',        icon: Brain,        label: 'Rule Learning Queue' },
            { href: '/admin/roc',                  icon: ScrollText,   label: 'ROC Forms'   },
        ],
    },
    {
        label: 'System',
        links: [
            { href: '/admin/settings', icon: Settings, label: 'Settings' },
        ],
    },
]

function isLinkActive(linkHref: string, pathname: string): boolean {
    if (linkHref === '/admin/articles') {
        // Keep "All Articles" highlighted for edit pages but not for "/admin/articles/new"
        return pathname.startsWith('/admin/articles') && pathname !== '/admin/articles/new'
    }
    if (linkHref === '/admin/compliance') {
        // Keep "Compliance Calendar" highlighted for its details and suggestions if relevant
        return pathname.startsWith('/admin/compliance') && !pathname.includes('/suggestions')
    }
    return pathname === linkHref
}

export default function Sidebar() {
    const pathname = usePathname() || ''
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

        const focusableElements = drawer.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus()
                    e.preventDefault()
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus()
                    e.preventDefault()
                }
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setDrawerOpen(false)
            }
        }

        window.addEventListener('keydown', handleEscape)
        drawer.addEventListener('keydown', handleTab)

        return () => {
            document.body.style.overflow = prevOverflow
            window.removeEventListener('keydown', handleEscape)
            drawer.removeEventListener('keydown', handleTab)
        }
    }, [drawerOpen])

    useEffect(() => {
        if (!drawerOpen && menuButtonRef.current) {
            menuButtonRef.current.focus()
        }
    }, [drawerOpen])

    const closeDrawer = () => setDrawerOpen(false)

    /* ── Shared rendering helpers ─────────────────────── */

    const renderSections = (onLinkClick?: () => void) =>
        sections.map((section) => {
            const hasActive = section.links.some(l => isLinkActive(l.href, pathname))
            return (
                <div key={section.label}>
                    {/* Section divider with dot indicator */}
                    <div className="flex items-center gap-2 px-3 mb-2 mt-1">
                        <span
                            className={`h-1 w-1 rounded-full shrink-0 transition-colors duration-300 ${
                                hasActive ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'bg-slate-600'
                            }`}
                        />
                        <span
                            className={`h-px flex-1 transition-colors duration-300 ${
                                hasActive
                                    ? 'bg-gradient-to-r from-amber-500/30 to-transparent'
                                    : 'bg-gradient-to-r from-white/[0.06] to-transparent'
                            }`}
                        />
                    </div>
                    <p
                        className={`px-3 mb-1.5 text-[9px] font-bold tracking-[0.22em] uppercase transition-colors duration-300 ${
                            hasActive ? 'text-amber-400/90' : 'text-slate-500'
                        }`}
                    >
                        {section.label}
                    </p>
                    <div className="space-y-0.5">
                        {section.links.map(link => {
                            const active = isLinkActive(link.href, pathname)
                            const Icon = link.icon
                            return (
                                <Link
                                    href={link.href}
                                    key={link.href}
                                    onClick={onLinkClick}
                                    className={`group/link relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-all duration-200 ${
                                        onLinkClick ? 'min-h-[44px]' : ''
                                    } ${
                                        active
                                            ? 'bg-gradient-to-r from-amber-400/[0.12] via-amber-400/[0.06] to-transparent font-semibold text-amber-300 admin-glow-amber'
                                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
                                    }`}
                                >
                                    {/* Glowing left bar for active state */}
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[3px] rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6),0_0_16px_rgba(245,158,11,0.3)]" />
                                    )}
                                    <Icon
                                        className={`w-[14px] h-[14px] shrink-0 transition-all duration-200 ${
                                            active
                                                ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                                                : 'opacity-50 group-hover/link:opacity-100 group-hover/link:text-amber-300/70 group-hover/link:drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
                                        }`}
                                        aria-hidden
                                    />
                                    <span className="relative">
                                        {link.label}
                                        {active && (
                                            <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-amber-400/40 to-transparent" />
                                        )}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )
        })

    const renderUserArea = () => (
        <div className="flex items-center gap-3 px-3 py-3">
            {/* Gold gradient avatar */}
            <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                    <span className="text-sm font-bold text-[#0a1128] leading-none">A</span>
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a1128] bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/90 truncate">Admin</p>
                <p className="text-[10px] text-slate-500 truncate">Administrator</p>
            </div>
        </div>
    )

    const renderSignOut = (isMobile?: boolean) => (
        <button
            type="button"
            onClick={handleLogout}
            className={`group/signout w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-slate-500 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-950/50 hover:to-red-950/20 hover:text-red-400 ${
                isMobile ? 'min-h-[44px]' : ''
            }`}
        >
            <LogOut
                className="w-[15px] h-[15px] shrink-0 opacity-70 transition-all duration-300 group-hover/signout:opacity-100 group-hover/signout:rotate-[-12deg]"
                aria-hidden
            />
            Sign Out
        </button>
    )

    return (
        <>
        {/* ── Mobile Header ─────────────────────────────── */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-gradient-to-r from-[#0a1128] via-[#080f1e] to-[#0a1128] px-4 lg:hidden shrink-0">
            <Link href="/admin/dashboard" className="block group">
                <h2 className="font-heading text-sm font-bold admin-gradient-text transition-transform duration-300 group-hover:translate-x-0.5">
                    CorpLawUpdates<span className="text-gold">.in</span>
                </h2>
            </Link>
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="block group">
                    <p className="text-[9px] font-semibold text-slate-400 tracking-[0.18em] group-hover:tracking-[0.22em] uppercase transition-all duration-300">
                        Admin Console
                    </p>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 text-slate-200 hover:bg-white/[0.08] transition-colors"
                        aria-expanded={drawerOpen}
                        aria-controls="admin-mobile-drawer"
                        aria-label="Open admin menu"
                    >
                        <Menu className="h-5 w-5" aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="group/mso inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-950/50 hover:to-red-950/20 hover:text-red-300 hover:border-red-500/20"
                    >
                        <LogOut className="h-3.5 w-3.5 transition-transform duration-300 group-hover/mso:rotate-[-12deg]" aria-hidden />
                        Sign out
                    </button>
                </div>
            </div>
        </div>

        {/* ── Mobile Drawer ─────────────────────────────── */}
        {drawerOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
                <button
                    type="button"
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    aria-label="Close menu"
                    onClick={closeDrawer}
                />
                <div
                    id="admin-mobile-drawer"
                    ref={drawerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Admin navigation"
                    className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col border-r border-white/[0.08] bg-gradient-to-b from-[#0a1128] via-[#080f1e] to-[#060b18] shadow-2xl shadow-black/50"
                >
                    {/* Subtle top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                    {/* Drawer header */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-4">
                        <span className="font-heading text-sm font-bold admin-gradient-text">Menu</span>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </button>
                    </div>

                    {/* Nav links */}
                    <nav className="admin-sidebar-scroll flex-1 space-y-3 overflow-y-auto px-2 py-4" aria-label="Admin navigation">
                        {renderSections(closeDrawer)}
                    </nav>

                    {/* User area + sign out */}
                    <div className="shrink-0 border-t border-white/[0.06]">
                        {renderUserArea()}
                        <div className="px-2 pb-2">
                            {renderSignOut(true)}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── Desktop Sidebar ───────────────────────────── */}
        <aside className="hidden w-[240px] h-screen flex-col shrink-0 border-r border-white/[0.06] bg-gradient-to-b from-[#0a1128] via-[#080f1e] to-[#060b18] lg:flex relative">
            {/* Subtle top highlight border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            {/* Subtle right edge glow */}
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-amber-500/5 via-white/[0.04] to-transparent" />

            {/* Logo with glowing gold ring */}
            <div className="px-5 py-5 shrink-0 border-b border-white/[0.06] bg-gradient-to-br from-slate-950/60 to-transparent relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-amber-500/[0.04] blur-2xl" />
                <Link href="/admin/dashboard" className="block group relative z-10">
                    <div className="flex items-center gap-3">
                        {/* Glowing gold ring logo mark */}
                        <div className="relative shrink-0">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/20 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.12)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-shadow duration-500">
                                <span className="text-sm font-bold text-amber-400/90">C</span>
                            </div>
                            {/* Ring glow effect */}
                            <div className="absolute inset-0 rounded-lg border border-amber-400/10 animate-pulse" style={{ animationDuration: '3s' }} />
                        </div>
                        <div>
                            <h2 className="font-heading text-[15px] font-bold leading-tight tracking-tight transition-transform duration-300 group-hover:translate-x-0.5">
                                <span className="admin-gradient-text">CorpLaw</span>
                                <span className="text-white/80">Updates</span>
                                <span className="text-gold group-hover:text-amber-300 transition-colors">.in</span>
                            </h2>
                            <p className="text-[8px] font-semibold text-slate-500 mt-1 tracking-[0.2em] group-hover:tracking-[0.24em] uppercase transition-all duration-300">
                                Admin Console
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Nav sections */}
            <nav className="admin-sidebar-scroll flex-1 overflow-y-auto py-3 px-2 space-y-3" aria-label="Admin navigation">
                {renderSections()}
            </nav>

            {/* User area + Sign out */}
            <div className="shrink-0 border-t border-white/[0.06] bg-gradient-to-t from-[#050a15] to-transparent">
                {renderUserArea()}
                <div className="px-2 pb-2.5">
                    {renderSignOut()}
                </div>
            </div>
        </aside>
        </>
    )
}
