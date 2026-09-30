import {
  buildDividendResolutionText,
  SAMPLE_DIVIDEND_RESOLUTION_DATA,
} from '@/lib/doc-generator/dividend-resolution-text'
import {
  buildDividendResolutionDocx,
  buildDividendResolutionPdf,
} from '@/lib/doc-generator/dividend-resolution-generator'

describe('Dividend Declaration Board Resolution Generator', () => {
  describe('1. Final Dividend Draft Wording', () => {
    test('Generates AGM recommendation wording pursuant to Section 123', () => {
      const lines = buildDividendResolutionText(SAMPLE_DIVIDEND_RESOLUTION_DATA)
      const fullText = lines.join('\n')

      expect(fullText).toContain('CERTIFIED TRUE COPY OF THE RESOLUTION')
      expect(fullText).toContain('ACME TECHNOLOGIES LIMITED')
      expect(fullText).toContain('subject to approval of the members at the ensuing Annual General Meeting')
      expect(fullText).toContain('a final dividend of Rs. 2.50 per fully paid-up equity share')
      expect(fullText).toContain('face value Rs. 10 each')
      expect(fullText).toContain('aggregating approximately to Rs. 25,00,000')
      expect(fullText).toContain('RESOLVED FURTHER THAT the Board recommends that the members, at the ensuing Annual General Meeting, declare the aforesaid dividend')
    })
  })

  describe('2. Interim Dividend Draft Wording', () => {
    test('Generates Section 123(3) declaration wording and 5-day bank deposit clause', () => {
      const lines = buildDividendResolutionText({
        ...SAMPLE_DIVIDEND_RESOLUTION_DATA,
        resolutionType: 'interim',
      })
      const fullText = lines.join('\n')

      expect(fullText).toContain('pursuant to section 123(3) and other applicable provisions')
      expect(fullText).toContain('an interim dividend of Rs. 2.50 per fully paid-up equity share')
      expect(fullText).toContain('be and is hereby declared for the financial year 2025–26')
      expect(fullText).toContain('deposited in a separate bank account with HDFC Bank Limited within the period prescribed under section 123(4)')
      expect(fullText).toContain('paid within the period prescribed under section 127')
    })
  })

  describe('3. Fallback Handling for Empty Fields', () => {
    test('Provides sensible placeholders when inputs are blank', () => {
      const lines = buildDividendResolutionText({ resolutionType: 'final' })
      const fullText = lines.join('\n')

      expect(fullText).toContain('[NAME OF THE COMPANY]')
      expect(fullText).toContain('[AMOUNT]')
      expect(fullText).toContain('[FACE VALUE]')
      expect(fullText).toContain('[FINANCIAL YEAR]')
    })
  })

  describe('4. Binary Export Builders', () => {
    test('buildDividendResolutionDocx produces a valid docx buffer', async () => {
      const buffer = await buildDividendResolutionDocx(SAMPLE_DIVIDEND_RESOLUTION_DATA)
      expect(buffer).toBeDefined()
      expect(buffer.length).toBeGreaterThan(1000)
    })

    test('buildDividendResolutionPdf produces a valid PDF byte array', async () => {
      const bytes = await buildDividendResolutionPdf(SAMPLE_DIVIDEND_RESOLUTION_DATA)
      expect(bytes).toBeDefined()
      expect(bytes.length).toBeGreaterThan(1000)
    })
  })
})
