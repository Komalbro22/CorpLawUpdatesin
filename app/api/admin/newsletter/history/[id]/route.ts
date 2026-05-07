/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const from = (page - 1) * limit
    const to = from + limit - 1

    try {
        // Fetch Campaign Info
        const { data: campaign, error: campaignError } = await supabaseAdmin
            .from('newsletter_campaigns')
            .select('*')
            .eq('id', id)
            .single()

        if (campaignError) throw campaignError

        // Fetch Recipients
        let query = supabaseAdmin
            .from('newsletter_recipients')
            .select('*', { count: 'exact' })
            .eq('campaign_id', id)
            .order('email', { ascending: true })
            
        if (status !== 'all') {
            query = query.eq('status', status)
        }
        if (search) {
            query = query.ilike('email', `%${search}%`)
        }

        const { data: recipients, count, error: recipientsError } = await query.range(from, to)

        if (recipientsError) throw recipientsError

        // Aggregate stats for this campaign specifically
        // Count occurrences of each status
        const { data: allStatuses, error: statusError } = await supabaseAdmin
            .from('newsletter_recipients')
            .select('status')
            .eq('campaign_id', id)

        if (statusError) throw statusError

        const statusCounts = {
            delivered: 0,
            failed: 0,
            bounced: 0,
            opened: 0,
            clicked: 0,
            pending: 0
        }

        allStatuses.forEach(r => {
            if (statusCounts[r.status as keyof typeof statusCounts] !== undefined) {
                statusCounts[r.status as keyof typeof statusCounts]++
            }
        })

        return NextResponse.json({
            campaign,
            recipients,
            total: count || 0,
            statusCounts
        })

    } catch (err: any) {
        console.error('Failed to fetch campaign details:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
