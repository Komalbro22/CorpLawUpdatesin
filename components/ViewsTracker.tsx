'use client'

import { useEffect } from 'react'

interface ViewsTrackerProps {
    slug: string
}

export default function ViewsTracker({ slug }: ViewsTrackerProps) {
    useEffect(() => {
        // Client-side debounce
        const viewed = localStorage.getItem(`viewed_${slug}`)
        if (viewed) return

        // Silent fail — views not critical to user experience
        fetch(`/api/views/${slug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            if (res.ok) {
                // Store with timestamp or simply boolean flag
                localStorage.setItem(`viewed_${slug}`, 'true')
            }
        }).catch(() => { })
    }, [slug])

    // Renders nothing — purely tracks views in background
    return null
}
