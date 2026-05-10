/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { buildEmailHtml, markdownToHtml, sendNewsletterEmails } from '@/lib/newsletter'

export async function POST(request: NextRequest) {
    try {
        console.log('=== NEWSLETTER SEND START ===')

        // 1. Verify session
        const isValid = verifyAdminSession()
        if (!isValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse body
        const body = await request.json()
        const { subject, previewText, body: emailBody, testOnly, targetEmails, mode = 'markdown', testEmail, scheduledAt } = body
        const fromEmail = (process.env.RESEND_FROM_EMAIL || 'updates@mail.corplawupdates.in').trim().replace(/['"]/g, '')
        const adminEmail = (process.env.ADMIN_EMAIL || 'mail@corplawupdates.in').trim().replace(/['"]/g, '')

        // 3. Validate
        if (!subject?.trim()) {
            return NextResponse.json({ error: 'Subject required' }, { status: 400 })
        }
        if (!emailBody?.trim()) {
            return NextResponse.json({ error: 'Body required' }, { status: 400 })
        }

        // 4. If test only
        if (testOnly) {
            const resend = new Resend(process.env.RESEND_API_KEY)
            const sendTo = testEmail && testEmail.trim() ? testEmail.trim() : adminEmail
            
            let rawHtml = emailBody
            if (mode === 'markdown') {
                rawHtml = markdownToHtml(emailBody)
            }

            const testHtml = buildEmailHtml({
                subject,
                previewText: previewText || '',
                bodyHtml: rawHtml, // Simplified for test
                unsubscribeUrl: '#'
            })

            const result = await resend.emails.send({
                from: fromEmail,
                to: sendTo,
                subject: `[TEST] ${subject}`,
                html: testHtml,
            })

            if (result.error) {
                return NextResponse.json(
                    { error: `Resend error: ${result.error.message}` },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                sent: 1,
                failed: 0,
                total: 1,
                testOnly: true
            })
        }

        // 5. Handle Scheduling
        if (scheduledAt) {
            const { error: scheduleError } = await supabaseAdmin.from('scheduled_newsletters').insert({
                subject: subject.trim(),
                preview_text: previewText?.trim() || null,
                body: emailBody.trim(),
                scheduled_at: scheduledAt,
                status: 'pending'
            })

            if (scheduleError) {
                return NextResponse.json({ error: `Schedule error: ${scheduleError.message}` }, { status: 500 })
            }

            return NextResponse.json({ scheduled: true, scheduledAt })
        }

        // 6. Send Immediately
        const result = await sendNewsletterEmails({
            subject,
            previewText,
            body: emailBody,
            mode,
            targetEmails
        })

        return NextResponse.json(result)

    } catch (err: any) {
        console.error('=== NEWSLETTER FATAL ERROR ===', err)
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
