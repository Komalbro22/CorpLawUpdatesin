import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!supabaseDocumentsAdmin) {
      return NextResponse.json({ ok: true })
    }

    await supabaseDocumentsAdmin
      .from('roc_tracker_usage')
      .insert({
        company_type: body.company_type || null,
        fy_end: body.fy_end || null,
        forms_count: body.forms_count || 0,
        overdue_count: body.overdue_count || 0,
        total_penalty: body.total_penalty || 0,
      })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
