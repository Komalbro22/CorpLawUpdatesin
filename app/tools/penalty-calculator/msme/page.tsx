'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { calculateMsmeInterest, calculateMsme1Penalty, formatINR, getDaysBetween } from '@/lib/penaltyCalculator'
import { ArrowLeft, Share2, Info, ChevronDown, AlertTriangle, Check } from 'lucide-react'

// FAQs for the MSME page
const msmeFaqs = [
  {
    q: 'What is the interest rate for delayed payment to MSME suppliers in 2025?',
    a: 'Under Section 16 of the MSMED Act, 2006, the interest rate is three times the RBI Bank Rate, compounded monthly. With the RBI Bank Rate at 5.55% (as of December 2025), the effective interest rate is 16.65% per annum. This rate changes whenever RBI revises the Bank Rate.',
  },
  {
    q: 'What is the 45-day rule under MSMED Act?',
    a: 'Under Section 15 of the MSMED Act, 2006, a buyer must pay a Micro or Small Enterprise supplier within the agreed date, provided it does not exceed 45 days from the date of acceptance of goods/services. If there is no written agreement, payment must be made within 15 days. Any delay beyond this triggers compound interest under Section 16.',
  },
  {
    q: 'Is MSME delayed payment interest compounded daily or monthly?',
    a: 'Under Section 16 of the MSMED Act, the compound interest is applied with monthly rests — meaning interest accrues on both principal and previously accumulated interest, recalculated at the end of each calendar month.',
  },
  {
    q: 'What is Form MSME-1 and what happens if it is not filed?',
    a: 'Form MSME-1 is a mandatory half-yearly return filed by "Specified Companies" with the ROC under Section 405 of the Companies Act, 2013. Companies must report all outstanding payments to Micro and Small Enterprise suppliers exceeding 45 days. If not filed, the company and each defaulting officer face a penalty of ₹20,000 fixed plus ₹1,000 per day, up to a maximum of ₹3,00,000 each under Section 405(4).',
  },
  {
    q: 'Is there a late fee on the MCA portal for delayed MSME-1 filing?',
    a: 'No. Unlike MGT-7 or AOC-4, Form MSME-1 does not carry a prescribed portal-level late fee under the Companies (Registration Offices and Fees) Rules. However, non-filing or late filing can still attract the adjudication penalty under Section 405(4) of the Companies Act, 2013.',
  },
  {
    q: 'Can Medium Enterprises claim interest under Section 16 of MSMED Act?',
    a: 'No. The delayed payment interest provisions under Sections 15–17 of the MSMED Act apply only to Micro and Small Enterprises. Medium Enterprises are not covered under the delayed payment protection. Similarly, Form MSME-1 covers only outstanding dues to Micro and Small suppliers — Medium Enterprise suppliers are excluded.',
  },
]

