export interface Bookmark {
  slug: string
  title: string
  url: string
  savedAt: string
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('article_bookmarks')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveBookmark(bookmark: Omit<Bookmark, 'savedAt'>) {
  const bookmarks = getBookmarks()
  if (!bookmarks.some(b => b.slug === bookmark.slug)) {
    bookmarks.unshift({ ...bookmark, savedAt: new Date().toISOString() })
    localStorage.setItem('article_bookmarks', JSON.stringify(bookmarks))
  }
}

export function removeBookmark(slug: string) {
  const bookmarks = getBookmarks().filter(b => b.slug !== slug)
  localStorage.setItem('article_bookmarks', JSON.stringify(bookmarks))
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().some(b => b.slug === slug)
}
