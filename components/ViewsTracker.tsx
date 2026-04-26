'use client'

import { useEffect } from 'react'

interface ViewsTrackerProps {
    slug: string
}

export default function ViewsTracker({ slug }: ViewsTrackerProps) {
    useEffect(() => {
        // Silent fail — views not critical to user experience
        fetch(`/api/views/${slug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).catch(() => { })
    }, [slug])

    // Renders nothing — purely tracks views in background
    return null
}
