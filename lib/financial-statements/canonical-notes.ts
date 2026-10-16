import {
  NoteSchedule,
  WorkspaceState,
  StatementRowValue,
  BreakdownItem,
  PromoterShareholdingRow,
  TradePayablesAgeingRow,
  TradeReceivablesAgeingRow,
  CwipAgeingRow
} from './types'

export interface CanonicalNoteMeta {
  noteNumber: number
  id: string
  title: string
  targetHeadId: string
  section: 'balance_sheet' | 'profit_loss'
  defaultItems: { id: string; label: string }[]
  hasPromoterShareholding?: boolean
  hasTradePayablesAgeing?: boolean
  hasCwipAgeing?: boolean
  hasTradeReceivablesAgeing?: boolean
  isEps?: boolean
}

export const CANONICAL_STATUTORY_NOTES: CanonicalNoteMeta[] = [
  // ---------------------------------------------------------------------------
  // BALANCE SHEET NOTES (Note 1 to Note 26)
  // ---------------------------------------------------------------------------
  {
    noteNumber: 1,
    id: 'note_1',
    title: 'Share Capital',
    targetHeadId: 'sh_capital',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'sc_1', label: 'Equity shares of Rs. 10 each fully paid-up' },
      { id: 'sc_2', label: 'Preference shares of Rs. 100 each fully paid-up' }
    ],
    hasPromoterShareholding: true
  },
  {
    noteNumber: 2,
    id: 'note_2',
    title: 'Reserves and Surplus',
    targetHeadId: 'reserves_surplus',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'rs_1', label: 'Securities Premium Account' },
      { id: 'rs_2', label: 'General Reserve' },
      { id: 'rs_3', label: 'Surplus in Statement of Profit and Loss' }
    ]
  },
  {
    noteNumber: 3,
    id: 'note_3',
    title: 'Money Received Against Share Warrants',
    targetHeadId: 'money_share_warrants',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'sw_1', label: 'Money received against share warrants' }
    ]
  },
  {
    noteNumber: 4,
    id: 'note_4',
    title: 'Share Application Money Pending Allotment',
    targetHeadId: 'share_app_money',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'sa_1', label: 'Share application money pending allotment' }
    ]
  },
  {
    noteNumber: 5,
    id: 'note_5',
    title: 'Long-Term Borrowings',
    targetHeadId: 'lt_borrowings',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'ltb_1', label: 'Term loans from banks (Secured)' },
      { id: 'ltb_2', label: 'Term loans from other financial institutions' },
      { id: 'ltb_3', label: 'Loans and advances from related parties / directors' }
    ]
  },
  {
    noteNumber: 6,
    id: 'note_6',
    title: 'Deferred Tax Liabilities (Net)',
    targetHeadId: 'deferred_tax_liab',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'dtl_1', label: 'Deferred tax liability arising on depreciation timing differences' }
    ]
  },
  {
    noteNumber: 7,
    id: 'note_7',
    title: 'Other Long-Term Liabilities',
    targetHeadId: 'other_lt_liab',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'olt_1', label: 'Trade payables (Due beyond 12 months)' },
      { id: 'olt_2', label: 'Security deposits received' }
    ]
  },
  {
    noteNumber: 8,
    id: 'note_8',
    title: 'Long-Term Provisions',
    targetHeadId: 'lt_provisions',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'ltp_1', label: 'Provision for employee benefits: Gratuity' },
      { id: 'ltp_2', label: 'Provision for employee benefits: Leave encashment' }
    ]
  },
  {
    noteNumber: 9,
    id: 'note_9',
    title: 'Short-Term Borrowings',
    targetHeadId: 'st_borrowings',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'stb_1', label: 'Working capital loans / Cash credit from banks (Secured)' },
      { id: 'stb_2', label: 'Current maturities of long-term borrowings (transferred as per 2021 MCA amendment)' }
    ]
  },
  {
    noteNumber: 10,
    id: 'note_10',
    title: 'Trade Payables & Ageing Schedule',
    targetHeadId: 'trade_payables_others',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'tp_1', label: 'Total outstanding dues of micro enterprises & small enterprises (MSME)' },
      { id: 'tp_2', label: 'Total outstanding dues of creditors other than micro & small enterprises' }
    ],
    hasTradePayablesAgeing: true
  },
  {
    noteNumber: 11,
    id: 'note_11',
    title: 'Other Current Liabilities',
    targetHeadId: 'other_cur_liab',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'ocl_1', label: 'Statutory dues payable (GST, TDS, PF, ESI)' },
      { id: 'ocl_2', label: 'Salaries and employee expenses payable' },
      { id: 'ocl_3', label: 'Advance received from customers' },
      { id: 'ocl_4', label: 'Interest accrued but not due on borrowings' }
    ]
  },
  {
    noteNumber: 12,
    id: 'note_12',
    title: 'Short-Term Provisions',
    targetHeadId: 'st_provisions',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'stp_1', label: 'Provision for employee benefits (Short-term)' },
      { id: 'stp_2', label: 'Provision for current tax (Net of advance tax)' }
    ]
  },
  {
    noteNumber: 13,
    id: 'note_13',
    title: 'Property, Plant and Equipment (PPE)',
    targetHeadId: 'ppe_tangible',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'ppe_1', label: 'Plant and Machinery' },
      { id: 'ppe_2', label: 'Computers and Data Processing Units' },
      { id: 'ppe_3', label: 'Furniture, Fixtures and Office Equipment' },
      { id: 'ppe_4', label: 'Less: Accumulated Depreciation' }
    ]
  },
  {
    noteNumber: 14,
    id: 'note_14',
    title: 'Intangible Assets',
    targetHeadId: 'intangible_assets',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'ia_1', label: 'Computer Software and Enterprise Platforms' },
      { id: 'ia_2', label: 'Less: Accumulated Amortisation' }
    ]
  },
  {
    noteNumber: 15,
    id: 'note_15',
    title: 'Capital Work-in-Progress (CWIP) & Ageing Schedule',
    targetHeadId: 'cwip',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'cwip_1', label: 'CWIP - Projects in Progress' },
      { id: 'cwip_2', label: 'CWIP - Projects Temporarily Suspended' }
    ],
    hasCwipAgeing: true
  },
  {
    noteNumber: 16,
    id: 'note_16',
    title: 'Intangible Assets Under Development',
    targetHeadId: 'intangible_under_dev',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'iaud_1', label: 'Software platforms under development' }
    ]
  },
  {
    noteNumber: 17,
    id: 'note_17',
    title: 'Non-Current Investments',
    targetHeadId: 'non_cur_investments',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'nci_1', label: 'Investment in equity instruments of subsidiaries / associates' },
      { id: 'nci_2', label: 'Investment in government securities' }
    ]
  },
  {
    noteNumber: 18,
    id: 'note_18',
    title: 'Deferred Tax Assets (Net)',
    targetHeadId: 'deferred_tax_assets',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'dta_1', label: 'Deferred tax assets arising on timing differences (AS-22)' }
    ]
  },
  {
    noteNumber: 19,
    id: 'note_19',
    title: 'Long-Term Loans and Advances',
    targetHeadId: 'lt_loans_advances',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'ltla_1', label: 'Capital advances' },
      { id: 'ltla_2', label: 'Security deposits (Premises, electricity, utility bodies)' }
    ]
  },
  {
    noteNumber: 20,
    id: 'note_20',
    title: 'Other Non-Current Assets',
    targetHeadId: 'other_non_cur_assets',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'onca_1', label: 'Long-term bank deposits (Maturity > 12 months)' }
    ]
  },
  {
    noteNumber: 21,
    id: 'note_21',
    title: 'Current Investments',
    targetHeadId: 'cur_investments',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'ci_1', label: 'Investment in mutual funds (Short-term / Liquid)' }
    ]
  },
  {
    noteNumber: 22,
    id: 'note_22',
    title: 'Inventories',
    targetHeadId: 'inventories',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'inv_1', label: 'Raw materials' },
      { id: 'inv_2', label: 'Work-in-progress' },
      { id: 'inv_3', label: 'Finished goods and Stock-in-Trade' }
    ]
  },
  {
    noteNumber: 23,
    id: 'note_23',
    title: 'Trade Receivables & Ageing Schedule',
    targetHeadId: 'trade_receivables',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'tr_1', label: 'Undisputed trade receivables - considered good' },
      { id: 'tr_2', label: 'Less: Allowance for expected credit loss / doubtful debts' }
    ],
    hasTradeReceivablesAgeing: true
  },
  {
    noteNumber: 24,
    id: 'note_24',
    title: 'Cash and Cash Equivalents',
    targetHeadId: 'cash_and_equivalents',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'cce_1', label: 'Balances with banks in current accounts' },
      { id: 'cce_2', label: 'Cash on hand' },
      { id: 'cce_3', label: 'Bank deposits with original maturity of less than 3 months' }
    ]
  },
  {
    noteNumber: 25,
    id: 'note_25',
    title: 'Short-Term Loans and Advances',
    targetHeadId: 'st_loans_advances',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'stla_1', label: 'Advances to suppliers' },
      { id: 'stla_2', label: 'Prepaid expenses' }
    ]
  },
  {
    noteNumber: 26,
    id: 'note_26',
    title: 'Other Current Assets',
    targetHeadId: 'other_cur_assets',
    section: 'balance_sheet',
    defaultItems: [
      { id: 'oca_1', label: 'Advance income tax and TDS receivable' },
      { id: 'oca_2', label: 'GST input tax credit' },
      { id: 'oca_3', label: 'Interest accrued on bank deposits' }
    ]
  },

  // ---------------------------------------------------------------------------
  // PROFIT & LOSS NOTES (Note 27 to Note 39)
  // ---------------------------------------------------------------------------
  {
    noteNumber: 27,
    id: 'note_27',
    title: 'Revenue from Operations',
    targetHeadId: 'rev_operations',
    section: 'profit_loss',
    defaultItems: [
      { id: 'ro_1', label: 'Sale of products' },
      { id: 'ro_2', label: 'Sale of services' },
      { id: 'ro_3', label: 'Other operating revenues' }
    ]
  },
  {
    noteNumber: 28,
    id: 'note_28',
    title: 'Other Income',
    targetHeadId: 'other_income',
    section: 'profit_loss',
    defaultItems: [
      { id: 'oi_1', label: 'Interest income on bank fixed deposits' },
      { id: 'oi_2', label: 'Dividend income' },
      { id: 'oi_3', label: 'Net gain on foreign exchange differences' }
    ]
  },
  {
    noteNumber: 29,
    id: 'note_29',
    title: 'Cost of Materials Consumed',
    targetHeadId: 'exp_materials_consumed',
    section: 'profit_loss',
    defaultItems: [
      { id: 'cmc_1', label: 'Cost of materials consumed' }
    ]
  },
  {
    noteNumber: 30,
    id: 'note_30',
    title: 'Purchases of Stock-in-Trade',
    targetHeadId: 'exp_purchases_stock',
    section: 'profit_loss',
    defaultItems: [
      { id: 'pst_1', label: 'Purchases of Stock-in-Trade' }
    ]
  },
  {
    noteNumber: 31,
    id: 'note_31',
    title: 'Changes in Inventories of Finished Goods, WIP and Stock-in-Trade',
    targetHeadId: 'exp_changes_inventories',
    section: 'profit_loss',
    defaultItems: [
      { id: 'cinv_1', label: 'Opening stock of finished goods, WIP and Stock-in-Trade' },
      { id: 'cinv_2', label: 'Less: Closing stock of finished goods, WIP and Stock-in-Trade' }
    ]
  },
  {
    noteNumber: 32,
    id: 'note_32',
    title: 'Employee Benefits Expense',
    targetHeadId: 'exp_employee_benefits',
    section: 'profit_loss',
    defaultItems: [
      { id: 'ebe_1', label: 'Salaries, wages, bonus and allowances' },
      { id: 'ebe_2', label: 'Contributions to provident and other funds' },
      { id: 'ebe_3', label: 'Staff welfare expenses' }
    ]
  },
  {
    noteNumber: 33,
    id: 'note_33',
    title: 'Finance Costs',
    targetHeadId: 'exp_finance_costs',
    section: 'profit_loss',
    defaultItems: [
      { id: 'fc_1', label: 'Interest expense on bank term loans and borrowings' },
      { id: 'fc_2', label: 'Other borrowing charges and bank processing costs' }
    ]
  },
  {
    noteNumber: 34,
    id: 'note_34',
    title: 'Depreciation and Amortisation Expense',
    targetHeadId: 'exp_depreciation_amortization',
    section: 'profit_loss',
    defaultItems: [
      { id: 'da_1', label: 'Depreciation on Property, Plant and Equipment' },
      { id: 'da_2', label: 'Amortisation of intangible assets' }
    ]
  },
  {
    noteNumber: 35,
    id: 'note_35',
    title: 'Other Expenses',
    targetHeadId: 'exp_other_expenses',
    section: 'profit_loss',
    defaultItems: [
      { id: 'oe_1', label: 'Rent, rates and taxes' },
      { id: 'oe_2', label: 'Legal, professional and compliance charges' },
      { id: 'oe_3', label: 'Payment to auditors (Audit fee, tax matters)' },
      { id: 'oe_4', label: 'Office communication, electricity and administration' }
    ]
  },
  {
    noteNumber: 36,
    id: 'note_36',
    title: 'Exceptional Items',
    targetHeadId: 'exceptional_items',
    section: 'profit_loss',
    defaultItems: [
      { id: 'exc_1', label: 'Exceptional items of income / (expense) (AS-5)' }
    ]
  },
  {
    noteNumber: 37,
    id: 'note_37',
    title: 'Extraordinary Items',
    targetHeadId: 'extraordinary_items',
    section: 'profit_loss',
    defaultItems: [
      { id: 'ext_1', label: 'Extraordinary items of income / (expense) (AS-5)' }
    ]
  },
  {
    noteNumber: 38,
    id: 'note_38',
    title: 'Discontinuing Operations',
    targetHeadId: 'profit_discontinuing_ops_pre_tax',
    section: 'profit_loss',
    defaultItems: [
      { id: 'disc_1', label: 'Pre-tax profit / (loss) from discontinuing operations' },
      { id: 'disc_2', label: 'Tax expense of discontinuing operations' }
    ]
  },
  {
    noteNumber: 39,
    id: 'note_39',
    title: 'Earnings Per Equity Share (AS 20)',
    targetHeadId: 'eps_basic',
    section: 'profit_loss',
    defaultItems: [
      { id: 'eps_1', label: 'Basic Earnings per equity share (₹)' },
      { id: 'eps_2', label: 'Diluted Earnings per equity share (₹)' }
    ],
    isEps: true
  }
]

