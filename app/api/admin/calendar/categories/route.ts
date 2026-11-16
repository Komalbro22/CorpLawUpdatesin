import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidateComplianceMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/calendar/categories
 * List all categories with entry counts.
 * Requires: calendar:read
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { data: categories, error } = await supabaseAdmin
      .from('compliance_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    // Fetch entry counts per category
    const { data: countsData } = await supabaseAdmin
      .from('compliance_entries')
      .select('category_id, regulator, is_deleted')
      .eq('is_deleted', false)

    const countsMap = new Map<string, number>()
    const slugCountsMap = new Map<string, number>()
    for (const row of countsData || []) {
      if (row.category_id) {
        countsMap.set(row.category_id, (countsMap.get(row.category_id) || 0) + 1)
      }
      if (row.regulator) {
        slugCountsMap.set(row.regulator, (slugCountsMap.get(row.regulator) || 0) + 1)
      }
    }

    const categoriesWithCount = (categories || []).map((cat: any) => ({
      ...cat,
      entry_count: countsMap.get(cat.id) || slugCountsMap.get(cat.slug) || 0,
    }))

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
      total: categoriesWithCount.length,
    })
  } catch (err: any) {
    console.error('[API Error /calendar/categories GET]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/calendar/categories
 * Create a new calendar category.
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
    const body = await request.json()
    const name = (body.name || '').trim()
    let slug = (body.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    }

    const colour = (body.colour || 'blue').trim()
    const icon = (body.icon || 'Building2').trim()
    const sort_order = typeof body.sort_order === 'number' ? body.sort_order : 100
    const is_active = body.is_active !== false

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from('compliance_categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'SLUG_EXISTS', message: `Category slug "${slug}" already exists.` },
        { status: 409 }
      )
    }

    const { data: category, error } = await supabaseAdmin
      .from('compliance_categories')
      .insert({
        name,
        slug,
        colour,
        icon,
        sort_order,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    await logApiAudit({
      keyId,
      keyName,
      action: 'calendar:category_create',
      entityType: 'calendar_category',
      entityId: category.id,
      ip: clientIp,
      status: 'success',
      details: { category },
    })

    await revalidateComplianceMutation()

    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (err: any) {
    console.error('[API Error /calendar/categories POST]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
