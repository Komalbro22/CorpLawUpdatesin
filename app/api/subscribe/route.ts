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

        const rawIp = request.headers.get('x-forwarded-for') || 'unknown'
        const clientIp = rawIp.split(',')[0].trim()
        const ipKey = `sub:${clientIp}`

        // Rate limiting logic
        const { data: attemptData } = await supabaseAdmin
            .from('login_attempts')
            .select('attempts, window_start')
            .eq('ip', ipKey)
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
                    .eq('ip', ipKey)
            } else {
                await supabaseAdmin
                    .from('login_attempts')
                    .update({ attempts: 1, window_start: now.toISOString() })
                    .eq('ip', ipKey)
            }
        } else {
            await supabaseAdmin
                .from('login_attempts')
                .insert({ ip: ipKey, attempts: 1, window_start: now.toISOString() })
        }

        // Check subscribers
        const { data: existing } = await supabaseAdmin
            .from('subscribers')
            .select('id, email, is_active')
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
            }
        } else {
            await supabaseAdmin
                .from('subscribers')
                .insert({ email })
        }

        // Send Welcome Email (Non-fatal)
        try {
            const { generateWelcomeEmail } = await import('@/lib/email-templates/welcome')
            const { generateUnsubscribeToken } = await import('@/lib/utils')

            const { data: recentArticles } = await supabaseAdmin
                .from('updates')
                .select('title, slug, summary, category, published_at')
                .not('published_at', 'is', null)
                .lte('published_at', new Date().toISOString())
                .order('published_at', { ascending: false })
                .limit(5)

                        const token = generateUnsubscribeToken(email)
            const welcomeHtml = generateWelcomeEmail({
                email,
                unsubscribeToken: token,
                recentArticles: recentArticles || [],
            })

            const { Resend } = await import('resend')
            const resend = new Resend(process.env.RESEND_API_KEY)

            const { error: emailError } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'updates@mail.corplawupdates.in',
                to: email,
                subject: '🎉 Welcome to CorpLawUpdates.in — Your Free Corporate Law Digest',
                html: welcomeHtml,
                headers: {
                    'List-Unsubscribe': `<https://www.corplawupdates.in/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                },
            })

            if (emailError) {
                console.error('Welcome email failed:', emailError)
            }
        } catch (welcomeErr) {
            console.error('Welcome email error (non-fatal):', welcomeErr)
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Subscribed! Check your inbox for a welcome email.' 
        }, { status: 200 })

    } catch (err: unknown) {
        console.error('Subscribe error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
