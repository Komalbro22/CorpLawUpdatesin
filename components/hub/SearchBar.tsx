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
    <div className="relative w-full group">
      {/* Background ambient neon glow behind the input bar on hover/focus */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 to-indigo-500/5 blur-md rounded-card opacity-0 group-focus-within:opacity-100 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex items-center">
        {/* Animated Search Icon */}
        <Search className="absolute left-4.5 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-gold group-focus-within:scale-105 transition-all duration-300 pointer-events-none" />
        
        <input
          type="search"
          placeholder='Search compliance tools... e.g. "board resolution", "AOC-4", "delayed interest"'
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-12.5 pr-28 py-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] rounded-card text-white placeholder:text-slate-400/60 focus:outline-none focus:bg-slate-950/40 focus:border-brand-gold/30 focus:ring-4 focus:ring-brand-gold/5 transition-all duration-350 font-sans text-sm backdrop-blur-md shadow-inner"
        />

        {/* High-Tech Match Counter Badge */}
        {value && (
          <span className="absolute right-4.5 text-[10px] font-bold text-brand-gold bg-brand-gold/8 border border-brand-gold/20 px-2.5 py-1 rounded-md tracking-wider uppercase animate-fade-in shadow-[0_2px_10px_rgba(201,168,76,0.1)]">
            {resultsCount} {resultsCount === 1 ? 'Match' : 'Matches'}
          </span>
        )}
      </div>
    </div>
  )
}
