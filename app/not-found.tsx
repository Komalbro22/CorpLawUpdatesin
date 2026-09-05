/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    robots: {
        index: false,
        follow: true,
    },
}

export default function NotFound() {
    return (
        <div className="min-h-[70dvh] flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-8xl sm:text-9xl font-heading font-black text-amber-600 dark:text-gold mb-6 tracking-tighter tabular-nums drop-shadow-sm">404</h1>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy dark:text-white mb-4">Page Not Found</h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-10">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/"
                    className="bg-navy dark:bg-amber-500 text-gold dark:text-slate-950 font-bold py-3 px-8 rounded-xl hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                    Go Home
                </Link>
                <Link
                    href="/updates"
                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-navy dark:text-slate-200 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                    Browse Updates
                </Link>
            </div>
        </div>
    )
}
