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
  Landmark,
  Coins
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateSh7Compliance,
  Sh7AlterationType,
  Sh7CompanyType,
  IndianState,
  formatInr
} from '@/lib/rule-engine/sh7-engine'
import { generateSh7Pdf } from '@/lib/pdf/generateSh7Pdf'
import IndianDateInput from '@/components/shared/IndianDateInput'

interface PresetConfig {
  id: string
  label: string
  alterationType: Sh7AlterationType
  companyType: Sh7CompanyType
  state: IndianState
  existingCapital: number
  newCapital: number
  resolutionDate: string
  filingDate: string
  numOfficers: number
  mgt14Filed: boolean
  hasAoaClause: boolean
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
    id: 'case_a_delhi_ontime',
    label: 'Case A: ₹10L to ₹50L (Delhi, On-Time)',
    alterationType: 'increase_authorised_capital',
    companyType: 'normal',
    state: 'delhi',
    existingCapital: 1000000, // ₹10 Lakhs
    newCapital: 5000000, // ₹50 Lakhs
    resolutionDate: getOffsetDateIso(-15),
    filingDate: getTodayIso(),
    numOfficers: 2,
    mgt14Filed: true,
    hasAoaClause: true,
    description: '₹40L increase in Delhi filed within 30 days. Differential fee ₹1,20,000 + Stamp ₹6,000 = ₹1,26,000 Challan. ₹0 Penalty.',
    badge: 'On-Time'
  },
  {
    id: 'case_b_maharashtra_delay',
    label: 'Case B: ₹10L to ₹1 Cr (Maharashtra, 15d Delay)',
    alterationType: 'increase_authorised_capital',
    companyType: 'normal',
    state: 'maharashtra',
    existingCapital: 1000000, // ₹10 Lakhs
    newCapital: 10000000, // ₹1 Crore
    resolutionDate: getOffsetDateIso(-45), // 30 + 15 days ago
    filingDate: getTodayIso(),
    numOfficers: 2,
    mgt14Filed: true,
    hasAoaClause: true,
    description: '15d delay. Differential: ₹1,70,000; 1 mo late fee (2.5%): ₹4,250; Stamp: ₹18,000. Challan: ₹1,92,250. Adjudication: ₹22,500.',
    badge: '15d Delay'
  },
  {
    id: 'case_c_small_co_446b',
    label: 'Case C: Small Co ₹20L to ₹60L (Karnataka, 45d Delay)',
    alterationType: 'increase_authorised_capital',
    companyType: 'small_company',
    state: 'karnataka',
    existingCapital: 2000000, // ₹20 Lakhs
    newCapital: 6000000, // ₹60 Lakhs
    resolutionDate: getOffsetDateIso(-75), // 30 + 45 days ago
    filingDate: getTodayIso(),
    numOfficers: 2,
    mgt14Filed: true,
    hasAoaClause: true,
    description: 'Sec 446B applied. Differential: ₹1,44,000; 2 mos late fee (5%): ₹7,200; Karnataka Stamp: ₹20,000. Challan: ₹1,71,200. Adjudication: ₹33,750.',
    badge: 'Sec 446B'
  },
  {
    id: 'case_d_extended_delay',
    label: 'Case D: 425-Day Extended Delay (3 Officers)',
    alterationType: 'increase_authorised_capital',
    companyType: 'normal',
    state: 'delhi',
    existingCapital: 1000000, // ₹10 Lakhs
    newCapital: 5000000, // ₹50 Lakhs
    resolutionDate: getOffsetDateIso(-455), // 30 + 425 days ago
    filingDate: getTodayIso(),
    numOfficers: 3,
    mgt14Filed: true,
    hasAoaClause: true,
    description: '425 days delay. Company: ₹2,12,500 (below ₹5L cap). Officers: 3 × ₹1,00,000 cap = ₹3,00,000. Total Adjudication: ₹5,12,500.',
    badge: 'Extended Default'
  },
  {
    id: 'case_e_stock_split',
    label: 'Case E: ₹50L Stock Split / Sub-division (On-Time)',
    alterationType: 'sub_division',
    companyType: 'normal',
    state: 'maharashtra',
    existingCapital: 5000000, // ₹50 Lakhs
    newCapital: 5000000,
    resolutionDate: getOffsetDateIso(-20),
    filingDate: getTodayIso(),
    numOfficers: 2,
    mgt14Filed: true,
    hasAoaClause: true,
    description: 'Stock split under Section 61(1)(d). Authorised capital unchanged. Zero capital registration fee, zero stamp duty. Table A: ₹500.',
    badge: 'Stock Split'
  }
]

