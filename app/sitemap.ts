import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { mcaForms } from '@/data/mca-forms'

export const revalidate = 3600 // 1 hour edge cache; on-demand revalidated via revalidatePath('/sitemap.xml') on article publish

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = 'https://www.corplawupdates.in'

  interface SitemapArticle {
    slug: string
    published_at: string | null
    updated_at: string | null
    category: string | null
    noindex: boolean
  }

  // Fetch published articles (paginated to handle > 1000 items)
  const articles: SitemapArticle[] = []
  let articlePage = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('updates')
      .select('slug, published_at, updated_at, category, noindex')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .range(articlePage * pageSize, (articlePage + 1) * pageSize - 1)

    if (error || !data || data.length === 0) break
    articles.push(...(data as SitemapArticle[]).filter(article => !article.noindex))
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

  const latestCalendarDate = compliance_entries?.[0]?.updated_at 
    ? new Date(compliance_entries[0].updated_at)
    : undefined

  // Fetch verified glossary terms for sitemap SEO indexing
  const { data: glossaryTerms } = await supabaseAdmin
    .from('glossary')
    .select('slug, created_at')
    .eq('is_verified', true)
    .order('term', { ascending: true })

  // Find latest glossary update date
  let glossaryDate: Date | undefined = undefined
  ;(glossaryTerms || []).forEach(g => {
    if (g.created_at) {
      const dt = new Date(g.created_at)
      if (!glossaryDate || dt > glossaryDate) {
        glossaryDate = dt
      }
    }
  })

  const ALL_CATEGORIES = ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema', 'cci', 'labour', 'ifsca']
  const categoryDates: Record<string, Date | undefined> = {}

  ALL_CATEGORIES.forEach(cat => {
    categoryDates[cat] = undefined
  })
  
  let latestArticleDate: Date | undefined = undefined

  if (articles && articles.length > 0) {
    latestArticleDate = new Date(articles[0].updated_at || articles[0].published_at!)
    articles.forEach(article => {
      const artDate = new Date(article.updated_at || article.published_at!)
      if (article.category && !article.noindex) {
        const cat = article.category.toLowerCase()
        if (!categoryDates[cat] || artDate > categoryDates[cat]!) {
          categoryDates[cat] = artDate
        }
      }
    })
  }

  // Fetch active document templates for sitemap SEO indexing
  let docTemplates: any[] = []
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('document_templates')
      .select('slug, updated_at')
      .eq('is_active', true)
    docTemplates = data || []
  }

  // Find latest document template date
  let latestDocDate: Date | undefined = undefined
  docTemplates.forEach(d => {
    if (d.updated_at) {
      const dt = new Date(d.updated_at)
      if (!latestDocDate || dt > latestDocDate) {
        latestDocDate = dt
      }
    }
  })

  // Date of board-resolution-dividend in DB for board-resolution-for-dividend-declaration
  const dividendDbTpl = docTemplates.find(d => d.slug === 'board-resolution-dividend')
  const dividendDeclarationDate = dividendDbTpl?.updated_at ? new Date(dividendDbTpl.updated_at) : undefined

  // Forms last modified from data/mca-forms.ts
  const mcaFormsLastMod = new Date('2026-10-02T15:43:00+05:30')

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, ...(latestArticleDate ? { lastModified: latestArticleDate } : {}) },
    { url: `${BASE_URL}/updates`, ...(latestArticleDate ? { lastModified: latestArticleDate } : {}) },
    { url: `${BASE_URL}/category`, ...(latestArticleDate ? { lastModified: latestArticleDate } : {}) },
    { url: `${BASE_URL}/calendar`, ...(latestCalendarDate ? { lastModified: latestCalendarDate } : {}) },
    { url: `${BASE_URL}/glossary`, ...(glossaryDate ? { lastModified: glossaryDate } : {}) },
    { url: `${BASE_URL}/documents`, ...(latestDocDate ? { lastModified: latestDocDate } : {}) },
    { url: `${BASE_URL}/documents/board-resolution-for-dividend-declaration`, ...(dividendDeclarationDate ? { lastModified: dividendDeclarationDate } : {}) },

    { url: `${BASE_URL}/tools`, ...(latestArticleDate ? { lastModified: latestArticleDate } : {}) },
    { url: `${BASE_URL}/tools/financial-statements` },
    { url: `${BASE_URL}/tools/financial-statements/balance-sheet` },
    { url: `${BASE_URL}/tools/financial-statements/profit-and-loss` },
    { url: `${BASE_URL}/tools/financial-statements/cash-flow-statement` },
    { url: `${BASE_URL}/tools/cin-decoder` },
    { url: `${BASE_URL}/tools/fee-calculator`, lastModified: mcaFormsLastMod },
    { url: `${BASE_URL}/tools/fee-calculator/companies`, lastModified: mcaFormsLastMod },
    { url: `${BASE_URL}/tools/fee-calculator/ibbi` },
    { url: `${BASE_URL}/tools/fee-calculator/llp` },
    { url: `${BASE_URL}/tools/fee-calculator/msme` },
    { url: `${BASE_URL}/tools/roc-tracker` },
    { url: `${BASE_URL}/rbi/repo-rate` },
    { url: `${BASE_URL}/newsletter` },
    { url: `${BASE_URL}/partners` },
    { url: `${BASE_URL}/editorial-policy` },
    { url: `${BASE_URL}/author/komalpreet-singh`, ...(latestArticleDate ? { lastModified: latestArticleDate } : {}) },
    { url: `${BASE_URL}/about` },
    { url: `${BASE_URL}/contact` },
    { url: `${BASE_URL}/privacy-policy` },
    { url: `${BASE_URL}/terms` },
    { url: `${BASE_URL}/disclaimer` },
  ]

  const categoryPages: MetadataRoute.Sitemap = Object.entries(categoryDates).map(([cat, date]) => ({
    url: `${BASE_URL}/category/${cat}`,
    ...(date ? { lastModified: date } : {}),
  }))

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(article => {
    const rawDate = article.updated_at || article.published_at
    return {
      url: `${BASE_URL}/updates/${article.slug}`,
      ...(rawDate ? { lastModified: new Date(rawDate) } : {}),
    }
  })

  // Dedicated routes or aliases that must not use dynamic [slug] query or redirect
  // Note: 'board-resolution-dividend' 308 redirects to 'board-resolution-for-dividend-declaration', so it is excluded
  const dedicatedSlugs = new Set([
    'board-resolution-dividend',
    'board-resolution-for-dividend-declaration',
  ])

  // Exclude unbuilt dead slugs returning 404/incomplete until fully developed to protect crawl budget
  const unbuiltSlugs = new Set([
    'consultancy-agreement',
    'joint-venture-agreement',
    'simple-mortgage-deed',
    'english-mortgage-deed',
    'mortgage-conditional-sale',
    'letter-of-credit',
  ])

  // Dedicated generator pages with full legal guides and interactive tools
  const dedicatedDocSlugs = [
    'share-transfer-deed',
    'partnership-deed',
    'non-disclosure-agreement',
    'director-appointment-letter',
    'bank-guarantee',
    'lease-agreement',
    'general-power-of-attorney',
  ]

  const docDatesMap = new Map<string, Date | undefined>()

  ;(docTemplates || []).forEach(d => {
    if (!dedicatedSlugs.has(d.slug) && !unbuiltSlugs.has(d.slug)) {
      docDatesMap.set(d.slug, d.updated_at ? new Date(d.updated_at) : undefined)
    }
  })

  // Ensure all 5 core dedicated generator pages are always present in the sitemap
  dedicatedDocSlugs.forEach(slug => {
    if (!docDatesMap.has(slug)) {
      docDatesMap.set(slug, new Date('2026-10-14T22:00:00+05:30'))
    }
  })

  const documentPages: MetadataRoute.Sitemap = Array.from(docDatesMap.entries()).map(([slug, lastModified]) => ({
    url: `${BASE_URL}/documents/${slug}`,
    ...(lastModified ? { lastModified } : {}),
  }))

  const companyFormPages: MetadataRoute.Sitemap = mcaForms.map(form => ({
    url: `${BASE_URL}/tools/fee-calculator/companies/${form.slug}`,
    lastModified: mcaFormsLastMod,
  }))

  const glossaryPages: MetadataRoute.Sitemap = (glossaryTerms || [])
    .filter(g => Boolean(g.slug))
    .map(g => ({
      url: `${BASE_URL}/glossary/${g.slug}`,
      ...(g.created_at ? { lastModified: new Date(g.created_at) } : {}),
    }))

  return [...staticPages, ...categoryPages, ...articlePages, ...documentPages, ...companyFormPages, ...glossaryPages]
}
