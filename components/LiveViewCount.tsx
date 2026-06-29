'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export default function LiveViewCount({ slug, initialViews = 0 }: { slug: string, initialViews?: number }) {
    const [views, setViews] = useState(initialViews)

    useEffect(() => {
        // Fetch any batched views that haven't been synced to the database yet
        fetch(`/api/views/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && typeof data.batchViews === 'number') {
                    setViews(initialViews + data.batchViews)
                }
            })
            .catch(() => {}) // silently ignore errors
    }, [slug, initialViews])

    if (views === 0) return null

    return (
        <span className="views-count inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {views.toLocaleString('en-IN')} views
        </span>
    )
}
