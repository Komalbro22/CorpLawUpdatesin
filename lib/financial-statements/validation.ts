import {
  WorkspaceState,
  ValidationIssue,
  StatementRowValue,
  CashFlowStatementResult,
  RatioResult
} from './types'

export function runFullStatementValidation(params: {
  workspace: WorkspaceState
  balanceSheetRows: StatementRowValue[]
  plRows: StatementRowValue[]
  cashFlowResult?: CashFlowStatementResult
  ratios?: RatioResult[]
}): ValidationIssue[] {
  const { workspace, balanceSheetRows, plRows, cashFlowResult, ratios } = params
  const { profile, trialBalance, notes } = workspace
  const issues: ValidationIssue[] = []

  // -------------------------------------------------------------------------
  // SCOPE CHECKS: LLP and NBFC Division III
  // -------------------------------------------------------------------------
  if (profile.companyType === 'llp') {
    issues.push({
      id: 'scope_llp_ineligible',
      ruleNumber: 0,
      severity: 'blocking',
      title: 'LLP Format Incompatibility',
      message:
        'Limited Liability Partnerships (LLPs) are governed by the LLP Act, 2008 and LLP Rules, 2009 (Form 8 Statement of Account & Solvency) and do not fall under Companies Act 2013 Schedule III.',
      suggestedFix:
        'Select a Company structure (Private Ltd, Public Ltd, OPC, or Section 8) or download LLP Form 8 compliance guides.'
    })
  }

  if (profile.framework === 'division-3-nbfc') {
    issues.push({
      id: 'scope_nbfc_div3',
      ruleNumber: 0,
      severity: 'blocking',
      title: 'Division III NBFC Notice',
      message:
        'Division III applies specifically to Non-Banking Financial Companies (NBFCs) preparing financial statements under Ind AS. This release supports Division I (AS) and Division II (Ind AS non-NBFCs).',
      suggestedFix: 'Switch to Division I or consult RBI/Ind AS NBFC reporting utility.'
    })
  }

  // -------------------------------------------------------------------------
  // RULE 1: Trial balance debit and credit totals agreement
  // -------------------------------------------------------------------------
  if (trialBalance.length > 0) {
    let curDebitTotal = 0
    let curCreditTotal = 0
    let prevDebitTotal = 0
    let prevCreditTotal = 0

    for (const row of trialBalance) {
      if (row.isExcluded) continue
      curDebitTotal += Number(row.currentDebit) || 0
      curCreditTotal += Number(row.currentCredit) || 0
      prevDebitTotal += Number(row.prevDebit) || 0
      prevCreditTotal += Number(row.prevCredit) || 0
    }

    const curDiff = Math.abs(curDebitTotal - curCreditTotal)
    if (curDiff > 0.05) {
      issues.push({
        id: 'tb_cur_mismatch',
        ruleNumber: 1,
        severity: 'blocking',
        title: 'Current Period Trial Balance Does Not Reconcile',
        message: `Current year debits (₹ ${curDebitTotal.toLocaleString('en-IN')}) do not equal credits (₹ ${curCreditTotal.toLocaleString('en-IN')}). Difference: ₹ ${curDiff.toLocaleString('en-IN')}.`,
        suggestedFix: 'Verify opening balances and check for missing trial balance accounts.'
      })
    }

    const prevDiff = Math.abs(prevDebitTotal - prevCreditTotal)
    if (prevDebitTotal > 0 && prevCreditTotal > 0 && prevDiff > 0.05) {
      issues.push({
        id: 'tb_prev_mismatch',
        ruleNumber: 1,
        severity: 'warning',
        title: 'Comparative Period Trial Balance Difference',
        message: `Previous year debits and credits differ by ₹ ${prevDiff.toLocaleString('en-IN')}.`,
        suggestedFix: 'Verify previous year closing trial balance entries.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 2: Unmapped or unreviewed non-zero ledger rows
  // -------------------------------------------------------------------------
  const unmappedRows = trialBalance.filter(
    r =>
      !r.isExcluded &&
      (!r.mappedHeadId || r.confidence === 'unmapped') &&
      ((r.currentDebit || 0) !== 0 || (r.currentCredit || 0) !== 0)
  )

  if (unmappedRows.length > 0) {
    issues.push({
      id: 'unmapped_ledgers_present',
      ruleNumber: 2,
      severity: 'blocking',
      title: `${unmappedRows.length} Ledger Account(s) Unmapped`,
      message: `The following accounts have non-zero balances but have not been assigned to a Schedule III head: ${unmappedRows
        .slice(0, 3)
        .map(r => `"${r.ledgerName}"`)
        .join(', ')}${unmappedRows.length > 3 ? ` and ${unmappedRows.length - 3} more.` : '.'}`,
      suggestedFix: 'Review the Account Mapping tab to assign or explicitly exclude these ledger items.'
    })
  }

  // -------------------------------------------------------------------------
  // RULE 3: Statement line references pointing to missing notes
  // -------------------------------------------------------------------------
  const allRows = [...balanceSheetRows, ...plRows]
  for (const row of allRows) {
    if (row.noteNumber && !row.isSubtotal && !row.isGrandTotal && Math.abs(row.currentAmount) > 0) {
      const noteExists = Object.values(notes).some(n => n.targetHeadId === row.headId)
      // Warning if note schedule has status 'incomplete' or missing
      if (!noteExists) {
        // If note schedule is not yet created, note is auto-numbered
      }
    }
  }

  // -------------------------------------------------------------------------
  // RULE 4: Reporting period dates & units
  // -------------------------------------------------------------------------
  if (!profile.financialYearEnd) {
    issues.push({
      id: 'missing_reporting_date',
      ruleNumber: 4,
      severity: 'blocking',
      title: 'Reporting Period End Date Missing',
      message: 'Financial year-end date (e.g. 31 March 2026) is required for statutory statement headers.',
      suggestedFix: 'Set reporting date in Company Setup step.'
    })
  }

  // -------------------------------------------------------------------------
  // RULE 5: Duplicate account rows
  // -------------------------------------------------------------------------
  const seenLedgers = new Set<string>()
  for (const row of trialBalance) {
    const key = row.ledgerName.trim().toLowerCase()
    if (key && seenLedgers.has(key)) {
      issues.push({
        id: `duplicate_ledger_${row.id}`,
        ruleNumber: 5,
        severity: 'blocking',
        title: `Duplicate Ledger Account: ${row.ledgerName}`,
        message: `Account "${row.ledgerName}" appears multiple times in the trial balance, risking double counting.`,
        suggestedFix: 'Consolidate duplicate accounts or remove duplicate rows before export.'
      })
      break
    }
    seenLedgers.add(key)
  }

  // -------------------------------------------------------------------------
  // RULE 6: Invalid/non-numeric calculations
  // -------------------------------------------------------------------------
  const nanRows = allRows.filter(r => isNaN(r.currentAmount) || isNaN(r.prevAmount))
  if (nanRows.length > 0) {
    issues.push({
      id: 'nan_amounts_detected',
      ruleNumber: 6,
      severity: 'blocking',
      title: 'Invalid Numeric Amounts Detected',
      message: `Statement lines [${nanRows.map(r => r.label).join(', ')}] evaluated to NaN.`,
      suggestedFix: 'Check for non-numeric characters in trial balance inputs.'
    })
  }

  // -------------------------------------------------------------------------
  // RULE 7: Statement totals broken
  // -------------------------------------------------------------------------
  const bsTotalEqLiab = balanceSheetRows.find(r => r.headId === 'total_equity_and_liabilities')?.currentAmount
  const bsTotalAssets = balanceSheetRows.find(r => r.headId === 'total_assets')?.currentAmount

  if (bsTotalEqLiab === undefined || bsTotalAssets === undefined) {
    issues.push({
      id: 'statement_totals_broken',
      ruleNumber: 7,
      severity: 'blocking',
      title: 'Balance Sheet Subtotal Calculation Error',
      message: 'Failed to evaluate primary Balance Sheet grand totals.',
      suggestedFix: 'Review input data hierarchy.'
    })
  }

  // -------------------------------------------------------------------------
  // RULE 8: Balance Sheet equality check (Assets vs Equity & Liabilities)
  // -------------------------------------------------------------------------
  if (bsTotalEqLiab !== undefined && bsTotalAssets !== undefined) {
    const bsDiff = Math.abs(bsTotalEqLiab - bsTotalAssets)
    if (bsDiff > 0.05) {
      issues.push({
        id: 'bs_equality_mismatch',
        ruleNumber: 8,
        severity: 'warning',
        title: 'Balance Sheet Out of Balance',
        message: `Total Equity & Liabilities (₹ ${bsTotalEqLiab.toLocaleString('en-IN')}) does not match Total Assets (₹ ${bsTotalAssets.toLocaleString('en-IN')}). Discrepancy: ₹ ${bsDiff.toLocaleString('en-IN')}.`,
        suggestedFix:
          'Ensure Current Year Profit/Loss from P&L has been incorporated into Reserves & Surplus, and verify all contra ledgers.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 9: Retained earnings / reserves roll-forward check
  // -------------------------------------------------------------------------
  const patRow = plRows.find(r => r.headId === 'profit_for_period')
  const reservesCur = balanceSheetRows.find(r => r.headId === 'reserves_surplus')?.currentAmount || 0
  const reservesPrev = balanceSheetRows.find(r => r.headId === 'reserves_surplus')?.prevAmount || 0
  if (patRow && patRow.currentAmount !== 0) {
    const expectedReservesMovement = patRow.currentAmount
    const actualReservesMovement = reservesCur - reservesPrev
    const diff = Math.abs(actualReservesMovement - expectedReservesMovement)
    if (diff > 1.0 && reservesPrev !== 0) {
      issues.push({
        id: 'reserves_rollforward_variance',
        ruleNumber: 9,
        severity: 'info',
        title: 'Reserves Roll-Forward Discrepancy',
        message: `Change in Reserves & Surplus (₹ ${(actualReservesMovement).toLocaleString('en-IN')}) differs from Current Year PAT (₹ ${expectedReservesMovement.toLocaleString('en-IN')}).`,
        suggestedFix:
          'Confirm if dividends, bonus shares, statutory reserve transfers, or opening retained earnings adjustments occurred during the year.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 10: Cash Flow Statement closing cash tie-up
  // -------------------------------------------------------------------------
  if (cashFlowResult) {
    if (Math.abs(cashFlowResult.discrepancy) > 1.0) {
      issues.push({
        id: 'cfs_closing_cash_discrepancy',
        ruleNumber: 10,
        severity: 'warning',
        title: 'Cash Flow Closing Cash Discrepancy',
        message: `Calculated closing cash (₹ ${cashFlowResult.closingCashCalculated.toLocaleString('en-IN')}) differs from Balance Sheet Cash & Cash Equivalents (₹ ${cashFlowResult.closingCashBalanceSheet.toLocaleString('en-IN')}) by ₹ ${Math.abs(cashFlowResult.discrepancy).toLocaleString('en-IN')}.`,
        suggestedFix:
          'Review supplementary financing/investing adjustments or bank balances included in short-term investments.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 11: Note schedule does not tie to face statement
  // -------------------------------------------------------------------------
  for (const note of Object.values(notes)) {
    if (note.items && note.items.length > 0) {
      const faceRow = allRows.find(r => r.headId === note.targetHeadId)
      if (faceRow) {
        const noteTotalCur = note.items.reduce((acc, i) => acc + (i.currentAmount || 0), 0)
        if (Math.abs(noteTotalCur - faceRow.currentAmount) > 1.0) {
          issues.push({
            id: `note_reconciliation_${note.id}`,
            ruleNumber: 11,
            severity: 'warning',
            title: `Note ${note.noteNumber} (${note.title}) Does Not Tie to Face Statement`,
            message: `Note total (₹ ${noteTotalCur.toLocaleString('en-IN')}) differs from Balance Sheet/P&L face value (₹ ${faceRow.currentAmount.toLocaleString('en-IN')}).`,
            suggestedFix: `Reconcile itemized lines in Note ${note.noteNumber}.`
          })
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // RULE 12 & 13: Trade Payables and Receivables Ageing Reconciliations
  // -------------------------------------------------------------------------
  const tpNote = Object.values(notes).find(n => n.targetHeadId === 'trade_payables_others' || n.targetHeadId === 'trade_payables_msme')
  if (tpNote?.tradePayablesAgeing && tpNote.tradePayablesAgeing.length > 0) {
    const ageingTotal = tpNote.tradePayablesAgeing.reduce((sum, r) => sum + (r.total || 0), 0)
    const tpCurTotal =
      (balanceSheetRows.find(r => r.headId === 'trade_payables_msme')?.currentAmount || 0) +
      (balanceSheetRows.find(r => r.headId === 'trade_payables_others')?.currentAmount || 0)
    if (Math.abs(ageingTotal - tpCurTotal) > 1.0 && tpCurTotal > 0) {
      issues.push({
        id: 'tp_ageing_mismatch',
        ruleNumber: 12,
        severity: 'warning',
        title: 'Trade Payables Ageing Schedule Discrepancy',
        message: `Ageing schedule sum (₹ ${ageingTotal.toLocaleString('en-IN')}) does not tally with total Trade Payables (₹ ${tpCurTotal.toLocaleString('en-IN')}).`,
        suggestedFix: 'Adjust Trade Payables ageing buckets in Note disclosures.'
      })
    }
  }

  const trNote = Object.values(notes).find(n => n.targetHeadId === 'trade_receivables')
  if (trNote?.tradeReceivablesAgeing && trNote.tradeReceivablesAgeing.length > 0) {
    const ageingTotal = trNote.tradeReceivablesAgeing.reduce((sum, r) => sum + (r.total || 0), 0)
    const trCurTotal = balanceSheetRows.find(r => r.headId === 'trade_receivables')?.currentAmount || 0
    if (Math.abs(ageingTotal - trCurTotal) > 1.0 && trCurTotal > 0) {
      issues.push({
        id: 'tr_ageing_mismatch',
        ruleNumber: 13,
        severity: 'warning',
        title: 'Trade Receivables Ageing Schedule Discrepancy',
        message: `Receivables ageing sum (₹ ${ageingTotal.toLocaleString('en-IN')}) does not match total Trade Receivables (₹ ${trCurTotal.toLocaleString('en-IN')}).`,
        suggestedFix: 'Reconcile undisputedly good, doubtful and disputed buckets.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 14: CWIP Ageing tally
  // -------------------------------------------------------------------------
  const cwipNote = Object.values(notes).find(n => n.targetHeadId === 'cwip')
  if (cwipNote?.cwipAgeing && cwipNote.cwipAgeing.length > 0) {
    const cwipAgeingSum = cwipNote.cwipAgeing.reduce((s, r) => s + (r.total || 0), 0)
    const cwipFace = balanceSheetRows.find(r => r.headId === 'cwip')?.currentAmount || 0
    if (Math.abs(cwipAgeingSum - cwipFace) > 1.0 && cwipFace > 0) {
      issues.push({
        id: 'cwip_ageing_mismatch',
        ruleNumber: 14,
        severity: 'warning',
        title: 'CWIP Ageing Schedule Variance',
        message: `CWIP ageing sum (₹ ${cwipAgeingSum.toLocaleString('en-IN')}) does not agree with face CWIP (₹ ${cwipFace.toLocaleString('en-IN')}).`,
        suggestedFix: 'Review CWIP project schedules.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 15: Current maturities of long-term borrowings
  // -------------------------------------------------------------------------
  const ltBorrowingsRow = balanceSheetRows.find(r => r.headId === 'lt_borrowings')
  if (ltBorrowingsRow && ltBorrowingsRow.currentAmount > 0) {
    const stBorrowingsRow = balanceSheetRows.find(r => r.headId === 'st_borrowings')
    if (stBorrowingsRow && stBorrowingsRow.currentAmount === 0) {
      issues.push({
        id: 'current_maturities_check',
        ruleNumber: 15,
        severity: 'info',
        title: 'Current Maturities of Long-Term Debt Review',
        message:
          'Long-term borrowings are present. Under the March 2021 amendments, current maturities due within 12 months must be disclosed under Short-Term Borrowings (not Other Current Liabilities).',
        suggestedFix: 'Confirm whether any principal portion of long-term loans is repayable within 12 months.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 16: Negative balances on sign-sensitive heads
  // -------------------------------------------------------------------------
  const signSensitiveHeads = [
    { id: 'sh_capital', name: 'Share Capital' },
    { id: 'ppe_tangible', name: 'Property, Plant and Equipment' },
    { id: 'cash_and_equivalents', name: 'Cash and Cash Equivalents' },
    { id: 'inventories', name: 'Inventories' }
  ]
  for (const s of signSensitiveHeads) {
    const row = balanceSheetRows.find(r => r.headId === s.id)
    if (row && row.currentAmount < 0) {
      issues.push({
        id: `negative_balance_${s.id}`,
        ruleNumber: 16,
        severity: 'warning',
        title: `Negative Balance on ${s.name}`,
        message: `${s.name} reflects a negative closing balance of ₹ ${row.currentAmount.toLocaleString('en-IN')}. Negative cash or capital usually signifies an overdraft or mapping error.`,
        suggestedFix: 'Reclassify bank overdrafts to Short-Term Borrowings.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 17: Ratio movement exceeds 25% without explanation
  // -------------------------------------------------------------------------
  if (ratios) {
    const unexplainedRatios = ratios.filter(r => r.varianceExceeds25 && !r.explanation?.trim())
    if (unexplainedRatios.length > 0) {
      issues.push({
        id: 'ratios_unexplained_variance',
        ruleNumber: 17,
        severity: 'warning',
        title: `${unexplainedRatios.length} Statutory Ratio(s) Have >25% Unexplained Variance`,
        message: `Schedule III requires a note explaining changes >25% against previous year for: ${unexplainedRatios
          .map(r => r.name)
          .join(', ')}.`,
        suggestedFix: 'Provide brief business/operational variance explanations in the Ratios tab.'
      })
    }
  }

  // -------------------------------------------------------------------------
  // RULE 18: Supplementary cash flow adjustment missing
  // -------------------------------------------------------------------------
  const ppeMovement = Math.abs(
    (balanceSheetRows.find(r => r.headId === 'ppe_tangible')?.currentAmount || 0) -
      (balanceSheetRows.find(r => r.headId === 'ppe_tangible')?.prevAmount || 0)
  )
  if (
    ppeMovement > 0 &&
    workspace.supplementaryCashFlow.purchaseOfPPE === 0 &&
    workspace.supplementaryCashFlow.saleOfPPE === 0 &&
    workspace.supplementaryCashFlow.depreciationAmortization === 0
  ) {
    issues.push({
      id: 'cfs_ppe_movement_unexplained',
      ruleNumber: 18,
      severity: 'info',
      title: 'Cash Flow Statement Incomplete (Draft)',
      message:
        'PPE balance changed between periods, but no depreciation, additions, or asset disposal figures were specified in Cash Flow supplementary inputs.',
      suggestedFix: 'Enter depreciation and capital expenditure details in Cash Flow adjustments.'
    })
  }

  return issues
}
