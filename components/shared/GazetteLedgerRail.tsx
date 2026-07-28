'use client'

import React from 'react'

export interface GazetteLedgerRailProps {
  category?: string
  sectionRef?: string
  isMandatory?: boolean
  className?: string
}

const regulatorColors: Record<string, { rail: string; bg: string; text: string; border: string }> = {
  MCA:  { rail: 'bg-blue-600',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  SEBI: { rail: 'bg-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  RBI:  { rail: 'bg-violet-600',  bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  NCLT: { rail: 'bg-orange-600',  bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  IBC:  { rail: 'bg-red-600',     bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  FEMA: { rail: 'bg-teal-600',    bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
}

export function GazetteLedgerRail({
  category = 'MCA',
  sectionRef,
  isMandatory = false,
  className = '',
}: GazetteLedgerRailProps) {
  const upperCat = (category || 'MCA').toUpperCase()
  const theme = regulatorColors[upperCat] || regulatorColors.MCA

  return (
    <div className={`flex items-center justify-between w-full mb-3 gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Signature 4px vertical Gazette rail */}
        <span className={`w-1 h-5 rounded-full ${theme.rail} shrink-0`} aria-hidden />

        {/* Monospaced Section / Circular Reference Tag */}
        {sectionRef ? (
          <span className="font-mono text-xs font-semibold tracking-tight text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
            {sectionRef}
          </span>
        ) : (
          <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded ${theme.bg} ${theme.text} border ${theme.border}`}>
            {upperCat}
          </span>
        )}
      </div>

      {/* Compliance Impact Indicator */}
      {isMandatory && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" aria-hidden />
          Mandatory
        </span>
      )}
    </div>
  )
}

export default GazetteLedgerRail
