/**
 * Admin Badge Counts API Test Suite
 * Tests endpoint security, count extraction, and resilience.
 */

jest.mock('@/lib/admin-auth', () => ({
  verifyAdminSession: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

jest.mock('@/lib/supabase-documents-server', () => ({
  supabaseDocumentsAdmin: {
    from: jest.fn(),
  },
}))

import { GET } from '@/app/api/admin/badge-counts/route'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

describe('GET /api/admin/badge-counts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 Unauthorized when admin session is invalid', async () => {
    ;(verifyAdminSession as jest.Mock).mockResolvedValue(false)

    const res = await GET()
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns badge counts when admin session is authenticated', async () => {
    ;(verifyAdminSession as jest.Mock).mockResolvedValue(true)

    // Mock supabaseAdmin.from for each table
    ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'reader_feedback') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 2, error: null }),
          }),
        }
      }
      if (table === 'partner_interests') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }
      }
      if (table === 'compliance_suggestions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              not: jest.fn().mockResolvedValue({ count: 1, error: null }),
            }),
          }),
        }
      }
      if (table === 'updates') {
        return {
          select: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({ count: 3, error: null }),
          }),
        }
      }
      if (table === 'scheduled_newsletters') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }
    })

    ;(supabaseDocumentsAdmin.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
      }),
    }))

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()

    expect(json.counts).toBeDefined()
    expect(json.counts['/admin/feedback']).toBe(2)
    expect(json.counts['/admin/articles']).toBe(3)
    expect(json.counts['/admin/compliance/suggestions']).toBe(1)
    expect(json.counts['/admin/partner-interests']).toBe(0)
    expect(json.totalPending).toBe(6)
  })

  it('gracefully handles database errors and returns 0 for failing tables', async () => {
    ;(verifyAdminSession as jest.Mock).mockResolvedValue(true)

    ;(supabaseAdmin.from as jest.Mock).mockImplementation(() => {
      throw new Error('Database connection failed')
    })
    ;(supabaseDocumentsAdmin.from as jest.Mock).mockImplementation(() => {
      throw new Error('Database connection failed')
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()

    expect(json.counts).toBeDefined()
    expect(json.counts['/admin/feedback']).toBe(0)
    expect(json.counts['/admin/articles']).toBe(0)
    expect(json.totalPending).toBe(0)
  })
})
