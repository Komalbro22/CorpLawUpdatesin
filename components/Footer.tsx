/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from 'next/link'
import { Calendar, Rss, ArrowRight, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

const categories = [
    { id: 'MCA',  name: 'MCA Updates' },
    { id: 'SEBI', name: 'SEBI Updates' },
    { id: 'RBI',  name: 'RBI Updates' },
    { id: 'NCLT', name: 'NCLT Updates' },
    { id: 'IBC',  name: 'IBC Updates' },
    { id: 'FEMA', name: 'FEMA Updates' },
]

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
        <footer className="bg-navy text-white pt-20 pb-10 relative overflow-hidden">
             {/* Decorative element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    
                    {/* Brand Info */}
                    <div className="lg:col-span-5">
                        <Link href="/" className="inline-block group mb-6">
                            <h3 className="font-heading text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
                                CorpLawUpdates<span className="text-gold">.in</span>
                            </h3>
                            <p className="text-[11px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1">
                                Corporate Law Intelligence
                            </p>
                        </Link>
                        <p className="text-slate-400 text-base leading-relaxed max-w-md mb-8">
                            India's first free-to-access intelligence platform for regulatory updates. 
                            Built for Company Secretaries, Chartered Accountants, Cost Accountants (CMA), CS/CA/CMA Students, Legal Enthusiasts, and Compliance Professionals.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            {linkedinUrl && (
                                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 hover:text-blue-400 transition-all duration-200 group" aria-label="LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                </a>
                            )}
                            {twitterUrl && (
                                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 hover:text-sky-400 transition-all duration-200" aria-label="Twitter">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                            )}
                            {whatsappUrl && (
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 hover:text-green-400 transition-all duration-200" aria-label="WhatsApp">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Nav */}
                    <div className="lg:col-span-2">
                        <h4 className="font-heading text-sm font-bold text-white uppercase tracking-widest mb-6">Explore</h4>
                        <ul className="space-y-3">
                            {['Home', 'Updates', 'Glossary', 'About', 'Newsletter', 'Contact'].map(item => (
                                <li key={item}>
                                    <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-slate-400 hover:text-gold transition-colors text-sm font-medium">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Regulators */}
                    <div className="lg:col-span-2">
                        <h4 className="font-heading text-sm font-bold text-white uppercase tracking-widest mb-6">Regulators</h4>
                        <ul className="space-y-3">
                            {categories.map(cat => (
                                <li key={cat.id}>
                                    <Link href={`/category/${cat.id.toLowerCase()}`} className="text-slate-400 hover:text-gold transition-colors text-sm font-medium">
                                        {cat.id}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Callout */}
                    <div className="lg:col-span-3">
                         <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all duration-500" aria-hidden />
                            <h4 className="font-heading text-base font-bold text-white mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gold" />
                                Stay Informed
                            </h4>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                Join 500+ professionals receiving our weekly Monday digest.
                            </p>
                            <Link href="/newsletter" className="flex items-center justify-between bg-gold text-navy text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-amber-400 transition-all">
                                SUBSCRIBE FREE
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                         </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
                        <span>© 2026 CorpLawUpdates.in</span>
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/api/feed.xml" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors" prefetch={false}>
                            <Rss className="w-3 h-3 text-orange-500" /> RSS
                        </Link>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 italic text-center md:text-right max-w-xs">
                        Information provided is for educational purposes only and does not constitute legal advice.
                    </div>
                </div>
            </div>
        </footer>
    )
}
