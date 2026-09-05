'use client'

import React from 'react'

export interface GazetteLedgerRailProps {
  category?: string
  sectionRef?: string
  isMandatory?: boolean
  className?: string
}

const regulatorColors: Record<string, { rail: string; bg: string; text: string; border: string }> = {
  MCA:    { rail: 'bg-blue-600 dark:bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/40',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800/50' },
  SEBI:   { rail: 'bg-emerald-600 dark:bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/50' },
  RBI:    { rail: 'bg-violet-600 dark:bg-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950/40',  text: 'text-violet-700 dark:text-violet-300',  border: 'border-violet-200 dark:border-violet-800/50' },
  NCLT:   { rail: 'bg-orange-600 dark:bg-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950/40',  text: 'text-orange-700 dark:text-orange-300',  border: 'border-orange-200 dark:border-orange-800/50' },
  IBC:    { rail: 'bg-red-600 dark:bg-red-500',     bg: 'bg-red-50 dark:bg-red-950/40',     text: 'text-red-700 dark:text-red-300',     border: 'border-red-200 dark:border-red-800/50' },
  FEMA:   { rail: 'bg-teal-600 dark:bg-teal-500',    bg: 'bg-teal-50 dark:bg-teal-950/40',    text: 'text-teal-700 dark:text-teal-300',    border: 'border-teal-200 dark:border-teal-800/50' },
  CCI:    { rail: 'bg-indigo-600 dark:bg-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-950/40',  text: 'text-indigo-700 dark:text-indigo-300',  border: 'border-indigo-200 dark:border-indigo-800/50' },
  LABOUR: { rail: 'bg-amber-600 dark:bg-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/40',  text: 'text-amber-800 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-800/50' },
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
    <div className={`flex flex-wrap items-center justify-between w-full mb-3 gap-2 ${className}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Signature 4px vertical Gazette rail */}
        <span className={`w-1 h-5 rounded-full ${theme.rail} shrink-0`} aria-hidden />

        {/* Monospaced Section / Circular Reference Tag */}
        {sectionRef ? (
          <span className="font-mono text-xs font-semibold tracking-tight text-slate-700 dark:text-slate-300 break-words line-clamp-1 sm:line-clamp-none">
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
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50">
          <span className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" aria-hidden />
          Mandatory
        </span>
      )}
    </div>
  )
}

export default GazetteLedgerRail
