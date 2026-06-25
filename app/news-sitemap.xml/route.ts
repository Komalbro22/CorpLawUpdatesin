import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const BASE_URL = 'https://www.corplawupdates.in'
  
  // Google News requires articles published strictly within the last 48 hours
  const fortyEightHoursAgo = new Date()
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)
  
  const { data: articles, error } = await supabaseAdmin
    .from('updates')
    .select('slug, title, published_at')
    .not('published_at', 'is', null)
    .gte('published_at', fortyEightHoursAgo.toISOString())
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('Error fetching articles for news sitemap:', error)
    return new NextResponse('Error generating news sitemap', { status: 500 })
  }

  // Generate strict Google News XML format
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`

  if (articles && articles.length > 0) {
    articles.forEach(article => {
      // Escape special characters for valid XML
      const escapeXml = (unsafe: string) => {
        return unsafe.replace(/[<>&'"]/g, (c) => {
          switch (c) {
            case '<': return '&lt;'
            case '>': return '&gt;'
            case '&': return '&amp;'
            case '\\'': return '&apos;'
            case '"': return '&quot;'
            default: return c
          }
        })
      }

      const safeTitle = escapeXml(article.title || '')
      const url = `${BASE_URL}/updates/${article.slug}`
      // Google News requires W3C Datetime format, which standard ISO strings provide
      const pubDate = new Date(article.published_at).toISOString()
      
      xml += `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>CorpLawUpdates.in</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`
    })
  }

  xml += `\n</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      // Cache for 5 minutes at edge to prevent DB spam while keeping news fresh
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
