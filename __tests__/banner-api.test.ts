import { NextRequest } from 'next/server'
import { GET as getCatalog } from '../app/api/banner/catalog/route'
import { POST as previewBanner } from '../app/api/banner/preview/route'
import { checkBannerRateLimit } from '../lib/banner/rate-limit'
import { persistBannerOutputs, BannerStorage } from '../lib/banner/storage'
import { getAdminSession } from '../lib/admin-auth'

// Mock admin auth & supabase
jest.mock('@/lib/admin-auth', () => ({
  getAdminSession: jest.fn(),
  verifyAdminRole: jest.fn().mockResolvedValue(true),
}))
jest.mock('../lib/admin-auth', () => ({
  getAdminSession: jest.fn(),
  verifyAdminRole: jest.fn().mockResolvedValue(true),
}))

jest.mock('../lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}))

describe('Banner API & Storage Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/banner/catalog', () => {
    it('returns 401 when unauthenticated', async () => {
      ;(getAdminSession as jest.Mock).mockResolvedValue(null)
      const req = new NextRequest('http://localhost:3000/api/banner/catalog', {
        method: 'GET',
      })
      const res = await getCatalog(req)
      expect(res.status).toBe(401)
    })

    it('returns catalog with regulators, visual types, icons, and examples when authenticated', async () => {
      ;(getAdminSession as jest.Mock).mockResolvedValue({ role: 'admin' })
      const req = new NextRequest('http://localhost:3000/api/banner/catalog', {
        method: 'GET',
      })
      const res = await getCatalog(req)
      const data = await res.json()
      if (res.status !== 200) {
        console.error('Catalog error status:', res.status, data)
      }
      expect(res.status).toBe(200)

      expect(data.regulators.MCA).toBeDefined()
      expect(data.regulators.SEBI).toBeDefined()
      expect(data.icons).toContain('building-bank')
      expect(data.visual_types.length).toBe(6)
      expect(data.examples.calendar_shift).toBeDefined()
      expect(data.examples.stat_cards).toBeDefined()
      expect(data.limits.max_payload_bytes).toBe(65536)
    })
  })

  describe('POST /api/banner/preview', () => {
    it('returns 401 when unauthenticated', async () => {
      ;(getAdminSession as jest.Mock).mockResolvedValue(null)
      const req = new NextRequest('http://localhost:3000/api/banner/preview', {
        method: 'POST',
        body: JSON.stringify({ mode: 'template', spec: {} }),
      })
      const res = await previewBanner(req)
      expect(res.status).toBe(401)
    })

    it('rejects oversized payloads (> 64 KB) with 413', async () => {
      ;(getAdminSession as jest.Mock).mockResolvedValue({ role: 'editor' })
      const oversizedText = 'a'.repeat(70 * 1024)
      const req = new NextRequest('http://localhost:3000/api/banner/preview', {
        method: 'POST',
        body: oversizedText,
      })
      const res = await previewBanner(req)
      expect(res.status).toBe(413)
      const data = await res.json()
      expect(data.error.code).toBe('PAYLOAD_TOO_LARGE')
    })

    it('returns 400 with path errors for invalid Zod spec', async () => {
      ;(getAdminSession as jest.Mock).mockResolvedValue({ role: 'editor' })
      const req = new NextRequest('http://localhost:3000/api/banner/preview', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'template',
          spec: {
            v: 1,
            regulator: 'INVALID_REGULATOR',
            headline: 'Short',
            sub: 'Short',
            alt: 'Too short',
          },
        }),
      })
      const res = await previewBanner(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(Array.isArray(data.errors)).toBe(true)
      expect(data.errors.some((e: any) => e.path.includes('regulator'))).toBe(true)
    })

    it('renders valid template spec and returns base64 png, warnings, and sha256 hash', async () => {
      ;(getAdminSession as jest.Mock).mockResolvedValue({ role: 'admin' })
      const req = new NextRequest('http://localhost:3000/api/banner/preview', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'template',
          spec: {
            v: 1,
            regulator: 'RBI',
            headline: 'Prompt Corrective Action Framework Overhauled',
            sub: 'Reserve Bank of India amends leverage thresholds for primary urban co-operative banks.',
            action: 'Check capital adequacy ratios',
            dateLabel: 'Nov 2026',
            impact: 'High',
            alt: 'Prompt corrective action framework overhauled by Reserve Bank of India with capital ratio revisions',
            visual: {
              type: 'stat_cards',
              cards: [
                { label: 'MINIMUM CRAR', value: '12.0%' },
                { label: 'TIER 1 CAPITAL', value: '9.0%', chip: '+150 bps' },
              ],
            },
          },
        }),
      })
      const res = await previewBanner(req)
      const data = await res.json()
      if (res.status !== 200) {
        console.error('Preview error status:', res.status, data)
      }
      expect(res.status).toBe(200)
      expect(data.png_base64).toMatch(/^data:image\/png;base64,/)
      expect(typeof data.hash).toBe('string')
      expect(data.hash.length).toBe(64)
      expect(Array.isArray(data.warnings)).toBe(true)
    })
  })

  describe('Storage Adapter & Formats', () => {
    it('persists og.png and hero.webp under articles/{slug}/{slug}-{hash8}', async () => {
      const mockStorage: BannerStorage = {
        upload: jest.fn().mockImplementation((path: string) => {
          return Promise.resolve(`https://cdn.corplawupdates.in/banners/${path}`)
        }),
        getPublicUrl: jest.fn().mockImplementation((path: string) => {
          return `https://cdn.corplawupdates.in/banners/${path}`
        }),
      }

      const hash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      const pngBuffer = Buffer.from('fake-png')
      const webpBuffer = Buffer.from('fake-webp')

      const urls = await persistBannerOutputs('sebi-lods-amendment', hash, pngBuffer, webpBuffer, mockStorage)

      expect(urls.og_png).toBe('https://cdn.corplawupdates.in/banners/articles/sebi-lods-amendment/sebi-lods-amendment-abcdef12-og.png')
      expect(urls.hero_webp).toBe('https://cdn.corplawupdates.in/banners/articles/sebi-lods-amendment/sebi-lods-amendment-abcdef12-hero.webp')
    })
  })

  describe('Rate Limiter', () => {
    it('enforces 30 preview requests per hour limit per key', () => {
      const testKey = 'test_key_rate_limiter'
      for (let i = 0; i < 30; i++) {
        const check = checkBannerRateLimit(testKey, 'preview')
        expect(check.ok).toBe(true)
      }
      const exceed = checkBannerRateLimit(testKey, 'preview')
      expect(exceed.ok).toBe(false)
      expect(typeof exceed.retryAfter).toBe('number')
    })
  })
})
