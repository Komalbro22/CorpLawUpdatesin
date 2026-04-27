/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for CorpLawUpdates.in — ' +
        'Informational platform for Indian corporate law updates.',
}

export default function TermsPage() {
    return (
        <div>
            {/* HERO */}
            <div className="bg-navy py-10 px-4 text-center">
                <h1 className="text-3xl font-heading font-bold text-white">
                    Terms of Service
                </h1>
                <p className="text-slate-300 mt-2 text-sm">
                    Last updated: 26 April 2026
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

                {/* NOT LEGAL ADVICE — highlight box */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl">
                    <p className="font-bold text-amber-900 flex items-center gap-2">
                        ⚠️ Important Disclaimer
                    </p>
                    <p className="text-amber-800 text-sm mt-2 leading-relaxed">
                        All content on CorpLawUpdates.in is for <strong> informational and educational purposes only</strong>. Nothing on this site constitutes legal advice. Always consult a qualified legal professional (Company Secretary, Advocate, or Chartered Accountant) before taking any action based on content published here.
                    </p>
                </div>

                {/* SECTION 1 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        1. Acceptance of Terms
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                        By accessing or using corplawupdates.in ("Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the Site immediately.
                    </p>
                </section>

                {/* SECTION 2 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        2. Nature of Content
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-3">
                        CorpLawUpdates.in publishes summaries, analyses and updates related to Indian corporate laws and regulations issued by MCA, SEBI, RBI, NCLT, and other regulatory bodies. This content is:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>For informational purposes only</li>
                        <li>Not a substitute for professional legal advice</li>
                        <li>Not an official publication of any government body</li>
                        <li>Subject to change as regulations evolve</li>
                    </ul>
                </section>

                {/* SECTION 3 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        3. Accuracy of Information
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-3">
                        We strive to publish accurate and timely information. However:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>Regulatory laws change frequently — always verify with official sources (MCA, SEBI, RBI portals)</li>
                        <li>We are not liable for any actions taken based on content published on this site</li>
                        <li>Errors or omissions may occur and we reserve the right to correct them without notice</li>
                    </ul>
                    <p className="text-slate-600 leading-relaxed mt-3">
                        For official and binding information, always refer to:
                        <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline mx-1">
                            MCA Portal
                        </a>·
                        <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline mx-1">
                            SEBI Portal
                        </a>·
                        <a href="https://www.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline mx-1">
                            RBI Portal
                        </a>
                    </p>
                </section>

                {/* SECTION 4 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        4. Intellectual Property
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>All original content, analysis and summaries on this site are owned by CorpLawUpdates.in</li>
                        <li>Regulatory circulars and government notifications are public documents issued by government bodies</li>
                        <li>You may share our content with proper attribution and a link back to the original article</li>
                        <li>You may not republish our original analysis or summaries without prior written permission</li>
                    </ul>
                </section>

                {/* SECTION 5 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        5. Newsletter Terms
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>Newsletter subscription is completely free and voluntary</li>
                        <li>You can unsubscribe at any time via the unsubscribe link in every email</li>
                        <li>We send a maximum of 1-2 emails per week</li>
                        <li>We may discontinue the newsletter at any time with reasonable notice to subscribers</li>
                    </ul>
                </section>

                {/* SECTION 6 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        6. Prohibited Use
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-3">
                        Users must not:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>Attempt to hack, disrupt or damage the Site</li>
                        <li>Use automated bots or scrapers to extract content in bulk</li>
                        <li>Use the Site for any unlawful purpose under Indian law</li>
                        <li>Impersonate CorpLawUpdates.in or its operators</li>
                        <li>Attempt to gain unauthorised access to the admin system</li>
                    </ul>
                </section>

                {/* SECTION 7 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        7. External Links
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                        Our articles may contain links to official government portals (MCA, SEBI, RBI) and other external sites. We are not responsible for the content, accuracy or availability of external websites. Links are provided for reference only.
                    </p>
                </section>

                {/* SECTION 8 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        8. Limitation of Liability
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                        CorpLawUpdates.in and its operators shall not be liable for any direct, indirect, incidental, special or consequential damages arising from use of this Site, reliance on its content, or inability to access the Site. Your use of this Site is entirely at your own risk.
                    </p>
                </section>

                {/* SECTION 9 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        9. Governing Law
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                        These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from use of this Site shall be subject to the exclusive jurisdiction of the competent courts in India.
                    </p>
                </section>

                {/* SECTION 10 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        10. Changes to These Terms
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                        We reserve the right to modify these Terms of Service at any time. We will update the "Last updated" date at the top of this page. Continued use of the Site after any changes constitutes your acceptance of the new Terms.
                    </p>
                </section>

                {/* SECTION 11 */}
                <section className="border-t border-slate-100 pt-8">
                    <h2 className="text-xl font-bold text-navy mb-3">
                        11. Contact
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                        For questions about these Terms of Service:
                    </p>
                    <div className="mt-3 space-y-1">
                        <p className="text-slate-600">
                            📧 Email:{' '}
                            <a href="mailto:corplawupdatesin@gmail.com" className="text-amber-600 hover:underline">
                                corplawupdatesin@gmail.com
                            </a>
                        </p>
                        <p className="text-slate-600">
                            🌐 Website:{' '}
                            <a href="https://www.corplawupdates.in" className="text-amber-600 hover:underline">
                                corplawupdates.in
                            </a>
                        </p>
                    </div>
                </section>

                {/* BOTTOM LINKS */}
                <div className="border-t border-slate-100 pt-8 flex gap-4 flex-wrap">
                    <Link href="/" className="text-amber-600 hover:underline text-sm">
                        ← Back to Home
                    </Link>
                    <Link href="/privacy-policy" className="text-amber-600 hover:underline text-sm">
                        Privacy Policy →
                    </Link>
                </div>

            </div>
        </div>
    )
}
