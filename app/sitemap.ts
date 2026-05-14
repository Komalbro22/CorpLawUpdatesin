import { supabaseAdmin } from '@/lib/supabase-server'
import { MetadataRoute } from 'next'

export const revalidate = 3600

const BASE_URL = 'https://www.corplawupdates.in'

export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {



  const staticUrls = [
    {
      url: BASE_URL,
      lastModified: new Date(),  // Homepage updates daily
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/updates`,
      lastModified: new Date(), // Updates daily
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/rbi/repo-rate`,
      lastModified: new Date('2026-05-10'), // Last rate change
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calendar`,
      lastModified: new Date('2026-05-14'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date('2026-05-14'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
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
      return [...staticUrls]
    }

    const countMap: Record<string, number> = {}
    ;(articles || []).forEach(({ category }) => {
      if (category) {
        const cat = category.toLowerCase()
        countMap[cat] = (countMap[cat] || 0) + 1
      }
    })

    const allCategories = ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema']
    const categoryUrls = allCategories
      .filter(cat => (countMap[cat] || 0) >= 2)
      .map(cat => ({
        url: `${BASE_URL}/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))

    const articleUrls = (articles || []).map((article, index) => {
      let priority = 0.7
      if (index < 5) priority = 0.9
      else if (index < 15) priority = 0.8

      return {
        url: `${BASE_URL}/updates/${article.slug}`,
        lastModified: new Date(
          article.updated_at || article.published_at!
        ),
        changeFrequency: 'weekly' as const,
        priority,
      }
    })

    return [
      ...staticUrls,
      ...categoryUrls,
      ...articleUrls,
    ]
  } catch (err) {
    console.error('Sitemap fetch failed:', err)
    return [...staticUrls]
  }
}
