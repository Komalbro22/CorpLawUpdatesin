'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const RECENT_SEARCHES_KEY = 'cluin-recent-searches'
const MAX_RECENT = 5

interface SearchResult {
  type: 'article' | 'calendar' | 'glossary'
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
  const [isMac, setIsMac] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent))
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) setRecentSearches(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => inputRef.current?.focus(), 50)

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => {
      document.body.style.overflow = ''
      clearTimeout(timer)
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [open])

  function saveRecentSearch(q: string) {
    const trimmed = q.trim()
    if (trimmed.length < 2) return
    const next = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT)
    setRecentSearches(next)
    try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  function handleResultClick() {
    if (query.length >= 2) saveRecentSearch(query)
    setOpen(false)
    setQuery('')
  }

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
    mca: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40',
    sebi: 'bg-green-100 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
    rbi: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40',
    nclt: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40',
    ibc: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/40',
    fema: 'bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40',
    cci: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40',
    labour: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
    income_tax: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
  }

  // Get categories options dynamically based on search type
  const getCategoriesForType = (activeType: string) => {
    const allOptions = [
      { value: 'mca', label: 'MCA' },
      { value: 'sebi', label: 'SEBI' },
      { value: 'rbi', label: 'RBI' },
      { value: 'nclt', label: 'NCLT' },
      { value: 'ibc', label: 'IBC' },
      { value: 'fema', label: 'FEMA' },
      { value: 'cci', label: 'CCI' },
      { value: 'labour', label: 'Labour Law' },
      { value: 'income_tax', label: 'Income Tax' },
    ]

    if (activeType === 'articles') {
      return allOptions.filter(o => ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema', 'cci', 'labour'].includes(o.value))
    }
    if (activeType === 'calendar') {
      return allOptions.filter(o => ['mca', 'sebi', 'rbi', 'fema', 'cci', 'labour', 'income_tax'].includes(o.value))
    }
    if (activeType === 'glossary') {
      return allOptions.filter(o => ['mca', 'sebi', 'rbi', 'ibc', 'fema', 'cci', 'labour'].includes(o.value))
    }
    return allOptions
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    const allowed = getCategoriesForType(newType).map(o => o.value)
    if (category && !allowed.includes(category)) {
      setCategory('')
    }
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
        aria-label="Open search"
        aria-haspopup="dialog"
        className="flex min-h-[44px] items-center gap-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700/90 border border-slate-200/90 dark:border-slate-700/90 rounded-xl px-3 py-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <svg className="size-3.5 text-slate-400 dark:text-slate-400" aria-hidden="true" fill="none" 
             viewBox="0 0 24 24" 
             stroke="currentColor">
          <path strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden md:block text-slate-600 dark:text-slate-300 font-medium">
          Search...
        </span>
        <kbd className="hidden md:flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500 font-semibold shadow-xs">
          <span>{isMac ? '⌘' : 'Ctrl'}</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Search modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-3 sm:pt-20 px-3 sm:px-4"
          role="presentation"
          onClick={() => { setOpen(false); setQuery('') }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <svg className="size-5 text-slate-400 flex-shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search articles, compliance deadlines..."
                className="flex-1 text-navy dark:text-white text-base bg-transparent outline-none placeholder-slate-400 dark:placeholder-slate-500"
                autoComplete="off"
              />
              {loading && (
                <div className="size-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                }}
                aria-label="Close search"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto">
              {/* Type filter */}
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value)}
                aria-label="Filter by type"
                className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">All Types</option>
                <option value="articles">Articles</option>
                <option value="calendar">Calendar</option>
                <option value="glossary">Glossary</option>
              </select>

              {/* Category filter */}
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="">All Categories</option>
                {getCategoriesForType(type).map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length < 2 && (
                <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Type at least 2 characters to search...
                  {recentSearches.length > 0 && (
                    <div className="mt-6 text-left">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Recent searches</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {recentSearches.map(term => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-xs">
                    Search across articles, compliance deadlines and more
                  </div>
                </div>
              )}

              {query.length >= 2 && 
               !loading && 
               results.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
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
                      onClick={handleResultClick}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 text-left"
                    >
                      {/* Type icon */}
                      <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden>
                        {result.type === 'article' 
                          ? '📄' : result.type === 'calendar' ? '📅' : '📖'}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <p className="text-sm font-semibold text-navy dark:text-white line-clamp-1">
                          {result.title}
                        </p>

                        {/* Summary or due date */}
                        {result.summary && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {result.summary}
                          </p>
                        )}
                        {result.due_date && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                            Due: {result.due_date}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${categoryColors[result.category.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            {result.category}
                          </span>
                          {result.type === 'calendar' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
                              Calendar
                            </span>
                          )}
                          {result.type === 'glossary' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
                              Glossary
                            </span>
                          )}
                          {result.impact && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${result.impact === 'High Impact' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' : result.impact === 'Medium Impact' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'}`}>
                              {result.impact.replace(' Impact', '')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-1" aria-hidden>
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Press{' '}
                <kbd className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 font-mono text-xs text-slate-500 dark:text-slate-400">
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
