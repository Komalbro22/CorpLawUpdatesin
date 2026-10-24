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

    // 2. IDEMPOTENCY / DOUBLE SEND GUARD:
    // If the campaign has already been sent, refuse to send again!
    if ((campaign.sent_count && campaign.sent_count > 0)) {
      return NextResponse.json({
        success: true,
        already_sent: true,
        message: 'Campaign has already been sent. Re-send blocked to prevent duplicate emails.',
        sent_count: campaign.sent_count || 0,
        failed_count: campaign.failed_count || 0,
      })
    }

    // 3. Fetch all confirmed active subscribers (excluding unsubscribed)
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

      if (error) throw error
      if (data && data.length > 0) {
        allSubscribers.push(...data)
        page++
      } else {
        hasMore = false
      }
    }

    if (allSubscribers.length === 0) {
      return NextResponse.json(
        { error: { code: 'NO_SUBSCRIBERS', message: 'No active confirmed subscribers found to send to.' } },
        { status: 400 }
      )
    }

    const { email: fromEmail, name: fromName } = parseSender()

    const rawHtml = campaign.rendered_html || campaign.content || campaign.body || ''

    const emailItems = allSubscribers.map(sub => ({
      to: sub.email,
      subject: campaign.subject,
      html: buildEmailHtml(rawHtml, sub.email),
    }))

    // 4. Dispatch batch emails
    const batchResult = await sendBatchEmails({
      emails: emailItems,
      from: fromEmail,
      fromName,
    })

    const sentAt = new Date().toISOString()

    // 5. Update campaign with final stats
    await supabaseAdmin
      .from('newsletter_campaigns')
      .update({
        total_recipients: allSubscribers.length,
        sent_count: batchResult.sent,
        failed_count: batchResult.failed,
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
