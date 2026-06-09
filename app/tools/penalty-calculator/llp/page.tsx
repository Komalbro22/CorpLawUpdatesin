'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { calculateLlpFee, formatINR, getDaysBetween } from '@/lib/penaltyCalculator'
import { ArrowLeft, Share2, Info, ChevronDown } from 'lucide-react'

// FAQs for the LLP page
const llpFaqs = [
  {
    q: 'What is the late fee for LLP Form 8 in 2025?',
    a: '₹100 per day from the day after October 30 (the due date). There is no upper cap. This is prescribed under Rule 37 of the LLP Rules, 2009.',
  },
  {
    q: 'What is the due date for LLP Form 11?',
    a: 'LLP Form 11 (Annual Return) must be filed by May 30 of each year under Section 35 of the LLP Act, 2008.',
  },
  {
    q: 'Is there a late fee for LLP Form 11?',
    a: 'Yes. The penalty is ₹100 per day per form from the date of default, with no maximum cap.',
  },
  {
    q: 'What is a Small LLP?',
    a: 'Small LLP is one with turnover not exceeding ₹40 lakh and partner contribution not exceeding ₹25 lakh in the preceding financial year. Small LLPs pay lower normal filing fees.',
  },
  {
    q: 'Can an LLP be struck off for non-filing?',
    a: 'Yes. If an LLP fails to file Form 8 and Form 11 for two or more consecutive financial years, the Registrar may initiate strike-off proceedings under Rule 37A of the LLP Rules.',
  },
]

// JsonLd structure for LLP calculator
const seoJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'LLP Annual Filing Penalty & Late Fee Calculator 2026 — Form 8 & Form 11 | CorpLawUpdates',
      description: 'Calculate LLP Form 8 and Form 11 late fees at ₹100/day with no maximum cap. Includes contribution-based normal fees, Section 34(3) & 35(3) adjudication penalties. Free LLP fee calculator India.',
      url: 'https://www.corplawupdates.in/tools/penalty-calculator/llp',
      keywords: 'LLP fee calculator India, ROC fees calculator, MCA fees calculator v3, MCA LLP fee calculator, LLP Form 8 late fee calculator, LLP late fee calculator India, LLP late fee calculator MCA, LLP Form 3 late fee calculator, Form 11 LLP late fees calculator, MCA late fees calculator, ADT-1 fees calculator, LLP late calculator India, ROC late filing penalty calculator, authorised capital fees calculator, MCA stamp duty calculator, MCA fees calculator v2, What is the late fee for LLP, What is the maximum late filing fee, How to calculate late fee in MCA',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
          { '@type': 'ListItem', position: 3, name: 'Penalty Calculator', item: 'https://www.corplawupdates.in/tools/penalty-calculator' },
          { '@type': 'ListItem', position: 4, name: 'LLP Calculator', item: 'https://www.corplawupdates.in/tools/penalty-calculator/llp' },
        ],
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'LLP Annual Filing Penalty & Late Fee Calculator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      url: 'https://www.corplawupdates.in/tools/penalty-calculator/llp',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      featureList: 'LLP Form 8 late fee, LLP Form 11 late fee, ₹100 per day penalty, Small LLP fee concession, Designated Partner penalty, Section 34/35 LLP Act',
    },
    {
      '@type': 'FAQPage',
      mainEntity: llpFaqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Calculate LLP Late Filing Fee',
      description: 'Calculate LLP Form 8 and Form 11 additional fees at ₹100/day.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Select LLP Type', text: 'Choose Regular LLP or Small LLP (turnover under ₹40L, contribution under ₹25L).' },
        { '@type': 'HowToStep', position: 2, name: 'Enter Contribution', text: 'Enter total partner contribution or select a contribution slab.' },
        { '@type': 'HowToStep', position: 3, name: 'Select Form', text: 'Select Form 8 (due Oct 30) or Form 11 (due May 30).' },
        { '@type': 'HowToStep', position: 4, name: 'Enter Filing Date', text: 'Enter the actual or planned filing date. Days delayed are auto-calculated.' },
        { '@type': 'HowToStep', position: 5, name: 'Read Results', text: 'View normal fee, late fee at ₹100/day, total MCA fee, and statutory penalty exposure.' },
      ],
    },
  ],
}

