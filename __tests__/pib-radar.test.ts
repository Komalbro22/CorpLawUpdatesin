import { fetchPib } from '../lib/regulator-radar/sources'
import { runRegulatorRadar } from '../lib/regulator-radar'
import { RegulatorKey } from '../lib/regulator-radar/types'

describe('PIB (Press Information Bureau) Regulator Radar Integration', () => {
  it('includes PIB in runRegulatorRadar sources and task lists', async () => {
    const res = await runRegulatorRadar(72, ['PIB'])
    expect(res).toBeDefined()
    expect(res.sources.some(s => s.regulator === 'PIB')).toBe(true)
  })

  it('correctly maps PIB ministry releases to corporate law categories', async () => {
    // Test live or graceful fetchPib with timeout fallback
    const items = await fetchPib(72)
    expect(Array.isArray(items)).toBe(true)

    // If items were scraped from live PIB portal, verify structure
    if (items.length > 0) {
      const first = items[0]
      expect(first.regulator).toBe('PIB')
      expect(first.regulatorLabel).toMatch(/^PIB \(/)
      expect(['MCA', 'FEMA', 'RBI', 'LABOUR', 'NCLT', 'CCI']).toContain(first.category)
      expect(first.sourceUrl).toMatch(/^https:\/\/www\.pib\.gov\.in\//)
      expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(first.id).toMatch(/^pib_\d+_.+/)
    }
  })
})
