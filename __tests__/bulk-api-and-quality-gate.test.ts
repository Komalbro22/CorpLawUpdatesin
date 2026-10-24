import { NextRequest } from 'next/server'
import {
  getWordCount,
  parseGlossaryMetadata,
  getGlossaryTotalWordCount,
  evaluateArticleIndexQuality,
  evaluateGlossaryIndexQuality,
  QUALITY_GATE_WORD_COUNT,
} from '@/lib/content-quality'
import { glossarySchema, articleSchema } from '@/lib/admin-schemas'
import { POST as bulkGlossaryPost } from '@/app/api/admin/glossary/bulk/route'
import { POST as bulkArticlesPost } from '@/app/api/admin/articles/bulk/route'
import { supabaseAdmin } from '@/lib/supabase-server'
import * as apiKeyAuth from '@/lib/api-key-auth'

// Mock supabaseAdmin
jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

// Mock revalidation & indexing
jest.mock('@/lib/content-revalidation', () => ({
  revalidateArticleMutation: jest.fn(),
  revalidateGlossaryMutation: jest.fn(),
}))

jest.mock('@/lib/indexnow', () => ({
  submitToIndexNow: jest.fn().mockResolvedValue(true),
  submitArticleToIndexNow: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/google-indexing', () => ({
  submitUrlsToGoogleIndexing: jest.fn().mockResolvedValue({ success: 1, failed: 0, submitted: [], errors: [] }),
  submitArticleToGoogleIndexing: jest.fn().mockResolvedValue({ success: true }),
}))

