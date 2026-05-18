/* eslint-disable @typescript-eslint/no-explicit-any */
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

export function buildNewsletterTemplateHtml({
    subject,
    previewText,
    introMessage,
    articles,
    unsubscribeUrl
}: {
    subject: string
    previewText: string
    introMessage?: string | null
    articles: any[]
    unsubscribeUrl: string
}): string {
    const SITE_URL = BASE_URL || 'https://www.corplawupdates.in'

    // 1. Determine headline move banner
    let headlineMove = ''
    if (introMessage) {
        headlineMove = introMessage
    } else if (articles.length > 0) {
        // Pick the top article (most views or first in the list since they are sorted by date/views)
        const topArticle = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0))[0] || articles[0]
        headlineMove = `This week's top update: ${topArticle.title}. Read below.`
    }

    // 2. Build stats counts
    const totalCount = articles.length
    const categories = ['SEBI', 'MCA', 'RBI', 'NCLT', 'FEMA', 'IBC']
    const catCounts: Record<string, number> = { SEBI: 0, MCA: 0, RBI: 0, NCLT: 0, FEMA: 0, IBC: 0 }
    let highImpactCount = 0

    articles.forEach(art => {
        const cat = (art.category || '').toUpperCase()
        if (cat === 'IBC') {
            catCounts['IBC']++
        } else if (cat === 'NCLT') {
            catCounts['NCLT']++
        } else if (cat in catCounts) {
            catCounts[cat]++
        }
        if (art.impact_level === 'high' || art.impact_level === 'High') {
            highImpactCount++
        }
    })

    // 3. Build regulator badges HTML for stats bar
    const statsBadgesHtml = categories
        .map(cat => {
            const count = catCounts[cat] || 0
            if (count === 0) return ''
            let color = '#6B7280'
            if (cat === 'MCA') color = '#3B82F6'
            if (cat === 'SEBI') color = '#10B981'
            if (cat === 'RBI') color = '#8B5CF6'
            if (cat === 'NCLT') color = '#F97316'
            if (cat === 'IBC') color = '#EF4444'
            if (cat === 'FEMA') color = '#14B8A6'

            return `
                <span style="background:${color}15; color:${color}; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; margin-right:6px; display:inline-block; margin-bottom:4px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    ${cat}: ${count}
                </span>
            `
        })
        .join('')

    const highImpactBadgeHtml = highImpactCount > 0 
        ? `<span style="background:#FEE2E2; color:#DC2626; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-block; margin-bottom:4px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">🔥 High Impact: ${highImpactCount}</span>`
        : ''

    // 4. Build articles HTML cards
    const articlesHtml = articles
        .map((article) => {
            const cat = (article.category || 'MCA').toUpperCase()
            let color = '#6B7280'
            if (cat === 'MCA') color = '#3B82F6'
            if (cat === 'SEBI') color = '#10B981'
            if (cat === 'RBI') color = '#8B5CF6'
            if (cat === 'NCLT') color = '#F97316'
            if (cat === 'IBC') color = '#EF4444'
            if (cat === 'FEMA') color = '#14B8A6'

            const articleUrl = `${SITE_URL}/updates/${article.slug}`
            const dateStr = article.published_at 
                ? new Date(article.published_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : ''

            // Impact badge
            let impactBadge = ''
            const isHigh = article.impact_level === 'high' || article.impact_level === 'High'
            const isMed = article.impact_level === 'medium' || article.impact_level === 'Medium'

            if (isHigh) {
                impactBadge = `
                    <span style="background:#FEE2E2; color:#DC2626; font-size:11px; font-weight:700; padding:3px 8px; border-radius:12px; margin-left:6px; display:inline-block; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                        High Impact
                    </span>
                `
            } else if (isMed) {
                impactBadge = `
                    <span style="background:#FEF3C7; color:#D97706; font-size:11px; font-weight:700; padding:3px 8px; border-radius:12px; margin-left:6px; display:inline-block; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                        Medium Impact
                    </span>
                `
            }

            // Top border for High Impact cards
            const borderTopStyle = isHigh ? `border-top: 4px solid ${color};` : ''

            // Formatted Summary: strip html tags if present, limit to 300 chars
            let summaryText = article.summary || article.content || ''
            // Simple tag stripper
            summaryText = summaryText.replace(/<[^>]*>/g, '')
            if (summaryText.length > 250) {
                summaryText = summaryText.slice(0, 247) + '...'
            }

            return `
                <tr>
                    <td style="padding: 16px 0 0 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0"
                               style="background:#ffffff; border-radius:12px; border:1px solid #E2E8F0; border-collapse:collapse; overflow:hidden; ${borderTopStyle}">
                            <tr>
                                <td style="padding:20px 24px;">
                                    
                                    <!-- Badges -->
                                    <div style="margin-bottom:12px;">
                                        <span style="background:${color}20; color:${color}; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                            ${cat}
                                        </span>
                                        ${impactBadge}
                                    </div>

                                    <!-- Title -->
                                    <h3 style="margin:0 0 10px 0; font-family:Georgia,serif; font-size:18px; font-weight:700; color:#0F172A; line-height:1.4;">
                                        <a href="${articleUrl}" style="color:#0F172A; text-decoration:none;">
                                            ${article.title}
                                        </a>
                                    </h3>

                                    <!-- Summary -->
                                    <p style="margin:0 0 14px 0; font-size:14px; color:#475569; line-height:1.6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                                        ${summaryText}
                                    </p>

                                    <!-- Footer info -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td style="font-size:12px; color:#94A3B8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                ${dateStr}
                                            </td>
                                            <td align="right">
                                                <a href="${articleUrl}" style="font-size:13px; color:#F59E0B; font-weight:600; text-decoration:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                    Read full article →
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `
        })
        .join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader text (hidden) -->
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#ffffff;line-height:1px;">${previewText}</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC; padding: 24px 0; border-collapse:collapse;">
    <tr>
      <td align="center">
        
        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);border-collapse:collapse;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background:#0F172A; padding:32px 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td>
                    <span style="font-size:22px; font-weight:900; color:#ffffff; font-family:Georgia,serif; letter-spacing:-0.5px;">
                      CorpLawUpdates<span style="color:#F59E0B;">.</span>in
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:#F59E0B20; color:#F59E0B; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; letter-spacing:0.5px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      WEEKLY INTELLIGENCE
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:24px 0 8px; font-size:24px; font-weight:800; color:#ffffff; font-family:Georgia,serif; line-height:1.3;">
                Corporate & Regulator Updates Digest
              </h1>
              <p style="margin:0; font-size:14px; color:#94A3B8; line-height:1.5;">
                Curated insights for Company Secretaries, Corporate Lawyers, Chartered Accountants, and Compliance Professionals.
              </p>
            </td>
          </tr>

          <!-- ── HEADLINE MOVE BANNER ── -->
          ${headlineMove ? `
          <tr>
            <td style="padding: 20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF7ED; border-left:4px solid #F59E0B; border-radius:4px; border-collapse:collapse;">
                <tr>
                  <td style="padding:14px 20px; font-size:14px; color:#92400E; font-weight:700; font-family:Georgia,serif; line-height:1.5;">
                     📣 ${headlineMove}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- ── STATS BAR ── -->
          <tr>
            <td style="padding:20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0; padding:14px 16px; border-collapse:collapse;">
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:12px; color:#64748B; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
                      📋 Weekly Activity Report (${totalCount} updates)
                    </div>
                    <div style="line-height:1.6;">
                      ${statsBadgesHtml}
                      ${highImpactBadgeHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── ARTICLES LIST ── -->
          <tr>
            <td style="padding:8px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                ${articlesHtml || `
                <tr>
                  <td style="padding:40px 0; text-align:center; color:#94A3B8; font-size:14px;">
                    No updates published in the selected period.
                  </td>
                </tr>
                `}
              </table>
            </td>
          </tr>

          <!-- ── COMPLIANCE CALENDAR CTA ── -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0F172A; border-radius:12px; overflow:hidden; border-collapse:collapse;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                          <p style="margin:0 0 4px; font-size:15px; font-weight:800; color:#ffffff; font-family:Georgia,serif;">
                            📅 Free Compliance Calendar 2026
                          </p>
                          <p style="margin:0; font-size:12px; color:#94A3B8;">
                            Track statutory deadlines across MCA, SEBI, RBI & FEMA.
                          </p>
                        </td>
                        <td align="right" style="padding-left:12px; white-space:nowrap;">
                          <a href="${SITE_URL}/calendar" style="display:inline-block; background:#F59E0B; color:#0F172A; font-weight:700; font-size:12px; padding:8px 16px; border-radius:6px; text-decoration:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Open Calendar
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SOCIAL & FEED ── -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC; border-radius:12px; border:1px solid #E2E8F0; border-collapse:collapse;">
                <tr>
                  <td style="padding:16px 20px; text-align:center; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:12px; color:#64748B; font-weight:700; margin-bottom:10px; letter-spacing:0.5px;">
                      FOLLOW US FOR DAILY LEGAL INTELLIGENCE
                    </div>
                    <table cellpadding="0" cellspacing="4" border="0" align="center" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <a href="https://twitter.com/corplawupdates" style="display:inline-block; background:#000000; color:#ffffff; font-size:11px; font-weight:700; padding:6px 12px; border-radius:6px; text-decoration:none;">
                            𝕏 Twitter
                          </a>
                        </td>
                        <td>
                          <a href="https://linkedin.com/company/corplawupdates" style="display:inline-block; background:#0A66C2; color:#ffffff; font-size:11px; font-weight:700; padding:6px 12px; border-radius:6px; text-decoration:none;">
                            in LinkedIn
                          </a>
                        </td>
                        <td>
                          <a href="https://whatsapp.com/channel/corplawupdates" style="display:inline-block; background:#25D366; color:#ffffff; font-size:11px; font-weight:700; padding:6px 12px; border-radius:6px; text-decoration:none;">
                            💬 WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#0F172A; padding:24px 32px; text-align:center; border-radius:0 0 16px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <p style="margin:0 0 8px; font-size:12px; color:#94A3B8;">
                You are receiving this because you subscribed at <a href="${SITE_URL}" style="color:#F59E0B; text-decoration:none;">corplawupdates.in</a>
              </p>
              <p style="margin:0 0 16px; font-size:11px; color:#64748B; line-height:1.4;">
                India's Free Corporate Law Intelligence Platform · MCA · SEBI · RBI · NCLT · IBC · FEMA
              </p>
              <a href="${unsubscribeUrl}" style="font-size:11px; color:#94A3B8; text-decoration:underline;">
                Unsubscribe from this newsletter
              </a>
              <p style="margin:12px 0 0; font-size:10px; color:#475569;">
                Disclaimer: The content provided is for educational and informational purposes only and does not constitute legal or professional advice.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendNewsletterEmails({
    subject,
    previewText,
    body: emailBody,
    mode = 'markdown',
    targetEmails,
    customHtmlBuilder,
    newsletterMode,
    articleCount
}: {
    subject: string
    previewText?: string
    body: string
    mode?: 'markdown' | 'html'
    targetEmails?: string[]
    customHtmlBuilder?: (unsubscribeUrl: string) => string
    newsletterMode?: 'auto' | 'custom'
    articleCount?: number
}) {
    const fromEmail = (process.env.RESEND_FROM_EMAIL || 'updates@mail.corplawupdates.in').trim().replace(/['"]/g, '')
    const adminEmail = (process.env.ADMIN_EMAIL || 'mail@corplawupdates.in').trim().replace(/['"]/g, '')
    const resend = new Resend(process.env.RESEND_API_KEY)

    let bodyHtml = ''
    if (customHtmlBuilder) {
        // Pre-build a sample to store in the campaign table (using admin email as unsubscribe token fallback)
        const sampleUnsub = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(adminEmail)}&token=${generateUnsubscribeToken(adminEmail)}`
        bodyHtml = customHtmlBuilder(sampleUnsub)
    } else {
        let rawHtml = emailBody
        if (mode === 'markdown') {
            rawHtml = markdownToHtml(emailBody)
        }

        bodyHtml = sanitizeHtml(rawHtml, {
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
    }

    // Dynamic fetch subscribers based on confirmed field (fallback to is_active if column does not exist)
    let query = supabaseAdmin.from('subscribers').select('id, email')
    if (targetEmails && Array.isArray(targetEmails) && targetEmails.length > 0) {
        query = query.in('email', targetEmails)
    }

    let subscribers: any[] = []
    let subError: any = null

    try {
        const { data, error } = await query.eq('confirmed', true).eq('is_active', true)
        if (error) {
            // Check if column confirmed does not exist
            if (error.message.includes('confirmed') || error.code === '42703') {
                console.log("[Newsletter] Column 'confirmed' missing in subscribers table. Falling back to is_active filter.")
                let fallbackQuery = supabaseAdmin.from('subscribers').select('id, email').eq('is_active', true)
                if (targetEmails && Array.isArray(targetEmails) && targetEmails.length > 0) {
                    fallbackQuery = fallbackQuery.in('email', targetEmails)
                }
                const fallbackRes = await fallbackQuery
                subscribers = fallbackRes.data || []
                subError = fallbackRes.error
            } else {
                subError = error
            }
        } else {
            subscribers = data || []
        }
    } catch (e: any) {
        console.warn("[Newsletter] Dynamic query threw error. Falling back...", e)
        let fallbackQuery = supabaseAdmin.from('subscribers').select('id, email').eq('is_active', true)
        if (targetEmails && Array.isArray(targetEmails) && targetEmails.length > 0) {
            fallbackQuery = fallbackQuery.in('email', targetEmails)
        }
        const fallbackRes = await fallbackQuery
        subscribers = fallbackRes.data || []
        subError = fallbackRes.error
    }

    if (subError) throw new Error(`DB error: ${subError.message}`)
    if (!subscribers || subscribers.length === 0) return { sent: 0, failed: 0, total: 0 }

    // Create Campaign Record
    let campaignId: string | undefined;
    const { data: campaign, error: campaignError } = await supabaseAdmin.from('newsletter_campaigns').insert({
        subject,
        preview_text: previewText || null,
        content: emailBody || 'Newsletter generated dynamically',
        content_type: customHtmlBuilder ? 'html' : mode,
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

    // Sequential send — one email at a time, 500ms apart to stay under Resend's free tier cap
    for (const sub of subscribers) {
        try {
            const token = generateUnsubscribeToken(sub.email)
            const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${token}`

            const html = customHtmlBuilder 
                ? customHtmlBuilder(unsubUrl)
                : buildEmailHtml({
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

    // Write to newsletter_sends audit table if newsletterMode is provided
    if (newsletterMode) {
        try {
            await supabaseAdmin.from('newsletter_sends').insert({
                subject,
                article_count: articleCount || 0,
                recipient_count: sent + failed,
                mode: newsletterMode,
                status: failed > 0 ? 'failed' : 'sent',
                sent_at: new Date().toISOString()
            })
            console.log(`[Newsletter] Successfully audited campaign send to newsletter_sends: mode=${newsletterMode}`)
        } catch (auditErr) {
            console.error('[Newsletter] Failed to log send attempt to newsletter_sends audit table:', auditErr)
        }
    }

    return { sent, failed, total: subscribers.length, successList, failedList }
}
