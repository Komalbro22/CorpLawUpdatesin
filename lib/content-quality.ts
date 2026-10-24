/**
 * Content Quality Gate & Indexing Threshold Utilities
 *
 * Implements the 800-Word Quality Gate for search engine integrity
 * and Google AdSense "Low-Value Content" / "Thin Content" compliance.
 */

export const QUALITY_GATE_WORD_COUNT = 800

/**
 * Strips HTML tags and calculates word count from text/markdown.
 */
export function getWordCount(text?: string | null): number {
  if (!text) return 0
  const clean = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, ' ')
    .replace(/\s*#{1,6}\s+/g, ' ')
    .replace(/[*_~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return 0
  return clean.split(/\s+/).filter(Boolean).length
}

/**
 * Parses embedded METADATA block from glossary extended_note markdown.
 */
export function parseGlossaryMetadata(content?: string | null) {
  if (!content) {
    return {
      hideDefinition: false,
      seoTitle: '',
      seoDescription: '',
      tldr: [] as string[],
      fullForm: '',
      keyNumbers: [] as any[],
      updatedAt: null as string | null,
      noindex: undefined as boolean | undefined,
      cleanContent: '',
    }
  }

  const match = content.match(/^\s*<!--\s*METADATA\s*([\s\S]*?)\s*METADATA\s*-->/)
  if (match) {
    try {
      const metadata = JSON.parse(match[1])
      const cleanContent = content.substring(match[0].length).trim()
      return {
        hideDefinition: !!metadata.hide_definition,
        seoTitle: metadata.seo_title || '',
        seoDescription: metadata.seo_description || '',
        tldr: Array.isArray(metadata.tldr) ? metadata.tldr : [],
        fullForm: metadata.full_form || '',
        keyNumbers: Array.isArray(metadata.key_numbers) ? metadata.key_numbers : [],
        updatedAt: metadata.updated_at || null,
        noindex: metadata.noindex !== undefined ? !!metadata.noindex : undefined,
        cleanContent,
      }
    } catch (e) {
      console.error('[ContentQuality] Error parsing metadata block:', e)
    }
  }

  return {
    hideDefinition: false,
    seoTitle: '',
    seoDescription: '',
    tldr: [] as string[],
    fullForm: '',
    keyNumbers: [] as any[],
    updatedAt: null as string | null,
    noindex: undefined as boolean | undefined,
    cleanContent: content,
  }
}

/**
 * Extracts all text from glossary FAQs array.
 */
export function extractFaqsText(faqs?: any): string {
  if (!faqs) return ''
  if (Array.isArray(faqs)) {
    return faqs
      .map((f: any) => {
        if (!f) return ''
        if (typeof f === 'string') return f
        return `${f.q || f.question || ''} ${f.a || f.answer || ''}`
      })
      .join(' ')
  }
  if (typeof faqs === 'object') {
    return JSON.stringify(faqs)
  }
  return String(faqs)
}

/**
 * Calculates total word count for a glossary entry across:
 * - definition
 * - clean extended_note (without metadata block)
 * - faqs
 */
export function getGlossaryTotalWordCount(term: {
  definition?: string | null
  extended_note?: string | null
  faqs?: any
}): number {
  const meta = parseGlossaryMetadata(term.extended_note)
  const defWords = getWordCount(term.definition)
  const noteWords = getWordCount(meta.cleanContent)
  const faqWords = getWordCount(extractFaqsText(term.faqs))

  return defWords + noteWords + faqWords
}

/**
 * Evaluates whether an article qualifies for indexing (>= 800 words)
 * or should be assigned noindex: true to safeguard AdSense & SEO rankings.
 */
export function evaluateArticleIndexQuality(
  content: string | undefined | null,
  explicitNoindex?: boolean | null
): {
  noindex: boolean
  wordCount: number
  isThinContent: boolean
  qualityNote?: string
} {
  const wordCount = getWordCount(content)
  const isThinContent = wordCount < QUALITY_GATE_WORD_COUNT

  if (typeof explicitNoindex === 'boolean') {
    return {
      noindex: explicitNoindex,
      wordCount,
      isThinContent,
      qualityNote: isThinContent
        ? `Content word count (${wordCount}) is below ${QUALITY_GATE_WORD_COUNT} words.`
        : undefined,
    }
  }

  return {
    noindex: isThinContent,
    wordCount,
    isThinContent,
    qualityNote: isThinContent
      ? `Word count (${wordCount}) is below ${QUALITY_GATE_WORD_COUNT} words; auto-assigned noindex: true to protect AdSense & search quality.`
      : undefined,
  }
}

/**
 * Evaluates whether a glossary entry qualifies for indexing (>= 800 words)
 * or should receive noindex: true.
 */
export function evaluateGlossaryIndexQuality(
  term: {
    definition?: string | null
    extended_note?: string | null
    faqs?: any
  },
  explicitNoindex?: boolean | null
): {
  noindex: boolean
  wordCount: number
  isThinContent: boolean
  qualityNote?: string
} {
  const wordCount = getGlossaryTotalWordCount(term)
  const isThinContent = wordCount < QUALITY_GATE_WORD_COUNT

  if (typeof explicitNoindex === 'boolean') {
    return {
      noindex: explicitNoindex,
      wordCount,
      isThinContent,
      qualityNote: isThinContent
        ? `Total word count (${wordCount}) is below ${QUALITY_GATE_WORD_COUNT} words.`
        : undefined,
    }
  }

  return {
    noindex: isThinContent,
    wordCount,
    isThinContent,
    qualityNote: isThinContent
      ? `Total word count (${wordCount}) is below ${QUALITY_GATE_WORD_COUNT} words; auto-assigned noindex: true to protect AdSense & search quality.`
      : undefined,
  }
}
