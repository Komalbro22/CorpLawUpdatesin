// Rate limiting for Banner API endpoints (30 previews/hr, 20 writes/hr per API key)
const inMemoryBannerCounts = new Map<string, { count: number; windowStart: number }>()

export function checkBannerRateLimit(
  keyId: string,
  type: 'preview' | 'write'
): { ok: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour window
  const maxRequests = type === 'preview' ? 30 : 20
  const bucketKey = `${keyId}:banner:${type}`

  const entry = inMemoryBannerCounts.get(bucketKey)
  if (!entry || now - entry.windowStart > windowMs) {
    inMemoryBannerCounts.set(bucketKey, { count: 1, windowStart: now })
    return { ok: true }
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000)
    return { ok: false, retryAfter: Math.max(1, retryAfter) }
  }

  entry.count++
  return { ok: true }
}
