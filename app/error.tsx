'use client'

import { useEffect } from 'react'
import { logError } from '@/lib/error-logger'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        logError(error, { component: 'AppGlobalError', digest: error.digest })
    }, [error])

    return (
        <div className="min-h-[70dvh] flex flex-col items-center justify-center px-4 text-center">
            <div className="bg-red-50 dark:bg-red-950/40 p-6 rounded-full mb-8 border-4 border-red-100 dark:border-red-900/40">
                <svg className="size-16 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy dark:text-white mb-4">Something went wrong</h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-10">
                An error occurred while loading this page. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => reset()}
                    className="bg-navy dark:bg-amber-500 text-white dark:text-slate-950 font-bold py-3 px-8 rounded-xl hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                    Try Again
                </button>
                <button
                    onClick={() => { window.location.href = '/' }}
                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-navy dark:text-slate-200 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                    Go Home
                </button>
            </div>
        </div>
    )
}
