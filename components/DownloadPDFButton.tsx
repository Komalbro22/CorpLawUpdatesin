'use client'

import { useState } from 'react'

export default function DownloadPDFButton() {
    const [showTip, setShowTip] = useState(false)

    function handlePrint() {
        setShowTip(true)
        setTimeout(() => {
            window.print()
            setTimeout(() => setShowTip(false), 3000)
        }, 300)
    }

    return (
        <div className="print:hidden relative">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2
                   bg-slate-100 hover:bg-slate-200
                   text-slate-700 rounded-lg text-sm
                   font-medium transition-colors
                   border border-slate-200"
                aria-label="Download article as PDF"
            >
                <svg width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
                Download PDF
            </button>
            {showTip && (
                <div className="absolute bottom-10 left-0 z-50
                        bg-navy text-white text-xs
                        rounded-lg px-3 py-2 w-64
                        shadow-lg">
                    💡 In print dialog: keep <strong>Background graphics ✅ checked</strong> and uncheck <strong>Headers and footers</strong> for best PDF quality
                </div>
            )}
            <p className="text-xs text-slate-400 mt-1">
                In print dialog: ✅ Background graphics · ☐ Headers and footers
            </p>
        </div>
    )
}
