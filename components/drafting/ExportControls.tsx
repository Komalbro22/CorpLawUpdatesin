// src/components/drafting/ExportControls.tsx
'use client'

import { Share2, Printer, FileDown, RefreshCw } from 'lucide-react'

interface ExportControlsProps {
  onShare: () => void
  onPrint: () => void
  onWordExport: () => void
  isExporting: boolean
}

export function ExportControls({
  onShare,
  onPrint,
  onWordExport,
  isExporting
}: ExportControlsProps) {
  return (
    <div className="flex items-center gap-3.5 bg-brand-slate-blue border border-white/10 p-3 rounded-card text-white shadow-sm shrink-0">
      
      {/* 1. Share Client Review Link */}
      <button
        onClick={onShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-brand-navy border border-white/10 hover:border-brand-gold/30 hover:bg-brand-navy/60 text-xs font-bold uppercase tracking-wider rounded-badge transition-all"
        title="Generate client review link"
      >
        <Share2 className="w-4 h-4 text-brand-gold" />
        Share Link
      </button>

      {/* 2. Programmatic Word Download */}
      <button
        onClick={onWordExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2.5 bg-brand-navy border border-white/10 hover:border-brand-gold/30 hover:bg-brand-navy/60 text-xs font-bold uppercase tracking-wider rounded-badge transition-all disabled:opacity-50"
        title="Download editable Microsoft Word document"
      >
        {isExporting ? (
          <RefreshCw className="w-4 h-4 text-brand-gold animate-spin" />
        ) : (
          <FileDown className="w-4 h-4 text-brand-gold" />
        )}
        Export MS Word
      </button>

      {/* 3. Browser Print Panel */}
      <button
        onClick={onPrint}
        className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-navy hover:bg-brand-gold-light text-xs font-bold uppercase tracking-wider rounded-badge transition-all shadow-md shadow-brand-gold/10"
        title="Trigger browser print"
      >
        <Printer className="w-4 h-4" />
        Print Draft
      </button>

    </div>
  )
}
