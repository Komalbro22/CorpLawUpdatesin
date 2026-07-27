import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { status } = body

        const validStatuses = ['pending', 'reviewed', 'contacted', 'onboarded', 'rejected']
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('partner_interests')
            .update({ status })
            .eq('id', params.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, partnerInterest: data })
    } catch (err: unknown) {
        console.error('Error updating partner interest:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { error } = await supabaseAdmin
            .from('partner_interests')
            .delete()
            .eq('id', params.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('Error deleting partner interest:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
