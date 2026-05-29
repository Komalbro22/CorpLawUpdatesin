'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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
    mca: 'bg-blue-100 text-blue-700  ',
    sebi: 'bg-green-100 text-green-700  ',
    rbi: 'bg-purple-100 text-purple-700  ',
    nclt: 'bg-orange-100 text-orange-700  ',
    ibc: 'bg-red-100 text-red-700  ',
    fema: 'bg-teal-100 text-teal-700  ',
    income_tax: 'bg-amber-100 text-amber-700  ',
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
      { value: 'income_tax', label: 'Income Tax' },
    ]

    if (activeType === 'articles') {
      return allOptions.filter(o => ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema'].includes(o.value))
    }
    if (activeType === 'calendar') {
      return allOptions.filter(o => ['mca', 'sebi', 'rbi', 'fema', 'income_tax'].includes(o.value))
    }
    if (activeType === 'glossary') {
      return allOptions.filter(o => ['mca', 'sebi', 'rbi', 'ibc', 'fema'].includes(o.value))
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
        className="flex items-center gap-2 
                   text-sm text-slate-400 
                   bg-slate-100 hover:bg-slate-200  
                   border border-slate-200 
                   rounded-xl px-3 py-2
                   transition-colors"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" 
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
                        bg-white  
                        border border-slate-200  
                        rounded px-1.5 py-0.5 
                        font-mono text-slate-500 ">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {open && (
        <div className="fixed inset-0 z-50 
                        bg-black/40 
                        flex items-start 
                        justify-center pt-20 
                        px-4">
          <div className="bg-white  rounded-2xl 
                          shadow-2xl w-full 
                          max-w-2xl 
                          overflow-hidden animate-fade-in
                          border border-transparent ">
            
            {/* Search input */}
            <div className="flex items-center 
                            gap-3 px-4 py-3 
                            border-b border-slate-200 ">
              <svg className="w-5 h-5 text-slate-400 
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
                className="flex-1 text-navy  text-base bg-transparent
                           outline-none placeholder-slate-400 "
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
                className="text-slate-400 
                           hover:text-slate-600 
                           text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 py-2 
                            border-b border-slate-100 
                            bg-slate-50 
                            overflow-x-auto">
              {/* Type filter */}
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value)}
                className="text-xs border border-slate-200 
                           rounded-lg px-2 py-1 
                           bg-white  text-slate-600 
                           focus:outline-none 
                           focus:ring-1 
                           focus:ring-amber-400"
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
                className="text-xs border border-slate-200 
                           rounded-lg px-2 py-1 
                           bg-white  text-slate-600 
                           focus:outline-none 
                           focus:ring-1 
                           focus:ring-amber-400"
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
                  <strong className="text-slate-600 font-semibold">
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
                                 hover:bg-slate-50 
                                 transition-colors 
                                 border-b border-slate-50 
                                 last:border-0 text-left"
                    >
                      {/* Type icon */}
                      <span className="text-lg 
                                       flex-shrink-0 
                                       mt-0.5">
                        {result.type === 'article' 
                          ? '📄' : result.type === 'calendar' ? '📅' : '📖'}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <p className="text-sm font-semibold 
                                      text-navy 
                                      line-clamp-1">
                          {result.title}
                        </p>

                        {/* Summary or due date */}
                        {result.summary && (
                          <p className="text-xs 
                                        text-slate-500 
                                        mt-0.5 
                                        line-clamp-1">
                            {result.summary}
                          </p>
                        )}
                        {result.due_date && (
                          <p className="text-xs 
                                        text-amber-600 
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
                            ] || 'bg-slate-100 text-slate-600  '}`}>
                            {result.category}
                          </span>
                          {result.type === 'calendar' && (
                            <span className="text-[10px] px-1.5 
                                             py-0.5 rounded-full 
                                             bg-blue-50 
                                             text-blue-600 
                                             font-medium">
                              Calendar
                            </span>
                          )}
                          {result.type === 'glossary' && (
                            <span className="text-[10px] px-1.5 
                                             py-0.5 rounded-full 
                                             bg-emerald-50 
                                             text-emerald-600 
                                             font-medium">
                              Glossary
                            </span>
                          )}
                          {result.impact && (
                            <span className={`text-[10px] px-1.5 
                              py-0.5 rounded-full font-medium
                              ${result.impact === 'High Impact'
                                ? 'bg-red-50 text-red-600  '
                                : result.impact === 'Medium Impact'
                                ? 'bg-amber-50 text-amber-600  '
                                : 'bg-green-50 text-green-600  '}`}>
                              {result.impact.replace(' Impact', '')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="text-slate-300 
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
                            border-slate-100 
                            bg-slate-50 
                            flex justify-between 
                            items-center">
              <p className="text-xs text-slate-400">
                Press{' '}
                <kbd className="bg-white  border 
                                border-slate-200  rounded 
                                px-1 font-mono text-xs text-slate-500 ">
                  ESC
                </kbd>
                {' '}to close
              </p>
              {results.length > 0 && (
                <p className="text-xs text-slate-400">
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
