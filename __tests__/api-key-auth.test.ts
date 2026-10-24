/**
 * Scoped API Key Authentication & Security Safeguards Test Suite
 * Tests:
 * 1. Cryptographic key generation, SHA-256 hashing, and prefix extraction.
 * 2. Header-only transport enforcement and query-string key rejection.
 * 3. Scoped authorization: grants access for matching scope, 403 for missing scope.
 * 4. Revocation check: 401 for revoked keys.
 * 5. Published article delete refusal: hard 403 limit for API keys.
 * 6. Idempotency check: repeated requests return cached response.
 */

import { NextRequest } from 'next/server'
import {
  hashApiKey,
  verifyAdminOrKey,
  getIdempotentResponse,
  storeIdempotentResponse,
} from '../lib/api-key-auth'
import { supabaseAdmin } from '../lib/supabase-server'
import { DELETE as deleteArticle } from '../app/api/admin/articles/[id]/route.ts'

// Mock supabaseAdmin
jest.mock('../lib/supabase-server', () => {
  return {
    supabaseAdmin: {
      from: jest.fn(),
      storage: {
        from: jest.fn(),
      },
    },
  }
})

// Mock getAdminSession to simulate no session by default
jest.mock('../lib/admin-auth', () => ({
  getAdminSession: jest.fn().mockResolvedValue(null),
  verifyAdminRole: jest.fn().mockResolvedValue(true),
}))

// Mock revalidation
jest.mock('../lib/content-revalidation', () => ({
  revalidateArticleMutation: jest.fn(),
  revalidateGlossaryMutation: jest.fn(),
}))

// Mock indexing
jest.mock('../lib/indexnow', () => ({
  submitArticleToIndexNow: jest.fn().mockResolvedValue(true),
}))
jest.mock('../lib/google-indexing', () => ({
  submitArticleToGoogleIndexing: jest.fn().mockResolvedValue({ success: true }),
}))

describe('API Key Cryptography', () => {
  it('hashApiKey produces a 64-character SHA-256 hex digest', () => {
    const rawKey = 'clk_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    const hash = hashApiKey(rawKey)
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    // Deterministic check
    expect(hashApiKey(rawKey)).toBe(hash)
  })

  it('different raw keys produce different hashes', () => {
    const hash1 = hashApiKey('clk_key_one_test_12345678')
    const hash2 = hashApiKey('clk_key_two_test_12345678')
    expect(hash1).not.toBe(hash2)
  })
})

describe('verifyAdminOrKey Transport & Security', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects keys passed in URL query string with 400 Bad Request', async () => {
    const req = new NextRequest('https://www.corplawupdates.in/api/admin/articles?key=clk_secret_123')
    const result = await verifyAdminOrKey(req, 'articles:read')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
      const data = await result.response.json()
      expect(data.error.code).toBe('INVALID_TRANSPORT')
    }
  })

  it('rejects requests with missing authentication with 401 Unauthorized', async () => {
    const req = new NextRequest('https://www.corplawupdates.in/api/admin/articles')
    const result = await verifyAdminOrKey(req, 'articles:read')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
      const data = await result.response.json()
      expect(data.error.code).toBe('UNAUTHORIZED')
    }
  })

  it('rejects an invalid or non-existent API key with 401', async () => {
    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })

    const req = new NextRequest('https://www.corplawupdates.in/api/admin/articles', {
      headers: { Authorization: 'Bearer clk_non_existent_key_999999' },
    })
    const result = await verifyAdminOrKey(req, 'articles:read')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
    }
  })

  it('rejects a revoked API key with 401', async () => {
    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-key-id-1',
          name: 'Revoked Test Key',
          prefix: 'clk_12345678',
          scopes: ['articles:read'],
          status: 'revoked',
        },
        error: null,
      }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })

    const req = new NextRequest('https://www.corplawupdates.in/api/admin/articles', {
      headers: { Authorization: 'Bearer clk_revoked_key_111111' },
    })
    const result = await verifyAdminOrKey(req, 'articles:read')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
    }
  })

  it('rejects an active key lacking the required scope with 403 Forbidden', async () => {
    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-key-id-2',
          name: 'Read Only Key',
          prefix: 'clk_87654321',
          scopes: ['articles:read'], // Lacks articles:write
          status: 'active',
        },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
    })

    const req = new NextRequest('https://www.corplawupdates.in/api/admin/articles', {
      headers: { Authorization: 'Bearer clk_valid_read_only_key_222222' },
    })
    const result = await verifyAdminOrKey(req, 'articles:write')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(403)
      const data = await result.response.json()
      expect(data.error.code).toBe('FORBIDDEN')
      expect(data.error.message).toContain('articles:write')
    }
  })

  it('accepts an active key with the required scope', async () => {
    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-key-id-3',
          name: 'Muse Editorial Key',
          prefix: 'clk_abcdef12',
          scopes: ['articles:read', 'articles:write'],
          status: 'active',
        },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
    })

    const req = new NextRequest('https://www.corplawupdates.in/api/admin/articles', {
      headers: { Authorization: 'Bearer clk_valid_editorial_key_333333' },
    })
    const result = await verifyAdminOrKey(req, 'articles:read')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.auth.type).toBe('api_key')
      if (result.auth.type === 'api_key') {
        expect(result.auth.key.name).toBe('Muse Editorial Key')
      }
    }
  })
})

describe('Safety Hard Limit: Refuse Published Article Deletions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('refuses deletion of a published article by an API key even if key has articles:delete scope', async () => {
    ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'api_keys') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-key-id-4',
              name: 'Delete Scope Key',
              prefix: 'clk_del12345',
              scopes: ['articles:read', 'articles:delete'],
              status: 'active',
            },
            error: null,
          }),
          update: jest.fn().mockReturnThis(),
        }
      }
      if (table === 'updates') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'art-published-1',
              slug: 'published-article-slug',
              category: 'MCA',
              published_at: '2026-10-20T12:00:00.000Z', // PUBLISHED!
            },
            error: null,
          }),
        }
      }
      if (table === 'api_audit_log') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        }
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }
    })

    const req = new NextRequest('https://www.corplawupdates.in/api/admin/articles/art-published-1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer clk_valid_delete_scope_key' },
    })

    const res = await deleteArticle(req, { params: Promise.resolve({ id: 'art-published-1' }) })
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
    expect(json.error.message).toContain('API keys cannot delete published articles')
  })
})

describe('Idempotency Key Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns exists: false when idempotency key is null', async () => {
    const result = await getIdempotentResponse(null, '/api/admin/articles')
    expect(result.exists).toBe(false)
  })

  it('returns cached response when valid idempotency key exists in database', async () => {
    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          status_code: 201,
          response_body: { id: 'article-123', title: 'Cached Article' },
          expires_at: new Date(Date.now() + 1000000).toISOString(),
        },
        error: null,
      }),
    })

    const result = await getIdempotentResponse('test-idemp-uuid-1', '/api/admin/articles')
    expect(result.exists).toBe(true)
    expect(result.statusCode).toBe(201)
    expect(result.responseBody).toEqual({ id: 'article-123', title: 'Cached Article' })
  })
})
