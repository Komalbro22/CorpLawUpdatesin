import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { formatPartnerInterest } from '../route'

export const dynamic = 'force-dynamic'

const ALLOWED_PATCH_FIELDS = new Set(['status', 'note', 'additional_notes'])
const VALID_STATUSES = ['pending', 'reviewed', 'contacted', 'onboarded', 'rejected']

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await verifyAdminOrKey(request, 'partner-interests:read')
    if (!authCheck.success) {
        return authCheck.response
    }

    try {
        const { id } = await params
        const { data, error } = await supabaseAdmin
            .from('partner_interests')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error) throw error

        if (!data) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Partner interest not found' } },
                { status: 404 }
            )
        }

        const formatted = formatPartnerInterest(data)
        return NextResponse.json({
            partnerInterest: formatted,
            item: formatted,
        })
    } catch (err: unknown) {
        console.error('Error fetching partner interest:', err)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch partner interest' } },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await verifyAdminOrKey(request, 'partner-interests:write')
    if (!authCheck.success) {
        return authCheck.response
    }

    const clientIp = getClientIp(request)

    try {
        const { id } = await params
        let rawBody: Record<string, any>
        try {
            rawBody = await request.json()
        } catch {
            return NextResponse.json(
                { error: { code: 'BAD_REQUEST', message: 'Invalid JSON payload' } },
                { status: 400 }
            )
        }

        // Strict validation: reject any unknown fields naming the field
        const unrecognized = Object.keys(rawBody).filter((k) => !ALLOWED_PATCH_FIELDS.has(k))
        if (unrecognized.length > 0) {
            return NextResponse.json(
                {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: `Unrecognized field(s): ${unrecognized.map((f) => `"${f}"`).join(', ')}. Supported fields: status, note.`,
                    },
                },
                { status: 400 }
            )
        }

        const { status, note, additional_notes } = rawBody

        if (status === undefined && note === undefined && additional_notes === undefined) {
            return NextResponse.json(
                {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'At least one of "status" or "note" is required for update.',
                    },
                },
                { status: 400 }
            )
        }

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: `Invalid status "${status}". Allowed statuses: ${VALID_STATUSES.join(', ')}.`,
                    },
                },
                { status: 400 }
            )
        }

        // Fetch existing record to verify existence and capture old_status for audit log
        const { data: existing, error: fetchErr } = await supabaseAdmin
            .from('partner_interests')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (fetchErr) throw fetchErr

        if (!existing) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Partner interest not found' } },
                { status: 404 }
            )
        }

        const updatePayload: Record<string, any> = {}
        if (status !== undefined) {
            updatePayload.status = status
        }
        if (note !== undefined) {
            updatePayload.additional_notes = typeof note === 'string' ? note.trim() : null
        } else if (additional_notes !== undefined) {
            updatePayload.additional_notes = typeof additional_notes === 'string' ? additional_notes.trim() : null
        }

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('partner_interests')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single()

        if (updateErr) throw updateErr

        // Audit Logging (Actor key name + timestamp + old/new status)
        const keyId = authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : undefined
        const keyName = authCheck.auth.type === 'api_key' ? authCheck.auth.key.name : `session:${authCheck.auth.role}`

        await logApiAudit({
            keyId,
            keyName,
            action: 'partner-interests:update',
            entityType: 'partner_interest',
            entityId: id,
            ip: clientIp,
            status: 'success',
            details: {
                old_status: existing.status,
                new_status: status || existing.status,
                note: note !== undefined ? note : (additional_notes !== undefined ? additional_notes : undefined),
            },
        })

        const formatted = formatPartnerInterest(updated)
        return NextResponse.json({
            success: true,
            partnerInterest: formatted,
            item: formatted,
        })
    } catch (err: unknown) {
        console.error('Error updating partner interest:', err)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to update partner interest' } },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await verifyAdminOrKey(request, 'partner-interests:write')
    if (!authCheck.success) {
        return authCheck.response
    }

    // Hard Rule: NO delete endpoint for partner interests via API
    if (authCheck.auth.type === 'api_key') {
        return NextResponse.json(
            {
                error: {
                    code: 'FORBIDDEN',
                    message: 'API keys cannot delete partner interest submissions. Deletions must be performed manually in the admin dashboard.',
                },
            },
            { status: 403 }
        )
    }

    try {
        const { id } = await params
        const { error } = await supabaseAdmin
            .from('partner_interests')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Partner interest deleted successfully' })
    } catch (err: unknown) {
        console.error('Error deleting partner interest:', err)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete partner interest' } },
            { status: 500 }
        )
    }
}
