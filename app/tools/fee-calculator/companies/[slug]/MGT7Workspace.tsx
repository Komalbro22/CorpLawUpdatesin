'use client'

import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  Download,
  Printer,
  Copy,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Scale,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateMgt7Compliance,
  Mgt7ComplianceCalculationResult
} from '@/lib/rule-engine/mgt7-engine'
import { generateMgt7Pdf } from '@/lib/pdf/generateMgt7Pdf'

interface MGT7WorkspaceProps {
  form: MCAForm
}

type CalcMode = 'date' | 'days'

const CAPITAL_PRESETS = [
  { label: '< ₹1 Lakh', value: 90000, fee: 200 },
  { label: '₹1L – ₹5L', value: 100000, fee: 300 },
  { label: '₹5L – ₹25L', value: 1000000, fee: 400 },
  { label: '₹25L – ₹1Cr', value: 5000000, fee: 500 },
  { label: '≥ ₹1 Crore', value: 10000000, fee: 600 }
]

const DELAY_TIERS = [
  { days: 0, label: '0 Days (On-Time)', fee: 0, notes: 'Filed on or before statutory 60-day due date' },
  { days: 15, label: '15 Days Delay', fee: 1500, notes: '15 days × ₹100/day statutory late fee' },
  { days: 30, label: '30 Days Delay', fee: 3000, notes: '30 days × ₹100/day statutory late fee' },
  { days: 60, label: '60 Days Delay', fee: 6000, notes: '60 days × ₹100/day statutory late fee' },
  { days: 90, label: '90 Days Delay', fee: 9000, notes: '90 days × ₹100/day statutory late fee' },
  { days: 180, label: '180 Days Delay', fee: 18000, notes: '180 days × ₹100/day statutory late fee' },
  { days: 365, label: '365 Days (1 Year)', fee: 36500, notes: 'Uncapped ₹100/day penalty continues indefinitely' }
]

