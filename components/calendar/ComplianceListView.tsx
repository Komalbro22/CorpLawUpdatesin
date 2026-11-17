'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
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

/**
 * §2.2 Graceful aging (exact labels — no others permitted):
 * - Upcoming (> 7 days ahead): standard card styling, "In Nd".
 * - Due within 7 days: amber badge "Due soon" (or "Due soon (Nd)").
 * - 0–7 days past due: amber badge "Past due" (quiet amber, NOT red, NOT blinking).
 * - More than 7 days past due: quiet slate badge "Previous period" with the due date shown in muted text.
 * FORBIDDEN: "Grace period", "Grace", "Filed", "Archived", and red "Overdue (Nd)".
 */
export function getUrgencyInfo(dateStr?: string | null, isDone?: boolean) {
  if (isDone) {
    return {
      label: '✓ Done',
      badgeCls: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      borderCls: 'border-l-4 border-emerald-500',
      isMuted: false,
    }
  }

  const parsed = parseEntryDate(dateStr)
  if (!parsed) {
    return {
      label: 'Condition-Based',
      badgeCls: 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      borderCls: 'border-l-4 border-purple-400',
      isMuted: false,
    }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)
  const diffDays = Math.round((parsed.getTime() - now.getTime()) / (1000 * 3600 * 24))

  // Past due states (§2.2 Graceful aging)
  if (diffDays < 0) {
    if (diffDays >= -7) {
      // 0–7 days past due: quiet amber badge "Past due", NOT red, NOT blinking
      return {
        label: 'Past due',
        badgeCls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold',
        borderCls: 'border-l-4 border-amber-500',
        isMuted: false,
      }
    } else {
      // More than 7 days past due: quiet slate badge "Previous period", muted date text
      return {
        label: 'Previous period',
        badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium',
        borderCls: 'border-l-4 border-slate-300 dark:border-slate-700',
        isMuted: true,
      }
    }
  }

  // Upcoming states
  if (diffDays === 0) {
    return {
      label: 'Due soon',
      badgeCls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold',
      borderCls: 'border-l-4 border-amber-500',
      isMuted: false,
    }
  }
  if (diffDays <= 7) {
    return {
      label: `Due soon (${diffDays}d)`,
      badgeCls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold',
      borderCls: 'border-l-4 border-amber-500',
      isMuted: false,
    }
  }
  if (diffDays <= 30) {
    return {
      label: `In ${diffDays}d`,
      badgeCls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      borderCls: 'border-l-4 border-blue-400',
      isMuted: false,
    }
  }
  return {
    label: `In ${diffDays}d`,
    badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    borderCls: 'border-l-4 border-slate-300 dark:border-slate-700',
    isMuted: false,
  }
}

export interface SeriesGroup {
  id: string
  isSeries: true
  primaryInstance: ComplianceEntry
  priorInstances: ComplianceEntry[]
  futureInstances: ComplianceEntry[]
  allInstances: ComplianceEntry[]
}

export interface StandaloneItem {
  id: string
  isSeries: false
  entry: ComplianceEntry
}

export type DisplayItem = SeriesGroup | StandaloneItem

/**
 * §2.1 Series grouping on the page:
 * Group rows by `parent_entry_id` (each child links to its series root: `root.id === instance.parent_entry_id`).
 * Primary card shows the next upcoming instance (earliest instance whose due date is >= today, or latest if all are in past).
 * Unlinked rows degrade gracefully to flat display.
 */
