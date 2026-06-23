'use client'

import { useState } from 'react'
import FeeResultModal from './FeeResultModal'
import { calculateLlpFee } from '@/lib/penaltyCalculator'

export default function LLPFeeCalc() {
  const [modalOpen, setModalOpen] = useState(false)
  const [result, setResult] = useState({
    totalFee: 0,
    normalFee: 0,
    additionalFee: 0,
    stampDuty: 0,
    adValoremFee: 0,
    showWarning: false,
    warningText: ''
  })

  const [formId, setFormId] = useState<'Form-8' | 'Form-11'>('Form-8')
  const [llpType, setLlpType] = useState<'Regular' | 'Small'>('Regular')
  const [contribution, setContribution] = useState('1000000')
  const [delay, setDelay] = useState('0')
  const [dpCount, setDpCount] = useState('2')

  const handleCalc = () => {
    const c = parseFloat(contribution) || 0
    const d = parseInt(delay) || 0
    const dp = parseInt(dpCount) || 2

    // Calculate using shared penaltyCalculator utility (LLP 2nd Amendment Rules 2022)
    const calcResult = calculateLlpFee({
      llpType,
      contribution: c,
      formId,
      dueDate: '',
      actualDate: '',
      daysDelayed: d,
      dpCount: dp
    })

    let warningText = ''
    let showWarning = false

    if (d > 0) {
      showWarning = true
      const rateText = llpType === 'Small' 
        ? 'Small LLPs are eligible for 50% concession on filing fees and lower delay multipliers.'
        : 'Regular LLPs are subject to standard delay multipliers (up to 30x normal fee).'

      warningText = `
        <div class="space-y-3">
          <p>Late filing of <strong>${d} days</strong> attracts an additional fee multiplier under the <strong>LLP (Second Amendment) Rules, 2022</strong>.</p>
          <p class="text-xs text-slate-500">${rateText}</p>
          <div class="mt-3 pt-3 border-t border-amber-200 dark:border-amber-900/50">
            <p class="font-bold text-amber-900 dark:text-amber-400 text-xs uppercase tracking-wide">Statutory Adjudication Penalty Exposure (LLP Amendment Act 2021):</p>
            <ul class="list-disc pl-4 mt-1 text-xs space-y-1">
              <li><strong>LLP Entity:</strong> ₹ ${calcResult.llpPenalty.toLocaleString('en-IN')} (₹100/day, capped at ₹1,00,000)</li>
              <li><strong>Designated Partners (${dp}):</strong> ₹ ${calcResult.dpPenalty.toLocaleString('en-IN')} (₹100/day per DP, capped at ₹50,000 each)</li>
            </ul>
            <p class="text-[10px] text-slate-500 mt-2">Note: Adjudication penalties are levied by the Registrar of Companies (ROC) after formal show-cause proceedings under Section 34/35.</p>
          </div>
        </div>
      `
    }

    setResult({
      totalFee: calcResult.totalPayable,
      normalFee: calcResult.normalFee,
      additionalFee: calcResult.lateFee,
      stampDuty: 0,
      adValoremFee: 0,
      showWarning,
      warningText
    })
    setModalOpen(true)

    // Log tool usage asynchronously
    fetch('/api/calculators/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'llp_late_fee',
        input: { formId, llpType, contribution: c, delay: d, dpCount: dp },
        result: { total: calcResult.totalPayable, normal: calcResult.normalFee, late: calcResult.lateFee }
      })
    }).catch(console.error)
  }

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl mb-6 text-sm">
        <strong>LLP Slabs:</strong> LLP late filing penalties are computed using the **LLP (Second Amendment) Rules, 2022** slab multiplier system, replacing the old flat ₹100/day rate.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Form Type</label>
          <select 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={formId} 
            onChange={(e) => setFormId(e.target.value as 'Form-8' | 'Form-11')}
          >
            <option value="Form-8">Form 8 — Statement of Account & Solvency</option>
            <option value="Form-11">Form 11 — Annual Return of LLP</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">LLP Classification</label>
          <select 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={llpType} 
            onChange={(e) => setLlpType(e.target.value as 'Regular' | 'Small')}
          >
            <option value="Regular">Regular LLP</option>
            <option value="Small">Small LLP (Contribution &le; ₹25L & Turnover &le; ₹40L)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Number of Designated Partners (DPs)</label>
          <input 
            type="number" 
            min="2"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={dpCount} 
            onChange={(e) => setDpCount(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Contribution of LLP (₹)</label>
          <input 
            type="number" 
            min="0"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={contribution} 
            onChange={(e) => setContribution(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delay in Filing (Days)</label>
          <input 
            type="number" 
            min="0"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all text-slate-900 dark:text-slate-100" 
            value={delay} 
            onChange={(e) => setDelay(e.target.value)} 
          />
          <p className="text-xs text-slate-500 mt-1">Days past the statutory due date (30th May for F-11, 30th Oct for F-8).</p>
        </div>
      </div>

      <button 
        onClick={handleCalc} 
        className="w-full mt-6 py-3.5 px-6 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
      >
        Calculate LLP Fee
        <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>

      <FeeResultModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        {...result} 
      />
    </div>
  )
}
