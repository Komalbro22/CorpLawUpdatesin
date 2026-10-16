'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { saveAs } from 'file-saver'
import {
  WorkspaceState,
  SupplementaryCashFlowInputs
} from '@/lib/financial-statements/types'
import {
  computeHeadBalances,
  generateBalanceSheetStatement,
  generateProfitLossStatement,
  computeIndirectCashFlow,
  formatCurrencyAmount
} from '@/lib/financial-statements/calculations'
import {
  loadWorkspaceFromStorage,
  saveWorkspaceToStorage,
  loadSampleFixture,
  incrementLocalPreparationCount
} from '@/lib/financial-statements/storage'
import { generateFinancialStatementsPdf } from '@/lib/financial-statements/export/pdf'
import { generateFinancialStatementsXlsxBlob } from '@/lib/financial-statements/export/xlsx'
import { generateFinancialStatementsDocxBlob } from '@/lib/financial-statements/export/docx'
import FinancialStatementsNav from '../FinancialStatementsNav'
import {
  ArrowRightLeft,
  FileDown,
  Sparkles,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react'

export default function CashFlowBuilderClient() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  useEffect(() => {
    setWorkspace(loadWorkspaceFromStorage())
  }, [])

  useEffect(() => {
    if (workspace) {
      saveWorkspaceToStorage(workspace)
    }
  }, [workspace])

  const { headBalances, plRows, balanceSheetRows, cashFlowResult } = useMemo(() => {
    if (!workspace) {
      return { headBalances: {}, plRows: [], balanceSheetRows: [], cashFlowResult: null }
    }
    const balances = computeHeadBalances(workspace.trialBalance, workspace.manualDirectEntries)
    const bsRows = generateBalanceSheetStatement(balances)
    const pRows = generateProfitLossStatement(balances)
    const cf = computeIndirectCashFlow(balances, workspace.supplementaryCashFlow, pRows)
    return { headBalances: balances, plRows: pRows, balanceSheetRows: bsRows, cashFlowResult: cf }
  }, [workspace])

  if (!workspace || !cashFlowResult) {
    return (
      <div className="py-12 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        Loading Cash Flow Statement builder...
      </div>
    )
  }

  const { profile, supplementaryCashFlow: supp } = workspace
  const cfs = cashFlowResult

  // Check Section 2(40) Proviso Exemption
  const isExemptEligible =
    profile.companyType === 'opc' ||
    (profile.companyType === 'private' && (headBalances['rev_operations']?.current || 0) <= 40_00_00_000)

  const updateSuppField = (field: keyof SupplementaryCashFlowInputs, val: number) => {
    setWorkspace(prev => {
      if (!prev) return prev
      return {
        ...prev,
        supplementaryCashFlow: {
          ...prev.supplementaryCashFlow,
          [field]: val
        }
      }
    })
  }

  const handleLoadSample = () => {
    if (confirm('Load sample company data (Astraea Infotech Pvt Ltd)?')) {
      const sample = loadSampleFixture()
      setWorkspace(sample)
    }
  }

  // Export handlers
  const handleExportPdf = () => {
    setIsExporting(true)
    try {
      const doc = generateFinancialStatementsPdf({
        workspace,
        balanceSheetRows,
        plRows,
        cashFlowResult,
        options: {
          includeBalanceSheet: false,
          includeProfitLoss: false,
          includeCashFlow: true,
          includeNotes: false,
          includeRatios: false,
          isDraft: Math.abs(cfs.discrepancy) > 1.0
        }
      })
      const safeName = (profile.companyName || 'Cash-Flow').replace(/[^a-zA-Z0-9_-]/g, '_')
      doc.save(`${safeName}_Cash_Flow_Statement.pdf`)
      incrementLocalPreparationCount()
    } catch (e: any) {
      alert('Export failed: ' + e.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportXlsx = async () => {
    setIsExporting(true)
    try {
      const blob = await generateFinancialStatementsXlsxBlob({
        workspace,
        balanceSheetRows,
        plRows,
        cashFlowResult
      })
      const safeName = (profile.companyName || 'Cash-Flow').replace(/[^a-zA-Z0-9_-]/g, '_')
      saveAs(blob, `${safeName}_Cash_Flow.xlsx`)
      incrementLocalPreparationCount()
    } catch (e: any) {
      alert('Excel export failed: ' + e.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDocx = async () => {
    setIsExporting(true)
    try {
      const blob = await generateFinancialStatementsDocxBlob({
        workspace,
        balanceSheetRows,
        plRows,
        cashFlowResult
      })
      const safeName = (profile.companyName || 'Cash-Flow').replace(/[^a-zA-Z0-9_-]/g, '_')
      saveAs(blob, `${safeName}_Cash_Flow.docx`)
      incrementLocalPreparationCount()
    } catch (e: any) {
      alert('Word export failed: ' + e.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
      <FinancialStatementsNav onResetWorkspace={() => setWorkspace(loadWorkspaceFromStorage())} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            Cash Flow Statement Builder (Indirect Method — AS-3 / Ind AS 7)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Derives operating cash flow from profit and balance sheet working capital movements, supplemented with actual non-cash and investing inputs.
          </p>
        </div>
        <button
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Load Sample Cash Flow
        </button>
      </div>

      {/* Section 2(40) Proviso Exemption Guidance Notice */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
        isExemptEligible
          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
      }`}>
        <div className="flex items-center gap-2 font-bold mb-1">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Statutory Applicability Guidance — Proviso to Section 2(40):</span>
        </div>
        <p>
          Under the proviso to <strong>Section 2(40)</strong> of the Companies Act, 2013, the financial statements of a <strong>One Person Company (OPC)</strong>, <strong>Small Company</strong>, or <strong>Dormant Company</strong> may not include a Cash Flow Statement.
          {profile.companyType === 'opc' && (
            <span className="block mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
              ✓ This company is an OPC and is eligible to omit the Cash Flow Statement from its annual filing under Section 2(40). You may still generate it here for management/banking review.
            </span>
          )}
          {profile.companyType === 'section8' && (
            <span className="block mt-1 font-semibold text-amber-700 dark:text-amber-300">
              Note: Section 8 companies are not automatically exempt from preparing a cash flow statement solely because they are Section 8 companies.
            </span>
          )}
        </p>
      </div>

      {/* Reconciliation Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
        <div>
          <span className="text-slate-500 block">Calculated Closing Cash</span>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrencyAmount(cfs.closingCashCalculated, profile.presentationUnit, true)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Balance Sheet Cash (Note 24)</span>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrencyAmount(cfs.closingCashBalanceSheet, profile.presentationUnit, true)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Reconciliation Discrepancy</span>
          <span
            className={`font-mono font-bold text-sm ${
              Math.abs(cfs.discrepancy) <= 1.0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {Math.abs(cfs.discrepancy) <= 1.0 ? '₹ 0.00 (Reconciled ✓)' : formatCurrencyAmount(cfs.discrepancy, profile.presentationUnit, true)}
          </span>
        </div>
        <div className="flex items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              Math.abs(cfs.discrepancy) <= 1.0
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {Math.abs(cfs.discrepancy) <= 1.0 ? 'Ready for Review ✓' : 'Draft — Needs Tie-up'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Left Table Preview, Right Supplementary Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Statement Presentation (7 cols) */}
        <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-900 text-white p-3.5 text-center">
            <h3 className="font-bold text-sm">CASH FLOW STATEMENT (INDIRECT METHOD)</h3>
            <p className="text-xs text-slate-400">
              For the year ended {profile.financialYearEnd || '31st March 2026'} | In {profile.presentationUnit.toUpperCase()}
            </p>
          </div>

          <div className="p-4 space-y-4 text-xs font-mono">
            {/* Section A: Operating */}
            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>A. CASH FLOW FROM OPERATING ACTIVITIES</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Profit / (Loss) Before Tax (PBT)</span>
                <span>{formatCurrencyAmount(cfs.operatingActivities.profitBeforeTax, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Adjustments for Non-Cash / Non-Operating Items</span>
                <span>{formatCurrencyAmount(cfs.operatingActivities.adjustmentsForNonCash, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-1 rounded">
                <span>Operating Profit Before Working Capital Changes</span>
                <span>{formatCurrencyAmount(cfs.operatingActivities.operatingProfitBeforeWorkingCapital, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Movement in Working Capital (Receivables, Stock, Payables)</span>
                <span>{formatCurrencyAmount(cfs.operatingActivities.workingCapitalChanges, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Direct Taxes Paid</span>
                <span>{formatCurrencyAmount(-cfs.operatingActivities.directTaxesPaid, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 p-1.5 rounded">
                <span>Net Cash from Operating Activities (A)</span>
                <span>{formatCurrencyAmount(cfs.operatingActivities.netCashFromOperating, profile.presentationUnit)}</span>
              </div>
            </div>

            {/* Section B: Investing */}
            <div className="space-y-1 pt-2">
              <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>B. CASH FLOW FROM INVESTING ACTIVITIES</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Purchase of Property, Plant &amp; Equipment</span>
                <span>{formatCurrencyAmount(-cfs.investingActivities.purchaseOfPPE, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Proceeds from Sale of Fixed Assets / Investments</span>
                <span>{formatCurrencyAmount(cfs.investingActivities.saleOfPPE + cfs.investingActivities.saleOfInvestments, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Interest &amp; Dividends Received</span>
                <span>{formatCurrencyAmount(cfs.investingActivities.interestReceived + cfs.investingActivities.dividendsReceived, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between font-bold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30 p-1.5 rounded">
                <span>Net Cash from / (used in) Investing Activities (B)</span>
                <span>{formatCurrencyAmount(cfs.investingActivities.netCashFromInvesting, profile.presentationUnit)}</span>
              </div>
            </div>

            {/* Section C: Financing */}
            <div className="space-y-1 pt-2">
              <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>C. CASH FLOW FROM FINANCING ACTIVITIES</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Proceeds from Share Capital &amp; Borrowings</span>
                <span>{formatCurrencyAmount(cfs.financingActivities.proceedsFromShareCapital + cfs.financingActivities.proceedsFromBorrowings, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Repayment of Borrowings</span>
                <span>{formatCurrencyAmount(-cfs.financingActivities.repaymentOfBorrowings, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Finance Costs &amp; Dividends Paid</span>
                <span>{formatCurrencyAmount(-cfs.financingActivities.interestPaid - cfs.financingActivities.dividendsPaid, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-1.5 rounded">
                <span>Net Cash from / (used in) Financing Activities (C)</span>
                <span>{formatCurrencyAmount(cfs.financingActivities.netCashFromFinancing, profile.presentationUnit)}</span>
              </div>
            </div>

            {/* Net Movement & Reconciliations */}
            <div className="pt-2 border-t-2 border-slate-300 dark:border-slate-700 space-y-1">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Net Increase / (Decrease) in Cash (A + B + C)</span>
                <span>{formatCurrencyAmount(cfs.netIncreaseInCash, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Opening Cash &amp; Cash Equivalents</span>
                <span>{formatCurrencyAmount(cfs.openingCash, profile.presentationUnit)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                <span>Closing Cash &amp; Cash Equivalents</span>
                <span>{formatCurrencyAmount(cfs.closingCashCalculated, profile.presentationUnit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Supplementary Actual Transactions Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Supplementary Cash Flow Inputs
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Opening/closing balances alone cannot reveal all cash events. Provide actual transaction figures below:
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Depreciation &amp; Amortization Expense
              </label>
              <input
                type="number"
                step="any"
                value={supp.depreciationAmortization}
                onChange={e => updateSuppField('depreciationAmortization', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Finance Costs / Bank Interest Expense
              </label>
              <input
                type="number"
                step="any"
                value={supp.interestExpense}
                onChange={e => updateSuppField('interestExpense', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Actual Direct Taxes Paid During Year
              </label>
              <input
                type="number"
                step="any"
                value={supp.taxPaidActual}
                onChange={e => updateSuppField('taxPaidActual', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Purchase / Additions to PPE (Fixed Assets)
              </label>
              <input
                type="number"
                step="any"
                value={supp.purchaseOfPPE}
                onChange={e => updateSuppField('purchaseOfPPE', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Repayment of Long-Term Borrowings (Principal)
              </label>
              <input
                type="number"
                step="any"
                value={supp.repaymentOfBorrowings}
                onChange={e => updateSuppField('repaymentOfBorrowings', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Actual Interest / Finance Charges Paid
              </label>
              <input
                type="number"
                step="any"
                value={supp.interestPaidActual}
                onChange={e => updateSuppField('interestPaidActual', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Opening Cash &amp; Bank Equivalents
              </label>
              <input
                type="number"
                step="any"
                value={supp.openingCashAndEquivalents}
                onChange={e => updateSuppField('openingCashAndEquivalents', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-slate-500">
          Generated directly in browser. No financial data uploaded.
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handleExportXlsx}
            disabled={isExporting}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel (.xlsx)
          </button>
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileCode className="w-4 h-4" />
            Download Word (.docx)
          </button>
        </div>
      </div>
    </div>
  )
}
