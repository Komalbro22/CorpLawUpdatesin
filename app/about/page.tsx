import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'About Us – CorpLawUpdates.in',
  description: 'Learn about CorpLawUpdates.in — India\'s free corporate law intelligence platform providing MCA, SEBI, RBI, CCI, Labour Law updates for professionals.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/about',
  },
  openGraph: {
    title: 'About Us – CorpLawUpdates.in',
    description: 'CorpLawUpdates.in publishes free, plain-English corporate law updates covering MCA, SEBI, RBI, CCI, Labour Law, NCLT, IBC and FEMA for professionals, lawyers and compliance officers.',
    url: 'https://www.corplawupdates.in/about',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=About%20CorpLawUpdates&category=', width: 1200, height: 630 }],
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
            'telegram_channel',
        ])

    const social: Record<string, string> = {}
    settings?.forEach(s => {
        social[s.key] = s.value || ''
    })

    const linkedinUrl = social.linkedin_url || ''
    const twitterUrl = social.twitter_url || ''
    const instagramUrl = social.instagram_url || ''
    const whatsappUrl = social.whatsapp_channel || 'https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A'
    const telegramUrl = social.telegram_channel || 'https://t.me/corplawupdate'

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* 1. Hero */}
                <section className="bg-navy text-white p-10 md:p-16 rounded-2xl mb-12 text-center shadow-lg">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">About CorpLawUpdates.in</h1>
                    <p className="text-xl text-slate-300">Empowering professionals with timely legal intelligence.</p>
                </section>

                {/* 2. What We Do */}
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-4 border-l-4 border-gold pl-4">What We Do</h2>
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                        We aggregate, verify, and summarize Indian corporate law updates from multiple regulatory bodies.
                        Our mission is to make legal updates accessible, structured, and free forever for everyone.
                    </p>
                </section>

                {/* 3. Who We Serve */}
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-6 border-l-4 border-gold pl-4">Who We Serve</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Corporate Lawyers', 'Compliance Officers', 'Professionals', 'Law Students'].map((item) => (
                            <div key={item} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center shadow-sm">
                                <svg className="size-6 text-gold mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-bold text-navy dark:text-white">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. What We Cover */}
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-6 border-l-4 border-gold pl-4">What We Cover</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">MCA</h3>
                            <p className="text-slate-600 dark:text-slate-400">Company law, incorporation, compliance and governance updates</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">SEBI</h3>
                            <p className="text-slate-600 dark:text-slate-400">Capital markets, listing, investor protection updates</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">RBI</h3>
                            <p className="text-slate-600 dark:text-slate-400">Banking regulation, FEMA, foreign exchange & monetary policy</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">NCLT</h3>
                            <p className="text-slate-600 dark:text-slate-400">Insolvency, mergers, acquisitions and corporate disputes</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">IBC</h3>
                            <p className="text-slate-600 dark:text-slate-400">Insolvency and Bankruptcy Code — Resolution process, liquidation and creditor rights updates</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">FEMA</h3>
                            <p className="text-slate-600 dark:text-slate-400">Cross-border transactions and foreign investment updates</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">CCI</h3>
                            <p className="text-slate-600 dark:text-slate-400">Competition Commission of India — Anti-trust, merger control, and market dominance regulations</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-xl text-navy dark:text-white mb-2">Labour Law</h3>
                            <p className="text-slate-600 dark:text-slate-400">Labour Codes, EPF ECR filings, ESIC notifications, and statutory employment compliance</p>
                        </div>
                    </div>
                </section>

                {/* 5. How It Works */}
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-4 border-l-4 border-gold pl-4">How It Works & Editorial Methodology</h2>
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        Every piece of information published on CorpLawUpdates.in is researched and curated manually by legal researchers. We track official government gazettes, regulatory portals, and statutory press releases daily across MCA, SEBI, RBI, IBBI, and EPFO.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">1. Primary Source Sourcing</span>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Directly fetched from regulatory portals and the official Gazette of India, ensuring zero hearsay.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">2. Two-Tier Verification</span>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Statutory amendments are cross-referenced with parent acts (e.g. Companies Act 2013, SEBI Act 1992).</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">3. Plain-English Synthesis</span>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Complex legalese is converted into actionable, structured takeaways for compliance officers and lawyers.</p>
                        </div>
                    </div>
                </section>

                {/* 5.1 Editorial Leadership & Research Team (E-E-A-T) */}
                <section id="editorial-leadership" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-6 border-l-4 border-gold pl-4">Editorial Leadership & Research Team</h2>
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-navy to-slate-800 dark:from-amber-500 dark:to-amber-600 text-white dark:text-slate-950 flex items-center justify-center font-heading font-bold text-2xl sm:text-3xl shrink-0 shadow-md ring-4 ring-amber-400/20">
                                KS
                            </div>
                            <div className="space-y-3 flex-1">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-2xl font-heading font-bold text-navy dark:text-white">Komalpreet Singh</h3>
                                        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 px-3 py-0.5 text-xs font-semibold">
                                            Founder & Lead Regulatory Analyst
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                        Editorial Desk: Lucknow, Uttar Pradesh, India &bull; Contact: <a href="mailto:legal@corplawupdates.in" className="text-amber-700 dark:text-amber-400 hover:underline">legal@corplawupdates.in</a>
                                    </p>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                                    Specializing in Indian corporate jurisprudence, statutory notifications, SEBI capital market regulations, and RBI Master Directions. He oversees the regulatory monitoring desk at CorpLawUpdates.in, verifying regulatory developments and authoring actionable intelligence for corporate secretaries, corporate lawyers, and compliance practitioners across India.
                                </p>
                                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="size-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Indian Corporate Law Research
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="size-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        MCA &amp; ROC Gazette Analysis
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="size-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        SEBI &amp; RBI Compliance
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Connect With Us */}
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-6 border-l-4 border-gold pl-4">Connect With Us</h2>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-600 dark:text-slate-400 font-medium mr-2">Follow our official channels:</p>

                            {linkedinUrl && (
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    className="text-navy dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
                                >
                                    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
                                    className="text-navy dark:text-slate-300 hover:text-sky-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
                                    className="text-navy dark:text-slate-300 hover:text-pink-600 dark:hover:text-amber-400 transition-colors"
                                >
                                    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                    </svg>
                                </a>
                            )}

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp"
                                className="text-navy dark:text-slate-300 hover:text-green-600 dark:hover:text-amber-400 transition-colors"
                            >
                                <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.737-2.03-1.654-.273-.916-.044-1.739.089-2.163.133-.423.043-1.028.148-1.977.316-.949.168-1.796.13-2.58.148-.784.018-1.958.29-2.525.271-.567-.018-1.263.139-1.851.329-.588.19-1.496.253-2.383.063-.887.31-1.69.672-2.239.253-.549.188-1.22.036-1.824.054-.604.018-1.336.086-1.754.201-.418.115-.987.277-1.846.366-.859.089-1.589.289-2.115.199-.526.11-1.322.368-1.807.587-.485.219-1.042.475-1.46.758-.418.283-.954.576-1.453.279-.499-.297-.889-.918-1.034-1.484-.145-.566-.287-1.187-.287-1.796 0-.476.119-.766.305-.78.515-.198-.25-.604-.763-1.165-1.038-.561-.275-1.195-.326-1.423-.274-.228.052-.621.097-1.066.232-.445.135-.907.282-1.539.439-.632.157-1.1.314-1.48.512-.381.198-.728.296-1.063.295-.335-.001-.651-.141-.966-.282-.315-.141-.637-.326-.966-.284-.329.042-.649.014-.966.282-.317.268-.651.323-.987.136-.336.187-.546.545-.708.861-.162.316-.248.834-.353 1.252-.105.418-.356.511-.893.432-1.554.079-.661.125-1.688.089-2.077-.036-.389-.228-.995-.586-1.357-.358-.362-.873-.462-1.476-.345-.603.117-1.275.338-1.763.801-.488.463-1.179.838-1.558.746-.379.197-.895.32-1.233.349-.338.029-.782.129-1.248.297-.466.168-.907.367-1.266.784-.359.417-.99.89-1.32 1.262-.33.372-.657.58-1.032.632-.375-.048-.764-.058-1.137-.029-.373.029-.675.326-.922.771-.247.445-.393.962-.393 1.657 0 .695.096 1.21.275 1.537.579.326.304.705.717.705 1.165.001.448.284.942.635 1.383.893 1.572.258.189.188.476.28.797.28 1.425 0 .695-.096 1.21-.275 1.537-.579.326-.304.705-.717.705-1.165-.001-.448-.635-.893-1.383-.893-.479 0-.958-.092-1.383-.28-.425-.188-.845-.567-1.264-.28-.419-.089-.895-.28-1.264-.567-.369-.287-.772-.426-1.223-.533-.451-.107-.851-.293-1.149-.533-.298-.24-.619-.425-.934-.526-.315-.101-.645-.336-.897-.688-.252-.352-.553-.629-.808-.576-.255-.819-.429-1.314-.721-.495-.292-.981-.692-1.288-1.277-.307-.585-.486-1.242-.534-1.783-.048-.541-.238-1.123-.739-1.74-.501-.617-.728-1.464-.925-2.27-.197-.806-.821-1.483-1.529-1.977-.646-.494-1.006-.894-1.476-1.324-.47-.43-.893-.803-1.383-1.289-.49-.486-.964-.945-1.438-1.357-.474-.412-.883-.925-1.085-1.376-.202-.451-.403-.916-.606-1.389-.203-.473-.294-.964-.719-1.432-.425-.468-.851-.933-1.272-1.393-.421-.46-.939-.92-1.385-1.453-.446-.533-.958-1.227-1.323-1.977-.365-.75-.393-1.537-.329-2.187.064-.65.189-1.27.683-1.789 1.34-.519.657-1.025 1.047-1.508 1.354-.483.307-.956.845-1.376 1.389-.42.544-.875 1.066-1.266 1.647-.391.581-.673 1.209-.839 1.734-.166.525-.287 1.077-.28 1.713.007.636.29 1.253.757 1.511.466.258.475.492.699.603 1.051.511.447.198.874.361 1.429.083.555.277.95.816.595 1.484.084.554.483 1.263-.066.891-.637 1.235-1.504.843-.613.207-1.636.312-2.023.608-1.387.296-1.663.352-1.973.057-1.31.305-1.263.515-1.605.789-1.511.447.275.325-1.063.838-1.326.771-1.391.895-.065.565-.874.095-1.743.412-1.438.337-.695.525-1.382.545-1.626.738-.244.193-.327.536-.498.822-.536.286-.038.447-.246.96-.48 1.508-.49.476-.903.389-1.676.089-2.06.08-.431.187-.802.277-1.373.486-.571.209-.957.504-1.49.964-.613.46-.46-1.178-.972-1.714-1.437-.536-.465-1.034-.945-1.478-1.476-.444-.531-.873-1.095-1.195-1.702-.322-.607-.592-1.254-.772-1.889-.18-.635-.335-1.31-.421-1.976-.086-.666-.366-1.403-.743-2.068.377-665.837-1.375-1.566-1.865-2.712.49-.646.874-1.361 1.242-1.876 1.438-.515.196-.529.694-1.294.803-1.977.348-.683.554-1.377 1.019-1.879 1.375-.502.356-.993.635-1.458.865-.465.23-.957.524-1.478.743-.521.219-.952.462-1.437.679-.485.217-.97.42-1.459.883-.489.463-.979.875-1.458 1.221-.583.346-1.15.761-1.698 1.234-1.649.473-.885.842-1.692 1.169-2.416.383.724.838.863 1.424 1.169 2.095.777.85.571.714 1.083 1.169 1.874.757.791.673.842 1.083 1.169 1.874.757.791.673"/>
                                </svg>
                            </a>

                            <a
                                href={telegramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Telegram"
                                className="text-navy dark:text-slate-300 hover:text-blue-500 dark:hover:text-amber-400 transition-colors"
                            >
                                <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M11.944 0A12 12 0 0 0 0 24a12 12 0 0 0 0-24zm6.724 17.525c-.208.966-.767 2.565-1.467 2.729-.915.915-2.463.917-3.296.605-1.322 1.564-3.808 1.932-4.507.868-.868 1.785-1.654 1.785-1.654s.917-.786 1.785-1.654c.699.606 3.186 1.61 4.507 1.932 4.507.533.833 1.381 1.521 2.763 1.467 2.729-.164.7-1.824-1.259-2.729-1.467-.966-.208-2.563.208-3.529-1.467-.699-1.564-1.228-3.891-1.932-4.507-.868-.868-1.785-.917-1.785-.917s.917.049 1.785.917 1.785c-.868.699-1.564 1.61-1.932 4.507.605 1.322 1.564 3.808 1.932 4.507.833.833 1.381 1.521 2.763 1.467 2.729.164.7 1.824 1.259 2.729 1.467.966.208 2.563.208 3.529 1.467.699 1.564 1.228 3.891 1.932 4.507.868.868 1.785.917 1.785.917s-.917-.049-1.785-.917z"/>
                                </svg>
                            </a>
                        </div>
                    </section>

                {/* 7. Site Statistics (Trust Signals) */}
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-6 border-l-4 border-gold pl-4">Site Statistics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                            <span className="text-4xl font-heading font-bold text-amber-600 dark:text-amber-400 block mb-2">200+</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Regulatory Updates Published</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                            <span className="text-4xl font-heading font-bold text-emerald-600 dark:text-emerald-400 block mb-2">50+</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Glossary Terms Explained</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                            <span className="text-4xl font-heading font-bold text-blue-600 dark:text-blue-400 block mb-2">10+</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Compliance Tools Available</span>
                        </div>
                    </div>
                </section>

                {/* 8. Legal & Compliance Disclaimer */}
                <section className="mb-12">
                    <h2 className="text-3xl font-heading font-bold text-navy dark:text-white mb-6 border-l-4 border-gold pl-4">Legal & Compliance Disclaimer</h2>
                    <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 dark:border-amber-500 p-6 rounded-r-xl">
                        <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
                            <strong>Disclaimer:</strong> CorpLawUpdates.in is an informational platform and does not provide legal advice, consultation, or professional services. Content is based on publicly available regulatory notifications and should not be considered a substitute for professional legal, accounting, or compliance advice. For specific legal matters, please consult a qualified Company Secretary, Chartered Accountant, or Legal Practitioner.
                        </p>
                    </div>
                </section>
            </main>

            <NewsletterSection />
        </Layout>
    )
}
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                    </svg>
                                </a>
                            )}
                        </div>
                    </section>
                )}

                {/* 7. DISCLAIMER */}
                <section className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400 dark:border-amber-600/60 p-8 rounded-2xl">
                    <h3 className="font-bold text-amber-900 dark:text-amber-300 text-xl mb-3 flex items-center">
                        <svg className="size-6 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Important Disclaimer
                    </h3>
                    <p className="text-amber-950/90 dark:text-amber-200 font-medium leading-relaxed">
                        The content on CorpLawUpdates.in is for informational purposes only and does not constitute legal advice.
                        Always consult a qualified legal professional for advice specific to your situation.
                    </p>
                </section>
            </div>
        </div>
    )
}