export const DEFAULT_PROMOTER_DISCLOSURE: PromoterShareholdingRow[] = [
  {
    promoterName: '[Promoter / Shareholder 1]',
    sharesHeldCurrent: 0,
    sharesHeldPrev: 0,
    percentageCurrent: 0,
    percentagePrev: 0,
    pctChangeDuringYear: 0
  }
]

export const DEFAULT_TRADE_PAYABLES_AGEING: TradePayablesAgeingRow[] = [
  { category: 'msme', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
  { category: 'others', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
  { category: 'disputed_msme', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
  { category: 'disputed_others', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 }
]

export const DEFAULT_CWIP_AGEING: CwipAgeingRow[] = [
  { projectType: 'cwip', status: 'in_progress', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
  { projectType: 'cwip', status: 'temporarily_suspended', lessThan1Year: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 }
]

export const DEFAULT_TRADE_RECEIVABLES_AGEING: TradeReceivablesAgeingRow[] = [
  { category: 'undisputed_good', lessThan6Months: 0, sixMonthsToOneYear: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
  { category: 'undisputed_doubtful', lessThan6Months: 0, sixMonthsToOneYear: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
  { category: 'disputed_good', lessThan6Months: 0, sixMonthsToOneYear: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 },
  { category: 'disputed_doubtful', lessThan6Months: 0, sixMonthsToOneYear: 0, oneToTwoYears: 0, twoToThreeYears: 0, moreThan3Years: 0, total: 0 }
]

/**
 * Resolves all statutory Notes 1 through 39.
 * If user entered notes exist in workspace.notes, uses user values.
 * Otherwise, populates from balanceSheetRows / plRows or statutory blank rows.
 */
export function resolveAllStatutoryNotes(params: {
  workspace: WorkspaceState
  balanceSheetRows?: StatementRowValue[]
  plRows?: StatementRowValue[]
  scope?: 'all' | 'balance_sheet' | 'profit_loss'
}): NoteSchedule[] {
  const { workspace, balanceSheetRows = [], plRows = [], scope = 'all' } = params
  const userNotes = workspace.notes || {}

  const filteredMeta = CANONICAL_STATUTORY_NOTES.filter(meta => {
    if (scope === 'balance_sheet') return meta.section === 'balance_sheet'
    if (scope === 'profit_loss') return meta.section === 'profit_loss'
    return true
  })

  return filteredMeta.map(meta => {
    const existing = userNotes[meta.id]

    // Find row in statement if available
    const stRow =
      meta.section === 'balance_sheet'
        ? balanceSheetRows.find(r => r.headId === meta.targetHeadId || r.noteNumber === meta.noteNumber)
        : plRows.find(r => r.headId === meta.targetHeadId || r.noteNumber === meta.noteNumber)

    let items: BreakdownItem[] = []

    if (existing?.items && existing.items.length > 0) {
      items = existing.items
    } else {
      // Create default breakdown items
      const curTotal = stRow?.currentAmount || 0
      const prevTotal = stRow?.prevAmount || 0

      items = meta.defaultItems.map((d, index) => {
        // If single item or first item, reflect the statement total if available
        const curAmt = index === 0 ? curTotal : 0
        const prevAmt = index === 0 ? prevTotal : 0
        return {
          id: d.id,
          label: d.label,
          currentAmount: curAmt,
          prevAmount: prevAmt
        }
      })
    }

    const note: NoteSchedule = {
      id: meta.id,
      noteNumber: meta.noteNumber,
      title: meta.title,
      targetHeadId: meta.targetHeadId,
      status: existing?.status || 'completed',
      narrativeText: existing?.narrativeText,
      items
    }

    // Attach March 2021 disclosures
    if (meta.hasPromoterShareholding) {
      note.promoterShareholding =
        existing?.promoterShareholding && existing.promoterShareholding.length > 0
          ? existing.promoterShareholding
          : DEFAULT_PROMOTER_DISCLOSURE
    }

    if (meta.hasTradePayablesAgeing) {
      note.tradePayablesAgeing =
        existing?.tradePayablesAgeing && existing.tradePayablesAgeing.length > 0
          ? existing.tradePayablesAgeing
          : DEFAULT_TRADE_PAYABLES_AGEING
    }

    if (meta.hasCwipAgeing) {
      note.cwipAgeing =
        existing?.cwipAgeing && existing.cwipAgeing.length > 0
          ? existing.cwipAgeing
          : DEFAULT_CWIP_AGEING
    }

    if (meta.hasTradeReceivablesAgeing) {
      note.tradeReceivablesAgeing =
        existing?.tradeReceivablesAgeing && existing.tradeReceivablesAgeing.length > 0
          ? existing.tradeReceivablesAgeing
          : DEFAULT_TRADE_RECEIVABLES_AGEING
    }

    return note
  })
}
