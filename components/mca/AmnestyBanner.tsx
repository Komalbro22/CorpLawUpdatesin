// src/components/mca/AmnestyBanner.tsx
'use client'

import { AlertTriangle } from 'lucide-react'

interface AmnestyBannerProps {
  isActive: boolean
  onToggle: () => void
}

export function AmnestyBanner({ isActive, onToggle }: AmnestyBannerProps) {
  return (
    <div className="p-5 bg-brand-slate-blue border border-white/10 rounded-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
      {/* Visual background indicator */}
      <div className="absolute inset-0 bg-gradient-to-r from-status-warning/5 to-transparent pointer-events-none" />

      <div className="flex items-start gap-3.5 relative z-10">
        <div className="p-2 bg-status-warning/10 border border-status-warning/20 rounded-badge mt-0.5">
          <AlertTriangle className="h-5 w-5 text-status-warning animate-pulse" />
        </div>
        <div>
          <span className="text-xs font-bold text-white block uppercase tracking-wider">
            MCA Amnesty / CFSS Scheme Waiver Simulation
          </span>
          <p className="text-xs text-brand-muted leading-relaxed mt-1">
            Simulate if the Ministry of Corporate Affairs (MCA) has announced an active penalty waiver scheme. When simulated, daily additional late filing fees are completely waived.
          </p>
        </div>
      </div>
      
      <button
        onClick={onToggle}
        className={`px-5 py-2.5 text-xs font-bold rounded-badge border transition-all shrink-0 relative z-10 ${
          isActive 
            ? 'bg-status-warning text-brand-navy border-status-warning shadow-md shadow-status-warning/10 hover:bg-status-warning/90'
            : 'bg-brand-navy/60 text-status-warning border-status-warning/25 hover:bg-brand-navy'
        }`}
      >
        {isActive ? 'Amnesty Active (Waiver On)' : 'Amnesty Off (Standard Slabs)'}
      </button>
    </div>
  )
}
