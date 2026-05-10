/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const from = (page - 1) * limit
    const to = from + limit - 1

    try {
        // Fetch paginated campaigns
        const { data: campaigns, count, error } = await supabaseAdmin
            .from('newsletter_campaigns')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) throw error

        // Fetch pending scheduled newsletters
        const { data: scheduled, error: schedError } = await supabaseAdmin
            .from('scheduled_newsletters')
            .select('*')
            .eq('status', 'pending')
            .order('scheduled_at', { ascending: true })

        if (schedError) throw schedError

        // Fetch aggregate stats
        const { data: aggregateData, error: aggError } = await supabaseAdmin
            .from('newsletter_campaigns')
            .select('sent_count, failed_count')

        if (aggError) throw aggError

        let totalSent = 0
        let totalFailed = 0
        aggregateData.forEach(c => {
            totalSent += c.sent_count || 0
            totalFailed += c.failed_count || 0
        })

        const { count: openedCount, error: openedError } = await supabaseAdmin
            .from('newsletter_recipients')
            .select('id', { count: 'exact', head: true })
            .in('status', ['opened', 'clicked'])

        if (openedError) throw openedError

        const deliveryRate = totalSent > 0 ? ((totalSent - totalFailed) / totalSent * 100).toFixed(1) : 0
        const openRate = totalSent > 0 ? (((openedCount || 0) / totalSent) * 100).toFixed(1) : 0

        const { data: chartData } = await supabaseAdmin
            .from('newsletter_campaigns')
            .select('created_at, sent_count')
            .order('created_at', { ascending: true })
            .limit(30)

        const formattedChartData = chartData?.map(c => ({
            date: new Date(c.created_at).toLocaleDateString(),
            sent: c.sent_count
        })) || []

        return NextResponse.json({
            campaigns,
            scheduled,
            total: count || 0,
            stats: {
                totalSent,
                totalDelivered: totalSent - totalFailed,
                deliveryRate,
                openRate
            },
            chartData: formattedChartData
        })
    } catch (err: any) {
        console.error('Failed to fetch history:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    try {
        const { error } = await supabaseAdmin
            .from('scheduled_newsletters')
            .delete()
            .eq('id', id)
            .eq('status', 'pending')

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Failed to delete scheduled newsletter:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