// JsonLd structure for MSME calculator
const seoJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'MSME Delayed Payment Interest Calculator 2026 — Section 16 MSMED Act | CorpLawUpdates',
      description: 'Calculate compound interest on delayed MSME payments at 3× RBI Bank Rate (monthly compounding) under Section 16 MSMED Act 2006. Also calculate Form MSME-1 non-filing adjudication penalty. Section 43B(h) IT Act alert included.',
      url: 'https://www.corplawupdates.in/tools/penalty-calculator/msme',
      keywords: 'MSME late fee calculator India, MSME delayed payment interest calculator, msme delayed payment interest calculation in excel, MSME late payment interest rate, MSME interest calculation from which date, MSME payment within 45 days, MSME samadhaan, msme late fee calculator 2022, MSME fee calculator India, MSME fee calculator ODR, msme interest calculator, How to calculate interest on late payment to MSME, What happens if MSME is not paid in 45 days, How is the MSME 45 days calculated, What is the interest rate for MSME payment, MSME late fee payment, MSME delayed payment act, What is the grace period for MSME, msme registration fees, MSME 45 day rule, Section 43B(h) MSME, MSME-1 penalty calculator',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
          { '@type': 'ListItem', position: 3, name: 'Penalty Calculator', item: 'https://www.corplawupdates.in/tools/penalty-calculator' },
          { '@type': 'ListItem', position: 4, name: 'MSME Calculator', item: 'https://www.corplawupdates.in/tools/penalty-calculator/msme' },
        ],
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MSME Delayed Payment Interest & Penalty Calculator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      url: 'https://www.corplawupdates.in/tools/penalty-calculator/msme',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      featureList: 'Section 16 MSMED interest, 3x RBI Bank Rate compound interest, monthly compounding, MSME-1 penalty calculator, Section 43B(h) tax alert, MSME Samadhaan guidance',
    },
    {
      '@type': 'FAQPage',
      mainEntity: msmeFaqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Calculate MSME Delayed Payment Interest',
      description: 'Calculate compound interest at 3x RBI Bank Rate on delayed payments to MSME suppliers.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Enter Invoice Amount', text: 'Enter the principal invoice/payment amount due to the MSME supplier.' },
        { '@type': 'HowToStep', position: 2, name: 'Enter Acceptance Date', text: 'Enter the date of acceptance (or deemed acceptance) of goods/services.' },
        { '@type': 'HowToStep', position: 3, name: 'Enter Payment Dates', text: 'Optionally enter agreed payment date (capped at 45 days). Enter actual payment date or check "not yet paid".' },
        { '@type': 'HowToStep', position: 4, name: 'Verify Bank Rate', text: 'Confirm the current RBI Bank Rate. Interest is calculated at exactly 3x this rate.' },
        { '@type': 'HowToStep', position: 5, name: 'Read Results', text: 'View interest accrued, total payable, monthly compounding schedule, and Section 43B(h) tax impact.' },
      ],
    },
    {
      '@type': 'SpecialAnnouncement',
      name: 'Section 43B(h) of Income Tax Act — MSME Payment Disallowance from AY 2024-25',
      text: 'From Assessment Year 2024-25, payments outstanding to Micro or Small Enterprises beyond 45 days are disallowed as business expenses under Section 43B(h) of the Income Tax Act, 1961. Interest under MSME Act is also non-deductible under Section 23.',
      category: 'GovernmentService',
      datePosted: '2023-04-01',
      expires: '2030-01-01',
    },
  ],
}

