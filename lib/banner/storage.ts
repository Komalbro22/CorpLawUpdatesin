export interface BannerStorage {
  upload(path: string, buffer: Buffer, contentType: string): Promise<string>
  getPublicUrl(path: string): Promise<string> | string
}

async function getAdminClient() {
  const { supabaseAdmin } = await import('@/lib/supabase-server')
  return supabaseAdmin
}

export class SupabaseBannerStorage implements BannerStorage {
  private bucket: string

  constructor(bucket: string = process.env.BANNER_STORAGE_BUCKET || 'banners') {
    this.bucket = bucket
  }

  /**
   * Upload an image buffer to Supabase Storage with 1-year immutable caching
   */
  async upload(path: string, buffer: Buffer, contentType: string): Promise<string> {
    const supabaseAdmin = await getAdminClient()
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true,
        cacheControl: 'public, max-age=31536000, immutable',
      })

    if (error) {
      // Fallback: If 'banners' bucket does not exist yet in Supabase project, try 'article-images' bucket
      if (this.bucket !== 'article-images' && error.message?.toLowerCase().includes('bucket not found')) {
        console.warn(`[BannerStorage] Bucket '${this.bucket}' not found, falling back to 'article-images'`)
        const fallback = new SupabaseBannerStorage('article-images')
        return fallback.upload(`banners/${path}`, buffer, contentType)
      }
      throw new Error(`Banner storage upload failed: ${error.message}`)
    }

    return this.getPublicUrl(path)
  }

  /**
   * Retrieve the CDN/public URL for a stored banner asset
   */
  async getPublicUrl(path: string): Promise<string> {
    const supabaseAdmin = await getAdminClient()
    const { data } = supabaseAdmin.storage
      .from(this.bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }
}

export const defaultBannerStorage = new SupabaseBannerStorage()

export interface BannerFormatUrls {
  og_png: string
  hero_webp: string
}

/**
 * Persist rendered PNG and WebP buffers into storage according to the naming pattern:
 * articles/{slug}/{slug}-{hash8}-og.png
 * articles/{slug}/{slug}-{hash8}-hero.webp
 */
export async function persistBannerOutputs(
  slug: string,
  hash: string,
  pngBuffer: Buffer,
  webpBuffer: Buffer,
  storage: BannerStorage = defaultBannerStorage
): Promise<BannerFormatUrls> {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'banner'

  const hash8 = hash.slice(0, 8)
  const ogPath = `articles/${safeSlug}/${safeSlug}-${hash8}-og.png`
  const heroPath = `articles/${safeSlug}/${safeSlug}-${hash8}-hero.webp`

  const [ogUrl, heroUrl] = await Promise.all([
    storage.upload(ogPath, pngBuffer, 'image/png'),
    storage.upload(heroPath, webpBuffer, 'image/webp'),
  ])

  return {
    og_png: ogUrl,
    hero_webp: heroUrl,
  }
}
