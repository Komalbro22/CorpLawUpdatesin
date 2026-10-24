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
 * GET /api/admin/newsletter/campaigns
 * List newsletter campaigns with pagination and status
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('newsletter_campaigns')
      .select('*', { count: 'exact' })

    if (status === 'sent') {
      query = query.gt('sent_count', 0)
    } else if (status === 'draft') {
      query = query.or('sent_count.is.null,sent_count.eq.0')
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data: campaigns, count, error } = await query

    if (error) {
      return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    }

    const formattedCampaigns = (campaigns || []).map(formatCampaign)

    return NextResponse.json({
      campaigns: formattedCampaigns,
      items: formattedCampaigns,
      total: count || 0,
      limit,
      offset,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to list campaigns' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/newsletter/campaigns
 * Create a new campaign draft
 */
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const body = await request.json()
    const { subject, html, content, rendered_html, preview_text, previewText } = body

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Subject is required for campaign.' } },
        { status: 400 }
      )
    }

    const rawHtml = html || content || rendered_html || body.body
    if (!rawHtml || typeof rawHtml !== 'string' || !rawHtml.trim()) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'HTML body is required for campaign.' } },
        { status: 400 }
      )
    }

    const preview = (preview_text || previewText || null)

    const insertData: Record<string, any> = {
      subject: subject.trim(),
      preview_text: typeof preview === 'string' && preview.trim() ? preview.trim() : null,
      content: rawHtml.trim(),
      rendered_html: rawHtml.trim(),
      content_type: 'html',
      sent_by: authCheck.auth.type === 'api_key' ? `API Key: ${authCheck.auth.key.name}` : 'admin',
      total_recipients: 0,
      sent_count: 0,
      failed_count: 0,
    }

    const { data: campaign, error } = await supabaseAdmin
      .from('newsletter_campaigns')
      .insert(insertData)
      .select()
      .single()

    if (error || !campaign) {
      console.error('[Admin Newsletter POST] Insert failed:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to create campaign' } },
        { status: 500 }
      )
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'newsletter:create',
        entityType: 'newsletter',
        entityId: campaign.id,
        ip: clientIp,
        status: 'success',
        details: { subject: campaign.subject },
      })
    }

    return NextResponse.json({ campaign: formatCampaign(campaign) }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to create campaign' } },
      { status: 500 }
    )
  }
}
