import { supabase } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'

/**
 * Rounds down a number to the nearest 10 with a '+' suffix (e.g. 183 -> '180+', 201 -> '200+').
 */
export function roundDownLabel(n: number): string {
  if (n <= 0) return '0'
  if (n < 10) return String(n)
  const floor10 = Math.floor(n / 10) * 10
  return `${floor10}+`
}

export interface SiteStats {
  articlesCount: number
  glossaryCount: number
  complianceDeadlinesCount: number
  documentsCount: number
  toolsCount: number
  subscribersCount: number
  articlesLabel: string
  glossaryLabel: string
  complianceDeadlinesLabel: string
  documentsLabel: string
  toolsLabel: string
}

// Fallback ground-truth baseline values
const FALLBACK_STATS: SiteStats = {
  articlesCount: 201,
  glossaryCount: 183,
  complianceDeadlinesCount: 99,
  documentsCount: 34,
  toolsCount: 6,
  subscribersCount: 122,
  articlesLabel: '200+',
  glossaryLabel: '180+',
  complianceDeadlinesLabel: '90+',
  documentsLabel: '30+',
  toolsLabel: '6',
}

export const getSiteStats = unstable_cache(
  async (): Promise<SiteStats> => {
    try {
      const [
        { count: articlesCount },
        { count: glossaryCount },
        { count: complianceDeadlinesCount },
        { count: documentsCount },
        { count: subscribersCount },
      ] = await Promise.all([
        supabase
          .from('updates')
          .select('*', { count: 'exact', head: true })
          .not('published_at', 'is', null)
          .lte('published_at', new Date().toISOString()),
        supabase
          .from('glossary')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('compliance_entries')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('document_templates')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true }),
      ])

      const finalArticles = articlesCount ?? FALLBACK_STATS.articlesCount
      const finalGlossary = glossaryCount ?? FALLBACK_STATS.glossaryCount
      const finalDeadlines = complianceDeadlinesCount ?? FALLBACK_STATS.complianceDeadlinesCount
      const finalDocuments = documentsCount ?? FALLBACK_STATS.documentsCount
      const finalSubscribers = subscribersCount ?? FALLBACK_STATS.subscribersCount
      const finalTools = 6 // 6 live interactive tools currently available

      return {
        articlesCount: finalArticles,
        glossaryCount: finalGlossary,
        complianceDeadlinesCount: finalDeadlines,
        documentsCount: finalDocuments,
        toolsCount: finalTools,
        subscribersCount: finalSubscribers,
        articlesLabel: roundDownLabel(finalArticles),
        glossaryLabel: roundDownLabel(finalGlossary),
        complianceDeadlinesLabel: roundDownLabel(finalDeadlines),
        documentsLabel: roundDownLabel(finalDocuments),
        toolsLabel: String(finalTools),
      }
    } catch (err) {
      console.error('Failed to compute dynamic site stats:', err)
      return FALLBACK_STATS
    }
  },
  ['site-statistics'],
  { revalidate: 3600, tags: ['updates', 'glossary', 'compliance'] }
)
