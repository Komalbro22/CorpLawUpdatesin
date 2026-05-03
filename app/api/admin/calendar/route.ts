import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin
    .from('compliance_calendar')
    .select('*')
    .order('category')
    .order('due_date_sort', { ascending: true, nullsFirst: false })
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json({ entries: data || [] })
}

export async function POST(request: Request) {
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const { action } = body

  if (action === 'create') {
    const { category, form_name, compliance, regulation, due_date, due_date_sort, applicable_to, penalty, priority, notes } = body
    const { data, error } = await supabaseAdmin
      .from('compliance_calendar')
      .insert({ category, form_name, compliance, regulation, due_date, due_date_sort: due_date_sort || null, applicable_to, penalty, priority: priority || 'medium', notes })
      .select()
      .single()
    if (error) {
      console.error('Create error:', error)
      return NextResponse.json({ error: error.message || 'Failed to create' }, { status: 500 })
    }
    return NextResponse.json({ success: true, entry: data })
  }

  if (action === 'update') {
    const { id, category, form_name, compliance, regulation, due_date, due_date_sort, applicable_to, penalty, priority, notes, is_active } = body
    const { error } = await supabaseAdmin
      .from('compliance_calendar')
      .update({ category, form_name, compliance, regulation, due_date, due_date_sort: due_date_sort || null, applicable_to, penalty, priority, notes, is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (action === 'delete') {
    const { id } = body
    const { error } = await supabaseAdmin
      .from('compliance_calendar')
      .delete()
      .eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
