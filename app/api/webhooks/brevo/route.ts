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
  'request',
  'sent',
  'unsubscribed',
])

const TRACKING_EVENT_TARGET: Record<string, 'delivered' | 'opened' | 'clicked'> = {
  delivered: 'delivered',
  opened: 'opened',
  uniqueopened: 'opened',
  unique_opened: 'opened',
  click: 'clicked',
  clicked: 'clicked',
}

const TRACKING_RANK: Record<string, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
}

const ALLOWED_PREDECESSOR_STATUSES: Record<'delivered' | 'opened' | 'clicked', string[]> = {
  delivered: ['pending', 'sent'],
  opened: ['pending', 'sent', 'delivered'],
  clicked: ['pending', 'sent', 'delivered', 'opened'],
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface BrevoEventPayload {
  event?: string
  email?: string
  reason?: string
  link?: string
  url?: string
  date?: string
  ts_event?: number
  ts?: number
  campaign_id?: string
  campaignId?: string
  'message-id'?: string
  message_id?: string
  messageId?: string
  [key: string]: unknown
}

function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}

function buildMessageIdCandidates(rawMessageId: string): string[] {
  const trimmed = rawMessageId.trim()
  if (!trimmed) return []
  const stripped = trimmed.replace(/^<+|>+$/g, '').trim()
  const bracketed = stripped ? `<${stripped}>` : trimmed
  return Array.from(new Set([trimmed, stripped, bracketed].filter(Boolean)))
}

function resolveEventTimestamp(evt: BrevoEventPayload): string {
  if (typeof evt.date === 'string' && evt.date.trim()) {
    const parsed = Date.parse(evt.date.trim())
    if (Number.isFinite(parsed)) {
      return new Date(parsed).toISOString()
    }
  }
  const rawTs =
    typeof evt.ts_event === 'number'
      ? evt.ts_event
      : typeof evt.ts === 'number'
        ? evt.ts
        : null
  if (rawTs !== null && Number.isFinite(rawTs) && rawTs > 0) {
    const ms = rawTs < 1e12 ? rawTs * 1000 : rawTs
    return new Date(ms).toISOString()
  }
  return new Date().toISOString()
}

function extractClickedUrl(evt: BrevoEventPayload): string | null {
  const candidate =
    (typeof evt.link === 'string' && evt.link.trim()) ||
    (typeof evt.url === 'string' && evt.url.trim()) ||
    (typeof evt.clicked_url === 'string' && evt.clicked_url.trim()) ||
    null
  return candidate || null
}

function extractCampaignUuid(evt: BrevoEventPayload): string | null {
  const direct =
    (typeof evt.campaign_id === 'string' && evt.campaign_id.trim()) ||
    (typeof evt.campaignId === 'string' && evt.campaignId.trim()) ||
    null
  if (direct && UUID_REGEX.test(direct)) return direct
  return null
}

