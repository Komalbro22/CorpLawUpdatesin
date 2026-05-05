'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="font-heading text-xl font-bold text-navy">
                                CorpLawUpdates.in<span className="text-gold">.</span>
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
                                className="flex items-center gap-1 text-navy hover:text-amber-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-md px-2 py-1"
                            >
                                Categories
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {categoriesOpen && (
                                <div
                                    role="menu"
                                    aria-label="Category navigation"
                                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                                >
                                    {[
                                        { href: '/category/mca', label: '🏛️ MCA', color: 'text-blue-600' },
                                        { href: '/category/sebi', label: '📈 SEBI', color: 'text-green-600' },
                                        { href: '/category/rbi', label: '🏦 RBI', color: 'text-purple-600' },
                                        { href: '/category/nclt', label: '⚖️ NCLT', color: 'text-orange-600' },
                                        { href: '/category/ibc', label: '📋 IBC', color: 'text-red-600' },
                                        { href: '/category/fema', label: '💱 FEMA', color: 'text-teal-600' },
                                        { href: '/rbi/repo-rate', label: '🏦 Current Repo Rate', color: 'text-navy' },
                                        { href: '/calendar', label: '📅 Compliance Calendar', color: 'text-navy' },
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            role="menuitem"
                                            onClick={() => setCategoriesOpen(false)}
                                            className={`block px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors focus:outline-none focus:bg-amber-50 ${item.color}`}
                                        >
                                            {item.label}
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
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
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
                            <div className="mt-2 space-y-1 pl-4">
                                {[
                                    { href: '/category/mca', label: '🏛️ MCA' },
                                    { href: '/category/sebi', label: '📈 SEBI' },
                                    { href: '/category/rbi', label: '🏦 RBI' },
                                    { href: '/category/nclt', label: '⚖️ NCLT' },
                                    { href: '/category/ibc', label: '📋 IBC' },
                                    { href: '/category/fema', label: '💱 FEMA' },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block py-2 text-base font-medium text-slate-500 hover:text-gold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/rbi/repo-rate"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 text-navy font-medium hover:text-amber-600 border-t border-slate-100"
                                >
                                    🏦 Current Repo Rate
                                </Link>
                                <Link
                                    href="/calendar"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 text-navy font-medium hover:text-amber-600 border-b border-t border-slate-100"
                                >
                                    📅 Compliance Calendar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
