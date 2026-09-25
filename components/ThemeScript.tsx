'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { themeScript } from '@/lib/theme-script'

// Suppress React 19 false-positive warnings for theme scripts in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const origError = console.error
    console.error = (...args: unknown[]) => {
        const fullMsg = args.map(a => (typeof a === 'string' ? a : '')).join(' ')
        if (
            fullMsg.includes('Encountered a script tag') ||
            fullMsg.includes('pagead2.googlesyndication.com') ||
            fullMsg.includes('adsbygoogle')
        ) {
            return
        }
        origError.apply(console, args)
    }
}

export default function ThemeScript() {
    useServerInsertedHTML(() => (
        <script
            id="theme-script"
            dangerouslySetInnerHTML={{ __html: themeScript }}
        />
    ))

    return null
}
