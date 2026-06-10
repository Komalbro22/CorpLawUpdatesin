'use client'

import React, { useState, useRef } from 'react'
import { MCAForm } from '@/data/mca-forms'

interface ResultRow {
  component: string
  category: string
  basis: string
  amount: number
}

// SPICe+ Stamp Duty Base Estimates (Simplified)
const stateStampDuty: Record<string, { moa: number, aoa: number }> = {
  'Maharashtra': { moa: 1000, aoa: 500 },
  'Delhi': { moa: 200, aoa: 300 },
  'Karnataka': { moa: 1000, aoa: 1000 },
  'Tamil Nadu': { moa: 1000, aoa: 300 },
  'Gujarat': { moa: 100, aoa: 1000 },
  'Rajasthan': { moa: 500, aoa: 500 }, // AOA is technically 0.5%, simplifying
  'West Bengal': { moa: 300, aoa: 300 },
  'Uttar Pradesh': { moa: 2000, aoa: 1000 },
  'Telangana': { moa: 500, aoa: 500 },
  'Kerala': { moa: 5000, aoa: 1000 },
  'Other': { moa: 1000, aoa: 1000 }
}

function getNormalFee(capital: number, isSmall: boolean): number {
  if (isSmall) {
    if (capital <= 100000) return 50
    if (capital <= 500000) return 100
    if (capital <= 2500000) return 150
    return 200
  } else {
    if (capital <= 100000) return 200
    if (capital <= 500000) return 300
    if (capital <= 2500000) return 400
    if (capital <= 10000000) return 500
    return 600
  }
}

function getMultiplier(delay: number): number {
  if (delay <= 0) return 0
  if (delay <= 15) return 1
  if (delay <= 30) return 2
  if (delay <= 60) return 4
  if (delay <= 90) return 6
  if (delay <= 180) return 10
  return 12
}

