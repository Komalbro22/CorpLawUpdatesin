import { WorkspaceState, CompanyProfile } from './types'
import { SAMPLE_PRIVATE_COMPANY_FIXTURE } from './sample-fixtures'

const STORAGE_KEY = 'corplaw_financial_statements_workspace'
const PREPARATION_COUNT_KEY = 'corplaw_fin_statement_prep_count'

export const DEFAULT_PROFILE: CompanyProfile = {
  companyName: '',
  cin: '',
  companyType: 'private',
  framework: 'division-1',
  financialYearEnd: '2026-03-31',
  comparativeYearEnd: '2025-03-31',
  presentationUnit: 'rupees',
  registeredOffice: '',
  frameworkConfirmed: false
}

export const INITIAL_WORKSPACE: WorkspaceState = {
  profile: DEFAULT_PROFILE,
  trialBalance: [],
  manualDirectEntries: {},
  notes: {},
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

export function loadWorkspaceFromStorage(): WorkspaceState {
  if (typeof window === 'undefined') return INITIAL_WORKSPACE

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_WORKSPACE
    const parsed = JSON.parse(raw)
    return {
      ...INITIAL_WORKSPACE,
      ...parsed,
      profile: {
        ...DEFAULT_PROFILE,
        ...(parsed.profile || {})
      }
    }
  } catch (e) {
    console.error('Failed to parse financial statements workspace from localStorage:', e)
    return INITIAL_WORKSPACE
  }
}

export function saveWorkspaceToStorage(workspace: WorkspaceState): void {
  if (typeof window === 'undefined') return

  try {
    const payload = {
      ...workspace,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.error('Failed to save financial statements workspace to localStorage:', e)
  }
}

export function clearWorkspaceStorage(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear workspace:', e)
  }
}

export function incrementLocalPreparationCount(): number {
  if (typeof window === 'undefined') return 1
  try {
    const current = parseInt(localStorage.getItem(PREPARATION_COUNT_KEY) || '0', 10)
    const next = current + 1
    localStorage.setItem(PREPARATION_COUNT_KEY, next.toString())
    return next
  } catch {
    return 1
  }
}

export function getLocalPreparationCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem(PREPARATION_COUNT_KEY) || '0', 10)
  } catch {
    return 0
  }
}

export function exportWorkspaceToJson(workspace: WorkspaceState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workspace, null, 2))
  const fileName = `${(workspace.profile.companyName || 'Financial-Statements')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .toLowerCase()}_workspace.json`
  const dlAnchor = document.createElement('a')
  dlAnchor.setAttribute('href', dataStr)
  dlAnchor.setAttribute('download', fileName)
  document.body.appendChild(dlAnchor)
  dlAnchor.click()
  dlAnchor.remove()
}

export function loadSampleFixture(): WorkspaceState {
  return JSON.parse(JSON.stringify(SAMPLE_PRIVATE_COMPANY_FIXTURE))
}
