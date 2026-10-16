'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BLANK_TEMPLATES_CATALOG,
  downloadBlankTemplate,
  BlankTemplateType,
  BlankFileFormat
} from '@/lib/financial-statements/export/blank-templates'
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  Loader2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'

const BUILDER_LINKS: Record<BlankTemplateType, string> = {
  balance_sheet: '/tools/financial-statements/balance-sheet',
  profit_loss: '/tools/financial-statements/profit-and-loss',
  cash_flow: '/tools/financial-statements/cash-flow-statement',
  notes_to_accounts: '/tools/financial-statements/balance-sheet#step-notes'
}

export default function BlankTemplatesDownloadGrid() {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null)

  const handleDownload = async (type: BlankTemplateType, format: BlankFileFormat) => {
    const key = `${type}_${format}`
    setDownloadingKey(key)
    try {
      await downloadBlankTemplate(type, format)
      setDownloadedKey(key)
      setTimeout(() => {
        setDownloadedKey(prev => (prev === key ? null : prev))
      }, 3000)
    } catch (err: any) {
      alert(`Download failed: ${err?.message || 'Unknown error'}`)
    } finally {
      setDownloadingKey(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {BLANK_TEMPLATES_CATALOG.map(t => {
        const builderUrl = BUILDER_LINKS[t.id]

        return (
          <div
            key={t.id}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:border-gold-accent/40 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-navy dark:text-white">{t.title}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-gold dark:bg-amber-950/60 dark:text-gold-accent border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                  Division I
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Direct Blank Downloads:
                </span>
                <Link
                  href={builderUrl}
                  className="text-[11px] font-semibold text-navy hover:text-gold dark:text-gold-accent flex items-center gap-1 transition-colors"
                >
                  <span>Interactive Builder</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* PDF Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownload(t.id, 'pdf')}
                  disabled={downloadingKey !== null}
                  title={`Direct download ${t.title} PDF template`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/50 transition-colors disabled:opacity-50"
                >
                  {downloadingKey === `${t.id}_pdf` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                  ) : downloadedKey === `${t.id}_pdf` ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span>PDF</span>
                </button>

                {/* Excel Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownload(t.id, 'xlsx')}
                  disabled={downloadingKey !== null}
                  title={`Direct download ${t.title} Excel (.xlsx) formula template`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 transition-colors disabled:opacity-50"
                >
                  {downloadingKey === `${t.id}_xlsx` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : downloadedKey === `${t.id}_xlsx` ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Excel</span>
                </button>

                {/* Word Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownload(t.id, 'docx')}
                  disabled={downloadingKey !== null}
                  title={`Direct download ${t.title} Word (.docx) editable template`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 transition-colors disabled:opacity-50"
                >
                  {downloadingKey === `${t.id}_docx` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : downloadedKey === `${t.id}_docx` ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>Word</span>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
