import {
  getColorBrightness,
  isBorderAmberOrGold,
  parseStyle,
  processInlineStyles,
} from '@/lib/inline-style-processor'

describe('Dark Mode Inline Style Adaptation', () => {
  describe('getColorBrightness', () => {
    it('accurately identifies light and dark colors', () => {
      // Light background colors (> 175)
      expect(getColorBrightness('#f4f6fb')!).toBeGreaterThan(175)
      expect(getColorBrightness('#ffffff')!).toBe(255)
      expect(getColorBrightness('#fff')!).toBe(255)
      expect(getColorBrightness('white')!).toBe(255)
      expect(getColorBrightness('#f9f7ec')!).toBeGreaterThan(175)
      expect(getColorBrightness('#f7f3e3')!).toBeGreaterThan(175)
      expect(getColorBrightness('#eef1f8')!).toBeGreaterThan(175)
      expect(getColorBrightness('#eef6ee')!).toBeGreaterThan(175)

      // Dark colors (< 110)
      expect(getColorBrightness('#1a2a5e')!).toBeLessThan(110)
      expect(getColorBrightness('#0f172a')!).toBeLessThan(110)
      expect(getColorBrightness('#0b2c4a')!).toBeLessThan(110)
      expect(getColorBrightness('#145a32')!).toBeLessThan(110)
      expect(getColorBrightness('#000000')!).toBe(0)
    })
  })

  describe('isBorderAmberOrGold', () => {
    it('detects amber, yellow, and gold borders', () => {
      expect(isBorderAmberOrGold('4px solid #c9a227')).toBe(true)
      expect(isBorderAmberOrGold('1px solid #f59e0b')).toBe(true)
      expect(isBorderAmberOrGold('2px solid gold')).toBe(true)
      expect(isBorderAmberOrGold('1px solid #3b82f6')).toBe(false)
    })
  })

  describe('processInlineStyles', () => {
    it('adapts IFSCA Quick Answer callout card with #f4f6fb and #c9a227 amber border to dynamic-card-amber', () => {
      const rawStyle = 'background:#f4f6fb;border-left:4px solid #c9a227;padding:16px 18px;border-radius:6px;margin:20px 0;'
      const parsed = parseStyle(rawStyle)
      const { processedStyle, processedClassName } = processInlineStyles(parsed, '', true)

      // Must be classified as dynamic-card-amber
      expect(processedClassName).toContain('dynamic-card-amber')

      // Hardcoded light background must be deleted so dark theme styles can take effect
      expect(processedStyle.background).toBeUndefined()
      expect(processedStyle.backgroundColor).toBeUndefined()
      expect(processedStyle.border).toBeUndefined()
      expect(processedStyle.borderColor).toBeUndefined()
    })

    it('adapts soft blue-gray background without colored border to dynamic-box-blue', () => {
      const rawStyle = 'background:#f4f6fb;padding:16px;margin:20px 0;'
      const parsed = parseStyle(rawStyle)
      const { processedStyle, processedClassName } = processInlineStyles(parsed, '', true)

      expect(processedClassName).toContain('dynamic-box-blue')
      expect(processedStyle.background).toBeUndefined()
      expect(processedStyle.backgroundColor).toBeUndefined()
    })

    it('adapts neutral light background without colored border to dynamic-box-neutral', () => {
      const rawStyle = 'background:#f1f5f9;padding:16px;margin:20px 0;'
      const parsed = parseStyle(rawStyle)
      const { processedStyle, processedClassName } = processInlineStyles(parsed, '', true)

      expect(processedClassName).toContain('dynamic-box-neutral')
      expect(processedStyle.background).toBeUndefined()
      expect(processedStyle.backgroundColor).toBeUndefined()
    })

    it('adapts table element with light background to clean slate background', () => {
      const rawStyle = 'background:#f4f6fb;padding:8px;'
      const parsed = parseStyle(rawStyle)
      const { processedStyle, processedClassName } = processInlineStyles(parsed, '', false, true)

      expect(processedClassName).toContain('bg-slate-50 dark:bg-slate-900/60')
      expect(processedStyle.background).toBeUndefined()
    })

    it('adapts dark text color to dynamic-text-adaptive for dark mode readability', () => {
      const rawStyle = 'color:#1a2a5e;'
      const parsed = parseStyle(rawStyle)
      const { processedStyle, processedClassName } = processInlineStyles(parsed)

      expect(processedClassName).toContain('dynamic-text-adaptive')
      expect(processedStyle.color).toBeUndefined()
    })
  })
})
