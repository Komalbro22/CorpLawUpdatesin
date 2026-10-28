import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const authCheck = await verifyAdminOrKey(request, 'partner-interests:read')
    if (!authCheck.success) {
        return authCheck.response
    }

    try {
        const [
            { count: totalCount },
            { count: pendingCount },
            { count: reviewedCount },
            { count: contactedCount },
            { count: onboardedCount },
        ] = await Promise.all([
            supabaseAdmin.from('partner_interests').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('partner_interests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabaseAdmin.from('partner_interests').select('*', { count: 'exact', head: true }).eq('status', 'reviewed'),
            supabaseAdmin.from('partner_interests').select('*', { count: 'exact', head: true }).eq('status', 'contacted'),
            supabaseAdmin.from('partner_interests').select('*', { count: 'exact', head: true }).eq('status', 'onboarded'),
        ])

        return NextResponse.json({
            total: totalCount || 0,
            pending: pendingCount || 0,
            reviewed: reviewedCount || 0,
            contacted: contactedCount || 0,
            onboarded: onboardedCount || 0,
        })
    } catch (err: unknown) {
        console.error('Error fetching partner stats:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
