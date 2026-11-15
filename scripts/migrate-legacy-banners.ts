/**
 * scripts/migrate-legacy-banners.ts
 *
 * Migration script for converting legacy article featured images to the new banner system.
 *
 * SAFETY RULES:
 * 1. Default mode is DRY-RUN. Does not modify database or storage unless --apply is passed.
 * 2. Does NOT touch any article unless explicit article IDs or slugs are passed via --ids.
 * 3. Keeps old image URL in spec.legacy_url for 100% reversible rollback.
 * 4. Processes in batches of 10 with a 1-second pause to prevent rate limit spikes.
 *
 * Usage:
 *   npx tsx scripts/migrate-legacy-banners.ts --ids=<id1>,<id2>
 *   npx tsx scripts/migrate-legacy-banners.ts --ids=<id1>,<id2> --apply
 */

import fs from 'fs'
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]?.replace(/^['"](.*)['"]$/, '$1')
    }
  })
}

import { supabaseAdmin } from '../lib/supabase-server'
import { persistBannerOutputs } from '../lib/banner/storage'
import sharp from 'sharp'
import { createHash } from 'crypto'

interface MigrationReport {
  article_id: string
  slug: string
  legacy_url: string
  status: 'dry-run' | 'migrated' | 'skipped' | 'failed'
  new_banner_id?: string
  formats?: {
    og_png: string
    hero_webp: string
  }
  error?: string
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const absoluteUrl = url.startsWith('http') ? url : `https://www.corplawupdates.in${url}`
  const res = await fetch(absoluteUrl)
  if (!res.ok) {
    throw new Error(`Failed to download legacy image from ${absoluteUrl}: ${res.statusText}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function migrateLegacyArticle(
  article: any,
  applyMode: boolean
): Promise<MigrationReport> {
  const legacyUrl = article.featured_image_url
  if (!legacyUrl) {
    return {
      article_id: article.id,
      slug: article.slug,
      legacy_url: '',
      status: 'skipped',
      error: 'Article has no featured_image_url',
    }
  }

  try {
    // 1. Download image
    const rawBuffer = await fetchImageBuffer(legacyUrl)

    // 2. Validate & strip EXIF, cover-crop to 1200x630
    const sharpInstance = sharp(rawBuffer).rotate() // autorotate based on EXIF then strip
    const metadata = await sharpInstance.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image file: metadata extraction failed')
    }

    const pngBuffer = await sharp(rawBuffer)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .png({ palette: true, compressionLevel: 9, effort: 7 })
      .toBuffer()

    const webpBuffer = await sharp(rawBuffer)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .webp({ quality: 82, effort: 5 })
      .toBuffer()

    const hash = createHash('sha256').update(pngBuffer).digest('hex')

    if (!applyMode) {
      return {
        article_id: article.id,
        slug: article.slug,
        legacy_url: legacyUrl,
        status: 'dry-run',
        formats: {
          og_png: `articles/${article.slug}/${article.slug}-${hash.slice(0, 8)}-og.png`,
          hero_webp: `articles/${article.slug}/${article.slug}-${hash.slice(0, 8)}-hero.webp`,
        },
      }
    }

    // 3. Upload to storage
    const urls = await persistBannerOutputs(article.slug, hash, pngBuffer, webpBuffer)

    // 4. Archive any current active banner
    await supabaseAdmin
      .from('banner_assets')
      .update({ status: 'archived' })
      .eq('article_id', article.id)
      .eq('status', 'active')

    // 5. Insert new banner asset row
    const { data: newBanner, error: insertError } = await supabaseAdmin
      .from('banner_assets')
      .insert({
        article_id: article.id,
        source: 'legacy',
        spec: {
          v: 1,
          legacy_url: legacyUrl,
          migrated_at: new Date().toISOString(),
        },
        alt: `${article.title} - Official Update Graphic`,
        hash,
        formats: urls,
        status: 'active',
        created_by: 'system:legacy_migration',
      })
      .select('id')
      .single()

    if (insertError || !newBanner) {
      throw new Error(`Failed to insert banner_assets: ${insertError?.message}`)
    }

    // 6. Update updates.active_banner_id
    await supabaseAdmin
      .from('updates')
      .update({ active_banner_id: newBanner.id })
      .eq('id', article.id)

    return {
      article_id: article.id,
      slug: article.slug,
      legacy_url: legacyUrl,
      status: 'migrated',
      new_banner_id: newBanner.id,
      formats: urls,
    }
  } catch (err: any) {
    return {
      article_id: article.id,
      slug: article.slug,
      legacy_url: legacyUrl,
      status: 'failed',
      error: err?.message || 'Migration error',
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const applyMode = args.includes('--apply')
  const idsArg = args.find((a) => a.startsWith('--ids='))

  if (!idsArg) {
    console.error(`[Error] No article IDs specified!`)
    console.error(`Safety requirement: You must provide explicit article IDs or slugs via --ids=<id1>,<id2>`)
    console.error(`Example: npx tsx scripts/migrate-legacy-banners.ts --ids=article-slug-1,article-slug-2`)
    process.exit(1)
  }

  const idsOrSlugs = idsArg
    .replace('--ids=', '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  console.log(`=======================================================`)
  console.log(`LEGACY BANNER MIGRATION RUNNER`)
  console.log(`Mode: ${applyMode ? '🚀 APPLY (LIVE UPDATES)' : '🔍 DRY-RUN (NO DB OR STORAGE WRITES)'}`)
  console.log(`Articles queued: ${idsOrSlugs.length}`)
  console.log(`=======================================================\n`)

  const reports: MigrationReport[] = []
  const batchSize = 10

  for (let i = 0; i < idsOrSlugs.length; i += batchSize) {
    const batch = idsOrSlugs.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)...`)

    for (const item of batch) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item)
      let query = supabaseAdmin.from('updates').select('id, slug, title, featured_image_url')
      if (isUuid) {
        query = query.eq('id', item)
      } else {
        query = query.eq('slug', item)
      }

      const { data: article } = await query.maybeSingle()
      if (!article) {
        reports.push({
          article_id: item,
          slug: item,
          legacy_url: '',
          status: 'failed',
          error: 'Article not found in database',
        })
        continue
      }

      const res = await migrateLegacyArticle(article, applyMode)
      reports.push(res)
      console.log(` -> [${res.status.toUpperCase()}] ${res.slug}`)
    }

    if (i + batchSize < idsOrSlugs.length) {
      console.log('Pausing 1 second between batches...')
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  console.log(`\n=======================================================`)
  console.log(`MIGRATION SUMMARY`)
  console.log(`Total: ${reports.length}`)
  console.log(`Successful: ${reports.filter((r) => r.status === 'migrated' || r.status === 'dry-run').length}`)
  console.log(`Failed/Skipped: ${reports.filter((r) => r.status === 'failed' || r.status === 'skipped').length}`)
  console.log(`=======================================================`)
}

if (require.main === module) {
  main()
}
