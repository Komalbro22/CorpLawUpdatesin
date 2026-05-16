export function linkGlossaryTerms(htmlContent: string, glossaryTerms: { term: string, slug: string }[]): string {
  if (!htmlContent) return ''
  
  let linked = htmlContent
  const alreadyLinked = new Set<string>()

  // Sort terms by length descending so longer terms match first (e.g. "Corporate Debtor" before "Debtor")
  const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length)

  sortedTerms.forEach(({ term, slug }) => {
    if (alreadyLinked.has(slug)) return
    
    // Regex explanation:
    // (?<!href="[^"]*) : Negative lookbehind to ensure we are not already inside an href attribute
    // (\b${term}\b)   : The actual term bounded by word boundaries
    // (?![^<]*>)      : Negative lookahead to ensure we are not inside any HTML tag definition (like <img alt="term">)
    // (?![^<]*<\/a>)  : Negative lookahead to ensure we are not inside an anchor tag body <a>term</a>
    // Note: JS regex lookbehinds can be tricky with variable length, but href="[^"]* is safe enough in modern JS/V8.
    
    try {
      const regex = new RegExp(`(?<!href="[^"]*)(?<!<a[^>]*>[^<]*)(\\b${escapeRegExp(term)}\\b)(?![^<]*>)(?![^<]*<\\/a>)`, 'i')
      if (regex.test(linked)) {
        linked = linked.replace(
          regex,
          `<a href="/glossary/${slug}" class="text-gold font-semibold hover:underline" title="${term} definition">$1</a>`
        )
        alreadyLinked.add(slug)
      }
    } catch (e) {
      // In case regex fails due to special characters in the term
      console.error(`Failed to create regex for term: ${term}`, e)
    }
  })

  return linked
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
