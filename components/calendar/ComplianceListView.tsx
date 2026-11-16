'use client'

import React from 'react'
import { ComplianceEntry } from './types'
import { EntryBadges, googleCalendarUrl, icsDownloadUrl } from './ComplianceHelpers'

interface TableSectionProps {
  title: string
  color: string
  dot: string
  entries: ComplianceEntry[]
  onReport: (id: string, name: string) => void
  onRowClick: (id: string) => void
}

const MONTHS_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

export function parseEntryDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null
  // Match DD Month YYYY (e.g. 14 October 2026 or 29 Nov 2026)
  const m = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/)
  if (m) {
    const d = parseInt(m[1], 10)
    const mon = MONTHS_MAP[m[2].slice(0, 3).toLowerCase()]
    const y = parseInt(m[3], 10)
    if (mon !== undefined && !isNaN(d) && !isNaN(y)) {
      return new Date(y, mon, d)
    }
  }
  // Match Month YYYY (e.g. June 2026)
  const m2 = dateStr.match(/([A-Za-z]{3,9})\s+(\d{4})/)
  if (m2) {
    const mon = MONTHS_MAP[m2[1].slice(0, 3).toLowerCase()]
    const y = parseInt(m2[2], 10)
    if (mon !== undefined && !isNaN(y)) {
      return new Date(y, mon, 1)
    }
  }
  return null
}

export function getUrgencyInfo(dateStr?: string | null, isDone?: boolean) {
  if (isDone) {
    return {
      label: '✓ Done',
      badgeCls: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      borderCls: 'border-l-4 border-emerald-500',
    }
  }

  const parsed = parseEntryDate(dateStr)
  if (!parsed) {
    return {
      label: 'Condition-Based',
      badgeCls: 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      borderCls: 'border-l-4 border-purple-400',
    }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)
  const diffDays = Math.round((parsed.getTime() - now.getTime()) / (1000 * 3600 * 24))

  if (diffDays < 0) {
    return {
      label: `Overdue (${Math.abs(diffDays)}d)`,
      badgeCls: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800',
      borderCls: 'border-l-4 border-red-500',
    }
  }
  if (diffDays === 0) {
    return {
      label: 'Due Today',
      badgeCls: 'bg-amber-500 text-slate-900 border-amber-600 font-black animate-pulse',
      borderCls: 'border-l-4 border-amber-500',
    }
  }
  if (diffDays <= 7) {
    return {
      label: `Due in ${diffDays}d`,
      badgeCls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      borderCls: 'border-l-4 border-amber-500',
    }
  }
  if (diffDays <= 30) {
    return {
      label: `In ${diffDays}d`,
      badgeCls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      borderCls: 'border-l-4 border-blue-400',
    }
  }
  return {
    label: `In ${diffDays}d`,
    badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    borderCls: 'border-l-4 border-slate-300 dark:border-slate-700',
  }
}

