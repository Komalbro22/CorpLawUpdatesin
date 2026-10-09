const OPTIMIZED_HOSTS = [
  'i.ibb.co',
  'images.unsplash.com',
  'fcosrsznbxedischtbwe.supabase.co',
  'igglydprjtptmkzvfngg.supabase.co',
]

export function canOptimizeImage(src: string): boolean {
  if (!src) return false
  if (src.startsWith('/')) return true
  try {
    const { hostname } = new URL(src)
    return OPTIMIZED_HOSTS.some((host) => hostname === host || hostname.endsWith('.supabase.co'))
  } catch {
    return false
  }
}

export function getProxiedImageUrl(src?: string | null, width?: number): string | null {
  if (!src || typeof src !== 'string') return null
  const trimmed = src.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }
  try {
    const url = new URL(trimmed)
    if (url.hostname === 'i.ibb.co' || url.hostname.endsWith('.supabase.co')) {
      const wQuery = width ? `&w=${width}` : ''
      return `/api/image-proxy?url=${encodeURIComponent(trimmed)}${wQuery}`
    }
    return trimmed
  } catch {
    return trimmed
  }
}
