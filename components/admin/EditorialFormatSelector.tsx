'use client'

import React from 'react'
import { FileText } from 'lucide-react'

interface EditorialFormatSelectorProps {
  tags: string[]
  onTagsChange: (newTags: string[]) => void
  lastVerified: string
  onLastVerifiedChange: (newDate: string) => void
}

export default function EditorialFormatSelector({
  tags,
  onTagsChange,
  lastVerified,
  onLastVerifiedChange,
}: EditorialFormatSelectorProps) {
  const currentFormat: 'guide' | 'explained' | 'standard' = tags.includes('Evergreen Guide')
    ? 'guide'
    : tags.includes('Explained')
    ? 'explained'
    : 'standard'

  const handleSelectFormat = (format: 'guide' | 'explained' | 'standard') => {
    const cleanTags = tags.filter(t => t !== 'Evergreen Guide' && t !== 'Explained')
    if (format === 'guide') {
      if (!lastVerified) {
        onLastVerifiedChange(new Date().toISOString().split('T')[0])
      }
      onTagsChange([...cleanTags, 'Evergreen Guide'])
    } else if (format === 'explained') {
      onTagsChange([...cleanTags, 'Explained'])
    } else {
      onTagsChange(cleanTags)
    }
  }

  return (
    <div className="border border-slate-200/80 rounded-xl p-5 bg-white shadow-card ring-1 ring-slate-900/2 space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-1">
          Article Editorial Type / Format
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Choose whether this is a routine circular update, a verified step-by-step compliance guide, or an analytical observation piece.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Standard Regulatory Update */}
          <button
            type="button"
            onClick={() => handleSelectFormat('standard')}
            className={`cursor-pointer flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              currentFormat === 'standard'
                ? 'border-slate-800 bg-slate-50 dark:bg-slate-800 ring-2 ring-slate-800/20 dark:ring-amber-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-slate-900 dark:text-white">
              <FileText className="size-4 text-slate-500" />
              <span>Standard Update</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Regular regulatory circular, notification, or tribunal order update.
            </p>
          </button>

          {/* Option 2: Evergreen Guide */}
          <button
            type="button"
            onClick={() => handleSelectFormat('guide')}
            className={`cursor-pointer flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              currentFormat === 'guide'
                ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/30'
                : 'border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-amber-900 dark:text-amber-300">
              <span className="text-sm">📘</span>
              <span>Evergreen Guide</span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-normal">
              Step-by-step filing guide. Automatically appears on <code>/guides</code> with 📘 badge.
            </p>
          </button>

          {/* Option 3: Explained */}
          <button
            type="button"
            onClick={() => handleSelectFormat('explained')}
            className={`cursor-pointer flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              currentFormat === 'explained'
                ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-2 ring-sky-500/30'
                : 'border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-sky-900 dark:text-sky-300">
              <span className="text-sm">🔍</span>
              <span>Explained Piece</span>
            </div>
            <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 leading-normal">
              Analysis &amp; observation on a major development. Displays 🔍 badge.
            </p>
          </button>
        </div>
      </div>

      {/* When Evergreen Guide is active, show the verification date field right inside this card */}
      {currentFormat === 'guide' && (
        <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-lg">
          <div className="min-w-0">
            <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
              Last Verified Date
            </label>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">
              Displayed on the 📘 badge and on the Guides hub card.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="date"
              value={lastVerified}
              onChange={(e) => onLastVerifiedChange(e.target.value)}
              className="border border-amber-300 dark:border-amber-800 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => onLastVerifiedChange(new Date().toISOString().split('T')[0])}
              className="cursor-pointer text-[11px] font-semibold bg-amber-200/70 hover:bg-amber-300 text-amber-900 px-2.5 py-1.5 rounded-md transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
