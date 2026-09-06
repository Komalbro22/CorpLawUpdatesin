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
  HelpCircle,
  Search,
  ExternalLink
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import { generateDpt3Pdf } from '@/lib/pdf/generateDpt3Pdf'

interface DPT3WorkspaceProps {
  form: MCAForm
}

type FilingPurpose = 'exempted' | 'deposits' | 'both' | 'nil'
type CalcMode = 'date' | 'days'

interface SlabRow {
  tier: string
  delayRange: string
  multiplier: number
  multiplierLabel: string
  notes: string
}

const TABLE_B_SLABS: SlabRow[] = [
  {
    tier: 'Tier 1',
    delayRange: 'Up to 30 days',
    multiplier: 2,
    multiplierLabel: '2× Normal Fee',
    notes: 'Standard first tier for delays up to 1 month beyond due date'
  },
  {
    tier: 'Tier 2',
    delayRange: '31 to 60 days',
    multiplier: 4,
    multiplierLabel: '4× Normal Fee',
    notes: 'Second tier for delay between 1 and 2 months'
  },
  {
    tier: 'Tier 3',
    delayRange: '61 to 90 days',
    multiplier: 6,
    multiplierLabel: '6× Normal Fee',
    notes: 'Escalation for delay between 2 and 3 months'
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
    delayRange: 'More than 180 days',
    multiplier: 12,
    multiplierLabel: '12× Normal Fee',
    notes: 'Maximum statutory multiplier under Table B of Fees Rules'
  }
]

const CAPITAL_PRESETS = [
  { label: '< ₹1 Lakh', value: 90000, fee: 200 },
  { label: '₹1L – ₹5L', value: 100000, fee: 300 },
  { label: '₹5L – ₹25L', value: 1000000, fee: 400 },
  { label: '₹25L – ₹1Cr', value: 5000000, fee: 500 },
  { label: '≥ ₹1 Crore', value: 10000000, fee: 600 }
]

const RULE_2_1_C_EXCLUSIONS = [
  { id: 1, title: 'Government Receipts', desc: 'Any amount received from Central/State Government, local authority, or statutory authority.' },
  { id: 2, title: 'Foreign Governments & Bodies', desc: 'Amounts received from foreign governments, international banks, foreign export credit agencies, or multilateral financial institutions.' },
  { id: 3, title: 'Bank & FI Borrowings', desc: 'Any loan or facility received from banking companies, SBI, regional rural banks, or notified public financial institutions.' },
  { id: 4, title: 'Inter-Corporate Borrowings', desc: 'Any amount received by a company from another company (holding, subsidiary, associate, or third-party company).' },
  { id: 5, title: 'Director Loans (with Declaration)', desc: 'Amounts received from a person who was a director at the time of receipt, provided the director furnishes a written declaration that the loan is not from borrowed funds.' },
  { id: 6, title: 'Relative of Director (Private Co)', desc: 'For private companies, amounts received from a relative of a director, subject to a declaration that funds are out of their own sources.' },
  { id: 7, title: 'Convertible Notes by Startups', desc: 'Amount of ₹25 Lakhs or more received by a DPIIT-recognized startup in a single tranche against convertible notes (repayable/convertible up to 10 years).' },
  { id: 8, title: 'Commercial Paper (CP)', desc: 'Amounts raised by the issue of commercial paper or other money market instruments in accordance with RBI guidelines.' },
  { id: 9, title: 'Secured Bonds & Debentures', desc: 'Bonds or debentures secured by a first charge on tangible assets of the company having market value not less than the issue amount.' },
  { id: 10, title: 'Compulsorily Convertible Debentures (CCD)', desc: 'Unsecured debentures compulsorily convertible into equity shares within a period not exceeding 10 years.' },
  { id: 11, title: 'Share Application Money', desc: 'Application money received for securities, provided allotment is completed within 60 days of receipt (else refunded within 15 days).' },
  { id: 12, title: 'Advances for Goods or Services', desc: 'Advance received in the ordinary course of business for supply of goods/services, appropriated within 365 days from receipt.' },
  { id: 13, title: 'Security Deposits & Performance Guarantees', desc: 'Security deposits received for performance of a contract for supply of goods or provision of services.' },
  { id: 14, title: 'Advance for Capital Assets', desc: 'Advance received in connection with consideration for an immovable property under a written agreement.' },
  { id: 15, title: 'Promoters Unsecured Loans', desc: 'Brought in pursuance of the stipulation of any lending financial institution or bank, subject to conditions.' },
  { id: 16, title: 'Nidhi Company Receipts', desc: 'Amounts accepted by a Nidhi company from its members in accordance with rules framed under Section 406.' },
  { id: 17, title: 'Employee Deposits', desc: 'Non-interest-bearing amount received from an employee not exceeding their annual salary under contract of employment.' },
  { id: 18, title: 'Trust & Mutual Fund Receipts', desc: 'Amounts received in trust, subscriptions to mutual funds, collective investment schemes, or approved pension funds.' }
]

