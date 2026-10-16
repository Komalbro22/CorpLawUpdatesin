'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { saveAs } from 'file-saver'
import {
  WorkspaceState,
  StatementRowValue
} from '@/lib/financial-statements/types'
import {
  computeHeadBalances,
  generateProfitLossStatement,
  generateBalanceSheetStatement,
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
  PieChart,
  FileDown,
  Sparkles,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Scale
} from 'lucide-react'

export default function ProfitLossBuilderClient() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [dividendPaidInput, setDividendPaidInput] = useState<number>(0)
  const [transfersToReserveInput, setTransfersToReserveInput] = useState<number>(0)

  useEffect(() => {
    setWorkspace(loadWorkspaceFromStorage())
  }, [])

  useEffect(() => {
    if (workspace) {
      saveWorkspaceToStorage(workspace)
    }
  }, [workspace])

  const { headBalances, plRows, balanceSheetRows } = useMemo(() => {
    if (!workspace) {
      return { headBalances: {}, plRows: [], balanceSheetRows: [] }
    }
    const balances = computeHeadBalances(workspace.trialBalance, workspace.manualDirectEntries)
    const pRows = generateProfitLossStatement(balances)
    const bsRows = generateBalanceSheetStatement(balances)
    return { headBalances: balances, plRows: pRows, balanceSheetRows: bsRows }
  }, [workspace])

  if (!workspace) {
    return (
      <div className="py-12 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        Loading Profit &amp; Loss builder...
      </div>
    )
  }

  const { profile } = workspace
  const patCurrent = plRows.find(r => r.headId === 'profit_for_period')?.currentAmount || 0
  const totalRevenue = plRows.find(r => r.headId === 'total_income')?.currentAmount || 0
  const totalExpenses = plRows.find(r => r.headId === 'total_expenses')?.currentAmount || 0
  const pbtCurrent = plRows.find(r => r.headId === 'profit_before_tax')?.currentAmount || 0

  // Reserves Roll-Forward Bridge
  const openingSurplus = (headBalances['reserves_surplus']?.prev || 0)
  const closingSurplusCalculated = openingSurplus + patCurrent - dividendPaidInput - transfersToReserveInput
  const closingSurplusBalanceSheet = (headBalances['reserves_surplus']?.current || 0)
  const reservesVariance = Math.abs(closingSurplusCalculated - closingSurplusBalanceSheet)

  const handleLoadSample = () => {
    if (confirm('Load sample company financial data (Astraea Infotech Pvt Ltd)?')) {
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
        options: {
          includeBalanceSheet: false,
          includeProfitLoss: true,
          includeCashFlow: false,
          includeNotes: true,
          includeRatios: false,
          isDraft: false
        }
      })
      const safeName = (profile.companyName || 'Profit-Loss').replace(/[^a-zA-Z0-9_-]/g, '_')
      doc.save(`${safeName}_Statement_of_Profit_and_Loss.pdf`)
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
        plRows
      })
      const safeName = (profile.companyName || 'Profit-Loss').replace(/[^a-zA-Z0-9_-]/g, '_')
      saveAs(blob, `${safeName}_Profit_Loss.xlsx`)
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
        plRows
      })
      const safeName = (profile.companyName || 'Profit-Loss').replace(/[^a-zA-Z0-9_-]/g, '_')
      saveAs(blob, `${safeName}_Profit_Loss.docx`)
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
            <PieChart className="w-5 h-5 text-blue-600" />
            Statement of Profit and Loss Builder (Schedule III Division I Part II)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Presents operating income, expenses by nature, exceptional items, tax provisions, and retained earnings roll-forward.
          </p>
        </div>
        <button
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Load Sample P&amp;L Data
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
        <div>
          <span className="text-slate-500 block">Total Revenue</span>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrencyAmount(totalRevenue, profile.presentationUnit, true)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Total Expenses</span>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrencyAmount(totalExpenses, profile.presentationUnit, true)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Profit Before Tax (PBT)</span>
          <span className={`font-mono font-bold text-sm ${pbtCurrent >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>
            {formatCurrencyAmount(pbtCurrent, profile.presentationUnit, true)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Profit After Tax (PAT)</span>
          <span className={`font-mono font-bold text-sm ${patCurrent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrencyAmount(patCurrent, profile.presentationUnit, true)}
          </span>
        </div>
      </div>

      {/* Statement Table View */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-navy text-white p-4 text-center border-b border-gold-accent/20">
          <h2 className="text-base font-bold tracking-wide">
            {profile.companyName || 'COMPANY NAME'}
          </h2>
          <h3 className="text-sm font-semibold text-gold-accent mt-0.5">
            {`STATEMENT OF PROFIT AND LOSS FOR THE YEAR ENDED ${(profile.financialYearEnd || '31ST MARCH 2026').toUpperCase()}`}
          </h3>
          <p className="text-xs text-slate-300 italic mt-0.5">
            {`Prepared in accordance with Schedule III Division I of Companies Act, 2013 (Amounts in INR ${profile.presentationUnit.toUpperCase()})`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 w-16">Ref</th>
                <th className="p-3">Particulars</th>
                <th className="p-3 w-16 text-center">Note</th>
                <th className="p-3 w-36 text-right">Year Ended {profile.financialYearEnd || 'Current Year'}</th>
                <th className="p-3 w-36 text-right">Year Ended {profile.comparativeYearEnd || 'Previous Year'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {plRows.map(row => {
                const isGrand = row.isGrandTotal
                const isSub = row.isSubtotal
                const indent = row.level === 1 ? '' : row.level === 2 ? 'pl-4' : 'pl-8'

                return (
                  <tr
                    key={row.headId}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isGrand
                        ? 'bg-slate-200/70 dark:bg-slate-800 font-bold border-t-2 border-b-2 border-slate-900 dark:border-white'
                        : isSub
                        ? 'bg-slate-50 dark:bg-slate-800/30 font-semibold'
                        : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {row.code}
                    </td>
                    <td className={`p-3 text-slate-900 dark:text-white ${indent} ${isGrand || isSub || row.level === 1 ? 'font-bold' : ''}`}>
                      {row.label}
                    </td>
                    <td className="p-3 text-center font-mono text-blue-600 dark:text-blue-400 font-medium">
                      {row.noteNumber && !isGrand && !isSub ? row.noteNumber : ''}
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-slate-900 dark:text-white">
                      {formatCurrencyAmount(row.currentAmount, profile.presentationUnit)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      {formatCurrencyAmount(row.prevAmount, profile.presentationUnit)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retained Earnings & Reserves Roll-Forward Bridge */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              Retained Earnings / Reserves &amp; Surplus Roll-Forward Bridge
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Profit After Tax (PAT) does not automatically equal change in Reserves &amp; Surplus; verify appropriations, dividends, and reserve transfers.
            </p>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-bold ${
              reservesVariance <= 1.0
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {reservesVariance <= 1.0 ? 'Roll-forward Reconciled ✓' : 'Variance to Check'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 block">Opening Surplus in P&amp;L</span>
            <span className="font-mono font-semibold">{formatCurrencyAmount(openingSurplus, profile.presentationUnit, true)}</span>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 block">+ Current Year PAT</span>
            <span className="font-mono font-semibold text-emerald-600">{formatCurrencyAmount(patCurrent, profile.presentationUnit, true)}</span>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 block">Dividends / Appropriations</span>
            <input
              type="number"
              step="any"
              value={dividendPaidInput}
              onChange={e => setDividendPaidInput(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full mt-1 px-1.5 py-0.5 font-mono text-xs border rounded bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 block">Expected Closing Reserves</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {formatCurrencyAmount(closingSurplusCalculated, profile.presentationUnit, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-slate-500">
          Generated client-side. Compliant with Schedule III Division I Part II.
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
