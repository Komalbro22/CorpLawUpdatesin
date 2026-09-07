/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendEmail, getActiveEmailProvider, parseSender } from '@/lib/email-provider'

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
            .select('subject, rendered_html')
            .eq('id', id)
            .single()

        if (campaignError || !campaign) throw new Error('Campaign not found')

        // 2. Fetch Failed/Bounced Recipients
        const { data: recipients, error: recipientsError } = await supabaseAdmin
            .from('newsletter_recipients')
            .select('id, email')
            .eq('campaign_id', id)
            .in('status', ['failed', 'bounced'])

        if (recipientsError) throw recipientsError

        if (!recipients || recipients.length === 0) {
            return NextResponse.json({ message: 'No failed recipients found to retry' })
        }

        // 3. Resend Emails via Active Provider (Brevo API > Brevo SMTP > Resend)
        let retriedCount = 0
        const successList = []

        for (const recipient of recipients) {
            const result = await sendEmail({
                from: fromEmail,
                fromName,
                to: recipient.email,
                subject: campaign.subject,
                html: campaign.rendered_html, // Sending the exact snapshot
            })

            if (result.success) {
                retriedCount++
                successList.push(recipient.id)
                // Update recipient to delivered
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ 
                        status: 'delivered', 
                        resend_email_id: result.messageId || null,
                        sent_at: new Date().toISOString(),
                        error_message: null
                    })
                    .eq('id', recipient.id)
            } else {
                console.error(`Retry failed for ${recipient.email} (${result.provider}):`, result.error)
                // Update error message
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ error_message: `Retry (${result.provider}): ${result.error}` })
                    .eq('id', recipient.id)
            }

            // Small delay to maintain deliverability
            await new Promise(r => setTimeout(r, 100))
        }

        // Update campaign totals if any succeeded
        if (retriedCount > 0) {
            const { data: currentCamp } = await supabaseAdmin
                .from('newsletter_campaigns')
                .select('sent_count, failed_count')
                .eq('id', id)
                .single()

            if (currentCamp) {
                await supabaseAdmin
                    .from('newsletter_campaigns')
                    .update({
                        sent_count: (currentCamp.sent_count || 0) + retriedCount,
                        failed_count: Math.max(0, (currentCamp.failed_count || 0) - retriedCount)
                    })
                    .eq('id', id)
            }
        }

        return NextResponse.json({ 
            message: `Successfully retried ${retriedCount} out of ${recipients.length} failed emails using ${provider}.`,
            provider,
            retriedCount,
            totalFailed: recipients.length
        })

    } catch (err: any) {
        console.error('Failed to retry emails:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}

