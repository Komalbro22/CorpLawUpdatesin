/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from 'next/link'

const categories = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']

export default function Footer() {
    return (
        <footer className="bg-navy text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1 */}
                    <div>
                        <h3 className="font-heading text-xl font-bold mb-4">
                            CorpLawUpdates.in<span className="text-gold">.</span>
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">
                            India's Free Corporate Law Intelligence Platform
                        </p>
                        <p className="text-slate-400 text-sm">
                            Providing timely, accurate, and comprehensive updates on Indian corporate laws and regulations.
                        </p>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4 text-slate-100">Categories</h4>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category}>
                                    <Link
                                        href={`/category/${category.toLowerCase()}`}
                                        className="text-slate-400 hover:text-gold transition-colors text-sm"
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4 text-slate-100">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-slate-400 hover:text-gold transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/updates" className="text-slate-400 hover:text-gold transition-colors text-sm">
                                    Updates
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-slate-400 hover:text-gold transition-colors text-sm">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/newsletter" className="text-slate-400 hover:text-gold transition-colors text-sm">
                                    Newsletter
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/calendar"
                                    className="text-slate-400 hover:text-gold transition-colors duration-200 text-sm"
                                >
                                    📅 Compliance Calendar
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="/api/feed.xml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-gold transition-colors duration-200 flex items-center gap-1.5 text-sm"
                                >
                                    <span className="text-orange-400 text-base leading-none">
                                        ◉
                                    </span>
                                    RSS Feed
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-700/50 text-center text-slate-500 text-sm">
                    <p>© 2026 CorpLawUpdates.in · Not legal advice · For informational purposes only</p>
                </div>
            </div>
        </footer>
    )
}
