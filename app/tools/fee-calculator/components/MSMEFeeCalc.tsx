'use client'

import { useState } from 'react'

export default function MSMEFeeCalc({ initialBankRate = '6.75' }: { initialBankRate?: string }) {
  const [principalAmount, setPrincipalAmount] = useState('100000')
  const [delayDays, setDelayDays] = useState('45')
  const [repoRate, setRepoRate] = useState(initialBankRate)

  const [result, setResult] = useState<{interest: number, total: number} | null>(null)

  const handleCalc = () => {
    const p = parseFloat(principalAmount) || 0
    const d = parseInt(delayDays) || 0
    const r = parseFloat(repoRate) || 0

    // MSME Act Section 16: Compound interest with monthly rests at 3 times the bank rate
    const yearlyRate = (r * 3) / 100
    const monthlyRate = yearlyRate / 12

    let interest = 0
    if (d > 0) {
      const completeMonths = Math.floor(d / 30)
      const remainingDays = d % 30

      let runningPrincipal = p
      let runningInterest = 0

      for (let m = 1; m <= completeMonths; m++) {
        const interestThisMonth = runningPrincipal * monthlyRate
        runningInterest += interestThisMonth
        runningPrincipal = p + runningInterest
      }

      if (remainingDays > 0) {
        const interestRemaining = runningPrincipal * (monthlyRate * remainingDays / 30)
        runningInterest += interestRemaining
      }
      interest = runningInterest
    }
    
    setResult({
      interest: Math.round(interest),
      total: Math.round(p + interest)
    })
  }

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 p-4 rounded-xl mb-6 text-sm">
        <strong>MSME Samadhaan:</strong> Under Section 16 of the MSMED Act, delayed payments to Micro and Small Enterprises attract compound interest with monthly rests at <strong>three times the RBI repo rate</strong>.
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Principal Invoice Amount (₹)</label>
          <input 
            type="number" 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" 
            value={principalAmount} 
            onChange={(e) => setPrincipalAmount(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delay beyond 45 days (Days)</label>
          <input 
            type="number" 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" 
            value={delayDays} 
            onChange={(e) => setDelayDays(e.target.value)} 
          />
          <p className="text-xs text-slate-500 mt-1">Payment is legally due within 45 days of acceptance.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current RBI Bank Rate (%)</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" 
            value={repoRate} 
            onChange={(e) => setRepoRate(e.target.value)} 
          />
          <p className="text-xs text-slate-500 mt-1">Applicable interest rate will be {(parseFloat(repoRate) * 3).toFixed(2)}% per annum.</p>
        </div>
      </div>

      <button 
        onClick={handleCalc} 
        className="w-full mt-6 py-3.5 px-6 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
      >
        Calculate MSME Interest
        <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>

      {result && (
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 font-heading">Calculation Result</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Principal Amount</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">₹ {Math.round(parseFloat(principalAmount) || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Interest Rate (3x Bank Rate)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{(parseFloat(repoRate) * 3).toFixed(2)}% p.a. (compounded monthly)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Total Interest Accrued</span>
              <span className="font-bold text-red-600 dark:text-red-400">₹ {result.interest.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Total Payable</span>
              <span className="text-2xl font-black text-navy dark:text-white">₹ {result.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
