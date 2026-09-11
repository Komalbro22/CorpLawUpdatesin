'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  CheckCircle2,
  Copy,
  Download,
  Printer,
  Sparkles,
  Info,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
  Calendar,
  Clock,
  Users,
  FileText,
  BadgePercent,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Check,
  Zap,
  Lock,
  Landmark
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculatePas3Compliance,
  Pas3AllotmentMode,
  Pas3CompanyType,
  formatInr
} from '@/lib/rule-engine/pas3-engine'
import { generatePas3Pdf } from '@/lib/pdf/generatePas3Pdf'

interface PresetConfig {
  id: string
  label: string
  allotmentMode: Pas3AllotmentMode
  companyType: Pas3CompanyType
  capital: number
  allotmentDate: string
  filingDate: string
  numPromotersDirectors: number
  fundsUtilised: boolean
  description: string
  badge: string
}

function getTodayIso(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function getOffsetDateIso(daysOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

const PRESETS: PresetConfig[] = [
  {
    id: 'pvt_timely',
    label: 'Seed Round / Series A (On-Time)',
    allotmentMode: 'private_placement',
    companyType: 'startup',
    capital: 10000000, // ₹1 Cr
    allotmentDate: getOffsetDateIso(-10),
    filingDate: getTodayIso(),
    numPromotersDirectors: 2,
    fundsUtilised: false,
    description: 'Private placement allotment filed within the strict 15-day window. Zero late fees and zero ROC penalties.',
    badge: '15-Day Window'
  },
  {
    id: 'chennai_precedent',
    label: '46-Day Delay (ROC Chennai 2026 Precedent)',
    allotmentMode: 'private_placement',
    companyType: 'normal',
    capital: 20000000, // ₹2 Cr
    allotmentDate: getOffsetDateIso(-61), // 15 + 46 = 61 days ago
    filingDate: getTodayIso(),
    numPromotersDirectors: 2,
    fundsUtilised: false,
    description: 'The real March 2026 ROC Chennai adjudication order: 46 days delayed, penalising company and directors personally under Section 42(9).',
    badge: 'High Risk'
  },
  {
    id: 'rights_bonus',
    label: 'Rights / Bonus Issue (Ordinary Allotment)',
    allotmentMode: 'ordinary_allotment',
    companyType: 'normal',
    capital: 1500000, // ₹15 Lakhs
    allotmentDate: getOffsetDateIso(-20),
    filingDate: getTodayIso(),
    numPromotersDirectors: 2,
    fundsUtilised: false,
    description: 'Routine rights or bonus allotment governed by Section 39 with standard 30-day statutory timeline.',
    badge: '30-Day Window'
  },
  {
    id: 'utilised_breach',
    label: 'Startup Fund Utilisation Breach',
    allotmentMode: 'private_placement',
    companyType: 'startup',
    capital: 5000000, // ₹50 Lakhs
    allotmentDate: getOffsetDateIso(-25), // 10 days late
    filingDate: getTodayIso(),
    numPromotersDirectors: 2,
    fundsUtilised: true,
    description: 'Application money spent before PAS-3 was filed. Triggers critical Section 42(6) violation with refund liability and up to ₹2 Cr penalty.',
    badge: 'Critical Breach'
  }
]

export default function PAS3Workspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()

  // Metadata state
  const [companyName, setCompanyName] = useState('')
  const [cin, setCin] = useState('')
  const [professionalFirm, setProfessionalFirm] = useState('')

  // Form core inputs
  const [allotmentMode, setAllotmentMode] = useState<Pas3AllotmentMode>('private_placement')
  const [companyType, setCompanyType] = useState<Pas3CompanyType>('normal')
  const [authorisedCapital, setAuthorisedCapital] = useState<number>(1000000) // ₹10 Lakhs
  const [allotmentDate, setAllotmentDate] = useState<string>(getOffsetDateIso(-5))
  const [filingDate, setFilingDate] = useState<string>(getTodayIso())
  const [numPromotersDirectors, setNumPromotersDirectors] = useState<number>(2)

  // Advanced checks
  const [fundsUtilisedBeforeFiling, setFundsUtilisedBeforeFiling] = useState<boolean>(false)
  const [checkAppMoneyWindow, setCheckAppMoneyWindow] = useState<boolean>(false)
  const [appMoneyReceivedDate, setAppMoneyReceivedDate] = useState<string>(getOffsetDateIso(-40))
  const [isMultipleAllotments, setIsMultipleAllotments] = useState<boolean>(false)
  const [allotmentCount, setAllotmentCount] = useState<number>(2)
  const [oldestAllotmentDate, setOldestAllotmentDate] = useState<string>(getOffsetDateIso(-25))

  // Calculation memo
  const result = useMemo(() => {
    return calculatePas3Compliance({
      allotmentMode,
      companyType,
      authorisedCapital,
      allotmentDate,
      filingDate,
      numPromotersDirectors,
      fundsUtilisedBeforeFiling,
      applicationMoneyReceivedDate: checkAppMoneyWindow ? appMoneyReceivedDate : undefined,
      allotmentCount: isMultipleAllotments ? allotmentCount : 1,
      oldestAllotmentDate: isMultipleAllotments ? oldestAllotmentDate : undefined
    })
  }, [
    allotmentMode,
    companyType,
    authorisedCapital,
    allotmentDate,
    filingDate,
    numPromotersDirectors,
    fundsUtilisedBeforeFiling,
    checkAppMoneyWindow,
    appMoneyReceivedDate,
    isMultipleAllotments,
    allotmentCount,
    oldestAllotmentDate
  ])

  // Apply preset handler
  const applyPreset = (preset: PresetConfig) => {
    setAllotmentMode(preset.allotmentMode)
    setCompanyType(preset.companyType)
    setAuthorisedCapital(preset.capital)
    setAllotmentDate(preset.allotmentDate)
    setFilingDate(preset.filingDate)
    setNumPromotersDirectors(preset.numPromotersDirectors)
    setFundsUtilisedBeforeFiling(preset.fundsUtilised)
    showToast(`Applied preset: ${preset.label}`, 'info')
  }

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    const text = `--- FORM PAS-3 COMPLIANCE & PENALTY AUDIT ---
Company: ${companyName || 'Not Specified'} (CIN: ${cin || 'N/A'})
Allotment Mode: ${result.allotmentMode === 'private_placement' ? 'Private Placement (Sec 42 - 15 Days)' : 'Ordinary Allotment (Sec 39 - 30 Days)'}
Board Allotment Date: ${result.allotmentDate}
Statutory Due Date: ${result.statutoryDueDate} (${result.statutoryDeadlineDays} Days)
Filing Date: ${result.filingDate}
Status: ${result.isDelayed ? `Delayed by ${result.delayDays} days` : 'On Time'}

--- MCA V3 CHALLAN FEES ---
Table A Normal Fee: ${formatInr(result.normalFee)}
Table B Multiplier: ${result.lateMultiplier}x
Additional Late Fee: ${formatInr(result.additionalLateFee)}
Total MCA Challan: ${formatInr(result.totalMcaChallanFee)}

--- STATUTORY ADJUDICATION PENALTIES ---
Regime: ${result.penaltyRegime}
Company Penalty: ${formatInr(result.companyPenalty)} (Cap: ${formatInr(result.companyPenaltyCap)})
Promoters/Directors Personal Penalty: ${formatInr(result.totalIndividualPenalty)} (${result.numIndividuals} individuals @ ${formatInr(result.perIndividualPenalty)})
Total Adjudication Liability: ${formatInr(result.totalAdjudicationPenalty)}
${result.section446BApplied ? `Section 446B Relief: Saved ${formatInr(result.savingsFrom446B)}` : ''}

TOTAL FINANCIAL EXPOSURE: ${formatInr(result.totalFinancialExposure)}
Generated via CorpLawUpdates.in/tools/fee-calculator/companies/pas-3`

    try {
      await navigator.clipboard.writeText(text)
      showToast('PAS-3 Audit summary copied to clipboard!', 'success')
    } catch {
      showToast('Failed to copy summary to clipboard', 'error')
    }
  }

  // Generate & Download PDF
  const handleDownloadPdf = () => {
    try {
      const doc = generatePas3Pdf(result, {
        companyName,
        cin,
        professionalFirm
      })
      doc.save(`PAS-3_Compliance_Audit_${cin || 'Company'}_${result.filingDate}.pdf`)
      showToast('PAS-3 Compliance Audit PDF downloaded successfully!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Error generating PDF report', 'error')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* 1. Quick Answer Hero Callout (Targets "pas 3 due date" & "15 vs 30 days" search intent) */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/20 p-5 sm:p-6 shadow-md shadow-amber-500/5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold text-sm">
            ⚡
          </span>
          <h2 className="text-base sm:text-lg font-bold font-heading text-navy dark:text-white">
            Quick Answer: Form PAS-3 Statutory Deadlines & Penalty Clocks (2026)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-3.5">
            <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center justify-between mb-1">
              <span>1. Private Placement (Section 42)</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono">15 DAYS</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
              Return of allotment must be filed within strictly <strong>15 days</strong> from board allotment date. 
              Late penalty is <strong>₹1,000/day</strong> on company <em>plus</em> on every promoter and director personally, 
              capped at <strong>₹25 Lakh each</strong> (Section 42(9)).
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between mb-1">
              <span>2. All Other Allotments (Section 39)</span>
              <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">30 DAYS</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
              Rights issues, preferential allotment, bonus shares, ESOPs, and debenture conversions must be filed within <strong>30 days</strong>. 
              Late penalty is <strong>₹1,000/day</strong> capped at <strong>₹1 Lakh</strong> (Section 39(5)).
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Startup Warning:</strong> Money raised via private placement cannot be utilised until PAS-3 is filed (Section 42(6) proviso). Utilisation prior to filing attracts up to ₹2 Crore penalty!
          </span>
        </div>
      </div>

      {/* 2. Interactive Presets Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            Instant Scenario Presets
          </span>
          <span className="text-[11px] text-slate-500">Click a preset to populate exact regulatory parameters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-amber-500/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {preset.badge}
                </span>
                <ChevronRight className="size-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <div className="font-bold text-xs text-navy dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                {preset.label}
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-6">
            <h3 className="font-heading text-lg font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="size-5 text-amber-500" />
              Allotment & Company Parameters
            </h3>

            {/* Mode of Allotment Selector — The critical distinction */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                1. Mode of Allotment (Determines 15 vs 30 Days Clock & Penalty Cap) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAllotmentMode('private_placement')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    allotmentMode === 'private_placement'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Private Placement
                    </span>
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono">
                      15 Days
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Section 42 • Angel / VC / HNI funding rounds. Heavy ₹25L personal penalty cap.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAllotmentMode('ordinary_allotment')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    allotmentMode === 'ordinary_allotment'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Ordinary Allotment
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">
                      30 Days
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Section 39 • Rights, Preferential, Bonus, ESOP, Debenture conversions. ₹1L penalty cap.
                  </div>
                </button>
              </div>
            </div>

            {/* Company Classification Selector (Section 446B relief) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                2. Entity Classification (Section 446B Statutory Penalty Relief)
              </label>
              <select
                value={companyType}
                onChange={e => setCompanyType(e.target.value as Pas3CompanyType)}
                aria-label="Entity Classification"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="normal">Standard Corporate Entity (Private / Public Limited)</option>
                <option value="small_company">Small Company (Paid-up ≤ ₹4 Cr & Turnover ≤ ₹40 Cr — 50% Penalty Relief)</option>
                <option value="startup">DPIIT-Recognised Startup (Section 446B 50% Concession)</option>
                <option value="opc">One Person Company (OPC — Section 446B Concession)</option>
                <option value="producer">Producer Company (Section 446B Concession)</option>
                <option value="nidhi">Nidhi Company (₹1 per ₹100 nominal value rule)</option>
                <option value="without_share_capital">Company Without Share Capital (Flat ₹200 fee)</option>
              </select>
              {['small_company', 'startup', 'opc', 'producer'].includes(companyType) && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>Section 446B concession active: Statutory penalties reduced by 50% (Max ₹2L co / ₹1L director).</span>
                </div>
              )}
            </div>

            {/* Authorised Share Capital */}
            {companyType !== 'without_share_capital' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    3. Authorised Nominal Share Capital (Determines Table A Base Fee)
                  </label>
                  <span className="font-mono font-bold text-sm text-amber-700 dark:text-gold">
                    {formatInr(authorisedCapital)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { label: '₹1L', val: 100000 },
                    { label: '₹5L', val: 500000 },
                    { label: '₹15L', val: 1500000 },
                    { label: '₹25L', val: 2500000 },
                    { label: '₹1 Cr', val: 10000000 },
                    { label: '₹5 Cr', val: 50000000 }
                  ].map(btn => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setAuthorisedCapital(btn.val)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                        authorisedCapital === btn.val
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={authorisedCapital}
                  onChange={e => setAuthorisedCapital(Number(e.target.value))}
                  placeholder="Enter exact authorised capital in INR"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Allotment Date & Filing Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  4. Board Allotment Date (Day 0) *
                </label>
                <input
                  type="date"
                  value={allotmentDate}
                  onChange={e => setAllotmentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Date of board resolution allotting the shares
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  5. Filing / Evaluation Date *
                </label>
                <input
                  type="date"
                  value={filingDate}
                  onChange={e => setFilingDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Actual or planned submission date on MCA V3
                </span>
              </div>
            </div>

            {/* Promoters & Directors Count for personal exposure */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  6. Number of Promoters & Directors Facing Personal Liability
                </label>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {numPromotersDirectors} Individuals
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={numPromotersDirectors}
                onChange={e => setNumPromotersDirectors(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block">
                {result.allotmentMode === 'private_placement'
                  ? 'Under Section 42(9), ROC penalises promoters and directors personally up to ₹25 Lakh each.'
                  : 'Under Section 39(5), every officer in default faces personal fines up to ₹1 Lakh each.'}
              </span>
            </div>

            {/* Upstream Compliance & Red Flag Checks Accordion */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-amber-500" />
                Upstream Statutory Validation Checks (Section 42 & 39)
              </div>

              {/* Fund Utilisation Check */}
              {result.allotmentMode === 'private_placement' && (
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="fundsUtilisedCheck"
                    checked={fundsUtilisedBeforeFiling}
                    onChange={e => setFundsUtilisedBeforeFiling(e.target.checked)}
                    className="mt-1 size-4 rounded text-red-600 accent-red-600 cursor-pointer"
                  />
                  <label htmlFor="fundsUtilisedCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <strong className="text-red-700 dark:text-red-400 block">
                      Were any raised funds utilised before filing Form PAS-3?
                    </strong>
                    Section 42(6) strictly prohibits spending subscription money until PAS-3 is submitted. Breach triggers mandatory refund + penalty up to amount raised or ₹2 Cr.
                  </label>
                </div>
              )}

              {/* 60-day allotment window check */}
              {result.allotmentMode === 'private_placement' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="checkAppMoney"
                      checked={checkAppMoneyWindow}
                      onChange={e => setCheckAppMoneyWindow(e.target.checked)}
                      className="size-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                    />
                    <label htmlFor="checkAppMoney" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      Verify 60-Day Allotment Window from receipt of application money (Sec 42(6))
                    </label>
                  </div>
                  {checkAppMoneyWindow && (
                    <div className="pl-7">
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Date Application Money was Received in Separate Bank Account:
                      </label>
                      <input
                        type="date"
                        value={appMoneyReceivedDate}
                        onChange={e => setAppMoneyReceivedDate(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Multiple allotments batching rule check */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="checkBatch"
                    checked={isMultipleAllotments}
                    onChange={e => setIsMultipleAllotments(e.target.checked)}
                    className="size-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                  />
                  <label htmlFor="checkBatch" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    Combining multiple allotment dates in this single PAS-3? (Max 5 within 30 days)
                  </label>
                </div>
                {isMultipleAllotments && (
                  <div className="pl-7 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Number of Allotments:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={allotmentCount}
                        onChange={e => setAllotmentCount(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Oldest Allotment Date:</label>
                      <input
                        type="date"
                        value={oldestAllotmentDate}
                        onChange={e => setOldestAllotmentDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Company Meta for PDF Export */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Company Name (for PDF):</label>
                <input
                  type="text"
                  placeholder="e.g. Acme FinTech Pvt Ltd"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">CIN (for PDF):</label>
                <input
                  type="text"
                  placeholder="e.g. U72900DL2022PTC123456"
                  value={cin}
                  onChange={e => setCin(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Certifying Professional Firm:</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma & Associates PCS"
                  value={professionalFirm}
                  onChange={e => setProfessionalFirm(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Results & Liability Exposure Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg sticky top-20">
            {/* Header with Timeline Status */}
            <div className={`p-5 text-white ${
              result.isDelayed
                ? 'bg-gradient-to-r from-red-600 via-red-700 to-rose-800'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2 text-white/80">
                <span>Statutory Timeline Assessment</span>
                <span>{result.statutoryDeadlineDays} Days Window</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-heading text-2xl sm:text-3xl font-bold">
                  {result.isDelayed ? `${result.delayDays} Days Delayed` : 'Timely Filing'}
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/80">Statutory Due Date</div>
                  <div className="font-mono font-bold text-sm">{result.statutoryDueDate}</div>
                </div>
              </div>
              <div className="text-xs text-white/90 mt-2 font-medium">
                {result.allotmentMode === 'private_placement'
                  ? 'Section 42(8) Private Placement Rule applied (Strict 15 calendar days).'
                  : 'Section 39(4) Ordinary Allotment Rule applied (30 calendar days).'}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-5">
              {/* Grand Total Financial Exposure */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Total Financial & Adjudication Exposure
                </div>
                <div className="font-heading text-3xl font-extrabold text-navy dark:text-gold">
                  {formatInr(result.totalFinancialExposure)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Includes MCA V3 Challan Fee + Potential ROC Adjudication Liabilities
                </div>
              </div>

              {/* Block 1: MCA V3 Portal Challan Fee */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span>1. MCA V3 Portal Challan Fee</span>
                  <span className="font-mono text-navy dark:text-white font-bold">
                    {formatInr(result.totalMcaChallanFee)}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Table A Base Normal Fee:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                      {formatInr(result.normalFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Table B Delay Multiplier:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {result.lateMultiplier > 0 ? `${result.lateMultiplier}× (${result.delayDays}d late)` : '0× (Nil)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Additional Late Fee:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                      {formatInr(result.additionalLateFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Block 2: Statutory Adjudication Penalties */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span>2. ROC Adjudication Liability</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">
                    {formatInr(result.totalAdjudicationPenalty)}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Company Fine:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                      {formatInr(result.companyPenalty)}
                      <span className="text-[10px] text-slate-400 ml-1">(Cap {formatInr(result.companyPenaltyCap)})</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Promoters / Directors ({result.numIndividuals}):</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                      {formatInr(result.totalIndividualPenalty)}
                      <span className="text-[10px] text-slate-400 ml-1">({formatInr(result.perIndividualPenalty)} each)</span>
                    </span>
                  </div>
                  {result.section446BApplied && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Section 446B 50% Savings:</span>
                      <span className="font-mono">-{formatInr(result.savingsFrom446B)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Critical Breaches / Findings Callout */}
              {result.criticalBreaches.length > 0 && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3.5 space-y-1.5">
                  <div className="font-bold text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="size-4" />
                    Critical Regulatory Findings
                  </div>
                  {result.criticalBreaches.map((cb, idx) => (
                    <p key={idx} className="text-[11px] text-red-900 dark:text-red-200 leading-relaxed">
                      • {cb}
                    </p>
                  ))}
                </div>
              )}

              {/* Action Buttons: PDF, Copy, Print */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <Download className="size-3.5" />
                  <span>Audit PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                >
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                >
                  <Printer className="size-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
