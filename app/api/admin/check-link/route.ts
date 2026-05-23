import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'

function isSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }

    const hostname = parsed.hostname.toLowerCase()

    // Block loopback, localhost, and special addresses
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '0.0.0.0'
    ) {
      return false
    }

    // Block private/internal domains
    if (
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan')
    ) {
      return false
    }

    // Block RFC 1918 Private IPv4 ranges and Link-Local/Metadata IPs
    const ipv4Pattern = /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|127\.\d+\.\d+\.\d+|0\.\d+\.\d+\.\d+)$/
    if (ipv4Pattern.test(hostname)) {
      return false
    }

    // Block IPv6 link-local/private ranges
    if (
      hostname.startsWith('[fe80:') ||
      hostname.startsWith('[fc00:') ||
      hostname.startsWith('[fd00:')
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL required' }, { status: 400 }
    )
  }

  if (!isSafeUrl(url)) {
    return NextResponse.json(
      { error: 'Invalid or unsafe URL' }, { status: 400 }
    )
  }

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'CorpLawUpdates-LinkChecker/1.0',
      },
      signal: AbortSignal.timeout(5000),
    })

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
    })
  } catch {
    // Fallback to GET in case HEAD request is not allowed/supported
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'CorpLawUpdates-LinkChecker/1.0',
        },
        signal: AbortSignal.timeout(5000),
      })
      return NextResponse.json({
        ok: res.ok,
        status: res.status,
      })
    } catch {
      return NextResponse.json({
        ok: false,
        status: 0,
      })
    }
  }
}
