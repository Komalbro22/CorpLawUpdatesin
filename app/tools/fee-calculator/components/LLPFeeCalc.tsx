'use client'

import { useState } from 'react'
import FeeResultModal from './FeeResultModal'

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

  const [formType, setFormType] = useState('Form-8')
  const [contribution, setContribution] = useState('1000000')
  const [delay, setDelay] = useState('0')

  const getLLPBaseFee = (contrib: number) => {
    if (contrib <= 100000) return 50
    if (contrib <= 500000) return 100
    if (contrib <= 1000000) return 150
    if (contrib <= 2500000) return 200
    if (contrib <= 10000000) return 400
    return 600
  }

  const handleCalc = () => {
    const c = parseInt(contribution) || 0
    const d = parseInt(delay) || 0
    
    // Default LLP Base fee based on contribution
    let baseFee = getLLPBaseFee(c)
    
    if (formType === 'Form-3') {
      baseFee = getLLPBaseFee(c)
    } else if (formType === 'DIR-3-KYC') {
      baseFee = d > 0 ? 5000 : 0
    }

    let additionalFee = 0
    let showWarning = false
    let warningText = ''

    if (d > 0 && formType !== 'DIR-3-KYC') {
      // LLPs generally have a strict ₹100 per day penalty
      additionalFee = d * 100
      showWarning = true
      warningText = `LLP late filing penalty is <strong>₹100 per day</strong>. ${d} days × ₹100 = ₹ ${additionalFee.toLocaleString('en-IN')}.`
    } else if (d > 0 && formType === 'DIR-3-KYC') {
      showWarning = true
      warningText = `DIR-3 KYC filed after due date attracts a flat penalty of ₹5,000.`
    }

    setResult({
      totalFee: baseFee + additionalFee,
      normalFee: baseFee,
      additionalFee,
      stampDuty: 0,
      adValoremFee: 0,
      showWarning,
      warningText
    })
    setModalOpen(true)
  }

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl mb-6 text-sm">
        <strong>Note:</strong> Limited Liability Partnerships (LLPs) attract a flat penalty of ₹100 per day for late filing of most forms (like Form 8 and Form 11) with no upper cap.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Form type</label>
          <select 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" 
            value={formType} 
            onChange={(e) => setFormType(e.target.value)}
          >
            <option value="Form-8">Form 8 — Statement of Account & Solvency</option>
            <option value="Form-11">Form 11 — Annual Return of LLP</option>
            <option value="Form-3">Form 3 — LLP Agreement and Changes</option>
            <option value="Form-4">Form 4 — Notice of appointment/change in Partners</option>
            <option value="DIR-3-KYC">DIR-3 KYC — Partner KYC</option>
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Contribution of LLP (₹)</label>
          <input 
            type="number" 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" 
            value={contribution} 
            onChange={(e) => setContribution(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delay in filing (days)</label>
          <input 
            type="number" 
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" 
            value={delay} 
            onChange={(e) => setDelay(e.target.value)} 
          />
          <p className="text-xs text-slate-500 mt-1">Days past due date — 0 if on-time</p>
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
