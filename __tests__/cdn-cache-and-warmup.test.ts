// Set mock env vars before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-key'
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.corplawupdates.in'

jest.mock('@/components/MarkdownRenderer', () => () => null)
jest.mock('react-markdown', () => () => null)
jest.mock('remark-gfm', () => () => null)
jest.mock('remark-breaks', () => () => null)
jest.mock('rehype-raw', () => () => null)

import nextConfig from '../next.config.js'
import { warmUpUrls, warmUpPublishedArticle } from '../lib/cache-warmup'
import { revalidate as articleRevalidate } from '../app/updates/[slug]/page'
import { revalidate as sitemapRevalidate } from '../app/sitemap'
import { revalidate as newsSitemapRevalidate } from '../app/news-sitemap.xml/route'
import { dynamic as notFoundDynamic, revalidate as notFoundRevalidate } from '../app/not-found'

describe('CDN Cache & 404 Prevention Suite', () => {
  describe('next.config.js Cache-Control headers', () => {
    let headerRules: Array<{ source: string; headers: Array<{ key: string; value: string }> }>

    beforeAll(async () => {
      headerRules = await nextConfig.headers()
    })

    const getHeader = (sourcePath: string, headerKey: string) => {
      const rule = headerRules.find(r => r.source === sourcePath)
      if (!rule) return null
      const h = rule.headers.find(h => h.key.toLowerCase() === headerKey.toLowerCase())
      return h ? h.value : null
    }

    it('caps /updates/:path* shared-cache to at most 60s to prevent 24h cached 404s', () => {
      const cacheControl = getHeader('/updates/:path*', 'Cache-Control')
      expect(cacheControl).toBeDefined()
      expect(cacheControl).toContain('s-maxage=60')
      expect(cacheControl).toContain('stale-while-revalidate=600')
      expect(cacheControl).toContain('max-age=60')

      // Verify s-maxage is <= 60 per Requirement 1
      const sMaxAgeMatch = cacheControl?.match(/s-maxage=(\d+)/)
      expect(sMaxAgeMatch).not.toBeNull()
      const sMaxAge = parseInt(sMaxAgeMatch![1], 10)
      expect(sMaxAge).toBeLessThanOrEqual(60)
    })

    it('configures short shared-cache for /sitemap.xml and /news-sitemap.xml (<= 300s)', () => {
      const sitemapCache = getHeader('/sitemap.xml', 'Cache-Control')
      expect(sitemapCache).toBeDefined()
      expect(sitemapCache).toContain('s-maxage=300')
      expect(sitemapCache).toContain('stale-while-revalidate=600')

      const newsSitemapCache = getHeader('/news-sitemap.xml', 'Cache-Control')
      expect(newsSitemapCache).toBeDefined()
      expect(newsSitemapCache).toContain('s-maxage=300')
      expect(newsSitemapCache).toContain('stale-while-revalidate=600')
    })

    it('configures modest shared-cache for homepage and main public listings (s-maxage=120)', () => {
      const homeCache = getHeader('/', 'Cache-Control')
      expect(homeCache).toBeDefined()
      expect(homeCache).toContain('s-maxage=120')
      expect(homeCache).toContain('stale-while-revalidate=600')

      const listingsCache = getHeader('/(updates|guides|glossary|tools|about|calendar|documents|category|rbi|author|newsletter)', 'Cache-Control')
      expect(listingsCache).toBeDefined()
      expect(listingsCache).toContain('s-maxage=120')
    })

    it('preserves long immutable caching for static assets (images, fonts, proxy)', () => {
      const assetCache = getHeader('/(images|fonts)/:path*', 'Cache-Control')
      expect(assetCache).toBeDefined()
      expect(assetCache).toContain('s-maxage=604800')

      const proxyCache = getHeader('/api/image-proxy', 'Cache-Control')
      expect(proxyCache).toBeDefined()
      expect(proxyCache).toContain('immutable')
      expect(proxyCache).toContain('s-maxage=31536000')
    })

    it('maintains strict CSP and security headers', () => {
      const globalRule = headerRules.find(r => r.source === '/(.*)')
      expect(globalRule).toBeDefined()
      const csp = globalRule?.headers.find(h => h.key === 'Content-Security-Policy')
      expect(csp).toBeDefined()
      expect(csp?.value).toContain('scripts.scriptwrapper.com')
      expect(csp?.value).toContain('https://*.googlesyndication.com')
      expect(csp?.value).toContain('https:')
    })
  })

  describe('Route segment revalidate configurations', () => {
    it('app/updates/[slug]/page.tsx revalidate is set to 60s', () => {
      expect(articleRevalidate).toBe(60)
    })

    it('app/sitemap.ts revalidate is set to 300s (5 minutes fallback)', () => {
      expect(sitemapRevalidate).toBe(300)
    })

    it('app/news-sitemap.xml/route.ts revalidate is set to 300s', () => {
      expect(newsSitemapRevalidate).toBe(300)
    })

    it('app/not-found.tsx is force-dynamic with revalidate 0', () => {
      expect(notFoundDynamic).toBe('force-dynamic')
      expect(notFoundRevalidate).toBe(0)
    })
  })

  describe('Publish-time cache warm-up (lib/cache-warmup.ts)', () => {
    const originalFetch = global.fetch

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('dispatches warm-up GET requests to article URL, homepage, /updates, and sitemaps', async () => {
      const fetchedUrls: string[] = []
      global.fetch = jest.fn().mockImplementation((url: string) => {
        fetchedUrls.push(url)
        return Promise.resolve({
          ok: true,
          status: 200,
        })
      }) as any

      const results = await warmUpPublishedArticle('test-article-slug-2026')

      expect(results).toHaveLength(5)
      expect(fetchedUrls).toContain('https://www.corplawupdates.in/updates/test-article-slug-2026')
      expect(fetchedUrls).toContain('https://www.corplawupdates.in/')
      expect(fetchedUrls).toContain('https://www.corplawupdates.in/updates')
      expect(fetchedUrls).toContain('https://www.corplawupdates.in/sitemap.xml')
      expect(fetchedUrls).toContain('https://www.corplawupdates.in/news-sitemap.xml')

      expect(results.every(r => r.ok && r.status === 200)).toBe(true)
    })

    it('gracefully handles network or timeout errors without throwing', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection timeout')) as any

      const results = await warmUpUrls(['https://www.corplawupdates.in/updates/timeout-article'])

      expect(results).toHaveLength(1)
      expect(results[0].ok).toBe(false)
      expect(results[0].error).toContain('Connection timeout')
    })
  })
})
