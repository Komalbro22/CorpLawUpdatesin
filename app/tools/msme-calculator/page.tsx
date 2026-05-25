'use client'

import React, { useState, useEffect } from 'react'
import { calculateMSMEInterest, MSMEResult } from '@/lib/msme-interest'
import { TrendingUp, Calendar, Coins, Info, FileText, CheckCircle2 } from 'lucide-react'

export default function MsmeCalculatorPage() {
  const [principal, setPrincipal] = useState(100000)
  const [invoiceDate, setInvoiceDate] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [creditDays, setCreditDays] = useState<15 | 45>(45)
  const [bankRate, setBankRate] = useState(6.75) // RBI Bank Rate: 6.75% -> MSME rate: 20.25%
  const [lastVerifiedHours, setLastVerifiedHours] = useState(4) // Mock hours since verified in DB settings

  // Set default dates
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    setPaymentDate(todayStr)
    
    // Set invoice date to 60 days ago as default to show some interest delay
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0]
    setInvoiceDate(sixtyDaysAgo)
  }, [])

  const results = calculateMSMEInterest(
    principal,
    invoiceDate ? new Date(invoiceDate) : new Date(),
    paymentDate ? new Date(paymentDate) : new Date(),
    bankRate,
    creditDays
  )

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)
  }

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Verification Badge logic: 🟢 <= 24h, 🟡 <= 48h, 🔴 > 48h
  const renderVerificationBadge = () => {
    if (lastVerifiedHours <= 24) {
      return (
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200/50 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          🟢 RBI Rate: {bankRate.toFixed(2)}% (Auto-Verified Today)
        </span>
      )
    } else if (lastVerifiedHours <= 48) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          🟡 RBI Rate: {bankRate.toFixed(2)}% (Verified {lastVerifiedHours} hrs ago)
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200/50 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          🔴 Rate stale — verify with RBI website
        </span>
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Title */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-navy flex items-center justify-center sm:justify-start gap-2.5">
              <TrendingUp className="h-8 w-8 text-amber-500" />
              MSME Delayed Payment Interest Calculator
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Statutory 3× RBI compounding interest estimator under Section 16 of the MSMED Act, 2006.
            </p>
          </div>
          <div>
            {renderVerificationBadge()}
          </div>
        </div>

        {/* Input parameters and math summary grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* Inputs */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">1. Invoice Principal Amount</label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl pl-8 pr-3 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">2. Allowed Credit Period (Days)</label>
                <select
                  value={creditDays}
                  onChange={(e) => setCreditDays(Number(e.target.value) as 15 | 45)}
                  className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-sm p-3 bg-white"
                >
                  <option value={45}>45 Days (Standard Agreement Max)</option>
                  <option value={15}>15 Days (No Written Agreement)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">3. Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-sm p-3"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">4. Payment / Valuation Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-sm p-3"
                />
              </div>
            </div>

            {/* Configurable RBI Bank Rate */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold text-navy block">RBI Bank Rate Reference</span>
                <span className="text-[10px] text-slate-400">Section 49 statutory rate used for calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={bankRate}
                  onChange={(e) => setBankRate(Number(e.target.value))}
                  className="w-20 border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-lg text-center text-xs font-semibold py-1.5 px-2 bg-white"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-navy mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                Interest Accrual Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Invoice Date:</span>
                  <span className="font-semibold text-navy">{formatDateStr(invoiceDate)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Statutory Credit Due:</span>
                  <span className="font-semibold text-navy">
                    {formatDateStr(invoiceDate ? new Date(new Date(invoiceDate).getTime() + creditDays * 86400000).toISOString().split('T')[0] : '')}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Days of Delay:</span>
                  <span className="font-semibold text-navy">{results.delayDays} Days</span>
                </div>

                <hr className="border-slate-100" />

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Annual Compounding Rate (3x):</span>
                  <span className="font-semibold text-red-500">{results.annualRate.toFixed(2)}% p.a.</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Accrued Compound Interest:</span>
                  <span className="font-semibold text-red-500">{formatCurrency(results.interest)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between items-center mt-6">
                  <span className="font-bold text-sm text-navy uppercase tracking-wider">Total Outstanding:</span>
                  <span className="font-heading text-xl font-bold text-amber-600">
                    {formatCurrency(results.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Footnote */}
            <div className="bg-slate-100/70 border border-slate-200/60 rounded-xl p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-500" />
                Statutory Citations & Authority
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                <strong>Source:</strong> {results.rateSource} read with {results.sectionCited}.
              </p>
              <p className="text-[9px] text-slate-400 pt-1 border-t border-slate-200/60 font-medium">
                Note: Under Section 23 of the MSMED Act, the compound interest paid to an MSME is strictly **non-deductible** under the Income Tax Act, 1961.
              </p>
            </div>

          </div>

        </div>

        {/* Monthly compounding rests breakdown table (Value added feature) */}
        {results.breakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm overflow-hidden mb-12">
            <h3 className="font-heading text-lg font-bold text-navy mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Monthly Rests Compounding Schedule
            </h3>
            
            <div className="w-full overflow-x-auto border border-slate-200/80 rounded-xl shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80">
                    <th className="font-heading font-bold text-xs text-navy uppercase tracking-wider p-4 text-left">Period</th>
                    <th className="font-heading font-bold text-xs text-navy uppercase tracking-wider p-4 text-center">Days</th>
                    <th className="font-heading font-bold text-xs text-navy uppercase tracking-wider p-4 text-right">Opening Balance</th>
                    <th className="font-heading font-bold text-xs text-navy uppercase tracking-wider p-4 text-right">Compounded Interest Added</th>
                    <th className="font-heading font-bold text-xs text-navy uppercase tracking-wider p-4 text-right">Closing Compounded Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.breakdown.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-xs font-semibold text-navy">{row.monthName}</td>
                      <td className="p-4 text-xs text-center text-slate-500">{row.daysInPeriod} Days</td>
                      <td className="p-4 text-xs text-right text-slate-700">{formatCurrency(row.openingBalance)}</td>
                      <td className="p-4 text-xs text-right text-red-500 font-medium">+{formatCurrency(row.interestAdded)}</td>
                      <td className="p-4 text-xs text-right text-navy font-bold">{formatCurrency(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
