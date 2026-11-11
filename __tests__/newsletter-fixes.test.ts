/* eslint-disable @typescript-eslint/no-explicit-any */
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.ADMIN_PASSWORD = 'test-admin-password'
process.env.ADMIN_SECRET_SALT = 'test-secret-salt'

import { NextRequest } from 'next/server'
import nodemailer from 'nodemailer'
import * as nextCache from 'next/cache'
import { generateUnsubscribeToken } from '@/lib/utils'

type TableName =
  | 'newsletter_campaigns'
  | 'subscribers'
  | 'newsletter_recipients'
  | 'newsletter_webhook_events'

interface InMemoryDb {
  newsletter_campaigns: Array<Record<string, any>>
  subscribers: Array<Record<string, any>>
  newsletter_recipients: Array<Record<string, any>>
  newsletter_webhook_events: Array<Record<string, any>>
}

const db: InMemoryDb = {
  newsletter_campaigns: [],
  subscribers: [],
  newsletter_recipients: [],
  newsletter_webhook_events: [],
}

function sqlIlikeMatch(value: string, pattern: string): boolean {
  let regexStr = '^'
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]
    if (ch === '\\' && i + 1 < pattern.length) {
      const next = pattern[++i]
      regexStr += next.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    } else if (ch === '%') {
      regexStr += '.*'
    } else if (ch === '_') {
      regexStr += '.'
    } else {
      regexStr += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
  }
  regexStr += '$'
  return new RegExp(regexStr, 'i').test(value)
}

function makeQueryBuilder(table: TableName) {
  let mode: 'select' | 'insert' | 'update' = 'select'
  let insertRows: Array<Record<string, any>> = []
  let updatePatch: Record<string, any> = {}
  const filters: Array<(row: Record<string, any>) => boolean> = []
  let rangeSlice: [number, number] | null = null
  let wantSingle: 'single' | 'maybeSingle' | null = null

  function execute(): { data: any; error: null | { message: string } } {
    const rows = db[table]

    if (mode === 'insert') {
      const inserted = insertRows.map((item, idx) => ({
        id: item.id || `${table}-${rows.length + idx + 1}`,
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }))
      rows.push(...inserted)
      if (wantSingle) {
        return { data: inserted[0] || null, error: null }
      }
      return { data: inserted, error: null }
    }

    const matched = rows.filter(r => filters.every(fn => fn(r)))

    if (mode === 'update') {
      for (const r of matched) {
        Object.assign(r, updatePatch)
      }
      if (wantSingle === 'single') {
        if (matched.length === 0) return { data: null, error: { message: 'No rows found' } }
        return { data: { ...matched[0] }, error: null }
      }
      if (wantSingle === 'maybeSingle') {
        return { data: matched[0] ? { ...matched[0] } : null, error: null }
      }
      return { data: matched.map(m => ({ ...m })), error: null }
    }

    if (wantSingle === 'single') {
      if (matched.length === 0) return { data: null, error: { message: 'Not found' } }
      return { data: { ...matched[0] }, error: null }
    }
    if (wantSingle === 'maybeSingle') {
      return { data: matched[0] ? { ...matched[0] } : null, error: null }
    }
    const sliced = rangeSlice ? matched.slice(rangeSlice[0], rangeSlice[1] + 1) : matched
    return { data: sliced.map(m => ({ ...m })), error: null }
  }

  const builder: any = {
    select() {
      return builder
    },
    insert(payload: Record<string, any> | Array<Record<string, any>>) {
      mode = 'insert'
      insertRows = Array.isArray(payload) ? payload : [payload]
      return builder
    },
    update(patch: Record<string, any>) {
      mode = 'update'
      updatePatch = patch
      return builder
    },
    eq(col: string, val: any) {
      filters.push(r => r[col] === val)
      return builder
    },
    in(col: string, vals: any[]) {
      filters.push(r => vals.includes(r[col]))
      return builder
    },
    ilike(col: string, pattern: string) {
      filters.push(r => typeof r[col] === 'string' && sqlIlikeMatch(r[col], pattern))
      return builder
    },
    range(from: number, to: number) {
      rangeSlice = [from, to]
      return builder
    },
    single() {
      wantSingle = 'single'
      return Promise.resolve(execute())
    },
    maybeSingle() {
      wantSingle = 'maybeSingle'
      return Promise.resolve(execute())
    },
    then(onFulfilled: any, onRejected: any) {
      return Promise.resolve(execute()).then(onFulfilled, onRejected)
    },
  }

  return builder
}