export default function SH7Workspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()

  // Input states
  const [alterationType, setAlterationType] = useState<Sh7AlterationType>('increase_authorised_capital')
  const [companyType, setCompanyType] = useState<Sh7CompanyType>('normal')
  const [state, setState] = useState<IndianState>('delhi')
  const [existingCapital, setExistingCapital] = useState<number>(1000000) // ₹10 Lakhs
  const [newCapital, setNewCapital] = useState<number>(5000000) // ₹50 Lakhs
  const [resolutionDate, setResolutionDate] = useState<string>(() => getOffsetDateIso(-10))
  const [filingDate, setFilingDate] = useState<string>(() => getTodayIso())
  const [numOfficers, setNumOfficers] = useState<number>(2)
  const [mgt14Filed, setMgt14Filed] = useState<boolean>(true)
  const [mgt14Srn, setMgt14Srn] = useState<string>('')
  const [hasAoaClause, setHasAoaClause] = useState<boolean>(true)

  // Checklist state
  const [checkedAttachments, setCheckedAttachments] = useState<Record<number, boolean>>({})

  // Apply a preset
  const applyPreset = (preset: PresetConfig) => {
    setAlterationType(preset.alterationType)
    setCompanyType(preset.companyType)
    setState(preset.state)
    setExistingCapital(preset.existingCapital)
    setNewCapital(preset.newCapital)
    setResolutionDate(preset.resolutionDate)
    setFilingDate(preset.filingDate)
    setNumOfficers(preset.numOfficers)
    setMgt14Filed(preset.mgt14Filed)
    setHasAoaClause(preset.hasAoaClause)
    setCheckedAttachments({})
    showToast(`Loaded scenario: "${preset.label}"`, 'info')
  }

  // Calculate compliance using the statutory rule engine
  const result = useMemo(() => {
    return calculateSh7Compliance({
      alterationType,
      companyType,
      state,
      existingAuthorisedCapital: existingCapital,
      newAuthorisedCapital:
        alterationType === 'increase_authorised_capital' || alterationType === 'govt_order_increase'
          ? newCapital
          : existingCapital,
      resolutionDate,
      filingDate,
      numOfficersInDefault: numOfficers,
      mgt14Filed,
      mgt14Srn,
      requiresAoaAmendment: !hasAoaClause
    })
  }, [
    alterationType,
    companyType,
    state,
    existingCapital,
    newCapital,
    resolutionDate,
    filingDate,
    numOfficers,
    mgt14Filed,
    mgt14Srn,
    hasAoaClause
  ])

  // PDF Download Handler
  const handleDownloadPdf = () => {
    try {
      const doc = generateSh7Pdf(result, {
        companyName: 'Corporate Entity',
        cin: 'U74999DL2024PTC123456'
      })
      doc.save(`Form-SH7-Fee-Calculation-${result.filingDate}.pdf`)
      showToast('Form SH-7 Compliance Report downloaded successfully!', 'success')
    } catch (err) {
      console.error('PDF error:', err)
      showToast('Failed to generate PDF. Please try again.', 'error')
    }
  }

  // Copy Summary Handler
  const handleCopySummary = () => {
    const isCapIncrease = result.incrementalCapitalRegistrationFee > 0
    const text = `
=== FORM SH-7 COMPLIANCE & FEE SUMMARY ===
Governing Section: Section 64(1) read with Section 61(1) of Companies Act, 2013
Alteration Type: ${result.alterationType}
Existing Capital: ${formatInr(result.existingAuthorisedCapital)}
New Capital: ${formatInr(result.newAuthorisedCapital)} (Increase: ${formatInr(result.incrementalCapital)})
General Meeting Date: ${result.resolutionDate}
Statutory Due Date: ${result.statutoryDueDate} (30 days)
Filing Date: ${result.filingDate}
Status: ${result.isDelayed ? `DELAYED by ${result.delayDays} day(s)` : 'TIMELY (Within 30 days)'}

--- MCA PORTAL E-CHALLAN BREAKDOWN ---
${isCapIncrease ? `1. Differential Capital Registration Fee (Item II): ${formatInr(result.incrementalCapitalRegistrationFee)}
2. Late Additional Fee (Item B: ${(result.lateFeePercentage * 100).toFixed(1)}%): ${formatInr(result.additionalLateFee)}
3. Estimated State Stamp Duty on MOA (${result.state}): ${formatInr(result.estimatedStampDuty)}` : `1. Table A Normal e-Form Fee: ${formatInr(result.normalFee)}
2. Table B Delay Multiplier (${result.lateMultiplier}×): ${formatInr(result.additionalLateFee)}`}
TOTAL MCA E-CHALLAN ESTIMATE: ${formatInr(result.totalMcaChallanFee)}

--- SECTION 64(2) ADJUDICATION LIABILITY (Quasi-Judicial ROC Exposure) ---
- Company Penalty: ${formatInr(result.companyPenalty)} (Capped at ${formatInr(result.companyPenaltyCap)})
- Officers in Default (${result.numOfficers} persons): ${formatInr(result.totalOfficersPenalty)} (Capped at ${formatInr(result.officerPenaltyCap)} each)
- Total Adjudication Exposure: ${formatInr(result.totalAdjudicationPenalty)}
${result.section446BApplied ? `- Section 446B Savings: ${formatInr(result.savingsFrom446B)}` : ''}

TOTAL ESTIMATED FINANCIAL EXPOSURE: ${formatInr(result.totalFinancialExposure)}
Generated via CorpLawUpdates.in Form SH-7 Fee Calculator
    `.trim()

    navigator.clipboard.writeText(text)
    showToast('Form SH-7 summary copied to clipboard!', 'success')
  }

  const isCapitalIncrease =
    alterationType === 'increase_authorised_capital' || alterationType === 'govt_order_increase'

  return (
    <div className="space-y-8">
      {/* 1. SCENARIO PRESETS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verified Legal Scenarios & Audit Benchmarks
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click any preset to test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all group flex flex-col justify-between space-y-1"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {p.badge}
                </span>
                <ChevronRight className="size-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{p.label}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. DUAL-COLUMN INTERACTIVE CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & INPUTS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Coins className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                  Form SH-7 Parameter Inputs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Section 64(1) notice of capital alteration under Companies Act, 2013
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nature of Alteration Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nature of Alteration (Section 61 / Section 62 / Section 55)
              </label>
              <select
                value={alterationType}
                onChange={e => setAlterationType(e.target.value as Sh7AlterationType)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="increase_authorised_capital">
                  Increase in Authorised Share Capital — Section 61(1)(a)
                </option>
                <option value="consolidation_division">
                  Consolidation and Division of Shares into Larger Denomination — Section 61(1)(b)
                </option>
                <option value="sub_division">
                  Sub-division of Shares into Smaller Denomination (Stock Split) — Section 61(1)(d)
                </option>
                <option value="cancellation_diminution">
                  Cancellation / Diminution of Unissued Share Capital — Section 61(1)(e)
                </option>
                <option value="conversion_stock">
                  Conversion of Paid-up Shares into Stock & Re-conversion — Section 61(1)(c)
                </option>
                <option value="redemption_preference_shares">
                  Notice of Redemption of Redeemable Preference Shares — Section 55 read with 64(1)(c)
                </option>
                <option value="govt_order_increase">
                  Capital Increase by Central Govt Order — Section 62(4) & 62(6)
                </option>
              </select>
            </div>

            {/* Entity Classification & State Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Company Classification
                </label>
                <select
                  value={companyType}
                  onChange={e => setCompanyType(e.target.value as Sh7CompanyType)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="normal">Standard Private / Public Limited</option>
                  <option value="small_company">Small Company (Section 2(85))</option>
                  <option value="opc">One Person Company (OPC)</option>
                  <option value="startup">DPIIT-Recognised Startup (Section 446B)</option>
                  <option value="producer">Producer Company (Section 446B)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Registered Office State (For Stamp Duty)
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value as IndianState)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="delhi">Delhi (0.15%, max ₹25L)</option>
                  <option value="maharashtra">Maharashtra (₹1,000 / ₹5L, max ₹50L)</option>
                  <option value="karnataka">Karnataka (₹5,000 / ₹10L, max ₹1 Cr)</option>
                  <option value="tamil_nadu">Tamil Nadu (₹500 / ₹10L, max ₹5L)</option>
                  <option value="gujarat">Gujarat (0.5%, max ₹5L)</option>
                  <option value="telangana">Telangana (0.15%, min ₹1,000, max ₹5L)</option>
                  <option value="andhra_pradesh">Andhra Pradesh (0.15%, min ₹1,000, max ₹5L)</option>
                  <option value="rajasthan">Rajasthan (0.2%, max ₹25L)</option>
                  <option value="uttar_pradesh">Uttar Pradesh (NIL via MCA Portal)</option>
                  <option value="west_bengal">West Bengal (NIL via MCA Portal)</option>
                  <option value="kerala">Kerala (NIL via MCA Portal)</option>
                  <option value="haryana">Haryana (NIL via MCA Portal)</option>
                  <option value="other">Other States / UTs (NIL via MCA Portal)</option>
                </select>
              </div>
            </div>

            {/* Capital Inputs */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Existing Authorised Capital (₹)
                    </label>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                      {formatInr(existingCapital)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="10000"
                    step="100000"
                    value={existingCapital}
                    onChange={e => setExistingCapital(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[1000000, 2000000, 2500000, 5000000].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setExistingCapital(v)}
                        className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-amber-400"
                      >
                        {formatInr(v)}
                      </button>
                    ))}
                  </div>
                </div>

                {isCapitalIncrease && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        New Authorised Capital (₹)
                      </label>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatInr(newCapital)}
                      </span>
                    </div>
                    <input
                      type="number"
                      min={existingCapital}
                      step="500000"
                      value={newCapital}
                      onChange={e => setNewCapital(Math.max(existingCapital, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[5000000, 6000000, 10000000, 20000000].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setNewCapital(v)}
                          className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400"
                        >
                          {formatInr(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isCapitalIncrease && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Incremental Nominal Capital:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {formatInr(Math.max(0, newCapital - existingCapital))}
                  </span>
                </div>
              )}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  General Meeting Date (EGM / AGM)
                </label>
                <IndianDateInput
                  value={resolutionDate}
                  onChange={setResolutionDate}
                  className="w-full text-xs"
                />
                <span className="text-[11px] text-slate-400">Day 0 for 30-day statutory window</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Actual / Planned Filing Date
                </label>
                <IndianDateInput
                  value={filingDate}
                  onChange={setFilingDate}
                  className="w-full text-xs"
                />
                <span className="text-[11px] text-slate-400">Date Form SH-7 is uploaded to MCA V3</span>
              </div>
            </div>

            {/* Officers in Default & Upstream MGT-14 Validation */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Number of Officers in Default
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Directors & Company Secretary liable to individual fines under Section 64(2)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumOfficers(n)}
                      className={`size-7 rounded-lg text-xs font-bold transition-all ${
                        numOfficers === n
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* AOA Enabling Clause Check */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="aoaCheck"
                      checked={hasAoaClause}
                      onChange={e => setHasAoaClause(e.target.checked)}
                      className="size-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="aoaCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      AOA already authorizes capital alteration? (Ordinary Resolution)
                    </label>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    hasAoaClause ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {hasAoaClause ? 'MGT-14 Exempt' : 'AOA Alteration Required'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-tight">
                  {hasAoaClause
                    ? 'Section 61(1) Ordinary Resolution does NOT require Form MGT-14 under Section 117(3).'
                    : 'AOA alteration requires a Special Resolution under Section 14. Form MGT-14 is MANDATORY within 30 days.'}
                </p>
              </div>

              {/* MGT-14 Dependency Toggle (Visible/highlighted if AOA alteration required) */}
              {!hasAoaClause && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="mgt14Check"
                        checked={mgt14Filed}
                        onChange={e => setMgt14Filed(e.target.checked)}
                        className="size-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <label htmlFor="mgt14Check" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Form MGT-14 filed with ROC? (Section 117(3)(a))
                      </label>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      mgt14Filed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {mgt14Filed ? 'Prerequisite Met' : 'Mandatory Blocker'}
                    </span>
                  </div>
                  {mgt14Filed && (
                    <div className="pl-6">
                      <input
                        type="text"
                        placeholder="Enter Form MGT-14 SRN (e.g. AA1234567)"
                        value={mgt14Srn}
                        onChange={e => setMgt14Srn(e.target.value.toUpperCase())}
                        className="w-full sm:w-64 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs uppercase"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME RESULTS & BREAKDOWN CARDS (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* STATUTORY DUE DATE & DELAY BANNER */}
          <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm space-y-3 ${
            result.isDelayed
              ? 'bg-gradient-to-br from-red-500/10 via-rose-500/5 to-amber-500/10 border-red-300 dark:border-red-800'
              : 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 border-emerald-300 dark:border-emerald-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                result.isDelayed
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}>
                {result.isDelayed ? (
                  <>
                    <AlertTriangle className="size-3.5 text-red-600" />
                    <span>Statutory Default: {result.delayDays} Days Delay</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>On-Schedule: Zero Late Fees</span>
                  </>
                )}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                30-Day Window
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Statutory Filing Due Date:</p>
              <p className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                {result.statutoryDueDate}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                EGM Resolution: <strong>{result.resolutionDate}</strong> · Filing Date: <strong>{result.filingDate}</strong>
              </p>
            </div>

            {/* TOTAL ESTIMATED FINANCIAL EXPOSURE */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Financial Exposure
                </span>
                <span className="text-2xl font-heading font-black text-slate-900 dark:text-white tabular-nums">
                  {formatInr(result.totalFinancialExposure)}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                <p>Challan: <strong className="text-blue-700 dark:text-blue-400">{formatInr(result.totalMcaChallanFee)}</strong></p>
                {result.totalAdjudicationPenalty > 0 && (
                  <p>Penalties: <strong className="text-red-700 dark:text-red-400">{formatInr(result.totalAdjudicationPenalty)}</strong></p>
                )}
              </div>
            </div>
          </div>

          {/* MCA E-CHALLAN PAYMENT BREAKDOWN CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Landmark className="size-4 text-blue-600 dark:text-blue-400" />
                  MCA Portal e-Challan Breakdown
                </h4>
                <p className="text-[10px] text-slate-400">Payable immediately on MCA V3 form upload</p>
              </div>
              <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">
                {formatInr(result.totalMcaChallanFee)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {isCapitalIncrease ? (
                <>
                  {/* Row 1: Differential Capital Registration Fee */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Differential Capital Registration Fee
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Table of Fees Item II: Fee(New) − Fee(Old)
                      </p>
                    </div>
                    <span className="font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                      {formatInr(result.incrementalCapitalRegistrationFee)}
                    </span>
                  </div>

                  {/* Row 2: Late Additional Filing Fee (Percentage Rule) */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Additional Late Fee</p>
                        {result.additionalLateFee > 0 && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {(result.lateFeePercentage * 100).toFixed(1)}% ({result.delayMonths} mo)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {result.isDelayed
                          ? `2.5%/mo (≤6m) or 3%/mo thereafter on differential fee`
                          : 'Filed within 30-day statutory window (Zero late fee)'}
                      </p>
                    </div>
                    <span className={`font-bold tabular-nums ${result.additionalLateFee > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500'}`}>
                      {formatInr(result.additionalLateFee)}
                    </span>
                  </div>

                  {/* Row 3: Estimated State Stamp Duty */}
                  {result.estimatedStampDuty > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Estimated State Stamp Duty (MOA)</p>
                        <p className="text-[10px] text-slate-400">Payable via MCA V3 e-Stamping ({result.state.toUpperCase()})</p>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatInr(result.estimatedStampDuty)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Non-capital alteration: Table A Normal Fee */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Table A Normal e-Form Fee</p>
                      <p className="text-[10px] text-slate-400">{result.feeSlabLabel}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatInr(result.normalFee)}
                    </span>
                  </div>

                  {/* Table B Delay Multiplier */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Table B Delay Multiplier</p>
                        {result.lateMultiplier > 0 && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {result.lateMultiplier}×
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {result.isDelayed ? `${result.delayDays} days delay` : 'No delay'}
                      </p>
                    </div>
                    <span className={`font-bold tabular-nums ${result.additionalLateFee > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500'}`}>
                      {formatInr(result.additionalLateFee)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION 64(2) ADJUDICATION PENALTY CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Scale className="size-4 text-red-600 dark:text-red-400" />
                  Section 64(2) Adjudication Liability
                </h4>
                <p className="text-[10px] text-slate-400">Quasi-judicial ROC penalty under Sec 454 (NOT on portal challan)</p>
              </div>
              <span className={`text-xs font-extrabold tabular-nums ${result.totalAdjudicationPenalty > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatInr(result.totalAdjudicationPenalty)}
              </span>
            </div>

            {result.section446BApplied && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    Section 446B Relief Active (50% Concession)
                  </span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    Saved {formatInr(result.savingsFrom446B)}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                  Illustrative 50%-relief calculation: ₹250/day (Section 446B: penalty shall not be more than one-half; Company cap ₹2L, Officer cap ₹1L)
                </p>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Company Penalty</p>
                  <p className="text-[10px] text-slate-400">
                    {formatInr(result.dailyPenaltyRate)}/day · Capped at {formatInr(result.companyPenaltyCap)}
                  </p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatInr(result.companyPenalty)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Officers in Default ({result.numOfficers} persons)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatInr(result.perOfficerPenalty)} per person · Capped at {formatInr(result.officerPenaltyCap)} each
                  </p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatInr(result.totalOfficersPenalty)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              * Section 64(2) penalties are adjudicated under Section 454 by the ROC via Show Cause Notices. They are independent of MCA portal challan fees and are payable from personal funds of officers in default.
            </p>
          </div>

          {/* ACTION BUTTONS (Copy & Download PDF) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
            >
              <Copy className="size-4 text-slate-500" />
              <span>Copy Summary</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <Download className="size-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MANDATORY ATTACHMENTS DOSSIER CHECKLIST (RULE 15) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Mandatory Attachments Dossier (Rule 15 Checklist)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ensure all mandatory statutory documents are executed before filing Form SH-7 on MCA V3
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {Object.values(checkedAttachments).filter(Boolean).length} of {result.mandatoryAttachments.length} Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.mandatoryAttachments.map((att, idx) => {
            const isChecked = !!checkedAttachments[idx]
            return (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={e => setCheckedAttachments(prev => ({ ...prev, [idx]: e.target.checked }))}
                  className="mt-0.5 size-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span className={`text-xs leading-relaxed ${isChecked ? 'text-emerald-950 dark:text-emerald-200 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                  {att}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 4. ROC ADJUDICATION PRECEDENT INSIGHT BOX */}
      <div className="bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-purple-500/10 rounded-2xl border border-amber-300 dark:border-amber-700/60 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-amber-600 dark:text-amber-400" />
          <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            ROC Adjudication Benchmarks & Case Law Precedents (Section 64)
          </h4>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>ROC Ahmedabad Adjudication Precedent:</strong> In multiple recent adjudication orders under Section 454 for violation of Section 64, the Adjudicating Officer held that the requirement to file Form SH-7 within 30 days is strict and mandatory. The excuse of technical glitches on the MCA V3 portal or delayed finalisation of accounts was rejected where the company had not logged MCA tickets within the 30-day statutory window.
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>Personal Director Liability:</strong> Because Section 64(2) explicitly levies penalties on <em>every officer who is in default</em> up to ₹1,00,000 (or ₹50,000 under Section 446B), company directors cannot claim corporate veil protection against ROC recovery proceedings. Directors must pay these penalties out of their personal bank accounts.
        </p>
      </div>
    </div>
  )
}
