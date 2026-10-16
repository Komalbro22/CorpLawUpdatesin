import {
  TrialBalanceRow,
  StatementRowValue,
  CashFlowStatementResult,
  SupplementaryCashFlowInputs,
  PresentationUnit
} from './types'
import {
  DIVISION_1_BALANCE_SHEET_HEADS,
  DIVISION_1_PL_HEADS,
  HEAD_BY_ID
} from './division-1-schema'

export interface HeadBalances {
  [headId: string]: {
    current: number
    prev: number
  }
}

/**
 * Computes raw head balances by aggregating trial balance rows and manual direct entries.
 */
export function computeHeadBalances(
  trialBalance: TrialBalanceRow[],
  manualDirectEntries: Record<string, { current: number; prev: number }> = {}
): HeadBalances {
  const balances: HeadBalances = {}

  // Initialize with zeros for all known heads
  for (const head of [...DIVISION_1_BALANCE_SHEET_HEADS, ...DIVISION_1_PL_HEADS]) {
    balances[head.id] = { current: 0, prev: 0 }
  }

  // 1. Process Trial Balance rows
  for (const row of trialBalance) {
    if (row.isExcluded || !row.mappedHeadId) continue

    const head = HEAD_BY_ID.get(row.mappedHeadId)
    if (!head) continue

    const isCreditNormal = head.normalBalance === 'credit'
    let currentNet = 0
    let prevNet = 0

    if (isCreditNormal) {
      currentNet = (row.currentCredit || 0) - (row.currentDebit || 0)
      prevNet = (row.prevCredit || 0) - (row.prevDebit || 0)
    } else {
      currentNet = (row.currentDebit || 0) - (row.currentCredit || 0)
      prevNet = (row.prevDebit || 0) - (row.prevCredit || 0)
    }

    if (row.isContra) {
      currentNet = -Math.abs(currentNet)
      prevNet = -Math.abs(prevNet)
    }

    balances[head.id].current += currentNet
    balances[head.id].prev += prevNet
  }

  // 2. Add manual direct entries
  for (const [headId, val] of Object.entries(manualDirectEntries)) {
    if (!balances[headId]) {
      balances[headId] = { current: 0, prev: 0 }
    }
    balances[headId].current += val.current || 0
    balances[headId].prev += val.prev || 0
  }

  // 3. Roll Current Year PAT into Reserves & Surplus if P&L accounts exist in TB
  const revCur = (balances['rev_operations']?.current || 0) + (balances['other_income']?.current || 0)
  const expCur =
    (balances['exp_materials_consumed']?.current || 0) +
    (balances['exp_purchases_stock']?.current || 0) +
    (balances['exp_changes_inventories']?.current || 0) +
    (balances['exp_employee_benefits']?.current || 0) +
    (balances['exp_finance_costs']?.current || 0) +
    (balances['exp_depreciation_amortization']?.current || 0) +
    (balances['exp_other_expenses']?.current || 0)
  const taxCur = (balances['tax_current']?.current || 0) + (balances['tax_deferred']?.current || 0)
  const patCur = revCur - expCur - taxCur

  if (patCur !== 0 && revCur > 0) {
    balances['reserves_surplus'].current += patCur
  }

  return balances
}

/**
 * Generates the full Schedule III Division I Balance Sheet statement with subtotals.
 */
