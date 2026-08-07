'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import dynamic from 'next/dynamic'
import NewsletterWidget from '@/components/NewsletterWidget'
import JsonLd from '@/components/JsonLd'
import EmptyState from '@/components/EmptyState'

import { ComplianceEntry } from './calendar/types'
import ComplianceCalendarView from './calendar/ComplianceCalendarView'
import { TableSection } from './calendar/ComplianceListView'
import { EntryBadges, googleCalendarUrl, icsDownloadUrl } from './calendar/ComplianceHelpers'
import ComplianceDetailModal from './calendar/ComplianceDetailModal'

export type { ComplianceEntry }

const ComplianceSuggestModal = dynamic(
  () => import('@/components/ComplianceSuggestModal'),
  { ssr: false }
)

interface CalendarPageClientProps {
  entries: ComplianceEntry[]
}

export default function CalendarPageClient({ entries }: CalendarPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()
  const [selectedEntryName, setSelectedEntryName] = useState<string | undefined>()
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(null)
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'this_week'>('all')
  const [doneVersion, setDoneVersion] = useState(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleUpdate = () => setDoneVersion(v => v + 1);
    window.addEventListener('compliance_done_updated', handleUpdate);
    return () => window.removeEventListener('compliance_done_updated', handleUpdate);
  }, []);

  useEffect(() => {
    const highlightId = searchParams?.get('highlight')
    if (highlightId) {
      const entry = entries.find(e => e.id === highlightId)
      if (entry) {
        setSelectedEntry(entry)
        
        setTimeout(() => {
          const row = document.querySelector(`[data-entry-id="${highlightId}"]`) as HTMLElement | null
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' })
            row.classList.add('bg-amber-200/80', 'transition-all', 'duration-500', 'ring-2', 'ring-amber-400')
            setTimeout(() => {
              row.classList.remove('bg-amber-200/80', 'ring-2', 'ring-amber-400')
            }, 2500)
          }
        }, 300)
      }
    }
  }, [searchParams, entries])

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

  function handleRowClick(id: string) {
    const entry = entries.find(e => e.id === id)
    if (entry) setSelectedEntry(entry)
  }

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.form_name?.toLowerCase().includes(q) || 
        e.compliance_title?.toLowerCase().includes(q) ||
        e.regulator?.toLowerCase().includes(q)
      );
    }
    if (filterMode === 'this_week') {
      result = result.filter(e => {
        try {
          const d = new Date(e.due_date);
          if (isNaN(d.getTime())) {
             const p = new Date(e.due_date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'));
             if (isNaN(p.getTime())) return false;
             const diff = p.getTime() - new Date().getTime();
             const days = diff / (1000 * 3600 * 24);
             return days >= 0 && days <= 7;
          }
          const diff = d.getTime() - new Date().getTime();
          const days = diff / (1000 * 3600 * 24);
          return days >= 0 && days <= 7;
        } catch(err) { return false; }
      });
    }
    return result;
  }, [entries, searchQuery, filterMode, doneVersion]);

  function handleExportIcs() {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03',
      'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09',
      'Oct': '10', 'Nov': '11', 'Dec': '12',
    }

    const events = filteredEntries.map(entry => {
      let date = '20260101'
      try {
        const match = entry.due_date.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/)
        if (match) {
          date = `${match[3]}${months[match[2]] || '01'}${match[1].padStart(2, '0')}`
        }
      } catch(e) {}

      let endDate = date;
      try {
         const year = parseInt(date.substring(0,4));
         const month = parseInt(date.substring(4,6)) - 1;
         const day = parseInt(date.substring(6,8));
         const nextDay = new Date(year, month, day + 1);
         const m = (nextDay.getMonth() + 1).toString().padStart(2, '0');
         const d = nextDay.getDate().toString().padStart(2, '0');
         endDate = `${nextDay.getFullYear()}${m}${d}`;
      } catch(e) {}

      const uid = `${entry.id}@corplawupdates.in`
      const title = `${entry.form_name} — ${entry.compliance_title}`
      const desc = [
        `Regulator: ${(entry.regulator || '').toUpperCase()}`,
        `Applicable to: ${entry.applicable_to}`,
        entry.penalty ? `Penalty: ${entry.penalty}` : '',
        entry.regulation_reference ? `Law: ${entry.regulation_reference}` : '',
        `Source: https://www.corplawupdates.in/calendar`,
      ].filter(Boolean).join('\\n')

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${date}`,
        `DTEND;VALUE=DATE:${endDate}`,
        `SUMMARY:📋 ${title}`,
        `DESCRIPTION:${desc}`,
        `URL:https://www.corplawupdates.in/calendar`,
        'END:VEVENT'
      ].join('\r\n')
    })

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CorpLawUpdates//Compliance Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'compliance-calendar.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const grouped = filteredEntries.reduce<Record<string, ComplianceEntry[]>>((acc, entry) => {
    const key = entry.regulator || 'other'
    if (!acc[key]) acc[key] = []
    acc[key]!.push(entry)
    return acc
  }, {})

  const mcaEntries  = grouped['mca']        || []
  const sebiEntries = grouped['sebi']       || []
  const femaEntries = grouped['fema']       || []
  const rbiEntries  = grouped['rbi']        || []
  const taxEntries  = grouped['income_tax'] || []
  const gstEntries  = grouped['gst']        || []
  const laborEntries = grouped['labor_law'] || []

  function makeFormCell(entry: ComplianceEntry) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        {entry.form_name}
        <EntryBadges entry={entry} />
        <span className="inline-flex border border-slate-200 dark:border-slate-700 rounded overflow-hidden shadow-sm">
          <a
            href={googleCalendarUrl(entry)}
            target="_blank"
            rel="noopener noreferrer"
            title="Add to Google Calendar"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-500 hover:text-blue-700 text-xs px-2 py-0.5 bg-white hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border-r border-slate-200 dark:border-slate-700 flex items-center justify-center"
          >
            📅
          </a>
          <a
            href={icsDownloadUrl(entry)}
            download={`${(entry.form_name || 'compliance').replace(/\\s+/g, '-').toLowerCase()}-deadline.ics`}
            title="Download .ics File"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-500 hover:text-slate-700 text-xs px-2 py-0.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
          >
            ⬇️
          </a>
        </span>
      </span>
    )
  }

  const mcaRows   = mcaEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—', e.penalty || '—'])
  const mcaIds    = mcaEntries.map(e => e.id)
  const mcaNames  = mcaEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const mcaDates  = mcaEntries.map(e => e.due_date)
  const mcaRowIds = mcaEntries.map(e => `${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

  const sebiRows  = sebiEntries.map(e => [makeFormCell(e), e.compliance_title, e.regulation_reference || '—', e.due_date, e.applicable_to || '—'])
  const sebiIds   = sebiEntries.map(e => e.id)
  const sebiNames = sebiEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const sebiDates = sebiEntries.map(e => e.due_date)
  const sebiRowIds = sebiEntries.map(e => `${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

  const femaRows  = femaEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—'])
  const femaIds   = femaEntries.map(e => e.id)
  const femaNames = femaEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const femaDates = femaEntries.map(e => e.due_date)
  const femaRowIds = femaEntries.map(e => `${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

  const rbiRows   = rbiEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—'])
  const rbiIds    = rbiEntries.map(e => e.id)
  const rbiNames  = rbiEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const rbiDates  = rbiEntries.map(e => e.due_date)
  const rbiRowIds = rbiEntries.map(e => `${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

  const taxRows   = taxEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—', e.penalty || '—'])
  const taxIds    = taxEntries.map(e => e.id)
  const taxNames  = taxEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const taxDates  = taxEntries.map(e => e.due_date)
  const taxRowIds = taxEntries.map(e => `${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

  const gstRows   = gstEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—', e.penalty || '—'])
  const gstIds    = gstEntries.map(e => e.id)
  const gstNames  = gstEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const gstDates  = gstEntries.map(e => e.due_date)
  const gstRowIds = gstEntries.map(e => `${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

  const laborRows   = laborEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—', e.penalty || '—'])
  const laborIds    = laborEntries.map(e => e.id)
  const laborNames  = laborEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const laborDates  = laborEntries.map(e => e.due_date)
  const laborRowIds = laborEntries.map(e => `${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

  return (
    <div>
      {/* HERO */}
      <div className="bg-navy py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
          Compliance Calendar 2026
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
          Key compliance deadlines under Companies Act, SEBI LODR, FEMA and RBI regulations
        </p>
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          <span className="text-sm text-amber-400 font-medium">📅 Updated for FY 2026-27</span>
          <span className="text-slate-500">·</span>
          <button
            onClick={openSuggestNew}
            className="text-sm text-amber-300 underline underline-offset-2 hover:text-amber-100 transition-colors"
          >
            ➕ Suggest a compliance
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* EXPORT COMPLIANCE CALENDAR */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex-1">
            <p className="font-semibold text-blue-900 text-sm">
              📅 Export Compliance Calendar
            </p>
            <p className="text-blue-700 text-xs mt-0.5">
              Subscribe to get deadline reminders in Google Calendar, Outlook or Apple Calendar
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={handleExportIcs}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              ⬇️ Download .ics
            </button>
            <a
              href="https://calendar.google.com/calendar/r?cid=https://www.corplawupdates.in/api/calendar/export"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              + Subscribe in Google Calendar
            </a>
          </div>
        </div>

        {/* VIEW TOGGLE & SEARCH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                view === 'calendar'
                  ? 'bg-amber-400 text-navy shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              📅 Calendar View
            </button>
          </div>
          
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto"
          >
            <input 
              type="text"
              name="search_query"
              placeholder="Search forms or compliance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 sm:w-64 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setFilterMode(m => m === 'all' ? 'this_week' : 'all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                filterMode === 'this_week' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🔥 Due This Week
            </button>
          </form>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <EmptyState
              icon="📅"
              title="No compliance deadlines found"
              description="No compliance entries match your filter. Try a different regulator or clear the filter."
              actionLabel="View All Deadlines"
              actionHref="/calendar"
            />
          </div>
        ) : view === 'table' ? (
          <>
            {/* DISCLAIMER */}
            <div className="space-y-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <p className="text-amber-800 text-sm leading-relaxed">
                  <strong>Disclaimer:</strong> All dates are indicative and subject to regulatory extensions,
                  amendments or circulars issued by MCA, SEBI, GSTN, EPFO or RBI from time to time. Always verify with
                  official government portals before acting on any deadline. This is not legal advice.
                </p>
              </div>
              <p className="text-xs text-slate-400 text-right">
                Last verified: May 2026 | Source: MCA, SEBI, GSTN, EPFO, RBI official portals
              </p>
            </div>

            {/* QUICK LINKS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'Income Tax', href: '#incometax', color: 'bg-orange-50 border-orange-200 text-orange-700', icon: '📊' },
                { label: 'GST',        href: '#gst',       color: 'bg-cyan-50 border-cyan-200 text-cyan-700',       icon: '🧾' },
                { label: 'ROC / MCA',  href: '#mca',       color: 'bg-blue-50 border-blue-200 text-blue-700',       icon: '🏛️' },
                { label: 'SEBI LODR',  href: '#sebi',      color: 'bg-green-50 border-green-200 text-green-700',    icon: '📈' },
                { label: 'Labor Laws', href: '#labor',     color: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: '👷' },
                { label: 'RBI',        href: '#rbi',       color: 'bg-purple-50 border-purple-200 text-purple-700', icon: '🏦' },
                { label: 'FEMA',       href: '#fema',      color: 'bg-teal-50 border-teal-200 text-teal-700',       icon: '🌐' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border font-medium text-sm text-center hover:shadow-md transition-shadow ${item.color}`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {taxEntries.length > 0 && (
              <div id="incometax">
                <TableSection title="📊 Income Tax Compliance" color="bg-orange-600" dot="bg-orange-500"
                  headers={['Form', 'Compliance', 'Due Date', 'Applicable To', 'Penalty']}
                  rows={taxRows} entryIds={taxIds} entryNames={taxNames} rowDates={taxDates} rowIds={taxRowIds}
                  onReport={openReportError} onRowClick={handleRowClick} />
              </div>
            )}
            {gstEntries.length > 0 && (
              <div id="gst">
                <TableSection title="🧾 GST (Goods & Services Tax) Compliance" color="bg-cyan-600" dot="bg-cyan-500"
                  headers={['Form', 'Compliance', 'Due Date', 'Applicable To', 'Penalty']}
                  rows={gstRows} entryIds={gstIds} entryNames={gstNames} rowDates={gstDates} rowIds={gstRowIds}
                  onReport={openReportError} onRowClick={handleRowClick} />
              </div>
            )}
            {mcaEntries.length > 0 && (
              <div id="mca">
                <TableSection title="🏛️ MCA — Companies Act & LLP Compliance" color="bg-navy" dot="bg-blue-500"
                  headers={['Form', 'Compliance', 'Due Date', 'Applicable To', 'Penalty']}
                  rows={mcaRows} entryIds={mcaIds} entryNames={mcaNames} rowDates={mcaDates} rowIds={mcaRowIds}
                  onReport={openReportError} onRowClick={handleRowClick} />
              </div>
            )}
            {sebiEntries.length > 0 && (
              <div id="sebi">
                <TableSection title="📈 SEBI — Listed Company Compliance" color="bg-green-700" dot="bg-green-500"
                  headers={['Form', 'Compliance', 'Regulation', 'Due Date', 'Applicable To']}
                  rows={sebiRows} entryIds={sebiIds} entryNames={sebiNames} rowDates={sebiDates} rowIds={sebiRowIds}
                  onReport={openReportError} onRowClick={handleRowClick} />
              </div>
            )}
            {laborEntries.length > 0 && (
              <div id="labor">
                <TableSection title="👷 Labor Laws (EPF, ESIC, PT) Compliance" color="bg-indigo-600" dot="bg-indigo-500"
                  headers={['Form', 'Compliance', 'Due Date', 'Applicable To', 'Penalty']}
                  rows={laborRows} entryIds={laborIds} entryNames={laborNames} rowDates={laborDates} rowIds={laborRowIds}
                  onReport={openReportError} onRowClick={handleRowClick} />
              </div>
            )}
            {rbiEntries.length > 0 && (
              <div id="rbi">
                <TableSection title="🏦 RBI Compliance" color="bg-purple-800" dot="bg-purple-500"
                  headers={['Form', 'Compliance', 'Due Date', 'Applicable To']}
                  rows={rbiRows} entryIds={rbiIds} entryNames={rbiNames} rowDates={rbiDates} rowIds={rbiRowIds}
                  onReport={openReportError} onRowClick={handleRowClick} />
              </div>
            )}
            {femaEntries.length > 0 && (
              <div id="fema">
                <TableSection title="🌐 FEMA Compliance" color="bg-teal-700" dot="bg-teal-500"
                  headers={['Form', 'Compliance', 'Due Date', 'Applicable To']}
                  rows={femaRows} entryIds={femaIds} entryNames={femaNames} rowDates={femaDates} rowIds={femaRowIds}
                  onReport={openReportError} onRowClick={handleRowClick} />
              </div>
            )}
          </>
        ) : (
          <ComplianceCalendarView entries={filteredEntries} onEntryClick={setSelectedEntry} />
        )}

        {/* COMMUNITY NOTICE */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-bold text-green-800 text-lg mb-1">
            Help us keep this calendar accurate
          </h3>
          <p className="text-green-700 text-sm max-w-xl mx-auto mb-4">
            This calendar is maintained by our community of Company Secretaries, CAs, and corporate
            professionals. Spotted an error or a missing compliance? Use the button below to report
            it — approved corrections will credit you as a contributor.
          </p>
          <button
            onClick={openSuggestNew}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            ➕ Suggest New Compliance Entry
          </button>
        </div>

        {/* USEFUL LINKS */}
        <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
          <h3 className="text-xl font-heading font-bold text-navy dark:text-white mb-4">
            Official Portals for Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'MCA21 Portal', url: 'https://www.mca.gov.in',   desc: 'All company filings and circulars' },
              { name: 'SEBI Portal',  url: 'https://www.sebi.gov.in',  desc: 'Listed company regulations' },
              { name: 'RBI / FIRMS',  url: 'https://firms.rbi.org.in', desc: 'FEMA filings and reporting' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all"
              >
                <span className="font-semibold text-navy dark:text-white text-sm">{link.name} ↗</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{link.desc}</span>
              </a>
            ))}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="bg-navy rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-heading font-bold text-white mb-2">
            Never Miss a Compliance Deadline
          </h3>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">
            Get weekly regulatory updates and deadline reminders from MCA, SEBI and RBI. Free forever.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterWidget />
          </div>
        </section>

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'India Corporate Law Compliance Calendar 2026',
          description: 'Complete compliance deadline calendar for FY 2026-27 covering MCA, SEBI, RBI, FEMA and Income Tax filings.',
          url: 'https://www.corplawupdates.in/calendar',
          license: 'https://creativecommons.org/licenses/by/4.0/',
          isAccessibleForFree: true,
          keywords: ['compliance calendar 2026', 'MCA filing deadlines', 'SEBI compliance dates', 'RBI FEMA deadlines', 'income tax due dates India'],
          creator: { '@type': 'Organization', name: 'CorpLawUpdates.in', url: 'https://www.corplawupdates.in' },
          temporalCoverage: '2026',
          spatialCoverage: { '@type': 'Place', name: 'India' },
          inLanguage: 'en-IN',
          dateModified: entries[0]?.updated_at ? new Date(entries[0].updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }} />

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Compliance Deadlines 2026',
          numberOfItems: entries.length,
          itemListElement: entries.map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${e.form_name} - ${e.compliance_title}`,
            description: `Due date: ${e.due_date}. Applicable to: ${e.applicable_to}`,
            url: `https://www.corplawupdates.in/calendar#${e.regulator}-${(e.form_name || e.id.slice(0,8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
          }))
        }} />

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: entries.slice(0, 15).map(e => {
            let answerText = `The due date for ${e.compliance_title} (${e.form_name}) in 2026 is ${e.due_date}.`
            if (e.regulation_reference) answerText += ` This compliance is required under ${e.regulation_reference}.`
            if (e.applicable_to) answerText += ` It is applicable to ${e.applicable_to}.`
            if (e.penalty) answerText += ` Failure to comply may result in a penalty of ${e.penalty}.`
            
            return {
              '@type': 'Question',
              name: `What is the due date for ${e.form_name} in 2026?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: answerText
              }
            }
          }),
        }} />

      </div>

      {/* FLOATING SUGGEST BUTTON */}
      <button
        onClick={openSuggestNew}
        className="fixed bottom-6 right-6 z-40 bg-amber-400 hover:bg-amber-500 text-navy font-bold px-5 py-3 rounded-full shadow-lg text-sm flex items-center gap-2 transition-all hover:scale-105"
      >
        ➕ Suggest a Compliance
      </button>

      {/* MODAL */}
      {modalOpen && (
        <ComplianceSuggestModal
          entryId={selectedEntryId}
          entryName={selectedEntryName}
          defaultType={selectedEntryId ? 'error_report' : 'new_entry'}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* DETAIL PANEL */}
      {selectedEntry && (
        <ComplianceDetailModal
          selectedEntry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onReportError={openReportError}
        />
      )}
    </div>
  )
}
