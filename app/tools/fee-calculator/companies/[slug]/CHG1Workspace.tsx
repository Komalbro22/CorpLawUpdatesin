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
  Info,
  Download,
  ShieldCheck,
  Building2,
  Landmark,
  Layers,
  ArrowRight
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import { generateChg1Pdf } from '@/lib/pdf/generateChg1Pdf'

interface CHG1WorkspaceProps {
  form: MCAForm
}

type CalcMode = 'date' | 'days'
type ChargeNature = 'creation' | 'modification' | 'foreign_property'

interface TimelineTier {
  tier: string
  creationWindow: string
  delayWindow: string
  smallOpcMultiplier: string
  otherMultiplier: string
  adValoremRule: string
  rocAuthority: string
  isHardStop?: boolean
}

const STATUTORY_TIERS: TimelineTier[] = [
  {
    tier: 'Tier 1: Normal Window',
    creationWindow: 'Days 0 to 30',
    delayWindow: '0 days delay',
    smallOpcMultiplier: 'Normal Base Fee (0× extra)',
    otherMultiplier: 'Normal Base Fee (0× extra)',
    adValoremRule: 'Nil (0%)',
    rocAuthority: 'Direct ROC Registration — No application required'
  },
  {
    tier: 'Tier 2: First Extension',
    creationWindow: 'Days 31 to 60',
    delayWindow: '1 to 30 days delay',
    smallOpcMultiplier: '3× Normal Fee',
    otherMultiplier: '6× Normal Fee',
    adValoremRule: 'Nil (0%)',
    rocAuthority: 'ROC Registration on application with additional fees'
  },
  {
    tier: 'Tier 3: Second Extension + Ad Valorem',
    creationWindow: 'Days 61 to 90',
    delayWindow: '31 to 60 days delay',
    smallOpcMultiplier: '3× Normal Fee + 0.025% Ad Valorem (Max ₹1 Lakh)',
    otherMultiplier: '6× Normal Fee + 0.05% Ad Valorem (Max ₹5 Lakhs)',
    adValoremRule: '0.025% (Small/OPC) or 0.05% (Other)',
    rocAuthority: 'ROC Registration with Ad Valorem Fee (Section 77(1) Proviso)'
  },
  {
    tier: 'Tier 4: Statutory Hard Stop',
    creationWindow: 'Beyond 90 Days',
    delayWindow: 'More than 60 days delay',
    smallOpcMultiplier: 'Section 87 Condonation Required',
    otherMultiplier: 'Section 87 Condonation Required',
    adValoremRule: 'Subject to RD Penalty Order',
    rocAuthority: 'HARD STOP: ROC cannot register. Requires Form CHG-8 to Regional Director',
    isHardStop: true
  }
]

const CAPITAL_PRESETS = [
  { label: '< ₹1 Lakh', value: 90000, fee: 200 },
  { label: '₹1L – ₹5L', value: 100000, fee: 300 },
  { label: '₹5L – ₹25L', value: 1000000, fee: 400 },
  { label: '₹25L – ₹1Cr', value: 5000000, fee: 500 },
  { label: '≥ ₹1 Crore', value: 10000000, fee: 600 }
]

const CHARGE_AMOUNT_PRESETS = [
  { label: '₹10 Lakhs', value: 1000000 },
  { label: '₹50 Lakhs', value: 5000000 },
  { label: '₹1 Crore', value: 10000000 },
  { label: '₹5 Crores', value: 50000000 },
  { label: '₹10 Crores', value: 100000000 }
]

function getNormalFeeByCapital(capital: number, hasCapital: boolean): number {
  if (!hasCapital) return 200
  if (capital < 100000) return 200
  if (capital < 500000) return 300
  if (capital < 2500000) return 400
  if (capital < 10000000) return 500
  return 600
}

