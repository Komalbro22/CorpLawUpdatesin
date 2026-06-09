'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { calculateCompanyFee, formatINR, getDaysBetween } from '@/lib/penaltyCalculator'
import { ArrowLeft, Share2, Info, ChevronDown, Check } from 'lucide-react'

// FAQs for the Company page
const companyFaqs = [
  {
    q: 'What is the late fee for MGT-7 filing in 2025?',
    a: '₹100 per day from the day after the due date, with no upper cap. For example, a delay of 180 days attracts ₹18,000 as additional fee under Section 403 of the Companies Act, 2013, over and above the normal filing fee.',
  },
  {
    q: 'Is there a maximum cap on MCA late fees for annual returns?',
    a: 'No. For MGT-7, MGT-7A, AOC-4, and AOC-4 XBRL, there is no maximum cap on the late fee. The ₹100/day penalty continues until the form is filed.',
  },
  {
    q: 'What is the difference between late fee and ROC penalty?',
    a: 'The late fee (additional fee under Section 403) is paid to MCA at the time of filing the delayed form. The ROC penalty is a separate adjudication penalty imposed by the Registrar of Companies under Section 92(5) or 137(3) — this requires an adjudication order and is not automatically paid through the MCA portal.',
  },
  {
    q: 'How much is the DIR-3 KYC penalty?',
    a: 'If DIR-3 KYC is not filed by September 30, a flat penalty of ₹5,000 is charged when filing after the due date, regardless of how many days late. There is no per-day rate for DIR-3 KYC.',
  },
  {
    q: 'Do Small Companies get any relief in ROC penalties?',
    a: 'Yes. Section 446B of the Companies Act, 2013 reduces the penalty by 50% for small companies, One Person Companies (OPCs), and startups. For example, if the normal penalty on a company under Section 92(5) is ₹2,00,000, a small company pays only ₹1,00,000.',
  },
  {
    q: 'What is the penalty on directors for not filing AOC-4?',
    a: 'Under Section 137(3), the Managing Director or CFO can be penalised ₹1,000 per day up to a maximum of ₹5,00,000. Other directors face ₹1,000/day up to ₹1,00,000 each.',
  },
]

