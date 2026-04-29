
import type { Metadata } from 'next'

export const revalidate = false

export const metadata: Metadata = {
  title: 'About — India\'s Free Corporate Law Platform',
  description: 'Learn about CorpLawUpdates.in — India\'s free corporate law intelligence platform providing MCA, SEBI, RBI updates for CS professionals.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/about',
  },
}

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* 1. Hero */}
            <section className="bg-navy text-white p-10 md:p-16 rounded-2xl mb-12 text-center shadow-lg">
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">About CorpLawUpdates.in</h1>
                <p className="text-xl text-slate-300">Empowering professionals with timely legal intelligence.</p>
            </section>

            {/* 2. What We Do */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-4 border-l-4 border-gold pl-4">What We Do</h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                    We aggregate, verify, and summarize Indian corporate law updates from multiple regulatory bodies.
                    Our mission is to make legal updates accessible, structured, and free forever for everyone.
                </p>
            </section>

            {/* 3. Who We Serve */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-6 border-l-4 border-gold pl-4">Who We Serve</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Corporate Lawyers', 'Compliance Officers', 'CS Professionals (ICSI)', 'Law Students'].map((item) => (
                        <div key={item} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center shadow-sm">
                            <svg className="w-6 h-6 text-gold mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-navy">{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. What We Cover */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-6 border-l-4 border-gold pl-4">What We Cover</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">MCA</h3>
                        <p className="text-slate-600">Company law, incorporation, compliance and governance updates</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">SEBI</h3>
                        <p className="text-slate-600">Capital markets, listing, investor protection updates</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">RBI</h3>
                        <p className="text-slate-600">Banking regulation, FEMA, foreign exchange & monetary policy</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">NCLT</h3>
                        <p className="text-slate-600">Insolvency, mergers, acquisitions and corporate disputes</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">IBC</h3>
                        <p className="text-slate-600">Insolvency and Bankruptcy Code — Resolution process, liquidation and creditor rights updates</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-xl text-navy mb-2">FEMA</h3>
                        <p className="text-slate-600">Cross-border transactions and foreign investment updates</p>
                    </div>
                </div>
            </section>

            {/* 5. How It Works */}
            <section className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-navy mb-4 border-l-4 border-gold pl-4">How It Works</h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                    Every piece of information is curated manually by legal professionals who review circulars, notifications, and orders from regulatory websites daily to provide accurate summaries.
                </p>
            </section>

            {/* 6. DISCLAIMER */}
            <section className="bg-red-50 border-2 border-amber-400 p-8 rounded-2xl">
                <h3 className="font-bold text-red-700 text-xl mb-3 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Important Disclaimer
                </h3>
                <p className="text-red-900 font-medium">
                    The content on CorpLawUpdates.in is for informational purposes only and does not constitute legal advice.
                    Always consult a qualified legal professional for advice specific to your situation.
                </p>
            </section>
        </div>
    )
}
