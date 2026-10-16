export type CompanyType = 'private' | 'public' | 'opc' | 'section8' | 'llp'

export type AccountingFramework = 'division-1' | 'division-2' | 'division-3-nbfc'

export type PresentationUnit = 'rupees' | 'thousands' | 'lakhs' | 'crores'

export interface CompanyProfile {
  companyName: string
  cin?: string
  companyType: CompanyType
  framework: AccountingFramework
  financialYearEnd: string // e.g. '2026-03-31'
  comparativeYearEnd: string // e.g. '2025-03-31'
  presentationUnit: PresentationUnit
  registeredOffice?: string
  frameworkConfirmed: boolean
}

export type MappingConfidence = 'high' | 'review' | 'unmapped'

export interface TrialBalanceRow {
  id: string
  ledgerName: string
  currentDebit: number
  currentCredit: number
  prevDebit: number
  prevCredit: number
  mappedHeadId?: string
  confidence?: MappingConfidence
  isContra?: boolean
  isExcluded?: boolean
  exclusionReason?: string
  matchReason?: string
}

export type StatementSectionType =
  | 'equity_and_liabilities'
  | 'assets'
  | 'revenue'
  | 'expenses'
  | 'tax_and_profit'
  | 'cash_flow_operating'
  | 'cash_flow_investing'
  | 'cash_flow_financing'

export interface ScheduleHead {
  id: string
  code: string
  label: string
  section: StatementSectionType
  category: string
  subCategory?: string
  level: number // 1: Main head, 2: Sub-head, 3: Line item
  normalBalance: 'debit' | 'credit'
  isSubtotal?: boolean
  isGrandTotal?: boolean
  subtotalChildren?: string[]
  formula?: string
  defaultNoteNumber?: number
}

export interface StatementRowValue {
  headId: string
  code: string
  label: string
  noteNumber?: number
  currentAmount: number
  prevAmount: number
  isSubtotal?: boolean
  isGrandTotal?: boolean
  level: number
  section: StatementSectionType
}

export type NoteStatus = 'required' | 'not_applicable' | 'needs_review' | 'incomplete' | 'completed'

export interface BreakdownItem {
  id: string
  label: string
  currentAmount: number
  prevAmount: number
}

export interface PromoterShareholdingRow {
  promoterName: string
  sharesHeldCurrent: number
  sharesHeldPrev: number
  percentageCurrent: number
  percentagePrev: number
  pctChangeDuringYear: number
}

export interface TradePayablesAgeingRow {
  category: 'msme' | 'others' | 'disputed_msme' | 'disputed_others'
  lessThan1Year: number
  oneToTwoYears: number
  twoToThreeYears: number
  moreThan3Years: number
  total: number
}

export interface TradeReceivablesAgeingRow {
  category:
    | 'undisputed_good'
    | 'undisputed_doubtful'
    | 'disputed_good'
    | 'disputed_doubtful'
  lessThan6Months: number
  sixMonthsToOneYear: number
  oneToTwoYears: number
  twoToThreeYears: number
  moreThan3Years: number
  total: number
}

export interface CwipAgeingRow {
  projectType: 'cwip' | 'intangible_under_dev'
  status: 'in_progress' | 'temporarily_suspended'
  lessThan1Year: number
  oneToTwoYears: number
  twoToThreeYears: number
  moreThan3Years: number
  total: number
}

export interface TitleDeedItem {
  propertyDescription: string
  grossCarryingValue: number
  titleDeedsHeldInNameOf: string
  whetherPromoterDirectorRelative: boolean
  propertyHeldSince: string
  reasonForNotBeingInCompanyName: string
}

export interface NoteSchedule {
  id: string
  noteNumber: number
  title: string
  targetHeadId: string
  status: NoteStatus
  naReason?: string
  narrativeText?: string
  items: BreakdownItem[]
  promoterShareholding?: PromoterShareholdingRow[]
  tradePayablesAgeing?: TradePayablesAgeingRow[]
  tradeReceivablesAgeing?: TradeReceivablesAgeingRow[]
  cwipAgeing?: CwipAgeingRow[]
  titleDeeds?: TitleDeedItem[]
}

export interface RatioDefinition {
  id: string
  name: string
  section: string
  numeratorLabel: string
  denominatorLabel: string
  formulaDescription: string
  statutoryReference: string
}

export interface RatioResult {
  id: string
  name: string
  numeratorLabel: string
  denominatorLabel: string
  currentNumerator: number
  currentDenominator: number
  currentValue: number | null
  prevNumerator: number
  prevDenominator: number
  prevValue: number | null
  variancePct: number | null
  isMeaningful: boolean
  varianceExceeds25: boolean
  explanation?: string
  formulaDescription: string
}

export type ValidationSeverity = 'blocking' | 'warning' | 'info'

export interface ValidationIssue {
  id: string
  ruleNumber: number
  severity: ValidationSeverity
  title: string
  message: string
  targetField?: string
  suggestedFix?: string
}

export interface SupplementaryCashFlowInputs {
  depreciationAmortization: number
  interestExpense: number
  interestIncome: number
  dividendIncome: number
  gainLossOnSaleOfAssets: number // positive for loss, negative for gain
  otherNonCashAdjustments: number
  taxPaidActual: number
  purchaseOfPPE: number
  saleOfPPE: number
  purchaseOfInvestments: number
  saleOfInvestments: number
  interestReceivedActual: number
  dividendsReceivedActual: number
  proceedsFromShareCapital: number
  proceedsFromBorrowings: number
  repaymentOfBorrowings: number
  interestPaidActual: number
  dividendsPaidActual: number
  openingCashAndEquivalents: number
}

export interface CashFlowStatementResult {
  operatingActivities: {
    profitBeforeTax: number
    adjustmentsForNonCash: number
    operatingProfitBeforeWorkingCapital: number
    workingCapitalChanges: number
    cashGeneratedFromOperations: number
    directTaxesPaid: number
    netCashFromOperating: number
  }
  investingActivities: {
    purchaseOfPPE: number
    saleOfPPE: number
    purchaseOfInvestments: number
    saleOfInvestments: number
    interestReceived: number
    dividendsReceived: number
    netCashFromInvesting: number
  }
  financingActivities: {
    proceedsFromShareCapital: number
    proceedsFromBorrowings: number
    repaymentOfBorrowings: number
    interestPaid: number
    dividendsPaid: number
    netCashFromFinancing: number
  }
  netIncreaseInCash: number
  openingCash: number
  closingCashCalculated: number
  closingCashBalanceSheet: number
  discrepancy: number
}

export interface WorkspaceState {
  profile: CompanyProfile
  trialBalance: TrialBalanceRow[]
  manualDirectEntries: Record<string, { current: number; prev: number }>
  notes: Record<string, NoteSchedule>
  supplementaryCashFlow: SupplementaryCashFlowInputs
  ratioExplanations: Record<string, string>
  lastUpdated: string
}
