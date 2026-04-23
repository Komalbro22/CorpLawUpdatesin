'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-8 border-4 border-red-100">
                <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">Something went wrong</h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-10">
                An error occurred while loading this page. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => reset()}
                    className="bg-navy text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-800 transition-colors shadow-md"
                >
                    Try Again
                </button>
                <button
                    onClick={() => { window.location.href = '/' }}
                    className="border-2 border-navy text-navy font-bold py-3 px-8 rounded-lg hover:bg-slate-50 transition-colors inline-block"
                >
                    Go Home
                </button>
            </div>
        </div>
    )
}
