// src/components/hub/SearchBar.tsx
'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  resultsCount: number
}

export function SearchBar({ value, onChange, resultsCount }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
      <input
        type="search"
        placeholder='Search compliance tools... e.g. "board resolution", "AOC-4", "delayed interest"'
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-12 pr-20 py-4 bg-brand-slate-blue border border-white/10 rounded-card text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition-all font-sans"
      />
      {value && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gold bg-brand-gold/10 px-2 py-1 rounded-badge border border-brand-gold/20">
          {resultsCount} matched
        </span>
      )}
    </div>
  )
}
