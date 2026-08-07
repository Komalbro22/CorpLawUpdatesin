import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseDocumentsAdmin) {
    return NextResponse.json({ rules: [] })
  }

  const { data: rules, error } = await supabaseDocumentsAdmin
    .from('compliance_rules')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rules: rules || [] })
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseDocumentsAdmin) {
    return NextResponse.json({ error: 'DB2 service unavailable' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { rule_id, category, consequence_text, legal_section_reference, effective_from, is_active } = body

    if (!rule_id || !category || !consequence_text || !legal_section_reference) {
      return NextResponse.json({ error: 'Missing required rule fields' }, { status: 400 })
    }

    const { data: inserted, error } = await supabaseDocumentsAdmin
      .from('compliance_rules')
      .upsert({
        rule_id,
        category,
        consequence_text,
        legal_section_reference,
        effective_from: effective_from || null,
        last_verified_date: new Date().toISOString().split('T')[0],
        is_active: is_active ?? true,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit event
    await supabaseDocumentsAdmin.from('company_data_audit_log').insert({
      action: 'RULE_UPDATE',
      cin: null,
      performed_by: 'admin',
      details: { rule_id, category }
    })

    return NextResponse.json({ success: true, rule: inserted })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 })
  }
}
