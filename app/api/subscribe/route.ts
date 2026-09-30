/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { redis } from '@/lib/redis-cache'
import { sendEmail, getActiveEmailProvider, parseSender } from '@/lib/email-provider'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}))
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
        
        // 1. Redis Rate Limiting (Fault-tolerant)
        const limitKey = `ratelimit:newsletter:${clientIp}`
        if (redis) {
            try {
                const count = await redis.incr(limitKey)
                if (count === 1) {
                    await redis.expire(limitKey, 3600)
                }
                if (count > 10) {
                    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
                }
            } catch (redisErr) {
                console.warn('[Subscribe] Redis rate limit check failed, proceeding with DB fallback:', redisErr)
            }
        }

        // 2. Database Rate Limiting (Fault-tolerant)
        try {
            const ipKey = `sub:${clientIp}`
            const { data: attemptData } = await supabaseAdmin
                .from('login_attempts')
                .select('attempts, window_start')
                .eq('ip', ipKey)
                .maybeSingle()

            const now = new Date()

            if (attemptData) {
                const windowStart = new Date(attemptData.window_start)
                const diffMs = now.getTime() - windowStart.getTime()
                const diffHours = diffMs / (1000 * 60 * 60)

                if (diffHours <= 1) {
                    if (attemptData.attempts >= 10) {
                        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
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
        } catch (dbRateLimitErr) {
            console.warn('[Subscribe] Database rate limit check warning:', dbRateLimitErr)
        }

        // 3. Check existing subscriber status
        const { data: existing, error: existingError } = await supabaseAdmin
            .from('subscribers')
            .select('id, is_active')
            .eq('email', email)
            .maybeSingle()

        if (existingError) {
            console.error('[Subscribe] Error querying subscribers table:', existingError)
            throw existingError
        }

        // Core fields supported by all Supabase schema revisions
        const corePayload = {
            email,
            is_active: true,
            confirmed: true,
        }

        // Optional metadata from custom forms
        const optionalMetadata: Record<string, any> = {}
        if (hasProfession && profession) optionalMetadata.profession = profession
        if (professionOther) optionalMetadata.profession_other = professionOther
        if (hasFrequency) optionalMetadata.frequency = frequency
        if (hasSource) optionalMetadata.source = source
        if (hasSourcePage && sourcePage) optionalMetadata.source_page = sourcePage

        const hasCustomMetadata = Object.keys(optionalMetadata).length > 0

        if (existing) {
            if (existing.is_active) {
                // Already subscribed: update metadata if provided and columns exist
                if (hasCustomMetadata) {
                    const { error: updateMetaError } = await supabaseAdmin
                        .from('subscribers')
                        .update(optionalMetadata)
                        .eq('id', existing.id)

                    if (updateMetaError) {
                        console.warn('[Subscribe] Optional metadata update skipped:', updateMetaError.message)
                    }
                }
            } else {
                // Reactivate inactive subscriber
                let updateRes = await supabaseAdmin
                    .from('subscribers')
                    .update({
                        is_active: true,
                        unsubscribed_at: null,
                        confirmed: true,
                        ...(hasCustomMetadata ? optionalMetadata : {}),
                    })
                    .eq('id', existing.id)

                // If metadata columns don't exist, retry with core fields
                if (updateRes.error && hasCustomMetadata) {
                    console.warn('[Subscribe] Retrying reactivation with core fields only:', updateRes.error.message)
                    updateRes = await supabaseAdmin
                        .from('subscribers')
                        .update({
                            is_active: true,
                            unsubscribed_at: null,
                            confirmed: true,
                        })
                        .eq('id', existing.id)
                }

                if (updateRes.error) {
                    console.error('[Subscribe] Reactivation update failed:', updateRes.error)
                    throw updateRes.error
                }
            }
        } else {
            // New subscriber: insert core record + optional metadata if provided
            let insertRes = await supabaseAdmin
                .from('subscribers')
                .insert({
                    ...corePayload,
                    ...(hasCustomMetadata ? optionalMetadata : {}),
                })

            // If metadata columns don't exist in DB schema, fallback gracefully to core payload
            if (insertRes.error && hasCustomMetadata) {
                console.warn('[Subscribe] Retrying insert with core fields only:', insertRes.error.message)
                insertRes = await supabaseAdmin
                    .from('subscribers')
                    .insert(corePayload)
            }

            if (insertRes.error) {
                console.error('[Subscribe] Subscriber insert failed:', insertRes.error)
                throw insertRes.error
            }
        }

        // 4. Upsert Contact to Brevo CRM (Non-fatal)
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
                    console.warn('[Subscribe] Brevo contact upsert response status:', response.status)
                }
            } catch (brevoError) {
                console.warn('[Subscribe] Brevo contact upsert request error:',
                    brevoError instanceof Error ? brevoError.message : 'Unknown error')
            }
        }

        // 5. Send Welcome Briefing Email (Non-fatal)
        if (!existing?.is_active) {
            try {
                const provider = getActiveEmailProvider()
                if (provider === 'none') {
                    console.warn('[Subscribe] No active email provider configured. Skipping welcome email.')
                } else {
                    const welcomePromise = (async () => {
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

                        return sendEmail({
                            from: fromEmail,
                            fromName,
                            to: email,
                            subject: '🎉 Welcome to CorpLawUpdates.in — Your Free Corporate Law Digest',
                            html: welcomeHtml,
                        })
                    })()

                    const emailRes = await Promise.race([
                        welcomePromise,
                        new Promise<{ success: boolean; error: string; provider: 'none' }>((resolve) =>
                            setTimeout(() => resolve({ success: false, error: 'Email delivery timed out', provider: 'none' }), 4000)
                        ),
                    ])

                    if (!emailRes.success) {
                        console.warn(`[Subscribe] Welcome email delivery warning (${emailRes.provider}):`, emailRes.error)
                    } else {
                        console.log(`[Subscribe] Welcome email sent successfully (Provider: ${emailRes.provider})`)
                    }
                }
            } catch (welcomeErr: any) {
                console.warn('[Subscribe] Welcome email exception:', welcomeErr?.message || welcomeErr)
            }
        }

        return NextResponse.json({
            success: true,
            alreadySubscribed: Boolean(existing?.is_active),
            message: existing?.is_active
                ? 'You are already subscribed! Your weekly corporate law briefings are active.'
                : 'Subscribed! Check your inbox for your welcome briefing.',
        }, { status: 200 })

    } catch (err: unknown) {
        const errorDetail = err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : err instanceof Error
            ? err.message
            : 'Unknown error'
        console.error('[Subscribe] Fatal error in subscribe route:', errorDetail, err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
