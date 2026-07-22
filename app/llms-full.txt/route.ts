import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours

export async function GET() {
  const BASE_URL = 'https://www.corplawupdates.in'

  let recentUpdates: Array<{ title: string; slug: string; category: string; summary: string }> = []
  
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('updates')
      .select('title, slug, category, summary')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(50)

    recentUpdates = (data || []) as any[]
  }

  const updatesList = recentUpdates.length > 0
    ? recentUpdates.map(u => `- [${u.title}](${BASE_URL}/updates/${u.slug}): ${u.summary || u.category + ' update'}`).join('\n')
    : '- [MCA & SEBI Circulars](' + BASE_URL + '/updates): Regulatory compliance updates feed.'

  const content = `# CorpLawUpdates.in — Complete Content Map

## Core Pages
- Homepage: ${BASE_URL}
- All Updates Feed: ${BASE_URL}/updates
- Glossary Directory: ${BASE_URL}/glossary
- Compliance Calendar: ${BASE_URL}/calendar
- Tools Directory: ${BASE_URL}/tools
- Document Generator: ${BASE_URL}/documents
- ROC Fee Calculator: ${BASE_URL}/tools/fee-calculator

## Regulatory Categories
- Ministry of Corporate Affairs (MCA): ${BASE_URL}/category/mca
- Securities and Exchange Board of India (SEBI): ${BASE_URL}/category/sebi
- Reserve Bank of India (RBI): ${BASE_URL}/category/rbi
- National Company Law Tribunal (NCLT): ${BASE_URL}/category/nclt
- Insolvency & Bankruptcy Code (IBC): ${BASE_URL}/category/ibc
- Foreign Exchange Management Act (FEMA): ${BASE_URL}/category/fema

## Full Regulatory Articles & Updates (Latest 50)
${updatesList}

## Sitemap & Full Feeds
- XML Sitemap: ${BASE_URL}/sitemap.xml
- RSS Feed: ${BASE_URL}/api/feed.xml
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
