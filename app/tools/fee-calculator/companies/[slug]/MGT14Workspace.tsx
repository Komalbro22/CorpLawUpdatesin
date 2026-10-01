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
  Check,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Share2,
  BookOpen,
  Landmark,
  FileCheck,
  Zap
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateMgt14Compliance,
  Mgt14CompanyType,
  Mgt14EventType,
  Mgt14CalculationInput,
  MGT14_PURPOSES,
  formatInr,
  getCalendarDaysDiff
} from '@/lib/rule-engine/mgt14-engine'
import { generateMgt14Pdf } from '@/lib/pdf/generateMgt14Pdf'
import IndianDateInput from '@/components/shared/IndianDateInput'

interface PresetConfig {
  id: string
  label: string
  hasShareCapital: boolean
  nominalShareCapital: number
  companyType: Mgt14CompanyType
  isIfscCompany: boolean
  eventType: Mgt14EventType
  purposeId: string
  eventDate: string
  filingDate: string
  numOfficers: number
  badge: string
  description: string
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
    id: 'case_a_ontime',
    label: 'Case A: Special Resolution (₹10L Capital, On-Time)',
    hasShareCapital: true,
    nominalShareCapital: 1000000, // ₹10 Lakhs -> ₹400
    companyType: 'normal',
    isIfscCompany: false,
    eventType: 'special_resolution',
    purposeId: 'moa_alteration',
    eventDate: getOffsetDateIso(-15),
    filingDate: getTodayIso(),
    numOfficers: 2,
    badge: 'On-Time',
    description: 'Special Resolution passed 15 days ago. Filed within 30-day statutory window. Normal Fee ₹400, Additional Fee ₹0, Total Challan ₹400. Zero statutory penalty.'
  },
  {
    id: 'case_b_25d_delay',
    label: 'Case B: MOA Alteration (₹50L Capital, 25d Delay)',
    hasShareCapital: true,
    nominalShareCapital: 5000000, // ₹50 Lakhs -> ₹500
    companyType: 'normal',
    isIfscCompany: false,
    eventType: 'special_resolution',
    purposeId: 'moa_alteration',
    eventDate: getOffsetDateIso(-55), // 30 + 25 days
    filingDate: getTodayIso(),
    numOfficers: 2,
    badge: '25d Delay (2×)',
    description: 'Filed 25 days past statutory due date. Falls in Table B "up to 30 days" slab (2× multiplier). Normal Fee: ₹500, Additional Fee: ₹1,000, Total Challan: ₹1,500.'
  },
  {
    id: 'case_c_small_co_446b',
    label: 'Case C: Small Company under Section 446B (45d Delay)',
    hasShareCapital: true,
    nominalShareCapital: 2500000, // ₹25 Lakhs -> ₹500
    companyType: 'small_company',
    isIfscCompany: false,
    eventType: 'special_resolution',
    purposeId: 'private_placement',
    eventDate: getOffsetDateIso(-75), // 30 + 45 days
    filingDate: getTodayIso(),
    numOfficers: 2,
    badge: 'Sec 446B Relief',
    description: 'Small Company delayed by 45 days (4× multiplier). Challan: ₹2,500. Section 446B provides 50% discount on statutory adjudication penalties (Saving ₹14,400).'
  },
  {
    id: 'case_d_ifsc',
    label: 'Case D: IFSC Company (60-Day Window, On-Time)',
    hasShareCapital: true,
    nominalShareCapital: 10000000, // ₹1 Crore -> ₹600
    companyType: 'normal',
    isIfscCompany: true,
    eventType: 'special_resolution',
    purposeId: 'other_special_resolution',
    eventDate: getOffsetDateIso(-45),
    filingDate: getTodayIso(),
    numOfficers: 1,
    badge: 'IFSC (60 Days)',
    description: 'IFSC entity enjoys 60-day statutory filing window pursuant to MCA Notification G.S.R. 8(E)/9(E). Filed at 45 days = On-Time! Total Challan: ₹600.'
  },
  {
    id: 'case_e_condonation_350d',
    label: 'Case E: Extended Delay >300 Days (Condonation Required)',
    hasShareCapital: true,
    nominalShareCapital: 10000000, // ₹1 Crore -> ₹600
    companyType: 'normal',
    isIfscCompany: false,
    eventType: 'special_resolution',
    purposeId: 'moa_alteration',
    eventDate: getOffsetDateIso(-380), // > 300 days
    filingDate: getTodayIso(),
    numOfficers: 2,
    badge: 'INC-28 Condonation',
    description: 'Event date exceeds 300 days. Direct MCA V3 filing is blocked. Central Government Condonation via Form CG-1 and Form INC-28 SRN is mandatory.'
  },
  {
    id: 'case_f_pvt_borrowing_exempt',
    label: 'Case F: Private Co Routine Borrowing (Exempt!)',
    hasShareCapital: true,
    nominalShareCapital: 1000000,
    companyType: 'small_company',
    isIfscCompany: false,
    eventType: 'board_resolution',
    purposeId: 'board_powers_sec_179_public',
    eventDate: getOffsetDateIso(-10),
    filingDate: getTodayIso(),
    numOfficers: 2,
    badge: 'Exempt for Pvt Co',
    description: 'Private Limited Companies are EXEMPT from filing Section 179(3) Board Resolutions pursuant to MCA Exemption Notification G.S.R. 464(E) dated 05.06.2015!'
  }
]

