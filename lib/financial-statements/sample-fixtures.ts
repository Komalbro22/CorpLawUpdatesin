import { WorkspaceState } from './types'

export const SAMPLE_PRIVATE_COMPANY_FIXTURE: WorkspaceState = {
  profile: {
    companyName: 'Astraea Infotech Private Limited',
    cin: 'U72900DL2018PTC334521',
    companyType: 'private',
    framework: 'division-1',
    financialYearEnd: '2026-03-31',
    comparativeYearEnd: '2025-03-31',
    presentationUnit: 'lakhs',
    registeredOffice: 'Plot No. 42, Okhla Industrial Area, Phase-III, New Delhi - 110020',
    frameworkConfirmed: true
  },
  trialBalance: [
    {
      id: 'tb_1',
      ledgerName: 'Equity Share Capital (Face Value Rs. 10)',
      currentDebit: 0,
      currentCredit: 50.0,
      prevDebit: 0,
      prevCredit: 50.0,
      mappedHeadId: 'sh_capital',
      confidence: 'high',
      matchReason: 'Recognized as statutory Share Capital ledger'
    },
    {
      id: 'tb_2',
      ledgerName: 'Securities Premium Account',
      currentDebit: 0,
      currentCredit: 25.0,
      prevDebit: 0,
      prevCredit: 25.0,
      mappedHeadId: 'reserves_surplus',
      confidence: 'high',
      matchReason: 'Recognized as Reserves & Surplus ledger'
    },
    {
      id: 'tb_3',
      ledgerName: 'General Reserve',
      currentDebit: 0,
      currentCredit: 15.0,
      prevDebit: 0,
      prevCredit: 10.0,
      mappedHeadId: 'reserves_surplus',
      confidence: 'high',
      matchReason: 'Recognized as Reserves & Surplus ledger'
    },
    {
      id: 'tb_4',
      ledgerName: 'Surplus in Statement of Profit & Loss (Opening)',
      currentDebit: 0,
      currentCredit: 35.0,
      prevDebit: 0,
      prevCredit: 22.0,
      mappedHeadId: 'reserves_surplus',
      confidence: 'high',
      matchReason: 'Recognized as Reserves & Surplus ledger'
    },
    {
      id: 'tb_5',
      ledgerName: 'HDFC Bank Term Loan (Non-Current Portion)',
      currentDebit: 0,
      currentCredit: 40.0,
      prevDebit: 0,
      prevCredit: 55.0,
      mappedHeadId: 'lt_borrowings',
      confidence: 'high',
      matchReason: 'Recognized as Long-term Borrowings'
    },
    {
      id: 'tb_6',
      ledgerName: 'Deferred Tax Liability (Net)',
      currentDebit: 0,
      currentCredit: 4.2,
      prevDebit: 0,
      prevCredit: 3.8,
      mappedHeadId: 'deferred_tax_liab',
      confidence: 'high',
      matchReason: 'Recognized as Deferred Tax Liability'
    },
    {
      id: 'tb_7',
      ledgerName: 'Provision for Gratuity (Non-Current)',
      currentDebit: 0,
      currentCredit: 6.5,
      prevDebit: 0,
      prevCredit: 5.2,
      mappedHeadId: 'lt_provisions',
      confidence: 'high',
      matchReason: 'Recognized as Long-Term Provisions'
    },
    {
      id: 'tb_8',
      ledgerName: 'Current Maturities of Long Term Debt',
      currentDebit: 0,
      currentCredit: 15.0,
      prevDebit: 0,
      prevCredit: 15.0,
      mappedHeadId: 'st_borrowings',
      confidence: 'high',
      matchReason: 'Recognized as Short-Term Borrowings (Current maturities)'
    },
    {
      id: 'tb_9',
      ledgerName: 'HDFC Cash Credit Account',
      currentDebit: 0,
      currentCredit: 12.8,
      prevDebit: 0,
      prevCredit: 18.5,
      mappedHeadId: 'st_borrowings',
      confidence: 'high',
      matchReason: 'Recognized as Short-Term Borrowings'
    },
    {
      id: 'tb_10',
      ledgerName: 'Sundry Creditors - Micro and Small Enterprises (MSME)',
      currentDebit: 0,
      currentCredit: 8.4,
      prevDebit: 0,
      prevCredit: 6.2,
      mappedHeadId: 'trade_payables_msme',
      confidence: 'high',
      matchReason: 'Recognized as Trade Payables: Micro and Small Enterprises'
    },
    {
      id: 'tb_11',
      ledgerName: 'Sundry Creditors - Other than MSME',
      currentDebit: 0,
      currentCredit: 24.6,
      prevDebit: 0,
      prevCredit: 29.8,
      mappedHeadId: 'trade_payables_others',
      confidence: 'high',
      matchReason: 'Recognized as Trade Payables: Other than MSME'
    },
    {
      id: 'tb_12',
      ledgerName: 'GST and TDS Statutory Dues Payable',
      currentDebit: 0,
      currentCredit: 5.8,
      prevDebit: 0,
      prevCredit: 4.5,
      mappedHeadId: 'other_cur_liab',
      confidence: 'high',
      matchReason: 'Recognized as Other Current Liabilities / Statutory dues'
    },
    {
      id: 'tb_13',
      ledgerName: 'Salaries & Bonus Payable',
      currentDebit: 0,
      currentCredit: 9.2,
      prevDebit: 0,
      prevCredit: 8.0,
      mappedHeadId: 'other_cur_liab',
      confidence: 'high',
      matchReason: 'Recognized as Other Current Liabilities'
    },
    {
      id: 'tb_14',
      ledgerName: 'Provision for Income Tax (Current Year)',
      currentDebit: 0,
      currentCredit: 7.5,
      prevDebit: 0,
      prevCredit: 6.0,
      mappedHeadId: 'st_provisions',
      confidence: 'high',
      matchReason: 'Recognized as Short-Term Provisions'
    },
    // ASSETS
    {
      id: 'tb_15',
      ledgerName: 'Office Premises (Freehold Land & Building)',
      currentDebit: 95.0,
      currentCredit: 0,
      prevDebit: 95.0,
      prevCredit: 0,
      mappedHeadId: 'ppe_tangible',
      confidence: 'high',
      matchReason: 'Recognized as Property, Plant and Equipment (PPE)'
    },
    {
      id: 'tb_16',
      ledgerName: 'Computers, Servers & IT Equipment',
      currentDebit: 28.5,
      currentCredit: 0,
      prevDebit: 22.0,
      prevCredit: 0,
      mappedHeadId: 'ppe_tangible',
      confidence: 'high',
      matchReason: 'Recognized as Property, Plant and Equipment (PPE)'
    },
    {
      id: 'tb_17',
      ledgerName: 'Accumulated Depreciation on Fixed Assets',
      currentDebit: 0,
      currentCredit: 22.5,
      prevDebit: 0,
      prevCredit: 16.0,
      mappedHeadId: 'ppe_tangible',
      confidence: 'high',
      isContra: true,
      matchReason: 'Recognized as Accumulated Depreciation (contra PPE)'
    },
    {
      id: 'tb_18',
      ledgerName: 'Enterprise ERP Software License',
      currentDebit: 12.0,
      currentCredit: 0,
      prevDebit: 14.0,
      prevCredit: 0,
      mappedHeadId: 'intangible_assets',
      confidence: 'high',
      matchReason: 'Recognized as Intangible Assets'
    },
    {
      id: 'tb_19',
      ledgerName: 'Office Renovation & Fitouts CWIP',
      currentDebit: 6.5,
      currentCredit: 0,
      prevDebit: 0,
      prevCredit: 0,
      mappedHeadId: 'cwip',
      confidence: 'high',
      matchReason: 'Recognized as Capital Work-in-Progress (CWIP)'
    },
    {
      id: 'tb_20',
      ledgerName: 'Electricity & Lease Security Deposits (Long-Term)',
      currentDebit: 7.5,
      currentCredit: 0,
      prevDebit: 7.5,
      prevCredit: 0,
      mappedHeadId: 'lt_loans_advances',
      confidence: 'high',
      matchReason: 'Recognized as Long-Term Loans and Advances'
    },
    {
      id: 'tb_21',
      ledgerName: 'Finished Goods Stock / Inventory',
      currentDebit: 18.2,
      currentCredit: 0,
      prevDebit: 22.4,
      prevCredit: 0,
      mappedHeadId: 'inventories',
      confidence: 'high',
      matchReason: 'Recognized as Inventories'
    },
    {
      id: 'tb_22',
      ledgerName: 'Sundry Debtors / Trade Receivables',
      currentDebit: 48.6,
      currentCredit: 0,
      prevDebit: 42.1,
      prevCredit: 0,
      mappedHeadId: 'trade_receivables',
      confidence: 'high',
      matchReason: 'Recognized as Trade Receivables'
    },
    {
      id: 'tb_23',
      ledgerName: 'HDFC Bank Current Account',
      currentDebit: 32.4,
      currentCredit: 0,
      prevDebit: 28.5,
      prevCredit: 0,
      mappedHeadId: 'cash_and_equivalents',
      confidence: 'high',
      matchReason: 'Recognized as Cash & Cash Equivalents'
    },
    {
      id: 'tb_24',
      ledgerName: 'Cash in Hand',
      currentDebit: 0.8,
      currentCredit: 0,
      prevDebit: 0.5,
      prevCredit: 0,
      mappedHeadId: 'cash_and_equivalents',
      confidence: 'high',
      matchReason: 'Recognized as Cash & Cash Equivalents'
    },
    {
      id: 'tb_25',
      ledgerName: 'Prepaid Insurance & Annual Software Maintenance',
      currentDebit: 4.5,
      currentCredit: 0,
      prevDebit: 3.8,
      prevCredit: 0,
      mappedHeadId: 'st_loans_advances',
      confidence: 'high',
      matchReason: 'Recognized as Short-Term Loans and Advances'
    },
    {
      id: 'tb_26',
      ledgerName: 'Advance Tax & TDS Receivable FY 2025-26',
      currentDebit: 50.0,
      currentCredit: 0,
      prevDebit: 40.0,
      prevCredit: 0,
      mappedHeadId: 'other_cur_assets',
      confidence: 'high',
      matchReason: 'Recognized as Other Current Assets'
    },
    // PROFIT & LOSS ROWS
    {
      id: 'tb_27',
      ledgerName: 'Domestic & Export IT Software Services Revenue',
      currentDebit: 0,
      currentCredit: 245.0,
      prevDebit: 0,
      prevCredit: 210.0,
      mappedHeadId: 'rev_operations',
      confidence: 'high',
      matchReason: 'Recognized as Revenue from Operations'
    },
    {
      id: 'tb_28',
      ledgerName: 'Interest on Bank Fixed Deposits & Other Income',
      currentDebit: 0,
      currentCredit: 5.0,
      prevDebit: 0,
      prevCredit: 3.5,
      mappedHeadId: 'other_income',
      confidence: 'high',
      matchReason: 'Recognized as Other Income'
    },
    {
      id: 'tb_29',
      ledgerName: 'Cost of Materials / Software development services',
      currentDebit: 30.0,
      currentCredit: 0,
      prevDebit: 25.0,
      prevCredit: 0,
      mappedHeadId: 'exp_materials_consumed',
      confidence: 'high',
      matchReason: 'Recognized as Cost of Materials Consumed'
    },
    {
      id: 'tb_30',
      ledgerName: 'Software Engineering Salaries & Allowances',
      currentDebit: 140.0,
      currentCredit: 0,
      prevDebit: 120.0,
      prevCredit: 0,
      mappedHeadId: 'exp_employee_benefits',
      confidence: 'high',
      matchReason: 'Recognized as Employee Benefits Expense'
    },
    {
      id: 'tb_31',
      ledgerName: 'Interest on HDFC Term Loan & Bank Charges',
      currentDebit: 6.8,
      currentCredit: 0,
      prevDebit: 8.5,
      prevCredit: 0,
      mappedHeadId: 'exp_finance_costs',
      confidence: 'high',
      matchReason: 'Recognized as Finance Costs'
    },
    {
      id: 'tb_32',
      ledgerName: 'Depreciation & Amortization Expense for the Year',
      currentDebit: 8.5,
      currentCredit: 0,
      prevDebit: 7.2,
      prevCredit: 0,
      mappedHeadId: 'exp_depreciation_amortization',
      confidence: 'high',
      matchReason: 'Recognized as Depreciation and Amortization Expense'
    },
    {
      id: 'tb_33',
      ledgerName: 'Cloud Hosting, Office Rent & Legal Audit Expenses',
      currentDebit: 34.2,
      currentCredit: 0,
      prevDebit: 29.0,
      prevCredit: 0,
      mappedHeadId: 'exp_other_expenses',
      confidence: 'high',
      matchReason: 'Recognized as Other Expenses'
    },
    {
      id: 'tb_34',
      ledgerName: 'Current Income Tax Expense',
      currentDebit: 7.5,
      currentCredit: 0,
      prevDebit: 6.0,
      prevCredit: 0,
      mappedHeadId: 'tax_current',
      confidence: 'high',
      matchReason: 'Recognized as Current Tax Expense'
    },
    {
      id: 'tb_35',
      ledgerName: 'Deferred Tax Expense / (Credit)',
      currentDebit: 0.5,
      currentCredit: 0,
      prevDebit: 0.3,
      prevCredit: 0,
      mappedHeadId: 'tax_deferred',
      confidence: 'high',
      matchReason: 'Recognized as Deferred Tax Expense'
    }
  ],
  manualDirectEntries: {},
  notes: {
    note_1: {
      id: 'note_1',
      noteNumber: 1,
      title: 'Share Capital',
      targetHeadId: 'sh_capital',
      status: 'completed',
      items: [
        {
          id: 'sc_1',
          label: '5,00,000 Equity Shares of Rs. 10 each fully paid up',
          currentAmount: 50.0,
          prevAmount: 50.0
        }
      ],
      promoterShareholding: [
        {
          promoterName: 'Rohan Sharma',
          sharesHeldCurrent: 275000,
          sharesHeldPrev: 275000,
          percentageCurrent: 55.0,
          percentagePrev: 55.0,
          pctChangeDuringYear: 0.0
        },
        {
          promoterName: 'Priya Sharma',
          sharesHeldCurrent: 225000,
          sharesHeldPrev: 225000,
          percentageCurrent: 45.0,
          percentagePrev: 45.0,
          pctChangeDuringYear: 0.0
        }
      ]
    },
    note_10: {
      id: 'note_10',
      noteNumber: 10,
      title: 'Trade Payables & Ageing Schedule',
      targetHeadId: 'trade_payables_others',
      status: 'completed',
      items: [
        {
          id: 'tp_1',
          label: 'Dues to Micro and Small Enterprises',
          currentAmount: 8.4,
          prevAmount: 6.2
        },
        {
          id: 'tp_2',
          label: 'Dues to Creditors other than Micro & Small Enterprises',
          currentAmount: 24.6,
          prevAmount: 29.8
        }
      ],
      tradePayablesAgeing: [
        {
          category: 'msme',
          lessThan1Year: 8.4,
          oneToTwoYears: 0,
          twoToThreeYears: 0,
          moreThan3Years: 0,
          total: 8.4
        },
        {
          category: 'others',
          lessThan1Year: 22.1,
          oneToTwoYears: 2.5,
          twoToThreeYears: 0,
          moreThan3Years: 0,
          total: 24.6
        }
      ]
    },
    note_23: {
      id: 'note_23',
      noteNumber: 23,
      title: 'Trade Receivables & Ageing Schedule',
      targetHeadId: 'trade_receivables',
      status: 'completed',
      items: [
        {
          id: 'tr_1',
          label: 'Undisputed Trade Receivables - considered good',
          currentAmount: 48.6,
          prevAmount: 42.1
        }
      ],
      tradeReceivablesAgeing: [
        {
          category: 'undisputed_good',
          lessThan6Months: 41.2,
          sixMonthsToOneYear: 5.4,
          oneToTwoYears: 2.0,
          twoToThreeYears: 0,
          moreThan3Years: 0,
          total: 48.6
        }
      ]
    }
  },
  supplementaryCashFlow: {
    depreciationAmortization: 8.5,
    interestExpense: 6.8,
    interestIncome: 5.0,
    dividendIncome: 0,
    gainLossOnSaleOfAssets: 0,
    otherNonCashAdjustments: 0,
    taxPaidActual: 7.5,
    purchaseOfPPE: 6.5,
    saleOfPPE: 0,
    purchaseOfInvestments: 0,
    saleOfInvestments: 0,
    interestReceivedActual: 5.0,
    dividendsReceivedActual: 0,
    proceedsFromShareCapital: 0,
    proceedsFromBorrowings: 0,
    repaymentOfBorrowings: 15.0,
    interestPaidActual: 6.8,
    dividendsPaidActual: 0,
    openingCashAndEquivalents: 29.0
  },
  ratioExplanations: {
    inventory_turnover_ratio:
      'Inventory holding decreased due to optimized supply chain fulfillment and automated replenishment.',
    trade_payables_turnover_ratio:
      'Settled major vendor invoices ahead of statutory 45-day timelines to benefit from early-payment discounts.'
  },
  lastUpdated: new Date().toISOString()
}
