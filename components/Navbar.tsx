'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import DarkModeToggle from './DarkModeToggle'
import NotificationBell from './NotificationBell'
import {
    Building2,
    Calendar,
    ChevronDown,
    FileText,
    Gavel,
    Globe2,
    Landmark,
    Menu,
    Scale,
    ShieldCheck,
    TrendingUp,
    Users,
    Wrench,
    X,
    Bookmark,
    BookOpen,
    Search,
    Receipt,
    Newspaper,
    ArrowRight,
    Mail,
} from 'lucide-react'

const GlobalSearch = dynamic(() => import('./GlobalSearch'), {
    ssr: false,
    loading: () => (
        <button
            aria-label="Open search"
            className="flex min-h-[44px] items-center gap-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/90 rounded-xl px-3 py-1.5 opacity-80"
        >
            <svg className="size-3.5 text-slate-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden lg:block text-slate-600 dark:text-slate-300 font-medium">Search...</span>
        </button>
    )
})

/* ─── 10 Regulatory Categories (All Active Areas) ─── */
const regulatorGroups = {
    corporate: [
        { href: '/category/mca', label: 'MCA & Companies Act', sub: 'ROC circulars, LLP Act & rules', Icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'hover:bg-blue-50/70 dark:hover:bg-blue-950/30' },
        { href: '/category/sebi', label: 'SEBI Regulations', sub: 'LODR, ICDR, takeovers & circulars', Icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30' },
        { href: '/category/rbi', label: 'RBI Directives', sub: 'Master directions & monetary policy', Icon: Landmark, color: 'text-violet-600 dark:text-violet-400', bg: 'hover:bg-violet-50/70 dark:hover:bg-violet-950/30' },
        { href: '/category/fema', label: 'FEMA & Foreign Trade', sub: 'FDI, ODI, ECB & cross-border', Icon: Globe2, color: 'text-teal-600 dark:text-teal-400', bg: 'hover:bg-teal-50/70 dark:hover:bg-teal-950/30' },
        { href: '/category/ifsca', label: 'IFSCA & GIFT City', sub: 'FMEs, bullion & IFSC compliance', Icon: Landmark, color: 'text-cyan-600 dark:text-cyan-400', bg: 'hover:bg-cyan-50/70 dark:hover:bg-cyan-950/30' },
    ],
    tribunals: [
        { href: '/category/nclt', label: 'NCLT Orders', sub: 'Company petitions & appeals', Icon: Scale, color: 'text-orange-600 dark:text-orange-400', bg: 'hover:bg-orange-50/70 dark:hover:bg-orange-950/30' },
        { href: '/category/ibc', label: 'IBC Insolvency', sub: 'CIRP, liquidation & IBBI rules', Icon: Gavel, color: 'text-red-600 dark:text-red-400', bg: 'hover:bg-red-50/70 dark:hover:bg-red-950/30' },
        { href: '/category/cci', label: 'CCI Orders', sub: 'Antitrust & merger combinations', Icon: ShieldCheck, color: 'text-indigo-600 dark:text-indigo-400', bg: 'hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30' },
        { href: '/category/labour', label: 'Labour Law Updates', sub: '4 Labour Codes, EPFO & ESIC', Icon: Users, color: 'text-amber-600 dark:text-amber-400', bg: 'hover:bg-amber-50/70 dark:hover:bg-amber-950/30' },
        { href: '/category/taxation', label: 'Taxation Updates', sub: 'CBDT income tax & CBIC GST/customs', Icon: Receipt, color: 'text-rose-600 dark:text-rose-400', bg: 'hover:bg-rose-50/70 dark:hover:bg-rose-950/30' },
    ],
}

/* ─── Compliance Tools & Trackers ─── */
const toolGroups = {
    calculators: [
        { href: '/tools/fee-calculator', label: 'MCA Fee Calculators', sub: 'AOC-4, MGT-7, PAS-3, SH-7 & more', Icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'hover:bg-amber-50/70 dark:hover:bg-amber-950/30' },
        { href: '/tools/cin-decoder', label: 'CIN Decoder & Data', sub: 'Verify ROC master data & state', Icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'hover:bg-blue-50/70 dark:hover:bg-blue-950/30' },
        { href: '/glossary', label: 'Corporate Legal Glossary', sub: 'A–Z statutory definitions & terms', Icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30' },
    ],
    trackers: [
        { href: '/calendar', label: 'Compliance Calendar', sub: 'Track statutory filing deadlines', Icon: Calendar, color: 'text-cyan-600 dark:text-cyan-400', bg: 'hover:bg-cyan-50/70 dark:hover:bg-cyan-950/30' },
        { href: '/rbi/repo-rate', label: 'RBI Repo Rate Tracker', sub: 'Current: 5.50% benchmark rate', Icon: TrendingUp, color: 'text-violet-600 dark:text-violet-400', bg: 'hover:bg-violet-50/70 dark:hover:bg-violet-950/30' },
        { href: '/company-search', label: 'Company Search', sub: 'Entity master data & search', Icon: Search, color: 'text-indigo-600 dark:text-indigo-400', bg: 'hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30' },
    ],
}

const allRegulators = [...regulatorGroups.corporate, ...regulatorGroups.tribunals]
const allTools = [...toolGroups.calculators, ...toolGroups.trackers]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [regulatorsOpen, setRegulatorsOpen] = useState(false)
    const [toolsOpen, setToolsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const regulatorsRef = useRef<HTMLDivElement>(null)
    const toolsRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    /* Scroll-compact effect */
    useEffect(() => {
        function onScroll() { setScrolled(window.scrollY > 40) }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    /* Close dropdowns on outside click */
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node
            if (regulatorsRef.current && !regulatorsRef.current.contains(target)) {
                setRegulatorsOpen(false)
            }
            if (toolsRef.current && !toolsRef.current.contains(target)) {
                setToolsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    /* Prevent background scrolling when mobile drawer is open */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    /* Close on Escape key */
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setRegulatorsOpen(false)
                setToolsOpen(false)
                setIsOpen(false)
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/'
        return pathname === path || pathname.startsWith(path + '/')
    }

    const isRegulatorsActive = allRegulators.some(item => isActive(item.href))
    const isToolsActive = allTools.some(item => isActive(item.href)) || isActive('/tools')

    const navBg = scrolled
        ? 'bg-white/95 dark:bg-slate-900/95 shadow-nav backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80'
        : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80'

    return (
        <nav className={`sticky top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-200 ease-in-out ${navBg}`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo (Serves as primary Home link) */}
                    <Link
                        href="/"
                        className="shrink-0 flex items-center gap-2 sm:gap-3 group focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-md p-1"
                        aria-label="CorpLawUpdates.in Home"
                    >
                        <span className="block w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs ring-1 ring-amber-500/20 group-hover:ring-amber-500/50 transition-all shrink-0 bg-slate-900">
                            <Image
                                src="/icon-192.png"
                                alt="CorpLawUpdates Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                priority
                            />
                        </span>
                        <span className="flex flex-col justify-center">
                            <span className="font-heading text-lg sm:text-xl font-bold navbar-logo-text leading-tight transition-colors duration-200 text-navy dark:text-white">
                                CorpLawUpdates<span className="text-amber-700 dark:text-gold group-hover:text-amber-600 transition-colors">.in</span>
                            </span>
                            <span className="hidden sm:block text-[10px] font-semibold tracking-[0.18em] uppercase mt-0.5 transition-colors duration-200 text-slate-500 dark:text-slate-400">
                                Corporate Law Intelligence
                            </span>
                        </span>
                    </Link>

                    {/* ─── Desktop Nav (≥ 1024px) ─── */}
                    <div className="hidden lg:flex lg:items-center lg:gap-1">
                        {/* Updates */}
                        <Link
                            href="/updates"
                            className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                                isActive('/updates')
                                    ? 'text-amber-700 dark:text-amber-400 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Newspaper className="size-4 shrink-0 opacity-80" aria-hidden="true" />
                            Updates
                            {isActive('/updates') && (
                                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                            )}
                        </Link>

                        {/* Documents */}
                        <Link
                            href="/documents"
                            className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                                isActive('/documents')
                                    ? 'text-amber-700 dark:text-amber-400 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                            }`}
                        >
                            <FileText className="size-4 shrink-0 opacity-80" aria-hidden="true" />
                            Documents
                            {isActive('/documents') && (
                                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                            )}
                        </Link>

                        {/* Tools ▾ Dropdown */}
                        <div ref={toolsRef} className="relative">
                            <button
                                onClick={() => {
                                    setToolsOpen(prev => !prev)
                                    setRegulatorsOpen(false)
                                }}
                                aria-expanded={toolsOpen}
                                aria-haspopup="true"
                                aria-label="Open compliance tools menu"
                                className={`relative flex items-center gap-1 text-sm font-medium transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-md px-3 py-2 ${
                                    isToolsActive
                                        ? 'text-amber-700 dark:text-amber-400 font-semibold'
                                        : 'text-slate-700 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Wrench className="size-4 shrink-0 opacity-80" aria-hidden="true" />
                                Tools
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                                {isToolsActive && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                                )}
                            </button>

                            {toolsOpen && (
                                <div
                                    role="menu"
                                    aria-label="Compliance tools"
                                    className="absolute top-full left-0 mt-2 w-[520px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 z-50 animate-fade-in"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="px-2 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Calculators &amp; Decoders
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {toolGroups.calculators.map(({ href, label, sub, Icon, color, bg }) => (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        role="menuitem"
                                                        onClick={() => setToolsOpen(false)}
                                                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-150 ${bg}`}
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 shrink-0 mt-0.5">
                                                            <Icon className={`size-4 ${color}`} aria-hidden="true" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-navy dark:text-slate-100">{label}</span>
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{sub}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="px-2 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Market &amp; Regulatory Trackers
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {toolGroups.trackers.map(({ href, label, sub, Icon, color, bg }) => (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        role="menuitem"
                                                        onClick={() => setToolsOpen(false)}
                                                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-150 ${bg}`}
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 shrink-0 mt-0.5">
                                                            <Icon className={`size-4 ${color}`} aria-hidden="true" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-navy dark:text-slate-100">{label}</span>
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{sub}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 text-xs">
                                        <span className="text-slate-500 dark:text-slate-400">All tools are free for compliance professionals</span>
                                        <Link
                                            href="/tools"
                                            onClick={() => setToolsOpen(false)}
                                            className="font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                                        >
                                            Explore all tools <ArrowRight className="size-3" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Regulators ▾ Dropdown */}
                        <div ref={regulatorsRef} className="relative">
                            <button
                                onClick={() => {
                                    setRegulatorsOpen(prev => !prev)
                                    setToolsOpen(false)
                                }}
                                aria-expanded={regulatorsOpen}
                                aria-haspopup="true"
                                aria-label="Browse regulatory categories"
                                className={`relative flex items-center gap-1 text-sm font-medium transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-md px-3 py-2 ${
                                    isRegulatorsActive
                                        ? 'text-amber-700 dark:text-amber-400 font-semibold'
                                        : 'text-slate-700 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Building2 className="size-4 shrink-0 opacity-80" aria-hidden="true" />
                                Regulators
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${regulatorsOpen ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                                {isRegulatorsActive && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                                )}
                            </button>

                            {regulatorsOpen && (
                                <div
                                    role="menu"
                                    aria-label="Regulatory bodies"
                                    className="absolute top-full left-0 mt-2 w-[580px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 z-50 animate-fade-in"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="px-2 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Corporate, Capital &amp; Monetary
                                                </span>
                                            </div>
                                            <div className="space-y-0.5">
                                                {regulatorGroups.corporate.map(({ href, label, sub, Icon, color, bg }) => (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        role="menuitem"
                                                        onClick={() => setRegulatorsOpen(false)}
                                                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-150 ${bg}`}
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 shrink-0 mt-0.5">
                                                            <Icon className={`size-4 ${color}`} aria-hidden="true" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-navy dark:text-slate-100">{label}</span>
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{sub}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="px-2 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Tribunals, Trade &amp; Taxation
                                                </span>
                                            </div>
                                            <div className="space-y-0.5">
                                                {regulatorGroups.tribunals.map(({ href, label, sub, Icon, color, bg }) => (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        role="menuitem"
                                                        onClick={() => setRegulatorsOpen(false)}
                                                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-150 ${bg}`}
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 shrink-0 mt-0.5">
                                                            <Icon className={`size-4 ${color}`} aria-hidden="true" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-navy dark:text-slate-100">{label}</span>
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{sub}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 text-xs">
                                        <span className="text-slate-500 dark:text-slate-400">Primary-source official circulars updated daily</span>
                                        <Link
                                            href="/category"
                                            onClick={() => setRegulatorsOpen(false)}
                                            className="font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                                        >
                                            View all 10 categories <ArrowRight className="size-3" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Guides */}
                        <Link
                            href="/guides"
                            className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                                isActive('/guides')
                                    ? 'text-amber-700 dark:text-amber-400 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                            }`}
                        >
                            <BookOpen className="size-4 shrink-0 opacity-80" aria-hidden="true" />
                            Guides
                            {isActive('/guides') && (
                                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                            )}
                        </Link>

                        {/* Right Utility Bar */}
                        <div className="ml-3 flex items-center gap-2">
                            <GlobalSearch />
                            <Link
                                href="/bookmarks"
                                className="flex size-9 items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all"
                                title="Saved Bookmarks"
                                aria-label="Saved Bookmarks"
                            >
                                <Bookmark className="size-4 opacity-80" aria-hidden="true" />
                            </Link>
                            <NotificationBell />
                            <DarkModeToggle />
                            <Link
                                href="/newsletter"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xs transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-400 ml-1"
                                title="Subscribe to Free Weekly Newsletter"
                            >
                                <Mail className="size-3.5" aria-hidden="true" />
                                <span>Free Newsletter</span>
                            </Link>
                        </div>
                    </div>

                    {/* ─── Mobile / Tablet Header Controls (< 1024px) ─── */}
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('cluin-open-search'))
                                }
                            }}
                            aria-label="Open search"
                            className="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all"
                        >
                            <Search className="size-4.5" aria-hidden="true" />
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-white shadow-xs hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all"
                            aria-expanded={isOpen}
                            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        >
                            {isOpen ? (
                                <X className="size-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                            ) : (
                                <Menu className="size-5 text-slate-700 dark:text-slate-200" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Mobile / Tablet Navigation Menu (< 1024px) ─── */}
            {isOpen && (
                <div
                    className="lg:hidden border-t border-slate-200/80 dark:border-slate-800/80 max-h-[85dvh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-fade-in"
                    role="region"
                    aria-label="Navigation menu"
                >
                    <div className="w-full sm:max-w-md mx-auto p-4 space-y-5">
                        {/* Quick Search Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false)
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('cluin-open-search'))
                                }
                            }}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-medium hover:border-amber-400/50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Search className="size-4 text-slate-400" />
                                <span>Search circulars, forms, acts...</span>
                            </span>
                            <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-200/70 dark:bg-slate-700/70 text-[10px]">Ctrl+K</kbd>
                        </button>

                        {/* 1. Core Workspaces (2x2 Card Grid) */}
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                                Core Workspaces
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/updates"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex flex-col p-3 rounded-xl border transition-all ${
                                        isActive('/updates')
                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400'
                                            : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-2">
                                        <Newspaper className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold text-navy dark:text-white">Updates</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Daily circular feed</span>
                                </Link>

                                <Link
                                    href="/documents"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex flex-col p-3 rounded-xl border transition-all ${
                                        isActive('/documents')
                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400'
                                            : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-2">
                                        <FileText className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold text-navy dark:text-white">Documents</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Statutory drafting</span>
                                </Link>

                                <Link
                                    href="/tools"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex flex-col p-3 rounded-xl border transition-all ${
                                        isActive('/tools')
                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400'
                                            : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 w-fit mb-2">
                                        <Wrench className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold text-navy dark:text-white">Tools</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Fee calcs &amp; CIN</span>
                                </Link>

                                <Link
                                    href="/guides"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex flex-col p-3 rounded-xl border transition-all ${
                                        isActive('/guides')
                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400'
                                            : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 w-fit mb-2">
                                        <BookOpen className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold text-navy dark:text-white">Guides</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Compliance SOPs</span>
                                </Link>
                            </div>
                        </div>

                        {/* 2. All 10 Regulators Fast-Access */}
                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    All 10 Regulatory Areas
                                </span>
                                <Link
                                    href="/category"
                                    onClick={() => setIsOpen(false)}
                                    className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {allRegulators.map(({ href, label, Icon, color }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                                    >
                                        <Icon className={`size-3.5 shrink-0 ${color}`} aria-hidden="true" />
                                        <span className="truncate">{label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* 3. Statutory Trackers & Shortcuts */}
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                                Trackers &amp; Utilities
                            </span>
                            <div className="space-y-1">
                                <Link
                                    href="/calendar"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Calendar className="size-4 text-cyan-600 dark:text-cyan-400" />
                                        <span>Compliance Calendar</span>
                                    </span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300">Deadlines</span>
                                </Link>

                                <Link
                                    href="/rbi/repo-rate"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <TrendingUp className="size-4 text-violet-600 dark:text-violet-400" />
                                        <span>RBI Repo Rate Tracker</span>
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 tabular-nums">5.50%</span>
                                </Link>

                                <Link
                                    href="/glossary"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <BookOpen className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Corporate Legal Glossary</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400">A–Z</span>
                                </Link>

                                <Link
                                    href="/bookmarks"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Bookmark className="size-4 text-amber-600 dark:text-amber-400" />
                                        <span>Saved Bookmarks</span>
                                    </span>
                                    <span className="text-slate-400 text-xs">→</span>
                                </Link>

                                <Link
                                    href="/about"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Building2 className="size-4 text-slate-500 dark:text-slate-400" />
                                        <span>About CorpLawUpdates</span>
                                    </span>
                                    <span className="text-slate-400 text-xs">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* 4. Bottom Dock: Free Weekly Newsletter + Theme & Notifications */}
                        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                            <Link
                                href="/newsletter"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 group transition-all"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-navy dark:text-white flex items-center gap-1.5">
                                        <Mail className="size-3.5 text-amber-600 dark:text-amber-400" />
                                        Free Weekly Newsletter
                                    </span>
                                    <span className="text-[11px] text-slate-600 dark:text-slate-400">Join 500+ legal &amp; corporate professionals</span>
                                </div>
                                <ArrowRight className="size-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                            </Link>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Theme &amp; Notifications
                                </span>
                                <div className="flex items-center gap-2">
                                    <NotificationBell />
                                    <DarkModeToggle />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
