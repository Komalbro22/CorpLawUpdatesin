'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Building2, ArrowRight } from 'lucide-react'
import CompanyStatusBadge from './CompanyStatusBadge'

interface CompanySearchResult {
  cin: string
  company_name: string
  company_status: string | null
  registered_state: string | null
  paid_up_capital: number | null
}

interface CompanySearchBarProps {
  placeholder?: string
  autoFocus?: boolean
  size?: 'large' | 'compact'
}

export default function CompanySearchBar({
  placeholder = 'Search by CIN (e.g. L21091MH1945PLC004520) or Company Name...',
  autoFocus = false,
  size = 'large'
}: CompanySearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CompanySearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/company/search?q=${encodeURIComponent(query.trim())}&limit=8`)
        const data = await res.json()
        setResults(data.results || [])
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (err) {
        console.error('Company search fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (cin: string) => {
    setIsOpen(false)
    router.push(`/company/${encodeURIComponent(cin)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].cin)
      } else if (query.trim().length === 21) {
        handleSelect(query.trim().toUpperCase())
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const isLarge = size === 'large'

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      <div className={`relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg focus-within:border-gold dark:focus-within:border-amber-400 transition-all ${isLarge ? 'p-2 md:p-3' : 'p-1.5'}`}>
        <Search className={`text-slate-400 ml-3 shrink-0 ${isLarge ? 'w-6 h-6' : 'w-4 h-4'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-transparent px-3 text-navy dark:text-white font-medium focus:outline-none placeholder:text-slate-400 ${isLarge ? 'text-base md:text-lg' : 'text-sm'}`}
        />
        {isLoading && <Loader2 className="w-5 h-5 text-amber-500 animate-spin mr-3 shrink-0" />}
        {!isLoading && query.trim() && (
          <button
            onClick={() => handleSelect(query.trim().toUpperCase())}
            className={`bg-amber-400 hover:bg-amber-500 text-navy font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 ${isLarge ? 'px-5 py-2.5 text-sm md:text-base' : 'px-3 py-1.5 text-xs'}`}
          >
            Lookup <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((item, idx) => (
                <div
                  key={item.cin}
                  onClick={() => handleSelect(item.cin)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-3 ${idx === selectedIndex ? 'bg-amber-50/60 dark:bg-amber-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Building2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-navy dark:text-white text-sm md:text-base truncate">
                        {item.company_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        CIN: {item.cin} {item.registered_state ? `• ${item.registered_state}` : ''}
                      </p>
                    </div>
                  </div>
                  <CompanyStatusBadge status={item.company_status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
              <p className="font-medium text-navy dark:text-white mb-1">No cached record found for "{query}"</p>
              <p className="text-xs text-slate-400">If you enter a valid 21-character CIN, press Enter to fetch live from MCA public records.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
