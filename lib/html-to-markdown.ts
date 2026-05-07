export function htmlToMarkdown(html: string): string {
  let md = html

  // ── BLOCK ELEMENTS ──

  // H1-H6 headings
  md = md.replace(
    /<h1[^>]*>([\s\S]*?)<\/h1>/gi,
    '\n# $1\n'
  )
  md = md.replace(
    /<h2[^>]*>([\s\S]*?)<\/h2>/gi,
    '\n## $1\n'
  )
  md = md.replace(
    /<h3[^>]*>([\s\S]*?)<\/h3>/gi,
    '\n### $1\n'
  )
  md = md.replace(
    /<h4[^>]*>([\s\S]*?)<\/h4>/gi,
    '\n#### $1\n'
  )

  // Paragraphs
  md = md.replace(
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
    '\n$1\n'
  )

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Horizontal rule
  md = md.replace(/<hr[^>]*>/gi, '\n---\n')

  // ── INLINE FORMATTING ──

  // Bold
  md = md.replace(
    /<strong[^>]*>(.*?)<\/strong>/gi,
    '**$1**'
  )
  md = md.replace(
    /<b[^>]*>(.*?)<\/b>/gi,
    '**$1**'
  )

  // Italic
  md = md.replace(
    /<em[^>]*>(.*?)<\/em>/gi,
    '*$1*'
  )
  md = md.replace(
    /<i[^>]*>(.*?)<\/i>/gi,
    '*$1*'
  )

  // Strikethrough
  md = md.replace(
    /<s[^>]*>(.*?)<\/s>/gi,
    '~~$1~~'
  )
  md = md.replace(
    /<del[^>]*>(.*?)<\/del>/gi,
    '~~$1~~'
  )

  // Code inline
  md = md.replace(
    /<code[^>]*>(.*?)<\/code>/gi,
    '`$1`'
  )

  // ── LINKS & IMAGES ──

  // Links
  md = md.replace(
    /<a[^>]+href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi,
    '[$2]($1)'
  )

  // Images — keep as markdown image
  md = md.replace(
    /<img[^>]+src=["'](.*?)["'][^>]*alt=["'](.*?)["'][^>]*\/?>/gi,
    '![$2]($1)'
  )
  md = md.replace(
    /<img[^>]+src=["'](.*?)["'][^>]*\/?>/gi,
    '![]($1)'
  )

  // ── LISTS ──

  // Unordered list items
  md = md.replace(
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
    '- $1\n'
  )
  md = md.replace(/<[uo]l[^>]*>/gi, '\n')
  md = md.replace(/<\/[uo]l>/gi, '\n')

  // ── TABLES ──
  // Keep tables as HTML — markdown tables
  // are limited, HTML tables render better
  // Tables are kept as-is

  // ── SPECIAL DIVS ──
  // Keep styled divs (info boxes, warning boxes)
  // as HTML — they have custom styling we want
  // to preserve

  // But convert simple divs to newlines
  md = md.replace(
    /<div(?![^>]*style)[^>]*>([\s\S]*?)<\/div>/gi,
    '\n$1\n'
  )

  // ── CLEANUP ──

  // Remove remaining HTML tags (except
  // tables, styled divs which we keep)
  // Remove only simple/unstyled tags
  md = md.replace(
    /<(?!table|thead|tbody|tr|th|td|div|img)(\/?)(\w+)[^>]*>/gi,
    ''
  )

  // Fix HTML entities
  md = md.replace(/&amp;/g, '&')
  md = md.replace(/&lt;/g, '<')
  md = md.replace(/&gt;/g, '>')
  md = md.replace(/&nbsp;/g, ' ')
  md = md.replace(/&quot;/g, '"')
  md = md.replace(/&#39;/g, "'")
  md = md.replace(/&ldquo;/g, '"')
  md = md.replace(/&rdquo;/g, '"')
  md = md.replace(/&lsquo;/g, "'")
  md = md.replace(/&rsquo;/g, "'")
  md = md.replace(/&mdash;/g, '—')
  md = md.replace(/&ndash;/g, '–')

  // Clean up excessive blank lines
  md = md.replace(/\n{4,}/g, '\n\n\n')

  // Trim leading/trailing whitespace per line
  md = md.split('\n')
    .map(line => line.trimEnd())
    .join('\n')

  // Trim overall
  return md.trim()
}

// Smart clean — decides what to convert
// and what to keep as HTML
export function smartCleanContent(
  content: string
): {
  cleaned: string
  stats: {
    tagsRemoved: number
    tablesKept: number
    styledDivsKept: number
  }
} {
  // Count tables to report
  const tableCount = (
    content.match(/<table/gi) || []
  ).length

  // Count styled divs (info boxes) to report
  const styledDivCount = (
    content.match(/<div[^>]+style/gi) || []
  ).length

  // Count all HTML tags removed
  const tagsBefore = (
    content.match(/<[^>]+>/g) || []
  ).length

  const cleaned = htmlToMarkdown(content)

  const tagsAfter = (
    cleaned.match(/<[^>]+>/g) || []
  ).length

  return {
    cleaned,
    stats: {
      tagsRemoved: tagsBefore - tagsAfter,
      tablesKept: tableCount,
      styledDivsKept: styledDivCount,
    },
  }
}
