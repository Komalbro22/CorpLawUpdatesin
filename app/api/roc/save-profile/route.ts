import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_email,
      session_id,
      company_name,
      cin,
      company_type,
      incorporation_date,
      financial_year_end,
      paid_up_capital,
      turnover,
      director_count,
      has_cs,
      is_xbrl,
      is_listed,
      has_foreign_shareholders,
      has_deposits,
      agm_date,
    } = body

    if (!company_name || !incorporation_date) {
      return NextResponse.json(
        { error: 'Company name and incorporation date required' },
        { status: 400 }
      )
    }

    if (!supabaseDocumentsAdmin) {
      return NextResponse.json(
        { error: 'DB not available' },
        { status: 503 }
      )
    }

    const { data, error } = await supabaseDocumentsAdmin
      .from('roc_company_profiles')
      .upsert({
        user_email: user_email || null,
        session_id: session_id || null,
        company_name,
        cin: cin || null,
        company_type,
        incorporation_date,
        financial_year_end: financial_year_end || 'march',
        paid_up_capital: paid_up_capital || 1000000,
        turnover: turnover || 5000000,
        director_count: director_count || 2,
        has_cs: has_cs || false,
        is_xbrl: is_xbrl || false,
        is_listed: is_listed || false,
        has_foreign_shareholders: 
          has_foreign_shareholders || false,
        has_deposits: has_deposits || true,
        agm_date: agm_date || null,
        last_calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: user_email 
          ? 'user_email,company_name' 
          : 'session_id,company_name',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile_id: data?.id,
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
