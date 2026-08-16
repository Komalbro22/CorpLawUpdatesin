/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendNewsletterEmails } from '@/lib/newsletter'
import { validateCronAuth } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    // 1. Authorize Cron trigger via shared helper (fails closed if CRON_SECRET missing)
    const authError = validateCronAuth(request)
    if (authError) return authError

    try {
        console.log('=== CRON: CHECKING SCHEDULED NEWSLETTERS ===')
        
        // 2. Fetch pending newsletters where scheduled_at <= now()
        const { data: pending, error: fetchError } = await supabaseAdmin
            .from('scheduled_newsletters')
            .select('id, subject, preview_text, body, scheduled_at, status')
            .eq('status', 'pending')
            .lte('scheduled_at', new Date().toISOString())

        if (fetchError) throw fetchError
        if (!pending || pending.length === 0) {
            return NextResponse.json({ message: 'No pending newsletters to send' })
        }

        console.log(`Found ${pending.length} candidate pending newsletters`)

        const results = []

        for (const newsletter of pending) {
            // 3. Atomically claim the newsletter row to prevent race conditions & duplicate sending
            const { data: claimed, error: claimError } = await supabaseAdmin
                .from('scheduled_newsletters')
                .update({ status: 'processing' })
                .eq('id', newsletter.id)
                .eq('status', 'pending')
                .select('id')

            if (claimError || !claimed || claimed.length === 0) {
                console.log(`[Newsletter Cron] Newsletter ${newsletter.id} was already claimed by another worker. Skipping.`)
                continue
            }

            try {
                console.log(`Sending claimed newsletter: ${newsletter.id} - ${newsletter.subject}`)
                
                const result = await sendNewsletterEmails({
                    subject: newsletter.subject,
                    previewText: newsletter.preview_text,
                    body: newsletter.body,
                    mode: 'markdown',
                })

                let finalStatus = 'sent'
                if (result.sent === 0 && result.total > 0) {
                    finalStatus = 'failed'
                } else if (result.failed > 0) {
                    finalStatus = 'partially_sent'
                }

                // 4. Update status upon completion
                await supabaseAdmin
                    .from('scheduled_newsletters')
                    .update({ status: finalStatus })
                    .eq('id', newsletter.id)

                results.push({ id: newsletter.id, status: finalStatus, result })

            } catch (sendErr: any) {
                console.error(`Failed to send newsletter ${newsletter.id}:`, sendErr)
                
                // 5. Update status to 'failed' on error
                await supabaseAdmin
                    .from('scheduled_newsletters')
                    .update({ status: 'failed' })
                    .eq('id', newsletter.id)

                results.push({ id: newsletter.id, status: 'failed', error: sendErr.message })
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results })

    } catch (err: any) {
        console.error('=== CRON FATAL ERROR ===', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

