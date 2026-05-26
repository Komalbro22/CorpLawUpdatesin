// src/components/mca/MCAResults.tsx
'use client'

import { Calendar, ShieldCheck, AlertCircle } from 'lucide-react'
import type { CalculationResult } from '@/lib/mca-fees'
import { StatutoryDisclaimer } from '@/components/shared/StatutoryDisclaimer'
import { SourceCitation } from '@/components/shared/SourceCitation'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'

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

        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Statutory Due Date</span>
            <span className="font-bold text-white flex items-center gap-1.5 bg-brand-navy/60 px-3 py-1.5 border border-white/5 rounded-badge">
              <Calendar className="h-3.5 w-3.5 text-brand-gold" />
              {formatDate(dueDate)}
            </span>
          </div>

          <div className="flex justify-between items-center">
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

          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Standard Base Filing Fee</span>
            <span className="font-bold text-white">
              {formatCurrency(results.standard)}
              {isSmallOrOPC && (
                <span className="ml-1.5 text-[9px] text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-badge border border-brand-gold/20 uppercase tracking-widest font-bold font-sans">
                  50% Off
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Statutory Additional Fee</span>
            <span className={`font-bold ${results.late > 0 ? 'text-status-error' : 'text-white'}`}>
              {formatCurrency(results.late)}
            </span>
          </div>

          {/* Extreme Delay Warning */}
          {isExtremeDelay && (
            <div className="p-3.5 bg-status-error/10 border border-status-error/20 rounded-badge flex items-start gap-2.5 mt-2">
              <AlertCircle className="w-4 h-4 text-status-error shrink-0 mt-0.5" />
              <p className="text-[10px] text-brand-muted leading-normal">
                <strong className="text-status-error">Prosecution Threshold Reached:</strong> Delay exceeds 270 days. The RoC registrar can initiate prosecution under Section 137(3)/Section 92(5) against the company and its directors. Consult a CS immediately.
              </p>
            </div>
          )}

          {/* Main Total Pay Box */}
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

      {/* 2. Shared Statutory Citation & Disclaimer Footer */}
      <SourceCitation basis={results.source} notes={results.legalNotes} />
      <VerifiedBadge date="2026-05-25" practitioner="CS Ravi Kumar" regNo="ICSI Membership No. A12345" />
      <StatutoryDisclaimer />

    </div>
  )
}
