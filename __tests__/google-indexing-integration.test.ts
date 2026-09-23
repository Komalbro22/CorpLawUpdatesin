import {
  isGoogleIndexingConfigured,
  submitToGoogleIndexing,
  submitUrlsToGoogleIndexing,
  submitArticleToGoogleIndexing,
  pingGoogleWebSub,
} from '@/lib/google-indexing'

describe('Google Indexing API & WebSub Module', () => {
  const originalEnv = process.env
  let fetchMock: jest.SpyInstance

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    fetchMock = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    process.env = originalEnv
    fetchMock.mockRestore()
  })

  describe('isGoogleIndexingConfigured', () => {
    it('returns false when credentials are empty', () => {
      delete process.env.GOOGLE_CLIENT_EMAIL
      delete process.env.GOOGLE_PRIVATE_KEY

      const status = isGoogleIndexingConfigured()
      expect(status.configured).toBe(false)
      expect(status.clientEmail).toBeNull()
    })

    it('returns true when credentials are present', () => {
      process.env.GOOGLE_CLIENT_EMAIL = 'test@example.iam.gserviceaccount.com'
      process.env.GOOGLE_PRIVATE_KEY = 'test-private-key'

      const status = isGoogleIndexingConfigured()
      expect(status.configured).toBe(true)
      expect(status.clientEmail).toBe('test@example.iam.gserviceaccount.com')
    })
  })

  describe('submitToGoogleIndexing', () => {
    it('returns warning and skips if credentials are not configured', async () => {
      delete process.env.GOOGLE_CLIENT_EMAIL
      delete process.env.GOOGLE_PRIVATE_KEY

      const res = await submitToGoogleIndexing('/updates/sample-article')
      expect(res.success).toBe(false)
      expect(res.message).toContain('not set')
      expect(res.url).toContain('/updates/sample-article')
    })
  })

  describe('submitUrlsToGoogleIndexing', () => {
    it('handles an empty array of URLs gracefully', async () => {
      const res = await submitUrlsToGoogleIndexing([])
      expect(res.success).toBe(0)
      expect(res.failed).toBe(0)
      expect(res.submitted).toEqual([])
    })
  })

  describe('submitArticleToGoogleIndexing', () => {
    it('returns false if slug is empty', async () => {
      const res = await submitArticleToGoogleIndexing('')
      expect(res).toBe(false)
    })
  })

  describe('pingGoogleWebSub', () => {
    it('sends POST request to pubsubhubbub hub with correct payload', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response)

      const success = await pingGoogleWebSub()
      expect(success).toBe(true)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://pubsubhubbub.appspot.com',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      )
    })

    it('handles network errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const success = await pingGoogleWebSub()
      expect(success).toBe(false)
    })
  })
})
