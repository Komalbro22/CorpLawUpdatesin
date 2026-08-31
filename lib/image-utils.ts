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
