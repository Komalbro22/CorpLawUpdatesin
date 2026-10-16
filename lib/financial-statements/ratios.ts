import { RatioDefinition, RatioResult } from './types'
import { HeadBalances } from './calculations'

export const SCHEDULE_III_RATIOS: RatioDefinition[] = [
  {
    id: 'current_ratio',
    name: 'Current Ratio',
    section: 'Liquidity',
    numeratorLabel: 'Current Assets',
    denominatorLabel: 'Current Liabilities',
    formulaDescription: 'Current Assets / Current Liabilities',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'debt_equity_ratio',
    name: 'Debt-Equity Ratio',
    section: 'Solvency',
    numeratorLabel: 'Total Debt (Long-term + Short-term borrowings)',
    denominatorLabel: "Shareholders' Equity (Capital + Reserves & Surplus)",
    formulaDescription: 'Total Debt / Shareholders’ Equity',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'debt_service_coverage_ratio',
    name: 'Debt Service Coverage Ratio (DSCR)',
    section: 'Coverage',
    numeratorLabel: 'PAT + Depreciation + Finance Costs',
    denominatorLabel: 'Finance Costs + Current Debt Service Obligations',
    formulaDescription: '(PAT + Depreciation + Finance Costs) / (Finance Costs + Principal Repayments)',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'return_on_equity_ratio',
    name: 'Return on Equity (ROE)',
    section: 'Profitability',
    numeratorLabel: 'Net Profit after Tax (PAT)',
    denominatorLabel: "Total Shareholders' Equity",
    formulaDescription: 'PAT / Shareholders’ Equity (%)',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'inventory_turnover_ratio',
    name: 'Inventory Turnover Ratio',
    section: 'Efficiency',
    numeratorLabel: 'Cost of Materials Consumed / COGS',
    denominatorLabel: 'Inventories',
    formulaDescription: 'Cost of Goods Sold / Closing Inventory',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'trade_receivables_turnover_ratio',
    name: 'Trade Receivables Turnover Ratio',
    section: 'Efficiency',
    numeratorLabel: 'Revenue from Operations',
    denominatorLabel: 'Trade Receivables',
    formulaDescription: 'Revenue from Operations / Trade Receivables',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'trade_payables_turnover_ratio',
    name: 'Trade Payables Turnover Ratio',
    section: 'Efficiency',
    numeratorLabel: 'Purchases of Stock + Cost of Materials',
    denominatorLabel: 'Trade Payables (MSME + Other Creditors)',
    formulaDescription: 'Total Purchases / Closing Trade Payables',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'net_capital_turnover_ratio',
    name: 'Net Capital Turnover Ratio',
    section: 'Efficiency',
    numeratorLabel: 'Revenue from Operations',
    denominatorLabel: 'Working Capital (Current Assets - Current Liabilities)',
    formulaDescription: 'Revenue / (Current Assets - Current Liabilities)',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'net_profit_ratio',
    name: 'Net Profit Ratio',
    section: 'Profitability',
    numeratorLabel: 'Net Profit after Tax (PAT)',
    denominatorLabel: 'Revenue from Operations',
    formulaDescription: 'PAT / Revenue from Operations (%)',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'return_on_capital_employed',
    name: 'Return on Capital Employed (ROCE)',
    section: 'Profitability',
    numeratorLabel: 'EBIT (Profit Before Tax + Finance Costs)',
    denominatorLabel: 'Capital Employed (Net Worth + Total Debt)',
    formulaDescription: 'EBIT / Capital Employed (%)',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  },
  {
    id: 'return_on_investment',
    name: 'Return on Investment (ROI)',
    section: 'Profitability',
    numeratorLabel: 'Income from Investments (Dividend + Interest + Gains)',
    denominatorLabel: 'Total Investments (Non-current + Current)',
    formulaDescription: 'Investment Returns / Total Investments (%)',
    statutoryReference: 'Schedule III Part I General Instructions (amended March 2021)'
  }
]

