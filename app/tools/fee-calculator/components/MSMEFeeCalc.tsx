'use client'

import { useState } from 'react'
import { calculateMsmeInterest, CompoundingScheduleItem } from '@/lib/penaltyCalculator'

export default function MSMEFeeCalc({ initialBankRate = '6.75' }: { initialBankRate?: string }) {
  const [invoiceAmount, setInvoiceAmount] = useState('100000')
  const [acceptanceDate, setAcceptanceDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 60)
    return d.toISOString().split('T')[0]
  })
  const [agreedPaymentDate, setAgreedPaymentDate] = useState('')
  const [actualPaymentDate, setActualPaymentDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [bankRate, setBankRate] = useState(initialBankRate)

  const [result, setResult] = useState<{
    principal: number
    appointedDay: string
    daysDelayed: number
    interestRate: number
    accruedInterest: number
    totalPayable: number
    schedule: CompoundingScheduleItem[]
    isOverdue: boolean
  } | null>(null)

  const handleCalc = () => {
    const amt = parseFloat(invoiceAmount) || 0
    const br = parseFloat(bankRate) || 6.75

    // Execute the monthly compounding rests calculation logic (Section 16 MSMED Act)
    const calc = calculateMsmeInterest({
      invoiceAmount: amt,
      acceptanceDate,
      agreedPaymentDate: agreedPaymentDate || '',
      actualPaymentDate,
      bankRate: br
    })

    setResult(calc)

    // Log tool usage asynchronously
    fetch('/api/calculators/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'msme_penalty',
        input: { invoiceAmount: amt, bankRate: br, daysDelayed: calc.daysDelayed },
        result: { accruedInterest: calc.accruedInterest, totalPayable: calc.totalPayable }
      })
    }).catch(console.error)
  }

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 p-4 rounded-xl mb-6 text-sm">
        <strong>MSMED Act Section 15 & 16:</strong> Payment to Micro/Small enterprises must be made within the agreed period (max **45 days** from acceptance) or 15 days if no agreement exists. Beyond this appointed day, buyers must pay compound interest with **monthly rests at 3x the RBI Bank Rate**.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invoice / Principal Amount (₹)</label>
          <input 
            type="number" 
            min="0"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={invoiceAmount} 
            onChange={(e) => setInvoiceAmount(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Acceptance / Delivery</label>
          <input 
            type="date" 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={acceptanceDate} 
            onChange={(e) => setAcceptanceDate(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Agreed Payment Date (Optional)</label>
          <input 
            type="date" 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={agreedPaymentDate} 
            onChange={(e) => setAgreedPaymentDate(e.target.value)} 
          />
          <p className="text-[10px] text-slate-500 mt-1">Capped at 45 days from acceptance by law.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Actual Payment / Settlement Date</label>
          <input 
            type="date" 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={actualPaymentDate} 
            onChange={(e) => setActualPaymentDate(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">RBI Bank Rate (%)</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={bankRate} 
            onChange={(e) => setBankRate(e.target.value)} 
          />
          <p className="text-[10px] text-slate-500 mt-1">Current repo rate is used as RBI reference rate.</p>
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 font-heading">Calculation Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Principal Invoice Amount</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">₹ {Math.round(result.principal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Appointed Day (Payment Due)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.appointedDay}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Days Delayed</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.daysDelayed} Days</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Compounding Rate (3x Bank Rate)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.interestRate.toFixed(2)}% p.a.</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Total Interest Accrued</span>
              <span className={`font-bold ${result.accruedInterest > 0 ? 'text-red-650 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                ₹ {Math.round(result.accruedInterest).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Total Amount Payable</span>
              <span className="text-2xl font-black text-navy dark:text-white">₹ {Math.round(result.totalPayable).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Monthly Rests Schedule Table */}
          {result.schedule && result.schedule.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-heading">Monthly Compounding Schedule (Rests)</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Rest</th>
                      <th className="px-3 py-2 font-semibold text-right">Elapsed Days</th>
                      <th className="px-3 py-2 font-semibold text-right">Monthly Interest (₹)</th>
                      <th className="px-3 py-2 font-semibold text-right">Cumulative Int. (₹)</th>
                      <th className="px-3 py-2 font-semibold text-right">Balance Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                    {result.schedule.map((item) => (
                      <tr key={item.month} className="hover:bg-slate-50 dark:hover:bg-slate-850/40">
                        <td className="px-3 py-2 font-medium">Month {item.month}</td>
                        <td className="px-3 py-2 text-right font-mono">{item.daysElapsed}</td>
                        <td className="px-3 py-2 text-right font-mono">{Math.round(item.interestThisMonth).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-right font-mono text-red-600 dark:text-red-400 font-bold">{Math.round(item.cumulativeInterest).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-100 font-bold">{Math.round(item.totalPayable).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                * Appointed Day is day 16 after acceptance. If agreed in writing, payment is due on the agreed date (max 45 days). Overdue interest compounds at the end of each 30-day rest period.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
