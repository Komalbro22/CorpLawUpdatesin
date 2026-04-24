/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

export async function POST(request: NextRequest) {
    const isValid = verifyAdminSession()
    if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const bodyReq = await request.json()
        const { subject, previewText, body, testOnly } = bodyReq

        if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
        if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

        const markdownToHtml = (markdown: string): string => {
            let html = markdown
            // Headers
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Bold and italic
            html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Links
            html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#F59E0B">$1</a>')
            // Bullet lists
            html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
            html = html.replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>')
            // Line breaks — double newline = paragraph break
            html = html.replace(/\n\n/g, '</p><p>')
            // Wrap in paragraph tags
            html = '<p>' + html + '</p>'
            // Clean up empty paragraphs
            html = html.replace(/<p><\/p>/g, '')
            html = html.replace(/<p>(<h[123]>)/g, '$1')
            html = html.replace(/(<\/h[123]>)<\/p>/g, '$1')
            return html
        }

        const bodyHtml = markdownToHtml(body)

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
        console.log('Resend key exists:', !!process.env.RESEND_API_KEY)

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

        const { data: subscribers, error: subError } = await supabaseAdmin
            .from('subscribers')
            .select('id, email')
            .eq('is_active', true)

        if (subError) {
            console.error('Subscriber fetch error:', subError)
            return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
        }

        if (!subscribers) {
            return NextResponse.json({ sent: 0, failed: 0, total: 0 })
        }

        const chunks: typeof subscribers[] = []
        for (let i = 0; i < (subscribers || []).length; i += 10) {
            chunks.push((subscribers || []).slice(i, i + 10))
        }

        let sent = 0
        let failed = 0

        for (const chunk of chunks) {
            const results = await Promise.allSettled(
                chunk.map(async (sub) => {
                    const unsubToken = generateUnsubscribeToken(sub.email)
                    const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${unsubToken}`

                    const personalizedHtml = template
                        .replace('{SUBJECT}', subject)
                        .replace('{PREVIEW_TEXT}', previewText || '')
                        .replace('{BODY_HTML}', bodyHtml)
                        .replace('{UNSUBSCRIBE_URL}', unsubUrl)

                    const result = await resend.emails.send({
                        from: process.env.RESEND_FROM_EMAIL!,
                        to: sub.email,
                        subject: subject,
                        html: personalizedHtml,
                    })

                    if (result.error) {
                        throw new Error(result.error.message)
                    }
                    return result
                })
            )

            results.forEach(r => {
                if (r.status === 'fulfilled') sent++
                else {
                    failed++
                    console.error('Email failed:', r.reason)
                }
            })

            // 500ms delay between batches
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await new Promise(r => setTimeout(r, 500))
            }
        }

        return NextResponse.json({
            sent,
            failed,
            total: (subscribers || []).length,
            testOnly: false
        })

    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
