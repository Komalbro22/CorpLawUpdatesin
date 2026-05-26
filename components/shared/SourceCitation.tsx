// src/components/shared/SourceCitation.tsx
'use client'

import { Info } from 'lucide-react'

interface SourceCitationProps {
  basis: string
  notes?: string
}

export function SourceCitation({ basis, notes }: SourceCitationProps) {
  return (
    <div className="bg-brand-navy/40 border border-white/5 rounded-badge p-4 text-white font-sans text-[10px]">
      <h5 className="font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
        <Info className="w-3.5 h-3.5 text-brand-muted" />
        Statutory Citation Reference
      </h5>
      <p className="text-brand-muted leading-relaxed">
        <strong className="text-white">Rule Basis:</strong> {basis}
      </p>
      {notes && (
        <p className="text-brand-gold leading-relaxed mt-1 italic">
          <strong>Notes:</strong> {notes}
        </p>
      )}
    </div>
  )
}
