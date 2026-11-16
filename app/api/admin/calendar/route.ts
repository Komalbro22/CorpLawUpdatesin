import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/calendar
 * Compliance Calendar API overview.
 * Requires: calendar:read
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { count: entriesCount } = await supabaseAdmin
      .from('compliance_entries')
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', false)

    const { count: categoriesCount } = await supabaseAdmin
      .from('compliance_categories')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      name: 'CorpLawUpdates Compliance Calendar Management API',
      version: 'v1.0',
      status: 'active',
      stats: {
        total_active_entries: entriesCount || 0,
        total_categories: categoriesCount || 0,
      },
      endpoints: {
        categories: {
          list: 'GET /api/admin/calendar/categories',
          create: 'POST /api/admin/calendar/categories',
          get: 'GET /api/admin/calendar/categories/[id]',
          update: 'PATCH /api/admin/calendar/categories/[id]',
          delete: 'DELETE /api/admin/calendar/categories/[id] (guarded: fails if entries > 0)',
        },
        entries: {
          list: 'GET /api/admin/calendar/entries?category=&month=&year=&status=&due_in_days=&verification=&search=',
          get: 'GET /api/admin/calendar/entries/[id]',
          create: 'POST /api/admin/calendar/entries (duplicate guard included)',
          update: 'PATCH /api/admin/calendar/entries/[id] (diff logged to audit)',
          delete: 'DELETE /api/admin/calendar/entries/[id] (hard delete if never-live, soft delete if ever-live)',
          restore: 'POST /api/admin/calendar/entries/[id]/restore',
          history: 'GET /api/admin/calendar/entries/[id]/history',
          import: 'POST /api/admin/calendar/import (supports dry_run preview)',
        },
      },
      auth: {
        type: 'Bearer API Key',
        scopes_required: ['calendar:read', 'calendar:write'],
      },
    })
  } catch (err: any) {
    console.error('[API Error /calendar root]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