interface MatchedRecipientRow {
  id: string
  campaign_id: string | null
  email: string
  status: string
  sent_at: string | null
  delivered_at: string | null
  opened_at: string | null
  clicked_at: string | null
  clicked_url: string | null
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

async function findMatchingRecipientRow(params: {
  email: string | null
  messageId: string | null
  campaignId: string | null
}): Promise<MatchedRecipientRow | null> {
  const normalizedEmail = params.email ? params.email.trim().toLowerCase() : null
  const escapedEmail = normalizedEmail ? escapeIlikePattern(params.email!.trim()) : null
  const selectCols = 'id, campaign_id, email, status, sent_at, delivered_at, opened_at, clicked_at, clicked_url'

  // 1. If payload includes an internal UUID campaign_id and email, match directly on that campaign
  if (params.campaignId && escapedEmail && normalizedEmail) {
    const { data: campMatches } = await supabaseAdmin
      .from('newsletter_recipients')
      .select(selectCols)
      .eq('campaign_id', params.campaignId)
      .ilike('email', escapedEmail)
      .limit(5)

    const exact = (campMatches || []).find(
      (r: any) => typeof r.email === 'string' && r.email.trim().toLowerCase() === normalizedEmail
    )
    if (exact) return exact as MatchedRecipientRow
  }

  // 2. Try matching by provider message-id (resend_email_id), scoped case-insensitively by email when provided
  if (params.messageId) {
    const candidates = buildMessageIdCandidates(params.messageId)
    if (candidates.length > 0) {
      let query = supabaseAdmin
        .from('newsletter_recipients')
        .select(selectCols)
        .in('resend_email_id', candidates)

      if (escapedEmail) {
        query = query.ilike('email', escapedEmail)
      }

      const { data: msgMatches } = await query.limit(10)
      const list = (msgMatches || []) as MatchedRecipientRow[]
      if (normalizedEmail) {
        const exact = list.find(
          r => typeof r.email === 'string' && r.email.trim().toLowerCase() === normalizedEmail
        )
        if (exact) return exact
      } else if (list.length > 0) {
        return list[0]
      }
    }
  }

  // 3. Fallback: match recipient's most recent sent/delivered/opened/clicked row case-insensitively by email
  if (!escapedEmail || !normalizedEmail) {
    return null
  }

  const { data: recentMatches } = await supabaseAdmin
    .from('newsletter_recipients')
    .select(selectCols)
    .ilike('email', escapedEmail)
    .in('status', ['sent', 'delivered', 'opened', 'clicked'])
    .order('sent_at', { ascending: false, nullsFirst: false })
    .limit(10)

  const exactRecent = (recentMatches || []).find(
    (r: any) => typeof r.email === 'string' && r.email.trim().toLowerCase() === normalizedEmail
  )
  return (exactRecent as MatchedRecipientRow) || null
}

async function applyRecipientTrackingEvent(params: {
  evt: BrevoEventPayload
  targetStatus: 'delivered' | 'opened' | 'clicked'
  email: string | null
  messageId: string | null
}): Promise<string> {
  const { evt, targetStatus, email, messageId } = params
  const campaignId = extractCampaignUuid(evt)

  const recipient = await findMatchingRecipientRow({
    email,
    messageId,
    campaignId,
  })

  if (!recipient) {
    return 'logged_unmatched_recipient'
  }

  const currentRank = TRACKING_RANK[recipient.status]
  if (currentRank === undefined) {
    return 'logged_skipped_non_sent_status'
  }

  const targetRank = TRACKING_RANK[targetStatus]
  const eventTs = resolveEventTimestamp(evt)
  const clickedUrl = targetStatus === 'clicked' ? extractClickedUrl(evt) : null
  const updateTasks: PromiseLike<unknown>[] = []

  if (targetRank > currentRank) {
    updateTasks.push(
      supabaseAdmin
        .from('newsletter_recipients')
        .update({ status: targetStatus })
        .eq('id', recipient.id)
        .in('status', ALLOWED_PREDECESSOR_STATUSES[targetStatus])
    )
  }

  if (targetRank >= TRACKING_RANK.delivered && !recipient.delivered_at) {
    updateTasks.push(
      supabaseAdmin
        .from('newsletter_recipients')
        .update({ delivered_at: eventTs })
        .eq('id', recipient.id)
        .is('delivered_at', null)
    )
  }

  if (targetRank >= TRACKING_RANK.opened && !recipient.opened_at) {
    updateTasks.push(
      supabaseAdmin
        .from('newsletter_recipients')
        .update({ opened_at: eventTs })
        .eq('id', recipient.id)
        .is('opened_at', null)
    )
  }

  if (targetRank >= TRACKING_RANK.clicked) {
    if (!recipient.clicked_at) {
      updateTasks.push(
        supabaseAdmin
          .from('newsletter_recipients')
          .update({ clicked_at: eventTs })
          .eq('id', recipient.id)
          .is('clicked_at', null)
      )
    }
    if (clickedUrl && !recipient.clicked_url) {
      updateTasks.push(
        supabaseAdmin
          .from('newsletter_recipients')
          .update({ clicked_url: clickedUrl })
          .eq('id', recipient.id)
          .is('clicked_url', null)
      )
    }
  }

  if (updateTasks.length > 0) {
    await Promise.all(updateTasks)
  }

  return targetRank > currentRank
    ? `updated_recipient_${targetStatus}`
    : `logged_no_downgrade_${targetStatus}`
}

/**
 * POST /api/webhooks/brevo
 * Handles Brevo transactional & complaint webhooks with fail-closed Bearer / header secret verification.
 * Wired event types:
 *   - Deactivate subscriber + log: hardBounce / hard_bounce, spam / complaint / spam_complaint
 *   - Track & advance status (sent -> delivered -> opened -> clicked): delivered, opened / uniqueOpened, click
 *   - Log only (keep active): softBounce / soft_bounce, deferred, blocked, invalid, sent, unsubscribed
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
      } else if (TRACKING_EVENT_TARGET[normalizedEvent]) {
        try {
          actionTaken = await applyRecipientTrackingEvent({
            evt,
            targetStatus: TRACKING_EVENT_TARGET[normalizedEvent],
            email,
            messageId,
          })
        } catch (trackErr: any) {
          console.error('[Brevo Webhook] Recipient tracking update warning:', trackErr?.message || trackErr)
          actionTaken = 'logged_tracking_error'
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
