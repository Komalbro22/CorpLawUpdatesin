/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendBatchEmails, getActiveEmailProvider, parseSender } from '@/lib/email-provider'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const provider = getActiveEmailProvider()
    const { email: fromEmail, name: fromName } = parseSender()

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

        // 5. Send using unified email provider (Brevo API > Brevo SMTP > Resend)
        const emailsToSend = remainingSubscribers.map(sub => {
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
                to: sub.email,
                subject: campaign.subject,
                html: recipientHtml,
            }
        })

        const batchResult = await sendBatchEmails({
            emails: emailsToSend,
            from: fromEmail,
            fromName,
        })

        const sent = batchResult.sent
        const failed = batchResult.failed
        const recipientsToInsert = batchResult.results.map(r => ({
            campaign_id: id,
            email: r.email,
            status: r.success ? 'sent' : 'failed',
            resend_email_id: r.messageId || null,
            sent_at: r.success ? new Date().toISOString() : null,
            error_message: r.error || null,
        }))

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
