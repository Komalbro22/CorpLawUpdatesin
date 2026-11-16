import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { computeFieldDiff } from '@/lib/compliance-calendar'
import { revalidateComplianceMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/calendar/categories/[id]
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
    const { data: category, error } = await supabaseAdmin
      .from('compliance_categories')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single()

    if (error || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Count entries
    const { count } = await supabaseAdmin
      .from('compliance_entries')
      .select('id', { count: 'exact', head: true })
      .or(`category_id.eq.${category.id},regulator.eq.${category.slug}`)
      .eq('is_deleted', false)

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        entry_count: count || 0,
      },
    })
  } catch (err: any) {
    console.error('[API Error /calendar/categories/[id] GET]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/calendar/categories/[id]
 * Edit/Update category fields (name, slug, colour, icon, sort_order, is_active).
 * Requires: calendar:write
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const clientIp = getClientIp(request)
  const keyName = authCheck.auth.type === 'api_key' ? authCheck.auth.key.name : 'admin-session'
  const keyId = authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : null

  try {
    // 1. Fetch current category
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('compliance_categories')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const body = await request.json()
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (body.name !== undefined) updates.name = String(body.name).trim()
    if (body.colour !== undefined) updates.colour = String(body.colour).trim()
    if (body.icon !== undefined) updates.icon = String(body.icon).trim()
    if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order)
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active)

    // Handle slug change safely
    if (body.slug !== undefined) {
      const newSlug = String(body.slug).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      if (newSlug && newSlug !== existing.slug) {
        // Check uniqueness
        const { data: slugDup } = await supabaseAdmin
          .from('compliance_categories')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', existing.id)
          .single()

        if (slugDup) {
          return NextResponse.json(
            { error: 'SLUG_EXISTS', message: `Category slug "${newSlug}" already exists.` },
            { status: 409 }
          )
        }
        updates.slug = newSlug
      }
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('compliance_categories')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateErr) throw updateErr

    // If slug changed, cascade update regulator & category_slug on existing entries
    if (updates.slug && updates.slug !== existing.slug) {
      await supabaseAdmin
        .from('compliance_entries')
        .update({
          regulator: updates.slug,
          category_slug: updates.slug,
        })
        .eq('category_id', existing.id)
    }

    const diff = computeFieldDiff(existing, updated)

    await logApiAudit({
      keyId,
      keyName,
      action: 'calendar:category_update',
      entityType: 'calendar_category',
      entityId: existing.id,
      ip: clientIp,
      status: 'success',
      details: {
        diff,
        category: updated,
      },
    })

    await revalidateComplianceMutation()

    return NextResponse.json({ success: true, category: updated, diff })
  } catch (err: any) {
    console.error('[API Error /calendar/categories/[id] PATCH]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/calendar/categories/[id]
 * A category may be deleted ONLY when it has no entries.
 * If it has entries, they must be moved first — entries must never be orphaned.
 * Requires: calendar:write
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'calendar:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const clientIp = getClientIp(request)
  const keyName = authCheck.auth.type === 'api_key' ? authCheck.auth.key.name : 'admin-session'
  const keyId = authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : null

  try {
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('compliance_categories')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if any entries are associated with this category
    const { count: entriesCount, error: countErr } = await supabaseAdmin
      .from('compliance_entries')
      .select('id', { count: 'exact', head: true })
      .or(`category_id.eq.${existing.id},regulator.eq.${existing.slug}`)
      .eq('is_deleted', false)

    if (countErr) throw countErr

    if (entriesCount && entriesCount > 0) {
      return NextResponse.json(
        {
          error: 'CATEGORY_NOT_EMPTY',
          message: `Category "${existing.name}" contains ${entriesCount} active entries. Entries must be moved to another category before this category can be deleted.`,
          entries_count: entriesCount,
        },
        { status: 409 }
      )
    }

    // Also check soft-deleted entries to guarantee no foreign-key violation
    const { count: softDeletedCount } = await supabaseAdmin
      .from('compliance_entries')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', existing.id)

    if (softDeletedCount && softDeletedCount > 0) {
      // Reassign soft-deleted entries to 'other' so FK constraint is satisfied without orphaning
      const { data: otherCat } = await supabaseAdmin
        .from('compliance_categories')
        .select('id')
        .eq('slug', 'other')
        .single()

      if (otherCat) {
        await supabaseAdmin
          .from('compliance_entries')
          .update({ category_id: otherCat.id, category_slug: 'other' })
          .eq('category_id', existing.id)
      }
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('compliance_categories')
      .delete()
      .eq('id', existing.id)

    if (deleteErr) throw deleteErr

    await logApiAudit({
      keyId,
      keyName,
      action: 'calendar:category_delete',
      entityType: 'calendar_category',
      entityId: existing.id,
      ip: clientIp,
      status: 'success',
      details: {
        deleted_category: existing,
      },
    })

    await revalidateComplianceMutation()

    return NextResponse.json({
      success: true,
      message: `Category "${existing.name}" was deleted successfully.`,
      id: existing.id,
    })
  } catch (err: any) {
    console.error('[API Error /calendar/categories/[id] DELETE]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
