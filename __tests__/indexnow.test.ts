import { submitToIndexNow, submitArticleToIndexNow, DEFAULT_INDEXNOW_KEY } from '../lib/indexnow'
import { GET as keyRouteHandler } from '../app/[key].txt/route'
import { NextRequest } from 'next/server'

describe('IndexNow Integration & Verification Suite', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('submits URLs to api.indexnow.org using host and key with status logging', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => '',
    })
    global.fetch = mockFetch as any

    const success = await submitToIndexNow([
      'https://www.corplawupdates.in/updates/sebi-invit-ofs-cooling-off-period-8-weeks',
    ])

    expect(success).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.indexnow.org/indexnow')
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toContain('application/json')

    const body = JSON.parse(options.body)
    expect(body.host).toBe('www.corplawupdates.in')
    expect(body.key).toBe(DEFAULT_INDEXNOW_KEY)
    expect(body.keyLocation).toBe(`https://www.corplawupdates.in/${DEFAULT_INDEXNOW_KEY}.txt`)
    expect(body.urlList).toContain('https://www.corplawupdates.in/updates/sebi-invit-ofs-cooling-off-period-8-weeks')
  })

  it('submits both old and new URLs when article slug changes', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 202,
      statusText: 'Accepted',
      text: async () => '',
    })
    global.fetch = mockFetch as any

    const success = await submitArticleToIndexNow('new-guideline-slug', 'old-guideline-slug')

    expect(success).toBe(true)
    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.urlList).toContain('https://www.corplawupdates.in/updates/new-guideline-slug')
    expect(body.urlList).toContain('https://www.corplawupdates.in/updates/old-guideline-slug')
    expect(body.urlList).toContain('https://www.corplawupdates.in/updates')
    expect(body.urlList).toContain('https://www.corplawupdates.in')
  })

  it('handles API errors gracefully without throwing', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Invalid key',
    })
    global.fetch = mockFetch as any

    const success = await submitToIndexNow(['https://www.corplawupdates.in/updates/test'])
    expect(success).toBe(false)
  })

  it('serves HTTP 200 with the exact key body from the /[key].txt route', async () => {
    const req = new NextRequest(`https://www.corplawupdates.in/${DEFAULT_INDEXNOW_KEY}.txt`)
    const res = await keyRouteHandler(req, { params: Promise.resolve({ key: DEFAULT_INDEXNOW_KEY }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const body = await res.text()
    expect(body).toBe(DEFAULT_INDEXNOW_KEY)
  })

  it('returns 404 for invalid key requests on /[key].txt route', async () => {
    const req = new NextRequest('https://www.corplawupdates.in/invalid-key.txt')
    const res = await keyRouteHandler(req, { params: Promise.resolve({ key: 'invalid-key' }) })

    expect(res.status).toBe(404)
  })
})
