import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const BASE_URL = 'https://www.corplawupdates.in'

  // Fetch published articles
  const { data: articles } = await supabaseAdmin
    .from('updates')
    .select('slug, title, content, published_at, updated_at, category')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  // Fetch calendar events to determine latest update
  const { data: compliance_entries } = await supabaseAdmin
    .from('compliance_entries')
    .select('updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)

  const latestCalendarDate = compliance_entries?.[0]?.updated_at 
    ? new Date(compliance_entries[0].updated_at)
    : new Date('2026-05-14')

  // Extract featured image from markdown/HTML content
  function extractFirstImage(content: string | null): string | null {
    if (!content) return null
    const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/)
    if (mdMatch) return mdMatch[1]
    const htmlMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i)
    if (htmlMatch) return htmlMatch[1]
    return null
  }

  // Calculate article categories and latest dates
  const categoryDates: Record<string, Date> = {}
  let latestArticleDate = new Date('2026-05-14') // Fixed fallback
  
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

  const fixedDate = new Date('2026-05-14').toISOString()

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`

  // Helper to add a url block
  function addUrl(loc: string, lastmod: string, changefreq: string, priority: string, image?: { loc: string, title: string, caption: string }) {
    xml += `  <url>\n`
    xml += `    <loc>${loc}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += `    <changefreq>${changefreq}</changefreq>\n`
    xml += `    <priority>${priority}</priority>\n`
    if (image && image.loc) {
      xml += `    <image:image>\n`
      xml += `      <image:loc>${image.loc}</image:loc>\n`
      if (image.title) xml += `      <image:title>${image.title}</image:title>\n`
      if (image.caption) xml += `      <image:caption>${image.caption}</image:caption>\n`
      xml += `    </image:image>\n`
    }
    xml += `  </url>\n`
  }

  // 1. Homepage
  addUrl(BASE_URL, latestArticleDate.toISOString(), 'daily', '1.0')

  // 2. Main pages
  addUrl(`${BASE_URL}/updates`, latestArticleDate.toISOString(), 'daily', '0.8')
  addUrl(`${BASE_URL}/calendar`, latestCalendarDate.toISOString(), 'weekly', '0.8')
  addUrl(`${BASE_URL}/newsletter`, fixedDate, 'yearly', '0.5')

  // 3. Category pages
  const allCategories = ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema']
  allCategories.forEach(cat => {
    // Only include if there is an article in the category to avoid thin content
    if (categoryDates[cat]) {
      addUrl(`${BASE_URL}/category/${cat}`, categoryDates[cat].toISOString(), 'daily', '0.8')
    }
  })

  // 4. Static pages
  const staticPages = ['/about', '/contact', '/privacy-policy', '/terms']
  staticPages.forEach(path => {
    addUrl(`${BASE_URL}${path}`, fixedDate, 'yearly', '0.3')
  })

  // 5. Article pages
  if (articles) {
    articles.forEach(article => {
      const loc = `${BASE_URL}/updates/${article.slug}`
      const lastmod = new Date(article.updated_at || article.published_at!).toISOString()
      const imageUrl = extractFirstImage(article.content)
      
      let imageObj
      if (imageUrl) {
        const escapedTitle = article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const escapedImageUrl = imageUrl.replace(/&/g, '&amp;')
        imageObj = {
          loc: escapedImageUrl,
          title: escapedTitle,
          caption: `${escapedTitle} | CorpLawUpdates.in`
        }
      }
      addUrl(loc, lastmod, 'weekly', '0.6', imageObj)
    })
  }

  xml += `</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
