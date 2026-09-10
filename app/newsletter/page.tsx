import NewsletterWidget from '@/components/NewsletterWidget'
import type { Metadata } from 'next'

export const revalidate = false

export const metadata: Metadata = {
  title: 'Subscribe — Free Corporate Law Newsletter India',
  description: 'Subscribe to India\'s free corporate law newsletter. Weekly MCA, SEBI, RBI updates delivered to your inbox. No spam. Unsubscribe anytime.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/newsletter',
  },
  openGraph: {
    title: 'Subscribe — Free Corporate Law Newsletter India',
    description: 'Subscribe to India\'s free corporate law newsletter. Weekly MCA, SEBI, RBI updates delivered to your inbox. No spam. Unsubscribe anytime.',
    url: 'https://www.corplawupdates.in/newsletter',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=Free%20Corporate%20Law%20Newsletter&category=', width: 1200, height: 630 }],
  },
}

export default function NewsletterPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 min-h-[70dvh] flex flex-col justify-center">
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
                    <h2 className="text-2xl font-bold text-navy dark:text-white mb-6 font-heading border-l-4 border-gold pl-4">
                        Subscribers Receive
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <svg className="size-6 text-gold mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line">Weekly digest of top updates</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="size-6 text-gold mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">Coverage across MCA, SEBI, RBI, NCLT, IBC, FEMA</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="size-6 text-gold mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">Free forever, unsubscribe anytime</span>
                        </li>
                    </ul>

                    <div className="mt-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 italic text-slate-600 dark:text-slate-300 shadow-sm">
                        <span className="font-bold border-r border-slate-300 dark:border-slate-700 pr-2 mr-2 text-navy dark:text-white not-italic">Frequency</span>
                        Sent weekly every Monday morning
                    </div>
                </div>

                {/* 3. Newsletter Widget */}
                <div className="order-1 md:order-2">
                    <div className="transform md:-translate-y-6">
                        <NewsletterWidget />
                    </div>
                    {/* 4. Privacy note */}
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4 px-4 font-medium">
                        We never share your email. Unsubscribe with one click.
                    </p>
                </div>
            </div>

            {/* 5. Instant Broadcast Channels (WhatsApp & Telegram) */}
            <div className="mt-16 bg-gradient-to-br from-slate-900 via-navy to-slate-900 border border-slate-800 text-white rounded-2xl p-8 md:p-10 shadow-xl">
                <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                        ⚡ Real-Time Regulatory Broadcasts
                    </span>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold mb-3">
                        Prefer instant alerts on your phone?
                    </h3>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                        Get breaking circulars, notifications, and compliance alerts directly in WhatsApp or Telegram as soon as they are notified by MCA, SEBI, and RBI.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                    <a
                        href="https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 hover:scale-[1.02]"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Join WhatsApp Channel
                    </a>
                    <a
                        href="https://t.me/corplawupdate"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#229ED9] hover:bg-[#1e8ec3] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 hover:scale-[1.02]"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Join Telegram Channel
                    </a>
                </div>
            </div>
        </div>
    )
}
