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
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed mb-3">
                        CorpLawUpdates.in publishes summaries, analyses, and updates related to Indian corporate laws and regulations issued by MCA, SEBI, RBI, NCLT, and other regulatory bodies. This content is:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>For informational purposes only</li>
                        <li>Not a substitute for professional legal advice or formal consults</li>
                        <li>Not an official publication of any government body</li>
                        <li>Subject to change as regulations and notifications evolve</li>
                    </ul>
                </section>

                {/* SECTION 2A */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        2A. Document Generator & Calculators Disclaimer
                    </h2>
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed mb-3">
                        Our AI Document Generator and statutory calculators (ROC late fee calculator, MSME interest calculator) are reference aids:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li><strong>Draft Templates:</strong> AI-generated files are drafts. They may contain legal mistakes, typographical issues, or omissions. They must be reviewed by a professional before signing.</li>
                        <li><strong>Calculator Estimates:</strong> Penalty calculations are estimates. While we try to keep schedules updated (such as MSME Section 16 Bank Rates), actual filing fees and penalties depend on ROC discretion and official MCA v3 systems.</li>
                        <li><strong>Limitation of Liability:</strong> We hold no liability for any rejected filings, statutory defaults, or financial losses caused by reliance on generated drafts or calculator outputs.</li>
                    </ul>
                </section>

                {/* SECTION 3 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        3. Accuracy of Information
                    </h2>
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed mb-3">
                        We strive to publish accurate and timely information. However:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Regulatory laws change frequently — always verify with official sources (MCA, SEBI, RBI portals)</li>
                        <li>We are not liable for any actions taken based on content published on this site</li>
                        <li>Errors or omissions may occur and we reserve the right to correct them without notice</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                        For official and binding information, always refer to:
                        <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline mx-1">
                            MCA Portal
                        </a>·
                        <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline mx-1">
                            SEBI Portal
                        </a>·
                        <a href="https://www.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline mx-1">
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
                        6. Prohibited Use
                    </h2>
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed mb-3">
                        Users must not:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Attempt to hack, disrupt, or damage the Site or its databases.</li>
                        <li>Use the AI Document Generator to generate fraudulent documents, fake board resolutions, or impersonate other persons/companies.</li>
                        <li>Use automated scrapers to extract articles in bulk.</li>
                        <li>Use the Site for any unlawful purpose under Indian law.</li>
                    </ul>
                </section>

                {/* SECTION 6A */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        6A. Analytics & Tracking Technologies
                    </h2>
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed mb-3">
                        We use the following analytics tools on this Site:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Vercel Analytics and Vercel Speed Insights — anonymous visitor and performance data</li>
                        <li>Google Analytics (GA4) — visitor sessions and interaction data via cookies (if configured)</li>
                        <li>Google Reader Revenue Manager — Google News compatibility signals</li>
                    </ul>
                </section>

                {/* SECTION 7 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        7. External Links
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Our articles contain links to official government portals (MCA, SEBI, RBI) and other external sites. We are not responsible for the content, privacy, or availability of external websites.
                    </p>
                </section>

                {/* SECTION 8 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        8. Limitation of Liability
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        CorpLawUpdates.in and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of this Site, reliance on its content, or reliance on generated document drafts. Your use of this Site is entirely at your own risk.
                    </p>
                </section>

                {/* SECTION 9 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        9. Governing Law
                    </h2>
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed">
                        These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from use of this Site shall be subject to the exclusive jurisdiction of the competent courts in India.
                    </p>
                </section>

                {/* SECTION 10 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        10. Changes to These Terms
                    </h2>
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed">
                        We reserve the right to modify these Terms of Service at any time. We will update the "Last updated" date at the top of this page. Continued use of the Site after any changes constitutes your acceptance of the new Terms.
                    </p>
                </section>

                {/* SECTION 11 */}
                <section className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">
                        11. Contact
                    </h2>
                    <p className="text-slate-600 dark:text-slate-355 leading-relaxed">
                        For questions about these Terms of Service:
                    </p>
                    <div className="mt-3 space-y-1">
                        <p className="text-slate-600 dark:text-slate-400">
                            📧 Email:{' '}
                            <a href="mailto:legal@corplawupdates.in" className="text-amber-505 text-amber-500 hover:underline">
                                legal@corplawupdates.in
                            </a>
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                            🌐 Website:{' '}
                            <a href="https://www.corplawupdates.in" className="text-amber-550 text-amber-500 hover:underline">
                                corplawupdates.in
                            </a>
                        </p>
                    </div>
                </section>

                {/* BOTTOM LINKS */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-8 flex gap-4 flex-wrap">
                    <Link href="/" className="text-amber-500 hover:underline text-sm">
                        ← Back to Home
                    </Link>
                    <Link href="/privacy-policy" className="text-amber-500 hover:underline text-sm">
                        Privacy Policy →
                    </Link>
                </div>

            </div>
        </div>
    )
}
