/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import UpdatesClient from './UpdatesClient'
import { SkeletonGrid } from '@/components/LoadingSkeleton'
import { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
    title: 'All Updates',
    description: 'Browse all corporate law updates covering MCA, SEBI, RBI, NCLT, IBC and FEMA'
}

export default async function UpdatesPage() {
    const { data, error } = await supabase
        .from('updates')
        .select('*')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })

    const updates = data || []

    const counts: Record<string, number> = {}
    updates.forEach(u => {
        counts[u.category] = (counts[u.category] || 0) + 1
    })

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-8">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy">All Updates</h1>
                <span className="bg-gold/20 text-navy font-bold py-1 px-3 rounded-full text-sm">
                    {updates.length} Total
                </span>
            </div>

            <Suspense fallback={<SkeletonGrid />}>
                <UpdatesClient updates={updates} counts={counts} />
            </Suspense>
        </div>
    )
}