export function generateBalanceSheetStatement(
  headBalances: HeadBalances,
  noteNumberMap: Record<string, number> = {}
): StatementRowValue[] {
  const result: StatementRowValue[] = []

  // Helper to fetch balance
  const getBal = (id: string) => headBalances[id] || { current: 0, prev: 0 }

  for (const head of DIVISION_1_BALANCE_SHEET_HEADS) {
    let currentAmount = 0
    let prevAmount = 0

    if (head.isSubtotal || head.isGrandTotal) {
      if (head.id === 'total_shareholders_funds') {
        const h1 = getBal('sh_capital')
        const h2 = getBal('reserves_surplus')
        const h3 = getBal('money_share_warrants')
        currentAmount = h1.current + h2.current + h3.current
        prevAmount = h1.prev + h2.prev + h3.prev
      } else if (head.id === 'total_non_current_liabilities') {
        const h1 = getBal('lt_borrowings')
        const h2 = getBal('deferred_tax_liab')
        const h3 = getBal('other_lt_liab')
        const h4 = getBal('lt_provisions')
        currentAmount = h1.current + h2.current + h3.current + h4.current
        prevAmount = h1.prev + h2.prev + h3.prev + h4.prev
      } else if (head.id === 'total_current_liabilities') {
        const h1 = getBal('st_borrowings')
        const h2 = getBal('trade_payables_msme')
        const h3 = getBal('trade_payables_others')
        const h4 = getBal('other_cur_liab')
        const h5 = getBal('st_provisions')
        currentAmount = h1.current + h2.current + h3.current + h4.current + h5.current
        prevAmount = h1.prev + h2.prev + h3.prev + h4.prev + h5.prev
      } else if (head.id === 'total_equity_and_liabilities') {
        const sf = result.find(r => r.headId === 'total_shareholders_funds')
        const sam = getBal('share_app_money')
        const ncl = result.find(r => r.headId === 'total_non_current_liabilities')
        const cl = result.find(r => r.headId === 'total_current_liabilities')
        currentAmount =
          (sf?.currentAmount || 0) +
          sam.current +
          (ncl?.currentAmount || 0) +
          (cl?.currentAmount || 0)
        prevAmount =
          (sf?.prevAmount || 0) +
          sam.prev +
          (ncl?.prevAmount || 0) +
          (cl?.prevAmount || 0)
      } else if (head.id === 'total_non_current_assets') {
        const h1 = getBal('ppe_tangible')
        const h2 = getBal('intangible_assets')
        const h3 = getBal('cwip')
        const h4 = getBal('intangible_under_dev')
        const h5 = getBal('non_cur_investments')
        const h6 = getBal('deferred_tax_assets')
        const h7 = getBal('lt_loans_advances')
        const h8 = getBal('other_non_cur_assets')
        currentAmount =
          h1.current +
          h2.current +
          h3.current +
          h4.current +
          h5.current +
          h6.current +
          h7.current +
          h8.current
        prevAmount =
          h1.prev +
          h2.prev +
          h3.prev +
          h4.prev +
          h5.prev +
          h6.prev +
          h7.prev +
          h8.prev
      } else if (head.id === 'total_current_assets') {
        const h1 = getBal('cur_investments')
        const h2 = getBal('inventories')
        const h3 = getBal('trade_receivables')
        const h4 = getBal('cash_and_equivalents')
        const h5 = getBal('st_loans_advances')
        const h6 = getBal('other_cur_assets')
        currentAmount =
          h1.current +
          h2.current +
          h3.current +
          h4.current +
          h5.current +
          h6.current
        prevAmount =
          h1.prev +
          h2.prev +
          h3.prev +
          h4.prev +
          h5.prev +
          h6.prev
      } else if (head.id === 'total_assets') {
        const nca = result.find(r => r.headId === 'total_non_current_assets')
        const ca = result.find(r => r.headId === 'total_current_assets')
        currentAmount = (nca?.currentAmount || 0) + (ca?.currentAmount || 0)
        prevAmount = (nca?.prevAmount || 0) + (ca?.prevAmount || 0)
      }
    } else {
      const b = getBal(head.id)
      currentAmount = b.current
      prevAmount = b.prev
    }

    result.push({
      headId: head.id,
      code: head.code,
      label: head.label,
      noteNumber: noteNumberMap[head.id] || head.defaultNoteNumber,
      currentAmount,
      prevAmount,
      isSubtotal: head.isSubtotal,
      isGrandTotal: head.isGrandTotal,
      level: head.level,
      section: head.section
    })
  }

  return result
}

/**
 * Generates the full Schedule III Division I Statement of Profit and Loss with subtotals.
 */
