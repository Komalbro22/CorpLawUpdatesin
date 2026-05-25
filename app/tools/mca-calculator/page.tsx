'use client'

import React, { useState, useEffect } from 'react'
import { calculateFees, getStatutoryDueDate, FormType } from '@/lib/mca-fees'
import { Scale, Calendar, Landmark, Info, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function McaCalculatorPage() {
  const [entityType, setEntityType] = useState<'company' | 'llp'>('company')
  const [isSmallOrOPC, setIsSmallOrOPC] = useState(false)
  const [formType, setFormType] = useState<FormType>('AOC-4')
  const [nominalCapital, setNominalCapital] = useState(100000)
  const [financialYear, setFinancialYear] = useState(2025)
  const [actualFilingDate, setActualFilingDate] = useState('')
  const [isAmnestyActive, setIsAmnestyActive] = useState(false)

  // Auto-set form type when entity shifts
  useEffect(() => {
    if (entityType === 'llp') {
      setFormType('LLP-11')
    } else {
      setFormType('AOC-4')
    }
  }, [entityType])

  // Set default dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setActualFilingDate(today)
  }, [])

  // Calculate results
  const dueDate = getStatutoryDueDate(formType, financialYear)
  const filingDate = actualFilingDate ? new Date(actualFilingDate) : new Date()
  
  const ms = filingDate.getTime() - dueDate.getTime()
  const daysDelayed = Math.max(0, Math.floor(ms / 86400000))

  const results = calculateFees(
    formType,
    daysDelayed,
    nominalCapital,
    isSmallOrOPC,
    isAmnestyActive
  )

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Title */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="font-heading text-3xl font-bold text-navy flex items-center justify-center sm:justify-start gap-2.5">
            <Scale className="h-8 w-8 text-amber-500" />
            MCA Late Filing Fee Calculator
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Calculate exact statutory filing and additional delay fees for Indian Companies and LLPs.
          </p>
        </div>

        {/* Dynamic Amnesty Setting Toggle */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-900 block uppercase tracking-wider">Amnesty / Waiver Scheme Simulator</span>
              <p className="text-xs text-amber-700 leading-relaxed">Simulate if MCA introduces an active penalty waiver scheme (CFSS amnesty framework).</p>
            </div>
          </div>
          <button
            onClick={() => setIsAmnestyActive(!isAmnestyActive)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              isAmnestyActive 
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100/50'
            }`}
          >
            {isAmnestyActive ? 'Amnesty Active (Waiver On)' : 'Amnesty Off (Standard Slabs)'}
          </button>
        </div>

        {/* Main Work Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Input parameters */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
            
            {/* Entity Select */}
            <div>
              <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2.5 block">1. Select Entity Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEntityType('company')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition-all ${
                    entityType === 'company'
                      ? 'border-navy bg-navy text-gold shadow-sm'
                      : 'border-slate-200 bg-white text-navy hover:bg-slate-50'
                  }`}
                >
                  <Landmark className="h-4 w-4" />
                  Limited Company
                </button>
                <button
                  onClick={() => setEntityType('llp')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition-all ${
                    entityType === 'llp'
                      ? 'border-navy bg-navy text-gold shadow-sm'
                      : 'border-slate-200 bg-white text-navy hover:bg-slate-50'
                  }`}
                >
                  <Scale className="h-4 w-4" />
                  LLP
                </button>
              </div>
            </div>

            {/* Small company toggle */}
            {entityType === 'company' && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-navy block">Small Company / OPC Status?</span>
                  <span className="text-[10px] text-slate-400">Apply statutory 50% discount on base fees</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSmallOrOPC}
                  onChange={(e) => setIsSmallOrOPC(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
              </div>
            )}

            {/* Parameter forms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">2. Form Code</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as FormType)}
                  className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-sm p-3 bg-white"
                >
                  {entityType === 'company' ? (
                    <>
                      <option value="AOC-4">AOC-4 (Financial Statement)</option>
                      <option value="MGT-7">MGT-7 (Annual Return)</option>
                      <option value="DIR-3-KYC">DIR-3 KYC (Director KYC)</option>
                      <option value="DPT-3">DPT-3 (Deposit Return)</option>
                    </>
                  ) : (
                    <>
                      <option value="LLP-11">Form 11 (LLP Annual Return)</option>
                      <option value="LLP-8">Form 8 (Statement of Accounts)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">3. Capital / Contribution</label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={nominalCapital}
                    onChange={(e) => setNominalCapital(Number(e.target.value))}
                    className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl pl-8 pr-3 py-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Date settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">4. Financial Year Ending</label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(Number(e.target.value))}
                  className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-sm p-3 bg-white"
                >
                  <option value={2026}>FY 2025-26</option>
                  <option value={2025}>FY 2024-25</option>
                  <option value={2024}>FY 2023-24</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">5. Actual Filing Date</label>
                <input
                  type="date"
                  value={actualFilingDate}
                  onChange={(e) => setActualFilingDate(e.target.value)}
                  className="w-full border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-sm p-3"
                />
              </div>
            </div>

          </div>

          {/* Right: Calculations outputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-navy mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                Calculation Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Statutory Due Date:</span>
                  <span className="font-semibold text-navy flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(dueDate)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delay Period:</span>
                  <span className="font-semibold text-navy">{daysDelayed} Days</span>
                </div>

                <hr className="border-slate-100" />

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Standard Filing Fee:</span>
                  <span className="font-semibold text-navy">{formatCurrency(results.standard)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Additional Late Penalty:</span>
                  <span className={`font-semibold ${results.late > 0 ? 'text-red-500' : 'text-navy'}`}>
                    {formatCurrency(results.late)}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between items-center mt-6">
                  <span className="font-bold text-sm text-navy uppercase tracking-wider">Total Payable:</span>
                  <span className="font-heading text-2xl font-bold text-amber-600">
                    {formatCurrency(results.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Citation Footnote */}
            <div className="bg-slate-100/70 border border-slate-200/60 rounded-xl p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-500" />
                Statutory Citations & Authority
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                <strong>Source:</strong> {results.source}
              </p>
              {results.legalNotes && (
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium italic">
                  Note: {results.legalNotes}
                </p>
              )}
              <p className="text-[9px] text-slate-400 pt-1 border-t border-slate-200/60 font-medium">
                Last Verified: May 25, 2026. Slabs are subject to active MCA circular alterations.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
