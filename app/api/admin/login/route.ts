/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { safeCompare, createAdminSessionToken } from '@/lib/utils'
import { redis } from '@/lib/redis-cache'

export async function POST(request: NextRequest) {
    try {
        const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const clientIp = rawIp.split(',')[0].trim()
        
        const limitKey = `ratelimit:admin_login:${clientIp}`
        if (redis) {
            const count = await redis.incr(limitKey)
            if (count === 1) {
                await redis.expire(limitKey, 900)
            }
            if (count > 5) {
                return NextResponse.json({ error: 'Too many login attempts. Please try again in 15 minutes.' }, { status: 429 })
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

        await supabaseAdmin.from('login_attempts').delete().eq('ip', rateLimitKey)
        if (redis) {
            await redis.del(limitKey)
        }

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
