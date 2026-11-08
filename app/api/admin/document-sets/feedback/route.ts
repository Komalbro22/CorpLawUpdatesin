import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await verifyAdminOrKey(req, 'document-sets:read')
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'all', 'open', 'fixed', 'wont_fix'

    let query = supabaseAdmin
      .from('reader_feedback')
      .select('*')
      .eq('context_type', 'document_set')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ feedback: [] })
    }

    return NextResponse.json({ feedback: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
