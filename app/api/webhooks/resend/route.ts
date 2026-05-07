/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    const payload = await request.text()
    const signature = request.headers.get('svix-signature')
    const msgId = request.headers.get('svix-id')
    const timestamp = request.headers.get('svix-timestamp')

    if (!signature || !msgId || !timestamp) {
        return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 })
    }

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    
    if (!webhookSecret) {
        console.warn('RESEND_WEBHOOK_SECRET is not set. Skipping webhook verification.')
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: any

    try {
        const wh = new Webhook(webhookSecret)
        event = wh.verify(payload, {
            'svix-id': msgId,
            'svix-timestamp': timestamp,
            'svix-signature': signature,
        })
    } catch (err: any) {
        console.error('Webhook verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Process the event
    const emailId = event.data?.email_id
    if (!emailId) {
        return NextResponse.json({ received: true })
    }

    try {
        switch (event.type) {
            case 'email.delivered':
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ status: 'delivered' })
                    .eq('resend_email_id', emailId)
                break;
            case 'email.bounced':
            case 'email.complained':
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ status: 'bounced' })
                    .eq('resend_email_id', emailId)
                break;
            case 'email.opened':
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ 
                        status: 'opened',
                        opened_at: new Date().toISOString()
                    })
                    .eq('resend_email_id', emailId)
                    // only update status to opened if it wasn't already clicked/bounced
                    .in('status', ['delivered', 'pending', 'opened'])
                break;
            case 'email.clicked':
                await supabaseAdmin
                    .from('newsletter_recipients')
                    .update({ 
                        status: 'clicked',
                        clicked_at: new Date().toISOString()
                    })
                    .eq('resend_email_id', emailId)
                break;
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error updating recipient status:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
}

