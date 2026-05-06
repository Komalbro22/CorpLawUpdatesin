import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  void cookies()
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, admin_note } = body

  if (action === 'approve') {
    const { data: suggestion, error: fetchError } = await supabaseAdmin
      .from('compliance_suggestions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }

    // New entry — insert into compliance_entries
    if (suggestion.suggestion_type === 'new_entry') {
      await supabaseAdmin
        .from('compliance_entries')
        .insert({
          regulator: suggestion.regulator,
          form_name: suggestion.form_name,
          compliance_title: suggestion.compliance_title,
          due_date: suggestion.due_date,
          applicable_to: suggestion.applicable_to,
          penalty: suggestion.penalty,
          regulation_reference: suggestion.regulation_reference,
          created_by: `community:${suggestion.user_email}`,
          contributor_name: suggestion.user_name,
          contributor_profession: suggestion.user_profession,
          contributor_email: suggestion.user_email,
          is_verified: false,
        })
    }

    // Error report — update existing entry with correction and contributor credit
    if (
      suggestion.suggestion_type === 'error_report' &&
      suggestion.compliance_entry_id &&
      suggestion.error_field &&
      suggestion.suggested_correction
    ) {
      const { data: currentEntry } = await supabaseAdmin
        .from('compliance_entries')
        .select('correction_count')
        .eq('id', suggestion.compliance_entry_id)
        .single()

      await supabaseAdmin
        .from('compliance_entries')
        .update({
          [suggestion.error_field]: suggestion.suggested_correction,
          contributor_name: suggestion.user_name,
          contributor_profession: suggestion.user_profession,
          contributor_email: suggestion.user_email,
          correction_count: (currentEntry?.correction_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', suggestion.compliance_entry_id)
    }

    // Mark suggestion as live
    await supabaseAdmin
      .from('compliance_suggestions')
      .update({
        status: 'live',
        admin_note: admin_note || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
      })
      .eq('id', params.id)

    return NextResponse.json({ success: true, action: 'approved' })
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin
      .from('compliance_suggestions')
      .update({
        status: 'rejected',
        admin_note: admin_note || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
      })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, action: 'rejected' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
