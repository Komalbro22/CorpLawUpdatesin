import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { safeCompare } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const DEACTIVATE_EVENTS = new Set([
  'hardbounce',
  'hard_bounce',
  'spam',
  'complaint',
  'spam_complaint',
  'spamcomplaint',
])

const LOG_ONLY_EVENTS = new Set([
  'softbounce',
  'soft_bounce',
  'blocked',
  'invalid',
  'invalid_email',
  'deferred',
  'delivered',
  'opened',
  'uniqueopened',
  'click',
  'request',
  'sent',
  'unsubscribed',
])

interface BrevoEventPayload {
  event?: string
  email?: string
  reason?: string
  'message-id'?: string
  message_id?: string
  messageId?: string
  [key: string]: unknown
}

function extractIncomingSecret(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, '').trim()
  }

  const headerSecret =
    request.headers.get('x-brevo-secret') ||
    request.headers.get('x-webhook-secret')

  return headerSecret ? headerSecret.trim() : null
}

function normalizeEventList(body: unknown): BrevoEventPayload[] {
  if (Array.isArray(body)) {
    return body.filter((item): item is BrevoEventPayload => Boolean(item && typeof item === 'object'))
  }
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>
    if (Array.isArray(obj.events)) {
      return obj.events.filter((item): item is BrevoEventPayload => Boolean(item && typeof item === 'object'))
    }
    return [obj as BrevoEventPayload]
  }
  return []
}

async function deactivateSubscriberByEmail(email: string): Promise<number> {
  const trimmed = email.trim()
  if (!trimmed) return 0

  const escapedPattern = trimmed.replace(/[\\%_]/g, '\\$&')
  const { data: candidates, error: lookupError } = await supabaseAdmin
    .from('subscribers')
    .select('id, email')
    .ilike('email', escapedPattern)

  if (lookupError || !candidates || candidates.length === 0) {
    return 0
  }

  const normalizedTarget = trimmed.toLowerCase()
  const matchingIds = candidates
    .filter(row => typeof row.email === 'string' && row.email.trim().toLowerCase() === normalizedTarget)
    .map(row => row.id)

  if (matchingIds.length === 0) return 0

  const { error: updateErr } = await supabaseAdmin
    .from('subscribers')
    .update({
      is_active: false,
      unsubscribed_at: new Date().toISOString(),
    })
    .in('id', matchingIds)

  if (updateErr) {
    throw updateErr
  }

  return matchingIds.length
}

/**
 * POST /api/webhooks/brevo
 * Handles Brevo transactional & complaint webhooks with fail-closed Bearer / header secret verification.
 * Wired event types:
 *   - Deactivate subscriber + log: hardBounce / hard_bounce, spam / complaint / spam_complaint
 *   - Log only (keep active): softBounce / soft_bounce, deferred, blocked, invalid, delivered, opened, click
 */
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.BREVO_WEBHOOK_SECRET?.trim()
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Brevo webhook secret (BREVO_WEBHOOK_SECRET) is not configured' },
      { status: 503 }
    )
  }

  const providedSecret = extractIncomingSecret(request)
  if (!providedSecret || !safeCompare(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
  }

  try {
    const rawBody = await request.json().catch(() => null)
    const events = normalizeEventList(rawBody)

    if (events.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty Brevo event payload' }, { status: 400 })
    }

    const processed: Array<{
      id?: string
      event: string
      email: string | null
      action_taken: string
    }> = []

    for (const evt of events) {
      const rawEvent = typeof evt.event === 'string' ? evt.event.trim() : ''
      if (!rawEvent) continue

      const normalizedEvent = rawEvent.toLowerCase()
      const email = typeof evt.email === 'string' && evt.email.trim() ? evt.email.trim() : null
      const messageId =
        (typeof evt['message-id'] === 'string' && evt['message-id'].trim()) ||
        (typeof evt.message_id === 'string' && evt.message_id.trim()) ||
        (typeof evt.messageId === 'string' && evt.messageId.trim()) ||
        null
      const reason = typeof evt.reason === 'string' && evt.reason.trim() ? evt.reason.trim() : null

      let actionTaken = 'logged_only'

      if (DEACTIVATE_EVENTS.has(normalizedEvent)) {
        if (email) {
          const updatedCount = await deactivateSubscriberByEmail(email)
          actionTaken = updatedCount > 0 ? 'deactivated_subscriber' : 'logged_no_matching_subscriber'

          // Mark matching recipient delivery row if identifiable
          const isHardBounce = normalizedEvent.includes('bounce')
          if (messageId) {
            await supabaseAdmin
              .from('newsletter_recipients')
              .update({
                ...(isHardBounce ? { status: 'bounced' } : {}),
                error_message: reason || `Brevo ${rawEvent}`,
              })
              .eq('resend_email_id', messageId)
          }
        } else {
          actionTaken = 'logged_missing_email'
        }
      } else if (LOG_ONLY_EVENTS.has(normalizedEvent)) {
        actionTaken = 'logged_only'
      } else {
        actionTaken = 'logged_unhandled_event'
      }

      const { data: logRow, error: logErr } = await supabaseAdmin
        .from('newsletter_webhook_events')
        .insert({
          provider: 'brevo',
          event_type: rawEvent,
          email,
          message_id: messageId,
          reason,
          action_taken: actionTaken,
          payload: evt,
        })
        .select('id')
        .single()

      if (logErr) {
        console.error('[Brevo Webhook] Event log insert error:', logErr.message)
      }

      processed.push({
        id: logRow?.id,
        event: rawEvent,
        email,
        action_taken: actionTaken,
      })
    }

    return NextResponse.json({
      received: true,
      processedCount: processed.length,
      events: processed,
    })
  } catch (err: any) {
    console.error('[Brevo Webhook] Error processing event:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to process Brevo webhook' },
      { status: 500 }
    )
  }
}
