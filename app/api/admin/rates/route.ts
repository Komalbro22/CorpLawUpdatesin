// src/app/api/admin/rates/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

// Authorization check helper
function checkAdminAuth() {
  const session = cookies().get('admin_session')
  if (!session) {
    throw new Error('Unauthorized administrative access.')
  }
}

export async function GET() {
  try {
    checkAdminAuth()

    const { data: rates, error } = await supabaseAdmin
      .from('compliance_rates')
      .select('*')
      .in('key', [
        'rbi_bank_rate', 
        'active_amnesty_scheme', 
        'amnesty_scheme_name', 
        'amnesty_scheme_url', 
        'whatsapp_member_count'
      ])

    if (error) throw error

    return NextResponse.json({ rates })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch rates' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    checkAdminAuth()
    const { key, rate_value, text_value } = await req.json()

    if (!key) {
      return NextResponse.json({ error: 'Missing setting key parameter.' }, { status: 400 })
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString()
    }

    if (rate_value !== undefined) updatePayload.rate_value = rate_value
    if (text_value !== undefined) updatePayload.text_value = text_value

    // If we're updating rbi_bank_rate, let's mark it as verified!
    if (key === 'rbi_bank_rate') {
      updatePayload.last_verified = new Date().toISOString()
    }

    const { error } = await supabaseAdmin
      .from('compliance_rates')
      .update(updatePayload)
      .eq('key', key)

    if (error) throw error

    return NextResponse.json({ success: true, key })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update rates' }, { status: 401 })
  }
}
