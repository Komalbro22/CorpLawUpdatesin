/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs'
import path from 'node:path'

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })),
    })),
  },
}))

jest.mock('@/lib/supabase-documents-server', () => ({
  supabaseDocumentsAdmin: null,
}))

jest.mock('@/lib/rule-engine', () => ({
  executeRule: jest.fn(),
  extractVariablesFromPrompt: jest.fn(),
}))

import {
  DOCUMENTS_AI_MODEL,
  DOCUMENTS_AI_FALLBACK_MODELS,
  getGeminiApiKeys,
  requestGeminiGenerateContent,
  extractVariables,
  __resetGeminiHealthCacheForTests,
} from '@/lib/gemini'
import { POST as editPost } from '@/app/api/documents/edit/route'

describe('Documents AI Gemini configuration & key rotation', () => {
  const originalEnv = process.env
  const originalFetch = global.fetch

  beforeEach(() => {
    __resetGeminiHealthCacheForTests()
    process.env = {
      ...originalEnv,
      GOOGLE_GEMINI_API_KEY: '',
      GOOGLE_GEMINI_API_KEY_2: '',
      GOOGLE_GEMINI_API_KEY_3: '',
      GOOGLE_GEMINI_API_KEY_4: '',
      GOOGLE_GEMINI_API_KEY_5: '',
      GEMINI_API_KEY: '',
    }
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('uses an active Flash 3 model and ordered fallback chain without retired gemini-2.5-flash', () => {
    expect(DOCUMENTS_AI_MODEL).toBe('gemini-3-flash-preview')
    expect(DOCUMENTS_AI_FALLBACK_MODELS[0]).toBe(DOCUMENTS_AI_MODEL)
    expect(DOCUMENTS_AI_FALLBACK_MODELS).toEqual([
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
    ])
    expect(DOCUMENTS_AI_FALLBACK_MODELS.join(',')).not.toContain('gemini-2.5-flash')
  })

  it('orders configured GOOGLE_GEMINI_API_KEY* slots before legacy GEMINI_API_KEY and deduplicates', () => {
    process.env.GEMINI_API_KEY = 'legacy-key'
    process.env.GOOGLE_GEMINI_API_KEY_2 = 'key-2'
    process.env.GOOGLE_GEMINI_API_KEY_3 = 'key-3'
    process.env.GOOGLE_GEMINI_API_KEY_4 = 'key-2'

    expect(getGeminiApiKeys()).toEqual(['key-2', 'key-3', 'legacy-key'])
  })

  it('rotates past 403 leaked/billing and 429 quota keys to deliver 200 OK via the healthy key', async () => {
    process.env.GOOGLE_GEMINI_API_KEY = 'leaked-key'
    process.env.GOOGLE_GEMINI_API_KEY_2 = 'quota-key'
    process.env.GOOGLE_GEMINI_API_KEY_3 = 'billing-key'
    process.env.GOOGLE_GEMINI_API_KEY_4 = 'healthy-key'

    const calls: Array<{ url: string; key: string | null }> = []
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>
      const apiKey = headers?.['x-goog-api-key'] || null
      calls.push({ url: String(input), key: apiKey })

      if (apiKey === 'leaked-key') {
        return new Response(JSON.stringify({ error: { message: 'API key reported as leaked' } }), { status: 403 })
      }
      if (apiKey === 'quota-key') {
        return new Response(JSON.stringify({ error: { message: 'Quota exceeded' } }), { status: 429 })
      }
      if (apiKey === 'billing-key') {
        return new Response(JSON.stringify({ error: { message: 'Free tier not available' } }), { status: 403 })
      }
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Updated mortgage deed clause.' }] } }],
        }),
        { status: 200 }
      )
    }) as jest.Mock

    const result = await requestGeminiGenerateContent({
      contents: [{ parts: [{ text: 'Update repayment clause' }] }],
    })

    expect(result.text).toBe('Updated mortgage deed clause.')
    expect(result.model).toBe('gemini-3-flash-preview')
    expect(calls.map(c => c.key)).toEqual(['leaked-key', 'quota-key', 'billing-key', 'healthy-key'])
    expect(calls[3].url).toContain('/models/gemini-3-flash-preview:generateContent')
  })

  it('cools down permanently failing 403 keys so the next request skips straight to healthy keys', async () => {
    process.env.GOOGLE_GEMINI_API_KEY = 'bad-403-key'
    process.env.GOOGLE_GEMINI_API_KEY_2 = 'good-key'

    const attemptedKeys: string[] = []
    global.fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const apiKey = (init?.headers as Record<string, string>)['x-goog-api-key']
      attemptedKeys.push(apiKey)
      if (apiKey === 'bad-403-key') {
        return new Response('leaked', { status: 403 })
      }
      return new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }),
        { status: 200 }
      )
    }) as jest.Mock

    await requestGeminiGenerateContent({ contents: [{ parts: [{ text: 'req1' }] }] })
    await requestGeminiGenerateContent({ contents: [{ parts: [{ text: 'req2' }] }] })

    expect(attemptedKeys).toEqual(['bad-403-key', 'good-key', 'good-key'])
  })

  it('falls back to gemini-3.1-flash-lite if all keys return 404/429 on primary model', async () => {
    process.env.GOOGLE_GEMINI_API_KEY_2 = 'key-a'
    process.env.GOOGLE_GEMINI_API_KEY_4 = 'key-b'

    const triedModels: string[] = []
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const match = url.match(/models\/([^:]+):generateContent/)
      const model = match?.[1] || ''
      triedModels.push(model)

      if (model === 'gemini-3-flash-preview') {
        return new Response('model not found', { status: 404 })
      }
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: '{"extracted":{"COMPANY_NAME":"Acme"},"confidence":0.9}' }] } }],
        }),
        { status: 200 }
      )
    }) as jest.Mock

    const extracted = await extractVariables([{ id: 'COMPANY_NAME', label: 'Company' }], 'Acme')
    expect(extracted).toEqual({ extracted: { COMPANY_NAME: 'Acme' }, confidence: 0.9 })
    expect(triedModels).toEqual([
      'gemini-3-flash-preview',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite',
    ])
  })

  it('POST /api/documents/edit returns 200 across 5 consecutive calls when rotating and distinguishing 503 vs 429 failures', async () => {
    process.env.GOOGLE_GEMINI_API_KEY_2 = 'rot-key-1'
    process.env.GOOGLE_GEMINI_API_KEY_4 = 'rot-key-2'

    let n = 0
    global.fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const bodyStr = String(init?.body || '')
      if (bodyStr.includes('legal template engineer')) {
        return new Response(
          JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"skip":true}' }] } }] }),
          { status: 200 }
        )
      }
      n += 1
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: `Refined Clause Version ${n}` }] } }],
        }),
        { status: 200 }
      )
    }) as jest.Mock

    for (let i = 1; i <= 5; i++) {
      const req = new Request('http://localhost:3000/api/documents/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_content: '1. Interest Rate: 10% p.a.',
          edit_instruction: `Change interest rate to ${10 + i}% p.a.`,
          document_type: 'English Mortgage Deed',
          force_ai: true,
        }),
      })
      const res = await editPost(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.content).toBe(`Refined Clause Version ${i}`)
    }
    await new Promise(resolve => setTimeout(resolve, 10))

    // Non-quota exhaustion (404/403) should return 503, not misleading 429
    __resetGeminiHealthCacheForTests()
    global.fetch = jest.fn(async () => new Response('Model missing', { status: 404 })) as jest.Mock
    const nonQuotaReq = new Request('http://localhost:3000/api/documents/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_content: '1. Clause',
        edit_instruction: 'Add jurisdiction',
        force_ai: true,
      }),
    })
    const nonQuotaRes = await editPost(nonQuotaReq)
    expect(nonQuotaRes.status).toBe(503)

    // Genuine all-key 429 exhaustion returns 429
    __resetGeminiHealthCacheForTests()
    global.fetch = jest.fn(async () => new Response('Quota exceeded', { status: 429 })) as jest.Mock
    const quotaReq = new Request('http://localhost:3000/api/documents/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_content: '1. Clause',
        edit_instruction: 'Add jurisdiction',
        force_ai: true,
      }),
    })
    const quotaRes = await editPost(quotaReq)
    expect(quotaRes.status).toBe(429)
  })
})

describe('NewsletterWidget form copy update', () => {
  it('uses updated label and placeholder while keeping validation unrestricted', () => {
    const widgetSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'NewsletterWidget.tsx'),
      'utf8'
    )

    expect(widgetSource).toContain('Your email address')
    expect(widgetSource).toContain('placeholder="you@company.com or you@gmail.com"')
    expect(widgetSource).not.toContain('Corporate email address')
    expect(widgetSource).not.toContain('ca.firm@gmail.com')
  })
})
