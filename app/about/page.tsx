import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'About — India\'s Free Corporate Law Platform',
  description: 'Learn about CorpLawUpdates.in — India\'s free corporate law intelligence platform providing MCA, SEBI, RBI updates for CS professionals.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/about',
  },
}

export default async function AboutPage() {
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
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* 1. Hero */}
            <section className="bg-navy text-white p-10 md:p-16 rounded-2xl mb-12 text-center shadow-lg">
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">About CorpLawUpdates.in</h1>
                <p className="text-xl text-slate-300">Empowering professionals with timely legal intelligence.</p>
            </section>

            {/* 2. What We Do */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-4 border-l-4 border-gold pl-4">What We Do</h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                    We aggregate, verify, and summarize Indian corporate law updates from multiple regulatory bodies.
                    Our mission is to make legal updates accessible, structured, and free forever for everyone.
                </p>
            </section>

            {/* 3. Who We Serve */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-6 border-l-4 border-gold pl-4">Who We Serve</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Corporate Lawyers', 'Compliance Officers', 'CS Professionals (ICSI)', 'Law Students'].map((item) => (
                        <div key={item} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center shadow-sm">
                            <svg className="w-6 h-6 text-gold mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-navy">{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. What We Cover */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-6 border-l-4 border-gold pl-4">What We Cover</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">MCA</h3>
                        <p className="text-slate-600">Company law, incorporation, compliance and governance updates</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">SEBI</h3>
                        <p className="text-slate-600">Capital markets, listing, investor protection updates</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">RBI</h3>
                        <p className="text-slate-600">Banking regulation, FEMA, foreign exchange & monetary policy</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">NCLT</h3>
                        <p className="text-slate-600">Insolvency, mergers, acquisitions and corporate disputes</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">IBC</h3>
                        <p className="text-slate-600">Insolvency and Bankruptcy Code — Resolution process, liquidation and creditor rights updates</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">FEMA</h3>
                        <p className="text-slate-600">Cross-border transactions and foreign investment updates</p>
                    </div>
                </div>
            </section>

            {/* 5. How It Works */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-4 border-l-4 border-gold pl-4">How It Works</h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                    Every piece of information is curated manually by legal professionals who review circulars, notifications, and orders from regulatory websites daily to provide accurate summaries.
                </p>
            </section>

            {/* 6. Connect With Us */}
            {(linkedinUrl || twitterUrl || instagramUrl || whatsappUrl) && (
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy mb-6 border-l-4 border-gold pl-4">Connect With Us</h2>
                    <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <p className="text-slate-600 font-medium mr-2">Follow our official channels:</p>

                        {linkedinUrl && (
                            <a
                                href={linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="text-navy hover:text-blue-600 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
                                className="text-navy hover:text-sky-500 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
                                className="text-navy hover:text-pink-600 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
                                className="text-navy hover:text-green-600 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </a>
                        )}
                    </div>
                </section>
            )}

            {/* 7. DISCLAIMER */}
            <section className="bg-red-50 border-2 border-amber-400 p-8 rounded-2xl">
                <h3 className="font-bold text-red-700 text-xl mb-3 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Important Disclaimer
                </h3>
                <p className="text-red-900 font-medium">
                    The content on CorpLawUpdates.in is for informational purposes only and does not constitute legal advice.
                    Always consult a qualified legal professional for advice specific to your situation.
                </p>
            </section>
        </div>
    )
}
