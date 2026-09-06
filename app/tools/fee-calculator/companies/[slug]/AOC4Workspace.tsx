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
  calculateAoc4Compliance,
  Aoc4ComplianceCalculationResult,
  Aoc4FormVariant,
  AOC4_ATTACHMENTS
} from '@/lib/rule-engine/aoc4-engine'
import { generateAoc4Pdf } from '@/lib/pdf/generateAoc4Pdf'

interface AOC4WorkspaceProps {
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
  { days: 0, label: '0 Days (On-Time)', fee: 0, notes: 'Filed on or before statutory 30-day due date (180d for OPC)' },
  { days: 15, label: '15 Days Delay', fee: 1500, notes: '15 days × ₹100/day statutory late fee' },
  { days: 30, label: '30 Days Delay', fee: 3000, notes: '30 days × ₹100/day statutory late fee' },
  { days: 60, label: '60 Days Delay', fee: 6000, notes: '60 days × ₹100/day statutory late fee' },
  { days: 90, label: '90 Days Delay', fee: 9000, notes: '90 days × ₹100/day statutory late fee' },
  { days: 180, label: '180 Days Delay', fee: 18000, notes: '180 days × ₹100/day statutory late fee' },
  { days: 365, label: '365 Days (1 Year)', fee: 36500, notes: 'Uncapped ₹100/day penalty continues indefinitely' }
]

