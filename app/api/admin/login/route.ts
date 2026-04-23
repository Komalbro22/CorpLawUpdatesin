/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generateAdminSessionHash } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
        
        const { data: row } = await supabaseAdmin
            .from('login_attempts')
            .select('*')
            .eq('ip', clientIp)
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
                await supabaseAdmin.from('login_attempts').delete().eq('ip', clientIp)
                existingRow = null
            } else {
                existingAttempts = row.attempts
            }
        }

        const body = await request.json().catch(() => ({ password: '' }))
        const password = body.password

        if (password !== process.env.ADMIN_PASSWORD) {
            await supabaseAdmin.from('login_attempts').upsert({
                ip: clientIp,
                attempts: existingAttempts + 1,
                window_start: existingRow ? existingRow.window_start : new Date().toISOString()
            }, { onConflict: 'ip' })
            
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        }

        await supabaseAdmin.from('login_attempts').delete().eq('ip', clientIp)

        const response = NextResponse.json({ success: true })
        response.headers.set('Set-Cookie', `admin_session=${generateAdminSessionHash()}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`)
        return response

    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
