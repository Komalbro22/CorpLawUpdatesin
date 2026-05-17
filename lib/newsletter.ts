import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'
import sanitizeHtml from 'sanitize-html'

export function markdownToHtml(markdown: string): string {
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

export function buildEmailHtml({ subject, previewText, bodyHtml, unsubscribeUrl }: {
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

export async function sendNewsletterEmails({
    subject,
    previewText,
    body: emailBody,
    mode = 'markdown',
    targetEmails
}: {
    subject: string
    previewText?: string
    body: string
    mode?: 'markdown' | 'html'
    targetEmails?: string[]
}) {
    const fromEmail = (process.env.RESEND_FROM_EMAIL || 'updates@mail.corplawupdates.in').trim().replace(/['"]/g, '')
    const adminEmail = (process.env.ADMIN_EMAIL || 'mail@corplawupdates.in').trim().replace(/['"]/g, '')
    const resend = new Resend(process.env.RESEND_API_KEY)

    let rawHtml = emailBody
    if (mode === 'markdown') {
        rawHtml = markdownToHtml(emailBody)
    }

    const bodyHtml = sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'span', 'div', 'p', 'br', 'hr', 'a', 'b', 'i', 'strong', 'em', 'u', 'table', 'thead', 'tbody', 'tr', 'th', 'td']),
        allowedAttributes: {
            '*': ['style', 'class', 'id'],
            'a': ['href', 'target', 'rel'],
            'img': ['src', 'alt', 'width', 'height']
        },
        allowedStyles: {
            '*': {
                'color': [/^.*$/],
                'text-align': [/^.*$/],
                'background-color': [/^.*$/],
                'font-size': [/^.*$/],
                'font-family': [/^.*$/],
                'font-weight': [/^.*$/],
                'padding': [/^.*$/],
                'margin': [/^.*$/],
                'border': [/^.*$/],
                'border-radius': [/^.*$/],
                'line-height': [/^.*$/],
                'text-decoration': [/^.*$/],
                'max-width': [/^.*$/],
                'width': [/^.*$/],
                'height': [/^.*$/],
                'display': [/^.*$/]
            }
        }
    })

    // Fetch subscribers
    let query = supabaseAdmin.from('subscribers').select('id, email').eq('is_active', true)
    if (targetEmails && Array.isArray(targetEmails) && targetEmails.length > 0) {
        query = query.in('email', targetEmails)
    }
    const { data: subscribers, error: subError } = await query

    if (subError) throw new Error(`DB error: ${subError.message}`)
    if (!subscribers || subscribers.length === 0) return { sent: 0, failed: 0, total: 0 }

    // Create Campaign Record
    let campaignId: string | undefined;
    const { data: campaign, error: campaignError } = await supabaseAdmin.from('newsletter_campaigns').insert({
        subject,
        preview_text: previewText || null,
        content: emailBody,
        content_type: mode,
        rendered_html: bodyHtml,
        sent_by: adminEmail,
        total_recipients: subscribers.length,
    }).select('id').single()

    if (campaignError) {
        console.error('Failed to create campaign record:', campaignError)
    } else {
        campaignId = campaign.id
    }

    // --- Resend free-tier guard ---
    const RESEND_DAILY_LIMIT = 100
    if (subscribers.length >= RESEND_DAILY_LIMIT * 0.9) {
        console.warn(
            `[Newsletter] WARNING: Sending to ${subscribers.length} subscribers. ` +
            `Resend free tier allows only ${RESEND_DAILY_LIMIT} emails/day. ` +
            `You may hit the daily cap before all emails are delivered.`
        )
    }
    console.log(`[Newsletter] Sending to ${subscribers.length} subscriber(s) sequentially (500ms delay between each).`)

    let sent = 0
    let failed = 0
    const successList: string[] = []
    const failedList: string[] = []
    const recipientsToInsert: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any

    // Sequential send — one email at a time, 500ms apart to stay under Resend's
    // 2 req/sec free-tier rate limit (5 req/sec overall cap).
    for (const sub of subscribers) {
        try {
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

            sent++
            successList.push(sub.email)
            if (campaignId) {
                recipientsToInsert.push({
                    campaign_id: campaignId,
                    email: sub.email,
                    status: 'sent',
                    resend_email_id: (r.data as any)?.id || null, // eslint-disable-line @typescript-eslint/no-explicit-any
                    sent_at: new Date().toISOString()
                })
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(`[Newsletter] Failed to send to ${sub.email}:`, err)
            failed++
            failedList.push(sub.email)
            if (campaignId) {
                recipientsToInsert.push({
                    campaign_id: campaignId,
                    email: sub.email,
                    status: 'failed',
                    error_message: err?.message || 'Failed to send'
                })
            }
        }

        // 500ms delay → max 2 emails/sec, safely within Resend free-tier limit
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (campaignId && recipientsToInsert.length > 0) {
        await supabaseAdmin.from('newsletter_recipients').insert(recipientsToInsert)
        await supabaseAdmin.from('newsletter_campaigns').update({
            sent_count: sent,
            failed_count: failed
        }).eq('id', campaignId)
    }

    return { sent, failed, total: subscribers.length, successList, failedList }
}
