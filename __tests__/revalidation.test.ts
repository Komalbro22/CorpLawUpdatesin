import { revalidateArticleMutation } from '../lib/content-revalidation'
import { revalidatePath, revalidateTag } from 'next/cache'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

describe('revalidateArticleMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('revalidates homepage under literal path, page, and layout', () => {
    revalidateArticleMutation({ slug: 'new-sebi-circular' })

    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('revalidates /updates under literal path, page, and layout', () => {
    revalidateArticleMutation({ slug: 'new-sebi-circular' })

    expect(revalidatePath).toHaveBeenCalledWith('/updates')
    expect(revalidatePath).toHaveBeenCalledWith('/updates', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/updates', 'layout')
  })

  it('revalidates article path and category paths with and without page type', () => {
    revalidateArticleMutation({
      slug: 'new-sebi-circular',
      category: 'SEBI',
      oldSlug: 'old-sebi-circular',
      oldCategory: 'MCA',
    })

    expect(revalidatePath).toHaveBeenCalledWith('/updates/new-sebi-circular')
    expect(revalidatePath).toHaveBeenCalledWith('/updates/new-sebi-circular', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/updates/old-sebi-circular')
    expect(revalidatePath).toHaveBeenCalledWith('/updates/old-sebi-circular', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/category/sebi')
    expect(revalidatePath).toHaveBeenCalledWith('/category/sebi', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/category/mca')
    expect(revalidatePath).toHaveBeenCalledWith('/category/mca', 'page')
  })

  it('invalidates cache tags for updates and listings', () => {
    revalidateArticleMutation({ slug: 'test-slug', category: 'RBI' })

    expect(revalidateTag).toHaveBeenCalledWith('updates')
    expect(revalidateTag).toHaveBeenCalledWith('list:home')
    expect(revalidateTag).toHaveBeenCalledWith('list:updates')
    expect(revalidateTag).toHaveBeenCalledWith('article:test-slug')
    expect(revalidateTag).toHaveBeenCalledWith('list:category:rbi')
  })
})
