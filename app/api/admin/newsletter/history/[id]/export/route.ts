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

    try {
        const { data: recipients, error } = await supabaseAdmin
            .from('newsletter_recipients')
            .select('email, status, sent_at, opened_at, clicked_at, error_message')
            .eq('campaign_id', id)
            .order('email', { ascending: true })

        if (error) throw error

        let csv = 'Email,Status,Sent Date,Opened Date,Clicked Date,Error\n'
        
        // Prevent CSV Injection (CWE-1236)
        const sanitizeCsvField = (field: any) => {
            if (!field) return ''
            const str = String(field).replace(/"/g, '""')
            if (/^[=+\-@]/.test(str)) {
                return `"\t${str}"` // Prepend tab to neutralize formula execution
            }
            return `"${str}"`
        }

        recipients?.forEach(r => {
            const email = sanitizeCsvField(r.email)
            const status = sanitizeCsvField(r.status)
            const sentAt = sanitizeCsvField(r.sent_at)
            const openedAt = sanitizeCsvField(r.opened_at)
            const clickedAt = sanitizeCsvField(r.clicked_at)
            const errorMsg = sanitizeCsvField(r.error_message)
            csv += `${email},${status},${sentAt},${openedAt},${clickedAt},${errorMsg}\n`
        })

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="campaign-${id}-recipients.csv"`
            }
        })
    } catch (err: any) {
        console.error('Failed to export CSV:', err)
        return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 })
    }
}
