'use client'

import { FileDown } from 'lucide-react'

interface DownloadPDFButtonProps {
    compact?: boolean
}

export default function DownloadPDFButton({ compact = false }: DownloadPDFButtonProps) {
    function handlePrint() {
        window.print()
    }

    return (
        <button
            onClick={handlePrint}
            className={`flex items-center gap-1.5 rounded-lg font-medium transition-colors border border-slate-200 print:hidden ${
                compact 
                    ? 'px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs' 
                    : 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm'
            }`}
            aria-label="Download PDF as article"
        >
            <FileDown className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
            Download PDF
        </button>
    )
}
