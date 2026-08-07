import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export async function GET() {
  const BASE_URL = 'https://www.corplawupdates.in'

  let totalActive = 0
  if (supabaseDocumentsAdmin) {
    const { count } = await supabaseDocumentsAdmin
      .from('companies_master')
      .select('cin', { count: 'exact', head: true })
      .eq('company_status', 'Active')

    totalActive = count || 0
  }

  const numSitemaps = Math.max(1, Math.ceil(totalActive / 50000))
  const sitemapEntries = Array.from({ length: numSitemaps }).map((_, i) => `
    <sitemap>
      <loc>${BASE_URL}/sitemap/companies/${i}.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
  `).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
