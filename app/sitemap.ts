import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'
import { mcaForms } from '@/data/mca-forms'

export const revalidate = 86400 // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = 'https://www.corplawupdates.in'

  interface SitemapArticle {
    slug: string
    published_at: string | null
    updated_at: string | null
    category: string | null
  }

  interface SitemapGlossaryTerm {
    slug: string
    created_at: string
  }

  // Fetch published articles (paginated to handle > 1000 items)
  const articles: SitemapArticle[] = []
  let articlePage = 0
  const pageSize = 1000
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('updates')
      .select('slug, published_at, updated_at, category')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range(articlePage * pageSize, (articlePage + 1) * pageSize - 1)

    if (error || !data || data.length === 0) break
    articles.push(...(data as SitemapArticle[]))
    if (data.length < pageSize) break
    articlePage++
  }

  // Fetch calendar events
  const { data: compliance_entries } = await supabaseAdmin
    .from('compliance_entries')
    .select('updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)

  // Fetch glossary terms (paginated to handle > 1000 items)
  const glossaryTerms: SitemapGlossaryTerm[] = []
  let glossaryPage = 0
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('glossary')
      .select('slug, created_at')
      .eq('is_verified', true)
      .range(glossaryPage * pageSize, (glossaryPage + 1) * pageSize - 1)

    if (error || !data || data.length === 0) break
    glossaryTerms.push(...(data as SitemapGlossaryTerm[]))
    if (data.length < pageSize) break
    glossaryPage++
  }

  const latestCalendarDate = compliance_entries?.[0]?.updated_at 
    ? new Date(compliance_entries[0].updated_at)
    : new Date('2026-05-14')

  const categoryDates: Record<string, Date> = {}
  let latestArticleDate = new Date('2026-05-14')
  
  if (articles && articles.length > 0) {
    latestArticleDate = new Date(articles[0].published_at!)
    articles.forEach(article => {
      const artDate = new Date(article.updated_at || article.published_at!)
      if (article.category) {
        const cat = article.category.toLowerCase()
        if (!categoryDates[cat] || artDate > categoryDates[cat]) {
          categoryDates[cat] = artDate
        }
      }
    })
  }

  const staticPages = [
    { url: BASE_URL, lastModified: latestArticleDate, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${BASE_URL}/updates`, lastModified: latestArticleDate, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/calendar`, lastModified: latestCalendarDate, changeFrequency: 'weekly' as const, priority: 0.8 },
    {url: `${BASE_URL}/glossary`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/documents`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE_URL}/tools/fee-calculator`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/tools/fee-calculator/companies`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/tools/fee-calculator/llp`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/tools/fee-calculator/msme`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/tools/roc-tracker`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/rbi/repo-rate`, changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${BASE_URL}/newsletter`, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${BASE_URL}/about`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  const categoryPages = Object.entries(categoryDates).map(([cat, date]) => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: date,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const articlePages = (articles || []).map(article => ({
    url: `${BASE_URL}/updates/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at!),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const CONTENT_QUALITY_THRESHOLD = 200

  const glossaryPages = (glossaryTerms || []).map(term => ({
    url: `${BASE_URL}/glossary/${term.slug}`,
    lastModified: new Date(term.created_at),
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }))

  // Fetch active document templates for sitemap SEO indexing
  let docTemplates: any[] = []
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('document_templates')
      .select('slug, updated_at')
      .eq('is_active', true)
    docTemplates = data || []
  }

  const documentPages = (docTemplates || []).map(d => ({
    url: `${BASE_URL}/documents/${d.slug}`,
    lastModified: d.updated_at ? new Date(d.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const companyFormPages = mcaForms.map(form => ({
    url: `${BASE_URL}/tools/fee-calculator/companies/${form.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...articlePages, ...glossaryPages, ...documentPages, ...companyFormPages]
}
