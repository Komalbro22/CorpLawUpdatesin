import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { validateRecurrenceRule, computePreviewInstances } from '@/lib/compliance-series-rules'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/calendar/rules/preview
 * Validates a recurrence rule JSON object and returns the next N computed instances.
 * Requires: calendar:read
 */
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const body = await request.json()
    const rule = body.rule
    const count = typeof body.count === 'number' ? Math.min(12, Math.max(1, body.count)) : 3

    // Support all aliases: base_date, baseDate, from, anchor_date, anchorDate, reference_date, referenceDate
    const rawBaseDate =
      body.base_date ??
      body.baseDate ??
      body.from ??
      body.anchor_date ??
      body.anchorDate ??
      body.reference_date ??
      body.referenceDate ??
      request.nextUrl.searchParams.get('base_date') ??
      request.nextUrl.searchParams.get('baseDate') ??
      request.nextUrl.searchParams.get('from') ??
      request.nextUrl.searchParams.get('anchor_date')

    let anchorDate = new Date()
    if (rawBaseDate) {
      const parsed = new Date(rawBaseDate)
      if (!isNaN(parsed.getTime())) {
        anchorDate = parsed
      }
    }

    const validation = validateRecurrenceRule(rule)
    if (!validation.valid || !validation.normalizedRule) {
      return NextResponse.json(
        {
          valid: false,
          error: 'INVALID_RECURRENCE_RULE',
          message: validation.error,
        },
        { status: 400 }
      )
    }

    const preview = computePreviewInstances(validation.normalizedRule, anchorDate, count)

    return NextResponse.json({
      valid: true,
      rule: validation.normalizedRule,
      preview,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        valid: false,
        error: 'BAD_REQUEST',
        message: err?.message || 'Invalid request body',
      },
      { status: 400 }
    )
  }
}
