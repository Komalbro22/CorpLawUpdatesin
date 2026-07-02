/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendNewsletterEmails } from '@/lib/newsletter'

export async function GET(request: Request) {
    // Strict security check — fail closed if CRON_SECRET is missing
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('=== CRON: CHECKING SCHEDULED NEWSLETTERS ===')
        
        // 1. Fetch pending newsletters where scheduled_at <= now()
        const { data: pending, error: fetchError } = await supabaseAdmin
            .from('scheduled_newsletters')
            .select('id, subject, preview_text, body, scheduled_at, status')
            .eq('status', 'pending')
            .lte('scheduled_at', new Date().toISOString())

        if (fetchError) throw fetchError
        if (!pending || pending.length === 0) {
            return NextResponse.json({ message: 'No pending newsletters to send' })
        }

        console.log(`Found ${pending.length} newsletters to send`)

        const results = []

        for (const newsletter of pending) {
            try {
                console.log(`Sending newsletter: ${newsletter.id} - ${newsletter.subject}`)
                
                const result = await sendNewsletterEmails({
                    subject: newsletter.subject,
                    previewText: newsletter.preview_text,
                    body: newsletter.body,
                    mode: 'markdown', // Assuming markdown for scheduled
                })

                let finalStatus = 'sent'
                if (result.sent === 0 && result.total > 0) {
                    finalStatus = 'failed'
                } else if (result.failed > 0) {
                    finalStatus = 'partially_sent'
                }

                // 2. Update status
                await supabaseAdmin
                    .from('scheduled_newsletters')
                    .update({ status: finalStatus })
                    .eq('id', newsletter.id)

                results.push({ id: newsletter.id, status: finalStatus, result })

            } catch (sendErr: any) {
                console.error(`Failed to send newsletter ${newsletter.id}:`, sendErr)
                
                // 3. Update status to 'failed'
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
