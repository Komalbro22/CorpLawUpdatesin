'use client'

import { useState, useMemo } from 'react'
import UpdateCard from '@/components/UpdateCard'
import { UpdateListItem } from '@/types'
import { BookOpen, Filter } from 'lucide-react'

interface GuidesClientProps {
  initialGuides: (UpdateListItem & { last_verified?: string | null })[]
}

export default function GuidesClient({ initialGuides }: GuidesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // Extract unique categories from guides
  const categories = useMemo(() => {
    const set = new Set<string>()
    initialGuides.forEach(g => {
      if (g.category && typeof g.category === 'string') {
        set.add(g.category.toUpperCase())
      }
    })
    return Array.from(set).sort()
  }, [initialGuides])

  // Filtered guides based on selected category
  const filteredGuides = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return initialGuides
    }
    return initialGuides.filter(g => g.category?.toUpperCase() === selectedCategory)
  }, [initialGuides, selectedCategory])

  return (
    <div className="space-y-8">
      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-200/70 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">
            <Filter className="size-3.5" aria-hidden="true" />
            <span>Filter by:</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-navy text-white dark:bg-amber-500 dark:text-navy shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({initialGuides.length})
          </button>

          {categories.map(cat => {
            const count = initialGuides.filter(g => g.category?.toUpperCase() === cat).length
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-navy text-white dark:bg-amber-500 dark:text-navy shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Guides Grid */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredGuides.map((guide, idx) => (
            <div key={guide.id || guide.slug} className="flex">
              <UpdateCard
                update={guide}
                priority={idx < 3}
                animationDelay={idx * 50}
                showLastVerified={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <BookOpen className="size-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-heading text-lg font-bold text-navy dark:text-white mb-1">
            No guides found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There are currently no evergreen guides in the {selectedCategory} category.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className="mt-4 px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-slate-800 dark:bg-amber-500 dark:text-navy dark:hover:bg-amber-400 transition-colors"
          >
            View all guides
          </button>
        </div>
      )}
    </div>
  )
}
