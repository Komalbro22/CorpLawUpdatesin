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
  AlertCircle,
  Check
} from 'lucide-react'
import { MCAForm } from '@/data/mca-forms'
import { useToast } from '@/components/Toast'
import {
  calculateMsme1Compliance,
  MsmeHalfYear,
  BuyerEntityType,
  SupplierType,
  CURRENT_RBI_BANK_RATE,
  MSME_PENAL_INTEREST_RATE
} from '@/lib/rule-engine/msme1-engine'
import { generateMsme1Pdf } from '@/lib/pdf/generateMsme1Pdf'

interface PresetConfig {
  id: string
  label: string
  halfYear: MsmeHalfYear
  financialYear: string
  buyerType: BuyerEntityType
  numOfficers: number
  delayDays: number
  delayedPrincipal: number
  averageInvoiceDelay: number
  cat1PaidOnTime: number
  cat2PaidLate: number
  cat3OutStandingUnder45: number
  cat4OutStandingOver45: number
  description: string
  badge: string
}

const PRESETS: PresetConfig[] = [
  {
    id: 'upcoming_timely',
    label: 'Upcoming H1 (Due 31 Oct 2026)',
    halfYear: 'Apr-Sep',
    financialYear: '2026-2027',
    buyerType: 'private_limited',
    numOfficers: 2,
    delayDays: 0,
    delayedPrincipal: 500000,
    averageInvoiceDelay: 60,
    cat1PaidOnTime: 2000000,
    cat2PaidLate: 0,
    cat3OutStandingUnder45: 300000,
    cat4OutStandingOver45: 500000,
    description: 'Upcoming half-year filing filed on or before 31 October 2026 with zero ROC penalty.',
    badge: 'On Time'
  },
  {
    id: 'delayed_30d',
    label: '30-Day Delay (Private Ltd)',
    halfYear: 'Apr-Sep',
    financialYear: '2026-2027',
    buyerType: 'private_limited',
    numOfficers: 2,
    delayDays: 30,
    delayedPrincipal: 1000000,
    averageInvoiceDelay: 75,
    cat1PaidOnTime: 1500000,
    cat2PaidLate: 0,
    cat3OutStandingUnder45: 200000,
    cat4OutStandingOver45: 1000000,
    description: 'Delayed by 30 days. Triggers ₹50k company penalty + ₹1L officers penalty = ₹1.5L total.',
    badge: '30d Delayed'
  },
  {
    id: 'delayed_90d',
    label: '90-Day Delay (Critical Risk)',
    halfYear: 'Apr-Sep',
    financialYear: '2026-2027',
    buyerType: 'public_limited',
    numOfficers: 3,
    delayDays: 90,
    delayedPrincipal: 2500000,
    averageInvoiceDelay: 90,
    cat1PaidOnTime: 5000000,
    cat2PaidLate: 500000,
    cat3OutStandingUnder45: 400000,
    cat4OutStandingOver45: 2500000,
    description: '90 days overdue with 3 officers in default. Section 405(4) exposure reaches ₹4.40 Lakhs.',
    badge: 'High Risk'
  },
  {
    id: 'v3_trap',
    label: 'V3 Trap (Paid Late but Settled)',
    halfYear: 'Apr-Sep',
    financialYear: '2026-2027',
    buyerType: 'private_limited',
    numOfficers: 2,
    delayDays: 0,
    delayedPrincipal: 0,
    averageInvoiceDelay: 60,
    cat1PaidOnTime: 3000000,
    cat2PaidLate: 1200000,
    cat3OutStandingUnder45: 500000,
    cat4OutStandingOver45: 0,
    description: 'Zero balance overdue at period end, but ₹12L was paid after 45 days during the term. V3 STILL MANDATES FILING!',
    badge: 'V3 Trap'
  },
  {
    id: 'natrinai_precedent',
    label: 'Precedent: Natrinai Ventures (1000+ Days)',
    halfYear: 'Apr-Sep',
    financialYear: '2026-2027',
    buyerType: 'private_limited',
    numOfficers: 2,
    delayDays: 350,
    delayedPrincipal: 3500000,
    averageInvoiceDelay: 120,
    cat1PaidOnTime: 1000000,
    cat2PaidLate: 0,
    cat3OutStandingUnder45: 0,
    cat4OutStandingOver45: 3500000,
    description: 'Delay exceeding 300 days hits statutory maximum cap: ₹3L company + ₹6L officers = ₹9L fine (ROC Coimbatore order).',
    badge: 'Max Cap ₹9L'
  }
]

