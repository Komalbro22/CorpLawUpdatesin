import { MappingConfidence } from './types'

export interface MappingRule {
  targetHeadId: string
  patterns: RegExp[]
  confidence: MappingConfidence
  matchReason: string
  isContra?: boolean
}

export const DETERMINISTIC_MAPPING_RULES: MappingRule[] = [
  // ----------------------------------------------------
  // EQUITY & RESERVES
  // ----------------------------------------------------
  {
    targetHeadId: 'sh_capital',
    patterns: [
      /\b(equity\s+share\s+capital|preference\s+share\s+capital|paid[\s-]?up\s+capital|share\s+capital)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as statutory Share Capital ledger'
  },
  {
    targetHeadId: 'reserves_surplus',
    patterns: [
      /\b(securities\s+premium|general\s+reserve|capital\s+redemption\s+reserve|retained\s+earnings|surplus\s+in\s+p&l|profit\s+and\s+loss\s+(balance|a\/c|surplus)|capital\s+reserve)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Reserves & Surplus ledger'
  },
  {
    targetHeadId: 'money_share_warrants',
    patterns: [/\b(share\s+warrants|money\s+against\s+share\s+warrants)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Money received against share warrants'
  },
  {
    targetHeadId: 'share_app_money',
    patterns: [/\b(share\s+application\s+money|application\s+money\s+pending)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Share application money pending allotment'
  },

  // ----------------------------------------------------
  // NON-CURRENT LIABILITIES
  // ----------------------------------------------------
  {
    targetHeadId: 'lt_borrowings',
    patterns: [
      /\b(term\s+loan\s+from\s+bank|bank\s+term\s+loan|secured\s+term\s+loan|debentures|bonds|unsecured\s+loan\s+(non[\s-]?current|long[\s-]?term)|director\s+loan\s+long[\s-]?term|inter[\s-]?corporate\s+loan\s+long[\s-]?term)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Long-term Borrowings'
  },
  {
    targetHeadId: 'lt_borrowings',
    patterns: [/\b(term\s+loan|vehicle\s+loan|equipment\s+loan|mortgage\s+loan)\b/i],
    confidence: 'review',
    matchReason: 'Likely long-term loan — review whether current maturities are separated'
  },
  {
    targetHeadId: 'deferred_tax_liab',
    patterns: [/\b(deferred\s+tax\s+liab(ility)?|dtl)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Deferred Tax Liability'
  },
  {
    targetHeadId: 'other_lt_liab',
    patterns: [/\b(security\s+deposit\s+received\s+long[\s-]?term|trade\s+deposit\s+non[\s-]?current|retention\s+money\s+payable)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Other Long-Term Liabilities'
  },
  {
    targetHeadId: 'lt_provisions',
    patterns: [/\b(provision\s+for\s+gratuity\s+non[\s-]?current|provision\s+for\s+leave\s+encashment\s+non[\s-]?current|long[\s-]?term\s+provision)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Long-Term Provisions'
  },

  // ----------------------------------------------------
  // CURRENT LIABILITIES
  // ----------------------------------------------------
  {
    targetHeadId: 'st_borrowings',
    patterns: [
      /\b(cash\s+credit|overdraft|bank\s+od|working\s+capital\s+loan|current\s+maturities\s+of\s+long[\s-]?term|bill\s+discounting|short[\s-]?term\s+borrowing|unsecured\s+loan\s+short[\s-]?term)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Short-Term Borrowings / Working Capital facility'
  },
  {
    targetHeadId: 'trade_payables_msme',
    patterns: [
      /\b(msme|micro\s*(and|&)\s*small)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Trade Payables: Micro and Small Enterprises'
  },
  {
    targetHeadId: 'trade_payables_others',
    patterns: [
      /\b(sundry\s+creditors|accounts\s+payable|trade\s+creditors|vendor\s+payable|creditors\s+for\s+goods|creditors\s+for\s+expenses)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Trade Payables: Other than MSME'
  },
  {
    targetHeadId: 'other_cur_liab',
    patterns: [
      /\b(gst\s+payable|tds\s+payable|tcs\s+payable|pf\s+payable|esi\s+payable|professional\s+tax\s+payable|statutory\s+dues\s+payable|advance\s+from\s+customer|unearned\s+revenue|interest\s+accrued\s+but\s+not\s+due|salary\s+payable|wages\s+payable|audit\s+fee\s+payable|expenses\s+payable|outstanding\s+liabilit(y|ies))\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Other Current Liabilities / Statutory dues'
  },
  {
    targetHeadId: 'st_provisions',
    patterns: [
      /\b(provision\s+for\s+tax(ation)?|provision\s+for\s+income\s+tax|short[\s-]?term\s+provision|provision\s+for\s+bonus|provision\s+for\s+gratuity\s+current)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Short-Term Provisions'
  },

  // ----------------------------------------------------
  // NON-CURRENT ASSETS
  // ----------------------------------------------------
  {
    targetHeadId: 'ppe_tangible',
    patterns: [
      /\b(land\s+and\s+building|plant\s+and\s+machinery|furniture\s+and\s+fixtures|office\s+equipment|computers?\s+and\s+printers?|vehicles?|motor\s+car|electrical\s+installation|fixed\s+assets?\s+tangible|property[\s,]+plant\s+and\s+equipment)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Property, Plant and Equipment (PPE)'
  },
  {
    targetHeadId: 'ppe_tangible',
    patterns: [/\b(accumulated\s+depreciation|depreciation\s+reserve)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Accumulated Depreciation (contra PPE)',
    isContra: true
  },
  {
    targetHeadId: 'cwip',
    patterns: [/\b(capital\s+work[\s-]?in[\s-]?progress|cwip|building\s+under\s+construction)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Capital Work-in-Progress (CWIP)'
  },
  {
    targetHeadId: 'intangible_assets',
    patterns: [
      /\b(computer\s+software|software\s+licen[sc]e|trademark|patent|copyright|goodwill|intangible\s+asset)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Intangible Assets'
  },
  {
    targetHeadId: 'intangible_under_dev',
    patterns: [/\b(intangible\s+assets?\s+under\s+development|software\s+under\s+development)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Intangible Assets Under Development'
  },
  {
    targetHeadId: 'non_cur_investments',
    patterns: [
      /\b(investment\s+in\s+subsidiary|investment\s+in\s+equity\s+shares\s+non[\s-]?current|long[\s-]?term\s+investment|unquoted\s+shares|government\s+securities\s+non[\s-]?current)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Non-Current Investments'
  },
  {
    targetHeadId: 'deferred_tax_assets',
    patterns: [/\b(deferred\s+tax\s+asset|dta)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Deferred Tax Asset'
  },
  {
    targetHeadId: 'lt_loans_advances',
    patterns: [
      /\b(security\s+deposit\s+paid\s+long[\s-]?term|electricity\s+deposit|rent\s+deposit|capital\s+advances?|long[\s-]?term\s+loans?\s+and\s+advances?)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Long-Term Loans and Advances'
  },
  {
    targetHeadId: 'other_non_cur_assets',
    patterns: [/\b(bank\s+deposit\s+maturity\s+>12\s*m|fixed\s+deposit\s+long[\s-]?term|other\s+non[\s-]?current\s+assets?)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Other Non-Current Assets'
  },

  // ----------------------------------------------------
  // CURRENT ASSETS
  // ----------------------------------------------------
  {
    targetHeadId: 'cur_investments',
    patterns: [/\b(mutual\s+fund\s+units?|liquid\s+funds?|current\s+investments?|treasury\s+bills?)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Current Investments'
  },
  {
    targetHeadId: 'inventories',
    patterns: [
      /\b(raw\s+materials?\s+stock|work[\s-]?in[\s-]?progress\s+stock|finished\s+goods\s+stock|stock[\s-]?in[\s-]?trade|stores\s+and\s+spares|closing\s+stock|inventory)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Inventories'
  },
  {
    targetHeadId: 'trade_receivables',
    patterns: [
      /\b(sundry\s+debtors|trade\s+debtors|accounts\s+receivable|customer\s+receivable|bills\s+receivable)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Trade Receivables'
  },
  {
    targetHeadId: 'trade_receivables',
    patterns: [/\b(provision\s+for\s+doubtful\s+debts?|allowance\s+for\s+bad\s+debts?)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Provision for Doubtful Debts (contra Trade Receivables)',
    isContra: true
  },
  {
    targetHeadId: 'cash_and_equivalents',
    patterns: [
      /\b(cash\s+in\s+hand|petty\s+cash|bank\s+current\s+a\/c|bank\s+savings\s+a\/c|hdfc\s+bank|icici\s+bank|sbi\s+bank|axis\s+bank|kotak\s+bank|cash\s+and\s+cash\s+equivalents?|cheques\s+in\s+hand|fixed\s+deposit\s+(<3m|short[\s-]?term))\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Cash & Cash Equivalents'
  },
  {
    targetHeadId: 'st_loans_advances',
    patterns: [
      /\b(advance\s+to\s+suppliers?|loans\s+to\s+employees?|short[\s-]?term\s+advances?|prepaid\s+expenses?)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Short-Term Loans and Advances'
  },
  {
    targetHeadId: 'other_cur_assets',
    patterns: [
      /\b(gst\s+input\s+tax\s+credit|itc\s+receivable|tds\s+receivable|advance\s+tax|income\s+tax\s+refund\s+receivable|interest\s+accrued\s+on\s+deposits?|accrued\s+income)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Other Current Assets'
  },

  // ----------------------------------------------------
  // REVENUE & OTHER INCOME
  // ----------------------------------------------------
  {
    targetHeadId: 'rev_operations',
    patterns: [
      /\b(sales?\s+of\s+products?|sales?\s+of\s+services?|service\s+revenue|operating\s+turnover|gross\s+receipts|domestic\s+sales|export\s+sales|revenue\s+from\s+operations)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Revenue from Operations'
  },
  {
    targetHeadId: 'other_income',
    patterns: [
      /\b(interest\s+income|interest\s+on\s+fd|interest\s+on\s+fixed\s+deposit|dividend\s+income|scrap\s+sales?|rental\s+income|profit\s+on\s+sale\s+of\s+assets?|foreign\s+exchange\s+gain|other\s+non[\s-]?operating\s+income)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Other Income'
  },

  // ----------------------------------------------------
  // EXPENSES
  // ----------------------------------------------------
  {
    targetHeadId: 'exp_materials_consumed',
    patterns: [/\b(cost\s+of\s+materials?\s+consumed|raw\s+materials?\s+consumed|consumption\s+of\s+raw\s+materials?)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Cost of Materials Consumed'
  },
  {
    targetHeadId: 'exp_purchases_stock',
    patterns: [/\b(purchases?\s+of\s+stock[\s-]?in[\s-]?trade|traded\s+goods\s+purchase)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Purchases of Stock-in-Trade'
  },
  {
    targetHeadId: 'exp_changes_inventories',
    patterns: [/\b(changes?\s+in\s+inventories|increase\/decrease\s+in\s+stock)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Changes in Inventories'
  },
  {
    targetHeadId: 'exp_employee_benefits',
    patterns: [
      /\b(salaries?\s+and\s+wages|staff\s+salaries?|directors?\s+remuneration|staff\s+welfare\s+expenses?|provident\s+fund\s+contribution|pf\s+contribution|gratuity\s+expense|employee\s+benefit\s+expense)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Employee Benefits Expense'
  },
  {
    targetHeadId: 'exp_finance_costs',
    patterns: [
      /\b(bank\s+interest|interest\s+on\s+loan|interest\s+expense|bank\s+charges|loan\s+processing\s+fees?|finance\s+charges)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Finance Costs'
  },
  {
    targetHeadId: 'exp_depreciation_amortization',
    patterns: [/\b(depreciation\s+expense|amortization\s+expense|depreciation\s+and\s+amortization)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Depreciation and Amortization Expense'
  },
  {
    targetHeadId: 'exp_other_expenses',
    patterns: [
      /\b(rent\s+expense|office\s+rent|legal\s+and\s+professional\s+fees?|statutory\s+audit\s+fees?|repairs\s+and\s+maintenance|electricity\s+expenses?|telephone\s+and\s+internet|travelling\s+and\s+conveyance|printing\s+and\s+stationery|advertisement\s+and\s+marketing|business\s+promotion|rates\s+and\s+taxes|insurance\s+expense|miscellaneous\s+expenses?|general\s+expenses?|loss\s+on\s+sale\s+of\s+assets?)\b/i
    ],
    confidence: 'high',
    matchReason: 'Recognized as Other Expenses'
  },

  // ----------------------------------------------------
  // TAXES & EXCEPTIONAL
  // ----------------------------------------------------
  {
    targetHeadId: 'tax_current',
    patterns: [/\b(current\s+tax\s+expense|provision\s+for\s+income\s+tax\s+for\s+the\s+year|income\s+tax\s+current)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Current Tax Expense'
  },
  {
    targetHeadId: 'tax_deferred',
    patterns: [/\b(deferred\s+tax\s+expense|deferred\s+tax\s+charge)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Deferred Tax Expense'
  },
  {
    targetHeadId: 'exceptional_items',
    patterns: [/\b(exceptional\s+items?|one[\s-]?off\s+exceptional\s+expense)\b/i],
    confidence: 'high',
    matchReason: 'Recognized as Exceptional Items'
  }
]

export function suggestMapping(ledgerName: string): {
  mappedHeadId?: string
  confidence: MappingConfidence
  matchReason?: string
  isContra?: boolean
} {
  const cleaned = ledgerName.trim()
  if (!cleaned) {
    return { confidence: 'unmapped', matchReason: 'Empty ledger name' }
  }

  // Iterate over deterministic rules
  for (const rule of DETERMINISTIC_MAPPING_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(cleaned)) {
        return {
          mappedHeadId: rule.targetHeadId,
          confidence: rule.confidence,
          matchReason: rule.matchReason,
          isContra: rule.isContra
        }
      }
    }
  }

  // Fallback: check broad keywords but label as 'review'
  if (/loan/i.test(cleaned)) {
    return {
      mappedHeadId: 'lt_borrowings',
      confidence: 'review',
      matchReason: 'Contains "loan" — requires classification into long-term or short-term facility'
    }
  }
  if (/creditor|vendor|supplier/i.test(cleaned)) {
    return {
      mappedHeadId: 'trade_payables_others',
      confidence: 'review',
      matchReason: 'Contains creditor term — confirm whether MSME or other trade payable'
    }
  }
  if (/debtor|customer/i.test(cleaned)) {
    return {
      mappedHeadId: 'trade_receivables',
      confidence: 'review',
      matchReason: 'Contains debtor/customer term — confirm as Trade Receivables'
    }
  }
  if (/bank|cash/i.test(cleaned)) {
    return {
      mappedHeadId: 'cash_and_equivalents',
      confidence: 'review',
      matchReason: 'Contains cash/bank term — confirm if unencumbered cash equivalent or OD/CC facility'
    }
  }
  if (/expense|fee|charge|cost/i.test(cleaned)) {
    return {
      mappedHeadId: 'exp_other_expenses',
      confidence: 'review',
      matchReason: 'Contains general expense term — confirm proper expense head under Schedule III'
    }
  }

  return {
    confidence: 'unmapped',
    matchReason: 'No deterministic rule matched. Manual classification required.'
  }
}
