'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlobalSearch from './GlobalSearch'
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
    TrendingUp,
    Wrench,
    X,
    Bookmark,
} from 'lucide-react'

const links = [
    { href: '/', label: 'Home' },
    { href: '/updates', label: 'Updates' },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/tools', label: 'Tools', icon: Wrench },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark, hideIconOnDesktop: true },
    { href: '/about', label: 'About' },
    { href: '/newsletter', label: 'Newsletter' },
]

const GlossaryIcon = ({ className }: { className?: string }) => (
    <span className={`${className} text-base flex items-center justify-center`} aria-hidden>📖</span>
)

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [categoriesOpen, setCategoriesOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const categoriesRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    /* Scroll-compact effect */
    useEffect(() => {
        function onScroll() { setScrolled(window.scrollY > 40) }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    /* Close dropdown on outside click */
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
                setCategoriesOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    /* Close on Escape key */
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') { setCategoriesOpen(false); setIsOpen(false) }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const isActive = (path: string) => pathname === path

    const categoryItems = [
        { href: '/glossary',       label: 'Legal Glossary',     Icon: GlossaryIcon, color: 'text-amber-600',  bg: 'hover:bg-amber-50'   },
        { href: '/category/mca',   label: 'MCA',                Icon: Building2, color: 'text-blue-600',    bg: 'hover:bg-blue-50'    },
        { href: '/category/sebi',  label: 'SEBI',               Icon: TrendingUp, color: 'text-emerald-600', bg: 'hover:bg-emerald-50' },
        { href: '/category/rbi',   label: 'RBI',                Icon: Landmark,  color: 'text-violet-600',  bg: 'hover:bg-violet-50'  },
        { href: '/category/nclt',  label: 'NCLT',               Icon: Scale,     color: 'text-orange-600',  bg: 'hover:bg-orange-50'  },
        { href: '/category/ibc',   label: 'IBC',                Icon: Gavel,     color: 'text-red-600',     bg: 'hover:bg-red-50'     },
        { href: '/category/fema',  label: 'FEMA',               Icon: Globe2,    color: 'text-teal-600',    bg: 'hover:bg-teal-50'    },
        { href: '/rbi/repo-rate',  label: 'Current Repo Rate',  Icon: Landmark,  color: 'text-indigo-600',   bg: 'hover:bg-indigo-50'   },
        { href: '/calendar',       label: 'Compliance Calendar',Icon: Calendar,  color: 'text-cyan-600',     bg: 'hover:bg-cyan-50'     },
    ] as const

    const navHeight = scrolled ? 'h-14' : 'h-16'
    const navBg = scrolled
        ? 'bg-white/95 dark:bg-slate-900/95 shadow-nav backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80'
        : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80'

    return (
        <nav className={`sticky top-0 z-50 w-full transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ease-in-out ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex justify-between items-center transition-[height] duration-300 ease-in-out ${navHeight}`}>

                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex flex-col justify-center group">
                        <span className="font-heading text-xl font-bold navbar-logo-text leading-tight transition-colors duration-200 text-navy dark:text-white">
                            CorpLawUpdates<span className="text-gold group-hover:text-amber-500 transition-colors">.in</span>
                        </span>
                        <span className="hidden sm:block text-[10px] font-semibold tracking-[0.18em] uppercase mt-0.5 transition-colors duration-200 text-slate-400 dark:text-slate-500">
                            Corporate Law Intelligence
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex md:items-center md:gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                    isActive(link.href)
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                {'icon' in link && link.icon && !(link as any).hideIconOnDesktop && (
                                    <link.icon className="w-4 h-4 shrink-0" aria-hidden />
                                )}
                                {link.label}
                                {/* Animated underline for active */}
                                {isActive(link.href) && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-400" />
                                )}
                            </Link>
                        ))}

                        {/* Categories dropdown */}
                        <div ref={categoriesRef} className="relative">
                            <button
                                onClick={() => setCategoriesOpen(prev => !prev)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        setCategoriesOpen(prev => !prev)
                                    }
                                }}
                                aria-expanded={categoriesOpen}
                                aria-haspopup="true"
                                aria-label="Browse categories"
                                className="flex items-center gap-1 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:ring-offset-2 rounded-md px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Categories
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
                                    aria-hidden
                                />
                            </button>

                            {categoriesOpen && (
                                <div
                                    role="menu"
                                    aria-label="Category navigation"
                                    className="absolute top-full right-0 md:left-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 p-2 z-50 animate-fade-in"
                                >
                                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Regulators & Quick Tools
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-0.5">
                                        {categoryItems.map(({ href, label, Icon, color, bg }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                role="menuitem"
                                                onClick={() => setCategoriesOpen(false)}
                                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus:bg-amber-50/80 dark:focus:bg-slate-800/80 ${color} ${bg} dark:hover:bg-slate-800/60`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 shrink-0">
                                                        <Icon className="w-4 h-4" aria-hidden />
                                                    </div>
                                                    <span>{label}</span>
                                                </div>
                                                <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search shortcut & notifications */}
                        <div className="ml-2 flex items-center gap-2">
                            <GlobalSearch />
                            <NotificationBell />
                            <DarkModeToggle />
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 md:hidden">
                        <GlobalSearch />
                        <NotificationBell />
                        <DarkModeToggle />
                        <button

                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-expanded={isOpen}
                            aria-label={isOpen ? 'Close menu' : 'Open main menu'}
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-fade-in">
                    <div className="pt-3 pb-6 space-y-1 px-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
                            Navigation
                        </div>
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3.5 py-3 min-h-[44px] text-sm font-medium rounded-xl transition-all ${
                                    isActive(link.href)
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border-l-4 border-amber-500'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                                }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {'icon' in link && link.icon && (
                                    <link.icon className="w-4 h-4 shrink-0 opacity-80" aria-hidden />
                                )}
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
                                Regulator Direct Access
                            </span>
                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                                {categoryItems.map(({ href, label, Icon, color }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2 p-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-800 ${color}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />
                                        <span>{label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
