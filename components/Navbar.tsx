'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
    { href: '/', label: 'Home' },
    { href: '/updates', label: 'Updates' },
    { href: '/about', label: 'About' },
    { href: '/newsletter', label: 'Newsletter' },
]

const categories = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
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

                        <div className="relative group">
                            <button className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-navy">
                                Categories
                                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200">
                                {categories.map((category) => (
                                    <Link
                                        key={category}
                                        href={`/category/${category.toLowerCase()}`}
                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-gold"
                                    >
                                        {category}
                                    </Link>
                                ))}
                            </div>
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
                                {categories.map((category) => (
                                    <Link
                                        key={category}
                                        href={`/category/${category.toLowerCase()}`}
                                        className="block py-2 text-base font-medium text-slate-500 hover:text-gold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {category}
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
