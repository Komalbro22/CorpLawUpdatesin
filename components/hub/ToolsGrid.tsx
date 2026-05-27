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

      {/* Premium Glass-Capsule Category Filters (Celestial Workspace Style) */}
      <div className="flex flex-wrap gap-3 pb-2 select-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={`relative px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
            !activeCategory
              ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30 shadow-[0_2px_15px_rgba(201,168,76,0.12)]'
              : 'bg-white/[0.01] text-slate-400 border-white/[0.03] hover:bg-white/[0.03] hover:text-white hover:border-white/[0.08]'
          }`}
        >
          All Systems
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`relative px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
              activeCategory === cat
                ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30 shadow-[0_2px_15px_rgba(201,168,76,0.12)]'
                : 'bg-white/[0.01] text-slate-400 border-white/[0.03] hover:bg-white/[0.03] hover:text-white hover:border-white/[0.08]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Content with Smooth Framer Motion Animations */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="text-center py-20 bg-white/[0.01] border border-white/[0.03] rounded-card backdrop-blur-md relative overflow-hidden"
          >
            {/* Soft accent background orb for empty state */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <p className="text-white font-serif font-semibold text-xl">No matching systems found</p>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto font-light leading-relaxed">
                We couldn't find active matches for "{query}". Try checking your spelling or searching broader tags like "AOC-4", "interest", "deed", or "resolution".
              </p>
              <button
                onClick={() => { setQuery(''); setActiveCategory(null) }}
                className="mt-6 px-5 py-2.5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold/20 transition-all rounded-md text-[10px] font-bold uppercase tracking-widest"
              >
                Reset Search Filters
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((tool, i) => (
                <motion.div
                  key={tool.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26, delay: i * 0.03 }}
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
