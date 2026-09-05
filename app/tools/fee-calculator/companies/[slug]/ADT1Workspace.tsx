'use client'

import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Printer,
  FileText,
  Scale,
  ShieldAlert,
  Info
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'

interface ADT1WorkspaceProps {
  form: MCAForm
}

type AppointmentType = 'agm' | 'casual_vacancy' | 'first_auditor'
type CalcMode = 'date' | 'days'

interface SlabRow {
  tier: string
  delayRange: string
  multiplier: number
  multiplierLabel: string
  notes: string
  isCondonation?: boolean
}

const TABLE_B_SLABS: SlabRow[] = [
  {
    tier: 'Tier 1',
    delayRange: 'Up to 15 days',
    multiplier: 1,
    multiplierLabel: '1× Normal Fee',
    notes: 'Applicable strictly for delays up to 15 days beyond statutory due date'
  },
  {
    tier: 'Tier 2',
    delayRange: '16 to 30 days',
    multiplier: 2,
    multiplierLabel: '2× Normal Fee',
    notes: 'Standard second tier for delays under 1 month'
  },
  {
    tier: 'Tier 3',
    delayRange: '31 to 60 days',
    multiplier: 4,
    multiplierLabel: '4× Normal Fee',
    notes: 'Escalation for delay between 1 and 2 months'
  },
  {
    tier: 'Tier 4',
    delayRange: '61 to 90 days',
    multiplier: 6,
    multiplierLabel: '6× Normal Fee',
    notes: 'Delay between 2 and 3 months'
  },
  {
    tier: 'Tier 5',
    delayRange: '91 to 180 days',
    multiplier: 10,
    multiplierLabel: '10× Normal Fee',
    notes: 'Major delay between 3 and 6 months'
  },
  {
    tier: 'Tier 6',
    delayRange: '181 to 270 days',
    multiplier: 12,
    multiplierLabel: '12× Normal Fee',
    notes: 'Maximum statutory multiplier under Table B'
  },
  {
    tier: 'Beyond 270d',
    delayRange: 'More than 270 days',
    multiplier: 12,
    multiplierLabel: '12× + Condonation',
    notes: 'Section 403 second proviso: Prior Condonation from RD / Central Govt required',
    isCondonation: true
  }
]

const CAPITAL_PRESETS = [
  { label: '< ₹1 Lakh', value: 90000, fee: 200 },
  { label: '₹1L – ₹5L', value: 100000, fee: 300 },
  { label: '₹5L – ₹25L', value: 1000000, fee: 400 },
  { label: '₹25L – ₹1Cr', value: 5000000, fee: 500 },
  { label: '≥ ₹1 Crore', value: 10000000, fee: 600 }
]

function getNormalFeeByCapital(capital: number, hasCapital: boolean): number {
  if (!hasCapital) return 200
  if (capital < 100000) return 200
  if (capital < 500000) return 300
  if (capital < 2500000) return 400
  if (capital < 10000000) return 500
  return 600
}

function getMultiplierForDelay(days: number): { multiplier: number; slabIndex: number; isCondonation: boolean } {
  if (days <= 0) return { multiplier: 0, slabIndex: -1, isCondonation: false }
  if (days <= 15) return { multiplier: 1, slabIndex: 0, isCondonation: false }
  if (days <= 30) return { multiplier: 2, slabIndex: 1, isCondonation: false }
  if (days <= 60) return { multiplier: 4, slabIndex: 2, isCondonation: false }
  if (days <= 90) return { multiplier: 6, slabIndex: 3, isCondonation: false }
  if (days <= 180) return { multiplier: 10, slabIndex: 4, isCondonation: false }
  if (days <= 270) return { multiplier: 12, slabIndex: 5, isCondonation: false }
  return { multiplier: 12, slabIndex: 6, isCondonation: true }
}

