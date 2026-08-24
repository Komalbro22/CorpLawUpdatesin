/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = (process.env.RESEND_FROM_EMAIL || 'updates@mail.corplawupdates.in').trim().replace(/['"]/g, '')

    try {
        // 1. Fetch Campaign Info
        const { data: campaign, error: campaignError } = await supabaseAdmin
            .from('newsletter_campaigns')
            .select('*')
            .eq('id', id)
            .single()

        if (campaignError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        // 2. Fetch all active subscribers
        let subscribers: any[] = []
        try {
            const { data, error } = await supabaseAdmin
                .from('subscribers')
                .select('id, email')
                .eq('confirmed', true)
                .eq('is_active', true)
                .limit(1000)

            if (error) {
                // Fallback if 'confirmed' column missing
                const fallbackRes = await supabaseAdmin
                    .from('subscribers')
                    .select('id, email')
                    .eq('is_active', true)
                    .limit(1000)
                subscribers = fallbackRes.data || []
            } else {
                subscribers = data || []
            }
        } catch {
            const fallbackRes = await supabaseAdmin
                .from('subscribers')
                .select('id, email')
                .eq('is_active', true)
                .limit(1000)
            subscribers = fallbackRes.data || []
        }

        if (subscribers.length === 0) {
            return NextResponse.json({ error: 'No active subscribers found in database' }, { status: 400 })
        }

        // 3. Fetch all recipients already processed for this campaign
        const { data: existingRecipients, error: recError } = await supabaseAdmin
            .from('newsletter_recipients')
            .select('email, status')
            .eq('campaign_id', id)

        if (recError) throw recError

        const alreadySentEmails = new Set(
            (existingRecipients || [])
                .filter(r => r.status === 'sent' || r.status === 'delivered' || r.status === 'opened' || r.status === 'clicked')
                .map(r => r.email.toLowerCase().trim())
        )

        // 4. Determine remaining unsent subscribers
        const remainingSubscribers = subscribers.filter(s => !alreadySentEmails.has(s.email.toLowerCase().trim()))

        if (remainingSubscribers.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: 'All subscribers have already received this campaign.',
                sent: 0,
                totalRemaining: 0
            })
        }

        console.log(`[Send Remaining] Found ${remainingSubscribers.length} unsent subscriber(s) for campaign ${id}.`)

        // 5. Send in batches of 100 using Resend Batch API
        const BATCH_CHUNK_SIZE = 100
        let sent = 0
        let failed = 0
        const recipientsToInsert: any[] = []

        for (let i = 0; i < remainingSubscribers.length; i += BATCH_CHUNK_SIZE) {
            const chunk = remainingSubscribers.slice(i, i + BATCH_CHUNK_SIZE)

            const batchPayload = chunk.map(sub => {
                const token = generateUnsubscribeToken(sub.email)
                const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${token}`
                
                // Personalize unsubscribe link in the rendered HTML snapshot
                let recipientHtml = campaign.rendered_html || ''
                if (recipientHtml.includes('/api/unsubscribe')) {
                    recipientHtml = recipientHtml.replace(/https?:\/\/[^"'\s]+\/api\/unsubscribe\?[^"'\s]+/g, unsubUrl)
                } else if (recipientHtml.includes('Unsubscribe</a>')) {
                    recipientHtml = recipientHtml.replace(/href=["']#[^"']*["']/g, `href="${unsubUrl}"`)
                }

                return {
                    from: fromEmail,
                    to: sub.email,
                    subject: campaign.subject,
                    html: recipientHtml,
                }
            })

            try {
                const batchResult = await resend.batch.send(batchPayload)

                if (batchResult.error) {
                    console.error(`[Send Remaining] Batch API error:`, batchResult.error)
                    // Fallback to individual sends
                    for (const sub of chunk) {
                        try {
                            const token = generateUnsubscribeToken(sub.email)
                            const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${token}`
                            let recipientHtml = campaign.rendered_html || ''
                            if (recipientHtml.includes('/api/unsubscribe')) {
                                recipientHtml = recipientHtml.replace(/https?:\/\/[^"'\s]+\/api\/unsubscribe\?[^"'\s]+/g, unsubUrl)
                            }
                            const singleRes = await resend.emails.send({
                                from: fromEmail,
                                to: sub.email,
                                subject: campaign.subject,
                                html: recipientHtml
                            })
                            if (singleRes.error) throw new Error(singleRes.error.message)
                            sent++
                            recipientsToInsert.push({
                                campaign_id: id,
                                email: sub.email,
                                status: 'sent',
                                resend_email_id: singleRes.data?.id || null,
                                sent_at: new Date().toISOString()
                            })
                        } catch (singleErr: any) {
                            failed++
                            recipientsToInsert.push({
                                campaign_id: id,
                                email: sub.email,
                                status: 'failed',
                                error_message: singleErr?.message || 'Send failed'
                            })
                        }
                        await new Promise(r => setTimeout(r, 250))
                    }
                } else {
                    const responseData = (batchResult.data as any)?.data || (Array.isArray(batchResult.data) ? batchResult.data : [])
                    chunk.forEach((sub: any, idx: number) => {
                        const item = responseData[idx]
                        sent++
                        recipientsToInsert.push({
                            campaign_id: id,
                            email: sub.email,
                            status: 'sent',
                            resend_email_id: item?.id || null,
                            sent_at: new Date().toISOString()
                        })
                    })
                }
            } catch (err: any) {
                console.error(`[Send Remaining] Batch exception:`, err)
                for (const sub of chunk) {
                    failed++
                    recipientsToInsert.push({
                        campaign_id: id,
                        email: sub.email,
                        status: 'failed',
                        error_message: err?.message || 'Batch send failed'
                    })
                }
            }

            if (i + BATCH_CHUNK_SIZE < remainingSubscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 600))
            }
        }

        // 6. Insert new recipients and update campaign numbers
        if (recipientsToInsert.length > 0) {
            await supabaseAdmin.from('newsletter_recipients').insert(recipientsToInsert)
            
            const newSentTotal = (campaign.sent_count || 0) + sent
            const newFailedTotal = (campaign.failed_count || 0) + failed
            const newRecipientsTotal = Math.max(campaign.total_recipients || 0, newSentTotal + newFailedTotal)

            await supabaseAdmin.from('newsletter_campaigns').update({
                sent_count: newSentTotal,
                failed_count: newFailedTotal,
                total_recipients: newRecipientsTotal
            }).eq('id', id)
        }

        return NextResponse.json({
            success: true,
            message: `Successfully sent to ${sent} remaining subscriber(s).`,
            sent,
            failed,
            totalRemaining: remainingSubscribers.length
        })

    } catch (err: any) {
        console.error('[Send Remaining] Fatal error:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
