'use client'

import React, { useState, useMemo } from 'react'
import { Calculator, TrendingDown, IndianRupee, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'

export default function RepoEmiCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(5000000) // 50 Lakhs
  const [currentRate, setCurrentRate] = useState<number>(8.5) // 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20) // 20 years

  // Calculate standard EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculateEmi = (p: number, annualRate: number, years: number) => {
    if (annualRate <= 0 || years <= 0 || p <= 0) return 0
    const r = annualRate / 12 / 100
    const n = years * 12
    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
  }

  const currentEmi = useMemo(() => calculateEmi(loanAmount, currentRate, tenureYears), [loanAmount, currentRate, tenureYears])
  const cut25Emi = useMemo(() => calculateEmi(loanAmount, Math.max(0.1, currentRate - 0.25), tenureYears), [loanAmount, currentRate, tenureYears])
  const cut50Emi = useMemo(() => calculateEmi(loanAmount, Math.max(0.1, currentRate - 0.50), tenureYears), [loanAmount, currentRate, tenureYears])

  const savings25Monthly = currentEmi - cut25Emi
  const savings25Total = savings25Monthly * tenureYears * 12

  const savings50Monthly = currentEmi - cut50Emi
  const savings50Total = savings50Monthly * tenureYears * 12

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
    return `₹${(val / 100000).toFixed(1)} Lakh`
  }

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/40 rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <Calculator className="w-5 h-5" />
            </span>
            <h3 className="font-heading font-extrabold text-xl text-slate-900">
              Interactive Repo Rate to Home Loan EMI Calculator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate how a potential 25 bps or 50 bps rate cut at the next MPC meeting impacts your monthly EMI and lifetime interest.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          Live EBLR Simulator
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT SLIDERS */}
        <div className="lg:col-span-7 space-y-5">
          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <label className="text-slate-700">Loan Amount</label>
              <span className="font-heading font-bold text-base text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {formatLakhs(loanAmount)} ({loanAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })})
              </span>
            </div>
            <input
              type="range"
              min={500000}
              max={20000000}
              step={100000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>₹5 Lakhs</span>
              <span>₹50 Lakhs</span>
              <span>₹1 Crore</span>
              <span>₹2 Crores</span>
            </div>
          </div>

          {/* Current Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <label className="text-slate-700">Current Floating Interest Rate</label>
              <span className="font-heading font-bold text-base text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                {currentRate.toFixed(2)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={6.5}
              max={12.0}
              step={0.05}
              value={currentRate}
              onChange={(e) => setCurrentRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>6.5%</span>
              <span>8.5% (Typical Bank EBLR)</span>
              <span>12.0%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <label className="text-slate-700">Loan Tenure</label>
              <span className="font-heading font-bold text-base text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                {tenureYears} Years ({tenureYears * 12} Months)
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>5 Yrs</span>
              <span>15 Yrs</span>
              <span>20 Yrs</span>
              <span>30 Yrs</span>
            </div>
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Current Monthly EMI</span>
            <p className="font-heading font-black text-3xl text-slate-900 mt-0.5">
              ₹{currentEmi.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Total Interest Payable: ₹{((currentEmi * tenureYears * 12) - loanAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* SCENARIO COMPARISON */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              If RBI Cuts Rate in Next Meeting:
            </p>

            {/* 25 bps cut */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-950">25 bps Cut (-0.25%)</p>
                <p className="text-[11px] text-emerald-700">New Rate: {(currentRate - 0.25).toFixed(2)}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-emerald-700">Save ₹{savings25Monthly.toLocaleString('en-IN')}/mo</p>
                <p className="text-[10px] text-emerald-600 font-medium">₹{savings25Total.toLocaleString('en-IN')} total lifetime</p>
              </div>
            </div>

            {/* 50 bps cut */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-950">50 bps Cut (-0.50%)</p>
                <p className="text-[11px] text-blue-700">New Rate: {(currentRate - 0.50).toFixed(2)}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-blue-700">Save ₹{savings50Monthly.toLocaleString('en-IN')}/mo</p>
                <p className="text-[10px] text-blue-600 font-medium">₹{savings50Total.toLocaleString('en-IN')} total lifetime</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic">
            * RBI mandate requires banks to pass repo rate changes to retail borrowers within one quarter.
          </p>
        </div>
      </div>
    </div>
  )
}
