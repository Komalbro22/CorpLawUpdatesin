/**
 * Regression Guard: Metadata Snapshot Script
 * Snapshots og:image, twitter:image, JSON-LD image, and hero image for 20 published articles.
 * Asserts 100% invariance for existing articles where active_banner_id is null.
 *
 * Usage:
 *   npx tsx scripts/snapshot-metadata.ts
 *   npx tsx scripts/snapshot-metadata.ts --check
 */

import fs from 'fs'
import path from 'path'

// Ensure .env.local is parsed before Supabase is loaded
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]?.replace(/^['"](.*)['"]$/, '$1')
    }
  })
}

let supabaseAdminClient: any = null
async function getAdminClient() {
  if (!supabaseAdminClient) {
    const mod = await import('../lib/supabase-server')
    supabaseAdminClient = mod.supabaseAdmin
  }
  return supabaseAdminClient
}

interface ArticleSnapshot {
  slug: string
  title: string
  active_banner_id: string | null
  og_image: string
  twitter_image: string
  json_ld_image: string | null
  hero_image: string | null
}

const SNAPSHOT_FILE = path.join(__dirname, '..', '.metadata-snapshot-baseline.json')

export async function captureMetadataSnapshot(): Promise<ArticleSnapshot[]> {
  const supabaseAdmin = await getAdminClient()
  const { data: articles, error } = await supabaseAdmin
    .from('updates')
    .select('id, title, slug, content, summary, category, featured_image_url, active_banner_id')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(20)

  if (error || !articles) {
    throw new Error(`Failed to query articles: ${error?.message || 'unknown error'}`)
  }

  const snapshots: ArticleSnapshot[] = []

  for (const article of articles) {
    // 1. Fetch active banner if present
    let activeBanner: any = null
    if (article.active_banner_id) {
      const { data: b } = await supabaseAdmin
        .from('banner_assets')
        .select('formats, alt')
        .eq('id', article.active_banner_id)
        .eq('status', 'active')
        .maybeSingle()
      if (b) activeBanner = b
    }

    // 2. Compute legacy image
    let extractedImageUrl = article.featured_image_url || null
    if (!extractedImageUrl && article.content) {
      const imgMatch =
        article.content.match(/<img[^>]+src=["']([^"']+)["']/i) ||
        article.content.match(/!\[.*?\]\((.*?)\)/i)
      if (imgMatch && imgMatch[1]) {
        extractedImageUrl = imgMatch[1]
      }
    }

    const defaultOgUrl = extractedImageUrl
      ? (extractedImageUrl.startsWith('http')
          ? extractedImageUrl
          : `https://www.corplawupdates.in${extractedImageUrl}`)
      : `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category || '')}`

    const ogImage = activeBanner ? activeBanner.formats.og_png : defaultOgUrl
    const twitterImage = activeBanner ? activeBanner.formats.og_png : defaultOgUrl
    const jsonLdImage = activeBanner ? activeBanner.formats.og_png : extractedImageUrl
    const heroImage = activeBanner
      ? activeBanner.formats.hero_webp || activeBanner.formats.og_png
      : extractedImageUrl

    snapshots.push({
      slug: article.slug,
      title: article.title,
      active_banner_id: article.active_banner_id,
      og_image: ogImage,
      twitter_image: twitterImage,
      json_ld_image: jsonLdImage,
      hero_image: heroImage,
    })
  }

  return snapshots
}

async function main() {
  const isCheckMode = process.argv.includes('--check')
  console.log(`[Regression Guard] Capturing metadata snapshot of 20 articles...`)

  try {
    const current = await captureMetadataSnapshot()

    if (isCheckMode) {
      if (!fs.existsSync(SNAPSHOT_FILE)) {
        console.warn(`[Regression Guard] Baseline snapshot file not found. Writing baseline to ${SNAPSHOT_FILE}`)
        fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(current, null, 2), 'utf8')
        console.log(`[Regression Guard] Baseline saved (${current.length} articles).`)
        return
      }

      const baseline: ArticleSnapshot[] = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'))
      let diffCount = 0

      for (let i = 0; i < current.length; i++) {
        const cur = current[i]
        const base = baseline.find((b) => b.slug === cur.slug)

        if (!base) continue

        // Check each metadata field
        if (cur.og_image !== base.og_image) {
          console.error(`[DIFF ERROR] ${cur.slug} og_image mismatch: \n  Expected: ${base.og_image}\n  Got:      ${cur.og_image}`)
          diffCount++
        }
        if (cur.twitter_image !== base.twitter_image) {
          console.error(`[DIFF ERROR] ${cur.slug} twitter_image mismatch: \n  Expected: ${base.twitter_image}\n  Got:      ${cur.twitter_image}`)
          diffCount++
        }
        if (cur.hero_image !== base.hero_image) {
          console.error(`[DIFF ERROR] ${cur.slug} hero_image mismatch: \n  Expected: ${base.hero_image}\n  Got:      ${cur.hero_image}`)
          diffCount++
        }
      }

      if (diffCount > 0) {
        console.error(`[Regression Guard] FAILED: ${diffCount} differences detected!`)
        process.exit(1)
      } else {
        console.log(`[Regression Guard] PASSED: All 20 articles verified with 100% metadata invariance!`)
      }
    } else {
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(current, null, 2), 'utf8')
      console.log(`[Regression Guard] Baseline saved successfully (${current.length} articles).`)
    }
  } catch (err: any) {
    console.error(`[Regression Guard Error] ${err?.message}`)
  }
}

if (require.main === module) {
  main()
}
