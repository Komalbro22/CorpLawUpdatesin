'use client'

import React, { useState } from 'react'
import { ComplianceEntry } from './types'

interface EventDrivenCompliancesDrawerProps {
  entries: ComplianceEntry[]
  onRowClick: (id: string) => void
}

export default function EventDrivenCompliancesDrawer({
  entries,
  onRowClick,
}: EventDrivenCompliancesDrawerProps) {
  const [isOpen, setIsOpen] = useState(true)

  // Identify event-driven entries from live data
  const eventEntries = entries.filter((e) => {
    const isOneOff = e.frequency === 'one_off'
    const isEventForm = [
      'DIR-12', 'MGT-14', 'BEN-2', 'INC-20A', 'CSR-2', 'REG 34', 'FC-GPR', 'FC-TRS', 'FORM FC',
      'FORM ECB 1', 'REVISED FORM ECB 1', 'FORM ECB 2', 'ECB-1', 'ECB-2',
    ].some((f) => (e.form_name || '').toUpperCase().includes(f))
    const isDescriptive = (e.due_date || '').toLowerCase().includes('within') ||
      (e.due_date || '').toLowerCase().includes('before') ||
      (e.due_date || '').toLowerCase().includes('at the time')

    return isOneOff || isEventForm || isDescriptive
  })

  // Group by regulator
  const mcaEvents = eventEntries.filter((e) => e.regulator === 'mca')
  const sebiEvents = eventEntries.filter((e) => e.regulator === 'sebi')
  const femaEvents = eventEntries.filter((e) => e.regulator === 'fema' || e.regulator === 'rbi')

  return (
    <section className="bg-linear-to-br from-purple-50/70 via-indigo-50/50 to-slate-50 dark:from-purple-950/20 dark:via-slate-900/60 dark:to-slate-900 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-200/60 dark:border-purple-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl" aria-hidden="true">⚡</span>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-navy dark:text-white">
              Event-Triggered & Condition-Linked Compliances
            </h2>
            <span className="text-xs font-bold bg-purple-200/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-300 px-2.5 py-0.5 rounded-full">
              {eventEntries.length + 2} Filings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Deadlines triggered by corporate events (board meetings, director changes, capital allotments, or ECB drawdowns) rather than fixed calendar dates.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-center px-4 py-2 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors shadow-2xs whitespace-nowrap"
        >
          {isOpen ? '▲ Collapse Section' : '▼ Expand Filings'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          {/* MCA Event-Driven Filings */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              MCA & Companies Act Event Filings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mcaEvents.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onRowClick(entry.id)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-purple-400 dark:hover:border-purple-600 cursor-pointer transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-sm text-blue-700 dark:text-blue-400">
                        {entry.form_name}
                      </span>
                      <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        Event-Driven
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {entry.compliance_title}
                    </p>
                    <div className="mt-2 text-xs bg-purple-50/80 dark:bg-purple-950/30 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40 text-purple-900 dark:text-purple-300 font-medium">
                      ⏱ {entry.due_date}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[180px]">{entry.applicable_to || 'Companies'}</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">Details ↗</span>
                  </div>
                </div>
              ))}

              {/* Statutory Reference Card: INC-22 (15 days under s.12(4)) */}
              <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3.5 shadow-2xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm text-blue-700 dark:text-blue-400">
                      INC-22
                    </span>
                    <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      Section 12(4)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Notice of Situation / Change of Registered Office
                  </p>
                  <div className="mt-2 text-xs bg-purple-50/80 dark:bg-purple-950/30 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40 text-purple-900 dark:text-purple-300 font-medium">
                    ⏱ Within 15 days of change of registered office
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  Applicable to all companies shifting office address
                </div>
              </div>

              {/* Statutory Reference Card: PAS-3 (15 days under s.42(8)/s.39) */}
              <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3.5 shadow-2xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm text-blue-700 dark:text-blue-400">
                      PAS-3
                    </span>
                    <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      Section 42(8)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Return of Allotment of Securities
                  </p>
                  <div className="mt-2 text-xs bg-purple-50/80 dark:bg-purple-950/30 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40 text-purple-900 dark:text-purple-300 font-medium">
                    ⏱ Within 15 days of allotment of shares/securities
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  Applicable to companies making private placement / rights / preferential issue
                </div>
              </div>
            </div>
          </div>

          {/* FEMA & Foreign Exchange Event Filings */}
          {femaEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                FEMA & Foreign Inward/Outward Event Filings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {femaEvents.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => onRowClick(entry.id)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-purple-400 dark:hover:border-purple-600 cursor-pointer transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-sm text-teal-700 dark:text-teal-400">
                          {entry.form_name}
                        </span>
                        <span className="text-[10px] font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full">
                          FEMA
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {entry.compliance_title}
                      </p>
                      <div className="mt-2 text-xs bg-teal-50/80 dark:bg-teal-950/30 p-2 rounded-lg border border-teal-100 dark:border-teal-900/40 text-teal-900 dark:text-teal-300 font-medium">
                        ⏱ {entry.due_date}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[180px]">{entry.applicable_to || 'FEMA Entities'}</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">Details ↗</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEBI Event Filings */}
          {sebiEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-green-900 dark:text-green-300 flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />
                SEBI LODR Event Filings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sebiEvents.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => onRowClick(entry.id)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-purple-400 dark:hover:border-purple-600 cursor-pointer transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-sm text-green-700 dark:text-green-400">
                          {entry.form_name}
                        </span>
                        <span className="text-[10px] font-semibold bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                          LODR
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {entry.compliance_title}
                      </p>
                      <div className="mt-2 text-xs bg-green-50/80 dark:bg-green-950/30 p-2 rounded-lg border border-green-100 dark:border-green-900/40 text-green-900 dark:text-green-300 font-medium">
                        ⏱ {entry.due_date}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[180px]">{entry.applicable_to || 'Listed Companies'}</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">Details ↗</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