const ilikePatternsSeen: string[] = []

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: (table: TableName) => {
      const qb = makeQueryBuilder(table)
      const origIlike = qb.ilike
      qb.ilike = (col: string, pattern: string) => {
        ilikePatternsSeen.push(pattern)
        return origIlike(col, pattern)
      }
      return qb
    },
  },
}))

jest.mock('@/lib/api-key-auth', () => ({
  verifyAdminOrKey: jest.fn().mockResolvedValue({ success: true, auth: { type: 'admin' } }),
  logApiAudit: jest.fn().mockResolvedValue(true),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

const mockResendSingleSend = jest.fn()
const mockResendBatchSend = jest.fn()

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: any[]) => mockResendSingleSend(...args) },
    batch: { send: (...args: any[]) => mockResendBatchSend(...args) },
  })),
}))

const mockSendBatchEmails = jest.fn()
const mockSendEmail = jest.fn()

jest.mock('@/lib/email-provider', () => {
  const actual = jest.requireActual('@/lib/email-provider')
  return {
    ...actual,
    sendBatchEmails: (...args: any[]) => mockSendBatchEmails(...args),
    sendEmail: (...args: any[]) => mockSendEmail(...args),
  }
})

import { POST as sendCampaignPost } from '@/app/api/admin/newsletter/campaigns/[id]/send/route'
import { POST as retryCampaignPost } from '@/app/api/admin/newsletter/campaigns/[id]/retry/route'
import { GET as unsubscribeGet, POST as unsubscribePost } from '@/app/api/unsubscribe/route'
import { POST as brevoWebhookPost } from '@/app/api/webhooks/brevo/route'
import { extractBriefingMetadata } from '@/lib/newsletter-pdfs'
import { revalidateNewsletterMutation } from '@/lib/content-revalidation'

const actualEmailProvider = jest.requireActual('@/lib/email-provider') as typeof import('@/lib/email-provider')

