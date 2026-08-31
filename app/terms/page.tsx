/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service | CorpLawUpdates.in',
    description: 'Terms of Service for CorpLawUpdates.in — Informational platform for Indian corporate law updates and compliance tools.',
    alternates: {
        canonical: 'https://www.corplawupdates.in/terms',
    },
    openGraph: {
        title: 'Terms of Service | CorpLawUpdates.in',
        description: 'Terms of Service for CorpLawUpdates.in — Informational platform for Indian corporate law updates and compliance tools.',
        url: 'https://www.corplawupdates.in/terms',
        images: [{ url: 'https://www.corplawupdates.in/api/og?title=Terms%20of%20Service&category=', width: 1200, height: 630 }],
    },
}

export default function TermsPage() {
    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen text-slate-600 dark:text-slate-400 transition-colors duration-200">
            {/* HERO */}
            <div className="bg-navy py-10 px-4 text-center">
                <h1 className="text-3xl font-heading font-bold text-white">
                    Terms of Service
                </h1>
                <p className="text-slate-300 mt-2 text-sm">
                    Last updated: 14 June 2026
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

                {/* NOT LEGAL ADVICE — highlight box */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 dark:border-amber-500 p-5 rounded-r-xl">
                    <p className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                        ⚠️ Important Disclaimer
                    </p>
                    <p className="text-amber-800 dark:text-amber-400 text-sm mt-2 leading-relaxed">
                        All content, automated calculator outputs, and AI-generated documents on CorpLawUpdates.in are for <strong>informational and educational purposes only</strong>. Nothing on this site constitutes professional legal advice. Always consult a qualified legal professional (Company Secretary, Advocate, or Chartered Accountant) before taking action or making filings based on outputs generated here.
                    </p>
                </div>

                {/* SECTION 1 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        1. Acceptance of Terms
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        By accessing or using corplawupdates.in ("Site") or any of our compliance tools and document generators, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the Site immediately.
                    </p>
                </section>

                {/* SECTION 2 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        2. Nature of Content
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        CorpLawUpdates.in publishes summaries, analyses, and statutory briefs related to Indian corporate laws and regulations issued by MCA, SEBI, RBI, CCI, NCLT, IBBI, and other statutory bodies. This content is:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>For informational and educational purposes only</li>
                        <li>Not a substitute for professional legal advice, audit verification, or formal consultation</li>
                        <li>Not an official publication of any government body or regulatory authority</li>
                        <li>Subject to change without notice as regulations, master circulars, and judicial precedents evolve</li>
                    </ul>
                </section>

                {/* SECTION 2A */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        2A. Compliance Tools, Calculators & Document Generator Disclaimer
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        Our suite of self-service utilities — including the <strong>AI Legal Document Generator, MCA & ROC Fee Calculator, CIN Decoder, Company Search, ROC Compliance Tracker, Compliance Calendar, and RBI Repo Rate Tracker</strong> — are provided strictly as reference aids:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li><strong>Draft Templates:</strong> AI-generated files and document drafts must be reviewed and certified by a qualified Company Secretary, Advocate, or Chartered Accountant before execution or filing.</li>
                        <li><strong>Calculator & Fee Estimates:</strong> Statutory fees, additional filing fees, and adjudication penalty estimates are computed based on published statutory schedules. Actual fees depend on MCA V3 system validations and ROC discretion.</li>
                        <li><strong>Public Data & CIN Lookup:</strong> Company search and CIN decoding utilize public corporate records. Users must cross-verify master data on the official MCA portal (<a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">mca.gov.in</a>).</li>
                        <li><strong>Limitation of Tool Liability:</strong> We accept no liability for any rejected statutory filings, compliance defaults, or financial losses arising from reliance on tool outputs or generated draft templates.</li>
                    </ul>
                </section>

                {/* SECTION 3 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        3. Accuracy of Information
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        We strive to publish accurate, verified, and timely information. However:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Regulatory frameworks change frequently — always verify notifications with official regulator portals</li>
                        <li>We are not liable for any actions taken or omitted based on content published on this site</li>
                        <li>Errors, typographical variations, or omissions may occur and we reserve the right to rectify them</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                        For official, legally binding text, always refer to:
                        <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline mx-1">
                            MCA Portal
                        </a>·
                        <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline mx-1">
                            SEBI Portal
                        </a>·
                        <a href="https://www.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline mx-1">
                            RBI Portal
                        </a>
                    </p>
                </section>

                {/* SECTION 4 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        4. Intellectual Property & Document Ownership
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>All original articles, analyses, and site designs are owned by CorpLawUpdates.in.</li>
                        <li>Regulatory circulars and government notifications are public documents.</li>
                        <li><strong>AI Generated Documents:</strong> We do not claim any ownership over documents you generate using our tools. You own the copyright to your generated files, but you bear sole responsibility for their lawfulness and compliance.</li>
                        <li>You may share our articles with proper attribution and a link back to the original update.</li>
                    </ul>
                </section>

                {/* SECTION 5 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        5. Newsletter Terms
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Newsletter subscription is free and voluntary.</li>
                        <li>You can unsubscribe at any time via the link in every email.</li>
                        <li>Our newsletters contain standard open/click tracking (provided by Resend) to measure campaign performance. By subscribing, you consent to this tracking.</li>
                    </ul>
                </section>

                {/* SECTION 6 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        6. Prohibited Use & Intermediary Guidelines
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        In accordance with the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, users agree not to host, display, upload, modify, or transmit any content or use our AI tools to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Attempt to hack, disrupt, probe, or damage the Site, APIs, or underlying databases.</li>
                        <li>Generate fraudulent corporate instruments, forged board resolutions, unauthorized power of attorney drafts, or impersonate legal entities.</li>
                        <li>Engage in automated bulk scraping or extraction of articles without prior written authorization.</li>
                        <li>Violate any law for the time being in force in the Republic of India.</li>
                    </ul>
                </section>

                {/* SECTION 6A */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        6A. Analytics & Tracking Technologies
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        We use the following privacy-conscious analytics tools on this Site:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Vercel Analytics and Vercel Speed Insights — aggregated anonymous visitor and web performance data</li>
                        <li>Google Analytics (GA4) — visitor session metrics via cookies (if configured)</li>
                        <li>Google Reader Revenue Manager — Google News publication compatibility signals</li>
                    </ul>
                </section>

                {/* SECTION 7 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        7. External Links & Statutory Portals
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Our updates contain direct citations and links to official government portals (MCA, SEBI, RBI, CCI, IBBI) and judicial gazettes. We are not responsible for the server availability, technical changes, or content modifications on third-party government websites.
                    </p>
                </section>

                {/* SECTION 8 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        8. Limitation of Liability & Intermediary Safe Harbor
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        As an informational corporate intelligence platform, CorpLawUpdates.in claims intermediary safe-harbor protection under <strong>Section 79 of the Information Technology Act, 2000</strong>. CorpLawUpdates.in, its founders, and operators shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages resulting from reliance on article commentaries, automated calculation models, or AI draft outputs. Your use of this platform is entirely at your own risk.
                    </p>
                </section>

                {/* SECTION 9 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        9. Governing Law & Dispute Resolution
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        These Terms of Service shall be governed by, interpreted, and construed in accordance with the substantive laws of India. Any legal dispute or proceeding arising out of or in connection with the Site shall be subject to the exclusive jurisdiction of the competent courts in India.
                    </p>
                </section>

                {/* SECTION 10 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        10. Modifications to Terms
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        We reserve the right to amend these Terms of Service at any time to reflect legislative updates or platform improvements. The "Last updated" date will indicate the latest revision. Continued use of the Site signifies your binding acceptance of the updated Terms.
                    </p>
                </section>

                {/* SECTION 11 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        11. Contact & Legal Enquiries
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        For questions or communications regarding these Terms of Service:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-slate-600 dark:text-slate-300 space-y-1 text-sm">
                        <p><strong>Platform:</strong> CorpLawUpdates.in</p>
                        <p><strong>Email:</strong> <a href="mailto:legal@corplawupdates.in" className="text-amber-600 dark:text-amber-400 hover:underline">legal@corplawupdates.in</a></p>
                        <p><strong>Website:</strong> <a href="https://www.corplawupdates.in" className="text-amber-600 dark:text-amber-400 hover:underline">www.corplawupdates.in</a></p>
                    </div>
                </section>

                {/* BOTTOM LINKS */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-8 flex gap-4 flex-wrap">
                    <Link href="/" className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium">
                        ← Back to Home
                    </Link>
                    <Link href="/privacy-policy" className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium">
                        Privacy Policy →
                    </Link>
                </div>

            </div>
        </div>
    )
}
