import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'
import { verifyAdminSession } from '@/lib/admin-auth'

export async function GET() {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  if (!supabaseDocumentsAdmin) {
    return NextResponse.json(
      { error: 'DB not available' },
      { status: 503 }
    )
  }

  const { data, error } = await supabaseDocumentsAdmin
    .from('roc_forms')
    .select('*')
    .order('display_order')

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ forms: data })
}

export async function PUT(request: Request) {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const body = await request.json()
  const { id, ...updates } = body

  if (!supabaseDocumentsAdmin) {
    return NextResponse.json(
      { error: 'DB not available' },
      { status: 503 }
    )
  }

  const { data, error } = await supabaseDocumentsAdmin
    .from('roc_forms')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ form: data })
}
