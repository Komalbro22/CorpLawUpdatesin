import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { BASE_URL } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data: updates } = await supabase
        .from('updates')
        .select('slug, updated_at, category')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })

    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: BASE_URL + '/updates', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: BASE_URL + '/about', changeFrequency: 'monthly', priority: 0.5 },
        { url: BASE_URL + '/newsletter', changeFrequency: 'monthly', priority: 0.5 },
        {
            url: `${BASE_URL}/calendar`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
    ]

    const categoryPages: MetadataRoute.Sitemap = ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema'].map(cat => ({
        url: BASE_URL + '/category/' + cat,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8
    }))

    const articlePages: MetadataRoute.Sitemap = (updates || []).map(u => ({
        url: BASE_URL + '/updates/' + u.slug,
        lastModified: new Date(u.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7
    }))

    return [...staticPages, ...categoryPages, ...articlePages]
}
