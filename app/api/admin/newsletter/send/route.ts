/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        console.log('=== NEWSLETTER SEND START ===')

        // 1. Verify session
        const isValid = verifyAdminSession()
        console.log('Session valid:', isValid)
        if (!isValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse body
        const body = await request.json()
        console.log('Request body:', {
            subject: body.subject,
            testOnly: body.testOnly,
            bodyLength: body.body?.length
        })

        const { subject, previewText, body: emailBody, testOnly, targetEmails } = body
        const fromEmail = (process.env.RESEND_FROM_EMAIL || 'updates@mail.corplawupdates.in').trim().replace(/['"]/g, '')
        const adminEmail = (process.env.ADMIN_EMAIL || 'corplawupdatesin@gmail.com').trim().replace(/['"]/g, '')

        // 3. Validate
        if (!subject?.trim()) {
            return NextResponse.json({ error: 'Subject required' }, { status: 400 })
        }
        if (!emailBody?.trim()) {
            return NextResponse.json({ error: 'Body required' }, { status: 400 })
        }

        // 4. Check env vars
        console.log('ENV CHECK:')
        console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
        console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)
        console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL)
        console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('SERVICE_ROLE exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

        // 5. Init Resend
        const resend = new Resend(process.env.RESEND_API_KEY)
        console.log('Resend initialized')

        // 6. Convert markdown to HTML
        const bodyHtml = markdownToHtml(emailBody)
        console.log('HTML conversion done, length:', bodyHtml.length)

        // 7. If test only
        if (testOnly) {
            console.log('Sending test email to:', process.env.ADMIN_EMAIL)

            const testHtml = buildEmailHtml({
                subject,
                previewText: previewText || '',
                bodyHtml,
                unsubscribeUrl: '#'
            })

            const result = await resend.emails.send({
                from: fromEmail,
                to: adminEmail,
                subject: `[TEST] ${subject}`,
                html: testHtml,
            })

            console.log('Resend test result:', JSON.stringify(result))

            if (result.error) {
                console.error('Resend error:', result.error)
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

        // 8. Fetch subscribers
        console.log('Fetching subscribers...')
        let query = supabaseAdmin.from('subscribers').select('id, email').eq('is_active', true)
        if (targetEmails && Array.isArray(targetEmails) && targetEmails.length > 0) {
            query = query.in('email', targetEmails)
        }
        const { data: subscribers, error: subError } = await query

        console.log('Subscribers fetched:', subscribers?.length, 'error:', subError)

        if (subError) {
            return NextResponse.json(
                { error: `DB error: ${subError.message}` },
                { status: 500 }
            )
        }

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ sent: 0, failed: 0, total: 0 })
        }

        // 9. Send in batches
        let sent = 0
        let failed = 0
        const successList: string[] = []
        const failedList: string[] = []
        const chunks = []
        for (let i = 0; i < subscribers.length; i += 10) {
            chunks.push(subscribers.slice(i, i + 10))
        }

        console.log(`Sending to ${subscribers.length} subscribers in ${chunks.length} chunks`)

        for (let ci = 0; ci < chunks.length; ci++) {
            const chunk = chunks[ci]
            console.log(`Processing chunk ${ci + 1}/${chunks.length}`)

            const results = await Promise.allSettled(
                chunk.map(async (sub: { id: string, email: string }) => {
                    const token = generateUnsubscribeToken(sub.email)
                    const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${token}`

                    const html = buildEmailHtml({
                        subject,
                        previewText: previewText || '',
                        bodyHtml,
                        unsubscribeUrl: unsubUrl
                    })

                    const r = await resend.emails.send({
                        from: fromEmail,
                        to: sub.email,
                        subject,
                        html,
                    })

                    if (r.error) throw new Error(r.error.message)
                    return r
                })
            )

            results.forEach((r, idx) => {
                const subEmail = chunk[idx].email
                if (r.status === 'fulfilled') {
                    sent++
                    successList.push(subEmail)
                } else {
                    failed++
                    failedList.push(subEmail)
                    console.error(`Failed for chunk ${ci} item ${idx}:`, r.reason)
                }
            })

            if (ci < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }

        console.log(`=== DONE: sent=${sent} failed=${failed} ===`)
        return NextResponse.json({ sent, failed, total: subscribers.length, successList, failedList })

    } catch (err: any) {
        console.error('=== NEWSLETTER FATAL ERROR ===')
        console.error('Error name:', err.name)
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper: build email HTML
function buildEmailHtml({ subject, previewText, bodyHtml, unsubscribeUrl }: {
    subject: string
    previewText: string
    bodyHtml: string
    unsubscribeUrl: string
}): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden">${previewText}</div>` : ''}
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff">
    <div style="background:#0F172A;padding:24px 32px">
      <div style="color:#F59E0B;font-size:20px;font-weight:bold">
        CorpLawUpdates.in
      </div>
      <div style="color:#94A3B8;font-size:13px;margin-top:4px">
        India's Free Corporate Law Intelligence Platform
      </div>
    </div>
    <div style="padding:28px 32px 0">
      <h2 style="color:#0F172A;font-size:22px;margin:0">${subject}</h2>
      <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0">
    </div>
    <div style="padding:0 32px 28px;color:#334155;font-size:15px;line-height:1.7">
      ${bodyHtml}
    </div>
    <div style="background:#F8FAFC;padding:20px 32px;border-top:1px solid #E2E8F0">
      <p style="color:#94A3B8;font-size:12px;margin:0">
        You're receiving this because you subscribed at corplawupdates.in<br>
        <a href="${unsubscribeUrl}" style="color:#F59E0B">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

const markdownToHtml = (markdown: string): string => {
    let html = markdown
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#F59E0B">$1</a>')
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>')
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>(<h[123]>)/g, '$1')
    html = html.replace(/(<\/h[123]>)<\/p>/g, '$1')
    return html
}
