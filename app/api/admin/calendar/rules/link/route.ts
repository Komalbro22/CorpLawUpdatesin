import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { runSeriesLinkingPass } from '@/lib/calendar-series-linking.server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/calendar/rules/link
 * Executes the series linking pass: finds unlinked active compliance entries
 * that belong to an active series root by regulator + form_name + cadence,
 * and sets their parent_entry_id = root.id.
 * Requires: calendar:write
 */
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)
  const keyName = authCheck.auth.type === 'api_key' ? authCheck.auth.key.name : 'admin-session'
  const keyId = authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : null

  try {
    const result = await runSeriesLinkingPass()

    await logApiAudit({
      keyId,
      keyName,
      action: 'calendar:series_linking_pass',
      entityType: 'calendar_entry',
      entityId: 'series_links',
      ip: clientIp,
      status: 'success',
      details: {
        total_candidates: result.totalCandidates,
        linked_count: result.linkedCount,
        matches: result.matches,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Series linking pass completed. Linked ${result.linkedCount} of ${result.totalCandidates} candidate rows.`,
      linked_count: result.linkedCount,
      total_candidates: result.totalCandidates,
      matches: result.matches,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'LINKING_PASS_FAILED',
        message: err?.message || 'Failed to execute series linking pass',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/calendar/rules/link
 * Convenience endpoint for webhooks or monitoring check.
 */
export async function GET(request: NextRequest) {
  return POST(request)
}
