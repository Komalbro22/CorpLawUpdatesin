'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                    <div className="bg-red-50 p-4 rounded-full mb-6">
                        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-navy mb-2">Something went wrong loading this content</h2>
                    <p className="text-slate-600 mb-8 max-w-md">
                        {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/"
                            className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
