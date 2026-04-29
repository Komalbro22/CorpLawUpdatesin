import NewsletterWidget from '@/components/NewsletterWidget'
import type { Metadata } from 'next'

export const revalidate = false

export const metadata: Metadata = {
  title: 'Subscribe — Free Corporate Law Newsletter India',
  description: 'Subscribe to India\'s free corporate law newsletter. Weekly MCA, SEBI, RBI updates delivered to your inbox. No spam. Unsubscribe anytime.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/newsletter',
  },
}

export default function NewsletterPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 min-h-[70vh] flex flex-col justify-center">
            {/* 1. Hero */}
            <div className="bg-navy text-white p-10 md:p-16 rounded-2xl shadow-xl text-center mb-12">
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">Stay Ahead of Corporate Law</h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                    Get the most important regulatory changes delivered to your inbox every week.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* 2. What subscribers get */}
                <div className="order-2 md:order-1">
                    <h2 className="text-2xl font-bold text-navy mb-6 font-heading border-l-4 border-gold pl-4">
                        Subscribers Receive
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <svg className="w-6 h-6 text-gold mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700 font-medium whitespace-pre-line">Weekly digest of top updates</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-6 h-6 text-gold mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700 font-medium">Coverage across MCA, SEBI, RBI, NCLT, IBC, FEMA</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-6 h-6 text-gold mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700 font-medium">Free forever, unsubscribe anytime</span>
                        </li>
                    </ul>

                    <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-slate-600 shadow-sm">
                        <span className="font-bold border-r border-slate-300 pr-2 mr-2">Frequency</span>
                        Sent weekly every Monday morning
                    </div>
                </div>

                {/* 3. Newsletter Widget */}
                <div className="order-1 md:order-2">
                    <div className="transform md:-translate-y-6">
                        <NewsletterWidget />
                    </div>
                    {/* 4. Privacy note */}
                    <p className="text-center text-sm text-slate-500 mt-4 px-4 font-medium">
                        We never share your email. Unsubscribe with one click.
                    </p>
                </div>
            </div>
        </div>
    )
}
