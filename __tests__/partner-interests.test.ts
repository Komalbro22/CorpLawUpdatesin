/**
 * Partner Interests API Test Suite
 * Tests admin authentication, search, filtering, CSV export, stats, detail, patch, and delete restrictions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { GET as listGet } from '@/app/api/admin/partner-interests/route'
import { GET as statsGet } from '@/app/api/admin/partner-interests/stats/route'
import { GET as detailGet, PATCH as detailPatch, DELETE as detailDelete } from '@/app/api/admin/partner-interests/[id]/route'
import { supabaseAdmin } from '@/lib/supabase-server'
import * as apiKeyAuth from '@/lib/api-key-auth'

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

describe('Partner Interests CMS Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/partner-interests', () => {
    it('returns 401/403 when auth fails', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests')
      const res = await listGet(req)
      expect(res.status).toBe(401)
    })

    it('returns paginated partner list and stats with all fields and aliases', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:read'] } as any,
        },
      })

      const mockList = [
        {
          id: '520f344b-5bde-4da0-b3b4-031f3cc31617',
          firm_or_individual_name: 'komal',
          qualification: 'CS',
          experience_years: 5,
          services: ['demo'],
          partnership_types: ['Sponsored Article'],
          product_description: 'demo tool',
          website: 'https://example.com',
          contact_preference: 'Email',
          contact_value: 'komal@example.com',
          status: 'pending',
          created_at: '2026-10-28T13:06:36.608Z',
          message: 'Interested in partnering',
          additional_notes: 'Demo note',
        },
      ]

      const queryMock: any = {
        eq: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
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

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests?status=pending&limit=10&page=1')
      const res = await listGet(req)
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.items).toBeDefined()
      expect(json.items.length).toBe(1)
      const item = json.items[0]
      expect(item.firm_or_individual_name).toBe('komal')
      expect(item.partnership_interests).toEqual(['Sponsored Article'])
      expect(item.product_service_description).toBe('demo tool')
      expect(item.preferred_contact_method).toBe('Email')
      expect(item.contact_details).toBe('komal@example.com')
      expect(item.submission_date).toBe('2026-10-28T13:06:36.608Z')
      expect(item.status).toBe('pending')
      expect(json.stats.total).toBe(1)
      expect(json.stats.pending).toBe(1)
    })

    it('supports since parameter for date filtering', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:read'] } as any,
        },
      })

      const gteSpy = jest.fn().mockReturnThis()
      const queryMock: any = {
        eq: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        gte: gteSpy,
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], count: 0, error: null }),
      }

      ;(supabaseAdmin.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
          if (opts?.head) {
            return {
              eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
              then: (resolve: any) => resolve({ count: 0, error: null }),
            }
          }
          return queryMock
        }),
      }))

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests?since=2026-10-28T00:00:00.000Z')
      const res = await listGet(req)
      expect(res.status).toBe(200)
      expect(gteSpy).toHaveBeenCalledWith('created_at', '2026-10-28T00:00:00.000Z')
    })
  })

  describe('GET /api/admin/partner-interests/stats', () => {
    it('returns stats matching schema: total, pending, reviewed, contacted, onboarded', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:read'] } as any,
        },
      })

      ;(supabaseAdmin.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
          return {
            eq: jest.fn().mockImplementation((col: string, val: string) => {
              const count = val === 'pending' ? 1 : 0
              return Promise.resolve({ count, error: null })
            }),
            then: (resolve: any) => resolve({ count: 1, error: null }),
          }
        }),
      }))

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/stats')
      const res = await statsGet(req)
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json).toEqual({
        total: 1,
        pending: 1,
        reviewed: 0,
        contacted: 0,
        onboarded: 0,
      })
    })
  })

  describe('GET /api/admin/partner-interests/[id]', () => {
    it('returns 404 when partner interest is not found', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:read'] } as any,
        },
      })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/missing-id')
      const res = await detailGet(req, { params: Promise.resolve({ id: 'missing-id' }) })
      expect(res.status).toBe(404)
    })

    it('returns single partner interest when found', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:read'] } as any,
        },
      })

      const mockLead = {
        id: '520f344b-5bde-4da0-b3b4-031f3cc31617',
        firm_or_individual_name: 'komal',
        qualification: 'CS',
        services: ['demo'],
        partnership_types: ['Sponsored Article'],
        status: 'pending',
        created_at: '2026-10-28T13:06:36.608Z',
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockLead, error: null }),
          }),
        }),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/520f344b-5bde-4da0-b3b4-031f3cc31617')
      const res = await detailGet(req, { params: Promise.resolve({ id: '520f344b-5bde-4da0-b3b4-031f3cc31617' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.item.id).toBe('520f344b-5bde-4da0-b3b4-031f3cc31617')
      expect(json.item.firm_or_individual_name).toBe('komal')
    })
  })

  describe('PATCH /api/admin/partner-interests/[id]', () => {
    it('rejects unknown fields with 400 naming the field', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:write'] } as any,
        },
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/id-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'reviewed', rogue_field: 'illegal', unknown_prop: 123 }),
      })

      const res = await detailPatch(req, { params: Promise.resolve({ id: 'id-1' }) })
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error.code).toBe('VALIDATION_ERROR')
      expect(json.error.message).toContain('"rogue_field"')
      expect(json.error.message).toContain('"unknown_prop"')
    })

    it('rejects invalid status values with 400', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:write'] } as any,
        },
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/id-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'invalid_status_xyz' }),
      })

      const res = await detailPatch(req, { params: Promise.resolve({ id: 'id-1' }) })
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error.message).toContain('Invalid status')
    })

    it('updates status and logs audit entry with actor key name', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:write'] } as any,
        },
      })
      const auditSpy = jest.spyOn(apiKeyAuth, 'logApiAudit').mockResolvedValue(undefined as any)

      const existingLead = {
        id: '520f344b-5bde-4da0-b3b4-031f3cc31617',
        status: 'pending',
        additional_notes: 'Old note',
      }
      const updatedLead = {
        ...existingLead,
        status: 'reviewed',
        additional_notes: 'Reviewed by Muse AI agent',
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: existingLead, error: null }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedLead, error: null }),
            }),
          }),
        }),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/520f344b-5bde-4da0-b3b4-031f3cc31617', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'reviewed', note: 'Reviewed by Muse AI agent' }),
      })

      const res = await detailPatch(req, { params: Promise.resolve({ id: '520f344b-5bde-4da0-b3b4-031f3cc31617' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.item.status).toBe('reviewed')
      expect(json.item.additional_notes).toBe('Reviewed by Muse AI agent')

      // Verify audit log
      expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({
        keyId: 'k1',
        keyName: 'muse ai',
        action: 'partner-interests:update',
        entityType: 'partner_interest',
        entityId: '520f344b-5bde-4da0-b3b4-031f3cc31617',
        details: expect.objectContaining({
          old_status: 'pending',
          new_status: 'reviewed',
          note: 'Reviewed by Muse AI agent',
        }),
      }))
    })
  })

  describe('DELETE /api/admin/partner-interests/[id]', () => {
    it('returns 403 Forbidden when called by API key (Hard Security Rule)', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['partner-interests:write'] } as any,
        },
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/any-id', {
        method: 'DELETE',
      })

      const res = await detailDelete(req, { params: Promise.resolve({ id: 'any-id' }) })
      expect(res.status).toBe(403)
      const json = await res.json()
      expect(json.error.code).toBe('FORBIDDEN')
      expect(json.error.message).toContain('API keys cannot delete partner interest submissions')
    })

    it('allows deletion for super admin UI session', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'session',
          role: 'admin',
        },
      })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/partner-interests/any-id', {
        method: 'DELETE',
      })

      const res = await detailDelete(req, { params: Promise.resolve({ id: 'any-id' }) })
      expect(res.status).toBe(200)
    })
  })
})
