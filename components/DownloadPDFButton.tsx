'use client'

import { FileDown } from 'lucide-react'

export default function DownloadPDFButton() {
    function handlePrint() {
        window.print()
    }

    return (
        <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2
                 bg-slate-100 hover:bg-slate-200
                 text-slate-700 rounded-lg text-sm
                 font-medium transition-colors
                 border border-slate-200 print:hidden"
            aria-label="Download article as PDF"
        >
            <FileDown className="h-4 w-4" aria-hidden />
            Download PDF
        </button>
    )
}
