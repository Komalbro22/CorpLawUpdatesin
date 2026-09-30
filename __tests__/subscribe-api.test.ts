/* eslint-disable @typescript-eslint/no-explicit-any */
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

const mockSubscribersSelect = jest.fn()
const mockSubscribersInsert = jest.fn()
const mockSubscribersUpdate = jest.fn()
const mockLoginAttemptsSelect = jest.fn()
const mockLoginAttemptsInsert = jest.fn()

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: (table: string) => {
      if (table === 'subscribers') {
        return {
          select: (...args: any[]) => ({
            eq: (col: string, val: any) => ({
              maybeSingle: () => mockSubscribersSelect(col, val),
            }),
          }),
          insert: (data: any) => mockSubscribersInsert(data),
          update: (data: any) => ({
            eq: (col: string, val: any) => mockSubscribersUpdate(data, col, val),
          }),
        }
      }
      if (table === 'login_attempts') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => mockLoginAttemptsSelect(),
            }),
          }),
          insert: (data: any) => mockLoginAttemptsInsert(data),
        }
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }
    },
  },
}))

jest.mock('@/lib/redis-cache', () => ({
  redis: null,
}))

jest.mock('@/lib/email-provider', () => ({
  getActiveEmailProvider: () => 'none',
  parseSender: () => ({ email: 'newsletter@corplawupdates.in', name: 'CorpLawUpdates' }),
  sendEmail: jest.fn().mockResolvedValue({ success: true, provider: 'none' }),
}))

import { POST } from '@/app/api/subscribe/route'
import { NextRequest } from 'next/server'

describe('Newsletter Subscribe API (/api/subscribe)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLoginAttemptsSelect.mockResolvedValue({ data: null, error: null })
    mockLoginAttemptsInsert.mockResolvedValue({ data: null, error: null })
  })

  test('Rejects missing email with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Email is required')
  })

  test('Rejects invalid email format with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Invalid email')
  })

  test('Successfully subscribes a new email address with core payload', async () => {
    const testEmail = 'new_subscriber@example.com'
    mockSubscribersSelect.mockResolvedValue({ data: null, error: null })
    mockSubscribersInsert.mockResolvedValue({ data: [{ id: '1', email: testEmail }], error: null })

    const req = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({ email: testEmail }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.alreadySubscribed).toBe(false)
    expect(mockSubscribersInsert).toHaveBeenCalledWith({
      email: testEmail,
      is_active: true,
      confirmed: true,
    })
  })

  test('Handles already subscribed active email without error', async () => {
    const existingEmail = 'active_user@example.com'
    mockSubscribersSelect.mockResolvedValue({
      data: { id: 'uuid-123', is_active: true },
      error: null,
    })

    const req = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({ email: existingEmail }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.alreadySubscribed).toBe(true)
    expect(data.message).toContain('already subscribed')
  })

  test('Retries with core payload if metadata insert fails due to unknown columns', async () => {
    const metaEmail = 'meta_user@example.com'
    mockSubscribersSelect.mockResolvedValue({ data: null, error: null })

    // First insert call with metadata fails (PGRST204: column not found)
    // Second insert call with core payload succeeds
    mockSubscribersInsert
      .mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST204', message: "Could not find the 'frequency' column of 'subscribers'" },
      })
      .mockResolvedValueOnce({
        data: [{ id: '2', email: metaEmail }],
        error: null,
      })

    const req = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        email: metaEmail,
        profession: 'CA',
        frequency: 'Daily',
        source: 'template',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockSubscribersInsert).toHaveBeenCalledTimes(2)
    // Second call must be the core payload
    expect(mockSubscribersInsert).toHaveBeenLastCalledWith({
      email: metaEmail,
      is_active: true,
      confirmed: true,
    })
  })

  test('Reactivates an inactive subscriber successfully', async () => {
    const inactiveEmail = 'inactive_user@example.com'
    mockSubscribersSelect.mockResolvedValue({
      data: { id: 'uuid-456', is_active: false },
      error: null,
    })
    mockSubscribersUpdate.mockResolvedValue({ data: [{ id: 'uuid-456' }], error: null })

    const req = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({ email: inactiveEmail }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.alreadySubscribed).toBe(false)
    expect(mockSubscribersUpdate).toHaveBeenCalledWith(
      {
        is_active: true,
        unsubscribed_at: null,
        confirmed: true,
      },
      'id',
      'uuid-456'
    )
  })
})
