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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-navy dark:text-white flex items-center gap-3">
            <BookmarkIcon className="h-8 w-8 text-gold" />
            Saved Articles
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Articles you have bookmarked for later reading. Saved locally in your browser.
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <BookmarkIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-navy dark:text-white mb-2">No saved articles</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              You haven't saved any articles yet. Read an article and click the 'Save' button to add it here.
            </p>
            <Link 
              href="/updates"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.slug} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <Link href={`/updates/${bookmark.slug}`} className="block focus:outline-none">
                        <p className="text-sm font-bold text-navy dark:text-white hover:text-gold truncate">
                          {bookmark.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Saved on {new Date(bookmark.savedAt).toLocaleDateString()}
                        </p>
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={() => handleRemove(bookmark.slug)}
                        className="inline-flex items-center p-2 border border-transparent rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-5 w-5" />
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