export function TableSection({
  title,
  color,
  dot,
  entries,
  onReport,
  onRowClick,
}: TableSectionProps) {
  const [doneMap, setDoneMap] = React.useState<Record<string, boolean>>({})
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const updateDone = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('compliance_done') || '{}')
        setDoneMap(stored)
      } catch {}
    }
    updateDone()
    window.addEventListener('compliance_done_updated', updateDone)
    return () => window.removeEventListener('compliance_done_updated', updateDone)
  }, [])

  function toggleDone(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (typeof window === 'undefined') return
    try {
      const current = JSON.parse(localStorage.getItem('compliance_done') || '{}')
      current[id] = !current[id]
      localStorage.setItem('compliance_done', JSON.stringify(current))
      window.dispatchEvent(new Event('compliance_done_updated'))
    } catch {}
  }

  // Sort entries chronologically by parsed due date; event-based rows at the end
  const sortedEntries = React.useMemo(() => {
    return [...entries].sort((a, b) => {
      const da = parseEntryDate(a.due_date)
      const db = parseEntryDate(b.due_date)
      if (!da && !db) return a.display_order - b.display_order
      if (!da) return 1
      if (!db) return -1
      return da.getTime() - db.getTime()
    })
  }, [entries])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy dark:text-white flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dot} inline-block shrink-0`} />
          {title}
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {sortedEntries.length} {sortedEntries.length === 1 ? 'compliance' : 'compliances'}
        </span>
      </div>

      {/* ========================================================
          DESKTOP & TABLET VIEW (>= 768px): High-density Table
          ======================================================== */}
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className={color}>
              <th className="w-12 text-center px-3 py-3 font-semibold text-white">Done</th>
              <th className="text-left px-3.5 py-3 font-semibold text-white min-w-[140px]">Form / Recurrence</th>
              <th className="text-left px-3.5 py-3 font-semibold text-white min-w-[200px]">Compliance Details</th>
              <th className="text-left px-3.5 py-3 font-semibold text-white min-w-[150px]">Due Date</th>
              <th className="text-left px-3.5 py-3 font-semibold text-white min-w-[180px]">Applicable To</th>
              <th className="text-left px-3.5 py-3 font-semibold text-white min-w-[160px]">Penalty / Late Fee</th>
              <th className="w-24 text-center px-3 py-3 font-semibold text-white">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedEntries.map((entry, i) => {
              const isDone = mounted && Boolean(doneMap[entry.id])
              const urgency = getUrgencyInfo(entry.due_date, isDone)
              const rowId = `${entry.regulator}-${(entry.form_name || entry.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

              let rowBg = i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-800/40'
              if (isDone) {
                rowBg = 'bg-slate-100/70 dark:bg-slate-800/50 opacity-65'
              }

              return (
                <tr
                  key={entry.id}
                  id={rowId}
                  data-entry-id={entry.id}
                  onClick={() => onRowClick(entry.id)}
                  className={`${rowBg} ${urgency.borderCls} cursor-pointer hover:bg-amber-50/70 dark:hover:bg-slate-700/50 transition-colors`}
                >
                  {/* Done Checkbox */}
                  <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <label className="inline-flex items-center justify-center p-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={(e) => toggleDone(entry.id, e as unknown as React.MouseEvent)}
                        className="size-4 rounded-sm text-amber-500 focus:ring-amber-400 cursor-pointer"
                        aria-label={`Mark ${entry.form_name} as done`}
                      />
                    </label>
                  </td>

                  {/* Form & Recurrence */}
                  <td className="px-3.5 py-3 align-top">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                        {entry.form_name}
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {entry.frequency.replace(/_/g, ' ')}
                        </span>
                        <EntryBadges entry={entry} />
                      </div>
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden shadow-xs mt-1" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={googleCalendarUrl(entry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Add to Google Calendar"
                          className="text-xs px-2 py-0.5 bg-white hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-r border-slate-200 dark:border-slate-700 text-blue-600"
                        >
                          📅
                        </a>
                        <a
                          href={icsDownloadUrl(entry)}
                          download={`${(entry.form_name || 'compliance').toLowerCase().replace(/\s+/g, '-')}-deadline.ics`}
                          title="Download .ics"
                          className="text-xs px-2 py-0.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          ⬇️
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Compliance Title & Law */}
                  <td className="px-3.5 py-3 align-top">
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-snug">
                      {entry.compliance_title}
                    </p>
                    {entry.regulation_reference && (
                      <span className="inline-block text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                        § {entry.regulation_reference}
                      </span>
                    )}
                  </td>

                  {/* Due Date & Extension */}
                  <td className="px-3.5 py-3 align-top">
                    {entry.is_extended ? (
                      <div>
                        {entry.original_date && (
                          <span className="line-through text-slate-400 mr-1.5 text-xs block">
                            {entry.original_date}
                          </span>
                        )}
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {entry.due_date}
                        </span>
                        {entry.extension_note ? (
                          <span className="block text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                            {entry.extension_note}
                          </span>
                        ) : entry.extension_ref ? (
                          <span className="block text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                            Extended ({entry.extension_ref})
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {entry.due_date}
                        </span>
                        <div className="mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${urgency.badgeCls}`}>
                            {urgency.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Applicable To */}
                  <td className="px-3.5 py-3 align-top text-xs text-slate-600 dark:text-slate-300">
                    {entry.applicable_to || '—'}
                  </td>

                  {/* Penalty */}
                  <td className="px-3.5 py-3 align-top text-xs">
                    {entry.penalty ? (
                      <span className="text-red-700 dark:text-red-400 font-medium">
                        {entry.penalty}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">None specified</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3 align-top text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onReport(entry.id, `${entry.form_name} — ${entry.compliance_title}`)}
                      className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-300 rounded px-2 py-1 transition-colors whitespace-nowrap"
                      title="Report discrepancy"
                    >
                      ⚠️ Report
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          MOBILE VIEW (< 768px): Adaptive Compliance Cards
          Zero horizontal overflow, 48px touch targets, mobile-first
          ======================================================== */}
      <div className="block md:hidden space-y-3">
        {sortedEntries.map((entry) => {
          const isDone = mounted && Boolean(doneMap[entry.id])
          const urgency = getUrgencyInfo(entry.due_date, isDone)
          const rowId = `${entry.regulator}-${(entry.form_name || entry.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

          return (
            <div
              key={entry.id}
              id={rowId}
              data-entry-id={entry.id}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3 transition-all ${
                isDone ? 'opacity-70 bg-slate-50 dark:bg-slate-800/60' : ''
              } ${urgency.borderCls}`}
            >
              {/* Card Top: Checkbox, Form, Recurrence, Urgency */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 48x48 min touch target for Done checkbox */}
                  <label className="flex items-center justify-center -m-2 p-2 min-w-[48px] min-h-[48px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => toggleDone(entry.id, e as unknown as React.MouseEvent)}
                      className="size-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                      aria-label={`Mark ${entry.form_name} as done`}
                    />
                  </label>
                  <button
                    onClick={() => onRowClick(entry.id)}
                    className="text-left font-bold text-navy dark:text-white text-base hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {entry.form_name}
                  </button>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                    {entry.frequency.replace(/_/g, ' ')}
                  </span>
                  <EntryBadges entry={entry} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${urgency.badgeCls}`}>
                  {urgency.label}
                </span>
              </div>

              {/* Title & Section Reference */}
              <div onClick={() => onRowClick(entry.id)} className="cursor-pointer">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {entry.compliance_title}
                </p>
                {entry.regulation_reference && (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                    § {entry.regulation_reference}
                  </p>
                )}
              </div>

              {/* Due Date Block */}
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Due Date:</span>
                <div className="text-right">
                  {entry.is_extended && entry.original_date && (
                    <span className="line-through text-slate-400 mr-2 text-[11px] inline-block">
                      {entry.original_date}
                    </span>
                  )}
                  <span className={`font-bold text-sm ${entry.is_extended ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {entry.due_date}
                  </span>
                  {entry.is_extended && (entry.extension_note || entry.extension_ref) && (
                    <span className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                      {entry.extension_note || `Extended (${entry.extension_ref})`}
                    </span>
                  )}
                </div>
              </div>

              {/* Applicability */}
              {entry.applicable_to && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Applicable to: </span>
                  {entry.applicable_to}
                </div>
              )}

              {/* Penalty */}
              {entry.penalty && (
                <div className="text-xs bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/40 rounded-lg p-2.5 leading-relaxed">
                  <span className="font-bold">⚠️ Penalty: </span>
                  {entry.penalty}
                </div>
              )}

              {/* Action Tray with 48px touch targets */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <a
                    href={googleCalendarUrl(entry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors text-xs font-semibold gap-1"
                    title="Add to Google Calendar"
                    aria-label={`Add ${entry.form_name} to Google Calendar`}
                  >
                    <span>📅</span>
                    <span className="text-[11px]">Google Cal</span>
                  </a>
                  <a
                    href={icsDownloadUrl(entry)}
                    download={`${(entry.form_name || 'compliance').toLowerCase().replace(/\s+/g, '-')}-deadline.ics`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors text-xs font-semibold gap-1"
                    title="Download .ics"
                    aria-label={`Download .ics file for ${entry.form_name}`}
                  >
                    <span>⬇️</span>
                    <span className="text-[11px]">.ics</span>
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onRowClick(entry.id)}
                    className="min-h-[44px] px-3.5 inline-flex items-center justify-center rounded-lg bg-amber-400 hover:bg-amber-500 text-navy font-bold text-xs transition-colors"
                  >
                    Details ↗
                  </button>
                  <button
                    onClick={() => onReport(entry.id, `${entry.form_name} — ${entry.compliance_title}`)}
                    className="min-h-[44px] px-2.5 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 transition-colors text-xs"
                    title="Report discrepancy"
                    aria-label={`Report discrepancy for ${entry.form_name}`}
                  >
                    ⚠️
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
