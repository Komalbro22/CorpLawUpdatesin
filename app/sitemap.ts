import { supabase } from '@/lib/supabase'
import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.corplawupdates.in'

export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {

  const { data: articles } = await supabase
    .from('updates')
    .select('slug, published_at, updated_at, category')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  const articleUrls = (articles || []).map(article => ({
    url: `${BASE_URL}/updates/${article.slug}`,
    lastModified: new Date(
      article.updated_at || article.published_at!
    ),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

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

  return [
    ...staticUrls,
    ...categoryUrls,
    ...articleUrls,
  ]
}
