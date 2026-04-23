/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
        const exportCsv = searchParams.get('export') === 'csv'
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')

        if (exportCsv) {
            const { data: allActive } = await supabaseAdmin
                .from('subscribers')
                .select('email, subscribed_at')
                .eq('is_active', true)
                .order('subscribed_at', { ascending: false })

            let csvString = 'email,subscribed_at\n'
            if (allActive) {
                allActive.forEach(sub => {
                    csvString += `${sub.email},${sub.subscribed_at}\n`
                })
            }

            return new Response(csvString, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="corplawupdates-subscribers.csv"'
                }
            })
        }

        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

        const [
            { count: totalActive },
            { count: totalInactive },
            { count: newThisWeek },
            { count: newThisMonth }
        ] = await Promise.all([
            supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', false),
            supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', sevenDaysAgo),
            supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', thirtyDaysAgo)
        ])

        const stats = {
            totalActive: totalActive || 0,
            totalInactive: totalInactive || 0,
            newThisWeek: newThisWeek || 0,
            newThisMonth: newThisMonth || 0
        }

        let query = supabaseAdmin
            .from('subscribers')
            .select('*', { count: 'exact' })

        if (status === 'active') {
            query = query.eq('is_active', true)
        } else if (status === 'inactive') {
            query = query.eq('is_active', false)
        }

        if (search) {
            query = query.ilike('email', `%${search}%`)
        }

        const limit = 50
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.order('subscribed_at', { ascending: false }).range(from, to)

        const { data: subscribers, count, error } = await query

        if (error) throw error

        return NextResponse.json({
            subscribers,
            total: count || 0,
            stats
        })

    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
