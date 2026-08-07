/**
 * Security & regression test suite.
 * Covers: admin session token auth, safeCompare, extractFirstImage,
 * newsletter email template XSS, and markdownToHtml list-wrapping.
 *
 * Run: npx jest __tests__/security.test.ts --no-coverage
 */

// ── Set env BEFORE any imports ───────────────────────────────────────────────
process.env.ADMIN_PASSWORD = 'test-admin-password-1234'
process.env.ADMIN_SECRET_SALT = 'test-salt-abcdef'
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.corplawupdates.in'

// ── Mock server-only modules newsletter.ts depends on ───────────────────────
jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

jest.mock('@/lib/redis-cache', () => ({
  redis: null,
  getCached: jest.fn().mockResolvedValue(null),
  setCached: jest.fn().mockResolvedValue(undefined),
  invalidateCache: jest.fn().mockResolvedValue(undefined),
}))

// ── Imports ──────────────────────────────────────────────────────────────────
import { createHash, createHmac } from 'crypto'
import { createAdminSessionToken, safeCompare, extractFirstImage } from '../lib/utils'
import { markdownToHtml, buildEmailHtml } from '../lib/newsletter'

// ── Helper: verify a token without Next.js cookies ──────────────────────────
function verifyTokenManually(token: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD!
  const adminSalt = process.env.ADMIN_SECRET_SALT!

  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payloadB64, signature] = parts

  const secretKey = adminPassword + adminSalt
  const expectedSig = createHmac('sha256', secretKey)
    .update(payloadB64)
    .digest('hex')

  try {
    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expectedSig, 'hex')
    if (sigBuf.length !== expBuf.length) return false
    let diff = 0
    for (let i = 0; i < sigBuf.length; i++) diff |= sigBuf[i] ^ expBuf[i]
    if (diff !== 0) return false
  } catch { return false }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    if (!payload.exp || Date.now() > payload.exp) return false
    return true
  } catch { return false }
}

