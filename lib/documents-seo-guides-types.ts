export interface QuickSummaryRow {
  label: string
  value: string
}

export interface ClauseExplained {
  title: string
  summary: string
}

export interface DocumentFaq {
  question: string
  answer: string
}

export interface InternalLinkItem {
  label: string
  href: string
  badge?: string
}

export interface DocumentSeoGuide {
  slug: string
  seoTitle: string
  metaDescription: string
  keywords: string[]
  h1: string
  heroBadge: string
  introSummary: string
  quickSummary: QuickSummaryRow[]
  whenRequired: string[]
  clausesExplained: ClauseExplained[]
  executionChecklist: string[]
  relatedDocs: InternalLinkItem[]
  relatedGlossary: InternalLinkItem[]
  faqs: DocumentFaq[]
}