export default function MSME1Workspace({ form }: { form: MCAForm }) {
  const { showToast } = useToast()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'calculator' | 'v3categories' | 'caselaws'>('calculator')

  // Form state
  const [halfYear, setHalfYear] = useState<MsmeHalfYear>('Apr-Sep')
  const [financialYear, setFinancialYear] = useState('2026-2027')
  const [buyerType, setBuyerType] = useState<BuyerEntityType>('private_limited')
  const [supplierType, setSupplierType] = useState<SupplierType>('micro')
  const [numOfficers, setNumOfficers] = useState(2)
  const [delayDays, setDelayDays] = useState(0)
  const [companyName, setCompanyName] = useState('')
  const [cin, setCin] = useState('')

  // Financial exposure inputs
  const [delayedPrincipal, setDelayedPrincipal] = useState(500000)
  const [averageInvoiceDelay, setAverageInvoiceDelay] = useState(60)

  // V3 4-category inputs
  const [cat1PaidOnTime, setCat1PaidOnTime] = useState(2000000)
  const [cat2PaidLate, setCat2PaidLate] = useState(0)
  const [cat3OutStandingUnder45, setCat3OutStandingUnder45] = useState(300000)
  const [cat4OutStandingOver45, setCat4OutStandingOver45] = useState(500000)

  // Calculate compliance results
  const result = useMemo(() => {
    return calculateMsme1Compliance({
      halfYear,
      financialYear,
      buyerType,
      numOfficers,
      manualDelayDays: delayDays,
      delayedPrincipalAmount: delayedPrincipal,
      averageDelayDaysForInvoices: averageInvoiceDelay,
      supplierType,
      transactions: {
        paidWithin45Days: cat1PaidOnTime,
        paidAfter45Days: cat2PaidLate,
        outstandingWithin45Days: cat3OutStandingUnder45,
        outstandingOver45Days: cat4OutStandingOver45
      }
    })
  }, [
    halfYear,
    financialYear,
    buyerType,
    numOfficers,
    delayDays,
    delayedPrincipal,
    averageInvoiceDelay,
    supplierType,
    cat1PaidOnTime,
    cat2PaidLate,
    cat3OutStandingUnder45,
    cat4OutStandingOver45
  ])

  // Preset loader
  const handleApplyPreset = (preset: PresetConfig) => {
    setHalfYear(preset.halfYear)
    setFinancialYear(preset.financialYear)
    setBuyerType(preset.buyerType)
    setNumOfficers(preset.numOfficers)
    setDelayDays(preset.delayDays)
    setDelayedPrincipal(preset.delayedPrincipal)
    setAverageInvoiceDelay(preset.averageInvoiceDelay)
    setCat1PaidOnTime(preset.cat1PaidOnTime)
    setCat2PaidLate(preset.cat2PaidLate)
    setCat3OutStandingUnder45(preset.cat3OutStandingUnder45)
    setCat4OutStandingOver45(preset.cat4OutStandingOver45)
    showToast(`Loaded scenario: ${preset.label}`, 'success')
  }

  // Copy summary
  const handleCopySummary = () => {
    const summaryText = `--- FORM MSME-1 STATUTORY COMPLIANCE SUMMARY ---
Period: ${result.halfYear} (${result.financialYear})
Due Date: ${result.dueDateFormatted}
Filing Status: ${result.isDelayed ? `DELAYED by ${result.daysDelayed} days` : 'ON-TIME'}
MCA V3 Portal Fee: ₹0 (Free of cost)
Section 405(4) Company Penalty: ₹${result.companyPenalty.toLocaleString('en-IN')}
Section 405(4) Officers Penalty (${result.numOfficers}x): ₹${result.totalOfficersPenalty.toLocaleString('en-IN')}
Total Section 405 Exposure: ₹${result.totalSection405Exposure.toLocaleString('en-IN')}
Section 16 Compound Interest (16.50% p.a.): ₹${result.penalInterestPayable.toLocaleString('en-IN')}
Section 43B(h) Tax Cash Outflow: ₹${result.estimatedTaxCashOutflow.toLocaleString('en-IN')}
Total Combined Statutory Exposure: ₹${(result.totalSection405Exposure + result.penalInterestPayable + result.estimatedTaxCashOutflow).toLocaleString('en-IN')}
Verified on CorpLawUpdates.in`

    navigator.clipboard.writeText(summaryText)
    setCopied(true)
    showToast('Compliance summary copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  // PDF Export
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPDF(true)
      showToast('Generating MSME-1 Assessment Report PDF...', 'info')
      const doc = generateMsme1Pdf(result, {
        companyName: companyName.trim() || undefined,
        cin: cin.trim() || undefined
      })
      const filename = `MSME1_Compliance_Report_${result.halfYear}_${result.financialYear}.pdf`
      doc.save(filename)
      showToast('PDF downloaded successfully!', 'success')
    } catch (err) {
      console.error('PDF Error:', err)
      showToast('Failed to generate PDF. Please try again.', 'error')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner with Next Deadline Alert */}
      <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
                ⚡ Next Statutory Deadline: 31 October 2026
              </span>
              <span className="bg-blue-400/20 text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-400/30">
                MCA V3 Portal Fee: ₹0
              </span>
              <span className="bg-rose-400/20 text-rose-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-rose-400/30">
                Sec 405(4) Cap: ₹3,00,000 Each
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
              Form MSME-1 Half-Yearly Return &amp; Penalty Calculator
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Calculate Section 405(4) adjudication exposure (₹20,000 base + ₹1,000/day), Section 16 MSMED Act compound interest at 16.50% p.a., Section 43B(h) tax disallowances, and V3 4-category disclosure obligations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopySummary}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPDF}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Presets Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-World Benchmark Scenarios:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                    {preset.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{preset.description}</p>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Load Preset →</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">
                  {preset.badge}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'calculator'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Section 405 &amp; Triple Liability Calculator</span>
        </button>
        <button
          onClick={() => setActiveTab('v3categories')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'v3categories'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>MCA V3 4-Category Disclosure Assessor</span>
        </button>
        <button
          onClick={() => setActiveTab('caselaws')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'caselaws'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Real ROC Adjudication Orders</span>
        </button>
      </div>

      {/* 4. Main Workspace Content */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>1. Filing Period &amp; Corporate Identity</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Reporting Half-Year
                  </label>
                  <select
                    value={halfYear}
                    onChange={e => setHalfYear(e.target.value as MsmeHalfYear)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="Apr-Sep">April 1 – September 30 (Due 31 Oct)</option>
                    <option value="Oct-Mar">October 1 – March 31 (Due 30 Apr)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Financial Year
                  </label>
                  <select
                    value={financialYear}
                    onChange={e => setFinancialYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="2026-2027">FY 2026-27 (Current)</option>
                    <option value="2025-2026">FY 2025-26</option>
                    <option value="2024-2025">FY 2024-25</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Buyer Entity Type
                  </label>
                  <select
                    value={buyerType}
                    onChange={e => setBuyerType(e.target.value as BuyerEntityType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="private_limited">Private Limited Company</option>
                    <option value="public_limited">Public Limited Company</option>
                    <option value="opc">One Person Company (OPC)</option>
                    <option value="small_company">Small Company (Sec 2(85))</option>
                    <option value="section_8">Section 8 Non-Profit Company</option>
                    <option value="producer_company">Producer Company</option>
                    <option value="llp">LLP (Exempt from Sec 405)</option>
                    <option value="partnership_proprietorship">Partnership / Proprietorship (Exempt)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Number of Directors / Officers in Default
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={numOfficers}
                    onChange={e => setNumOfficers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Each officer in default faces a separate ₹3L cap.</p>
                </div>
              </div>

              {/* Optional Company Details for PDF */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Company Name (for PDF Report)</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Industries Ltd"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">CIN (for PDF Report)</label>
                  <input
                    type="text"
                    placeholder="e.g. U74999DL2020PTC123456"
                    value={cin}
                    onChange={e => setCin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Delay & Invoices Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>2. Delay Beyond Statutory Due Date ({result.dueDateFormatted})</span>
              </h3>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Days Delayed Beyond {result.dueDateFormatted}
                  </label>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${delayDays === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {delayDays === 0 ? 'On Time' : `${delayDays} Days Delayed`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  step="5"
                  value={delayDays}
                  onChange={e => setDelayDays(parseInt(e.target.value) || 0)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>0d (On Time)</span>
                  <span>30d</span>
                  <span>90d</span>
                  <span>180d</span>
                  <span>280d (Cap Hit)</span>
                  <span>350d</span>
                </div>
              </div>

              {/* Vendor dues amount */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Delayed MSME Vendor Dues (&gt; 45 Days) [₹ Principal]
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={delayedPrincipal}
                    onChange={e => setDelayedPrincipal(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-bold"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Used to calculate Section 16 penal compound interest (16.50% p.a.) and Section 43B(h) tax disallowance.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Average Invoice Payment Delay (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={averageInvoiceDelay}
                    onChange={e => setAverageInvoiceDelay(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Primary Total Exposure Card */}
            <div className={`p-6 rounded-2xl border transition-all ${
              result.riskLevel === 'CRITICAL'
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                : result.riskLevel === 'HIGH'
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            } shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Statutory Compliance Risk
                  </span>
                  <h4 className="text-xl font-bold text-navy dark:text-white mt-0.5">
                    {result.isDelayed ? `Delayed Filing (${result.daysDelayed} Days Overdue)` : 'Timely / No Filing Default'}
                  </h4>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  result.riskLevel === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : result.riskLevel === 'HIGH'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {result.riskLevel} Risk
                </span>
              </div>

              {/* Exposure Breakdown */}
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    MCA V3 Portal Fee
                  </span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹0 (FREE)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">No portal checkout fee</p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Sec 405(4) Total Exposure
                  </span>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    ₹{result.totalSection405Exposure.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Company + {result.numOfficers} Officers</p>
                </div>
              </div>

              {/* Multi-Layer Stack */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span>🏢</span> Company Adjudication Penalty
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{result.companyPenalty.toLocaleString('en-IN')}
                    {result.companyPenalty >= result.companyPenaltyCap && (
                      <span className="text-[10px] text-rose-600 font-normal ml-1">(Cap Hit)</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span>👔</span> Officers in Default Liability ({result.numOfficers}x)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{result.totalOfficersPenalty.toLocaleString('en-IN')}
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      (₹{result.officerPenaltyPerOfficer.toLocaleString('en-IN')} each)
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span>📈</span> Section 16 MSMED Interest (16.50%)
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    ₹{result.penalInterestPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span>🧾</span> Section 43B(h) Income Tax Cash Outflow
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{result.estimatedTaxCashOutflow.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800 text-base font-black">
                  <span className="text-navy dark:text-white">Total Combined Financial Impact</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ₹{(result.totalSection405Exposure + result.penalInterestPayable + result.estimatedTaxCashOutflow).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Helper / Cross-Link to MSME Interest Tool */}
            <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-blue-700 dark:text-blue-300">Detailed Invoice-by-Invoice Interest:</strong>{' '}
                  Need to calculate compounded interest with monthly rests for multiple specific vendor invoices? Use our dedicated{' '}
                  <Link href="/tools/fee-calculator/msme" className="text-blue-600 dark:text-blue-400 font-bold underline hover:no-underline">
                    MSME Delayed Payment Interest Calculator
                  </Link>{' '}
                  powered by real-time RBI Bank Rates.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. V3 4-Category Disclosure Assessor Tab */}
      {activeTab === 'v3categories' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>⚠️</span> The MCA V3 Expanded Disclosure Architecture
            </div>
            <h3 className="text-xl font-bold text-navy dark:text-white">
              V3 Four-Category Reporting Simulator
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed mt-1">
              Under MCA V2, companies only reported balances outstanding at the end of the half-year. Under V3, <strong>if ANY payment crossed 45 days during the half-year</strong> (even if settled before period end), the company must file Form MSME-1 and disclose ALL four categories of transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Category 1: Paid Within 45 Days
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500">Payments made on time during the reporting half-year.</p>
              <input
                type="number"
                step="50000"
                value={cat1PaidOnTime}
                onChange={e => setCat1PaidOnTime(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div className="p-5 rounded-xl border-2 border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
                  Category 2: Paid After 45 Days (V3 Trap)
                </span>
                <span className="bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  V3 Trigger
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Paid late during the half-year, but balance is ₹0 at period end.
              </p>
              <input
                type="number"
                step="50000"
                value={cat2PaidLate}
                onChange={e => setCat2PaidLate(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 text-sm font-bold text-amber-900 dark:text-amber-200"
              />
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Category 3: Outstanding &le; 45 Days
                </span>
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Accrued Dues
                </span>
              </div>
              <p className="text-xs text-slate-500">Unpaid at period end, but 45 days have not yet elapsed.</p>
              <input
                type="number"
                step="50000"
                value={cat3OutStandingUnder45}
                onChange={e => setCat3OutStandingUnder45(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div className="p-5 rounded-xl border-2 border-rose-300 dark:border-rose-700/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase">
                  Category 4: Outstanding &gt; 45 Days
                </span>
                <span className="bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  Default Trigger
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Unpaid at period end and 45 days HAVE elapsed. Mandatory reporting.
              </p>
              <input
                type="number"
                step="50000"
                value={cat4OutStandingOver45}
                onChange={e => setCat4OutStandingOver45(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg px-3 py-2 text-sm font-bold text-rose-900 dark:text-rose-200"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{result.isFilingTriggeredOnV3 ? '🚨' : '✅'}</span>
              <div>
                <h5 className="text-sm font-bold text-navy dark:text-white">
                  {result.isFilingTriggeredOnV3 ? 'Form MSME-1 Filing is MANDATORY on MCA V3' : 'No Filing Required (Nil Return)'}
                </h5>
                <p className="text-xs text-slate-500">{result.v3TriggerReason}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              result.isFilingTriggeredOnV3 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
            }`}>
              {result.isFilingTriggeredOnV3 ? 'Filing Triggered' : 'Nil Return'}
            </span>
          </div>
        </div>
      )}

      {/* 6. Case Laws & Precedents Tab */}
      {activeTab === 'caselaws' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <span>⚖️</span> Enforced Section 454 Adjudication Orders
            </div>
            <h3 className="text-xl font-bold text-navy dark:text-white">
              Real-World ROC Adjudication Precedents for MSME-1 Non-Filing
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed mt-1">
              ROCs across India are strictly enforcing Section 405(4) against corporate buyers. MSME-1 is no longer treated as a routine or optional disclosure.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 p-5 rounded-xl">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                <h4 className="font-bold text-navy dark:text-white text-base">
                  Natrinai Ventures Limited — ROC Coimbatore (Order dated 6 January 2026)
                </h4>
                <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Total Penalty: ₹9,00,000
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                The company delayed filing Form MSME-1 by 1,192 days for the half-year ending 30 September 2021 and 1,011 days for the half-year ending 31 March 2022. The Adjudicating Officer rejected the defence of inadvertence and imposed the <strong>maximum statutory ceiling of ₹3,00,000 each</strong> on the company and two directors, totaling ₹9 Lakhs.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-rose-200 dark:border-rose-900/40">
                <span>Order No: PO/ADJ/01-2026/CB/01335</span>
                <span>Section: 405(4) &amp; 454</span>
                <span>Delays: 1,192d &amp; 1,011d</span>
              </div>
            </div>

            <div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-5 rounded-xl">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                <h4 className="font-bold text-navy dark:text-white text-base">
                  Samsung R&amp;D Institute India Private Limited — ROC Bangalore
                </h4>
                <span className="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Total Penalty: ~₹11.67 Lakhs
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Penalized for delays of 266 days in one period and 85 days in another period across multiple operational cycles. Adjudicated under Section 405(4) with cumulative penalties exceeding ₹11.67 Lakhs on the corporate entity and responsible managerial officers.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-amber-200 dark:border-amber-900/40">
                <span>Jurisdiction: ROC Bangalore</span>
                <span>Cumulative: ~₹11.67 Lakhs</span>
                <span>Trigger: Vendor Dues &gt; 45 Days</span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl">
              <h4 className="font-bold text-navy dark:text-white text-sm mb-2">
                Typical 90-to-100 Day Delays Across RoCs
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A routine 90-day delay results in an automatic baseline adjudication of ₹1,10,000 on the company and ₹1,10,000 on each officer in default. For a standard private limited company with 2 directors, this creates an immediate ₹3,30,000 unappealable compliance drain.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
