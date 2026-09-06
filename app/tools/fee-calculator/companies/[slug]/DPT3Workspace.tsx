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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none">
      
      {/* ── 1. Top Header Banner ── */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-navy to-slate-900 text-white border-b border-slate-800 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                V3 Portal Engine
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-2.5 py-0.5 rounded">
                Rule 16 / 16A Deposit Return
              </span>
              {isFY202526 && (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold px-2.5 py-0.5 rounded">
                  Circular 02/2026 Compliant
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-serif">
              Form DPT-3 Fee & Return of Deposits Calculator
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Table A Base Fees, Table B Multipliers (2× to 12×), Circular 02/2026 Date Arithmetic, and Dual Penalties (Rule 21 vs Section 76A).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700"
              title="Copy Assessment Summary"
            >
              <Copy className="size-3.5" />
              Copy Memo
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700"
              title="Print Clean 1-Page Summary"
            >
              <Printer className="size-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Download className="size-3.5" />
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Screen Interactive Workspace (Hidden during print) ── */}
      <div className="p-6 lg:p-8 space-y-8 print:hidden">

        {/* Circular 02/2026 Relief Banner */}
        {isFY202526 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3">
            <Info className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-amber-800 dark:text-amber-300">MCA General Circular No. 02/2026 Relief Active:</strong> For FY 2025-26, the MCA waived additional filing fees for Form DPT-3 filed up to <strong>31 July 2026</strong> due to the Data Centre fire on 5 June 2026. 
              <span className="block mt-1 font-semibold text-amber-900 dark:text-amber-200">
                Statutory Calculation Rule: For filings on or after 1 August 2026, Table B delay multipliers are calculated from the original due date of 30 June 2026 (1 July 2026), NOT from 31 July 2026.
              </span>
            </div>
          </div>
        )}

        {/* Section 1: Filing Configuration Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
          
          {/* Filing Purpose */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              1. Return Purpose (Filing Category)
            </label>
            <select
              value={filingPurpose}
              onChange={e => setFilingPurpose(e.target.value as Dpt3FilingPurpose)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="exempted">Exempted Receipts Only (Rule 2(1)(c)) — 90%+ Cos</option>
              <option value="deposits">Return of Deposits (Section 73/76)</option>
              <option value="both">Both Deposits & Exempted Receipts</option>
              <option value="one_time_loan">One-time Return for outstanding loan (Rule 16A(3))</option>
              <option value="nil">Nil Return (No Outstanding Receipts)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {filingPurpose === 'exempted'
                ? '✓ Loans from directors, customer advances, inter-corporate borrowings.'
                : filingPurpose === 'deposits'
                ? '⚠️ Requires mandatory Auditor\'s Certificate attachment.'
                : filingPurpose === 'both'
                ? '⚠️ Requires mandatory Auditor\'s Certificate attachment.'
                : filingPurpose === 'one_time_loan'
                ? '✓ Historic one-time disclosure of 2014-2019 outstanding borrowings.'
                : '✓ Best governance practice if no receipts outstanding on 31 March.'}
            </p>
          </div>

          {/* Financial Year */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              2. Financial Year Reported
            </label>
            <select
              value={selectedFY}
              onChange={e => setSelectedFY(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="2025-26">FY 2025-26 (Due: 30 June 2026 / Waived to 31 July 2026)</option>
              <option value="2024-25">FY 2024-25 (Due: 30 June 2025)</option>
              <option value="2026-27">FY 2026-27 (Due: 30 June 2027)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Outstanding position as on 31st March of the selected financial year.
            </p>
          </div>

          {/* Calculation Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              3. Calculation Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCalcMode('date')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                  calcMode === 'date'
                    ? 'bg-navy text-white border-navy dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 shadow'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                Date-Based
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('days')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                  calcMode === 'days'
                    ? 'bg-navy text-white border-navy dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 shadow'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                Direct Delay Days
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {calcMode === 'date' ? 'Pick exact calendar filing date' : 'Enter days of delay directly'}
            </p>
          </div>
        </div>

        {/* Section 2: Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Entity & Capital Inputs */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Scale className="size-4 text-amber-500" />
              Nominal Share Capital & Entity Profile
            </h3>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Company / Entity Name (Optional — for PDF & Memorandum)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Innovations Private Limited"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Has Share Capital Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Company Has Share Capital?</span>
                <p className="text-xs text-slate-500">Companies without share capital pay flat ₹200 Table A fee (Item 6)</p>
              </div>
              <input
                type="checkbox"
                checked={hasShareCapital}
                onChange={e => setHasShareCapital(e.target.checked)}
                className="size-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            {/* Capital Amount with Presets */}
            {hasShareCapital && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Authorized (Nominal) Share Capital
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={nominalCapital || ''}
                    onChange={e => setNominalCapital(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Capital Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DPT3_CAPITAL_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNominalCapital(p.value)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                        nominalCapital === p.value
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      {p.label} (₹{p.fee})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Officers Count */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Number of Officers in Default (Directors) — for Rule 21 Fine
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={officersCount}
                onChange={e => setOfficersCount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Rule 21 fine levies up to ₹5,000 on the company + ₹5,000 on each officer in default.
              </p>
            </div>
          </div>

          {/* Right Column: Deadlines & Delay Calculator */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Calendar className="size-4 text-blue-500" />
              Statutory Deadlines & Delay Calculation
            </h3>

            {calcMode === 'date' ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                    <span>Statutory Due Date (Section 73 / Rule 16):</span>
                    <strong className="text-blue-700 dark:text-blue-300 text-sm">{result.metadata.statutoryDueDate}</strong>
                  </div>
                  {result.metadata.waiverEndDate && (
                    <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 pt-1 border-t border-blue-200/60 dark:border-blue-900/50">
                      <span>Circular 02/2026 Fee Waiver Deadline:</span>
                      <strong className="text-amber-900 dark:text-amber-200 font-bold">{result.metadata.waiverEndDate}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Actual / Anticipated Date of Filing on MCA21 V3
                  </label>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={e => setFilingDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Days of Delay Beyond Statutory Due Date
                </label>
                <input
                  type="number"
                  min="0"
                  value={directDelayDays}
                  onChange={e => setDirectDelayDays(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Delay & Waiver Status Badge */}
            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Delay Status</span>
                {result.metadata.effectiveDelayDays === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="size-3.5" />
                    {result.metadata.isWaivedUnderCircular ? 'Fee Waived (Circular 02/2026)' : 'Timely / No Delay'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="size-3.5" />
                    {result.metadata.effectiveDelayDays} Day(s) Delay
                  </span>
                )}
              </div>

              {result.metadata.effectiveDelayDays > 0 && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Falls into Table B Slab: <strong className="text-slate-900 dark:text-white">{result.mcaPortalPayable.tableBSlabRange}</strong> ({result.mcaPortalPayable.tableBMultiplier}× Normal Fee).
                </div>
              )}
            </div>

            {/* Auditor Certificate Badge */}
            <div className={`p-4 rounded-xl border ${
              result.auditorCertificate.isMandatory
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                {result.auditorCertificate.isMandatory ? <ShieldAlert className="size-4 text-amber-600" /> : <ShieldCheck className="size-4 text-emerald-600" />}
                Auditor\'s Certificate Requirement
              </div>
              <p className="text-xs leading-relaxed">
                {result.auditorCertificate.ruleExplanation}
              </p>
            </div>

          </div>
        </div>

        {/* Section 3: Results Scoreboard (Challan vs Penalties) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          
          {/* Card 1: Normal Base Fee */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Table A Base Fee</span>
            <div className="text-2xl lg:text-3xl font-bold font-serif text-slate-900 dark:text-white mt-1">
              ₹ {result.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {result.mcaPortalPayable.normalFeeBasis}
            </p>
          </div>

          {/* Card 2: Additional Late Fee */}
          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Table B Late Fee
              </span>
              <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                {result.mcaPortalPayable.tableBMultiplier}× Multiplier
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-serif text-amber-950 dark:text-amber-200 mt-1">
              ₹ {result.mcaPortalPayable.additionalLateFee.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-2">
              {result.mcaPortalPayable.additionalFeeBasis}
            </p>
          </div>

          {/* Card 3: Total MCA21 Portal Payable */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy to-slate-900 text-white border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Total MCA21 e-Challan
            </span>
            <div className="text-2xl lg:text-3xl font-bold font-serif text-white mt-1">
              ₹ {result.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-300 mt-2">
              {result.mcaPortalPayable.challanTimingNotice}
            </p>
          </div>
        </div>

        {/* Section 4: Dual Penalties Breakdown (Rule 21 vs Section 76A) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Rule 21 Procedural Fine */}
          <div className={`p-5 rounded-2xl border ${
            result.rule21ProceduralFine.totalRule21Exposure > 0
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
              : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400 mb-2">
              <AlertTriangle className="size-4" />
              Rule 21 Procedural Fine (Non-Filing / Delay)
            </div>
            <div className="text-2xl font-bold font-serif text-red-950 dark:text-red-300">
              ₹ {result.rule21ProceduralFine.totalRule21Exposure.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-red-700 dark:text-red-400 mt-2 space-y-1">
              <div>• Company Fine: ₹ {result.rule21ProceduralFine.companyBaseFine.toLocaleString('en-IN')}</div>
              <div>• {result.metadata.officerCount} Officers in Default: ₹ {result.rule21ProceduralFine.officersBaseFine.toLocaleString('en-IN')}</div>
              <div>• Continuing Default ({result.metadata.effectiveDelayDays}d @ ₹500/d): ₹ {result.rule21ProceduralFine.continuingFineTotal.toLocaleString('en-IN')}</div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-red-200 dark:border-red-900/40">
              {result.rule21ProceduralFine.adjudicationNote}
            </p>
          </div>

          {/* Section 76A Substantive Penalty Exposure */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
              <ShieldAlert className="size-4 text-amber-500" />
              Section 76A Deposit Contravention Exposure
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 mt-2">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60">
                <span className="font-semibold text-slate-900 dark:text-white">Company Penalty: </span>
                {result.section76ASubstantivePenalty.companyMinFine} up to {result.section76ASubstantivePenalty.companyMaxFine}
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60">
                <span className="font-semibold text-slate-900 dark:text-white">Officers in Default: </span>
                {result.section76ASubstantivePenalty.officersImprisonment} AND/OR {result.section76ASubstantivePenalty.officersFine}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {result.section76ASubstantivePenalty.conditionNote}
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Net Worth & Deposit Ceiling Advisor (Expandable) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setShowCeilingAdvisor(!showCeilingAdvisor)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statutory Deposit Acceptance Ceilings & Net Worth Advisor (Sections 73 & 76)
              </h3>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              {showCeilingAdvisor ? 'Hide Advisor' : 'Check Statutory Deposit Limits'}
              <ChevronDown className={`size-4 transition-transform ${showCeilingAdvisor ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {showCeilingAdvisor && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Company Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPrivateCo(true)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        isPrivateCo ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                      }`}
                    >
                      Private Ltd
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrivateCo(false)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        !isPrivateCo ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                      }`}
                    >
                      Public Ltd
                    </button>
                  </div>
                </div>

                {/* Specific Status */}
                {isPrivateCo ? (
                  <>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="startup-check"
                        checked={isStartup}
                        onChange={e => setIsStartup(e.target.checked)}
                        className="size-4 text-blue-600 rounded border-slate-300"
                      />
                      <label htmlFor="startup-check" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        DPIIT Startup (≤ 10 Years)
                      </label>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="cond-check"
                        checked={meets3Conditions}
                        onChange={e => setMeets3Conditions(e.target.checked)}
                        className="size-4 text-blue-600 rounded border-slate-300"
                      />
                      <label htmlFor="cond-check" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        Meets 3 Conditions Exemption
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Net Worth (₹ Crores)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={netWorthCr}
                        onChange={e => setNetWorthCr(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Turnover (₹ Crores)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={turnoverCr}
                        onChange={e => setTurnoverCr(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Ceiling Advice Card */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl">
                <div className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
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
          )}
        </div>

        {/* Section 6: Table B Delay Slabs Comparison Matrix */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="size-4 text-blue-500" />
            Statutory Table B Delay Slabs & Multipliers (Fee Rules, 2014)
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Delay Period Beyond Due Date</th>
                  <th className="px-4 py-3">Additional Fee Multiplier</th>
                  <th className="px-4 py-3">Fee for ₹{nominalCapital.toLocaleString('en-IN')} Capital</th>
                  <th className="px-4 py-3">Statutory Basis & Notes</th>
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

        {/* Section 7: Interactive 18 Exclusions Matrix under Rule 2(1)(c) */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="size-4 text-emerald-500" />
                Rule 2(1)(c) Excluded Receipts Reference (18 Categories)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Amounts that are NOT deposits under the Act but MUST still be reported in Form DPT-3.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={exclusionSearch}
                onChange={e => setExclusionSearch(e.target.value)}
                placeholder="Search 18 categories or clauses..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredExclusions.map(ex => (
              <div
                key={ex.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {ex.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ex.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
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

        {/* Section 8: Important Practical Guidance & Reminders */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            Statutory Directives & Important Practical Directives
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
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-950">CorpLawUpdates.in</h1>
              <p className="text-[10px] text-slate-600">India\'s Free Corporate Law Intelligence & Statutory Compliance Platform</p>
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
            FORM DPT-3 — STATUTORY RETURN OF DEPOSITS & FEE ASSESSMENT MEMORANDUM
          </div>
        </div>

        {/* Section 1: Entity Profile Table */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 mb-2 border-l-2 border-slate-900">
            1. Company & Filing Profile
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
                <th className="py-1">Description & Formula</th>
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