export default function AOC4Workspace({ form }: AOC4WorkspaceProps) {
  const { showToast } = useToast()

  // Form Variant: AOC-4 vs AOC-4 CFS vs AOC-4 XBRL vs AOC-4 NBFC
  const [formVariant, setFormVariant] = useState<Aoc4FormVariant>('AOC-4')

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
  >('private_standard')

  // Section 2(85) Statutory Exclusions & Characteristics
  const [isHoldingCompany, setIsHoldingCompany] = useState<boolean>(false)
  const [isSubsidiaryCompany, setIsSubsidiaryCompany] = useState<boolean>(false)
  const [isSpecialActBodyCorporate, setIsSpecialActBodyCorporate] = useState<boolean>(false)
  const [isDormantCompany, setIsDormantCompany] = useState<boolean>(false)
  const [isIndianSubsidiaryOfListed, setIsIndianSubsidiaryOfListed] = useState<boolean>(false)
  const [isIndAsPreparer, setIsIndAsPreparer] = useState<boolean>(false)
  const [isNbfc, setIsNbfc] = useState<boolean>(false)
  const [hasSubsidiariesOrJVs, setHasSubsidiariesOrJVs] = useState<boolean>(false)

  // Directors / Officers in default count
  const [officerCount, setOfficerCount] = useState<number>(2)

  // PDF Generation loading
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)

  // ───────────────────────────────────────────────────────────────────────────
  // COMPREHENSIVE ENGINE COMPUTATION
  // ───────────────────────────────────────────────────────────────────────────
  const complianceResult: Aoc4ComplianceCalculationResult = useMemo(() => {
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
      if (isOpc) {
        const baseFyEnd = new Date(fyEndDate)
        const computedDue = new Date(baseFyEnd)
        computedDue.setDate(computedDue.getDate() + 180)
        filingDateToUse = new Date(computedDue)
        filingDateToUse.setDate(filingDateToUse.getDate() + Math.max(0, directDelayDays))
      } else {
        const baseAgm = new Date(actualAgmDate)
        const computedDue = new Date(baseAgm)
        computedDue.setDate(computedDue.getDate() + 30)
        filingDateToUse = new Date(computedDue)
        filingDateToUse.setDate(filingDateToUse.getDate() + Math.max(0, directDelayDays))
      }
    }

    return calculateAoc4Compliance({
      formCode: formVariant,
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
      paidUpCapital: Math.max(0, paidUpCapital),
      turnoverPrecedingFY: Math.max(0, turnoverPrecedingFY),
      isOnePersonCompany: isOpc,
      isStartupCompany: isStartup,
      isProducerCompany: isProducer,
      isListed,
      isDormantCompany,
      isIndianSubsidiaryOfListed,
      isIndAsPreparer,
      isNbfc,
      hasSubsidiariesOrJVs
    })
  }, [
    formVariant,
    selectedFY,
    companyTypeSelection,
    calcMode,
    directDelayDays,
    actualAgmDate,
    actualFilingDate,
    hasShareCapital,
    nominalCapital,
    agmType,
    agmStatus,
    rocExtensionDate,
    officerCount,
    isHoldingCompany,
    isSubsidiaryCompany,
    isSpecialActBodyCorporate,
    paidUpCapital,
    turnoverPrecedingFY,
    isDormantCompany,
    isIndianSubsidiaryOfListed,
    isIndAsPreparer,
    isNbfc,
    hasSubsidiariesOrJVs
  ])

  // Handlers
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true)
      const doc = generateAoc4Pdf(complianceResult, companyName)
      doc.save(`AOC4_Fee_Calculation_${complianceResult.metadata.financialYear.replace(/\s+/g, '_')}.pdf`)
      showToast('Executive AOC-4 Calculation Report downloaded successfully', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to generate PDF. Please try printing or copying summary.', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleCopySummary = () => {
    const lines = [
      `════════════════════════════════════════════════════════════════`,
      `MCA21 V3 FEE & PENALTY REPORT — ${complianceResult.metadata.formCode} (${complianceResult.metadata.financialYear})`,
      `════════════════════════════════════════════════════════════════`,
      companyName ? `Company Name: ${companyName.toUpperCase()}` : `Entity Type: ${complianceResult.metadata.companyClassification}`,
      `Nominal Share Capital: ${complianceResult.metadata.hasShareCapital ? '₹ ' + complianceResult.metadata.nominalCapital.toLocaleString('en-IN') : 'Without Share Capital'}`,
      `Statutory Due Date: ${complianceResult.metadata.statutoryDueDate}`,
      `Actual / Filing Date: ${complianceResult.metadata.actualFilingDate}`,
      `Days Delayed: ${complianceResult.metadata.daysDelayed} day(s)`,
      ``,
      `1. MCA21 PORTAL PAYABLE (UPON E-FILING):`,
      `   • Normal Government Filing Fee: ₹ ${complianceResult.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}`,
      `   • Additional Delay Fee (₹100/day): ₹ ${complianceResult.mcaPortalPayable.additionalFilingFee.toLocaleString('en-IN')}`,
      `   • TOTAL MCA21 PORTAL PAYABLE: ₹ ${complianceResult.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}`,
      ``,
      `2. SECTION 137(3) STATUTORY PENALTY EXPOSURE (ADJUDICATION REQUIRED):`,
      `   • Section 446B Relief Applied: ${complianceResult.metadata.section446BEligible ? 'YES (50% Relief Ceiling)' : 'NO (Standard Slabs)'}`,
      `   • Company Penalty Exposure: ₹ ${complianceResult.statutoryPenaltyExposure.companyIndicativeMaximumExposure.toLocaleString('en-IN')}`,
      `   • Officers in Default Exposure: ₹ ${complianceResult.statutoryPenaltyExposure.officersIndicativeMaximumExposure.toLocaleString('en-IN')}`,
      `   • TOTAL INDICATIVE STATUTORY EXPOSURE: ₹ ${complianceResult.statutoryPenaltyExposure.totalIndicativeMaximumExposure.toLocaleString('en-IN')}`,
      ``,
      `3. STATUTORY EXEMPTIONS & STATUS:`,
      `   • Small Company Assessment: ${complianceResult.smallCompanyAssessment.isSmallCompany ? 'QUALIFIED' : 'NOT QUALIFIED'}`,
      `   • Cash Flow Statement: ${complianceResult.cashFlowExemption.isExempt ? 'EXEMPT UNDER SEC 2(40)' : 'MANDATORY ATTACHMENT'}`,
      `   • XBRL Applicability: ${complianceResult.xbrlAssessment.mustFileXbrl ? 'MANDATORY XBRL' : 'STANDARD NON-XBRL'}`,
      ``,
      `Generated by CorpLawUpdates.in • Validated against MCA21 V3 Portal Fee Schedules`
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    showToast('Calculation summary copied to clipboard!', 'success')
  }

  return (
    <div className="space-y-8">
      {/* ─── SECTION 1: FORM VARIANT SELECTION TABS ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pl-2">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Select AOC-4 Form Variant
          </span>
          <span className="text-xs text-slate-500 font-medium pr-2">
            Statutory Authority: Section 137, Companies Act 2013
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setFormVariant('AOC-4')}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
              formVariant === 'AOC-4'
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">AOC-4</span>
              {formVariant === 'AOC-4' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Standalone Financial Statements (Non-XBRL)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFormVariant('AOC-4-CFS')}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
              formVariant === 'AOC-4-CFS'
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">AOC-4 CFS</span>
              {formVariant === 'AOC-4-CFS' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Consolidated Financials (Subsidiaries / JVs)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFormVariant('AOC-4-XBRL')}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
              formVariant === 'AOC-4-XBRL'
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">AOC-4 XBRL</span>
              {formVariant === 'AOC-4-XBRL' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Listed / Capital ≥ ₹5Cr / Turnover ≥ ₹100Cr
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFormVariant('AOC-4-NBFC')}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
              formVariant === 'AOC-4-NBFC'
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">AOC-4 NBFC</span>
              {formVariant === 'AOC-4-NBFC' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              NBFCs Adopting Ind AS Accounting
            </span>
          </button>
        </div>

        {complianceResult.metadata.formRoutingMismatch && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Form Routing Advisory: </span>
              {complianceResult.metadata.formRoutingRecommendation}
            </div>
          </div>
        )}
      </div>

      {/* ─── SECTION 2: WORKSPACE INPUT MATRIX ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Panel A: Calculation Mode & Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h2 className="text-base font-bold text-navy dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Filing Timeline & Due Date Engine
              </h2>
              {/* Dual Mode Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCalcMode('date')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    calcMode === 'date'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  AGM Date Engine
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('days')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    calcMode === 'days'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Direct Delay Days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Legal Tech Private Limited"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Financial Year
                </label>
                <select
                  value={selectedFY}
                  onChange={(e) => setSelectedFY(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                >
                  <option value="2025-26">FY 2025-26 (Due Oct/Nov 2026)</option>
                  <option value="2024-25">FY 2024-25 (Due Oct/Nov 2025)</option>
                  <option value="2023-24">FY 2023-24 (Historical)</option>
                  <option value="2022-23">FY 2022-23 (Historical)</option>
                </select>
              </div>
            </div>

            {/* Company Classification Type */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Entity Structure & Classification
              </label>
              <select
                value={companyTypeSelection}
                onChange={(e) => setCompanyTypeSelection(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
              >
                <option value="private_standard">Private Limited Company (Standard)</option>
                <option value="one_person_company">One Person Company (OPC — 180 Days Deadline)</option>
                <option value="startup">Private Limited (DPIIT Recognized Start-up)</option>
                <option value="public_unlisted">Public Limited Company (Unlisted)</option>
                <option value="public_listed">Public Limited Company (Listed on Stock Exchange)</option>
                <option value="section_8">Section 8 Company (Not-for-Profit)</option>
                <option value="producer">Producer Company (Chapter XXIA)</option>
              </select>
            </div>

            {companyTypeSelection === 'one_person_company' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                <span className="font-bold">OPC Statutory Due Date Rule: </span>
                Under Section 137(1) third proviso, a One Person Company files financial statements within <strong>180 days</strong> from the closure of the financial year (i.e. <strong>27th September</strong> for March 31 year-end). OPCs are exempt from holding an AGM under Section 122(1).
              </div>
            )}

            {/* Mode Specific Timeline Inputs */}
            {calcMode === 'date' ? (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                {companyTypeSelection !== 'one_person_company' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                          AGM Meeting Status
                        </label>
                        <select
                          value={agmStatus}
                          onChange={(e) => setAgmStatus(e.target.value as any)}
                          className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                        >
                          <option value="held">AGM Held Regularly</option>
                          <option value="extended_and_held">Subsequent AGM Extended by ROC & Held</option>
                          <option value="not_held">AGM Not Held (Default / Reasons Statement)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                          AGM Frequency (Sec 96)
                        </label>
                        <select
                          value={agmType}
                          onChange={(e) => setAgmType(e.target.value as any)}
                          className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                        >
                          <option value="subsequent">Subsequent AGM (Within 6 Months)</option>
                          <option value="first">First AGM (Within 9 Months — No ROC Ext)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {agmStatus !== 'not_held' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                            Actual AGM Date
                          </label>
                          <input
                            type="date"
                            value={actualAgmDate}
                            onChange={(e) => setActualAgmDate(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            AOC-4 due exactly 30 days after this date per Sec 137(1).
                          </p>
                        </div>
                      )}

                      {agmStatus === 'extended_and_held' && agmType === 'subsequent' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                            ROC Approved Extended Date
                          </label>
                          <input
                            type="date"
                            value={rocExtensionDate}
                            onChange={(e) => setRocExtensionDate(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                          Actual Date of Filing on MCA
                        </label>
                        <input
                          type="date"
                          value={actualFilingDate}
                          onChange={(e) => setActualFilingDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                        />
                      </div>
                    </div>
                  </>
                )}

                {companyTypeSelection === 'one_person_company' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Actual Date of Filing on MCA
                    </label>
                    <input
                      type="date"
                      value={actualFilingDate}
                      onChange={(e) => setActualFilingDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Direct Delay Days Mode */
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Days of Delay Beyond Due Date
                    </label>
                    <span className="text-xs font-bold text-blue-600">
                      {directDelayDays} Days Delay
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="365"
                    step="1"
                    value={directDelayDays}
                    onChange={(e) => setDirectDelayDays(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {DELAY_TIERS.map((tier) => (
                      <button
                        key={tier.days}
                        type="button"
                        onClick={() => setDirectDelayDays(tier.days)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          directDelayDays === tier.days
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {tier.days}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel B: Capital Base & Fee Slab Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h2 className="text-base font-bold text-navy dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Share Capital & Table A Slabs (Items 5 & 6)
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasShareCapital}
                  onChange={(e) => setHasShareCapital(!e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  Without Share Capital (₹200)
                </span>
              </label>
            </div>

            {hasShareCapital ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Nominal / Authorized Share Capital (INR)
                </label>
                <div className="relative mb-3">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={nominalCapital || ''}
                    onChange={(e) => setNominalCapital(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-bold"
                  />
                </div>

                {/* Capital Quick Presets */}
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  {CAPITAL_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setNominalCapital(preset.value)
                        setPaidUpCapital(preset.value)
                      }}
                      className={`px-2 py-1.5 rounded-lg text-center border transition-all ${
                        nominalCapital === preset.value
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[11px] font-semibold truncate">{preset.label}</div>
                      <div className="text-[10px] text-slate-400">₹{preset.fee}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                Company not having share capital attracts a flat normal filing fee of <strong>₹200</strong> pursuant to Table A, Item 6 of the Fees Rules, 2014.
              </div>
            )}

            {/* Officer in default count for Section 137(3) */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    Officers in Default (MD / CFO / Directors)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Section 137(3) holds MD, CFO, and Directors individually liable up to ₹50,000 each.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOfficerCount(Math.max(1, officerCount - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-navy dark:text-white">
                    {officerCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOfficerCount(officerCount + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel C: Small Company, XBRL & Exemption Evaluator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h2 className="text-base font-bold text-navy dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Small Company, XBRL & Cash Flow Evaluator
              </h2>
              <span className="text-[11px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                G.S.R. 880(E) Limits
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Paid-up Share Capital (INR)
                </label>
                <input
                  type="number"
                  value={paidUpCapital || ''}
                  onChange={(e) => setPaidUpCapital(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="e.g. 1000000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">Small Co limit: ≤ ₹10 Cr | XBRL: ≥ ₹5 Cr</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Turnover of Preceding FY (INR)
                </label>
                <input
                  type="number"
                  value={turnoverPrecedingFY || ''}
                  onChange={(e) => setTurnoverPrecedingFY(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="e.g. 5000000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">Small Co limit: ≤ ₹100 Cr | XBRL: ≥ ₹100 Cr</p>
              </div>
            </div>

            {/* Statutory Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={isHoldingCompany}
                  onChange={(e) => setIsHoldingCompany(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Holding Company (Sec 2(85) Excl.)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={isSubsidiaryCompany}
                  onChange={(e) => setIsSubsidiaryCompany(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Subsidiary Company (Sec 2(85) Excl.)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={hasSubsidiariesOrJVs}
                  onChange={(e) => setHasSubsidiariesOrJVs(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Has Subsidiaries / JVs (AOC-4 CFS Required)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={isDormantCompany}
                  onChange={(e) => setIsDormantCompany(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Dormant Company (Sec 455 Exemption)</span>
              </label>
            </div>

            {/* Real-time Exemption Status Pills */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  complianceResult.cashFlowExemption.isExempt
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {complianceResult.cashFlowExemption.isExempt ? '✓ Cash Flow Exempt' : '• Cash Flow Mandatory'}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  complianceResult.xbrlAssessment.mustFileXbrl
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {complianceResult.xbrlAssessment.mustFileXbrl ? '⚠️ XBRL Mandatory' : '• Non-XBRL Form'}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  complianceResult.metadata.section446BEligible
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {complianceResult.metadata.section446BEligible ? '✓ Sec 446B 50% Relief' : '• Standard Penalties'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculation Results & Executive Action Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: MCA21 Portal Payable */}
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-600/30 dark:border-blue-500/30 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              MCA21 e-Challan
            </div>

            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-600" />
              Statutory Payable at Time of Filing
            </div>

            <div className="mb-6">
              <div className="text-4xl font-extrabold text-navy dark:text-white font-serif tracking-tight">
                ₹ {complianceResult.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Total fee charged on MCA21 V3 Portal for Form {complianceResult.metadata.formCode}
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Normal Government Fee</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ₹ {complianceResult.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 -mt-2">
                {complianceResult.mcaPortalPayable.basisNormalFee}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Additional Delay Fee ({complianceResult.metadata.daysDelayed}d × ₹100)
                </span>
                <span className={`font-semibold ${complianceResult.mcaPortalPayable.additionalFilingFee > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  ₹ {complianceResult.mcaPortalPayable.additionalFilingFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 -mt-2">
                {complianceResult.mcaPortalPayable.basisAdditionalFee}
              </div>
            </div>

            <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Statutory Due Date:</span>
              <span className="font-bold text-navy dark:text-white">
                {complianceResult.metadata.statutoryDueDate}
              </span>
            </div>
          </div>

          {/* Card 2: Section 137(3) Adjudication Exposure */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-navy dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Section 137(3) Penalty Exposure
              </h3>
              {complianceResult.metadata.section446BEligible && (
                <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">
                  50% Relief Applied
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-serif">
                ₹ {complianceResult.statutoryPenaltyExposure.totalIndicativeMaximumExposure.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Potential civil penalty in ROC Adjudication proceedings under Section 454
              </p>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Company Exposure:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ₹ {complianceResult.statutoryPenaltyExposure.companyIndicativeMaximumExposure.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Officers Exposure ({officerCount} officer{officerCount > 1 ? 's' : ''}):
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ₹ {complianceResult.statutoryPenaltyExposure.officersIndicativeMaximumExposure.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
              <span className="font-bold">Notice: </span>
              {complianceResult.statutoryPenaltyExposure.reliefCeilingExplanation}
            </div>
          </div>

          {/* Action Buttons: PDF, Print & Copy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? 'Generating...' : 'Export PDF'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Sheet
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Copy className="w-4 h-4" />
              Copy Text
            </button>
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: MANDATORY ATTACHMENTS CHECKLIST ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Mandatory Attachments & Enclosures Checklist for {complianceResult.metadata.formCode}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Statutory annexures required under Rule 12 of Companies (Accounts) Rules, 2014 for MCA V3 upload.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AOC4_ATTACHMENTS.map((item) => {
            const isExemptCashFlow = item.id === 'cash_flow' && complianceResult.cashFlowExemption.isExempt
            const isMandatoryForCompany = item.isMandatory && !isExemptCashFlow

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isExemptCashFlow
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : isMandatoryForCompany
                    ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="mt-0.5">
                  {isExemptCashFlow ? (
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                      Ex
                    </span>
                  ) : isMandatoryForCompany ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  ) : (
                    <Info className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-navy dark:text-white truncate">
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                        isExemptCashFlow
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          : isMandatoryForCompany
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isExemptCashFlow ? 'Exempt' : isMandatoryForCompany ? 'Mandatory' : 'Conditional'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.legalBasis}</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {isExemptCashFlow
                      ? `${item.name} is EXEMPT under Section 2(40) for this company.`
                      : item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── SECTION 4: ISOLATED PRINTABLE MEMORANDUM SHEET ─── */}
      <div id="aoc4-printable-sheet" className="hidden print:block p-8 bg-white text-black">
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="text-2xl font-bold font-serif">CorpLawUpdates.in</div>
          <div className="text-xs uppercase tracking-widest text-slate-600">
            MCA21 V3 Compliance & Fee Assessment Memorandum
          </div>
          <div className="text-lg font-bold mt-2">
            FORM {complianceResult.metadata.formCode} — STATUTORY FEE & PENALTY REPORT
          </div>
          <div className="text-xs text-slate-500">
            Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm font-bold uppercase mb-2">1. Company & Filing Profile</div>
          <table className="w-full text-xs border border-collapse border-slate-300">
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100 w-1/3">Company Name</td>
                <td className="p-2">{companyName ? companyName.toUpperCase() : 'Not Specified'}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100">Financial Year</td>
                <td className="p-2">{complianceResult.metadata.financialYear}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100">Company Classification</td>
                <td className="p-2">{complianceResult.metadata.companyClassification}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100">Nominal Share Capital</td>
                <td className="p-2">
                  {complianceResult.metadata.hasShareCapital
                    ? `₹ ${complianceResult.metadata.nominalCapital.toLocaleString('en-IN')}`
                    : 'Company without Share Capital'}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100">Statutory Due Date</td>
                <td className="p-2">{complianceResult.metadata.statutoryDueDate}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100">Actual / Filing Date</td>
                <td className="p-2">{complianceResult.metadata.actualFilingDate}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100">Delay Period</td>
                <td className="p-2">{complianceResult.metadata.daysDelayed} calendar day(s)</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-bold bg-slate-100">Cash Flow Statement Exemption</td>
                <td className="p-2">{complianceResult.cashFlowExemption.isExempt ? 'EXEMPT (Section 2(40))' : 'MANDATORY'}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-100">XBRL Applicability</td>
                <td className="p-2">{complianceResult.xbrlAssessment.mustFileXbrl ? 'MANDATORY XBRL' : 'STANDARD NON-XBRL'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <div className="text-sm font-bold uppercase mb-2">2. MCA21 Portal Payable (e-Challan)</div>
          <table className="w-full text-xs border border-collapse border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="p-2 text-left">Fee Component</th>
                <th className="p-2 text-left">Statutory Authority / Basis</th>
                <th className="p-2 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-semibold">Normal Filing Fee</td>
                <td className="p-2">{complianceResult.mcaPortalPayable.basisNormalFee}</td>
                <td className="p-2 text-right">₹ {complianceResult.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-semibold">Additional Delay Fee</td>
                <td className="p-2">{complianceResult.mcaPortalPayable.basisAdditionalFee}</td>
                <td className="p-2 text-right">₹ {complianceResult.mcaPortalPayable.additionalFilingFee.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="font-bold bg-slate-50">
                <td className="p-2">TOTAL MCA21 PORTAL PAYABLE</td>
                <td className="p-2">Paid via MCA21 e-Challan upon form upload</td>
                <td className="p-2 text-right">₹ {complianceResult.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <div className="text-sm font-bold uppercase mb-2">3. Indicative Section 137(3) Adjudication Exposure</div>
          <table className="w-full text-xs border border-collapse border-slate-300">
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-semibold">Company Exposure</td>
                <td className="p-2">Base ₹10,000 + continuing ₹100/day (Max Cap: ₹2,00,000; 446B Cap: ₹1,00,000)</td>
                <td className="p-2 text-right font-semibold">₹ {complianceResult.statutoryPenaltyExposure.companyIndicativeMaximumExposure.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-semibold">Officers in Default Exposure</td>
                <td className="p-2">₹10,000 + continuing ₹100/day per officer (Max Cap: ₹50,000; 446B Cap: ₹25,000)</td>
                <td className="p-2 text-right font-semibold">₹ {complianceResult.statutoryPenaltyExposure.officersIndicativeMaximumExposure.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="font-bold bg-slate-50">
                <td className="p-2">TOTAL INDICATIVE STATUTORY EXPOSURE</td>
                <td className="p-2">Requires formal adjudication order by ROC under Section 454</td>
                <td className="p-2 text-right">₹ {complianceResult.statutoryPenaltyExposure.totalIndicativeMaximumExposure.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-[10px] text-slate-500 border-t pt-4">
          NOTICE & DISCLAIMER: This assessment memorandum is automatically generated by CorpLawUpdates.in for informational and estimation purposes. It does not constitute a statutory audit, legal opinion, or official MCA document. Section 137(3) penalties are not collected via MCA21 portal challan.
        </div>
      </div>
    </div>
  )
}
