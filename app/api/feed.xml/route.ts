export const revalidate = 3600

import { supabase } from '@/lib/supabase'
import { BASE_URL } from '@/lib/utils'

export async function GET() {
  const { data: articles } = await supabase
    .from('updates')
    .select('title, slug, summary, category, published_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(20)

  const items = (articles || []).map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${BASE_URL}/updates/${a.slug}</link>
      <description><![CDATA[${a.summary}]]></description>
      <pubDate>${new Date(a.published_at!).toUTCString()}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/updates/${a.slug}</guid>
      <category>${a.category}</category>
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CorpLawUpdates.in</title>
    <link>${BASE_URL}</link>
    <description>India's Free Corporate Law Intelligence Platform — MCA, SEBI, RBI, NCLT, IBC and FEMA updates</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/api/feed.xml" 
               rel="self" 
               type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/icon.png</url>
      <title>CorpLawUpdates.in</title>
      <link>${BASE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
