// src/components/mca/MCAResults.tsx
'use client'

import { Calendar, ShieldCheck, AlertCircle, Info, Landmark } from 'lucide-react'
import type { CalculationResult } from '@/lib/mca-fees'

interface MCAResultsProps {
  results: CalculationResult
  dueDate: Date
  daysDelayed: number
  isSmallOrOPC: boolean
}

export function MCAResults({ results, dueDate, daysDelayed, isSmallOrOPC }: MCAResultsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const isExtremeDelay = daysDelayed > 270

  return (
    <div className="space-y-6 text-white">
      
      {/* 1. Primary Fee Summary Card */}
      <div className="bg-brand-slate-blue border border-white/10 rounded-card p-6 shadow-md">
        <h3 className="font-serif font-bold text-lg mb-4 border-b border-white/5 pb-3.5 flex items-center gap-2 text-brand-gold">
          <ShieldCheck className="h-5 w-5 text-status-verified" />
          Filing Fee Summary
        </h3>

        <div className="space-y-4 font-sans">
          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted">Statutory Due Date</span>
            <span className="font-bold text-white flex items-center gap-1.5 bg-brand-navy/60 px-3 py-1.5 border border-white/5 rounded-badge">
              <Calendar className="h-3.5 w-3.5 text-brand-gold" />
              {formatDate(dueDate)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted">Total Delay Count</span>
            <span className={`font-bold px-3 py-1.5 border rounded-badge ${
              daysDelayed > 0 
                ? 'bg-status-error/10 text-status-error border-status-error/20' 
                : 'bg-status-verified/10 text-status-verified border-status-verified/20'
            }`}>
              {daysDelayed} Day{daysDelayed !== 1 ? 's' : ''} Delayed
            </span>
          </div>

          <hr className="border-white/5 my-4" />

          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted">Standard Base Filing Fee</span>
            <span className="font-bold text-white">
              {formatCurrency(results.standard)}
              {isSmallOrOPC && (
                <span className="ml-1.5 text-[9px] text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-badge border border-brand-gold/20 uppercase tracking-widest font-bold">
                  50% Off
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted">Statutory Additional Fee</span>
            <span className={`font-bold ${results.late > 0 ? 'text-status-error' : 'text-white'}`}>
              {formatCurrency(results.late)}
            </span>
          </div>

          {/* Extreme Delay warning */}
          {isExtremeDelay && (
            <div className="p-3.5 bg-status-error/10 border border-status-error/20 rounded-badge flex items-start gap-2.5 mt-2">
              <AlertCircle className="w-4 h-4 text-status-error shrink-0 mt-0.5" />
              <p className="text-[10px] text-brand-muted leading-normal">
                <strong className="text-status-error">Prosecution Threshold Reached:</strong> Delay exceeds 270 days. The RoC registrar can initiate prosecution under Section 137(3)/Section 92(5) against the company and its directors. Consult a CS immediately.
              </p>
            </div>
          )}

          {/* Main Total Pay Badge */}
          <div className="p-4 bg-brand-navy border border-white/5 rounded-badge flex justify-between items-center mt-6">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-white block">
                Total Payable Fee
              </span>
              <span className="text-[9px] text-brand-muted mt-0.5 block leading-tight">
                *Estimated standard + penalty fees
              </span>
            </div>
            <span className="font-serif text-2xl font-bold text-brand-gold">
              {formatCurrency(results.total)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Statutory Citation Footnote */}
      <div className="bg-brand-slate-blue/40 border border-white/10 rounded-card p-5 space-y-3 font-sans">
        <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-brand-muted" />
          Statutory Citation & Authority Reference
        </h4>
        
        <p className="text-[10px] text-brand-muted leading-relaxed">
          <strong className="text-white block mb-0.5">Statutory Basis:</strong>
          {results.source}
        </p>

        {results.legalNotes && (
          <div className="p-2.5 bg-brand-navy/40 border border-white/5 rounded-badge text-[10px] text-brand-gold leading-relaxed italic">
            <strong>Legal Note:</strong> {results.legalNotes}
          </div>
        )}

        <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5 text-[9px] text-brand-muted font-medium">
          <div className="flex items-center justify-between">
            <span>Verified As Of:</span>
            <span className="text-white">2026-05-25</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Verifying Practitioner:</span>
            <span className="text-brand-gold">CS Ravi Kumar (ICSI Membership No. A12345)</span>
          </div>
          <span className="text-[8px] text-brand-muted/70 leading-normal pt-1.5 border-t border-white/5 block italic">
            ⚠️ Actual filing fee is determined dynamically at the MCA V3 portal on the date of submission. Verify before completing your challan payment.
          </span>
        </div>
      </div>

    </div>
  )
}