export function generateProfitLossStatement(
  headBalances: HeadBalances,
  noteNumberMap: Record<string, number> = {}
): StatementRowValue[] {
  const result: StatementRowValue[] = []
  const getBal = (id: string) => headBalances[id] || { current: 0, prev: 0 }

  for (const head of DIVISION_1_PL_HEADS) {
    let currentAmount = 0
    let prevAmount = 0

    if (head.isSubtotal || head.isGrandTotal) {
      if (head.id === 'total_income') {
        const r1 = getBal('rev_operations')
        const r2 = getBal('other_income')
        currentAmount = r1.current + r2.current
        prevAmount = r1.prev + r2.prev
      } else if (head.id === 'total_expenses') {
        const e1 = getBal('exp_materials_consumed')
        const e2 = getBal('exp_purchases_stock')
        const e3 = getBal('exp_changes_inventories')
        const e4 = getBal('exp_employee_benefits')
        const e5 = getBal('exp_finance_costs')
        const e6 = getBal('exp_depreciation_amortization')
        const e7 = getBal('exp_other_expenses')
        currentAmount =
          e1.current +
          e2.current +
          e3.current +
          e4.current +
          e5.current +
          e6.current +
          e7.current
        prevAmount =
          e1.prev +
          e2.prev +
          e3.prev +
          e4.prev +
          e5.prev +
          e6.prev +
          e7.prev
      } else if (head.id === 'profit_before_exceptional') {
        const ti = result.find(r => r.headId === 'total_income')
        const te = result.find(r => r.headId === 'total_expenses')
        currentAmount = (ti?.currentAmount || 0) - (te?.currentAmount || 0)
        prevAmount = (ti?.prevAmount || 0) - (te?.prevAmount || 0)
      } else if (head.id === 'profit_before_extraordinary') {
        const pbe = result.find(r => r.headId === 'profit_before_exceptional')
        const exc = getBal('exceptional_items')
        currentAmount = (pbe?.currentAmount || 0) - exc.current
        prevAmount = (pbe?.prevAmount || 0) - exc.prev
      } else if (head.id === 'profit_before_tax') {
        const pbex = result.find(r => r.headId === 'profit_before_extraordinary')
        const ext = getBal('extraordinary_items')
        currentAmount = (pbex?.currentAmount || 0) - ext.current
        prevAmount = (pbex?.prevAmount || 0) - ext.prev
      } else if (head.id === 'total_tax_expense') {
        const t1 = getBal('tax_current')
        const t2 = getBal('tax_deferred')
        currentAmount = t1.current + t2.current
        prevAmount = t1.prev + t2.prev
      } else if (head.id === 'profit_continuing_ops') {
        const pbt = result.find(r => r.headId === 'profit_before_tax')
        const tax = result.find(r => r.headId === 'total_tax_expense')
        currentAmount = (pbt?.currentAmount || 0) - (tax?.currentAmount || 0)
        prevAmount = (pbt?.prevAmount || 0) - (tax?.prevAmount || 0)
      } else if (head.id === 'profit_for_period') {
        const pco = result.find(r => r.headId === 'profit_continuing_ops')
        const disc = getBal('profit_discontinued_ops')
        currentAmount = (pco?.currentAmount || 0) + disc.current
        prevAmount = (pco?.prevAmount || 0) + disc.prev
      }
    } else {
      const b = getBal(head.id)
      currentAmount = b.current
      prevAmount = b.prev
    }

    result.push({
      headId: head.id,
      code: head.code,
      label: head.label,
      noteNumber: noteNumberMap[head.id] || head.defaultNoteNumber,
      currentAmount,
      prevAmount,
      isSubtotal: head.isSubtotal,
      isGrandTotal: head.isGrandTotal,
      level: head.level,
      section: head.section
    })
  }

  return result
}

/**
 * Computes indirect cash flow statement reconciling from PBT and working capital changes.
 */
