import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { retryFailedCampaignRecipients } from '@/lib/newsletter-campaigns'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/newsletter/campaigns/[id]/retry
 * Retry only failed/bounced recipients that do NOT have a sent/delivered row.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:send')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { id } = await params
    const result = await retryFailedCampaignRecipients(id)

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'newsletter:send',
        entityType: 'newsletter',
        entityId: id,
        ip: getClientIp(request),
        status: result.statusCode < 400 ? 'success' : 'failure',
        details: { mode: 'retry', ...result.payload },
      })
    }

    return NextResponse.json(result.payload, { status: result.statusCode })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to retry campaign recipients' } },
      { status: 500 }
    )
  }
}
