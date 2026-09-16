import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const contextType = searchParams.get('type') || 'all'
    const sentiment = searchParams.get('sentiment') || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = 20
    const exportCsv = searchParams.get('export') === 'csv'

    // First check reader_feedback
    const { data: testData, error: testError } = await supabaseAdmin.from('reader_feedback').select('id').limit(1)

    if (!testError) {
      // reader_feedback table exists
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
        query = query.eq('status', status)
      }
      if (contextType !== 'all') {
        query = query.eq('context_type', contextType)
      }
      if (sentiment !== 'all') {
        query = query.eq('sentiment', sentiment)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

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
        supabaseAdmin.from('reader_feedback').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      return NextResponse.json({
        items: data || [],
        total: count || 0,
        page,
        pageSize,
        stats: {
          total: totalCount || 0,
          positive: posCount || 0,
          negative: negCount || 0,
          pending: pendCount || 0,
        },
      })
    }

    // Fallback: Read from compliance_suggestions
    let fallbackQuery = supabaseAdmin
      .from('compliance_suggestions')
      .select('*', { count: 'exact' })
      .ilike('compliance_title', '[Feedback:%')

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

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
      }
    })

    return NextResponse.json({
      items,
      total: fbCount || items.length,
      page,
      pageSize,
      stats: {
        total: fbCount || items.length,
        positive: items.filter(i => i.sentiment === 'positive').length,
        negative: items.filter(i => i.sentiment === 'negative').length,
        pending: items.filter(i => i.status === 'pending').length,
      },
    })
  } catch (err: any) {
    console.error('Admin feedback fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch feedback data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Try reader_feedback first
    const { error: primaryError } = await supabaseAdmin
      .from('reader_feedback')
      .update({ status })
      .eq('id', id)

    if (!primaryError) {
      return NextResponse.json({ success: true })
    }

    // Fallback: update compliance_suggestions
    const { error: fbError } = await supabaseAdmin
      .from('compliance_suggestions')
      .update({ status })
      .eq('id', id)

    if (fbError) throw fbError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Try reader_feedback
    const { error: primaryError } = await supabaseAdmin.from('reader_feedback').delete().eq('id', id)
    if (!primaryError) {
      return NextResponse.json({ success: true })
    }

    // Fallback: delete from compliance_suggestions
    await supabaseAdmin.from('compliance_suggestions').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
