import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { fetchCompanyFromOGDApi } from '@/lib/company-sync'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseDocumentsAdmin) {
    return NextResponse.json({ error: 'DB2 service unavailable' }, { status: 503 })
  }

  try {
    const { cin } = await req.json()
    if (!cin) {
      return NextResponse.json({ error: 'CIN is required' }, { status: 400 })
    }

    const freshRecord = await fetchCompanyFromOGDApi(cin)
    if (!freshRecord || !freshRecord.company_name) {
      return NextResponse.json({ error: 'Failed to fetch company from data.gov.in API' }, { status: 502 })
    }

    // Overwrite record in DB2 and clear manual correction flag
    const { data: updated, error } = await supabaseDocumentsAdmin
      .from('companies_master')
      .upsert({
        ...freshRecord,
        cin: cin.trim().toUpperCase(),
        is_manually_corrected: false,
        corrected_by: null,
        corrected_at: null,
        last_synced_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log admin audit event
    await supabaseDocumentsAdmin.from('company_data_audit_log').insert({
      action: 'FORCE_RESYNC',
      cin: cin.trim().toUpperCase(),
      performed_by: 'admin',
      details: { timestamp: new Date().toISOString() }
    })

    return NextResponse.json({
      success: true,
      company: updated,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Resync failed' }, { status: 500 })
  }
}
