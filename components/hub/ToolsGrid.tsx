// src/components/hub/ToolsGrid.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchBar } from './SearchBar'
import { ToolCard } from './ToolCard'
import type { Tool } from '@/config/tools.config'

interface ToolsGridProps {
  tools: Tool[]
  categories: readonly string[]
}

export function ToolsGrid({ tools, categories }: ToolsGridProps) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Normalize search logical parsing: ALL search words must match anywhere inside metadata
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const words = q ? q.split(/\s+/) : []

    return tools.filter(tool => {
      // Category filter match
      if (activeCategory && tool.category !== activeCategory) return false

      // Logical Multi-word match
      if (!words.length) return true
      const corpus = [
        tool.title,
        tool.subtitle,
        tool.description,
        tool.category,
        ...(tool.tags || [])
      ].join(' ').toLowerCase()

      return words.every(word => corpus.includes(word))
    })
  }, [tools, query, activeCategory])

  return (
    <div className="space-y-8">
      {/* High-Fidelity Client-Side Search Engine */}
      <SearchBar
        value={query}
        onChange={setQuery}
        resultsCount={filtered.length}
      />

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2.5 pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
            !activeCategory
              ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-md'
              : 'bg-brand-slate-blue/50 text-brand-muted border-white/5 hover:bg-brand-slate-blue hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              activeCategory === cat
                ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-md'
                : 'bg-brand-slate-blue/50 text-brand-muted border-white/5 hover:bg-brand-slate-blue hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Zero results state */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 bg-brand-slate-blue/30 border border-white/5 rounded-card"
          >
            <p className="text-white font-serif font-semibold text-lg mb-2">No matching tools found</p>
            <p className="text-brand-muted text-sm max-w-sm mx-auto">
              We couldn't find matches for "{query}". Try checking your spelling or searching simpler tags like "AOC-4", "interest", or "resolution".
            </p>
            <button
              onClick={() => { setQuery(''); setActiveCategory(null) }}
              className="mt-6 px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold/25 transition-colors rounded-badge text-xs font-bold uppercase tracking-wider"
            >
              Reset Search & Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filtered.map((tool, i) => (
                <motion.div
                  key={tool.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
