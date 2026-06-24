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
            { href: '/admin/analytics/tools',     icon: BarChart3,   label: 'Tool Usage'      },
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
        return pathname.startsWith('/admin/articles') && pathname !== '/admin/articles/new'
    }
    if (linkHref === '/admin/compliance') {
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

    const renderSections = (onLinkClick?: () => void) =>
        sections.map((section) => {
            const hasActive = section.links.some(l => isLinkActive(l.href, pathname))
            return (
                <div key={section.label} className="mb-4">
                    <p className="px-4 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                        {section.label}
                    </p>
                    <div className="space-y-1">
                        {section.links.map(link => {
                            const active = isLinkActive(link.href, pathname)
                            const Icon = link.icon
                            return (
                                <Link
                                    href={link.href}
                                    key={link.href}
                                    onClick={onLinkClick}
                                    className={`group flex items-center gap-3 rounded-md px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                                        onLinkClick ? 'min-h-[44px]' : ''
                                    } ${
                                        active
                                            ? 'bg-gradient-to-r from-amber-400/20 to-orange-400/5 text-amber-700 font-bold relative'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {active && (
                                        <span className="absolute left-0 top-0 bottom-0 w-[4px] rounded-r bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    )}
                                    <Icon
                                        className={`w-4 h-4 shrink-0 transition-colors ${
                                            active
                                                ? 'text-amber-500'
                                                : 'text-slate-400 group-hover:text-slate-600'
                                        }`}
                                        aria-hidden
                                    />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )
        })

    const renderUserArea = () => (
        <div className="flex items-center gap-3 px-4 py-4">
            <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700 leading-none">A</span>
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">Admin</p>
                <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
        </div>
    )

    const renderSignOut = (isMobile?: boolean) => (
        <button
            type="button"
            onClick={handleLogout}
            className={`group w-full flex items-center gap-3 rounded-md px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 ${
                isMobile ? 'min-h-[44px]' : ''
            }`}
        >
            <LogOut
                className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors"
                aria-hidden
            />
            Sign Out
        </button>
    )

    return (
        <>
        {/* ── Mobile Header ─────────────────────────────── */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 admin-sidebar-glass px-4 lg:hidden shrink-0">
            <Link href="/admin/dashboard" className="block group">
                <h2 className="font-heading text-lg font-bold text-slate-900">
                    CorpLawUpdates<span className="text-amber-500">.in</span>
                </h2>
            </Link>
            <div className="flex items-center gap-2">
                <button
                    ref={menuButtonRef}
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    aria-expanded={drawerOpen}
                    aria-controls="admin-mobile-drawer"
                    aria-label="Open admin menu"
                >
                    <Menu className="h-5 w-5" aria-hidden />
                </button>
            </div>
        </div>

        {/* ── Mobile Drawer ─────────────────────────────── */}
        {drawerOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
                <button
                    type="button"
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    aria-label="Close menu"
                    onClick={closeDrawer}
                />
                <div
                    id="admin-mobile-drawer"
                    ref={drawerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Admin navigation"
                    className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-transparent shadow-2xl shadow-slate-200"
                >
                    <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
                        <span className="font-heading text-lg font-bold text-slate-900">Menu</span>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </button>
                    </div>

                    <nav className="admin-sidebar-scroll flex-1 overflow-y-auto py-4" aria-label="Admin navigation">
                        {renderSections(closeDrawer)}
                    </nav>

                    <div className="shrink-0 border-t border-slate-100">
                        {renderUserArea()}
                        <div className="px-2 pb-4">
                            {renderSignOut(true)}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── Desktop Sidebar ───────────────────────────── */}
        <aside className="hidden w-[260px] h-screen flex-col shrink-0 border-r border-slate-200 admin-sidebar-glass lg:flex relative">
            <div className="h-16 flex items-center px-6 shrink-0 border-b border-slate-100 bg-transparent">
                <Link href="/admin/dashboard" className="block group">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-600">C</span>
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold leading-tight text-slate-900">
                                CorpLaw<span className="text-amber-500">.in</span>
                            </h2>
                        </div>
                    </div>
                </Link>
            </div>

            <nav className="admin-sidebar-scroll flex-1 overflow-y-auto py-6" aria-label="Admin navigation">
                {renderSections()}
            </nav>

            <div className="shrink-0 border-t border-slate-100 bg-white/30 backdrop-blur-md">
                {renderUserArea()}
                <div className="px-2 pb-4">
                    {renderSignOut()}
                </div>
            </div>
        </aside>
        </>
    )
}
