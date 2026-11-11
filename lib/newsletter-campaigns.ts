import { supabaseAdmin } from '@/lib/supabase-server'
import { sendEmail, parseSender, getDefaultReplyTo } from '@/lib/email-provider'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

const SENT_STATUSES = new Set(['sent', 'delivered', 'opened', 'clicked'])

export interface CampaignStats {
  sent: number
  delivered: number | null
  opened: number | null
  clicked: number | null
  bounced: number | null
  failed: number | null
  pending: number | null
  open_rate: number | null
  click_rate: number | null
  recipient_rows_count: number
  tracked_in_brevo_only: boolean
  tracking_source: 'recipients' | 'brevo_only' | 'none'
  tracking_note: string | null
}

export interface RecipientStatRow {
  id?: string | null
  email?: string | null
  status?: string | null
  sent_at?: string | null
  delivered_at?: string | null
  opened_at?: string | null
  clicked_at?: string | null
}

const RANK_BY_STATUS: Record<string, number> = {
  failed: -2,
  bounced: -1,
  pending: 0,
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
}

/**
 * Computes cumulative per-campaign delivery, unique-open, and unique-click stats
 * from newsletter_recipients rows. Pre-F1 sends with 0 recipient rows and sent_count > 0
 * preserve stored sent_count and mark metrics as tracked in Brevo only without fabricating rates.
 */
export function computeCampaignStats(
  recipients: RecipientStatRow[] | null | undefined,
  campaignMeta?: { sent_count?: number | null; failed_count?: number | null }
): CampaignStats {
  const rows = recipients || []
  const storedSentCount = Number(campaignMeta?.sent_count || 0)
  const storedFailedCount = campaignMeta?.failed_count != null ? Number(campaignMeta.failed_count) : null

  if (rows.length === 0) {
    if (storedSentCount > 0) {
      return {
        sent: storedSentCount,
        delivered: null,
        opened: null,
        clicked: null,
        bounced: null,
        failed: storedFailedCount,
        pending: null,
        open_rate: null,
        click_rate: null,
        recipient_rows_count: 0,
        tracked_in_brevo_only: true,
        tracking_source: 'brevo_only',
        tracking_note: 'tracked in Brevo only',
      }
    }

    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: storedFailedCount || 0,
      pending: 0,
      open_rate: 0,
      click_rate: 0,
      recipient_rows_count: 0,
      tracked_in_brevo_only: false,
      tracking_source: 'none',
      tracking_note: null,
    }
  }

  // Deduplicate by lowercase email using highest reached funnel state for unique recipient counts
  const uniqueByEmail = new Map<string, RecipientStatRow>()
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const key =
      typeof row.email === 'string' && row.email.trim()
        ? row.email.trim().toLowerCase()
        : row.id || `row-${i}`

    const existing = uniqueByEmail.get(key)
    if (!existing) {
      uniqueByEmail.set(key, { ...row })
      continue
    }

    const existingRank = RANK_BY_STATUS[existing.status || 'pending'] ?? 0
    const nextRank = RANK_BY_STATUS[row.status || 'pending'] ?? 0
    uniqueByEmail.set(key, {
      ...existing,
      status: nextRank >= existingRank ? row.status : existing.status,
      sent_at: existing.sent_at || row.sent_at,
      delivered_at: existing.delivered_at || row.delivered_at,
      opened_at: existing.opened_at || row.opened_at,
      clicked_at: existing.clicked_at || row.clicked_at,
    })
  }

  let sent = 0
  let delivered = 0
  let opened = 0
  let clicked = 0
  let bounced = 0
  let failed = 0
  let pending = 0

  for (const row of uniqueByEmail.values()) {
    const hasClicked = row.status === 'clicked' || Boolean(row.clicked_at)
    const hasOpened = hasClicked || row.status === 'opened' || Boolean(row.opened_at)
    const hasDelivered = hasOpened || row.status === 'delivered' || Boolean(row.delivered_at)
    const isBounced = !hasDelivered && row.status === 'bounced'
    const isFailed = !hasDelivered && !isBounced && row.status === 'failed'
    const isSent = hasDelivered || isBounced || row.status === 'sent' || Boolean(row.sent_at)

    if (hasClicked) clicked++
    if (hasOpened) opened++
    if (hasDelivered) delivered++
    if (isBounced) bounced++
    if (isFailed) failed++
    if (isSent) sent++
    if (!isSent && !isFailed) pending++
  }

  const openRate = delivered > 0 ? Number(((opened / delivered) * 100).toFixed(1)) : 0
  const clickRate = delivered > 0 ? Number(((clicked / delivered) * 100).toFixed(1)) : 0

  return {
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    failed,
    pending,
    open_rate: openRate,
    click_rate: clickRate,
    recipient_rows_count: rows.length,
    tracked_in_brevo_only: false,
    tracking_source: 'recipients',
    tracking_note: null,
  }
}

/**
 * Fetches lean recipient tracking columns (paginated beyond 1,000 rows) and computes CampaignStats.
 */
export async function fetchCampaignStats(
  campaignId: string,
  campaignMeta?: { sent_count?: number | null; failed_count?: number | null }
): Promise<CampaignStats> {
  const rows: RecipientStatRow[] = []
  const pageSize = 1000
  let offset = 0

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('newsletter_recipients')
      .select('id, email, status, sent_at, delivered_at, opened_at, clicked_at')
      .eq('campaign_id', campaignId)
      .range(offset, offset + pageSize - 1)

    if (error) {
      throw error
    }

    const batch = (data || []) as RecipientStatRow[]
    rows.push(...batch)

    if (batch.length < pageSize) {
      break
    }
    offset += pageSize
  }

  return computeCampaignStats(rows, campaignMeta)
}

