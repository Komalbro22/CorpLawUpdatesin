import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendBatchEmails, parseSender } from '@/lib/email-provider'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

function buildEmailHtml(body: string, email: string): string {
  const token = generateUnsubscribeToken(email)
  const unsubLink = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <div>
        ${body.includes('<') ? body : body.replace(/\n/g, '<br/>')}
      </div>
      <hr style="margin-top: 32px; border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 16px;">
        You received this email because you subscribed to CorpLawUpdates.in.<br/>
        <a href="${unsubLink}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  `
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:send')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { id } = await params

    // 1. Fetch Campaign
    const { data: campaign, error: fetchErr } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !campaign) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Campaign not found' } }, { status: 404 })
    }

    // 2. Refuse any test campaign from being broadcast to subscribers
    if (campaign.is_test === true) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN_TEST_CAMPAIGN',
            message: 'Test campaigns cannot be broadcast to subscribers.',
          },
        },
        { status: 403 }
      )
    }

    // 3. ATOMIC DOUBLE-SEND GUARD:
    // Single conditional update prevents near-simultaneous /send calls from both broadcasting.
    const { data: claimedCampaign, error: claimErr } = await supabaseAdmin
      .from('newsletter_campaigns')
      .update({ status: 'sending' })
      .eq('id', id)
      .eq('is_test', false)
      .eq('status', 'draft')
      .eq('sent_count', 0)
      .select('*')
      .maybeSingle()

    if (claimErr) {
      return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: claimErr.message } }, { status: 500 })
    }

    if (!claimedCampaign) {
      const { data: latestCampaign } = await supabaseAdmin
        .from('newsletter_campaigns')
        .select('is_test, status, sent_count, failed_count')
        .eq('id', id)
        .maybeSingle()

      if (latestCampaign?.is_test === true) {
        return NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN_TEST_CAMPAIGN',
              message: 'Test campaigns cannot be broadcast to subscribers.',
            },
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          already_sent: true,
          status: latestCampaign?.status || 'sent',
          message: 'Campaign has already been claimed or sent. Re-send blocked to prevent duplicate emails.',
          sent_count: latestCampaign?.sent_count || 0,
          failed_count: latestCampaign?.failed_count || 0,
          error: {
            code: 'ALREADY_SENT_OR_SENDING',
            message: 'Campaign has already been claimed or sent.',
          },
        },
        { status: 409 }
      )
    }

    // 4. Fetch all confirmed active subscribers (excluding unsubscribed)
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

      if (error) {
        await supabaseAdmin
          .from('newsletter_campaigns')
          .update({ status: 'draft' })
          .eq('id', id)
          .eq('status', 'sending')
        throw error
      }
      if (data && data.length > 0) {
        allSubscribers.push(...data)
        if (data.length < limit) hasMore = false
        else page++
      } else {
        hasMore = false
      }
    }

    if (allSubscribers.length === 0) {
      await supabaseAdmin
        .from('newsletter_campaigns')
        .update({ status: 'draft' })
        .eq('id', id)
        .eq('status', 'sending')
      return NextResponse.json(
        { error: { code: 'NO_SUBSCRIBERS', message: 'No active confirmed subscribers found to send to.' } },
        { status: 400 }
      )
    }

    const { email: fromEmail, name: fromName } = parseSender()
    const replyTo = (process.env.NEWSLETTER_REPLY_TO || process.env.ADMIN_EMAIL || 'mail@corplawupdates.in').trim()
    const rawHtml = claimedCampaign.rendered_html || claimedCampaign.content || claimedCampaign.body || ''

    const emailItems = allSubscribers.map(sub => ({
      to: sub.email,
      subject: claimedCampaign.subject,
      html: buildEmailHtml(rawHtml, sub.email),
    }))

    // 5. Dispatch batch emails
    let batchResult
    try {
      batchResult = await sendBatchEmails({
        emails: emailItems,
        from: fromEmail,
        fromName,
        replyTo,
      })
    } catch (sendErr: any) {
      await supabaseAdmin
        .from('newsletter_campaigns')
        .update({ status: 'failed' })
        .eq('id', id)
        .eq('status', 'sending')
      throw sendErr
    }

    const sentAt = new Date().toISOString()

    // 6. Write per-recipient delivery rows to newsletter_recipients
    const recipientRows = batchResult.results.map(r => ({
      campaign_id: id,
      email: r.email,
      status: r.success ? 'sent' : 'failed',
      resend_email_id: r.messageId || null,
      sent_at: r.success ? sentAt : null,
      error_message: r.success ? null : (r.error || 'Delivery failed'),
    }))

    for (let i = 0; i < recipientRows.length; i += 500) {
      const chunk = recipientRows.slice(i, i + 500)
      const { error: recInsertErr } = await supabaseAdmin
        .from('newsletter_recipients')
        .insert(chunk)
      if (recInsertErr) {
        console.error('[Admin Newsletter Send] Recipient log insert error:', recInsertErr.message)
      }
    }

    const finalStatus =
      batchResult.sent > 0 && batchResult.failed === 0
        ? 'sent'
        : batchResult.sent > 0
          ? 'partially_sent'
          : 'failed'

    // 7. Update campaign with final stats
    await supabaseAdmin
      .from('newsletter_campaigns')
      .update({
        total_recipients: allSubscribers.length,
        sent_count: batchResult.sent,
        failed_count: batchResult.failed,
        status: finalStatus,
        ...(batchResult.sent > 0 ? { sent_at: sentAt } : {}),
      })
      .eq('id', id)

    // 6. Audit log dispatch
    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'newsletter:send',
        entityType: 'newsletter',
        entityId: id,
        ip: clientIp,
        status: batchResult.sent > 0 ? 'success' : 'failure',
        details: {
          subject: campaign.subject,
          total_recipients: allSubscribers.length,
          sent: batchResult.sent,
          failed: batchResult.failed,
          provider: batchResult.provider,
          sent_at: sentAt,
        },
      })
    }

    return NextResponse.json({
      success: batchResult.sent > 0,
      sent_count: batchResult.sent,
      failed_count: batchResult.failed,
      total_recipients: allSubscribers.length,
      provider: batchResult.provider,
      sent_at: sentAt,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to dispatch newsletter' } },
      { status: 500 }
    )
  }
}
