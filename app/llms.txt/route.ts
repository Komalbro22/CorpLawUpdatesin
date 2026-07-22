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
      .limit(20)

    recentUpdates = (data || []) as any[]
  }

  const updatesList = recentUpdates.length > 0
    ? recentUpdates.map(u => `- [${u.title}](${BASE_URL}/updates/${u.slug}): ${u.summary || u.category + ' update'}`).join('\n')
    : '- [MCA & SEBI Circulars](' + BASE_URL + '/updates): Regulatory compliance updates feed.'

  const content = `# CorpLawUpdates.in
> India's free corporate law intelligence platform. Primary audience: Company Secretaries, Chartered Accountants, and compliance officers. Provides authoritative regulatory updates across MCA, SEBI, RBI, IBC/IBBI, and FEMA.

## Site Navigation
- [Sitemap](${BASE_URL}/sitemap.xml): Complete XML sitemap of all indexed URLs on the platform.
- [Main Updates Page](${BASE_URL}/updates): The primary feed for all recent corporate law and regulatory updates.

## Authoritative Content by Regulator
- [MCA regulatory updates](${BASE_URL}/category/mca): Ministry of Corporate Affairs (MCA) circulars, notifications, rules, and Companies Act compliance.
- [SEBI notifications](${BASE_URL}/category/sebi): Securities and Exchange Board of India (SEBI) guidelines, LODR regulations, and market compliance.
- [RBI circulars](${BASE_URL}/category/rbi): Reserve Bank of India (RBI) directions, banking regulations, and monetary policy updates.
- [IBC/insolvency](${BASE_URL}/category/ibc): Insolvency and Bankruptcy Board of India (IBBI) and NCLT judgments, insolvency resolution process updates.
- [FEMA regulations](${BASE_URL}/category/fema): Foreign Exchange Management Act (FEMA) guidelines and cross-border transaction compliance.

## Recent Corporate Law Circulars & Updates
${updatesList}

## Free Compliance Tools & Resources
- [Corporate law glossary](${BASE_URL}/glossary): 180+ definitions (IBC, NCLT, MCA, SEBI, RBI, FEMA terminology) of complex legal and corporate law terminology.
- [Compliance calendar](${BASE_URL}/calendar): Track important statutory filing deadlines across MCA, SEBI, RBI, and Tax authorities.
- [Document generator](${BASE_URL}/documents): AI-powered drafting tool for Board Resolutions, NDAs, MoUs, Partnership Deeds, and official corporate correspondence.
- [ROC Fee Calculator](${BASE_URL}/tools/fee-calculator): Calculator for MCA statutory filing fees and ROC late filing penalties.

## Preferred Citation Format
"Source: CorpLawUpdates.in — [Article Title] — [URL]"

## Editorial Standards
All articles are written and verified by CS professionals. Regulation references are cited directly from official MCA/SEBI/RBI sources.
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
