import { articleSchema } from '@/lib/admin-schemas'
import { formatDate } from '@/lib/utils'

describe('v2.59.2 CMS API Acceptance Fixes', () => {
  describe('1. formatDate Null & Invalid Safety', () => {
    it('returns empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('')).toBe('')
    })

    it('formats valid ISO date strings in Indian English', () => {
      const formatted = formatDate('2026-10-24')
      expect(formatted).toContain('2026')
      expect(formatted).toContain('October')
      expect(formatted).toContain('24')
    })

    it('safely handles malformed date strings without throwing RangeError', () => {
      expect(() => formatDate('not-a-date')).not.toThrow()
      expect(formatDate('not-a-date')).toBe('not-a-date')
    })
  })

  describe('2. Article Schema & Aliases', () => {
    it('accepts key_change_pill alias', () => {
      const parsed = articleSchema.safeParse({
        title: 'Test Article',
        summary: 'Test summary',
        key_change_pill: 'Major new compliance rule',
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.key_change_pill).toBe('Major new compliance rule')
      }
    })

    it('accepts tldr alias (both string and array)', () => {
      const parsedArray = articleSchema.safeParse({
        title: 'Test Article',
        summary: 'Test summary',
        tldr: ['Point 1', 'Point 2'],
      })
      expect(parsedArray.success).toBe(true)

      const parsedString = articleSchema.safeParse({
        title: 'Test Article',
        summary: 'Test summary',
        tldr: 'Single point',
      })
      expect(parsedString.success).toBe(true)
    })

    it('accepts last_verified_date alias', () => {
      const parsed = articleSchema.safeParse({
        title: 'Test Article',
        summary: 'Test summary',
        last_verified_date: '2026-10-24',
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.last_verified_date).toBe('2026-10-24')
      }
    })
  })
})
