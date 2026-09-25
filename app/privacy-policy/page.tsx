import React from 'react';
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | CorpLawUpdates.in',
    description: 'Privacy Policy for CorpLawUpdates.in — How we collect, use and protect your data.',
    alternates: {
        canonical: 'https://www.corplawupdates.in/privacy-policy',
    },
    openGraph: {
        title: 'Privacy Policy | CorpLawUpdates.in',
        description: 'Privacy Policy for CorpLawUpdates.in — How we collect, use and protect your data.',
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
                    Last updated: 16 September 2026
                </p>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">1. Introduction & Statutory Framework</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        CorpLawUpdates.in ("we", "our", "us") is committed to protecting your privacy and handling your data in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>. This Privacy Policy explains what data we collect, how we use it, your rights, and who we share it with when you visit https://www.corplawupdates.in.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">2. Information We Collect</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">A. Newsletter Subscribers</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>Email address</strong> — collected when you subscribe to our newsletter</li>
                                <li><strong>IP address</strong> — collected at the time of subscription to prevent automated bot signups (rate-limiting). Stored temporarily in our database.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">B. Newsletter & Transactional Email Interaction Data</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">When we send you a newsletter or transactional confirmation (such as a welcome email), we track:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li>Whether the email was <strong>delivered, opened, or clicked</strong></li>
                                <li>Timestamps of open and click events</li>
                            </ul>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 italic">This data is processed via Brevo (Sendinblue) and Resend (our email delivery infrastructure providers) and stored in our database to help us measure delivery reliability and campaign performance.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">C. Document Generator Inputs & Logs</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">When you use our Legal Document Generator, we process:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>Form Inputs</strong> — whatever details you fill (e.g. company names, director DINs, addresses, financial amounts, custom instructions). These are used to render and format the statutory document.</li>
                                <li><strong>Generation Metadata</strong> — we log document type, timestamp, IP address, and token usage to enforce rate limits and monitor server load.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">D. Article View Counts</h3>
                            <p className="text-slate-600 dark:text-slate-400">We count the number of times each article is viewed. <strong>No personal identifiers (IP, name, email) are stored</strong> alongside view counts — only the article slug and a total count.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">E. Website Analytics</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">We use the following analytics tools that automatically collect visitor data:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>Vercel Analytics</strong> — collects anonymous page views, unique visitors, browser type, OS, and geographic region</li>
                                <li><strong>Vercel Speed Insights</strong> — collects Core Web Vitals and page performance metrics</li>
                                <li><strong>Google Analytics (GA4)</strong> — if enabled, collects sessions, interactions, and demographic data via cookies</li>
                                <li><strong>Google Reader Revenue Manager (SWG)</strong> — used for Google News compatibility; may collect content access signals</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-4">We do <strong>not</strong> collect: your name, phone number, payment information, or create user accounts for public visitors.</p>
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
                                    <td className="p-3">To send you our free newsletter of corporate law updates</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-medium">IP address (subscription)</td>
                                    <td className="p-3">To prevent spam/bot subscriptions (rate-limiting only)</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-medium">Open/click events</td>
                                    <td className="p-3">To measure newsletter performance (admin-only dashboard)</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-medium">AI form inputs</td>
                                    <td className="p-3">To draft personalized corporate legal documents dynamically</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Analytics data</td>
                                    <td className="p-3">To understand site traffic and improve content quality</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-4">We <strong>never sell or rent</strong> your personal data to any third party.</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">4. Third-Party Data Processors</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">We share data with the following services, each operating under their own privacy policy:</p>
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
                                    <td className="p-3">Your email address, delivery/open/click telemetry</td>
                                    <td className="p-3">Transactional email delivery (welcome notifications, alerts) and newsletter dispatch</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Resend</td>
                                    <td className="p-3">Your email address, delivery/open/click events</td>
                                    <td className="p-3">Email delivery and tracking</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Supabase</td>
                                    <td className="p-3">All database data including subscriber emails</td>
                                    <td className="p-3">Database hosting and storage</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Google Cloud APIs</td>
                                    <td className="p-3">Document generation inputs</td>
                                    <td className="p-3">Document formatting, translation and template rendering</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Vercel</td>
                                    <td className="p-3">IP address, page visits, performance metrics</td>
                                    <td className="p-3">Website hosting and analytics</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold">Google (GA4 + SWG)</td>
                                    <td className="p-3">Page visits, interactions (if GA4 enabled)</td>
                                    <td className="p-3">Traffic analytics and News integration</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">5. Cookies & Analytics Policy</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        CorpLawUpdates.in uses essential cookies, device storage, and privacy-respecting analytics to enhance user navigation and measure platform readership in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
                    </p>

                    <div className="space-y-6 text-slate-600 dark:text-slate-400">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">A. Categories of Cookies Employed</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
                                <li><strong>Strictly Necessary Cookies:</strong> Essential for website navigation, security verification, theme persistence (light/dark mode), and administrative sessions.</li>
                                <li><strong>Analytics & Performance Cookies:</strong> Used anonymously via Vercel Analytics and Google Analytics (GA4) to analyze traffic density, top performing regulatory circulars, and Core Web Vitals.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">B. Managing Your Browser Cookie Settings</h3>
                            <p className="leading-relaxed text-sm">
                                You can control, restrict, or clear cookies through your browser settings (Chrome, Safari, Firefox, Edge).
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">C. European Economic Area (EEA), UK & Swiss Visitors (GDPR)</h3>
                            <p className="leading-relaxed text-sm">
                                For visitors accessing the site from the European Economic Area (EEA), the United Kingdom, or Switzerland, measurement cookies are managed in compliance with the General Data Protection Regulation (GDPR) and UK GDPR. You may review or modify your consent choices at any time.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">D. United States State Privacy Disclosures (CPRA, CCPA, CPA, VCDPA)</h3>
                            <p className="leading-relaxed text-sm mb-2">
                                Residents of California (California Consumer Privacy Act as amended by the CPRA), Colorado, Virginia, Connecticut, Utah, and other US states with comprehensive privacy legislation have specific rights regarding their personal information:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                                <li><strong>Do Not Sell or Share My Personal Information:</strong> We do not sell or share your personal information for monetary consideration or cross-context behavioral advertising.</li>
                                <li><strong>Right to Know & Access:</strong> You have the right to request disclosure of the categories and specific pieces of personal information we have collected about you over the past 12 months.</li>
                                <li><strong>Right to Delete:</strong> You have the right to request deletion of your personal information, subject to statutory exceptions.</li>
                                <li><strong>Non-Discrimination:</strong> We will never discriminate against you, deny services, or alter pricing because you exercised your statutory privacy rights.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">6. Newsletter & Email Delivery Tracking</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Our newsletters and transactional communications (such as welcome messages and regulatory notifications) use industry-standard email delivery infrastructure provided by Brevo (Sendinblue) and Resend. Standard tracking technology detects when an email is delivered, opened, or links are clicked to ensure high deliverability and measure engagement. This telemetry is used strictly for internal diagnostics and service delivery, and is never sold or shared with any third party. You can unsubscribe or update your email preferences at any time via the one-click unsubscribe link provided in every email.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">7. Data Retention</h2>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        <li><strong>Subscriber emails</strong> — retained until you unsubscribe. After unsubscribing, your email is marked inactive and deleted within 30 days upon written request.</li>
                        <li><strong>IP addresses (rate-limiting)</strong> — retained for a short rolling window only (used to detect abuse; not linked to your email)</li>
                        <li><strong>Generated Documents</strong> — saved draft contents are retained in our database for session retrieval and professional editing purposes. You can request immediate erasure of your documents by contacting us.</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 mt-3 italic">To request deletion of your data: legal@corplawupdates.in</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">8. Your Rights</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">You have the right to:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        <li>Access the personal data we hold about you</li>
                        <li>Correct inaccurate data</li>
                        <li>Request deletion of your data (Right to Erasure)</li>
                        <li>Withdraw consent (unsubscribe) at any time</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 mt-3 italic">To exercise any of these rights, email us at: legal@corplawupdates.in</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">9. Children's Privacy</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        This site is not intended for persons under 18 years of age. We do not knowingly collect data from minors.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">10. Changes to This Policy</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect any changes. For significant changes, we will notify newsletter subscribers via email.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">11. Contact & Grievance Officer</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        For privacy-related queries or to exercise your rights under the Digital Personal Data Protection (DPDP) Act 2023, please contact our designated Grievance Officer:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-slate-600 dark:text-slate-300 space-y-1">
                        <p><strong>Grievance Officer:</strong> Komalpreet Singh</p>
                        <p><strong>Role:</strong> Founder</p>
                        <p><strong>Email:</strong> <a href="mailto:legal@corplawupdates.in" className="text-amber-500 hover:underline">legal@corplawupdates.in</a></p>
                        <p><strong>Website:</strong> <a href="https://www.corplawupdates.in" className="text-amber-500 hover:underline">www.corplawupdates.in</a></p>
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
