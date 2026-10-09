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
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserX,
  FileCheck,
  Briefcase,
  HelpCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import IndianDateInput from '@/components/shared/IndianDateInput'

interface DIR12WorkspaceProps {
  form: MCAForm
}

type EventType = 'appointment' | 'resignation' | 'regularization' | 'kmp'
type CalcMode = 'date' | 'days'

interface SlabRow {
  tier: string
  delayRange: string
  multiplier: number
  multiplierLabel: string
  notes: string
  isCondonation?: boolean
}

const TABLE_B_SLABS_DIR12: SlabRow[] = [
  {
    tier: 'Tier 1',
    delayRange: 'Up to 30 days',
    multiplier: 2,
    multiplierLabel: '2× Normal Fee',
    notes: 'Delay up to 1 month beyond the statutory 30-day window'
  },
  {
    tier: 'Tier 2',
    delayRange: '31 to 60 days',
    multiplier: 4,
    multiplierLabel: '4× Normal Fee',
    notes: 'Delay between 1 and 2 months beyond statutory due date'
  },
  {
    tier: 'Tier 3',
    delayRange: '61 to 90 days',
    multiplier: 6,
    multiplierLabel: '6× Normal Fee',
    notes: 'Delay between 2 and 3 months beyond statutory due date'
  },
  {
    tier: 'Tier 4',
    delayRange: '91 to 180 days',
    multiplier: 10,
    multiplierLabel: '10× Normal Fee',
    notes: 'Major delay between 3 and 6 months'
  },
  {
    tier: 'Tier 5',
    delayRange: '181 to 270 days',
    multiplier: 12,
    multiplierLabel: '12× Normal Fee',
    notes: 'Maximum statutory multiplier under Table B'
  },
  {
    tier: 'Beyond 270d',
    delayRange: 'More than 270 days',
    multiplier: 12,
    multiplierLabel: '12× + Condonation',
    notes: 'Section 403 second proviso: Prior Condonation from RD / Central Govt required via Form CG-1',
    isCondonation: true
  }
]

const CAPITAL_PRESETS = [
  { label: '< ₹1 Lakh', value: 90000, fee: 200 },
  { label: '₹1L – ₹5L', value: 100000, fee: 300 },
  { label: '₹5L – ₹25L', value: 1000000, fee: 400 },
  { label: '₹25L – ₹1Cr', value: 5000000, fee: 500 },
  { label: '≥ ₹1 Crore', value: 10000000, fee: 600 }
]

function getNormalFee(capital: number): number {
  if (capital < 100000) return 200
  if (capital < 500000) return 300
  if (capital < 2500000) return 400
  if (capital < 10000000) return 500
  return 600
}

function getDelayMultiplier(delayDays: number): number {
  if (delayDays <= 0) return 0
  if (delayDays <= 30) return 2
  if (delayDays <= 60) return 4
  if (delayDays <= 90) return 6
  if (delayDays <= 180) return 10
  return 12
}

