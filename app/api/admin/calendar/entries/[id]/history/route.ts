import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/calendar/entries/[id]/history
 * Get audit change history for a single entry.
 * Requires: calendar:read
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params

  try {
    const { data: history, error } = await supabaseAdmin
      .from('api_audit_log')
      .select('id, key_name, action, timestamp, details, ip_address, status')
      .eq('entity_id', id)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({
      success: true,
      entry_id: id,
      history: history || [],
      total: history?.length || 0,
    })
  } catch (err: any) {
    console.error('[API Error /calendar/entries/[id]/history GET]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
