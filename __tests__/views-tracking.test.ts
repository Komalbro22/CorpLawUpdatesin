import { GET, POST } from '@/app/api/views/[slug]/route'
import { supabaseAdmin } from '@/lib/supabase-server'

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}))

describe('Views Tracking API Route (/api/views/[slug])', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects invalid slugs with status 400', async () => {
    const invalidReq = new Request('http://localhost:3000/api/views/invalid%20slug!', { method: 'POST' })
    const res = await POST(invalidReq, { params: Promise.resolve({ slug: 'invalid slug!' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid slug')
  })

  it('returns 404 if the article does not exist or is unpublished', async () => {
    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockNot = jest.fn().mockReturnThis()
    const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })

    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      not: mockNot,
      single: mockSingle,
    })

    const req = new Request('http://localhost:3000/api/views/non-existent-article', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ slug: 'non-existent-article' }) })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Article not found')
  })

  it('calls increment_views RPC on Supabase directly and returns success 200', async () => {
    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockNot = jest.fn().mockReturnThis()
    const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'art-123' }, error: null })

    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      not: mockNot,
      single: mockSingle,
    })

    ;(supabaseAdmin.rpc as jest.Mock).mockResolvedValue({ data: null, error: null })

    const req = new Request('http://localhost:3000/api/views/valid-article-slug', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ slug: 'valid-article-slug' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)

    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('increment_views', {
      article_slug: 'valid-article-slug',
      increment_by: 1,
    })
  })

  it('GET returns current article views from Supabase', async () => {
    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockSingle = jest.fn().mockResolvedValue({ data: { views: 42 }, error: null })

    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })

    const req = new Request('http://localhost:3000/api/views/valid-article-slug', { method: 'GET' })
    const res = await GET(req, { params: Promise.resolve({ slug: 'valid-article-slug' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.views).toBe(42)
  })
})
