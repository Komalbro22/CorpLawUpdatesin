'use client'

import { useState, useEffect } from 'react'
import {
  calculateLlpFee,
  evaluateSmallLlpStatus,
  getLlpStatutoryDueDate,
  LlpFormId,
  Form3Modality,
  Form8ChargeModality,
  Form15Scenario,
  LlpCalculationResult,
} from '@/lib/penaltyCalculator'
import { generateLlpPdf } from '@/lib/pdf/generateLlpPdf'

const FINANCIAL_YEAR_OPTIONS = [
  { value: '2025-26', label: 'FY 2025-26 (Ending 31 Mar 2026)' },
  { value: '2024-25', label: 'FY 2024-25 (Ending 31 Mar 2025)' },
  { value: '2023-24', label: 'FY 2023-24 (Ending 31 Mar 2024)' },
  { value: '2022-23', label: 'FY 2022-23 (Ending 31 Mar 2023)' },
  { value: '2021-22', label: 'FY 2021-22 (Ending 31 Mar 2022)' },
]

export default function LLPFeeCalc() {
  // Form Configuration
  const [formId, setFormId] = useState<LlpFormId>('Form-8-Annual')
  const [financialYear, setFinancialYear] = useState('2025-26')
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [actualFilingDate, setActualFilingDate] = useState(() => new Date().toISOString().slice(0, 10))
  
  // Entity Financials
  const [contribution, setContribution] = useState('1000000') // ₹10 Lakhs default
  const [turnover, setTurnover] = useState('2000000') // ₹20 Lakhs default
  const [dpCount, setDpCount] = useState('2')
  
  // Modality Specifics
  const [form3Modality, setForm3Modality] = useState<Form3Modality>('initial')
  const [cNew, setCNew] = useState('2500000') // New contribution if increased
  const [form8ChargeModality, setForm8ChargeModality] = useState<Form8ChargeModality>('creation')
  const [form15Scenario, setForm15Scenario] = useState<Form15Scenario>('within_local_limits')

  // Form 24 Checklist State
  const [f24Cessation, setF24Cessation] = useState(true)
  const [f24NoLiabilities, setF24NoLiabilities] = useState(true)
  const [f24FilingsDone, setF24FilingsDone] = useState(true)
  const [f24CaStatement, setF24CaStatement] = useState(true)

  // Calculation Results & UI State
  const [result, setResult] = useState<LlpCalculationResult | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  // Live Small LLP Assessment
  const numContrib = parseFloat(contribution) || 0
  const numTurnover = turnover !== '' ? parseFloat(turnover) : undefined
  const smallLlpAssessment = evaluateSmallLlpStatus(numContrib, numTurnover)

  // Sync URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.has('form')) {
        const f = params.get('form') as LlpFormId
        if (['Form-8-Annual', 'Form-8-Charge', 'Form-11', 'Form-3', 'Form-4', 'Form-5', 'Form-15', 'Form-24', 'Form-8'].includes(f)) {
          setFormId(f === 'Form-8' ? 'Form-8-Annual' : f)
        }
      }
      if (params.has('cap')) setContribution(params.get('cap')!)
      if (params.has('turnover')) setTurnover(params.get('turnover')!)
      if (params.has('fy')) setFinancialYear(params.get('fy')!)
      if (params.has('event')) setEventDate(params.get('event')!)
      if (params.has('fileDate')) setActualFilingDate(params.get('fileDate')!)
      if (params.has('dp')) setDpCount(params.get('dp')!)
    }
  }, [])

  // Auto calculate whenever relevant parameters change
  useEffect(() => {
    handleCalculate()
  }, [
    formId,
    contribution,
    turnover,
    financialYear,
    eventDate,
    actualFilingDate,
    dpCount,
    form3Modality,
    cNew,
    form8ChargeModality,
    form15Scenario,
  ])

  const handleCalculate = () => {
    const c = parseFloat(contribution) || 0
    const t = turnover !== '' ? parseFloat(turnover) : undefined
    const dp = parseInt(dpCount) || 2
    const numCNew = form3Modality === 'modification_with_contrib' ? (parseFloat(cNew) || c) : undefined

    const calcResult = calculateLlpFee({
      formId,
      contribution: c,
      turnover: t,
      financialYear,
      eventDate,
      actualDate: actualFilingDate,
      dpCount: dp,
      form3Modality,
      cNew: numCNew,
      form8ChargeModality,
      form15Scenario,
    })

    setResult(calcResult)
  }

  const copyShareLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('form', formId)
    url.searchParams.set('cap', contribution)
    if (turnover) url.searchParams.set('turnover', turnover)
    url.searchParams.set('fy', financialYear)
    url.searchParams.set('event', eventDate)
    url.searchParams.set('fileDate', actualFilingDate)
    url.searchParams.set('dp', dpCount)
    navigator.clipboard.writeText(url.toString())
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleDownloadPdf = async () => {
    if (!result) return
    setIsPdfGenerating(true)
    try {
      generateLlpPdf({
        params: {
          formId,
          contribution: numContrib,
          turnover: numTurnover,
          financialYear,
          eventDate,
          actualDate: actualFilingDate,
          dpCount: parseInt(dpCount) || 2,
          form3Modality,
          cNew: parseFloat(cNew) || numContrib,
          form8ChargeModality,
          form15Scenario,
        },
        result,
      })
    } catch (e) {
      console.error('PDF Generation failed:', e)
    } finally {
      setIsPdfGenerating(false)
    }
  }

  const isAnnualForm = formId === 'Form-8-Annual' || formId === 'Form-11'
  const isForm3 = formId === 'Form-3'
  const isForm8Charge = formId === 'Form-8-Charge'
  const isForm15 = formId === 'Form-15'
  const isForm24 = formId === 'Form-24'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Notice Banner */}
      <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 p-4 sm:p-5 rounded-2xl text-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⚖️</span>
          <div>
            <strong className="font-semibold">Statutory Schedule Active:</strong> Additional filing fees are calculated per the{' '}
            <strong>LLP (Second Amendment) Rules, 2022</strong>. Statutory adjudication penalties under Sections 34(5) & 35(2) are assessed separately.
          </div>
        </div>
        <div className="shrink-0 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          Annexure-A Sched.
        </div>
      </div>

      {/* Input Workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <h2 className="text-xl font-bold text-navy dark:text-white font-heading">
            1. Select LLP Form & Entity Financials
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose the compliance form and provide entity parameters to assess statutory fees and Small LLP qualification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Filing Form
            </label>
            <select
              value={formId}
              onChange={(e) => setFormId(e.target.value as LlpFormId)}
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
            >
              <optgroup label="Annual Filings">
                <option value="Form-8-Annual">Form 8 — Statement of Account & Solvency (Annual)</option>
                <option value="Form-11">Form 11 — Annual Return of LLP</option>
              </optgroup>
              <optgroup label="Event-Based Filings">
                <option value="Form-3">Form 3 — LLP Agreement & Changes Therein</option>
                <option value="Form-4">Form 4 — Notice of Partner / Designated Partner Change</option>
                <option value="Form-5">Form 5 — Notice for Change of Name</option>
                <option value="Form-15">Form 15 — Notice for Change of Registered Office</option>
                <option value="Form-8-Charge">Form 8 (Charge) — Creation / Modification / Satisfaction of Charge</option>
              </optgroup>
              <optgroup label="Closure / Strike-off">
                <option value="Form-24">Form 24 — Application for Striking off Name (Closure)</option>
              </optgroup>
            </select>
          </div>

          {/* Contribution */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Total Contribution of LLP (₹)
            </label>
            <input
              type="number"
              min="0"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
              placeholder="e.g. 1000000"
            />
            <p className="text-[11px] text-slate-400">
              Contribution determines normal fee slab under Annexure-A Table A.
            </p>
          </div>

          {/* Preceding FY Turnover */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Preceding FY Turnover (₹)
            </label>
            <input
              type="number"
              min="0"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
              placeholder="e.g. 2000000"
            />
            <p className="text-[11px] text-slate-400">
              From latest Statement of Account & Solvency (Small LLP threshold: ≤ ₹40L).
            </p>
          </div>

          {/* Live Small LLP Qualification Card */}
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Small LLP Assessment
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {smallLlpAssessment.assessmentBasis}
              </div>
            </div>
            <span
              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
                smallLlpAssessment.isSmallLlp
                  ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
              }`}
            >
              {smallLlpAssessment.isSmallLlp ? '✓ Small LLP' : 'Regular LLP'}
            </span>
          </div>

          {/* Designated Partners Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Designated Partners (DPs) Count
            </label>
            <input
              type="number"
              min="2"
              value={dpCount}
              onChange={(e) => setDpCount(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
            />
            <p className="text-[11px] text-slate-400">
              Used to calculate statutory penalty exposure under Sections 34(5) / 35(2).
            </p>
          </div>

          {/* Form-Specific Dynamic Fields */}
          {isAnnualForm && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Financial Year
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
              >
                {FINANCIAL_YEAR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Statutory Due Date: {formId === 'Form-11' ? '30 May (T + 60 days)' : '30 October (T + 30 days from 30 Sep)'}.
              </p>
            </div>
          )}

          {isForm3 && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Form 3 Agreement Modality
                </label>
                <select
                  value={form3Modality}
                  onChange={(e) => setForm3Modality(e.target.value as Form3Modality)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="initial">Initial LLP Agreement (Filing after Incorporation)</option>
                  <option value="modification_no_contrib">Change in LLP Agreement (Without Contribution Change)</option>
                  <option value="modification_with_contrib">Change in LLP Agreement (With Contribution Increase)</option>
                </select>
              </div>

              {form3Modality === 'modification_with_contrib' && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    New Increased Contribution of LLP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cNew}
                    onChange={(e) => setCNew(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="e.g. 2500000"
                  />
                  <p className="text-[11px] text-slate-400">
                    Calculates incremental registration fee differential based on Annexure-A Item 3 slabs.
                  </p>
                </div>
              )}
            </>
          )}

          {isForm8Charge && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Charge Filing Type
              </label>
              <select
                value={form8ChargeModality}
                onChange={(e) => setForm8ChargeModality(e.target.value as Form8ChargeModality)}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="creation">Creation of Charge (Flat ₹1,000 document fee)</option>
                <option value="modification">Modification of Charge (Flat ₹1,000 document fee)</option>
                <option value="satisfaction">Satisfaction of Charge (Flat ₹1,000 document fee)</option>
              </select>
            </div>
          )}

          {isForm15 && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Registered Office Change Scenario
              </label>
              <select
                value={form15Scenario}
                onChange={(e) => setForm15Scenario(e.target.value as Form15Scenario)}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="within_local_limits">Scenario A: Change within same city / town / village (Partner consent date)</option>
                <option value="outside_local_limits_within_state">Scenario B: Change outside local limits within same State (Partner consent + publication date)</option>
                <option value="interstate_change_roc">Scenario C: Interstate Change / Change of ROC Jurisdiction (Govt/RD order date)</option>
              </select>
            </div>
          )}

          {!isAnnualForm && !isForm24 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {formId === 'Form-5'
                  ? 'Date of Govt/ROC Approval'
                  : formId === 'Form-15'
                  ? 'Derived Trigger Date'
                  : 'Event Date'}
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Statutory filing window: 30 calendar days from trigger date.
              </p>
            </div>
          )}

          {/* Actual Filing Date */}
          {!isForm24 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Actual / Anticipated Filing Date
              </label>
              <input
                type="date"
                value={actualFilingDate}
                onChange={(e) => setActualFilingDate(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Determines delay days after the statutory due date.
              </p>
            </div>
          )}

          {/* Form 24 Substantive Checklist */}
          {isForm24 && (
            <div className="md:col-span-2 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-5 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>📋</span> Form 24 Substantive Prerequisite Checklist (Rule 37)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f24Cessation}
                    onChange={(e) => setF24Cessation(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>1-Year Commercial Cessation Completed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f24NoLiabilities}
                    onChange={(e) => setF24NoLiabilities(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>No Active Assets, Liabilities or Open Charges</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f24FilingsDone}
                    onChange={(e) => setF24FilingsDone(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Form 8 & 11 filed up to closure FY</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f24CaStatement}
                    onChange={(e) => setF24CaStatement(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>CA Statement of Account (within 30d of filing)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>⚡</span> Calculations update dynamically on parameter change.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={copyShareLink}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {copiedLink ? 'Link Copied!' : 'Share Calculation'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating || !result}
              className="flex-1 sm:flex-initial px-6 py-3 bg-navy hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isPdfGenerating ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Results Card */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/20 dark:border-teal-500/30 rounded-3xl p-5 sm:p-8 shadow-lg space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block mb-1">
                Statutory Calculation Result
              </span>
              <h3 className="text-2xl font-bold text-navy dark:text-white font-heading">
                {result.formName}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Due Date vs Filing Date</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {result.dueDateFormatted} → {result.filingDateFormatted}
              </span>
            </div>
          </div>

          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 p-5 rounded-2xl">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block mb-1">
                Total MCA Portal Payable
              </span>
              <div className="text-3xl font-extrabold text-teal-900 dark:text-teal-100 font-heading">
                ₹ {result.totalPayable.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 mt-1 block">
                Tier 1 + Tier 2 + Tier 3 Fees
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Additional Filing Fee
              </span>
              <div className={`text-3xl font-extrabold font-heading ${result.lateFee > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                ₹ {result.lateFee.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {result.days} days delayed after due date
              </span>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-5 rounded-2xl">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
                Indicative Adjudication Exposure
              </span>
              <div className={`text-3xl font-extrabold font-heading ${result.totalPenaltyExposure > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                ₹ {result.totalPenaltyExposure.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 block">
                Sec 34(5)/35(2) (Separate from Portal)
              </span>
            </div>
          </div>

          {/* "Why is my fee ₹X?" Detailed Table */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-navy dark:text-white font-heading">
              Four-Tier Calculation Breakdown & Statutory Basis
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-xs uppercase font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 sm:px-5">Tier / Component</th>
                    <th className="p-3.5 sm:px-5">Statutory Basis & Calculation Method</th>
                    <th className="p-3.5 sm:px-5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3.5 sm:px-5 font-semibold text-navy dark:text-white">
                      Tier 1: Normal Base Filing Fee
                    </td>
                    <td className="p-3.5 sm:px-5 text-xs text-slate-600 dark:text-slate-400">
                      {result.whyExplanation.baseFeeDescription}
                    </td>
                    <td className="p-3.5 sm:px-5 font-bold text-right text-navy dark:text-white">
                      ₹ {result.normalFee.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:px-5 font-semibold text-navy dark:text-white">
                      Tier 2: Additional Filing Fee
                    </td>
                    <td className="p-3.5 sm:px-5 text-xs text-slate-600 dark:text-slate-400">
                      {result.whyExplanation.multiplierDescription}
                    </td>
                    <td className={`p-3.5 sm:px-5 font-bold text-right ${result.lateFee > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      ₹ {result.lateFee.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  {result.incrementalFee > 0 && (
                    <tr>
                      <td className="p-3.5 sm:px-5 font-semibold text-navy dark:text-white">
                        Tier 3: Incremental Registration Fee
                      </td>
                      <td className="p-3.5 sm:px-5 text-xs text-slate-600 dark:text-slate-400">
                        {result.whyExplanation.incrementalFeeDescription}
                      </td>
                      <td className="p-3.5 sm:px-5 font-bold text-right text-teal-600 dark:text-teal-400">
                        ₹ {result.incrementalFee.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-teal-50/50 dark:bg-teal-950/30 font-bold border-t-2 border-teal-500/20">
                    <td className="p-3.5 sm:px-5 text-teal-900 dark:text-teal-200">
                      TOTAL MCA PORTAL PAYABLE AMOUNT
                    </td>
                    <td className="p-3.5 sm:px-5 text-xs text-teal-700 dark:text-teal-400 font-normal">
                      Amount payable at MCA portal checkout upon filing
                    </td>
                    <td className="p-3.5 sm:px-5 font-extrabold text-right text-teal-900 dark:text-teal-100 text-base">
                      ₹ {result.totalPayable.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Penalty Section & Section 76A Notice */}
          {result.totalPenaltyExposure > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  Tier 4: Indicative Statutory Adjudication Penalty Exposure
                </span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-md">
                  Requires ROC Adjudication
                </span>
              </div>
              <ul className="text-xs text-amber-900 dark:text-amber-300 space-y-1.5 list-disc pl-5">
                <li>
                  <strong>LLP Entity Exposure:</strong> ₹ {result.llpPenalty.toLocaleString('en-IN')} (₹100 per day of default, capped at ₹1,00,000 under Section 34(5)/35(2)).
                </li>
                <li>
                  <strong>Designated Partners Exposure ({dpCount} DPs):</strong> ₹ {result.dpPenalty.toLocaleString('en-IN')} (₹100 per day per DP, capped at ₹50,000 each).
                </li>
              </ul>
              <div className="pt-3 border-t border-amber-200/80 dark:border-amber-900/50 text-xs text-slate-600 dark:text-slate-400 italic">
                <strong>Statutory Notice:</strong> {result.penaltyNotice} Adjudication penalties are not collected at the MCA checkout portal.
              </div>
            </div>
          )}

          {/* Procedural Notes Callout */}
          {result.proceduralNotes && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
              <strong className="text-navy dark:text-white block mb-1">Procedural & Statutory Guidelines:</strong>
              {result.proceduralNotes}
            </div>
          )}

          {/* Non-Audit Estimation Disclaimer */}
          <p className="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            <strong>Disclaimer:</strong> This calculation is generated automatically based on user inputs under the Limited Liability Partnership Act, 2008 and LLP Rules, 2009. It does not constitute an audit, legal certification, or legal opinion. Official fees are determined by the MCA21 portal upon form upload.
          </p>
        </div>
      )}
    </div>
  )
}
