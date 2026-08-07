import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { safeCompare, createAdminSessionToken } from '@/lib/utils'
import { redis } from '@/lib/redis-cache'
import { Ratelimit } from '@upstash/ratelimit'

export async function POST(request: NextRequest) {
    try {
        const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const clientIp = rawIp.split(',')[0].trim()
        
        // Atomic sliding-window rate limit: max 5 attempts per 15 minutes per IP
        // Uses @upstash/ratelimit (atomic MULTI/EXEC) — no race condition between incr+expire
        if (redis) {
            const ratelimit = new Ratelimit({
                redis,
                limiter: Ratelimit.slidingWindow(5, '15 m'),
                prefix: 'ratelimit:admin_login',
                analytics: false,
            })
            const { success, remaining } = await ratelimit.limit(clientIp)
            if (!success) {
                return NextResponse.json(
                    { error: `Too many login attempts. Please try again later. (${remaining} attempts remaining)` },
                    { status: 429 }
                )
            }
        }

        const rateLimitKey = `login:${clientIp}`
        
        const { data: row } = await supabaseAdmin
            .from('login_attempts')
            .select('*')
            .eq('ip', rateLimitKey)
            .single()

        let existingAttempts = 0
        let existingRow: any = null

        if (row) {
            existingRow = row
            const windowStart = new Date(row.window_start)
            const now = new Date()
            const diffMinutes = (now.getTime() - windowStart.getTime()) / 60000

            if (diffMinutes < 15 && row.attempts >= 5) {
                return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
            }

            if (diffMinutes >= 15) {
                await supabaseAdmin.from('login_attempts').delete().eq('ip', rateLimitKey)
                existingRow = null
            } else {
                existingAttempts = row.attempts
            }
        }

        const body = await request.json().catch(() => ({ password: '' }))
        const password = body.password

        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminPassword) {
            return NextResponse.json({ error: 'Admin access is not configured' }, { status: 500 })
        }

        if (!safeCompare(password, adminPassword)) {
            await supabaseAdmin.from('login_attempts').upsert({
                ip: rateLimitKey,
                attempts: existingAttempts + 1,
                window_start: existingRow ? existingRow.window_start : new Date().toISOString()
            }, { onConflict: 'ip' })
            
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        }

        // On successful login: clear the DB rate limit record
        await supabaseAdmin.from('login_attempts').delete().eq('ip', rateLimitKey)
        // Note: @upstash/ratelimit sliding window resets automatically; no manual del needed

        const response = NextResponse.json({ success: true })
        response.cookies.set('admin_session', createAdminSessionToken(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/'
        })
        return response

    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
