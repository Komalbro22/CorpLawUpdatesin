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
                    Last updated: October 2026
                </p>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">1. Introduction & Statutory Framework</h2>
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
                                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                                    <td className="p-3 font-bold">Google (GA4 + SWG)</td>
                                    <td className="p-3">Page visits, interactions (if GA4 enabled)</td>
                                    <td className="p-3">Traffic analytics and News integration</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold">Google AdSense &amp; Ad Networks (Prospective / Upon Approval)</td>
                                    <td className="p-3">IP address, cookie identifiers, device telemetry</td>
                                    <td className="p-3">Contextual &amp; personalized ad serving, frequency capping, fraud prevention, and performance reporting</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">5. Advertising &amp; Google AdSense</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        To support our platform and maintain our corporate law intelligence summaries, compliance trackers, and legal calculators free for the professional community, CorpLawUpdates.in may use third-party advertising services, including Google AdSense, if and when the site is approved and advertising is enabled.
                    </p>
                    <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">A. Third-Party Advertising Vendors &amp; Google AdSense</h3>
                            <p>
                                If advertising is enabled, third-party advertising vendors, including Google, may use cookies and similar technologies to serve and measure advertisements. The technologies and choices available depend on the services enabled on this site and your location.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">B. Advertising Cookies, Web Beacons &amp; IP Addresses</h3>
                            <p>
                                If Google advertising is enabled, Google and its partners may use advertising cookies and related data for ad delivery, measurement, frequency management, and invalid-traffic prevention, subject to applicable consent requirements and your settings.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-1.5 text-xs uppercase tracking-wide">C. Personalized Advertising Choices &amp; Opt-Out</h3>
                            <p className="mb-2">
                                You retain complete control over whether ads are personalized to your browsing activity:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 pl-1">
                                <li>
                                    <strong>Google Ads Settings:</strong> You can opt out of personalized advertising by visiting Google&apos;s Ads Settings at{' '}
                                    <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 underline font-semibold">
                                        https://www.google.com/settings/ads
                                    </a>.
                                </li>
                                <li>
                                    <strong>Network Advertising Initiative &amp; DAA Opt-Out:</strong> You may also opt out of third-party advertising vendor cookies for personalized advertising by visiting{' '}
                                    <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 underline font-semibold">
                                        www.aboutads.info/choices
                                    </a>{' '}
                                    or{' '}
                                    <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 underline font-semibold">
                                        www.youronlinechoices.com
                                    </a>.
                                </li>
                                <li>
                                    <strong>Browser Controls:</strong> You can configure your browser to block or delete third-party cookies. Available advertising choices depend on whether advertising is enabled and the consent options presented to you.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">6. Cookies &amp; Analytics Policy</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        CorpLawUpdates.in uses essential cookies, device storage, and privacy-respecting analytics to enhance user navigation and measure platform readership in compliance with the Digital Personal Data Protection (DPDP) Act, 2023 and the DPDP Rules, 2025.
                    </p>

                    <div className="space-y-6 text-slate-600 dark:text-slate-400">
                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">A. Categories of Cookies Employed</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
                                <li><strong>Strictly Necessary Cookies:</strong> Essential for website navigation, security verification, theme persistence (light/dark mode), and administrative sessions.</li>
                                <li><strong>Analytics &amp; Performance Cookies:</strong> Used anonymously via Vercel Analytics and Google Analytics (GA4) to analyze traffic density, top performing regulatory circulars, and Core Web Vitals.</li>
                                <li><strong>Advertising &amp; Targeting Cookies:</strong> May be used by Google AdSense and other advertising partners if and when advertising is enabled, subject to applicable consent requirements.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">B. Managing Your Browser Cookie Settings</h3>
                            <p className="leading-relaxed text-sm">
                                You can control, restrict, or clear cookies through your browser settings (Chrome, Safari, Firefox, Edge).
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">C. European Economic Area (EEA), UK &amp; Swiss Visitors (GDPR)</h3>
                            <p className="leading-relaxed text-sm">
                                Advertising is not enabled for these regions unless the required Google-certified consent management platform (CMP), integrated with the IAB Transparency and Consent Framework, has been configured. If enabled, consent options will be available through that CMP.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-navy dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">D. United States State Privacy Disclosures (CPRA, CCPA, CPA, VCDPA)</h3>
                            <p className="leading-relaxed text-sm mb-2">
                                Residents of California (California Consumer Privacy Act as amended by the CPRA), Colorado, Virginia, Connecticut, Utah, and other US states with comprehensive privacy legislation have specific rights regarding their personal information:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                                <li><strong>Do Not Sell or Share My Personal Information:</strong> We do not sell or share your personal information for monetary consideration. Users can opt out of cross-context behavioral advertising through Google Ads Settings and browser opt-out signals.</li>
                                <li><strong>Right to Know &amp; Access:</strong> You have the right to request disclosure of the categories and specific pieces of personal information we have collected about you over the past 12 months.</li>
                                <li><strong>Right to Delete:</strong> You have the right to request deletion of your personal information, subject to statutory exceptions.</li>
                                <li><strong>Non-Discrimination:</strong> We will never discriminate against you, deny services, or alter pricing because you exercised your statutory privacy rights.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">7. Newsletter &amp; Email Delivery Tracking</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Our newsletters and transactional communications (such as welcome messages and regulatory notifications) use industry-standard email delivery infrastructure provided by Brevo (Sendinblue) and Resend. Standard tracking technology detects when an email is delivered, opened, or links are clicked to ensure high deliverability and measure engagement. This telemetry is used strictly for internal diagnostics and service delivery, and is never sold or shared with any third party. You can unsubscribe or update your email preferences at any time via the one-click unsubscribe link provided in every email.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">8. Data Retention &amp; Purpose Limitation</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        In strict compliance with the purpose limitation and data retention principles under the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>DPDP Rules, 2025</strong>, personal data is retained only for the duration necessary to satisfy the specific purpose for which it was collected or until consent is withdrawn:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        <li><strong>Subscriber emails:</strong> Retained until you unsubscribe. After unsubscribing, your email is marked inactive and permanently deleted within 30 days upon written request.</li>
                        <li><strong>IP addresses &amp; Security Logs:</strong> Retained for a short rolling operational window (maximum 90 days) to prevent bot attacks, enforce rate-limiting, and defend against fraudulent traffic.</li>
                        <li><strong>Document Generator Data:</strong> Draft inputs entered into client-side generators are processed in real-time. Saved user documents in encrypted databases can be permanently erased upon user request.</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 mt-3 italic">To request erasure of your data: legal@corplawupdates.in</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">9. Your Rights (DPDP Act, 2023 &amp; DPDP Rules, 2025)</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                        As a Data Principal under India&apos;s <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and <strong>DPDP Rules, 2025</strong>, you enjoy statutory rights regarding your personal data:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                        <li><strong>Right to Access Information:</strong> Obtain a summary of personal data being processed by us and the processing activities undertaken.</li>
                        <li><strong>Right to Correction &amp; Completion:</strong> Request correction of inaccurate personal data, completion of incomplete data, or updating of outdated records.</li>
                        <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request deletion of your personal data when the purpose for which it was processed is no longer served.</li>
                        <li><strong>Right to Grievance Redressal:</strong> Access an effective, readily available grievance redressal mechanism provided by CorpLawUpdates.in.</li>
                        <li><strong>Right to Nominate:</strong> Nominate another individual who shall, in the event of death or incapacity, exercise your data principal rights in accordance with the DPDP Rules, 2025.</li>
                        <li><strong>Right to Withdraw Consent:</strong> Revoke consent for newsletter communications or data processing at any time with immediate effect.</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 mt-3 italic">To exercise any statutory right, contact our Grievance Officer at: legal@corplawupdates.in</p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">10. Children&apos;s Privacy</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        This site is not intended for persons under 18 years of age. We do not knowingly collect, process, or track data from minors in accordance with Section 9 of the DPDP Act, 2023.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">11. Changes to This Policy</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        We may update this Privacy Policy from time to time to reflect regulatory notices, judicial interpretations, or technological changes. The &quot;Last updated&quot; date at the top of this page indicates the latest revision.
                    </p>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3 mt-8">12. Contact &amp; Grievance Officer</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        In accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>DPDP Rules, 2025</strong>, CorpLawUpdates.in has designated a Grievance Officer to address any inquiries, complaints, or rights requests regarding the processing of your personal data:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-slate-600 dark:text-slate-300 space-y-1.5 text-sm">
                        <p><strong>Grievance Officer:</strong> Komalpreet Singh</p>
                        <p><strong>Role:</strong> Founder &amp; Lead Regulatory Analyst</p>
                        <p><strong>Desk Location:</strong> Lucknow, Uttar Pradesh, India</p>
                        <p><strong>Official Email:</strong> <a href="mailto:legal@corplawupdates.in" className="text-amber-500 hover:underline">legal@corplawupdates.in</a></p>
                        <p><strong>Website:</strong> <a href="https://www.corplawupdates.in" className="text-amber-500 hover:underline">www.corplawupdates.in</a></p>
                        <p><strong>Resolution Timeline:</strong> Grievance communications are acknowledged within 24–48 hours, and substantive resolutions are delivered within statutory deadlines prescribed under the DPDP Rules, 2025 (maximum 30 days).</p>
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
