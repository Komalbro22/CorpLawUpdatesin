import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fetchCampaignStats } from '@/lib/newsletter-campaigns'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authCheck = await verifyAdminOrKey(request, 'newsletter:read')
    if (!authCheck.success) {
        return authCheck.response
    }

    const { id } = await params
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

        // Fetch Recipients with explicit lean columns
        let query = supabaseAdmin
            .from('newsletter_recipients')
            .select('id, campaign_id, email, status, sent_at, delivered_at, opened_at, clicked_at, clicked_url, error_message', { count: 'exact' })
            .eq('campaign_id', id)
            .order('email', { ascending: true })
            
        if (status === 'delivered') {
            query = query.in('status', ['delivered', 'opened', 'clicked'])
        } else if (status === 'opened') {
            query = query.in('status', ['opened', 'clicked'])
        } else if (status !== 'all') {
            query = query.eq('status', status)
        }
        if (search) {
            query = query.ilike('email', `%${search}%`)
        }

        const { data: recipients, count, error: recipientsError } = await query.range(from, to)

        if (recipientsError) throw recipientsError

        const stats = await fetchCampaignStats(id, {
            sent_count: campaign.sent_count,
            failed_count: campaign.failed_count,
        })

        const statusCounts = {
            sent: stats.sent,
            delivered: stats.delivered ?? 0,
            failed: stats.failed ?? 0,
            bounced: stats.bounced ?? 0,
            opened: stats.opened ?? 0,
            clicked: stats.clicked ?? 0,
            pending: stats.pending ?? 0,
        }

        // Calculate active subscribers and unsent count for this campaign
        let activeSubscribersCount = 0
        try {
            const { count: activeCount, error: subErr } = await supabaseAdmin
                .from('subscribers')
                .select('id', { count: 'exact', head: true })
                .eq('confirmed', true)
                .eq('is_active', true)
            
            if (subErr) {
                const { count: fallbackActive } = await supabaseAdmin
                    .from('subscribers')
                    .select('id', { count: 'exact', head: true })
                    .eq('is_active', true)
                activeSubscribersCount = fallbackActive || 0
            } else {
                activeSubscribersCount = activeCount || 0
            }
        } catch {
            activeSubscribersCount = campaign.total_recipients || 0
        }

        const totalAttempted = stats.tracked_in_brevo_only ? stats.sent : stats.recipient_rows_count
        const totalTarget = Math.max(campaign.total_recipients || 0, activeSubscribersCount)
        const unsentCount = Math.max(0, totalTarget - totalAttempted)

        return NextResponse.json({
            campaign: {
                ...campaign,
                stats,
            },
            stats,
            recipients,
            total: count || 0,
            statusCounts,
            activeSubscribersCount,
            unsentCount
        })

    } catch (err: any) {
        console.error('Failed to fetch campaign details:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
