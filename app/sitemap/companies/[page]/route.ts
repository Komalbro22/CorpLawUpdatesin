import { NextRequest, NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const BASE_URL = 'https://www.corplawupdates.in'
  const { page } = await params
  const pageNum = parseInt(page.replace('.xml', '') || '0')
  const pageSize = 50000

  let companies: { cin: string; last_synced_at: string }[] = []

  if (supabaseDocumentsAdmin) {
    const { data } = await supabaseDocumentsAdmin
      .from('companies_master')
      .select('cin, last_synced_at')
      .eq('company_status', 'Active')
      .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1)

    if (data) companies = data
  }

  const urlEntries = companies.map(c => `
    <url>
      <loc>${BASE_URL}/company/${c.cin}</loc>
      <lastmod>${new Date(c.last_synced_at || new Date()).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>
  `).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
