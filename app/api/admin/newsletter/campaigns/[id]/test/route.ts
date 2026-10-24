import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendEmail, parseSender } from '@/lib/email-provider'
import { generateUnsubscribeToken, BASE_URL } from '@/lib/utils'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

function buildEmailHtml(body: string, email: string): string {
  const token = generateUnsubscribeToken(email)
  const unsubLink = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <div style="padding: 10px 16px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; font-size: 12px; color: #92400e; margin-bottom: 20px;">
        ⚠️ This is a TEST dispatch of CorpLawUpdates Newsletter.
      </div>
      <div>
        ${body.includes('<') ? body : body.replace(/\n/g, '<br/>')}
      </div>
      <hr style="margin-top: 32px; border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 16px;">
        You received this email because you are subscribed to CorpLawUpdates.in.<br/>
        <a href="${unsubLink}" style="color: #64748b; text-decoration: underline;">Unsubscribe safely</a>
      </p>
    </div>
  `
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { id } = await params
    const body = await request.json()
    const testEmail = body?.testEmail || body?.email

    if (!testEmail || typeof testEmail !== 'string' || !testEmail.includes('@')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'A valid testEmail address is required.' } },
        { status: 400 }
      )
    }

    const { data: campaign, error: fetchErr } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !campaign) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Campaign not found' } }, { status: 404 })
    }

    const { email: fromEmail, name: fromName } = parseSender()

    const rawHtml = campaign.rendered_html || campaign.content || campaign.body || ''

    const sendRes = await sendEmail({
      from: fromEmail,
      fromName,
      to: testEmail.trim(),
      subject: `[TEST] ${campaign.subject}`,
      html: buildEmailHtml(rawHtml, testEmail.trim()),
    })

    if (!sendRes.success) {
      return NextResponse.json(
        { error: { code: 'SEND_FAILED', message: sendRes.error || 'Failed to send test email' } },
        { status: 500 }
      )
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'newsletter:test',
        entityType: 'newsletter',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { testEmail, subject: campaign.subject, provider: sendRes.provider },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${testEmail}`,
      provider: sendRes.provider,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to process test send' } },
      { status: 500 }
    )
  }
}