export default function MGT7Workspace({ form }: MGT7WorkspaceProps) {
  const { showToast } = useToast()

  // Form Code: MGT-7 vs MGT-7A
  const [formCode, setFormCode] = useState<'MGT-7' | 'MGT-7A'>(
    form.slug === 'mgt-7a' ? 'MGT-7A' : 'MGT-7'
  )

  // Mode: Date vs Direct Days
  const [calcMode, setCalcMode] = useState<CalcMode>('date')

  // Optional Company Name
  const [companyName, setCompanyName] = useState<string>('')

  // Financial Year & AGM Date
  const [selectedFY, setSelectedFY] = useState<string>('2025-26')
  const [agmType, setAgmType] = useState<'first' | 'subsequent'>('subsequent')
  const [agmStatus, setAgmStatus] = useState<'held' | 'extended_and_held' | 'not_held'>('held')
  const [actualAgmDate, setActualAgmDate] = useState<string>('2026-09-30')
  const [rocExtensionDate, setRocExtensionDate] = useState<string>('2026-12-31')
  const [actualFilingDate, setActualFilingDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  )

  // Direct Delay Days input
  const [directDelayDays, setDirectDelayDays] = useState<number>(0)

  // Capital states
  const [hasShareCapital, setHasShareCapital] = useState<boolean>(true)
  const [nominalCapital, setNominalCapital] = useState<number>(1000000) // ₹10 Lakhs default
  const [paidUpCapital, setPaidUpCapital] = useState<number>(1000000)
  const [turnoverPrecedingFY, setTurnoverPrecedingFY] = useState<number>(5000000) // ₹50 Lakhs default

  // Company Classification
  const [companyTypeSelection, setCompanyTypeSelection] = useState<
    'private_standard' | 'one_person_company' | 'public_unlisted' | 'public_listed' | 'section_8' | 'producer' | 'startup'
  >(form.slug === 'mgt-7a' ? 'one_person_company' : 'private_standard')

  // Section 2(85) Statutory Exclusions
  const [isHoldingCompany, setIsHoldingCompany] = useState<boolean>(false)
  const [isSubsidiaryCompany, setIsSubsidiaryCompany] = useState<boolean>(false)
  const [isSpecialActBodyCorporate, setIsSpecialActBodyCorporate] = useState<boolean>(false)

  // Directors / Officers in default count
  const [officerCount, setOfficerCount] = useState<number>(2)

  // PDF Generation loading
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)

  // ───────────────────────────────────────────────────────────────────────────
  // COMPREHENSIVE ENGINE COMPUTATION
  // ───────────────────────────────────────────────────────────────────────────
  const complianceResult: Mgt7ComplianceCalculationResult = useMemo(() => {
    const fyYear = parseInt(selectedFY.split('-')[0], 10) + 1
    const fyEndDate = new Date(fyYear, 2, 31) // March 31 of respective FY

    const isPrivate = ['private_standard', 'one_person_company', 'startup'].includes(companyTypeSelection)
    const isOpc = companyTypeSelection === 'one_person_company'
    const isStartup = companyTypeSelection === 'startup'
    const isProducer = companyTypeSelection === 'producer'
    const isSection8 = companyTypeSelection === 'section_8'
    const isListed = companyTypeSelection === 'public_listed'

    // In direct days mode, artificially adjust actualFilingDate relative to statutory due date
    let filingDateToUse = new Date(actualFilingDate)
    if (calcMode === 'days') {
      const baseAgm = new Date(actualAgmDate)
      const computedDue = new Date(baseAgm)
      computedDue.setDate(computedDue.getDate() + 60)
      filingDateToUse = new Date(computedDue)
      filingDateToUse.setDate(filingDateToUse.getDate() + Math.max(0, directDelayDays))
    }

    return calculateMgt7Compliance({
      formCode,
      nominalCapital: hasShareCapital ? Math.max(0, nominalCapital) : 0,
      hasShareCapital,
      financialYearEnd: fyEndDate,
      agmType,
      agmStatus,
      actualAgmDate: agmStatus !== 'not_held' && actualAgmDate ? new Date(actualAgmDate) : undefined,
      rocApprovedExtendedLastDate: agmType === 'subsequent' && (agmStatus === 'extended_and_held' || rocExtensionDate) ? new Date(rocExtensionDate) : undefined,
      actualFilingDate: filingDateToUse,
      officerCount: Math.max(1, officerCount),
      isPrivateCompany: isPrivate,
      isHoldingCompany,
      isSubsidiaryCompany,
      isSection8Company: isSection8,
      isSpecialActBodyCorporate,
      paidUpCapital: hasShareCapital ? Math.max(0, paidUpCapital) : 0,
      turnoverPrecedingFY: Math.max(0, turnoverPrecedingFY),
      isOnePersonCompany: isOpc,
      isStartupCompany: isStartup,
      isProducerCompany: isProducer,
      isListed
    })
  }, [
    formCode,
    calcMode,
    directDelayDays,
    selectedFY,
    agmType,
    agmStatus,
    actualAgmDate,
    rocExtensionDate,
    actualFilingDate,
    hasShareCapital,
    nominalCapital,
    paidUpCapital,
    turnoverPrecedingFY,
    companyTypeSelection,
    isHoldingCompany,
    isSubsidiaryCompany,
    isSpecialActBodyCorporate,
    officerCount
  ])

  // Extract key computed fields
  const delayDays = complianceResult.metadata.daysDelayed
  const isDelayed = delayDays > 0
  const normalFee = complianceResult.mcaPortalPayable.normalFilingFee
  const lateFee = complianceResult.mcaPortalPayable.additionalFilingFee
  const totalChallan = complianceResult.mcaPortalPayable.totalPortalPayable
  const statutoryDueDate = complianceResult.metadata.statutoryDueDate
  const isSmallCompany = complianceResult.smallCompanyAssessment.isSmallCompany
  const isMgt8Required = complianceResult.pcsCertification.mgt8Required
  const isSection446B = complianceResult.metadata.section446BEligible

  // Preset handlers
  const handleSelectCapitalPreset = (val: number) => {
    setHasShareCapital(true)
    setNominalCapital(val)
  }

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`

  // Copy breakdown for WhatsApp / Email
  const handleCopyBreakdown = () => {
    const compHeader = companyName ? `Company: ${companyName}\n` : ''
    const delayText = isDelayed
      ? `Delay: ${delayDays} day(s)\nLate Fee Rate: ₹100/day (Uncapped)\n`
      : 'Status: On-Time Filing (0 days delay)\n'
    const mgt8Text = isMgt8Required ? '\n⚠️ Mandatory PCS Certification in Form MGT-8 Required.' : ''
    const sec92Text = isDelayed
      ? `\nIndicative Sec 92(5) Adjudication Exposure:\n• Company: ${formatINR(complianceResult.statutoryPenaltyExposure.companyIndicativeMaximumExposure)}\n• Officers (${officerCount}): ${formatINR(complianceResult.statutoryPenaltyExposure.officersIndicativeMaximumExposure)}`
      : ''

    const text = `📋 FORM ${formCode} STATUTORY ANNUAL RETURN ESTIMATE (FY 2026-27)
