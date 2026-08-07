import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function hashHMACSHA256(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
    const hashArray = Array.from(new Uint8Array(signatureBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqualEdge(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false
    }
    let result = 0
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
    const isLoginPage = pathname === '/admin/login' || pathname === '/api/admin/login'

    // CSRF Check on state-changing requests to admin API routes
    if (pathname.startsWith('/api/admin') && !isLoginPage && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method.toUpperCase())) {
        const origin = request.headers.get('origin') || request.headers.get('referer')
        if (origin) {
            const host = request.headers.get('host') || 'www.corplawupdates.in'
            if (!origin.toLowerCase().includes(host.toLowerCase()) && !origin.toLowerCase().includes('localhost')) {
                return NextResponse.json({ error: 'CSRF Origin check failed' }, { status: 403 })
            }
        }
    }

    if (isAdminRoute && !isLoginPage) {
        const session = request.cookies.get('admin_session')
        const isApi = pathname.startsWith('/api/')
        
        const unauthorizedResponse = () => {
            if (isApi) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        if (!session) {
            return unauthorizedResponse()
        }

        const adminPassword = process.env.ADMIN_PASSWORD
        const adminSalt = process.env.ADMIN_SECRET_SALT

        if (!adminPassword || !adminSalt) {
            console.error(
                'CRITICAL: ADMIN_PASSWORD or ADMIN_SECRET_SALT missing from environment variables'
            )
            return unauthorizedResponse()
        }

        const parts = session.value.split('.')
        if (parts.length !== 2) {
            return unauthorizedResponse()
        }

        const [payloadB64, signature] = parts
        const expected = await hashHMACSHA256(payloadB64, adminPassword + adminSalt)
        
        // Timing-safe comparison to prevent timing attacks in Edge runtime
        if (!timingSafeEqualEdge(signature, expected)) {
            return unauthorizedResponse()
        }

        try {
            const payload = JSON.parse(atob(payloadB64))
            if (!payload.exp || Date.now() > payload.exp) {
                return unauthorizedResponse()
            }
        } catch (e) {
            return unauthorizedResponse()
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
}
