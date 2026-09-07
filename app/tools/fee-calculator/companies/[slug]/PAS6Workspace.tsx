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
  Layers,
  PieChart,
  Check
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculatePas6Compliance,
  HalfYearPeriod,
  CompanyClassification,
  PAS6_DELAY_SLABS,
  formatInr
} from '@/lib/rule-engine/pas6-engine'
import { generatePas6Pdf } from '@/lib/pdf/generatePas6Pdf'

interface PresetConfig {
  id: string
  label: string
  reportingYear: number
  period: HalfYearPeriod
  filingDate: string
  authorizedCapital: number
  companyType: CompanyClassification
  officers: number
  issuedShares: number
  cdsl: number
  nsdl: number
  physical: number
  description: string
  badge: string
}

const PRESETS: PresetConfig[] = [
  {
    id: 'timely_public',
    label: 'Timely Unlisted Public (₹1 Cr)',
    reportingYear: 2026,
    period: 'apr_sep',
    filingDate: '2026-11-20',
    authorizedCapital: 10000000,
    companyType: 'unlisted_public',
    officers: 3,
    issuedShares: 1000000,
    cdsl: 500000,
    nsdl: 500000,
    physical: 0,
    description: '100% dematerialised unlisted public company filing Form PAS-6 within the 60-day window.',
    badge: 'On Time'
  },
  {
    id: 'delayed_pvt',
    label: 'Delayed Non-Small Pvt (45d Late)',
    reportingYear: 2026,
    period: 'apr_sep',
    filingDate: '2027-01-13',
    authorizedCapital: 2500000,
    companyType: 'non_small_private',
    officers: 2,
    issuedShares: 250000,
    cdsl: 100000,
    nsdl: 100000,
    physical: 50000,
    description: 'Private company crossing thresholds, filing 45 days late with 4x Table B multiplier fee.',
    badge: '4x Late Fee'
  },
  {
    id: 'severe_default',
    label: 'Severe Default (200d Delay)',
    reportingYear: 2025,
    period: 'oct_mar',
    filingDate: '2026-12-16',
    authorizedCapital: 10000000,
    companyType: 'non_small_private',
    officers: 2,
    issuedShares: 1000000,
    cdsl: 400000,
    nsdl: 300000,
    physical: 300000,
    description: 'Beyond 180 days delay attracting 12x maximum Table B multiplier and statutory Sec 450 exposure.',
    badge: '12x Max Surcharge'
  },
  {
    id: 'startup_concession',
    label: 'DPIIT Startup (Sec 446B)',
    reportingYear: 2026,
    period: 'apr_sep',
    filingDate: '2027-01-20',
    authorizedCapital: 1000000,
    companyType: 'startup',
    officers: 2,
    issuedShares: 100000,
    cdsl: 50000,
    nsdl: 40000,
    physical: 10000,
    description: 'DPIIT recognized entity benefiting from 50% Section 446B civil penalty relief.',
    badge: '50% Concession'
  },
  {
    id: 'holding_sub',
    label: 'Holding / Subsidiary (Mandatory)',
    reportingYear: 2026,
    period: 'apr_sep',
    filingDate: '2026-11-28',
    authorizedCapital: 5000000,
    companyType: 'holding_subsidiary',
    officers: 3,
    issuedShares: 500000,
    cdsl: 250000,
    nsdl: 200000,
    physical: 50000,
    description: 'Private holding/subsidiary disqualified from small company status under Section 2(85) proviso.',
    badge: 'Mandatory Demat'
  },
  {
    id: 'mismatch_audit',
    label: 'Reconciliation Discrepancy Alert',
    reportingYear: 2026,
    period: 'apr_sep',
    filingDate: '2026-11-25',
    authorizedCapital: 2000000,
    companyType: 'non_small_private',
    officers: 2,
    issuedShares: 200000,
    cdsl: 80000,
    nsdl: 70000,
    physical: 30000, // Sum = 180,000 -> 20,000 mismatch!
    description: 'Flagging discrepancy where depository and physical holdings do not match issued capital.',
    badge: 'Demat Mismatch'
  }
]

