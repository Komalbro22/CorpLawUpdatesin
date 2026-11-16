'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import NewsletterWidget from '@/components/NewsletterWidget'
import JsonLd from '@/components/JsonLd'
import EmptyState from '@/components/EmptyState'

import { ComplianceEntry } from './calendar/types'
import ComplianceCalendarView from './calendar/ComplianceCalendarView'
import { TableSection, parseEntryDate } from './calendar/ComplianceListView'
import EventDrivenCompliancesDrawer from './calendar/EventDrivenCompliancesDrawer'
import ComplianceDetailModal from './calendar/ComplianceDetailModal'

export type { ComplianceEntry }

const ComplianceSuggestModal = dynamic(
  () => import('@/components/ComplianceSuggestModal'),
  { ssr: false }
)

interface CalendarPageClientProps {
  entries: ComplianceEntry[]
}

const ALL_CATEGORY_PILLS = [
  { regulator: 'income_tax', label: 'Income Tax', href: '#incometax', color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40 text-orange-700 dark:text-orange-400', icon: '📊' },
  { regulator: 'gst',        label: 'GST',        href: '#gst',       color: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-400',       icon: '🧾' },
  { regulator: 'mca',        label: 'ROC / MCA',  href: '#mca',       color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400',       icon: '🏛️' },
  { regulator: 'sebi',       label: 'SEBI LODR',  href: '#sebi',      color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400',    icon: '📈' },
  { regulator: 'labor_law',  label: 'Labor Laws', href: '#labor',     color: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-400', icon: '👷' },
  { regulator: 'fema',       label: 'FEMA',       href: '#fema',      color: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/40 text-teal-700 dark:text-teal-400',       icon: '🌐' },
  { regulator: 'rbi',        label: 'RBI',        href: '#rbi',       color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-400', icon: '🏦' },
]

export default function CalendarPageClient({ entries }: CalendarPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()
  const [selectedEntryName, setSelectedEntryName] = useState<string | undefined>()
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(null)
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [periodFilter, setPeriodFilter] = useState<'all' | '7days' | 'current_month' | 'next_month' | '30days' | 'event_driven'>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [doneVersion, setDoneVersion] = useState(0)
  const [doneCount, setDoneCount] = useState(0)
  const searchParams = useSearchParams()

  // Track completed count from localStorage
  useEffect(() => {
    const updateStats = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('compliance_done') || '{}')
        const activeIds = new Set(entries.map(e => e.id))
        const completed = Object.keys(stored).filter(k => stored[k] && activeIds.has(k)).length
        setDoneCount(completed)
        setDoneVersion(v => v + 1)
      } catch {}
    }
    updateStats()
    window.addEventListener('compliance_done_updated', updateStats)
    return () => window.removeEventListener('compliance_done_updated', updateStats)
  }, [entries])

  // Handle deep-linking (?highlight=<id>, ?form=<slug>, ?month=<YYYY-MM>)
  useEffect(() => {
    const highlightId = searchParams?.get('highlight')
    const formSlug = searchParams?.get('form')
    const monthParam = searchParams?.get('month')

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      setSelectedMonth(monthParam)
    }
    
    let targetEntry: ComplianceEntry | undefined
    if (highlightId) {
      targetEntry = entries.find(e => e.id === highlightId)
    } else if (formSlug) {
      const normalized = formSlug.toLowerCase().replace(/[^a-z0-9]/g, '')
      targetEntry = entries.find(e => (e.form_name || '').toLowerCase().replace(/[^a-z0-9]/g, '') === normalized)
    }

    if (targetEntry) {
      setSelectedEntry(targetEntry)
      setTimeout(() => {
        const row = document.querySelector(`[data-entry-id="${targetEntry?.id}"]`) as HTMLElement | null
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' })
          row.classList.add('ring-4', 'ring-amber-400', 'bg-amber-100/80')
          setTimeout(() => {
            row.classList.remove('ring-4', 'ring-amber-400', 'bg-amber-100/80')
          }, 3000)
        }
      }, 400)
    }
  }, [searchParams, entries])

  // Compute dynamic verification date from live rows
  const dynamicVerificationDate = useMemo(() => {
    const timestamps = entries
      .map(e => e.last_verified_at || e.updated_at)
      .filter(Boolean) as string[]
    
    if (timestamps.length === 0) return '16 November 2026'
    const latest = timestamps.sort().reverse()[0]
    try {
      const d = new Date(latest)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      }
    } catch {}
    return '16 November 2026'
  }, [entries])

  // Dynamic populated categories (filter out empty categories like RBI)
  const populatedCategories = useMemo(() => {
    return ALL_CATEGORY_PILLS.filter(cat => entries.some(e => e.regulator === cat.regulator))
  }, [entries])

  function handleRowClick(id: string) {
    const entry = entries.find(e => e.id === id)
    if (entry) {
      setSelectedEntry(entry)
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('highlight', entry.id)
        window.history.replaceState({}, '', url.toString())
      }
    }
  }

  function handleCloseModal() {
    setSelectedEntry(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('highlight')
      url.searchParams.delete('form')
      window.history.replaceState({}, '', url.toString())
    }
  }

  function openReportError(entryId: string, entryName: string) {
    setSelectedEntryId(entryId)
    setSelectedEntryName(entryName)
    setModalOpen(true)
  }

  function openSuggestNew() {
    setSelectedEntryId(undefined)
    setSelectedEntryName(undefined)
    setModalOpen(true)
  }

  // §2.3 Month Jump handler with shareable URL state
  function handleMonthJump(m: string) {
    setSelectedMonth(m)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (m && m !== 'all') {
        url.searchParams.set('month', m)
      } else {
        url.searchParams.delete('month')
      }
      window.history.replaceState({}, '', url.toString())
    }
  }

  // Filter entries based on search, month jump & period filter
  const filteredEntries = useMemo(() => {
    let result = entries

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(e =>
        e.form_name?.toLowerCase().includes(q) ||
        e.compliance_title?.toLowerCase().includes(q) ||
        e.regulator?.toLowerCase().includes(q) ||
        e.applicable_to?.toLowerCase().includes(q) ||
        e.regulation_reference?.toLowerCase().includes(q)
      )
    }

    // §2.3 Month Jump filter
    if (selectedMonth && selectedMonth !== 'all') {
      const [yStr, mStr] = selectedMonth.split('-')
      const targetYear = parseInt(yStr, 10)
      const targetMonth = parseInt(mStr, 10) - 1 // 0-indexed
      result = result.filter(e => {
        const d = parseEntryDate(e.due_date)
        if (!d) return false
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth
      })
    }

    if (periodFilter === 'all') return result

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    if (periodFilter === '7days') {
      return result.filter(e => {
        const d = parseEntryDate(e.due_date)
        if (!d) return false
        d.setHours(0, 0, 0, 0)
        const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 3600 * 24))
        return diffDays >= 0 && diffDays <= 7
      })
    }

    if (periodFilter === '30days') {
      return result.filter(e => {
        const d = parseEntryDate(e.due_date)
        if (!d) return false
        d.setHours(0, 0, 0, 0)
        const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 3600 * 24))
        return diffDays >= 0 && diffDays <= 30
      })
    }

    if (periodFilter === 'current_month') {
      return result.filter(e => {
        const d = parseEntryDate(e.due_date)
        if (!d) return false
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
    }

    if (periodFilter === 'next_month') {
      const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
      const nextMonth = (currentMonth + 1) % 12
      return result.filter(e => {
        const d = parseEntryDate(e.due_date)
        if (!d) return false
        return d.getMonth() === nextMonth && d.getFullYear() === nextMonthYear
      })
    }

    if (periodFilter === 'event_driven') {
      return result.filter(e => {
        return e.frequency === 'one_off' || parseEntryDate(e.due_date) === null
      })
    }

    return result
  }, [entries, searchQuery, periodFilter, selectedMonth, doneVersion])

  function handleExportIcs() {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const monthsMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
    }

    const events = filteredEntries.map(entry => {
      let date = '20260101'
      try {
        const match = entry.due_date.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/)
        if (match) {
          date = `${match[3]}${monthsMap[match[2]] || '01'}${match[1].padStart(2, '0')}`
        }
      } catch (e) {}

      let endDate = date
      try {
        const year = parseInt(date.substring(0, 4))
        const month = parseInt(date.substring(4, 6)) - 1
        const day = parseInt(date.substring(6, 8))
        const nextDay = new Date(year, month, day + 1)
        const m = (nextDay.getMonth() + 1).toString().padStart(2, '0')
        const d = nextDay.getDate().toString().padStart(2, '0')
        endDate = `${nextDay.getFullYear()}${m}${d}`
      } catch (e) {}

      const uid = `${entry.id}@corplawupdates.in`
      const title = `${entry.form_name} — ${entry.compliance_title}`
      const desc = [
        `Regulator: ${(entry.regulator || '').toUpperCase()}`,
        `Applicable to: ${entry.applicable_to}`,
        entry.penalty ? `Penalty: ${entry.penalty}` : '',
        entry.regulation_reference ? `Law: ${entry.regulation_reference}` : '',
        `Source: https://www.corplawupdates.in/calendar?highlight=${entry.id}`,
      ].filter(Boolean).join('\\n')

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${date}`,
        `DTEND;VALUE=DATE:${endDate}`,
        `SUMMARY:📋 ${title}`,
        `DESCRIPTION:${desc}`,
        `URL:https://www.corplawupdates.in/calendar?highlight=${entry.id}`,
        'END:VEVENT',
      ].join('\r\n')
    })

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CorpLawUpdates//Compliance Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'compliance-calendar-2026.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Group filtered entries by regulator
  const grouped = useMemo(() => {
    return filteredEntries.reduce<Record<string, ComplianceEntry[]>>((acc, entry) => {
      const key = entry.regulator || 'other'
      if (!acc[key]) acc[key] = []
      acc[key]!.push(entry)
      return acc
    }, {})
  }, [filteredEntries])

  const taxEntries = grouped['income_tax'] || []
  const gstEntries = grouped['gst'] || []
  const mcaEntries = grouped['mca'] || []
  const sebiEntries = grouped['sebi'] || []
  const laborEntries = grouped['labor_law'] || []
  const femaEntries = grouped['fema'] || []
  const rbiEntries = grouped['rbi'] || []

  const progressPercentage = entries.length > 0 ? Math.round((doneCount / entries.length) * 100) : 0

  return (
    <div>
      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <div className="bg-navy py-10 sm:py-14 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide">
            <span>🇮🇳</span>
            <span>All India Corporate & Tax Compliance Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Compliance Calendar 2026-27
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Statutory deadlines under Companies Act 2013, GST, Income Tax, SEBI LODR, Labor Laws, and FEMA regulations with verified penalties and circulars.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap text-xs sm:text-sm">
            <span className="text-amber-400 font-medium">📅 Updated for FY 2026-27</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-medium">{entries.length} Live Compliances</span>
            <span className="text-slate-500">·</span>
            <button
              onClick={openSuggestNew}
              className="text-amber-300 underline underline-offset-4 hover:text-amber-100 transition-colors font-semibold"
            >
              ➕ Suggest a compliance
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">

        {/* ========================================================
            CALENDAR EXPORT & SYNC BAR
            ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-linear-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl shadow-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-blue-950 dark:text-blue-100 text-sm sm:text-base flex items-center gap-2">
              <span>📅</span>
              <span>Export Corporate Deadlines</span>
            </p>
            <p className="text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
              Subscribe or download .ics to sync all {entries.length} deadlines into Google Calendar, Apple Calendar, or Microsoft Outlook.
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap shrink-0">
            <button
              onClick={handleExportIcs}
              className="flex-1 sm:flex-none inline-flex items-center justify-center min-h-[44px] gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              ⬇️ Download .ics
            </button>
            <a
              href="https://calendar.google.com/calendar/r?cid=https://www.corplawupdates.in/api/calendar/export"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center min-h-[44px] gap-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              + Subscribe in Google Calendar
            </a>
          </div>
        </div>

        {/* ========================================================
            COMPLIANCE PROGRESS TRACKER (Aggregated from localStorage)
            ======================================================== */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-navy dark:text-white flex items-center gap-2">
                <span>🎯</span>
                <span>My Filing Tracker</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {doneCount} of {entries.length} done
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Check off filings as completed. Progress is stored safely in your browser (no login required).
              </p>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-black font-heading text-navy dark:text-amber-400">
                {progressPercentage}%
              </span>
              {doneCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all checked compliance items?')) {
                      localStorage.removeItem('compliance_done')
                      window.dispatchEvent(new Event('compliance_done_updated'))
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-red-500 underline transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* ========================================================
            VIEW TOGGLE, SEARCH & PERIOD SELECTOR
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* View Mode Switcher & Month Jump Selector (§2.3) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('table')}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    view === 'table'
                      ? 'bg-amber-400 text-navy shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  📋 List View
                </button>
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    view === 'calendar'
                      ? 'bg-amber-400 text-navy shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  📅 Calendar Grid View
                </button>
              </div>

              {/* Month Jump Selector Dropdown (§2.3) */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 min-h-[44px] shadow-2xs">
                <label htmlFor="month-jump-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap cursor-pointer">
                  <span>🗓️</span>
                  <span className="hidden sm:inline">Jump to Month:</span>
                </label>
                <select
                  id="month-jump-select"
                  value={selectedMonth}
                  onChange={e => handleMonthJump(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer py-1"
                >
                  <option value="all">All Months (FY Horizon)</option>
                  <option value="2026-11">Nov 2026 (Current)</option>
                  <option value="2026-12">Dec 2026</option>
                  <option value="2027-01">Jan 2027</option>
                  <option value="2027-02">Feb 2027</option>
                  <option value="2027-03">Mar 2027</option>
                  <option value="2027-04">Apr 2027</option>
                  <option value="2027-05">May 2027</option>
                  <option value="2027-06">Jun 2027</option>
                  <option value="2027-07">Jul 2027 (Horizon)</option>
                </select>
                {selectedMonth !== 'all' && (
                  <button
                    type="button"
                    onClick={() => handleMonthJump('all')}
                    title="Clear month filter"
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  name="search_query"
                  placeholder="Search forms, titles, sections or penalties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 outline-hidden"
                />
                <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Period Filter Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold text-xs whitespace-nowrap pl-1 pr-1 hidden sm:inline">
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Deadlines' },
              { id: '7days', label: '🔥 Due in 7 Days' },
              { id: '30days', label: '⏳ Next 30 Days' },
              { id: 'current_month', label: '📅 Current Month' },
              { id: 'next_month', label: '🗓️ Next Month' },
              { id: 'event_driven', label: '⚡ Event Filings' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id as typeof periodFilter)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  periodFilter === p.id
                    ? 'bg-navy text-amber-300 dark:bg-amber-400 dark:text-navy font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            DYNAMIC CATEGORY PILLS (Populated categories only — no dead links)
            ======================================================== */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {populatedCategories.map((item) => (
              <Link
                key={item.regulator}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-semibold text-xs text-center hover:shadow-md transition-all ${item.color}`}
              >
                <span className="text-xl sm:text-2xl" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <span className="text-[10px] font-normal opacity-80">
                  {entries.filter(e => e.regulator === item.regulator).length} filings
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================
            DISCLAIMER & DYNAMIC VERIFICATION TIMESTAMP
            ======================================================== */}
        <div className="space-y-2">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex gap-3 items-start">
            <span className="text-xl shrink-0" aria-hidden="true">⚠️</span>
            <p className="text-amber-800 dark:text-amber-300 text-xs sm:text-sm leading-relaxed">
              <strong>Statutory Disclaimer:</strong> All compliance dates are indicative and subject to regulatory extensions,
              general circulars, and amendments issued by MCA, CBIC (GST), CBDT (Income Tax), SEBI, EPFO, or RBI.
              Always verify on the official government portal before acting on any deadline. This does not constitute formal legal advice.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 gap-1">
            <span>Official statutory sources: MCA21, GSTN, Income Tax e-Filing, SEBI, EPFO, RBI FIRMS.</span>
            <span className="font-semibold text-navy dark:text-slate-300">
              Last verified: {dynamicVerificationDate}
            </span>
          </div>
        </div>

        {/* ========================================================
            MAIN COMPLIANCE DISPLAY: LIST VIEW OR CALENDAR VIEW
            ======================================================== */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon="📅"
              title="No compliance deadlines match your filter"
              description="Try selecting 'All Deadlines', adjusting your search query, or checking another regulator."
              actionLabel="Reset All Filters"
              actionHref="/calendar"
            />
          </div>
        ) : view === 'table' ? (
          <div className="space-y-10">
            {/* Income Tax Section */}
            {taxEntries.length > 0 && (
              <div id="incometax" className="scroll-mt-20">
                <TableSection
                  title="📊 Income Tax Compliance"
                  color="bg-orange-600"
                  dot="bg-orange-500"
                  entries={taxEntries}
                  onReport={openReportError}
                  onRowClick={handleRowClick}
                />
              </div>
            )}

            {/* GST Section */}
            {gstEntries.length > 0 && (
              <div id="gst" className="scroll-mt-20">
                <TableSection
                  title="🧾 GST (Goods & Services Tax) Compliance"
                  color="bg-cyan-600"
                  dot="bg-cyan-500"
                  entries={gstEntries}
                  onReport={openReportError}
                  onRowClick={handleRowClick}
                />
              </div>
            )}

            {/* MCA Section */}
            {mcaEntries.length > 0 && (
              <div id="mca" className="scroll-mt-20">
                <TableSection
                  title="🏛️ MCA — Companies Act & LLP Compliance"
                  color="bg-navy"
                  dot="bg-blue-500"
                  entries={mcaEntries}
                  onReport={openReportError}
                  onRowClick={handleRowClick}
                />
              </div>
            )}

            {/* SEBI Section */}
            {sebiEntries.length > 0 && (
              <div id="sebi" className="scroll-mt-20">
                <TableSection
                  title="📈 SEBI — Listed Company Compliance (LODR)"
                  color="bg-green-700"
                  dot="bg-green-500"
                  entries={sebiEntries}
                  onReport={openReportError}
                  onRowClick={handleRowClick}
                />
              </div>
            )}

            {/* Labor Law Section */}
            {laborEntries.length > 0 && (
              <div id="labor" className="scroll-mt-20">
                <TableSection
                  title="👷 Labor Laws (EPF, ESIC, PT) Compliance"
                  color="bg-indigo-600"
                  dot="bg-indigo-500"
                  entries={laborEntries}
                  onReport={openReportError}
                  onRowClick={handleRowClick}
                />
              </div>
            )}

            {/* FEMA Section */}
            {femaEntries.length > 0 && (
              <div id="fema" className="scroll-mt-20">
                <TableSection
                  title="🌐 FEMA Compliance"
                  color="bg-teal-700"
                  dot="bg-teal-500"
                  entries={femaEntries}
                  onReport={openReportError}
                  onRowClick={handleRowClick}
                />
              </div>
            )}

            {/* RBI Section (if populated in future) */}
            {rbiEntries.length > 0 && (
              <div id="rbi" className="scroll-mt-20">
                <TableSection
                  title="🏦 RBI Compliance"
                  color="bg-purple-800"
                  dot="bg-purple-500"
                  entries={rbiEntries}
                  onReport={openReportError}
                  onRowClick={handleRowClick}
                />
              </div>
            )}
          </div>
        ) : (
          <ComplianceCalendarView entries={filteredEntries} onEntryClick={setSelectedEntry} />
        )}

        {/* ========================================================
            EVENT-TRIGGERED & CONDITION-LINKED DRAWER
            ======================================================== */}
        <EventDrivenCompliancesDrawer
          entries={entries}
          onRowClick={handleRowClick}
        />

        {/* ========================================================
            COMMUNITY REPORT & CONTRIBUTION
            ======================================================== */}
        <div className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6 text-center shadow-xs">
          <div className="text-3xl mb-2">👥</div>
          <h2 className="font-bold text-emerald-900 dark:text-emerald-300 text-lg mb-1">
            Crowdsourced Corporate Compliance Accuracy
          </h2>
          <p className="text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm max-w-xl mx-auto mb-4 leading-relaxed">
            Maintained collaboratively with Company Secretaries, Chartered Accountants, and legal compliance officers. Spotted a recent circular or missing extension? Submit a suggested update to earn contributor recognition.
          </p>
          <button
            onClick={openSuggestNew}
            className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            ➕ Suggest New Compliance Entry
          </button>
        </div>

        {/* ========================================================
            OFFICIAL PORTALS DIRECTORY
            ======================================================== */}
        <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-navy dark:text-white mb-4">
            Official Portals for Filing & Verification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {[
              { name: 'MCA21 V3 Portal', url: 'https://www.mca.gov.in',   desc: 'Company & LLP filings, Master Data, and statutory forms' },
              { name: 'GST Common Portal', url: 'https://www.gst.gov.in', desc: 'GSTR-1, GSTR-3B, CMP-08, and ITC reconciliations' },
              { name: 'Income Tax e-Filing', url: 'https://www.incometax.gov.in', desc: 'ITR corporate returns, Tax Audit 3CD, and TDS statements' },
              { name: 'SEBI Portal / SCORES', url: 'https://siportal.sebi.gov.in', desc: 'LODR compliance reporting and stock exchange disclosures' },
              { name: 'EPFO Unified Portal', url: 'https://unifiedportal-mem.epfindia.gov.in', desc: 'EPF ECR monthly contribution returns and challans' },
              { name: 'RBI / FIRMS Portal', url: 'https://firms.rbi.org.in', desc: 'FLA returns, FDI reporting (FC-GPR), and ECB filings' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all group"
              >
                <span className="font-bold text-navy dark:text-white text-sm group-hover:text-amber-600 transition-colors">
                  {link.name} ↗
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {link.desc}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ========================================================
            NEWSLETTER SIGNUP
            ======================================================== */}
        <section className="bg-navy rounded-2xl p-6 sm:p-8 text-center text-white shadow-md">
          <h2 className="text-xl sm:text-2xl font-heading font-bold mb-2">
            Never Miss an MCA, GST, or Tax Due Date
          </h2>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto text-xs sm:text-sm">
            Receive our weekly Monday briefing with statutory deadline reminders, regulatory notifications, and penalty alerts.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterWidget />
          </div>
        </section>

        {/* ========================================================
            DATASET SCHEMA
            ======================================================== */}
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'India Corporate Law Compliance Calendar 2026-27',
          description: 'Verified statutory compliance calendar for Indian companies tracking MCA, GST, Income Tax, SEBI, Labor Laws, and FEMA filing due dates with penalty provisions.',
          url: 'https://www.corplawupdates.in/calendar',
          license: 'https://creativecommons.org/licenses/by/4.0/',
          isAccessibleForFree: true,
          keywords: ['compliance calendar 2026', 'MCA filing deadlines', 'SEBI compliance dates', 'RBI FEMA deadlines', 'income tax due dates India', 'GST due dates 2026'],
          creator: { '@type': 'Organization', name: 'CorpLawUpdates.in', url: 'https://www.corplawupdates.in' },
          temporalCoverage: '2026/2027',
          spatialCoverage: { '@type': 'Place', name: 'India' },
          inLanguage: 'en-IN',
          dateModified: entries[0]?.updated_at ? new Date(entries[0].updated_at).toISOString().split('T')[0] : '2026-11-16',
        }} />

      </div>

      {/* Floating Suggest Button */}
      <button
        onClick={openSuggestNew}
        className="fixed bottom-6 right-6 z-40 bg-amber-400 hover:bg-amber-500 text-navy font-bold px-5 py-3 rounded-full shadow-lg text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105"
      >
        ➕ Suggest Compliance
      </button>

      {/* Suggest / Report Modal */}
      {modalOpen && (
        <ComplianceSuggestModal
          entryId={selectedEntryId}
          entryName={selectedEntryName}
          defaultType={selectedEntryId ? 'error_report' : 'new_entry'}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Detail Modal with Official Deep Links, GCal, .ics & Share */}
      {selectedEntry && (
        <ComplianceDetailModal
          selectedEntry={selectedEntry}
          onClose={handleCloseModal}
          onReportError={openReportError}
        />
      )}
    </div>
  )
}
