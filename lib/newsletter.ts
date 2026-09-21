/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendBatchEmails, parseSender, getActiveEmailProvider } from '@/lib/email-provider'
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
    // Fix: use global flag so ALL consecutive li groups are wrapped, not just the first
    html = html.replace(/(<li>(?:(?!<li>|<\/ul>)[\s\S])*?<\/li>(?:\s*<li>(?:(?!<li>|<\/ul>)[\s\S])*?<\/li>)*)/g, '<ul>$1</ul>')
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
    const SITE_URL = BASE_URL || 'https://www.corplawupdates.in'

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#F1F5F9;opacity:0;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1F5F9;padding:24px 0;border-collapse:collapse;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);border-collapse:collapse;">
          <!-- Top Gold Accent -->
          <tr>
            <td style="background:#D4AF37;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="background:#0B132B;padding:28px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:900;color:#FFFFFF;font-family:Georgia,serif;letter-spacing:-0.5px;">
                      CorpLawUpdates<span style="color:#D4AF37;">.</span>in
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:rgba(212,175,55,0.15);color:#F59E0B;border:1px solid rgba(212,175,55,0.3);font-size:10px;font-weight:700;padding:4px 10px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      OFFICIAL NOTICE
                    </span>
                  </td>
                </tr>
              </table>
              <div style="color:#94A3B8;font-size:13px;margin-top:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                India's Corporate Law & Regulatory Intelligence Platform
              </div>
            </td>
          </tr>
          <!-- Subject Heading -->
          <tr>
            <td style="padding:28px 32px 0;">
              <h2 style="color:#0F172A;font-size:22px;font-weight:800;font-family:Georgia,serif;margin:0 0 16px;line-height:1.35;">${subject}</h2>
              <div style="height:1px;background:#E2E8F0;font-size:0;line-height:0;margin:0 0 20px;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 32px 28px;color:#334155;font-size:15px;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              ${sanitizeHtml(bodyHtml, {
                allowedTags: ['p','br','strong','em','b','i','u','s','h1','h2','h3','h4','h5','h6','ul','ol','li','a','table','thead','tbody','tr','th','td','hr','blockquote','code','pre','div','span','img'],
                allowedAttributes: {
                  'a': ['href', 'style', 'target', 'class'],
                  'img': ['src', 'alt', 'width', 'height', 'style', 'class'],
                  'table': ['style', 'width', 'border', 'class', 'cellpadding', 'cellspacing'],
                  'td': ['style', 'width', 'class', 'colspan', 'rowspan'],
                  'th': ['style', 'width', 'class', 'colspan', 'rowspan'],
                  '*': ['style', 'class', 'id'],
                },
                allowedStyles: {
                  '*': {
                    '.*': [/^\s*[\s\S]+$/]
                  }
                },
                allowedSchemes: ['http', 'https', 'mailto', 'data'],
              })}
            </td>
          </tr>
          <!-- Refined Footer -->
          <tr>
            <td style="background:#0B132B;padding:24px 32px;text-align:center;border-top:1px solid #1E293B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;">
                You are receiving this communication because you are subscribed to <a href="${SITE_URL}" style="color:#D4AF37;text-decoration:none;font-weight:600;">CorpLawUpdates.in</a>.
              </p>
              <p style="margin:0 0 14px;font-size:11px;color:#64748B;">
                New Delhi · Mumbai · MCA · SEBI · RBI · NCLT · IBC · FEMA
              </p>
              <a href="${unsubscribeUrl}" style="font-size:11px;color:#94A3B8;text-decoration:underline;">
                Unsubscribe or Manage Notification Preferences
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildNewsletterTemplateHtml({
    subject,
    previewText,
    introMessage,
    articles = [],
    unsubscribeUrl,
    upcomingDeadlines = [],
    leadArticleId,
    includeDeadlines = false
}: {
    subject: string
    previewText: string
    introMessage?: string | null
    articles: any[]
    unsubscribeUrl: string
    upcomingDeadlines?: any[]
    leadArticleId?: string | null
    includeDeadlines?: boolean
}): string {
    const SITE_URL = BASE_URL || 'https://www.corplawupdates.in'

    // Formatted Edition Date
    const now = new Date()
    const editionDateStr = now.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    // Regulator color palette mapping
    const REGULATOR_COLORS: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
        MCA: { bg: '#2563EB', text: '#FFFFFF', border: '#1D4ED8', lightBg: '#EFF6FF' },
        SEBI: { bg: '#059669', text: '#FFFFFF', border: '#047857', lightBg: '#ECFDF5' },
        RBI: { bg: '#7C3AED', text: '#FFFFFF', border: '#6D28D9', lightBg: '#F5F3FF' },
        NCLT: { bg: '#EA580C', text: '#FFFFFF', border: '#C2410C', lightBg: '#FFF7ED' },
        IBC: { bg: '#DC2626', text: '#FFFFFF', border: '#B91C1C', lightBg: '#FEF2F2' },
        FEMA: { bg: '#0D9488', text: '#FFFFFF', border: '#0F766E', lightBg: '#F0FDFA' },
        CCI: { bg: '#4F46E5', text: '#FFFFFF', border: '#4338CA', lightBg: '#EEF2FF' },
        LABOUR: { bg: '#D97706', text: '#FFFFFF', border: '#B45309', lightBg: '#FFFBEB' },
        IFSCA: { bg: '#0891B2', text: '#FFFFFF', border: '#0E7490', lightBg: '#ECFEFF' },
        TAX: { bg: '#B45309', text: '#FFFFFF', border: '#92400E', lightBg: '#FFFBEB' },
        OTHER: { bg: '#475569', text: '#FFFFFF', border: '#334155', lightBg: '#F8FAFC' }
    }

    // 1. Stats and Category Counts
    const totalCount = articles.length
    const categories = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI', 'LABOUR', 'IFSCA']
    const catCounts: Record<string, number> = { MCA: 0, SEBI: 0, RBI: 0, NCLT: 0, IBC: 0, FEMA: 0, CCI: 0, LABOUR: 0, IFSCA: 0 }
    let highImpactCount = 0

    articles.forEach(art => {
        const cat = (art.category || '').toUpperCase()
        if (cat in catCounts) {
            catCounts[cat]++
        }
        if (art.impact_level?.toLowerCase() === 'high') {
            highImpactCount++
        }
    })

    const statsBadgesHtml = categories
        .filter(cat => (catCounts[cat] || 0) > 0)
        .map(cat => {
            const count = catCounts[cat]
            const meta = REGULATOR_COLORS[cat] || REGULATOR_COLORS.OTHER
            return `
                <span style="background:${meta.lightBg};color:${meta.border};border:1px solid ${meta.border}30;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;margin-right:6px;display:inline-block;margin-bottom:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    ${cat}: ${count}
                </span>
            `
        })
        .join('')

    // 2. Separate Lead Hero Story vs Secondary Articles
    let leadArticle: any = null
    if (leadArticleId && articles.length > 0) {
        leadArticle = articles.find(a => a.id === leadArticleId || a.slug === leadArticleId)
    }
    if (!leadArticle && articles.length > 0) {
        leadArticle = articles.find(a => a.is_featured) ||
                      articles.find(a => a.impact_level?.toLowerCase() === 'high') ||
                      articles[0]
    }
    const secondaryArticles = articles.filter(a => a !== leadArticle)

    // 3. 60-Second Executive Memo Bullets
    let memoBulletsHtml = ''
    if (introMessage && introMessage.trim()) {
        const lines = introMessage.split('\n').filter(l => l.trim().length > 0)
        memoBulletsHtml = lines.map(line => `
            <tr>
                <td style="padding:4px 0;vertical-align:top;width:20px;font-size:14px;color:#D4AF37;line-height:1.4;">▸</td>
                <td style="padding:4px 0;font-size:13px;line-height:1.5;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    ${line.replace(/^[•\-\*]\s*/, '')}
                </td>
            </tr>
        `).join('')
    } else if (articles.length > 0) {
        // Auto-synthesize from top updates with lead story prioritized first
        const bulletArticles = leadArticle
            ? [leadArticle, ...articles.filter(a => a !== leadArticle)].slice(0, 3)
            : articles.slice(0, 3)
        memoBulletsHtml = bulletArticles.map(art => {
            const cat = (art.category || 'Regulatory').toUpperCase()
            let rawSnippet = (art.summary || art.content || '').replace(/<[^>]*>/g, '').trim()
            if (rawSnippet.length > 120) {
                rawSnippet = rawSnippet.slice(0, 117) + '...'
            }
            return `
                <tr>
                    <td style="padding:4px 0;vertical-align:top;width:20px;font-size:14px;color:#D4AF37;line-height:1.4;">▸</td>
                    <td style="padding:4px 0;font-size:13px;line-height:1.5;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                        <strong style="color:#0F172A;">${cat}:</strong> ${art.title} — <span style="color:#64748B;">${rawSnippet}</span>
                    </td>
                </tr>
            `
        }).join('')
    }

    // 4. Hero Lead Story Card HTML
    let leadStoryHtml = ''
    if (leadArticle) {
        const leadCat = (leadArticle.category || 'MCA').toUpperCase()
        const meta = REGULATOR_COLORS[leadCat] || REGULATOR_COLORS.OTHER
        const leadUrl = `${SITE_URL}/updates/${leadArticle.slug}`
        const leadDate = leadArticle.published_at 
            ? new Date(leadArticle.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : editionDateStr
        
        let leadSummary = (leadArticle.summary || leadArticle.content || '').replace(/<[^>]*>/g, '').trim()
        if (leadSummary.length > 320) {
            leadSummary = leadSummary.slice(0, 317) + '...'
        }

        const leadRef = leadArticle.source_name || leadArticle.regulation_ref || 'Official Regulatory Notification'
        const leadWhyItMatters = leadArticle.key_change || leadArticle.quick_answer || 'Examine standard governance procedures and statutory filing checklists to ensure compliance with updated regulatory directives.'

        leadStoryHtml = `
            <tr>
                <td style="padding:24px 24px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #CBD5E1;border-top:4px solid ${meta.bg};overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.06);border-collapse:collapse;">
                        <tr>
                            <td style="padding:22px 24px;">
                                <!-- Badges -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;border-collapse:collapse;">
                                    <tr>
                                        <td>
                                            <span style="background:${meta.bg};color:#FFFFFF;font-size:10px;font-weight:800;padding:3px 9px;border-radius:4px;letter-spacing:0.8px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                ⭐ LEAD STORY · ${leadCat}
                                            </span>
                                            ${leadArticle.impact_level?.toLowerCase() === 'high' ? `
                                                <span style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;margin-left:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                    🔥 High Impact
                                                </span>
                                            ` : ''}
                                        </td>
                                        <td align="right" style="font-size:11px;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                            ${leadDate}
                                        </td>
                                    </tr>
                                </table>

                                <!-- Title -->
                                <h2 style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:20px;font-weight:700;color:#0F172A;line-height:1.4;">
                                    <a href="${leadUrl}" style="color:#0F172A;text-decoration:none;">
                                        ${leadArticle.title}
                                    </a>
                                </h2>

                                <!-- Summary -->
                                <p style="margin:0 0 16px 0;font-size:14px;color:#475569;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                                    ${leadSummary}
                                </p>

                                <!-- Why It Matters Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0F9FF;border-left:3px solid #0284C7;border-radius:4px;margin:0 0 18px 0;border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                                            <div style="font-size:11px;font-weight:800;color:#0369A1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
                                                📌 Why It Matters for Practice
                                            </div>
                                            <div style="font-size:13px;color:#0C4A6E;line-height:1.5;">
                                                ${leadWhyItMatters}
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Action & Ref -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="font-size:12px;color:#64748B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                            Ref: <strong>${leadRef}</strong>
                                        </td>
                                        <td align="right">
                                            <a href="${leadUrl}" style="display:inline-block;background:#0F172A;color:#FFFFFF;font-size:12px;font-weight:700;padding:8px 16px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                Read Analysis & Circular →
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
    }

    // 5. Regulatory Radar (Secondary Articles)
    const secondaryCardsHtml = secondaryArticles.map(article => {
        const cat = (article.category || 'MCA').toUpperCase()
        const meta = REGULATOR_COLORS[cat] || REGULATOR_COLORS.OTHER
        const articleUrl = `${SITE_URL}/updates/${article.slug}`
        const dateStr = article.published_at 
            ? new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : ''

        const isHigh = article.impact_level?.toLowerCase() === 'high'
        const isMed = article.impact_level?.toLowerCase() === 'medium'

        let summaryText = (article.summary || article.content || '').replace(/<[^>]*>/g, '').trim()
        if (summaryText.length > 200) {
            summaryText = summaryText.slice(0, 197) + '...'
        }

        return `
            <tr>
                <td style="padding:14px 0 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:8px;border:1px solid #E2E8F0;border-left:4px solid ${meta.bg};overflow:hidden;border-collapse:collapse;">
                        <tr>
                            <td style="padding:16px 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;border-collapse:collapse;">
                                    <tr>
                                        <td>
                                            <span style="background:${meta.lightBg};color:${meta.border};font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                ${cat}
                                            </span>
                                            ${isHigh ? `
                                                <span style="background:#FEF2F2;color:#DC2626;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                    🔥 High Impact
                                                </span>
                                            ` : isMed ? `
                                                <span style="background:#FFFBEB;color:#B45309;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                    ⚡ Medium Impact
                                                </span>
                                            ` : ''}
                                        </td>
                                        <td align="right" style="font-size:11px;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                            ${dateStr}
                                        </td>
                                    </tr>
                                </table>

                                <h3 style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:16px;font-weight:700;color:#0F172A;line-height:1.4;">
                                    <a href="${articleUrl}" style="color:#0F172A;text-decoration:none;">
                                        ${article.title}
                                    </a>
                                </h3>

                                <p style="margin:0 0 12px 0;font-size:13px;color:#475569;line-height:1.55;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                                    ${summaryText}
                                </p>

                                <div style="text-align:right;">
                                    <a href="${articleUrl}" style="font-size:12px;color:#2563EB;font-weight:700;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                        Read full circular & guidance →
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        `
    }).join('')

    // 6. Upcoming Statutory Deadlines Widget (controlled by includeDeadlines toggle)
    let deadlinesSectionHtml = ''
    if (includeDeadlines) {
        if (upcomingDeadlines && upcomingDeadlines.length > 0) {
            const rowsHtml = upcomingDeadlines.map((dl: any) => {
                const regUpper = (dl.regulator || 'MCA').toUpperCase()
                const regMeta = REGULATOR_COLORS[regUpper] || REGULATOR_COLORS.OTHER
                const cleanDueDate = (dl.due_date || '').replace(/\s+\d{4}$/, '')
                return `
                    <tr>
                        <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            <span style="background:${regMeta.lightBg};color:${regMeta.border};font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">
                                ${dl.form_name || regUpper}
                            </span>
                        </td>
                        <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            ${dl.compliance_title}
                            <div style="font-size:11px;color:#64748B;font-weight:400;">Applicable: ${dl.applicable_to || 'Relevant entities'}</div>
                        </td>
                        <td align="right" style="padding:10px 12px;border-bottom:1px solid #E2E8F0;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            <span style="background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;">
                                ${cleanDueDate}
                            </span>
                        </td>
                    </tr>
                `
            }).join('')

            deadlinesSectionHtml = `
                <tr>
                    <td style="padding:20px 24px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;border-collapse:collapse;">
                            <tr>
                                <td style="padding:16px 20px;border-bottom:1px solid #E2E8F0;background:#F1F5F9;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td>
                                                <div style="font-size:12px;font-weight:800;color:#0F172A;letter-spacing:0.5px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                    📅 Upcoming Statutory Deadlines
                                                </div>
                                            </td>
                                            <td align="right">
                                                <a href="${SITE_URL}/calendar" style="font-size:12px;color:#2563EB;font-weight:700;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                    View 2026 Calendar →
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:4px 8px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                        ${rowsHtml}
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `
        } else {
            deadlinesSectionHtml = `
                <tr>
                    <td style="padding:20px 24px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;overflow:hidden;border-collapse:collapse;">
                            <tr>
                                <td style="padding:18px 22px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:#0F172A;font-family:Georgia,serif;">
                                                    📅 Interactive Compliance Calendar 2026
                                                </p>
                                                <p style="margin:0;font-size:12px;color:#64748B;line-height:1.5;">
                                                    Track statutory due dates for 250+ annual & periodic filings across MCA, SEBI LODR, RBI & GST with penalty calculators.
                                                </p>
                                            </td>
                                            <td align="right" style="padding-left:14px;white-space:nowrap;">
                                                <a href="${SITE_URL}/calendar" style="display:inline-block;background:#0F172A;color:#FFFFFF;font-weight:700;font-size:12px;padding:8px 16px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                                    Open Calendar →
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
        }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader ghost snippet for inbox teaser -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#F1F5F9;opacity:0;">
    ${previewText || "Curated weekly intelligence across MCA, SEBI, RBI, NCLT, and IBC for corporate practitioners."}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1F5F9;padding:24px 0;border-collapse:collapse;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #CBD5E1;box-shadow:0 6px 12px -2px rgba(0,0,0,0.06);border-collapse:collapse;">

          <!-- ── TOP GOLD ACCENT BAR ── -->
          <tr>
            <td style="background:#D4AF37;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── MASTHEAD HEADER ── -->
          <tr>
            <td style="background:#0B132B;padding:28px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td>
                    <span style="font-size:23px;font-weight:900;color:#FFFFFF;font-family:Georgia,'Times New Roman',Times,serif;letter-spacing:-0.5px;">
                      CorpLawUpdates<span style="color:#D4AF37;">.</span>in
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:rgba(212,175,55,0.15);color:#F59E0B;border:1px solid rgba(212,175,55,0.3);font-size:10px;font-weight:800;padding:4px 10px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      EXECUTIVE BRIEFING
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:20px 0 8px;font-size:22px;font-weight:800;color:#FFFFFF;font-family:Georgia,'Times New Roman',Times,serif;line-height:1.35;">
                Corporate & Regulatory Intelligence Digest
              </h1>
              <p style="margin:0 0 16px;font-size:13px;color:#94A3B8;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                Curated briefing for Company Secretaries, Chartered Accountants, Corporate Lawyers & Compliance Officers.
              </p>

              <!-- Metadata bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #1E293B;padding-top:10px;border-collapse:collapse;">
                <tr>
                  <td style="font-size:11px;color:#64748B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    📅 ${editionDateStr} &nbsp;·&nbsp; ⏱️ 3 Min Executive Read &nbsp;·&nbsp; ⚖️ MCA · SEBI · RBI · NCLT · Tax
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── 60-SECOND EXECUTIVE MEMO ── -->
          ${memoBulletsHtml ? `
          <tr>
            <td style="padding:22px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFDF5;border:1px solid #FDE68A;border-left:4px solid #D4AF37;border-radius:8px;border-collapse:collapse;">
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-size:11px;font-weight:800;color:#92400E;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      ⚡ THE 60-SECOND EXECUTIVE MEMO
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      ${memoBulletsHtml}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- ── ACTIVITY & STATS BAR ── -->
          <tr>
            <td style="padding:18px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">
                            📋 Weekly Intelligence Breakdown (${totalCount} Updates):
                          </span>
                        </td>
                        ${highImpactCount > 0 ? `
                        <td align="right">
                          <span style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-size:11px;font-weight:800;padding:2px 8px;border-radius:12px;">
                            🔥 ${highImpactCount} High Impact
                          </span>
                        </td>
                        ` : ''}
                      </tr>
                    </table>
                    <div style="margin-top:8px;line-height:1.6;">
                      ${statsBadgesHtml || '<span style="font-size:12px;color:#94A3B8;">No updates logged for this window.</span>'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FEATURED LEAD STORY ── -->
          ${leadStoryHtml}

          <!-- ── REGULATORY RADAR (SECONDARY ARTICLES) ── -->
          ${secondaryArticles.length > 0 ? `
          <tr>
            <td style="padding:24px 24px 0;">
              <div style="font-size:13px;font-weight:800;color:#0F172A;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;border-bottom:2px solid #E2E8F0;padding-bottom:6px;">
                📡 Regulatory Radar & Practice Updates
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                ${secondaryCardsHtml}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- ── UPCOMING STATUTORY DEADLINES ── -->
          ${deadlinesSectionHtml}

          <!-- ── PRACTITIONER TOOL SPOTLIGHT ── -->
          <tr>
            <td style="padding:20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0B132B;border-radius:10px;overflow:hidden;border-collapse:collapse;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                          <div style="color:#D4AF37;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">
                            🛠️ PRACTITIONER TOOL SPOTLIGHT
                          </div>
                          <div style="font-size:16px;font-weight:700;color:#FFFFFF;font-family:Georgia,serif;margin-bottom:4px;">
                            MCA Late Filing Fee & Delay Penalty Calculator
                          </div>
                          <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.5;">
                            Calculate statutory late filing fees under Section 403 instantly before submitting ROC forms.
                          </p>
                        </td>
                        <td align="right" style="padding-left:14px;white-space:nowrap;">
                          <a href="${SITE_URL}/tools/fee-calculator" style="display:inline-block;background:#D4AF37;color:#0B132B;font-weight:800;font-size:12px;padding:8px 16px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Launch Tool →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FORWARD TO A COLLEAGUE ── -->
          <tr>
            <td style="padding:20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0FDF4;border:1px dashed #86EFAC;border-radius:10px;border-collapse:collapse;">
                <tr>
                  <td style="padding:14px 20px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:13px;font-weight:700;color:#166534;font-family:Georgia,serif;margin-bottom:4px;">
                      🤝 Enjoying this regulatory briefing?
                    </div>
                    <div style="font-size:12px;color:#15803D;line-height:1.5;">
                      Forward this issue to a fellow CA, CS, or legal colleague to keep your advisory practice aligned. They can subscribe free at <a href="${SITE_URL}" style="color:#166534;font-weight:700;text-decoration:underline;">corplawupdates.in</a>.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SOCIAL / COMMUNITY CHANNELS ── -->
          <tr>
            <td style="padding:20px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;border-collapse:collapse;">
                <tr>
                  <td style="padding:16px 20px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:11px;color:#64748B;font-weight:800;margin-bottom:10px;letter-spacing:0.8px;text-transform:uppercase;">
                      JOIN 2,000+ COMPLIANCE PRACTITIONERS DAILY
                    </div>
                    <table cellpadding="0" cellspacing="6" border="0" align="center" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <a href="https://linkedin.com/company/corplawupdates" style="display:inline-block;background:#0A66C2;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            in LinkedIn
                          </a>
                        </td>
                        <td>
                          <a href="https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A" style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            💬 WhatsApp
                          </a>
                        </td>
                        <td>
                          <a href="https://twitter.com/corplawupdates" style="display:inline-block;background:#0F172A;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            𝕏 Twitter
                          </a>
                        </td>
                        <td>
                          <a href="https://t.me/corplawupdate" style="display:inline-block;background:#229ED9;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            ✈️ Telegram
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── REFINED FOOTER ── -->
          <tr>
            <td style="background:#0B132B;padding:26px 32px;text-align:center;border-top:1px solid #1E293B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;">
                You are receiving this intelligence briefing because you subscribed at <a href="${SITE_URL}" style="color:#D4AF37;text-decoration:none;font-weight:600;">corplawupdates.in</a>.
              </p>
              <p style="margin:0 0 14px;font-size:11px;color:#64748B;line-height:1.5;">
                India's Free Corporate Law Intelligence Platform · MCA · SEBI · RBI · NCLT · IBC · FEMA
              </p>
              <a href="${unsubscribeUrl}" style="font-size:11px;color:#94A3B8;text-decoration:underline;">
                Unsubscribe or Update Subscription Preferences
              </a>
              <p style="margin:14px 0 0;font-size:10px;color:#475569;line-height:1.5;">
                Disclaimer: The editorial content provided is for informational and educational purposes only and does not constitute formal legal advice.
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

export function buildWeeklyDigestHtml({
    startDateStr,
    endDateStr,
    entries = [],
    unsubscribeUrl
}: {
    startDateStr: string
    endDateStr: string
    entries: any[]
    unsubscribeUrl: string
}): string {
    const SITE_URL = BASE_URL || 'https://www.corplawupdates.in'

    // Group entries by regulator
    const groups: Record<string, any[]> = {}
    entries.forEach(e => {
        const reg = (e.regulator || 'other').toLowerCase()
        if (!groups[reg]) groups[reg] = []
        groups[reg].push(e)
    })

    const REGULATOR_META: Record<string, { label: string; color: string; lightBg: string }> = {
        mca: { label: 'MCA / ROC / LLP Filings', color: '#2563EB', lightBg: '#EFF6FF' },
        sebi: { label: 'SEBI LODR & Securities Compliance', color: '#059669', lightBg: '#ECFDF5' },
        rbi: { label: 'RBI Banking & NBFC Directives', color: '#7C3AED', lightBg: '#F5F3FF' },
        income_tax: { label: 'Income Tax, TDS & Corporate Tax', color: '#EA580C', lightBg: '#FFF7ED' },
        fema: { label: 'RBI FEMA & Foreign Exchange Returns', color: '#0D9488', lightBg: '#F0FDFA' },
        cci: { label: 'CCI & Competition Law Filings', color: '#4F46E5', lightBg: '#EEF2FF' },
        nclt: { label: 'NCLT & Tribunal Matters', color: '#DC2626', lightBg: '#FEF2F2' },
        ibc: { label: 'IBC & Insolvency Deadlines', color: '#DB2777', lightBg: '#FDF2F8' },
        gst: { label: 'GST Statutory Returns (GSTR-1 / 3B)', color: '#0891B2', lightBg: '#ECFEFF' },
        labor_law: { label: 'Labour Laws (PF, ESIC, Gratuity)', color: '#D97706', lightBg: '#FFFBEB' },
        other: { label: 'General Corporate Deadlines', color: '#475569', lightBg: '#F8FAFC' }
    }

    let groupsHtml = ''

    if (entries.length === 0) {
        groupsHtml = `
            <tr>
                <td style="padding:32px 24px;text-align:center;background:#FFFDF5;border:1px dashed #F59E0B;border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:36px;margin-bottom:12px;">🎉</div>
                    <div style="font-size:16px;font-weight:800;color:#0F172A;margin-bottom:6px;font-family:Georgia,serif;">No Statutory Deadlines This Week</div>
                    <div style="font-size:13px;color:#64748B;line-height:1.5;">No statutory filing or compliance deadlines are scheduled between <strong>${startDateStr}</strong> and <strong>${endDateStr}</strong>. Enjoy a compliant, productive week!</div>
                </td>
            </tr>
        `
    } else {
        const order = ['mca', 'gst', 'income_tax', 'sebi', 'labor_law', 'rbi', 'fema', 'ibc', 'nclt', 'other']
        const keys = Object.keys(groups).sort((a, b) => {
            let idxA = order.indexOf(a)
            let idxB = order.indexOf(b)
            if (idxA === -1) idxA = 99
            if (idxB === -1) idxB = 99
            return idxA - idxB
        })

        groupsHtml = keys.map(key => {
            const meta = REGULATOR_META[key] || REGULATOR_META['other']
            const groupEntries = groups[key]

            const entriesListHtml = groupEntries.map(e => {
                const penaltyHtml = e.penalty 
                    ? `<div style="background:#FFF1F2;border-left:3px solid #EF4444;border-radius:4px;padding:8px 12px;margin-top:10px;font-size:12px;color:#991B1B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                         <strong style="color:#B91C1C;">⚠️ Statutory Penalty for Delay:</strong> ${e.penalty}
                       </div>`
                    : ''
                
                const refHtml = e.regulation_reference
                    ? `<div style="margin-top:6px;font-size:12px;color:#64748B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                         <strong>Statutory Ref:</strong> ${e.regulation_reference}
                       </div>`
                    : ''

                return `
                    <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
                                <td valign="top" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                    <div style="font-size:12px;font-weight:800;color:${meta.color};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
                                        ${e.form_name}
                                    </div>
                                    <h4 style="margin:0 0 6px 0;font-family:Georgia,serif;font-size:16px;font-weight:700;color:#0F172A;line-height:1.4;">
                                        ${e.compliance_title}
                                    </h4>
                                    <div style="font-size:13px;color:#475569;line-height:1.5;">
                                        <strong>Applicable To:</strong> ${e.applicable_to}
                                    </div>
                                    ${refHtml}
                                    ${penaltyHtml}
                                </td>
                                <td valign="top" align="right" style="padding-left:16px;min-width:110px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                                    <div style="background:${meta.lightBg};border:1px solid ${meta.color}40;border-radius:8px;padding:6px 12px;text-align:center;">
                                        <div style="font-size:10px;color:${meta.color};font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">DUE DATE</div>
                                        <div style="font-size:13px;color:#0F172A;font-weight:800;margin-top:2px;white-space:nowrap;">
                                            ${e.due_date.replace(/\s+\d{4}$/, '')}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            }).join('')

            return `
                <tr>
                    <td style="padding:16px 24px 0;">
                        <h3 style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:17px;font-weight:800;color:#0F172A;border-bottom:2px solid ${meta.color}30;padding-bottom:6px;">
                            <span style="background:${meta.color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;vertical-align:middle;"></span>
                            ${meta.label} (${groupEntries.length})
                        </h3>
                        ${entriesListHtml}
                    </td>
                </tr>
            `
        }).join('')
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>📅 Statutory Compliance Digest: ${startDateStr} - ${endDateStr}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader text snippet -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#F1F5F9;opacity:0;">
    Statutory filing deadlines across MCA, GST, SEBI & Income Tax for the week of ${startDateStr} - ${endDateStr}.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1F5F9;padding:24px 0;border-collapse:collapse;">
    <tr>
      <td align="center">
        
        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #CBD5E1;box-shadow:0 6px 12px -2px rgba(0,0,0,0.06);border-collapse:collapse;">

          <!-- ── TOP GOLD ACCENT BAR ── -->
          <tr>
            <td style="background:#D4AF37;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── HEADER ── -->
          <tr>
            <td style="background:#0B132B;padding:28px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td>
                    <span style="font-size:23px;font-weight:900;color:#FFFFFF;font-family:Georgia,serif;letter-spacing:-0.5px;">
                      CorpLawUpdates<span style="color:#D4AF37;">.</span>in
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:rgba(212,175,55,0.15);color:#F59E0B;border:1px solid rgba(212,175,55,0.3);font-size:10px;font-weight:800;padding:4px 10px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      STATUTORY DIGEST
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:20px 0 8px;font-size:22px;font-weight:800;color:#FFFFFF;font-family:Georgia,serif;line-height:1.35;">
                Weekly Compliance Deadlines Alert
              </h1>
              <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.5;">
                Stay ahead of mandatory regulatory due dates. Keep your company, clients, and statutory filings 100% compliant.
              </p>
            </td>
          </tr>

          <!-- ── DATE RANGE BANNER ── -->
          <tr>
            <td style="padding:22px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFDF5;border:1px solid #FDE68A;border-left:4px solid #D4AF37;border-radius:8px;border-collapse:collapse;">
                <tr>
                  <td style="padding:14px 20px;font-size:14px;color:#92400E;font-weight:800;font-family:Georgia,serif;line-height:1.5;">
                     📅 Statutory Deadlines for the Week: ${startDateStr} to ${endDateStr}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── STATS BAR ── -->
          ${entries.length > 0 ? `
          <tr>
            <td style="padding:18px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:11px;color:#64748B;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
                      📋 Week Summary
                    </div>
                    <div style="font-size:14px;color:#334155;line-height:1.5;">
                      There are <strong>${entries.length} statutory compliance deadlines</strong> requiring execution this week. Grouped below by regulatory authority.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- ── GROUPED ENTRIES LIST ── -->
          ${groupsHtml}

          <!-- ── COMPLIANCE CALENDAR CTA ── -->
          <tr>
            <td style="padding:24px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0B132B;border-radius:10px;overflow:hidden;border-collapse:collapse;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                          <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:#FFFFFF;font-family:Georgia,serif;">
                            📅 Interactive Compliance Calendar 2026
                          </p>
                          <p style="margin:0;font-size:12px;color:#94A3B8;">
                            Browse full monthly grids, filter by regulator, or calculate statutory delay fees.
                          </p>
                        </td>
                        <td align="right" style="padding-left:14px;white-space:nowrap;">
                          <a href="${SITE_URL}/calendar" style="display:inline-block;background:#D4AF37;color:#0B132B;font-weight:800;font-size:12px;padding:8px 16px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Open Calendar →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FORWARD TO A COLLEAGUE ── -->
          <tr>
            <td style="padding:20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0FDF4;border:1px dashed #86EFAC;border-radius:10px;border-collapse:collapse;">
                <tr>
                  <td style="padding:14px 20px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:13px;font-weight:700;color:#166534;font-family:Georgia,serif;margin-bottom:4px;">
                      🤝 Help your compliance team stay ahead
                    </div>
                    <div style="font-size:12px;color:#15803D;line-height:1.5;">
                      Forward this statutory deadlines digest to your finance, CS, and operations teams to prevent late fees and penalty notices.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SOCIAL CHANNELS ── -->
          <tr>
            <td style="padding:20px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;border-collapse:collapse;">
                <tr>
                  <td style="padding:16px 20px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <div style="font-size:11px;color:#64748B;font-weight:800;margin-bottom:10px;letter-spacing:0.8px;text-transform:uppercase;">
                      FOLLOW FOR DAILY STATUTORY NOTICES
                    </div>
                    <table cellpadding="0" cellspacing="6" border="0" align="center" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <a href="https://linkedin.com/company/corplawupdates" style="display:inline-block;background:#0A66C2;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            in LinkedIn
                          </a>
                        </td>
                        <td>
                          <a href="https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A" style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            💬 WhatsApp
                          </a>
                        </td>
                        <td>
                          <a href="https://twitter.com/corplawupdates" style="display:inline-block;background:#0F172A;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            𝕏 Twitter
                          </a>
                        </td>
                        <td>
                          <a href="https://t.me/corplawupdate" style="display:inline-block;background:#229ED9;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;text-decoration:none;">
                            ✈️ Telegram
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
            <td style="background:#0B132B;padding:26px 32px;text-align:center;border-top:1px solid #1E293B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;">
                You are receiving this automated compliance alert because you subscribed at <a href="${SITE_URL}" style="color:#D4AF37;text-decoration:none;font-weight:600;">corplawupdates.in</a>.
              </p>
              <p style="margin:0 0 14px;font-size:11px;color:#64748B;line-height:1.5;">
                India's Free Corporate Law Intelligence Platform · MCA · SEBI · RBI · NCLT · IBC · FEMA
              </p>
              <a href="${unsubscribeUrl}" style="font-size:11px;color:#94A3B8;text-decoration:underline;">
                Unsubscribe from weekly compliance alerts
              </a>
              <p style="margin:14px 0 0;font-size:10px;color:#475569;line-height:1.5;">
                Disclaimer: The content provided is for educational and compliance informational purposes only and does not constitute formal legal or tax counsel.
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
    const { email: fromEmail, name: fromName } = parseSender()
    const adminEmail = (process.env.ADMIN_EMAIL || 'mail@corplawupdates.in').trim().replace(/['"]/g, '')
    const provider = getActiveEmailProvider()

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
    let query = supabaseAdmin.from('subscribers').select('id, email').limit(500)
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
                let fallbackQuery = supabaseAdmin.from('subscribers').select('id, email').eq('is_active', true).limit(500)
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
        let fallbackQuery = supabaseAdmin.from('subscribers').select('id, email').eq('is_active', true).limit(500)
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

    console.log(`[Newsletter] Sending to ${subscribers.length} subscriber(s) using provider: ${provider}.`)

    const emailsToSend = subscribers.map((sub: any) => {
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

        return {
            to: sub.email,
            subject,
            html,
        }
    })

    const batchRes = await sendBatchEmails({
        emails: emailsToSend,
        from: fromEmail,
        fromName,
    })

    const sent = batchRes.sent
    const failed = batchRes.failed
    const successList: string[] = []
    const failedList: string[] = []
    const recipientsToInsert: any[] = []

    batchRes.results.forEach(item => {
        if (item.success) {
            successList.push(item.email)
            if (campaignId) {
                recipientsToInsert.push({
                    campaign_id: campaignId,
                    email: item.email,
                    status: 'sent',
                    resend_email_id: item.messageId || null,
                    sent_at: new Date().toISOString()
                })
            }
        } else {
            failedList.push(item.email)
            if (campaignId) {
                recipientsToInsert.push({
                    campaign_id: campaignId,
                    email: item.email,
                    status: 'failed',
                    error_message: item.error || 'Send failed'
                })
            }
        }
    })

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

    return { sent, failed, total: subscribers.length, successList, failedList, hasMore: false, remainingEmails: [] }
}
