import { NextRequest, NextResponse } from 'next/server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  if (!supabaseDocumentsAdmin) {
    return NextResponse.json({ results: [], total: 0, error: 'Database service unavailable' }, { status: 503 })
  }

  const cleanQuery = query.trim().replace(/[%_]/g, '')

  try {
    let dbQuery = supabaseDocumentsAdmin
      .from('companies_master')
      .select('cin, company_name, company_status, date_of_registration, authorised_capital, paid_up_capital, registered_state, roc_office, views_count, pdf_downloads_count, last_accessed_at, last_synced_at, is_manually_corrected')

    if (cleanQuery.length >= 2) {
      dbQuery = dbQuery.or(`cin.ilike.${cleanQuery}%,company_name.ilike.%${cleanQuery}%`)
    }

    const { data: results, error } = await dbQuery
      .order('last_accessed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Company search error:', error)
      return NextResponse.json({ results: [], total: 0 })
    }

    return NextResponse.json({
      results: results || [],
      total: results?.length || 0,
    })
  } catch (e: any) {
    console.error('Company search exception:', e)
    return NextResponse.json({ results: [], total: 0 }, { status: 500 })
  }
}
