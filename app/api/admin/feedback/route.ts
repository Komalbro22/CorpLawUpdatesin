import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

function attachFeedbackNote(item: any) {
  if (!item) return item
  if (item.admin_note !== undefined && item.admin_note !== null) {
    return { ...item, note: item.admin_note }
  }
  const noteTag = (item.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('note:'))
  const note = noteTag ? noteTag.slice(5) : null
  return { ...item, note }
}

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'feedback:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const contextType = searchParams.get('type') || 'all'
    const sentiment = searchParams.get('sentiment') || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = searchParams.has('offset')
      ? Math.max(0, parseInt(searchParams.get('offset') || '0', 10))
      : (page - 1) * limit
    const exportCsv = searchParams.get('export') === 'csv'

    // First check reader_feedback table
    const { data: testData, error: testError } = await supabaseAdmin.from('reader_feedback').select('id').limit(1)

    if (!testError) {
      if (exportCsv) {
        const { data: allRows } = await supabaseAdmin
          .from('reader_feedback')
          .select('*')
          .order('created_at', { ascending: false })

        let csv = 'ID,Context Type,Title,URL,Sentiment,Tags,Comment,User Email,Status,Created At\n'
        for (const r of allRows || []) {
          const tagsStr = `"${(r.tags || []).join('; ')}"`
          const commentStr = `"${(r.comment || '').replace(/"/g, '""')}"`
          const titleStr = `"${(r.context_title || '').replace(/"/g, '""')}"`
          csv += `${r.id},${r.context_type},${titleStr},${r.context_url},${r.sentiment},${tagsStr},${commentStr},${r.user_email || ''},${r.status},${r.created_at}\n`
        }

        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="corplawupdates-feedback.csv"',
          },
        })
      }

      let query = supabaseAdmin.from('reader_feedback').select('*', { count: 'exact' })

      if (status !== 'all') {
        // Map status aliases if agent uses unprocessed/processed
        if (status === 'unprocessed') {
          query = query.in('status', ['pending', 'unprocessed'])
        } else {
          query = query.eq('status', status)
        }
      }

      if (contextType !== 'all') {
        query = query.eq('context_type', contextType)
      }

      if (sentiment !== 'all') {
        query = query.eq('sentiment', sentiment)
      }

      const from = offset
      const to = from + limit - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      // Calculate stats
      const [
        { count: totalCount },
        { count: posCount },
        { count: negCount },
        { count: pendCount },
      ] = await Promise.all([
        supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }).eq('sentiment', 'positive'),
        supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }).eq('sentiment', 'negative'),
        supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }).in('status', ['pending', 'unprocessed']),
      ])

      const formattedItems = (data || []).map(attachFeedbackNote)

      return NextResponse.json({
        items: formattedItems,
        feedback: formattedItems,
        total: count || 0,
        page,
        limit,
        offset,
        stats: {
          total: totalCount || 0,
          positive: posCount || 0,
          negative: negCount || 0,
          pending: pendCount || 0,
          unprocessed: pendCount || 0,
        },
      })
    }

    // Fallback: Read from compliance_suggestions
    let fallbackQuery = supabaseAdmin
      .from('compliance_suggestions')
      .select('*', { count: 'exact' })
      .ilike('compliance_title', '[Feedback:%')

    const from = offset
    const to = from + limit - 1

    const { data: fbRows, count: fbCount, error: fbError } = await fallbackQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fbError) throw fbError

    const items = (fbRows || []).map(r => {
      let parsedCorrection: any = {}
      try {
        parsedCorrection = JSON.parse(r.suggested_correction || '{}')
      } catch {
        // ignore
      }
      return {
        id: r.id,
        context_type: parsedCorrection.context_type || (r.compliance_title.includes('Calculator') ? 'calculator' : 'article'),
        context_title: r.compliance_title.replace(/^\[Feedback:\s*\w+\]\s*/, ''),
        context_url: r.regulation_reference || '/',
        sentiment: parsedCorrection.sentiment || (r.error_field?.includes('negative') ? 'negative' : 'positive'),
        tags: parsedCorrection.tags || [],
        comment: parsedCorrection.comment || r.error_description,
        user_email: r.user_email,
        status: r.status || 'pending',
        created_at: r.created_at,
        note: r.admin_note || null,
      }
    })

    return NextResponse.json({
      items,
      feedback: items,
      total: fbCount || items.length,
      page,
      limit,
      offset,
      stats: {
        total: fbCount || items.length,
        positive: items.filter(i => i.sentiment === 'positive').length,
        negative: items.filter(i => i.sentiment === 'negative').length,
        pending: items.filter(i => i.status === 'pending').length,
        unprocessed: items.filter(i => i.status === 'pending').length,
      },
    })
  } catch (err: any) {
    console.error('Admin feedback fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch feedback data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'feedback:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { id, status, note } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required parameters: id and status' }, { status: 400 })
    }

    // 1. Try reader_feedback first
    const { data: rfItem } = await supabaseAdmin
      .from('reader_feedback')
      .select('id, tags')
      .eq('id', id)
      .maybeSingle()

    if (rfItem) {
      const currentTags: string[] = Array.isArray(rfItem.tags) ? rfItem.tags : []
      let updatedTags = currentTags
      if (note !== undefined) {
        updatedTags = currentTags.filter(t => typeof t !== 'string' || !t.startsWith('note:'))
        if (note && typeof note === 'string' && note.trim()) {
          updatedTags.push(`note:${note.trim()}`)
        }
      }

      const { error: primaryError } = await supabaseAdmin
        .from('reader_feedback')
        .update({ status, tags: updatedTags })
        .eq('id', id)

      if (!primaryError) {
        if (authCheck.auth.type === 'api_key') {
          await logApiAudit({
            keyId: authCheck.auth.key.id,
            keyName: authCheck.auth.key.name,
            action: 'feedback:update',
            entityType: 'feedback',
            entityId: id,
            ip: clientIp,
            status: 'success',
            details: { status, note },
          })
        }
        return NextResponse.json({ success: true, id, status, note: note || null })
      }
    }

    // 2. Fallback: update compliance_suggestions
    const { data: csItem } = await supabaseAdmin
      .from('compliance_suggestions')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (csItem) {
      const updatePayload: Record<string, any> = { status }
      if (note !== undefined) {
        updatePayload.admin_note = typeof note === 'string' ? note.trim() : null
      }

      const { error: fbError } = await supabaseAdmin
        .from('compliance_suggestions')
        .update(updatePayload)
        .eq('id', id)

      if (fbError) throw fbError

      if (authCheck.auth.type === 'api_key') {
        await logApiAudit({
          keyId: authCheck.auth.key.id,
          keyName: authCheck.auth.key.name,
          action: 'feedback:update',
          entityType: 'feedback',
          entityId: id,
          ip: clientIp,
          status: 'success',
          details: { status, note },
        })
      }

      return NextResponse.json({ success: true, id, status, note: note || null })
    }

    return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'feedback:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Try reader_feedback
    const { error: primaryError } = await supabaseAdmin.from('reader_feedback').delete().eq('id', id)
    if (!primaryError) {
      if (authCheck.auth.type === 'api_key') {
        await logApiAudit({
          keyId: authCheck.auth.key.id,
          keyName: authCheck.auth.key.name,
          action: 'feedback:delete',
          entityType: 'feedback',
          entityId: id,
          ip: clientIp,
          status: 'success',
        })
      }
      return NextResponse.json({ success: true })
    }

    // Fallback: delete from compliance_suggestions
    await supabaseAdmin.from('compliance_suggestions').delete().eq('id', id)

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'feedback:delete',
        entityType: 'feedback',
        entityId: id,
        ip: clientIp,
        status: 'success',
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
