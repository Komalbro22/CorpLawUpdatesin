'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark as BookmarkIcon, Trash2 } from 'lucide-react'
import { getBookmarks, removeBookmark, Bookmark } from '@/lib/bookmarks'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    setBookmarks(getBookmarks())
  }, [])

  const handleRemove = (slug: string) => {
    removeBookmark(slug)
    setBookmarks(getBookmarks())
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-navy dark:text-white flex items-center gap-3">
            <BookmarkIcon className="size-8 text-amber-600 dark:text-gold" aria-hidden="true" />
            Saved Articles
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-pretty">
            Articles you have bookmarked for later reading. Saved locally in your browser.
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <BookmarkIcon className="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-bold text-navy dark:text-white mb-2">No saved articles</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              You haven't saved any articles yet. Read an article and click the 'Save' button to add it here.
            </p>
            <Link 
              href="/updates"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg shadow-sm text-sm font-semibold text-white bg-navy hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.slug} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/updates/${bookmark.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md">
                        <p className="text-sm font-bold text-navy dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate">
                          {bookmark.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                          Saved on {new Date(bookmark.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={() => handleRemove(bookmark.slug)}
                        className="inline-flex items-center p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
                        aria-label={`Remove "${bookmark.title}" from saved articles`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
