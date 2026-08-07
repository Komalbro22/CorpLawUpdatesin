import { NextRequest, NextResponse } from 'next/server'

/**
 * CSRF Protection Helper for CorpLawUpdates.in
 * Validates Origin and Referer headers for state-changing requests (POST, PUT, DELETE, PATCH).
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null // Safe read-only methods pass automatically
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const allowedHost = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'
  const host = request.headers.get('host')

  // Build list of valid origin origins
  const allowedOrigins = [
    allowedHost,
    allowedHost.replace('https://www.', 'https://'),
    host ? `https://${host}` : null,
    host ? `http://${host}` : null,
  ].filter(Boolean) as string[]

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000')
  }

  // Check Origin header if present
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => origin.toLowerCase() === allowed.toLowerCase())
    if (!isAllowed) {
      console.warn(`[CSRF Guard] Blocked request with invalid origin: ${origin}`)
      return NextResponse.json({ error: 'Forbidden: Invalid request origin (CSRF protection)' }, { status: 403 })
    }
    return null
  }

  // Fallback to Referer header if Origin is omitted (e.g., some same-site forms)
  if (referer) {
    const isAllowed = allowedOrigins.some(allowed => referer.toLowerCase().startsWith(allowed.toLowerCase()))
    if (!isAllowed) {
      console.warn(`[CSRF Guard] Blocked request with invalid referer: ${referer}`)
      return NextResponse.json({ error: 'Forbidden: Invalid request referrer (CSRF protection)' }, { status: 403 })
    }
    return null
  }

  // For API endpoints called directly via JS fetch, require X-Requested-With or X-CSRF-Token if no origin/referer
  const customHeader = request.headers.get('x-requested-with') || request.headers.get('x-csrf-token')
  if (!customHeader && process.env.NODE_ENV === 'production') {
    console.warn(`[CSRF Guard] Blocked request lacking Origin, Referer, and CSRF headers`)
    return NextResponse.json({ error: 'Forbidden: Missing CSRF verification headers' }, { status: 403 })
  }

  return null
}
