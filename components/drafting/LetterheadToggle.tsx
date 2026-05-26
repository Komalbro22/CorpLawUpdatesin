// src/components/drafting/LetterheadToggle.tsx
'use client'

interface LetterheadToggleProps {
  letterheadMode: 'digital' | 'preprinted' | 'none'
  setLetterheadMode: (mode: 'digital' | 'preprinted' | 'none') => void
  isStampPaper: boolean
  setIsStampPaper: (val: boolean) => void
}

export function LetterheadToggle({
  letterheadMode,
  setLetterheadMode,
  isStampPaper,
  setIsStampPaper
}: LetterheadToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-brand-slate-blue border border-white/10 p-3 rounded-card text-white shadow-sm">
      
      {/* 1. Spacing Mode Selection Group */}
      <div className="flex items-center gap-1 bg-brand-navy border border-white/5 p-1 rounded-badge">
        <button
          onClick={() => setLetterheadMode('digital')}
          className={`px-3 py-1.5 text-xs font-bold rounded-badge transition-all ${
            letterheadMode === 'digital' 
              ? 'bg-brand-gold text-brand-navy shadow-sm' 
              : 'text-brand-muted hover:text-white'
          }`}
        >
          Digital Header
        </button>
        <button
          onClick={() => setLetterheadMode('preprinted')}
          className={`px-3 py-1.5 text-xs font-bold rounded-badge transition-all ${
            letterheadMode === 'preprinted' 
              ? 'bg-brand-gold text-brand-navy shadow-sm' 
              : 'text-brand-muted hover:text-white'
          }`}
        >
          Pre-Printed Paper
        </button>
        <button
          onClick={() => setLetterheadMode('none')}
          className={`px-3 py-1.5 text-xs font-bold rounded-badge transition-all ${
            letterheadMode === 'none' 
              ? 'bg-brand-gold text-brand-navy shadow-sm' 
              : 'text-brand-muted hover:text-white'
          }`}
        >
          Blank Page
        </button>
      </div>

      {/* 2. Stamp Paper Spacing Toggle */}
      <button
        onClick={() => setIsStampPaper(!isStampPaper)}
        className={`px-4 py-2.5 text-xs font-bold rounded-badge border transition-all ${
          isStampPaper 
            ? 'bg-brand-gold border-brand-gold text-brand-navy shadow-lg shadow-brand-gold/10'
            : 'bg-brand-navy/60 border-white/10 text-brand-muted hover:bg-brand-navy'
        }`}
      >
        {isStampPaper ? 'Stamp Paper Spacing (5-Inch Active)' : 'Standard Margins'}
      </button>

    </div>
  )
}
