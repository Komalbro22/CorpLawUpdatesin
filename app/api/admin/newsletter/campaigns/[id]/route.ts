import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

function formatCampaign(c: any) {
  if (!c) return c
  const htmlContent = c.rendered_html || c.content || ''
  return {
    ...c,
    html: htmlContent,
    body: htmlContent,
    status: (c.sent_count && c.sent_count > 0) ? 'sent' : 'draft',
  }
}

/**
 * GET /api/admin/newsletter/campaigns/[id]
 * Fetch campaign info and delivery statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { id } = await params

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Campaign not found' } }, { status: 404 })
    }

    // Fetch recipient stats if available
    const { count: recipientCount } = await supabaseAdmin
      .from('newsletter_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', id)

    return NextResponse.json({
      campaign: {
        ...formatCampaign(campaign),
        recipients_count: recipientCount || campaign.total_recipients || 0,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch campaign' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/newsletter/campaigns/[id]
 * Delete a campaign draft
 */
export async function DELETE(
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

    const { data: campaign, error: fetchErr } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !campaign) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Campaign not found' } }, { status: 404 })
    }

    const { error: delErr } = await supabaseAdmin
      .from('newsletter_campaigns')
      .delete()
      .eq('id', id)

    if (delErr) {
      return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: delErr.message } }, { status: 500 })
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'newsletter:delete',
        entityType: 'newsletter',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { subject: campaign.subject },
      })
    }

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to delete campaign' } },
      { status: 500 }
    )
  }
}
