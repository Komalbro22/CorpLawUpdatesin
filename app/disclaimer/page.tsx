import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Disclaimer | CorpLawUpdates.in',
    description: 'Legal disclaimer for CorpLawUpdates.in — Informational platform for Indian corporate law updates and compliance tools.',
    alternates: {
        canonical: 'https://www.corplawupdates.in/disclaimer',
    },
    openGraph: {
        title: 'Disclaimer | CorpLawUpdates.in',
        description: 'Legal disclaimer for CorpLawUpdates.in — Informational platform for Indian corporate law updates and compliance tools.',
        url: 'https://www.corplawupdates.in/disclaimer',
        images: [{ url: 'https://www.corplawupdates.in/api/og?title=Disclaimer&category=', width: 1200, height: 630 }],
    },
}

export default function DisclaimerPage() {
    return (
        <div className="min-h-dvh bg-white dark:bg-slate-950 transition-colors duration-200">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <nav className="mb-6 text-sm text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-amber-500 transition-colors">
                        Home
                    </Link>
                    <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-navy dark:text-slate-200 font-medium">Disclaimer</span>
                </nav>

                <h1 className="text-3xl font-heading font-bold text-navy dark:text-slate-100 mb-2">
                    Disclaimer
                </h1>
                <p className="text-slate-400 text-sm mb-8">
                    Last updated: 3rd October 2026
                </p>

                {/* Highlight Notice Box */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 dark:border-amber-500 p-5 rounded-r-xl mb-8">
                    <p className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                        ⚠️ Important Notice
                    </p>
                    <p className="text-amber-800 dark:text-amber-400 text-sm mt-2 leading-relaxed">
                        All regulatory summaries, compliance calendars, fee estimation calculators, and document drafts on CorpLawUpdates.in are provided for <strong>informational and research reference purposes only</strong>. Nothing on this website constitutes legal advice, formal secretarial certification, or statutory counsel.
                    </p>
                </div>

                <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">1. General Platform Information</h2>
                        <p>
                            CorpLawUpdates.in (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;, or &quot;the Platform&quot;) is an independent regulatory research and intelligence platform dedicated to tracking corporate jurisprudence in India. The content provided on this Site is for general informational purposes only and does not constitute formal legal advice, solicitation, or professional consultation.
                        </p>
                        <p className="mt-3">
                            While we make reasonable editorial efforts to verify circulars against official gazette notifications and primary regulator portals, we make no representations or warranties of any kind, express or implied, regarding the completeness, timeliness, reliability, or suitability of the information for specific transactions or filings.
                        </p>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">2. Not Legal, Tax, or Accounting Advice</h2>
                        <p>
                            The content, articles, commentaries, and analytical briefs published on CorpLawUpdates.in should not be treated as a substitute for professional legal or secretarial advice from a qualified Company Secretary (ICSI), Chartered Accountant (ICAI), Advocate / Legal Practitioner, or other credentialed professional.
                        </p>
                        <p className="mt-3">
                            Any reliance placed on information obtained from this platform is strictly at your own discretion and risk. If you require legal counsel or formal corporate filing assistance, you must consult an accredited professional who can review the specific facts of your matter.
                        </p>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">3. Primary Regulatory Source Verification</h2>
                        <p>
                            Indian corporate regulations, statutory circulars, Master Directions, and portal filing procedures are subject to frequent amendments by statutory authorities. Users are expressly advised to cross-verify all statutory timelines, circular numbers, and compliance mandates with the respective official government portals:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 mt-3">
                            <li>Ministry of Corporate Affairs (MCA) — <span className="font-mono text-xs">mca.gov.in</span></li>
                            <li>Securities and Exchange Board of India (SEBI) — <span className="font-mono text-xs">sebi.gov.in</span></li>
                            <li>Reserve Bank of India (RBI) — <span className="font-mono text-xs">rbi.org.in</span></li>
                            <li>Insolvency and Bankruptcy Board of India (IBBI) — <span className="font-mono text-xs">ibbi.gov.in</span></li>
                            <li>Competition Commission of India (CCI) — <span className="font-mono text-xs">cci.gov.in</span></li>
                            <li>The Gazette of India — <span className="font-mono text-xs">egazette.gov.in</span></li>
                        </ul>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">4. Calculators & Compliance Tools</h2>
                        <p>
                            The filing fee calculators, late fee estimators, CIN decoders, and compliance calendars provided on this platform are automated mathematical tools developed for estimation and reference purposes only.
                        </p>
                        <p className="mt-3">
                            Calculations are based on public fee tables and user-selected inputs. Actual filing fees, late fee multipliers, or compounding penalties calculated by government portals (such as the MCA21 V3 system) may differ based on corporate classification, incorporation date, or back-office system validations. Always verify final challan amounts directly on official government portals before executing payments.
                        </p>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">5. AI-Assisted Document Templates</h2>
                        <p>
                            Document templates, board resolutions, and contract formats available on this site are draft frameworks structured to assist users in preparing documentation. They do not constitute certified true copies or finalized contracts until reviewed, customized, and executed by authorized corporate signatories or practicing legal professionals in compliance with applicable Secretarial Standards (such as ICSI SS-1 and SS-2).
                        </p>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">6. External Links & Third-Party References</h2>
                        <p>
                            This platform may include hyperlinks to external websites, statutory gazettes, and regulator repositories. These links are provided solely for user convenience and citation. CorpLawUpdates.in does not control, endorse, or assume responsibility for the content, privacy practices, or availability of any third-party websites.
                        </p>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">7. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by applicable Indian law, CorpLawUpdates.in, its author, and operators disclaim all liability for any direct, indirect, incidental, consequential, special, or exemplary damages, financial losses, statutory penalties, or missed compliance deadlines arising from the use of, or inability to use, any content or tools on this website.
                        </p>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                    <section>
                        <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">8. Contact for Clarifications</h2>
                        <p>
                            If you have questions, corrections, or feedback regarding this disclaimer or any regulatory updates published on this site, please reach out to our desk:
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-slate-600 dark:text-slate-300 space-y-1.5 text-sm mt-4">
                            <p><strong>Editorial Desk:</strong> CorpLawUpdates.in</p>
                            <p><strong>Desk Location:</strong> Lucknow, Uttar Pradesh, India</p>
                            <p><strong>Email:</strong> <a href="mailto:legal@corplawupdates.in" className="text-amber-500 hover:underline">legal@corplawupdates.in</a></p>
                            <p><strong>Contact Form:</strong> <Link href="/contact" className="text-amber-500 hover:underline">Contact Desk</Link></p>
                        </div>
                    </section>
                </div>

                <div className="mt-8 text-center sm:text-left">
                    <Link href="/" className="text-navy dark:text-amber-400 font-semibold hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
