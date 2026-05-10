/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from 'next/link'
import { Calendar, Rss } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

const categories = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']

export default async function Footer() {
    const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
            'linkedin_url',
            'twitter_url',
            'instagram_url',
            'whatsapp_channel',
        ])

    const social: Record<string, string> = {}
    settings?.forEach(s => {
        social[s.key] = s.value || ''
    })

    const linkedinUrl = social.linkedin_url || ''
    const twitterUrl = social.twitter_url || ''
    const instagramUrl = social.instagram_url || ''
    const whatsappUrl = social.whatsapp_channel || ''

    return (
        <footer className="bg-navy text-white pt-14 pb-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
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
                                    className="inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-colors duration-200 text-sm"
                                >
                                    <Calendar className="w-3.5 h-3.5 opacity-80" aria-hidden />
                                    Compliance Calendar
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="/api/feed.xml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-gold transition-colors duration-200 inline-flex items-center gap-2 text-sm"
                                >
                                    <Rss className="w-3.5 h-3.5 text-orange-400/90" aria-hidden />
                                    RSS Feed
                                </a>
                            </li>
                            <li>
                                <Link href="/contact"
                                    className="text-slate-400 hover:text-gold transition-colors duration-200 text-sm">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy"
                                    className="text-slate-400 hover:text-gold transition-colors duration-200 text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms"
                                    className="text-slate-400 hover:text-gold transition-colors duration-200 text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>


                <div className="mt-12 pt-8 border-t border-slate-700/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Social Media Links */}
                        {(linkedinUrl || twitterUrl || instagramUrl || whatsappUrl) && (
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-slate-400 font-medium">Follow us:</p>

                                {linkedinUrl && (
                                    <a
                                        href={linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="LinkedIn"
                                        className="text-slate-400 hover:text-blue-400 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </a>
                                )}

                                {twitterUrl && (
                                    <a
                                        href={twitterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="X (Twitter)"
                                        className="text-slate-400 hover:text-sky-400 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                    </a>
                                )}

                                {instagramUrl && (
                                    <a
                                        href={instagramUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Instagram"
                                        className="text-slate-400 hover:text-pink-400 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                        </svg>
                                    </a>
                                )}

                                {whatsappUrl && (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="WhatsApp Channel"
                                        className="text-slate-400 hover:text-green-400 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-500 text-xs">
                            <span>© 2026 CorpLawUpdates.in</span>
                            <span className="text-slate-600">·</span>
                            <Link href="/privacy-policy"
                                className="hover:text-gold transition-colors">
                                Privacy Policy
                            </Link>
                            <span className="text-slate-600">·</span>
                            <Link href="/terms"
                                className="hover:text-gold transition-colors">
                                Terms of Service
                            </Link>
                            <span className="text-slate-600">·</span>
                            <Link href="/contact"
                                className="hover:text-gold transition-colors">
                                Contact
                            </Link>
                            <span className="text-slate-600">·</span>
                            <span>Not legal advice</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
