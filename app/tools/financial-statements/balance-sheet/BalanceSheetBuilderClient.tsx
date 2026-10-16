'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { saveAs } from 'file-saver'
import {
  CompanyProfile,
  TrialBalanceRow,
  WorkspaceState,
  StatementRowValue,
  ValidationIssue,
  PresentationUnit
} from '@/lib/financial-statements/types'
import {
  ALL_DIVISION_1_HEADS,
  DIVISION_1_BALANCE_SHEET_HEADS
} from '@/lib/financial-statements/division-1-schema'
import { suggestMapping } from '@/lib/financial-statements/mapping-catalog'
import {
  computeHeadBalances,
  generateBalanceSheetStatement,
  generateProfitLossStatement,
  computeIndirectCashFlow,
  formatCurrencyAmount
} from '@/lib/financial-statements/calculations'
import { computeScheduleIIIRatios } from '@/lib/financial-statements/ratios'
import { runFullStatementValidation } from '@/lib/financial-statements/validation'
import {
  loadWorkspaceFromStorage,
  saveWorkspaceToStorage,
  loadSampleFixture,
  exportWorkspaceToJson,
  incrementLocalPreparationCount
} from '@/lib/financial-statements/storage'
import { generateFinancialStatementsPdf } from '@/lib/financial-statements/export/pdf'
import { generateFinancialStatementsXlsxBlob } from '@/lib/financial-statements/export/xlsx'
import { generateFinancialStatementsDocxBlob } from '@/lib/financial-statements/export/docx'
import {
  downloadBlankTemplate,
  BLANK_TEMPLATES_CATALOG,
  BlankTemplateType,
  BlankFileFormat
} from '@/lib/financial-statements/export/blank-templates'
import FinancialStatementsNav from '../FinancialStatementsNav'
import {
  Building2,
  Table,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileDown,
  Download,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  FileCode,
  Shield,
  Layers,
  Check,
  Info
} from 'lucide-react'