export default function MGT14Workspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()

  // Mode: Basic vs Professional
  const [isProfessionalMode, setIsProfessionalMode] = useState<boolean>(true)

  // Primary Inputs
  const [hasShareCapital, setHasShareCapital] = useState<boolean>(true)
  const [nominalShareCapital, setNominalShareCapital] = useState<number>(1000000) // Default ₹10 Lakhs
  const [companyType, setCompanyType] = useState<Mgt14CompanyType>('normal')
  const [isIfscCompany, setIsIfscCompany] = useState<boolean>(false)
  const [eventType, setEventType] = useState<Mgt14EventType>('special_resolution')
  const [purposeId, setPurposeId] = useState<string>('moa_alteration')
  const [eventDate, setEventDate] = useState<string>(getOffsetDateIso(-20))
  const [filingDate, setFilingDate] = useState<string>(getTodayIso())
  const [numOfficers, setNumOfficers] = useState<number>(2)

  // Advanced / Multi-Event Dates
  const [hasMultipleDates, setHasMultipleDates] = useState<boolean>(false)
  const [extraEventDates, setExtraEventDates] = useState<string[]>([])

  // AI Assistant state
  const [aiQuestion, setAiQuestion] = useState<string>('')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)

  // Validation
  const validationError = useMemo(() => {
    if (!eventDate || !filingDate) return 'Both event date and filing date are required.'
    if (getCalendarDaysDiff(eventDate, filingDate) < 0) {
      return 'Filing date cannot be earlier than the event / resolution date.'
    }
    if (hasShareCapital && nominalShareCapital < 0) {
      return 'Nominal share capital cannot be negative.'
    }
    return null
  }, [eventDate, filingDate, hasShareCapital, nominalShareCapital])

  // Calculation Engine
  const calculationResult = useMemo(() => {
    const input: Mgt14CalculationInput = {
      hasShareCapital,
      nominalShareCapital: hasShareCapital ? Math.max(0, nominalShareCapital || 0) : 0,
      isIfscCompany,
      companyType,
      eventType,
      purposeId,
      eventDate: eventDate || getTodayIso(),
      filingDate: filingDate || getTodayIso(),
      numOfficersInDefault: Math.max(1, numOfficers || 1)
    }
    return calculateMgt14Compliance(input)
  }, [
    hasShareCapital,
    nominalShareCapital,
    isIfscCompany,
    companyType,
    eventType,
    purposeId,
    eventDate,
    filingDate,
    numOfficers
  ])

  // Preset Applicator
  const applyPreset = (preset: PresetConfig) => {
    setHasShareCapital(preset.hasShareCapital)
    setNominalShareCapital(preset.nominalShareCapital)
    setCompanyType(preset.companyType)
    setIsIfscCompany(preset.isIfscCompany)
    setEventType(preset.eventType)
    setPurposeId(preset.purposeId)
    setEventDate(preset.eventDate)
    setFilingDate(preset.filingDate)
    setNumOfficers(preset.numOfficers)
    showToast(`Loaded ${preset.label}`, 'success')
  }

  // Copy CS Working Paper
  const handleCopyWorkingPaper = () => {
    navigator.clipboard.writeText(calculationResult.workingPaperText)
    showToast('Copied CS Working Paper to clipboard!', 'success')
  }

  // Download PDF Report
  const handleDownloadPdf = () => {
    try {
      const doc = generateMgt14Pdf(calculationResult, {
        companyName: 'Corporate Compliance Client',
        professionalFirm: 'CorpLawUpdates Intelligence'
      })
      doc.save(`MGT-14-Fee-Report-${calculationResult.input.eventDate}.pdf`)
      showToast('Downloaded MGT-14 Compliance Report PDF!', 'success')
    } catch (err) {
      console.error('PDF error:', err)
      showToast('Could not generate PDF. Please try again.', 'error')
    }
  }

  // Share calculation
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MGT-14 Fee & Compliance Calculation',
        text: `MCA Form MGT-14 Total Portal Fee: ${formatInr(calculationResult.totalPortalFee)} (${calculationResult.statusBadge})`,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Calculation URL copied to clipboard!', 'info')
    }
  }

  // Mini AI Assistant Logic (Grounded purely in statutory rules)
  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return

    const q = aiQuestion.toLowerCase()
    let ans = ''

    if (q.includes('borrowing') || q.includes('179') || q.includes('private company')) {
      ans = 'Under MCA Exemption Notification G.S.R. 464(E) dated 5th June 2015, Private Limited Companies are EXEMPT from filing Form MGT-14 for Board Resolutions passed under Section 179(3) (such as routine borrowings, loans, or investments). Only Public Companies must file MGT-14 for Section 179(3) powers.'
    } else if (q.includes('300') || q.includes('condonation') || q.includes('delay')) {
      ans = `For Form MGT-14, where the event date exceeds 300 days from the filing date, direct MCA V3 filing is blocked. The company must file Form CG-1 for Condonation of Delay with the Regional Director, file the approval in Form INC-28, and cite the INC-28 SRN in MGT-14.`
    } else if (q.includes('ifsc') || q.includes('60 days')) {
      ans = 'Under MCA Notifications G.S.R. 8(E) and 9(E) dated 04.01.2017, IFSC Private and Public Companies are granted an extended statutory filing window of 60 calendar days from the date of the resolution (instead of 30 days for standard companies).'
    } else if (q.includes('multiple') || q.includes('two resolution') || q.includes('different date')) {
      ans = 'Multiple resolutions passed on different dates can be combined into a single Form MGT-14 ONLY if all event dates fall within the permissible filing window. If the dates span outside the window, separate MGT-14 filings are mandatory.'
    } else if (q.includes('446b') || q.includes('small company') || q.includes('startup')) {
      ans = 'Section 446B provides relief on ROC statutory adjudication penalties (50% reduction, capped at ₹1,00,000 for company and ₹25,000 for officer). It does NOT reduce the MCA portal Table A base fee or Table B additional filing fee.'
    } else {
      ans = `Based on your current inputs: For a nominal capital of ${formatInr(calculationResult.input.nominalShareCapital)}, the normal filing fee is ${formatInr(calculationResult.normalFee)}. Since the filing is delayed by ${calculationResult.delayDays} day(s), Table B prescribes a ${calculationResult.additionalFeeMultiplier}× multiplier (${formatInr(calculationResult.additionalFee)}), resulting in a Total MCA Portal Payable of ${formatInr(calculationResult.totalPortalFee)}.`
    }

    setAiAnswer(ans)
  }

  const selectedPurpose = MGT14_PURPOSES.find(p => p.id === purposeId)

  return (
    <div className="w-full space-y-8">
      {/* ─── WORKSPACE HEADER ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              MCA V3 Compliance Intelligence Workspace
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Form MGT-14 Filing Fee & Penalty Workspace
            </h2>
            <p className="mt-1 text-sm md:text-base text-slate-300 max-w-2xl">
              Deterministic calculation of Table A filing fee, Table B additional fee multipliers, Section 117(2) statutory penalties, IFSC 60-day deadlines, and 300-day condonation rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsProfessionalMode(!isProfessionalMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isProfessionalMode
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isProfessionalMode ? '✓ Professional Mode (All Fields)' : 'Switch to Professional Mode'}
            </button>
            <button
              onClick={handleCopyWorkingPaper}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Copy for Working Paper"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Working Paper
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
              title="Download PDF Report"
            >
              <Download className="w-3.5 h-3.5" />
              PDF Report
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="text-xs font-medium text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets (1-Click Real World Scenarios):
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 hover:border-indigo-400 text-slate-300 hover:text-white transition-all text-left"
              >
                <span className="font-semibold text-slate-200">{preset.label.split(':')[0]}:</span>
                <span className="text-slate-400 group-hover:text-slate-200">{preset.label.split(':')[1]}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-indigo-300 border border-slate-700">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MAIN TWO-COLUMN WORKSPACE: INPUTS VS RESULTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── LEFT COLUMN: INPUTS & PURPOSE ASSISTANT (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Smart Applicability / Purpose Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                1. Purpose & Statutory Applicability
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                Section 117(3)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Action / Transaction Triggering MGT-14:
                </label>
                <select
                  value={purposeId}
                  onChange={(e) => {
                    setPurposeId(e.target.value)
                    const p = MGT14_PURPOSES.find(item => item.id === e.target.value)
                    if (p) setEventType(p.category)
                  }}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {MGT14_PURPOSES.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sectionRef}] {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purpose Context & Applicability Alert */}
              {selectedPurpose && (
                <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                  !selectedPurpose.applicableToPrivate && (companyType === 'small_company' || companyType === 'opc' || companyType === 'startup')
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <div className="font-semibold mb-1 flex items-center justify-between">
                    <span>Statutory Authority: {selectedPurpose.sectionRef}</span>
                    <span className="capitalize px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
                      {selectedPurpose.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p>{selectedPurpose.explanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Core Calculator Parameters Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              2. Company Capital & Regulatory Parameters
            </h3>

            {/* Share Capital Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Company Has Share Capital?</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Companies without share capital pay flat ₹200 Table A fee</div>
              </div>
              <button
                type="button"
                onClick={() => setHasShareCapital(!hasShareCapital)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hasShareCapital ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hasShareCapital ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Nominal Share Capital Input */}
            {hasShareCapital && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    Nominal / Authorised Share Capital (₹)
                    <span title="MCA's MGT-14 Table A fee refers to nominal share capital." className="cursor-help text-slate-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </label>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {formatInr(nominalShareCapital)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={nominalShareCapital || ''}
                  onChange={(e) => setNominalShareCapital(Number(e.target.value))}
                  placeholder="e.g. 1000000"
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[100000, 500000, 1000000, 2500000, 5000000, 10000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNominalShareCapital(amt)}
                      className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition"
                    >
                      {formatInr(amt)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entity Classification (Section 446B Relief) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Entity Classification (Section 446B Relief Assessment):
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as Mgt14CompanyType)}
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="normal">Standard Corporate Entity (Public / Standard Private)</option>
                <option value="small_company">Small Company (Paid-up Cap ≤ ₹4 Cr & Turnover ≤ ₹40 Cr) [Sec 446B]</option>
                <option value="opc">One Person Company (OPC) [Sec 446B]</option>
                <option value="startup">DPIIT-Recognised Startup Company [Sec 446B]</option>
                <option value="producer">Producer Company [Sec 446B]</option>
              </select>
            </div>

            {/* IFSC Entity Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/50">
              <div>
                <div className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">Is this an IFSC Company?</div>
                <div className="text-xs text-indigo-700/80 dark:text-indigo-400">
                  GIFT City / IFSC entities get 60 calendar days window (MCA Notification GSR 8(E)/9(E))
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIfscCompany(!isIfscCompany)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isIfscCompany ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isIfscCompany ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Event Date vs Filing Date Timeline Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              3. Event Date vs Filing Date (Statutory Clock)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resolution / Agreement Date (Event Date):
                </label>
                <IndianDateInput
                  value={eventDate}
                  onChange={setEventDate}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Actual / Proposed Filing Date:
                </label>
                <IndianDateInput
                  value={filingDate}
                  onChange={setFilingDate}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Officers in default input (Professional Mode) */}
            {isProfessionalMode && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Number of Officers in Default (Directors / KMP):
                  </label>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{numOfficers} Officer(s)</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={numOfficers}
                  onChange={(e) => setNumOfficers(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Validation alert */}
            {validationError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Multiple Event Dates Toggle (Professional Mode) */}
            {isProfessionalMode && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setHasMultipleDates(!hasMultipleDates)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                >
                  {hasMultipleDates ? '− Hide Multi-Resolution Window Checker' : '+ Have multiple resolutions passed on different dates?'}
                </button>

                {hasMultipleDates && (
                  <div className="mt-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">MCA Combined-Filing Rule:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Under the MCA Form MGT-14 Instruction Kit, multiple resolutions can only be combined in a single MGT-14 if ALL event dates fall within the permissible filing window (30 days from each respective date). If resolution dates span outside the window, separate MGT-14 forms must be filed for each distinct date.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: RESULTS DASHBOARD (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Total Payable Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl border border-indigo-700/50">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-medium mb-1">
              <span>Total MCA V3 Portal Challan</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                calculationResult.filingStatus === 'on_time'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : calculationResult.filingStatus === 'condonation_required'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {calculationResult.statusBadge}
              </span>
            </div>

            <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
              {formatInr(calculationResult.totalPortalFee)}
            </div>

            {/* Breakdown table */}
            <div className="space-y-2 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Normal Filing Fee (Table A):</span>
                <span className="font-mono font-semibold text-white">{formatInr(calculationResult.normalFee)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Additional Fee Multiplier:</span>
                <span className="font-mono font-semibold text-white">
                  {calculationResult.additionalFeeMultiplier === 0 ? '0× (On Time)' : `${calculationResult.additionalFeeMultiplier}× Normal Fee`}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Additional Late Fee (Table B):</span>
                <span className="font-mono font-semibold text-amber-400">+{formatInr(calculationResult.additionalFee)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Statutory Deadline (Due Date):</span>
                <span className="font-mono text-white">{calculationResult.dueDate} ({calculationResult.filingWindowDays} days)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Filing Delay:</span>
                <span className={`font-mono font-bold ${calculationResult.delayDays > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {calculationResult.delayDays} Calendar Day(s)
                </span>
              </div>
            </div>

            {/* Action buttons inside card */}
            <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-indigo-800/60">
              <button
                onClick={handleCopyWorkingPaper}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-700/80 hover:bg-indigo-600 text-white transition border border-indigo-600"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Working
              </button>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* 300-Day Condonation Alert Warning */}
          {calculationResult.requiresCondonation && (
            <div className="rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 space-y-2 text-xs text-red-900 dark:text-red-200">
              <div className="font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Delay Exceeds 300 Days — Condonation of Delay Required
              </div>
              <p className="leading-relaxed">
                {calculationResult.condonationNote}
              </p>
              <div className="pt-2 border-t border-red-200 dark:border-red-900/60 flex items-center justify-between font-semibold">
                <span>Procedural Form: Form CG-1 → Form INC-28</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-200 dark:bg-red-900">Mandatory</span>
              </div>
            </div>
          )}

          {/* Separate Section 117(2) Statutory Penalty Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Section 117(2) Statutory Penalty Exposure
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                ROC Adjudication (Sec 454)
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Separate from the MCA portal filing fee. Levied by Registrar under Section 454 adjudication for delay.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Company Penalty Exposure:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {formatInr(calculationResult.totalCompanyPenalty)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Officer in Default (each):</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {formatInr(calculationResult.totalOfficerPenaltyPerPerson)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>All Officers ({calculationResult.input.numOfficersInDefault} persons):</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {formatInr(calculationResult.totalAllOfficersPenalty)}
                </span>
              </div>

              {calculationResult.is446BEligible && (
                <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex justify-between items-center">
                  <span>Section 446B Relief Applied (50% reduction):</span>
                  <span className="font-bold font-mono">Saved {formatInr(calculationResult.reliefAmountSaved)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
                <span>Total Statutory Penalty Liability:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 text-sm">
                  {formatInr(calculationResult.totalStatutoryPenaltyExposure)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation Steps Explainer Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              How Was This Calculated? (Formula Breakdown)
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {calculationResult.calculationSteps.map((step, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 leading-relaxed font-sans">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Mini Rule-Grounded AI Assistant */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-900/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                MGT-14 Statutory Filing Assistant
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ask statutory questions regarding MGT-14 filing periods, Section 179(3) exemptions, or condonation:
            </p>

            <form onSubmit={handleAskAi} className="space-y-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="e.g. Does a private company file MGT-14 for borrowing?"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                Ask Compliance Assistant
              </button>
            </form>

            {aiAnswer && (
              <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Answer:</div>
                <p>{aiAnswer}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── MANDATORY ATTACHMENTS CHECKLIST ─── */}
      {selectedPurpose && selectedPurpose.requiredAttachments.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Mandatory Attachments for {selectedPurpose.sectionRef} Filing ({selectedPurpose.label.split('-')[0]})
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              MCA V3 Form MGT-14 Kit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {selectedPurpose.requiredAttachments.map((att, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{att}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 9-STEP MCA V3 FILING GUIDE ─── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          How to File Form MGT-14 on MCA V3 Portal (Step-by-Step Practical Workflow)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 1: Draft Resolution</span>
            <p className="text-slate-600 dark:text-slate-300">Convene General Meeting / Board Meeting, pass qualifying Special Resolution with Explanatory Statement under Section 102.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 2: Check 30-Day Due Date</span>
            <p className="text-slate-600 dark:text-slate-300">Clock begins on day after resolution. Standard entities have 30 calendar days; IFSC entities have 60 calendar days.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 3: Prepare Attachments</span>
            <p className="text-slate-600 dark:text-slate-300">Convert Certified True Copy of resolution, altered MOA/AOA, and meeting notice into clean, bookmarked PDF documents.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 4: Login to MCA V3</span>
            <p className="text-slate-600 dark:text-slate-300">Login with registered Business User profile at mca.gov.in. Navigate to MCA Services → Company e-Filing → Form MGT-14.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 5: Fill e-Form Particulars</span>
            <p className="text-slate-600 dark:text-slate-300">Enter CIN, select Section 117 purpose code, enter resolution passing date, and attach the signed PDF annexures.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 6: Affix Digital Signatures</span>
            <p className="text-slate-600 dark:text-slate-300">Sign with Director / Managing Director DSC (DIN-registered) and certifying Professional DSC (CA / CS / CMA in practice).</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 7: Upload Form on MCA</span>
            <p className="text-slate-600 dark:text-slate-300">Upload the DSC-affixed e-Form. System validates data integrity and calculates Table A normal and Table B late fees.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 8: Pay Challan Online</span>
            <p className="text-slate-600 dark:text-slate-300">Generate e-Challan and pay via Net Banking, Credit Card, or NEFT. Note down the Service Request Number (SRN).</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Step 9: Track Approval & File Record</span>
            <p className="text-slate-600 dark:text-slate-300">Track SRN status on MCA. Once Approved, download the ROC filing receipt and store in the statutory company register.</p>
          </div>
        </div>
      </div>

      {/* ─── OFFICIAL LEGAL SOURCES PANEL ─── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Authoritative Legal Sources & Verification
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200">Companies Act, 2013 — Section 117</span>
            <p className="mt-0.5 text-[11px]">Primary statutory mandate governing registration of resolutions and agreements with the Registrar.</p>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200">Companies (Management and Administration) Rules, 2014 — Rule 24</span>
            <p className="mt-0.5 text-[11px]">Prescribes Form MGT-14 and the strict 30-day filing clock.</p>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200">Companies (Registration Offices and Fees) Rules, 2014 — Table A & Table B</span>
            <p className="mt-0.5 text-[11px]">Governs nominal capital normal fee slabs (₹200–₹600) and escalating delay multipliers (2×–12×).</p>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200">MCA Exemption Notification G.S.R. 464(E) dated 05.06.2015</span>
            <p className="mt-0.5 text-[11px]">Exempts Private Limited Companies from filing Section 179(3) routine Board Resolutions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
