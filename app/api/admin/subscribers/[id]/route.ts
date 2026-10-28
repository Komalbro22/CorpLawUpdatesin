import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

// PATCH — status update (reactivate only for API keys; unsubscriptions restricted to dashboard admin sessions)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'subscribers:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const { id } = await params
    let isActive = false

    try {
      const body = await request.json()
      if (typeof body?.is_active === 'boolean') {
        isActive = body.is_active
      }
    } catch {
      // Default to inactive / unsubscribe for dashboard sessions when no body is provided
    }

    // Hard Security Limit: API keys cannot unsubscribe or deactivate subscribers
    if (authCheck.auth.type === 'api_key' && !isActive) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'API keys cannot unsubscribe or deactivate subscribers. Unsubscriptions are restricted to subscriber self-service or dashboard admin sessions.',
          },
        },
        { status: 403 }
      )
    }

    const updatePayload: Record<string, any> = {
      is_active: isActive,
    }
    if (!isActive) {
      updatePayload.unsubscribed_at = new Date().toISOString()
    } else {
      updatePayload.unsubscribed_at = null
    }

    const { data: updatedSub, error } = await supabaseAdmin
      .from('subscribers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Subscriber status update error:', error)
      return NextResponse.json({ error: 'Failed to update subscriber status' }, { status: 500 })
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'subscribers:activate',
        entityType: 'subscriber',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { is_active: true },
      })
    }

    return NextResponse.json({ success: true, subscriber: updatedSub })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — permanently removes subscriber (Restricted to dashboard admin sessions only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'subscribers:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  // Hard Security Limit: API keys cannot delete subscribers
  if (authCheck.auth.type === 'api_key') {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'API keys cannot delete subscribers. Subscriber deletions are restricted to admin dashboard sessions only.',
        },
      },
      { status: 403 }
    )
  }

  const clientIp = getClientIp(request)

  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('subscribers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Subscriber delete error:', error)
      return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