export default function MsmePenaltyCalculator() {
  const [activeTab, setActiveTab] = useState<'interest' | 'msme1'>('interest')
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Tab 1 state (MSME Delayed Payment Interest)
  const [invoiceAmount, setInvoiceAmount] = useState<number>(100000)
  const [acceptanceDate, setAcceptanceDate] = useState<string>('')
  const [agreedPaymentDate, setAgreedPaymentDate] = useState<string>('')
  const [actualPaymentDate, setActualPaymentDate] = useState<string>('')
  const [bankRate, setBankRate] = useState<number>(5.55)
  const [notYetPaid, setNotYetPaid] = useState<boolean>(false)
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false)

  // Tab 2 state (Form MSME-1)
  const [halfYear, setHalfYear] = useState<'Apr-Sep' | 'Oct-Mar'>('Apr-Sep')
  const [financialYear, setFinancialYear] = useState<string>('2025-26')
  const [msme1FilingDate, setMsme1FilingDate] = useState<string>('')
  const [msme1Days, setMsme1Days] = useState<number>(0)
  const [msme1Officers, setMsme1Officers] = useState<number>(2)
  const [isSmallCompany, setIsSmallCompany] = useState<boolean>(false)

  // Update payment date to today if "not yet paid" is toggled
  useEffect(() => {
    if (notYetPaid) {
      setActualPaymentDate(new Date().toISOString().split('T')[0])
    }
  }, [notYetPaid])

  // Tab 1 calculation
  const interestResult = calculateMsmeInterest({
    invoiceAmount,
    acceptanceDate,
    agreedPaymentDate,
    actualPaymentDate,
    bankRate,
  })

  // Tab 2 calculation
  const msme1Result = calculateMsme1Penalty({
    halfYear,
    financialYear,
    actualFilingDate: msme1FilingDate,
    daysDelayed: msme1Days,
    officersCount: msme1Officers,
    isSmallCompany,
  })

  // Update Tab 2 days when filing date/due date change
  useEffect(() => {
    if (msme1Result.dueDate && msme1FilingDate) {
      const days = getDaysBetween(msme1Result.dueDate, msme1FilingDate)
      setMsme1Days(days)
    }
  }, [msme1FilingDate, msme1Result.dueDate])

  const handleShareResult = () => {
    let text = ''
    if (activeTab === 'interest') {
      text = `MSME delayed payment interest for amount ${formatINR(invoiceAmount)} — ${interestResult.daysDelayed} days delay — Interest accrued: ${formatINR(interestResult.accruedInterest)} | Total payable: ${formatINR(interestResult.totalPayable)} — via corplawupdates.in`
    } else {
      text = `Form MSME-1 late filing penalty exposure for ${halfYear} FY ${financialYear} — ${msme1Days} days delay — MCA Portal Fee: ₹0 | ROC Adjudication Penalty: ${formatINR(msme1Result.totalPenaltyExposure)} — via corplawupdates.in`
    }
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
              MSME
            </span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
            MSME Delayed Payment Interest &amp; Penalty Calculator
          </h1>
          <p className="text-amber-400 text-xs font-semibold mt-1 mb-1 tracking-wide">
            Section 16 MSMED Act | 3× RBI Bank Rate | Monthly Compounding | Section 43B(h) Alert
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Calculate compound interest under Section 16 of the MSMED Act 2006, and evaluate Form MSME-1 non-filing adjudication penalties.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">🏭 MSMED Act 2006</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">📊 Monthly Compounding</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">⚠️ Sec 43B(h) Alert</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="max-w-3xl mx-auto px-4 mt-8 mb-4">
        <div className="flex bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-white/8 p-1 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('interest')}
            className={`flex-1 py-2.5 text-xs md:text-sm rounded-xl transition-all focus:outline-none ${
              activeTab === 'interest'
                ? 'bg-amber-400 text-navy shadow-md shadow-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
            }`}
          >
            Delayed Payment Interest (Section 16)
          </button>
          <button
            onClick={() => setActiveTab('msme1')}
            className={`flex-1 py-2.5 text-xs md:text-sm rounded-xl transition-all focus:outline-none ${
              activeTab === 'msme1'
                ? 'bg-amber-400 text-navy shadow-md shadow-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
            }`}
          >
            Form MSME-1 Non-Filing Penalty
          </button>
        </div>
      </div>

      {activeTab === 'interest' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">DEFAULT PERIOD</div>
              <div className="text-2xl font-black text-navy dark:text-white font-heading">{interestResult.daysDelayed > 0 ? `${interestResult.daysDelayed} Days` : '— Days'}</div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">INTEREST ACCRUED</div>
              <div className="text-2xl font-black text-amber-500 font-heading">{formatINR(interestResult.accruedInterest)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Compounded Monthly</div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">TOTAL PAYABLE</div>
              <div className="text-2xl font-black text-red-500 font-heading">{formatINR(interestResult.totalPayable)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Principal + Interest</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Inputs */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-5 py-3">
              <h2 className="text-sm font-bold font-heading text-navy dark:text-white">
                {activeTab === 'interest' ? 'Interest Calculator Parameters' : 'MSME-1 Penalty Parameters'}
              </h2>
            </div>
            
            <div className="p-5 space-y-5">
              {activeTab === 'interest' ? (
                // Tab 1 Inputs
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Invoice / Principal Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={invoiceAmount}
                      onChange={e => setInvoiceAmount(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Invoice amount"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Date of Acceptance / Deemed Acceptance
                    </label>
                    <input
                      type="date"
                      value={acceptanceDate}
                      onChange={e => setAcceptanceDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                      <span>Agreed Payment Date (Optional)</span>
                      <span className="text-[10px] text-slate-550 dark:text-slate-400 font-normal">Capped at 45 days from acceptance</span>
                    </label>
                    <input
                      type="date"
                      value={agreedPaymentDate}
                      onChange={e => setAgreedPaymentDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Actual Payment Date
                    </label>
                    <input
                      type="date"
                      value={actualPaymentDate}
                      onChange={e => setActualPaymentDate(e.target.value)}
                      disabled={notYetPaid}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="notYetPaid"
                      checked={notYetPaid}
                      onChange={e => setNotYetPaid(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 bg-white dark:bg-slate-950"
                    />
                    <label htmlFor="notYetPaid" className="text-xs font-semibold text-slate-650 dark:text-slate-400 cursor-pointer">
                      Payment not yet made (calculate up to today)
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                      <span>RBI Bank Rate (% p.a.)</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Bank Rate (5.55%) ≠ Repo Rate (5.25%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bankRate}
                      onChange={e => setBankRate(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                // Tab 2 Inputs
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Half-Year Period
                    </label>
                    <select
                      value={halfYear}
                      onChange={e => setHalfYear(e.target.value as 'Apr-Sep' | 'Oct-Mar')}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    >
                      <option value="Apr-Sep">April – September (Due Oct 31)</option>
                      <option value="Oct-Mar">October – March (Due Apr 30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Financial Year
                    </label>
                    <select
                      value={financialYear}
                      onChange={e => setFinancialYear(e.target.value)}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    >
                      <option value="2025-26">FY 2025-26</option>
                      <option value="2024-25">FY 2024-25</option>
                      <option value="2026-27">FY 2026-27</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Actual Filing Date
                    </label>
                    <input
                      type="date"
                      value={msme1FilingDate}
                      onChange={e => setMsme1FilingDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Days Delayed
                    </label>
                    <input
                      type="number"
                      value={msme1Days}
                      onChange={e => {
                        setMsme1Days(Number(e.target.value))
                        setMsme1FilingDate('')
                      }}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Officers in Default
                    </label>
                    <input
                      type="number"
                      value={msme1Officers}
                      onChange={e => setMsme1Officers(Number(e.target.value))}
                      min={0}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="isSmallCompany"
                      checked={isSmallCompany}
                      onChange={e => setIsSmallCompany(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 bg-white dark:bg-slate-950"
                    />
                    <label htmlFor="isSmallCompany" className="text-xs font-semibold text-slate-650 dark:text-slate-400 cursor-pointer">
                      Is OPC / Small Company? (Section 446B 50% relief)
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            MSME provisions comply with MSMED Act 2006 & Companies Act, 2013.
          </div>
        </section>

        {/* Right column: Results */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {activeTab === 'interest' ? (
            // Tab 1 Results (Compounding Interest)
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-heading text-navy dark:text-white">Delayed Payment Interest (Section 16)</h3>
                  <button
                    onClick={handleShareResult}
                    className="flex items-center gap-2 text-xs bg-amber-450 hover:bg-amber-500 text-navy font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {showShareSuccess ? 'Copied!' : 'Save/Share Result'}
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-y-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4">
                    <span className="text-slate-550 dark:text-slate-400">Invoice Principal:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-right">{formatINR(invoiceAmount)}</span>
                    
                    <span className="text-slate-550 dark:text-slate-400">Appointed Day:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-right">
                      {interestResult.appointedDay ? new Date(interestResult.appointedDay).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date'}
                    </span>
                    
                    <span className="text-slate-550 dark:text-slate-400 font-medium">Days Overdue:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-right">{interestResult.daysDelayed} days</span>
                    
                    <span className="text-slate-550 dark:text-slate-400">Effective Rate (3× Bank Rate):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-right">{interestResult.interestRate.toFixed(2)}% p.a.</span>
                    
                    <span className="text-slate-550 dark:text-slate-400">Compounding rests:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-right">Monthly</span>

                    <div className="col-span-2 border-t border-slate-200 dark:border-slate-800 my-2 pt-2 flex justify-between font-bold text-base">
                      <span className="text-amber-600 dark:text-amber-400 font-heading">Interest Accrued (Section 16):</span>
                      <span className="text-amber-600 dark:text-amber-400">{formatINR(interestResult.accruedInterest)}</span>
                    </div>

                    <div className="col-span-2 border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-lg font-extrabold text-navy dark:text-white">
                      <span className="font-heading">TOTAL AMOUNT PAYABLE:</span>
                      <span>{formatINR(interestResult.totalPayable)}</span>
                    </div>
                  </div>

                  {/* Tax disallowance alert box */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">⚠️ Tax Alert (Section 43B(h) & Section 23)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Interest paid to MSME suppliers is <strong>NOT tax-deductible</strong> under Section 23 of the MSMED Act. 
                      </p>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                        Additionally, the buyer cannot claim a business expense deduction for the principal invoice amount if outstanding beyond 45 days (Section 43B(h) of the Income Tax Act).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Month-by-month Compounding Schedule Table */}
              {interestResult.daysDelayed > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold font-heading text-navy dark:text-white mb-4">Monthly Accumulation Schedule</h4>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 font-bold">
                          <th className="p-3">Month / Part</th>
                          <th className="p-3">Days Elapsed</th>
                          <th className="p-3">Interest This Period</th>
                          <th className="p-3">Cumulative Interest</th>
                          <th className="p-3 text-right">Total Payable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {interestResult.schedule
                          .slice(0, showFullSchedule ? 12 : 5)
                          .map(item => (
                            <tr key={item.month}>
                              <td className="p-3 font-semibold text-slate-805 dark:text-white">Period {item.month}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{item.daysElapsed} days</td>
                              <td className="p-3 text-amber-600 dark:text-amber-400 font-medium">{formatINR(item.interestThisMonth)}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{formatINR(item.cumulativeInterest)}</td>
                              <td className="p-3 text-slate-850 dark:text-white text-right font-semibold">{formatINR(item.totalPayable)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {interestResult.schedule.length > 5 && (
                    <button
                      onClick={() => setShowFullSchedule(!showFullSchedule)}
                      className="w-full text-center text-xs font-bold text-amber-500 hover:text-amber-600 mt-4 focus:outline-none"
                    >
                      {showFullSchedule ? 'Show Less' : `Show All ${interestResult.schedule.length} Periods`}
                    </button>
                  )}
                </div>
              )}

              {/* MSEFC Samadhaan portal action box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <details className="group/details">
                  <summary className="flex justify-between items-center p-5 font-bold font-heading text-sm text-navy dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/50 focus:outline-none">
                    <span>How to recover outstanding MSME dues (MSME Samadhaan)</span>
                    <ChevronDown className="w-4.5 h-4.5 text-slate-500 transition-transform group-open/details:rotate-180" />
                  </summary>
                  <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-3 font-normal">
                    <p>
                      If a buyer disputes payment or delays it past the Appointed Day, MSME suppliers can file an online application at the <strong>MSME Samadhaan Portal</strong> (samadhaan.msme.gov.in) against the buyer.
                    </p>
                    <p>
                      Once filed, the case is routed to the local <strong>Micro and Small Enterprises Facilitation Council (MSEFC)</strong>. The Council acts as an arbitrator to resolve disputes. 
                    </p>
                    <p>
                      As per Section 18 of the MSMED Act, the MSEFC must decide the application within <strong>90 days</strong> from the date of reference.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          ) : (
            // Tab 2 Results (Form MSME-1 Penalty)
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-heading text-navy dark:text-white">Form MSME-1 Adjudication Penalty</h3>
                <button
                  onClick={handleShareResult}
                  className="flex items-center gap-2 text-xs bg-amber-450 hover:bg-amber-500 text-navy font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {showShareSuccess ? 'Copied!' : 'Save/Share Result'}
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-y-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955/50 rounded-xl p-4">
                  <span className="text-slate-550 dark:text-slate-400">Half-Year Period:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-right">{halfYear} FY {financialYear}</span>
                  
                  <span className="text-slate-550 dark:text-slate-400">Filing Due Date:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-right">
                    {msme1Result.dueDate ? new Date(msme1Result.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date'}
                  </span>
                  
                  <span className="text-slate-550 dark:text-slate-400">Days Delayed:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-right">{msme1Result.daysDelayed} days</span>
                  
                  <span className="text-slate-550 dark:text-slate-400">MCA Portal Late Fee:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-450 text-right">{formatINR(msme1Result.portalLateFee)} (Nil)</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      ROC Adjudication Penalty (Section 405(4))
                    </span>
                    {msme1Result.isSmallCompanyReliefApplied && (
                      <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border border-green-200 dark:border-green-800/40">
                        Section 446B relief applied ✓
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-650 dark:text-slate-400">On Company (₹20K + ₹1,000/day)</span>
                      <span className="font-bold text-red-600 dark:text-red-400">{formatINR(msme1Result.companyPenalty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-655 dark:text-slate-400">On Officers in Default ({msme1Officers} officers)</span>
                      <span className="font-bold text-red-600 dark:text-red-400">{formatINR(msme1Result.officerPenalty)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 flex justify-between font-bold text-red-600 dark:text-red-500 text-lg">
                      <span className="font-heading">Total Penalty Exposure:</span>
                      <span>{formatINR(msme1Result.totalPenaltyExposure)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-3 flex items-start gap-1 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                  <span>Specified companies must file Form MSME-1. Unlike other standard returns, there is no automatic portal late fee, but ROC can adjudicate penalty exposure up to ₹3L each on company/officers.</span>
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Static SEO Article Sections */}
      <article className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-200 dark:border-slate-800 mt-10 space-y-12">
        <section className="space-y-4 border-l-4 border-l-amber-500 pl-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">What is MSME Delayed Payment Interest Under Section 16?</h2>
          <p className="text-slate-605 dark:text-slate-400 text-sm leading-relaxed">
            Under Section 15 of the MSMED Act, 2006, buyers must make payments to Micro and Small enterprise suppliers within the agreed time, not exceeding <strong>45 days</strong> from acceptance. If no written contract exists, payment is due within <strong>15 days</strong>.
          </p>
          <p className="text-slate-605 dark:text-slate-400 text-sm leading-relaxed">
            If payment is delayed, Section 16 mandates compound interest at <strong>three times the RBI Bank Rate</strong>. This interest compiles on a <strong>monthly rest</strong> basis. As of December 2025, with the RBI Bank Rate set at 5.55%, the statutory compound interest rate is <strong>16.65% p.a.</strong>
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-l-amber-500 pl-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">Section 43B(h) — Why Delayed MSME Payments Also Hit Your Tax Deduction</h2>
          <p className="text-slate-605 dark:text-slate-400 text-sm leading-relaxed">
            Beginning in Assessment Year (AY) 2024-25, any outstanding payable to Micro or Small enterprise suppliers exceeding the 15/45-day deadline is disallowed as a business expense deduction under <strong>Section 43B(h)</strong> of the Income Tax Act, 1961. 
          </p>
          <p className="text-slate-605 dark:text-slate-400 text-sm leading-relaxed">
            The buyer is hit twice: first by the mandatory interest liability under the MSMED Act, and second by a higher income tax liability due to the disallowance of the principal amount as an expense.
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-l-amber-500 pl-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">What is Form MSME-1 and Who Must File It?</h2>
          <p className="text-slate-605 dark:text-slate-400 text-sm leading-relaxed">
            Form MSME-1 is a half-yearly return filed by specified companies that have outstanding dues exceeding 45 days to Micro and Small Enterprise suppliers. Specified companies are Pvt Ltd, Public Ltd, OPC, and Section 8 companies that meet these criteria. Note that <strong>Medium Enterprises are excluded</strong> from this reporting.
          </p>
        </section>

        <section className="space-y-4 border-l-4 border-l-amber-500 pl-4">
          <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">Penalty for Not Filing Form MSME-1</h2>
          <p className="text-slate-655 dark:text-slate-400 text-sm leading-relaxed">
            Under Section 405(4) of the Companies Act, 2013, failure to file MSME-1 carries an adjudication penalty starting at ₹20,000, with a continuing default penalty of ₹1,000 per day. The penalty is capped at ₹3,00,000 each for the company and officers in default. Small companies and OPCs receive a 50% penalty reduction under Section 446B.
          </p>
        </section>
      </article>

      {/* FAQs Accordion */}
      <section className="max-w-4xl mx-auto px-4 pb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
        <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-4 text-center">Frequently Asked Questions (FAQs)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center">Questions about MSME delayed payment interest, 45-day rule, Section 43B(h), MSME-1 filing, and MSME Samadhaan.</p>
        <div className="space-y-4">
          {msmeFaqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-5 text-left text-sm font-bold text-navy dark:text-white focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-950/50"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
