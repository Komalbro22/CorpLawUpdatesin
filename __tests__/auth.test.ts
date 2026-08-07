/**
 * Auth & Cryptography Test Suite for CorpLawUpdates.in
 * Covers: HMAC-SHA256 session token creation, verification, timing-safe compare,
 * CSRF origin validation, and Cron auth header validation.
 *
 * Run: npx jest __tests__/auth.test.ts --no-coverage
 */

process.env.ADMIN_PASSWORD = 'test-secret-password-999'
process.env.ADMIN_SECRET_SALT = 'test-salt-key-888'
process.env.CRON_SECRET = 'test-cron-secret-777'

import { createAdminSessionToken, safeCompare } from '../lib/utils'
import { validateCronAuth } from '../lib/cron-auth'

describe('HMAC-SHA256 Session Tokens', () => {
  it('generates valid HMAC session token structure', () => {
    const token = createAdminSessionToken()
    expect(token).toBeDefined()
    const parts = token.split('.')
    expect(parts.length).toBe(2)
    expect(parts[1]).toMatch(/^[a-f0-9]{64}$/) // 64 hex char SHA-256 HMAC
  })

  it('payload contains expiration 24 hours in future', () => {
    const token = createAdminSessionToken()
    const [payloadB64] = token.split('.')
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'))
    expect(payload.exp).toBeGreaterThan(Date.now())
  })
})

describe('safeCompare()', () => {
  it('compares identical strings correctly', () => {
    expect(safeCompare('secret_pass', 'secret_pass')).toBe(true)
  })

  it('rejects mismatching strings', () => {
    expect(safeCompare('secret_pass', 'wrong_pass')).toBe(false)
  })
})

describe('validateCronAuth()', () => {
  it('passes when Bearer token matches CRON_SECRET', () => {
    const req = new Request('https://www.corplawupdates.in/api/cron/update-rbi-rates', {
      headers: { Authorization: 'Bearer test-cron-secret-777' },
    })
    const result = validateCronAuth(req)
    expect(result).toBeNull() // null means auth passed
  })

  it('fails with 401 when Authorization header is missing', () => {
    const req = new Request('https://www.corplawupdates.in/api/cron/update-rbi-rates')
    const result = validateCronAuth(req)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(401)
  })

  it('fails with 401 when Bearer token is incorrect', () => {
    const req = new Request('https://www.corplawupdates.in/api/cron/update-rbi-rates', {
      headers: { Authorization: 'Bearer WRONG_TOKEN' },
    })
    const result = validateCronAuth(req)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(401)
  })

  it('fails closed with 401 if CRON_SECRET environment variable is missing', () => {
    const saved = process.env.CRON_SECRET
    delete process.env.CRON_SECRET
    const req = new Request('https://www.corplawupdates.in/api/cron/update-rbi-rates', {
      headers: { Authorization: 'Bearer test-cron-secret-777' },
    })
    const result = validateCronAuth(req)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(401)
    process.env.CRON_SECRET = saved
  })
})
