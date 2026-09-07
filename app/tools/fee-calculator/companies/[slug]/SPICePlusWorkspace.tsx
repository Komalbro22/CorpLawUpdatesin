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
  MapPin,
  Users,
  FileText,
  BadgePercent,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Check
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateSpiceIncorporation,
  STATE_STAMP_RULES,
  CompanyType,
  CostTier,
  formatInr
} from '@/lib/rule-engine/spice-engine'
import { generateSpicePdf } from '@/lib/pdf/generateSpicePdf'

interface PresetConfig {
  id: string
  label: string
  capital: number
  stateKey: string
  companyType: CompanyType
  directors: number
  reserveName: boolean
  description: string
  badge: string
}

const PRESETS: PresetConfig[] = [
  {
    id: 'pvt_10l_dl',
    label: 'Delhi Startup (₹10L)',
    capital: 1000000,
    stateKey: 'delhi',
    companyType: 'private_standard',
    directors: 2,
    reserveName: false,
    description: 'Standard 2-director startup in Delhi with ₹10 Lakh authorized capital and ₹0 MCA filing fee.',
    badge: 'Zero MCA Fee'
  },
  {
    id: 'pvt_15l_mh',
    label: 'Mumbai Pvt Ltd (₹15L)',
    capital: 1500000,
    stateKey: 'maharashtra',
    companyType: 'private_standard',
    directors: 2,
    reserveName: false,
    description: 'Maximum ₹0 MCA fee threshold under G.S.R. 329(E) with Maharashtra stamp duty.',
    badge: 'Max Exemption'
  },
  {
    id: 'pvt_10l_ka',
    label: 'Bengaluru Tech (₹10L)',
    capital: 1000000,
    stateKey: 'karnataka',
    companyType: 'private_standard',
    directors: 2,
    reserveName: false,
    description: 'Tech startup in Karnataka with 2024 revised AOA duty (₹5,000 per ₹10L).',
    badge: 'Karnataka 2024'
  },
  {
    id: 'opc_1l_up',
    label: 'Solo Entrepreneur (OPC ₹1L)',
    capital: 100000,
    stateKey: 'uttar_pradesh',
    companyType: 'one_person_company',
    directors: 1,
    reserveName: false,
    description: 'One Person Company with single director, ₹0 MCA fee, and flat UP stamp duty.',
    badge: 'Solo Founder'
  },
  {
    id: 'mid_50l_gj',
    label: 'Mid-Market (₹50L Capital)',
    capital: 5000000,
    stateKey: 'gujarat',
    companyType: 'private_standard',
    directors: 3,
    reserveName: true,
    description: 'Mid-sized manufacturing/trading entity with ₹50L capital and Table A progressive fee.',
    badge: 'Progressive Slab'
  },
  {
    id: 'sec8_10l',
    label: 'Section 8 Non-Profit (₹10L)',
    capital: 1000000,
    stateKey: 'delhi',
    companyType: 'section_8',
    directors: 2,
    reserveName: true,
    description: 'Section 8 non-profit foundation benefiting from state stamp duty exemptions.',
    badge: 'Duty Exempt'
  }
]

