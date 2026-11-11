import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { retryFailedCampaignRecipients } from '@/lib/newsletter-campaigns'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authCheck = await verifyAdminOrKey(request, 'newsletter:send')
    if (!authCheck.success) {
        return authCheck.response
    }

    const { id } = await params

    try {
        const result = await retryFailedCampaignRecipients(id)
        return NextResponse.json(result.payload, { status: result.statusCode })
    } catch (err: any) {
        console.error('Failed to retry emails:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}