function injectOrAppendUnsubscribeFooter(rawHtml: string, recipientEmail: string): string {
  const token = generateUnsubscribeToken(recipientEmail)
  const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${token}`

  if (rawHtml.includes('/api/unsubscribe')) {
    return rawHtml.replace(/https?:\/\/[^"'\s]+\/api\/unsubscribe\?[^"'\s]+/g, unsubUrl)
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <div>
        ${rawHtml.includes('<') ? rawHtml : rawHtml.replace(/\n/g, '<br/>')}
      </div>
      <hr style="margin-top: 32px; border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 16px;">
        You received this email because you subscribed to CorpLawUpdates.in.<br/>
        <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  `
}

export interface RetryCampaignResult {
  statusCode: number
  payload: Record<string, unknown>
}

/**
 * Shared retry processor for failed/bounced campaign recipients.
 * Strictly skips any recipient email that already has a sent/delivered/opened/clicked row
 * in newsletter_recipients for the campaign, and refuses test campaigns (403).
 */
export async function retryFailedCampaignRecipients(campaignId: string): Promise<RetryCampaignResult> {
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from('newsletter_campaigns')
    .select('id, subject, rendered_html, content, is_test, sent_count, failed_count, total_recipients, status')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    return { statusCode: 404, payload: { error: 'Campaign not found' } }
  }

  if (campaign.is_test === true) {
    return {
      statusCode: 403,
      payload: {
        error: {
          code: 'FORBIDDEN_TEST_CAMPAIGN',
          message: 'Test campaigns cannot be retried or broadcast to subscribers.',
        },
      },
    }
  }

  const { data: allRecipients, error: recipientsError } = await supabaseAdmin
    .from('newsletter_recipients')
    .select('id, email, status')
    .eq('campaign_id', campaignId)

  if (recipientsError) {
    return { statusCode: 500, payload: { error: recipientsError.message } }
  }

  const alreadySentEmails = new Set<string>(
    (allRecipients || [])
      .filter(r => r.status && SENT_STATUSES.has(r.status))
      .map(r => r.email.toLowerCase().trim())
  )

  // Deduplicate pending retry targets by normalized lowercase email, skipping anyone already sent
  const seenTargets = new Set<string>()
  const retryTargets: Array<{ id: string; email: string }> = []

  for (const r of allRecipients || []) {
    if (r.status !== 'failed' && r.status !== 'bounced') continue
    const norm = r.email.toLowerCase().trim()
    if (alreadySentEmails.has(norm) || seenTargets.has(norm)) continue
    seenTargets.add(norm)
    retryTargets.push({ id: r.id, email: r.email })
  }

  if (retryTargets.length === 0) {
    return {
      statusCode: 200,
      payload: {
        success: true,
        message: 'No failed recipients without an existing sent row found to retry',
        retriedCount: 0,
        failedCount: 0,
        skippedAlreadySent: alreadySentEmails.size,
      },
    }
  }

  const { email: fromEmail, name: fromName } = parseSender()
  const replyTo = getDefaultReplyTo()
  const baseHtml = campaign.rendered_html || campaign.content || ''

  let retriedCount = 0
  let stillFailedCount = 0

  for (const recipient of retryTargets) {
    const html = injectOrAppendUnsubscribeFooter(baseHtml, recipient.email)
    const result = await sendEmail({
      from: fromEmail,
      fromName,
      to: recipient.email,
      replyTo,
      subject: campaign.subject,
      html,
    })

    if (result.success) {
      retriedCount++
      await supabaseAdmin
        .from('newsletter_recipients')
        .update({
          status: 'sent',
          resend_email_id: result.messageId || null,
          sent_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', recipient.id)
    } else {
      stillFailedCount++
      await supabaseAdmin
        .from('newsletter_recipients')
        .update({ error_message: `Retry (${result.provider}): ${result.error || 'Send failed'}` })
        .eq('id', recipient.id)
    }

    if (retryTargets.length > 1) {
      await new Promise(r => setTimeout(r, 80))
    }
  }

  // Recompute campaign stats accurately from recipient rows
  const { data: refreshedRecipients } = await supabaseAdmin
    .from('newsletter_recipients')
    .select('status')
    .eq('campaign_id', campaignId)

  if (refreshedRecipients && refreshedRecipients.length > 0) {
    const sentTotal = refreshedRecipients.filter(r => r.status && SENT_STATUSES.has(r.status)).length
    const failedTotal = refreshedRecipients.filter(r => r.status === 'failed' || r.status === 'bounced').length
    const nextStatus =
      sentTotal > 0 && failedTotal === 0
        ? 'sent'
        : sentTotal > 0
          ? 'partially_sent'
          : 'failed'

    await supabaseAdmin
      .from('newsletter_campaigns')
      .update({
        sent_count: sentTotal,
        failed_count: failedTotal,
        status: nextStatus,
        ...(sentTotal > 0 ? { sent_at: new Date().toISOString() } : {}),
      })
      .eq('id', campaignId)
  }

  return {
    statusCode: 200,
    payload: {
      success: retriedCount > 0,
      message: `Retried ${retriedCount} of ${retryTargets.length} failed recipient(s).`,
      retriedCount,
      failedCount: stillFailedCount,
      totalRetriedCandidates: retryTargets.length,
    },
  }
}
