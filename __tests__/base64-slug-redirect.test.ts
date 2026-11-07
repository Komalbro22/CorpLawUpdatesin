import nextConfig from '../next.config.js'
import { resolveBase64SlugRedirect } from '../lib/slug-recovery'
import { supabase } from '../lib/supabase'

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('Scrambled Base64 Slug Redirects', () => {
  describe('next.config.js Static Redirects', () => {
    let redirects: Array<{ source: string; destination: string; permanent: boolean }>

    beforeAll(async () => {
      redirects = await nextConfig.redirects()
    })

    it('redirects truncated base64 /updates/bWNhLWV4dG permanently to target article', () => {
      const match = redirects.find(r => r.source === '/updates/bWNhLWV4dG')
      expect(match).toBeDefined()
      expect(match?.destination).toBe('/updates/mca-extends-annual-filing-deadlines-fy-2025-26')
      expect(match?.permanent).toBe(true)

      const slashMatch = redirects.find(r => r.source === '/updates/bWNhLWV4dG/')
      expect(slashMatch).toBeDefined()
      expect(slashMatch?.destination).toBe('/updates/mca-extends-annual-filing-deadlines-fy-2025-26')
      expect(slashMatch?.permanent).toBe(true)
    })

    it('redirects full base64 /updates/bWNhLWV4dGVuZHMtYW5udWFsLWZpbGluZy1kZWFkbGluZXMtZnktMjAyNS0yNg permanently', () => {
      const match = redirects.find(r => r.source === '/updates/bWNhLWV4dGVuZHMtYW5udWFsLWZpbGluZy1kZWFkbGluZXMtZnktMjAyNS0yNg')
      expect(match).toBeDefined()
      expect(match?.destination).toBe('/updates/mca-extends-annual-filing-deadlines-fy-2025-26')
      expect(match?.permanent).toBe(true)

      const slashMatch = redirects.find(r => r.source === '/updates/bWNhLWV4dGVuZHMtYW5udWFsLWZpbGluZy1kZWFkbGluZXMtZnktMjAyNS0yNg/')
      expect(slashMatch).toBeDefined()
      expect(slashMatch?.destination).toBe('/updates/mca-extends-annual-filing-deadlines-fy-2025-26')
      expect(slashMatch?.permanent).toBe(true)
    })
  })

  describe('Dynamic Safety Net (lib/slug-recovery.ts)', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('resolves truncated base64 slug prefix to the published article', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockIlike = jest.fn().mockReturnThis()
      const mockNot = jest.fn().mockReturnThis()
      const mockLte = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockReturnThis()
      const mockMaybeSingle = jest.fn()

      // First query (exact) returns null, second query (prefix) returns matched slug
      mockMaybeSingle
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: { slug: 'mca-extends-annual-filing-deadlines-fy-2025-26' } })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        not: mockNot,
        lte: mockLte,
        order: mockOrder,
        limit: mockLimit,
        maybeSingle: mockMaybeSingle,
      })

      const result = await resolveBase64SlugRedirect('bWNhLWV4dG')
      expect(result).toBe('/updates/mca-extends-annual-filing-deadlines-fy-2025-26')
      expect(mockIlike).toHaveBeenCalledWith('slug', 'mca-ext%')
    })

    it('resolves exact base64 encoded slug', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockIlike = jest.fn().mockReturnThis()
      const mockNot = jest.fn().mockReturnThis()
      const mockLte = jest.fn().mockReturnThis()
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: { slug: 'mca-extends-annual-filing-deadlines-fy-2025-26' },
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        not: mockNot,
        lte: mockLte,
        maybeSingle: mockMaybeSingle,
      })

      const result = await resolveBase64SlugRedirect('bWNhLWV4dGVuZHMtYW5udWFsLWZpbGluZy1kZWFkbGluZXMtZnktMjAyNS0yNg')
      expect(result).toBe('/updates/mca-extends-annual-filing-deadlines-fy-2025-26')
    })

    it('returns null for normal non-existent slug (falls through to plain 404)', async () => {
      const result = await resolveBase64SlugRedirect('some-normal-broken-article-slug')
      expect(result).toBeNull()
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('returns null for empty or short strings', async () => {
      expect(await resolveBase64SlugRedirect('')).toBeNull()
      expect(await resolveBase64SlugRedirect('abc')).toBeNull()
    })
  })
})
