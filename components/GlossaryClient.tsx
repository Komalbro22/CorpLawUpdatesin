'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

type GlossaryTerm = {
  id: string
  term: string
  slug: string
  definition: string
  category: string
}

export default function GlossaryClient({ terms }: { terms: GlossaryTerm[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')

  const categories = ['ALL', 'MCA', 'SEBI', 'IBC', 'RBI', 'FEMA', 'NCLT']

  // Filter terms based on search input & category
  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.definition.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'ALL' || t.category.toUpperCase() === activeCategory
    return matchesSearch && matchesCategory
  })

  // Group by first letter
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const letter = term.term.charAt(0).toUpperCase()
    if (!acc[letter]) {
      acc[letter] = []
    }
    acc[letter].push(term)
    return acc
  }, {} as Record<string, GlossaryTerm[]>)

  // Get sorted keys (A-Z)
  const letters = Object.keys(groupedTerms).sort()

  // Full alphabet for the navigation bar
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-shadow shadow-sm text-base"
          placeholder="Search for a legal term or definition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center border-b border-slate-100 pb-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-navy border border-slate-200/50'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* A-Z Navigation (only show when not searching aggressively) */}
      {!search && (
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {alphabet.map((letter) => {
            const hasTerms = groupedTerms[letter]?.length > 0
            return hasTerms ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-navy font-bold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors shadow-sm"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-300 font-medium cursor-not-allowed"
              >
                {letter}
              </span>
            )
          })}
        </div>
      )}

      {/* Terms List */}
      <div className="space-y-12">
        {letters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No legal terms found matching &quot;{search}&quot;</p>
          </div>
        ) : (
          letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-heading font-bold text-navy">{letter}</h2>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedTerms[letter]
                  .sort((a, b) => a.term.localeCompare(b.term))
                  .map((t) => (
                  <Link 
                    key={t.id} 
                    href={`/glossary/${t.slug}`}
                    className="block group bg-white rounded-xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-card transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-navy text-lg group-hover:text-amber-700 transition-colors">
                        {t.term}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                      {t.definition}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
