'use client'

import { useState } from 'react'
import {
  MCA_FORMS,
  LLP_FORMS,
  MSME_PENALTIES,
  calculateMCALateFee,
  calculateLLPLateFee,
  formatINR,
  numberToWords,
  type FeeCalculationResult,
} from '@/lib/calculators/mca-fees'

type CalcTab = 'mca' | 'llp' | 'ccfs' | 'msme'

export default function MCAFeeCalculator() {
  const [activeTab, setActiveTab] = useState<CalcTab>('mca')

  // MCA state
  const [mcaForm, setMcaForm] = useState('')
  const [mcaDays, setMcaDays] = useState('')
  const [companyType, setCompanyType] = useState('private')
  const [applyCcfs, setApplyCcfs] = useState(false)
  const [mcaResult, setMcaResult] = useState<FeeCalculationResult | null>(null)

  // LLP state
  const [llpForm, setLlpForm] = useState('')
  const [llpDays, setLlpDays] = useState('')
  const [llpResult, setLlpResult] = useState<any>(null)

  // CCFS state
  const [ccfsDays, setCcfsDays] = useState('')
  const [ccfsRate, setCcfsRate] = useState('100')
  const [ccfsResult, setCcfsResult] = useState<{
    normal: number
    ccfs: number
    savings: number
  } | null>(null)

  function calcMCA() {
    if (!mcaForm || !mcaDays) return
    const result = calculateMCALateFee(
      mcaForm,
      parseInt(mcaDays),
      companyType,
      applyCcfs
    )
    setMcaResult(result)

    // Log usage (fire and forget)
    fetch('/api/calculators/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'mca_late_fee',
        input: { mcaForm, mcaDays, companyType, applyCcfs },
        result: result ? {
          totalNormal: result.totalNormalFee,
          totalCcfs: result.totalCcfsFee,
          savings: result.ccfsSavings,
        } : null
      })
    }).catch(() => {})
  }

  function calcLLP() {
    if (!llpForm || !llpDays) return
    const result = calculateLLPLateFee(
      llpForm,
      parseInt(llpDays)
    )
    setLlpResult(result)

    // Log usage (fire and forget)
    fetch('/api/calculators/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'llp_late_fee',
        input: { llpForm, llpDays },
        result: result ? {
          totalNormal: result.totalFee,
          additionalFee: result.additionalFee,
        } : null
      })
    }).catch(() => {})
  }

  function calcCCFS() {
    if (!ccfsDays) return
    const days = parseInt(ccfsDays)
    const rate = parseInt(ccfsRate)
    const normal = days * rate
    const ccfs = Math.ceil(normal * 0.10)
    const savings = normal - ccfs
    const result = { normal, ccfs, savings }
    setCcfsResult(result)

    // Log usage (fire and forget)
    fetch('/api/calculators/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ccfs_savings',
        input: { ccfsDays, ccfsRate },
        result
      })
    }).catch(() => {})
  }

  const tabs: { id: CalcTab; label: string; icon: string }[] = [
    { id: 'mca', label: 'MCA Company', icon: '🏛️' },
    { id: 'llp', label: 'LLP Forms', icon: '🤝' },
    { id: 'ccfs', label: 'CCFS 2026', icon: '💰' },
    { id: 'msme', label: 'MSME Penalties', icon: '📋' },
  ]

  const inputClass = `w-full border border-slate-200  rounded-xl px-4 py-3 text-sm text-navy  focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 bg-white  transition-all shadow-sm`
  const selectClass = inputClass

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card transition-all hover:shadow-card-hover max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-slate-900 to-navy p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:20px_20px]" aria-hidden />
        <div className="flex items-center gap-4 relative z-10">
          <span className="text-4xl bg-white/10 p-3 rounded-2xl backdrop-blur-md">🧮</span>
          <div>
            <h2 className="text-2xl font-bold font-heading tracking-tight">
              Statutory Late Fee Calculator
            </h2>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed font-light">
              Calculate exact statutory additional fees, slab-wise penalties, and CCFS 2026 scheme savings.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-2xl whitespace-nowrap transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white  text-amber-600  shadow-sm border border-slate-250/20'
                : 'text-slate-500  hover:text-navy  hover:bg-white/50 '
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {/* ── MCA TAB ── */}
        {activeTab === 'mca' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                Select MCA Form
              </label>
              <select
                value={mcaForm}
                onChange={e => {
                  setMcaForm(e.target.value)
                  setMcaResult(null)
                }}
                className={selectClass}
              >
                <option value="">Choose form...</option>
                <optgroup label="Annual Filings">
                  {MCA_FORMS.filter(f => f.category === 'annual').map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.description}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Event-Based Filings">
                  {MCA_FORMS.filter(f => f.category === 'event').map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.description}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {mcaForm && (() => {
              const form = MCA_FORMS.find(f => f.id === mcaForm)
              if (!form) return null
              return (
                <div className="bg-blue-50/50 border border-blue-150/40 rounded-2xl p-4 text-sm space-y-1.5">
                  <p className="text-blue-800 font-semibold flex items-center gap-1.5">
                    🏛️ {form.section}
                  </p>
                  {form.gracePeriodDays > 0 && (
                    <p className="text-blue-650 text-xs font-light">
                      ✅ **Grace Period:** {form.gracePeriodDays} days allowed to file before additional fees apply.
                    </p>
                  )}
                  {form.additionalFeePerDay > 0 && (
                    <p className="text-blue-650 text-xs font-light">
                      📌 **Late Penalty Fee:** ₹{form.additionalFeePerDay}/day {form.maxAdditionalFee ? `(capped at ₹${form.maxAdditionalFee.toLocaleString('en-IN')})` : '(unlimited accrual)'}.
                    </p>
                  )}
                  {form.ccfsEligible && (
                    <p className="text-emerald-700 text-xs font-semibold flex items-center gap-1 mt-1">
                      🎉 eligible for **CCFS 2026** — 90% discount on late additional fees!
                    </p>
                  )}
                </div>
              )
            })()}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                Company Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { v: 'private', l: 'Pvt Ltd' },
                  { v: 'public', l: 'Public Ltd' },
                  { v: 'opc', l: 'OPC' },
                  { v: 'small', l: 'Small Company' },
                ].map(ct => (
                  <button
                    key={ct.v}
                    type="button"
                    onClick={() => {
                      setCompanyType(ct.v)
                      setMcaResult(null)
                    }}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-center
                      ${companyType === ct.v
                        ? 'bg-navy  text-white  border-navy  shadow-sm'
                        : 'bg-white  text-slate-600  border-slate-200  hover:border-slate-350 hover:bg-slate-50'
                      }`}
                  >
                    {ct.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                Days Delayed <span className="text-slate-400 font-normal normal-case">(due date to filing date)</span>
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={mcaDays}
                  onChange={e => {
                    setMcaDays(e.target.value)
                    setMcaResult(null)
                  }}
                  placeholder="e.g. 180"
                  className={inputClass}
                />
                <span className="text-slate-500 font-semibold text-sm">days</span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {[30, 90, 180, 365, 730].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setMcaDays(String(d))
                      setMcaResult(null)
                    }}
                    className="text-xs bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700 px-3.5 py-1.5 rounded-full border border-slate-200/60 transition-colors"
                  >
                    {d < 365 ? `${d} Days` : d === 365 ? '1 Year' : '2 Years'}
                  </button>
                ))}
              </div>
            </div>

            {mcaForm && MCA_FORMS.find(f => f.id === mcaForm)?.ccfsEligible && (
              <div className="bg-emerald-50/50 border border-emerald-150/40 rounded-2xl p-4.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-emerald-850 font-bold text-sm">
                    Apply CCFS 2026 Relief Scheme
                  </p>
                  <p className="text-emerald-650 text-xs mt-0.5 font-light">
                    Waives 90% of accumulated additional fees (Pay only 10%). Closes **15 July 2026**.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setApplyCcfs(p => !p)
                    setMcaResult(null)
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ring-2 ring-amber-500/10
                    ${applyCcfs ? 'bg-emerald-500' : 'bg-slate-300 '}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform
                    ${applyCcfs ? 'translate-x-6' : ''}`}
                  />
                </button>
              </div>
            )}

            <button
              onClick={calcMCA}
              disabled={!mcaForm || !mcaDays}
              className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-navy font-bold py-4 rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🧮 Calculate MCA Penalty
            </button>

            {mcaResult && (
              <div className="space-y-4 animate-fade-in pt-4 border-t border-slate-100">
                <div className={`rounded-2xl p-6 border ${
                  mcaResult.ccfsEligible
                    ? 'border-emerald-250 bg-emerald-50/30 '
                    : 'border-amber-250 bg-amber-50/30 '
                }`}>
                  {mcaResult.ccfsEligible ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center border-r border-slate-200">
                          <p className="text-xs text-slate-500 mb-1 line-through">Normal Total Fee</p>
                          <p className="text-2xl font-extrabold text-red-500 line-through">
                            {formatINR(mcaResult.totalNormalFee)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-emerald-600 font-bold mb-1">With CCFS 2026</p>
                          <p className="text-2xl font-black text-emerald-650">
                            {formatINR(mcaResult.totalCcfsFee)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-emerald-650 text-white rounded-xl p-4 text-center shadow-sm">
                        <p className="text-sm font-bold">
                          🎉 Saved {formatINR(mcaResult.ccfsSavings)} under CCFS 2026!
                        </p>
                        <p className="text-xs text-emerald-100 mt-1 font-light">
                          90% waiver applied on additional fees (equivalent to {numberToWords(mcaResult.ccfsSavings)} rupees).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Total Fee Payable</p>
                      <p className="text-4xl font-black text-navy">
                        {formatINR(mcaResult.flatLateFee || mcaResult.totalNormalFee)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5 italic font-light">
                        Equivalent to {numberToWords(mcaResult.flatLateFee || mcaResult.totalNormalFee)} rupees.
                      </p>
                    </div>
                  )}
                </div>

                {/* Breakdown List */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Breakdown Detail</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {mcaResult.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between items-center px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.label}</p>
                          {item.note && <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>}
                        </div>
                        <p className="text-sm font-bold text-navy">{formatINR(item.amount)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-5 py-4 bg-navy text-white">
                      <p className="font-bold text-sm">
                        Total Amount Payable
                        {mcaResult.ccfsEligible ? ' (CCFS Applied)' : ''}
                      </p>
                      <p className="font-extrabold text-xl text-brand-gold">
                        {formatINR(mcaResult.ccfsEligible ? mcaResult.totalCcfsFee : mcaResult.flatLateFee || mcaResult.totalNormalFee)}
                      </p>
                    </div>
                  </div>
                </div>

                {!applyCcfs && MCA_FORMS.find(f => f.id === mcaForm)?.ccfsEligible && (
                  <div className="bg-amber-50/50 border border-amber-200/40 rounded-xl p-4.5 flex gap-3 text-sm">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-amber-900 font-bold">Additional CCFS 2026 Savings Potential!</p>
                      <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                        This form supports the government's Companies Compliance Facilitation Scheme. Enable the toggle above to instantly wave **90%** of accumulated fees.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LLP TAB ── */}
        {activeTab === 'llp' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                Select LLP Form
              </label>
              <select
                value={llpForm}
                onChange={e => {
                  setLlpForm(e.target.value)
                  setLlpResult(null)
                }}
                className={selectClass}
              >
                <option value="">Choose LLP form...</option>
                {LLP_FORMS.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.description}
                  </option>
                ))}
              </select>
            </div>

            {llpForm && (() => {
              const form = LLP_FORMS.find(f => f.id === llpForm)
              if (!form) return null
              return (
                <div className="bg-blue-50/50 border border-blue-150/40 rounded-2xl p-4 text-sm">
                  <p className="text-blue-800 font-semibold">🤝 {form.section}</p>
                  <p className="text-blue-650 text-xs font-light mt-1">
                    Applicable: {form.applicableTo} | Category: {form.category}
                  </p>
                  <p className="text-blue-650 text-xs font-light mt-0.5">
                    Late fee rate: ₹{form.additionalFeePerDay}/day {form.gracePeriodDays > 0 ? `(after ${form.gracePeriodDays} days grace period)` : ''}.
                  </p>
                </div>
              )
            })()}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                Days Delayed
              </label>
              <input
                type="number"
                min="1"
                value={llpDays}
                onChange={e => {
                  setLlpDays(e.target.value)
                  setLlpResult(null)
                }}
                placeholder="Number of days delayed"
                className={inputClass}
              />
              <div className="flex gap-2 mt-3 flex-wrap">
                {[30, 90, 180, 365].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setLlpDays(String(d))
                      setLlpResult(null)
                    }}
                    className="text-xs bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700 px-3.5 py-1.5 rounded-full border border-slate-200/60 transition-colors"
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calcLLP}
              disabled={!llpForm || !llpDays}
              className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-navy font-bold py-4 rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🧮 Calculate LLP Fee
            </button>

            {llpResult && (
              <div className="space-y-4 animate-fade-in pt-4 border-t border-slate-100">
                <div className="bg-amber-50/30 border border-amber-250 rounded-2xl p-6 text-center">
                  <p className="text-xs text-slate-500 mb-1">Total LLP Fee Payable</p>
                  <p className="text-4xl font-black text-navy">
                    {formatINR(llpResult.totalFee)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 italic font-light">
                    Equivalent to {numberToWords(llpResult.totalFee)} rupees.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">LLP Fee Breakdown</p>
                  </div>
                  {llpResult.breakdown.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 last:border-none">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.label}</p>
                        {item.note && <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>}
                      </div>
                      <p className="text-sm font-bold text-navy">{formatINR(item.amount)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-5 py-4 bg-navy text-white">
                    <p className="font-bold text-sm">Total Amount Payable</p>
                    <p className="font-extrabold text-xl text-brand-gold">{formatINR(llpResult.totalFee)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CCFS SAVINGS TAB ── */}
        {activeTab === 'ccfs' && (
          <div className="space-y-6">
            <div className="bg-emerald-50/50 border border-emerald-250/50 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-emerald-800 flex items-center gap-1">
                💰 CCFS 2026 — Scheme Details
              </h3>
              <div className="space-y-1.5 text-sm text-emerald-700 font-light leading-relaxed">
                <p>• Pays a mere **10%** of accumulated additional late fees (waiving **90%** of penalties).</p>
                <p>• Applicable on key MCA compliance forms: MGT-7, AOC-4, DIR-12, INC-20A, etc.</p>
                <p>• **Deadline Warning:** Scheme closes permanently on **15 July 2026**.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                Total Days Delayed
              </label>
              <input
                type="number"
                min="1"
                value={ccfsDays}
                onChange={e => {
                  setCcfsDays(e.target.value)
                  setCcfsResult(null)
                }}
                placeholder="e.g. 365 (1 year delay)"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                Additional Fee Rate
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: '100', l: '₹100/day', n: 'MGT-7, AOC-4' },
                  { v: '200', l: '₹200/day', n: 'LLP Forms' },
                  { v: '300', l: '₹300/day', n: 'ADT-1, DIR-12' },
                ].map(r => (
                  <button
                    key={r.v}
                    type="button"
                    onClick={() => {
                      setCcfsRate(r.v)
                      setCcfsResult(null)
                    }}
                    className={`py-3 px-2 rounded-xl border transition-all text-center flex flex-col justify-center items-center
                      ${ccfsRate === r.v
                        ? 'bg-navy  text-white  border-navy  shadow-sm'
                        : 'bg-white  text-slate-600  border-slate-200  hover:border-slate-350 hover:bg-slate-50'
                      }`}
                  >
                    <span className="text-sm font-bold">{r.l}</span>
                    <span className="text-[9px] opacity-70 mt-1 font-light leading-none">{r.n}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calcCCFS}
              disabled={!ccfsDays}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💰 Calculate CCFS Savings
            </button>

            {ccfsResult && (
              <div className="space-y-4 animate-fade-in pt-4 border-t border-slate-100">
                <div className="bg-emerald-600 text-white rounded-2xl p-6 text-center shadow-sm">
                  <p className="text-sm text-emerald-100 mb-1 font-light">Total CCFS 2026 Savings</p>
                  <p className="text-5xl font-black tracking-tight">{formatINR(ccfsResult.savings)}</p>
                  <p className="text-emerald-100 text-xs mt-2 font-light">
                    Wave 90% of accumulated additional late fees (equivalent to {numberToWords(ccfsResult.savings)} rupees saved).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50/50 border border-red-200/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-red-600 font-semibold mb-1">Standard Additional Fee</p>
                    <p className="text-xl font-extrabold text-red-650">{formatINR(ccfsResult.normal)}</p>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-250/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-emerald-650 font-semibold mb-1">With CCFS 2026</p>
                    <p className="text-xl font-extrabold text-emerald-650">{formatINR(ccfsResult.ccfs)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MSME TAB ── */}
        {activeTab === 'msme' && (
          <div className="space-y-6">
            <div className="bg-amber-50/50 border border-amber-250/50 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-amber-900 flex items-center gap-1.5">
                📢 MSMED Act 2006 Statutory Penalties
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Under the Indian MSMED Act and Companies Act, corporations face severe financial liabilities for non-compliance or payment delays to Micro and Small vendors.
              </p>
            </div>

            <div className="space-y-4">
              {MSME_PENALTIES.map((penalty, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-sm space-y-2.5">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-navy text-sm">{penalty.description}</h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 rounded px-2.5 py-0.5 whitespace-nowrap">
                      {penalty.section}
                    </span>
                  </div>
                  <div className="bg-red-50/30 border border-red-200/40 rounded-xl p-3.5 text-xs font-semibold text-red-750 leading-relaxed">
                    ⚠️ {penalty.penaltyAmount}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                * Note: Payments to MSME vendors must be cleared within **45 days** (if agreed in writing) or **15 days** (without written agreement). Delays trigger automatic interest mandates not tax-deductible under IT Act.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