export default function CHG1Workspace({ form }: CHG1WorkspaceProps) {
  const { showToast } = useToast()

  // Calculation Mode & Transaction Nature
  const [calcMode, setCalcMode] = useState<CalcMode>('date')
  const [chargeNature, setChargeNature] = useState<ChargeNature>('creation')

  // Date States (Creation of Charge & Filing Date)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const defaultCreationStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 10)
    return d.toISOString().slice(0, 10)
  }, [])

  const [creationDate, setCreationDate] = useState<string>(defaultCreationStr)
  const [filingDate, setFilingDate] = useState<string>(todayStr)

  // Direct Days Mode
  const [directDelayDays, setDirectDelayDays] = useState<number>(0)

  // Entity Classification & Share Capital
  const [isSmallOrOpc, setIsSmallOrOpc] = useState<boolean>(false)
  const [hasShareCapital, setHasShareCapital] = useState<boolean>(true)
  const [nominalCapital, setNominalCapital] = useState<number>(100000) // ₹1 Lakh default
  const [companyName, setCompanyName] = useState<string>('')
  const [lenderName, setLenderName] = useState<string>('')

  // Secured Charge Amount
  const [chargeAmount, setChargeAmount] = useState<number>(5000000) // ₹50 Lakhs default

  // Compute Timelines and Delay
  const {
    statutoryDueDate,
    firstExtensionDate,
    finalRocExtensionDate,
    daysFromCreation,
    calculatedDelayDays,
    activeTierIndex,
    isCondonation
  } = useMemo(() => {
    if (calcMode === 'days') {
      const delay = Math.max(0, directDelayDays)
      const daysCreated = 30 + delay
      let tierIdx = 0
      let condonation = false

      if (delay === 0) {
        tierIdx = 0
      } else if (delay <= 30) {
        tierIdx = 1
      } else if (delay <= 60) {
        tierIdx = 2
      } else {
        tierIdx = 3
        condonation = true
      }

      return {
        statutoryDueDate: null,
        firstExtensionDate: null,
        finalRocExtensionDate: null,
        daysFromCreation: daysCreated,
        calculatedDelayDays: delay,
        activeTierIndex: tierIdx,
        isCondonation: condonation
      }
    }

    if (!creationDate) {
      return {
        statutoryDueDate: null,
        firstExtensionDate: null,
        finalRocExtensionDate: null,
        daysFromCreation: 0,
        calculatedDelayDays: 0,
        activeTierIndex: 0,
        isCondonation: false
      }
    }

    const creation = new Date(creationDate)

    // Initial 30-day window
    const due = new Date(creation)
    due.setDate(due.getDate() + 30)

    // First extension (60 days from creation)
    const ext1 = new Date(creation)
    ext1.setDate(ext1.getDate() + 60)

    // Final ROC cutoff (90 days from creation)
    const ext2 = new Date(creation)
    ext2.setDate(ext2.getDate() + 90)

    const filing = filingDate ? new Date(filingDate) : new Date()

    // Difference from creation in calendar days
    const diffFromCreationMs = filing.getTime() - creation.getTime()
    const diffFromCreationDays = Math.max(0, Math.ceil(diffFromCreationMs / (1000 * 60 * 60 * 24)))

    // Difference from statutory due date in calendar days
    const diffTime = filing.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const delay = Math.max(0, diffDays)

    let tierIdx = 0
    let condonation = false

    if (diffFromCreationDays <= 30 || delay === 0) {
      tierIdx = 0
    } else if (diffFromCreationDays <= 60 || delay <= 30) {
      tierIdx = 1
    } else if (diffFromCreationDays <= 90 || delay <= 60) {
      tierIdx = 2
    } else {
      tierIdx = 3
      condonation = true
    }

    return {
      statutoryDueDate: due,
      firstExtensionDate: ext1,
      finalRocExtensionDate: ext2,
      daysFromCreation: diffFromCreationDays,
      calculatedDelayDays: delay,
      activeTierIndex: tierIdx,
      isCondonation: condonation
    }
  }, [calcMode, creationDate, filingDate, directDelayDays])

  // Normal Base Fee (Table A)
  const normalFee = useMemo(() => {
    return getNormalFeeByCapital(nominalCapital, hasShareCapital)
  }, [nominalCapital, hasShareCapital])

  // Multipliers & Ad Valorem Fees
  const {
    multiplier,
    multiplierFee,
    adValoremPercent,
    adValoremFee,
    adValoremCapped,
    maxAdValoremCap,
    totalFee
  } = useMemo(() => {
    if (isCondonation) {
      return {
        multiplier: 0,
        multiplierFee: 0,
        adValoremPercent: 0,
        adValoremFee: 0,
        adValoremCapped: false,
        maxAdValoremCap: 0,
        totalFee: 0
      }
    }

    if (calculatedDelayDays === 0) {
      return {
        multiplier: 0,
        multiplierFee: 0,
        adValoremPercent: 0,
        adValoremFee: 0,
        adValoremCapped: false,
        maxAdValoremCap: 0,
        totalFee: normalFee
      }
    }

    // Days 31 to 60 from creation (1 to 30 days delay)
    if (calculatedDelayDays <= 30) {
      const mult = isSmallOrOpc ? 3 : 6
      const multFee = normalFee * mult
      return {
        multiplier: mult,
        multiplierFee: multFee,
        adValoremPercent: 0,
        adValoremFee: 0,
        adValoremCapped: false,
        maxAdValoremCap: 0,
        totalFee: normalFee + multFee
      }
    }

    // Days 61 to 90 from creation (31 to 60 days delay)
    const mult = isSmallOrOpc ? 3 : 6
    const multFee = normalFee * mult
    const percent = isSmallOrOpc ? 0.00025 : 0.0005 // 0.025% vs 0.05%
    const cap = isSmallOrOpc ? 100000 : 500000

    const rawAdValorem = Math.ceil(chargeAmount * percent)
    const capped = rawAdValorem > cap
    const finalAdValorem = Math.min(rawAdValorem, cap)

    return {
      multiplier: mult,
      multiplierFee: multFee,
      adValoremPercent: percent,
      adValoremFee: finalAdValorem,
      adValoremCapped: capped,
      maxAdValoremCap: cap,
      totalFee: normalFee + multFee + finalAdValorem
    }
  }, [isCondonation, calculatedDelayDays, isSmallOrOpc, normalFee, chargeAmount])

  // Formatting helpers
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '—'
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Preset Date Buttons
  const handleSetPresetCreation = (daysAgo: number) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    setCreationDate(d.toISOString().slice(0, 10))
    setFilingDate(todayStr)
    setCalcMode('date')
  }

  // Copy breakdown for Client WhatsApp / Email
  const handleCopyBreakdown = () => {
    const compHeader = companyName ? `Company: ${companyName}\n` : ''
    const bankHeader = lenderName ? `Lender / Bank: ${lenderName}\n` : ''
    const natureStr = chargeNature === 'creation' ? 'Creation of Charge' : chargeNature === 'modification' ? 'Modification of Charge' : 'Charge on Foreign Assets'
    const capitalStr = hasShareCapital ? formatINR(nominalCapital) : 'Company without Share Capital'
    const dueStr = statutoryDueDate ? `Initial Due Date (30 Days): ${formatDateDisplay(statutoryDueDate)}\n` : ''
    const creationStr = calcMode === 'date' ? `Creation Date: ${formatDateDisplay(new Date(creationDate))}\n` : ''
    const filingStr = calcMode === 'date' && filingDate ? `Planned Filing Date: ${formatDateDisplay(new Date(filingDate))}\n` : ''
    const delayStr = calculatedDelayDays > 0 ? `Delay: ${calculatedDelayDays} days (${daysFromCreation} days from creation)\n` : 'Status: On Time (Within 30 days)\n'

    let feeBreakdownStr = ''
    if (isCondonation) {
      feeBreakdownStr = `⚠️ SECTION 87 CONDONATION REQUIRED:
• Delay exceeds 90 days from creation of charge.
• Under Section 77(1) proviso, ROC CANNOT register Form CHG-1 directly.
• Action Required: Submit petition in Form CHG-8 to Regional Director (Central Govt).
• Government Fee: Subject to penalty ordered by Regional Director.`
    } else {
      feeBreakdownStr = `• Normal Base Fee (Table A): ${formatINR(normalFee)}
• Additional Extension Fee (${multiplier}×): ${formatINR(multiplierFee)}
• Ad Valorem Additional Fee: ${formatINR(adValoremFee)}${adValoremCapped ? ` (Statutory Cap Applied: ${formatINR(maxAdValoremCap)})` : ''}
═════════════════════════════
TOTAL MCA CHALLAN PAYABLE: ${formatINR(totalFee)}
═════════════════════════════`
    }

    const text = `📋 FORM CHG-1 STATUTORY CHARGE FEE MEMORANDUM (FY 2026-27)
${compHeader}${bankHeader}Transaction: ${natureStr}
Entity Type: ${isSmallOrOpc ? 'Small Company / OPC' : 'Other Company'}
Nominal Capital: ${capitalStr}
Secured Facility Amount: ${formatINR(chargeAmount)}
${creationStr}${dueStr}${filingStr}${delayStr}
─────────────────────────────
${feeBreakdownStr}

Generated via CorpLawUpdates Fee Calculator:
https://www.corplawupdates.in/tools/fee-calculator/companies/chg-1`

    navigator.clipboard.writeText(text)
    showToast('CHG-1 fee breakdown copied to clipboard!', 'success')
  }

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true)
    try {
      const doc = generateChg1Pdf({
        companyName: companyName.trim() || undefined,
        nominalCapital,
        hasShareCapital,
        isSmallOrOpc,
        chargeNature,
        chargeAmount,
        lenderName: lenderName.trim() || undefined,
        calcMode,
        creationDate: calcMode === 'date' ? formatDateDisplay(new Date(creationDate)) : undefined,
        statutoryDueDate: formatDateDisplay(statutoryDueDate),
        firstExtensionDate: formatDateDisplay(firstExtensionDate),
        finalRocExtensionDate: formatDateDisplay(finalRocExtensionDate),
        actualFilingDate: calcMode === 'date' && filingDate ? formatDateDisplay(new Date(filingDate)) : undefined,
        calculatedDelayDays,
        daysFromCreation,
        normalFee,
        multiplier,
        multiplierFee,
        adValoremPercent,
        adValoremFee,
        adValoremCapped,
        maxAdValoremCap,
        totalFee,
        isCondonation
      })
      const cleanName = companyName ? companyName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Company'
      doc.save(`CorpLawUpdates_CHG1_Fee_Memorandum_${cleanName}.pdf`)
      showToast('CHG-1 statutory memorandum downloaded as PDF!', 'success')
    } catch (e) {
      console.error('Error generating CHG-1 PDF:', e)
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
      {/* ── 1. Main Workspace Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">

        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-md tracking-wider">
                CHG-1 Master Engine
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Section 77, 78 &amp; 2019 Ad Valorem Rules
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Charge Creation Fee, Ad Valorem &amp; Timeline Calculator
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
              Date-Based (Section 77)
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

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* A. Optional Company & Lender Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Company Name (Optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Industries Ltd"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Lender / Bank Name (Optional)
                </label>
                <div className="relative">
                  <Landmark className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    placeholder="e.g. State Bank of India / HDFC"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* B. Transaction Nature & Entity Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Transaction Nature
                </label>
                <select
                  value={chargeNature}
                  onChange={(e) => setChargeNature(e.target.value as ChargeNature)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="creation">Creation of Charge (Section 77)</option>
                  <option value="modification">Modification of Charge (Section 79)</option>
                  <option value="foreign_property">Charge on Foreign Assets (Section 77 Proviso)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Entity Classification
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsSmallOrOpc(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isSmallOrOpc
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Other Company (6× / 0.05%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSmallOrOpc(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSmallOrOpc
                        ? 'bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Small / OPC (3× / 0.025%)
                  </button>
                </div>
              </div>
            </div>

            {/* C. Date Selection (Mode A) */}
            {calcMode === 'date' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Key Statutory Dates
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetPresetCreation(10)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    >
                      10d Ago
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetCreation(45)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    >
                      45d (Tier 2)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetCreation(75)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                    >
                      75d (Tier 3)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetCreation(110)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600"
                    >
                      110d (Condonation)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Date of Charge Creation / Instrument Execution
                    </label>
                    <input
                      type="date"
                      value={creationDate}
                      onChange={(e) => setCreationDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Day 0 of Section 77 timeline</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Actual / Planned Filing Date
                    </label>
                    <input
                      type="date"
                      value={filingDate}
                      onChange={(e) => setFilingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Defaults to today</p>
                  </div>
                </div>

                {/* Statutory Date Computed Badges */}
                {statutoryDueDate && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-center">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">30-Day Due Date</p>
                      <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">{formatDateDisplay(statutoryDueDate)}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">60-Day Cutoff</p>
                      <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200">{formatDateDisplay(firstExtensionDate)}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                      <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">90-Day ROC Stop</p>
                      <p className="text-xs font-extrabold text-rose-900 dark:text-rose-200">{formatDateDisplay(finalRocExtensionDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* D. Direct Days Mode (Mode B) */}
            {calcMode === 'days' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Filing Delay Beyond 30 Days (Days)
                  </label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {directDelayDays} Days Late ({30 + directDelayDays} Days from Creation)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={directDelayDays}
                  onChange={(e) => setDirectDelayDays(parseInt(e.target.value) || 0)}
                  className="w-full accent-blue-600"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {[0, 15, 30, 45, 60, 75, 95].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDirectDelayDays(d)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        directDelayDays === d
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {d === 0 ? '0 Days (On-Time)' : d > 60 ? `${d}d (>90d Condonation)` : `${d} Days`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* E. Charge Secured Amount & Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Charge Secured Amount (Loan / Credit Facility)
                </label>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {formatINR(chargeAmount)}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Enter sanctioned loan amount"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-2">
                {CHARGE_AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setChargeAmount(preset.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      chargeAmount === preset.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* F. Nominal Share Capital & Presets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Authorized / Nominal Capital (Table A Base Fee)
                </label>
                <button
                  type="button"
                  onClick={() => setHasShareCapital(!hasShareCapital)}
                  className={`text-xs font-bold px-2 py-0.5 rounded transition-all ${
                    !hasShareCapital
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {!hasShareCapital ? '✓ No Share Capital (₹200)' : 'Company without capital?'}
                </button>
              </div>

              {hasShareCapital && (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={nominalCapital}
                      onChange={(e) => setNominalCapital(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Nominal capital in INR"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CAPITAL_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setHasShareCapital(true)
                          setNominalCapital(preset.value)
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          hasShareCapital && nominalCapital === preset.value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset.label} (₹{preset.fee})
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Right Column: Dynamic Live Calculation Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-gradient-to-b from-slate-900 to-navy text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Statutory Assessment
                </span>
                {isCondonation ? (
                  <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Condonation Required
                  </span>
                ) : calculatedDelayDays === 0 ? (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Timely Filing
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {calculatedDelayDays} Days Overdue
                  </span>
                )}
              </div>

              {/* Grand Total Challan */}
              <div className="mb-6 pb-6 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Total MCA21 Challan Payable</span>
                <div className="flex items-baseline gap-2 mt-1">
                  {isCondonation ? (
                    <div className="text-2xl font-bold text-red-400">
                      Subject to RD Order
                    </div>
                  ) : (
                    <div className="text-4xl font-extrabold text-white tracking-tight">
                      {formatINR(totalFee)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isCondonation
                    ? 'Exceeds 90 days. Direct ROC fee payment blocked under Section 77 proviso.'
                    : `Payable online via Bharatkosh gateway upon Form CHG-1 submission`}
                </p>
              </div>

              {/* Fee Breakdown Breakdown List */}
              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Normal Government Base Fee (Table A):</span>
                  <span className="font-bold text-white">{formatINR(normalFee)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    Extension Multiplier ({multiplier}×):
                    {multiplier > 0 && (
                      <span className="text-[10px] text-blue-400">({isSmallOrOpc ? 'Small/OPC' : 'Other'})</span>
                    )}
                  </span>
                  <span className="font-bold text-white">
                    {isCondonation ? '—' : formatINR(multiplierFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    Ad Valorem Fee ({(adValoremPercent * 100).toFixed(3)}%):
                    {adValoremCapped && <span className="text-[10px] text-amber-400 font-bold">(Capped)</span>}
                  </span>
                  <span className="font-bold text-white">
                    {isCondonation ? '—' : formatINR(adValoremFee)}
                  </span>
                </div>

                {calcMode === 'date' && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Statutory 30-Day Deadline:</span>
                      <span className="text-slate-200 font-semibold">{formatDateDisplay(statutoryDueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>90-Day Absolute ROC Cutoff:</span>
                      <span className="text-rose-400 font-semibold">{formatDateDisplay(finalRocExtensionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Days from Creation:</span>
                      <span className="text-slate-200 font-semibold">{daysFromCreation} Day(s)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 87 Condonation Critical Warning */}
              {isCondonation && (
                <div className="bg-red-950/50 border border-red-800/60 rounded-2xl p-4 mb-6 text-xs text-red-200">
                  <div className="flex items-center gap-2 font-bold text-red-400 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    Section 87 Regional Director Condonation Required
                  </div>
                  <p className="text-[11px] leading-relaxed text-red-300">
                    More than 90 days have elapsed since the charge was created. Under the Section 77(1) proviso, the Registrar of Companies (ROC) has NO power to register the charge or collect late fees.
                  </p>
                  <p className="text-[11px] leading-relaxed text-red-300 mt-1">
                    <strong>Statutory Roadmap:</strong> File Form CHG-8 with the Regional Director &rarr; Obtain Condonation Order &rarr; File Form INC-28 &rarr; File Form CHG-1 with ROC.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF Report'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBreakdown}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy for Client
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Sheet
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ── 2. Interactive 4-Tier Statutory Timeline Matrix ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Section 77 Statutory Timeline &amp; Ad Valorem Fee Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Statutory 30-60-90 day schedule for charges created on or after 02.11.2018 (Companies Amendment Act)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Active Tier: {STATUTORY_TIERS[activeTierIndex].tier.split(':')[0]}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Timeline Window</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Days from Creation</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Small / OPC Fee</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Other Company Fee</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Ad Valorem Rate</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Statutory Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {STATUTORY_TIERS.map((tier, idx) => {
                const isActive = idx === activeTierIndex
                return (
                  <tr
                    key={tier.tier}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 font-semibold'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isActive && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                        <span className={isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-900 dark:text-white'}>
                          {tier.tier}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      {tier.creationWindow} <span className="text-[10px] text-slate-400">({tier.delayWindow})</span>
                    </td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {tier.smallOpcMultiplier}
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 font-semibold">
                      {tier.otherMultiplier}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {tier.adValoremRule}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {tier.rocAuthority}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Regulatory Guidelines & Attachments Checklist ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left: Section 77 & 78 Statutory Guidance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Key Statutory Rules for Charges
          </h4>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Section 77(1):</strong> Duty of company to register charges created on its property, assets or undertaking within 30 days of creation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Section 78 (Bank Right):</strong> If the company fails to register within 30 days, the lender/bank can apply directly. ROC issues 14-day notice to the company and allows bank to recover fees.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Section 77(3) Void Against Liquidator:</strong> An unregistered charge is VOID against the liquidator and other creditors. The bank becomes an unsecured creditor in winding-up.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Section 87 (Condonation):</strong> If not registered within 90 days, filing Form CHG-8 with Regional Director is mandatory. ROC has no discretionary power to condone delay beyond 90 days.
              </span>
            </li>
          </ul>
        </div>

        {/* Right: Mandatory MCA V3 Attachments */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Mandatory Attachments Checklist (MCA V3)
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Instrument of Charge:</strong> Certified copy of Sanction Letter, Deed of Hypothecation, Mortgage Deed, or Loan Agreement.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Board Resolution:</strong> Certified true copy of resolution passed under Section 179(3)(d) approving borrowing and charge creation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Section 180 Resolution:</strong> Special Resolution under Section 180(1)(a) &amp; 180(1)(c) if borrowing exceeds capital and free reserves.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Consortium / Pari-Passu NOC:</strong> Letter of approval / NOC from existing charge-holders if creating second or joint charge.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Professional Certification:</strong> DSC signature of Practicing CS, CA, or CMA certifying the instrument and statutory particulars.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* ── 4. Isolated Printable Memorandum Sheet (#chg1-printable-sheet) ── */}
      {/* Hidden on web, visible exclusively during window.print() as a crisp 1-page executive sheet */}
      <div id="chg1-printable-sheet" className="hidden print:block font-sans text-slate-900 bg-white p-6 max-w-4xl mx-auto">
        
        {/* Printable Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">CorpLawUpdates.in</h1>
            <p className="text-[10px] text-slate-600 font-medium">India's Statutory Corporate Compliance &amp; Regulatory Intelligence Platform</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              FORM CHG-1 COMPLIANCE MEMO
            </span>
            <p className="text-[9px] text-slate-500 mt-1">Generated: {formatDateDisplay(new Date())}</p>
          </div>
        </div>

        <div className="text-center my-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Statutory Charge Registration &amp; Fee Assessment Memorandum
          </h2>
          <p className="text-[10px] text-slate-500">Under Sections 77, 78 &amp; 79 of the Companies Act, 2013 read with Rule 3, 4 &amp; 12</p>
        </div>

        {/* Section 1: Entity & Secured Transaction Parameters */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
            1. Entity &amp; Secured Credit Facility Parameters
          </h3>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200 w-1/3">Company Name</td>
                <td className="p-2 font-semibold">{companyName ? companyName.toUpperCase() : 'Generic Assessment'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Entity Classification</td>
                <td className="p-2">{isSmallOrOpc ? 'Small Company / One Person Company (OPC) [3× fee, 0.025% Ad Valorem]' : 'Other Company (Standard Private / Public) [6× fee, 0.05% Ad Valorem]'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Transaction Nature</td>
                <td className="p-2">{chargeNature === 'creation' ? 'Creation of Charge (Section 77)' : chargeNature === 'modification' ? 'Modification of Charge (Section 79)' : 'Charge on Foreign Assets'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Lender / Charge-Holder</td>
                <td className="p-2">{lenderName ? lenderName.toUpperCase() : 'Scheduled Commercial Bank / Financial Institution'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Secured Facility Amount</td>
                <td className="p-2 font-bold text-slate-950">{formatINR(chargeAmount)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Nominal Capital (Base Fee)</td>
                <td className="p-2">{hasShareCapital ? formatINR(nominalCapital) : 'Company without share capital'}</td>
              </tr>
              {calcMode === 'date' && (
                <>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Date of Creation of Charge</td>
                    <td className="p-2">{creationDate || '—'} (Day 0)</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Statutory Due Date (30 Days)</td>
                    <td className="p-2 font-bold text-slate-900">{formatDateDisplay(statutoryDueDate)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">ROC Absolute Cutoff (90 Days)</td>
                    <td className="p-2 font-bold text-rose-700">{formatDateDisplay(finalRocExtensionDate)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Actual / Planned Filing Date</td>
                    <td className="p-2">{filingDate ? formatDateDisplay(new Date(filingDate)) : '—'}</td>
                  </tr>
                </>
              )}
              <tr className="border-b border-slate-200">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-200">Delay Assessment</td>
                <td className="p-2 font-bold">
                  {isCondonation ? (
                    <span className="text-red-700">HARD STOP: Delay exceeds 90 days. ROC registration barred without Section 87 RD Condonation.</span>
                  ) : calculatedDelayDays === 0 ? (
                    <span className="text-emerald-700">COMPLIANT — Timely Filing (Within initial 30 days)</span>
                  ) : (
                    <span className="text-amber-700">DELAYED by {calculatedDelayDays} day(s) ({daysFromCreation} days from creation)</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: MCA21 Portal Challan Fee Computation */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
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
              {isCondonation ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-red-700 font-bold bg-red-50">
                    Direct ROC payment is not permissible. Application in Form CHG-8 must be filed with Regional Director.
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Normal Statutory Base Fee</td>
                    <td className="p-2 text-slate-600">Table A (Item 5/6), Companies (Registration Offices and Fees) Rules, 2014</td>
                    <td className="p-2 text-right font-bold">{formatINR(normalFee)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Extension Multiplier Fee</td>
                    <td className="p-2 text-slate-600">
                      {calculatedDelayDays === 0
                        ? 'Filed within 30 days — No multiplier fee applies'
                        : `Section 77(1) (${multiplier}× Normal Base Fee)`}
                    </td>
                    <td className="p-2 text-right font-bold">{formatINR(multiplierFee)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Ad Valorem Additional Fee</td>
                    <td className="p-2 text-slate-600">
                      {calculatedDelayDays <= 30
                        ? 'Not applicable for filings within 60 days of creation'
                        : `Section 77(1) Proviso (${(adValoremPercent * 100).toFixed(3)}% of ${formatINR(chargeAmount)}${adValoremCapped ? ` [Capped at ${formatINR(maxAdValoremCap)}]` : ''})`}
                    </td>
                    <td className="p-2 text-right font-bold">{formatINR(adValoremFee)}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="p-2 text-slate-950">TOTAL MCA21 CHALLAN PAYABLE</td>
                    <td className="p-2 text-slate-600 italic">Payable via Bharatkosh / MCA Gateway</td>
                    <td className="p-2 text-right text-sm text-slate-950">{formatINR(totalFee)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Statutory Timeline & Attachments */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
            3. Regulatory Guidelines &amp; MCA V3 Checklist
          </h3>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="border border-slate-200 rounded p-2 bg-slate-50">
              <p className="font-bold text-slate-900 mb-0.5">Section 77 Proviso (Post-2018 Law):</p>
              <p className="text-slate-600 leading-snug">
                Charges must be registered within 30 days (normal fee), or up to 60 days with additional fee, or up to 90 days with ad valorem fee. Beyond 90 days, ROC registration is barred.
              </p>
            </div>
            <div className="border border-slate-200 rounded p-2 bg-slate-50">
              <p className="font-bold text-slate-900 mb-0.5">Section 87 Condonation Roadmap:</p>
              <p className="text-slate-600 leading-snug">
                {isCondonation
                  ? 'CRITICAL: Delay exceeds 90 days. Prior condonation approval from Regional Director via Form CHG-8 is mandatory before Form CHG-1 can be filed.'
                  : 'COMPLIANT: Within the 90-day statutory window. Form CHG-1 is eligible for direct ROC registration upon payment of prescribed challan.'}
              </p>
            </div>
          </div>

          <div className="mt-2 border border-slate-200 rounded p-2">
            <p className="font-bold text-slate-900 text-[11px] mb-0.5">Mandatory PDF Attachments Verified:</p>
            <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
              <li>1. Certified true copy of Sanction Letter &amp; Instrument creating charge (Deed of Hypothecation / Mortgage Deed).</li>
              <li>2. Certified copy of Board Resolution approving borrowing and creation of charge (Section 179(3)(d)).</li>
              <li>3. Special Resolution under Section 180(1)(a)/(c) if borrowing limits exceed capital and reserves.</li>
              <li>4. Digital Signature Certificate (DSC) of Director and Practicing Professional (CA / CS / CMA).</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Signature / Verification Block */}
        <div className="pt-3 border-t border-slate-300 mt-4 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="text-slate-500 mb-6">Prepared &amp; Verified By:</p>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900">Practicing Company Secretary / Auditor</p>
              <p className="text-[10px] text-slate-500">Membership / COP No.: _____________________</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-500 mb-6">Approved for Filing By:</p>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-900">Director / Managing Director / CS</p>
              <p className="text-[10px] text-slate-500">DIN / PAN No.: _____________________</p>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-500 leading-tight text-justify">
          STATUTORY NOTICE: This memorandum is generated automatically by CorpLawUpdates.in for statutory estimation purposes based on user inputs and the Companies (Registration Offices and Fees) Rules, 2014 as amended. Form CHG-1 does NOT attract standard ₹100/day late fees; it is strictly governed by the 30-60-90 day ad-valorem structure. MCA portal records and generated challans remain the final authority.
        </div>
      </div>

      {/* ── 5. Print Styles — Isolates #chg1-printable-sheet for crisp 1-page browser print ── */}
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
          #chg1-printable-sheet,
          #chg1-printable-sheet * {
            visibility: visible !important;
          }
          #chg1-printable-sheet {
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