export default function PAS6Workspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Interactive Form State
  const [reportingYear, setReportingYear] = useState<number>(2026)
  const [period, setPeriod] = useState<HalfYearPeriod>('apr_sep')
  const [filingDate, setFilingDate] = useState<string>('2026-11-20')
  const [authorizedCapital, setAuthorizedCapital] = useState<number>(10000000)
  const [companyType, setCompanyType] = useState<CompanyClassification>('unlisted_public')
  const [numberOfOfficers, setNumberOfOfficers] = useState<number>(2)
  const [isDpiitStartup, setIsDpiitStartup] = useState<boolean>(false)

  // Share capital reconciliation
  const [issuedShares, setIssuedShares] = useState<number>(1000000)
  const [cdslShares, setCdslShares] = useState<number>(500000)
  const [nsdlShares, setNsdlShares] = useState<number>(500000)
  const [physicalShares, setPhysicalShares] = useState<number>(0)

  // Optional Meta
  const [companyName, setCompanyName] = useState<string>('')
  const [cin, setCin] = useState<string>('')
  const [isin, setIsin] = useState<string>('')

  // Calculate live results
  const result = useMemo(() => {
    return calculatePas6Compliance({
      reportingYear,
      period,
      filingDate,
      authorizedCapital,
      issuedSharesCount: issuedShares,
      cdslDematShares: cdslShares,
      nsdlDematShares: nsdlShares,
      physicalShares,
      numberOfOfficers,
      companyType,
      isDpiitStartup
    })
  }, [
    reportingYear,
    period,
    filingDate,
    authorizedCapital,
    issuedShares,
    cdslShares,
    nsdlShares,
    physicalShares,
    numberOfOfficers,
    companyType,
    isDpiitStartup
  ])

  // Apply Preset
  const handleApplyPreset = (preset: PresetConfig) => {
    setReportingYear(preset.reportingYear)
    setPeriod(preset.period)
    setFilingDate(preset.filingDate)
    setAuthorizedCapital(preset.authorizedCapital)
    setCompanyType(preset.companyType)
    setNumberOfOfficers(preset.officers)
    setIssuedShares(preset.issuedShares)
    setCdslShares(preset.cdsl)
    setNsdlShares(preset.nsdl)
    setPhysicalShares(preset.physical)
    setIsDpiitStartup(preset.companyType === 'startup')
    showToast(`Preset applied: ${preset.label}`, 'info')
  }

  // Quick delay adjustments
  const handleSetDelayDays = (extraDays: number) => {
    const due = new Date(result.statutoryDueDate + 'T00:00:00Z')
    due.setDate(due.getDate() + extraDays)
    const newDateStr = due.toISOString().split('T')[0]
    setFilingDate(newDateStr)
  }

  // PDF Export
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const doc = generatePas6Pdf(result, {
        companyName: companyName || undefined,
        cin: cin || undefined,
        isin: isin || undefined
      })
      const filename = `PAS6_Audit_Estimate_${result.period}_${result.reportingYear}.pdf`
      doc.save(filename)
      showToast('PAS-6 audit PDF downloaded successfully!', 'success')
    } catch (err) {
      console.error('Failed to generate PAS-6 PDF', err)
      showToast('Failed to generate PDF. Please try again.', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Copy Summary
  const handleCopySummary = () => {
    const text = `
FORM PAS-6 SHARE CAPITAL RECONCILIATION AUDIT — CorpLawUpdates.in
Reporting Period: ${result.periodLabel}
Statutory Due Date: ${result.statutoryDueDate}
Filing Date: ${result.filingDate} (${result.isDelay ? `${result.daysOfDelay} Days Delay` : 'On Time'})
Authorised Capital: ${formatInr(result.authorizedCapital || authorizedCapital)}

CAPITAL RECONCILIATION:
- Issued Shares: ${result.reconciliation.issuedShares.toLocaleString('en-IN')}
- Demat with CDSL: ${result.reconciliation.cdslShares.toLocaleString('en-IN')}
- Demat with NSDL: ${result.reconciliation.nsdlShares.toLocaleString('en-IN')}
- Physical Shares: ${result.reconciliation.physicalShares.toLocaleString('en-IN')} (${result.reconciliation.physicalPercentage}%)
- Reconciliation Status: ${result.reconciliation.hasMismatch ? `MISMATCH of ${Math.abs(result.reconciliation.difference)} shares` : '100% Reconciled'}

FINANCIAL OUTLAY:
- Normal MCA Fee: ${formatInr(result.normalFee)}
- Additional Late Fee: ${formatInr(result.additionalFee)} (${result.lateMultiplier}x Multiplier)
- Total MCA21 e-Challan: ${formatInr(result.totalMcaFee)}
- Section 450 Company Adjudication: ${formatInr(result.companyAdjudicationPenalty)}
- Section 450 Officers Penalty (${result.numberOfOfficers} officers): ${formatInr(result.totalOfficerPenalty)}
TOTAL STATUTORY EXPOSURE: ${formatInr(result.totalStatutoryExposure)}
Generated via: https://www.corplawupdates.in/tools/fee-calculator/companies/pas-6
    `.trim()

    navigator.clipboard.writeText(text)
    showToast('PAS-6 calculation summary copied to clipboard!', 'success')
  }

  const capitalButtons = [
    { label: '₹1L', value: 100000 },
    { label: '₹10L', value: 1000000 },
    { label: '₹25L', value: 2500000 },
    { label: '₹1 Cr', value: 10000000, isHighlight: true },
    { label: '₹5 Cr', value: 50000000 },
    { label: '₹10 Cr', value: 100000000 }
  ]

  return (
    <div id="pas6-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
              <Sparkles className="size-3.5 text-indigo-400" />
              MCA V3 Share Capital Demat Engine | 2026-27 Edition
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2 text-white">
              Form PAS-6 Fee &amp; Late Penalty Calculator
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Calculate half-yearly Reconciliation of Share Capital fees, Table B late multipliers (2× to 12×), and Section 450 civil adjudication liability under Rule 9A and Rule 9B.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
              title="Copy Summary"
            >
              <Copy className="size-4 text-slate-300" />
              <span className="hidden sm:inline">Copy</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md disabled:opacity-50"
              title="Download PDF Summary"
            >
              <Download className="size-4" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-colors"
              title="Print Calculation"
            >
              <Printer className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Presets */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Statutory Filing Scenario
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">6 statutory presets</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-sm transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {p.badge}
                </span>
              </div>
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                {p.label}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building2 className="size-4 text-indigo-500" />
              Filing Period & Corporate Profile
            </h2>

            {/* Half-Year Period & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Reporting Half-Year (Rule 9A(8))
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPeriod('apr_sep')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      period === 'apr_sep'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    1 Apr – 30 Sep (H1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('oct_mar')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      period === 'oct_mar'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    1 Oct – 31 Mar (H2)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Financial Year
                </label>
                <select
                  value={reportingYear}
                  onChange={(e) => setReportingYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={2026}>FY 2026-27 (Current Filing Cycle)</option>
                  <option value={2025}>FY 2025-26 (Rule 9B Expansion Year)</option>
                  <option value={2024}>FY 2024-25</option>
                  <option value={2023}>FY 2023-24</option>
                </select>
              </div>
            </div>

            {/* Statutory Due Date Banner */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="size-4 text-indigo-500 shrink-0" />
                <span>
                  Statutory Due Date (60 days):{' '}
                  <strong className="text-slate-900 dark:text-white">{result.statutoryDueDate}</strong>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                STP Auto-Approved
              </span>
            </div>

            {/* Filing Date & Delay Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Actual / Projected Filing Date
              </label>
              <input
                type="date"
                value={filingDate}
                onChange={(e) => setFilingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSetDelayDays(0)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  On Time (0d)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDelayDays(15)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  +15d (2×)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDelayDays(45)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  +45d (4×)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDelayDays(75)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  +75d (6×)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDelayDays(120)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  +120d (10×)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDelayDays(200)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  +200d (12×)
                </button>
              </div>
            </div>

            {/* Entity Classification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Company Legal Classification
              </label>
              <select
                value={companyType}
                onChange={(e) => {
                  const val = e.target.value as CompanyClassification
                  setCompanyType(val)
                  setIsDpiitStartup(val === 'startup')
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="unlisted_public">Unlisted Public Company (Rule 9A Mandatory)</option>
                <option value="non_small_private">Private Limited (Non-Small, Rule 9B Mandatory)</option>
                <option value="section_8">Section 8 Company (Private with Share Capital)</option>
                <option value="holding_subsidiary">Holding / Subsidiary (Disqualified from Small Co)</option>
                <option value="producer">Producer Company (Rule 9B — Deadline 31 Mar 2028)</option>
                <option value="startup">DPIIT Registered Startup (Sec 446B Concessions)</option>
                <option value="small_company">Small Company (Sec 2(85) — Statutorily Exempt)</option>
                <option value="nidhi">Nidhi Company (Rule 9A(11) Exempt)</option>
                <option value="govt_company">Government Company (Exempt)</option>
                <option value="wholly_owned_sub">Wholly Owned Subsidiary of Unlisted Public (Exempt)</option>
              </select>
            </div>

            {/* Capital Quick Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nominal / Authorised Share Capital: {formatInr(authorizedCapital)}
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Table A Normal Fee: {formatInr(result.normalFee)}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                {capitalButtons.map((btn) => (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => setAuthorizedCapital(btn.value)}
                    className={`px-2 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      authorizedCapital === btn.value
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Officers Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Officers in Default (Directors / KMPs): {numberOfOfficers}
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sec 450 Adjudication Exposure: {formatInr(result.totalOfficerPenalty)}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={numberOfOfficers}
                onChange={(e) => setNumberOfOfficers(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Demat Reconciliation Module */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="size-4 text-indigo-500" />
                Demat Capital Reconciliation (Form PAS-6 Data)
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  result.reconciliation.hasMismatch
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                }`}
              >
                {result.reconciliation.hasMismatch ? 'Discrepancy Detected' : 'Fully Reconciled'}
              </span>
            </div>

            {/* Visual Balance Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-mono">
                <span>CDSL: {result.reconciliation.cdslShares.toLocaleString('en-IN')}</span>
                <span>NSDL: {result.reconciliation.nsdlShares.toLocaleString('en-IN')}</span>
                <span>Physical: {result.reconciliation.physicalShares.toLocaleString('en-IN')} ({result.reconciliation.physicalPercentage}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(result.reconciliation.cdslShares / (result.reconciliation.totalReconciledShares || 1)) * 100}%` }}
                  className="bg-blue-500 h-full"
                  title="CDSL Holdings"
                />
                <div
                  style={{ width: `${(result.reconciliation.nsdlShares / (result.reconciliation.totalReconciledShares || 1)) * 100}%` }}
                  className="bg-indigo-500 h-full"
                  title="NSDL Holdings"
                />
                <div
                  style={{ width: `${(result.reconciliation.physicalShares / (result.reconciliation.totalReconciledShares || 1)) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title="Physical Holdings"
                />
              </div>
            </div>

            {/* Share Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Total Issued Shares</label>
                <input
                  type="number"
                  value={issuedShares}
                  onChange={(e) => setIssuedShares(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">CDSL Demat</label>
                <input
                  type="number"
                  value={cdslShares}
                  onChange={(e) => setCdslShares(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">NSDL Demat</label>
                <input
                  type="number"
                  value={nsdlShares}
                  onChange={(e) => setNsdlShares(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Physical Shares</label>
                <input
                  type="number"
                  value={physicalShares}
                  onChange={(e) => setPhysicalShares(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {result.reconciliation.hasMismatch && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Discrepancy detected: Reconciled holdings ({result.reconciliation.totalReconciledShares.toLocaleString('en-IN')}) differ from issued share capital ({issuedShares.toLocaleString('en-IN')}) by {Math.abs(result.reconciliation.difference).toLocaleString('en-IN')} shares. Under <strong>Rule 9A(8A)</strong>, you must notify NSDL & CDSL immediately.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Statutory Exposure Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md sticky top-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Statutory Financial Exposure
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                {result.delaySlabLabel}
              </span>
            </div>

            {/* Total Exposure Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-inner">
              <span className="text-xs font-medium text-slate-300 block mb-1">
                Total Statutory Liability
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                {formatInr(result.totalStatutoryExposure)}
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Info className="size-3.5 text-indigo-400" />
                MCA e-Challan: {formatInr(result.totalMcaFee)} + Sec 450 Exposure: {formatInr(result.totalAdjudicationExposure)}
              </p>
            </div>

            {/* Detailed Heads */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>1. MCA21 Portal E-Challan</span>
                  <span className="font-mono text-sm">{formatInr(result.totalMcaFee)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Normal Filing Fee (Table A)</span>
                  <span className="font-mono">{formatInr(result.normalFee)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Additional Late Multiplier ({result.lateMultiplier}×)</span>
                  <span className="font-mono">{formatInr(result.additionalFee)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>2. Section 450 Civil Adjudication</span>
                  <span className="font-mono text-sm">{formatInr(result.totalAdjudicationExposure)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Company Exposure (Max ₹2,00,000)</span>
                  <span className="font-mono">{formatInr(result.companyAdjudicationPenalty)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Officers in Default ({result.numberOfOfficers} × {formatInr(result.officerPenaltyPerOfficer)})</span>
                  <span className="font-mono">{formatInr(result.totalOfficerPenalty)}</span>
                </div>
                {result.isSection446BApplied && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                    ✓ Section 446B 50% Concession Applied
                  </div>
                )}
              </div>
            </div>

            {/* Warnings Alert */}
            {result.warnings.length > 0 && (
              <div className="space-y-2">
                {result.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 leading-relaxed"
                  >
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="size-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Form PAS-6 Summary Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Demat Compliance Step-by-Step Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Statutory Dematerialisation & PAS-6 Roadmap (Rules 9A & 9B)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Mandatory sequential milestones for unlisted public and non-small private companies
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {result.roadmap.map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                    Step {item.step}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.deadline}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {item.action}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 font-mono">
                {item.statutorySection}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
