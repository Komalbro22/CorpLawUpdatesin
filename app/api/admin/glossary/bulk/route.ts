import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        
        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ error: 'Payload must be a non-empty array of terms' }, { status: 400 })
        }

        // Just insert the parsed CSV directly.
        // Expecting { term, slug, definition, category, is_verified, ... }
        const { data, error } = await supabaseAdmin
            .from('glossary')
            .insert(body)
            .select()

        if (error) {
            return NextResponse.json({ error: 'Failed to import CSV', details: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: data.length })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
    }
}
