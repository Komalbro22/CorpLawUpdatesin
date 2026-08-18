'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    Bell,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    Landmark,
    LayoutDashboard,
    Lightbulb,
    LineChart,
    LogOut,
    Mail,
    Menu,
    PenSquare,
    Radio,
    ScrollText,
    Settings,
    Users,
    X,
    BookOpen,
    Cpu,
    Brain,
    Briefcase,
    Building2,
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
            { href: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard'       },
            { href: '/admin/radar',          icon: Radio,           label: 'Regulator Radar' },
            { href: '/admin/articles/new',   icon: PenSquare,       label: 'New Article'     },
            { href: '/admin/articles',       icon: FileText,        label: 'All Articles'    },
            { href: '/admin/glossary',       icon: BookOpen,        label: 'Glossary'        },
            { href: '/admin/documents',      icon: ScrollText,      label: 'Documents'       },
        ],
    },
    {
        label: 'Subscribers & Community',
        links: [
            { href: '/admin/subscribers',         icon: Users,     label: 'Subscribers'      },
            { href: '/admin/partner-interests',   icon: Briefcase, label: 'Partner Interests' },
            { href: '/admin/notifications',       icon: Bell,      label: 'Push Broadcast'   },
            { href: '/admin/newsletter',           icon: Mail,      label: 'Newsletter'       },
            { href: '/admin/newsletter/history',   icon: ScrollText, label: 'Email History'  },
        ],
    },
    {
        label: 'Analytics',
        links: [
            { href: '/admin/analytics',           icon: BarChart3,   label: 'Analytics'        },
            { href: '/admin/analytics/articles',  icon: LineChart,   label: 'Article Stats'    },
            { href: '/admin/analytics/tools',     icon: BarChart3,   label: 'Tool Usage'       },
            { href: '/admin/documents/analytics', icon: Cpu,         label: 'Doc AI Analytics' },
        ],
    },
    {
        label: 'Tools & Compliance Data',
        links: [
            { href: '/admin/company-data',           icon: Building2, label: 'Company Data'        },
            { href: '/admin/repo-rate',              icon: Landmark,  label: 'Repo Rate'           },
            { href: '/admin/rates',                  icon: Settings,  label: 'Tool Rates & Waiver' },
            { href: '/admin/compliance',             icon: Calendar,  label: 'Compliance Calendar' },
            { href: '/admin/compliance/suggestions', icon: Lightbulb, label: 'Suggestions'         },
            { href: '/admin/rule-engine',            icon: Cpu,       label: 'Rule Engine'         },
            { href: '/admin/rule-learning',          icon: Brain,     label: 'Rule Learning Queue' },
            { href: '/admin/roc',                    icon: ScrollText, label: 'ROC Forms'          },
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
    if (linkHref === '/admin/newsletter') {
        return pathname.startsWith('/admin/newsletter') && !pathname.includes('/history')
    }
    if (linkHref === '/admin/analytics') {
        return pathname === '/admin/analytics'
    }
    if (linkHref === '/admin/documents') {
        return pathname.startsWith('/admin/documents') && !pathname.includes('/analytics')
    }
    return pathname === linkHref || pathname.startsWith(linkHref + '/')
}

export default function Sidebar() {
    const pathname = usePathname() || ''
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const drawerRef = useRef<HTMLDivElement>(null)
    const menuButtonRef = useRef<HTMLButtonElement>(null)

    // Persist collapse state
    useEffect(() => {
        const stored = localStorage.getItem('admin-sidebar-collapsed')
        if (stored === 'true') setCollapsed(true)
    }, [])

    const toggleCollapse = () => {
        setCollapsed(prev => {
            const next = !prev
            localStorage.setItem('admin-sidebar-collapsed', String(next))
            return next
        })
    }

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin/login'
    }

    // Mobile drawer focus trap + keyboard handling
    useEffect(() => {
        if (!drawerOpen) return
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const drawer = drawerRef.current
        if (!drawer) {
            return () => { document.body.style.overflow = prevOverflow }
        }

        const focusableElements = drawer.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return
            if (e.shiftKey) {
                if (document.activeElement === firstElement) { lastElement?.focus(); e.preventDefault() }
            } else {
                if (document.activeElement === lastElement) { firstElement?.focus(); e.preventDefault() }
            }
        }
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }

        window.addEventListener('keydown', handleEscape)
        drawer.addEventListener('keydown', handleTab)
        return () => {
            document.body.style.overflow = prevOverflow
            window.removeEventListener('keydown', handleEscape)
            drawer.removeEventListener('keydown', handleTab)
        }
    }, [drawerOpen])

    useEffect(() => {
        if (!drawerOpen && menuButtonRef.current) menuButtonRef.current.focus()
    }, [drawerOpen])

    const closeDrawer = () => setDrawerOpen(false)

    /* ── Section / Link rendering ─────────────────────────── */
    const renderSections = (opts: { onLinkClick?: () => void; iconOnly?: boolean }) => {
        const { onLinkClick, iconOnly = false } = opts
        return sections.map((section) => {
            const hasActive = section.links.some(l => isLinkActive(l.href, pathname))
            return (
                <div key={section.label} className={iconOnly ? 'mb-3' : 'mb-4'}>
                    {!iconOnly && (
                        <p className={`px-4 mb-2 text-[10px] font-extrabold tracking-widest uppercase transition-colors ${
                            hasActive ? 'admin-section-label-active' : 'admin-section-label-inactive'
                        }`}>
                            {section.label}
                        </p>
                    )}
                    {iconOnly && (
                        <div className="h-px bg-slate-100 mx-3 mb-2" />
                    )}
                    <div className="space-y-0.5">
                        {section.links.map(link => {
                            const active = isLinkActive(link.href, pathname)
                            const Icon = link.icon
                            if (iconOnly) {
                                return (
                                    <div key={link.href} className="admin-nav-tooltip px-2">
                                        <Link
                                            href={link.href}
                                            onClick={onLinkClick}
                                            aria-label={link.label}
                                            className={`relative flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition-all duration-200 ${
                                                active
                                                    ? 'bg-amber-50 text-amber-600 shadow-sm border border-amber-100'
                                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                                            }`}
                                        >
                                            {active && (
                                                <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-gradient-to-b from-amber-400 to-orange-500" />
                                            )}
                                            <Icon className="w-4.5 h-4.5" aria-hidden />
                                        </Link>
                                        <span className="admin-tooltip-label">{link.label}</span>
                                    </div>
                                )
                            }
                            return (
                                <Link
                                    href={link.href}
                                    key={link.href}
                                    onClick={onLinkClick}
                                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                                        onLinkClick ? 'min-h-[44px]' : ''
                                    } ${
                                        active
                                            ? 'bg-gradient-to-r from-amber-50 to-orange-50/40 text-amber-700 font-bold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {active && (
                                        <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    )}
                                    <Icon
                                        className={`w-4 h-4 shrink-0 transition-colors ${
                                            active ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600'
                                        }`}
                                        aria-hidden
                                    />
                                    <span className="truncate">{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )
        })
    }

    const renderUserArea = (iconOnly = false) => (
        <div className={`flex items-center gap-3 px-4 py-4 ${iconOnly ? 'justify-center px-2' : ''}`}>
            <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold text-amber-700 leading-none">A</span>
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
            </div>
            {!iconOnly && (
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">Admin</p>
                    <p className="text-xs text-slate-400 truncate">Administrator</p>
                </div>
            )}
        </div>
    )

    const renderSignOut = (opts: { isMobile?: boolean; iconOnly?: boolean } = {}) => {
        const { isMobile, iconOnly } = opts
        if (iconOnly) {
            return (
                <div className="admin-nav-tooltip px-2 pb-2">
                    <button
                        type="button"
                        onClick={handleLogout}
                        aria-label="Sign Out"
                        className="flex items-center justify-center w-10 h-10 rounded-xl mx-auto text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" aria-hidden />
                    </button>
                    <span className="admin-tooltip-label">Sign Out</span>
                </div>
            )
        }
        return (
            <button
                type="button"
                onClick={handleLogout}
                className={`group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 ${
                    isMobile ? 'min-h-[44px]' : ''
                }`}
            >
                <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" aria-hidden />
                Sign Out
            </button>
        )
    }

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
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
                    className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-200 border-r border-slate-100"
                >
                    <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                                <span className="text-xs font-bold text-amber-600">C</span>
                            </div>
                            <span className="font-heading text-base font-bold text-slate-900">Menu</span>
                        </div>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </button>
                    </div>

                    <nav className="admin-sidebar-scroll flex-1 overflow-y-auto py-4 px-2" aria-label="Admin navigation">
                        {renderSections({ onLinkClick: closeDrawer })}
                    </nav>

                    <div className="shrink-0 border-t border-slate-100">
                        {renderUserArea()}
                        <div className="px-2 pb-4">
                            {renderSignOut({ isMobile: true })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── Desktop Sidebar ───────────────────────────── */}
        <aside
            className={`hidden lg:flex flex-col h-screen shrink-0 border-r border-slate-200/80 admin-sidebar-glass admin-sidebar-collapsible relative ${
                collapsed ? 'w-[64px]' : 'w-[260px]'
            }`}
            style={{ overflow: 'visible' }}
        >
            {/* Logo / Brand */}
            <div className="h-16 flex items-center px-4 shrink-0 border-b border-slate-100/80 bg-transparent overflow-hidden">
                <Link href="/admin/dashboard" className="block group flex-1 min-w-0">
                    {collapsed ? (
                        <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
                            <span className="text-sm font-bold text-amber-600">C</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-amber-600">C</span>
                            </div>
                            <div>
                                <h2 className="font-heading text-base font-bold leading-tight text-slate-900">
                                    CorpLaw<span className="text-amber-500">.in</span>
                                </h2>
                                <p className="text-[10px] text-slate-400 font-medium leading-tight">Admin Panel</p>
                            </div>
                        </div>
                    )}
                </Link>
            </div>

            {/* Collapse toggle button */}
            <button
                type="button"
                onClick={toggleCollapse}
                className="admin-collapse-btn"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed
                    ? <ChevronRight className="w-3 h-3 text-slate-500" aria-hidden />
                    : <ChevronLeft className="w-3 h-3 text-slate-500" aria-hidden />
                }
            </button>

            {/* Nav */}
            <nav
                className="admin-sidebar-scroll flex-1 overflow-y-auto py-5 overflow-x-hidden"
                style={{ overflowX: collapsed ? 'visible' : 'hidden' }}
                aria-label="Admin navigation"
            >
                {collapsed
                    ? <div className="space-y-1">{renderSections({ iconOnly: true })}</div>
                    : <div className="px-2">{renderSections({})}</div>
                }
            </nav>

            {/* Pinned quick-action (only when expanded) */}
            {!collapsed && (
                <div className="px-3 py-2 border-t border-slate-100">
                    <Link href="/admin/articles/new" className="admin-pinned-action">
                        <PenSquare className="w-4 h-4 shrink-0" aria-hidden />
                        <span>New Article</span>
                        <span className="ml-auto admin-kbd">⌘N</span>
                    </Link>
                </div>
            )}

            {/* User + Sign Out */}
            <div className="shrink-0 border-t border-slate-100 bg-white/30 backdrop-blur-md">
                {renderUserArea(collapsed)}
                <div className={collapsed ? 'pb-3' : 'px-2 pb-3'}>
                    {renderSignOut({ iconOnly: collapsed })}
                </div>
                {!collapsed && (
                    <p className="text-center text-[10px] text-slate-300 pb-2 font-mono tracking-wider">
                        v2.1 · CorpLaw Admin
                    </p>
                )}
            </div>
        </aside>
        </>
    )
}
