'use client'

import React, { useState } from 'react'
import { ComplianceEntry } from './types'
import { googleCalendarUrl, icsDownloadUrl } from './ComplianceHelpers'

interface ComplianceDetailModalProps {
  selectedEntry: ComplianceEntry
  onClose: () => void
  onReportError: (id: string, name: string) => void
}

const REGULATOR_PORTALS: Record<string, { name: string; url: string; label: string }> = {
  mca: {
    name: 'MCA21 V3 Portal',
    url: 'https://www.mca.gov.in',
    label: 'Launch MCA21 V3 Filing Portal ↗',
  },
  gst: {
    name: 'GST Common Portal',
    url: 'https://www.gst.gov.in',
    label: 'Launch GSTN e-Filing Portal ↗',
  },
  income_tax: {
    name: 'Income Tax e-Filing Portal',
    url: 'https://www.incometax.gov.in',
    label: 'Launch Income Tax e-Filing ↗',
  },
  sebi: {
    name: 'SEBI Portal',
    url: 'https://siportal.sebi.gov.in',
    label: 'Launch SEBI Intermediary Portal ↗',
  },
  labor_law: {
    name: 'EPFO Unified Portal',
    url: 'https://unifiedportal-mem.epfindia.gov.in',
    label: 'Launch EPFO Unified Portal ↗',
  },
  fema: {
    name: 'RBI FIRMS Portal',
    url: 'https://firms.rbi.org.in',
    label: 'Launch RBI FIRMS Portal ↗',
  },
  rbi: {
    name: 'RBI Portal',
    url: 'https://www.rbi.org.in',
    label: 'Launch RBI Official Portal ↗',
  },
}

export default function ComplianceDetailModal({
  selectedEntry,
  onClose,
  onReportError,
}: ComplianceDetailModalProps) {
  const [copied, setCopied] = useState(false)

  const portal = REGULATOR_PORTALS[selectedEntry.regulator] || {
    name: 'Official Government Portal',
    url: 'https://www.mca.gov.in',
    label: 'Open Government Portal ↗',
  }

  function handleCopyShareLink() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.corplawupdates.in'
    const shareUrl = `${origin}/calendar?highlight=${selectedEntry.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 relative my-auto max-h-[92vh] overflow-y-auto space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-2xl leading-none p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors"
        >
          ✕
        </button>

        {/* Regulator & Meta Badges */}
        <div className="flex items-center gap-2 flex-wrap pr-8">
          <span className="text-xs font-bold uppercase bg-navy text-amber-300 dark:bg-amber-400 dark:text-navy px-2.5 py-1 rounded-md">
            {selectedEntry.regulator.toUpperCase()}
          </span>
          <span className="text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            {selectedEntry.frequency.replace(/_/g, ' ')}
          </span>
          {selectedEntry.created_by?.startsWith('community:') && (
            <span className="text-xs bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md border border-green-200">
              👥 Community
            </span>
          )}
          {!selectedEntry.is_verified && (
            <span className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-200">
              ⏳ Pending Verification
            </span>
          )}
        </div>

        {/* Heading & Title */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-navy dark:text-white leading-tight">
            {selectedEntry.form_name}
          </h2>
          <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base font-medium mt-1 leading-snug">
            {selectedEntry.compliance_title}
          </p>
          {selectedEntry.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {selectedEntry.description}
            </p>
          )}
        </div>

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Due Date Block */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Due Date</div>
            <div className="font-bold text-navy dark:text-amber-400 text-base">
              {selectedEntry.due_date}
              {selectedEntry.is_extended && selectedEntry.original_date && (
                <span className="block text-xs font-normal line-through text-slate-400 mt-0.5">
                  Original: {selectedEntry.original_date}
                </span>
              )}
            </div>
            {selectedEntry.is_extended && (selectedEntry.extension_note || selectedEntry.extension_ref) && (
              <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1">
                {selectedEntry.extension_note || `Extended: ${selectedEntry.extension_ref}`}
              </div>
            )}
          </div>

          {/* Recurrence / Frequency */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Recurrence Cycle</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize text-sm">
              {selectedEntry.frequency.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Applicable To */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 sm:col-span-2 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Applicable To</div>
            <div className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
              {selectedEntry.applicable_to || '—'}
            </div>
          </div>

          {/* Penalty / Late Fee */}
          {selectedEntry.penalty && (
            <div className="bg-red-50 dark:bg-red-950/40 rounded-xl p-3.5 sm:col-span-2 border border-red-200 dark:border-red-900/60">
              <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                ⚠️ Statutory Late Fee / Penalty
              </div>
              <div className="text-red-800 dark:text-red-300 font-medium text-xs sm:text-sm leading-relaxed">
                {selectedEntry.penalty}
              </div>
            </div>
          )}

          {/* Regulation Reference */}
          {selectedEntry.regulation_reference && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 sm:col-span-2 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Governing Act / Rule / Regulation</div>
              <div className="text-slate-800 dark:text-slate-200 font-mono text-xs">
                § {selectedEntry.regulation_reference}
              </div>
            </div>
          )}

          {/* Official Source URL */}
          {(selectedEntry.official_source_url || selectedEntry.official_link) && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 sm:col-span-2 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Official Statutory Notification / Circular</div>
              <a
                href={selectedEntry.official_source_url || selectedEntry.official_link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all inline-flex items-center gap-1.5"
              >
                <span>🔗</span>
                <span>{selectedEntry.official_source_url || selectedEntry.official_link}</span>
              </a>
            </div>
          )}
        </div>

        {/* Verification Credit */}
        {selectedEntry.contributor_name && selectedEntry.is_verified && (
          <div className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2.5 rounded-lg border border-green-200 dark:border-green-800">
            ✓ Verified statutory correction by <strong>{selectedEntry.contributor_name}</strong>
            {selectedEntry.contributor_profession ? ` (${selectedEntry.contributor_profession})` : ''}
          </div>
        )}

        {/* Official Filing Portal Deep Link */}
        <div className="p-3 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl border border-blue-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                Official Government Portal: {portal.name}
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                File return directly or check statutory circulars on the regulator site
              </p>
            </div>
            <a
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
            >
              {portal.label}
            </a>
          </div>
        </div>

        {/* Calendar Export & Share Actions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <a
            href={googleCalendarUrl(selectedEntry)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors p-2 text-center"
          >
            <span>📅</span> Add to Google Calendar
          </a>
          <a
            href={icsDownloadUrl(selectedEntry)}
            download={`${(selectedEntry.form_name || 'compliance').toLowerCase().replace(/\s+/g, '-')}-deadline.ics`}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors p-2 text-center"
          >
            <span>⬇️</span> Download .ics
          </a>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors p-2 text-center"
          >
            {copied ? '✓ Copied Link!' : '🔗 Share Link'}
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onClose()
              onReportError(selectedEntry.id, `${selectedEntry.form_name} — ${selectedEntry.compliance_title}`)
            }}
            className="flex-1 min-h-[44px] border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 py-2.5 rounded-lg text-xs font-bold transition-colors"
          >
            ⚠️ Report Discrepancy
          </button>
          <button
            onClick={onClose}
            className="flex-1 min-h-[44px] bg-navy text-white hover:bg-navy/90 py-2.5 rounded-lg text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