export default function DIR12Workspace({ form }: DIR12WorkspaceProps) {
  const { showToast } = useToast()

  // State
  const [eventType, setEventType] = useState<EventType>('appointment')
  const [calcMode, setCalcMode] = useState<CalcMode>('date')
  const [capital, setCapital] = useState<number>(1000000) // ₹10 Lakh default
  const [customCapital, setCustomCapital] = useState<string>('10,00,000')

  // Date mode
  const [eventDate, setEventDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 20)
    return d.toISOString().split('T')[0]
  })
  const [filingDate, setFilingDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Days mode
  const [manualDelayDays, setManualDelayDays] = useState<number>(0)

  // Calculations
  const statutoryDueDate = useMemo(() => {
    if (!eventDate) return null
    const ev = new Date(eventDate)
    if (isNaN(ev.getTime())) return null
    const due = new Date(ev)
    due.setDate(due.getDate() + 30)
    return due
  }, [eventDate])

  const calculatedDelayDays = useMemo(() => {
    if (calcMode === 'days') return Math.max(0, manualDelayDays)
    if (!statutoryDueDate || !filingDate) return 0
    const f = new Date(filingDate)
    if (isNaN(f.getTime())) return 0
    const diffTime = f.getTime() - statutoryDueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }, [calcMode, manualDelayDays, statutoryDueDate, filingDate])

  const normalFee = useMemo(() => getNormalFee(capital), [capital])
  const multiplier = useMemo(() => getDelayMultiplier(calculatedDelayDays), [calculatedDelayDays])
  const lateFee = useMemo(() => normalFee * multiplier, [normalFee, multiplier])
  const totalPayable = useMemo(() => normalFee + lateFee, [normalFee, lateFee])
  const isCondonationRequired = calculatedDelayDays > 270

  const handleCopyBreakdown = () => {
    const text = `Form DIR-12 Fee Breakdown:
Event Type: ${eventType.toUpperCase()}
Nominal Capital: ₹${capital.toLocaleString('en-IN')}
Statutory Deadline: Strictly 30 days from event
Calculated Delay: ${calculatedDelayDays} days
Normal Base Fee: ₹${normalFee}
Table B Late Multiplier: ${multiplier}x (₹${lateFee})
Total MCA Portal Payable: ₹${totalPayable}
${isCondonationRequired ? 'WARNING: Delay exceeds 270 days. Section 403 second proviso applies: Prior Condonation of Delay from RD required via Form CG-1.' : ''}
Calculated via CorpLawUpdates.in`

    navigator.clipboard.writeText(text)
    showToast('Fee breakdown copied to clipboard!', 'success')
  }

  return (
    <div className="space-y-8">
      {/* Princeton GEO Direct Answer Block */}
      <section className="rounded-2xl border-2 border-emerald-600/30 bg-linear-to-r from-emerald-50/70 via-white to-blue-50/50 p-6 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 hidden sm:block">
            <Scale className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-sm border border-emerald-300">
                Direct Statutory Answer
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Sections 168 & 170, Companies Act, 2013 | Rule 17, Directors Rules, 2014
              </span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
              Form DIR-12 Due Date, Late Fees & Resignation Fee Rules
            </h2>
            <div className="mt-3 text-slate-700 text-sm sm:text-base leading-relaxed space-y-2">
              <p>
                <strong>What is the statutory due date?</strong> Form DIR-12 must be filed with the ROC strictly{' '}
                <strong className="text-slate-950 font-bold">within 30 calendar days</strong> from the effective date of appointment, cessation/resignation, or designation change of a Director or KMP.
              </p>
              <p>
                <strong>Does Form DIR-12 have a ₹100/day penalty?</strong> <span className="text-rose-700 font-bold">NO.</span> The ₹100 per day penalty applies exclusively to annual financial statements (AOC-4) and annual returns (MGT-7). Form DIR-12 is an event-based form governed by <strong className="text-slate-950 font-semibold">Table B late fee multipliers (2× to 12× normal base fee)</strong>.
              </p>
              <p>
                <strong>What is the fee for director resignation?</strong> The government fee for filing a director resignation in Form DIR-12 is <strong className="text-slate-950 font-semibold">identical to appointment fees</strong> (governed by Table A based on Authorized Share Capital: ₹200 to ₹600). If filed within 30 days of the effective resignation date, <strong className="text-emerald-700 font-bold">zero late fee</strong> applies.
              </p>
              <p>
                <strong>DIR-11 vs DIR-12:</strong> Form DIR-12 is filed by the <strong className="text-slate-900 font-semibold">company</strong> to update MCA records (mandatory). Form DIR-11 is filed by the <strong className="text-slate-900 font-semibold">resigning director</strong> individually (optional under Rule 16) to ensure legal proof of resignation if the company delays filing DIR-12.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Deadline:</strong> Within 30 days of event</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Late Fee:</strong> Table B (2× to 12× base fee)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Approval Mode:</strong> STP / Non-STP on MCA V3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/80 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-sm border border-blue-200">
                Interactive Calculator
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Form DIR-12 Fee & Multiplier Calculator (FY 2026-27)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Calculate MCA V3 filing fees, Table B late escalation multipliers, and statutory deadlines for appointment, resignation, and regularization.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalcMode('date')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  calcMode === 'date'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Date-Based Mode
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('days')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  calcMode === 'days'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Direct Days Mode
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Step 1: Corporate Event Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Step 1: Select Corporate Trigger Event
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setEventType('appointment')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  eventType === 'appointment'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${eventType === 'appointment' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Appointment</div>
                  <div className="text-xs text-slate-500 mt-0.5">Additional / Regular / Nominee Director</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEventType('resignation')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  eventType === 'resignation'
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${eventType === 'resignation' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Resignation / Cessation</div>
                  <div className="text-xs text-slate-500 mt-0.5">Director Resignation or Vacation (Sec 168)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEventType('regularization')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  eventType === 'regularization'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${eventType === 'regularization' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Regularization at AGM</div>
                  <div className="text-xs text-slate-500 mt-0.5">Change from Additional to Regular Director</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEventType('kmp')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  eventType === 'kmp'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${eventType === 'kmp' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">KMP Appointment / Change</div>
                  <div className="text-xs text-slate-500 mt-0.5">MD, CEO, CFO, or CS (Sec 203)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Nominal Share Capital (Table A Base Fee) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Step 2: Authorized Nominal Share Capital (Table A Item 5 & 6)
              </label>
              <span className="text-xs text-slate-500">
                Current Normal Base Fee: <strong className="text-slate-900 font-bold">₹{normalFee}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {CAPITAL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setCapital(preset.value)
                    setCustomCapital(preset.value.toLocaleString('en-IN'))
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    capital === preset.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {preset.label} ({preset.fee === 200 ? '₹200' : `₹${preset.fee}`})
                </button>
              ))}
            </div>

            <div className="max-w-xs">
              <div className="relative rounded-lg shadow-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="text"
                  value={customCapital}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '')
                    const val = Number(raw) || 0
                    setCapital(val)
                    setCustomCapital(val ? val.toLocaleString('en-IN') : '')
                  }}
                  placeholder="e.g. 10,00,000"
                  className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Dates or Days */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Step 3: {calcMode === 'date' ? 'Effective Event Date & Proposed Filing Date' : 'Days of Delay Beyond 30 Days'}
            </label>

            {calcMode === 'date' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Effective Date of {eventType === 'resignation' ? 'Resignation' : 'Appointment / Change'}
                  </label>
                  <IndianDateInput
                    value={eventDate}
                    onChange={setEventDate}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                  {statutoryDueDate && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Statutory 30-Day Deadline:{' '}
                      <strong className="text-slate-800">
                        {statutoryDueDate.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Proposed / Actual Filing Date
                  </label>
                  <IndianDateInput
                    value={filingDate}
                    onChange={setFilingDate}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {calculatedDelayDays === 0 ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Within statutory 30-day window (NIL late fee)
                      </span>
                    ) : (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Delayed by {calculatedDelayDays} day{calculatedDelayDays > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-xs">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={manualDelayDays}
                  onChange={(e) => setManualDelayDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  placeholder="Enter days of delay (e.g. 15)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Delay is measured beyond the 30-day statutory window.
                </p>
              </div>
            )}
          </div>

          {/* Results Summary Box */}
          <div className="mt-6 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white p-5 sm:p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-700 gap-3">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  MCA V3 Fee Assessment
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Total Government Fee Payable
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {calculatedDelayDays === 0
                    ? 'Normal base fee only (No late fee)'
                    : `Base fee ₹${normalFee} + Late fee ₹${lateFee}`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block">Normal Base Fee:</span>
                <span className="text-base font-bold text-white font-mono">₹{normalFee}</span>
                <span className="text-[11px] text-slate-400 block">Table A Item 5/6</span>
              </div>
              <div>
                <span className="text-slate-400 block">Days Delayed:</span>
                <span className={`text-base font-bold font-mono ${calculatedDelayDays > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {calculatedDelayDays} days
                </span>
                <span className="text-[11px] text-slate-400 block">Beyond 30-day deadline</span>
              </div>
              <div>
                <span className="text-slate-400 block">Table B Multiplier:</span>
                <span className={`text-base font-bold font-mono ${multiplier > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {multiplier === 0 ? 'NIL (0x)' : `${multiplier}× base fee`}
                </span>
                <span className="text-[11px] text-slate-400 block">Rule 12 Table B</span>
              </div>
              <div>
                <span className="text-slate-400 block">Additional Late Fee:</span>
                <span className={`text-base font-bold font-mono ${lateFee > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{lateFee.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 block">Payable at checkout</span>
              </div>
            </div>

            {/* Condonation Warning if delay > 270 days */}
            {isCondonationRequired && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-white">Section 403 Hard Stop: Prior Condonation Required!</strong>
                    <p className="mt-0.5">
                      Because the delay exceeds 270 days (over 300 days from event date), direct checkout on MCA V3 is blocked. The company must file <strong className="text-white">Form CG-1</strong> with the Regional Director (RD) under Section 460 to seek Condonation of Delay before filing the belated Form DIR-12.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Event: <strong className="text-slate-200 uppercase">{eventType}</strong> | Capital: <strong className="text-slate-200">₹{capital.toLocaleString('en-IN')}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyBreakdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Assessment
              </button>
            </div>
          </div>

          {/* Table B Slabs Breakdown */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Table B Late Multiplier Schedule for Form DIR-12
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tier</th>
                    <th className="py-2.5 px-3">Delay Beyond 30 Days</th>
                    <th className="py-2.5 px-3">Late Multiplier</th>
                    <th className="py-2.5 px-3">Late Fee for ₹{capital.toLocaleString('en-IN')} Cap</th>
                    <th className="py-2.5 px-3">Total Payable</th>
                    <th className="py-2.5 px-3">Statutory Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className={calculatedDelayDays === 0 ? 'bg-emerald-50/70 font-semibold' : ''}>
                    <td className="py-2 px-3 text-emerald-800 font-bold">On-Time</td>
                    <td className="py-2 px-3">Within 30 calendar days</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">NIL (0x)</td>
                    <td className="py-2 px-3 font-mono">₹0</td>
                    <td className="py-2 px-3 font-mono font-bold">₹{normalFee}</td>
                    <td className="py-2 px-3 text-slate-500">Sec 168 / 170 compliance</td>
                  </tr>
                  {TABLE_B_SLABS_DIR12.map((slab) => {
                    const slabFee = normalFee * slab.multiplier
                    const slabTotal = normalFee + slabFee
                    let isCurrent = false
                    if (slab.tier === 'Tier 1' && calculatedDelayDays > 0 && calculatedDelayDays <= 30) isCurrent = true
                    if (slab.tier === 'Tier 2' && calculatedDelayDays > 30 && calculatedDelayDays <= 60) isCurrent = true
                    if (slab.tier === 'Tier 3' && calculatedDelayDays > 60 && calculatedDelayDays <= 90) isCurrent = true
                    if (slab.tier === 'Tier 4' && calculatedDelayDays > 90 && calculatedDelayDays <= 180) isCurrent = true
                    if (slab.tier === 'Tier 5' && calculatedDelayDays > 180 && calculatedDelayDays <= 270) isCurrent = true
                    if (slab.tier === 'Beyond 270d' && calculatedDelayDays > 270) isCurrent = true

                    return (
                      <tr key={slab.tier} className={isCurrent ? 'bg-amber-50/80 font-semibold ring-1 ring-amber-400' : 'hover:bg-slate-50'}>
                        <td className="py-2 px-3 font-medium text-slate-900">{slab.tier}</td>
                        <td className="py-2 px-3">{slab.delayRange}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{slab.multiplierLabel}</td>
                        <td className="py-2 px-3 font-mono">₹{slabFee.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">₹{slabTotal.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-slate-500">{slab.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Mandatory Attachments Checklist */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Mandatory Attachments Checklist on MCA V3: {eventType.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Ensure all statutory attachments are signed, dated, and converted into clean PDF format prior to uploading Form DIR-12:
            </p>

            {eventType === 'appointment' && (
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">1. Form DIR-2 (Consent to Act as Director):</strong> Written consent in terms of Section 152(5) and Rule 8 of Directors Rules, 2014, signed by the appointee.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2. Form DIR-8 (Intimation of Non-Disqualification):</strong> Declaration under Section 164(2) confirming the director is not disqualified in any other company.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">3. Certified True Copy of Board Resolution:</strong> Duly signed board resolution authorizing the appointment (under Section 161(1) for Additional Director).
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">4. Form MBP-1 (Disclosure of Interest):</strong> Notice of disclosure of interest in other entities under Section 184(1).
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">5. Letter of Appointment & KYC Proofs:</strong> Copy of formal appointment letter with terms, PAN card copy, and residential address proof.
                  </div>
                </li>
              </ul>
            )}

            {eventType === 'resignation' && (
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">1. Formal Resignation Letter (Notice under Section 168):</strong> Duly signed resignation letter submitted by the director specifying the effective date and reasons.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2. Certified True Copy of Board Resolution:</strong> Resolution or board minutes taking formal note of the resignation and authorizing filing with the ROC.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">3. Proof of Dispatch / Delivery:</strong> Speed post receipt, email delivery confirmation, or hand acknowledgment proving the date of resignation receipt.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Optional Form DIR-11 (By Resigning Director):</strong> The director may independently file Form DIR-11 within 30 days along with their resignation letter for personal protection.
                  </div>
                </li>
              </ul>
            )}

            {eventType === 'regularization' && (
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">1. Certified True Copy of AGM Ordinary Resolution:</strong> Ordinary Resolution passed by shareholders regularizing the Additional Director under Section 152.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2. Explanatory Statement under Section 102:</strong> Copy of the notice of AGM containing the explanatory statement detailing the director's profile.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">3. Form DIR-2 & DIR-8 Re-Confirmation:</strong> Fresh consent and declaration confirming ongoing non-disqualification.
                  </div>
                </li>
              </ul>
            )}

            {eventType === 'kmp' && (
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">1. Board Resolution under Section 203:</strong> Board resolution approving appointment and terms of remuneration of MD, CEO, CFO, or CS.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2. Form MGT-14 Copy (if applicable):</strong> SR or BR passed for appointment of MD/WTD requires filing Form MGT-14 within 30 days.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">3. Employment Agreement / Service Contract:</strong> Detailed employment contract specifying duties, powers, and compensation terms.
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
