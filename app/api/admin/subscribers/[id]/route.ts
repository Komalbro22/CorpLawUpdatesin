/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
        const { id } = params
        const { error } = await supabaseAdmin
            .from('subscribers')
            .update({ 
                is_active: false, 
                unsubscribed_at: new Date().toISOString() 
            })
            .eq('id', id)
            
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
        const { id } = params
        const { error } = await supabaseAdmin.from('subscribers').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
