import { GUIDE_LIST_COLUMNS } from '@/lib/supabase-queries'
import { revalidateArticleMutation } from '@/lib/content-revalidation'
import * as nextCache from 'next/cache'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

describe('Guides Hub and Badges Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GUIDE_LIST_COLUMNS includes last_verified, slug, tags, and hide_from_listings', () => {
    expect(GUIDE_LIST_COLUMNS).toContain('last_verified')
    expect(GUIDE_LIST_COLUMNS).toContain('slug')
    expect(GUIDE_LIST_COLUMNS).toContain('tags')
    expect(GUIDE_LIST_COLUMNS).toContain('hide_from_listings')
    expect(GUIDE_LIST_COLUMNS).toContain('featured_image_url')
  })

  test('revalidateArticleMutation revalidates /guides route', () => {
    revalidateArticleMutation({
      slug: 'mca21-v3-login-guide',
      category: 'MCA',
    })

    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/guides')
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/guides', 'page')
  })

  test('Badge precedence: Evergreen Guide takes precedence over Explained', () => {
    const tags = ['Evergreen Guide', 'Explained', 'MCA']
    const isEvergreenGuide = tags.includes('Evergreen Guide')
    const isExplained = tags.includes('Explained')

    let autoBadgeType: 'guide' | 'explained' | null = null
    if (isEvergreenGuide) {
      autoBadgeType = 'guide'
    } else if (isExplained) {
      autoBadgeType = 'explained'
    }

    expect(autoBadgeType).toBe('guide')
  })

  test('Badge selection: Explained article shows explained badge', () => {
    const tags = ['Explained', 'SEBI']
    const isEvergreenGuide = tags.includes('Evergreen Guide')
    const isExplained = tags.includes('Explained')

    let autoBadgeType: 'guide' | 'explained' | null = null
    if (isEvergreenGuide) {
      autoBadgeType = 'guide'
    } else if (isExplained) {
      autoBadgeType = 'explained'
    }

    expect(autoBadgeType).toBe('explained')
  })

  test('Badge selection: Untagged article shows no badge', () => {
    const tags = ['Circular', 'MCA', 'Notification']
    const isEvergreenGuide = tags.includes('Evergreen Guide')
    const isExplained = tags.includes('Explained')

    let autoBadgeType: 'guide' | 'explained' | null = null
    if (isEvergreenGuide) {
      autoBadgeType = 'guide'
    } else if (isExplained) {
      autoBadgeType = 'explained'
    }

    expect(autoBadgeType).toBeNull()
  })

  test('Double-rendering guard suppresses duplicate badge if body already has the text', () => {
    const content = '<p>Some intro</p><div>EVERGREEN GUIDE — A complete step-by-step guide</div>'
    const tags = ['Evergreen Guide']
    const isEvergreenGuide = tags.includes('Evergreen Guide')
    const hasGuideBadgeInBody = content.includes('EVERGREEN GUIDE')

    let autoBadgeType: 'guide' | 'explained' | null = null
    if (isEvergreenGuide && !hasGuideBadgeInBody) {
      autoBadgeType = 'guide'
    }

    expect(autoBadgeType).toBeNull()
  })
})