export function computeIndirectCashFlow(
  headBalances: HeadBalances,
  supp: SupplementaryCashFlowInputs,
  plRows?: StatementRowValue[]
): CashFlowStatementResult {
  // 1. Profit Before Tax
  let pbt = 0
  if (plRows) {
    const pbtRow = plRows.find(r => r.headId === 'profit_before_tax')
    if (pbtRow) pbt = pbtRow.currentAmount
  }
  if (!pbt) {
    // If plRows not provided or empty, calculate from head balances
    const rev = (headBalances['rev_operations']?.current || 0) + (headBalances['other_income']?.current || 0)
    const exp =
      (headBalances['exp_materials_consumed']?.current || 0) +
      (headBalances['exp_purchases_stock']?.current || 0) +
      (headBalances['exp_changes_inventories']?.current || 0) +
      (headBalances['exp_employee_benefits']?.current || 0) +
      (headBalances['exp_finance_costs']?.current || 0) +
      (headBalances['exp_depreciation_amortization']?.current || 0) +
      (headBalances['exp_other_expenses']?.current || 0)
    pbt = rev - exp
  }

  // 2. Adjustments for non-cash / non-operating items
  const nonCashAdjustments =
    (supp.depreciationAmortization || 0) +
    (supp.interestExpense || 0) -
    (supp.interestIncome || 0) -
    (supp.dividendIncome || 0) +
    (supp.gainLossOnSaleOfAssets || 0) +
    (supp.otherNonCashAdjustments || 0)

  const operatingProfitBeforeWC = pbt + nonCashAdjustments

  // 3. Working Capital Changes from Balance Sheet movement
  // Trade Receivables: decrease is cash inflow (+), increase is cash outflow (-)
  const recPrev = headBalances['trade_receivables']?.prev || 0
  const recCur = headBalances['trade_receivables']?.current || 0
  const deltaReceivables = recPrev - recCur

  // Inventories: decrease is cash inflow (+), increase is cash outflow (-)
  const invPrev = headBalances['inventories']?.prev || 0
  const invCur = headBalances['inventories']?.current || 0
  const deltaInventories = invPrev - invCur

  // Other Current Assets + Short Term Loans/Advances:
  const ocaPrev =
    (headBalances['other_cur_assets']?.prev || 0) +
    (headBalances['st_loans_advances']?.prev || 0)
  const ocaCur =
    (headBalances['other_cur_assets']?.current || 0) +
    (headBalances['st_loans_advances']?.current || 0)
  const deltaOtherCurrentAssets = ocaPrev - ocaCur

  // Trade Payables: increase is cash inflow (+), decrease is cash outflow (-)
  const payPrev =
    (headBalances['trade_payables_msme']?.prev || 0) +
    (headBalances['trade_payables_others']?.prev || 0)
  const payCur =
    (headBalances['trade_payables_msme']?.current || 0) +
    (headBalances['trade_payables_others']?.current || 0)
  const deltaTradePayables = payCur - payPrev

  // Other Current Liabilities: increase is cash inflow (+), decrease is cash outflow (-)
  const oclPrev = headBalances['other_cur_liab']?.prev || 0
  const oclCur = headBalances['other_cur_liab']?.current || 0
  const deltaOtherCurrentLiab = oclCur - oclPrev

  // Provisions:
  const provPrev = headBalances['st_provisions']?.prev || 0
  const provCur = headBalances['st_provisions']?.current || 0
  const deltaProvisions = provCur - provPrev

  const totalWorkingCapitalChanges =
    deltaReceivables +
    deltaInventories +
    deltaOtherCurrentAssets +
    deltaTradePayables +
    deltaOtherCurrentLiab +
    deltaProvisions

  const cashGeneratedFromOperations = operatingProfitBeforeWC + totalWorkingCapitalChanges
  const netCashFromOperating = cashGeneratedFromOperations - (supp.taxPaidActual || 0)

  // 4. Investing activities
  const netCashFromInvesting =
    -(supp.purchaseOfPPE || 0) +
    (supp.saleOfPPE || 0) -
    (supp.purchaseOfInvestments || 0) +
    (supp.saleOfInvestments || 0) +
    (supp.interestReceivedActual || 0) +
    (supp.dividendsReceivedActual || 0)

  // 5. Financing activities
  const netCashFromFinancing =
    (supp.proceedsFromShareCapital || 0) +
    (supp.proceedsFromBorrowings || 0) -
    (supp.repaymentOfBorrowings || 0) -
    (supp.interestPaidActual || 0) -
    (supp.dividendsPaidActual || 0)

  // 6. Net increase and reconciliation
  const netIncreaseInCash = netCashFromOperating + netCashFromInvesting + netCashFromFinancing
  const openingCash =
    supp.openingCashAndEquivalents || headBalances['cash_and_equivalents']?.prev || 0
  const closingCashCalculated = openingCash + netIncreaseInCash
  const closingCashBalanceSheet = headBalances['cash_and_equivalents']?.current || 0
  const discrepancy = closingCashCalculated - closingCashBalanceSheet

  return {
    operatingActivities: {
      profitBeforeTax: pbt,
      adjustmentsForNonCash: nonCashAdjustments,
      operatingProfitBeforeWorkingCapital: operatingProfitBeforeWC,
      workingCapitalChanges: totalWorkingCapitalChanges,
      cashGeneratedFromOperations,
      directTaxesPaid: supp.taxPaidActual || 0,
      netCashFromOperating
    },
    investingActivities: {
      purchaseOfPPE: supp.purchaseOfPPE || 0,
      saleOfPPE: supp.saleOfPPE || 0,
      purchaseOfInvestments: supp.purchaseOfInvestments || 0,
      saleOfInvestments: supp.saleOfInvestments || 0,
      interestReceived: supp.interestReceivedActual || 0,
      dividendsReceived: supp.dividendsReceivedActual || 0,
      netCashFromInvesting
    },
    financingActivities: {
      proceedsFromShareCapital: supp.proceedsFromShareCapital || 0,
      proceedsFromBorrowings: supp.proceedsFromBorrowings || 0,
      repaymentOfBorrowings: supp.repaymentOfBorrowings || 0,
      interestPaid: supp.interestPaidActual || 0,
      dividendsPaid: supp.dividendsPaidActual || 0,
      netCashFromFinancing
    },
    netIncreaseInCash,
    openingCash,
    closingCashCalculated,
    closingCashBalanceSheet,
    discrepancy
  }
}

/**
 * Formats a monetary number into Indian numbering system with optional unit scaling.
 */
export function formatCurrencyAmount(
  amount: number,
  unit: PresentationUnit = 'rupees',
  showSymbol: boolean = false
): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '-'

  let val = amount
  if (unit === 'thousands') val = val / 1_000
  else if (unit === 'lakhs') val = val / 100_000
  else if (unit === 'crores') val = val / 10_000_000

  const isNeg = val < 0
  const absVal = Math.abs(val)

  // Format with 2 decimals
  const fixed = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const formatted = isNeg ? `(${fixed})` : fixed
  return showSymbol ? `₹ ${formatted}` : formatted
}