export default function BalanceSheetBuilderClient() {
  const [activeStep, setActiveStep] = useState<number>(1)
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [pasteInputText, setPasteInputText] = useState<string>('')
  const [mappingFilter, setMappingFilter] = useState<'all' | 'unmapped' | 'review'>('all')
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Initialize from localStorage
  useEffect(() => {
    const saved = loadWorkspaceFromStorage()
    setWorkspace(saved)
  }, [])

  // Auto-save to localStorage on change
  useEffect(() => {
    if (workspace) {
      saveWorkspaceToStorage(workspace)
    }
  }, [workspace])

  // Computed statements & validations
  const { headBalances, balanceSheetRows, plRows, cashFlowResult, ratios, validationIssues } = useMemo(() => {
    if (!workspace) {
      return {
        headBalances: {},
        balanceSheetRows: [],
        plRows: [],
        cashFlowResult: undefined,
        ratios: [],
        validationIssues: []
      }
    }

    const balances = computeHeadBalances(workspace.trialBalance, workspace.manualDirectEntries)
    const bsRows = generateBalanceSheetStatement(balances)
    const pRows = generateProfitLossStatement(balances)
    const cfResult = computeIndirectCashFlow(balances, workspace.supplementaryCashFlow, pRows)
    const rResults = computeScheduleIIIRatios(balances, workspace.ratioExplanations)
    const issues = runFullStatementValidation({
      workspace,
      balanceSheetRows: bsRows,
      plRows: pRows,
      cashFlowResult: cfResult,
      ratios: rResults
    })

    return {
      headBalances: balances,
      balanceSheetRows: bsRows,
      plRows: pRows,
      cashFlowResult: cfResult,
      ratios: rResults,
      validationIssues: issues
    }
  }, [workspace])

  if (!workspace) {
    return (
      <div className="py-12 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        Loading financial statements workspace...
      </div>
    )
  }

  const { profile } = workspace
  const blockingIssues = validationIssues.filter(i => i.severity === 'blocking')
  const warningIssues = validationIssues.filter(i => i.severity === 'warning')

  const totalAssets = balanceSheetRows.find(r => r.headId === 'total_assets')?.currentAmount || 0
  const totalLiab = balanceSheetRows.find(r => r.headId === 'total_equity_and_liabilities')?.currentAmount || 0
  const isBalanced = Math.abs(totalAssets - totalLiab) < 0.05 && totalAssets > 0

  // Handle Profile Update
  const updateProfile = (fields: Partial<CompanyProfile>) => {
    setWorkspace(prev => (prev ? { ...prev, profile: { ...prev.profile, ...fields } } : prev))
  }

  // Load Golden Sample
  const handleLoadSample = () => {
    if (confirm('Load sample company financial statements fixture (Astraea Infotech Pvt Ltd)? Existing draft will be replaced.')) {
      const sample = loadSampleFixture()
      setWorkspace(sample)
      setActiveStep(5) // jump to statement preview
    }
  }

  // Parse Pasted Trial Balance
  const handleParseTrialBalance = () => {
    if (!pasteInputText.trim()) return

    const lines = pasteInputText.trim().split(/\r?\n/)
    const parsedRows: TrialBalanceRow[] = []

    lines.forEach((line, idx) => {
      // Split by tab, comma, or 2+ spaces
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(',')
        ? line.split(',')
        : line.split(/\s{2,}/)

      if (parts.length < 2) return

      const ledgerName = parts[0].trim()
      // Skip obvious table headers
      if (/^(particulars|ledger|account|head)/i.test(ledgerName)) return

      const curDeb = parseFloat((parts[1] || '0').replace(/[^0-9.-]/g, '')) || 0
      const curCred = parseFloat((parts[2] || '0').replace(/[^0-9.-]/g, '')) || 0
      const prevDeb = parseFloat((parts[3] || '0').replace(/[^0-9.-]/g, '')) || 0
      const prevCred = parseFloat((parts[4] || '0').replace(/[^0-9.-]/g, '')) || 0

      const autoMap = suggestMapping(ledgerName)

      parsedRows.push({
        id: `tb_${Date.now()}_${idx}`,
        ledgerName,
        currentDebit: curDeb,
        currentCredit: curCred,
        prevDebit: prevDeb,
        prevCredit: prevCred,
        mappedHeadId: autoMap.mappedHeadId,
        confidence: autoMap.confidence,
        isContra: autoMap.isContra || false,
        isExcluded: false,
        matchReason: autoMap.matchReason
      })
    })

    if (parsedRows.length > 0) {
      setWorkspace(prev =>
        prev
          ? {
              ...prev,
              trialBalance: [...prev.trialBalance, ...parsedRows]
            }
          : prev
      )
      setPasteInputText('')
      setActiveStep(3) // Jump to mapping step
    } else {
      alert('Could not parse rows. Please paste columns in format: Ledger Name, Current Debit, Current Credit, Prev Debit, Prev Credit')
    }
  }

  // Update Individual TB Row Mapping
  const updateRowMapping = (rowId: string, headId: string) => {
    setWorkspace(prev => {
      if (!prev) return prev
      return {
        ...prev,
        trialBalance: prev.trialBalance.map(r =>
          r.id === rowId
            ? {
                ...r,
                mappedHeadId: headId,
                confidence: 'high',
                matchReason: 'Manually assigned by reviewer'
              }
            : r
        )
      }
    })
  }

  // Toggle Contra
  const toggleRowContra = (rowId: string) => {
    setWorkspace(prev => {
      if (!prev) return prev
      return {
        ...prev,
        trialBalance: prev.trialBalance.map(r =>
          r.id === rowId ? { ...r, isContra: !r.isContra } : r
        )
      }
    })
  }

  // Toggle Exclude
  const toggleRowExclude = (rowId: string) => {
    setWorkspace(prev => {
      if (!prev) return prev
      return {
        ...prev,
        trialBalance: prev.trialBalance.map(r =>
          r.id === rowId ? { ...r, isExcluded: !r.isExcluded } : r
        )
      }
    })
  }

  // Clear TB Rows
  const clearTrialBalance = () => {
    if (confirm('Clear all trial balance ledger accounts?')) {
      setWorkspace(prev => (prev ? { ...prev, trialBalance: [] } : prev))
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
        ratios,
        options: {
          includeBalanceSheet: true,
          includeProfitLoss: true,
          includeCashFlow: true,
          includeNotes: true,
          includeRatios: true,
          isDraft: !isBalanced || blockingIssues.length > 0
        }
      })
      const safeName = (profile.companyName || 'Balance-Sheet').replace(/[^a-zA-Z0-9_-]/g, '_')
      doc.save(`${safeName}_Schedule_III.pdf`)
      incrementLocalPreparationCount()
    } catch (e: any) {
      alert('Failed to generate PDF: ' + e.message)
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
        cashFlowResult,
        ratios,
        validationIssues
      })
      const safeName = (profile.companyName || 'Balance-Sheet').replace(/[^a-zA-Z0-9_-]/g, '_')
      saveAs(blob, `${safeName}_Financial_Statements.xlsx`)
      incrementLocalPreparationCount()
    } catch (e: any) {
      alert('Failed to generate Excel workbook: ' + e.message)
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
        cashFlowResult,
        ratios
      })
      const safeName = (profile.companyName || 'Balance-Sheet').replace(/[^a-zA-Z0-9_-]/g, '_')
      saveAs(blob, `${safeName}_Statements.docx`)
      incrementLocalPreparationCount()
    } catch (e: any) {
      alert('Failed to generate Word document: ' + e.message)
    } finally {
      setIsExporting(false)
    }
  }

  // Step names
  const steps = [
    { num: 1, label: 'Company Setup' },
    { num: 2, label: 'Financial Inputs' },
    { num: 3, label: 'Account Mapping' },
    { num: 4, label: 'Disclosures & Notes' },
    { num: 5, label: 'Statement Preview' },
    { num: 6, label: 'Export & Downloads' }
  ]

  // Filtered mapping rows
  const displayedMappingRows = workspace.trialBalance.filter(r => {
    if (mappingFilter === 'unmapped') return !r.mappedHeadId || r.confidence === 'unmapped'
    if (mappingFilter === 'review') return r.confidence === 'review'
    return true
  })

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
      {/* Shared Suite Navigation & Privacy Pill */}
      <FinancialStatementsNav onResetWorkspace={() => setWorkspace(loadWorkspaceFromStorage())} />

      {/* Stepper Navigation */}
      <div className="mb-8">
        <div className="hidden sm:flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          {steps.map(s => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                activeStep === s.num
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 pb-2 -mb-3'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === s.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s.num}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Stepper Header */}
        <div className="sm:hidden flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {activeStep}
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {steps[activeStep - 1].label}
            </span>
          </div>
          <div className="flex gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="text-xs px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
              >
                Prev
              </button>
            )}
            {activeStep < 6 && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded font-medium"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP 1: COMPANY SETUP
          ========================================================================= */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Step 1: Company Profile & Accounting Framework
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Configure legal entity identifiers, applicable Schedule III division, and presentation units.
              </p>
            </div>
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              Load Sample Company Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Company Name (Required for Export)
              </label>
              <input
                type="text"
                value={profile.companyName}
                onChange={e => updateProfile({ companyName: e.target.value })}
                placeholder="e.g. Astraea Infotech Private Limited"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Corporate Identification Number (CIN)
              </label>
              <input
                type="text"
                value={profile.cin || ''}
                onChange={e => updateProfile({ cin: e.target.value.toUpperCase() })}
                placeholder="e.g. U72900DL2018PTC334521"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Company Constitution Type
              </label>
              <select
                value={profile.companyType}
                onChange={e => updateProfile({ companyType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="private">Private Limited Company</option>
                <option value="public">Public Limited Company</option>
                <option value="opc">One Person Company (OPC)</option>
                <option value="section8">Section 8 (Non-Profit Company)</option>
                <option value="llp">Limited Liability Partnership (LLP)</option>
              </select>
              {profile.companyType === 'llp' && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300">
                  <strong>Notice:</strong> LLPs are governed by the LLP Act, 2008 and file Form 8. Schedule III company formats do not apply to LLPs.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Accounting Standards Framework
              </label>
              <select
                value={profile.framework}
                onChange={e => updateProfile({ framework: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="division-1">Division I: Companies (AS) Rules, 2006 (Non-Ind AS)</option>
                <option value="division-2">Division II: Companies (Ind AS) Rules, 2015</option>
                <option value="division-3-nbfc">Division III: Relevant Ind AS NBFCs (Out of scope)</option>
              </select>
              {profile.framework === 'division-3-nbfc' && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  Division III NBFC statements are not supported in this release. Please select Division I or Division II.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Financial Year End (Current Period)
              </label>
              <input
                type="date"
                value={profile.financialYearEnd}
                onChange={e => updateProfile({ financialYearEnd: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Comparative Period End Date (Previous Year)
              </label>
              <input
                type="date"
                value={profile.comparativeYearEnd}
                onChange={e => updateProfile({ comparativeYearEnd: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Presentation Unit (Schedule III Rounding Convention)
              </label>
              <select
                value={profile.presentationUnit}
                onChange={e => updateProfile({ presentationUnit: e.target.value as PresentationUnit })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="rupees">Exact INR (Rupees)</option>
                <option value="thousands">Thousands (₹ '000)</option>
                <option value="lakhs">Lakhs (₹ Lakhs)</option>
                <option value="crores">Crores (₹ Crores)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Registered Office Address (Optional)
              </label>
              <input
                type="text"
                value={profile.registeredOffice || ''}
                onChange={e => updateProfile({ registeredOffice: e.target.value })}
                placeholder="e.g. 101, Corporate Heights, Mumbai - 400001"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="confirmFramework"
                checked={profile.frameworkConfirmed}
                onChange={e => updateProfile({ frameworkConfirmed: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="confirmFramework" className="text-xs text-slate-600 dark:text-slate-400">
                I confirm that I have verified the applicability of Division I / II for this company under Section 129.
              </label>
            </div>
            <button
              onClick={() => setActiveStep(2)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Continue to Step 2 →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: FINANCIAL INPUTS (TRIAL BALANCE PASTE OR DIRECT ENTRY)
          ========================================================================= */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" />
                Step 2: Provide Financial Data
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Paste tab-separated columns from Excel, or load sample data.
              </p>
            </div>
            {workspace.trialBalance.length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {workspace.trialBalance.length} Accounts Loaded
                </span>
                <button
                  onClick={clearTrialBalance}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Paste Trial Balance Columns from Excel / Tally / Zoho
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Expected Column Order (Tab-separated):{' '}
              <code className="text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                [Ledger Name] | [Current Debit] | [Current Credit] | [Prev Debit] | [Prev Credit]
              </code>
            </p>
            <textarea
              rows={8}
              value={pasteInputText}
              onChange={e => setPasteInputText(e.target.value)}
              placeholder={`Equity Share Capital\t0\t5000000\t0\t5000000\nSecurities Premium\t0\t2500000\t0\t2500000\nBank Term Loan\t0\t4000000\t0\t5500000\nProperty, Plant and Equipment\t9500000\t0\t9500000\t0\nSundry Debtors\t4860000\t0\t4210000\t0\nBank Current Account\t3240000\t0\t2850000\t0`}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Lines will be classified automatically using local deterministic rules.
              </span>
              <button
                onClick={handleParseTrialBalance}
                disabled={!pasteInputText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Parse & Group Accounts →
              </button>
            </div>
          </div>

          {/* Trial Balance Debits vs Credits Bar */}
          {workspace.trialBalance.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Trial Balance Reconciliation Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Current Total Debits</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrencyAmount(
                      workspace.trialBalance.reduce((s, r) => s + (r.isExcluded ? 0 : r.currentDebit || 0), 0),
                      profile.presentationUnit,
                      true
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Current Total Credits</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrencyAmount(
                      workspace.trialBalance.reduce((s, r) => s + (r.isExcluded ? 0 : r.currentCredit || 0), 0),
                      profile.presentationUnit,
                      true
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Difference (Current)</span>
                  {(() => {
                    const deb = workspace.trialBalance.reduce((s, r) => s + (r.isExcluded ? 0 : r.currentDebit || 0), 0)
                    const cred = workspace.trialBalance.reduce((s, r) => s + (r.isExcluded ? 0 : r.currentCredit || 0), 0)
                    const diff = Math.abs(deb - cred)
                    return (
                      <span className={`font-mono font-bold ${diff < 0.05 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {diff < 0.05 ? '0.00 (Balanced ✓)' : formatCurrencyAmount(diff, profile.presentationUnit, true)}
                      </span>
                    )
                  })()}
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Unmapped Accounts</span>
                  <span className="font-semibold text-amber-600">
                    {workspace.trialBalance.filter(r => !r.isExcluded && (!r.mappedHeadId || r.confidence === 'unmapped')).length} Pending
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium hover:underline"
            >
              ← Back to Setup
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Review Account Mapping ({workspace.trialBalance.length}) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: ACCOUNT MAPPING REVIEW
          ========================================================================= */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Step 3: Account Mapping Review & Overrides
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect deterministic classifications, assign unmapped ledgers, or mark contra balances.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter:</span>
              {(['all', 'unmapped', 'review'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setMappingFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    mappingFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'unmapped' ? 'Unmapped' : 'Needs Review'}
                </button>
              ))}
            </div>
          </div>

          {displayedMappingRows.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              No accounts match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Ledger Account</th>
                    <th className="p-3 text-right">Current Net</th>
                    <th className="p-3 text-right">Prev Net</th>
                    <th className="p-3">Schedule III Assigned Head</th>
                    <th className="p-3 text-center">Confidence</th>
                    <th className="p-3 text-center">Contra?</th>
                    <th className="p-3 text-center">Exclude</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {displayedMappingRows.map(row => {
                    const isCredit = (row.currentCredit || 0) > (row.currentDebit || 0)
                    const netCur = isCredit
                      ? (row.currentCredit || 0) - (row.currentDebit || 0)
                      : (row.currentDebit || 0) - (row.currentCredit || 0)
                    const netPrev = isCredit
                      ? (row.prevCredit || 0) - (row.prevDebit || 0)
                      : (row.prevDebit || 0) - (row.prevCredit || 0)

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          row.isExcluded ? 'opacity-40 line-through' : ''
                        }`}
                      >
                        <td className="p-3 font-medium text-slate-900 dark:text-white max-w-[220px]">
                          <div>{row.ledgerName}</div>
                          {row.matchReason && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{row.matchReason}</div>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatCurrencyAmount(netCur, profile.presentationUnit)} {isCredit ? 'Cr' : 'Dr'}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {formatCurrencyAmount(netPrev, profile.presentationUnit)}
                        </td>
                        <td className="p-3">
                          <select
                            value={row.mappedHeadId || ''}
                            onChange={e => updateRowMapping(row.id, e.target.value)}
                            disabled={row.isExcluded}
                            className={`w-full max-w-[280px] p-1.5 rounded border text-xs outline-none ${
                              !row.mappedHeadId
                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                            }`}
                          >
                            <option value="">-- Select Schedule III Head --</option>
                            <optgroup label="I. EQUITY & LIABILITIES">
                              {DIVISION_1_BALANCE_SHEET_HEADS.filter(h => h.section === 'equity_and_liabilities' && !h.isSubtotal && !h.isGrandTotal).map(h => (
                                <option key={h.id} value={h.id}>
                                  {h.code} {h.label}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="II. ASSETS">
                              {DIVISION_1_BALANCE_SHEET_HEADS.filter(h => h.section === 'assets' && !h.isSubtotal && !h.isGrandTotal).map(h => (
                                <option key={h.id} value={h.id}>
                                  {h.code} {h.label}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="III. PROFIT & LOSS">
                              {ALL_DIVISION_1_HEADS.filter(h => h.section === 'revenue' || h.section === 'expenses' || h.section === 'tax_and_profit').filter(h => !h.isSubtotal && !h.isGrandTotal).map(h => (
                                <option key={h.id} value={h.id}>
                                  {h.code} {h.label}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              row.confidence === 'high'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : row.confidence === 'review'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                            }`}
                          >
                            {row.confidence === 'high' ? 'High' : row.confidence === 'review' ? 'Review' : 'Unmapped'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.isContra || false}
                            onChange={() => toggleRowContra(row.id)}
                            title="Contra account reduces parent head"
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.isExcluded || false}
                            onChange={() => toggleRowExclude(row.id)}
                            title="Exclude from statement calculation"
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium hover:underline"
            >
              ← Back to Inputs
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Proceed to Disclosures & Notes →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: DISCLOSURES & NOTES
          ========================================================================= */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Step 4: Statutory Notes & March 2021 Disclosures
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Review mandated Schedule III notes: promoter holdings, trade payables ageing, receivables ageing, and CWIP.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Note 1: Share Capital & Promoter holdings */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Note 1: Share Capital & Promoter Holding
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold">
                  2021 Mandate
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Mandatory disclosure of shares held by promoters at end of year and % change during the year.
              </p>
              {workspace.notes.note_1?.promoterShareholding && workspace.notes.note_1.promoterShareholding.length > 0 ? (
                <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                  {workspace.notes.note_1.promoterShareholding.map((p, i) => (
                    <div key={i} className="flex justify-between py-0.5">
                      <span>{p.promoterName}</span>
                      <span className="font-semibold">{p.percentageCurrent}% ({p.pctChangeDuringYear >= 0 ? '+' : ''}{p.pctChangeDuringYear}% in year)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">No promoter rows specified yet.</div>
              )}
            </div>

            {/* Note 10: Trade Payables Ageing */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Note 10: Trade Payables Ageing Schedule
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold">
                  2021 Mandate
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Split into MSME and Others, disputed dues, across &lt;1 yr, 1-2 yrs, 2-3 yrs, and &gt;3 yrs.
              </p>
              {workspace.notes.note_10?.tradePayablesAgeing ? (
                <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                  {workspace.notes.note_10.tradePayablesAgeing.map((a, i) => (
                    <div key={i} className="flex justify-between py-0.5">
                      <span className="uppercase">{a.category}</span>
                      <span className="font-semibold">{formatCurrencyAmount(a.total, profile.presentationUnit, true)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">Ageing schedule configured automatically on sample load.</div>
              )}
            </div>

            {/* Note 23: Trade Receivables Ageing */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Note 23: Trade Receivables Ageing Schedule
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold">
                  2021 Mandate
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Split into &lt;6 mos, 6m-1yr, 1-2 yrs, 2-3 yrs, &gt;3 yrs, across undisputed good, doubtful and disputed dues.
              </p>
              {workspace.notes.note_23?.tradeReceivablesAgeing ? (
                <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                  {workspace.notes.note_23.tradeReceivablesAgeing.map((a, i) => (
                    <div key={i} className="flex justify-between py-0.5">
                      <span className="uppercase">{a.category.replace(/_/g, ' ')}</span>
                      <span className="font-semibold">{formatCurrencyAmount(a.total, profile.presentationUnit, true)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">Configured automatically.</div>
              )}
            </div>

            {/* Ratios Preview Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  The 11 Schedule III Ratios
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                  Calculated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Ratios are derived dynamically with numerator/denominator tracking. Any change &gt;25% requires reason.
              </p>
              <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                {ratios.slice(0, 3).map(r => (
                  <div key={r.id} className="flex justify-between">
                    <span>{r.name}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {r.currentValue !== null ? r.currentValue.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                ))}
                <div className="text-[10px] text-slate-500 pt-1">
                  + 8 additional statutory ratios computed in Preview step.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium hover:underline"
            >
              ← Back to Mapping
            </button>
            <button
              onClick={() => setActiveStep(5)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Review Statements & Validation Report →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: STATEMENT PREVIEW & VALIDATION REPORT
          ========================================================================= */}
      {activeStep === 5 && (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reconciliation Status:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isBalanced && blockingIssues.length === 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {isBalanced && blockingIssues.length === 0
                    ? 'Ready for Professional Review ✓'
                    : 'Needs Professional Review'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Total Equity & Liabilities: {formatCurrencyAmount(totalLiab, profile.presentationUnit, true)} | Total Assets: {formatCurrencyAmount(totalAssets, profile.presentationUnit, true)}
                {Math.abs(totalAssets - totalLiab) >= 0.05 && (
                  <span className="text-red-600 font-bold ml-2">
                    (Difference: {formatCurrencyAmount(Math.abs(totalAssets - totalLiab), profile.presentationUnit, true)})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(6)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4" />
                Proceed to Export
              </button>
            </div>
          </div>

          {/* Validation Issues Alert Banner */}
          {validationIssues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Statutory Audit & Reconciliation Findings ({validationIssues.length})
              </h3>
              <div className="space-y-2">
                {validationIssues.map(issue => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-lg text-xs border ${
                      issue.severity === 'blocking'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>
                        Rule {issue.ruleNumber}: {issue.title}
                      </span>
                      <span className="uppercase text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-white/60 dark:bg-black/30">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-1">{issue.message}</p>
                    {issue.suggestedFix && (
                      <p className="mt-1 font-semibold text-[11px] opacity-90">
                        Remediation: {issue.suggestedFix}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Balance Sheet Statement Table Preview */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white p-4 text-center">
              <h2 className="text-base font-bold tracking-wide">
                {profile.companyName || 'COMPANY NAME'}
              </h2>
              <h3 className="text-sm font-semibold text-blue-300 mt-0.5">
                BALANCE SHEET AS AT {profile.financialYearEnd || '31ST MARCH 2026'}
              </h3>
              <p className="text-xs text-slate-400 italic mt-0.5">
                Prepared in accordance with Schedule III Division I of Companies Act, 2013 (Amounts in INR {profile.presentationUnit.toUpperCase()})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 w-16">Ref</th>
                    <th className="p-3">Particulars</th>
                    <th className="p-3 w-16 text-center">Note</th>
                    <th className="p-3 w-36 text-right">Figures as at {profile.financialYearEnd || 'Current Year'}</th>
                    <th className="p-3 w-36 text-right">Figures as at {profile.comparativeYearEnd || 'Previous Year'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {balanceSheetRows.map(row => {
                    const isTotal = row.isGrandTotal
                    const isSub = row.isSubtotal
                    const indent = row.level === 1 ? '' : row.level === 2 ? 'pl-4' : 'pl-8'

                    return (
                      <tr
                        key={row.headId}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          isTotal
                            ? 'bg-slate-200/70 dark:bg-slate-800 font-bold border-t-2 border-b-2 border-slate-900 dark:border-white'
                            : isSub
                            ? 'bg-slate-50 dark:bg-slate-800/30 font-semibold'
                            : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {row.code}
                        </td>
                        <td className={`p-3 text-slate-900 dark:text-white ${indent} ${isTotal || isSub || row.level === 1 ? 'font-bold' : ''}`}>
                          {row.label}
                        </td>
                        <td className="p-3 text-center font-mono text-blue-600 dark:text-blue-400 font-medium">
                          {row.noteNumber && !isTotal && !isSub ? row.noteNumber : ''}
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

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium hover:underline"
            >
              ← Back to Notes
            </button>
            <button
              onClick={() => setActiveStep(6)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              Download Export Files →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 6: EXPORT & BLANK DOWNLOADS
          ========================================================================= */}
      {activeStep === 6 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Step 6: Export Generated Statements & Statutory Downloads
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Generate formatted PDF, formula-linked Excel (.xlsx), and editable Word (.docx) documents directly in your browser.
            </p>
          </div>

          {/* Flagship Exports for Current Statement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Statutory PDF
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Flagship
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Branded navy/gold presentation with page breaks, repeated headers, notes cross-referencing, and ratios table.
                </p>
              </div>
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF Statement
              </button>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    Formula Excel (.xlsx)
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Formula-Linked
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Multi-sheet workbook (Balance Sheet, P&L, Cash Flow, Notes, Ratios, Validation) with dynamic Excel formulas.
                </p>
              </div>
              <button
                onClick={handleExportXlsx}
                disabled={isExporting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Excel Workbook
              </button>
            </div>

            <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-600" />
                    Word (.docx)
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Editable Doc
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Editable statutory tables, perfect for inserting into director reports, board resolutions, and filing packs.
                </p>
              </div>
              <button
                onClick={handleExportDocx}
                disabled={isExporting}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Word Document
              </button>
            </div>
          </div>

          {/* Workspace JSON Backup */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Workspace Backup & Data Portability (Zero Server Storage)
              </span>
              <span className="text-xs text-slate-500">
                Download your entire draft workspace as a local JSON file to restore anytime on another device.
              </span>
            </div>
            <button
              onClick={() => exportWorkspaceToJson(workspace)}
              className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
            >
              Export Workspace JSON
            </button>
          </div>

          {/* The 12 Blank Download Templates Pack */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                Blank Schedule III Format Download Pack (12 Formats)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print-ready, empty statutory templates for manual drafting or Excel preparation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BLANK_TEMPLATES_CATALOG.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">Download:</span>
                    <button
                      onClick={() => downloadBlankTemplate(item.id, 'pdf')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => downloadBlankTemplate(item.id, 'xlsx')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                    >
                      Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => downloadBlankTemplate(item.id, 'docx')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
                    >
                      Word (.docx)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
