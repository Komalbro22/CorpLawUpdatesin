'use client'

import React, { useState } from 'react'
import { MCAForm } from '@/data/mca-forms'
import { calculateIncorporationStampDuty } from '@/lib/calculatorUtils'
import IndianDateInput from '@/components/shared/IndianDateInput'

interface ResultRow {
  component: string
  category: string
  basis: string
  amount: number
}

function getNormalFee(capital: number, isSmall: boolean): number {
  if (isSmall) {
    if (capital < 100000) return 50
    if (capital < 500000) return 100
    if (capital < 2500000) return 150
    return 200
  } else {
    if (capital < 100000) return 200
    if (capital < 500000) return 300
    if (capital < 2500000) return 400
    if (capital < 10000000) return 500
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

export default function GenericFormWorkspace({ form }: { form: MCAForm }) {
  const isSpice = form.slug === 'spice-plus'
  const isDateBased = form.slug === 'aoc-4'

  const [genericCompanyType, setGenericCompanyType] = useState('private')
  const [genericCapital, setGenericCapital] = useState(100000)
  const [genericDueDate, setGenericDueDate] = useState('')
  const [genericActualDate, setGenericActualDate] = useState('')
  const [delayDaysInput, setDelayDaysInput] = useState(0)
  const [state, setState] = useState('Maharashtra')
  const [directors, setDirectors] = useState(2)
  const [genericResults, setGenericResults] = useState<{ rows: ResultRow[]; total: number } | null>(null)
  const [showGenericModal, setShowGenericModal] = useState(false)

  const handleGenericCalculate = () => {
    const isSmall = genericCompanyType === 'opc' || genericCompanyType === 'small'
    const rows: ResultRow[] = []
    let total = 0

    if (isSpice) {
      const mcaFee = genericCapital <= 1500000 ? 0 : getNormalFee(genericCapital, false)
      rows.push({
        component: 'MCA Incorporation Fee',
        category: 'Fixed',
        basis: genericCapital <= 1500000 ? 'Waived (≤ ₹15L Capital)' : 'Capital slab',
        amount: mcaFee
      })
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
      const sd = calculateIncorporationStampDuty(state, genericCapital)
      rows.push({ component: 'Estimated MOA Stamp Duty', category: 'State Tax', basis: `Rates for ${state}`, amount: sd.moa })
      rows.push({ component: 'Estimated AOA Stamp Duty', category: 'State Tax', basis: `Rates for ${state}`, amount: sd.aoa })
      if (sd.form > 0) {
        rows.push({ component: 'Estimated Form/Capital Stamp Duty', category: 'State Tax', basis: `Rates for ${state}`, amount: sd.form })
      }
      total += mcaFee + sd.moa + sd.aoa + sd.form
    } else {
      let baseFee = 0
      if (form.normalFeeStructure === 'capital_slab') {
        baseFee = getNormalFee(genericCapital, form.concessionApplies ? isSmall : false)
        rows.push({
          component: 'Normal Filing Fee',
          category: 'Fixed',
          basis: `Capital slab (${form.concessionApplies && isSmall ? 'Concessional' : 'Standard'})`,
          amount: baseFee
        })
      }
      let delay = 0
      if (isDateBased) {
        if (genericDueDate && genericActualDate) {
          const d1 = new Date(genericDueDate)
          const d2 = new Date(genericActualDate)
          delay = Math.max(0, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
        }
      } else {
        delay = Math.max(0, delayDaysInput)
      }

      let lateFee = 0
      if (delay > 0) {
        if (form.penaltyType === 'per_day') {
          lateFee = delay * 100
          rows.push({ component: 'Additional Filing Fee', category: 'Variable', basis: `${delay} days @ ₹100/day`, amount: lateFee })
        } else if (form.penaltyType === 'multiplier') {
          const mult = getMultiplier(delay)
          lateFee = baseFee * mult
          rows.push({ component: 'Additional Fee', category: 'Variable', basis: `Delay ${delay}d (${mult}x base fee)`, amount: lateFee })
        } else if (form.penaltyType === 'flat') {
          lateFee = parseInt(form.penaltyRate.replace(/\D/g, '')) || 5000
          rows.push({ component: 'Additional Fee', category: 'Fixed', basis: form.penaltyRate, amount: lateFee })
        }
      }
      total = baseFee + lateFee
    }

    setGenericResults({ rows, total })
    setShowGenericModal(true)
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
              value={genericCompanyType}
              onChange={e => setGenericCompanyType(e.target.value)}
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
            Nominal Share Capital (₹)
          </label>
          <input
            type="number"
            min="0"
            value={genericCapital}
            onChange={e => setGenericCapital(Number(e.target.value))}
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
                <option value="andhrapradesh">Andhra Pradesh</option>
                <option value="bihar">Bihar</option>
                <option value="delhi">Delhi</option>
                <option value="gujarat">Gujarat</option>
                <option value="karnataka">Karnataka</option>
                <option value="madhyapradesh">Madhya Pradesh</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="punjab">Punjab</option>
                <option value="rajasthan">Rajasthan</option>
                <option value="tamilnadu">Tamil Nadu</option>
                <option value="telangana">Telangana</option>
                <option value="other">Other States</option>
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
              <IndianDateInput
                value={genericDueDate}
                onChange={val => setGenericDueDate(val)}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Actual/Proposed Filing Date
              </label>
              <IndianDateInput
                value={genericActualDate}
                onChange={val => setGenericActualDate(val)}
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
        onClick={handleGenericCalculate}
        className="w-full bg-[#0a0a0a] hover:bg-black text-white font-bold py-4 px-6 rounded-[8px] transition-all flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-xl mt-4"
      >
        Calculate {isSpice ? 'Estimate' : 'Fee'} <span aria-hidden="true">→</span>
      </button>

      {/* Modal Overlay for Generic Forms */}
      {showGenericModal && genericResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col md:flex-row w-full max-w-3xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowGenericModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-1 bg-white rounded-full shadow-sm"
            >
              ✕
            </button>

            <div className="flex-1 p-8 md:p-10">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-6">FEE BREAKDOWN</h3>
              <p className="text-sm text-slate-500 mb-1 font-medium">Total Payable</p>
              <div className="text-[2.75rem] font-bold text-slate-900 mb-10 font-tabular-nums flex items-baseline leading-none">
                <span className="text-[1.5rem] mr-1 text-slate-400 font-medium">₹</span>
                {genericResults.total.toLocaleString()}
              </div>

              {genericResults.rows.map((r, i) => (
                <div key={i} className="flex justify-between py-4 border-b border-slate-100 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-600 font-medium">{r.component}</span>
                    <span className="text-xs text-slate-400 mt-0.5">{r.basis}</span>
                  </div>
                  <span className={`font-bold font-tabular-nums ${r.component.includes('Additional') ? 'text-[#DC2626]' : 'text-slate-900'}`}>
                    ₹ {r.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full md:w-[320px] bg-[#0a0a0a] p-8 md:p-10 text-white flex flex-col justify-center relative">
              <h4 className="text-[1.35rem] font-bold mb-5 leading-snug">
                Filing Estimate: ₹{genericResults.total.toLocaleString()}
              </h4>
              <p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed font-medium">
                Calculated strictly in accordance with Companies (Registration Offices and Fees) Rules, 2014.
              </p>
              <button
                onClick={() => setShowGenericModal(false)}
                className="w-full bg-white text-black font-bold py-3.5 px-4 rounded-[6px] hover:bg-slate-100 transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
