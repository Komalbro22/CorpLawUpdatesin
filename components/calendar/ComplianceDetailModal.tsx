'use client'

import React from 'react'
import { ComplianceEntry } from './types'

export default function ComplianceDetailModal({
  selectedEntry,
  onClose,
  onReportError,
}: {
  selectedEntry: ComplianceEntry
  onClose: () => void
  onReportError: (id: string, name: string) => void
}) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
        >
          ×
        </button>

        <div className="mb-4">
          <span className="text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
            {selectedEntry.regulator.toUpperCase()}
          </span>
          {selectedEntry.created_by?.startsWith('community:') && (
            <span className="ml-2 text-xs bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">👥 Community</span>
          )}
          {!selectedEntry.is_verified && (
            <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">⏳ Pending Verification</span>
          )}
        </div>

        <h2 className="text-xl font-bold text-navy dark:text-white mb-1">{selectedEntry.form_name}</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{selectedEntry.compliance_title}</p>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <div className="text-xs text-slate-400 dark:text-slate-400 mb-1">Due Date</div>
            <div className="font-bold text-navy dark:text-amber-400">{selectedEntry.due_date}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <div className="text-xs text-slate-400 dark:text-slate-400 mb-1">Frequency</div>
            <div className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
              {selectedEntry.frequency.replace(/_/g, ' ')}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 col-span-2 border border-slate-100 dark:border-slate-700/50">
            <div className="text-xs text-slate-400 dark:text-slate-400 mb-1">Applicable To</div>
            <div className="text-slate-700 dark:text-slate-200">{selectedEntry.applicable_to}</div>
          </div>
          {selectedEntry.penalty && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-3 col-span-2 border border-red-100 dark:border-red-900/50">
              <div className="text-xs text-red-500 dark:text-red-400 mb-1">Penalty</div>
              <div className="text-red-700 dark:text-red-300 font-semibold">{selectedEntry.penalty}</div>
            </div>
          )}
          {selectedEntry.regulation_reference && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 col-span-2 border border-slate-100 dark:border-slate-700/50">
              <div className="text-xs text-slate-400 dark:text-slate-400 mb-1">Regulation Reference</div>
              <div className="text-slate-700">{selectedEntry.regulation_reference}</div>
            </div>
          )}
        </div>

        {selectedEntry.contributor_name && selectedEntry.is_verified && (
          <div className="text-xs text-green-600 mb-4">
            ✓ Verified correction by {selectedEntry.contributor_name}
            {selectedEntry.contributor_profession ? `, ${selectedEntry.contributor_profession}` : ''}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose()
              onReportError(selectedEntry.id, `${selectedEntry.form_name} — ${selectedEntry.compliance_title}`)
            }}
            className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm font-semibold"
          >
            ⚠️ Report Error
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-navy text-white py-2 rounded-lg text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
