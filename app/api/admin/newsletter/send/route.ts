/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

export async function POST(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const bodyReq = await request.json()
        const { subject, previewText, body, testOnly } = bodyReq

        if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
        if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

        const bodyHtml = '<p>' + body
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\n\n/g, '</p><p>') + '</p>'

        const template = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff">
    <!-- Header -->
    <div style="background:#0F172A;padding:24px 32px">
      <h1 style="color:#F59E0B;margin:0;font-size:22px">CorpLawUpdates.in</h1>
      <p style="color:#94A3B8;margin:8px 0 0;font-size:14px">India's Free Corporate Law Intelligence Platform</p>
    </div>
    <!-- Subject as heading -->
    <div style="padding:32px 32px 0">
      <h2 style="color:#0F172A;font-size:24px;margin:0">{SUBJECT}</h2>
      <p style="color:#64748B;font-size:14px;margin:8px 0 0">{PREVIEW_TEXT}</p>
      <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0">
    </div>
    <!-- Body -->
    <div style="padding:0 32px 32px;color:#334155;font-size:16px;line-height:1.7">
      {BODY_HTML}
    </div>
    <!-- Footer -->
    <div style="background:#F8FAFC;padding:24px 32px;border-top:1px solid #E2E8F0">
      <p style="color:#64748B;font-size:13px;margin:0">
        You're receiving this because you subscribed at corplawupdates.in<br>
        <a href="{UNSUBSCRIBE_URL}" style="color:#F59E0B">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`

        const resend = new Resend(process.env.RESEND_API_KEY)

        if (testOnly) {
            const email = process.env.ADMIN_EMAIL!
            const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${generateUnsubscribeToken(email)}`
            const html = template
                .replace('{SUBJECT}', subject)
                .replace('{PREVIEW_TEXT}', previewText || '')
                .replace('{BODY_HTML}', bodyHtml)
                .replace('{UNSUBSCRIBE_URL}', unsubUrl)

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to: email,
                subject: subject,
                html: html
            })
            return NextResponse.json({ sent: 1, failed: 0, testOnly: true })
        }

        const { data: subscribers } = await supabaseAdmin
            .from('subscribers')
            .select('email')
            .eq('is_active', true)

        if (!subscribers) {
            return NextResponse.json({ sent: 0, failed: 0, total: 0 })
        }

        const chunks = []
        for (let i = 0; i < subscribers.length; i += 10) {
            chunks.push(subscribers.slice(i, i + 10))
        }

        let sent = 0
        let failed = 0

        for (const chunk of chunks) {
            const promises = chunk.map(sub => {
                const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${generateUnsubscribeToken(sub.email)}`
                const html = template
                    .replace('{SUBJECT}', subject)
                    .replace('{PREVIEW_TEXT}', previewText || '')
                    .replace('{BODY_HTML}', bodyHtml)
                    .replace('{UNSUBSCRIBE_URL}', unsubUrl)

                return resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL!,
                    to: sub.email,
                    subject: subject,
                    html: html
                })
            })

            const results = await Promise.allSettled(promises)
            for (const result of results) {
                if (result.status === 'fulfilled' && !result.value.error) {
                    sent++
                } else {
                    failed++
                }
            }

            await new Promise(r => setTimeout(r, 500))
        }

        return NextResponse.json({ sent, failed, total: subscribers.length })

    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
