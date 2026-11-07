import { supabase } from '@/lib/supabase'

/**
 * Checks whether an unresolved slug might be a base64-encoded article slug (or truncated prefix)
 * circulating in external share links. If it decodes to a valid article slug or prefix,
 * returns the canonical article path for redirection.
 */
export async function resolveBase64SlugRedirect(slug: string): Promise<string | null> {
  try {
    if (!slug) return null
    const cleanSlug = slug.trim()

    // Must be at least 8 chars and contain only base64 / URL-safe base64 characters
    if (cleanSlug.length < 8 || !/^[A-Za-z0-9+/=_-]+$/.test(cleanSlug)) {
      return null
    }

    let normalized = cleanSlug.replace(/-/g, '+').replace(/_/g, '/')
    while (normalized.length % 4 !== 0) {
      normalized += '='
    }

    const decoded = Buffer.from(normalized, 'base64').toString('utf8')
    // Decoded string must look like an article slug prefix (ascii lowercase, numbers, hyphens, min 6 chars)
    if (!/^[a-z0-9-]{6,}$/.test(decoded)) {
      return null
    }

    // 1. Check exact match first
    const { data: exactMatch } = await supabase
      .from('updates')
      .select('slug')
      .ilike('slug', decoded)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .maybeSingle()

    if (exactMatch?.slug) {
      return `/updates/${exactMatch.slug}`
    }

    // 2. Check prefix match (e.g. truncated base64 share)
    const { data: prefixMatch } = await supabase
      .from('updates')
      .select('slug')
      .ilike('slug', `${decoded}%`)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (prefixMatch?.slug) {
      return `/updates/${prefixMatch.slug}`
    }

    return null
  } catch {
    return null
  }
}
