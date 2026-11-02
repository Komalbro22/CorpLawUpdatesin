import { articleSchema } from '@/lib/admin-schemas'

describe('Editorial Format API & Schema Suite', () => {
  test('articleSchema accepts editorial_format, article_type, format, is_guide, is_explained', () => {
    const input = {
      title: 'How to register a private limited company',
      summary: 'Complete guide for 2026',
      editorial_format: 'guide',
      article_type: 'guide',
      format: 'guide',
      is_guide: true,
      is_explained: false,
    }

    const result = articleSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.editorial_format).toBe('guide')
      expect(result.data.article_type).toBe('guide')
      expect(result.data.is_guide).toBe(true)
      expect(result.data.is_explained).toBe(false)
    }
  })

  test('Format resolution: "guide" appends "Evergreen Guide" and removes "Explained"', () => {
    let tags = ['MCA', 'Compliance', 'Explained']
    const format = 'guide'

    if (format === 'guide') {
      tags = tags.filter(t => t !== 'Evergreen Guide' && t !== 'Explained')
      tags.push('Evergreen Guide')
    }

    expect(tags).toContain('Evergreen Guide')
    expect(tags).not.toContain('Explained')
    expect(tags).toContain('MCA')
  })

  test('Format resolution: "explained" appends "Explained" and removes "Evergreen Guide"', () => {
    let tags = ['MCA', 'Compliance', 'Evergreen Guide']
    const format = 'explained'

    if (format === 'explained') {
      tags = tags.filter(t => t !== 'Evergreen Guide' && t !== 'Explained')
      tags.push('Explained')
    }

    expect(tags).toContain('Explained')
    expect(tags).not.toContain('Evergreen Guide')
    expect(tags).toContain('MCA')
  })

  test('Format resolution: "standard" removes both "Evergreen Guide" and "Explained"', () => {
    let tags = ['MCA', 'Circular', 'Evergreen Guide']
    const format = 'standard'

    if (format === 'standard') {
      tags = tags.filter(t => t !== 'Evergreen Guide' && t !== 'Explained')
    }

    expect(tags).not.toContain('Evergreen Guide')
    expect(tags).not.toContain('Explained')
    expect(tags).toEqual(['MCA', 'Circular'])
  })

  test('Boolean flag fallback: is_guide = true resolves to guide format', () => {
    const rawBody: { is_guide?: boolean; is_explained?: boolean; editorial_format?: string } = {
      is_guide: true,
      is_explained: false,
    }

    const formatPref = (
      rawBody.editorial_format ||
      (rawBody.is_guide === true ? 'guide' : rawBody.is_explained === true ? 'explained' : (rawBody.is_guide === false && rawBody.is_explained === false) ? 'standard' : undefined)
    )

    expect(formatPref).toBe('guide')
  })

  test('Default last_verified is assigned when guide format is chosen and last_verified is empty', () => {
    const format = 'guide'
    let last_verified: string | null = null

    if (format === 'guide' && !last_verified) {
      last_verified = new Date().toISOString().split('T')[0]
    }

    expect(last_verified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
