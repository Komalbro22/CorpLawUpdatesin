'use client'

import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileText,
  Scale,
  ShieldAlert,
  Info,
  Download,
  ShieldCheck,
  Sparkles,
  Search,
  Printer,
  ChevronDown,
  Building2,
  AlertCircle
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateDpt3Compliance,
  Dpt3FilingPurpose,
  Dpt3CalcMode,
  RULE_2_1_C_EXCLUSIONS,
  DPT3_CAPITAL_PRESETS,
  DPT3_TABLE_B_SLABS,
  getDpt3DepositCeilings
} from '@/lib/rule-engine/dpt3-engine'
import { generateDpt3Pdf } from '@/lib/pdf/generateDpt3Pdf'

interface DPT3WorkspaceProps {
  form: MCAForm
}

export default function DPT3Workspace({ form }: DPT3WorkspaceProps) {
  const { showToast } = useToast()

  // 1. Interactive Inputs
  const [calcMode, setCalcMode] = useState<Dpt3CalcMode>('date')
  const [filingPurpose, setFilingPurpose] = useState<Dpt3FilingPurpose>('exempted')
  const [selectedFY, setSelectedFY] = useState<string>('2025-26')
  const [filingDate, setFilingDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [directDelayDays, setDirectDelayDays] = useState<number>(0)
  const [hasShareCapital, setHasShareCapital] = useState<boolean>(true)
  const [nominalCapital, setNominalCapital] = useState<number>(1000000) // ₹10 Lakh default
  const [companyName, setCompanyName] = useState<string>('')
  const [officersCount, setOfficersCount] = useState<number>(2)

  // Interactive Tools: Rule 2(1)(c) Search & Deposit Ceiling Advisor
  const [exclusionSearch, setExclusionSearch] = useState<string>('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)
  const [showCeilingAdvisor, setShowCeilingAdvisor] = useState<boolean>(false)

  // Ceiling Advisor State
  const [isPrivateCo, setIsPrivateCo] = useState<boolean>(true)
  const [isStartup, setIsStartup] = useState<boolean>(false)
  const [meets3Conditions, setMeets3Conditions] = useState<boolean>(false)
  const [netWorthCr, setNetWorthCr] = useState<number>(10)
  const [turnoverCr, setTurnoverCr] = useState<number>(25)

  // 2. Compute Compliance Assessment via Canonical SSOT Engine
  const result = useMemo(() => {
    return calculateDpt3Compliance({
      companyName,
      nominalCapital,
      hasShareCapital,
      filingPurpose,
      financialYear: selectedFY,
      calcMode,
      filingDate,
      directDelayDays,
      officerCount: officersCount,
      hasActualDeposits: filingPurpose === 'deposits' || filingPurpose === 'both'
    })
  }, [
    companyName,
    nominalCapital,
    hasShareCapital,
    filingPurpose,
    selectedFY,
    calcMode,
    filingDate,
    directDelayDays,
    officersCount
  ])

  // 3. Deposit Ceiling Advisory Computation
  const ceilingAdvice = useMemo(() => {
    return getDpt3DepositCeilings(
      isPrivateCo,
      isStartup,
      meets3Conditions,
      netWorthCr,
      turnoverCr
    )
  }, [isPrivateCo, isStartup, meets3Conditions, netWorthCr, turnoverCr])

  // 4. Filtered Rule 2(1)(c) Exclusions
  const filteredExclusions = useMemo(() => {
    if (!exclusionSearch.trim()) return RULE_2_1_C_EXCLUSIONS
    const q = exclusionSearch.toLowerCase()
    return RULE_2_1_C_EXCLUSIONS.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.subClause.toLowerCase().includes(q) ||
        item.detailedConditions.toLowerCase().includes(q)
    )
  }, [exclusionSearch])

  // 5. Actions: Copy Assessment Memorandum
  const handleCopySummary = () => {
    const text = `========================================================================
FORM DPT-3 — STATUTORY RETURN OF DEPOSITS & FEE ASSESSMENT MEMORANDUM
Platform: CorpLawUpdates.in • Validated against MCA21 V3 Portal Engine
========================================================================

1. CORPORATE & FILING PROFILE:
• Company Name: ${result.metadata.companyName}
• Filing Purpose: ${result.metadata.filingPurposeLabel}
• Financial Year: FY ${result.metadata.financialYear} (Position as on 31st March)
• Authorized Capital: ${result.metadata.hasShareCapital ? `₹ ${result.metadata.nominalCapital.toLocaleString('en-IN')}` : 'Without Share Capital'}
• Statutory Due Date: ${result.metadata.statutoryDueDate} (Rule 16)
• Fee Waiver Status: ${result.metadata.waiverEndDate ? `Circular 02/2026 Waiver active up to ${result.metadata.waiverEndDate}` : 'Standard Table B Slabs'}
• Actual / Planned Filing Date: ${result.metadata.actualFilingDateDisplay}
• Days of Delay: ${result.metadata.effectiveDelayDays} Day(s)
• Auditor's Certificate Required?: ${result.auditorCertificate.isMandatory ? 'YES (Mandatory under Rule 16)' : 'NO (Exempt under Rule 16A)'}

2. MCA21 V3 PORTAL PAYABLE (e-CHALLAN):
• Table A Normal Filing Fee: ₹ ${result.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}
• Table B Delay Multiplier: ${result.mcaPortalPayable.tableBMultiplier}× Normal Fee (${result.mcaPortalPayable.tableBSlabRange})
• Additional Late Filing Fee: ₹ ${result.mcaPortalPayable.additionalLateFee.toLocaleString('en-IN')}
• TOTAL MCA21 PORTAL PAYABLE: ₹ ${result.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}

3. STATUTORY PENALTY EXPOSURE (ADJUDICATION):
• Rule 21 Procedural Fine: ₹ ${result.rule21ProceduralFine.totalRule21Exposure.toLocaleString('en-IN')}
  - Company Base: ₹ 5,000
  - ${result.metadata.officerCount} Officers in Default: ₹ ${(result.metadata.officerCount * 5000).toLocaleString('en-IN')}
  - Continuing Default (${result.metadata.effectiveDelayDays}d @ ₹500/d): ₹ ${(result.metadata.effectiveDelayDays * 500).toLocaleString('en-IN')}
• Section 76A Deposit Contravention: ${result.section76ASubstantivePenalty.isApplicable ? result.section76ASubstantivePenalty.companyMinFine : 'Not Applicable (Exempted Receipts Only)'}

4. STATUTORY DIRECTIVES & REMINDERS:
• No Revision: Form DPT-3 cannot be revised once uploaded on MCA21 V3.
• Net Worth Source: Must be referenced from the latest audited balance sheet (31 March 2025 for FY 2025-26).
• LLPs Excluded: LLPs are not governed by Section 73 and file Form 8 and Form 11 instead.
• Circular 02/2026: Post-waiver filings calculate delay from original 30 June due date.
========================================================================`

    navigator.clipboard.writeText(text)
    showToast('Assessment Memorandum copied to clipboard!', 'success')
  }

  // 6. Action: Download Official PDF
  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true)
      const doc = generateDpt3Pdf(result)
      const fileName = `Form_DPT3_Assessment_${companyName ? companyName.replace(/[^a-zA-Z0-9]/g, '_') : 'FY' + selectedFY}.pdf`
      doc.save(fileName)
      showToast('Executive PDF Memorandum downloaded successfully!', 'success')
    } catch (e) {
      console.error('Error generating PDF:', e)
      showToast('Error generating PDF memorandum', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // 7. Action: Print Isolated Assessment Sheet
  const handlePrint = () => {
    window.print()
  }

  const isFY202526 = selectedFY === '2025-26'

  return (
    <div className="space-y-8">
      {/* ── 1. Main Workspace Card (Matching ADT-1 and AOC-4 UI Standard) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 print:hidden">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-md tracking-wider">
                DPT-3 Master Engine
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Rule 16 &amp; 16A Deposit Return • Circular 02/2026 Compliant
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              Return of Deposits &amp; Exempted Receipts Calculator
            </h2>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCalcMode('date')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                calcMode === 'date'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Date-Based (30 June Rule)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('days')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                calcMode === 'days'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Direct Delay Days
            </button>
          </div>
        </div>

        {/* Input Parameters & Scoreboard Grid (7 cols / 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Optional Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Company Name (Optional — for client intimations &amp; PDF)
              </label>
              <input
                type="text"
                placeholder="e.g., Acme Innovations Private Limited"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Return Purpose Category Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                1. Return Purpose (Filing Category under Rule 16 / 16A)
              </label>
              <select
                value={filingPurpose}
                onChange={(e) => setFilingPurpose(e.target.value as Dpt3FilingPurpose)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-amber-500 transition-colors"
              >
                <option value="exempted">Exempted Receipts Only (Rule 2(1)(c)) — Over 90% of Companies</option>
                <option value="deposits">Return of Deposits (Section 73/76) [Auditor Cert Mandatory]</option>
                <option value="both">Both Deposits &amp; Exempted Receipts [Auditor Cert Mandatory]</option>
                <option value="one_time_loan">One-time Return for outstanding loan (Rule 16A(3))</option>
                <option value="nil">Nil Return (No Outstanding Receipts as on 31 March)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pl-1">
                {filingPurpose === 'exempted' && '✓ Covers director loans, customer advances, inter-corporate borrowings. Auditor certificate NOT mandatory.'}
                {filingPurpose === 'deposits' && '⚠️ Mandatory Auditor\'s Certificate attachment certifying deposit figures and conditions.'}
                {filingPurpose === 'both' && '⚠️ Mandatory Auditor\'s Certificate attachment certifying deposit figures.'}
                {filingPurpose === 'one_time_loan' && '✓ Historic one-time disclosure of 2014–2019 borrowings.'}
                {filingPurpose === 'nil' && '✓ Recommended governance practice if no receipts are outstanding as on 31 March.'}
              </p>
            </div>

            {/* Financial Year & Date Timelines */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Statutory Filing Timelines
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Rule 16: On or before 30th June
                </span>
              </div>

              {/* Financial Year Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Financial Year Reported (As on 31st March)
                </label>
                <select
                  value={selectedFY}
                  onChange={(e) => setSelectedFY(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-colors"
                >
                  <option value="2025-26">FY 2025-26 (Due: 30 June 2026 / Waived to 31 July 2026)</option>
                  <option value="2024-25">FY 2024-25 (Due: 30 June 2025)</option>
                  <option value="2026-27">FY 2026-27 (Due: 30 June 2027)</option>
                </select>
              </div>

              {/* Date-Based Mode Inputs */}
              {calcMode === 'date' ? (
                <div className="space-y-4 pt-1">
                  
                  {/* Circular 02/2026 Callout if FY 2025-26 */}
                  {isFY202526 && (
                    <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-amber-800 dark:text-amber-300">MCA Circular 02/2026 Relief:</strong> Filings up to <strong>31 July 2026</strong> enjoy complete fee waiver (₹0 late fee). For filings on/after <strong>1 August 2026</strong>, delay multipliers are calculated from the original due date of <strong>30 June 2026</strong>!
                    </div>
                  )}

                  {/* Quick Preset Date Buttons */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Actual / Planned Filing Date
                      </label>
                      <div className="flex items-center gap-1 flex-wrap">
                        {isFY202526 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setFilingDate('2026-06-30')}
                              className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 font-medium transition-colors"
                            >
                              30 June (Std Due)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFilingDate('2026-07-31')}
                              className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 hover:bg-blue-200 font-medium transition-colors"
                            >
                              31 July (Waiver End)
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setFilingDate(new Date().toISOString().slice(0, 10))}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium transition-colors"
                        >
                          Today
                        </button>
                      </div>
                    </div>
                    <input
                      type="date"
                      value={filingDate}
                      onChange={(e) => setFilingDate(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm font-semibold focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                /* Direct Delay Days Mode */
                <div className="space-y-4 pt-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Delay Beyond Statutory Due Date (in Calendar Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={directDelayDays}
                    onChange={(e) => setDirectDelayDays(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                  
                  {/* Quick Delay Chips */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">Quick Delay Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '0 Days (On-Time)', val: 0 },
                        { label: '15 Days (2×)', val: 15 },
                        { label: '30 Days (2×)', val: 30 },
                        { label: '45 Days (4×)', val: 45 },
                        { label: '75 Days (6×)', val: 75 },
                        { label: '120 Days (10×)', val: 120 },
                        { label: '200 Days (12×)', val: 200 }
                      ].map((chip) => (
                        <button
                          key={chip.val}
                          type="button"
                          onClick={() => setDirectDelayDays(chip.val)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                            directDelayDays === chip.val
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Company without Share Capital (Flat ₹200)
                  </span>
                </label>
              </div>

              {hasShareCapital && (
                <>
                  {/* Preset Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {DPT3_CAPITAL_PRESETS.map((preset) => {
                      const isCurrent = nominalCapital === preset.value
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setNominalCapital(preset.value)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 text-amber-800 dark:text-amber-300 font-bold ring-2 ring-amber-500/20 shadow-sm'
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
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 pl-8 text-sm focus:ring-2 focus:ring-amber-500 transition-colors font-semibold"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Officers in Default for Rule 21 */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Number of Officers in Default (Directors) — for Rule 21 Fine
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={officersCount}
                onChange={(e) => setOfficersCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 transition-colors font-semibold"
              />
              <p className="text-[11px] text-slate-500 mt-1 pl-1">
                Rule 21 fine applies up to ₹5,000 on the company + ₹5,000 on each officer in default + ₹500/day.
              </p>
            </div>

          </div>

          {/* Right Column: Live Computation Scoreboard Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* The Big Results Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
              
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* Header Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    FEE COMPUTATION RESULT
                  </span>
                  {result.metadata.effectiveDelayDays === 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {result.metadata.isWaivedUnderCircular ? 'CIR 02/2026 WAIVED' : 'ON-TIME FILING'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      DELAYED ({result.metadata.effectiveDelayDays}d)
                    </span>
                  )}
                </div>

                {/* Total Fee Big Number */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Total MCA21 Portal Challan</span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl text-slate-400 font-medium">₹</span>
                    {result.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Governed by Table A &amp; Table B Multipliers (Fees Rules, 2014)
                  </p>
                </div>

                {/* Breakdown Details Box */}
                <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                  
                  {/* Normal Base Fee */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Table A Normal Base Fee:</span>
                    <span className="font-bold text-white">
                      ₹ {result.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Delay Multiplier Fee */}
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300">Table B Late Fee:</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {result.mcaPortalPayable.tableBMultiplier}× Multiplier
                      </span>
                    </div>
                    <span className={`font-bold ${result.mcaPortalPayable.additionalLateFee > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                      ₹ {result.mcaPortalPayable.additionalLateFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Total e-Challan */}
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700 font-bold">
                    <span className="text-white">Total e-Challan:</span>
                    <span className="text-amber-400 text-base">
                      ₹ {result.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Auditor Certificate Badge Card */}
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  result.auditorCertificate.isMandatory
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {result.auditorCertificate.isMandatory ? (
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>Auditor&apos;s Certificate: {result.auditorCertificate.statusBadge}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {result.auditorCertificate.ruleExplanation}
                  </p>
                </div>

                {/* Rule 21 Procedural Fine Exposure */}
                {result.rule21ProceduralFine.totalRule21Exposure > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Rule 21 Procedural Fine Exposure</span>
                    </div>
                    <div className="text-lg font-bold text-white mb-1">
                      ₹ {result.rule21ProceduralFine.totalRule21Exposure.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Company: ₹5,000 | {result.metadata.officerCount} Officers: ₹{(result.metadata.officerCount * 5000).toLocaleString('en-IN')} | Continuing ({result.metadata.effectiveDelayDays}d @ ₹500/d): ₹{(result.metadata.effectiveDelayDays * 500).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Memo
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Sheet
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF Report'}
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── 2. Lower Dedicated Sections ── */}
      <div className="space-y-8 print:hidden">
        
        {/* Section A: Table B Delay Slabs Comparison Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Statutory Table B Additional Fee Slabs (Fee Rules, 2014)
            </h3>
            <span className="text-xs text-slate-500">Based on Authorized Capital of ₹{nominalCapital.toLocaleString('en-IN')}</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Delay Period Beyond Due Date</th>
                  <th className="px-4 py-3">Table B Multiplier</th>
                  <th className="px-4 py-3">Fee for Your Capital</th>
                  <th className="px-4 py-3">Statutory Basis &amp; Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {result.tableBSlabComparison.map((slab, idx) => {
                  return (
                    <tr
                      key={idx}
                      className={slab.isActive ? 'bg-amber-100/70 dark:bg-amber-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-200">
                        {slab.slabRange}
                        {slab.isActive && (
                          <span className="ml-2 text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                            Active Slab
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-amber-700 dark:text-amber-400 font-bold">{slab.multiplierLabel}</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-semibold">
                        ₹ {slab.calculatedFeeForCompany.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{DPT3_TABLE_B_SLABS[idx]?.guidanceNotes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section B: Net Worth & Deposit Ceilings Advisor (Sections 73 & 76) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Statutory Deposit Acceptance Ceilings &amp; Net Worth Advisor (Sections 73 &amp; 76)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Determine whether your company is permitted to accept deposits from members/public and calculate allowable limits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCeilingAdvisor(!showCeilingAdvisor)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              {showCeilingAdvisor ? 'Collapse Advisor' : 'Configure Parameters'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showCeilingAdvisor ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Company Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Company Constitution
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivateCo(true)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                    isPrivateCo
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  Private Limited
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivateCo(false)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                    !isPrivateCo
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  Public Limited
                </button>
              </div>
            </div>

            {/* Constitution Details */}
            {isPrivateCo ? (
              <>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="startup-check-adv"
                    checked={isStartup}
                    onChange={(e) => setIsStartup(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="startup-check-adv" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    DPIIT Recognized Startup (≤ 10 Yrs)
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="cond-check-adv"
                    checked={meets3Conditions}
                    onChange={(e) => setMeets3Conditions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="cond-check-adv" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Meets 3 Conditions (G.S.R. 464(E))
                  </label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Net Worth (₹ Crores)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={netWorthCr}
                    onChange={(e) => setNetWorthCr(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Annual Turnover (₹ Crores)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={turnoverCr}
                    onChange={(e) => setTurnoverCr(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </>
            )}
          </div>

          {/* Ceiling Advice Card */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Statutory Deposit Limit Determination:
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {ceilingAdvice.statutoryLimitDescription}
            </p>
            <p className="text-[11px] text-blue-800 dark:text-blue-400 mt-2 font-semibold">
              📌 {ceilingAdvice.netWorthBasisNote}
            </p>
          </div>
        </div>

        {/* Section C: Interactive Rule 2(1)(c) 18 Exclusions Explorer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Rule 2(1)(c) Excluded Receipts Reference (18 Categories)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Amounts that are NOT deposits under the Act but MUST still be reported in Form DPT-3.
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={exclusionSearch}
                onChange={(e) => setExclusionSearch(e.target.value)}
                placeholder="Search categories or clauses..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredExclusions.map((ex) => (
              <div
                key={ex.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {ex.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ex.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                    {ex.subClause}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                  {ex.detailedConditions}
                </p>
                <div className="mt-2 pl-7 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  <strong>Audit Pointer:</strong> {ex.auditPointer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section D: Important Practical Compliance Notes */}
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Statutory Directives &amp; Compliance Safeguards
          </h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>No Revision Once Filed:</strong> {result.criticalReminders.noRevisionNotice}
            </li>
            <li>
              <strong>Net Worth Reference Date:</strong> {result.criticalReminders.netWorthSourceNotice}
            </li>
            <li>
              <strong>LLPs Are Not Required to File DPT-3:</strong> {result.criticalReminders.llpNonApplicabilityNotice}
            </li>
            <li>
              <strong>CCFS-2026 Amnesty Scheme:</strong> {result.criticalReminders.ccfs2026Notice}
            </li>
          </ul>
        </div>

      </div>

      {/* ── 3. Isolated Printable Memorandum Sheet (#dpt3-printable-sheet) ── */}
      <div id="dpt3-printable-sheet" className="hidden print:block font-sans text-slate-900 bg-white p-6 leading-normal">
        
        {/* Print Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <div role="heading" aria-level={2} className="text-xl font-bold uppercase tracking-tight text-slate-950">CorpLawUpdates.in</div>
              <p className="text-[10px] text-slate-600">India\'s Free Corporate Law Intelligence &amp; Statutory Compliance Platform</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                STATUTORY MEMORANDUM
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-800">
            FORM DPT-3 — STATUTORY RETURN OF DEPOSITS &amp; FEE ASSESSMENT MEMORANDUM
          </div>
        </div>

        {/* Section 1: Entity Profile Table */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 mb-2 border-l-2 border-slate-900">
            1. Company &amp; Filing Profile
          </h2>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600 w-1/3">Company Name:</td>
                <td className="py-1 font-bold text-slate-900">{result.metadata.companyName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600">Return Purpose:</td>
                <td className="py-1 text-slate-800">{result.metadata.filingPurposeLabel}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600">Financial Year Reported:</td>
                <td className="py-1 text-slate-800">FY {result.metadata.financialYear} (Position as on 31st March)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600">Authorized Capital:</td>
                <td className="py-1 text-slate-800">
                  {result.metadata.hasShareCapital ? `₹ ${result.metadata.nominalCapital.toLocaleString('en-IN')}` : 'Without Share Capital'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600">Statutory Due Date:</td>
                <td className="py-1 font-bold text-slate-900">{result.metadata.statutoryDueDate} (Rule 16)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600">Fee Waiver Status:</td>
                <td className="py-1 text-slate-800">
                  {result.metadata.waiverEndDate ? `Circular 02/2026 Waiver up to ${result.metadata.waiverEndDate}` : 'Standard Table B Slabs'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600">Actual / Filing Date:</td>
                <td className="py-1 text-slate-800">{result.metadata.actualFilingDateDisplay}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 font-semibold text-slate-600">Days Delayed:</td>
                <td className="py-1 font-bold text-slate-900">{result.metadata.effectiveDelayDays} Day(s)</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Auditor Certificate Required?:</td>
                <td className="py-1 font-bold text-slate-900">
                  {result.auditorCertificate.isMandatory ? 'YES (Mandatory under Rule 16)' : 'NO (Exempted Receipts Only)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: MCA Portal Challan Breakdown */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 mb-2 border-l-2 border-slate-900">
            2. MCA21 V3 Portal Payable Breakdown (e-Challan)
          </h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-left font-bold text-slate-700">
                <th className="py-1">Fee Component</th>
                <th className="py-1">Statutory Basis</th>
                <th className="py-1 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-1 font-medium">Table A Normal Base Fee</td>
                <td className="py-1 text-slate-600">{result.mcaPortalPayable.normalFeeBasis}</td>
                <td className="py-1 text-right font-bold">₹ {result.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Table B Late Filing Fee ({result.mcaPortalPayable.tableBMultiplier}× Normal Fee)</td>
                <td className="py-1 text-slate-600">{result.mcaPortalPayable.additionalFeeBasis}</td>
                <td className="py-1 text-right font-bold">₹ {result.mcaPortalPayable.additionalLateFee.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-t-2 border-slate-900 bg-slate-50 font-bold">
                <td className="py-1.5 uppercase">TOTAL MCA21 PORTAL PAYABLE</td>
                <td className="py-1.5 text-slate-600">Immediate e-Challan / NetBanking / UPI</td>
                <td className="py-1.5 text-right text-sm">₹ {result.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Statutory Penalties Breakdown */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 mb-2 border-l-2 border-slate-900">
            3. Statutory Penalties Exposure (Adjudication)
          </h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-left font-bold text-slate-700">
                <th className="py-1">Statutory Provision</th>
                <th className="py-1">Description &amp; Formula</th>
                <th className="py-1 text-right">Indicative Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-1 font-medium text-red-700">Rule 21 Procedural Fine</td>
                <td className="py-1 text-slate-600">
                  Company: ₹5,000 | {result.metadata.officerCount} Officers: ₹{(result.metadata.officerCount * 5000).toLocaleString('en-IN')} | Continuing default: ₹{(result.metadata.effectiveDelayDays * 500).toLocaleString('en-IN')}
                </td>
                <td className="py-1 text-right font-bold text-red-700">
                  ₹ {result.rule21ProceduralFine.totalRule21Exposure.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-slate-800">Section 76A Deposit Contravention</td>
                <td className="py-1 text-slate-600">{result.section76ASubstantivePenalty.conditionNote}</td>
                <td className="py-1 text-right font-semibold text-slate-800">
                  {result.section76ASubstantivePenalty.isApplicable ? result.section76ASubstantivePenalty.companyMinFine : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Directives & Legal Notice */}
        <div className="border-t border-slate-300 pt-2 text-[9px] text-slate-600 space-y-1">
          <p><strong>LEGAL NOTICE:</strong> This assessment is generated by CorpLawUpdates.in for professional compliance reference. Normal fees and Table B multipliers are prescribed under the Companies (Registration Offices and Fees) Rules, 2014 and MCA General Circular 02/2026.</p>
          <p><strong>Rule 21 Adjudication:</strong> Rule 21 procedural fines are not collected via MCA21 e-Challan; they require formal ROC adjudication under Section 454.</p>
          <p><strong>No Revision:</strong> Form DPT-3 cannot be revised once filed on MCA21 V3. Net worth figures must be derived from the latest audited balance sheet prior to the return date.</p>
        </div>

      </div>

      {/* ── 4. Print Styles — Isolates #dpt3-printable-sheet for crisp 1-page browser print ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 10mm 12mm;
            size: portrait;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          body * {
            visibility: hidden !important;
          }
          #dpt3-printable-sheet,
          #dpt3-printable-sheet * {
            visibility: visible !important;
          }
          #dpt3-printable-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      ` }} />

    </div>
  )
}
