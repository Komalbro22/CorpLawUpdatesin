/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = (process.env.RESEND_FROM_EMAIL || 'updates@mail.corplawupdates.in').trim().replace(/['"]/g, '')

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

        // 3. Resend Emails
        let retriedCount = 0
        const successList = []

        for (const recipient of recipients) {
            const result = await resend.emails.send({
                from: fromEmail,
                to: recipient.email,
                subject: campaign.subject,
                html: campaign.rendered_html, // Sending the exact snapshot
            })

            if (!result.error) {
                retriedCount++
                successList.push(recipient.id)
                // Update recipient to pending/delivered
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ 
                        status: 'delivered', 
                        resend_email_id: result.data?.id || null,
                        sent_at: new Date().toISOString(),
                        error_message: null
                    })
                    .eq('id', recipient.id)
            } else {
                console.error(`Retry failed for ${recipient.email}:`, result.error)
                // Update error message
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ error_message: `Retry: ${result.error.message}` })
                    .eq('id', recipient.id)
            }

            // Small delay to prevent rate limits
            await new Promise(r => setTimeout(r, 100))
        }

        return NextResponse.json({ 
            message: `Successfully retried ${retriedCount} out of ${recipients.length} failed emails.` 
        })

    } catch (err: any) {
        console.error('Failed to retry emails:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
