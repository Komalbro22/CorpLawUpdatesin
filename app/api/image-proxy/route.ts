import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

// Allowed image hostnames to prevent open-proxy / SSRF abuse
const ALLOWED_HOSTS = new Set([
  'i.ibb.co',
  'images.unsplash.com',
  'fcosrsznbxedischtbwe.supabase.co',
  'igglydprjtptmkzvfngg.supabase.co',
])

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_HOSTS.has(hostname)) return true
  if (hostname.endsWith('.supabase.co')) return true
  return false
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')
  const widthParam = searchParams.get('w')

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  try {
    const parsed = new URL(targetUrl)

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 })
    }

    if (!isAllowedHost(parsed.hostname)) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.redirect(new URL('/images/og-default.png', request.url))
    }

    const rawContentType = (response.headers.get('content-type') || 'image/jpeg').toLowerCase()
    const imageBuffer = Buffer.from(await response.arrayBuffer())

    // If SVG or non-raster, serve directly
    if (rawContentType.includes('svg')) {
      return new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }

    // Target width: default 720 for card thumbnails, max clamped between 100 and 1200
    let targetWidth = 720
    if (widthParam) {
      const parsedW = parseInt(widthParam, 10)
      if (!isNaN(parsedW) && parsedW >= 100 && parsedW <= 1200) {
        targetWidth = parsedW
      }
    }

    // Modern format WebP optimization with sharp
    try {
      const optimizedBuffer = await sharp(imageBuffer)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer()

      return new Response(optimizedBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Vary': 'Accept',
        },
      })
    } catch {
      // Fallback to original buffer if sharp fails
      return new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': rawContentType,
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }
  } catch {
    return NextResponse.redirect(new URL('/images/og-default.png', request.url))
  }
}
