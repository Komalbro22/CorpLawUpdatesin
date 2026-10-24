/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'subscribers:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const exportCsv = searchParams.get('export') === 'csv'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const offset = searchParams.has('offset')
      ? Math.max(0, parseInt(searchParams.get('offset') || '0'))
      : (page - 1) * limit

    if (exportCsv) {
      const { data: allActive } = await supabaseAdmin
        .from('subscribers')
        .select('email, subscribed_at')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false })

      let csvString = 'email,subscribed_at\n'
      if (allActive) {
        allActive.forEach(sub => {
          csvString += `${sub.email},${sub.subscribed_at}\n`
        })
      }

      if (authCheck.auth.type === 'api_key') {
        await logApiAudit({
          keyId: authCheck.auth.key.id,
          keyName: authCheck.auth.key.name,
          action: 'subscribers:export',
          entityType: 'subscriber',
          ip: clientIp,
          status: 'success',
          details: { row_count: allActive?.length || 0 }, // Sensitive emails not logged
        })
      }

      return new Response(csvString, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="corplawupdates-subscribers.csv"',
        },
      })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: totalActive },
      { count: totalInactive },
      { count: newThisWeek },
      { count: newThisMonth },
    ] = await Promise.all([
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', false),
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', sevenDaysAgo),
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', thirtyDaysAgo),
    ])

    const stats = {
      totalActive: totalActive || 0,
      totalInactive: totalInactive || 0,
      newThisWeek: newThisWeek || 0,
      newThisMonth: newThisMonth || 0,
    }

    let query = supabaseAdmin
      .from('subscribers')
      .select('*', { count: 'exact' })

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const from = offset
    const to = from + limit - 1

    query = query.order('subscribed_at', { ascending: false }).range(from, to)

    const { data: subscribers, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      subscribers: subscribers || [],
      items: subscribers || [],
      total: count || 0,
      limit,
      offset,
      stats,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/subscribers
 * Add one subscriber adhering to system confirmation flow
 */
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'subscribers:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const body = await request.json()
    const email = body?.email?.toLowerCase().trim()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Valid email address is required.' } },
        { status: 400 }
      )
    }

    const source = body?.source?.trim() || 'api'

    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id, email, is_active')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      if (!existing.is_active) {
        // Reactivate
        const { data: updated, error } = await supabaseAdmin
          .from('subscribers')
          .update({ is_active: true, unsubscribed_at: null })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error

        if (authCheck.auth.type === 'api_key') {
          await logApiAudit({
            keyId: authCheck.auth.key.id,
            keyName: authCheck.auth.key.name,
            action: 'subscribers:reactivate',
            entityType: 'subscriber',
            entityId: existing.id,
            ip: clientIp,
            status: 'success',
            details: { source },
          })
        }

        return NextResponse.json({ subscriber: updated, message: 'Subscriber reactivated' })
      }

      return NextResponse.json(
        { error: { code: 'ALREADY_EXISTS', message: 'Subscriber is already active.' } },
        { status: 409 }
      )
    }

    const { data: newSub, error } = await supabaseAdmin
      .from('subscribers')
      .insert({
        email,
        source,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !newSub) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to add subscriber' } },
        { status: 500 }
      )
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'subscribers:add',
        entityType: 'subscriber',
        entityId: newSub.id,
        ip: clientIp,
        status: 'success',
        details: { source },
      })
    }

    return NextResponse.json({ subscriber: newSub, message: 'Subscriber added successfully' }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to process subscriber creation' } },
      { status: 500 }
    )
  }
}