${compHeader}Form: ${formCode} (${complianceResult.metadata.formName})
Financial Year: ${selectedFY}
Nominal Capital: ${hasShareCapital ? formatINR(nominalCapital) : 'Without Share Capital'}
Due Date: ${statutoryDueDate}
${delayText}
─────────────────────────────
• Normal Filing Fee: ${formatINR(normalFee)}
• Additional Late Fee: ${formatINR(lateFee)}
═════════════════════════════
TOTAL MCA CHALLAN PAYABLE: ${formatINR(totalChallan)}
═════════════════════════════${mgt8Text}${sec92Text}

Generated via CorpLawUpdates Fee Calculator:
https://www.corplawupdates.in/tools/fee-calculator/companies/${formCode.toLowerCase()}`

    navigator.clipboard.writeText(text)
    showToast('Annual return fee breakdown copied to clipboard!', 'success')
  }

  // Download PDF
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true)
    try {
      const doc = generateMgt7Pdf(complianceResult, companyName.trim() || undefined)
      const cleanName = companyName ? companyName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Company'
      doc.save(`CorpLawUpdates_${formCode}_Report_${cleanName}.pdf`)
      showToast('Official MGT-7/7A calculation memo downloaded as PDF!', 'success')
    } catch (e) {
      console.error('Error generating MGT-7 PDF:', e)
      showToast('Failed to generate PDF. Please use the Print Sheet option.', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* 1. Main Master Workspace Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        
        {/* Header Ribbon with Form Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-blue-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-md tracking-wider">
                {formCode} Master Engine
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Section 92 &amp; ₹100/day Uncapped Late Fee
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Annual Return Fee &amp; Due Date Calculator
            </h2>
          </div>

          {/* Form Switcher + Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Form Code Toggle */}
            <div className="flex bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setFormCode('MGT-7')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  formCode === 'MGT-7'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600'
                }`}
              >
                MGT-7 (Standard)
              </button>
              <button
                type="button"
                onClick={() => setFormCode('MGT-7A')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  formCode === 'MGT-7A'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600'
                }`}
              >
                MGT-7A (OPC / Small)
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCalcMode('date')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  calcMode === 'date'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                60-Day AGM Rule
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('days')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  calcMode === 'days'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Direct Delay Days
              </button>
            </div>
          </div>
        </div>

        {/* Form Routing Guidance Notice if Mismatch */}
        {complianceResult.metadata.formRoutingMismatch && complianceResult.metadata.formRoutingRecommendation && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Statutory Form Routing Advisory
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                  {complianceResult.metadata.formRoutingRecommendation}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormCode(formCode === 'MGT-7' ? 'MGT-7A' : 'MGT-7')}
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0 shadow-sm"
            >
              Switch to {formCode === 'MGT-7' ? 'MGT-7A' : 'MGT-7'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Workspace Columns: 7 Cols Left (Inputs), 5 Cols Right (Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Optional Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Company Name (Optional — for client intimations &amp; PDF memo)
              </label>
              <input
                type="text"
                placeholder="e.g., Apex Global Technologies Private Limited"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Date-Based Controls */}
            {calcMode === 'date' ? (
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    AGM &amp; Statutory Filing Timelines
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Section 92(4): 60 Days from AGM
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Financial Year */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Financial Year
                    </label>
                    <select
                      value={selectedFY}
                      onChange={(e) => setSelectedFY(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                    >
                      <option value="2025-26">FY 2025-26 (Latest / Current 2026-27)</option>
                      <option value="2024-25">FY 2024-25</option>
                      <option value="2023-24">FY 2023-24</option>
                      <option value="2022-23">FY 2022-23</option>
                      <option value="2021-22">FY 2021-22</option>
                      <option value="2020-21">FY 2020-21 (MGT-7A Notification)</option>
                    </select>
                  </div>

                  {/* AGM Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      AGM Status / Context
                    </label>
                    <select
                      value={agmStatus}
                      onChange={(e) => setAgmStatus(e.target.value as any)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                    >
                      <option value="held">AGM Held (Standard 60 Days)</option>
                      <option value="extended_and_held">Extended by ROC &amp; Held (Sec 96(1))</option>
                      <option value="not_held">AGM Not Held (Reason Statement)</option>
                    </select>
                  </div>
                </div>

                {/* AGM Date Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date of AGM / Deemed Adoption (Day 0)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActualAgmDate('2026-09-30')}
                        className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 font-medium transition-colors"
                      >
                        30 Sept (Std AGM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActualAgmDate('2025-09-30')}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium transition-colors"
                      >
                        FY 24-25 AGM
                      </button>
                      <button
                        type="button"
                        onClick={() => setActualAgmDate(new Date().toISOString().slice(0, 10))}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium transition-colors"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={actualAgmDate}
                    onChange={(e) => setActualAgmDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {/* Extended AGM Date if Extended */}
                {agmStatus === 'extended_and_held' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      ROC Approved Extended Last Date (Section 96(1) Max 3 Months)
                    </label>
                    <input
                      type="date"
                      value={rocExtensionDate}
                      onChange={(e) => setRocExtensionDate(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                )}

                {/* Actual / Planned Filing Date */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Actual / Planned Filing Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setActualFilingDate(new Date().toISOString().slice(0, 10))}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium transition-colors"
                    >
                      Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={actualFilingDate}
                    onChange={(e) => setActualFilingDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            ) : (
              /* Direct Delay Days Mode */
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Delay Beyond 60-Day Statutory Due Date (in Days)
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
                    {DELAY_TIERS.map((tier) => (
                      <button
                        key={tier.days}
                        type="button"
                        onClick={() => setDirectDelayDays(tier.days)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          directDelayDays === tier.days
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {tier.label}
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
                  Nominal / Authorized Share Capital (Table A Bracket)
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
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 pl-8 text-sm focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Step 2: Small Company Fact Evaluator & MGT-8 Validation (Section 2(85)) */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Small Company &amp; PCS Certification Engine (Sec 2(85))
                </span>
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  G.S.R. 880(E) Limits: ₹10 Cr / ₹100 Cr
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Classification
                  </label>
                  <select
                    value={companyTypeSelection}
                    onChange={(e) => setCompanyTypeSelection(e.target.value as any)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    <option value="private_standard">Private Limited (Standard)</option>
                    <option value="one_person_company">One Person Company (OPC)</option>
                    <option value="startup">Start-up Company (DPIIT Recognized)</option>
                    <option value="producer">Producer Company (Chapter XXIA)</option>
                    <option value="public_unlisted">Public Limited (Unlisted)</option>
                    <option value="public_listed">Public Limited (Listed)</option>
                    <option value="section_8">Section 8 Company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Officers in Default
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={officerCount}
                    onChange={(e) => setOfficerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid-up Share Capital (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidUpCapital}
                    onChange={(e) => setPaidUpCapital(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {(paidUpCapital / 10000000).toFixed(2)} Crore
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preceding FY Turnover (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={turnoverPrecedingFY}
                    onChange={(e) => setTurnoverPrecedingFY(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {(turnoverPrecedingFY / 10000000).toFixed(2)} Crore
                  </span>
                </div>
              </div>

              {/* Statutory Disqualification Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHoldingCompany}
                    onChange={(e) => setIsHoldingCompany(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Holding Co (Sec 2(46))
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSubsidiaryCompany}
                    onChange={(e) => setIsSubsidiaryCompany(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Subsidiary Co (Sec 2(87))
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecialActBodyCorporate}
                    onChange={(e) => setIsSpecialActBodyCorporate(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Special Act Body Corporate
                </label>
              </div>

              {/* Live Status Badges */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 text-[11px]">
                <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 ${
                  isSmallCompany
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  {isSmallCompany ? 'Qualified Small Company (MGT-7A)' : 'Non-Small Company (MGT-7)'}
                </span>

                <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 ${
                  isMgt8Required
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  <ShieldAlert className="w-3 h-3" />
                  {isMgt8Required ? 'PCS Form MGT-8 Certification Mandatory' : 'Director & CS Signature Only'}
                </span>

                {isSection446B && (
                  <span className="px-2.5 py-1 rounded-md font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Section 446B 50% Penalty Relief
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Live Computation Results Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dark Navy Results Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
              
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* Header Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {formCode} CHALLAN COMPUTATION
                  </span>
                  {!isDelayed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ON-TIME FILING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      DELAYED ({delayDays}d)
                    </span>
                  )}
                </div>

                {/* Big Total Challan Number */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Total MCA Portal e-Challan Payable</span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl text-slate-400 font-medium">₹</span>
                    {totalChallan.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Governed by Table A &amp; Rule 12 Second Amendment (₹100/day)
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

                  {/* Delay Late Fee */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Additional Late Fee:
                    </span>
                    <div className="text-right">
                      <span className={`font-bold ${lateFee > 0 ? 'text-rose-400' : 'text-white'}`}>
                        {formatINR(lateFee)}
                      </span>
                      {delayDays > 0 && (
                        <span className="block text-[11px] text-amber-300 font-medium">
                          ({delayDays} days × ₹100/day)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Due Date & Delay Duration */}
                  <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-xs text-slate-400">
                    <span>Statutory Due Date:</span>
                    <span className="font-semibold text-slate-200">
                      {statutoryDueDate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Delay Duration:</span>
                    <span className="font-semibold text-slate-200">
                      {!isDelayed ? '0 days (Compliant)' : `${delayDays} days overdue`}
                    </span>
                  </div>
                </div>

                {/* Section 92(5) Adjudication Exposure Card */}
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-indigo-400" />
                      Section 92(5) Adjudication Exposure
                    </span>
                    {isSection446B && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                        Sec 446B (50% Relief)
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Company Exposure</span>
                      <span className="font-bold text-rose-300 text-sm">
                        {formatINR(complianceResult.statutoryPenaltyExposure.companyIndicativeMaximumExposure)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isSection446B ? 'Cap: ₹1,00,000' : 'Cap: ₹2,00,000'}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Per Officer ({officerCount} Off)</span>
                      <span className="font-bold text-rose-300 text-sm">
                        {formatINR(Math.round(complianceResult.statutoryPenaltyExposure.officersIndicativeMaximumExposure / Math.max(1, officerCount)))}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isSection446B ? 'Cap: ₹25,000/off' : 'Cap: ₹50,000/off'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight">
                    *Adjudication penalty is separate from portal challan; applicable only if ROC initiates formal proceedings under Section 454.
                  </p>
                </div>

                {/* Action Buttons: Download PDF, Print & Copy */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs md:text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                    {isGeneratingPdf ? 'Generating PDF Certificate...' : `Download Official ${formCode} Report`}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-rose-400" />
                      Print Sheet
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyBreakdown}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      Copy for Client
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Fact Callout */}
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">Crucial Statutory Fact:</p>
                <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                  Unlike event-based forms that cap at 12× under Table B, the <strong>₹100 per day late fee</strong> for annual returns (MGT-7, MGT-7A, AOC-4) has <strong>no statutory upper limit</strong>. It accrues daily until the eForm is filed on MCA V3.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 2. Interactive Timeline & Delay Slabs Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Statutory Delay Tiers &amp; ₹100/Day Fee Progression
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The currently calculated delay of <strong>{delayDays} days</strong> is tracked below against representative filing milestones.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
            Current Delay: {delayDays === 0 ? 'On-Time (₹0 Late Fee)' : `${delayDays} Days (${formatINR(lateFee)})`}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Milestone Period</th>
                <th className="px-4 py-3">Statutory Formula</th>
                <th className="px-4 py-3">Additional Late Fee</th>
                <th className="px-4 py-3">Total MCA Challan</th>
                <th className="px-4 py-3">Statutory Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DELAY_TIERS.map((tier) => {
                const isActive = (delayDays === 0 && tier.days === 0) || (delayDays > 0 && Math.abs(delayDays - tier.days) <= 15)
                const rowTotalFee = normalFee + tier.fee

                return (
                  <tr
                    key={tier.days}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 font-bold border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="px-4 py-3 flex items-center gap-2">
                      {isActive && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                      <span>{tier.label}</span>
                      {isActive && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {tier.days === 0 ? 'Within 60-day window' : `${tier.days} days × ₹100/day`}
                    </td>
                    <td className={`px-4 py-3 font-bold ${tier.fee > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatINR(tier.fee)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {formatINR(rowTotalFee)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {tier.notes}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Mandatory Attachments Checklist for Form MGT-7 / 7A on MCA V3 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Mandatory Attachments Checklist for {formCode} on MCA V3
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ensure the following statutory documents are prepared and digitized before initiating annual return upload:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">
              1
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">List of Shareholders &amp; Debenture Holders</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Mandatory for all companies. Detailed list of equity and preference shareholders, debenture holders, and transfer particulars during the FY.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-sm">
              2
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Form MGT-8 (PCS Certification)</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {isMgt8Required
                  ? 'MANDATORY: Company is listed or meets capital (≥₹10 Cr) or turnover (≥₹50 Cr) thresholds. Must be certified by a Practicing Company Secretary.'
                  : 'EXEMPT: Standard company below threshold or filing MGT-7A is exempt from Form MGT-8 PCS certification.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0 font-bold text-sm">
              3
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Approval Letter for Extension of AGM</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Mandatory if the AGM was held beyond 30th September under an official ROC extension granted under Section 96(1).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-sm">
              4
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Optional Attachments / Adjudication Details</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Details of penalties imposed, compoundings, or resolution copies explaining non-holding of AGM where applicable.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Critical Regulatory Roadmap Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  Annual Compliance Framework
                </span>
                <span className="text-xs text-slate-400">Companies Act, 2013</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Section 92 Annual Return &amp; Section 2(85) Small Company Framework
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>G.S.R. 880(E) Revised Limits</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Effective 1st December 2025, a private company qualifies as a Small Company if paid-up capital &le; <strong>₹10 Crore</strong> and turnover &le; <strong>₹100 Crore</strong>, significantly expanding MGT-7A eligibility.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Section 92(5) Adjudication</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Default triggers in-house ROC adjudication under Section 454. Base penalty is ₹10,000 + ₹100/day. Section 446B provides relief for Small Companies, OPCs, and Startups.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Uncapped Late Fee Structure</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Annual returns do not cap at 12×. The ₹100/day late fee accrues each calendar day until payment is completed through the MCA V3 payment gateway.
            </p>
          </div>
        </div>
      </div>

      {/* 5. ISOLATED CLEAN PRINTABLE CERTIFICATE / MEMORANDUM (Shown ONLY during browser print) */}
      <div id="mgt7-printable-sheet" className="hidden print:block font-sans text-slate-900 bg-white p-6 leading-normal">
        
        {/* Masthead */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">CorpLawUpdates.in</h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              India&apos;s Free Corporate Law Intelligence &amp; Statutory Compliance Platform
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 rounded">
              FORM {formCode} CERTIFICATE
            </span>
            <p className="text-[10px] text-slate-500 mt-1">
              Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            Annual Return Statutory Fee &amp; Delay Assessment Memorandum
          </h2>
          <p className="text-[11px] text-slate-600 italic mt-0.5">
            Pursuant to Section 92 of Companies Act, 2013 &amp; Rule 11 of Companies (Management and Administration) Rules, 2014
          </p>
        </div>

        {/* Section 1: Entity & Filing Particulars */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            1. Entity &amp; Filing Particulars
          </h3>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-2 font-bold bg-slate-50 border-r border-slate-200">Company Name</td>
                <td className="p-2 font-semibold">{companyName ? companyName.toUpperCase() : 'Not Specified (Generic Computation)'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Form Designation</td>
                <td className="p-2">Form {formCode} ({complianceResult.metadata.formName})</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Financial Year</td>
                <td className="p-2 font-medium">{selectedFY}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Authorized Capital</td>
                <td className="p-2">{hasShareCapital ? formatINR(nominalCapital) : 'Without Share Capital'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Paid-up Capital &amp; Turnover</td>
                <td className="p-2">Paid-up: {formatINR(paidUpCapital)} | Turnover: {formatINR(turnoverPrecedingFY)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Small Company Status (Sec 2(85))</td>
                <td className="p-2 font-bold">
                  {isSmallCompany ? (
                    <span className="text-emerald-700">QUALIFIED AS SMALL COMPANY (Eligible for MGT-7A)</span>
                  ) : (
                    <span className="text-slate-800">NOT CLASSIFIED AS SMALL COMPANY (Must file MGT-7)</span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">PCS MGT-8 Certification</td>
                <td className="p-2 font-bold">
                  {isMgt8Required ? (
                    <span className="text-rose-700">MANDATORY Form MGT-8 Certification by Practicing CS Required</span>
                  ) : (
                    <span className="text-slate-800">Director &amp; Company Secretary Signature Only</span>
                  )}
                </td>
              </tr>
              {calcMode === 'date' && (
                <>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">AGM Date (Day 0)</td>
                    <td className="p-2">{actualAgmDate} ({agmStatus})</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Statutory Due Date (60 Days)</td>
                    <td className="p-2 font-bold text-slate-900">{statutoryDueDate}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Actual / Filing Date</td>
                    <td className="p-2">{actualFilingDate}</td>
                  </tr>
                </>
              )}
              <tr>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Delay Assessment</td>
                <td className="p-2 font-bold">
                  {!isDelayed ? (
                    <span className="text-emerald-700">COMPLIANT — On-Time Filing (0 Days Delay)</span>
                  ) : (
                    <span className="text-rose-700">DELAYED by {delayDays} day(s) (Attracts ₹100/day Uncapped Late Fee)</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: MCA21 Challan Fee Computation */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            2. MCA21 Portal Payable Breakdown (e-Challan)
          </h3>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2 text-left font-bold text-slate-900">Fee Component</th>
                <th className="p-2 text-left font-bold text-slate-900">Governing Statutory Authority</th>
                <th className="p-2 text-right font-bold text-slate-900">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-semibold">Normal Statutory Filing Fee</td>
                <td className="p-2 text-slate-600">
                  {hasShareCapital
                    ? `Table A (Item 5), Companies (Registration Offices and Fees) Rules, 2014`
                    : `Table A (Item 6) for companies without share capital`}
                </td>
                <td className="p-2 text-right font-bold">{formatINR(normalFee)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-semibold">Additional Filing Fee (Delay)</td>
                <td className="p-2 text-slate-600">
                  {!isDelayed
                    ? 'No delay — filed within 60-day statutory window'
                    : `Companies (Registration Offices and Fees) Second Amendment Rules, 2018 (${delayDays} days × ₹100/day)`}
                </td>
                <td className="p-2 text-right font-bold">{formatINR(lateFee)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <td className="p-2 text-slate-950">TOTAL MCA21 CHALLAN PAYABLE</td>
                <td className="p-2 text-slate-600 italic">Payable via Bharatkosh / MCA Gateway</td>
                <td className="p-2 text-right text-sm text-slate-950">{formatINR(totalChallan)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Indicative Section 92(5) Adjudication Exposure */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            3. Indicative Section 92(5) Statutory Adjudication Penalty Exposure
          </h3>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2 text-left font-bold text-slate-900">Entity / Person Liable</th>
                <th className="p-2 text-left font-bold text-slate-900">Formula &amp; Relief Ceilings</th>
                <th className="p-2 text-right font-bold text-slate-900">Exposure Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-semibold">Company Penalty Exposure</td>
                <td className="p-2 text-slate-600">
                  ₹10,000 base + ₹100/day continuing default {isSection446B ? '(Section 446B 50% Cap: ₹1,00,000)' : '(Standard Cap: ₹2,00,000)'}
                </td>
                <td className="p-2 text-right font-bold">{formatINR(complianceResult.statutoryPenaltyExposure.companyIndicativeMaximumExposure)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-semibold">Officers in Default ({officerCount} Directors)</td>
                <td className="p-2 text-slate-600">
                  ₹10,000 base + ₹100/day per officer {isSection446B ? '(Section 446B 50% Cap: ₹25,000/off)' : '(Standard Cap: ₹50,000/off)'}
                </td>
                <td className="p-2 text-right font-bold">{formatINR(complianceResult.statutoryPenaltyExposure.officersIndicativeMaximumExposure)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Signature / Verification Block */}
        <div className="pt-4 border-t border-slate-300 mt-6 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="text-slate-500 mb-8">Prepared &amp; Verified By:</p>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900">Practicing Company Secretary / Auditor</p>
              <p className="text-[10px] text-slate-500">Membership / COP No.: _____________________</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-500 mb-8">Approved for Filing By:</p>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900">Director / Managing Director / CS</p>
              <p className="text-[10px] text-slate-500">DIN / PAN No.: _____________________</p>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-[9px] text-slate-500 leading-tight text-justify">
          STATUTORY NOTICE: This memorandum is generated automatically by CorpLawUpdates.in for statutory estimation purposes based on user inputs and Section 92 of the Companies Act, 2013 read with the Companies (Registration Offices and Fees) Rules, 2014. The ₹100/day additional fee has no upper limit on MCA V3. Adjudication penalties under Section 92(5) are indicative and enforceable only upon formal adjudication order under Section 454.
        </div>
      </div>

      {/* 6. Print Styles — Isolates #mgt7-printable-sheet so browser print takes exactly 1 clean page */}
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
          /* Hide everything in body */
          body * {
            visibility: hidden !important;
          }
          /* Make only the clean printable sheet visible */
          #mgt7-printable-sheet,
          #mgt7-printable-sheet * {
            visibility: visible !important;
          }
          #mgt7-printable-sheet {
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
