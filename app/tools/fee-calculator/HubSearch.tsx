'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { mcaForms } from '@/data/mca-forms'

export default function HubSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof mcaForms>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      setSelectedIndex(-1)
      return
    }

    const lowerQuery = query.toLowerCase()
    
    const matches = mcaForms.filter(form => {
      // Check formNumber (e.g., "MGT-7")
      if (form.formNumber.toLowerCase().includes(lowerQuery)) return true
      // Check formName (e.g., "Annual Return")
      if (form.formName.toLowerCase().includes(lowerQuery)) return true
      // Check aliases (e.g., "spice", "inc-32")
      if (form.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) return true
      return false
    })

    // Limit to 4 results
    setResults(matches.slice(0, 4))
    setIsOpen(true)
    setSelectedIndex(-1)
  }, [query])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigate = (slug: string) => {
    setIsOpen(false)
    router.push(`/tools/fee-calculator/companies/${slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleNavigate(results[selectedIndex].slug)
      } else if (results.length > 0) {
        // If pressing enter with no specific selection but results exist, pick the first one
        handleNavigate(results[0].slug)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8 z-50" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 text-lg border-2 border-slate-700 bg-slate-900/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg"
          placeholder="Search by form name or number — e.g. MGT-7, SPICe+, Annual Return"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setIsOpen(true) }}
        />
      </div>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((form, index) => (
                <li
                  key={form.slug}
                  onClick={() => handleNavigate(form.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between transition-colors ${
                    selectedIndex === index ? 'bg-blue-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-lg">
                      {form.formNumber}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {form.formName}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                      {form.category.replace('_', ' ')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-2">No matching form found.</p>
              <button 
                onClick={() => {
                  setIsOpen(false)
                  router.push('/tools/fee-calculator/companies')
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                Can't find your form? Use the Company Calculator <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