export default function SPICePlusWorkspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Interactive Form State
  const [capital, setCapital] = useState<number>(1000000) // ₹10 Lakhs default
  const [stateKey, setStateKey] = useState<string>('delhi')
  const [companyType, setCompanyType] = useState<CompanyType>('private_standard')
  const [directorCount, setDirectorCount] = useState<number>(2)
  const [reserveNameSeparately, setReserveNameSeparately] = useState<boolean>(false)
  const [proposedName, setProposedName] = useState<string>('')

  // Calculate results live
  const result = useMemo(() => {
    return calculateSpiceIncorporation({
      capital,
      stateKey,
      companyType,
      directorCount,
      reserveNameSeparately
    })
  }, [capital, stateKey, companyType, directorCount, reserveNameSeparately])

  // Presets handler
  const handleApplyPreset = (preset: PresetConfig) => {
    setCapital(preset.capital)
    setStateKey(preset.stateKey)
    setCompanyType(preset.companyType)
    setDirectorCount(preset.directors)
    setReserveNameSeparately(preset.reserveName)
    showToast(`Applied preset: ${preset.label}`, 'success')
  }

  // PDF Export
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const doc = generateSpicePdf(result, {
        proposedName: proposedName || undefined
      })
      const filename = `SPICePlus_Incorporation_Estimate_${result.stateCode || result.stateName}_${result.capital}.pdf`
      doc.save(filename)
      showToast('PDF downloaded successfully!', 'success')
    } catch (err) {
      console.error('Failed to generate SPICe+ PDF', err)
      showToast('Failed to generate PDF. Please try again.', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Copy Summary
  const handleCopySummary = () => {
    const text = `
SPICe+ (INC-32) Company Incorporation Estimate — CorpLawUpdates.in
Company Type: ${result.companyType}
Registered Office: ${result.stateName}
Authorised Capital: ${formatInr(result.capital)}
Proposed Directors: ${result.directorCount} (Free DINs: ${result.freeDinsAllotted})

COST BREAKDOWN:
- MCA Incorporation Fee: ${formatInr(result.mcaFee)} ${result.isMcaFeeZero ? '(Zero Fee under G.S.R. 329(E))' : ''}
- MOA Stamp Duty: ${formatInr(result.moaDuty)}
- AOA Stamp Duty: ${formatInr(result.aoaDuty)}
- SPICe+ e-Form Stamp Duty: ${formatInr(result.formDuty)}
- PAN & TAN Allotment: ${formatInr(result.panFee + result.tanFee)}
${result.nameReservationFee > 0 ? `- Name Reservation (Part A): ${formatInr(result.nameReservationFee)}\n` : ''}${result.dinAllotmentFee > 0 ? `- Additional DIN Fees: ${formatInr(result.dinAllotmentFee)}\n` : ''}
TOTAL GOVERNMENT ESTIMATE: ${formatInr(result.totalGovernmentPayable)}
${result.isMcaFeeZero ? `Savings: ${formatInr(result.mcaFeeSaved)} saved under MCA zero-fee exemption.` : ''}
Generated via: https://www.corplawupdates.in/tools/fee-calculator/companies/spice-plus
    `.trim()

    navigator.clipboard.writeText(text)
    showToast('Incorporation estimate copied to clipboard!', 'success')
  }

  // Capital quick buttons
  const capitalButtons = [
    { label: '₹1L', value: 100000 },
    { label: '₹5L', value: 500000 },
    { label: '₹10L', value: 1000000 },
    { label: '₹15L', value: 1500000, isHighlight: true },
    { label: '₹25L', value: 2500000 },
    { label: '₹50L', value: 5000000 },
    { label: '₹1 Cr', value: 10000000 }
  ]

  // Sort states alphabetically for clean dropdown
  const sortedStates = useMemo(() => {
    return Object.entries(STATE_STAMP_RULES).sort((a, b) =>
      a[1].stateName.localeCompare(b[1].stateName)
    )
  }, [])

  return (
    <div id="spice-plus-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
              <Sparkles className="size-3.5 text-blue-400" />
              MCA V3 Digital Incorporation Engine | 2026 Edition
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-2 text-white">
              SPICe+ (INC-32) Company Incorporation Calculator
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Calculate government filing fees, state-wise e-MOA & e-AOA stamp duty across all 36 States/UTs, PAN/TAN charges, and free DIN allotments under G.S.R. 329(E).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              title="Copy Summary to Clipboard"
            >
              <Copy className="size-3.5" />
              Copy
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              title="Print Calculation"
            >
              <Printer className="size-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-blue-500/25 disabled:opacity-50"
            >
              <Download className="size-3.5" />
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Presets Carousel / Quick-Select Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-blue-500" />
            Quick Setup Presets
          </h3>
          <span className="text-[11px] text-slate-400">Click a preset to instantly populate parameters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-1.5">
                  {preset.badge}
                </span>
                <h4 className="text-xs font-bold text-navy dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {preset.label}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-tabular-nums">
                {formatInr(preset.capital)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Calculator Grid: Controls & Live Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy dark:text-white mb-5 flex items-center gap-2">
              <Building2 className="size-5 text-blue-600" />
              Company Parameters
            </h2>

            {/* Proposed Company Name (Optional) */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Proposed Company Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Technologies Private Limited"
                value={proposedName}
                onChange={e => setProposedName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Company Type & State Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Company Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company Entity Type
                </label>
                <select
                  value={companyType}
                  onChange={e => setCompanyType(e.target.value as CompanyType)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private_standard">Private Limited (Standard)</option>
                  <option value="one_person_company">One Person Company (OPC)</option>
                  <option value="small_company">Small Company (Sec 2(85))</option>
                  <option value="public_unlisted">Public Limited (Unlisted)</option>
                  <option value="section_8">Section 8 Company (Non-Profit)</option>
                  <option value="producer">Producer Company</option>
                </select>
              </div>

              {/* State & Union Territory */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Registered Office State</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    result.costTier === 'Lowest' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    result.costTier === 'Low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                    result.costTier === 'Moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  }`}>
                    {result.costTier} Cost Tier
                  </span>
                </label>
                <select
                  value={stateKey}
                  onChange={e => setStateKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortedStates.map(([key, rule]) => (
                    <option key={key} value={key}>
                      {rule.stateName} — [{rule.costTier}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Authorised Share Capital Input & Quick Slabs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Authorised Share Capital (₹)
                </label>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-tabular-nums">
                  {formatInr(capital)}
                </span>
              </div>
              <input
                type="number"
                min="10000"
                step="10000"
                value={capital}
                onChange={e => setCapital(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 text-base font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2.5"
              />

              {/* Quick Set Capital Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {capitalButtons.map(btn => (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => setCapital(btn.value)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      capital === btn.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : btn.isHighlight
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {btn.label} {btn.isHighlight && '✨ Max Zero Fee'}
                  </button>
                ))}
              </div>
            </div>

            {/* Directors & Name Reservation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Proposed Directors */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Proposed Directors
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={directorCount}
                    onChange={e => setDirectorCount(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
                    className="w-24 px-3.5 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 leading-tight">
                    {directorCount <= 3 ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="size-3" /> All {directorCount} DINs free in SPICe+
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        3 DINs free; {directorCount - 3} extra via DIR-3 (₹{((directorCount - 3) * 500).toLocaleString('en-IN')})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Name Reservation Checkbox */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Name Reservation Mode
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={reserveNameSeparately}
                    onChange={e => setReserveNameSeparately(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold">Reserve Name first via Part A (₹1,000)</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      Recommended to secure your trademark & name before drafting legal documents.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Savings Highlight Box */}
          {result.isMcaFeeZero && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <BadgePercent className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  100% Zero MCA Filing Fee Applied!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                  Under <strong>G.S.R. 329(E)</strong>, companies with authorized share capital up to <strong>₹15,00,000</strong> pay ₹0 filing fee for SPICe+ (INC-32). You saved approximately <strong>{formatInr(result.mcaFeeSaved)}</strong> in statutory MCA incorporation fees!
                </p>
              </div>
            </div>
          )}

          {/* Statutory Warnings & Rules */}
          {result.warnings.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                <Info className="size-3.5 text-blue-500" />
                State Regulatory Advisory
              </h4>
              {result.warnings.map((warn, i) => (
                <p key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {warn}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Cost Breakdown & Outlay Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/20 shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">
              Estimated Government Outlay
            </span>
            <div className="text-3xl sm:text-4xl font-black text-navy dark:text-white font-tabular-nums mb-4">
              {formatInr(result.totalGovernmentPayable)}
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Total statutory challans payable directly on MCA V3 via Bharatkosh and state e-stamping gateways.
            </p>

            {/* Line Items Table */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              {result.breakdown.map((item, index) => (
                <div key={index} className="flex items-start justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {item.basis}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-bold font-tabular-nums ${
                      item.amount === 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.amount === 0 ? '₹0 (Free)' : formatInr(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="border-t-2 border-slate-200 dark:border-slate-800 mt-5 pt-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-navy dark:text-white block">
                  Total Government Challans
                </span>
                <span className="text-[11px] text-slate-400">
                  {result.stateName} • {formatInr(result.capital)} Capital
                </span>
              </div>
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-tabular-nums">
                {formatInr(result.totalGovernmentPayable)}
              </span>
            </div>

            {/* Download PDF & Copy CTAs */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-blue-500/25 disabled:opacity-50"
              >
                <Download className="size-4" />
                {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Estimate'}
              </button>
              <button
                onClick={handleCopySummary}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                title="Copy Calculation Summary"
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 text-xs text-blue-900 dark:text-blue-300">
            <h5 className="font-bold flex items-center gap-1.5 mb-1 text-blue-800 dark:text-blue-200">
              <ShieldCheck className="size-4 text-blue-600" />
              Straight Through Process (STP)
            </h5>
            <p className="leading-relaxed text-[11px] text-blue-800/80 dark:text-blue-300/80">
              PAN, TAN, EPFO, ESIC, and DIN are allotted automatically under STP once the ROC approves the SPICe+ filing. Certificate of Incorporation is issued with 21-character CIN.
            </p>
          </div>
        </div>
      </div>

      {/* 4. State Stamp Duty Comparison Table (Hub Benchmark) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-navy dark:text-white flex items-center gap-2">
              <MapPin className="size-5 text-blue-600" />
              State Stamp Duty Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Compare your current stamp duty in {result.stateName} against other primary startup and industrial centers at ₹{capital.toLocaleString('en-IN')} authorized capital.
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-medium">
            Based on Respective State Stamp Acts
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold">State / Hub</th>
                <th className="px-4 py-3 font-bold text-right">Total Stamp Duty (₹)</th>
                <th className="px-4 py-3 font-bold text-center">Cost Difference vs {result.stateName}</th>
                <th className="px-4 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {result.stateComparison.map(hub => {
                const isSelected = hub.stateName === result.stateName
                return (
                  <tr
                    key={hub.stateKey}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 font-bold'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-4 py-3.5 flex items-center gap-2 text-slate-900 dark:text-white">
                      <span>{hub.stateName}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-600 text-white font-bold">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-navy dark:text-white font-tabular-nums">
                      {formatInr(hub.totalDuty)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {hub.difference === 0 ? (
                        <span className="text-slate-400 font-normal">Baseline</span>
                      ) : hub.difference > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold font-tabular-nums">
                          +{formatInr(hub.difference)} Higher
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-tabular-nums">
                          {formatInr(hub.difference)} Cheaper
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {!isSelected ? (
                        <button
                          onClick={() => setStateKey(hub.stateKey)}
                          className="text-blue-600 hover:text-blue-500 font-bold hover:underline flex items-center gap-1"
                        >
                          Switch to {hub.stateName} <ArrowRight className="size-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">Active Selection</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Mandatory 180-Day Post-Incorporation Compliance Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-2">
              <AlertTriangle className="size-3.5" />
              Post-Incorporation Compliance Schedule
            </div>
            <h3 className="text-xl font-bold text-navy dark:text-white">
              What Happens After Receiving Your Certificate of Incorporation (CoI)?
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Incorporating via SPICe+ is only Step 1. Every newly registered company must complete mandatory statutory actions within strictly defined windows to prevent heavy penalties or strike-off.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {result.postIncorporationRoadmap.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                item.isCritical
                  ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                    {item.dayWindow}
                  </span>
                  {item.isCritical && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                      High Risk
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-navy dark:text-white mb-1.5">
                  {item.action}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                  {item.statutorySection}
                </p>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {item.penaltySummary}
                </p>
              </div>

              {item.toolUrl ? (
                <Link
                  href={item.toolUrl}
                  className="inline-flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 group"
                >
                  <span>Open {item.form} Calculator</span>
                  <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-400">
                  Mandatory under Companies Act 2013
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
