import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base static routes
    const routes = [
        '',
        '/updates',
        '/about',
        '/newsletter',
    ].map(route => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Categories
    const categories = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA'].map(cat => ({
        url: `${BASE_URL}/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }))

    // Dynamic Articles
    const { data: articles } = await supabase
        .from('updates')
        .select('slug, updated_at')
        .not('published_at', 'is', null)

    const articleRoutes = (articles || []).map(article => ({
        url: `${BASE_URL}/updates/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...categories, ...articleRoutes]
}
