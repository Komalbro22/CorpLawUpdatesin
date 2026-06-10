'use client'

import React, { useState, useMemo } from 'react'
import { mcaForms, MCAForm } from '@/data/mca-forms'

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

export default function UnifiedCalculator() {
  const [selectedSlug, setSelectedSlug] = useState('aoc-4')
  const [companyType, setCompanyType] = useState('private')
  const [capital, setCapital] = useState<number>(100000)
  const [delay, setDelay] = useState<number>(0)

  const selectedForm = useMemo(() => mcaForms.find(f => f.slug === selectedSlug) || mcaForms[0], [selectedSlug])
  
  const isSpice = selectedForm.slug === 'spice-plus'

  // Live Calculation
  const result = useMemo(() => {
    let baseFee = 0
    let lateFee = 0

    const isSmall = companyType === 'opc' || companyType === 'small'

    if (isSpice) {
      // SPICe+ doesn't use standard delay logic, just showing base fee
      baseFee = capital <= 1500000 ? 0 : getNormalFee(capital, false)
      lateFee = 0
    } else {
      if (selectedForm.normalFeeStructure === 'capital_slab') {
        baseFee = getNormalFee(capital, selectedForm.concessionApplies ? isSmall : false)
      } else {
        baseFee = 0
      }

      if (delay > 0) {
        if (selectedForm.penaltyType === 'per_day') {
          lateFee = delay * 100
        } else if (selectedForm.penaltyType === 'multiplier') {
          const mult = getMultiplier(delay)
          lateFee = baseFee * mult
        } else if (selectedForm.penaltyType === 'flat') {
          lateFee = parseInt(selectedForm.penaltyRate.replace(/\D/g, '')) || 5000
        }
      }
    }

    return {
      baseFee,
      lateFee,
      total: baseFee + lateFee
    }
  }, [selectedForm, companyType, capital, delay, isSpice])

  const penaltyHint = useMemo(() => {
    if (isSpice) return 'Initial filing — no late penalty applies.'
    if (selectedForm.penaltyType === 'per_day') return 'Late fee — flat ₹100 per day of delay, uncapped.'
    if (selectedForm.penaltyType === 'multiplier') return 'Late fee — multiplier-based penalty (2x to 12x normal fee).'
    if (selectedForm.penaltyType === 'flat') return `Late fee — ${selectedForm.penaltyRate}.`
    return ''
  }, [selectedForm, isSpice])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[16px] shadow-sm border border-[#E2E8F0] dark:border-slate-800 p-6 md:p-8 w-full max-w-4xl mx-auto mb-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#1D4ED8]/5 rounded-bl-full pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-1 flex items-center gap-2">
            <span className="text-2xl">⚡</span> Quick Unified Calculator
          </h2>
          <p className="text-sm text-[#64748B] dark:text-slate-400">
            Select any form to instantly calculate the exact ROC filing fee and penalty.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Row 1 */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-2">Form type</label>
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] outline-none transition-colors"
          >
            {mcaForms.map(form => (
              <option key={form.slug} value={form.slug}>
                {form.formNumber} — {form.formName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-2">Company type</label>
          <select
            value={companyType}
            onChange={e => setCompanyType(e.target.value)}
            disabled={isSpice}
            className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] outline-none transition-colors disabled:opacity-50"
          >
            <option value="private">Private Limited Company</option>
            <option value="public">Public Limited Company</option>
            <option value="opc">One Person Company (OPC)</option>
            <option value="small">Small Company</option>
          </select>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-2">Authorized capital (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
            <input
              type="number"
              min="0"
              value={capital}
              onChange={e => setCapital(Number(e.target.value))}
              className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg pl-8 pr-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-2">Delay in filing (days)</label>
          <input
            type="number"
            min="0"
            value={delay}
            onChange={e => setDelay(Number(e.target.value))}
            disabled={isSpice}
            className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] outline-none transition-colors disabled:opacity-50"
          />
          <p className="text-xs text-[#DC2626] font-medium mt-2 flex items-center gap-1">
            <span aria-hidden>ℹ️</span> {penaltyHint}
          </p>
        </div>
      </div>

      <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-xl p-6 border border-[#E2E8F0] dark:border-slate-800 mt-6 transition-all duration-300 ease-in-out">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col border-r border-[#E2E8F0] dark:border-slate-700 pr-4">
            <span className="text-sm font-semibold text-[#64748B] dark:text-slate-400 mb-1">Base Normal Fee</span>
            <span className="text-2xl font-bold text-[#0F172A] dark:text-white">₹{result.baseFee.toLocaleString()}</span>
          </div>
          <div className="flex flex-col border-r border-[#E2E8F0] dark:border-slate-700 px-4">
            <span className="text-sm font-semibold text-[#64748B] dark:text-slate-400 mb-1">Additional Fee (Late)</span>
            <span className="text-2xl font-bold text-[#DC2626]">₹{result.lateFee.toLocaleString()}</span>
          </div>
          <div className="flex flex-col pl-4">
            <span className="text-sm font-semibold text-[#64748B] dark:text-slate-400 mb-1">Total Liability</span>
            <span className="text-3xl font-bold text-[#0F172A] dark:text-white">₹{result.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
    </div>
  )
}
