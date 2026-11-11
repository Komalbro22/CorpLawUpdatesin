import { supabaseAdmin } from '@/lib/supabase-server'
import { sendEmail, parseSender, getDefaultReplyTo } from '@/lib/email-provider'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'

const SENT_STATUSES = new Set(['sent', 'delivered', 'opened', 'clicked'])

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
