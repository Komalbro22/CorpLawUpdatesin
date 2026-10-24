import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/audit-log
 * List audit log records. Requires `audit:read` scope or admin session.
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'audit:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const keyName = searchParams.get('key')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entity')
    const status = searchParams.get('status')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    let query = supabaseAdmin
      .from('api_audit_log')
      .select('id, key_name, action, entity_type, entity_id, ip_address, status, details, timestamp', { count: 'exact' })

    if (keyName) {
      query = query.ilike('key_name', `%${keyName}%`)
    }
    if (action) {
      query = query.eq('action', action)
    }
    if (entityType) {
      query = query.eq('entity_type', entityType)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (fromDate) {
      query = query.gte('timestamp', fromDate)
    }
    if (toDate) {
      query = query.lte('timestamp', toDate)
    }

    query = query.order('timestamp', { ascending: false }).range(offset, offset + limit - 1)

    const { data: logs, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      items: logs || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch audit log' } }, { status: 500 })
  }
}
