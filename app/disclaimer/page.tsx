import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Disclaimer - CorpLawUpdates.in',
    description: 'Legal disclaimer for CorpLawUpdates.in. This site provides informational content about Indian corporate law and is not a substitute for professional legal advice.',
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://www.corplawupdates.in/disclaimer',
    },
}

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 md:p-12">
                    <h1 className="text-4xl font-heading font-bold text-navy dark:text-white mb-8">
                        Disclaimer
                    </h1>

                    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">General Disclaimer</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                CorpLawUpdates.in (the "Site") is an informational platform dedicated to Indian corporate law, regulatory updates, and compliance information. The content provided on this Site is for general informational purposes only and does not constitute legal advice, professional consultation, or any form of professional service.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                While we strive to ensure the accuracy, completeness, and timeliness of the information published on this Site, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the Site or the information, products, services, or related graphics contained on the Site for any purpose.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Not Legal Advice</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                The content on CorpLawUpdates.in should not be considered a substitute for professional legal advice from a qualified Company Secretary, Chartered Accountant, Legal Practitioner, or other qualified professional. Any reliance you place on such information is therefore strictly at your own risk.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                If you require specific legal advice or assistance with corporate compliance matters, we strongly recommend consulting with a qualified professional who can provide advice tailored to your specific circumstances.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Accuracy of Information</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                We make every effort to ensure that the information on this Site is accurate and up-to-date. However, laws, regulations, and compliance requirements change frequently. Information on this Site may not reflect the most current legal developments or regulatory changes.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                Always verify information with official government sources, including but not limited to the Ministry of Corporate Affairs (MCA), Securities and Exchange Board of India (SEBI), Reserve Bank of India (RBI), Insolvency and Bankruptcy Board of India (IBBI), and the official Gazette of India.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Limitation of Liability</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this Site.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                Through this Site you may be able to link to other websites which are not under the control of CorpLawUpdates.in. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Compliance Tools</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                The compliance tools, calculators, and document generators provided on this Site are for informational and reference purposes only. They are not substitutes for professional advice or official government calculations. Results from these tools should be verified with official sources and, where applicable, qualified professionals.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Sponsored Content</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                CorpLawUpdates.in may publish sponsored articles or guest content. All sponsored content is clearly marked with a "Sponsored" badge and includes a disclosure stating that CorpLawUpdates.in does not necessarily endorse the views or services mentioned. Sponsored content is general information and not legal advice.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                External links in sponsored articles are marked with <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">rel="sponsored"</code> in accordance with Google's guidelines for paid links.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Professional Use</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                While CorpLawUpdates.in is designed to assist Company Secretaries, Chartered Accountants, Cost Accountants, Legal Practitioners, and compliance professionals, the Site is not intended to replace professional judgment or official compliance processes. Users should always exercise their own professional judgment and verify information through official channels.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Updates and Changes</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                We reserve the right to modify, update, or change the content on this Site at any time without prior notice. It is your responsibility to check this disclaimer periodically for changes. Your continued use of the Site following the posting of changes to this disclaimer will be deemed your acceptance of those changes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4">Contact</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                If you have any questions about this disclaimer or the content on this Site, please contact us at:
                            </p>
                            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-4">
                                <li>Email: <a href="mailto:legal@corplawupdates.in" className="text-amber-600 dark:text-amber-400 hover:underline">legal@corplawupdates.in</a></li>
                                <li>Email: <a href="mailto:mail@corplawupdates.in" className="text-amber-600 dark:text-amber-400 hover:underline">mail@corplawupdates.in</a></li>
                                <li>Contact Form: <Link href="/contact" className="text-amber-600 dark:text-amber-400 hover:underline">Contact Page</Link></li>
                            </ul>
                        </section>

                        <section className="pt-6 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                <strong>Last Updated:</strong> 3rd October 2026
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