export function groupEntriesIntoSeries(entries: ComplianceEntry[], today: Date = new Date()): DisplayItem[] {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const childrenByParent = new Map<string, ComplianceEntry[]>()
  const allRoots = new Map<string, ComplianceEntry>()

  for (const entry of entries) {
    if (entry.parent_entry_id) {
      if (!childrenByParent.has(entry.parent_entry_id)) {
        childrenByParent.set(entry.parent_entry_id, [])
      }
      childrenByParent.get(entry.parent_entry_id)!.push(entry)
    }
  }

  for (const entry of entries) {
    if (entry.recurrence_rule || childrenByParent.has(entry.id)) {
      allRoots.set(entry.id, entry)
    }
  }

  // Fallback linking: map series roots by regulator + normalized form name so newly added cron rows
  // with parent_entry_id: null are seamlessly grouped under their root without sitting ungrouped.
  const rootByFormKey = new Map<string, string>()
  for (const [rootId, rootEntry] of allRoots.entries()) {
    if (rootEntry.recurrence_rule) {
      const normForm = (rootEntry.form_name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      rootByFormKey.set(`${rootEntry.regulator}:${normForm}`, rootId)
    }
  }

  for (const entry of entries) {
    if (!entry.parent_entry_id && !entry.recurrence_rule) {
      const normForm = (entry.form_name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const matchingRootId = rootByFormKey.get(`${entry.regulator}:${normForm}`)
      if (matchingRootId && matchingRootId !== entry.id) {
        if (!childrenByParent.has(matchingRootId)) {
          childrenByParent.set(matchingRootId, [])
        }
        const existingChildren = childrenByParent.get(matchingRootId)!
        if (!existingChildren.some(c => c.id === entry.id)) {
          existingChildren.push(entry)
        }
      }
    }
  }

  const handledEntryIds = new Set<string>()
  const items: DisplayItem[] = []

  const seriesRootIds = new Set<string>([...allRoots.keys(), ...childrenByParent.keys()])

  for (const rootId of seriesRootIds) {
    const rootEntry = allRoots.get(rootId)
    const children = childrenByParent.get(rootId) || []

    const instances: ComplianceEntry[] = []
    if (rootEntry) {
      instances.push(rootEntry)
      handledEntryIds.add(rootEntry.id)
    }
    for (const child of children) {
      instances.push(child)
      handledEntryIds.add(child.id)
    }

    if (instances.length === 0) continue

    // Sort instances chronologically
    instances.sort((a, b) => {
      const da = parseEntryDate(a.due_date)
      const db = parseEntryDate(b.due_date)
      if (!da && !db) return a.display_order - b.display_order
      if (!da) return 1
      if (!db) return -1
      return da.getTime() - db.getTime()
    })

    // If only 1 instance and no recurrence rule, treat as standalone
    if (instances.length === 1 && !instances[0].recurrence_rule) {
      items.push({
        id: instances[0].id,
        isSeries: false,
        entry: instances[0],
      })
      continue
    }

    // Determine primary instance: earliest >= today, or latest if all past
    const upcomingInstances = instances.filter(e => {
      const d = parseEntryDate(e.due_date)
      return d && d.getTime() >= todayMidnight.getTime()
    })

    let primaryInstance: ComplianceEntry
    if (upcomingInstances.length > 0) {
      primaryInstance = upcomingInstances[0]
    } else {
      primaryInstance = instances[instances.length - 1]
    }

    const primaryDate = parseEntryDate(primaryInstance.due_date)
    const primaryTime = primaryDate ? primaryDate.getTime() : Infinity

    // Prior instances (chronological descending: most recent past first)
    const priorInstances = instances.filter(e => {
      if (e.id === primaryInstance.id) return false
      const d = parseEntryDate(e.due_date)
      if (!d) return false
      return d.getTime() < primaryTime
    }).sort((a, b) => {
      const da = parseEntryDate(a.due_date)?.getTime() || 0
      const db = parseEntryDate(b.due_date)?.getTime() || 0
      return db - da
    })

    // Future instances after primary instance
    const futureInstances = instances.filter(e => {
      if (e.id === primaryInstance.id) return false
      const d = parseEntryDate(e.due_date)
      if (!d) return true
      return d.getTime() > primaryTime
    })

    items.push({
      id: rootId,
      isSeries: true,
      primaryInstance,
      priorInstances,
      futureInstances,
      allInstances: instances,
    })
  }

  // Handle all remaining unlinked entries as standalone items
  for (const entry of entries) {
    if (!handledEntryIds.has(entry.id)) {
      items.push({
        id: entry.id,
        isSeries: false,
        entry,
      })
    }
  }

  // Sort display items by upcoming due date (event filings at end)
  items.sort((a, b) => {
    const dateA = a.isSeries ? parseEntryDate(a.primaryInstance.due_date) : parseEntryDate(a.entry.due_date)
    const dateB = b.isSeries ? parseEntryDate(b.primaryInstance.due_date) : parseEntryDate(b.entry.due_date)
    const orderA = a.isSeries ? a.primaryInstance.display_order : a.entry.display_order
    const orderB = b.isSeries ? b.primaryInstance.display_order : b.entry.display_order

    if (!dateA && !dateB) return orderA - orderB
    if (!dateA) return 1
    if (!dateB) return -1
    return dateA.getTime() - dateB.getTime()
  })

  return items
}

export function TableSection({
  title,
  color,
  dot,
  entries,
  onReport,
  onRowClick,
}: TableSectionProps) {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({})
  const [expandedFuture, setExpandedFuture] = useState<Record<string, boolean>>({})
  const searchParams = useSearchParams()

  useEffect(() => {
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

  function toggleSeries(seriesId: string) {
    setExpandedSeries(prev => ({ ...prev, [seriesId]: !prev[seriesId] }))
  }

  function toggleFuture(seriesId: string) {
    setExpandedFuture(prev => ({ ...prev, [seriesId]: !prev[seriesId] }))
  }

  // Group entries into series according to §2.1
  const displayItems = useMemo(() => {
    return groupEntriesIntoSeries(entries, new Date())
  }, [entries])

  // Deep-linking: auto-expand series if a child instance is highlighted in URL
  useEffect(() => {
    const highlightId = searchParams?.get('highlight')
    if (!highlightId) return

    for (const item of displayItems) {
      if (item.isSeries) {
        if (item.priorInstances.some(p => p.id === highlightId)) {
          setExpandedSeries(prev => ({ ...prev, [item.id]: true }))
        }
        if (item.futureInstances.some(f => f.id === highlightId)) {
          setExpandedFuture(prev => ({ ...prev, [item.id]: true }))
        }
      }
    }
  }, [searchParams, displayItems])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy dark:text-white flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dot} inline-block shrink-0`} />
          {title}
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {entries.length} {entries.length === 1 ? 'compliance' : 'compliances'}
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
            {displayItems.map((item, i) => {
              const entry = item.isSeries ? item.primaryInstance : item.entry
              const isDone = mounted && Boolean(doneMap[entry.id])
              const urgency = getUrgencyInfo(entry.due_date, isDone)
              const rowId = `${entry.regulator}-${(entry.form_name || entry.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

              let rowBg = i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-800/40'
              if (isDone) {
                rowBg = 'bg-slate-100/70 dark:bg-slate-800/50 opacity-65'
              }

              const isSeriesExpanded = item.isSeries && Boolean(expandedSeries[item.id])
              const isFutureExpanded = item.isSeries && Boolean(expandedFuture[item.id])

              return (
                <React.Fragment key={entry.id}>
                  <tr
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                            {entry.form_name}
                          </span>
                          {item.isSeries && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              Series
                            </span>
                          )}
                        </div>
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

                        {/* Series Expansion Controls (§2.1) */}
                        {item.isSeries && item.priorInstances.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSeries(item.id)
                            }}
                            className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>{isSeriesExpanded ? '▲ Hide prior periods' : `🕒 View prior periods (${item.priorInstances.length})`}</span>
                          </button>
                        )}
                        {item.isSeries && item.futureInstances.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFuture(item.id)
                            }}
                            className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>{isFutureExpanded ? '▲ Hide schedule' : `📅 View schedule (${item.futureInstances.length} more)`}</span>
                          </button>
                        )}
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
                          <span className={`font-semibold ${urgency.isMuted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
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
                        className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-300 rounded px-2 py-1 transition-colors whitespace-nowrap cursor-pointer"
                        title="Report discrepancy"
                      >
                        ⚠️ Report
                      </button>
                    </td>
                  </tr>

                  {/* ========================================================
                      EXPANDED PRIOR PERIODS ACCORDION ROW (§2.1)
                      ======================================================== */}
                  {item.isSeries && isSeriesExpanded && (
                    <tr className="bg-slate-50 dark:bg-slate-850 border-l-4 border-slate-300 dark:border-slate-700">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <span>🕒</span>
                              <span>Prior Periods History ({item.priorInstances.length} past periods)</span>
                            </span>
                            <span className="text-[11px] font-normal text-slate-500">
                              Series root: {entry.form_name}
                            </span>
                          </div>

                          <div className="divide-y divide-slate-200/60 dark:divide-slate-800 space-y-1.5 pt-1">
                            {item.priorInstances.map(past => {
                              const pastDone = mounted && Boolean(doneMap[past.id])
                              const pastUrgency = getUrgencyInfo(past.due_date, pastDone)

                              return (
                                <div
                                  key={past.id}
                                  data-entry-id={past.id}
                                  onClick={() => onRowClick(past.id)}
                                  className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/60 dark:hover:bg-slate-800/40 p-2 rounded-lg cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <label className="inline-flex items-center justify-center cursor-pointer" onClick={e => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={pastDone}
                                        onChange={(e) => toggleDone(past.id, e as unknown as React.MouseEvent)}
                                        className="size-3.5 rounded-sm text-amber-500 focus:ring-amber-400 cursor-pointer"
                                        aria-label={`Mark ${past.form_name} ${past.due_date} as done`}
                                      />
                                    </label>
                                    <div>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">
                                        {past.compliance_title || past.form_name}
                                      </span>
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Due: <span className="font-medium text-slate-600 dark:text-slate-300">{past.due_date}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-sm border ${pastUrgency.badgeCls}`}>
                                      {pastUrgency.label}
                                    </span>
                                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                                      <a
                                        href={googleCalendarUrl(past)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Add to Google Calendar"
                                        className="text-[11px] px-1.5 py-0.5 bg-white dark:bg-slate-800 hover:bg-blue-50 text-blue-600 border-r border-slate-200 dark:border-slate-700"
                                      >
                                        📅
                                      </a>
                                      <a
                                        href={icsDownloadUrl(past)}
                                        download={`${(past.form_name || 'compliance').toLowerCase()}-${past.due_date.replace(/\s+/g, '-')}.ics`}
                                        title="Download .ics"
                                        className="text-[11px] px-1.5 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600"
                                      >
                                        ⬇️
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* ========================================================
                      EXPANDED FUTURE SCHEDULE ACCORDION ROW
                      ======================================================== */}
                  {item.isSeries && isFutureExpanded && (
                    <tr className="bg-blue-50/40 dark:bg-blue-950/20 border-l-4 border-blue-400 dark:border-blue-700">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-950 dark:text-blue-200 border-b border-blue-200 dark:border-blue-900/50 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <span>📅</span>
                              <span>Upcoming Horizon Schedule ({item.futureInstances.length} future periods)</span>
                            </span>
                            <span className="text-[11px] font-normal text-blue-700 dark:text-blue-300">
                              Through July 2027
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                            {item.futureInstances.map(fut => {
                              const futDone = mounted && Boolean(doneMap[fut.id])
                              const futUrgency = getUrgencyInfo(fut.due_date, futDone)

                              return (
                                <div
                                  key={fut.id}
                                  data-entry-id={fut.id}
                                  onClick={() => onRowClick(fut.id)}
                                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-colors space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-navy dark:text-white text-xs">{fut.due_date}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-sm border ${futUrgency.badgeCls}`}>
                                      {futUrgency.label}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">{fut.compliance_title}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
        {displayItems.map((item) => {
          const entry = item.isSeries ? item.primaryInstance : item.entry
          const isDone = mounted && Boolean(doneMap[entry.id])
          const urgency = getUrgencyInfo(entry.due_date, isDone)
          const rowId = `${entry.regulator}-${(entry.form_name || entry.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

          const isSeriesExpanded = item.isSeries && Boolean(expandedSeries[item.id])
          const isFutureExpanded = item.isSeries && Boolean(expandedFuture[item.id])

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
                  {item.isSeries && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Series
                    </span>
                  )}
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
                  <span className={`font-bold text-sm ${entry.is_extended ? 'text-emerald-700 dark:text-emerald-400' : urgency.isMuted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
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

              {/* Series Prior Periods Button (§2.1 Mobile) */}
              {item.isSeries && item.priorInstances.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleSeries(item.id)}
                  className="w-full min-h-[44px] py-2 px-3 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-900/50 transition-colors cursor-pointer"
                >
                  <span>{isSeriesExpanded ? '▲ Hide prior periods' : `🕒 View prior periods (${item.priorInstances.length})`}</span>
                </button>
              )}

              {/* Expanded Prior Periods Mobile Stack */}
              {item.isSeries && isSeriesExpanded && (
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700">
                    <span>🕒 Prior Periods History</span>
                    <span className="text-[11px] font-normal text-slate-500">{item.priorInstances.length} past periods</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {item.priorInstances.map(past => {
                      const pastDone = mounted && Boolean(doneMap[past.id])
                      const pastUrgency = getUrgencyInfo(past.due_date, pastDone)

                      return (
                        <div
                          key={past.id}
                          data-entry-id={past.id}
                          onClick={() => onRowClick(past.id)}
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <label className="flex items-center justify-center -m-1.5 p-1.5 min-w-[36px] min-h-[36px] cursor-pointer" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={pastDone}
                                onChange={(e) => toggleDone(past.id, e as unknown as React.MouseEvent)}
                                className="size-4 rounded text-amber-500 cursor-pointer"
                                aria-label={`Mark ${past.form_name} ${past.due_date} as done`}
                              />
                            </label>
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                                {past.due_date}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {past.compliance_title || past.form_name}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm border shrink-0 ${pastUrgency.badgeCls}`}>
                            {pastUrgency.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
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