// JsonLd structure for company calculator
const seoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Company ROC Late Fee & Penalty Calculator',
  description: 'Calculate exact ROC filing fees and late fees for MGT-7, AOC-4, DIR-3 KYC, and more.',
  url: 'https://www.corplawupdates.in/tools/penalty-calculator/company',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
      { '@type': 'ListItem', position: 3, name: 'Penalty Calculator', item: 'https://www.corplawupdates.in/tools/penalty-calculator' },
      { '@type': 'ListItem', position: 4, name: 'Company', item: 'https://www.corplawupdates.in/tools/penalty-calculator/company' },
    ],
  },
  mainEntity: [
    {
      '@type': 'WebApplication',
      name: 'Company ROC Late Fee & Penalty Calculator',
      url: 'https://www.corplawupdates.in/tools/penalty-calculator/company',
      applicationCategory: 'BusinessApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: companyFaqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  ],
}

const FORMS = [
  { id: 'MGT-7', label: 'MGT-7 (Annual Return)', section: 'Section 92' },
  { id: 'MGT-7A', label: 'MGT-7A (Annual Return - OPC/Small)', section: 'Section 92' },
  { id: 'AOC-4', label: 'AOC-4 (Financial Statements)', section: 'Section 137' },
  { id: 'AOC-4-XBRL', label: 'AOC-4 XBRL (Financial Statements)', section: 'Section 137' },
  { id: 'AOC-4-CFS', label: 'AOC-4 CFS (Consolidated Financial Statements)', section: 'Section 137' },
  { id: 'DIR-3-KYC', label: 'DIR-3 KYC (Director KYC)', section: 'Rule 12A' },
  { id: 'MGT-14', label: 'MGT-14 (Filing of Resolutions)', section: 'Section 117' },
  { id: 'PAS-3', label: 'PAS-3 (Return of Allotment)', section: 'Section 39' },
  { id: 'INC-22', label: 'INC-22 (Notice of Registered Office)', section: 'Section 12' },
  { id: 'INC-20A', label: 'INC-20A (Commencement of Business)', section: 'Section 10A' },
  { id: 'CHG-1', label: 'CHG-1 (Creation/Modification of Charge)', section: 'Section 77' },
  { id: 'CHG-4', label: 'CHG-4 (Satisfaction of Charge)', section: 'Section 82' },
  { id: 'ADT-1', label: 'ADT-1 (Appointment of Auditor)', section: 'Section 139' },
  { id: 'DIR-12', label: 'DIR-12 (Changes in Directorship)', section: 'Section 170' },
]

export default function CompanyPenaltyCalculator() {
  const [companyType, setCompanyType] = useState<'Pvt' | 'Public' | 'OPC' | 'Small' | 'Section8'>('Pvt')
  const [authorizedCapital, setAuthorizedCapital] = useState<number>(100000)
  const [formId, setFormId] = useState<string>('MGT-7')
  const [dueDate, setDueDate] = useState<string>('')
  const [actualDate, setActualDate] = useState<string>('')
  const [daysDelayed, setDaysDelayed] = useState<number>(0)
  const [officersCount, setOfficersCount] = useState<number>(2)
  const [isRepeatDefault, setIsRepeatDefault] = useState<boolean>(false)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Calculations
  const results = calculateCompanyFee({
    companyType,
    authorizedCapital,
    formId,
    dueDate,
    actualDate,
    daysDelayed,
    officersCount,
    isRepeatDefault,
  })

  // Recalculate days when dates change
  useEffect(() => {
    if (dueDate && actualDate) {
      const days = getDaysBetween(dueDate, actualDate)
      setDaysDelayed(days)
    }
  }, [dueDate, actualDate])

  const handleQuickDelay = (days: number) => {
    setIsCalculating(true)
    setTimeout(() => {
      setDaysDelayed(days)
      setDueDate('')
      setActualDate('')
      setIsCalculating(false)
    }, 150)
  }

  const handleShare = () => {
    const text = `${formId} late fee for ${companyType} Ltd (Auth Cap ${formatINR(authorizedCapital)}) — ${daysDelayed} days delay — Total MCA fee: ${formatINR(results.totalPayable)} | Penalty exposure: ${formatINR(results.totalPenaltyExposure)} — via corplawupdates.in`
    navigator.clipboard.writeText(text).then(() => {
      setShowShareSuccess(true)
      setTimeout(() => setShowShareSuccess(false), 2500)
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <JsonLd data={seoJsonLd as any} />
      
      {/* Page header */}
      <div className="bg-navy py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-slate-400 mb-3">
            <Link href="/tools" className="hover:text-amber-400">
              Tools
            </Link>
            {' → '}
            <Link href="/tools/penalty-calculator" className="hover:text-amber-400">
              Penalty Calculators
            </Link>
            {' → '}
            <span className="text-slate-350">
              Company
            </span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
            Company ROC Penalty & Late Fee Calculator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Calculate statutory filing fees, Section 403 ROC late fees, and potential Section 92/137 adjudication penalties. Covers Section 446B reliefs.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-5 py-3">
              <h2 className="text-sm font-bold font-heading text-navy dark:text-white">Filing Parameters</h2>
            </div>

            <div className="p-5 space-y-5">
              {/* Company Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Company Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pvt', 'Public', 'OPC', 'Small', 'Section8'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCompanyType(type)}
                      className={`text-xs py-2 px-1 font-semibold rounded-lg border transition-all ${
                        companyType === type
                          ? 'border-amber-450 bg-amber-400/10 text-amber-700 dark:text-amber-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {type === 'Pvt' ? 'Pvt Ltd' : type === 'Public' ? 'Public Ltd' : type === 'Small' ? 'Small Co' : type === 'Section8' ? 'Sec 8' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authorized Capital */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Authorized Capital (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={authorizedCapital}
                    onChange={e => setAuthorizedCapital(Number(e.target.value))}
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-805 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="e.g. 100000"
                  />
                  <select
                    onChange={e => setAuthorizedCapital(Number(e.target.value))}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 text-xs font-semibold text-slate-600 dark:text-slate-400 focus:outline-none"
                  >
                    <option value={100000}>Slabs (Select)</option>
                    <option value={100000}>₹1,00,000 (1 Lakh)</option>
                    <option value={500000}>₹5,00,000 (5 Lakhs)</option>
                    <option value={1000000}>₹10,00,000 (10 Lakhs)</option>
                    <option value={5000000}>₹50,00,000 (50 Lakhs)</option>
                    <option value={10000000}>₹1,00,00,000 (1 Crore)</option>
                  </select>
                </div>
              </div>

              {/* Select MCA Form */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select MCA Form
                </label>
                <select
                  value={formId}
                  onChange={e => {
                    setFormId(e.target.value)
                    setIsRepeatDefault(false)
                  }}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  {FORMS.map(form => (
                    <option key={form.id} value={form.id}>
                      {form.label} ({form.section})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Actual Filing Date
                  </label>
                  <input
                    type="date"
                    value={actualDate}
                    onChange={e => setActualDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Days Delayed */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                  <span>Days Delayed</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal normal-case">Dates will auto-calculate, or override manually</span>
                </label>
                <input
                  type="number"
                  value={daysDelayed}
                  onChange={e => {
                    setDaysDelayed(Number(e.target.value))
                    setDueDate('')
                    setActualDate('')
                  }}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              {/* Quick Delay Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Quick-select delay
                </label>
                <div className="flex flex-wrap gap-2">
                  {[30, 60, 90, 180, 365, 730].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleQuickDelay(days)}
                      className="text-xs bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 font-semibold text-slate-650 dark:text-slate-400 transition-colors"
                    >
                      {days === 365 ? '1 Year' : days === 730 ? '2 Years' : `${days} Days`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Officers in Default & Repeat Default */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Officers in Default
                  </label>
                  <input
                    type="number"
                    value={officersCount}
                    onChange={e => setOfficersCount(Number(e.target.value))}
                    min={0}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                
                {['PAS-3', 'INC-22'].includes(formId) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Repeat Default?
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsRepeatDefault(!isRepeatDefault)}
                      className={`w-full py-2 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                        isRepeatDefault
                          ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-650 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isRepeatDefault ? 'Yes (18x rate)' : 'No'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30">
            <span>All calculations conform to MCA & Companies Act 2013 rules.</span>
          </div>
        </section>

        {/* Right: Results Display */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Result Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold font-heading text-navy dark:text-white">Calculation Breakdown</h2>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-xs bg-amber-400 hover:bg-amber-500 text-navy font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                {showShareSuccess ? 'Copied!' : 'Save/Share Result'}
              </button>
            </div>

            {isCalculating ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs mt-4 uppercase tracking-wider">Recalculating Exposure...</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Filing Cost Table */}
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-850 pb-2 mb-3">
                    Filing Cost Breakdown
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Normal Filing Fee (govt fee to file)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{formatINR(results.normalFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Additional Fee / Late Fee (Section 403)
                        {results.days > 0 && <span className="text-xs text-amber-600 dark:text-amber-500 block font-semibold mt-0.5">Delayed by {results.days} days</span>}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-500">{formatINR(results.lateFee)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-850 pt-2.5 mt-2.5 flex justify-between text-base font-extrabold text-navy dark:text-white">
                      <span className="font-heading">TOTAL PAYABLE TO MCA TODAY</span>
                      <span>{formatINR(results.totalPayable)}</span>
                    </div>
                  </div>
                </div>

                {/* Statutory Penalty Card */}
                {['MGT-7', 'MGT-7A', 'AOC-4', 'AOC-4-XBRL', 'AOC-4-CFS'].includes(formId) && (
                  <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4">
                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-850 pb-2 mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Adjudication Penalty Exposure (if ROC acts)
                      </h3>
                      {results.isSmallCompanyReliefApplied && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                          Section 446B relief applied ✓
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">On Company</span>
                        <span className="font-bold text-red-600 dark:text-red-400">{formatINR(results.companyPenalty)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">On Officers in Default ({officersCount} officers)</span>
                        <span className="font-bold text-red-600 dark:text-red-400">{formatINR(results.officerPenalty)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-855 pt-2.5 mt-2.5 flex justify-between font-bold text-red-650 dark:text-red-500">
                        <span className="font-heading">Total Maximum Penalty Exposure</span>
                        <span>{formatINR(results.totalPenaltyExposure)}</span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 italic mt-3 flex items-start gap-1.5 leading-relaxed border-t border-slate-200 dark:border-slate-850/60 pt-2.5 font-light">
                        <Info className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                        <span>Adjudication penalties are separate from daily portal late fees and must be explicitly imposed by a written ROC Adjudication Order.</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold font-heading text-navy dark:text-white mb-1">Penalty Growth over Time</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 mb-6">Click any bar to instantly set the calculator's delay to that period.</p>
            
            <div className="flex justify-between items-end h-32 pt-4 px-2">
              {[30, 60, 90, 180, 365].map(days => {
                const tempResult = calculateCompanyFee({
                  companyType,
                  authorizedCapital,
                  formId,
                  dueDate: '',
                  actualDate: '',
                  daysDelayed: days,
                  officersCount,
                  isRepeatDefault,
                })

                const maxVal = calculateCompanyFee({
                  companyType,
                  authorizedCapital,
                  formId,
                  dueDate: '',
                  actualDate: '',
                  daysDelayed: 365,
                  officersCount,
                  isRepeatDefault,
                }).totalPayable || 1000

                const heightPct = Math.max(10, Math.min(100, (tempResult.totalPayable / maxVal) * 100))
                const isActive = daysDelayed === days

                return (
                  <button
                    key={days}
                    onClick={() => handleQuickDelay(days)}
                    className="flex flex-col items-center w-1/6 group"
                  >
                    <span className="text-[10px] text-slate-550 dark:text-slate-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatINR(tempResult.totalPayable)}
                    </span>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-t-md h-24 flex items-end">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          isActive
                            ? 'bg-amber-400 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-amber-400/50'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 block">
                      {days === 365 ? '1 Year' : `${days}d`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legal provisions collapsible boxes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-heading text-navy dark:text-white">Relevant Legal Provisions</h3>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-4 text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-350 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/50 focus:outline-none">
                  <span>Section 403 — Late Filing Fee Rules</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-slate-400" />
                </summary>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 font-light bg-slate-50/50 dark:bg-slate-950/20">
                  <p>
                    Any document, fact or information required to be submitted, filed, registered or recorded with the Registrar under this Act, if not submitted or filed within the time specified in the relevant provision, may be submitted or filed after such time on payment of such <Link href="/glossary/section-403" className="text-amber-600 dark:text-amber-500 font-semibold underline">Section 403</Link> additional fee as may be prescribed.
                  </p>
                  <p>
                    For MGT-7 and AOC-4 annual returns, the second amendment rules of 2018 mandate an additional fee of <strong>₹100 per day</strong>.
                  </p>
                </div>
              </details>
            </div>

            {['MGT-7', 'MGT-7A'].includes(formId) && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-350 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/50 focus:outline-none">
                    <span>Section 92(5) — Annual Return Penalty</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light bg-slate-50/50 dark:bg-slate-950/20">
                    If any company fails to file its annual return under sub-section (4), before the expiry of the period specified therein, such company and its <Link href="/glossary/officer-in-default" className="text-amber-650 dark:text-amber-500 font-semibold underline">officer in default</Link> shall be liable to a penalty of ₹10,000 and in case of continuing failure, with a further penalty of ₹100 for each day after the first during which such failure continues, subject to a maximum of ₹2,00,000 in case of a company and ₹50,000 in case of an officer in default.
                  </div>
                </details>
              </div>
            )}

            {['AOC-4', 'AOC-4-XBRL', 'AOC-4-CFS'].includes(formId) && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-350 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/50 focus:outline-none">
                    <span>Section 137(3) — Financial Statements Penalty</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light bg-slate-50/50 dark:bg-slate-950/20">
                    If a company fails to file the copy of the financial statements under sub-section (1) or sub-section (2), as the case may be, before the expiry of the period specified therein, the company shall be liable to a penalty of ₹10,000 and in case of continuing failure, with a further penalty of ₹100 for each day during which such failure continues, subject to a maximum of ₹2,00,000 in case of a company and ₹50,000 in case of an officer in default.
                  </div>
                </details>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Static SEO Article Sections */}
      <article className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-200 dark:border-slate-800/60 mt-10 space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">How to Calculate MCA Late Fee for Companies?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            Under Section 403 of the Companies Act, 2013, companies that miss standard deadlines face daily late fees. For annual returns (Form MGT-7/7A) and financial statements (Form AOC-4), the Ministry of Corporate Affairs (MCA) charges a flat additional fee of <strong>₹100 per day</strong>. This fee accumulates indefinitely until the form is successfully uploaded to the MCA V3 portal.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            For other non-annual filings like DIR-12 or MGT-14, a time-slab multiplier applies to the normal fee, ranging from 2× up to 12×. If a company defaults on forms like PAS-3 or INC-22 twice within a 365-day window, a higher additional fee of <strong>18× the normal fee</strong> is triggered.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">What is the ROC Penalty for Non-Filing MGT-7 and AOC-4?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            It is critical to distinguish between portal late fees and ROC adjudication penalties. While late fees are paid automatically upon filing a delayed form, the Registrar of Companies (ROC) can initiate separate legal adjudication proceedings for non-compliance under Section 92(5) and Section 137(3).
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            For MGT-7, the statutory penalty starts at ₹10,000, with a continuing default rate of ₹100/day, capped at ₹2,00,000 for the company and ₹50,000 for each officer in default. For AOC-4, the continuing penalty is ₹1,000/day, capped at ₹10,000,000 for the company, ₹5,00,050 for the MD/CFO, and ₹1,00,000 for standard directors.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">Section 446B — Relief for Small Companies</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            Under Section 446B of the Companies Act, 2013, the government provides significant compliance relief for Small Companies, One Person Companies (OPCs), and Startups. If these entities default, all statutory penalties under the Act are capped at 50% of the standard penalty amounts. The calculator applies this relief automatically when selecting "Small Company" or "OPC" as the company type.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">Section 403 Penalty Calculator & Forms Summary</h2>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 font-semibold text-slate-650 dark:text-slate-400 uppercase">Form ID</th>
                  <th className="p-3 font-semibold text-slate-650 dark:text-slate-400 uppercase">Description</th>
                  <th className="p-3 font-semibold text-slate-650 dark:text-slate-400 uppercase">Governing Section</th>
                  <th className="p-3 font-semibold text-slate-650 dark:text-slate-400 uppercase">Portal Late Fee Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-light">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="p-3 font-bold text-navy dark:text-white">MGT-7 / 7A</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Company Annual Return</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Section 92</td>
                  <td className="p-3 text-amber-600 dark:text-amber-500 font-medium">₹100 / Day</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="p-3 font-bold text-navy dark:text-white">AOC-4</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Financial Statements Filing</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Section 137</td>
                  <td className="p-3 text-amber-600 dark:text-amber-500 font-medium">₹100 / Day</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="p-3 font-bold text-navy dark:text-white">DIR-3 KYC</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Director Annual KYC Update</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Rule 12A</td>
                  <td className="p-3 text-amber-600 dark:text-amber-500 font-medium">₹5,000 Flat</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="p-3 font-bold text-navy dark:text-white">PAS-3 / INC-22</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Allotment / Registered Office changes</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Sections 39 / 12</td>
                  <td className="p-3 text-amber-600 dark:text-amber-500 font-medium">Time Slab (Up to 18x repeat)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </article>

      {/* FAQs Accordion */}
      <section className="max-w-4xl mx-auto px-4 pb-20 border-t border-slate-200 dark:border-slate-800/60 pt-16">
        <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-8 text-center">Frequently Asked Questions (FAQs)</h2>
        <div className="space-y-4">
          {companyFaqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-5 text-left text-sm font-bold text-navy dark:text-white focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-950/50"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform text-slate-400 ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light bg-slate-50/50 dark:bg-slate-950/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
