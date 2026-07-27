import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'all'
        const service = searchParams.get('service') || 'all'
        const search = searchParams.get('search')
        const exportCsv = searchParams.get('export') === 'csv'
        const page = parseInt(searchParams.get('page') || '1', 10)

        if (exportCsv) {
            const { data: allPartners } = await supabaseAdmin
                .from('partner_interests')
                .select('*')
                .order('created_at', { ascending: false })

            let csvString = 'id,firm_or_individual_name,qualification,experience_years,services,website,contact_preference,contact_value,status,created_at,additional_notes\n'
            if (allPartners) {
                allPartners.forEach((item) => {
                    const servicesStr = `"${(item.services || []).join('; ')}"`
                    const nameEscaped = `"${(item.firm_or_individual_name || '').replace(/"/g, '""')}"`
                    const notesEscaped = `"${(item.additional_notes || '').replace(/"/g, '""')}"`
                    csvString += `${item.id},${nameEscaped},${item.qualification || ''},${item.experience_years || ''},${servicesStr},${item.website || ''},${item.contact_preference || ''},${item.contact_value || ''},${item.status || ''},${item.created_at || ''},${notesEscaped}\n`
                })
            }

            return new Response(csvString, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="corplawupdates-partner-interests.csv"',
                },
            })
        }

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

        const stats = {
            total: totalCount || 0,
            pending: pendingCount || 0,
            reviewed: reviewedCount || 0,
            contacted: contactedCount || 0,
            onboarded: onboardedCount || 0,
        }

        let query = supabaseAdmin.from('partner_interests').select('*', { count: 'exact' })

        if (status !== 'all') {
            query = query.eq('status', status)
        }

        if (service !== 'all') {
            query = query.contains('services', [service])
        }

        if (search) {
            query = query.or(`firm_or_individual_name.ilike.%${search}%,contact_value.ilike.%${search}%,qualification.ilike.%${search}%`)
        }

        const limit = 25
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.order('created_at', { ascending: false }).range(from, to)

        const { data: partnerInterests, count, error } = await query

        if (error) throw error

        return NextResponse.json({
            partnerInterests: partnerInterests || [],
            total: count || 0,
            stats,
        })
    } catch (err: unknown) {
        console.error('Error fetching partner interests:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