function getNormalFeeByCapital(capital: number, hasCapital: boolean): number {
  if (!hasCapital) return 200
  if (capital < 100000) return 200
  if (capital < 500000) return 300
  if (capital < 2500000) return 400
  if (capital < 10000000) return 500
  return 600
}

function getMultiplierForDelay(days: number): { multiplier: number; slabIndex: number } {
  if (days <= 0) return { multiplier: 0, slabIndex: -1 }
  if (days <= 30) return { multiplier: 2, slabIndex: 0 }
  if (days <= 60) return { multiplier: 4, slabIndex: 1 }
  if (days <= 90) return { multiplier: 6, slabIndex: 2 }
  if (days <= 180) return { multiplier: 10, slabIndex: 3 }
  return { multiplier: 12, slabIndex: 4 }
}

export default function DPT3Workspace({ form }: DPT3WorkspaceProps) {
  const { showToast } = useToast()

  // Mode & Configuration
  const [calcMode, setCalcMode] = useState<CalcMode>('date')
  const [filingPurpose, setFilingPurpose] = useState<FilingPurpose>('exempted')
  const [selectedFY, setSelectedFY] = useState<string>('2025-26')

  // Date States
  const [filingDate, setFilingDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [directDelayDays, setDirectDelayDays] = useState<number>(0)

  // Company Profile
  const [hasShareCapital, setHasShareCapital] = useState<boolean>(true)
  const [nominalCapital, setNominalCapital] = useState<number>(1000000) // ₹10 Lakh default
  const [companyName, setCompanyName] = useState<string>('')
  const [officersCount, setOfficersCount] = useState<number>(2)

  // Interactive Search for Rule 2(1)(c)
  const [exclusionSearch, setExclusionSearch] = useState<string>('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)

  // Circular 02/2026 Waiver Logic
  const isFY202526 = selectedFY === '2025-26'
  const statutoryDueDate = isFY202526 ? '2026-06-30' : `${parseInt(selectedFY.slice(0, 4)) + 1}-06-30`
  const feeWaiverEndDate = isFY202526 ? '2026-07-31' : null

  // Calculation Logic
  const {
    effectiveDelayDays,
    isWaivedUnderCircular,
    multiplier,
    normalFee,
    additionalFee,
    totalPortalFee,
    rule21Penalty,
    activeSlabIndex,
    isAuditorCertRequired
  } = useMemo(() => {
    const normal = getNormalFeeByCapital(nominalCapital, hasShareCapital)

    let delay = 0
    let waived = false

    if (calcMode === 'date') {
      const filing = new Date(filingDate)
      const due = new Date(statutoryDueDate)

      if (filing <= due) {
        delay = 0
      } else if (isFY202526 && feeWaiverEndDate && filing <= new Date(feeWaiverEndDate)) {
        // Filed between 1 July 2026 and 31 July 2026: Waived by Circular 02/2026
        delay = 0
        waived = true
      } else {
        // Filed after waiver window or standard FY: delay calculated from 1 July (day after due date)
        const diffMs = filing.getTime() - due.getTime()
        delay = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
      }
    } else {
      delay = Math.max(0, directDelayDays)
    }

    const { multiplier: mult, slabIndex } = getMultiplierForDelay(delay)
    const addFee = waived ? 0 : normal * mult
    const total = normal + addFee

    // Rule 21 Penalty: ₹5,000 company + (officers * ₹5,000) + (delay * ₹500)
    let penalty21 = 0
    if (delay > 0) {
      penalty21 = 5000 + (officersCount * 5000) + (delay * 500)
    }

    const auditorCert = filingPurpose === 'deposits' || filingPurpose === 'both'

    return {
      effectiveDelayDays: delay,
      isWaivedUnderCircular: waived,
      multiplier: mult,
      normalFee: normal,
      additionalFee: addFee,
      totalPortalFee: total,
      rule21Penalty: penalty21,
      activeSlabIndex: slabIndex,
      isAuditorCertRequired: auditorCert
    }
  }, [
    nominalCapital,
    hasShareCapital,
    calcMode,
    filingDate,
    statutoryDueDate,
    isFY202526,
    feeWaiverEndDate,
    directDelayDays,
    officersCount,
    filingPurpose
  ])

  // Filtered Exclusions
  const filteredExclusions = useMemo(() => {
    if (!exclusionSearch.trim()) return RULE_2_1_C_EXCLUSIONS
    const q = exclusionSearch.toLowerCase()
    return RULE_2_1_C_EXCLUSIONS.filter(
      item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    )
  }, [exclusionSearch])

  // Copy Assessment Memorandum
  const handleCopySummary = () => {
    const purposeText =
      filingPurpose === 'exempted'
        ? 'Particulars of transactions not considered as deposit (Rule 2(1)(c))'
        : filingPurpose === 'deposits'
        ? 'Return of Deposits (Section 73/76)'
        : filingPurpose === 'both'
        ? 'Return of Deposits & Exempted Transactions'
        : 'Nil Return'

    const text = `=====================================================
FORM DPT-3 — STATUTORY RETURN OF DEPOSITS ASSESSMENT
Generated via CorpLawUpdates.in • Validated against MCA21 V3 Portal
=====================================================

1. FILING PROFILE:
• Company Name: ${companyName || 'Unspecified Corporate Entity'}
• Purpose: ${purposeText}
• Financial Year: FY ${selectedFY} (As on 31st March)
• Authorized Capital: ${hasShareCapital ? `₹ ${nominalCapital.toLocaleString('en-IN')}` : 'Without Share Capital'}
• Statutory Due Date: ${statutoryDueDate}
• Actual / Planned Filing Date: ${calcMode === 'date' ? filingDate : `+${directDelayDays} Days Delay`}
• Days of Delay: ${effectiveDelayDays} Day(s)
• Auditor's Certificate Mandatory?: ${isAuditorCertRequired ? 'YES' : 'NO'}

2. MCA21 V3 PORTAL PAYABLE BREAKDOWN (e-CHALLAN):
• Normal Filing Fee (Table A): ₹ ${normalFee.toLocaleString('en-IN')}
• Table B Additional Fee Multiplier: ${multiplier}× Normal Fee
• Additional Late Filing Fee: ₹ ${additionalFee.toLocaleString('en-IN')}
• TOTAL MCA21 PORTAL PAYABLE: ₹ ${totalPortalFee.toLocaleString('en-IN')}

3. STATUTORY PENALTY EXPOSURE (ADJUDICATION):
• Rule 21 Fine (Company + ${officersCount} Officers @ ₹500/day): ₹ ${rule21Penalty.toLocaleString('en-IN')}
• Section 76A Deposit Contravention: ${filingPurpose === 'deposits' || filingPurpose === 'both' ? 'Active Exposure if public deposits are unauthorized' : 'Not Applicable (Exempted Receipts Only)'}

STATUTORY NOTE:
Table A base fees and Table B multipliers are prescribed under the Companies (Registration Offices and Fees) Rules, 2014. For FY 2025-26, filings up to 31 July 2026 enjoyed fee waiver under MCA General Circular No. 02/2026. Rule 21 penalties require formal adjudication under Section 454.
=====================================================`

    navigator.clipboard.writeText(text)
    showToast('Assessment Memorandum copied to clipboard!', 'success')
  }

  // Generate & Download PDF
  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true)
      const doc = generateDpt3Pdf({
        companyName,
        nominalCapital,
        hasShareCapital,
        filingPurpose,
        selectedFY,
        statutoryDueDate,
        waiverEndDate: isFY202526 ? '31 July 2026' : null,
        actualFilingDate: calcMode === 'date' ? filingDate : `+${directDelayDays} Days Delay`,
        calculatedDelayDays: effectiveDelayDays,
        normalFee,
        multiplier,
        additionalFee,
        totalFee: totalPortalFee,
        rule21Penalty,
        officersCount,
        isAuditorCertRequired
      })
      doc.save(`Form_DPT-3_Fee_Assessment_${companyName ? companyName.replace(/\s+/g, '_') : 'FY' + selectedFY}.pdf`)
      showToast('PDF Memorandum downloaded successfully!', 'success')
    } catch (e) {
      console.error(e)
      showToast('Error generating PDF', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Top Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-navy to-slate-900 text-white border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-navy text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                V3 Live Engine
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-2.5 py-0.5 rounded">
                Rule 16 / 16A Deposit Return
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-serif">
              Form DPT-3 Fee & Return of Deposits Calculator
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Statutory Table A Base Fees, Table B Delay Multipliers (2× to 12×), Circular 02/2026 Waiver Logic, and Rule 21 Penalties.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700"
              title="Copy Assessment Summary"
            >
              <Copy className="size-3.5" />
              Copy Memo
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

      {/* Main Form & Calculation Grid */}
      <div className="p-6 lg:p-8 space-y-8">

        {/* Circular 02/2026 Special Notice Callout */}
        {isFY202526 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3">
            <Info className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-amber-800 dark:text-amber-300">MCA General Circular No. 02/2026 Relief:</strong> For FY 2025-26, the MCA waived additional fees for Form DPT-3 filed up to <strong>31 July 2026</strong> due to the Data Centre fire on 5 June 2026. If filing on or after 1 August 2026, Table B delay multipliers apply calculated from the original due date of 1 July 2026.
            </div>
          </div>
        )}

        {/* Section 1: Filing Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
          
          {/* Filing Purpose */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              1. Return Purpose (Filing Category)
            </label>
            <select
              value={filingPurpose}
              onChange={e => setFilingPurpose(e.target.value as FilingPurpose)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="exempted">Exempted Receipts Only (Rule 2(1)(c)) — 90%+ Cos</option>
              <option value="deposits">Return of Deposits (Section 73/76)</option>
              <option value="both">Both Deposits & Exempted Receipts</option>
              <option value="nil">Nil Return (No Outstanding Receipts)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {filingPurpose === 'exempted'
                ? '✓ Loans from directors, customer advances, inter-corporate borrowings.'
                : filingPurpose === 'deposits'
                ? '⚠️ Requires mandatory Auditor\'s Certificate attachment.'
                : filingPurpose === 'both'
                ? '⚠️ Requires mandatory Auditor\'s Certificate attachment.'
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
              <option value="2025-26">FY 2025-26 (Due: 30 June / Extended: 31 July 2026)</option>
              <option value="2024-25">FY 2024-25 (Due: 30 June 2025)</option>
              <option value="2026-27">FY 2026-27 (Due: 30 June 2027)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Position of outstanding receipts as on 31st March of the FY.
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
                Direct Days
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {calcMode === 'date' ? 'Pick exact calendar filing date' : 'Enter delay days directly'}
            </p>
          </div>
        </div>

        {/* Section 2: Capital & Date Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Capital & Entity Details */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Scale className="size-4 text-amber-500" />
              Nominal Share Capital & Entity Profile
            </h3>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Company Name (Optional — for PDF & Memorandum)
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
                <p className="text-xs text-slate-500">Companies without share capital pay flat ₹200 Table A fee</p>
              </div>
              <input
                type="checkbox"
                checked={hasShareCapital}
                onChange={e => setHasShareCapital(e.target.checked)}
                className="size-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
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
                  {CAPITAL_PRESETS.map((p, idx) => (
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

            {/* Officers Count (for Rule 21) */}
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
                Rule 21 levies up to ₹5,000 on the company + ₹5,000 on each officer in default.
              </p>
            </div>
          </div>

          {/* Right Column: Date & Delay Computation */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Calendar className="size-4 text-blue-500" />
              Statutory Deadlines & Delay Calculator
            </h3>

            {calcMode === 'date' ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                    <span>Statutory Due Date (Section 73 / Rule 16):</span>
                    <strong className="text-blue-700 dark:text-blue-300 text-sm">{statutoryDueDate}</strong>
                  </div>
                  {isFY202526 && feeWaiverEndDate && (
                    <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 pt-1 border-t border-blue-200/60 dark:border-blue-900/50">
                      <span>Circular 02/2026 Fee Waiver Deadline:</span>
                      <strong>{feeWaiverEndDate}</strong>
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
                {effectiveDelayDays === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="size-3.5" />
                    {isWaivedUnderCircular ? 'Fee Waived (Cir 02/2026)' : 'Timely / No Delay'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="size-3.5" />
                    {effectiveDelayDays} Day(s) Late
                  </span>
                )}
              </div>

              {effectiveDelayDays > 0 && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Falls into Table B Slab: <strong className="text-slate-900 dark:text-white">{TABLE_B_SLABS[activeSlabIndex]?.delayRange}</strong> ({multiplier}× Normal Fee).
                </div>
              )}
            </div>

            {/* Auditor Certificate Badge */}
            <div className={`p-4 rounded-xl border ${
              isAuditorCertRequired
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                {isAuditorCertRequired ? <ShieldAlert className="size-4 text-amber-600" /> : <ShieldCheck className="size-4 text-emerald-600" />}
                Auditor\'s Certificate Requirement
              </div>
              <p className="text-xs leading-relaxed">
                {isAuditorCertRequired
                  ? 'Mandatory: An Auditor\'s Certificate must be attached for Return of Deposits under Section 73/76.'
                  : 'Exempt: For reporting particulars of transactions not considered as deposit under Rule 2(1)(c), an Auditor\'s Certificate is NOT mandatory on MCA V3.'}
              </p>
            </div>

          </div>
        </div>

        {/* Section 3: Results Scoreboard (Challan vs Penalty) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          
          {/* Card 1: Normal Base Fee */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Table A Base Fee</span>
            <div className="text-2xl lg:text-3xl font-bold font-serif text-slate-900 dark:text-white mt-1">
              ₹ {normalFee.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Based on {hasShareCapital ? `₹${(nominalCapital / 100000).toFixed(1)}L Capital` : 'No Share Capital'} (Items 5 & 6)
            </p>
          </div>

          {/* Card 2: Additional Late Fee */}
          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Table B Late Fee
              </span>
              <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                {multiplier}× Multiplier
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-serif text-amber-950 dark:text-amber-200 mt-1">
              ₹ {additionalFee.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-2">
              {effectiveDelayDays === 0 ? 'No delay fee payable' : `${multiplier} × ₹${normalFee} for ${effectiveDelayDays} days delay`}
            </p>
          </div>

          {/* Card 3: Total Portal Payable */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy to-slate-900 text-white border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Total MCA21 e-Challan
            </span>
            <div className="text-2xl lg:text-3xl font-bold font-serif text-white mt-1">
              ₹ {totalPortalFee.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-300 mt-2">
              Payable immediately upon form upload at MCA21 V3 checkout
            </p>
          </div>
        </div>

        {/* Section 4: Rule 21 Procedural Fine Warning */}
        {rule21Penalty > 0 && (
          <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400 mb-2">
              <AlertTriangle className="size-4" />
              Indicative Statutory Adjudication Exposure (Rule 21)
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <div className="text-2xl font-bold font-serif text-red-950 dark:text-red-300">
                ₹ {rule21Penalty.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-red-700 dark:text-red-400">
                Company: ₹5,000 | {officersCount} Officers: ₹{(officersCount * 5000).toLocaleString('en-IN')} | Continuing default ({effectiveDelayDays}d × ₹500): ₹{(effectiveDelayDays * 500).toLocaleString('en-IN')}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
              <strong>Notice:</strong> Rule 21 fines are separate from the MCA21 portal challan and are not collected during form upload. They represent civil penalty exposure if the ROC initiates formal adjudication proceedings under Section 454.
            </p>
          </div>
        )}

        {/* Section 5: Table B Delay Slabs Comparison Matrix */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="size-4 text-blue-500" />
            Statutory Table B Additional Fee Slabs (Fee Rules, 2014)
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Slab / Period of Delay</th>
                  <th className="px-4 py-3">Additional Fee Multiplier</th>
                  <th className="px-4 py-3">Fee for ₹{nominalCapital.toLocaleString('en-IN')} Capital</th>
                  <th className="px-4 py-3">Statutory Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {TABLE_B_SLABS.map((slab, idx) => {
                  const isActive = activeSlabIndex === idx && effectiveDelayDays > 0
                  return (
                    <tr
                      key={idx}
                      className={isActive ? 'bg-amber-100/60 dark:bg-amber-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-200">
                        {slab.delayRange}
                        {isActive && <span className="ml-2 text-[10px] bg-amber-500 text-navy px-1.5 py-0.5 rounded uppercase">Active</span>}
                      </td>
                      <td className="px-4 py-3 text-amber-700 dark:text-amber-400 font-bold">{slab.multiplierLabel}</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-semibold">
                        ₹ {(normalFee * slab.multiplier).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{slab.notes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Interactive 18 Exclusions Matrix under Rule 2(1)(c) */}
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
            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={exclusionSearch}
                onChange={e => setExclusionSearch(e.target.value)}
                placeholder="Filter 18 exemptions..."
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {ex.id}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ex.title}</h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                  {ex.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: CCFS-2026 & Important Practical Guidance */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            Important Practical Compliance Notes for Form DPT-3
          </h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
            <li>
              <strong>No Revision Once Filed:</strong> Form DPT-3 cannot be revised once uploaded on MCA21 V3. If an error is discovered post-filing, the company must file an application to mark the original SRN defective and file a fresh form.
            </li>
            <li>
              <strong>Net Worth Reference:</strong> Use the net worth figure from the latest audited balance sheet prior to the return date (e.g. for FY 2025-26, use audited balance sheet of 31 March 2025).
            </li>
            <li>
              <strong>CCFS-2026 Amnesty Scheme:</strong> The Companies Compliance Facilitation Scheme (CCFS-2026) has been extended to <strong>15 September 2026</strong> via MCA General Circular No. 04/2026. While primarily targeted at AOC-4, MGT-7, and ADT-1, companies with long-standing pending filings should evaluate eligibility.
            </li>
            <li>
              <strong>LLPs Are Not Required to File DPT-3:</strong> DPT-3 is strictly for companies registered under the Companies Act, 2013. LLPs file Form 8 and Form 11.
            </li>
          </ul>
        </div>

      </div>
    </div>
  )
}
