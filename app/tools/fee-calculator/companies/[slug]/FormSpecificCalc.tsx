'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { MCAForm } from '@/data/mca-forms'
import { calculateIncorporationStampDuty } from '@/lib/calculatorUtils'
import { useToast } from '@/components/Toast'
import {
  calculateMgt7Compliance,
  Mgt7ComplianceCalculationResult
} from '@/lib/rule-engine/mgt7-engine'
import { generateMgt7Pdf } from '@/lib/pdf/generateMgt7Pdf'

interface ResultRow {
  component: string
  category: string
  basis: string
  amount: number
}

function getNormalFee(capital: number, isSmall: boolean): number {
  if (isSmall) {
    if (capital < 100000) return 50
    if (capital < 500000) return 100
    if (capital < 2500000) return 150
    return 200
  } else {
    if (capital < 100000) return 200
    if (capital < 500000) return 300
    if (capital < 2500000) return 400
    if (capital < 10000000) return 500
    return 600
  }
}

function getMultiplier(delay: number): number {
  if (delay <= 0) return 0
  if (delay <= 15) return 1
  if (delay <= 30) return 2
  if (delay <= 60) return 4
  if (delay <= 90) return 6
  if (delay <= 180) return 10
  return 12
}

export default function FormSpecificCalc({ form }: { form: MCAForm }) {
  const isMgt7Family = form.slug === 'mgt-7' || form.slug === 'mgt-7a'
  const isSpice = form.slug === 'spice-plus'
  const isDateBased = form.slug === 'aoc-4'

  const { showToast } = useToast()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // ═══════════════════════════════════════════════════════════════════════════
  // MGT-7 & MGT-7A DEDICATED STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [mgtFormCode, setMgtFormCode] = useState<'MGT-7' | 'MGT-7A'>(
    form.slug === 'mgt-7a' ? 'MGT-7A' : 'MGT-7'
  )
  const [hasShareCapital, setHasShareCapital] = useState(true)
  const [nominalCapital, setNominalCapital] = useState<number>(1000000) // ₹10 Lakh default
  const [paidUpCapital, setPaidUpCapital] = useState<number>(1000000)
  const [turnoverPrecedingFY, setTurnoverPrecedingFY] = useState<number>(5000000) // ₹50 Lakh default
  const [companyTypeSelection, setCompanyTypeSelection] = useState<
    'private_standard' | 'one_person_company' | 'public_unlisted' | 'public_listed' | 'section_8' | 'producer' | 'startup'
  >(form.slug === 'mgt-7a' ? 'one_person_company' : 'private_standard')

  // Section 2(85) Statutory Exclusions
  const [isHoldingCompany, setIsHoldingCompany] = useState(false)
  const [isSubsidiaryCompany, setIsSubsidiaryCompany] = useState(false)
  const [isSpecialActBodyCorporate, setIsSpecialActBodyCorporate] = useState(false)

  // Financial Year & AGM Date
  const [selectedFY, setSelectedFY] = useState('2025-26')
  const [agmType, setAgmType] = useState<'first' | 'subsequent'>('subsequent')
  const [agmStatus, setAgmStatus] = useState<'held' | 'extended_and_held' | 'not_held'>('held')
  const [actualAgmDate, setActualAgmDate] = useState('2026-09-30')
  const [rocExtensionDate, setRocExtensionDate] = useState('2026-12-31')
  const [actualFilingDate, setActualFilingDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [officerCount, setOfficerCount] = useState(2)

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERIC FORM STATE (for other non-MGT company forms)
  // ═══════════════════════════════════════════════════════════════════════════
  const [genericCompanyType, setGenericCompanyType] = useState('private')
  const [genericCapital, setGenericCapital] = useState(100000)
  const [genericDueDate, setGenericDueDate] = useState('')
  const [genericActualDate, setGenericActualDate] = useState('')
  const [delayDaysInput, setDelayDaysInput] = useState(0)
  const [state, setState] = useState('Maharashtra')
  const [directors, setDirectors] = useState(2)
  const [genericResults, setGenericResults] = useState<{ rows: ResultRow[]; total: number } | null>(null)
  const [showGenericModal, setShowGenericModal] = useState(false)

  // ═══════════════════════════════════════════════════════════════════════════
  // MGT COMPLIANCE REAL-TIME / DETERMINISTIC CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════
  const mgtCalculationResult: Mgt7ComplianceCalculationResult | null = useMemo(() => {
    if (!isMgt7Family) return null

    const fyYear = parseInt(selectedFY.split('-')[0], 10) + 1
    const fyEndDate = new Date(fyYear, 2, 31) // March 31 of respective FY

    const isPrivate = ['private_standard', 'one_person_company', 'startup'].includes(companyTypeSelection)
    const isOpc = companyTypeSelection === 'one_person_company'
    const isStartup = companyTypeSelection === 'startup'
    const isProducer = companyTypeSelection === 'producer'
    const isSection8 = companyTypeSelection === 'section_8'
    const isListed = companyTypeSelection === 'public_listed'

    try {
      return calculateMgt7Compliance({
        formCode: mgtFormCode,
        nominalCapital: hasShareCapital ? Math.max(0, nominalCapital) : 0,
        hasShareCapital,
        financialYearEnd: fyEndDate,
        agmType,
        agmStatus,
        actualAgmDate: agmStatus !== 'not_held' && actualAgmDate ? new Date(actualAgmDate) : undefined,
        rocApprovedExtendedLastDate: agmType === 'subsequent' && (agmStatus === 'extended_and_held' || rocExtensionDate) ? new Date(rocExtensionDate) : undefined,
        actualFilingDate: new Date(actualFilingDate),
        officerCount: Math.max(1, officerCount),
        isPrivateCompany: isPrivate,
        isHoldingCompany,
        isSubsidiaryCompany,
        isSection8Company: isSection8,
        isSpecialActBodyCorporate,
        paidUpCapital: hasShareCapital ? Math.max(0, paidUpCapital) : 0,
        turnoverPrecedingFY: Math.max(0, turnoverPrecedingFY),
        isOnePersonCompany: isOpc,
        isStartupCompany: isStartup,
        isProducerCompany: isProducer,
        isListed
      })
    } catch (e) {
      console.error('Error calculating MGT compliance', e)
      return null
    }
  }, [
    isMgt7Family,
    mgtFormCode,
    hasShareCapital,
    nominalCapital,
    paidUpCapital,
    turnoverPrecedingFY,
    companyTypeSelection,
    isHoldingCompany,
    isSubsidiaryCompany,
    isSpecialActBodyCorporate,
    selectedFY,
    agmType,
    agmStatus,
    actualAgmDate,
    rocExtensionDate,
    actualFilingDate,
    officerCount
  ])

  // ═══════════════════════════════════════════════════════════════════════════
  // PDF GENERATION HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleDownloadMgtPdf = () => {
    if (!mgtCalculationResult) return
    setIsGeneratingPDF(true)
    try {
      const doc = generateMgt7Pdf(mgtCalculationResult)
      doc.save(`CorpLawUpdates_${mgtCalculationResult.metadata.formCode}_Report_${selectedFY}.pdf`)
      showToast('Calculation Report downloaded successfully', 'success')
    } catch (e) {
      console.error('Failed to generate MGT PDF', e)
      showToast('Failed to generate report PDF', 'error')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERIC FORM HANDLER (NON-MGT FORMS)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleGenericCalculate = () => {
    const isSmall = genericCompanyType === 'opc' || genericCompanyType === 'small'
    const rows: ResultRow[] = []
    let total = 0

    if (isSpice) {
      const mcaFee = genericCapital <= 1500000 ? 0 : getNormalFee(genericCapital, false)
      rows.push({
        component: 'MCA Incorporation Fee',
        category: 'Fixed',
        basis: genericCapital <= 1500000 ? 'Waived (≤ ₹15L Capital)' : 'Capital slab',
        amount: mcaFee
      })
      if (directors > 3) {
        const dinFee = (directors - 3) * 500
        rows.push({
          component: 'DIN Allotment Fee',
          category: 'Fixed',
          basis: `${directors - 3} extra directors @ ₹500`,
          amount: dinFee
        })
        total += dinFee
      }
      const sd = calculateIncorporationStampDuty(state, genericCapital)
      rows.push({ component: 'Estimated MOA Stamp Duty', category: 'State Tax', basis: `Rates for ${state}`, amount: sd.moa })
      rows.push({ component: 'Estimated AOA Stamp Duty', category: 'State Tax', basis: `Rates for ${state}`, amount: sd.aoa })
      if (sd.form > 0) {
        rows.push({ component: 'Estimated Form/Capital Stamp Duty', category: 'State Tax', basis: `Rates for ${state}`, amount: sd.form })
      }
      total += mcaFee + sd.moa + sd.aoa + sd.form
    } else {
      let baseFee = 0
      if (form.normalFeeStructure === 'capital_slab') {
        baseFee = getNormalFee(genericCapital, form.concessionApplies ? isSmall : false)
        rows.push({
          component: 'Normal Filing Fee',
          category: 'Fixed',
          basis: `Capital slab (${form.concessionApplies && isSmall ? 'Concessional' : 'Standard'})`,
          amount: baseFee
        })
      }
      let delay = 0
      if (isDateBased) {
        if (genericDueDate && genericActualDate) {
          const d1 = new Date(genericDueDate)
          const d2 = new Date(genericActualDate)
          delay = Math.max(0, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
        }
      } else {
        delay = Math.max(0, delayDaysInput)
      }

      let lateFee = 0
      if (delay > 0) {
        if (form.penaltyType === 'per_day') {
          lateFee = delay * 100
          rows.push({ component: 'Additional Filing Fee', category: 'Variable', basis: `${delay} days @ ₹100/day`, amount: lateFee })
        } else if (form.penaltyType === 'multiplier') {
          const mult = getMultiplier(delay)
          lateFee = baseFee * mult
          rows.push({ component: 'Additional Fee', category: 'Variable', basis: `Delay ${delay}d (${mult}x base fee)`, amount: lateFee })
        } else if (form.penaltyType === 'flat') {
          lateFee = parseInt(form.penaltyRate.replace(/\D/g, '')) || 5000
          rows.push({ component: 'Additional Fee', category: 'Fixed', basis: form.penaltyRate, amount: lateFee })
        }
      }
      total = baseFee + lateFee
    }

    setGenericResults({ rows, total })
    setShowGenericModal(true)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER MGT-7 / MGT-7A DEDICATED WORKSPACE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isMgt7Family && mgtCalculationResult) {
    const res = mgtCalculationResult

    return (
      <div className="space-y-8">
        {/* Workspace Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          {/* Header & Form Tab Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-md tracking-wider">
                  {res.metadata.formCode} Engine
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Section 92 & Table A (Item 5 & 6)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {res.metadata.formName}
              </h2>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <Link
                href="/tools/fee-calculator/companies/mgt-7"
                onClick={() => setMgtFormCode('MGT-7')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  mgtFormCode === 'MGT-7'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                MGT-7 (Standard)
              </Link>
              <Link
                href="/tools/fee-calculator/companies/mgt-7a"
                onClick={() => setMgtFormCode('MGT-7A')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  mgtFormCode === 'MGT-7A'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                MGT-7A (OPC / Small)
              </Link>
            </div>
          </div>

          {/* Form Routing Guidance Notice if Mismatch */}
          {res.metadata.formRoutingMismatch && res.metadata.formRoutingRecommendation && (
            <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                  Form Routing Advisory
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                  {res.metadata.formRoutingRecommendation}
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Company Classification & Capital */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Company Classification
              </label>
              <select
                value={companyTypeSelection}
                onChange={e => setCompanyTypeSelection(e.target.value as any)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="private_standard">Private Limited (Standard)</option>
                <option value="one_person_company">One Person Company (OPC)</option>
                <option value="startup">Start-up Company (DPIIT Recognized)</option>
                <option value="producer">Producer Company (Chapter XXIA)</option>
                <option value="public_unlisted">Public Limited (Unlisted)</option>
                <option value="public_listed">Public Limited (Listed)</option>
                <option value="section_8">Section 8 Company</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Financial Year
              </label>
              <select
                value={selectedFY}
                onChange={e => setSelectedFY(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="2025-26">FY 2025-26 (Latest / Current 2026-27)</option>
                <option value="2024-25">FY 2024-25</option>
                <option value="2023-24">FY 2023-24</option>
                <option value="2022-23">FY 2022-23</option>
                <option value="2021-22">FY 2021-22</option>
                <option value="2020-21">FY 2020-21 (MGT-7A Notification)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nominal Share Capital (₹)
                </label>
                <label className="text-[11px] text-slate-500 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hasShareCapital}
                    onChange={e => setHasShareCapital(!e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  No Share Capital
                </label>
              </div>
              <input
                type="number"
                disabled={!hasShareCapital}
                min="0"
                value={hasShareCapital ? nominalCapital : 0}
                onChange={e => setNominalCapital(Number(e.target.value))}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-tabular-nums disabled:bg-slate-100 dark:disabled:bg-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the nominal share capital applicable for Table A (Items 5 & 6) fee brackets.
              </p>
            </div>
          </div>

          {/* Step 2: Small Company Fact Evaluator (Section 2(85)) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span>🏛️</span> Small Company Facts & Statutory Exclusions (Section 2(85))
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Paid-up Share Capital (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidUpCapital}
                  onChange={e => setPaidUpCapital(Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 text-xs font-tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Preceding FY Turnover (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={turnoverPrecedingFY}
                  onChange={e => setTurnoverPrecedingFY(Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 text-xs font-tabular-nums"
                />
              </div>

              <div className="lg:col-span-2 flex flex-wrap gap-4 items-center pt-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHoldingCompany}
                    onChange={e => setIsHoldingCompany(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Holding Co (Sec 2(46))
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSubsidiaryCompany}
                    onChange={e => setIsSubsidiaryCompany(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Subsidiary Co (Sec 2(87))
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecialActBodyCorporate}
                    onChange={e => setIsSpecialActBodyCorporate(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Special Act Entity
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">
                Evaluation Result:{' '}
                <strong className={res.smallCompanyAssessment.isSmallCompany ? 'text-green-600' : 'text-slate-700 dark:text-slate-300'}>
                  {res.smallCompanyAssessment.isSmallCompany ? '✓ Small Company Qualified' : '✗ Non-Small Company'}
                </strong>
                {res.smallCompanyAssessment.disqualificationReason && ` (${res.smallCompanyAssessment.disqualificationReason})`}
              </span>
              <span className="text-[11px] text-slate-400">
                Threshold applied: {res.smallCompanyAssessment.thresholdApplied.eraId === 'era-2025-current' ? 'G.S.R. 880(E) [₹10Cr / ₹100Cr]' : 'Historical Slab'}
              </span>
            </div>
          </div>

          {/* Step 3: AGM & Filing Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                AGM Category (Sec 96)
              </label>
              <select
                value={agmType}
                onChange={e => setAgmType(e.target.value as any)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="subsequent">Subsequent AGM (6m limit)</option>
                <option value="first">First AGM (9m limit — No Ext)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                AGM Convened Status
              </label>
              <select
                value={agmStatus}
                onChange={e => setAgmStatus(e.target.value as any)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="held">Held On-Time</option>
                {agmType === 'subsequent' && <option value="extended_and_held">ROC Extended & Held</option>}
                <option value="not_held">No AGM Held (Sec 92(4))</option>
              </select>
            </div>

            {agmStatus !== 'not_held' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Actual AGM Date
                </label>
                <input
                  type="date"
                  value={actualAgmDate}
                  onChange={e => setActualAgmDate(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            ) : agmType === 'subsequent' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  ROC Extension Target Date
                </label>
                <input
                  type="date"
                  value={rocExtensionDate}
                  onChange={e => setRocExtensionDate(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Statutory AGM Target
                </label>
                <input
                  type="text"
                  readOnly
                  value={res.metadata.standardAgmLastDate}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg p-2.5 text-sm font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Actual / Filing Date
              </label>
              <input
                type="date"
                value={actualFilingDate}
                onChange={e => setActualFilingDate(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Statutory Filing Due Date: <strong className="text-slate-800 dark:text-slate-200">{res.metadata.statutoryDueDate}</strong>
            </div>
            <div>
              Days Overdue:{' '}
              <strong className={res.metadata.daysDelayed > 0 ? 'text-red-600' : 'text-green-600'}>
                {res.metadata.daysDelayed > 0 ? `${res.metadata.daysDelayed} Day(s) Delayed` : 'On Time (0 Days)'}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <span>Officers in Default:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={officerCount}
                onChange={e => setOfficerCount(Number(e.target.value))}
                className="w-14 border border-slate-300 dark:border-slate-700 rounded p-1 text-center"
              />
            </div>
          </div>
        </div>

        {/* Dual Financial Output Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel 1: MCA21 Portal Payable */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 border-blue-500/30 dark:border-blue-500/20 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Panel 1 • MCA21 e-Challan Payable
                </span>
                <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Online Filing Fee
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">Total MCA Portal Amount</p>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-6 flex items-baseline font-tabular-nums">
                <span className="text-2xl text-slate-400 font-semibold mr-1.5">₹</span>
                {res.mcaPortalPayable.totalPortalPayable.toLocaleString('en-IN')}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Normal Filing Fee</div>
                    <div className="text-xs text-slate-500 mt-0.5">{res.mcaPortalPayable.basisNormalFee}</div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white font-tabular-nums">
                    ₹ {res.mcaPortalPayable.normalFilingFee.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex justify-between items-start text-sm">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Additional Filing Fee</div>
                    <div className="text-xs text-slate-500 mt-0.5">{res.mcaPortalPayable.basisAdditionalFee}</div>
                  </div>
                  <div className={`font-bold font-tabular-nums ${res.mcaPortalPayable.additionalFilingFee > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                    ₹ {res.mcaPortalPayable.additionalFilingFee.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              Paid directly via MCA21 Portal payment gateway / e-Challan upon uploading {res.metadata.formCode}. Does not include statutory penalties.
            </div>
          </div>

          {/* Panel 2: Indicative Section 92(5) Penalty Exposure */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Panel 2 • Adjudication Exposure
                </span>
                <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Section 92(5) & 446B
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">Indicative Maximum Penalty Exposure</p>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-6 flex items-baseline font-tabular-nums">
                <span className="text-2xl text-slate-400 font-semibold mr-1.5">₹</span>
                {res.statutoryPenaltyExposure.totalIndicativeMaximumExposure.toLocaleString('en-IN')}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Company Penalty Exposure</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Base ₹10,000 + {res.metadata.continuingDaysAfterFirst} continuing day(s) @ ₹100/day
                      {res.statutoryPenaltyExposure.section446BApplied && ' (50% Sec 446B Max Applied)'}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white font-tabular-nums">
                    ₹ {res.statutoryPenaltyExposure.companyIndicativeMaximumExposure.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex justify-between items-start text-sm">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Officers in Default ({officerCount} Officers)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {res.statutoryPenaltyExposure.section446BApplied ? 'Sec 446B Ceiling of ₹25,000 per officer' : 'Standard Sec 92(5) Ceiling of ₹50,000 per officer'}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white font-tabular-nums">
                    ₹ {res.statutoryPenaltyExposure.officersIndicativeMaximumExposure.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              <strong>Statutory Disclosure:</strong> Section 92(5) penalties are not collected via MCA21 e-Challan; they require formal adjudication proceedings under Section 454 by the ROC.
            </div>
          </div>
        </div>

        {/* Itemized "Why is my fee ₹X?" & Audit Breakdown */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {res.whyIsMyFeeBreakdown.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {res.whyIsMyFeeBreakdown.description}
              </p>
            </div>

            <button
              onClick={handleDownloadMgtPdf}
              disabled={isGeneratingPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>📄</span>
              {isGeneratingPDF ? 'Generating...' : 'Download Official PDF Report'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {res.whyIsMyFeeBreakdown.items.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-1 font-tabular-nums">{item.amount}</div>
                <p className="text-xs text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>

          {/* Compliance & PCS Certification Banner */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-col md:flex-row justify-between gap-4">
            <div>
              <strong className="text-slate-800 dark:text-slate-200">PCS Certification (Section 92(2)):</strong>{' '}
              <span className="text-slate-600 dark:text-slate-400">{res.pcsCertification.basisExplanation}</span>
            </div>
            <div className="text-slate-500 whitespace-nowrap">
              <strong>Signatures:</strong> {res.pcsCertification.signatoryNotice}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER GENERIC FORM WORKSPACE (NON-MGT FORMS)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Form Type
          </label>
          <input
            type="text"
            readOnly
            value={`${form.formNumber} — ${form.formName}`}
            className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-[1.5px] border-[#CBD5E1] dark:border-slate-700 rounded-lg px-[14px] py-[10px] text-[#64748B] font-medium outline-none"
          />
        </div>

        {!isSpice && (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Company Type
            </label>
            <select
              value={genericCompanyType}
              onChange={e => setGenericCompanyType(e.target.value)}
              className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
            >
              <option value="private">Private Limited</option>
              <option value="public">Public Limited</option>
              <option value="opc">One Person Company (OPC)</option>
              <option value="small">Small Company</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Nominal Share Capital (₹)
          </label>
          <input
            type="number"
            min="0"
            value={genericCapital}
            onChange={e => setGenericCapital(Number(e.target.value))}
            className="w-full border-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {isSpice ? (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Registered Office State
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              >
                <option value="andhrapradesh">Andhra Pradesh</option>
                <option value="bihar">Bihar</option>
                <option value="delhi">Delhi</option>
                <option value="gujarat">Gujarat</option>
                <option value="karnataka">Karnataka</option>
                <option value="madhyapradesh">Madhya Pradesh</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="punjab">Punjab</option>
                <option value="rajasthan">Rajasthan</option>
                <option value="tamilnadu">Tamil Nadu</option>
                <option value="telangana">Telangana</option>
                <option value="other">Other States</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Number of Directors
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={directors}
                onChange={e => setDirectors(Number(e.target.value))}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              />
            </div>
          </>
        ) : isDateBased ? (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={genericDueDate}
                onChange={e => setGenericDueDate(e.target.value)}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Actual/Proposed Filing Date
              </label>
              <input
                type="date"
                value={genericActualDate}
                onChange={e => setGenericActualDate(e.target.value)}
                className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Delay in Days
            </label>
            <input
              type="number"
              min="0"
              value={delayDaysInput}
              onChange={e => setDelayDaysInput(Number(e.target.value))}
              className="w-full border-[1.5px] border-[#CBD5E1] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-[14px] py-[10px] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Enter 0 if filing on time</p>
          </div>
        )}
      </div>

      <button
        onClick={handleGenericCalculate}
        className="w-full bg-[#0a0a0a] hover:bg-black text-white font-bold py-4 px-6 rounded-[8px] transition-all flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-xl mt-4"
      >
        Calculate {isSpice ? 'Estimate' : 'Fee'} <span aria-hidden="true">→</span>
      </button>

      {/* Modal Overlay for Generic Forms */}
      {showGenericModal && genericResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col md:flex-row w-full max-w-3xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowGenericModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-1 bg-white rounded-full shadow-sm"
            >
              ✕
            </button>

            <div className="flex-1 p-8 md:p-10">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-6">FEE BREAKDOWN</h3>
              <p className="text-sm text-slate-500 mb-1 font-medium">Total Payable</p>
              <div className="text-[2.75rem] font-bold text-slate-900 mb-10 font-tabular-nums flex items-baseline leading-none">
                <span className="text-[1.5rem] mr-1 text-slate-400 font-medium">₹</span>
                {genericResults.total.toLocaleString()}
              </div>

              {genericResults.rows.map((r, i) => (
                <div key={i} className="flex justify-between py-4 border-b border-slate-100 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-600 font-medium">{r.component}</span>
                    <span className="text-xs text-slate-400 mt-0.5">{r.basis}</span>
                  </div>
                  <span className={`font-bold font-tabular-nums ${r.component.includes('Additional') ? 'text-[#DC2626]' : 'text-slate-900'}`}>
                    ₹ {r.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full md:w-[320px] bg-[#0a0a0a] p-8 md:p-10 text-white flex flex-col justify-center relative">
              <h4 className="text-[1.35rem] font-bold mb-5 leading-snug">
                Filing Estimate: ₹{genericResults.total.toLocaleString()}
              </h4>
              <p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed font-medium">
                Calculated strictly in accordance with Companies (Registration Offices and Fees) Rules, 2014.
              </p>
              <button
                onClick={() => setShowGenericModal(false)}
                className="w-full bg-white text-black font-bold py-3.5 px-4 rounded-[6px] hover:bg-slate-100 transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
