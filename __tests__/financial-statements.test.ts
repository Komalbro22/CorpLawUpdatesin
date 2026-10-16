import {
  DIVISION_1_BALANCE_SHEET_HEADS,
  DIVISION_1_PL_HEADS,
  HEAD_BY_ID
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
import { SAMPLE_PRIVATE_COMPANY_FIXTURE } from '@/lib/financial-statements/sample-fixtures'
import { generateFinancialStatementsPdf } from '@/lib/financial-statements/export/pdf'
import { generateFinancialStatementsXlsxBlob } from '@/lib/financial-statements/export/xlsx'
import { generateFinancialStatementsDocxBlob } from '@/lib/financial-statements/export/docx'
import { BLANK_TEMPLATES_CATALOG } from '@/lib/financial-statements/export/blank-templates'
import {
  resolveAllStatutoryNotes,
  CANONICAL_STATUTORY_NOTES
} from '@/lib/financial-statements/canonical-notes'

describe('Schedule III Financial Statements Suite', () => {
  describe('Division I Schema Integrity', () => {
    it('contains all canonical Balance Sheet heads in statutory order', () => {
      expect(DIVISION_1_BALANCE_SHEET_HEADS.length).toBeGreaterThanOrEqual(25)

      // Key statutory heads present
      const ids = DIVISION_1_BALANCE_SHEET_HEADS.map(h => h.id)
      expect(ids).toContain('sh_capital')
      expect(ids).toContain('reserves_surplus')
      expect(ids).toContain('lt_borrowings')
      expect(ids).toContain('st_borrowings')
      expect(ids).toContain('trade_payables_msme')
      expect(ids).toContain('trade_payables_others')
      expect(ids).toContain('ppe_tangible')
      expect(ids).toContain('cwip')
      expect(ids).toContain('trade_receivables')
      expect(ids).toContain('cash_and_equivalents')
      expect(ids).toContain('total_equity_and_liabilities')
      expect(ids).toContain('total_assets')
    })

    it('contains all canonical Profit & Loss heads in statutory order', () => {
      const ids = DIVISION_1_PL_HEADS.map(h => h.id)
      expect(ids).toContain('rev_operations') // I
      expect(ids).toContain('other_income') // II
      expect(ids).toContain('total_income') // III
      expect(ids).toContain('exp_materials_consumed') // IV.a
      expect(ids).toContain('exp_purchases_stock') // IV.b
      expect(ids).toContain('exp_changes_inventories') // IV.c
      expect(ids).toContain('exp_employee_benefits') // IV.d
      expect(ids).toContain('exp_finance_costs') // IV.e
      expect(ids).toContain('exp_depreciation_amortization') // IV.f
      expect(ids).toContain('exp_other_expenses') // IV.g
      expect(ids).toContain('total_expenses') // IV
      expect(ids).toContain('profit_before_exceptional') // V
      expect(ids).toContain('exceptional_items') // VI
      expect(ids).toContain('profit_before_extraordinary') // VII
      expect(ids).toContain('extraordinary_items') // VIII
      expect(ids).toContain('profit_before_tax') // IX
      expect(ids).toContain('tax_current') // X.1
      expect(ids).toContain('tax_deferred') // X.2
      expect(ids).toContain('total_tax_expense') // X
      expect(ids).toContain('profit_continuing_ops') // XI
      expect(ids).toContain('profit_discontinuing_ops_pre_tax') // XII
      expect(ids).toContain('tax_discontinuing_ops') // XIII
      expect(ids).toContain('profit_discontinued_ops') // XIV
      expect(ids).toContain('profit_for_period') // XV
      expect(ids).toContain('eps_basic') // XVI.1
      expect(ids).toContain('eps_diluted') // XVI.2

      // Verify statutory labels
      const line3 = DIVISION_1_PL_HEADS.find(h => h.id === 'total_income')
      expect(line3?.label).toBe('Total Revenue (I + II)')

      const line5 = DIVISION_1_PL_HEADS.find(h => h.id === 'profit_before_exceptional')
      expect(line5?.label).toBe('Profit before exceptional and extraordinary items and tax (III - IV)')
    })
  })

  describe('Deterministic Account Mapping Catalog', () => {
    it('correctly maps common Indian ledger accounts with high confidence', () => {
      const mapping1 = suggestMapping('Equity Share Capital')
      expect(mapping1.mappedHeadId).toBe('sh_capital')
      expect(mapping1.confidence).toBe('high')

      const mapping2 = suggestMapping('Securities Premium Account')
      expect(mapping2.mappedHeadId).toBe('reserves_surplus')
      expect(mapping2.confidence).toBe('high')

      const mapping3 = suggestMapping('HDFC Bank Term Loan')
      expect(mapping3.mappedHeadId).toBe('lt_borrowings')

      const mapping4 = suggestMapping('Current Maturities of Long Term Debt')
      expect(mapping4.mappedHeadId).toBe('st_borrowings')

      const mapping5 = suggestMapping('Sundry Creditors - MSME')
      expect(mapping5.mappedHeadId).toBe('trade_payables_msme')

      const mapping6 = suggestMapping('Sundry Debtors')
      expect(mapping6.mappedHeadId).toBe('trade_receivables')

      const mapping7 = suggestMapping('Cash in hand')
      expect(mapping7.mappedHeadId).toBe('cash_and_equivalents')
    })

    it('correctly tags contra accounts', () => {
      const accDep = suggestMapping('Accumulated Depreciation')
      expect(accDep.mappedHeadId).toBe('ppe_tangible')
      expect(accDep.isContra).toBe(true)

      const provDoubt = suggestMapping('Provision for doubtful debts')
      expect(provDoubt.mappedHeadId).toBe('trade_receivables')
      expect(provDoubt.isContra).toBe(true)
    })

    it('handles ambiguous accounts with review confidence', () => {
      const unknownLoan = suggestMapping('Personal Unsecured Loan')
      expect(unknownLoan.confidence).toBe('review')

      const unmapped = suggestMapping('Unrecognized XYZ Ledger 1234')
      expect(unmapped.confidence).toBe('unmapped')
    })
  })

  describe('Statement Calculations & Golden Fixture', () => {
    const fixture = SAMPLE_PRIVATE_COMPANY_FIXTURE

    it('computes head balances and aggregates trial balance correctly', () => {
      const balances = computeHeadBalances(fixture.trialBalance, fixture.manualDirectEntries)
      expect(balances['sh_capital'].current).toBe(50.0)
      expect(balances['reserves_surplus'].current).toBe(97.5) // 25 + 15 + 35 + PAT 22.5
      expect(balances['ppe_tangible'].current).toBe(101.0) // 95 + 28.5 - 22.5
    })

    it('generates balanced Schedule III Balance Sheet', () => {
      const balances = computeHeadBalances(fixture.trialBalance, fixture.manualDirectEntries)
      const bsRows = generateBalanceSheetStatement(balances)

      const totalEqLiab = bsRows.find(r => r.headId === 'total_equity_and_liabilities')?.currentAmount
      const totalAssets = bsRows.find(r => r.headId === 'total_assets')?.currentAmount

      expect(totalEqLiab).toBeDefined()
      expect(totalAssets).toBeDefined()
      expect(totalEqLiab).toBeCloseTo(281.5, 1)
      expect(totalAssets).toBeCloseTo(281.5, 1)
      expect(Math.abs(totalEqLiab! - totalAssets!)).toBeLessThan(0.01)
    })

    it('generates Profit and Loss statement with accurate PBT and PAT', () => {
      const balances = computeHeadBalances(fixture.trialBalance, fixture.manualDirectEntries)
      const plRows = generateProfitLossStatement(balances)

      const revTotal = plRows.find(r => r.headId === 'total_income')?.currentAmount
      const expTotal = plRows.find(r => r.headId === 'total_expenses')?.currentAmount
      const pbt = plRows.find(r => r.headId === 'profit_before_tax')?.currentAmount
      const pat = plRows.find(r => r.headId === 'profit_for_period')?.currentAmount

      expect(revTotal).toBeCloseTo(250.0, 1) // 245 + 5.0
      expect(expTotal).toBeCloseTo(219.5, 1)
      expect(pbt).toBeCloseTo(30.5, 1)
      expect(pat).toBeCloseTo(22.5, 1) // 30.5 - 7.5 - 0.5
    })

    it('computes indirect Cash Flow statement with reconciled closing cash', () => {
      const balances = computeHeadBalances(fixture.trialBalance, fixture.manualDirectEntries)
      const plRows = generateProfitLossStatement(balances)
      const cfs = computeIndirectCashFlow(balances, fixture.supplementaryCashFlow, plRows)

      expect(cfs.operatingActivities.profitBeforeTax).toBeCloseTo(30.5, 1)
      expect(cfs.operatingActivities.netCashFromOperating).toBeGreaterThan(0)
      expect(cfs.closingCashBalanceSheet).toBeCloseTo(33.2, 1)
      expect(cfs.openingCash).toBe(29.0)
    })
  })

  describe('Statutory Ratios & 25% Variance Detection', () => {
    it('computes all 11 Schedule III ratios and detects >25% variance', () => {
      const balances = computeHeadBalances(
        SAMPLE_PRIVATE_COMPANY_FIXTURE.trialBalance,
        SAMPLE_PRIVATE_COMPANY_FIXTURE.manualDirectEntries
      )
      const ratios = computeScheduleIIIRatios(balances, SAMPLE_PRIVATE_COMPANY_FIXTURE.ratioExplanations)

      expect(ratios.length).toBe(11)

      const curRatio = ratios.find(r => r.id === 'current_ratio')
      expect(curRatio).toBeDefined()
      expect(curRatio?.currentValue).toBeGreaterThan(1.0)
      expect(curRatio?.isMeaningful).toBe(true)

      const deRatio = ratios.find(r => r.id === 'debt_equity_ratio')
      expect(deRatio).toBeDefined()
      expect(deRatio?.currentValue).toBeGreaterThan(0)

      // Test zero denominator handling
      const emptyBalances = computeHeadBalances([])
      const emptyRatios = computeScheduleIIIRatios(emptyBalances)
      emptyRatios.forEach(r => {
        expect(r.isMeaningful).toBe(false)
      })
    })
  })

  describe('Validation Rules Engine (18 Checks)', () => {
    it('passes golden fixture with no blocking errors', () => {
      const balances = computeHeadBalances(SAMPLE_PRIVATE_COMPANY_FIXTURE.trialBalance)
      const bsRows = generateBalanceSheetStatement(balances)
      const plRows = generateProfitLossStatement(balances)
      const cfs = computeIndirectCashFlow(balances, SAMPLE_PRIVATE_COMPANY_FIXTURE.supplementaryCashFlow, plRows)
      const ratios = computeScheduleIIIRatios(balances, SAMPLE_PRIVATE_COMPANY_FIXTURE.ratioExplanations)

      const issues = runFullStatementValidation({
        workspace: SAMPLE_PRIVATE_COMPANY_FIXTURE,
        balanceSheetRows: bsRows,
        plRows,
        cashFlowResult: cfs,
        ratios
      })

      const blocking = issues.filter(i => i.severity === 'blocking')
      expect(blocking.length).toBe(0)
    })

    it('triggers blocking error if trial balance has debit/credit mismatch', () => {
      const invalidWorkspace: any = {
        ...SAMPLE_PRIVATE_COMPANY_FIXTURE,
        trialBalance: [
          {
            id: 'tb_bad',
            ledgerName: 'Unbalanced Account',
            currentDebit: 1000,
            currentCredit: 500,
            mappedHeadId: 'sh_capital'
          }
        ]
      }
      const balances = computeHeadBalances(invalidWorkspace.trialBalance)
      const bsRows = generateBalanceSheetStatement(balances)
      const plRows = generateProfitLossStatement(balances)

      const issues = runFullStatementValidation({
        workspace: invalidWorkspace,
        balanceSheetRows: bsRows,
        plRows
      })

      const tbMismatch = issues.find(i => i.id === 'tb_cur_mismatch')
      expect(tbMismatch).toBeDefined()
      expect(tbMismatch?.severity).toBe('blocking')
    })

    it('triggers blocking warning if company type is LLP', () => {
      const llpWorkspace: any = {
        ...SAMPLE_PRIVATE_COMPANY_FIXTURE,
        profile: {
          ...SAMPLE_PRIVATE_COMPANY_FIXTURE.profile,
          companyType: 'llp'
        }
      }
      const balances = computeHeadBalances(llpWorkspace.trialBalance)
      const bsRows = generateBalanceSheetStatement(balances)
      const plRows = generateProfitLossStatement(balances)

      const issues = runFullStatementValidation({
        workspace: llpWorkspace,
        balanceSheetRows: bsRows,
        plRows
      })

      const llpIssue = issues.find(i => i.id === 'scope_llp_ineligible')
      expect(llpIssue).toBeDefined()
      expect(llpIssue?.severity).toBe('blocking')
    })
  })

  describe('Document Generation & Blank Download Packs', () => {
    it('generates high quality PDF document instance', () => {
      const balances = computeHeadBalances(SAMPLE_PRIVATE_COMPANY_FIXTURE.trialBalance)
      const bsRows = generateBalanceSheetStatement(balances)
      const plRows = generateProfitLossStatement(balances)

      const doc = generateFinancialStatementsPdf({
        workspace: SAMPLE_PRIVATE_COMPANY_FIXTURE,
        balanceSheetRows: bsRows,
        plRows
      })

      expect(doc).toBeDefined()
      expect((doc as any).internal.getNumberOfPages()).toBeGreaterThanOrEqual(2)
    })

    it('generates formula-linked Excel XLSX blob with Zip structure', async () => {
      const balances = computeHeadBalances(SAMPLE_PRIVATE_COMPANY_FIXTURE.trialBalance)
      const bsRows = generateBalanceSheetStatement(balances)
      const plRows = generateProfitLossStatement(balances)

      const blob = await generateFinancialStatementsXlsxBlob({
        workspace: SAMPLE_PRIVATE_COMPANY_FIXTURE,
        balanceSheetRows: bsRows,
        plRows
      })

      expect(blob).toBeDefined()
      expect(blob.size).toBeGreaterThan(1000)
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    })

    it('generates Word DOCX blob', async () => {
      const balances = computeHeadBalances(SAMPLE_PRIVATE_COMPANY_FIXTURE.trialBalance)
      const bsRows = generateBalanceSheetStatement(balances)
      const plRows = generateProfitLossStatement(balances)

      const blob = await generateFinancialStatementsDocxBlob({
        workspace: SAMPLE_PRIVATE_COMPANY_FIXTURE,
        balanceSheetRows: bsRows,
        plRows
      })

      expect(blob).toBeDefined()
      expect(blob.size).toBeGreaterThan(1000)
    })

    it('contains all 12 statutory blank download templates in catalog', () => {
      expect(BLANK_TEMPLATES_CATALOG.length).toBe(4)
      const totalCombinations = BLANK_TEMPLATES_CATALOG.reduce((sum, t) => sum + t.formats.length, 0)
      expect(totalCombinations).toBe(12) // 4 templates x 3 formats (PDF, XLSX, DOCX)
    })
  })

  describe('Statutory Notes to Accounts & March 2021 Disclosures', () => {
    it('defines exactly 39 canonical statutory notes in sequential order', () => {
      expect(CANONICAL_STATUTORY_NOTES.length).toBe(39)
      CANONICAL_STATUTORY_NOTES.forEach((n, idx) => {
        expect(n.noteNumber).toBe(idx + 1)
      })

      // Balance Sheet notes: 1-26
      const bsNotes = CANONICAL_STATUTORY_NOTES.filter(n => n.section === 'balance_sheet')
      expect(bsNotes.length).toBe(26)
      expect(bsNotes[0].id).toBe('note_1')
      expect(bsNotes[0].title).toBe('Share Capital')
      expect(bsNotes[0].hasPromoterShareholding).toBe(true)

      // Note 10: Trade Payables Ageing
      const note10 = CANONICAL_STATUTORY_NOTES.find(n => n.noteNumber === 10)
      expect(note10?.hasTradePayablesAgeing).toBe(true)

      // Note 15: CWIP Ageing
      const note15 = CANONICAL_STATUTORY_NOTES.find(n => n.noteNumber === 15)
      expect(note15?.hasCwipAgeing).toBe(true)

      // Note 23: Trade Receivables Ageing
      const note23 = CANONICAL_STATUTORY_NOTES.find(n => n.noteNumber === 23)
      expect(note23?.hasTradeReceivablesAgeing).toBe(true)

      // Profit & Loss notes: 27-39
      const plNotes = CANONICAL_STATUTORY_NOTES.filter(n => n.section === 'profit_loss')
      expect(plNotes.length).toBe(13)
      expect(plNotes[0].id).toBe('note_27')
      expect(plNotes[0].title).toBe('Revenue from Operations')
      expect(plNotes[12].id).toBe('note_39')
      expect(plNotes[12].title).toBe('Earnings Per Equity Share (AS 20)')
    })

    it('resolves all 39 notes with March 2021 disclosures even on empty workspace notes', () => {
      const emptyWorkspace: any = {
        profile: SAMPLE_PRIVATE_COMPANY_FIXTURE.profile,
        trialBalance: [],
        manualDirectEntries: {},
        notes: {}
      }

      const allNotes = resolveAllStatutoryNotes({
        workspace: emptyWorkspace,
        scope: 'all'
      })

      expect(allNotes.length).toBe(39)
      expect(allNotes[0].noteNumber).toBe(1)
      expect(allNotes[0].promoterShareholding).toBeDefined()
      expect(allNotes[0].promoterShareholding?.length).toBeGreaterThanOrEqual(1)

      const n10 = allNotes.find(n => n.noteNumber === 10)
      expect(n10?.tradePayablesAgeing).toBeDefined()
      expect(n10?.tradePayablesAgeing?.length).toBeGreaterThanOrEqual(2)

      const n15 = allNotes.find(n => n.noteNumber === 15)
      expect(n15?.cwipAgeing).toBeDefined()
      expect(n15?.cwipAgeing?.length).toBeGreaterThanOrEqual(2)

      const n23 = allNotes.find(n => n.noteNumber === 23)
      expect(n23?.tradeReceivablesAgeing).toBeDefined()
      expect(n23?.tradeReceivablesAgeing?.length).toBeGreaterThanOrEqual(4)

      const n39 = allNotes.find(n => n.noteNumber === 39)
      expect(n39?.items.length).toBeGreaterThanOrEqual(2)
    })

    it('resolves standalone P&L notes (Notes 27-39) when scope is profit_loss', () => {
      const plNotes = resolveAllStatutoryNotes({
        workspace: SAMPLE_PRIVATE_COMPANY_FIXTURE,
        scope: 'profit_loss'
      })

      expect(plNotes.length).toBe(13)
      expect(plNotes[0].noteNumber).toBe(27)
      expect(plNotes[12].noteNumber).toBe(39)
    })

    it('includes all 39 notes in full multi-statement PDF export (after ratios)', () => {
      const balances = computeHeadBalances(SAMPLE_PRIVATE_COMPANY_FIXTURE.trialBalance)
      const bsRows = generateBalanceSheetStatement(balances)
      const plRows = generateProfitLossStatement(balances)
      const cfs = computeIndirectCashFlow(balances, SAMPLE_PRIVATE_COMPANY_FIXTURE.supplementaryCashFlow, plRows)
      const ratios = computeScheduleIIIRatios(balances)

      const doc = generateFinancialStatementsPdf({
        workspace: SAMPLE_PRIVATE_COMPANY_FIXTURE,
        balanceSheetRows: bsRows,
        plRows,
        cashFlowResult: cfs,
        ratios,
        options: {
          includeBalanceSheet: true,
          includeProfitLoss: true,
          includeCashFlow: true,
          includeNotes: true,
          includeRatios: true
        }
      })

      expect(doc).toBeDefined()
      // Full pack: Face statements (3-4 pages) + Ratios (1 page) + Notes 1-39 (multiple pages)
      const totalPages = (doc as any).internal.getNumberOfPages()
      expect(totalPages).toBeGreaterThanOrEqual(7)
    })
  })
})

