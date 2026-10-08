import { NextRequest, NextResponse } from 'next/server'

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

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await response.arrayBuffer()

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.redirect(new URL('/images/og-default.png', request.url))
  }
}
