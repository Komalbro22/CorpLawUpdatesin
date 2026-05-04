import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function hashSHA256(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginPage = pathname === '/admin/login'

    if (isAdminRoute && !isLoginPage) {
        const session = request.cookies.get('admin_session')
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        const adminPassword = process.env.ADMIN_PASSWORD
        const adminSalt = process.env.ADMIN_SECRET_SALT

        if (!adminPassword || !adminSalt) {
            console.error(
                'CRITICAL: ADMIN_PASSWORD or ADMIN_SECRET_SALT missing from environment variables'
            )
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        const expected = await hashSHA256(adminPassword + adminSalt)
        if (session.value !== expected) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