// ════════════════════════════════════════════════════════════════════════════
// 1. createAdminSessionToken()
// ════════════════════════════════════════════════════════════════════════════
describe('createAdminSessionToken()', () => {
  it('returns base64payload.hexsignature format', () => {
    const token = createAdminSessionToken()
    expect(token).toMatch(/^[A-Za-z0-9+/=]+\.[a-f0-9]{64}$/)
  })

  it('payload exp is ~24h from now', () => {
    const token = createAdminSessionToken()
    const payload = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString())
    const now = Date.now()
    expect(payload.exp).toBeGreaterThan(now)
    expect(payload.exp).toBeLessThanOrEqual(now + 24 * 60 * 60 * 1000 + 2000)
  })

  it('throws when ADMIN_PASSWORD is missing', () => {
    const saved = process.env.ADMIN_PASSWORD
    delete process.env.ADMIN_PASSWORD
    expect(() => createAdminSessionToken()).toThrow()
    process.env.ADMIN_PASSWORD = saved
  })

  it('throws when ADMIN_SECRET_SALT is missing', () => {
    const saved = process.env.ADMIN_SECRET_SALT
    delete process.env.ADMIN_SECRET_SALT
    expect(() => createAdminSessionToken()).toThrow()
    process.env.ADMIN_SECRET_SALT = saved
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 2. Session token verification
// ════════════════════════════════════════════════════════════════════════════
describe('Session token verification', () => {
  it('accepts a fresh valid token', () => {
    expect(verifyTokenManually(createAdminSessionToken())).toBe(true)
  })

  it('rejects a token with tampered payload', () => {
    const [, sig] = createAdminSessionToken().split('.')
    const fakePayload = Buffer.from(JSON.stringify({ exp: Date.now() + 99999999 })).toString('base64')
    expect(verifyTokenManually(`${fakePayload}.${sig}`)).toBe(false)
  })

  it('rejects a token with tampered signature', () => {
    const [payload] = createAdminSessionToken().split('.')
    expect(verifyTokenManually(`${payload}.${'a'.repeat(64)}`)).toBe(false)
  })

  it('rejects an expired token', () => {
    const payloadB64 = Buffer.from(JSON.stringify({ exp: Date.now() - 1000 })).toString('base64')
    const secretKey = process.env.ADMIN_PASSWORD! + process.env.ADMIN_SECRET_SALT!
    const sig = createHmac('sha256', secretKey)
      .update(payloadB64)
      .digest('hex')
    expect(verifyTokenManually(`${payloadB64}.${sig}`)).toBe(false)
  })

  it('rejects empty string', () => {
    expect(verifyTokenManually('')).toBe(false)
  })

  it('rejects wrong part count', () => {
    expect(verifyTokenManually('onlyone')).toBe(false)
    expect(verifyTokenManually('a.b.c')).toBe(false)
  })

  it('rejects token signed with wrong password', () => {
    const payloadB64 = Buffer.from(JSON.stringify({ exp: Date.now() + 86400000 })).toString('base64')
    const wrongSig = createHash('sha256')
      .update(payloadB64 + 'WRONG_PASSWORD' + process.env.ADMIN_SECRET_SALT!)
      .digest('hex')
    expect(verifyTokenManually(`${payloadB64}.${wrongSig}`)).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 3. safeCompare()
// ════════════════════════════════════════════════════════════════════════════
describe('safeCompare()', () => {
  it('returns true for identical strings', () => {
    expect(safeCompare('correct-password', 'correct-password')).toBe(true)
  })
  it('returns false for different strings', () => {
    expect(safeCompare('password1', 'password2')).toBe(false)
  })
  it('returns false when one string is empty', () => {
    expect(safeCompare('', 'something')).toBe(false)
    expect(safeCompare('something', '')).toBe(false)
  })
  it('returns true for two empty strings', () => {
    expect(safeCompare('', '')).toBe(true)
  })
  it('is case-sensitive', () => {
    expect(safeCompare('Password', 'password')).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 4. extractFirstImage() — includes backreference regression test
// ════════════════════════════════════════════════════════════════════════════
describe('extractFirstImage()', () => {
  it('extracts from markdown syntax', () => {
    expect(extractFirstImage('![Alt](https://cdn.example.com/img.jpg)')).toBe('https://cdn.example.com/img.jpg')
  })
  it('extracts from HTML img with double quotes', () => {
    expect(extractFirstImage('<img src="https://cdn.example.com/img.png" />')).toBe('https://cdn.example.com/img.png')
  })
  it('extracts from HTML img with single quotes', () => {
    expect(extractFirstImage("<img src='https://cdn.example.com/img.png' />")).toBe('https://cdn.example.com/img.png')
  })
  it('does NOT match mismatched quotes (backreference regression)', () => {
    // Old bug: regex ["'] would accept src="url' — now it must match symmetrically
    expect(extractFirstImage(`<img src="https://cdn.example.com/img.jpg' />`)).toBeNull()
  })
  it('prefers markdown over HTML when both present', () => {
    const content = '![md](https://md.com/img.jpg)\n<img src="https://html.com/img.jpg">'
    expect(extractFirstImage(content)).toBe('https://md.com/img.jpg')
  })
  it('returns null when no image present', () => {
    expect(extractFirstImage('No images here')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(extractFirstImage('')).toBeNull()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 5. buildEmailHtml() — XSS / HTML injection prevention
// ════════════════════════════════════════════════════════════════════════════
describe('buildEmailHtml() — XSS prevention', () => {
  const base = {
    subject: 'Test Newsletter',
    previewText: 'Preview of the email',
    unsubscribeUrl: 'https://corplawupdates.in/unsubscribe?token=abc123',
  }

  it('renders safe HTML content correctly', () => {
    const html = buildEmailHtml({ ...base, bodyHtml: '<p>Hello <strong>world</strong></p>' })
    expect(html).toContain('<strong>world</strong>')
  })

  it('strips <script> tags from bodyHtml', () => {
    const html = buildEmailHtml({ ...base, bodyHtml: '<p>Safe</p><script>alert("xss")</script>' })
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('alert("xss")')
    expect(html).toContain('<p>Safe</p>')
  })

  it('strips onclick event handlers', () => {
    const html = buildEmailHtml({ ...base, bodyHtml: '<p onclick="steal()">Click</p>' })
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('steal()')
  })

  it('strips javascript: href schemes', () => {
    const html = buildEmailHtml({ ...base, bodyHtml: '<a href="javascript:void(0)">Click</a>' })
    expect(html).not.toContain('javascript:')
  })

  it('places preview text AFTER </head> (in body, not head)', () => {
    const html = buildEmailHtml({ ...base, bodyHtml: '<p>Content</p>' })
    const headEnd = html.indexOf('</head>')
    const previewPos = html.indexOf('display:none')
    expect(previewPos).toBeGreaterThan(headEnd)
  })

  it('includes unsubscribe URL', () => {
    const html = buildEmailHtml({ ...base, bodyHtml: '<p>Body</p>' })
    expect(html).toContain('https://corplawupdates.in/unsubscribe?token=abc123')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 6. markdownToHtml() — including list-wrapping regression
// ════════════════════════════════════════════════════════════════════════════
describe('markdownToHtml()', () => {
  it('converts h1/h2/h3 headings', () => {
    expect(markdownToHtml('# H1')).toContain('<h1>H1</h1>')
    expect(markdownToHtml('## H2')).toContain('<h2>H2</h2>')
    expect(markdownToHtml('### H3')).toContain('<h3>H3</h3>')
  })

  it('converts **bold** and *italic*', () => {
    expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>')
    expect(markdownToHtml('*italic*')).toContain('<em>italic</em>')
  })

  it('converts [text](url) links', () => {
    const result = markdownToHtml('[MCA](https://mca.gov.in)')
    expect(result).toContain('href="https://mca.gov.in"')
    expect(result).toContain('MCA')
  })

  it('wraps ALL list items in <ul> — list-wrapping regression test', () => {
    const md = '- Item A\n- Item B\n- Item C'
    const result = markdownToHtml(md)
    const liCount = (result.match(/<li>/g) || []).length
    expect(liCount).toBe(3)
    // All li items must be inside a ul
    expect(result).toContain('<ul>')
    // No orphaned li outside ul (check li doesn't appear after /ul)
    const ulClosePos = result.lastIndexOf('</ul>')
    const lastLiPos = result.lastIndexOf('<li>')
    expect(lastLiPos).toBeLessThan(ulClosePos)
  })

  it('converts \\n\\n to paragraph breaks', () => {
    const result = markdownToHtml('First\n\nSecond')
    expect(result).toContain('</p><p>')
  })
})
