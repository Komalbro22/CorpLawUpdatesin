/**
 * Subscribers API Key Protection Test Suite
 * Verifies that API keys CANNOT delete subscribers or unsubscribe/deactivate them.
 * Verifies that dashboard sessions and self-service remain functional.
 */

import { NextRequest, NextResponse } from 'next/server'
import { PATCH, DELETE } from '@/app/api/admin/subscribers/[id]/route'
import { supabaseAdmin } from '@/lib/supabase-server'
import * as apiKeyAuth from '@/lib/api-key-auth'

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

describe('Subscribers API Protection (Hard Security Limits)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE /api/admin/subscribers/[id]', () => {
    it('returns 403 Forbidden when called by API key', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['subscribers:write'] } as any,
        },
      })

      const req = new NextRequest('http://localhost:3000/api/admin/subscribers/sub-123', {
        method: 'DELETE',
      })

      const res = await DELETE(req, { params: Promise.resolve({ id: 'sub-123' }) })
      expect(res.status).toBe(403)
      const json = await res.json()
      expect(json.error.code).toBe('FORBIDDEN')
      expect(json.error.message).toContain('API keys cannot delete subscribers')
    })

    it('allows deletion when called by dashboard admin session', async () => {
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

      const req = new NextRequest('http://localhost:3000/api/admin/subscribers/sub-123', {
        method: 'DELETE',
      })

      const res = await DELETE(req, { params: Promise.resolve({ id: 'sub-123' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
    })
  })

  describe('PATCH /api/admin/subscribers/[id]', () => {
    it('returns 403 Forbidden when called by API key to unsubscribe ({ is_active: false })', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['subscribers:write'] } as any,
        },
      })

      const req = new NextRequest('http://localhost:3000/api/admin/subscribers/sub-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })

      const res = await PATCH(req, { params: Promise.resolve({ id: 'sub-123' }) })
      expect(res.status).toBe(403)
      const json = await res.json()
      expect(json.error.code).toBe('FORBIDDEN')
      expect(json.error.message).toContain('API keys cannot unsubscribe or deactivate subscribers')
    })

    it('returns 403 Forbidden when called by API key without body (defaulting to inactive)', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['subscribers:write'] } as any,
        },
      })

      const req = new NextRequest('http://localhost:3000/api/admin/subscribers/sub-123', {
        method: 'PATCH',
      })

      const res = await PATCH(req, { params: Promise.resolve({ id: 'sub-123' }) })
      expect(res.status).toBe(403)
      const json = await res.json()
      expect(json.error.code).toBe('FORBIDDEN')
      expect(json.error.message).toContain('API keys cannot unsubscribe or deactivate subscribers')
    })

    it('allows API key to reactivate an inactive subscriber ({ is_active: true })', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'api_key',
          key: { id: 'k1', name: 'muse ai', scopes: ['subscribers:write'] } as any,
        },
      })
      jest.spyOn(apiKeyAuth, 'logApiAudit').mockResolvedValue()

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'sub-123', email: 'user@example.com', is_active: true, unsubscribed_at: null },
                error: null,
              }),
            }),
          }),
        }),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/subscribers/sub-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      })

      const res = await PATCH(req, { params: Promise.resolve({ id: 'sub-123' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.subscriber.is_active).toBe(true)
    })

    it('allows dashboard admin session to unsubscribe ({ is_active: false })', async () => {
      jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
        success: true,
        auth: {
          type: 'session',
          role: 'admin',
        },
      })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'sub-123', email: 'user@example.com', is_active: false, unsubscribed_at: '2026-10-28T00:00:00Z' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/subscribers/sub-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })

      const res = await PATCH(req, { params: Promise.resolve({ id: 'sub-123' }) })
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.subscriber.is_active).toBe(false)
    })
  })
})
