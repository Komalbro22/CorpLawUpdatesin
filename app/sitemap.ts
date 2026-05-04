import { supabaseAdmin } from '@/lib/supabase-server'
import { MetadataRoute } from 'next'

export const revalidate = 3600

const BASE_URL = 'https://www.corplawupdates.in'

export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {

  const categoryUrls = [
    'mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema'
  ].map(cat => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const staticUrls = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: 'https://www.corplawupdates.in/rbi/repo-rate',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/updates`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
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

  try {
    const { data: articles, error } = await supabaseAdmin
      .from('updates')
      .select('slug, published_at, updated_at, category')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Sitemap Supabase error:', error)
      return [...staticUrls, ...categoryUrls]
    }

    const articleUrls = (articles || []).map(article => ({
      url: `${BASE_URL}/updates/${article.slug}`,
      lastModified: new Date(
        article.updated_at || article.published_at!
      ),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [
      ...staticUrls,
      ...categoryUrls,
      ...articleUrls,
    ]
  } catch (err) {
    console.error('Sitemap fetch failed:', err)
    return [...staticUrls, ...categoryUrls]
  }
}
