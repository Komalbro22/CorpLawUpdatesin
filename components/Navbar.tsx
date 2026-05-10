'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Building2,
    Calendar,
    ChevronDown,
    Gavel,
    Globe2,
    Landmark,
    Menu,
    Scale,
    TrendingUp,
    X,
} from 'lucide-react'

const links = [
    { href: '/', label: 'Home' },
    { href: '/updates', label: 'Updates' },
    { href: '/about', label: 'About' },
    { href: '/newsletter', label: 'Newsletter' },
]



export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [categoriesOpen, setCategoriesOpen] = useState(false)
    const categoriesRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                categoriesRef.current && 
                !categoriesRef.current.contains(e.target as Node)
            ) {
                setCategoriesOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on Escape key
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setCategoriesOpen(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    const categoryItems = [
        { href: '/category/mca', label: 'MCA', Icon: Building2, color: 'text-blue-600' },
        { href: '/category/sebi', label: 'SEBI', Icon: TrendingUp, color: 'text-emerald-600' },
        { href: '/category/rbi', label: 'RBI', Icon: Landmark, color: 'text-violet-600' },
        { href: '/category/nclt', label: 'NCLT', Icon: Scale, color: 'text-orange-600' },
        { href: '/category/ibc', label: 'IBC', Icon: Gavel, color: 'text-red-600' },
        { href: '/category/fema', label: 'FEMA', Icon: Globe2, color: 'text-teal-600' },
        { href: '/rbi/repo-rate', label: 'Current Repo Rate', Icon: Landmark, color: 'text-navy' },
        { href: '/calendar', label: 'Compliance Calendar', Icon: Calendar, color: 'text-navy' },
    ] as const

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 border-b border-slate-200/80 shadow-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex-shrink-0 flex flex-col justify-center">
                            <span className="font-heading text-xl font-bold text-navy leading-tight">
                                CorpLawUpdates.in<span className="text-gold">.</span>
                            </span>
                            <span className="hidden sm:block text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                                Corporate law intelligence
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive(link.href) ? 'text-gold' : 'text-slate-600 hover:text-navy'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

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
                                className="flex items-center gap-1 text-navy hover:text-amber-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:ring-offset-2 rounded-md px-2 py-1"
                            >
                                Categories
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
                                    aria-hidden
                                />
                            </button>

                            {categoriesOpen && (
                                <div
                                    role="menu"
                                    aria-label="Category navigation"
                                    className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-card-hover border border-slate-200/90 py-1.5 z-50"
                                >
                                    {categoryItems.map(({ href, label, Icon, color }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            role="menuitem"
                                            onClick={() => setCategoriesOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors focus:outline-none focus:bg-amber-50/80 ${color}`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0 opacity-80" aria-hidden />
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-navy hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold/80"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">{isOpen ? 'Close menu' : 'Open main menu'}</span>
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200 max-h-[80vh] overflow-y-auto">
                    <div className="pt-2 pb-3 space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block pl-3 pr-4 py-2 text-base font-medium ${isActive(link.href)
                                    ? 'bg-amber-50 border-l-4 border-gold text-gold'
                                    : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-navy'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pl-3 pr-4 py-2 border-l-4 border-transparent">
                            <span className="text-base font-medium text-slate-600">Categories</span>
                            <div className="mt-2 space-y-0.5 pl-2">
                                {categoryItems.map(({ href, label, Icon, color }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2 py-2.5 px-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg ${color}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Icon className="w-4 h-4 shrink-0 opacity-80" aria-hidden />
                                        {label}
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
