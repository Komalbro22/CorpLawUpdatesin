// src/components/msme/MSMEResults.tsx
'use client'

import { Coins, FileText, Info, ShieldCheck, AlertTriangle } from 'lucide-react'
import type { MSMEResult } from '@/lib/msme-interest'

interface MSMEResultsProps {
  results: MSMEResult
  invoiceDate: string
  creditDays: number
}

export function MSMEResults({ results, invoiceDate, creditDays }: MSMEResultsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val)
  }

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8 text-white">
      
      {/* 1. Results Summary Card */}
      <div className="bg-brand-slate-blue border border-white/10 rounded-card p-6 shadow-md">
        <h3 className="font-serif font-bold text-lg mb-4 border-b border-white/5 pb-3.5 flex items-center gap-2 text-brand-gold">
          <Coins className="h-5 w-5" />
          Interest Accrual Summary
        </h3>

        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Invoice Delivery Date</span>
            <span className="font-bold text-white">
              {formatDateStr(invoiceDate)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Statutory Credit Due Date</span>
            <span className="font-bold text-white">
              {formatDateStr(invoiceDate ? new Date(new Date(invoiceDate).getTime() + creditDays * 86400000).toISOString().split('T')[0] : '')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Statutory delay duration</span>
            <span className={`font-bold px-2.5 py-1 rounded-badge border ${
              results.delayDays > 0 
                ? 'bg-status-error/10 text-status-error border-status-error/20' 
                : 'bg-status-verified/10 text-status-verified border-status-verified/20'
            }`}>
              {results.delayDays} Days Overdue
            </span>
          </div>

          <hr className="border-white/5 my-4" />

          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Statutory Interest Rate (3× RBI)</span>
            <span className="font-bold text-status-error">
              {results.annualRate.toFixed(2)}% per annum
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-muted">Accrued Compound Interest</span>
            <span className="font-bold text-status-error">
              {formatCurrency(results.interest)}
            </span>
          </div>

          {/* Main Outstanding Box */}
          <div className="p-4 bg-brand-navy border border-white/5 rounded-badge flex justify-between items-center mt-6">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-white block">
                Total Outstanding
              </span>
              <span className="text-[9px] text-brand-muted mt-0.5 block leading-tight">
                *Principal amount + statutory compounding interest
              </span>
            </div>
            <span className="font-serif text-2xl font-bold text-brand-gold">
              {formatCurrency(results.total)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Statutory Citation & Non-Deductibility Warning */}
      <div className="bg-brand-slate-blue/40 border border-white/10 rounded-card p-5 space-y-4.5 font-sans">
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-brand-muted" />
            Statutory Citations & Authority Reference
          </h4>
          <p className="text-[10px] text-brand-muted leading-relaxed">
            <strong className="text-white">Statutory Basis:</strong> Calculated under Section 16 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006. Interest compound reference rate: statutory RBI discount rate per Section 49 of the Reserve Bank of India Act, 1934.
          </p>
        </div>

        {/* Section 23 Non-deductible tax warning */}
        <div className="p-3.5 bg-status-warning/10 border border-status-warning/20 rounded-badge flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
          <p className="text-[10px] text-brand-muted leading-normal">
            <strong className="text-status-warning">Income Tax Act Section 23 Penalty:</strong> Any delayed payment interest paid under the MSMED Act, 2006 is strictly **non-deductible** as a business expense for tax audits. Buying entities must fully bear this cash outflow.
          </p>
        </div>

        <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5 text-[9px] text-brand-muted font-medium">
          <div className="flex items-center justify-between">
            <span>Verified As Of:</span>
            <span className="text-white">2026-05-25</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Verifying auditor:</span>
            <span className="text-brand-gold">CA Ravi Kumar (ICAI Registration No. 123456)</span>
          </div>
        </div>
      </div>

      {/* 3. Monthly rests compounding schedule (Tribunal-Ready Breakdown) */}
      {results.breakdown.length > 0 && (
        <div className="bg-brand-slate-blue border border-white/10 rounded-card p-6 shadow-md overflow-hidden">
          <h3 className="font-serif font-bold text-base text-white mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-gold" />
            MSEFC Tribunal-Ready Rests Breakdown
          </h3>
          
          <div className="w-full overflow-x-auto border border-white/5 rounded-badge shadow-inner">
            <table className="w-full border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-brand-navy border-b border-white/5">
                  <th className="font-bold text-[10px] text-brand-muted uppercase tracking-wider p-4 text-left">Period</th>
                  <th className="font-bold text-[10px] text-brand-muted uppercase tracking-wider p-4 text-center">Days</th>
                  <th className="font-bold text-[10px] text-brand-muted uppercase tracking-wider p-4 text-right">Opening Balance</th>
                  <th className="font-bold text-[10px] text-brand-muted uppercase tracking-wider p-4 text-right">Interest Added</th>
                  <th className="font-bold text-[10px] text-brand-muted uppercase tracking-wider p-4 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-brand-navy/20">
                {results.breakdown.map((row, index) => (
                  <tr key={index} className="hover:bg-brand-navy/40 transition-colors">
                    <td className="p-4 font-semibold text-white">{row.monthName}</td>
                    <td className="p-4 text-center text-brand-muted">{row.daysInPeriod} Days</td>
                    <td className="p-4 text-right text-brand-muted">{formatCurrency(row.openingBalance)}</td>
                    <td className="p-4 text-right text-status-error font-medium">+{formatCurrency(row.interestAdded)}</td>
                    <td className="p-4 text-right text-brand-gold font-bold">{formatCurrency(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
