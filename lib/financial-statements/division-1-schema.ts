import { ScheduleHead } from './types'

export const DIVISION_1_BALANCE_SHEET_HEADS: ScheduleHead[] = [
  // ----------------------------------------------------
  // I. EQUITY AND LIABILITIES
  // ----------------------------------------------------
  // (1) Shareholders' Funds
  {
    id: 'sh_capital',
    code: 'I.1.a',
    label: 'Share capital',
    section: 'equity_and_liabilities',
    category: "Shareholders' funds",
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 1
  },
  {
    id: 'reserves_surplus',
    code: 'I.1.b',
    label: 'Reserves and surplus',
    section: 'equity_and_liabilities',
    category: "Shareholders' funds",
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 2
  },
  {
    id: 'money_share_warrants',
    code: 'I.1.c',
    label: 'Money received against share warrants',
    section: 'equity_and_liabilities',
    category: "Shareholders' funds",
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 3
  },
  {
    id: 'total_shareholders_funds',
    code: 'I.1',
    label: "Sub-total: Shareholders' funds",
    section: 'equity_and_liabilities',
    category: "Shareholders' funds",
    level: 2,
    normalBalance: 'credit',
    isSubtotal: true,
    subtotalChildren: ['sh_capital', 'reserves_surplus', 'money_share_warrants']
  },

  // (2) Share application money pending allotment
  {
    id: 'share_app_money',
    code: 'I.2',
    label: 'Share application money pending allotment',
    section: 'equity_and_liabilities',
    category: 'Share application money pending allotment',
    level: 2,
    normalBalance: 'credit',
    defaultNoteNumber: 4
  },

  // (3) Non-Current Liabilities
  {
    id: 'lt_borrowings',
    code: 'I.3.a',
    label: 'Long-term borrowings',
    section: 'equity_and_liabilities',
    category: 'Non-current liabilities',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 5
  },
  {
    id: 'deferred_tax_liab',
    code: 'I.3.b',
    label: 'Deferred tax liabilities (Net)',
    section: 'equity_and_liabilities',
    category: 'Non-current liabilities',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 6
  },
  {
    id: 'other_lt_liab',
    code: 'I.3.c',
    label: 'Other long-term liabilities',
    section: 'equity_and_liabilities',
    category: 'Non-current liabilities',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 7
  },
  {
    id: 'lt_provisions',
    code: 'I.3.d',
    label: 'Long-term provisions',
    section: 'equity_and_liabilities',
    category: 'Non-current liabilities',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 8
  },
  {
    id: 'total_non_current_liabilities',
    code: 'I.3',
    label: 'Sub-total: Non-current liabilities',
    section: 'equity_and_liabilities',
    category: 'Non-current liabilities',
    level: 2,
    normalBalance: 'credit',
    isSubtotal: true,
    subtotalChildren: ['lt_borrowings', 'deferred_tax_liab', 'other_lt_liab', 'lt_provisions']
  },

  // (4) Current Liabilities
  {
    id: 'st_borrowings',
    code: 'I.4.a',
    label: 'Short-term borrowings',
    section: 'equity_and_liabilities',
    category: 'Current liabilities',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 9
  },
  {
    id: 'trade_payables_msme',
    code: 'I.4.b.A',
    label: 'Trade payables: Total outstanding dues of micro & small enterprises (MSME)',
    section: 'equity_and_liabilities',
    category: 'Current liabilities',
    subCategory: 'Trade payables',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 10
  },
  {
    id: 'trade_payables_others',
    code: 'I.4.b.B',
    label: 'Trade payables: Total outstanding dues of creditors other than micro & small enterprises',
    section: 'equity_and_liabilities',
    category: 'Current liabilities',
    subCategory: 'Trade payables',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 10
  },
  {
    id: 'other_cur_liab',
    code: 'I.4.c',
    label: 'Other current liabilities',
    section: 'equity_and_liabilities',
    category: 'Current liabilities',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 11
  },
  {
    id: 'st_provisions',
    code: 'I.4.d',
    label: 'Short-term provisions',
    section: 'equity_and_liabilities',
    category: 'Current liabilities',
    level: 3,
    normalBalance: 'credit',
    defaultNoteNumber: 12
  },
  {
    id: 'total_current_liabilities',
    code: 'I.4',
    label: 'Sub-total: Current liabilities',
    section: 'equity_and_liabilities',
    category: 'Current liabilities',
    level: 2,
    normalBalance: 'credit',
    isSubtotal: true,
    subtotalChildren: [
      'st_borrowings',
      'trade_payables_msme',
      'trade_payables_others',
      'other_cur_liab',
      'st_provisions'
    ]
  },

  // Grand Total Equity and Liabilities
  {
    id: 'total_equity_and_liabilities',
    code: 'I.TOTAL',
    label: 'TOTAL EQUITY AND LIABILITIES',
    section: 'equity_and_liabilities',
    category: 'Grand Total',
    level: 1,
    normalBalance: 'credit',
    isGrandTotal: true,
    subtotalChildren: [
      'total_shareholders_funds',
      'share_app_money',
      'total_non_current_liabilities',
      'total_current_liabilities'
    ]
  },

  // ----------------------------------------------------
  // II. ASSETS
  // ----------------------------------------------------
  // (1) Non-Current Assets
  {
    id: 'ppe_tangible',
    code: 'II.1.a.i',
    label: 'Property, Plant and Equipment',
    section: 'assets',
    category: 'Non-current assets',
    subCategory: 'Property, Plant and Equipment & Intangible Assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 13
  },
  {
    id: 'intangible_assets',
    code: 'II.1.a.ii',
    label: 'Intangible assets',
    section: 'assets',
    category: 'Non-current assets',
    subCategory: 'Property, Plant and Equipment & Intangible Assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 14
  },
  {
    id: 'cwip',
    code: 'II.1.a.iii',
    label: 'Capital work-in-progress (CWIP)',
    section: 'assets',
    category: 'Non-current assets',
    subCategory: 'Property, Plant and Equipment & Intangible Assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 15
  },
  {
    id: 'intangible_under_dev',
    code: 'II.1.a.iv',
    label: 'Intangible assets under development',
    section: 'assets',
    category: 'Non-current assets',
    subCategory: 'Property, Plant and Equipment & Intangible Assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 16
  },
  {
    id: 'non_cur_investments',
    code: 'II.1.b',
    label: 'Non-current investments',
    section: 'assets',
    category: 'Non-current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 17
  },
  {
    id: 'deferred_tax_assets',
    code: 'II.1.c',
    label: 'Deferred tax assets (Net)',
    section: 'assets',
    category: 'Non-current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 18
  },
  {
    id: 'lt_loans_advances',
    code: 'II.1.d',
    label: 'Long-term loans and advances',
    section: 'assets',
    category: 'Non-current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 19
  },
  {
    id: 'other_non_cur_assets',
    code: 'II.1.e',
    label: 'Other non-current assets',
    section: 'assets',
    category: 'Non-current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 20
  },
  {
    id: 'total_non_current_assets',
    code: 'II.1',
    label: 'Sub-total: Non-current assets',
    section: 'assets',
    category: 'Non-current assets',
    level: 2,
    normalBalance: 'debit',
    isSubtotal: true,
    subtotalChildren: [
      'ppe_tangible',
      'intangible_assets',
      'cwip',
      'intangible_under_dev',
      'non_cur_investments',
      'deferred_tax_assets',
      'lt_loans_advances',
      'other_non_cur_assets'
    ]
  },

  // (2) Current Assets
  {
    id: 'cur_investments',
    code: 'II.2.a',
    label: 'Current investments',
    section: 'assets',
    category: 'Current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 21
  },
  {
    id: 'inventories',
    code: 'II.2.b',
    label: 'Inventories',
    section: 'assets',
    category: 'Current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 22
  },
  {
    id: 'trade_receivables',
    code: 'II.2.c',
    label: 'Trade receivables',
    section: 'assets',
    category: 'Current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 23
  },
  {
    id: 'cash_and_equivalents',
    code: 'II.2.d',
    label: 'Cash and cash equivalents',
    section: 'assets',
    category: 'Current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 24
  },
  {
    id: 'st_loans_advances',
    code: 'II.2.e',
    label: 'Short-term loans and advances',
    section: 'assets',
    category: 'Current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 25
  },
  {
    id: 'other_cur_assets',
    code: 'II.2.f',
    label: 'Other current assets',
    section: 'assets',
    category: 'Current assets',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 26
  },
  {
    id: 'total_current_assets',
    code: 'II.2',
    label: 'Sub-total: Current assets',
    section: 'assets',
    category: 'Current assets',
    level: 2,
    normalBalance: 'debit',
    isSubtotal: true,
    subtotalChildren: [
      'cur_investments',
      'inventories',
      'trade_receivables',
      'cash_and_equivalents',
      'st_loans_advances',
      'other_cur_assets'
    ]
  },

  // Grand Total Assets
  {
    id: 'total_assets',
    code: 'II.TOTAL',
    label: 'TOTAL ASSETS',
    section: 'assets',
    category: 'Grand Total',
    level: 1,
    normalBalance: 'debit',
    isGrandTotal: true,
    subtotalChildren: ['total_non_current_assets', 'total_current_assets']
  }
]

