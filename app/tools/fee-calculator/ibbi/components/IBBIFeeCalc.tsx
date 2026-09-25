'use client';

import React, { useState, useId } from 'react';
import {
  calculateLiquidationFee,
  calculateCirpFee,
  calculateLiquidatorFee,
  LIQUIDATION_FORMS,
  CIRP_FORMS,
} from '@/lib/ibbi-calculator/engine';
import { LiquidationFormId, CirpFormId } from '@/lib/ibbi-calculator/types';
import IndianDateInput from '@/components/shared/IndianDateInput';
import { formatDDMMYYYY, formatIndianLong } from '@/lib/date-utils';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  Copy,
  FileText,
  Info,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function IBBIFeeCalc() {
  const [activeTab, setActiveTab] = useState<'liquidation' | 'cirp' | 'liquidator-fee'>('liquidation');
  const [copied, setCopied] = useState(false);

  // Accessible unique IDs for form labels and inputs
  const liqFormIdAttr = useId();
  const liqDueDateAttr = useId();
  const liqSubDateAttr = useId();
  const liqCountAttr = useId();
  const cirpFormIdAttr = useId();
  const cirpDueDateAttr = useId();
  const cirpSubDateAttr = useId();
  const cirpCountAttr = useId();
  const realAmtAttr = useId();
  const distAmtAttr = useId();
  const timePeriodAttr = useId();

  // Liquidation Form State
  const [liqFormId, setLiqFormId] = useState<LiquidationFormId>('LIQ-1');
  const [liqDueDate, setLiqDueDate] = useState<string>('2026-06-15');
  const [liqSubmissionDate, setLiqSubmissionDate] = useState<string>('2026-09-24');
  const [liqCount, setLiqCount] = useState<number>(1);
  const [liqIsCorrection, setLiqIsCorrection] = useState<boolean>(false);

  // CIRP Form State
  const [cirpFormId, setCirpFormId] = useState<CirpFormId>('CIRP-1');
  const [cirpDueDate, setCirpDueDate] = useState<string>('2026-07-01');
  const [cirpSubmissionDate, setCirpSubmissionDate] = useState<string>('2026-09-24');
  const [cirpCount, setCirpCount] = useState<number>(1);
  const [cirpIsCorrection, setCirpIsCorrection] = useState<boolean>(false);

  // Liquidator Fee State
  const [realisationAmt, setRealisationAmt] = useState<number>(15000000); // 1.5 Cr
  const [distributionAmt, setDistributionAmt] = useState<number>(10000000); // 1 Cr
  const [timePeriod, setTimePeriod] = useState<'0-6m' | '6-12m' | '1-2y' | 'above2y'>('0-6m');

  // Calculations
  const liqResult = calculateLiquidationFee({
    formId: liqFormId,
    dueDate: liqDueDate,
    submissionDate: liqSubmissionDate,
    numberOfForms: liqCount,
    isCorrectionOrUpdation: liqIsCorrection,
  });

  const cirpResult = calculateCirpFee({
    formId: cirpFormId,
    dueDate: cirpDueDate,
    submissionDate: cirpSubmissionDate,
    numberOfForms: cirpCount,
    isCorrectionOrUpdation: cirpIsCorrection,
  });

  const liquidatorResult = calculateLiquidatorFee(
    realisationAmt,
    distributionAmt,
    timePeriod
  );

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const copyFilingNote = () => {
    let text = '';
    if (activeTab === 'liquidation') {
      text = `IBBI REGULATION 47B DELAYED FILING FEE COMPUTATION
Statutory Reference: Circular No. IBBI/LIQ/107/2026 dated 24.09.2026
Form: ${liqResult.formName} (${liqResult.formId})
Statutory Due Date: ${formatDDMMYYYY(liqResult.dueDate)} (${formatIndianLong(liqResult.dueDate)})
Actual / Proposed Submission Date: ${formatDDMMYYYY(liqResult.submissionDate)} (${formatIndianLong(liqResult.submissionDate)})
Delayed Period: ${liqResult.monthsOfDelay} calendar month(s) (${liqResult.daysOfDelay} days)
Number of Forms: ${liqResult.numberOfForms}
Submission Nature: ${liqResult.isCorrectionOrUpdation ? 'Correction / Updation' : 'Fresh Delay'}
Base Late Fee: ₹500 × ${liqResult.monthsOfDelay} month(s) × ${liqResult.numberOfForms} form(s) = ${formatINR(liqResult.totalBaseFee)}
Applicable GST @ 18%: ${formatINR(liqResult.totalGst)}
Net Amount Deposited with IBBI: ${formatINR(liqResult.totalPayable)}
Note: Deposited electronically via IBBI portal / Bharatkosh under Regulation 47B of IBBI (Liquidation Process) Regulations, 2016.`;
    } else if (activeTab === 'cirp') {
      text = `IBBI REGULATION 40B DELAYED CIRP FORM FEE COMPUTATION
Statutory Reference: Regulation 40B read with Circular No. IBBI/CIRP/89/2025
Form: ${cirpResult.formName} (${cirpResult.formId})
Statutory Due Date: ${formatDDMMYYYY(cirpResult.dueDate)} (${formatIndianLong(cirpResult.dueDate)})
Actual Submission Date: ${formatDDMMYYYY(cirpResult.submissionDate)} (${formatIndianLong(cirpResult.submissionDate)})
Months of Delay: ${cirpResult.monthsOfDelay} month(s)
Base Fee: ₹500 × ${cirpResult.monthsOfDelay} × ${cirpResult.numberOfForms} = ${formatINR(cirpResult.totalBaseFee)}
GST @ 18%: ${formatINR(cirpResult.totalGst)}
Total Payable: ${formatINR(cirpResult.totalPayable)}`;
    } else {
      text = `LIQUIDATOR'S REMUNERATION COMPUTATION (REGULATION 4(2)(b))
Realisation Amount: ${formatINR(liquidatorResult.realisationAmount)}
Distribution Amount: ${formatINR(liquidatorResult.distributionAmount)}
Timeline Interval: ${liquidatorResult.timePeriod}
Realisation Fee: ${formatINR(liquidatorResult.totalRealisationFee)}
Distribution Fee: ${formatINR(liquidatorResult.totalDistributionFee)}
Liquidator Professional Fee: ${formatINR(liquidatorResult.totalLiquidatorFee)}
Applicable GST (18%): ${formatINR(liquidatorResult.gstAmount)}
Gross Total Payable to Liquidator: ${formatINR(liquidatorResult.grossPayable)}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-navy via-indigo-900 to-slate-900 p-6 md:p-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Updated for Circular 107/2026 (24 Sept 2026)
          </div>
          <span className="text-xs text-slate-300 font-mono">IBBI/LIQ/107/2026</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading mb-2">
          IBBI Delayed Filing & Liquidation Fee Engine
        </h2>
        <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
          Calculate statutory delayed filing fees for Liquidation Forms under Regulation 47B, CIRP Forms under Regulation 40B, and Liquidator realization slabs under Regulation 4(2)(b).
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('liquidation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'liquidation'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 text-blue-500" />
          Liquidation Forms (Reg 47B)
          <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 px-1.5 py-0.5 rounded-md font-bold">
            30 Sept Cutoff
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cirp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'cirp'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-500" />
          CIRP Forms (Reg 40B)
        </button>

        <button
          onClick={() => setActiveTab('liquidator-fee')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'liquidator-fee'
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4 text-purple-500" />
          Liquidator Fee Slabs (Reg 4)
        </button>
      </div>

      {/* Main Form & Calculation Area */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'liquidation' && (
            <>
              <div>
                <label htmlFor={liqFormIdAttr} className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Select Liquidation Form (Revised Framework 2026)
                </label>
                <select
                  id={liqFormIdAttr}
                  value={liqFormId}
                  onChange={(e) => setLiqFormId(e.target.value as LiquidationFormId)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="LIQ-1">Form LIQ-1 — Progress Report & Appointment Intimation</option>
                  <option value="LIQ-2">Form LIQ-2 — Preliminary Report, Asset Memo & Valuation</option>
                  <option value="LIQ-3">Form LIQ-3 — Sale of Assets & Distribution of Proceeds</option>
                  <option value="LIQ-4">Form LIQ-4 — Final Report & Closure / Dissolution</option>
                  <option value="OTHER">Other Form under Regulation 47B</option>
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {LIQUIDATION_FORMS[liqFormId].description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={liqDueDateAttr} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Statutory Due Date (DD/MM/YYYY)
                  </label>
                  <IndianDateInput
                    id={liqDueDateAttr}
                    value={liqDueDate}
                    onChange={setLiqDueDate}
                  />
                  <span className="text-[11px] text-slate-500">Cohort: Forms due on/before 30/09/2026</span>
                </div>

                <div>
                  <label htmlFor={liqSubDateAttr} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Filing / Submission Date (DD/MM/YYYY)
                  </label>
                  <IndianDateInput
                    id={liqSubDateAttr}
                    value={liqSubmissionDate}
                    onChange={setLiqSubmissionDate}
                  />
                  <span className="text-[11px] text-slate-500">Date deposited on IBBI portal</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</span>
                <p className="leading-relaxed">
                  <strong>Clarification on 30.09.2026:</strong> This date is <em>not</em> an exemption or grace period. Under Circular No. IBBI/LIQ/107/2026, any form whose statutory due date was on or before 30.09.2026 attracts ₹500/month + 18% GST calculated from its original due date if submitted after that due date.
                </p>
              </div>

              <div>
                <label htmlFor={liqCountAttr} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Forms Delayed (Batch Filing Multiplier)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLiqCount(Math.max(1, liqCount - 1))}
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    -
                  </button>
                  <input
                    id={liqCountAttr}
                    type="number"
                    min="1"
                    max="50"
                    value={liqCount}
                    onChange={(e) => setLiqCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setLiqCount(liqCount + 1)}
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500">
                    Useful if calculating for multiple pending quarters or multiple corporate debtors.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={liqIsCorrection}
                    onChange={(e) => setLiqIsCorrection(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    <strong>Correction / Updation of Previously Filed Form:</strong> Circular No. IBBI/LIQ/107/2026 mandates that any form submitted after the due date,{' '}
                    <em>&quot;whether by correction, updation, or otherwise&quot;</em>, attracts the mandatory ₹500/month late fee + GST.
                  </span>
                </label>
              </div>
            </>
          )}

          {activeTab === 'cirp' && (
            <>
              <div>
                <label htmlFor={cirpFormIdAttr} className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Select CIRP Form (Regulation 40B)
                </label>
                <select
                  id={cirpFormIdAttr}
                  value={cirpFormId}
                  onChange={(e) => setCirpFormId(e.target.value as CirpFormId)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="CIRP-1">Form CIRP-1 — IRP Appointment & Public Announcement</option>
                  <option value="CIRP-2">Form CIRP-2 — Appointment of Resolution Professional</option>
                  <option value="CIRP-3">Form CIRP-3 — Information Memorandum & Valuation</option>
                  <option value="CIRP-4">Form CIRP-4 — EOI & Resolution Plans Received</option>
                  <option value="CIRP-5">Form CIRP-5 — Approval / Rejection of Plan by CoC</option>
                  <option value="CIRP-6">Form CIRP-6 — Adjudicating Authority (NCLT) Order</option>
                  <option value="CIRP-7">Form CIRP-7 — Non-Completion Tracker beyond 180/270/330 days</option>
                  <option value="IP-1">Form IP-1 — Half-Yearly Return by IP</option>
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {CIRP_FORMS[cirpFormId].description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={cirpDueDateAttr} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Statutory Due Date (DD/MM/YYYY)
                  </label>
                  <IndianDateInput
                    id={cirpDueDateAttr}
                    value={cirpDueDate}
                    onChange={setCirpDueDate}
                  />
                  <span className="text-[11px] text-slate-500">Cutoff: Forms due on/before 31/12/2025</span>
                </div>

                <div>
                  <label htmlFor={cirpSubDateAttr} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Actual Submission Date (DD/MM/YYYY)
                  </label>
                  <IndianDateInput
                    id={cirpSubDateAttr}
                    value={cirpSubmissionDate}
                    onChange={setCirpSubmissionDate}
                  />
                  <span className="text-[11px] text-slate-500">Date uploaded on portal</span>
                </div>
              </div>

              <div>
                <label htmlFor={cirpCountAttr} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of CIRP Forms
                </label>
                <input
                  id={cirpCountAttr}
                  type="number"
                  min="1"
                  max="50"
                  value={cirpCount}
                  onChange={(e) => setCirpCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cirpIsCorrection}
                    onChange={(e) => setCirpIsCorrection(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>Modification Utility Filing:</strong> Form is being updated or resubmitted through the IBBI modification utility after the original due date.
                  </span>
                </label>
              </div>
            </>
          )}

          {activeTab === 'liquidator-fee' && (
            <>
              <div>
                <label htmlFor={realAmtAttr} className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Net Realised Value (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
                  <input
                    id={realAmtAttr}
                    type="number"
                    min="0"
                    step="100000"
                    value={realisationAmt}
                    onChange={(e) => setRealisationAmt(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setRealisationAmt(5000000)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    50 Lakhs
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealisationAmt(10000000)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    1 Crore
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealisationAmt(100000000)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    10 Crores
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealisationAmt(500000000)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    50 Crores
                  </button>
                </div>
                <span className="text-[11px] text-slate-500">
                  Excludes liquid cash/bank balances available at commencement as per IBBI circular.
                </span>
              </div>

              <div>
                <label htmlFor={distAmtAttr} className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Amount Distributed to Stakeholders (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
                  <input
                    id={distAmtAttr}
                    type="number"
                    min="0"
                    step="100000"
                    value={distributionAmt}
                    onChange={(e) => setDistributionAmt(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={timePeriodAttr} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Liquidation Timeline Interval (From Commencement)
                </label>
                <select
                  id={timePeriodAttr}
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="0-6m">In the first six months (Highest fee percentage: 5.0% / 2.5%)</option>
                  <option value="6-12m">In the next six months (6 to 12 months)</option>
                  <option value="1-2y">In the next one year (12 to 24 months)</option>
                  <option value="above2y">Thereafter (beyond 2 years)</option>
                </select>
                <span className="text-[11px] text-slate-500">
                  Higher commission is awarded for prompt realization within the first 6 months to disincentivize delays.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Institutional Result Card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeTab === 'liquidator-fee' ? 'Statutory Remuneration' : 'Total Late Fee Payable'}
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {activeTab === 'liquidator-fee' ? 'Reg 4(2)(b)' : '18% GST Inc.'}
                </span>
              </div>

              {/* Big Total Figure */}
              <div className="mb-6">
                <div className="text-3xl sm:text-4xl font-extrabold text-navy dark:text-white font-heading">
                  {formatINR(
                    activeTab === 'liquidation'
                      ? liqResult.totalPayable
                      : activeTab === 'cirp'
                      ? cirpResult.totalPayable
                      : liquidatorResult.grossPayable
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeTab === 'liquidator-fee'
                    ? 'Total entitlement including 18% professional GST'
                    : 'Gross payable to IBBI via BharatKosh / Portal'}
                </p>
              </div>

              {/* Detailed Breakdown Slabs */}
              {activeTab !== 'liquidator-fee' ? (
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Filing Timeline:</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-xs">
                      {formatDDMMYYYY(activeTab === 'liquidation' ? liqResult.dueDate : cirpResult.dueDate)} →{' '}
                      {formatDDMMYYYY(activeTab === 'liquidation' ? liqResult.submissionDate : cirpResult.submissionDate)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Delay Period:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {activeTab === 'liquidation' ? liqResult.monthsOfDelay : cirpResult.monthsOfDelay} month(s)
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Base Fee (₹500 / month):</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatINR(activeTab === 'liquidation' ? liqResult.totalBaseFee : cirpResult.totalBaseFee)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Applicable GST (18% SAC 9991):</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatINR(activeTab === 'liquidation' ? liqResult.totalGst : cirpResult.totalGst)}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                    <span>Total Deposit:</span>
                    <span>
                      {formatINR(activeTab === 'liquidation' ? liqResult.totalPayable : cirpResult.totalPayable)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Realisation Commission:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatINR(liquidatorResult.totalRealisationFee)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Distribution Commission:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatINR(liquidatorResult.totalDistributionFee)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Net Liquidator Fee:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatINR(liquidatorResult.totalLiquidatorFee)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>GST @ 18%:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {formatINR(liquidatorResult.gstAmount)}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                    <span>Gross Entitlement:</span>
                    <span>{formatINR(liquidatorResult.grossPayable)}</span>
                  </div>
                </div>
              )}

              {/* Note / Regulatory Callout */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 leading-relaxed mb-6">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    {activeTab === 'liquidation' && liqResult.statutoryNote}
                    {activeTab === 'cirp' && cirpResult.statutoryNote}
                    {activeTab === 'liquidator-fee' &&
                      'Calculated strictly per IBBI Clarification Circular dated 28 September 2023 on cumulative realization and distribution values.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <button
                type="button"
                onClick={copyFilingNote}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-navy text-white hover:bg-navy/90 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Copied Calculation Note!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Calculation Note for Filing
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
