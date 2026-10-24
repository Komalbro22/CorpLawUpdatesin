import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'subscribers:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { data: allActive, error } = await supabaseAdmin
      .from('subscribers')
      .select('email, subscribed_at')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })

    if (error) throw error

    let csvString = 'email,subscribed_at\n'
    if (allActive) {
      allActive.forEach(sub => {
        csvString += `${sub.email},${sub.subscribed_at}\n`
      })
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'subscribers:export',
        entityType: 'subscriber',
        ip: clientIp,
        status: 'success',
        details: { count: allActive?.length || 0 }, // Sensitive emails not logged in details
      })
    }

    return new Response(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="corplawupdates-subscribers.csv"',
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to export subscribers' } },
      { status: 500 }
    )
  }
}
