'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface SearchResult {
  type: 'article' | 'calendar'
  id: string
  title: string
  slug?: string
  summary?: string
  category: string
  date?: string
  impact?: string
  due_date?: string
  url: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [type, setType] = useState('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => 
      document.removeEventListener('keydown', handleKey)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => 
      document.removeEventListener(
        'mousedown', handleClick
      )
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: query,
          type,
          ...(category ? { category } : {}),
        })
        const res = await fetch(
          `/api/search?${params}`
        )
        const data = await res.json()
        setResults(data.results || [])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, category, type])

  const categoryColors: Record<string, string> = {
    mca: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    sebi: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rbi: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    nclt: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    ibc: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    fema: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    income_tax: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div ref={containerRef} className="relative">
      
      {/* Search trigger button */}
      <button
        onClick={() => {
          setOpen(true)
          setTimeout(() => 
            inputRef.current?.focus(), 100
          )
        }}
        className="flex items-center gap-2 
                   text-sm text-slate-400 dark:text-slate-400
                   bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800
                   border border-slate-200 dark:border-slate-800
                   rounded-xl px-3 py-2
                   transition-colors"
      >
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" 
             viewBox="0 0 24 24" 
             stroke="currentColor">
          <path strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden md:block">
          Search...
        </span>
        <kbd className="hidden md:block text-xs 
                        bg-white dark:bg-slate-950 
                        border border-slate-200 dark:border-slate-800 
                        rounded px-1.5 py-0.5 
                        font-mono text-slate-500 dark:text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {open && (
        <div className="fixed inset-0 z-50 
                        bg-black/40 dark:bg-black/60
                        flex items-start 
                        justify-center pt-20 
                        px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl 
                          shadow-2xl w-full 
                          max-w-2xl 
                          overflow-hidden animate-fade-in
                          border border-transparent dark:border-slate-800">
            
            {/* Search input */}
            <div className="flex items-center 
                            gap-3 px-4 py-3 
                            border-b border-slate-200 dark:border-slate-800">
              <svg className="w-5 h-5 text-slate-400 dark:text-slate-500
                              flex-shrink-0" 
                   fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search articles, compliance deadlines..."
                className="flex-1 text-navy dark:text-slate-100 text-base bg-transparent
                           outline-none placeholder-slate-400 dark:placeholder-slate-500"
                autoComplete="off"
              />
              {loading && (
                <div className="w-4 h-4 border-2 
                                border-amber-400 
                                border-t-transparent 
                                rounded-full animate-spin" />
              )}
              <button
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                }}
                className="text-slate-400 dark:text-slate-500
                           hover:text-slate-600 dark:hover:text-slate-300
                           text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 py-2 
                            border-b border-slate-100 dark:border-slate-800/80
                            bg-slate-50 dark:bg-slate-950/40
                            overflow-x-auto">
              {/* Type filter */}
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-800
                           rounded-lg px-2 py-1 
                           bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300
                           focus:outline-none 
                           focus:ring-1 
                           focus:ring-amber-400"
              >
                <option value="all">All Types</option>
                <option value="articles">Articles</option>
                <option value="calendar">Calendar</option>
              </select>

              {/* Category filter */}
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-800
                           rounded-lg px-2 py-1 
                           bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300
                           focus:outline-none 
                           focus:ring-1 
                           focus:ring-amber-400"
              >
                <option value="">All Categories</option>
                <option value="mca">MCA</option>
                <option value="sebi">SEBI</option>
                <option value="rbi">RBI</option>
                <option value="nclt">NCLT</option>
                <option value="ibc">IBC</option>
                <option value="fema">FEMA</option>
                <option value="income_tax">Income Tax</option>
              </select>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length < 2 && (
                <div className="px-4 py-8 
                                text-center 
                                text-slate-400 text-sm">
                  Type at least 2 characters to search...
                  <div className="mt-3 text-xs">
                    Search across articles, 
                    compliance deadlines and more
                  </div>
                </div>
              )}

              {query.length >= 2 && 
               !loading && 
               results.length === 0 && (
                <div className="px-4 py-8 
                                text-center 
                                text-slate-400 text-sm">
                  No results found for{' '}
                  <strong className="text-slate-600 dark:text-slate-300 font-semibold">
                    &quot;{query}&quot;
                  </strong>
                </div>
              )}

              {results.length > 0 && (
                <div className="py-2">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.url}
                      onClick={() => {
                        setOpen(false)
                        setQuery('')
                      }}
                      className="flex items-start gap-3 
                                 px-4 py-3 
                                 hover:bg-slate-50 dark:hover:bg-slate-950
                                 transition-colors 
                                 border-b border-slate-50 dark:border-slate-800/50
                                 last:border-0 text-left"
                    >
                      {/* Type icon */}
                      <span className="text-lg 
                                       flex-shrink-0 
                                       mt-0.5">
                        {result.type === 'article' 
                          ? '📄' : '📅'}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <p className="text-sm font-semibold 
                                      text-navy dark:text-slate-200
                                      line-clamp-1">
                          {result.title}
                        </p>

                        {/* Summary or due date */}
                        {result.summary && (
                          <p className="text-xs 
                                        text-slate-500 dark:text-slate-400
                                        mt-0.5 
                                        line-clamp-1">
                            {result.summary}
                          </p>
                        )}
                        {result.due_date && (
                          <p className="text-xs 
                                        text-amber-600 dark:text-amber-400
                                        mt-0.5 
                                        font-medium">
                            Due: {result.due_date}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 
                            py-0.5 rounded-full font-medium 
                            uppercase
                            ${categoryColors[
                              result.category.toLowerCase()
                            ] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {result.category}
                          </span>
                          {result.type === 'calendar' && (
                            <span className="text-[10px] px-1.5 
                                             py-0.5 rounded-full 
                                             bg-blue-50 dark:bg-blue-950/30
                                             text-blue-600 dark:text-blue-400
                                             font-medium">
                              Calendar
                            </span>
                          )}
                          {result.impact && (
                            <span className={`text-[10px] px-1.5 
                              py-0.5 rounded-full font-medium
                              ${result.impact === 'High Impact'
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                                : result.impact === 'Medium Impact'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                                : 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'}`}>
                              {result.impact.replace(' Impact', '')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="text-slate-300 dark:text-slate-600
                                       flex-shrink-0 mt-1">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t 
                            border-slate-100 dark:border-slate-800
                            bg-slate-50 dark:bg-slate-950/60
                            flex justify-between 
                            items-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Press{' '}
                <kbd className="bg-white dark:bg-slate-900 border 
                                border-slate-200 dark:border-slate-800 rounded 
                                px-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                  ESC
                </kbd>
                {' '}to close
              </p>
              {results.length > 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {results.length} result
                  {results.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
