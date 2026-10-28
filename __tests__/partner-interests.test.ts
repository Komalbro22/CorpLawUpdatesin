/**
 * Partner Interests API Test Suite
 * Tests admin authentication, search, filtering, and CSV export with expanded fields.
 */

jest.mock('@/lib/admin-auth', () => ({
  verifyAdminSession: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

import { GET } from '@/app/api/admin/partner-interests/route'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

describe('GET /api/admin/partner-interests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 Unauthorized when admin session is invalid', async () => {
    ;(verifyAdminSession as jest.Mock).mockResolvedValue(false)

    const req = new NextRequest('http://localhost:3000/api/admin/partner-interests')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('exports CSV with new partnership fields when export=csv is specified', async () => {
    ;(verifyAdminSession as jest.Mock).mockResolvedValue(true)

    const mockPartnerData = [
      {
        id: 'mock-uuid-1',
        firm_or_individual_name: 'Apex Legal & Partners',
        qualification: 'CS',
        experience_years: 10,
        services: ['MCA Filings', 'ROC Compliance'],
        partnership_types: ['Sponsored Article', 'Referral Partnership'],
        product_description: 'Automated secretarial compliance suite',
        website: 'https://apexlegal.in',
        contact_preference: 'Email',
        contact_value: 'lead@apexlegal.in',
        status: 'pending',
        created_at: '2026-10-28T10:00:00Z',
        message: 'Looking forward to sponsoring a deep dive on Section 48A.',
        additional_notes: '[Interests: Sponsored Article]',
      },
    ]

    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockPartnerData,
          error: null,
        }),
      }),
    })

    const req = new NextRequest('http://localhost:3000/api/admin/partner-interests?export=csv')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/csv')

    const csvText = await res.text()
    expect(csvText).toContain('partnership_types')
    expect(csvText).toContain('product_description')
    expect(csvText).toContain('Apex Legal & Partners')
    expect(csvText).toContain('Sponsored Article; Referral Partnership')
    expect(csvText).toContain('Automated secretarial compliance suite')
  })

  it('returns paginated partner list and stats when authenticated', async () => {
    ;(verifyAdminSession as jest.Mock).mockResolvedValue(true)

    const mockList = [
      {
        id: 'mock-uuid-2',
        firm_or_individual_name: 'CS R. Sharma',
        qualification: 'CS',
        experience_years: 5,
        services: ['SEBI LODR'],
        partnership_types: ['Featured Partner Listing'],
        product_description: null,
        website: null,
        contact_preference: 'WhatsApp',
        contact_value: '+919876543210',
        status: 'reviewed',
        created_at: '2026-10-28T09:00:00Z',
        message: 'Interested in directory listing.',
        additional_notes: null,
      },
    ]

    const queryMock: any = {
      eq: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockList,
        count: 1,
        error: null,
      }),
    }

    ;(supabaseAdmin.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
        if (opts?.head) {
          return {
            eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
            then: (resolve: any) => resolve({ count: 1, error: null }),
          }
        }
        return queryMock
      }),
    }))

    const req = new NextRequest('http://localhost:3000/api/admin/partner-interests?page=1')
    const res = await GET(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.partnerInterests).toBeDefined()
    expect(json.partnerInterests.length).toBe(1)
    expect(json.partnerInterests[0].firm_or_individual_name).toBe('CS R. Sharma')
    expect(json.stats).toBeDefined()
  })
})