export default function LlpPenaltyCalculator() {
  const [llpType, setLlpType] = useState<'Regular' | 'Small'>('Regular')
  const [contribution, setContribution] = useState<number>(100000)
  const [formId, setFormId] = useState<'Form-8' | 'Form-11'>('Form-11')
  const [dueDate, setDueDate] = useState<string>('')
  const [actualDate, setActualDate] = useState<string>('')
  const [daysDelayed, setDaysDelayed] = useState<number>(0)
  const [dpCount, setDpCount] = useState<number>(2)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Autocomplete standard due dates when form selection changes
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    if (formId === 'Form-11') {
      setDueDate(`${currentYear}-05-30`)
    } else {
      setDueDate(`${currentYear}-10-30`)
    }
  }, [formId])

  // Calculations
  const results = calculateLlpFee({
    llpType,
    contribution,
    formId,
    dueDate,
    actualDate,
    daysDelayed,
    dpCount,
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
    const text = `${formId} late fee for ${llpType} LLP (Contribution ${formatINR(contribution)}) — ${daysDelayed} days delay — Total MCA fee: ${formatINR(results.totalPayable)} | Penalty exposure: ${formatINR(results.totalPenaltyExposure)} — via corplawupdates.in`
    navigator.clipboard.writeText(text).then(() => {
      setShowShareSuccess(true)
      setTimeout(() => setShowShareSuccess(false), 2500)
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <JsonLd data={seoJsonLd as any} />
      
      {/* Page header */}
      <div className="bg-navy py-10 px-4">
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
              LLP
            </span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
            LLP Annual Filing Penalty & Late Fee Calculator
          </h1>
          <p className="text-amber-400 text-xs font-semibold mt-1 mb-1 tracking-wide">
            LLP Form 8 Late Fee | Form 11 Penalty | ₹100/Day | No Maximum Cap
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Calculate contribution-based filing fees, ₹100/day statutory late fees for Form 8 & Form 11, and Designated Partner penalty exposures.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">📋 Form 8 &amp; Form 11</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">⚡ ₹100/Day Unlimited</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">🆓 Free Calculator</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-2xl p-4 shadow-sm text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">TOTAL MCA FEE</div>
            <div className="text-2xl font-black text-amber-500 font-heading">{formatINR(results.totalPayable)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Includes standard filing fees</div>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-2xl p-4 shadow-sm text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">PENALTY EXPOSURE</div>
            <div className="text-2xl font-black text-red-500 font-heading">{formatINR(results.totalPenaltyExposure)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sec 34(3) &amp; 35(3) liability</div>
          </div>
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
              {/* LLP Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  LLP Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Regular', 'Small'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLlpType(type)}
                      className={`text-xs py-2 px-4 font-semibold rounded-lg border transition-all ${
                        llpType === type
                          ? 'border-amber-450 bg-amber-400/10 text-amber-705 dark:text-amber-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {type} LLP
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Partner Contribution */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Total Partner Contribution (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={contribution}
                    onChange={e => setContribution(Number(e.target.value))}
                    className="flex-1 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-805 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="e.g. 100000"
                  />
                  <select
                    onChange={e => setContribution(Number(e.target.value))}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 text-xs font-semibold text-slate-600 dark:text-slate-400 focus:outline-none"
                  >
                    <option value={100000}>Slabs (Select)</option>
                    <option value={100000}>Up to ₹1,00,000</option>
                    <option value={500000}>₹1,00,001 – ₹5,00,000</option>
                    <option value={1000000}>₹5,00,001 – ₹10,00,000</option>
                    <option value={2500000}>₹10,00,001 – ₹25,00,000</option>
                    <option value={10000000}>₹25,00,001 – ₹1,00,00,000</option>
                    <option value={100000000}>Above ₹1,00,00,050</option>
                  </select>
                </div>
              </div>

              {/* Select LLP Form */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select LLP Form
                </label>
                <select
                  value={formId}
                  onChange={e => setFormId(e.target.value as 'Form-8' | 'Form-11')}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-805 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  <option value="Form-11">Form 11 (Annual Return)</option>
                  <option value="Form-8">Form 8 (Statement of Accounts & Solvency)</option>
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
                    className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                    className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                  className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                      className="text-xs bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 font-semibold text-slate-650 dark:text-slate-400 transition-colors"
                    >
                      {days === 365 ? '1 Year' : days === 730 ? '2 Years' : `${days} Days`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Designated Partners Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Designated Partners
                </label>
                <input
                  type="number"
                  value={dpCount}
                  onChange={e => setDpCount(Number(e.target.value))}
                  min={2}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30">
            <span>All calculations conform to LLP Act 2008 & LLP Rules 2009.</span>
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
                <p className="text-slate-505 text-xs mt-4 uppercase tracking-wider">Recalculating Exposure...</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Filing Cost Table */}
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4">
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-850 pb-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Filing Cost Breakdown
                    </h3>
                    {results.isSmallLlp && (
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                        Small LLP fee applied ✓
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Normal Filing Fee (govt fee to file)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{formatINR(results.normalFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Additional Fee / Late Fee (Section 34/35 Rules)
                        {results.days > 0 && <span className="text-xs text-amber-605 dark:text-amber-500 block font-semibold mt-0.5 font-light">Delayed by {results.days} days</span>}
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
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955/50 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-850 pb-2 mb-3">
                    Statutory Penalty Exposure (Registrar Action)
                  </h3>
                  
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">On LLP (₹100/day continues)</span>
                      <span className="font-bold text-red-650 dark:text-red-400">{formatINR(results.llpPenalty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">On Designated Partners ({dpCount} DPs at ₹100/day)</span>
                      <span className="font-bold text-red-650 dark:text-red-400">{formatINR(results.dpPenalty)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-855 pt-2.5 mt-2.5 flex justify-between font-bold text-red-650 dark:text-red-500">
                      <span className="font-heading">Total Maximum Penalty Exposure</span>
                      <span>{formatINR(results.totalPenaltyExposure)}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 rounded-xl p-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 rounded-full border border-red-200 dark:border-red-700/40">HIGH RISK</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2 mb-1">LLP Entity Penalty</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">Registrar may initiate adjudication. ₹100/day — no upper cap — under Sec 34(3) LLP Act.</p>
                  </div>
                  <div className="border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded-full border border-amber-200 dark:border-amber-700/40">MEDIUM RISK</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2 mb-1">Designated Partner Liability</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">Each DP liable at ₹100/day under Sec 35(3) LLP Act. Max ₹50,000 per partner.</p>
                  </div>
                </div>

                {/* Warning message */}
                {daysDelayed > 730 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">⚠️ Strike-Off Risk Alert</p>
                      <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-light mt-1">
                        Prolonged non-filing (beyond 2 years) may trigger strike-off by Registrar.
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
                const tempResult = calculateLlpFee({
                  llpType,
                  contribution,
                  formId,
                  dueDate: '',
                  actualDate: '',
                  daysDelayed: days,
                  dpCount,
                })

                const maxVal = calculateLlpFee({
                  llpType,
                  contribution,
                  formId,
                  dueDate: '',
                  actualDate: '',
                  daysDelayed: 365,
                  dpCount,
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
                    <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 mt-2 block">
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
                  <span>Section 34 & 35 LLP Act — Late Fees</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-slate-400" />
                </summary>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-450 leading-relaxed space-y-2 font-light bg-slate-50/50 dark:bg-slate-955/20">
                  <p>
                    Under Rule 37 and Annexure A of the LLP Rules 2009, if an LLP fails to file Form 8 (Solvency Statement) or Form 11 (Annual Return) on time, it is liable to pay an <Link href="/glossary/additional-fee" className="text-amber-600 dark:text-amber-500 font-semibold underline">Additional Fee</Link> of <strong>₹100 per day</strong> for each day of delay.
                  </p>
                  <p>
                    Unlike standard companies, LLP late fees do not scale down or cap; they accumulate indefinitely at ₹100/day.
                  </p>
                </div>
              </details>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-4 text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-350 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/50 focus:outline-none">
                  <span>Section 34(4) & 35(3) — Statutory Adjudication Penalties</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-slate-400" />
                </summary>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-light bg-slate-50/50 dark:bg-slate-955/20">
                  If an LLP fails to file its statement of accounts or annual return, the LLP and its designated partners are liable to pay a penalty of ₹100 for each day during which such failure continues, without any maximum cap under the amended provisions of the LLP Act, 2008.
                </div>
              </details>
            </div>
          </div>
        </section>
      </div>

      {/* Static SEO Article Sections */}
      <article className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-200 dark:border-slate-800/60 mt-10 space-y-12">
        <section className="space-y-4 border-l-4 border-l-amber-500 pl-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">LLP Form 8 Late Fee — ₹100 Per Day with No Upper Limit</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            Form 8 is the Statement of Account and Solvency that every Limited Liability Partnership must file within 30 days from the end of six months of the financial year (i.e. by <strong>October 30</strong> each year). If missed, Rule 37 of the LLP Rules mandates a late fee of <strong>₹100 per day</strong>.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            Unlike private limited companies which enjoy schemes or minor caps on select forms, there is no maximum limit or cap on the late fees accumulated by an LLP. The daily ₹100 late fee continues to grow until the form is uploaded and registered on the MCA portal.
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-l-amber-500 pl-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">LLP Form 11 Penalty — Annual Return Filing Due May 30</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            LLP Form 11 is the Annual Return of the partnership, which must be submitted to the Registrar within 60 days of the close of the financial year (meaning the due date is <strong>May 30</strong> each year). The penalty for delayed filing of Form 11 is also <strong>₹100 per day</strong>.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            This late fee is paid directly on the portal. Designated partners must ensure timely filing to avoid deactivation of DPINs and potential prosecution under the LLP Act, 2008.
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-l-amber-500 pl-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">What Happens If LLP Does Not File for 2+ Years?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
            If an LLP fails to file Form 8 and Form 11 for two or more consecutive financial years, the Registrar of Companies (ROC) is empowered to strike off the name of the LLP from the register under Rule 37A of the LLP Rules. Additionally, the LLP cannot be closed voluntarily or transformed into a company unless all pending annual returns are filed first.
          </p>
        </section>
      </article>

      {/* FAQs Accordion */}
      <section className="max-w-4xl mx-auto px-4 pb-20 border-t border-slate-200 dark:border-slate-800/60 pt-16">
        <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-4 text-center">Frequently Asked Questions (FAQs)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center">Common questions about LLP late fee for Form 8 and Form 11, MCA calculator, and penalty provisions.</p>
        <div className="space-y-4">
          {llpFaqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-5 text-left text-sm font-bold text-navy dark:text-white focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-950/50"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform text-slate-400 ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light bg-slate-50/50 dark:bg-slate-955/20">
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
