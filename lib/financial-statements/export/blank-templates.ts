import { saveAs } from 'file-saver'
import { generateFinancialStatementsPdf } from './pdf'
import { generateFinancialStatementsXlsxBlob } from './xlsx'
import { generateFinancialStatementsDocxBlob } from './docx'
import {
  WorkspaceState,
  StatementRowValue,
  CashFlowStatementResult,
  RatioResult
} from '../types'
import {
  DIVISION_1_BALANCE_SHEET_HEADS,
  DIVISION_1_PL_HEADS
} from '../division-1-schema'
import { SCHEDULE_III_RATIOS } from '../ratios'

export type BlankTemplateType =
  | 'balance_sheet'
  | 'profit_loss'
  | 'cash_flow'
  | 'notes_to_accounts'

export type BlankFileFormat = 'pdf' | 'xlsx' | 'docx'

export interface BlankTemplateMeta {
  id: BlankTemplateType
  title: string
  description: string
  division: 'Division I (Companies Act 2013 / AS)'
  formats: BlankFileFormat[]
}

export const BLANK_TEMPLATES_CATALOG: BlankTemplateMeta[] = [
  {
    id: 'balance_sheet',
    title: 'Schedule III Balance Sheet (Division I)',
    description: 'Statutory format with March 2021 amendments, current/non-current classification, and note linkages.',
    division: 'Division I (Companies Act 2013 / AS)',
    formats: ['pdf', 'xlsx', 'docx']
  },
  {
    id: 'profit_loss',
    title: 'Schedule III Statement of Profit and Loss (Division I)',
    description: 'Statutory Part II layout covering revenue, expense classifications, tax expense, and PAT.',
    division: 'Division I (Companies Act 2013 / AS)',
    formats: ['pdf', 'xlsx', 'docx']
  },
  {
    id: 'cash_flow',
    title: 'Cash Flow Statement (Indirect Method)',
    description: 'AS-3 / Ind AS 7 compliant indirect cash flow format with working capital and non-cash reconciliation.',
    division: 'Division I (Companies Act 2013 / AS)',
    formats: ['pdf', 'xlsx', 'docx']
  },
  {
    id: 'notes_to_accounts',
    title: 'Statutory Notes to Accounts & 2021 Disclosures',
    description: 'Includes promoter shareholding, trade payables/receivables ageing tables, and CWIP completion schedules.',
    division: 'Division I (Companies Act 2013 / AS)',
    formats: ['pdf', 'xlsx', 'docx']
  }
]

