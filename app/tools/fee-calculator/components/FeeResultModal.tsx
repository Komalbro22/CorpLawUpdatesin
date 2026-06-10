import React from 'react'

interface FeeResultModalProps {
  isOpen: boolean
  onClose: () => void
  totalFee: number
  normalFee: number
  additionalFee: number
  stampDuty: number
  adValoremFee: number
  showWarning: boolean
  warningText: string
}

export default function FeeResultModal({
  isOpen,
  onClose,
  totalFee,
  normalFee,
  additionalFee,
  stampDuty,
  adValoremFee,
  showWarning,
  warningText
}: FeeResultModalProps) {
  if (!isOpen) return null

  const formatCurrency = (amount: number) => {
    return '₹ ' + Math.round(amount).toLocaleString('en-IN')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="p-6 md:p-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
            Fee Breakdown
          </div>

          <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Total Payable
            </div>
            <div className="text-4xl md:text-5xl font-black text-navy dark:text-white font-heading tracking-tight flex items-baseline gap-1">
              <span className="text-2xl text-slate-400">₹</span>
              {Math.round(totalFee).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-slate-600 dark:text-slate-400">Normal filing fee</span>
              <span className="font-bold text-navy dark:text-white">{formatCurrency(normalFee)}</span>
            </div>

            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-slate-600 dark:text-slate-400">Additional fee (late filing)</span>
              <span className={`font-bold ${additionalFee > 0 ? 'text-red-600 dark:text-red-400' : 'text-navy dark:text-white'}`}>
                {formatCurrency(additionalFee)}
              </span>
            </div>

            {stampDuty > 0 && (
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-slate-600 dark:text-slate-400">Stamp duty (indicative)</span>
                <span className="font-bold text-navy dark:text-white">{formatCurrency(stampDuty)}</span>
              </div>
            )}

            {adValoremFee > 0 && (
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-slate-600 dark:text-slate-400">Ad valorem fee</span>
                <span className="font-bold text-navy dark:text-white">{formatCurrency(adValoremFee)}</span>
              </div>
            )}
          </div>

          {showWarning && (
            <div className="mt-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3">
              <svg className="shrink-0 text-amber-500 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p 
                className="text-sm text-amber-800 dark:text-amber-200" 
                dangerouslySetInnerHTML={{ __html: warningText }} 
              />
            </div>
          )}

        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-navy dark:text-white mb-2">Need help with ROC Filings?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            CorpLawUpdates.in provides free tools for professionals. Check out our Document Generator to draft Board Resolutions and Agreements instantly.
          </p>
          <a href="/documents" className="inline-flex items-center justify-center w-full py-3 px-4 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl transition-colors">
            Try Document Generator
          </a>
        </div>
      </div>
    </div>
  )
}
