import React from 'react';
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for CorpLawUpdates.in — How we collect, use and protect your data under the DPDP Act 2023.',
    alternates: {
        canonical: 'https://www.corplawupdates.in/privacy-policy',
    },
    openGraph: {
        title: 'Privacy Policy | CorpLawUpdates.in',
        description: 'Privacy Policy for CorpLawUpdates.in — How we collect, use and protect your data under the DPDP Act 2023.',
        url: 'https://www.corplawupdates.in/privacy-policy',
        images: [{ url: 'https://www.corplawupdates.in/api/og?title=Privacy%20Policy&category=', width: 1200, height: 630 }],
    },
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-dvh bg-white dark:bg-slate-950 transition-colors duration-200">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-heading font-bold text-navy dark:text-slate-100 mb-2">
                    Privacy Policy
                </h1>
                <p className="text-slate-400 text-sm mb-8">
                    Last updated: 15th November 2026
                </p>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">1. Introduction &amp; Statutory Framework</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        CorpLawUpdates.in (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy and handling your data in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, the <strong>DPDP Rules, 2025</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>. This Privacy Policy explains what data we collect, how we use it, your rights, and who we share it with when you visit https://www.corplawupdates.in.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">2. Information We Collect</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">A. Newsletter Subscribers</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>Email address</strong> — collected when you voluntarily subscribe to our regulatory newsletter.</li>
                                <li><strong>IP address</strong> — collected at the time of subscription solely to prevent automated bot abuse and enforce rate limits. Stored temporarily in our database.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">B. Newsletter &amp; Transactional Email Interaction Data</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">When we send you a newsletter dispatch or confirmation email, we record:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li>Whether the email was <strong>delivered, opened, or clicked</strong></li>
                                <li>Timestamps of delivery and open events</li>
                            </ul>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 italic">This telemetry is processed via Brevo (Sendinblue), our email delivery infrastructure provider, and stored in our database to ensure delivery reliability.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">C. Document Generator Inputs &amp; Logs</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">When you use our statutory document generator or legal drafting tools, we process:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>Form Inputs</strong> — the statutory fields you submit (e.g. company names, director DINs, addresses, authorized capital figures). These are processed in real-time to render downloadable DOCX and PDF documents.</li>
                                <li><strong>Generation Metadata</strong> — document template ID, timestamp, and client IP address to prevent denial-of-service abuse.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">D. Article View Counts</h3>
                            <p className="text-slate-600 dark:text-slate-400">We maintain aggregated view counters for statutory articles. <strong>No personal identifiers (IP, name, or email) are stored alongside article view counts</strong> — only the article slug and an integer count.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">E. Website Analytics &amp; Infrastructure Telemetry</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">We utilize the following infrastructure and analytics services:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>AWS Amplify &amp; CloudFront CDN</strong> — serves our web pages globally and captures anonymous HTTP access logs for security and performance routing.</li>
                                <li><strong>Google Analytics 4 (GA4)</strong> — measures aggregate sessions, navigation paths, and reader engagement, subject to your cookie preferences.</li>
                                <li><strong>Microsoft Clarity</strong> — captures anonymous usability metrics and heatmaps to help us diagnose layout issues on statutory tables and calculators.</li>
                                <li><strong>Google Reader Revenue Manager / Subscribe with Google (SwG)</strong> — integrates Google News publisher signals to allow readers to mark CorpLawUpdates as a preferred news source.</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-4">We do <strong>not</strong> collect phone numbers, payment details, or create public visitor accounts.</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">3. How We Use Your Information</h2>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-3 font-bold text-navy dark:text-slate-200">Data</th>
                                    <th className="p-3 font-bold text-navy dark:text-slate-200">Purpose</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600 dark:text-slate-300">
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-medium">Email address</td>
                                    <td className="p-3">To dispatch weekly corporate law updates and regulatory circular notifications</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-medium">IP address (subscription)</td>
                                    <td className="p-3">To prevent automated spam signups and enforce rate limits</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-medium">Email telemetry (opens/clicks)</td>
                                    <td className="p-3">To evaluate email deliverability and manage bounce rates</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-medium">Document generator inputs</td>
                                    <td className="p-3">To format, customize, and compile corporate legal templates</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Aggregated analytics</td>
                                    <td className="p-3">To identify trending compliance topics and improve platform usability</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-4">We <strong>never sell or rent</strong> your personal data to any third party.</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">4. Third-Party Data Processors</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">We engage the following third-party infrastructure processors:</p>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-3 font-bold text-navy dark:text-slate-200">Service</th>
                                    <th className="p-3 font-bold text-navy dark:text-slate-200">What They Receive</th>
                                    <th className="p-3 font-bold text-navy dark:text-slate-200">Purpose</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600 dark:text-slate-300">
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Brevo (Sendinblue)</td>
                                    <td className="p-3">Recipient email address, dispatch telemetry</td>
                                    <td className="p-3">Newsletter and transactional email delivery infrastructure</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">AWS Amplify (Amazon Web Services)</td>
                                    <td className="p-3">Client IP address, request headers, CDN routing logs</td>
                                    <td className="p-3">Cloud website hosting, SSL termination, and edge serverless execution</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Supabase (PostgreSQL)</td>
                                    <td className="p-3">Database records, including subscriber emails and tool logs</td>
                                    <td className="p-3">Relational database hosting and persistent storage</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Google Cloud / Gemini API</td>
                                    <td className="p-3">User-entered document parameters and clause instructions</td>
                                    <td className="p-3">AI clause synthesis, document drafting, and legal variable extraction</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Journey by Mediavine</td>
                                    <td className="p-3">Anonymized device identifiers and cookie consent parameters</td>
                                    <td className="p-3">Programmatic display advertising and ad fraud prevention</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Google (GA4 &amp; SwG)</td>
                                    <td className="p-3">Page interactions (subject to consent) and publisher signals</td>
                                    <td className="p-3">Readership analytics and Google News preferred source integration</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold">Microsoft Clarity</td>
                                    <td className="p-3">Aggregated session navigation and heatmap telemetry</td>
                                    <td className="p-3">User experience analysis and layout diagnostics</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">5. Advertising &amp; Third-Party Ad Networks (Journey by Mediavine)</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        CorpLawUpdates.in remains free to access for corporate law professionals, company secretaries, legal practitioners, and compliance teams. To support our free platform infrastructure and statutory tools, we partner exclusively with Journey by Mediavine for contextual and programmatic display advertising.
                    </p>
                    <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">A. Advertising Cookies &amp; Programmatic Partners</h3>
                            <p>
                                Journey by Mediavine and its certified programmatic demand partners use cookies or device identifiers to serve contextual advertisements, prevent ad fraud, and cap ad repetition based on visits to this and other websites.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">B. Managing Personalized Advertising Preferences</h3>
                            <p>
                                You can learn more about Mediavine's data handling or opt out of personalized advertising by visiting the{' '}
                                <a href="https://www.mediavine.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                                    Mediavine Privacy Policy
                                </a>
                                , the{' '}
                                <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                                    Digital Advertising Alliance Consumer Choices Tool
                                </a>
                                , or via our cookie preferences banner.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">C. Editorial Integrity &amp; Independence</h3>
                            <p>
                                All statutory regulatory summaries, compliance calendars, and legal calculators are curated objectively by our editorial team without advertiser influence or commercial bias.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">6. Sponsored Content &amp; Link Attribution</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        CorpLawUpdates.in may occasionally publish guest articles or partner updates. These articles are clearly labelled as &quot;Sponsored&quot; and include an editorial disclosure.
                    </p>
                    <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">A. External Link Attribution</h3>
                            <p>
                                External links within sponsored materials are marked with <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-xs">rel=&quot;sponsored noopener noreferrer&quot;</code> attributes in strict accordance with search guidelines.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">B. No Personal Data Sharing with Sponsors</h3>
                            <p>
                                We do not share subscriber emails or reader information with external sponsors or guest authors.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">7. Cookies &amp; Consent Management</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        CorpLawUpdates.in uses essential cookies, local device storage, and privacy-respecting analytics in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
                    </p>

                    <div className="space-y-6 text-slate-600 dark:text-slate-400">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">A. Cookie Categories</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
                                <li><strong>Essential Cookies:</strong> Required for site navigation, security verification, and theme preference persistence. These cannot be disabled.</li>
                                <li><strong>Analytics Cookies:</strong> Used by Google Analytics 4 and Microsoft Clarity to evaluate aggregate traffic and interface performance. These operate subject to your consent.</li>
                                <li><strong>Advertising Cookies:</strong> Utilized by Journey by Mediavine to deliver programmatic display advertising, cap frequency, and combat click fraud.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">B. Google Consent Mode v2</h3>
                            <p className="leading-relaxed text-sm">
                                We implement Google Consent Mode v2 with advertising telemetry (<code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-xs">ad_storage</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-xs">ad_user_data</code>, and <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-xs">ad_personalization</code>) set to denied by default for EEA, UK, and Swiss visitors until explicit affirmative consent is provided.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">C. International &amp; Regional Privacy Disclosures</h3>
                            <p className="leading-relaxed text-sm">
                                We respect statutory consumer privacy rights under GDPR (for European visitors) and state privacy regulations including CCPA/CPRA (California), VCDPA (Virginia), and CPA (Colorado). We do not sell or share personal information for cross-context behavioral advertising.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">8. Newsletter &amp; Email Delivery Infrastructure</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Our weekly regulatory updates and transactional notifications (such as subscription confirmations) are dispatched using Brevo (Sendinblue). Telemetry regarding email delivery and open status is used exclusively to maintain list health, process unsubscribe requests, and monitor deliverability. Every email includes an immediate, one-click unsubscribe mechanism.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">9. Data Retention &amp; Purpose Limitation</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        In accordance with the DPDP Act, 2023 and DPDP Rules, 2025, personal data is retained only for the duration necessary to satisfy the purpose for which it was collected:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        <li><strong>Subscriber emails:</strong> Retained until you unsubscribe. Once unsubscribed, your address is deactivated from all outbound broadcasts.</li>
                        <li><strong>Security &amp; Rate-Limit Logs:</strong> IP records are kept on a rolling operational window (maximum 90 days) to defend against brute-force and scraping abuse.</li>
                        <li><strong>Document Generator Data:</strong> Form parameters are processed in real-time during compilation and are not repurposed for training or commercial profiling.</li>
                    </ul>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">10. Your Rights (DPDP Act, 2023 &amp; DPDP Rules, 2025)</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                        As a Data Principal under India&apos;s <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, you hold statutory rights regarding your personal data:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li><strong>Right to Access Information:</strong> Obtain confirmation and a summary of your personal data being processed.</li>
                        <li><strong>Right to Correction &amp; Erasure:</strong> Request correction of inaccurate data or deletion of your email address.</li>
                        <li><strong>Right to Grievance Redressal:</strong> Access an effective grievance resolution mechanism.</li>
                        <li><strong>Right to Nominate:</strong> Nominate an individual to exercise your rights in the event of death or incapacity.</li>
                        <li><strong>Right to Withdraw Consent:</strong> Revoke consent for newsletter communications at any time.</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 mt-3 italic">To exercise any statutory right, contact: legal@corplawupdates.in</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">11. Children&apos;s Privacy</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        This site is intended for corporate professionals and compliance practitioners. We do not knowingly collect, process, or track personal data from individuals under 18 years of age in accordance with Section 9 of the DPDP Act, 2023.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">12. Contact &amp; Grievance Officer</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        In accordance with the DPDP Act, 2023 and DPDP Rules, 2025, our designated Grievance Officer contact details are as follows:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-slate-600 dark:text-slate-300 space-y-1.5 text-sm">
                        <p><strong>Grievance Officer:</strong> Komalpreet Singh</p>
                        <p><strong>Role:</strong> Founder &amp; Lead Regulatory Analyst</p>
                        <p><strong>Desk Location:</strong> Lucknow, Uttar Pradesh, India</p>
                        <p><strong>Official Email:</strong> <a href="mailto:legal@corplawupdates.in" className="text-amber-500 hover:underline">legal@corplawupdates.in</a></p>
                        <p><strong>Website:</strong> <a href="https://www.corplawupdates.in" className="text-amber-500 hover:underline">www.corplawupdates.in</a></p>
                        <p><strong>Resolution Timeline:</strong> Grievance inquiries are acknowledged within 24–48 hours, and substantive resolutions are provided within 30 days as prescribed by law.</p>
                    </div>
                </section>

                <div className="mt-8 text-center sm:text-left">
                    <Link href="/" className="text-navy dark:text-amber-400 font-semibold hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
