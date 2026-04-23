/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-9xl font-heading font-black text-gold mb-6 tracking-tighter drop-shadow-sm">404</h1>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">Page Not Found</h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-10">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/"
                    className="bg-navy text-gold font-bold py-3 px-8 rounded-lg hover:bg-slate-800 transition-colors shadow-md"
                >
                    Go Home
                </Link>
                <Link
                    href="/updates"
                    className="border-2 border-navy text-navy font-bold py-3 px-8 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Browse Updates
                </Link>
            </div>
        </div>
    )
}
