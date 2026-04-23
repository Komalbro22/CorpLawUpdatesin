/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

export async function POST(request: NextRequest) {
    if (!verifyAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key')
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'newsletter@corplawupdates.in'

    try {
        const { subject, content, testEmail } = await request.json()

        if (!subject || !content) {
            return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 })
        }

        const buildEmailHtml = (body: string, email: string) => {
            const token = generateUnsubscribeToken(email)
            const unsubLink = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
            return `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    ${body.replace(/\n/g, '<br/>')}
                    <hr style="margin-top: 30px; border-color: #eee; border-style: solid;" />
                    <p style="font-size: 12px; color: #888; text-align: center;">
                        You received this because you subscribed to CorpLawUpdates.in.<br/>
                        <a href="${unsubLink}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
                    </p>
                </div>
            `
        }

        if (testEmail) {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: testEmail,
                subject: `[TEST] ${subject}`,
                html: buildEmailHtml(content, testEmail)
            })
            return NextResponse.json({ success: true, message: 'Test email sent' })
        }

        // Send to all
        const allSubscribers: { email: string }[] = []
        let hasMore = true
        let page = 0
        const limit = 1000

        while (hasMore) {
            const { data, error } = await supabaseAdmin
                .from('subscribers')
                .select('email')
                .eq('is_active', true)
                .range(page * limit, (page + 1) * limit - 1)
            
            if (error) throw error
            if (data && data.length > 0) {
                allSubscribers.push(...data)
                page++
            } else {
                hasMore = false
            }
        }

        if (allSubscribers.length === 0) {
            return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 })
        }

        // Resend batch API limit is 100 emails per request, we use 50 here
        const batches = []
        for (let i = 0; i < allSubscribers.length; i += 50) {
            const batch = allSubscribers.slice(i, i + 50)
            const payload = batch.map(sub => ({
                from: FROM_EMAIL,
                to: sub.email,
                subject,
                html: buildEmailHtml(content, sub.email)
            }))
            batches.push(payload)
        }

        let sentCount = 0
        for (const batch of batches) {
            const { error } = await resend.batch.send(batch)
            if (error) {
                console.error('Batch send error:', error)
            } else {
                sentCount += batch.length
            }
        }

        return NextResponse.json({ success: true, sent: sentCount })

    } catch (err: any) {
        console.error('Newsletter error:', err)
        return NextResponse.json({ error: err.message || 'Failed to send newsletter' }, { status: 500 })
    }
}
