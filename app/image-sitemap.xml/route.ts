import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const BASE_URL = 'https://www.corplawupdates.in'

  const { data: articles } = await supabaseAdmin
    .from('updates')
    .select('slug, title, content, published_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(50)

  function extractFirstImage(
    content: string | null
  ): string | null {
    if (!content) return null
    // Match markdown image
    const mdMatch = content.match(
      /!\[.*?\]\((https?:\/\/[^\)]+)\)/
    )
    if (mdMatch) return mdMatch[1]
    // Match HTML img tag
    const htmlMatch = content.match(
      /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i
    )
    if (htmlMatch) return htmlMatch[1]
    return null
  }

  const urlEntries = (articles || [])
    .map(article => {
      const imageUrl = extractFirstImage(
        article.content
      )
      if (!imageUrl) return null

      const escapedTitle = article.title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      const escapedImageUrl = imageUrl
        .replace(/&/g, '&amp;')

      return `
  <url>
    <loc>${BASE_URL}/updates/${article.slug}</loc>
    <image:image>
      <image:loc>${escapedImageUrl}</image:loc>
      <image:title>${escapedTitle}</image:title>
      <image:caption>${escapedTitle} | CorpLawUpdates.in</image:caption>
    </image:image>
  </url>`
    })
    .filter(Boolean)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 
        'public, max-age=3600, s-maxage=3600',
    },
  })
}
