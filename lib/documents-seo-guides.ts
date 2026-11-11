import type { DocumentSeoGuide } from './documents-seo-guides-types'
import { RESOLUTION_SEO_GUIDES } from './documents-seo-guides-resolutions'
import { DEEDS_NOTICES_SEO_GUIDES } from './documents-seo-guides-deeds-notices'

export type {
  QuickSummaryRow,
  ClauseExplained,
  DocumentFaq,
  InternalLinkItem,
  DocumentSeoGuide,
} from './documents-seo-guides-types'

export const DOCUMENT_SEO_GUIDES: Record<string, DocumentSeoGuide> = {
  ...RESOLUTION_SEO_GUIDES,
  ...DEEDS_NOTICES_SEO_GUIDES,
}

export function getDocumentSeoGuide(slug: string): DocumentSeoGuide | null {
  return DOCUMENT_SEO_GUIDES[slug] || null
}
