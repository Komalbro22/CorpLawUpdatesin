'use client'

import React, { useState } from 'react'
import { ComplianceEntry, REGULATOR_COLORS } from './types'

export default function ComplianceCalendarView({
  entries,
  onEntryClick,
}: {
  entries: ComplianceEntry[]
  onEntryClick: (entry: ComplianceEntry) => void
}) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  function parseDueDate(s: string): Date | null {
    try {
      const d = new Date(s)
      if (!isNaN(d.getTime())) return d
      const p = new Date(s.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'))
      return isNaN(p.getTime()) ? null : p
    } catch { return null }
  }

  const dayMap: Record<number, ComplianceEntry[]> = {}
  entries.forEach(e => {
    const d = parseDueDate(e.due_date)
    if (d && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const day = d.getDate()
      if (!dayMap[day]) dayMap[day] = []
      dayMap[day].push(e)
    }
  })

  const upcoming = entries
    .map(e => ({ entry: e, date: parseDueDate(e.due_date) }))
    .filter(({ date }) => { if (!date) return false; const diff = date.getTime() - today.getTime(); return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000 })
    .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0))

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  const isToday = (day: number) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  const isPast  = (day: number) => new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  function prevMonth() { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
  function nextMonth() { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-bold text-amber-800 text-sm mb-3">⏰ Upcoming in next 30 days ({upcoming.length})</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {upcoming.map(({ entry, date }) => (
              <button key={entry.id} onClick={() => onEntryClick(entry)}
                className="flex-shrink-0 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-left hover:border-amber-400 dark:hover:border-amber-500 transition-colors min-w-[160px]">
                <div className="text-xs text-amber-600 dark:text-amber-500 font-bold mb-1">{date?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                <div className="text-xs font-bold text-navy dark:text-white leading-tight">{entry.form_name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{entry.compliance_title}</div>
                <div className={`text-xs mt-1 px-1.5 py-0.5 rounded border w-fit ${REGULATOR_COLORS[entry.regulator] || REGULATOR_COLORS['other']}`}>{entry.regulator.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <button onClick={prevMonth} className="text-slate-400 hover:text-navy dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">◀</button>
          <h2 className="font-bold text-navy dark:text-white text-lg">{MONTHS[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} className="text-slate-400 hover:text-navy dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">▶</button>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {cells.map((day, idx) => (
            <div key={idx} className={`min-h-[80px] p-1 ${day === null ? 'bg-slate-50 dark:bg-slate-800/50' : isPast(day) ? 'bg-white dark:bg-slate-900 opacity-60' : 'bg-white dark:bg-slate-900'}`}>
              {day !== null && (
                <>
                  <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday(day) ? 'bg-amber-400 text-navy' : 'text-slate-600 dark:text-slate-400'}`}>{day}</div>
                  <div className="space-y-0.5">
                    {(dayMap[day] || []).slice(0, 2).map(entry => (
                      <button key={entry.id} onClick={() => onEntryClick(entry)}
                        className={`w-full text-left text-xs px-1 py-0.5 rounded border truncate font-semibold ${REGULATOR_COLORS[entry.regulator] || REGULATOR_COLORS['other']}`}>
                        {entry.form_name}
                      </button>
                    ))}
                    {(dayMap[day] || []).length > 2 && (
                      <div className="text-xs text-slate-400 pl-1">+{(dayMap[day] || []).length - 2} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(REGULATOR_COLORS).map(([reg, cls]) => (
          <span key={reg} className={`text-xs px-2 py-1 rounded border font-semibold ${cls}`}>{reg.toUpperCase()}</span>
        ))}
      </div>
    </div>
  )
}