function getBlankWorkspace(): WorkspaceState {
  return {
    profile: {
      companyName: '[INSERT COMPANY NAME HERE]',
      cin: '[INSERT CIN]',
      companyType: 'private',
      framework: 'division-1',
      financialYearEnd: '31st March 2026',
      comparativeYearEnd: '31st March 2025',
      presentationUnit: 'rupees',
      registeredOffice: '[Insert Registered Office Address]',
      frameworkConfirmed: true
    },
    trialBalance: [],
    manualDirectEntries: {},
    notes: {
      note_1: {
        id: 'note_1',
        noteNumber: 1,
        title: 'Share Capital',
        targetHeadId: 'sh_capital',
        status: 'incomplete',
        items: [{ id: 'b1', label: 'Equity shares of Rs. 10 each', currentAmount: 0, prevAmount: 0 }],
        promoterShareholding: [
          {
            promoterName: '[Promoter 1]',
            sharesHeldCurrent: 0,
            sharesHeldPrev: 0,
            percentageCurrent: 0,
            percentagePrev: 0,
            pctChangeDuringYear: 0
          }
        ]
      },
      note_10: {
        id: 'note_10',
        noteNumber: 10,
        title: 'Trade Payables & Ageing Schedule',
        targetHeadId: 'trade_payables_others',
        status: 'incomplete',
        items: [
          { id: 'b2', label: 'Micro and Small Enterprises', currentAmount: 0, prevAmount: 0 },
          { id: 'b3', label: 'Others', currentAmount: 0, prevAmount: 0 }
        ],
        tradePayablesAgeing: [
          { category: 'msme', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
          { category: 'others', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 }
        ]
      },
      note_23: {
        id: 'note_23',
        noteNumber: 23,
        title: 'Trade Receivables & Ageing Schedule',
        targetHeadId: 'trade_receivables',
        status: 'incomplete',
        items: [{ id: 'b4', label: 'Undisputed trade receivables - considered good', currentAmount: 0, prevAmount: 0 }],
        tradeReceivablesAgeing: [
          {
            category: 'undisputed_good',
            lessThan6Months: 0,
            sixMonthsToOneYear: 0,
            oneToTwoYears: 0,
            twoToThreeYears: 0,
            moreThan3Years: 0,
            total: 0
          }
        ]
      }
    },
    supplementaryCashFlow: {
      depreciationAmortization: 0,
      interestExpense: 0,
      interestIncome: 0,
      dividendIncome: 0,
      gainLossOnSaleOfAssets: 0,
      otherNonCashAdjustments: 0,
      taxPaidActual: 0,
      purchaseOfPPE: 0,
      saleOfPPE: 0,
      purchaseOfInvestments: 0,
      saleOfInvestments: 0,
      interestReceivedActual: 0,
      dividendsReceivedActual: 0,
      proceedsFromShareCapital: 0,
      proceedsFromBorrowings: 0,
      repaymentOfBorrowings: 0,
      interestPaidActual: 0,
      dividendsPaidActual: 0,
      openingCashAndEquivalents: 0
    },
    ratioExplanations: {},
    lastUpdated: new Date().toISOString()
  }
}

function getBlankBalanceSheetRows(): StatementRowValue[] {
  return DIVISION_1_BALANCE_SHEET_HEADS.map(h => ({
    headId: h.id,
    code: h.code,
    label: h.label,
    noteNumber: h.defaultNoteNumber,
    currentAmount: 0,
    prevAmount: 0,
    isSubtotal: h.isSubtotal,
    isGrandTotal: h.isGrandTotal,
    level: h.level,
    section: h.section
  }))
}

function getBlankProfitLossRows(): StatementRowValue[] {
  return DIVISION_1_PL_HEADS.map(h => ({
    headId: h.id,
    code: h.code,
    label: h.label,
    noteNumber: h.defaultNoteNumber,
    currentAmount: 0,
    prevAmount: 0,
    isSubtotal: h.isSubtotal,
    isGrandTotal: h.isGrandTotal,
    level: h.level,
    section: h.section
  }))
}

function getBlankCashFlowResult(): CashFlowStatementResult {
  return {
    operatingActivities: {
      profitBeforeTax: 0,
      adjustmentsForNonCash: 0,
      operatingProfitBeforeWorkingCapital: 0,
      workingCapitalChanges: 0,
      cashGeneratedFromOperations: 0,
      directTaxesPaid: 0,
      netCashFromOperating: 0
    },
    investingActivities: {
      purchaseOfPPE: 0,
      saleOfPPE: 0,
      purchaseOfInvestments: 0,
      saleOfInvestments: 0,
      interestReceived: 0,
      dividendsReceived: 0,
      netCashFromInvesting: 0
    },
    financingActivities: {
      proceedsFromShareCapital: 0,
      proceedsFromBorrowings: 0,
      repaymentOfBorrowings: 0,
      interestPaid: 0,
      dividendsPaid: 0,
      netCashFromFinancing: 0
    },
    netIncreaseInCash: 0,
    openingCash: 0,
    closingCashCalculated: 0,
    closingCashBalanceSheet: 0,
    discrepancy: 0
  }
}

function getBlankRatios(): RatioResult[] {
  return SCHEDULE_III_RATIOS.map(r => ({
    id: r.id,
    name: r.name,
    section: r.section,
    numeratorLabel: r.numeratorLabel,
    denominatorLabel: r.denominatorLabel,
    currentNumerator: 0,
    currentDenominator: 0,
    prevNumerator: 0,
    prevDenominator: 0,
    formulaDescription: r.formulaDescription,
    statutoryReference: r.statutoryReference,
    currentValue: null,
    prevValue: null,
    variancePct: null,
    isMeaningful: false,
    varianceExceeds25: false,
    explanation: ''
  }))
}

/**
 * Downloads one of the 12 blank templates in PDF, XLSX, or DOCX directly in browser.
 */
export async function downloadBlankTemplate(
  templateType: BlankTemplateType,
  format: BlankFileFormat
): Promise<void> {
  const ws = getBlankWorkspace()
  const bsRows = getBlankBalanceSheetRows()
  const plRows = getBlankProfitLossRows()
  const cfsResult = getBlankCashFlowResult()

  const filePrefix = `blank_schedule_iii_${templateType}`

  const isBs = templateType === 'balance_sheet'
  const isPl = templateType === 'profit_loss'
  const isCfs = templateType === 'cash_flow'
  const isNotes = templateType === 'notes_to_accounts'

  if (format === 'pdf') {
    const doc = generateFinancialStatementsPdf({
      workspace: ws,
      balanceSheetRows: (isBs || isNotes) ? bsRows : [],
      plRows: (isPl || isBs || isNotes) ? plRows : [],
      cashFlowResult: (isCfs || isBs) ? cfsResult : undefined,
      ratios: isBs ? getBlankRatios() : undefined,
      options: {
        includeBalanceSheet: isBs,
        includeProfitLoss: isPl || isBs,
        includeCashFlow: isCfs || isBs,
        includeNotes: isNotes || isBs || isPl,
        includeRatios: isBs,
        isDraft: false
      }
    })
    doc.save(`${filePrefix}.pdf`)
  } else if (format === 'xlsx') {
    const blob = await generateFinancialStatementsXlsxBlob({
      workspace: ws,
      balanceSheetRows: (isBs || isNotes) ? bsRows : [],
      plRows: (isPl || isBs || isNotes) ? plRows : [],
      cashFlowResult: (isCfs || isBs) ? cfsResult : undefined,
      ratios: isBs ? getBlankRatios() : undefined
    })
    saveAs(blob, `${filePrefix}.xlsx`)
  } else if (format === 'docx') {
    const blob = await generateFinancialStatementsDocxBlob({
      workspace: ws,
      balanceSheetRows: (isBs || isNotes) ? bsRows : [],
      plRows: (isPl || isBs || isNotes) ? plRows : [],
      cashFlowResult: (isCfs || isBs) ? cfsResult : undefined
    })
    saveAs(blob, `${filePrefix}.docx`)
  }
}