export default function ADT1Workspace({ form }: ADT1WorkspaceProps) {
  const { showToast } = useToast()

  // Mode & Appointment Details
  const [calcMode, setCalcMode] = useState<CalcMode>('date')
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('agm')

  // Date states
  const [meetingDate, setMeetingDate] = useState<string>('2026-09-30')
  const [filingDate, setFilingDate] = useState<string>(new Date().toISOString().slice(0, 10))

  // Direct days mode
  const [directDelayDays, setDirectDelayDays] = useState<number>(0)

  // Capital states
  const [hasShareCapital, setHasShareCapital] = useState<boolean>(true)
  const [nominalCapital, setNominalCapital] = useState<number>(100000) // ₹1 Lakh default
  const [companyName, setCompanyName] = useState<string>('')

  // Compute Statutory Due Date and Delay Days
  const { statutoryDueDate, calculatedDelayDays, isDelayed } = useMemo(() => {
    if (calcMode === 'days') {
      return {
        statutoryDueDate: null,
        calculatedDelayDays: Math.max(0, directDelayDays),
        isDelayed: directDelayDays > 0
      }
    }

    if (!meetingDate) {
      return { statutoryDueDate: null, calculatedDelayDays: 0, isDelayed: false }
    }

    const meeting = new Date(meetingDate)
    // 15 days from meeting date (meeting date + 15 days)
    const due = new Date(meeting)
    due.setDate(due.getDate() + 15)

    const filing = filingDate ? new Date(filingDate) : new Date()
    
    // Difference in calendar days
    const diffTime = filing.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const delay = Math.max(0, diffDays)

    return {
      statutoryDueDate: due,
      calculatedDelayDays: delay,
      isDelayed: delay > 0
    }
  }, [calcMode, meetingDate, filingDate, directDelayDays])

  // Normal Base Fee & Multiplier
  const normalFee = useMemo(() => {
    return getNormalFeeByCapital(nominalCapital, hasShareCapital)
  }, [nominalCapital, hasShareCapital])

  const { multiplier, slabIndex, isCondonation } = useMemo(() => {
    return getMultiplierForDelay(calculatedDelayDays)
  }, [calculatedDelayDays])

  const additionalFee = useMemo(() => {
    return normalFee * multiplier
  }, [normalFee, multiplier])

  const totalFee = useMemo(() => {
    return normalFee + additionalFee
  }, [normalFee, additionalFee])

  // Quick preset helper
  const handleSelectCapitalPreset = (val: number) => {
    setHasShareCapital(true)
    setNominalCapital(val)
  }

  // Format currency
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`

  // Format date helper
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '—'
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Copy breakdown for Client WhatsApp / Email
  const handleCopyBreakdown = () => {
    const compHeader = companyName ? `Company: ${companyName}\n` : ''
    const dueStr = statutoryDueDate ? `Statutory Due Date: ${formatDateDisplay(statutoryDueDate)}\n` : ''
    const filingStr = calcMode === 'date' && filingDate ? `Filing Date: ${formatDateDisplay(new Date(filingDate))}\n` : ''
    const delayStr = calculatedDelayDays > 0 ? `Delay: ${calculatedDelayDays} days\nMultiplier: ${multiplier}× normal fee\n` : 'Status: On Time (0 days delay)\n'
    const condonationStr = isCondonation ? '\n⚠️ NOTE: Delay exceeds 270 days. Section 403 second proviso requires prior Condonation of Delay from Regional Director / MCA.' : ''

    const text = `📋 FORM ADT-1 STATUTORY FEE ESTIMATE (FY 2026-27)
${compHeader}Form: ADT-1 (Auditor Appointment Intimation under Section 139)
Nominal Capital: ${hasShareCapital ? formatINR(nominalCapital) : 'Company without Share Capital'}
${dueStr}${filingStr}${delayStr}
─────────────────────────────
• Normal Filing Fee: ${formatINR(normalFee)}
• Additional Late Fee: ${formatINR(additionalFee)}
═════════════════════════════
TOTAL MCA CHALLAN PAYABLE: ${formatINR(totalFee)}
═════════════════════════════${condonationStr}

Generated via CorpLawUpdates Fee Calculator:
https://www.corplawupdates.in/tools/fee-calculator/companies/adt-1`

    navigator.clipboard.writeText(text)
    showToast('Fee breakdown copied to clipboard!', 'success')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* 1. Main Workspace Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-md tracking-wider">
                ADT-1 Master Engine
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Section 139 & Table B Multipliers
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Auditor Appointment Fee & Due Date Calculator
            </h2>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCalcMode('date')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                calcMode === 'date'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Date-Based (15 Days Rule)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('days')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                calcMode === 'days'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Direct Delay Days
            </button>
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Optional Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Company Name (Optional — for client intimations)
              </label>
              <input
                type="text"
                placeholder="e.g., Acme Infotech Private Limited"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Date-based Controls */}
            {calcMode === 'date' ? (
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Appointment Timelines
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Rule 4(2): 15 Days from Meeting
                  </span>
                </div>

                {/* Appointment Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Appointment Meeting Context
                  </label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="agm">Annual General Meeting (AGM) — Section 139(1) [5-Year Term]</option>
                    <option value="casual_vacancy">Casual Vacancy Appointment — Section 139(8) [Board / EGM]</option>
                    <option value="first_auditor">First Auditor Appointment — Section 139(6) [Board Meeting]</option>
                  </select>
                </div>

                {/* Meeting Date */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date of Meeting / Appointment (Day 0)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setMeetingDate('2026-09-30')}
                        className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 font-medium transition-colors"
                      >
                        30 Sept (Std AGM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeetingDate('2025-09-30')}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium transition-colors"
                      >
                        FY 24-25 AGM
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeetingDate(new Date().toISOString().slice(0, 10))}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium transition-colors"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {/* Actual / Proposed Filing Date */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Actual / Planned Filing Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setFilingDate(new Date().toISOString().slice(0, 10))}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium transition-colors"
                    >
                      Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            ) : (
              /* Direct Delay Days Mode */
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Delay Beyond 15-Day Statutory Due Date
                </label>
                <input
                  type="number"
                  min="0"
                  value={directDelayDays}
                  onChange={(e) => setDirectDelayDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                
                {/* Quick Delay Chips */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-2">Quick Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '0 Days (On-Time)', val: 0 },
                      { label: '15 Days (1×)', val: 15 },
                      { label: '30 Days (2×)', val: 30 },
                      { label: '45 Days (4×)', val: 45 },
                      { label: '75 Days (6×)', val: 75 },
                      { label: '120 Days (10×)', val: 120 },
                      { label: '200 Days (12×)', val: 200 },
                      { label: '300 Days (Condonation)', val: 300 }
                    ].map((chip) => (
                      <button
                        key={chip.val}
                        type="button"
                        onClick={() => setDirectDelayDays(chip.val)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          directDelayDays === chip.val
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Share Capital Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Nominal / Authorized Share Capital
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hasShareCapital}
                    onChange={(e) => setHasShareCapital(!e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Company without Share Capital
                  </span>
                </label>
              </div>

              {hasShareCapital && (
                <>
                  {/* Preset Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {CAPITAL_PRESETS.map((preset) => {
                      const isCurrent = nominalCapital === preset.value
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSelectCapitalPreset(preset.value)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 font-medium'
                          }`}
                        >
                          <div className="text-xs">{preset.label}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Fee: ₹{preset.fee}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom Number Input */}
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={nominalCapital}
                      onChange={(e) => setNominalCapital(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Custom Authorized Capital in INR"
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 pl-8 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Right Column: Live Computation Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* The Results Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
              
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* Header Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    FEE COMPUTATION RESULT
                  </span>
                  {calculatedDelayDays === 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ON-TIME FILING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      DELAYED ({calculatedDelayDays}d)
                    </span>
                  )}
                </div>

                {/* Total Fee Big Number */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Total MCA Challan Amount</span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl text-slate-400 font-medium">₹</span>
                    {totalFee.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Governed by Table A & Table B, Rule 12 Annexure
                  </p>
                </div>

                {/* Breakdown Details */}
                <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                  
                  {/* Normal Fee */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Normal Filing Fee:
                    </span>
                    <span className="font-bold text-white">
                      {formatINR(normalFee)}
                    </span>
                  </div>

                  {/* Delay Multiplier */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Additional Late Fee:
                    </span>
                    <div className="text-right">
                      <span className={`font-bold ${additionalFee > 0 ? 'text-rose-400' : 'text-white'}`}>
                        {formatINR(additionalFee)}
                      </span>
                      {multiplier > 0 && (
                        <span className="block text-[11px] text-amber-300 font-medium">
                          ({multiplier}× normal fee)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Due Date & Delay Details */}
                  {statutoryDueDate && (
                    <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-xs text-slate-400">
                      <span>Statutory Due Date:</span>
                      <span className="font-semibold text-slate-200">
                        {formatDateDisplay(statutoryDueDate)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Delay Duration:</span>
                    <span className="font-semibold text-slate-200">
                      {calculatedDelayDays === 0 ? '0 days (Timely)' : `${calculatedDelayDays} days delay`}
                    </span>
                  </div>
                </div>

                {/* Section 403 Condonation Notice */}
                {isCondonation && (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Section 403 Condonation Required (&gt; 270 Days)</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Delay exceeds 270 days. Under the second proviso to Section 403(1), belated Form ADT-1 cannot be filed directly without prior condonation of delay approval from the Regional Director / Central Government (Form CG-1).
                    </p>
                  </div>
                )}

                {/* Action Buttons: Copy & Print */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyBreakdown}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy for Client
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-3 px-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-rose-400" />
                    Print Sheet
                  </button>
                </div>

              </div>
            </div>

            {/* Quick Fact Callout */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <p className="font-bold">Did you know?</p>
                <p className="leading-relaxed text-blue-800 dark:text-blue-300">
                  Form ADT-1 does <strong>NOT</strong> attract ₹100/day. The ₹100/day penalty applies exclusively to annual returns (AOC-4 & MGT-7). ADT-1 is strictly capped at 12× normal fee under Table B.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 2. Interactive Table B Multiplier Slabs Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              MCA Table B Additional Fee Multiplier Matrix (Rule 12)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The currently active tier based on your delay of <strong>{calculatedDelayDays} days</strong> is highlighted below.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
            Current Tier: {calculatedDelayDays === 0 ? 'On-Time (0×)' : TABLE_B_SLABS[slabIndex]?.multiplierLabel || '12×'}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Period of Delay</th>
                <th className="px-4 py-3">Multiplier (Table B)</th>
                <th className="px-4 py-3">Additional Fee Payable</th>
                <th className="px-4 py-3">Total MCA Challan</th>
                <th className="px-4 py-3">Status / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* On-Time Row */}
              <tr className={calculatedDelayDays === 0 ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-semibold' : ''}>
                <td className="px-4 py-3 flex items-center gap-2">
                  {calculatedDelayDays === 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  Filing on or before 15 days (Timely)
                </td>
                <td className="px-4 py-3 text-slate-500">0× (No late fee)</td>
                <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">₹0</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{formatINR(normalFee)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">Normal statutory filing window</td>
              </tr>

              {TABLE_B_SLABS.map((slab, i) => {
                const isActive = calculatedDelayDays > 0 && slabIndex === i
                const rowAdditionalFee = normalFee * slab.multiplier
                const rowTotalFee = normalFee + rowAdditionalFee

                return (
                  <tr
                    key={slab.tier}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 font-bold border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="px-4 py-3 flex items-center gap-2">
                      {isActive && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                      <span>{slab.delayRange}</span>
                      {isActive && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-700 dark:text-indigo-300">
                      {slab.multiplierLabel}
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                      {formatINR(rowAdditionalFee)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {formatINR(rowTotalFee)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {slab.notes}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Mandatory Attachments Checklist for MCA V3 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Mandatory Attachments Checklist for Form ADT-1 on MCA V3
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ensure the following 4 statutory documents are scanned and prepared in PDF before initiating filing on the MCA V3 portal:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">
              1
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Written Consent of Auditor</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Formal letter from the auditor / audit firm giving their unconditional consent to act as statutory auditors under Section 139(1).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-sm">
              2
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Certificate of Eligibility (Section 141)</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Certificate issued by the auditor confirming they satisfy Section 141 criteria, are not disqualified, and are within the 20-company audit limit.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0 font-bold text-sm">
              3
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Certified True Copy of Resolution</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Extract of the resolution passed at the AGM (for 5-year appointment), Board Meeting (for first auditor), or EGM (casual vacancy by resignation).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-sm">
              4
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Intimation Letter by Company</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Copy of the formal appointment intimation letter dispatched by the company to the incoming auditor pursuant to Section 139(1).
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
