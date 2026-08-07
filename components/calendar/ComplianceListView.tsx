'use client'

import React from 'react'
import { ComplianceEntry } from './types'
import { EntryBadges, googleCalendarUrl, icsDownloadUrl } from './ComplianceHelpers'

interface TableSectionProps {
  title: string
  color: string
  dot: string
  headers: string[]
  rows: React.ReactNode[][]
  entryIds?: string[]
  entryNames?: string[]
  rowDates?: string[]
  rowIds?: string[]
  onReport?: (id: string, name: string) => void
  onRowClick?: (id: string) => void
}

export function TableSection({
  title,
  color,
  dot,
  headers,
  rows,
  entryIds,
  entryNames,
  rowDates,
  rowIds,
  onReport,
  onRowClick,
}: TableSectionProps) {
  const displayHeaders = onReport ? ['Done', ...headers, ''] : ['Done', ...headers]

  return (
    <section>
      <h2 className="text-2xl font-heading font-bold text-navy dark:text-white mb-4 flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${dot} inline-block`} />
        {title}
      </h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className={color}>
              {displayHeaders.map((h, idx) => (
                <th key={idx} className="text-left px-4 py-3 font-semibold text-white">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const dateStr = rowDates?.[i] || ''
              let rowBg = i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'
              
              const entryId   = entryIds?.[i] || ''
              const entryName = entryNames?.[i] || ''
              
              let urgencyBorder = 'border-l-4 border-slate-300'
              if (dateStr) {
                try {
                  const d = new Date(dateStr)
                  if (isNaN(d.getTime())) {
                    const p = new Date(dateStr.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'))
                    if (!isNaN(p.getTime())) {
                      const diff = p.getTime() - new Date().getTime()
                      const days = diff / (1000 * 3600 * 24)
                      if (days < 0) urgencyBorder = 'border-l-4 border-red-500'
                      else if (days <= 7) urgencyBorder = 'border-l-4 border-amber-500'
                      else urgencyBorder = 'border-l-4 border-green-500'
                    }
                  } else {
                      const diff = d.getTime() - new Date().getTime()
                      const days = diff / (1000 * 3600 * 24)
                      if (days < 0) urgencyBorder = 'border-l-4 border-red-500'
                      else if (days <= 7) urgencyBorder = 'border-l-4 border-amber-500'
                      else urgencyBorder = 'border-l-4 border-green-500'
                  }
                } catch(e) {}
              }
              
              const isDone = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('compliance_done') || '{}')[entryId] : false;
              if (isDone) {
                 rowBg = 'bg-slate-100 dark:bg-slate-800 opacity-60';
                 urgencyBorder = 'border-l-4 border-slate-300 dark:border-slate-700';
              }
              return (
                <tr
                  key={entryId || i}
                  id={rowIds?.[i]}
                  data-entry-id={entryId}
                  className={`${rowBg} ${urgencyBorder} ${onRowClick ? 'cursor-pointer hover:bg-amber-50 transition-colors' : ''}`}
                  onClick={onRowClick && entryId ? () => onRowClick(entryId) : undefined}
                >
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer"
                      checked={isDone}
                      onClick={(e) => {
                         e.stopPropagation();
                         if (typeof window !== 'undefined') {
                           const current = JSON.parse(localStorage.getItem('compliance_done') || '{}');
                           current[entryId] = !current[entryId];
                           localStorage.setItem('compliance_done', JSON.stringify(current));
                           window.dispatchEvent(new Event('compliance_done_updated'));
                         }
                      }}
                    />
                  </td>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 ${
                        j === 0
                          ? 'font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap'
                          : j === row.length - 1 && headers.includes('Penalty')
                          ? 'text-red-600 dark:text-red-400 font-medium whitespace-nowrap'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                  {onReport && (
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); onReport(entryId, entryName) }}
                        className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-300 rounded px-2 py-1 transition-colors whitespace-nowrap"
                      >
                        ⚠️ Report
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
