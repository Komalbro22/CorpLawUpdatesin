/**
 * Safely sanitizes Unicode text for WinAnsi (Windows-1252) encoding used by standard PDF fonts.
 * Maps box-drawing characters, currency symbols, dashes, quotes, bullets, and accents into
 * standard WinAnsi equivalents, and strips/normalizes any remaining unencodable code points.
 */
export function sanitizeForWinAnsi(input: string): string {
  if (!input) return ''

  return input
    // 1. Currency
    .replace(/₹/g, 'Rs. ')
    // 2. Box drawing characters & horizontal bars
    .replace(/[═─━―—–_]{3,}/g, (match) => '-'.repeat(Math.min(match.length, 60)))
    .replace(/[═─━]/g, '-')
    .replace(/[│┃]/g, '|')
    .replace(/[┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬]/g, '+')
    .replace(/[▀▄█░▒▓]/g, '#')
    // 3. Smart quotes and apostrophes
    .replace(/[\u2018\u2019\u201A\u201B']/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F"]/g, '"')
    // 4. Dashes & Ellipsis
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    // 5. Arrows
    .replace(/[\u2192\u2794\u279C\u27A1]/g, '->')
    .replace(/[\u2190\u2B05]/g, '<-')
    .replace(/[\u21D2\u27F9]/g, '=>')
    // 6. Bullets & symbols
    .replace(/[\u2022\u25CF\u25CB\u25AA\u25AB\u25C6\u25C7\u2756\u2605\u2606]/g, '*')
    .replace(/[\u2713\u2714\u2705]/g, '[x]')
    .replace(/[\u2717\u2718\u274C]/g, '[ ]')
    // 7. Whitespace normalization
    .replace(/[\u00A0\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    // 8. Fallback: filter out any character outside standard ASCII + Windows-1252 printable range
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, (char) => {
      // Decompose accented characters if possible
      const decomposed = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (/^[\x20-\x7E]$/.test(decomposed)) {
        return decomposed
      }
      return ' '
    })
}
