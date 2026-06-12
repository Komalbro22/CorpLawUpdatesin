import { NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const company_name = body.company_name || body.companyName
    const cin = body.cin
    const company_type = body.company_type || body.companyType
    const incorporation_date = body.incorporation_date || body.incorporationDate
    const financial_year_end = body.financial_year_end || body.financialYearEnd
    const paid_up_capital = body.paid_up_capital || body.paidUpCapital
    const turnover = body.turnover
    const director_count = body.director_count || body.directorCount
    const has_cs = body.has_cs !== undefined ? body.has_cs : body.hasCS
    const is_xbrl = body.is_xbrl !== undefined ? body.is_xbrl : body.isXBRL
    const is_listed = body.is_listed !== undefined ? body.is_listed : body.isListed
    const has_foreign_shareholders = body.has_foreign_shareholders !== undefined ? body.has_foreign_shareholders : body.hasForeignShareholders
    const has_deposits = body.has_deposits !== undefined ? body.has_deposits : body.hasDeposits
    const agm_date = body.agm_date || body.agmDate
    const user_email = body.user_email || body.userEmail
    const session_id = body.session_id || body.sessionId

    const has_sbo = body.has_sbo !== undefined ? body.has_sbo : body.hasSBO
    const has_resolutions = body.has_resolutions !== undefined ? body.has_resolutions : body.hasResolutions
    const has_subsidiaries = body.has_subsidiaries !== undefined ? body.has_subsidiaries : body.hasSubsidiaries
    const filing_year = body.filing_year || body.filingYear

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
        has_sbo: has_sbo || false,
        has_resolutions: has_resolutions || false,
        has_subsidiaries: has_subsidiaries || false,
        filing_year: filing_year || '2025-26',
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
