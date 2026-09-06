'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Copy,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Building,
  UserCheck,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  UserX,
  RefreshCw,
  Award
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateDir3KycCompliance,
  Dir3KycFilingType,
  DinStatus,
  ChangeCategory,
  DIN_ALLOTMENT_PRESETS,
  Dir3KycCalculationResult
} from '@/lib/rule-engine/dir3kyc-engine'
import { generateDir3KycPdf } from '@/lib/pdf/generateDir3KycPdf'

export default function DIR3KYCWorkspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  const [filingType, setFilingType] = useState<Dir3KycFilingType>('routine')
  const [dinStatus, setDinStatus] = useState<DinStatus>('active')
  const [allotmentPresetId, setAllotmentPresetId] = useState<string>('pre_2025')
  const [customAllotmentDate, setCustomAllotmentDate] = useState<string>('')
  const [directorName, setDirectorName] = useState<string>('')
  const [dinNumber, setDinNumber] = useState<string>('')

  // Change of details inputs (Rule 12A(2))
  const [changeCategory, setChangeCategory] = useState<ChangeCategory>('mobile')
  const [changeDate, setChangeDate] = useState<string>(() => {
    // Default to 10 days ago
    const d = new Date()
    d.setDate(d.getDate() - 10)
    return d.toISOString().split('T')[0]
  })
  const [actualFilingDate, setActualFilingDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [numberOfChangeFilings, setNumberOfChangeFilings] = useState<number>(1)

  // Cascading directorship risk
  const [hasCompanyFilingsPending, setHasCompanyFilingsPending] = useState<boolean>(false)

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE ENGINE EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════
  const result: Dir3KycCalculationResult = useMemo(() => {
    return calculateDir3KycCompliance({
      filingType,
      dinStatus,
      allotmentPresetId,
      customAllotmentDate: customAllotmentDate || undefined,
      changeCategory,
      changeDate,
      actualFilingDate,
      hasCompanyFilingsPending,
      numberOfChangeFilings,
      directorName: directorName.trim() || undefined,
      dinNumber: dinNumber.trim() || undefined
    })
  }, [
    filingType,
    dinStatus,
    allotmentPresetId,
    customAllotmentDate,
    changeCategory,
    changeDate,
    actualFilingDate,
    hasCompanyFilingsPending,
    numberOfChangeFilings,
    directorName,
    dinNumber
  ])

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleCopySummary = () => {
    const text = `
DIR-3 KYC COMPLIANCE ASSESSMENT (G.S.R. 943(E) & 300(E))
-------------------------------------------------------
Director Name: ${directorName || 'Not Specified'}
DIN Number: ${dinNumber || 'Not Specified'}
DIN Status: ${result.dinStatus === 'deactivated' ? 'DEACTIVATED DUE TO NON-FILING' : 'ACTIVE'}
Filing Scenario: ${result.filingType === 'routine' ? 'Routine Triennial KYC (Rule 12A(1))' : result.filingType === 'change' ? 'Event-Based Update (Rule 12A(2))' : 'DIN Reactivation'}

Triennial Cycle Schedule:
• Anchor FY: ${result.triennialCycle.anchorFy}
• Next Routine Due Window: ${result.triennialCycle.nextDueWindow}
• Statutory Deadline: ${result.triennialCycle.nextDueDate}
• Filing Due in FY 2026-27?: ${result.triennialCycle.isFilingDueThisYear ? 'YES' : 'NO'}

MCA21 Portal Payable:
• Base Government Fee: ₹${result.baseFee}
• Late / Reactivation Fee: ₹${result.lateOrReactivationFee}
• Change Update Fee: ₹${result.changeFee}
• Total e-Challan: ₹${result.totalMcaChallan.toLocaleString('en-IN')}

Key Statutory Directives:
• Rule 12A(2) Non-Reset Rule: Event-based change filing does NOT reset the 3-year triennial cycle.
• Certification: Mandatory by CA/CS/CMA in practice under Section 448 & 449.
• Cascading Risk: ${result.cascadingRisk.hasRisk ? result.cascadingRisk.title : 'None detected'}.

Calculated on CorpLawUpdates.in | India's Leading Corporate Law Intelligence
    `.trim()

    navigator.clipboard.writeText(text)
    showToast('Compliance memo copied to clipboard!', 'success')
  }

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true)
    try {
      const doc = generateDir3KycPdf(result)
      const fileName = `DIR-3_KYC_Assessment_${dinNumber || 'Director'}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      showToast('Official PDF Assessment downloaded!', 'success')
    } catch (e) {
      console.error(e)
      showToast('Failed to generate PDF. Please try again.', 'error')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrintSheet = () => {
    window.print()
  }

  return (
    <div className="space-y-12">
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MAIN WORKSPACE CONTAINER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Ribbon with Mode Switcher */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 text-white border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DIR-3 KYC Master Engine • G.S.R. 943(E) &amp; G.S.R. 300(E)</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Director KYC Due Date &amp; Penalty Determinant
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                Triennial cycle checker (Rule 12A(1)), 30-day event-based change tracker (Rule 12A(2)), and STP DIN reactivation calculator for MCA21 V3.
              </p>
            </div>

            {/* Segmented Scenario Switcher */}
            <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 self-start md:self-center">
              <button
                type="button"
                onClick={() => {
                  setFilingType('routine')
                  setDinStatus('active')
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  filingType === 'routine' && dinStatus === 'active'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Routine Triennial</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilingType('change')
                  setDinStatus('active')
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  filingType === 'change'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Update (30d)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilingType('reactivation')
                  setDinStatus('deactivated')
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  dinStatus === 'deactivated' || filingType === 'reactivation'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Reactivation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Body: 7-Col Input Form & 5-Col Sticky Scoreboard */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: 7 COLS INPUTS                                      */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Optional Director Details for Intimations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Director Name (Optional)
                </label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  DIN Number (Optional)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={dinNumber}
                  onChange={(e) => setDinNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 08765432"
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* DIN Allotment Year / Period (Anchor of Triennial Cycle) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>1. DIN Allotment Financial Year (Cycle Anchor)</span>
                </label>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  Rule 12A(1) Anchor
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The triennial cycle is anchored strictly to the financial year of DIN allotment, NOT to the date of last filing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {DIN_ALLOTMENT_PRESETS.filter(p => p.id !== 'fy_2023_24_pending').map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAllotmentPresetId(preset.id)
                      setCustomAllotmentDate('')
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      allotmentPresetId === preset.id && !customAllotmentDate
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Next Due: {preset.nextDueWindow}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Date Input */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 shrink-0">
                  Or Exact Allotment Date:
                </span>
                <input
                  type="date"
                  value={customAllotmentDate}
                  onChange={(e) => {
                    setCustomAllotmentDate(e.target.value)
                    setAllotmentPresetId('custom')
                  }}
                  className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* DIN Status Switcher (Active vs Deactivated) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                2. Current DIN Status on MCA Portal
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDinStatus('active')
                    if (filingType === 'reactivation') setFilingType('routine')
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    dinStatus === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Active / Approved</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDinStatus('deactivated')
                    setFilingType('reactivation')
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    dinStatus === 'deactivated'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Deactivated (Non-Filing)</span>
                </button>
              </div>
            </div>

            {/* Change of Details Sub-Form (Triggered if Change Scenario) */}
            {filingType === 'change' && (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span>Rule 12A(2) Event-Based Particulars Update</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-full">
                    30-Day Mandatory Window
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Altered Particular:
                    </label>
                    <select
                      value={changeCategory}
                      onChange={(e) => setChangeCategory(e.target.value as ChangeCategory)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mobile">Mobile Number (OTP Verified)</option>
                      <option value="email">Email Address (OTP Verified)</option>
                      <option value="address">Residential Address (Proof Attached)</option>
                      <option value="multiple">Multiple (Mobile + Email + Address)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date of Change:
                    </label>
                    <input
                      type="date"
                      value={changeDate}
                      onChange={(e) => setChangeDate(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 30-day Countdown Callout */}
                {result.changeCompliance.statutoryDeadline && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                    result.changeCompliance.isDelayed
                      ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-900'
                      : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-900'
                  }`}>
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        {result.changeCompliance.isDelayed
                          ? `Delayed by ${result.changeCompliance.delayDays} days past statutory deadline (${result.changeCompliance.statutoryDeadline})`
                          : `Compliant: Within 30 days of change (Deadline: ${result.changeCompliance.statutoryDeadline})`}
                      </span>
                      <p className="text-[11px] mt-0.5 opacity-90">
                        Government fee remains flat ₹500 per filing under Item VII. Filing this update does NOT extend or reset the 3-year triennial cycle.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Directorship & Cascading Disqualification Checkbox */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCompanyFilingsPending}
                  onChange={(e) => setHasCompanyFilingsPending(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Check if you are a director in any company with overdue Annual Filings (AOC-4 / MGT-7)
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px]">
                    Evaluates cascading Section 164(2) 5-year disqualification risk resulting from DIN deactivation blocking company filings.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: 5 COLS STICKY SCOREBOARD                          */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-800 relative overflow-hidden">
              {/* Subtle glowing accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Status Ribbon */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  MCA21 e-Challan Fee
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  result.statusColor === 'green'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : result.statusColor === 'blue'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : result.statusColor === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {result.dinStatus === 'deactivated' ? 'DEACTIVATED' : 'ACTIVE'}
                </span>
              </div>

              {/* Large Challan Amount Display */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
                    ₹{result.totalMcaChallan.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Flat Statutory Fee</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {result.feeRuleCitation}
                </p>
              </div>

              {/* Itemized Breakdown */}
              <div className="space-y-2.5 py-4 border-t border-b border-slate-800/80 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Routine Triennial Fee:</span>
                  <span className="font-semibold text-white">
                    {result.filingType === 'routine' && result.triennialCycle.isFilingDueThisYear
                      ? '₹0 (NIL)'
                      : '₹0 (Not Due)'}
                  </span>
                </div>

                {result.changeFee > 0 && (
                  <div className="flex justify-between items-center text-blue-300">
                    <span>Rule 12A(2) Change Fee:</span>
                    <span className="font-bold text-blue-200">₹{result.changeFee}</span>
                  </div>
                )}

                {result.lateOrReactivationFee > 0 && (
                  <div className="flex justify-between items-center text-rose-300">
                    <span>DIN Reactivation Fee:</span>
                    <span className="font-bold text-rose-300">₹{result.lateOrReactivationFee.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-white font-bold text-sm">
                  <span>Total Payable:</span>
                  <span className={result.totalMcaChallan > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                    ₹{result.totalMcaChallan.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Next Routine Due Window Card */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Next Routine Triennial Window:</span>
                  <span className="font-bold text-blue-400">{result.triennialCycle.nextDueWindow}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Statutory Due Date:</span>
                  <span className="font-semibold text-white">{result.triennialCycle.nextDueDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Required in FY 2026-27?:</span>
                  <span className={`font-bold ${result.triennialCycle.isFilingDueThisYear ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {result.triennialCycle.isFilingDueThisYear ? 'YES (Immediate)' : 'NO (Compliant)'}
                  </span>
                </div>
              </div>

              {/* Cascading Risk Alert */}
              {result.cascadingRisk.hasRisk && (
                <div className={`mt-4 p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  result.cascadingRisk.riskLevel === 'Critical'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{result.cascadingRisk.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {result.cascadingRisk.description}
                  </p>
                </div>
              )}

              {/* Mandatory Professional Certification Card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-blue-300 mb-1">
                  <Award className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>Mandatory CA / CS / CMA Certification</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Every Form DIR-3 KYC Web requires digital certification by a practicing professional under Sections 448 &amp; 449.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download Official Assessment Memo (PDF)'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Memo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintSheet}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Sheet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: VISUAL TRIENNIAL TIMELINE ROADMAP                          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Statutory Triennial KYC Roadmap (Rule 12A(1))</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          How the 3-consecutive-year cycle operates from DIN allotment under the G.S.R. 943(E) substituted framework.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Phase 1 • Year 0
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
              DIN Allotment
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Allotment by Central Government under Section 154 anchors the 3-year clock.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Phase 2 • Years 1 to 3
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
              3 Consecutive FYs
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              No routine filing required during the 3-year block unless phone/email/address changes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Phase 3 • Compliance Window
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
              April to 30 June
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              File Form DIR-3 KYC Web on or before 30 June with ₹0 government fee.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Phase 4 • Default Trigger
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
              1 July Onwards
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              DIN auto-deactivated by MCA system. Reactivation requires flat ₹5,000 fee on STP.
            </p>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: THE "NON-RESET TRAP" & RULE 12A(2) ADVISOR                 */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 mb-4">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            The #1 Misconception: The Non-Reset Trap
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Under <strong>Rule 12A(2)</strong>, filing a change-based update for your mobile number or address keeps your contact records current with the ROC, but <strong>does NOT reset or postpone your 3-year triennial cycle</strong>.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">Practical Illustration:</span> If your DIN was allotted in FY 2025-26, your next routine KYC is due in April–June 2029. If you update your mobile in 2027, your next routine KYC is still due in 2029 (NOT extended to 2030).
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 mb-4">
            <Building className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            DIN Deactivation vs Section 164 Disqualification
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            DIN deactivation is a <strong>temporary procedural block</strong> curable instantly by paying ₹5,000 on MCA V3. In contrast, Section 164(2) disqualification bars directorship across all Indian companies for 5 years and requires High Court writ relief.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">The Cascading Danger:</span> Leaving a DIN deactivated blocks the company from filing its AOC-4 and MGT-7. If that blockage lasts 3 continuous years, it triggers Section 164(2) disqualification for all directors!
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* HIDDEN PRINTABLE ASSESSMENT SHEET (#dir3kyc-printable-sheet)           */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div id="dir3kyc-printable-sheet" className="hidden print:block print:p-8 bg-white text-slate-900">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            #dir3kyc-printable-sheet, #dir3kyc-printable-sheet * { visibility: visible; }
            #dir3kyc-printable-sheet {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
            }
          }
        `}} />

        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900">CorpLawUpdates.in</h1>
              <p className="text-xs text-slate-600">Corporate Law Intelligence &amp; Statutory Compliance Advisory</p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-bold text-slate-900">FORM DIR-3 KYC WEB ASSESSMENT</p>
              <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100 w-1/3 border-r border-slate-300">Director Name:</td>
              <td className="p-2">{directorName || 'Not Specified'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100 border-r border-slate-300">DIN Number:</td>
              <td className="p-2 font-mono">{dinNumber || 'Not Specified'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100 border-r border-slate-300">DIN Status:</td>
              <td className="p-2 font-bold">{result.dinStatus.toUpperCase()}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100 border-r border-slate-300">Triennial Cycle Anchor:</td>
              <td className="p-2">{result.triennialCycle.anchorFy}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100 border-r border-slate-300">Next Routine Due Window:</td>
              <td className="p-2 font-bold">{result.triennialCycle.nextDueWindow} ({result.triennialCycle.nextDueDate})</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100 border-r border-slate-300">Total MCA21 Portal Challan:</td>
              <td className="p-2 font-bold text-base">₹{result.totalMcaChallan.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3">
          Statutory Reference: Companies (Appointment and Qualification of Directors) Amendment Rules, 2025 (G.S.R. 943(E)) and Companies (Registration Offices and Fees) Amendment Rules, 2026 (G.S.R. 300(E)).
        </div>
      </div>
    </div>
  )
}