export default function FormSpecificCalc({ form }: { form: MCAForm }) {
  const [companyType, setCompanyType] = useState('private')
  const [capital, setCapital] = useState(100000)
  
  // Date based
  const [dueDate, setDueDate] = useState('')
  const [actualDate, setActualDate] = useState('')
  
  // Day based
  const [delayDaysInput, setDelayDaysInput] = useState(0)

  // SPICe+ specific
  const [state, setState] = useState('Maharashtra')
  const [directors, setDirectors] = useState(2)

  const [hasCalculated, setHasCalculated] = useState(false)
  const [results, setResults] = useState<{ rows: ResultRow[], total: number } | null>(null)
  
  const pdfRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const isDateBased = form.slug === 'mgt-7' || form.slug === 'aoc-4'
  const isSpice = form.slug === 'spice-plus'

  const calculateDelay = () => {
    if (isDateBased) {
      if (!dueDate || !actualDate) return 0
      const d1 = new Date(dueDate)
      const d2 = new Date(actualDate)
      const diffTime = Math.max(0, d2.getTime() - d1.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return Math.max(0, delayDaysInput)
  }

  const handleCalculate = () => {
    const isSmall = companyType === 'opc' || companyType === 'small'
    const rows: ResultRow[] = []
    let total = 0
    
    if (isSpice) {
      // 1. MCA Fee (Waived up to 15L)
      const mcaFee = capital <= 1500000 ? 0 : getNormalFee(capital, false)
      rows.push({
        component: 'MCA Incorporation Fee',
        category: 'Fixed',
        basis: capital <= 1500000 ? 'Waived (≤ ₹15L Capital)' : 'Capital slab',
        amount: mcaFee
      })

      // 2. DIN Fee (>3 directors)
      if (directors > 3) {
        const dinFee = (directors - 3) * 500
        rows.push({
          component: 'DIN Allotment Fee',
          category: 'Fixed',
          basis: `${directors - 3} extra directors @ ₹500`,
          amount: dinFee
        })
        total += dinFee
      }

      // 3. Stamp Duty
      const sd = stateStampDuty[state] || stateStampDuty['Other']
      rows.push({
        component: 'Estimated MOA Stamp Duty',
        category: 'State Tax',
        basis: `Rates for ${state}`,
        amount: sd.moa
      })
      rows.push({
        component: 'Estimated AOA Stamp Duty',
        category: 'State Tax',
        basis: `Rates for ${state}`,
        amount: sd.aoa
      })
      
      total += mcaFee + sd.moa + sd.aoa

    } else {
      // Normal logic
      let baseFee = 0
      if (form.normalFeeStructure === 'capital_slab') {
        baseFee = getNormalFee(capital, form.concessionApplies ? isSmall : false)
        rows.push({
          component: 'Normal Filing Fee',
          category: 'Fixed',
          basis: `Capital slab (${form.concessionApplies && isSmall ? 'Concessional' : 'Standard'})`,
          amount: baseFee
        })
      }

      const delay = calculateDelay()
      let lateFee = 0
      if (delay > 0) {
        if (form.penaltyType === 'per_day') {
          lateFee = delay * 100
          rows.push({
            component: 'Additional Fee (Penalty)',
            category: 'Variable',
            basis: `${delay} days @ ₹100/day`,
            amount: lateFee
          })
        } else if (form.penaltyType === 'multiplier') {
          const mult = getMultiplier(delay)
          lateFee = baseFee * mult
          rows.push({
            component: 'Additional Fee (Penalty)',
            category: 'Variable',
            basis: `Delay ${delay}d (${mult}x base fee)`,
            amount: lateFee
          })
        } else if (form.penaltyType === 'flat') {
          lateFee = parseInt(form.penaltyRate.replace(/\D/g, '')) || 5000
          rows.push({
            component: 'Additional Fee (Penalty)',
            category: 'Fixed',
            basis: form.penaltyRate,
            amount: lateFee
          })
        }
      }
      total = baseFee + lateFee
    }

    setResults({ rows, total })
    setHasCalculated(true)
  }

  const delayValue = calculateDelay()

  const generatePDF = async () => {
    if (!pdfRef.current || !results) return
    setIsGeneratingPDF(true)
    
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`CorpLawUpdates_SPICe_Estimate_${new Date().getTime()}.pdf`)
    } catch (error) {
      console.error('PDF generation failed', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Form Type
          </label>
          <input 
            type="text" 
            readOnly 
            value={`${form.formNumber} — ${form.formName}`}
            className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-[1.5px] border-[#CBD5E1] dark:border-slate-700 rounded-lg px-[14px] py-[10px] text-[#64748B] font-medium outline-none"
          />
        </div>

        {!isSpice && (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Company Type
            </label>
            <select
              value={companyType}
              onChange={e => setCompanyType(e.target.value)}
              className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
            >
              <option value="private">Private Limited</option>
              <option value="public">Public Limited</option>
              <option value="opc">One Person Company (OPC)</option>
              <option value="small">Small Company</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Authorized Capital (₹)
          </label>
          <input
            type="number"
            min="0"
            value={capital}
            onChange={e => setCapital(Number(e.target.value))}
            className="w-full border-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {isSpice ? (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Registered Office State
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              >
                {Object.keys(stateStampDuty).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Number of Directors
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={directors}
                onChange={e => setDirectors(Number(e.target.value))}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              />
            </div>
          </>
        ) : isDateBased ? (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Actual/Proposed Filing Date
              </label>
              <input
                type="date"
                value={actualDate}
                onChange={e => setActualDate(e.target.value)}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Delay in Days
            </label>
            <input
              type="number"
              min="0"
              value={delayDaysInput}
              onChange={e => setDelayDaysInput(Number(e.target.value))}
              className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Enter 0 if filing on time</p>
          </div>
        )}
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-[#1D4ED8] text-white font-bold text-[1rem] px-[24px] py-[12px] rounded-lg hover:bg-blue-800 transition-colors normal-case"
      >
        Calculate {isSpice ? 'Estimate' : 'Fee'}
      </button>

      {/* Hidden Div for PDF Generation (Only for SPICe+) */}
      {isSpice && hasCalculated && results && (
        <div className="hidden">
          <div ref={pdfRef} className="bg-white p-10 w-[800px] text-slate-900">
            <div className="border-b-2 border-navy pb-4 mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-navy">CorpLawUpdates.in</h1>
                <p className="text-sm text-slate-500">India's Free Corporate Law Intelligence Platform</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Fee Estimate — SPICe+ Incorporation</p>
                <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
              <div><strong>Form:</strong> INC-32 (SPICe+)</div>
              <div><strong>State:</strong> {state}</div>
              <div><strong>Authorized Capital:</strong> ₹ {capital.toLocaleString()}</div>
              <div><strong>Directors:</strong> {directors}</div>
            </div>

            <table className="w-full text-left text-sm mb-6 border-collapse">
              <thead>
                <tr className="bg-[#F1F5F9] border-y border-[#E2E8F0]">
                  <th className="p-3">Component</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.rows.map((r, i) => (
                  <tr key={i}>
                    <td className="p-3">{r.component}</td>
                    <td className="p-3 text-slate-600">{r.category}</td>
                    <td className="p-3 text-right font-bold">{r.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td className="p-3 text-lg" colSpan={2}>Estimated Total</td>
                  <td className="p-3 text-right text-lg">₹ {results.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-8">
              <p className="text-xs font-bold text-red-800 leading-relaxed">
                DISCLAIMER: This is an indicative estimate for planning purposes only. It does not constitute legal advice or an official fee challan. Actual fees and stamp duties are determined strictly at the time of filing on the MCA21 portal. Stamp duty is a state subject and changes based on state laws. CorpLawUpdates.in is not liable for any discrepancy between this estimate and actual fees charged.
              </p>
            </div>
            <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200">
              Generated by CorpLawUpdates.in
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[500px]">
        {hasCalculated && results ? (
          <div className="mt-8 border-t border-[#E2E8F0] dark:border-slate-800 pt-8 transition-opacity duration-500 ease-in-out opacity-100" role="status" aria-live="polite">
          <div className="text-center mb-6">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider font-bold mb-2">
              {isSpice ? 'Estimated Total' : 'Total Liability'}
            </h3>
            <div className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white">
              ₹ {results.total.toLocaleString()}
            </div>
            {!isSpice && (
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                  Includes Base Fee
                </span>
                {delayValue > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                    Includes Late Penalty
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F1F5F9] dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Component</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Calculation Basis</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                {results.rows.map((r, i) => (
                  <tr key={i} className="bg-[#FFFFFF] even:bg-[#F8FAFC] dark:bg-slate-900 dark:even:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.component}</td>
                    <td className="px-4 py-3 text-[#64748B] dark:text-slate-400">{r.category}</td>
                    <td className="px-4 py-3 text-[#64748B] dark:text-slate-400">{r.basis}</td>
                    <td className={`px-4 py-3 text-right font-bold ${r.component.includes('Penalty') ? 'text-[#DC2626]' : 'text-[#0F172A] dark:text-white'}`}>
                      {r.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#F1F5F9] dark:bg-slate-900/80 font-bold border-t border-[#E2E8F0] dark:border-slate-700">
                  <td className="px-4 py-4 text-slate-900 dark:text-white" colSpan={3}>
                    {isSpice ? 'Estimated Total' : 'Total Liability'}
                  </td>
                  <td className="px-4 py-4 text-right text-navy dark:text-white text-lg">₹ {results.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {isSpice ? (
            <div className="text-center">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold py-[12px] px-[24px] rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-70 normal-case"
              >
                {isGeneratingPDF ? 'Generating...' : '📄 Download Fee Estimate (PDF)'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-3 text-center">
              Per Companies (Registration Offices and Fees) Rules, 2014 — Rule 12
            </p>
          )}
        </div>
        ) : (
          <div className="mt-8 border-t border-[#E2E8F0] dark:border-slate-800 pt-16 flex flex-col items-center justify-center text-slate-400 opacity-50">
            <span className="text-4xl mb-4">🧮</span>
            <p>Enter the details above and click Calculate</p>
          </div>
        )}
      </div>
    </div>
  )
}
