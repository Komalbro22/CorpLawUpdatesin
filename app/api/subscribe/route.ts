/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        const ip = request.headers.get('x-forwarded-for') || 'unknown'

        // Rate limiting logic
        const { data: attemptData } = await supabaseAdmin
            .from('login_attempts')
            .select('*')
            .eq('ip', ip)
            .single()

        const now = new Date()

        if (attemptData) {
            const windowStart = new Date(attemptData.window_start)
            const diffMs = now.getTime() - windowStart.getTime()
            const diffHours = diffMs / (1000 * 60 * 60)

            if (diffHours <= 1) {
                if (attemptData.attempts >= 3) {
                    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
                }
                await supabaseAdmin
                    .from('login_attempts')
                    .update({ attempts: attemptData.attempts + 1 })
                    .eq('ip', ip)
            } else {
                await supabaseAdmin
                    .from('login_attempts')
                    .update({ attempts: 1, window_start: now.toISOString() })
                    .eq('ip', ip)
            }
        } else {
            await supabaseAdmin
                .from('login_attempts')
                .insert({ ip, attempts: 1, window_start: now.toISOString() })
        }

        // Check subscribers
        const { data: existing } = await supabaseAdmin
            .from('subscribers')
            .select('*')
            .eq('email', email)
            .single()

        if (existing) {
            if (existing.is_active) {
                return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
            } else {
                await supabaseAdmin
                    .from('subscribers')
                    .update({ is_active: true, unsubscribed_at: null })
                    .eq('email', email)
                return NextResponse.json({ success: true, message: 'Subscribed successfully' }, { status: 200 })
            }
        }

        await supabaseAdmin
            .from('subscribers')
            .insert({ email })

        return NextResponse.json({ success: true, message: 'Subscribed successfully' }, { status: 200 })

    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
