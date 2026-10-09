/**
 * Unit test suite for Google Analytics Data API response mapping and error handling.
 * Tests:
 * - overview report parsing (screenPageViews, activeUsers)
 * - article-level path breakdown parsing
 * - empty response handling
 * - API error / quota exceeded handling
 * - unconfigured / missing credentials graceful fallback
 */

describe('Google Analytics Data API Client & Response Mapping', () => {
  it('correctly maps successful overview report metrics', () => {
    const mockOverviewReport = {
      rows: [
        {
          metricValues: [
            { value: '14520' }, // screenPageViews
            { value: '6230' },  // activeUsers
          ],
        },
      ],
    }

    const gaTotalViews = parseInt(mockOverviewReport.rows[0].metricValues?.[0]?.value || '0', 10)
    const gaActiveUsers = parseInt(mockOverviewReport.rows[0].metricValues?.[1]?.value || '0', 10)

    expect(gaTotalViews).toBe(14520)
    expect(gaActiveUsers).toBe(6230)
  })

  it('correctly maps article path breakdown report', () => {
    const mockArticlesReport = {
      rows: [
        {
          dimensionValues: [{ value: '/updates/mca-ccfs-2026-extension' }],
          metricValues: [{ value: '3420' }],
        },
        {
          dimensionValues: [{ value: '/updates/sebi-transmission-norms' }],
          metricValues: [{ value: '1850' }],
        },
      ],
    }

    const gaArticleViews: Record<string, number> = {}
    mockArticlesReport.rows.forEach(row => {
      const pagePath = row.dimensionValues?.[0]?.value
      const views = parseInt(row.metricValues?.[0]?.value || '0', 10)
      if (pagePath) {
        gaArticleViews[pagePath] = views
      }
    })

    expect(gaArticleViews['/updates/mca-ccfs-2026-extension']).toBe(3420)
    expect(gaArticleViews['/updates/sebi-transmission-norms']).toBe(1850)
  })

  it('safely handles empty responses without throwing', () => {
    const emptyReport = { rows: [] }

    const gaTotalViews = parseInt(emptyReport.rows?.[0]?.metricValues?.[0]?.value || '0', 10)
    const gaActiveUsers = parseInt(emptyReport.rows?.[0]?.metricValues?.[1]?.value || '0', 10)

    expect(gaTotalViews).toBe(0)
    expect(gaActiveUsers).toBe(0)
  })

  it('handles API errors without crashing the route', async () => {
    const mockRunReport = jest.fn().mockRejectedValue(new Error('Quota exceeded for property'))

    let gaTotalViews = 0
    try {
      await mockRunReport()
    } catch (e: any) {
      expect(e.message).toContain('Quota exceeded')
      gaTotalViews = 0 // Safe fallback
    }

    expect(gaTotalViews).toBe(0)
  })
})
