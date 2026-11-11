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
  let orderBy: { col: string; ascending: boolean } | null = null
  let limitCount: number | null = null
  let wantHead = false
  let wantSingle: 'single' | 'maybeSingle' | null = null

  function execute(): { data: any; count?: number; error: null | { message: string } } {
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

    let matched = rows.filter(r => filters.every(fn => fn(r)))

    if (orderBy) {
      const { col, ascending } = orderBy
      matched = [...matched].sort((a, b) => {
        const av = a[col] ?? null
        const bv = b[col] ?? null
        if (av === bv) return 0
        if (av === null) return 1
        if (bv === null) return -1
        return ascending
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    }

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

    const totalCount = matched.length

    if (wantSingle === 'single') {
      if (matched.length === 0) return { data: null, count: 0, error: { message: 'Not found' } }
      return { data: { ...matched[0] }, count: 1, error: null }
    }
    if (wantSingle === 'maybeSingle') {
      return { data: matched[0] ? { ...matched[0] } : null, count: matched.length, error: null }
    }
    if (wantHead) {
      return { data: null, count: totalCount, error: null }
    }
    let sliced = rangeSlice ? matched.slice(rangeSlice[0], rangeSlice[1] + 1) : matched
    if (limitCount !== null) {
      sliced = sliced.slice(0, limitCount)
    }
    return { data: sliced.map(m => ({ ...m })), count: totalCount, error: null }
  }

  const builder: any = {
    select(_cols?: string, opts?: { count?: string; head?: boolean }) {
      wantHead = Boolean(opts?.head)
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
    is(col: string, val: any) {
      filters.push(r => (r[col] ?? null) === val)
      return builder
    },
    ilike(col: string, pattern: string) {
      filters.push(r => typeof r[col] === 'string' && sqlIlikeMatch(r[col], pattern))
      return builder
    },
    order(col: string, opts?: { ascending?: boolean }) {
      orderBy = { col, ascending: opts?.ascending ?? true }
      return builder
    },
    limit(n: number) {
      limitCount = n
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
import { GET as campaignDetailGet } from '@/app/api/admin/newsletter/campaigns/[id]/route'
import { GET as historyDetailGet } from '@/app/api/admin/newsletter/history/[id]/route'
import { POST as retryCampaignPost } from '@/app/api/admin/newsletter/campaigns/[id]/retry/route'
import { GET as unsubscribeGet, POST as unsubscribePost } from '@/app/api/unsubscribe/route'
import { POST as brevoWebhookPost } from '@/app/api/webhooks/brevo/route'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
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

  describe('F11 — Brevo open/click/delivered tracking, monotonic state & admin stats API', () => {
    it('advances sent -> delivered -> opened -> clicked monotonically and never downgrades on late events', async () => {
      process.env.BREVO_WEBHOOK_SECRET = 'expected-secret'
      db.newsletter_recipients.push({
        id: 'rec-track-1',
        campaign_id: 'camp-track-1',
        email: 'Komal.Reader@Example.com',
        resend_email_id: '<202611111200.111@smtp-relay.mailin.fr>',
        status: 'sent',
        sent_at: '2026-11-11T06:00:00.000Z',
        delivered_at: null,
        opened_at: null,
        clicked_at: null,
        clicked_url: null,
      })

      // 1. Delivered event (case-insensitive email & message-id without angle brackets)
      const resDelivered = await brevoWebhookPost(
        new NextRequest('http://localhost/api/webhooks/brevo', {
          method: 'POST',
          headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
          body: JSON.stringify({
            event: 'delivered',
            email: 'komal.reader@example.com',
            'message-id': '202611111200.111@smtp-relay.mailin.fr',
            ts_event: 1794380460,
          }),
        })
      )
      expect(resDelivered.status).toBe(200)
      expect(db.newsletter_recipients[0].status).toBe('delivered')
      expect(db.newsletter_recipients[0].delivered_at).toBeTruthy()

      // 2. First opened event
      const resOpened1 = await brevoWebhookPost(
        new NextRequest('http://localhost/api/webhooks/brevo', {
          method: 'POST',
          headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
          body: JSON.stringify({
            event: 'opened',
            email: 'komal.reader@example.com',
            'message-id': '<202611111200.111@smtp-relay.mailin.fr>',
            date: '2026-11-11T07:05:00.000Z',
          }),
        })
      )
      expect(resOpened1.status).toBe(200)
      expect(db.newsletter_recipients[0].status).toBe('opened')
      expect(db.newsletter_recipients[0].opened_at).toBe('2026-11-11T07:05:00.000Z')

      // 3. Late delivered must NOT downgrade opened
      const resLateDelivered = await brevoWebhookPost(
        new NextRequest('http://localhost/api/webhooks/brevo', {
          method: 'POST',
          headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
          body: JSON.stringify({
            event: 'delivered',
            email: 'komal.reader@example.com',
            'message-id': '<202611111200.111@smtp-relay.mailin.fr>',
            date: '2026-11-11T07:06:00.000Z',
          }),
        })
      )
      expect(resLateDelivered.status).toBe(200)
      expect(db.newsletter_recipients[0].status).toBe('opened')

      // 4. Click event records clicked_url & clicked_at
      const resClick = await brevoWebhookPost(
        new NextRequest('http://localhost/api/webhooks/brevo', {
          method: 'POST',
          headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
          body: JSON.stringify({
            event: 'click',
            email: 'KOMAL.READER@example.com',
            'message-id': '<202611111200.111@smtp-relay.mailin.fr>',
            link: 'https://www.corplawupdates.in/updates/sebi-lodr-amendment',
            date: '2026-11-11T07:10:00.000Z',
          }),
        })
      )
      expect(resClick.status).toBe(200)
      expect(db.newsletter_recipients[0].status).toBe('clicked')
      expect(db.newsletter_recipients[0].clicked_at).toBe('2026-11-11T07:10:00.000Z')
      expect(db.newsletter_recipients[0].clicked_url).toBe('https://www.corplawupdates.in/updates/sebi-lodr-amendment')

      // 5. Late opened must NOT downgrade clicked or overwrite first opened_at
      await brevoWebhookPost(
        new NextRequest('http://localhost/api/webhooks/brevo', {
          method: 'POST',
          headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
          body: JSON.stringify({
            event: 'opened',
            email: 'komal.reader@example.com',
            'message-id': '<202611111200.111@smtp-relay.mailin.fr>',
            date: '2026-11-11T08:00:00.000Z',
          }),
        })
      )
      expect(db.newsletter_recipients[0].status).toBe('clicked')
      expect(db.newsletter_recipients[0].opened_at).toBe('2026-11-11T07:05:00.000Z')
      expect(db.newsletter_webhook_events).toHaveLength(5)
    })

    it('falls back to most recent sent row when message-id is absent, and logs unmatched events with HTTP 200', async () => {
      process.env.BREVO_WEBHOOK_SECRET = 'expected-secret'
      db.newsletter_recipients.push(
        {
          id: 'rec-old',
          campaign_id: 'camp-old',
          email: 'reader@example.com',
          resend_email_id: null,
          status: 'sent',
          sent_at: '2026-10-12T06:00:00.000Z',
          delivered_at: null,
          opened_at: null,
          clicked_at: null,
          clicked_url: null,
        },
        {
          id: 'rec-new',
          campaign_id: 'camp-new',
          email: 'reader@example.com',
          resend_email_id: null,
          status: 'sent',
          sent_at: '2026-11-11T06:00:00.000Z',
          delivered_at: null,
          opened_at: null,
          clicked_at: null,
          clicked_url: null,
        }
      )

      const matchedFallback = await brevoWebhookPost(
        new NextRequest('http://localhost/api/webhooks/brevo', {
          method: 'POST',
          headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
          body: JSON.stringify({
            event: 'opened',
            email: 'READER@example.com',
            'message-id': '<unmatched-relay-id@smtp-relay.mailin.fr>',
          }),
        })
      )
      expect(matchedFallback.status).toBe(200)
      expect(db.newsletter_recipients.find(r => r.id === 'rec-new')?.status).toBe('opened')
      expect(db.newsletter_recipients.find(r => r.id === 'rec-old')?.status).toBe('sent')

      const unmatchedRes = await brevoWebhookPost(
        new NextRequest('http://localhost/api/webhooks/brevo', {
          method: 'POST',
          headers: { Authorization: 'Bearer expected-secret', 'content-type': 'application/json' },
          body: JSON.stringify({
            event: 'click',
            email: 'pre-f1-user@example.com',
            link: 'https://www.corplawupdates.in/updates/old',
          }),
        })
      )
      const unmatchedJson = await unmatchedRes.json()
      expect(unmatchedRes.status).toBe(200)
      expect(unmatchedJson.events[0].action_taken).toBe('logged_unmatched_recipient')
      expect(db.newsletter_webhook_events).toHaveLength(2)
    })

    it('exposes cumulative campaign stats via API key on campaigns/[id] and history/[id] and flags pre-F1 sends cleanly', async () => {
      const mockVerify = verifyAdminOrKey as jest.Mock
      mockVerify.mockResolvedValue({
        success: true,
        auth: { type: 'api_key', key: { id: 'key-muse', name: 'muse ai', scopes: ['newsletter:read'] } },
      })

      db.newsletter_campaigns.push(
        {
          id: 'camp-stats-live',
          subject: 'Tracked Test Campaign',
          content: '<p>Test</p>',
          sent_count: 4,
          failed_count: 0,
          total_recipients: 4,
          status: 'sent',
        },
        {
          id: '8588e2cf-22cc-4e83-8726-275c6a547feb',
          subject: 'Pre-F1 Campaign',
          content: '<p>Legacy</p>',
          sent_count: 152,
          failed_count: 0,
          total_recipients: 152,
          status: 'sent',
        }
      )

      db.newsletter_recipients.push(
        { id: 'r1', campaign_id: 'camp-stats-live', email: 'a@x.com', status: 'clicked', sent_at: '2026-11-11T06:00:00Z', delivered_at: '2026-11-11T06:00:10Z', opened_at: '2026-11-11T06:01:00Z', clicked_at: '2026-11-11T06:02:00Z', clicked_url: 'https://www.corplawupdates.in/u1' },
        { id: 'r2', campaign_id: 'camp-stats-live', email: 'b@x.com', status: 'opened', sent_at: '2026-11-11T06:00:00Z', delivered_at: '2026-11-11T06:00:10Z', opened_at: '2026-11-11T06:03:00Z' },
        { id: 'r3', campaign_id: 'camp-stats-live', email: 'c@x.com', status: 'delivered', sent_at: '2026-11-11T06:00:00Z', delivered_at: '2026-11-11T06:00:10Z' },
        { id: 'r4', campaign_id: 'camp-stats-live', email: 'd@x.com', status: 'bounced', sent_at: '2026-11-11T06:00:00Z' }
      )

      const campRes = await campaignDetailGet(
        new NextRequest('http://localhost/api/admin/newsletter/campaigns/camp-stats-live', {
          headers: { Authorization: 'Bearer clu_test' },
        }),
        { params: Promise.resolve({ id: 'camp-stats-live' }) }
      )
      const campJson = await campRes.json()
      expect(campRes.status).toBe(200)
      expect(mockVerify).toHaveBeenCalledWith(expect.any(NextRequest), 'newsletter:read')
      expect(campJson.stats).toEqual({
        sent: 4,
        delivered: 3,
        opened: 2,
        clicked: 1,
        bounced: 1,
        failed: 0,
        pending: 0,
        open_rate: 66.7,
        click_rate: 33.3,
        recipient_rows_count: 4,
        tracked_in_brevo_only: false,
        tracking_source: 'recipients',
        tracking_note: null,
      })

      const histRes = await historyDetailGet(
        new NextRequest('http://localhost/api/admin/newsletter/history/camp-stats-live', {
          headers: { Authorization: 'Bearer clu_test' },
        }),
        { params: Promise.resolve({ id: 'camp-stats-live' }) }
      )
      const histJson = await histRes.json()
      expect(histRes.status).toBe(200)
      expect(histJson.stats).toEqual(campJson.stats)

      const preF1Res = await campaignDetailGet(
        new NextRequest('http://localhost/api/admin/newsletter/campaigns/8588e2cf-22cc-4e83-8726-275c6a547feb', {
          headers: { Authorization: 'Bearer clu_test' },
        }),
        { params: Promise.resolve({ id: '8588e2cf-22cc-4e83-8726-275c6a547feb' }) }
      )
      const preF1Json = await preF1Res.json()
      expect(preF1Res.status).toBe(200)
      expect(preF1Json.stats).toEqual({
        sent: 152,
        delivered: null,
        opened: null,
        clicked: null,
        bounced: null,
        failed: 0,
        pending: null,
        open_rate: null,
        click_rate: null,
        recipient_rows_count: 0,
        tracked_in_brevo_only: true,
        tracking_source: 'brevo_only',
        tracking_note: 'tracked in Brevo only',
      })

      // Also verify failed API key auth returns 401 on history/[id]
      const { NextResponse } = await import('next/server')
      mockVerify.mockResolvedValueOnce({
        success: false,
        response: NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 }),
      })
      const unauthHistRes = await historyDetailGet(
        new NextRequest('http://localhost/api/admin/newsletter/history/camp-stats-live'),
        { params: Promise.resolve({ id: 'camp-stats-live' }) }
      )
      expect(unauthHistRes.status).toBe(401)
    })
  })
})