export function computeScheduleIIIRatios(
  headBalances: HeadBalances,
  ratioExplanations: Record<string, string> = {}
): RatioResult[] {
  const getB = (id: string) => headBalances[id] || { current: 0, prev: 0 }

  // Intermediate aggregates for current and previous
  // 1. Current Assets
  const curAssetsCurrent =
    getB('cur_investments').current +
    getB('inventories').current +
    getB('trade_receivables').current +
    getB('cash_and_equivalents').current +
    getB('st_loans_advances').current +
    getB('other_cur_assets').current
  const curAssetsPrev =
    getB('cur_investments').prev +
    getB('inventories').prev +
    getB('trade_receivables').prev +
    getB('cash_and_equivalents').prev +
    getB('st_loans_advances').prev +
    getB('other_cur_assets').prev

  // 2. Current Liabilities
  const curLiabCurrent =
    getB('st_borrowings').current +
    getB('trade_payables_msme').current +
    getB('trade_payables_others').current +
    getB('other_cur_liab').current +
    getB('st_provisions').current
  const curLiabPrev =
    getB('st_borrowings').prev +
    getB('trade_payables_msme').prev +
    getB('trade_payables_others').prev +
    getB('other_cur_liab').prev +
    getB('st_provisions').prev

  // 3. Debt
  const totalDebtCurrent = getB('lt_borrowings').current + getB('st_borrowings').current
  const totalDebtPrev = getB('lt_borrowings').prev + getB('st_borrowings').prev

  // 4. Equity
  const equityCurrent =
    getB('sh_capital').current + getB('reserves_surplus').current + getB('money_share_warrants').current
  const equityPrev =
    getB('sh_capital').prev + getB('reserves_surplus').prev + getB('money_share_warrants').prev

  // 5. PBT & PAT
  const revOpsCur = getB('rev_operations').current
  const revOpsPrev = getB('rev_operations').prev
  const otherIncCur = getB('other_income').current
  const otherIncPrev = getB('other_income').prev
  const totRevCur = revOpsCur + otherIncCur
  const totRevPrev = revOpsPrev + otherIncPrev

  const totExpCur =
    getB('exp_materials_consumed').current +
    getB('exp_purchases_stock').current +
    getB('exp_changes_inventories').current +
    getB('exp_employee_benefits').current +
    getB('exp_finance_costs').current +
    getB('exp_depreciation_amortization').current +
    getB('exp_other_expenses').current
  const totExpPrev =
    getB('exp_materials_consumed').prev +
    getB('exp_purchases_stock').prev +
    getB('exp_changes_inventories').prev +
    getB('exp_employee_benefits').prev +
    getB('exp_finance_costs').prev +
    getB('exp_depreciation_amortization').prev +
    getB('exp_other_expenses').prev

  const pbtCurrent = totRevCur - totExpCur
  const pbtPrev = totRevPrev - totExpPrev

  const taxCur = getB('tax_current').current + getB('tax_deferred').current
  const taxPrev = getB('tax_current').prev + getB('tax_deferred').prev

  const patCurrent = pbtCurrent - taxCur
  const patPrev = pbtPrev - taxPrev

  // 6. Purchases & Cost
  const cogsCur = getB('exp_materials_consumed').current || getB('exp_purchases_stock').current
  const cogsPrev = getB('exp_materials_consumed').prev || getB('exp_purchases_stock').prev

  const totPurchasesCur = getB('exp_materials_consumed').current + getB('exp_purchases_stock').current
  const totPurchasesPrev = getB('exp_materials_consumed').prev + getB('exp_purchases_stock').prev

  const tradePayablesCur = getB('trade_payables_msme').current + getB('trade_payables_others').current
  const tradePayablesPrev = getB('trade_payables_msme').prev + getB('trade_payables_others').prev

  const totInvestmentsCur = getB('non_cur_investments').current + getB('cur_investments').current
  const totInvestmentsPrev = getB('non_cur_investments').prev + getB('cur_investments').prev

  return SCHEDULE_III_RATIOS.map(def => {
    let curNum = 0
    let curDen = 0
    let prevNum = 0
    let prevDen = 0

    switch (def.id) {
      case 'current_ratio':
        curNum = curAssetsCurrent
        curDen = curLiabCurrent
        prevNum = curAssetsPrev
        prevDen = curLiabPrev
        break

      case 'debt_equity_ratio':
        curNum = totalDebtCurrent
        curDen = equityCurrent
        prevNum = totalDebtPrev
        prevDen = equityPrev
        break

      case 'debt_service_coverage_ratio':
        curNum = patCurrent + getB('exp_depreciation_amortization').current + getB('exp_finance_costs').current
        curDen = getB('exp_finance_costs').current || 1
        prevNum = patPrev + getB('exp_depreciation_amortization').prev + getB('exp_finance_costs').prev
        prevDen = getB('exp_finance_costs').prev || 1
        break

      case 'return_on_equity_ratio':
        curNum = patCurrent
        curDen = equityCurrent
        prevNum = patPrev
        prevDen = equityPrev
        break

      case 'inventory_turnover_ratio':
        curNum = cogsCur || revOpsCur
        curDen = getB('inventories').current
        prevNum = cogsPrev || revOpsPrev
        prevDen = getB('inventories').prev
        break

      case 'trade_receivables_turnover_ratio':
        curNum = revOpsCur
        curDen = getB('trade_receivables').current
        prevNum = revOpsPrev
        prevDen = getB('trade_receivables').prev
        break

      case 'trade_payables_turnover_ratio':
        curNum = totPurchasesCur
        curDen = tradePayablesCur
        prevNum = totPurchasesPrev
        prevDen = tradePayablesPrev
        break

      case 'net_capital_turnover_ratio':
        curNum = revOpsCur
        curDen = curAssetsCurrent - curLiabCurrent
        prevNum = revOpsPrev
        prevDen = curAssetsPrev - curLiabPrev
        break

      case 'net_profit_ratio':
        curNum = patCurrent
        curDen = revOpsCur
        prevNum = patPrev
        prevDen = revOpsPrev
        break

      case 'return_on_capital_employed':
        curNum = pbtCurrent + getB('exp_finance_costs').current
        curDen = equityCurrent + totalDebtCurrent
        prevNum = pbtPrev + getB('exp_finance_costs').prev
        prevDen = equityPrev + totalDebtPrev
        break

      case 'return_on_investment':
        curNum = otherIncCur
        curDen = totInvestmentsCur
        prevNum = otherIncPrev
        prevDen = totInvestmentsPrev
        break
    }

    // Compute values safely
    const curVal = curDen > 0 ? curNum / curDen : null
    const prevVal = prevDen > 0 ? prevNum / prevDen : null

    let variancePct: number | null = null
    let isMeaningful = false
    let varianceExceeds25 = false

    if (curVal !== null && prevVal !== null && prevVal !== 0 && !isNaN(curVal) && !isNaN(prevVal)) {
      variancePct = ((curVal - prevVal) / Math.abs(prevVal)) * 100
      isMeaningful = true
      if (Math.abs(variancePct) >= 25) {
        varianceExceeds25 = true
      }
    }

    return {
      id: def.id,
      name: def.name,
      numeratorLabel: def.numeratorLabel,
      denominatorLabel: def.denominatorLabel,
      currentNumerator: curNum,
      currentDenominator: curDen,
      currentValue: curVal,
      prevNumerator: prevNum,
      prevDenominator: prevDen,
      prevValue: prevVal,
      variancePct,
      isMeaningful,
      varianceExceeds25,
      explanation: ratioExplanations[def.id] || '',
      formulaDescription: def.formulaDescription
    }
  })
}