export const DIVISION_1_PL_HEADS: ScheduleHead[] = [
  // I. Revenue from operations
  {
    id: 'rev_operations',
    code: 'I',
    label: 'Revenue from operations',
    section: 'revenue',
    category: 'Income',
    level: 2,
    normalBalance: 'credit',
    defaultNoteNumber: 27
  },
  // II. Other income
  {
    id: 'other_income',
    code: 'II',
    label: 'Other income',
    section: 'revenue',
    category: 'Income',
    level: 2,
    normalBalance: 'credit',
    defaultNoteNumber: 28
  },
  // III. Total Revenue (I + II)
  {
    id: 'total_income',
    code: 'III',
    label: 'Total Revenue (I + II)',
    section: 'revenue',
    category: 'Income',
    level: 1,
    normalBalance: 'credit',
    isSubtotal: true,
    subtotalChildren: ['rev_operations', 'other_income']
  },

  // IV. Expenses
  {
    id: 'exp_materials_consumed',
    code: 'IV.a',
    label: 'Cost of materials consumed',
    section: 'expenses',
    category: 'Expenses',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 29
  },
  {
    id: 'exp_purchases_stock',
    code: 'IV.b',
    label: 'Purchases of Stock-in-Trade',
    section: 'expenses',
    category: 'Expenses',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 30
  },
  {
    id: 'exp_changes_inventories',
    code: 'IV.c',
    label: 'Changes in inventories of finished goods, work-in-progress and Stock-in-Trade',
    section: 'expenses',
    category: 'Expenses',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 31
  },
  {
    id: 'exp_employee_benefits',
    code: 'IV.d',
    label: 'Employee benefits expense',
    section: 'expenses',
    category: 'Expenses',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 32
  },
  {
    id: 'exp_finance_costs',
    code: 'IV.e',
    label: 'Finance costs',
    section: 'expenses',
    category: 'Expenses',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 33
  },
  {
    id: 'exp_depreciation_amortization',
    code: 'IV.f',
    label: 'Depreciation and amortisation expense',
    section: 'expenses',
    category: 'Expenses',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 34
  },
  {
    id: 'exp_other_expenses',
    code: 'IV.g',
    label: 'Other expenses',
    section: 'expenses',
    category: 'Expenses',
    level: 3,
    normalBalance: 'debit',
    defaultNoteNumber: 35
  },
  // Total Expenses
  {
    id: 'total_expenses',
    code: 'IV',
    label: 'Total expenses',
    section: 'expenses',
    category: 'Expenses',
    level: 1,
    normalBalance: 'debit',
    isSubtotal: true,
    subtotalChildren: [
      'exp_materials_consumed',
      'exp_purchases_stock',
      'exp_changes_inventories',
      'exp_employee_benefits',
      'exp_finance_costs',
      'exp_depreciation_amortization',
      'exp_other_expenses'
    ]
  },

  // V. Profit before exceptional and extraordinary items and tax (III - IV)
  {
    id: 'profit_before_exceptional',
    code: 'V',
    label: 'Profit before exceptional and extraordinary items and tax (III - IV)',
    section: 'tax_and_profit',
    category: 'Profit / Loss',
    level: 1,
    normalBalance: 'credit',
    isSubtotal: true
  },
  // VI. Exceptional items
  {
    id: 'exceptional_items',
    code: 'VI',
    label: 'Exceptional items',
    section: 'tax_and_profit',
    category: 'Profit / Loss',
    level: 2,
    normalBalance: 'debit',
    defaultNoteNumber: 36
  },
  // VII. Profit before extraordinary items and tax (V - VI)
  {
    id: 'profit_before_extraordinary',
    code: 'VII',
    label: 'Profit before extraordinary items and tax (V - VI)',
    section: 'tax_and_profit',
    category: 'Profit / Loss',
    level: 1,
    normalBalance: 'credit',
    isSubtotal: true
  },
  // VIII. Extraordinary items
  {
    id: 'extraordinary_items',
    code: 'VIII',
    label: 'Extraordinary items',
    section: 'tax_and_profit',
    category: 'Profit / Loss',
    level: 2,
    normalBalance: 'debit',
    defaultNoteNumber: 37
  },
  // IX. Profit before tax (VII - VIII)
  {
    id: 'profit_before_tax',
    code: 'IX',
    label: 'Profit before tax (VII - VIII)',
    section: 'tax_and_profit',
    category: 'Profit / Loss',
    level: 1,
    normalBalance: 'credit',
    isSubtotal: true
  },

  // X. Tax expense
  {
    id: 'tax_current',
    code: 'X.1',
    label: 'Current tax',
    section: 'tax_and_profit',
    category: 'Tax expense',
    level: 3,
    normalBalance: 'debit'
  },
  {
    id: 'tax_deferred',
    code: 'X.2',
    label: 'Deferred tax',
    section: 'tax_and_profit',
    category: 'Tax expense',
    level: 3,
    normalBalance: 'debit'
  },
  {
    id: 'total_tax_expense',
    code: 'X',
    label: 'Tax expense',
    section: 'tax_and_profit',
    category: 'Tax expense',
    level: 2,
    normalBalance: 'debit',
    isSubtotal: true,
    subtotalChildren: ['tax_current', 'tax_deferred']
  },

  // XI. Profit/(Loss) for the period from continuing operations (IX - X)
  {
    id: 'profit_continuing_ops',
    code: 'XI',
    label: 'Profit/(Loss) for the period from continuing operations (IX - X)',
    section: 'tax_and_profit',
    category: 'Profit / Loss',
    level: 1,
    normalBalance: 'credit',
    isSubtotal: true
  },

  // XII. Profit/(loss) from discontinuing operations
  {
    id: 'profit_discontinuing_ops_pre_tax',
    code: 'XII',
    label: 'Profit/(loss) from discontinuing operations',
    section: 'tax_and_profit',
    category: 'Discontinuing operations',
    level: 2,
    normalBalance: 'credit',
    defaultNoteNumber: 38
  },
  // XIII. Tax expense of discontinuing operations
  {
    id: 'tax_discontinuing_ops',
    code: 'XIII',
    label: 'Tax expense of discontinuing operations',
    section: 'tax_and_profit',
    category: 'Discontinuing operations',
    level: 2,
    normalBalance: 'debit',
    defaultNoteNumber: 38
  },
  // XIV. Profit/(loss) from discontinuing operations (after tax) (XII - XIII)
  {
    id: 'profit_discontinued_ops',
    code: 'XIV',
    label: 'Profit/(loss) from discontinuing operations (after tax) (XII - XIII)',
    section: 'tax_and_profit',
    category: 'Discontinuing operations',
    level: 1,
    normalBalance: 'credit',
    isSubtotal: true
  },

  // XV. Profit/(Loss) for the period (XI + XIV)
  {
    id: 'profit_for_period',
    code: 'XV',
    label: 'Profit/(Loss) for the period (XI + XIV)',
    section: 'tax_and_profit',
    category: 'Profit / Loss',
    level: 1,
    normalBalance: 'credit',
    isGrandTotal: true
  },

  // XVI. Earnings per equity share: (1) Basic, (2) Diluted
  {
    id: 'eps_basic',
    code: 'XVI.1',
    label: 'Earnings per equity share: Basic (₹)',
    section: 'tax_and_profit',
    category: 'Earnings Per Share',
    level: 2,
    normalBalance: 'credit',
    defaultNoteNumber: 39
  },
  {
    id: 'eps_diluted',
    code: 'XVI.2',
    label: 'Earnings per equity share: Diluted (₹)',
    section: 'tax_and_profit',
    category: 'Earnings Per Share',
    level: 2,
    normalBalance: 'credit',
    defaultNoteNumber: 39
  }
]

export const ALL_DIVISION_1_HEADS: ScheduleHead[] = [
  ...DIVISION_1_BALANCE_SHEET_HEADS,
  ...DIVISION_1_PL_HEADS
]

export const HEAD_BY_ID = new Map<string, ScheduleHead>(
  ALL_DIVISION_1_HEADS.map(h => [h.id, h])
)
