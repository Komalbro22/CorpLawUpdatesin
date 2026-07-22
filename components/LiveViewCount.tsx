'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export default function LiveViewCount({ slug, initialViews = 0 }: { slug: string, initialViews?: number }) {
    const [views, setViews] = useState(initialViews)

    useEffect(() => {
        // Fetch any batched views that haven't been synced to the database yet
        fetch(`/api/views/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error(`Server returned ${res.status}`)
                return res.json()
            })
            .then(data => {
                if (data.success && typeof data.batchViews === 'number') {
                    setViews(initialViews + data.batchViews)
                }
            })
            .catch(err => {
                console.error('Failed to fetch live view count:', err)
            })

        // Listen for the optimistic update event from ViewCounter
        const handleView = (e: Event) => {
            const customEvent = e as CustomEvent
            if (customEvent.detail?.slug === slug) {
                setViews(v => v + 1)
            }
        }
        window.addEventListener('article_viewed', handleView)
        return () => window.removeEventListener('article_viewed', handleView)
    }, [slug, initialViews])

    const formattedViews = views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toLocaleString('en-IN')

    return (
        <span 
          className="views-count inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium"
          aria-label={`${views.toLocaleString('en-IN')} article views`}
        >
            <Eye className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
            <span>{formattedViews} views</span>
        </span>
    )
}
