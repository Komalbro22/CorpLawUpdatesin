/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { location = 'unknown', pageUrl = '', slug = '', device = 'unknown' } = body

        // Fire-and-forget insert into database
        const { error } = await supabaseAdmin
            .from('preferred_source_clicks')
            .insert({
                location: String(location).slice(0, 50),
                page_url: String(pageUrl).slice(0, 500),
                slug: String(slug).slice(0, 200),
                device: String(device).slice(0, 20)
            })

        if (error) {
            console.warn('[Tracking] Failed to log preferred source click to database:', error.message)
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.warn('[Tracking] Telemetry error:', err?.message || err)
        return NextResponse.json({ success: false }, { status: 200 }) // Return 200 so clients never fail
    }
}
