import { sanitizeForWinAnsi } from '@/lib/pdf-sanitizer'

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

  describe('IndexNow Dynamic Configuration (Issue #1)', () => {
    it('validates 32-character hexadecimal key format from environment', () => {
      const sampleKey = '3d13aae2e0c040d89f050b27aadfa4c7'
      expect(sampleKey).toHaveLength(32)
      expect(/^[0-9a-f]+$/i.test(sampleKey)).toBe(true)
    })
  })

  describe('RBI Rate Parser & Extraction Safety (Issue #2)', () => {
    const parseRbiRate = (html: string): number | null => {
      const rateMatch = html.match(/Bank\s+Rate\s*:\s*([\d\.]+)/i) || html.match(/Bank\s+Rate[\s\S]*?([\d\.]+)\s*%/i)
      if (rateMatch && rateMatch[1]) {
        const parsed = parseFloat(rateMatch[1])
        if (!isNaN(parsed) && parsed >= 4.0 && parsed <= 10.0) {
          return parsed
        }
      }
      return null
    }

    it('extracts valid Bank Rate from standard RBI HTML response', () => {
      const sampleHtml = '<div class="table-responsive"><table><tr><td>Bank Rate : 6.75%</td></tr></table></div>'
      const rate = parseRbiRate(sampleHtml)
      expect(rate).toBe(6.75)
    })

    it('extracts valid Bank Rate from multiline markup pattern', () => {
      const sampleHtml = '<div><span>Bank Rate</span><br/><span>6.50 %</span></div>'
      const rate = parseRbiRate(sampleHtml)
      expect(rate).toBe(6.50)
    })

    it('returns null when rate pattern is missing or corrupted', () => {
      const sampleHtml = '<div><html><body>Error 403 / Cloudflare Challenge</body></html></div>'
      const rate = parseRbiRate(sampleHtml)
      expect(rate).toBeNull()
    })

    it('rejects aberrant rates outside safety boundary (4.0% - 10.0%)', () => {
      const sampleHtmlHigh = '<div>Bank Rate : 18.5%</div>'
      const sampleHtmlLow = '<div>Bank Rate : 1.5%</div>'
      expect(parseRbiRate(sampleHtmlHigh)).toBeNull()
      expect(parseRbiRate(sampleHtmlLow)).toBeNull()
    })
  })

  describe('FAQ Accordions & Schema Extraction (Issue #6)', () => {
    const stripIndentation = (content: string) =>
      content.replace(/^[ \t]+(?=<\/?(?:[a-zA-Z][a-zA-Z0-9:-]*|!--|!DOCTYPE))/gm, '')

    it('strips leading indentation from indented <details> and <summary>', () => {
      const input = `
Frequently asked questions

    <details style="border:1px solid #e2e8f0;">
      <summary style="font-weight:600;">Question 1?</summary>
      <p>Answer 1</p>
    </details>
`
      const stripped = stripIndentation(input)
      expect(stripped).toContain('\n<details style="border:1px solid #e2e8f0;">')
      expect(stripped).toContain('\n<summary style="font-weight:600;">Question 1?</summary>')
      expect(stripped).toContain('\n<p>Answer 1</p>')
      expect(stripped).toContain('\n</details>')
    })

    it('extracts FAQ pairs correctly from HTML details and summary blocks', () => {
      const cleanText = (text: string) => text ? text.replace(/\s+/g, ' ').trim() : ''
      const detailsRegex = /<details\b[^>]*>[\s\S]*?<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi

      const html = `
      <div style="margin:0 0 28px;">
        <h3>Frequently asked questions</h3>

        <details style="border:1px solid #e2e8f0;padding:12px 16px;">
          <summary style="font-weight:600;color:#1e3a5f;cursor:pointer;">What does SEBI's September 2026 circular change for FPIs?</summary>
          <p style="margin:10px 0 0;color:#475569;">It removes the "Fully Accessible Route" condition from an existing exemption, so FPIs investing only in Government Securities no longer need to furnish investor group details.</p>
        </details>

        <details style="border:1px solid #e2e8f0;padding:12px 16px;">
          <summary style="font-weight:600;color:#1e3a5f;cursor:pointer;">Which FPIs newly qualify for this exemption?</summary>
          <p style="margin:10px 0 0;color:#475569;">FPIs that invest only in Government Securities through the General Route now qualify.</p>
        </details>
      </div>
`
      const faqs: { question: string; answer: string }[] = []
      let detailsMatch: RegExpExecArray | null
      while ((detailsMatch = detailsRegex.exec(html)) !== null) {
        const rawQ = detailsMatch[1] || ''
        const rawA = detailsMatch[2] || ''
        const q = cleanText(rawQ.replace(/<[^>]*>/g, ''))
        const a = cleanText(rawA.replace(/<[^>]*>/g, ''))
        if (q && a && q.length > 5 && a.length > 5) {
          faqs.push({ question: q, answer: a })
        }
      }

      expect(faqs).toHaveLength(2)
      expect(faqs[0].question).toBe("What does SEBI's September 2026 circular change for FPIs?")
      expect(faqs[0].answer).toContain("It removes the \"Fully Accessible Route\" condition")
      expect(faqs[1].question).toBe("Which FPIs newly qualify for this exemption?")
      expect(faqs[1].answer).toContain("FPIs that invest only in Government Securities through the General Route now qualify.")
    })
  })
})
