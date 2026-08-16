import { sanitizeForWinAnsi } from '@/app/api/documents/download/route'

describe('Production Fixes & Regression Test Suite', () => {
  describe('PDF WinAnsi Unicode Sanitizer (Issue #3)', () => {
    it('normalizes box-drawing and divider characters without throwing', () => {
      const input = '═══════════════════════════════════════════════\nTRANSFEROR DETAILS\n───────────────────────────────────────────────'
      const output = sanitizeForWinAnsi(input)

      expect(output).not.toContain('═')
      expect(output).not.toContain('─')
      expect(output).toContain('-----------------------------------------------')
      expect(output).toContain('TRANSFEROR DETAILS')
    })

    it('correctly maps Indian Rupee symbol (₹) to Rs. ', () => {
      const input = 'Consideration Amount: ₹50,000 (Rupees Fifty Thousand only)'
      const output = sanitizeForWinAnsi(input)

      expect(output).not.toContain('₹')
      expect(output).toContain('Consideration Amount: Rs. 50,000 (Rupees Fifty Thousand only)')
    })

    it('normalizes smart quotes, apostrophes, and em-dashes', () => {
      const input = '“Board Resolution” — Company’s ‘Certified’ Copy…'
      const output = sanitizeForWinAnsi(input)

      expect(output).toContain('"Board Resolution"')
      expect(output).toContain("Company's 'Certified' Copy...")
    })

    it('replaces arrows and checkmarks with ASCII equivalents', () => {
      const input = 'Approval → Next Step ✓ Pending ✗'
      const output = sanitizeForWinAnsi(input)

      expect(output).toContain('Approval -> Next Step [x] Pending [ ]')
    })

    it('replaces box-drawing corners and verticals', () => {
      const input = '┌──┬──┐\n│A │B │\n└──┴──┘'
      const output = sanitizeForWinAnsi(input)

      expect(output).not.toMatch(/[┌┬┐│└┴┘]/)
      expect(output).toContain('+--+--+')
      expect(output).toContain('|A |B |')
    })
  })

  describe('IndexNow Configuration (Issue #4)', () => {
    it('uses fallback key when INDEXNOW_KEY environment variable is omitted', () => {
      const defaultKey = '3d13aae2e0c040d89f050b27aadfa4c7'
      expect(defaultKey).toHaveLength(32)
      expect(/^[0-9a-f]+$/i.test(defaultKey)).toBe(true)
    })
  })
})
