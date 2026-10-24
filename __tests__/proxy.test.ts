import { NextRequest, NextResponse } from 'next/server'
import { proxy } from '../proxy'

describe('Next.js Proxy / Edge Authentication Gate', () => {
  const origEnv = process.env

  beforeEach(() => {
    process.env = {
      ...origEnv,
      ADMIN_PASSWORD: 'testpassword123',
      ADMIN_SECRET_SALT: 'testsalt456',
    }
  })

  afterAll(() => {
    process.env = origEnv
  })

  it('rejects API keys passed in query strings with 400 INVALID_TRANSPORT', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/whoami?key=clk_12345678')
    const res = await proxy(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_TRANSPORT')
  })

  it('allows requests with Authorization: Bearer <key> on admin API routes to pass to route handlers', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/whoami', {
      headers: {
        authorization: 'Bearer clk_0123456789abcdef0123456789abcdef',
      },
    })
    const res = await proxy(req)
    // NextResponse.next() returns a response without 401/403/redirect
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(307)
  })

  it('does NOT bypass auth for Bearer headers on non-API admin pages (/admin/articles)', async () => {
    const req = new NextRequest('http://localhost:3000/admin/articles', {
      headers: {
        authorization: 'Bearer clk_0123456789abcdef0123456789abcdef',
      },
    })
    const res = await proxy(req)
    // Non-API admin pages must redirect to /admin/login when session cookie is absent
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('rejects unauthenticated requests to /api/admin/* with 401 UNAUTHORIZED', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/articles')
    const res = await proxy(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  it('does NOT reject state-changing Bearer requests when a foreign Origin header is present', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/articles', {
      method: 'POST',
      headers: {
        authorization: 'Bearer clk_0123456789abcdef0123456789abcdef',
        origin: 'https://agent-runner.internal.org',
      },
    })
    const res = await proxy(req)
    // Should not be blocked by CSRF
    expect(res.status).not.toBe(403)
  })
})
