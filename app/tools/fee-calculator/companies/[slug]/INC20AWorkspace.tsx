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
  Award,
  DollarSign,
  Scale,
  Ban,
  Check,
  Layers,
  HelpCircle
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateInc20aCompliance,
  Inc20aCompanyClassification,
  Inc20aCalculationResult,
  INC20A_CAPITAL_SLABS,
  INC20A_DELAY_SLABS,
  INC20A_ROC_BENCHMARKS,
  INC20A_ATTACHMENTS,
  formatInr
} from '@/lib/rule-engine/inc20a-engine'
import { generateInc20aPdf } from '@/lib/pdf/generateInc20aPdf'

interface PresetConfig {
  id: string
  label: string
  capital: number
  classification: Inc20aCompanyClassification
  isStartup: boolean
  isSmallCo: boolean
  directors: number
  description: string
}

const PRESETS: PresetConfig[] = [
  {
    id: 'pvt_standard',
    label: 'Standard Pvt Ltd (₹10L)',
    capital: 1000000,
    classification: 'standard_private',
    isStartup: false,
    isSmallCo: false,
    directors: 2,
    description: 'Standard Private Limited with ₹10 Lakh authorized capital.'
  },
  {
    id: 'startup_dpiit',
    label: 'DPIIT Startup (₹10L)',
    capital: 1000000,
    classification: 'startup',
    isStartup: true,
    isSmallCo: true,
    directors: 2,
    description: 'DPIIT-recognized Startup eligible for Section 446B 50% penalty relief.'
  },
  {
    id: 'small_co',
    label: 'Small Company (₹15L)',
    capital: 1500000,
    classification: 'small_company',
    isStartup: false,
    isSmallCo: true,
    directors: 2,
    description: 'Small Company under Section 2(85) with 50% reduced penalty caps.'
  },
  {
    id: 'opc_standard',
    label: 'One Person Co (₹1L)',
    capital: 100000,
    classification: 'opc',
    isStartup: false,
    isSmallCo: true,
    directors: 1,
    description: 'One Person Company with single director and Section 446B relief.'
  }
]

