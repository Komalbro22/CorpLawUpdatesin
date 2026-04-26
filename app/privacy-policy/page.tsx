import React from 'react';
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | CorpLawUpdates.in',
    description: 'Privacy Policy for CorpLawUpdates.in — How we collect, use and protect your data.',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-heading font-bold text-navy mb-2">
                    Privacy Policy
                </h1>
                <p className="text-slate-400 text-sm mb-8">
                    Last updated: 26 April 2026
                </p>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">1. Introduction</h2>
                    <p className="text-slate-600 leading-relaxed">
                        CorpLawUpdates.in ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit https://www.corplawupdates.in.
                    </p>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">2. Information We Collect</h2>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>Email address (only when you subscribe to newsletter)</li>
                        <li>Browser type, IP address, pages visited (via analytics — anonymised)</li>
                        <li>We do NOT collect: name, phone, payment info, login credentials (no user accounts)</li>
                    </ul>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">3. How We Use Your Information</h2>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>To send you weekly newsletter of corporate law updates</li>
                        <li>To analyse site traffic and improve content</li>
                        <li>We never sell, rent or share your email with any third party</li>
                    </ul>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">4. Newsletter & Email</h2>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>You can unsubscribe at any time via the unsubscribe link in every email</li>
                        <li>We use Resend (resend.com) to send emails. Your email is stored securely in our database.</li>
                        <li>We send maximum 1-2 emails per week</li>
                    </ul>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">5. Cookies</h2>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>We use minimal cookies for site functionality only</li>
                        <li>No advertising cookies or tracking pixels</li>
                        <li>You can disable cookies in your browser settings</li>
                    </ul>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">6. Third Party Services</h2>
                    <p className="text-slate-600 leading-relaxed mb-2">We use these third-party services:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>Supabase (database hosting) — supabase.com</li>
                        <li>Vercel (website hosting) — vercel.com</li>
                        <li>Resend (email delivery) — resend.com</li>
                        <li>Google Analytics (traffic analytics) — analytics.google.com</li>
                    </ul>
                    <p className="text-slate-600 leading-relaxed mt-2">Each service has its own privacy policy.</p>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">7. Data Retention</h2>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>Newsletter subscriber emails are retained until you unsubscribe</li>
                        <li>After unsubscribe, your email is marked inactive and deleted within 30 days on request</li>
                        <li>To request deletion: corplawupdates@gmail.com</li>
                    </ul>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">8. Your Rights</h2>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>Right to access your data</li>
                        <li>Right to correct your data</li>
                        <li>Right to delete your data</li>
                        <li>Right to unsubscribe at any time</li>
                    </ul>
                    <p className="text-slate-600 leading-relaxed mt-2">Contact us at corplawupdates@gmail.com for any data requests.</p>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">9. Children's Privacy</h2>
                    <p className="text-slate-600 leading-relaxed">
                        This site is not intended for persons under 18 years of age. We do not knowingly collect data from minors.
                    </p>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">10. Changes to This Policy</h2>
                    <p className="text-slate-600 leading-relaxed">
                        We may update this Privacy Policy from time to time. We will notify subscribers via email of significant changes. Continued use of the site constitutes acceptance of the updated policy.
                    </p>
                </section>

                <div className="border-t border-slate-100 my-8"></div>

                <section>
                    <h2 className="text-xl font-bold text-navy mb-3 mt-8">11. Contact</h2>
                    <p className="text-slate-600 leading-relaxed">
                        For privacy-related queries:<br />
                        Email: corplawupdates@gmail.com<br />
                        Website: https://www.corplawupdates.in
                    </p>
                </section>

                <div className="mt-8 text-center sm:text-left">
                    <Link href="/" className="text-navy font-semibold hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
