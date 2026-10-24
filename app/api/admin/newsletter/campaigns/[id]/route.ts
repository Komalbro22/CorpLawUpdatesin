import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

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
        ...campaign,
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
