'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  calculateMsmeInterest,
  evaluateSupplierEligibility,
  SupplierEligibilityInput,
  SupplierEligibilityOutput,
  RateTransitionStrategy,
  MsmeInterestResult
} from '@/lib/penaltyCalculator'
import { generateMsmePdf } from '@/lib/pdf/generateMsmePdf'

export default function MSMEFeeCalc({ initialBankRate = '5.50' }: { initialBankRate?: string }) {
  // Step 1: Supplier Eligibility State
  const [enterpriseCategory, setEnterpriseCategory] = useState<'micro' | 'small' | 'medium' | 'large' | 'not_sure'>('micro')
  const [majorActivity, setMajorActivity] = useState<'manufacturing' | 'services' | 'trading_retail_wholesale' | 'not_sure'>('manufacturing')
  const [registrationType, setRegistrationType] = useState<'udyam' | 'uam' | 'em_part_2' | 'unregistered' | 'not_sure'>('udyam')
  const [registrationDate, setRegistrationDate] = useState('')
  const [relevantTransactionDate, setRelevantTransactionDate] = useState('')

  // Step 2: Invoice & Delivery / Dispute State
  const [invoiceAmount, setInvoiceAmount] = useState('100000')
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 60)
    return d.toISOString().split('T')[0]
  })
  const [hasWrittenObjection, setHasWrittenObjection] = useState(false)
  const [objectionDate, setObjectionDate] = useState('')
  const [objectionResolvedDate, setObjectionResolvedDate] = useState('')

  // Step 3: Payment Agreement Terms State
  const [hasAgreement, setHasAgreement] = useState(false)
  const [agreedPaymentDate, setAgreedPaymentDate] = useState('')

  // Step 4: Settlement & Rate Strategy State
  const [actualPaymentDate, setActualPaymentDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [rateStrategy, setRateStrategy] = useState<RateTransitionStrategy>('rest_anchor')
  const [isManualRateOverride, setIsManualRateOverride] = useState(false)
  const [bankRateOverride, setBankRateOverride] = useState(initialBankRate)

  // UI state
  const [result, setResult] = useState<MsmeInterestResult | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showFullSchedule, setShowFullSchedule] = useState(false)

  // Evaluate Supplier Eligibility in real time
  const eligibility: SupplierEligibilityOutput = useMemo(() => {
    return evaluateSupplierEligibility({
      enterpriseCategory,
      majorActivity,
      registrationType,
      registrationDate: registrationDate || undefined,
      relevantTransactionDate: relevantTransactionDate || deliveryDate || undefined
    })
  }, [enterpriseCategory, majorActivity, registrationType, registrationDate, relevantTransactionDate, deliveryDate])

  // Parse URL Search Parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.has('amt')) setInvoiceAmount(params.get('amt')!)
      if (params.has('dd')) setDeliveryDate(params.get('dd')!)
      if (params.has('ad')) setDeliveryDate(params.get('ad')!) // legacy alias
      if (params.has('obj')) setHasWrittenObjection(params.get('obj') === 'true')
      if (params.has('od')) setObjectionDate(params.get('od')!)
      if (params.has('ord')) setObjectionResolvedDate(params.get('ord')!)
      if (params.has('ha')) setHasAgreement(params.get('ha') === 'true')
      if (params.has('apd')) setAgreedPaymentDate(params.get('apd')!)
      if (params.has('act')) setActualPaymentDate(params.get('act')!)
      if (params.has('cat')) setEnterpriseCategory(params.get('cat') as any)
      if (params.has('actv')) setMajorActivity(params.get('actv') as any)
      if (params.has('strat')) setRateStrategy(params.get('strat') as any)
      if (params.has('bro')) {
        setIsManualRateOverride(true)
        setBankRateOverride(params.get('bro')!)
      }
    }
  }, [])

  const copyShareLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('amt', invoiceAmount)
    url.searchParams.set('dd', deliveryDate)
    if (hasWrittenObjection) {
      url.searchParams.set('obj', 'true')
      if (objectionDate) url.searchParams.set('od', objectionDate)
      if (objectionResolvedDate) url.searchParams.set('ord', objectionResolvedDate)
    }
    if (hasAgreement && agreedPaymentDate) {
      url.searchParams.set('ha', 'true')
      url.searchParams.set('apd', agreedPaymentDate)
    }
    url.searchParams.set('act', actualPaymentDate)
    url.searchParams.set('cat', enterpriseCategory)
    url.searchParams.set('actv', majorActivity)
    url.searchParams.set('strat', rateStrategy)
    if (isManualRateOverride) {
      url.searchParams.set('bro', bankRateOverride)
    }

    navigator.clipboard.writeText(url.toString())
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCalc = () => {
    const amt = parseFloat(invoiceAmount)
    if (isNaN(amt) || !isFinite(amt) || amt <= 0) {
      setResult(calculateMsmeInterest({
        invoiceAmount: 0,
        deliveryDate,
        actualPaymentDate
      }))
      return
    }

    const calc = calculateMsmeInterest({
      invoiceAmount: amt,
      deliveryDate,
      hasWrittenObjection,
      objectionDate: hasWrittenObjection ? objectionDate : undefined,
      objectionResolvedDate: hasWrittenObjection ? objectionResolvedDate : undefined,
      hasAgreement,
      agreedPaymentDate: hasAgreement ? agreedPaymentDate : undefined,
      actualPaymentDate,
      bankRateOverride: isManualRateOverride ? parseFloat(bankRateOverride) || 5.50 : null,
      rateStrategy
    })

    setResult(calc)
  }

  const handleDownloadPdf = () => {
    if (!result) return
    generateMsmePdf({
      invoiceAmount,
      deliveryDate,
      agreedPaymentDate: hasAgreement ? agreedPaymentDate : undefined,
      actualPaymentDate,
      bankRateOverride: isManualRateOverride ? bankRateOverride : undefined,
      eligibility,
      result
    })
  }

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Statutory Header Info */}
      <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-200 p-4 rounded-2xl mb-6 text-sm border border-purple-200 dark:border-purple-800/40">
        <div className="font-bold flex items-center gap-2 mb-1 text-purple-950 dark:text-purple-100">
          <span>⚖️</span> MSMED Act Chapter V Statutory Compounding Model
        </div>
        <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
          Payment is due on or before the agreed date (max <strong>45 days</strong>) or before the <strong>Appointed Day (Day 16)</strong> if no agreement exists. Beyond the due date, Section 16 mandates compound interest with calendar monthly rests at <strong>3x the RBI Bank Rate</strong>.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Supplier Eligibility Assessment */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">1</span>
              Supplier Eligibility Assessment
            </h3>
            {/* Status Badge */}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              eligibility.statusBadge === 'green'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : eligibility.statusBadge === 'red'
                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}>
              {eligibility.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Supplier Enterprise Category</label>
              <select
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={enterpriseCategory}
                onChange={(e) => setEnterpriseCategory(e.target.value as any)}
              >
                <option value="micro">Micro Enterprise (Investment ≤ ₹1 Cr & TO ≤ ₹5 Cr)</option>
                <option value="small">Small Enterprise (Investment ≤ ₹10 Cr & TO ≤ ₹50 Cr)</option>
                <option value="medium">Medium Enterprise (Investment ≤ ₹50 Cr & TO ≤ ₹250 Cr)</option>
                <option value="large">Large Enterprise (&gt; ₹250 Cr Turnover)</option>
                <option value="not_sure">Not Sure / Needs Verification</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Major Activity of Supplier</label>
              <select
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={majorActivity}
                onChange={(e) => setMajorActivity(e.target.value as any)}
              >
                <option value="manufacturing">Manufacturing</option>
                <option value="services">Services Provider</option>
                <option value="trading_retail_wholesale">Retail / Wholesale Trader (OM 02.07.2021)</option>
                <option value="not_sure">Not Sure</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Registration Type</label>
              <select
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={registrationType}
                onChange={(e) => setRegistrationType(e.target.value as any)}
              >
                <option value="udyam">Udyam Registration</option>
                <option value="uam">Udyog Aadhaar Memorandum (UAM)</option>
                <option value="em_part_2">Entrepreneurs Memorandum Part-II (EM-II)</option>
                <option value="unregistered">Unregistered</option>
                <option value="not_sure">Not Sure</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Relevant Transaction / Order Date</label>
              <input
                type="date"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={relevantTransactionDate || deliveryDate}
                onChange={(e) => setRelevantTransactionDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
            <strong>Statutory Reason:</strong> {eligibility.statutoryReason}
          </div>
        </div>

        {/* Step 2: Delivery & Dispute Resolution */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <h3 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">2</span>
            Invoice Amount & Delivery / Acceptance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invoice / Principal Amount (₹)</label>
              <input
                type="number"
                min="0"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-navy"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date of Delivery / Supply</label>
              <input
                type="date"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                <input
                  type="checkbox"
                  className="rounded text-navy focus:ring-navy"
                  checked={hasWrittenObjection}
                  onChange={(e) => setHasWrittenObjection(e.target.checked)}
                />
                Written objection raised within 15 days?
              </label>
            </div>

            {hasWrittenObjection && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Objection Served</label>
                  <input
                    type="date"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                    value={objectionDate}
                    onChange={(e) => setObjectionDate(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500">Must be within 15 days of delivery to be legally effective.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Objection Resolved</label>
                  <input
                    type="date"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                    value={objectionResolvedDate}
                    onChange={(e) => setObjectionResolvedDate(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500">Becomes the effective Day of Acceptance (Section 2(b)).</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step 3: Payment Agreement & Statutory 45-Day Cap */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <h3 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">3</span>
            Payment Agreement Terms & Statutory 45-Day Cap
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                <input
                  type="checkbox"
                  className="rounded text-navy focus:ring-navy"
                  checked={hasAgreement}
                  onChange={(e) => setHasAgreement(e.target.checked)}
                />
                Written Payment Agreement exists?
              </label>
            </div>

            {hasAgreement ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contractually Agreed Payment Date</label>
                <input
                  type="date"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                  value={agreedPaymentDate}
                  onChange={(e) => setAgreedPaymentDate(e.target.value)}
                />
                <p className="text-[10px] text-purple-600 dark:text-purple-400">
                  Note: Under Section 15 proviso, credit period cannot exceed 45 days.
                </p>
              </div>
            ) : (
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                No written agreement: Payment is due on or before Day 15; interest starts on Appointed Day (Day 16).
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Settlement Date & Rate Mode */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <h3 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">4</span>
            Settlement Date & RBI Bank Rate Selection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Actual Payment / Settlement Date</label>
              <input
                type="date"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={actualPaymentDate}
                onChange={(e) => setActualPaymentDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Intra-Month Rate Strategy</label>
              <select
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                value={rateStrategy}
                onChange={(e) => setRateStrategy(e.target.value as RateTransitionStrategy)}
              >
                <option value="rest_anchor">Rest Anchor Rate (Standard Statutory Method)</option>
                <option value="daily_prorated">Daily Prorated (Illustrative — Advanced)</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-navy focus:ring-navy"
                  checked={isManualRateOverride}
                  onChange={(e) => setIsManualRateOverride(e.target.checked)}
                />
                Override with custom Bank Rate?
              </label>

              {isManualRateOverride && (
                <div className="mt-2 space-y-1.5">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full md:w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Enter custom Bank Rate %"
                    value={bankRateOverride}
                    onChange={(e) => setBankRateOverride(e.target.value)}
                  />
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    * Manual override disables historical multi-rate resolution and applies a flat rate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleCalc}
          className="flex-1 py-3.5 px-6 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
        >
          Calculate Statutory MSME Interest
          <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
        <button
          onClick={copyShareLink}
          className="sm:w-auto px-6 py-3.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          {copiedLink ? 'Link Copied!' : 'Share Parameters'}
        </button>
      </div>

      {/* Results Card */}
      {result && (
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-heading m-0">Statutory Calculation Summary</h3>
              {result.methodologyStatus === 'VERIFIED_SECTION_16_MONTHLY_REST_METHOD' && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ✓ VERIFIED SECTION 16 MONTHLY REST METHOD
                </span>
              )}
              {result.methodologyStatus === 'ILLUSTRATIVE_METHOD' && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ⓘ ILLUSTRATIVE METHOD
                </span>
              )}
              {result.methodologyStatus === 'LEGAL_VERIFICATION_REQUIRED' && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  ⚠️ LEGAL VERIFICATION REQUIRED
                </span>
              )}
            </div>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download PDF Report
            </button>
          </div>

          {result.warnings.length > 0 && (
            <div className="mb-5 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-1">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span>⚠️</span> {w}
                </p>
              ))}
            </div>
          )}

          {result.rateAudit.statusDisclaimer && (
            <div className="mb-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
              ℹ️ <strong>Rate Transition Notice:</strong> {result.rateAudit.statusDisclaimer}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Principal Invoice Amount</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">₹ {Math.round(result.principal).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Effective Acceptance Date</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.effectiveAcceptanceDate} ({result.acceptanceModality})</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Statutory Due Date</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {result.dueDate} {result.statutoryCapApplied && <span className="text-xs text-purple-600 dark:text-purple-400">(45-Day Cap)</span>}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Appointed Day (Day 16)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.appointedDay}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Interest Accrual Start Date</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.interestStartDate}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Days Past Statutory Due Date</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.daysPastDueDate} Days</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Interest-Bearing Days</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {result.interestBearingDays} Days {result.interestBearingDays > 0 && <span className="text-xs text-slate-500 font-normal">({result.interestAccrualPeriod.from} to {result.interestAccrualPeriod.to})</span>}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Statutory Interest Rate (3x Bank Rate)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {result.appliedStatutoryRate.toFixed(2)}% p.a. {result.rateAudit.isHistoricalMultiRate && <span className="text-xs text-purple-600 dark:text-purple-400">(Multi-Period Dynamic)</span>}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Total Statutory Interest Accrued</span>
              <span className={`font-bold ${result.accruedInterest > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                ₹ {Math.round(result.accruedInterest).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Total Amount Payable</span>
              <span className="text-2xl font-black text-navy dark:text-white">₹ {Math.round(result.totalPayable).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Monthly Rests Schedule Table */}
          {result.schedule && result.schedule.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Monthly Compounding Schedule ({result.schedule.length} Rests)
                </h4>
                {result.schedule.length > 12 && (
                  <button
                    onClick={() => setShowFullSchedule(!showFullSchedule)}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {showFullSchedule ? 'Show First 12 Months' : `View All ${result.schedule.length} Months`}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Rest</th>
                      <th className="px-3 py-2 font-semibold">Period</th>
                      <th className="px-3 py-2 font-semibold text-right">Days</th>
                      <th className="px-3 py-2 font-semibold text-right">Rate p.a.</th>
                      <th className="px-3 py-2 font-semibold text-right">Opening Bal. (₹)</th>
                      <th className="px-3 py-2 font-semibold text-right">Monthly Int. (₹)</th>
                      <th className="px-3 py-2 font-semibold text-right">Closing Bal. (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                    {(showFullSchedule ? result.schedule : result.schedule.slice(0, 12)).map((item) => (
                      <tr key={item.month} className="hover:bg-slate-50 dark:hover:bg-slate-850/40">
                        <td className="px-3 py-2 font-medium">Month {item.month}</td>
                        <td className="px-3 py-2 font-mono text-[11px]">{item.periodStart} to {item.periodEnd}</td>
                        <td className="px-3 py-2 text-right font-mono">{item.daysInPeriod}</td>
                        <td className="px-3 py-2 text-right font-mono">{item.appliedStatutoryRate.toFixed(2)}%</td>
                        <td className="px-3 py-2 text-right font-mono">{Math.round(item.openingPrincipal).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-right font-mono text-red-600 dark:text-red-400 font-bold">{Math.round(item.interestThisMonth).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-100 font-bold">{Math.round(item.totalPayable).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                * Compounding occurs at the end of each calendar monthly rest. Interest paid or payable is strictly non-deductible under Section 23 of the MSMED Act.
              </p>
            </div>
          )}

          {/* Statutory & Informational Disclaimer */}
          <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>⚖️</span> Statutory Estimation Disclaimer
            </p>
            <p>
              This calculation is an automated estimate generated for informational and reference purposes only under Sections 15 &amp; 16 of the MSMED Act, 2006. It does not constitute legal advice, a statutory certificate, formal audit, or adjudication. Actual delayed payment interest liability is subject to verified invoice acceptance dates, formal written objection records, contractual credit terms, and applicable judicial determinations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