describe('Newsletter Code Fixes F1–F9 Verification Suite', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    ilikePatternsSeen.length = 0
    db.newsletter_campaigns = []
    db.subscribers = []
    db.newsletter_recipients = []
    db.newsletter_webhook_events = []
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('F1 — Atomic campaign lock, is_test refusal, recipient logging & retry deduplication', () => {
    it('refuses campaigns with is_test=true with HTTP 403 and sends zero emails', async () => {
      db.newsletter_campaigns.push({
        id: 'camp-test-only',
        subject: 'TEST Draft',
        rendered_html: '<p>Hello</p>',
        content: '<p>Hello</p>',
        is_test: true,
        status: 'draft',
        sent_count: 0,
        failed_count: 0,
      })
      db.subscribers.push({ id: 'sub-1', email: 'alice@example.com', is_active: true })

      const req = new NextRequest('http://localhost/api/admin/newsletter/campaigns/camp-test-only/send', {
        method: 'POST',
      })
      const res = await sendCampaignPost(req, { params: Promise.resolve({ id: 'camp-test-only' }) })
      const body = await res.json()

      expect(res.status).toBe(403)
      expect(body.error.code).toBe('FORBIDDEN_TEST_CAMPAIGN')
      expect(mockSendBatchEmails).not.toHaveBeenCalled()
    })

    it('enforces atomic locking across two concurrent /send requests (one 200, one 409) and skips sent recipients on retry', async () => {
      db.newsletter_campaigns.push({
        id: 'camp-race',
        subject: 'Weekly Briefing',
        rendered_html: '<p>Briefing body</p>',
        content: '<p>Briefing body</p>',
        is_test: false,
        status: 'draft',
        sent_count: 0,
        failed_count: 0,
      })
      db.subscribers.push(
        { id: 's1', email: 'alice@example.com', is_active: true },
        { id: 's2', email: 'bob@example.com', is_active: true }
      )

      mockSendBatchEmails.mockResolvedValue({
        success: true,
        sent: 1,
        failed: 1,
        provider: 'brevo-smtp',
        results: [
          { email: 'alice@example.com', success: true, messageId: '<msg-alice>' },
          { email: 'bob@example.com', success: false, error: '421 Transient failure' },
        ],
      })

      const makeReq = () =>
        new NextRequest('http://localhost/api/admin/newsletter/campaigns/camp-race/send', {
          method: 'POST',
        })

      const [res1, res2] = await Promise.all([
        sendCampaignPost(makeReq(), { params: Promise.resolve({ id: 'camp-race' }) }),
        sendCampaignPost(makeReq(), { params: Promise.resolve({ id: 'camp-race' }) }),
      ])

      const statuses = [res1.status, res2.status].sort((a, b) => a - b)
      expect(statuses).toEqual([200, 409])
      expect(mockSendBatchEmails).toHaveBeenCalledTimes(1)

      expect(db.newsletter_campaigns[0].status).toBe('partially_sent')
      expect(db.newsletter_campaigns[0].sent_count).toBe(1)
      expect(db.newsletter_campaigns[0].failed_count).toBe(1)

      const aliceRow = db.newsletter_recipients.find(r => r.email === 'alice@example.com')
      const bobRow = db.newsletter_recipients.find(r => r.email === 'bob@example.com')
      expect(aliceRow?.status).toBe('sent')
      expect(bobRow?.status).toBe('failed')

      // Retry should send ONLY to bob@example.com and never to alice@example.com
      mockSendEmail.mockResolvedValue({ success: true, provider: 'brevo-smtp', messageId: '<retry-bob>' })
      const retryReq = new NextRequest('http://localhost/api/admin/newsletter/campaigns/camp-race/retry', {
        method: 'POST',
      })
      const retryRes = await retryCampaignPost(retryReq, { params: Promise.resolve({ id: 'camp-race' }) })
      const retryBody = await retryRes.json()

      expect(retryRes.status).toBe(200)
      expect(retryBody.retriedCount).toBe(1)
      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail.mock.calls[0][0].to).toBe('bob@example.com')
      expect(db.newsletter_campaigns[0].status).toBe('sent')
      expect(db.newsletter_campaigns[0].sent_count).toBe(2)
      expect(db.newsletter_campaigns[0].failed_count).toBe(0)
    })
  })

  describe('F2 — /api/unsubscribe case-insensitivity, LIKE wildcard escaping & RFC 8058 POST', () => {
    it('supports RFC 8058 POST and GET with mixed-case email and escapes SQL LIKE wildcards', async () => {
      const storedMixed = 'F2.Audit_Test+1@Example.com'
      const wildcardLookalike = 'F2.AuditXTest+1@Example.com'
      db.subscribers.push(
        { id: 'sub-mixed', email: storedMixed, is_active: true, unsubscribed_at: null },
        { id: 'sub-lookalike', email: wildcardLookalike, is_active: true, unsubscribed_at: null }
      )

      const lowerQuery = storedMixed.toLowerCase()
      const token = generateUnsubscribeToken(lowerQuery)

      const postReq = new NextRequest(
        `http://localhost/api/unsubscribe?email=${encodeURIComponent(lowerQuery)}&token=${token}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: 'List-Unsubscribe=One-Click',
        }
      )
      const postRes = await unsubscribePost(postReq)
      expect(postRes.status).toBe(200)
      expect(ilikePatternsSeen[0]).toBe('f2.audit\\_test+1@example.com')
      expect(db.subscribers.find(s => s.id === 'sub-mixed')?.is_active).toBe(false)
      expect(db.subscribers.find(s => s.id === 'sub-lookalike')?.is_active).toBe(true)

      // Reactivate and verify GET also works case-insensitively
      db.subscribers[0].is_active = true
      const getReq = new NextRequest(
        `http://localhost/api/unsubscribe?email=${encodeURIComponent(storedMixed)}&token=${token}`
      )
      const getRes = await unsubscribeGet(getReq)
      expect(getRes.status).toBe(200)
      expect(await getRes.text()).toContain('You have been unsubscribed')
      expect(db.subscribers.find(s => s.id === 'sub-mixed')?.is_active).toBe(false)
    })

    it('rejects invalid unsubscribe token with 400', async () => {
      const req = new NextRequest(
        'http://localhost/api/unsubscribe?email=user@example.com&token=invalid-token',
        { method: 'POST', body: 'List-Unsubscribe=One-Click' }
      )
      const res = await unsubscribePost(req)
      expect(res.status).toBe(400)
    })
  })

  describe('F3 & F4 — Reply-To header & multipart/alternative plain-text fallback across providers', () => {
    it('generates real RFC 2822 MIME with Reply-To and text/plain + text/html parts via Nodemailer streamTransport', async () => {
      delete process.env.NEWSLETTER_REPLY_TO
      delete process.env.ADMIN_EMAIL
      expect(actualEmailProvider.getDefaultReplyTo()).toBe('mail@corplawupdates.in')

      const html = '<div><h1>Lead Story</h1><p>Read the <a href="https://www.corplawupdates.in/updates/gst">full GST circular</a> now.</p></div>'
      const plain = actualEmailProvider.htmlToPlainText(html)
      expect(plain).toContain('Lead Story')
      expect(plain).toContain('full GST circular (https://www.corplawupdates.in/updates/gst)')

      const mailOpts = actualEmailProvider.buildSmtpMailOptions({
        senderName: 'CorpLawUpdates',
        senderEmail: 'newsletter@corplawupdates.in',
        to: 'reader@example.com',
        subject: 'Weekly Briefing Test',
        html,
      })

      expect(mailOpts.replyTo).toBe('mail@corplawupdates.in')
      expect(mailOpts.text).toContain('full GST circular (https://www.corplawupdates.in/updates/gst)')

      const tx = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true })
      const info = await tx.sendMail(mailOpts)
      const rawMime = info.message.toString('utf8')

      expect(rawMime).toContain('Reply-To: mail@corplawupdates.in')
      expect(rawMime).toContain('Content-Type: multipart/alternative;')
      expect(rawMime).toContain('Content-Type: text/plain;')
      expect(rawMime).toContain('Content-Type: text/html;')
      expect(rawMime).toContain('full GST circular (https://www.corplawupdates.in/updates/gst)')
    })

    it('includes replyTo and textContent/text in Brevo REST API and Resend API single & batch payloads', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-test'
      delete process.env.BREVO_SMTP_KEY
      delete process.env.RESEND_API_KEY

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ messageIds: ['<b1>', '<b2>'], messageId: '<s1>' }),
      })
      global.fetch = fetchMock as any

      await actualEmailProvider.sendEmail({
        to: 'one@example.com',
        subject: 'Single',
        html: '<p>See <a href="https://corplawupdates.in">Site</a></p>',
      })
      const brevoSinglePayload = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(brevoSinglePayload.replyTo).toEqual({ email: 'mail@corplawupdates.in' })
      expect(brevoSinglePayload.textContent).toContain('See Site (https://corplawupdates.in)')

      await actualEmailProvider.sendBatchEmails({
        emails: [
          { to: 'a@example.com', subject: 'Batch 1', html: '<p>A</p>' },
          { to: 'b@example.com', subject: 'Batch 2', html: '<p>B</p>' },
        ],
      })
      const brevoBatchPayload = JSON.parse(fetchMock.mock.calls[1][1].body)
      expect(brevoBatchPayload.replyTo).toEqual({ email: 'mail@corplawupdates.in' })
      expect(brevoBatchPayload.textContent).toBe('A')
      expect(brevoBatchPayload.messageVersions[0].textContent).toBe('A')
      expect(brevoBatchPayload.messageVersions[1].textContent).toBe('B')

      // Resend SDK single & batch fallback verification
      delete process.env.BREVO_API_KEY
      process.env.RESEND_API_KEY = 're_test_123'
      mockResendSingleSend.mockResolvedValue({ data: { id: 're_single_1' }, error: null })
      mockResendBatchSend.mockResolvedValue({ data: { data: [{ id: 're_b1' }, { id: 're_b2' }] }, error: null })

      await actualEmailProvider.sendEmail({
        to: 'one@example.com',
        subject: 'Resend Single',
        html: '<p>Hello <a href="https://www.corplawupdates.in">Updates</a></p>',
      })
      const resendSinglePayload = mockResendSingleSend.mock.calls[0][0]
      expect(resendSinglePayload.replyTo).toBe('mail@corplawupdates.in')
      expect(resendSinglePayload.text).toContain('Hello Updates (https://www.corplawupdates.in)')

      await actualEmailProvider.sendBatchEmails({
        emails: [
          { to: 'a@example.com', subject: 'R1', html: '<p>R1</p>' },
          { to: 'b@example.com', subject: 'R2', html: '<p>R2</p>' },
        ],
      })
      const resendBatchPayload = mockResendBatchSend.mock.calls[0][0]
      expect(resendBatchPayload).toHaveLength(2)
      expect(resendBatchPayload[0].replyTo).toBe('mail@corplawupdates.in')
      expect(resendBatchPayload[0].text).toBe('R1')
      expect(resendBatchPayload[1].replyTo).toBe('mail@corplawupdates.in')
      expect(resendBatchPayload[1].text).toBe('R2')
    })
  })

  describe('F6 & F7 — Briefing metadata extraction, OG category & scoped revalidation', () => {
    it('extracts Taxation lead category, covered regulators, OG image and Monday 05:00 IST date', () => {
      const sampleHtml = `
        <div>
          <span>Taxation · Lead Story</span>
          <h2 class="headline">GST from 1 November 2026: three changes</h2>
          <p class="deck">Identity checks move ahead of ARN generation.</p>
          <span>29 Updates</span>
          <span style="text-transform:uppercase">SEBI · MCA · RBI · FEMA</span>
        </div>
      `
      const meta = extractBriefingMetadata(sampleHtml, {
        slug: 'weekly-briefing-2026-11-09',
        week_label: '2 – 8 November 2026',
        week_end: '2026-11-08',
      })

      expect(meta.leadCategory).toBe('taxation')
      expect(meta.leadCategoryLabel).toBe('Taxation')
      expect(meta.regulators).toEqual(expect.arrayContaining(['Taxation', 'SEBI', 'MCA', 'RBI', 'FEMA']))
      expect(meta.publishedIso).toBe('2026-11-09T05:00:00+05:30')
      expect(meta.ogImageUrl).toContain('category=TAXATION')
      expect(meta.description).toContain('Taxation')
    })

    it('revalidates archive, edition slugs and sitemap via revalidateNewsletterMutation', () => {
      revalidateNewsletterMutation({
        slug: 'weekly-briefing-2026-11-16',
        oldSlug: 'weekly-briefing-2026-11-09',
      })

      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/newsletters')
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/newsletters/weekly-briefing-2026-11-16')
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/newsletters/weekly-briefing-2026-11-09')
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/sitemap.xml')
    })
  })

  describe('F9 — /api/webhooks/brevo authentication, deactivation & bounce logging', () => {
    it('fails closed (503) when BREVO_WEBHOOK_SECRET is unset and returns 401 on wrong token', async () => {
      delete process.env.BREVO_WEBHOOK_SECRET
      const req503 = new NextRequest('http://localhost/api/webhooks/brevo', {
        method: 'POST',
        headers: { Authorization: 'Bearer secret', 'content-type': 'application/json' },
        body: JSON.stringify({ event: 'hardBounce', email: 'a@example.com' }),
      })
      expect((await brevoWebhookPost(req503)).status).toBe(503)

      process.env.BREVO_WEBHOOK_SECRET = 'expected-secret'
      const req401 = new NextRequest('http://localhost/api/webhooks/brevo', {
        method: 'POST',
        headers: { Authorization: 'Bearer wrong', 'content-type': 'application/json' },
        body: JSON.stringify({ event: 'hardBounce', email: 'a@example.com' }),
      })
      expect((await brevoWebhookPost(req401)).status).toBe(401)
    })

    it('keeps subscriber active on softBounce, deactivates on hardBounce and spam, and records webhook events', async () => {
      process.env.BREVO_WEBHOOK_SECRET = 'expected-secret'
      db.subscribers.push(
        { id: 's-soft', email: 'soft@example.com', is_active: true },
        { id: 's-hard', email: 'Hard.Bounce@Example.com', is_active: true },
        { id: 's-spam', email: 'spammer@example.com', is_active: true }
      )
      db.newsletter_recipients.push({
        id: 'rec-hard',
        email: 'Hard.Bounce@Example.com',
        resend_email_id: '<msg-hard-1>',
        status: 'sent',
      })

      const softReq = new NextRequest('http://localhost/api/webhooks/brevo', {
        method: 'POST',
        headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
        body: JSON.stringify({ event: 'softBounce', email: 'soft@example.com', reason: 'Mailbox full' }),
      })
      const softRes = await brevoWebhookPost(softReq)
      expect(softRes.status).toBe(200)
      expect(db.subscribers.find(s => s.id === 's-soft')?.is_active).toBe(true)

      const batchReq = new NextRequest('http://localhost/api/webhooks/brevo', {
        method: 'POST',
        headers: { 'x-brevo-secret': 'expected-secret', 'content-type': 'application/json' },
        body: JSON.stringify([
          { event: 'hardBounce', email: 'hard.bounce@example.com', 'message-id': '<msg-hard-1>', reason: '550 No such user' },
          { event: 'spam', email: 'spammer@example.com', reason: 'Spam report' },
        ]),
      })
      const batchRes = await brevoWebhookPost(batchReq)
      const batchJson = await batchRes.json()

      expect(batchRes.status).toBe(200)
      expect(batchJson.processedCount).toBe(2)
      expect(db.subscribers.find(s => s.id === 's-hard')?.is_active).toBe(false)
      expect(db.subscribers.find(s => s.id === 's-spam')?.is_active).toBe(false)
      expect(db.newsletter_recipients[0].status).toBe('bounced')
      expect(db.newsletter_webhook_events).toHaveLength(3)
    })
  })
})
