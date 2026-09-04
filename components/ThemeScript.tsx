'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { themeScript } from '@/lib/theme-script'

// Suppress React 19 false-positive warning for theme scripts in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const origError = console.error
    console.error = (...args: unknown[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
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
