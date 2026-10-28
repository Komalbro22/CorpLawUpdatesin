import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export function formatPartnerInterest(item: any) {
    if (!item) return null
    return {
        id: item.id,
        firm_or_individual_name: item.firm_or_individual_name,
        qualification: item.qualification,
        experience_years: item.experience_years,
        website: item.website,
        services: item.services || [],
        services_offered: item.services || [],
        partnership_types: item.partnership_types || [],
        partnership_interests: item.partnership_types || [],
        product_description: item.product_description || null,
        product_service_description: item.product_description || null,
        message: item.message || null,
        contact_preference: item.contact_preference || null,
        preferred_contact_method: item.contact_preference || null,
        contact_value: item.contact_value || null,
        contact_details: item.contact_value || null,
        status: item.status,
        created_at: item.created_at,
        submission_date: item.created_at,
        additional_notes: item.additional_notes || null,
        note: item.additional_notes || null,
    }
}

export async function GET(request: NextRequest) {
    const authCheck = await verifyAdminOrKey(request, 'partner-interests:read')
    if (!authCheck.success) {
        return authCheck.response
    }

    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'all'
        const service = searchParams.get('service') || 'all'
        const partnershipType = searchParams.get('partnership_type') || 'all'
        const since = searchParams.get('since')
        const search = searchParams.get('search')
        const exportCsv = searchParams.get('export') === 'csv'
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)))

        if (exportCsv) {
            const { data: allPartners } = await supabaseAdmin
                .from('partner_interests')
                .select('*')
                .order('created_at', { ascending: false })

            let csvString = 'id,firm_or_individual_name,qualification,experience_years,services,partnership_types,product_description,website,contact_preference,contact_value,status,created_at,message,additional_notes\n'
            if (allPartners) {
                allPartners.forEach((item) => {
                    const servicesStr = `"${(item.services || []).join('; ')}"`
                    const typesStr = `"${(item.partnership_types || []).join('; ')}"`
                    const nameEscaped = `"${(item.firm_or_individual_name || '').replace(/"/g, '""')}"`
                    const productEscaped = `"${(item.product_description || '').replace(/"/g, '""')}"`
                    const messageEscaped = `"${(item.message || '').replace(/"/g, '""')}"`
                    const notesEscaped = `"${(item.additional_notes || '').replace(/"/g, '""')}"`
                    csvString += `${item.id},${nameEscaped},${item.qualification || ''},${item.experience_years || ''},${servicesStr},${typesStr},${productEscaped},${item.website || ''},${item.contact_preference || ''},${item.contact_value || ''},${item.status || ''},${item.created_at || ''},${messageEscaped},${notesEscaped}\n`
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

        if (partnershipType !== 'all') {
            query = query.or(`partnership_types.cs.{${partnershipType}},additional_notes.ilike.%${partnershipType}%`)
        }

        if (since) {
            const sinceDate = new Date(since)
            if (!isNaN(sinceDate.getTime())) {
                query = query.gte('created_at', sinceDate.toISOString())
            }
        }

        if (search) {
            query = query.or(`firm_or_individual_name.ilike.%${search}%,contact_value.ilike.%${search}%,qualification.ilike.%${search}%,additional_notes.ilike.%${search}%`)
        }

        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.order('created_at', { ascending: false }).range(from, to)

        const { data: partnerInterests, count, error } = await query

        if (error) throw error

        const formattedItems = (partnerInterests || []).map(formatPartnerInterest)

        return NextResponse.json({
            partnerInterests: formattedItems,
            items: formattedItems,
            total: count || 0,
            page,
            limit,
            stats,
        })
    } catch (err: unknown) {
        console.error('Error fetching partner interests:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