describe('800-Word Content Quality Gate & Bulk APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(apiKeyAuth, 'verifyAdminOrKey').mockResolvedValue({
      success: true,
      auth: {
        type: 'api_key',
        key: { id: 'k1', name: 'Muse AI', scopes: ['articles:write', 'glossary:write'] } as any,
      },
    })
    jest.spyOn(apiKeyAuth, 'logApiAudit').mockResolvedValue(undefined as any)
  })

  describe('1. Word Count & Quality Evaluation Logic', () => {
    it('correctly calculates word count and strips HTML/markdown', () => {
      expect(getWordCount(null)).toBe(0)
      expect(getWordCount('')).toBe(0)
      expect(getWordCount('<p>One two three</p>')).toBe(3)
      expect(getWordCount('## Heading with **five** total words')).toBe(5)
    })

    it('assigns noindex: true to thin articles (< 800 words) when not explicitly overridden', () => {
      const shortText = new Array(300).fill('compliance').join(' ')
      const quality = evaluateArticleIndexQuality(shortText)
      expect(quality.isThinContent).toBe(true)
      expect(quality.noindex).toBe(true)
      expect(quality.wordCount).toBe(300)
      expect(quality.qualityNote).toContain('below 800 words')
    })

    it('assigns noindex: false to comprehensive articles (>= 800 words)', () => {
      const longText = new Array(850).fill('statutory').join(' ')
      const quality = evaluateArticleIndexQuality(longText)
      expect(quality.isThinContent).toBe(false)
      expect(quality.noindex).toBe(false)
      expect(quality.wordCount).toBe(850)
      expect(quality.qualityNote).toBeUndefined()
    })

    it('respects explicit author override for noindex', () => {
      const shortText = 'Only short notice of 5 words.'
      const quality = evaluateArticleIndexQuality(shortText, false)
      expect(quality.isThinContent).toBe(true)
      expect(quality.noindex).toBe(false) // Forced indexable
    })

    it('evaluates glossary total word count across definition, extended_note, and FAQs', () => {
      const def = 'A brief definition of twenty words about corporate law compliance and statutory filings under Companies Act 2013 and ROC regulations.'
      const noteBody = new Array(700).fill('provisions').join(' ')
      const extendedNote = `<!-- METADATA\n{"seo_title": "Test Title"}\nMETADATA -->\n\n${noteBody}`
      const faqs = [
        { q: new Array(50).fill('question').join(' '), a: new Array(50).fill('answer').join(' ') },
      ]

      const totalWords = getGlossaryTotalWordCount({
        definition: def,
        extended_note: extendedNote,
        faqs,
      })

      // 20 + 700 + 100 = 820 words >= 800 words
      expect(totalWords).toBeGreaterThanOrEqual(QUALITY_GATE_WORD_COUNT)

      const quality = evaluateGlossaryIndexQuality({
        definition: def,
        extended_note: extendedNote,
        faqs,
      })
      expect(quality.noindex).toBe(false)
      expect(quality.isThinContent).toBe(false)
    })

    it('marks thin glossary entries (< 800 words) with noindex: true', () => {
      const quality = evaluateGlossaryIndexQuality({
        definition: 'Short definition only.',
        extended_note: 'A small paragraph of 10 words.',
        faqs: [],
      })
      expect(quality.noindex).toBe(true)
      expect(quality.isThinContent).toBe(true)
    })
  })

  describe('2. POST /api/admin/glossary/bulk', () => {
    it('rejects payloads with missing or non-array terms', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/glossary/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const res = await bulkGlossaryPost(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects payloads exceeding the 100-item batch limit', async () => {
      const terms = new Array(101).fill({ term: 'T', definition: 'D' })
      const req = new NextRequest('http://localhost:3000/api/admin/glossary/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms }),
      })

      const res = await bulkGlossaryPost(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error.code).toBe('BATCH_LIMIT_EXCEEDED')
    })

    it('successfully processes a batch of glossary terms and applies 800-word quality flags', async () => {
      // Mock existing slugs query (none exist)
      const mockSelect = jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [] }),
      })
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            { id: '1', slug: 'short-term', term: 'Short Term' },
            { id: '2', slug: 'comprehensive-term', term: 'Comprehensive Term' },
          ],
          error: null,
        }),
      })

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'glossary') {
          return {
            select: mockSelect,
            insert: mockInsert,
          }
        }
        return {}
      })

      const shortBody = 'Brief definition under 800 words.'
      const longBody = new Array(820).fill('statutory').join(' ')

      const req = new NextRequest('http://localhost:3000/api/admin/glossary/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terms: [
            {
              term: 'Short Term',
              definition: 'Short',
              extended_note: shortBody,
            },
            {
              term: 'Comprehensive Term',
              definition: 'Comprehensive',
              extended_note: longBody,
            },
          ],
        }),
      })

      const res = await bulkGlossaryPost(req)
      expect(res.status).toBe(200)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.total).toBe(2)
      expect(data.succeeded).toBe(2)
      expect(data.results[0].status).toBe('created')
      expect(data.results[0].is_indexed).toBe(false) // < 800 words -> not indexed
      expect(data.results[1].status).toBe('created')
      expect(data.results[1].is_indexed).toBe(true) // >= 800 words -> indexed
    })

    it('handles duplicate slugs with on_conflict: "skip"', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [{ id: 'existing-id', slug: 'existing-slug' }],
        }),
      })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        insert: jest.fn(),
      })

      const req = new NextRequest('http://localhost:3000/api/admin/glossary/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terms: [{ term: 'Existing Term', slug: 'existing-slug', definition: 'Def' }],
          on_conflict: 'skip',
        }),
      })

      const res = await bulkGlossaryPost(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.skipped).toBe(1)
      expect(data.results[0].status).toBe('skipped')
    })
  })

  describe('3. POST /api/admin/articles/bulk', () => {
    it('rejects payloads exceeding the 50-article batch limit', async () => {
      const articles = new Array(51).fill({ title: 'A', summary: 'S' })
      const req = new NextRequest('http://localhost:3000/api/admin/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles }),
      })

      const res = await bulkArticlesPost(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error.code).toBe('BATCH_LIMIT_EXCEEDED')
    })

    it('rejects articles with unrecognized fields', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: [
            {
              title: 'Test Article',
              summary: 'Summary',
              invalid_field_123: true,
            },
          ],
        }),
      })

      const res = await bulkArticlesPost(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.failed).toBe(1)
      expect(data.results[0].status).toBe('error')
      expect(data.results[0].error).toContain('Unrecognized field')
    })

    it('normalizes field aliases and applies 800-word quality gate on bulk articles', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [] }),
      })
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            { id: 'art-1', slug: 'short-circular', title: 'Short Circular' },
            { id: 'art-2', slug: 'long-circular', title: 'Long Circular' },
          ],
          error: null,
        }),
      })

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      })

      const longContent = new Array(850).fill('circular').join(' ')

      const req = new NextRequest('http://localhost:3000/api/admin/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: [
            {
              title: 'Short Circular',
              summary: 'Short summary',
              content: '<p>Only 10 words in this circular update.</p>',
              category: 'MCA',
              key_change_pill: 'New deadline',
              tldr: ['Point 1'],
              last_verified_date: '2026-10-24',
              published_at: '2026-10-24T10:00:00Z',
            },
            {
              title: 'Long Circular',
              summary: 'Comprehensive summary',
              content: `<p>${longContent}</p>`,
              category: 'SEBI',
              published_at: '2026-10-24T10:00:00Z',
            },
          ],
        }),
      })

      const res = await bulkArticlesPost(req)
      expect(res.status).toBe(200)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.succeeded).toBe(2)
      // Short article gets noindex: true
      expect(data.results[0].noindex).toBe(true)
      expect(data.results[0].is_indexed).toBe(false)
      // Long article gets noindex: false and is_indexed: true
      expect(data.results[1].noindex).toBe(false)
      expect(data.results[1].is_indexed).toBe(true)
    })
  })
})
