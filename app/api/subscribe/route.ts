/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { redis } from '@/lib/redis-cache'
import { sendEmail, getActiveEmailProvider, parseSender } from '@/lib/email-provider'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

        const allowedProfessions = new Set(['CA', 'CS', 'CMA', 'Advocate', 'Student', 'Other'])
        const hasProfession = Object.prototype.hasOwnProperty.call(body, 'profession')
        const profession = typeof body.profession === 'string' && allowedProfessions.has(body.profession)
            ? body.profession
            : null
        const professionOther = profession === 'Other' && typeof body.profession_other === 'string'
            ? body.profession_other.trim().slice(0, 60) || null
            : null
        const hasFrequency = Object.prototype.hasOwnProperty.call(body, 'frequency')
        const frequency = body.frequency === 'Daily' ? 'Daily' : 'Weekly'
        const allowedSources = new Set(['gazette-pdf', 'template', 'other'])
        const hasSource = Object.prototype.hasOwnProperty.call(body, 'source')
        const source = typeof body.source === 'string' && allowedSources.has(body.source)
            ? body.source
            : 'other'
        const hasSourcePage = Object.prototype.hasOwnProperty.call(body, 'source_page')
        const sourcePage = typeof body.source_page === 'string'
            ? body.source_page.trim().slice(0, 2048) || null
            : null

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const clientIp = rawIp.split(',')[0].trim()
        
        const limitKey = `ratelimit:newsletter:${clientIp}`
        if (redis) {
            const count = await redis.incr(limitKey)
            if (count === 1) {
                await redis.expire(limitKey, 3600)
            }
            if (count > 3) {
                return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
            }
        }

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
        const { data: existing, error: existingError } = await supabaseAdmin
            .from('subscribers')
            .select('id, is_active')
            .eq('email', email)
            .maybeSingle()

        if (existingError) throw existingError

        const subscriberMetadata = {
            profession,
            profession_other: professionOther,
            frequency,
            source,
            source_page: sourcePage,
        }
        const submittedMetadata = {
            ...(hasProfession ? { profession, profession_other: professionOther } : {}),
            ...(hasFrequency ? { frequency } : {}),
            ...(hasSource ? { source } : {}),
            ...(hasSourcePage ? { source_page: sourcePage } : {}),
        }

        if (existing) {
            if (existing.is_active) {
                const { error: updateError } = await supabaseAdmin
                    .from('subscribers')
                    .update(submittedMetadata)
                    .eq('id', existing.id)
                if (updateError) throw updateError
            } else {
                const { error: updateError } = await supabaseAdmin
                    .from('subscribers')
                    .update({ is_active: true, unsubscribed_at: null, ...subscriberMetadata })
                    .eq('id', existing.id)
                if (updateError) throw updateError
            }
        } else {
            const { error: insertError } = await supabaseAdmin
                .from('subscribers')
                .insert({ email, ...subscriberMetadata })
            if (insertError) throw insertError
        }

        // Keep Supabase signup successful if Brevo contact metadata cannot be updated.
        const brevoApiKey = process.env.BREVO_API_KEY?.trim()
        if (brevoApiKey) {
            try {
                const response = await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        'api-key': brevoApiKey,
                    },
                    body: JSON.stringify({
                        email,
                        attributes: {
                            ...(profession ? { PROFESSION: profession } : {}),
                            ...(hasFrequency ? { FREQUENCY: frequency } : {}),
                            ...(hasSource ? { SOURCE: source } : {}),
                        },
                        updateEnabled: true,
                    }),
                })

                if (!response.ok) {
                    console.error('[Subscribe] Brevo contact upsert failed with status:', response.status)
                }
            } catch (brevoError) {
                console.error('[Subscribe] Brevo contact upsert request failed:',
                    brevoError instanceof Error ? brevoError.name : 'Unknown error')
            }
        } else {
            console.warn('[Subscribe] Brevo contact upsert skipped: BREVO_API_KEY is not configured.')
        }

        // Send Welcome Email for new or reactivated subscribers (Non-fatal).
        if (!existing?.is_active) try {
            const provider = getActiveEmailProvider()
            if (provider === 'none') {
                console.warn('[Subscribe] No active email provider configured. Skipping welcome email.')
            } else {
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

                const { email: fromEmail, name: fromName } = parseSender()

                const emailRes = await sendEmail({
                    from: fromEmail,
                    fromName,
                    to: email,
                    subject: '🎉 Welcome to CorpLawUpdates.in — Your Free Corporate Law Digest',
                    html: welcomeHtml,
                })

                if (!emailRes.success) {
                    console.error(`[Subscribe] Welcome email delivery failed (${emailRes.provider}).`)
                } else {
                    console.log(`[Subscribe] Welcome email sent successfully (Provider: ${emailRes.provider})`)
                }
            }
        } catch (welcomeErr: any) {
            console.error('[Subscribe] Welcome email exception:', welcomeErr?.name || 'Unknown error')
        }

        return NextResponse.json({
            success: true,
            alreadySubscribed: Boolean(existing?.is_active),
            message: existing?.is_active
                ? 'You are already subscribed! Your email preferences have been updated.'
                : 'Subscribed! Check your inbox for a welcome email.',
        }, { status: 200 })

    } catch (err: unknown) {
        console.error('Subscribe error:', err instanceof Error ? err.name : 'Unknown error')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
