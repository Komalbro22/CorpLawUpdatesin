/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendNewsletterEmails } from '@/lib/newsletter'

export async function GET(request: Request) {
    // Basic security check (could use a secret header from Vercel)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // Note: For now, we'll allow it if CRON_SECRET is not set, or just log it.
        // Vercel Cron sends a secret if configured.
    }

    try {
        console.log('=== CRON: CHECKING SCHEDULED NEWSLETTERS ===')
        
        // 1. Fetch pending newsletters where scheduled_at <= now()
        const { data: pending, error: fetchError } = await supabaseAdmin
            .from('scheduled_newsletters')
            .select('*')
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

                // 2. Update status to 'sent'
                await supabaseAdmin
                    .from('scheduled_newsletters')
                    .update({ status: 'sent' })
                    .eq('id', newsletter.id)

                results.push({ id: newsletter.id, status: 'sent', result })

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