export default function INC20AWorkspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState<'calculator' | 'benchmarks' | 'attachments' | 'process' | 'comparison'>('calculator')

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  const [companyName, setCompanyName] = useState<string>('')
  const [cin, setCin] = useState<string>('')

  // Default incorporation date: 90 days ago
  const [incorporationDate, setIncorporationDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 90)
    return d.toISOString().split('T')[0]
  })

  // Actual or planned filing date: today
  const [filingDate, setFilingDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  const [authorizedCapital, setAuthorizedCapital] = useState<number>(1000000)
  const [companyClassification, setCompanyClassification] = useState<Inc20aCompanyClassification>('standard_private')
  const [isDpiitStartup, setIsDpiitStartup] = useState<boolean>(false)
  const [isSmallCompanyConfirmed, setIsSmallCompanyConfirmed] = useState<boolean>(false)
  const [hasCommencedBusinessBeforeFiling, setHasCommencedBusinessBeforeFiling] = useState<boolean>(false)
  const [numberOfDirectors, setNumberOfDirectors] = useState<number>(2)

  // ═══════════════════════════════════════════════════════════════════════════
  // PRESET HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  const applyPreset = (preset: PresetConfig) => {
    setAuthorizedCapital(preset.capital)
    setCompanyClassification(preset.classification)
    setIsDpiitStartup(preset.isStartup)
    setIsSmallCompanyConfirmed(preset.isSmallCo)
    setNumberOfDirectors(preset.directors)
    showToast(`Applied preset: ${preset.label}`, 'success')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE ENGINE EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════
  const result: Inc20aCalculationResult = useMemo(() => {
    return calculateInc20aCompliance({
      incorporationDate,
      filingDate,
      authorizedShareCapital: authorizedCapital,
      companyClassification,
      isDpiitRecognizedStartup: isDpiitStartup,
      isSmallCompanyConfirmed,
      hasCommencedBusinessBeforeFiling,
      numberOfDirectors
    })
  }, [
    incorporationDate,
    filingDate,
    authorizedCapital,
    companyClassification,
    isDpiitStartup,
    isSmallCompanyConfirmed,
    hasCommencedBusinessBeforeFiling,
    numberOfDirectors
  ])

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleCopySummary = () => {
    const text = `
FORM INC-20A COMPLIANCE & PENALTY MEMORANDUM (SECTION 10A)
------------------------------------------------------------
Company Name: ${companyName || 'Not Specified'}
CIN: ${cin || 'Not Specified'}
Incorporation Date: ${result.incorporationDate}
Statutory Due Date (180 Days): ${result.statutoryDueDate}
Filing / Assessment Date: ${result.filingDate}
Compliance Status: ${result.isExempt ? 'EXEMPT' : result.isDelay ? `DEFAULT (${result.daysOfDelay} Days Delay)` : 'ON-TIME'}

MCA21 V3 Portal Fee:
• Nominal Share Capital: ₹${result.authorizedShareCapital.toLocaleString('en-IN')} (${result.capitalBracketLabel})
• Base Filing Fee: ₹${result.baseFilingFee}
• Delay Multiplier: ${result.additionalFeeMultiplier}x normal fee
• Additional Late Fee: ₹${result.additionalLateFee.toLocaleString('en-IN')}
• Total Portal e-Challan: ₹${result.totalMcaPortalFee.toLocaleString('en-IN')}

Section 10A(2) Adjudication Exposure:
• Section 446B Relief Applied: ${result.isSection446BEligible ? 'YES (50% Relief)' : 'NO'}
• Company Statutory Penalty: ₹${result.companyPenalty.toLocaleString('en-IN')}
• Per-Director Penalty (${numberOfDirectors} Director${numberOfDirectors > 1 ? 's' : ''}): ₹${result.perDirectorPenalty.toLocaleString('en-IN')} each
• Total Officers Personal Penalty: ₹${result.totalOfficersPenalty.toLocaleString('en-IN')}
• Total Potential Adjudication Penalty: ₹${result.totalAdjudicatedPenalty.toLocaleString('en-IN')}

Combined Financial Exposure: ₹${result.totalFinancialExposure.toLocaleString('en-IN')}

Key Statutory Alerts:
• Operational Freeze: ${result.operationalFreezeTriggered ? 'TRIGGERED - Business commenced prior to filing. Contracts may be voidable.' : 'Compliant'}
• Strike-Off Risk: ${result.strikeOffRiskTriggered ? 'TRIGGERED - Over 180 days delay. ROC may initiate Section 248(1)(c) dissolution.' : 'None'}
• CCFS-2026 Exclusion: INC-20A defaults are strictly EXCLUDED from CCFS-2026 amnesty.
• Personal Payment: Directors must remit penalties from personal funds, NOT company funds.

Calculated on CorpLawUpdates.in | India's Authoritative Corporate Law Intelligence
    `.trim()

    navigator.clipboard.writeText(text)
    showToast('Compliance memo copied to clipboard!', 'success')
  }

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true)
    try {
      const doc = generateInc20aPdf(result, {
        companyName: companyName.trim() || undefined,
        cin: cin.trim() || undefined,
        numberOfDirectors
      })
      const fileName = `INC-20A_Assessment_${cin || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      showToast('Official PDF Assessment Memorandum downloaded!', 'success')
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
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white border-b border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Form INC-20A Master Engine • Section 10A &amp; Rule 23A</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Commencement of Business Due Date &amp; Penalty Determinant
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                180-day incorporation deadline tracker, MCA21 V3 slab-based multiplier calculator, and Section 10A(2) statutory adjudication penalty simulator.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 self-start lg:self-center">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Building className="w-3 h-3 text-indigo-400" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace Body: 7-Col Input Form & 5-Col Sticky Scoreboard */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: 7 COLS INPUTS                                      */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Optional Entity Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Corporate Identity Number (CIN)
                </label>
                <input
                  type="text"
                  maxLength={21}
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  placeholder="e.g. U72200DL2025PTC123456"
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Incorporation Date & Statutory 180-Day Countdown Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>The 180-Day Incorporation Rule</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Section 10A(1)(a)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date of Incorporation (CoI Date):
                  </label>
                  <input
                    type="date"
                    value={incorporationDate}
                    onChange={(e) => setIncorporationDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Day 0 is the registration date on Certificate of Incorporation.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Actual / Proposed Filing Date:
                  </label>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Date of submitting declaration on MCA V3.
                  </p>
                </div>
              </div>

              {/* Dynamic Due Date & Countdown Callout */}
              <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                result.isExempt
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                  : result.isDelay
                    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-900'
                    : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-900'
              }`}>
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>Statutory Due Date: {result.statutoryDueDate}</span>
                    {result.isDelay && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 text-[10px]">
                        {result.daysOfDelay} Days Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">
                    {result.isExempt
                      ? result.exemptionReason
                      : result.isDelay
                        ? `Statutory default started on Day 181. Additional fee multiplier (${result.delaySlab.multiplierLabel}) and Section 10A(2) per-day penalty are active.`
                        : `Filing within the statutory 180-day window. No late fee or Section 10A(2) adjudication penalty applies.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Capital & Governance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Nominal / Authorized Capital (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={authorizedCapital}
                    onChange={(e) => setAuthorizedCapital(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {INC20A_CAPITAL_SLABS.map((slab, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAuthorizedCapital(slab.minCapital || 50000)}
                      className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                        authorizedCapital >= slab.minCapital && authorizedCapital <= slab.maxCapital
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {slab.bracketLabel.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Number of Directors (Officers in Default)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={numberOfDirectors}
                    onChange={(e) => setNumberOfDirectors(Math.max(1, Math.min(15, Number(e.target.value))))}
                    className="w-24 p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    All directors are liable under Section 10A(2) unless a specific officer is charged.
                  </span>
                </div>
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
                  Per-officer penalty: ₹1,000/day (max ₹1 Lakh each), or ₹500/day (max ₹50,000 each) under Section 446B.
                </div>
              </div>
            </div>

            {/* Entity Type & Section 446B Relief Selection */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-indigo-500" />
                  <span>Section 446B Lesser Penalty Assessment</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  result.isSection446BEligible
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {result.isSection446BEligible ? '50% RELIEF ACTIVE' : 'STANDARD PENALTIES'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={isSmallCompanyConfirmed || companyClassification === 'small_company'}
                    onChange={(e) => {
                      setIsSmallCompanyConfirmed(e.target.checked)
                      if (e.target.checked) setCompanyClassification('small_company')
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">Small Company (Section 2(85))</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Paid-up capital ≤ ₹4 Cr &amp; turnover ≤ ₹40 Cr (non-holding/subsidiary).
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={isDpiitStartup || companyClassification === 'startup'}
                    onChange={(e) => {
                      setIsDpiitStartup(e.target.checked)
                      if (e.target.checked) setCompanyClassification('startup')
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">DPIIT-Recognized Startup</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Active DPIIT Certificate of Recognition under Startup India.
                    </p>
                  </div>
                </label>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <Info className="w-3 h-3 inline mr-1 text-indigo-400" />
                Section 446B halves both the company fine (₹25,000) and officer caps (₹500/day max ₹50,000 each). Relief must be disclosed in the upcoming Board Report.
              </p>
            </div>

            {/* Operational Freeze Trigger Checkbox */}
            <div className={`p-4 rounded-2xl border transition-all ${
              hasCommencedBusinessBeforeFiling
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCommencedBusinessBeforeFiling}
                  onChange={(e) => setHasCommencedBusinessBeforeFiling(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-amber-300 text-rose-600 focus:ring-rose-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Check if company commenced business or availed bank loans BEFORE filing INC-20A
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                    Under Section 10A(1), companies cannot exercise borrowing powers or start operations prior to filing. Pre-filing loans are unauthorized and contracts may be deemed voidable.
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
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Status Ribbon */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  result.statusBadge.variant === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : result.statusBadge.variant === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : result.statusBadge.variant === 'destructive'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                }`}>
                  {result.statusBadge.text}
                </span>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Delay Duration</div>
                  <div className="text-sm font-mono font-bold text-slate-200">
                    {result.daysOfDelay} Days
                  </div>
                </div>
              </div>

              {/* Scoreboard Cards */}
              <div className="mt-5 space-y-4">
                {/* 1. MCA21 Portal e-Challan Fee */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                      <span>MCA21 Portal e-Challan Fee</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {result.delaySlab.multiplierLabel}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-xs text-slate-400">
                      Base: ₹{result.baseFilingFee} + Late: ₹{result.additionalLateFee.toLocaleString('en-IN')}
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      ₹{result.totalMcaPortalFee.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* 2. Section 10A(2) Adjudication Liability */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-rose-400" />
                      <span>Section 10A(2) Adjudication Exposure</span>
                    </span>
                    {result.isSection446BEligible && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Sec 446B Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Company Fine:</span>
                      <span className="font-mono font-bold">₹{result.companyPenalty.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Officers ({numberOfDirectors} Directors):</span>
                      <span className="font-mono font-bold">₹{result.totalOfficersPenalty.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Total Adjudicated:</span>
                    <span className="text-xl font-black text-rose-400 font-mono">
                      ₹{result.totalAdjudicatedPenalty.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* 3. Combined Financial Exposure Highlight */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Total Compliance Financial Liability
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-slate-400">Portal Fee + Adjudication Exposure</span>
                    <span className="text-2xl font-black text-indigo-300 font-mono">
                      ₹{result.totalFinancialExposure.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Personal Funds Directive */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Personal Liability:</strong> Penalties imposed on directors under Section 10A(2) must be paid from <strong>personal funds</strong>, not from company accounts.
                  </p>
                </div>

                {/* CCFS-2026 Exclusion Alert */}
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200/90 flex items-start gap-2">
                  <Ban className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>CCFS-2026 Ineligible:</strong> The CCFS amnesty scheme applies to Sections 92 and 137 only. Section 10A defaults are strictly <strong>excluded</strong>.
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPDF ? 'Generating Assessment PDF...' : 'Download Official Assessment Memo (PDF)'}</span>
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
      {/* SECTION 2: STATUTORY TABS & KNOWLEDGE REPOSITORY                      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          {[
            { id: 'calculator', label: 'Fee & Delay Matrix', icon: DollarSign },
            { id: 'benchmarks', label: 'ROC Adjudication Orders', icon: Scale },
            { id: 'attachments', label: 'Mandatory Attachments', icon: FileText },
            { id: 'process', label: 'MCA V3 Filing Steps', icon: CheckCircle2 },
            { id: 'comparison', label: 'Form Comparison', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 1: Fee & Delay Slabs Matrix */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Statutory Fee Matrices (Registration Offices and Fees Rules, 2014)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dual fee model: Nominal share capital determines base fee under Table A (Item 5); calendar delay determines multiplier under Table B.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Table A */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 font-bold text-xs text-slate-800 dark:text-slate-200">
                  Table A (Item 5) — Base Filing Fee by Authorized Capital
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Nominal Capital Bracket</th>
                      <th className="p-3 text-right">Base Normal Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {INC20A_CAPITAL_SLABS.map((slab, i) => (
                      <tr key={i} className={authorizedCapital >= slab.minCapital && authorizedCapital <= slab.maxCapital ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-bold' : ''}>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{slab.bracketLabel}</td>
                        <td className="p-3 text-right text-slate-900 dark:text-white font-mono">₹{slab.baseFee}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="p-3 text-slate-500">Company without share capital</td>
                      <td className="p-3 text-right text-slate-500 font-mono">Exempt from 10A</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table B */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 font-bold text-xs text-slate-800 dark:text-slate-200">
                  Table B — Additional Fee Multipliers on Delay
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Period of Delay (After 180 Days)</th>
                      <th className="p-3 text-right">Additional Multiplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {INC20A_DELAY_SLABS.map((slab) => (
                      <tr key={slab.slabId} className={result.delaySlab.slabId === slab.slabId ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-bold' : ''}>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{slab.delayRange}</td>
                        <td className="p-3 text-right text-slate-900 dark:text-white font-mono">{slab.multiplierLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ROC Benchmark Orders */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Real ROC Adjudication Precedents (2025–2026)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official adjudication orders under Section 10A(2) demonstrating calculation methodologies, Section 446B application, and director personal liabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INC20A_ROC_BENCHMARKS.map((b) => (
                <div key={b.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {b.companyName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {b.rocOffice} • {b.orderDate}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.section446BApplied
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {b.section446BApplied ? 'Sec 446B Halved' : 'Standard 10A(2)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Delay</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{b.daysOfDelay} Days</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Company Fine</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">₹{b.companyPenalty.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Imposed</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">₹{b.totalAdjudicatedLiability.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {b.factsAndTakeaways}
                  </p>

                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[10px] text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                    <strong>Key Precedent:</strong> {b.statutoryPrecedent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Mandatory Attachments Checklist */}
        {activeTab === 'attachments' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Mandatory Attachment Checklist &amp; Defect Prevention
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rule 23A documentation standards. Defective attachments cause ROC rejection and retrospective default penalties.
              </p>
            </div>

            <div className="space-y-3">
              {INC20A_ATTACHMENTS.map((att) => (
                <div key={att.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${att.isMandatory ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {att.documentName}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      att.isMandatory
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {att.isMandatory ? 'Mandatory' : 'Conditional'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {att.verificationGuidance}
                  </p>

                  <div className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
                    <strong>Common Rejection Triggers:</strong> {att.commonDefectReasons}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Step-by-Step MCA V3 Filing Process */}
        {activeTab === 'process' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                MCA V3 Step-by-Step Filing Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end filing guide from bank credit reconciliation to Straight-Through-Processing (STP) approval.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { step: '01', title: 'Open Corporate Bank Account', desc: 'Open account in corporate name with Certificate of Incorporation, PAN, and MOA/AOA.' },
                { step: '02', title: 'Collect Subscription Money', desc: 'Ensure ALL subscribers transfer exact agreed share capital from their personal bank accounts.' },
                { step: '03', title: 'Extract Bank Statement', desc: 'Obtain certified bank statement showing credit timestamp and individual subscriber remitter names.' },
                { step: '04', title: 'Capture Registered Office Photos', desc: 'Take geo-tagged exterior photo showing nameplate with CIN + interior photo with director.' },
                { step: '05', title: 'Pass Board Resolution', desc: 'Pass resolution under Section 179 authorising designated director to digitally sign Form INC-20A.' },
                { step: '06', title: 'Fill Web Form on MCA V3', desc: 'Log in as Business User on mca.gov.in, navigate to Informational Services -> INC-20A.' },
                { step: '07', title: 'Enter Subscriber Payment Data', desc: 'Input bank name, IFSC, transaction date, and amount matching subscriber MOA entries.' },
                { step: '08', title: 'Attach PDFs & Sign with DSC', desc: 'Attach bank statements, photos, board resolution. Sign with Class 3 DSC of authorized director.' },
                { step: '09', title: 'Practicing Professional Certification', desc: 'Independent practicing CA, CS, or CMA certifies compliance and digitally signs form.' },
                { step: '10', title: 'Pay e-Challan & Obtain SRN', desc: 'Discharge government fee online. Form is approved on STP (Straight-Through-Processing) basis.' }
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Form Comparison Matrix */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Comparative Statutory Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How Form INC-20A compares with AOC-4, DPT-3, and DIR-3 KYC across penalty mechanisms and amnesty schemes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Statutory Parameter</th>
                    <th className="p-3 text-indigo-600 dark:text-indigo-400">INC-20A</th>
                    <th className="p-3">AOC-4</th>
                    <th className="p-3">DPT-3</th>
                    <th className="p-3">DIR-3 KYC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Filing Frequency</td>
                    <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">One-Time (180 Days)</td>
                    <td className="p-3">Annual (30d from AGM)</td>
                    <td className="p-3">Annual (30 June)</td>
                    <td className="p-3">Triennial (30 June)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Late Fee Model</td>
                    <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">Table B Slabs (2x to 12x)</td>
                    <td className="p-3">Flat ₹100/day (Uncapped)</td>
                    <td className="p-3">Table B Slabs (2x to 12x)</td>
                    <td className="p-3">Flat ₹5,000 (One-time)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Statutory Adjudication Penalty</td>
                    <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">₹50k Co + ₹1k/day Dir (max ₹1L)</td>
                    <td className="p-3">₹10k + ₹100/day (max ₹2L Co, ₹50k Dir)</td>
                    <td className="p-3">₹5k + ₹500/day (Rule 21)</td>
                    <td className="p-3">None (DIN Deactivation)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Section 446B Relief</td>
                    <td className="p-3 text-emerald-600 font-bold">YES (50% Halved)</td>
                    <td className="p-3 text-emerald-600 font-bold">YES (50% Halved)</td>
                    <td className="p-3 text-slate-500">Not Specified</td>
                    <td className="p-3 text-slate-500">Not Applicable</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Strike-Off / Freeze Risk</td>
                    <td className="p-3 text-rose-600 font-bold">YES (Sec 10A(1) Freeze &amp; Sec 248)</td>
                    <td className="p-3">Sec 164(2) Disqualification</td>
                    <td className="p-3">Sec 76A Prosecution</td>
                    <td className="p-3">Company Filings Blocked</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">CCFS-2026 Amnesty Scheme</td>
                    <td className="p-3 text-rose-600 font-bold">EXCLUDED (No Amnesty)</td>
                    <td className="p-3 text-emerald-600 font-bold">COVERED</td>
                    <td className="p-3 text-slate-500">Excluded</td>
                    <td className="p-3 text-slate-500">Excluded</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
